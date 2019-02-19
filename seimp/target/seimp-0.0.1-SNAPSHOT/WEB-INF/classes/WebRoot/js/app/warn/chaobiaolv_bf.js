/******变量*******/
var map;
var isHaveData={//是否有统计图、统计表、时间轴数据
		tongjibiao:1,
		tongjitu:0,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=1;
var typeFlag = 0;//0 全国数据 1：某个省的数据 2：某个市的数据
var fLayerProvince = null;//分省底图
var gLayerProvince = null;//分省饼图图层
var eObjProvince = [];//分省echarts对象数组
var iObjProvince = [];//分省窗口对象数组
var provinceTableData = null;
var provinceHighGraphic = null;//省部高亮

var fLayerCity = null;//分市底图
var gLayerCity = null;//分市饼图图层
var eObjCity = [];//分市echarts对象数组
var iObjCity = [];//分市窗口对象数组
var lastProvinceCode = "";
var provinceExtent = null;
var CityTableData = null;
var cityHighGraphic = null;//市届高亮

var fLayerCounty = null;//分县底图
var gLayerCounty = null;//分县饼图图层
var eObjCounty = [];//分县echarts对象数组
var iObjCounty = [];//分县窗口对象数组
var lastCityCode = "";
var cityExtent = null;
var CountyTableData = null;
var countyHighGraphic = null;//县界高亮

var industryPar = "重金属";//默认显示总金属行业数据

/********页面加载**********/
$(function(){
	
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
			if($("#tongjituDiv").is(":visible")){
				$("#tongjituDiv").hide();
			}else{
				if(isHaveData.tongjibiao==1){
					if(isSelect==1){
						$("#tongjituDiv").show();
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
		$(this).siblings().removeClass("active");
		$(this).addClass("active");
		var mapName = $.trim($(this).text());
		if(mapName=="影像"){
			if(map.getLayer("vectorLayer")){
				map.removeLayer(map.getLayer("vectorLayer"));
				map.removeLayer(map.getLayer("vectorNoteLayer"));
				imageMap(map);
			}
		}else if(mapName=="地图"){
			if(map.getLayer("imageLayer")){
				map.removeLayer(map.getLayer("imageLayer"));
				map.removeLayer(map.getLayer("imageNoteLayer"));
				vectorMap(map);
			}
		}else if(mapName=="公里格网"){
			if(map.getLayer("gewangLayer")){
				map.removeLayer(map.getLayer("gewangLayer"));
			}else{
				addGewang();
			}
		}
	})
	//关闭统计表
	$("#tongjituDiv  div.tabtop_rt").click(function(){
		$("#tongjituDiv").hide();
	})
	
	//关闭弹出的污染物表格
	$("#detailTable  div.tabtop_rt").click(function(){
		$("#detailTable").hide();
	})
	
	//关闭统计图
	$(".main_graphic div.tabtop_rt").click(function(){
		$(".main_graphic").hide();
	})
	
	
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo
	){
		//初始化地图
		map = new Map("map",{
			logo:false,
			center:[108,34],
			zoom:4
		})
		
		map.on("zoom-end",function(evt){
			if(evt.level==4){//全国范围
				updateProvinceLayer();
			}else if(evt.level==6){//某一个省范围
				if(lastProvinceCode!=null){
					updateCountyLayer(lastProvinceCode);
				}
			}
		})
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		//默认显示重金属、分省统计图
		updateProvinceLayer();
		
		
	});//--require end
	
})//--load end

//更新分省饼图
function updateProvinceLayer(){
	typeFlag = 0;
	//隐藏分市
	hideLayer(iObjCity,gLayerCity,fLayerCity);
	//隐藏分县
	hideLayer(iObjCounty,gLayerCounty,fLayerCounty);
	//加载分省饼图层
	//判断是加载分省饼，还是显示分省
	if(fLayerProvince!=null){
		//显示分省
		removeGraphic("provinceHigh");
		updateTable(provinceTableData);
		showLayer(iObjProvince,gLayerProvince,fLayerProvince);
	}else{//加载分省
		addProvinceLayer();
	}
}

