/******变量*******/
var map;
var isHaveData={//是否有统计图、统计表、时间轴数据
		tongjibiao:1,
		tongjitu:1,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=1;
var qiYeIndustryArr=[{id:"有色金属",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                     {id:"石油加工",name:"石油加工"},{id:"化工",name:"化工"},{id:"焦化",name:"焦化"},{id:"电镀",name:"电镀"},{id:"制革",name:"制革"}];
var allQiYeIndustryArr=[{id:"有色金属",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                        {id:"石油加工",name:"石油加工"},{id:"化工",name:"化工"},{id:"焦化",name:"焦化"},{id:"电镀",name:"电镀"},{id:"制革",name:"制革"},
						{id:"医药",name:"医药制造"},{id:"铅酸蓄电池制造",name:"铅酸蓄电池制造"},{id:"废旧电子拆解",name:"废旧电子拆解"},
						{id:"危险废物处理处置",name:"危险废物处理处置"},{id:"危险化学品生产、存储、使用",name:"危险化学品生产、存储、使用"}];
var timePar="";//时间参数
var industryPar="";//行业类别参数
var provinceFIDPar="";//对接省份类别
var provinceSName="";//对接省份类别
var graphicsLayer = null;//分省饼图图层
var featureLayer = null;//分段渲染的分省地图图层
var echartsObj=[];//饼图对象数组
var infoWindowObj=[];//饼图窗口对象
var xiangMuType = "0";
$("#datetimeStart").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
}).on("click", function () {
    $("#datetimeStart").datetimepicker("setEndDate", $("#datetimeEnd").val());
});
$("#datetimeEnd").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
}).on("click", function () {
    $("#datetimeEnd").datetimepicker("setStartDate", $("#datetimeStart").val());
});

/********页面加载**********/
$(function(){
	var json = {};
	ajaxPost("/seimp/warn/getYearRange.do", json).done(function(result){
		if(result.status==0){
			var min = result.data.minYear;
			var max = result.data.maxYear;
			var html = "";
			for (var i = min; i <= max; i++) {
				if(i==min){
					html+="<span style='margin-left:0px;'><a id='dateTime"+i+"' class='timeline_color timelin_year' onclick=clickYear('"+i+"')>"+i+"</a></span>";
				}else{
					html+="<span style='margin-left:34px;'><a id='dateTime"+i+"' class='timelin_year' onclick=clickYear('"+i+"')>"+i+"</a></span>";
				}
			}
			$("#warTimeSlider>div").html(html);
			
			//初始化时间滑动条
			$("#qiYeHuaDongTiao").bootstrapSlider({
				min:min,
				max:max,
				step:1,
				value:min
			}).on("slideStop",function(value){//显示当年年份之后的数据
				timePar=value.value;
				
				//更新地图
				initMapOfProvince();

				//更新分身饼图图层
//				updatePieLayer();
				//更新表格数据
				updateTableData();
				//悬浮窗Echart加载
				getMapRightEchartsData();
				$('.timelin_year').removeClass('timeline_color')
				$('#dateTime'+timePar).addClass('timeline_color')

			});
			$("#ex1Slider").css("width",(max-min)*70+"px");
			//默认时间
			timePar = min;
			//地图页面初始化
			iniMap();
			
			//更新表格数据
			updateTableData();
			
			//悬浮窗echarts加载
			getMapRightEchartsData();
		}
	})
	
	
	//生成地图下方的行业选择按钮
	createInsutryClick();
	//生成行业定制框中的内容
	var html = "";//模态框中行业类型
	for (var i = 0; i < allQiYeIndustryArr.length; i++) {
		var currItem = allQiYeIndustryArr[i];
		if(i%3==0){
			if(i==0){
				html+="<div class='row' style='margin-bottom:10px;'>";
			}else{
				html+="</div><div class='row' style='margin-bottom:10px;'>";
			}
			
		}
		html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem.id+"'  name='industry' industry='"+currItem.name+"'>"+currItem.name+"</label></div>";
		if(i==allQiYeIndustryArr.length-1){
			html+="</div>";
		}
	}
	$(".modal-body").html(html);
	
	
	
	
	
})//--load end
/*改变时间范围重新加载地图*/
function gotoDate() {
}
//判断是国家级用户，还是省级用户，默认显示图层不同
function initLayerByUser(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
			InfoWindowLite,domConstruct
	){
		//判断用户是否是省级用户
		var storage = window.sessionStorage;
		//管理员、国家级用户
		if(storage.getItem("userLevel")==null || storage.getItem("userLevel")=="0" || storage.getItem("userLevel")=="1"){
		}else if(storage.getItem("userLevel")=="2"){//省级用户
			//当前省的行政区划
			provinceCode = storage.getItem("regionCode");
			//定位到当前省
			var queryTask = new QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0");
			var query = new Query();
			query.returnGeometry = true;
			query.outFields = ["*"];
			query.outSpatialReference = map.spatialReference;
			query.where = "PROV_CODE = "+provinceCode;
			queryTask.execute(query,showResults);

			function showResults(result){
				//判断查询是否有结果
				if(result.features.length>0){
			    	 var graphic = result.features[0];
			    	 //当前省的边界
//			    	 provinceExtent = graphic.geometry.getExtent();
			    	 map.setExtent(graphic.geometry.getExtent());
			    	 //当前省的高亮
			    	 /*var lineJson = {
							 "paths":graphic.geometry.rings,
							 "spatialReference":{"wkid":4326}
					 }
					 var highPolyline = new Polyline(lineJson);
					 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
					 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
					 //记录边界高亮
					 provinceClick = highGraphic;
					 map.graphics.add(highGraphic);
					 //改变右上角按钮Text
					 $("#province").html(graphic.attributes.NAME);
					 //显示右上角按钮
					 $("#province").removeClass("none");
					 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
					 $("#city").addClass("none");*/
				}
		    }
			
		}
	})
}


function iniMap(){
	//加载动画开始
	zmblockUI('body', 'start');
	
	//行业定制
	createInsutryClick();
	
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			InfoWindowLite,domConstruct
	){
		var extent = new Extent(extentPar);
		//初始化地图
		map = new Map("map",{
			logo:false,
			minZoom:2,
//			center:[108,34],
//			zoom:4,
			showLabels:true,
			extent:extent
		})
		
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		
		//省级用户定位到当前省份
		initLayerByUser();
		
		//加载分省底图
		initMapOfProvince();
		//更新分省饼图图层
//		updatePieLayer()
		//更新表格数据
//		getMapRightEchartsData();
		
		//隐藏统计图
		map.on("zoom-end",function(evt){
			if(evt.level<=3){
				//隐藏统计图
				hideLayer(infoWindowObj,graphicsLayer);
			}else{
				//显示统计图
				showLayer(infoWindowObj,graphicsLayer);
			}
		})
		
		
		
	});//--require end
}

//获取数据，更新饼图图层
function updatePieLayer(){
	//加载分省新增污染企业饼图
	var json = {timePar:timePar,industryPar:industryPar,type:xiangMuType,
		startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),
		minPROJECTINVEST:$("#minTotal").val(), maxPROJECTINVEST:$("#minTotal").val(),
        minENVIRONINVEST:$("#minEp").val(),maxENVIRONINVEST:$("#maxEp").val()};
	ajaxPost('/seimp/warn/newPollutingEnterprise1.do',json).done(function(data){
		if(data.status==0){//请求成功
//			if(data.data.length>0){
				addChart(data.data);
//			}
		}
	});
}