//更新分市饼图
function updateCityLayer(currProvinceCode){
	typeFlag = 1;
	//隐藏分省
	hideLayer(iObjProvince,gLayerProvince,fLayerProvince);
	//判断是销毁分县，还是隐藏分县
	hideLayer(iObjCounty,gLayerCounty,fLayerCounty);
	//加载分市饼图层
	//判断是加载分市，还是显示分市
	if(currProvinceCode==lastProvinceCode){//显示分市
		updateTable(cityTableData);
		showLayer(iObjCity,gLayerCity,fLayerCity);
	}else{
		//销毁分市
		destroyLayer(eObjCounty,iObjCity,gLayerCity,fLayerCity);
		eObjCounty=[];
		iObjCity=[];
		//加载分市
		addCityLayer();
	}
}

//更新分县饼图
function updateCountyLayer(currCityCode){
	typeFlag = 2;
	//隐藏分省
	hideLayer(iObjProvince,gLayerProvince,fLayerProvince);
	//隐藏分市
	hideLayer(iObjCity,gLayerCity,fLayerCity);
	//加载分县饼图层
	//判断是加载分县，还是显示分县
	if(currCityCode==lastProvinceCode){//显示分县
		updateTable(countyTableData);
		showLayer(iObjCounty,gLayerCounty,fLayerCounty);
		
		map.graphics.add(provinceHighGraphic);
	}else{
		//销毁分县
		destroyLayer(eObjCounty,iObjCounty,gLayerCounty,fLayerCounty);
		eObjCounty = [];
		iObjCounty = [];
		//加载分县
		addCountyLayer();
	}
}