//添加饼图图层
function addChart(data){
	//清除图层
	//清除echarts饼图
	if(echartsObj.length>0){
		for (var i = 0; i < echartsObj.length; i++) {
			echartsObj[i].dispose();
		}
		echartsObj=[];
	}
	//清除饼图窗口
	if(infoWindowObj.length>0){
		for (var i = 0; i < infoWindowObj.length; i++) {
			infoWindowObj[i].infoWindow.destroy();
		}
		infoWindowObj=[];
	}
	//清除饼图图层
	if(graphicsLayer!=null){
		map.removeLayer(graphicsLayer);
	}
	//清除
	require([  
	          "esri/map",
	          "esri/layers/GraphicsLayer","esri/SpatialReference","esri/geometry/webMercatorUtils",
	              "esri/geometry/Point",  
	              "esri/layers/FeatureLayer",   
	              "esri/layers/ArcGISDynamicMapServiceLayer",   
	              "esri/symbols/SimpleLineSymbol",   
	              "esri/symbols/SimpleFillSymbol",  
	              "esri/renderers/SimpleRenderer",  
	              "esri/Color",  
	              "extras/ChartInfoWindow", //图表信息窗口类，处理如何响应用户地图操作，包括漫游、放大、缩小等  
	              "dojo/_base/array",   
	              "dojo/dom-construct",   
	              "dojo/_base/window",  
	              "dojox/charting/Chart",   
	              "dojox/charting/Chart2D",  
	              "dojox/charting/action2d/Highlight",   
	              "dojox/charting/action2d/Tooltip",   
	              "dojox/charting/plot2d/ClusteredColumns",  
	              "dojo/domReady!"  
     ], function (  
	                Map, GraphicsLayer,SpatialReference,webMercatorUtils,Point,FeatureLayer, ArcGISDynamicMapServiceLayer,  
	                SimpleLineSymbol, SimpleFillSymbol,  
	                SimpleRenderer, Color,   
	                ChartInfoWindow,  
	                array, domConstruct, win,  
	                Chart,Chart2D,Highlight, Tooltip,ClusteredColumns  
     ) {   
	                             
       graphicsLayer = new GraphicsLayer();
      
       //为featureLayer设置渲染器  
       var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);  
       var renderer = new SimpleRenderer(defaultSymbol);  
       graphicsLayer.setRenderer(renderer);  
         
       map.addLayer(graphicsLayer);
       var showFields = ["A","B","C"];  
       createChartInfoWindow();
       
       //获取I II的最大值
       var maxCount = data[0].IA+data[0].IB;
       for (var i = 0; i < data.length; i++) {
    	   var currItem = data[i];
    	   if(currItem.IA+currItem.IB>maxCount){
    		   maxCount =currItem.IA+currItem.IB; 
    	   }
    	   if(currItem.IIA+currItem.IIB>maxCount){
    		   maxCount = currItem.IIA+currItem.IIB;
    	   }
       }
         
       //创建放置直方图的信息窗口  
       function createChartInfoWindow() {  
           //假设虚构数据的最大值为1000  
    	   var max = 10000;  
           var optinalChart = null;  
           for(var i=0;i<data.length;i++){
        	   var currItem = data[i];
        	   //计算几何的中心位置，将图表信息框放置于此
               //根据数据中的provinceName和分段渲染的底图中的NAME_S对比，获取各省的中心点
               var labelPt = null;
               var graphics = featureLayer.graphics;
               if(graphics&&graphics.length>0){
            	   for (var j = 0; j < graphics.length; j++) {
            		   var currGra = graphics[j];
            		   if(currGra.attributes.NAME_S==currItem.provinceName){
            			   var extent = currGra.geometry.getExtent();
            			   labelPt = new Point((extent.xmin+extent.xmax)/2,(extent.ymin+extent.ymax)/2);
            			   labelPt = currGra.geometry.getCentroid();
            		   }
            	   }
               }
//             var labelPt = new Point(currItem.lon,currItem.lat);
               if(labelPt!=null){
	        	   var infoWindow = new ChartInfoWindow({  
	                    domNode: domConstruct.create('div', {style:"position:absolute;"}, document.getElementById('map'))  
	               });  
	               infoWindow.setMap(map);
//	               infoWindowObj.push(infoWindow);
	               
	               var nodeChart = null;  
	               nodeChart = domConstruct.create("div", { id: 'nodeTest' + i, style: "width:120px;height:120px" }, win.body());  
	               infoWindow.resize(120, 120);
                 
	               var obj = {
		            		infoWindow:infoWindow,
		            		location:labelPt
		            }
	               infoWindowObj.push(obj);
//             
	               infoWindow.setContent(nodeChart);  
	               infoWindow.__mcoords = labelPt;
	               infoWindow.show(map.toScreen(labelPt));
	               //加载echarts统计图
	               makeEcharts(nodeChart,currItem);
               }
           }  
           
           //隐藏统计图
           if(map.getLevel()<=3){
				//隐藏统计图
				hideLayer(infoWindowObj,graphicsLayer);
			}else{
				//显示统计图
				showLayer(infoWindowObj,graphicsLayer);
			}
//			hideLayer(infoWindowObj,graphicsLayer);
           
        }
       
       //创建Echarts统计图
       function makeEcharts(nodeChart,currItem){
    	   /*var seriesData1 = [
    	         {value:currItem.IA+currItem.IB,name:"Ⅰ"},
    	         {value:currItem.IIA+currItem.IIB,name:"Ⅱ"},
    	         {value:currItem.III,name:"Ⅲ"},
    	         ];
    	   option = {
    			    tooltip: {
    			        trigger: 'item',
    			        formatter: "{a} <br/>{b}: {c}家({d}%)"
    			    },
    			    color:["#9400D3","#6495ED","#808080"],
    			    series: [
    			        {
    			            name:currItem.provinceName+'新增污染企业数量',
    			            type:'pie',
    			            radius: '55%',

    			            label: {
    			                normal: {
    			                    show:false,
    			                    position: 'inner'
    			                }
    			            },
    			            labelLine: {
    			                normal: {
    			                    show: false
    			                }
    			            },
    			            data:seriesData1
    			        }
    			    ]
    			};*/
    	    var seriesData = [{
                name:'Ⅰ类',
                type:'bar',
                data:[currItem.IA+currItem.IB]
            },{
                name:'Ⅱ类',
                type:'bar',
                data:[currItem.IIA+currItem.IIB]
            }];
    	   	var option = {
    			    color: ['#9400D3','#6495ED'],
    			    tooltip : {
    			        trigger: 'axis',
    			        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
    			            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
    			        }
    			    },
    			    grid: {
    			        left: '3%',
    			        right: '4%',
    			        bottom: '3%',
    			        containLabel: true
    			    },
    			    xAxis : [
    			        {
    			            type : 'category',
    			            data : [currItem.provinceName+'潜污地数量'],
    			            show:false
    			        }
    			    ],
    			    yAxis : [
    			        {
    			            type : 'value',
    			            show:false,
    			            max:maxCount
    			        }
    			    ],
    			    series : seriesData
    			};
    		var pieChart = echarts.init(nodeChart);
    		echartsObj.push(pieChart);
    		pieChart.setOption(option);
       }
         
   });//--require end
}

//获取地图右边悬浮窗Echarts数据 
function getMapRightEchartsData(){
	var json = {timePar:timePar,industryPar:industryPar,type:xiangMuType,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),
        minPROJECTINVEST:$("#minTotal").val(), maxPROJECTINVEST:$("#minTotal").val(),
        minENVIRONINVEST:$("#minEp").val(),maxENVIRONINVEST:$("#maxEp").val()};
	ajaxPost('/seimp/warn/newPollutingEnterprise1.do',json).done(function(data){
		if(data.status==0){//请求成功
//			if(data.data.length>0){
			updateMapRightEcharts(data.data);
//			}
		}
	});
}

//更新地图右边悬浮窗图表Echarts
function updateMapRightEcharts(data){
	var xAxisData = [];
	var seriesData1 = [];
	var seriesData2 = [];
	if(data.length>0){
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			if(currItem.provinceName!='国家'){
				xAxisData.push(currItem.provinceName);
				seriesData1.push(currItem.IA+currItem.IB);
				seriesData2.push(currItem.IIA+currItem.IIB);
			}
		}
	}
	
	var  option = {
		    tooltip : {
		        trigger: 'axis',
		        axisPointer : {        
		            type : 'shadow'
		        }
		    },
		    color: ['#9400D3','#6495ED'],
		    legend: {
		    	left: 'left',
		        top: '90%',
		        data:['Ⅰ类','Ⅱ类']
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '20%',
		        containLabel: true
		    },
		    xAxis : [
		        {
		            type : 'category',
		            data : xAxisData
		        }
		    ],
		    yAxis : [
		        {
		            type : 'value'
		        }
		    ],
		    series : [
		        {
		            name:'Ⅰ类',
		            type:'bar',
		            data:seriesData1,
		            center: ['50%', '40%']
		        },
		        {
		            name:'Ⅱ类',
		            type:'bar',
		            data:seriesData2
		        }
		    ]
		};
	
	var floatEcharts = echarts.init(document.getElementById("tongjitu"));
	floatEcharts.setOption(option);
}

//获取数据，更新表格数据
function updateTableData(){
	var quyuName="全国";
	if(provinceSName!=""){
		quyuName = provinceSName;
	}
	if(xiangMuType==0){
		$(".main_table .tabtop_left").html(quyuName+"新增污染企业信息")
	}else if(xiangMuType==1){
		$(".main_table .tabtop_left").html(quyuName+"建设项目信息")
	}else if(xiangMuType==2){
		$(".main_table .tabtop_left").html(quyuName+"验收项目信息")
	}
	var json = {timePar:timePar,industryPar:industryPar,provinceFIDPar:provinceFIDPar,type:xiangMuType};
	ajaxPost("/seimp/warn/newPollutingEnterpriseDetail.do", json).done(function(data){
		if(data.status==0){//请求成功
//			if(data.data.length>0){
				updateTable(data.data);
//			}
		}
	});

//			var data =[{
//				ID:"1",
//				PROJECTNAME:"北京市项目",//项目名称
//				EIAMANAGENAME:"石油开采",//行业类别
//				PROVINCENAME:"北京市",//对接省份
//				UPDATETIME_HBB_BIGDATA:"2017-03-04"//更新时间
//			}];
//			updateTable(data);

}

//更新表格数据
function updateTable(data){
	var headHtml = "<td>序号</td><td>项目名称</td><td>行业类别</td><td>对接省份</td>";
	var bodyHtml = "";
	if(data.length>0){
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			bodyHtml+="<tr><td>"+(i+1)+"</td><td>"+currItem.PROJECTNAME+"</td><td>"+currItem.EIAMANAGENAME+"</td><td>"+currItem.PROVINCENAME+"</td></tr>"
		}
	}
	$("#tongjibiao thead tr").html(headHtml);
	$("#tongjibiao tbody").html(bodyHtml);
}