//加载饼图图层
function addChartProvince(data,gLayer,fLayer,eObj,iObj){
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
		
		//重新计算数据，更新表格
		if(fLayer.id=="provinceFeatureLayer"){
			for(var i=0;i<data.length;i++){
				var graphics = fLayer.graphics;
	            if(graphics&&graphics.length>0){
	           	   	for (var j = 0; j < graphics.length; j++) {
	           	   		var currGra = graphics[j];
	           	   		if(currGra.attributes.PROV_CODE==data[i].CODE){
	           	   			data[i].provinceName =  currGra.attributes.NAME;
	           	   		}
	           	   	}
	            }
	            data[i].totalCount = data[i].SLIGHT+data[i].LIGHT+data[i].MIDDLE+data[i].SERVERE;
	           
			}
			 provinceTableData = data;
		}else if(fLayer.id=="countyFeatureLayer"){
			for(var i=0;i<data.length;i++){
				var graphics = fLayer.graphics;
	            if(graphics&&graphics.length>0){
	           	   	for (var j = 0; j < graphics.length; j++) {
	           	   		var currGra = graphics[j];
	           	   		if(currGra.attributes.CNTY_CODE==data[i].CODE){
	           	   			data[i].provinceName =  currGra.attributes.NAME;
	           	   		}
	           	   	}
	            }
	            data[i].totalCount = data[i].SLIGHT+data[i].LIGHT+data[i].MIDDLE+data[i].SERVERE;
			}
			countyTableData = data;
		}
		updateTable(data);
		
	                             
		gLayer = new GraphicsLayer();
     
		//为featureLayer设置渲染器  
		var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);  
		var renderer = new SimpleRenderer(defaultSymbol);  
		gLayer.setRenderer(renderer);
		    
		map.addLayer(gLayer);
		var showFields = ["A","B","C"];  
		createChartInfoWindow();  
		    
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
	            var provinceName = "";
	            var graphics = fLayer.graphics;
	            if(fLayer.id=="provinceFeatureLayer"){
		            if(graphics&&graphics.length>0){
		           	   	for (var j = 0; j < graphics.length; j++) {
		           	   		var currGra = graphics[j];
		           	   		if(currGra.attributes.PROV_CODE==currItem.CODE){
		           	   			var labelPt = currGra.geometry.getCentroid();
	//	           	   			labelPt = new Point((extent.xmin+extent.xmax)/2,(extent.ymin+extent.ymax)/2);
		           	   			provinceName =  currGra.attributes.NAME;
		           	   		}
		           	   	}
		            }
	            }else if(fLayer.id=="countyFeatureLayer"){
	            	if(graphics&&graphics.length>0){
		           	   	for (var j = 0; j < graphics.length; j++) {
		           	   		var currGra = graphics[j];
		           	   		if(currGra.attributes.CNTY_CODE==currItem.CODE){
		           	   			var labelPt = currGra.geometry.getCentroid();
	//	           	   			labelPt = new Point((extent.xmin+extent.xmax)/2,(extent.ymin+extent.ymax)/2);
		           	   			provinceName =  currGra.attributes.NAME;
		           	   		}
		           	   	}
		            }
	            }
	            if(labelPt!=null){
		       	   	var infoWindow = new ChartInfoWindow({  
		       	   		domNode: domConstruct.create('div', {style:"position:absolute;"}, document.getElementById('map'))  
		            });  
		            infoWindow.setMap(map);
		            
		                
		            var nodeChart = null;  
		            nodeChart = domConstruct.create("div", { id: 'nodeTest' + i, style: "width:80px;height:80px" }, win.body());  
		            infoWindow.resize(122, 52);
		                
		            
	            
//	            labelPt = new Point(104,39);
	            
		            infoWindow.setContent(nodeChart);  
		            infoWindow.__mcoords = labelPt;
		            infoWindow.show(map.toScreen(labelPt));
		            var obj = {
		            		infoWindow:infoWindow,
		            		location:labelPt
		            }
		            iObj.push(obj);
		              //加载echarts统计图
		            makeEcharts(nodeChart,currItem,provinceName);
	            }
			}  
     }
      
      //创建Echarts统计图
      function makeEcharts(nodeChart,currItem,provinceName){
   	   var seriesData = [
   	         {value:currItem.SLIGHT,name:"轻微污染数"},
   	         {value:currItem.LIGHT,name:"轻度污染数"},
   	         {value:currItem.MIDDLE,name:"中度污染数"},
   	         {value:currItem.SEVERE,name:"重度污染数"}];
   	   var option = {
   		    tooltip : {
   		        trigger: 'item',
   		        formatter: "{a} <br/>{b} : {c} ({d}%)"
   		    },
   		    color:["#00FA9A","#ECE74D","#F78F30","#ED2A24"],
   		    series : [
   		        {
   		            name: provinceName+'污染点位数量',
   		            type: 'pie',
   		            radius : '55%',
   		            center: ['50%', '60%'],
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
   		            data:seriesData
   		        }
   		    ]
   		};
   		var pieChart = echarts.init(nodeChart);
   		eObj.push(pieChart);
   		pieChart.setOption(option);
      }
        
  });//--require end
}

//加载分省
function addProvinceLayer(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,
			SimpleRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color
	){
		fLayerProvince = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"provinceFeatureLayer"
	     });
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		fLayerProvince.setRenderer(renderer);
		map.addLayer(fLayerProvince);
		
		fLayerProvince.on("update-end",function(){
			var json = {industryPar:industryPar};
			ajaxPost('/seimp/warn/overproof_Pro.do',json).done(function(data){
				if(data.status==0){//请求成功
					if(data.data.length>0){
						addChartProvince(data.data,gLayerProvince,fLayerProvince,eObjProvince,iObjProvince);
					}
				}
			});
		});
		fLayerProvince.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
		})
		fLayerProvince.on("mouse-out",function(){
			//恢复上次
//			map.graphics.clear();
			if(typeFlag==0){
				removeGraphic("provinceHigh");
			}
		})
		
		fLayerProvince.on("click",function(evt){
			 //增加选择的省部边界
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 provinceHighGraphic = highGraphic;
			 map.graphics.add(highGraphic);
			
			var provinceCode = evt.graphic.attributes.PROV_CODE;
			lastProvinceCode = provinceCode;
			//updateCityLayer(evt.graphic);shi
			updateCountyLayer(evt.graphic);
			map.setExtent(evt.graphic.geometry.getExtent());
			provinceExtent = evt.graphic.geometry.getExtent();
//			map.graphics.clear();
			//显示右上角的省份按钮
			$("#province").text(evt.graphic.attributes.NAME);
			$("#province").removeClass("none");
			$("#province").click(function(){
				//updateCityLayer(lastProvinceCode);shi
				updateCountyLayer(lastProvinceCode);
				map.setExtent(provinceExtent);
			})
			//隐藏县按钮
			$("#city").addClass("none");
		})
		
	});
}