//加载分省底图
function initMapOfProvince(){
	if(featureLayer!=null){
		map.removeLayer(featureLayer);
		map.graphics.clear();
		provinceFIDPar = "";
		provinceSName="";
		updateTableData();
	}
	//清除省名图层
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countryGraphicsLayer"));
	}
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"provinceLayer"
	     });
		 
		 //加载省名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("10pt");
		 statesLabel.font.setWeight(700);
		 statesLabel.font.setFamily("微软雅黑");
		 statesLabel.setOffset(0,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);

		 
		 var clickGraphic = null;//处于选中状态的graphic
		 
		 featureLayer.on("click",function(evt){
			 //清除高亮graphic
			 map.graphics.clear();
			 //判断本次点击的graphic是否处于选中状态
			 if(clickGraphic!=null && evt.graphic.attributes.FID==clickGraphic.attributes.FID){
				 //取消省份选中状态
				 clickGraphic =  null;
				 //表格数据恢复到全国数据状态
				 provinceFIDPar = "";
				 provinceSName="";
				 //更新表格数据到全国数据状态
				 updateTableData();
				 return;
			 }
			 //恢复上次
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol);
			 map.graphics.add(highGraphic);
			 //记录本地点击的graphic
			 clickGraphic = evt.graphic;
			 //表格数据恢复到全国数据状态
			 provinceFIDPar = clickGraphic.attributes.NAME_S;
			 provinceSName = clickGraphic.attributes.NAME;
			 //更新表格数据到全国数据状态
			 updateTableData();		 
		 })
		 
		 featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
			addGuojie();
		 })
		 
		 	//加载分省新增污染企业饼图
			var json = {timePar:timePar,industryPar:industryPar,type:xiangMuType,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),
                minPROJECTINVEST:$("#minTotal").val(), maxPROJECTINVEST:$("#minTotal").val(),
                minENVIRONINVEST:$("#minEp").val(),maxENVIRONINVEST:$("#maxEp").val()};
			ajaxPost('/seimp/warn/newPollutingEnterprise1.do',json).done(function(data){
				if(data.status==0){//请求成功
					if(data.data.length>0){
						data = data.data;
						//处理数据
						var minCount = 0;
						var maxCount = 0;
						for (var i = 0; i < data.length; i++) {
							currItem = data[i];
							if(currItem.provinceName!="国家"){
								data[i].count = currItem.IA+currItem.IB+currItem.IIA+currItem.IIB+currItem.III;
								/*if(minCount==0&&maxCount==0){
									minCount = currItem.count;
									maxCount = currItem.count;
								}*/
								if(currItem.count<minCount){
									minCount = currItem.count;
								}
								if(currItem.count>maxCount){
									maxCount = currItem.count;
								}
							}
						}
						//处理最大值
						maxCount = maxmain(maxCount);
//						addChart(data.data);
					
				 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
				 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([4,94,2,1]));
				 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([92,155,0,1]));
				 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([197,218,1,1]));
				 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,215,5,1]));
				 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([251,132,5,1]));
				 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,38,0,1]));
				 		renderer = new UniqueValueRenderer(defaultSymbol,"NAME_S");
						
						var count = (maxCount - minCount)/6;
						//更新图例
						updateLegend(minCount,count);
						
						for (var i = 0; i < data.length; i++) {
							var currItem = data[i];
							if(minCount<=currItem.count&&currItem.count<minCount+count*1){
								renderer.addValue(currItem.provinceName, symbol1);
							}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
								renderer.addValue(currItem.provinceName, symbol2);
							}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
								renderer.addValue(currItem.provinceName, symbol3);
							}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
								renderer.addValue(currItem.provinceName, symbol4);
							}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
								renderer.addValue(currItem.provinceName, symbol5);
							}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
								renderer.addValue(currItem.provinceName, symbol6);
							}
							/*if(currItem.count<100){
								renderer.addValue(currItem.provinceName, symbol1);
							}else if(100<=currItem.count && currItem.count<150){
								renderer.addValue(currItem.provinceName, symbol2);
							}else if(150<=currItem.count && currItem.count<200){
								renderer.addValue(currItem.provinceName, symbol3);
							}else if(200<=currItem.count && currItem.count<250){
								renderer.addValue(currItem.provinceName, symbol4);
							}else if(250<=currItem.count && currItem.count<300){
								renderer.addValue(currItem.provinceName, symbol5);
							}else if(300<=currItem.count){
								renderer.addValue(currItem.provinceName, symbol6);
							}*/
						}
						featureLayer.setRenderer(renderer);
						map.addLayer(featureLayer,2);
						
						featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
							updatePieLayer();
							addProvinceName();
						})
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"NAME_S");
					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						updatePieLayer();
						addProvinceName();
					})
				}
			}
		});
//			}
//		});
	});
}

function addProvinceName(){
	require([
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
		"esri/geometry/Point",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
		SimpleMarkerSymbol, SimpleLineSymbol,
        PictureMarkerSymbol, CartographicLineSymbol, 
        Graphic, TextSymbol,GraphicsLayer,
        Point,
        Color, dom, on
  	){
		var graphicsLayer = new GraphicsLayer({id:"countryGraphicsLayer"});
		graphicsLayer.setMinScale(18489334.7159);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("provinceLayer").graphics;
		//添加省名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			//处理河北省
			if(currFeaGraphic.attributes.PROV_CODE=="130000"){
				point = new Point([115.18,38]);
			}
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		
		/***********如果污染类型是全部，显示统计图******/
		
		map.addLayer(graphicsLayer);
		
	});//--require end
}



//隐藏图层
function hideLayer(infoWindowObj,graphicsLayer,fLayerCounty){
	//隐藏饼图窗口
	if(infoWindowObj.length>0){
		for (var i = 0; i < infoWindowObj.length; i++) {
			infoWindowObj[i].infoWindow.hide();
		}
	}
	//隐藏饼图图层
	/*if(graphicsLayer!=null){
		graphicsLayer.setVisibility(false);
	}*/
	//隐藏底图图层
	/*if(fLayerCounty!=null){
		fLayerCounty.setVisibility(false);
	}*/
}

//显示图层
function showLayer(infoWindowObj,graphicsLayer,fLayerCounty){
	//显示饼图窗口
	if(infoWindowObj.length>0){
		for (var i = 0; i < infoWindowObj.length; i++) {
			infoWindowObj[i].infoWindow.show(infoWindowObj[i].location);
		}
	}
	//显示饼图图层
	/*if(graphicsLayer!=null){
		graphicsLayer.setVisibility(true);
	}*/
	//显示底图图层
	/*if(fLayerCounty!=null){
		fLayerCounty.setVisibility(true);
	}*/
}

/*******页面控制方法****/
//生成图例
function updateLegend(minCount,count){
	$("#ditu li:eq(0) div:eq(1)").html(minCount+"-"+parseInt(minCount+count*1));
	$("#ditu li:eq(1) div:eq(1)").html(parseInt(minCount+count*1)+"-"+parseInt(minCount+count*2));
	$("#ditu li:eq(2) div:eq(1)").html(parseInt(minCount+count*2)+"-"+parseInt(minCount+count*3));
	$("#ditu li:eq(3) div:eq(1)").html(parseInt(minCount+count*3)+"-"+parseInt(minCount+count*4));
	$("#ditu li:eq(4) div:eq(1)").html(parseInt(minCount+count*4)+"-"+parseInt(minCount+count*5));
	$("#ditu li:eq(5) div:eq(1)").html(parseInt(minCount+count*5)+"-"+parseInt(minCount+count*6));
	
}

//两秒钟后清除提示
function qingChuTiShi(){
	setTimeout(function(){
		$(".noDataTips").hide();
	},"2000")
}

//显示提示
function showTiShi(info){
	$(".noDataTips .tabtop_left").text(info);
	$(".noDataTips").show();
	qingChuTiShi();
}

//行业定制弹出框显示
function qiYeCheckBoxShow(){
	//回显选中数据
	if(qiYeIndustryArr.length>0){
		//弹出框回显
		$("#myModal input:checkbox").prop("checked",false);
		for (var i = 0; i < qiYeIndustryArr.length; i++) {
			var currObj = qiYeIndustryArr[i];
			$("#myModal input:checkbox[value='"+currObj.id+"']").prop("checked",true);
		}
	}
	//弹出框
	$("#myModal").modal();
}

//行业定制弹出框确定按钮收集数据，并重新生成行业选择
function shouJiShuJu(){
	if($("#myModal input:checkbox:checked").length>8){
		toastr.warning("行业定制数量不能超过8个");
		return;
	}
	qiYeIndustryArr = [];
	//弹出框收集选中
	$.each($("#myModal input:checkbox:checked"),function(index,obj){
		var liSelectedData = {
				id:$(obj).attr("industry"),
				name:$(obj).val()
		}
		qiYeIndustryArr.push(liSelectedData);
	})
	
	createInsutryClick();
	$("#myModal").modal('hide');
}

//生成地图下方的行业筛选列表
function createInsutryClick(){
	//重新更新下方的企业类别选择条
	var html ="<li class='lt metal' onclick=switchIndustry('',$(this))>全部</li>";
	if(qiYeIndustryArr.length>0){
		for (var i = 0; i < qiYeIndustryArr.length; i++) {
			var currObj = qiYeIndustryArr[i];
			html +="<li class='lt' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
		}
	}
	html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
	$("#mapItem").html(html);
    var box_width = $("#map").width()
    var lim_width = $(".map-item").width()
    var width_f = (box_width - lim_width)/2
    $(".map-item").css("margin-left",+width_f+"px");
}