//加载分市
function addCityLayer(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,
			SimpleRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color
	){
		fLayerCity = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"cityFeatureLayer"
			 
				 
	     });
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		fLayerCity.setRenderer(renderer);
 		
		map.addLayer(fLayerCity);
		fLayerCity.on("update-end",function(){
			var json = {industryPar:industryPar,regionCode:lastProvinceCode};
			ajaxPost('/seimp/warn/overproof_Shi.do',json).done(function(data){
				if(data.status==0){//请求成功
					if(data.data.length>0){
						addChartProvince(data.data,gLayerCity,fLayerCity,eObjCity,iObjCity);
					}
				}
			});
		});
		fLayerCity.on("mouse-over",function(evt){
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol);
			 map.graphics.add(highGraphic);
		})
		fLayerCity.on("mouse-out",function(){
			//恢复上次
			map.graphics.clear();
		})
		
		fLayerCity.on("click",function(evt){
			var cityCode = evt.graphic.attributes.PROV_CODE;
			lastCityCode = cityCode;
			updateCountyLayer(evt.graphic);
			map.setExtent(evt.graphic.geometry.getExtent());
			cityExtent = evt.graphic.geometry.getExtent();
			map.graphics.clear();
			//显示右上角的省份按钮
			$("#city").text(evt.graphic.attributes.NAME);
			$("#city").removeClass("none");
			$("#city").click(function(){
				updateCountyLayer(lastCityCode);
				map.setExtent(cityExtent);
			})
		})
		
	});
}

//加载分县
function addCountyLayer(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/tasks/query","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	],function(Map, Legend,
			FeatureLayer,Query,UniqueValueRenderer,
			SimpleRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color
	){
		fLayerCounty = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"countyFeatureLayer"
	     });
		/*var query = new Query();
		query.where = "CNTY_CODE like"+(lastProvinceCode+"").substr(0, 2)+"%";
		// Query for the features with the given object ID
		fLayerCounty.queryFeatures(query, function(featureSet) {
		});*/
		
		fLayerCounty.setDefinitionExpression("CODE like '"+(lastProvinceCode+"").substr(0, 2)+"%'");
//		fLayerCounty.setDefinitionExpression("CNTY_CODE = 120100");
//		fLayerCounty.setDefinitionExpression("NAME like '%北京%'");
		
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		fLayerCounty.setRenderer(renderer);
 		
		map.addLayer(fLayerCounty);
		fLayerCounty.on("update-end",function(){
			var json = {industryPar:industryPar,regionCode:lastProvinceCode};
			ajaxPost('/seimp/warn/overproof_Shi.do',json).done(function(data){
				if(data.status==0){//请求成功
					if(data.data.length>0){
						addChartProvince(data.data,gLayerCounty,fLayerCounty,eObjCounty,iObjCounty);
					}
				}
			});
		});
		fLayerCounty.on("mouse-over",function(evt){
			 removeGraphic("countyHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"countyHigh"});
			 map.graphics.add(highGraphic);
		})
		fLayerCounty.on("mouse-out",function(){
			//恢复上次
//			map.graphics.clear();
			removeGraphic("countyHigh");
		})
		
	});
}

//更新表格
function updateTable(data){
	var headHtml = "<td>序号</td><td>地区</td><td>总污染计数</td><td>轻微污染数</td><td>轻度污染数</td><td>中度污染数</td><td>重度污染数</td>";
	var bodyHtml = "";
	if(data.length>0){
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			if(currItem.provinceName==null){
				currItem.provinceName="";
			}
			bodyHtml+="<tr areaCode='"+data[i].CODE+"'><td>"+(i+1)+"</td><td>"+currItem.provinceName+"</td><td>"+currItem.totalCount+"</td><td dataType='1'><a href='#'>"+currItem.SLIGHT+"</a></td><td dataType='2'><a href='#'>"+currItem.LIGHT+"</a></td><td dataType='3'><a href='#'>"+currItem.MIDDLE+"</a></td><td dataType='4'><a href='#'>"+currItem.SERVERE+"</a></td></tr>"
			
		}
	}
	$("#tongjibiao thead tr").html(headHtml);
	$("#tongjibiao tbody").html(bodyHtml);
	$("#tongjibiao tr td").click(function(evt){
		$("#detailTable").css("top",evt.screenY-160);
		var areaCode = $(this).parent().attr("areaCode");
		var dataType = $(this).attr("dataType");
		if(dataType){
			var json = {regionCode:areaCode,type:dataType};
			ajaxPost('/seimp/warn/overproof_Detail.do',json).done(function(data){
				if(data.status==0){//请求成功
					if(data.data.length>0){
						data = data.data;
						var headHtml = "<tr><td>序号</td><td>Cr</td><td>Pb</td><td>Cd</td><td>Hg</td><td>As</td><td>Cu</td><td>Zn</td><td>Ni</td></tr>";
						var bodyHtml = "";
							for (var i = 0; i < data.length; i++) {
								var currItem = data[i];
								bodyHtml+="<tr><td>"+(i+1)+"</td><td>"+currItem.CR+"</td><td>"+currItem.PB+"</td><td>"+currItem.CD+"</td><td>"+currItem.HG+"</td><td>"+currItem.SUMAS+"</td><td>"+currItem.CU+"</td><td>"+currItem.ZN+"</td><td>"+currItem.NI+"</td></tr>"
							}
						$("#detailTable thead").html(headHtml);
						$("#detailTable tbody").html(bodyHtml);
						$("#detailTable").show();
						
					}else{
						var headHtml = "<tr><td>序号</td><td>Cr</td><td>Pb</td><td>Cd</td><td>Hg</td><td>As</td><td>Cu</td><td>Zn</td><td>Ni</td></tr>";
						$("#detailTable thead").html(headHtml);
						$("#detailTable tbody").html("");
						$("#detailTable").show();
					}
				}
			});
		}
	})
}


/********地图相关方法*******/
//销毁图层
function destroyLayer(echartsObj,infoWindowObj,graphicsLayer,featrueLayer){
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
//		graphicsLayer.setVisibility(false);
		map.removeLayer(graphicsLayer);
	}
	//隐藏底图图层
	if(featrueLayer!=null){
//		fLayerCounty.setVisibility(false);
		map.removeLayer(featrueLayer);
	}
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
	if(graphicsLayer!=null){
		graphicsLayer.setVisibility(false);
	}
	//隐藏底图图层
	if(fLayerCounty!=null){
		fLayerCounty.setVisibility(false);
	}
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
	if(graphicsLayer!=null){
		graphicsLayer.setVisibility(true);
	}
	//显示底图图层
	if(fLayerCounty!=null){
		fLayerCounty.setVisibility(true);
	}
}

//清楚graphics中的某一个graphic
function removeGraphic(value){
	var graphics = map.graphics.graphics;
	for (var i = 0; i < graphics.length; i++) {
		if(graphics[i].attributes&&graphics[i].attributes.type&&graphics[i].attributes.type==value){
			map.graphics.remove(graphics[i]);
		}
	}
}

/*******页面点击方法*******/
//右上角全国按钮点击方法
$(function(){
	$("#country").click(function(){
		updateProvinceLayer();
		map.centerAndZoom([108,34],4);
	})
})

/*******页面控制方法****/
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