//行业选择
function switchIndustry(switchIndustry,obj){
	//记录选择的行业
	industryPar=switchIndustry;
	$(obj).siblings().removeClass("metal");
	$(obj).addClass("metal");
	initMapOfProvince();
	//更新分身饼图图层
//	updatePieLayer();
	//更新表格数据
	updateTableData();
	//更新悬浮窗Echarts表格数据
	getMapRightEchartsData();
}

/*****************地图相关方法***************/
//清除type属性值为value的graphic
function removeGraphic(value){
	var graphics = map.graphics.graphics;
	for (var i = 0; i < graphics.length; i++) {
		if(graphics[i].attributes&&graphics[i].attributes.type&&graphics[i].attributes.type==value){
			map.graphics.remove(graphics[i]);
		}
	}
}

$(function(){
	//项目类别点击事件
	$("#xiangmuDiv button").click(function(){
        $("#xiangmuDiv button").removeClass('active')
		$(this).addClass('active')
		xiangMuType = $(this).attr("value");
		initMapOfProvince();
		//更新分身饼图图层
//		updatePieLayer();
		//更新表格数据
		updateTableData();
		//更新悬浮窗Echarts表格数据
		getMapRightEchartsData();
		
		//更新图例名称
		if(xiangMuType=="0"){
			$("#mylegend div p:eq(1)").html("建设项目及验收项目数量(个)");
		}else if(xiangMuType=="1"){
			$("#mylegend div p:eq(1)").html("建设项目数量(个)");
		}else if(xiangMuType=="2"){
			$("#mylegend div p:eq(1)").html("验收项目数量(个)");
		}
	})
	
	//右边悬浮窗
	/*****悬浮窗**/
	$(".floattool .icon").mouseover(function(evt){
		$(".float-tool-title").show();
		//alert($(this).index());
		var classval = $(this).parent().attr("class");
		if(classval=="layer_nav"){
			$(".float-tool-title .title").html("地图");
			$(".float-tool-title").css("top","290px");
			$(".float-tool-title").css("left","92%");
		}else if(classval=="table_nav"){
			$(".float-tool-title .title").html("统计表");
			$(".float-tool-title").css("top","328px");
			$(".float-tool-title").css("left","92%");
		}else if(classval=="graphic_nav"){
			$(".float-tool-title .title").html("统计图");
			$(".float-tool-title").css("top","365px");
			$(".float-tool-title").css("left","92%");
		}else if(classval=="time_nav"){
			$(".float-tool-title .title").html("时间轴");
			$(".float-tool-title").css("top","405px");
			$(".float-tool-title").css("left","92%");
		}
	})
	$(".floattool .icon").mouseout(function(){
		$(".float-tool-title").hide();
	})
	$(".floattool .icon").click(function(evt){
		//alert($(this).index());
		var classval = $(this).parent().attr("class");
		if(classval=="layer_nav"){
			if($(this).parent().find("div.common-panel").is(":visible")){
				$(this).parent().find("div.common-panel").hide();
			}else{
				$(this).parent().find("div.common-panel").show();
			}
		}else if(classval=="table_nav"){
			if($(".main_table").is(":visible")){
				$(".main_table").hide();
			}else{
				if(isHaveData.tongjibiao==1){
					if(isSelect==1){
						$(".main_table").show();
					}else{
						showTiShi("请选择数据");
					}
				}else{
					showTiShi("没有数据");
				}
			}
		}else if(classval=="graphic_nav"){
			if($(".main_graphic").is(":visible")){
				$(".main_graphic").hide();
			}else{
				if(isHaveData.tongjitu==1){
					 if(isSelect==1){
						 $(".main_graphic").show();
					 }else{
						 showTiShi("请选择数据");
					 }
				}else{
					showTiShi("没有数据");
				}
				
				//加载统计图
				//initEcarts();
			}
		}else if(classval=="time_nav"){
			if($(".time-axis-box").is(":visible")){
				$(".time-axis-box").hide();
			}else{
				if(isHaveData.shijianzhou==1){
					if(isSelect==1){
						$(".time-axis-box").show();
					}else{
						showTiShi("请选择数据");
					}
				}else{
					showTiShi("没有数据");
				}
			}
		}
	})
	//关闭悬浮窗
	$(".layer_nav .common-panel>a").click(function(){
		$(this).parent().hide();
	})
	//切换地图底图
	$(".layer-items a").click(function(){
		var mapName = $.trim($(this).text());
		//设置选中状态
		if(mapName=="影像"||mapName=="地图"){
			$(this).siblings(":eq(2),:eq(3)").removeClass("active");
			$(this).addClass("active");
		}else{
			if($(this).hasClass("active")){
				$(this).removeClass("active");
			}else{
				$(this).addClass("active");
			}
		}
		
		if(mapName=="影像"){
			if(map.getLayer("vectorLayer")){
				map.removeLayer(map.getLayer("vectorLayer"));
				map.removeLayer(map.getLayer("vectorNoteLayer"));
				
				//判断中文注记的状态
				if($(this).siblings(":eq(1)").hasClass("active")){
					imageMap(map,true);
				}else{
					imageMap(map,false);
				}
			}
		}else if(mapName=="地图"){
			if(map.getLayer("imageLayer")){
				map.removeLayer(map.getLayer("imageLayer"));
				map.removeLayer(map.getLayer("imageNoteLayer"));
				
				//判断中文注记的状态
				if($(this).siblings(":eq(1)").hasClass("active")){
					vectorMap(map,true);
				}else{
					vectorMap(map,false);
				}
			}
		}else if(mapName=="公里格网"){
			if(map.getLayer("gewangLayer")){
				map.removeLayer(map.getLayer("gewangLayer"));
			}else{
				addGewang();
			}
		}else if(mapName=="中文注记"){
			//判断是矢量地图还是影像地图
			//判断矢量地图是否存在
			if(map.getLayer("vectorLayer")){
				//矢量地图
				//判断中文注记的状态
				if(map.getLayer("vectorNoteLayer").visible){
					map.getLayer("vectorNoteLayer").setVisibility(false);
				}else{
					map.getLayer("vectorNoteLayer").setVisibility(true);
				}
			}else{
				//影像地图
				if(map.getLayer("imageNoteLayer").visible){
					map.getLayer("imageNoteLayer").setVisibility(false);
				}else{
					map.getLayer("imageNoteLayer").setVisibility(true);
				}
			}
		}else if(mapName=="道路"){
			if(map.getLayer("gaosuLayer")){
				map.removeLayer(map.getLayer("gaosuLayer"));
				map.removeLayer(map.getLayer("shengdaoLayer"));
			}else{
				addRoad();
			}
		}else if(mapName=="加油站点"){
			if(map.getLayer("gasLayer")){
				map.removeLayer(map.getLayer("gasLayer"));
			}else{
				addGas();
			}
		}else if(mapName=="河流"){
			if(map.getLayer("riverLayer")){
				map.removeLayer(map.getLayer("riverLayer"));
			}else{
				addRiver();
			}
		}
	})
	//关闭统计表
	$(".main_table div.tabtop_rt").click(function(){
		$(".main_table").hide();
	})
	//关闭统计图
	$(".main_graphic div.tabtop_rt").click(function(){
		$(".main_graphic").hide();
	})
})

$(document).ready(function(){
    var $div = $("div#tongjituDiv");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown",function(event){
      /* 获取需要拖动节点的坐标 */
      var offset_x = $(this)[0].offsetLeft;//x坐标
      var offset_y = $(this)[0].offsetTop;//y坐标
      /* 获取当前鼠标的坐标 */
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      /* 绑定拖动事件 */
      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
      $(document).bind("mousemove",function(ev){
        /* 计算鼠标移动了的位置 */
        var _x = ev.pageX - mouse_x;
        var _y = ev.pageY - mouse_y;
        /* 设置移动后的元素坐标 */
        var now_x = (offset_x + _x ) + "px";
        var now_y = (offset_y + _y ) + "px";
        /* 改变目标元素的位置 */
        $div.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
    
    
    var $div1 = $("div.main_graphic");
    /* 绑定鼠标左键按住事件 */
    $div1.bind("mousedown",function(event){
      /* 获取需要拖动节点的坐标 */
      var offset_x = $(this)[0].offsetLeft;//x坐标
      var offset_y = $(this)[0].offsetTop;//y坐标
      /* 获取当前鼠标的坐标 */
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      /* 绑定拖动事件 */
      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
      $(document).bind("mousemove",function(ev){
        /* 计算鼠标移动了的位置 */
        var _x = ev.pageX - mouse_x;
        var _y = ev.pageY - mouse_y;
        /* 设置移动后的元素坐标 */
        var now_x = (offset_x + _x ) + "px";
        var now_y = (offset_y + _y ) + "px";
        /* 改变目标元素的位置 */
        $div1.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
    
    var $div2 = $("div#geWangTable");
    /* 绑定鼠标左键按住事件 */
    $div2.bind("mousedown",function(event){
      /* 获取需要拖动节点的坐标 */
      var offset_x = $(this)[0].offsetLeft;//x坐标
      var offset_y = $(this)[0].offsetTop;//y坐标
      /* 获取当前鼠标的坐标 */
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      /* 绑定拖动事件 */
      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
      $(document).bind("mousemove",function(ev){
        /* 计算鼠标移动了的位置 */
        var _x = ev.pageX - mouse_x;
        var _y = ev.pageY - mouse_y;
        /* 设置移动后的元素坐标 */
        var now_x = (offset_x + _x +350) + "px";
        var now_y = (offset_y + _y +200) + "px";
        /* 改变目标元素的位置 */
        $div2.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
})


