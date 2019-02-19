// 地图切换选项卡
//地图模式
$('.map-area').click(function(){
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
//    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
//    $(".floattool").show();
    
});
$('.turang').click(function(){
	$('.turang img').attr('src','../../img/tr.png')
	$('.shui img').attr('src','../../img/shuiB.png')
	$('.daqi img').attr('src','../../img/qiB.png')
})
$('.shui').click(function(){
    $('.turang img').attr('src','../../img/trB.png')
    $('.shui img').attr('src','../../img/shui.png')
    $('.daqi img').attr('src','../../img/qiB.png')
})
$('.daqi').click(function(){
    $('.turang img').attr('src','../../img/trB.png')
    $('.shui img').attr('src','../../img/shuiB.png')
    $('.daqi img').attr('src','../../img/qi.png')
})
//清单模式
$('.table-area').click(function(){
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
//    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
//    $(".floattool").hide();
//    $(".main_table").hide();
//    $(".main_graphic").hide();
//    $(".time-axis-box").hide();
    
})
var y=0;
$('.mapButton').click(function(){
    $(this).attr('src','../../img/infor/11.1.png')
    $('.tableButton').attr('src','../../img/infor/12.2.png')
    $('.echartButton').attr('src','../../img/infor/13.2.png')
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
    $(".floattool").show();
    y=0;
});
$('.tableButton').click(function(){
    $('.mapButton').attr('src','../../img/infor/11.2.png')
    $(this).attr('src','../../img/infor/12.1.png')
    $('.echartButton').attr('src','../../img/infor/13.2.png')
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $(".floattool").hide();
    $(".main_table").hide();
    $(".main_graphic").hide();
    $(".time-axis-box").hide();
    y=0;
});

$('.echartButton').click(function(){
    $(this).attr('src','../../img/infor/13.1.png');
	$('.tableButton').attr('src','../../img/infor/12.2.png');
	$('.mapButton').attr('src','../../img/infor/11.2.png');
	$('.map-contain').removeClass('active').addClass('none');
	$('.table-contain').removeClass('active').addClass('none');
	$(".graphs").css('display','block');
	if(xiangmuType=="1"){
		
	}else if(xiangmuType=="2"){
		zxjcs();	
	}else if(xiangmuType=="3"){
			
	}
	 y=1;

});


// 统一下拉框选中
$('ul.dropdown-menu li a').click(function(){
    $(this).parent().parent().siblings().text($(this).text());
})

/********************变量***************/
var map;
var isHaveData={//是否有统计图、统计表、时间轴数据
		tongjibiao:1,
		tongjitu:0,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=0;
//条件查询参数
var searchParams = {//清单模式查询条件
		province:"",
		city:"",
		county:"",
		industry:"",
		keyword:""
}
//悬浮窗查询参数
var qiyeName = "";//企业名称
var jiancexiangmu="";//监测项目名称

var qiYeIndustryArr=[{id:"09",name:"有色金属矿采选"},{id:"33",name:"有色金属冶炼"},{id:"07",name:"石油开采"},
                     {id:"40",name:"通信设备制造业"},{id:"22",name:"造纸及纸制品业"},{id:"34",name:"金属制品业"},{id:"17",name:"纺织业"},{id:"19",name:"制革"}];
var allQiYeIndustryArr=[{id:"09",name:"有色金属矿采选"},{id:"33",name:"有色金属冶炼"},{id:"07",name:"石油开采"},
                        {id:"40",name:"通信设备制造业"},{id:"22",name:"造纸及纸制品业"},{id:"34",name:"金属制品业"},{id:"17",name:"纺织业"},{id:"19",name:"制革"},
                        {id:"25",name:"石油加工"},{id:"26",name:"化工"},
						{id:"27",name:"医药制造"},{id:"44",name:"铅酸蓄电池制造"},{id:"-3",name:"废旧电子拆解"},
						{id:"-4",name:"危险废物处理处置"},{id:"-5",name:"危险化学品生产、存储、使用"},{id:"13",name:"农副食品加工业"},{id:"15",name:"饮料制造业"},{id:"14",name:"食品制造业"}];

/*//默认显示的行业类别
var industryArr=[{id:"09",name:"有色金属矿采选"},{id:"33",name:"有色金属冶炼"},{id:"07",name:"石油开采"},{id:"25",name:"石油加工"},{id:"26",name:"化工"},{id:"44",name:"电镀"},{id:"19",name:"制革"}];
//行业类别
var industryNameArr={"04":"渔业","06":"煤炭开采","07":"石油开采","08":"黑色金属矿采选","09":"有色金属矿采选","13":"农副食品加工","14":"食品制造","15":"饮料制造","16":"烟草制品",
		"17":"纺织业","18":"服装制造","19":"制革","20":"木材加工","22":"造纸","23":"印刷","25":"石油加工","26":"化工","27":"医药制造","28":"化学制造","29":"橡胶制品",
		"30":"塑料制品","31":"非金属矿物制品","32":"黑色金属冶炼","33":"有色金属冶炼","34":"金属制品","35":"通用设备制造","36":"专用设备制造","37":"交通运输设备制造",
		"39":"电气机械制造","40":"通信设备制造","41":"仪器仪表制造","42":"工艺品制造","44":"电力供应","45":"燃气供应","46":"水供应","51":"铁路运输","80":"环境管理","85":"卫生"};
*/var graphicsLayer;//企业图层
var tongjituEcharts = null;//echarts对象
var xiangmuType = "2";//项目类型 1：土壤 2：水 3:气
var mapType = "1";//地图：1：全国模式 2：某一省的所有市模式 3：某一个市的所有点位模式

var graphicsLayer = null;
var provinceClick = null;//省界高亮
var provinceExtent = null;//省界边界
var provinceCode = null;//省code
var cityClick = null;//县界高亮
var cityExtent = null;//县界边界
var cityCode = null;//县code
var mapIndustry = "";//地图模式行业类别
//图例
var countryMinCount = null;
var countryCount = null;
var provinceMinCount = null;
var provinceCount = null;

$(function(){
	//加载动画开始
	zmblockUI('#map', 'start');
	
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "extras/DEBubblePopup",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			DEBubblePopup,
			InfoWindowLite,domConstruct
	){
		extent = new Extent(extentPar);
		var infoWindow = new  DEBubblePopup();
		//初始化地图
		map = new Map("map",{
			logo:false,
			minZoom:2,
//			center:[108,34],
//			zoom:3,
			extent:extent,
			showLabels:true,
			infoWindow:infoWindow
		})
		
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
//        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
//		addGewang();
		
		//更新地图
		initLayerByUser();
		//更新表格
		updateTable();
		
		//项目类型选择事件。遥感核查、地方自报
		$(".xiangmuType").click(function(){
			//选中样式
			$(this).addClass('map-table-color').siblings().removeClass('map-table-color');
			//记录项目类型
			xiangmuType = $(this).attr("value");
			
			searchParams = {//清单模式查询条件
					province:"",
					city:"",
					county:"",
					industry:"",
					keyword:""
			}
			$(".province").val('');
			$(".city").val('');
			$(".county").val('');
			$(".industry").val('');
			$(".keyword input").val('');
			$("#xiangmuType button").removeClass("active");
			
			
			/********yaoganhecha.js、difangzibao.js********/
			graphicsLayer = null;
			provinceClick = null;//省界高亮
			provinceExtent = null;//省界边界
			provinceCode = null;//省code
			cityClick = null;//县界高亮
			cityExtent = null;//县界边界
			cityCode = null;//县code
			mapIndustry = "";//地图模式行业类别
			mapType="1";
			
			//图例
			countryMinCount = null;
			countryCount = null;
			provinceMinCount = null;
			provinceCount = null;
			
			//remove图层
			if(map.getLayer("countryFeatureLayer")!=null){
				map.removeLayer(map.getLayer("countryFeatureLayer"));
			}
			if(map.getLayer("countryGraphicsLayer")!=null){
				map.removeLayer(map.getLayer("countryGraphicsLayer"));
			}
			if(map.getLayer("provinceFeatureLayer")!=null){
				map.removeLayer(map.getLayer("provinceFeatureLayer"));
			}
			if(map.getLayer("provinceGraphicsLayer")!=null){
				map.removeLayer(map.getLayer("provinceGraphicsLayer"));
			}
			if(map.getLayer("qiye")!=null){
				map.removeLayer(map.getLayer("qiye"));
			}
			//隐藏右上角按钮
			$("#province").addClass("none");
			$("#city").addClass("none");
			//更新地图
			initLayerByUser();
			createModal();
			
			
			if(y==1){
				if(xiangmuType=="1"){
					
				}else if(xiangmuType=="2"){
					zxjcs();
				}else if(xiangmuType=="3"){
				
				}	
				
			}
		})
		
//		//更新地图
//		updateMap();
//		
		
	});//--require end
})


//判断是国家级用户，还是省级用户，默认显示图层不同
function initLayerByUser(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "extras/DEBubblePopup",
	         "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			DEBubblePopup,
			QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
			InfoWindowLite,domConstruct
	){
		//判断用户是否是省级用户
		var storage = window.sessionStorage;
		//管理员、国家级用户
		if(storage.getItem("userLevel")==null || storage.getItem("userLevel")=="0" || storage.getItem("userLevel")=="1"){
			//更新全国模式
			if(xiangmuType=="1"){
				updateCountry_1(true);
			}else if(xiangmuType=="2"){
				updateCountry_2(true);
			}else if(xiangmuType=="3"){
				updateCountry_3(true);
			}
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
			    	 provinceExtent = graphic.geometry.getExtent();
			    	 map.setExtent(provinceExtent);
			    	 //当前省的高亮
			    	 var lineJson = {
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
					 $("#city").addClass("none");
				}
		    }
			if(xiangmuType=="1"){
				updateProvince_1(true);
			}else if(xiangmuType=="2"){
				updateProvince_2(true);
			}
			
		}
	})
}

//更新地图
function updateMap(){
	if(graphicsLayer!=null){
		map.removeLayer(graphicsLayer);
	}
	require(["esri/layers/GraphicsLayer","esri/InfoTemplate",
	         "esri/graphic","esri/geometry/Point",
	         "esri/symbols/PictureMarkerSymbol","esri/symbols/TextSymbol",
	         "esri/symbols/Font","esri/Color"
	],function(GraphicsLayer,InfoTemplate,
			Graphic,Point,PictureMarkerSymbol,TextSymbol,
			Font,Color
	){
		var json = {province:searchParams.province,city:searchParams.city,county:searchParams.county,industry:searchParams.industry,keyword:searchParams.keyword};
		ajaxPost("/seimp/pic/EnterpriseMonitor.do", json).done(function(result){
			if(result.status==0&&result.data.length>0){
				var data = result.data;
				
				
				var template = new InfoTemplate();
				template.setTitle("企业信息")
				template.setContent(getContent);
				graphicsLayer = new GraphicsLayer({"id":"qiye",infoTemplate:template});
				map.addLayer(graphicsLayer);
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					//判断坐标经纬度范围
					if(itemData.LONGTITUDE_INDEX&&itemData.LATITUDE_INDEX){
						//判断经纬度是否在中国范围内
						if(73.66<itemData.LONGTITUDE_INDEX && itemData.LONGTITUDE_INDEX<135.05 && 3.86<itemData.LATITUDE_INDEX && itemData.LATITUDE_INDEX<53.55){
							//获取
							var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/information/jiance.png',15,24);
							var attriubtes = {
									enterpriseName: itemData.PARTICULARNAME,		
									province: itemData.PROVINCE,	
									city: itemData.MUNICIPAL,
				        			industry: itemData.ONE_BUSINESSNAME,				
				        			address: itemData.ENTERPRISE_SITE,
				                    longitude: itemData.longitude,
				                    latitude: itemData.latitude,
							}
							var point = new Point(itemData.LONGTITUDE_INDEX,itemData.LATITUDE_INDEX);
							var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
							graphicsLayer.add(graphic);
						}
					}
				}
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<p>企业名称:<code>' + attributes.enterpriseName + '</code></p>'+
					'<p>所属省份:<code>' + attributes.province + '</code></p>'+
					'<p>所属城市:<code>' + attributes.city + '</code></p>'+
					'<p>行业名称:<code>' + attributes.industry + '</code></p>'
					'<p>详细地址:<code>' + attributes.ENTERPRISE_SITE + '</code></p>'
				}

				//鼠标移上去，显示企业名称
				graphicsLayer.on("mouse-over",function(evt){
					map.graphics.clear();
					var offsetX = evt.graphic.attributes.enterpriseName.length*13.3/2;
					var font = new Font().setSize("12pt");
					var symbol = new TextSymbol(evt.graphic.attributes.enterpriseName,font)
									.setOffset(offsetX,20).setHaloColor(new Color([255, 255, 255])).setHaloSize(3);
					var graphic = new Graphic(evt.mapPoint,symbol);
					map.graphics.add(graphic);
				})
				
				//点击，更新数据表
				graphicsLayer.on("click",function(evt){
					//记录企业名称
					qiyeName = evt.graphic.attributes.enterpriseName;
					isSelect=1;
					updateDropDownList();
				})
				
				
			}
		});//ajax end
	});//require end
	
}



//更新表格
function updateTable(){
	var columns =[{  
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
		},{
	        field : 'PARTICULARNAME',
	        title : '企业名称',
	        align : 'center'
		},{
			field : 'ONE_BUSINESSNAME',
			title : '行业名称',
			align : 'center',
		},{
	        field : 'PROVINCE',
	        title : '省份',
	        align : 'center'
		},{
	        field : 'MUNICIPAL',
	        title : '市',
	        align : 'center'
		},{
	        field : 'countyName',
	        title : '县',
	        align : 'center'
		},{
			field : 'RECEIVING_WATERNAME',
			title : '受纳水体名称',
			align : 'center',
		},{
			field : 'THE_DIRECTION',
			title : '排水去向',
			align : 'center',
		}];
	//销毁表格
	$('#table_template').bootstrapTable('destroy');
	//生成表格
	$('#table_template').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/pic/EnterpriseMonitorPaging.do",
	    columns : columns,
	    //search:true,
	    classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
	    queryParams: function queryParams(params) {   //设置查询参数  
            var param = {    
                pageNumber: params.offset,    
                pageSize: params.limit,
                province:searchParams.province,
                city:searchParams.city,
                county:searchParams.county,
                industry:searchParams.industry,
                keyword:searchParams.keyword
            };    
            return param;                   
          }, 
	    queryParamsType : "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
	    silent : true, 						// 刷新事件必须设置
	    contentType : "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
	    onClickRow : function(row, $element) {
	      $('.success').removeClass('success');
	      $($element).addClass('success');
	    },
	    icons : {
	      refresh : "glyphicon-repeat",
	      toggle : "glyphicon-list-alt",
	      columns : "glyphicon-list"
	    }
	});
	
}

//********更新悬浮窗数据************//
//跟新下拉框数据
function updateDropDownList(){
	var json = {name:qiyeName}
	ajaxPost("/seimp/pic/getMonitorProject.do", json).done(function(result){
		if(result.status==0&&result.data.length>0){
//			var data = ["PH值","总锌"];
			var data = result.data;
			var html = "";
			for (var i = 0; i < data.length; i++) {
				var currItem = data[i];
				html += "<option value='"+currItem+"'>"+currItem+"</option>";
			}
			$("#tongjibiaoSelect").html(html);
			//给下拉框设置值
			$("#tongjibiaoSelect").on("change",function(){
				selectChange();
			});
			//第一次手动调用下拉框选中事件
			selectChange();
		}	
	})
}

//下拉框选中事件
function selectChange(){
	jiancexiangmu = $("#tongjibiaoSelect").val();
	var json = {name:qiyeName,itemName:jiancexiangmu}
	ajaxPost("/seimp/pic/getMonitorProjectDetail.do", json).done(function(result){
		if(result.status==0&&result.data.length>0){
			var data = result.data;
			//处理时间
			for (var i = 0; i < data.length; i++) {
				data[i].time = data[i].YEAR+"-"+data[i].QUARTER;
			}
			updateMapTable(data);
			updateMapEcharts(data);
		}	
	})
}

//更新悬浮窗表格
function updateMapTable(data){
	$(".main_table .tabtop_left").html(qiyeName+"监测数据");
	var headHtml = "<td>序号</td><td>监测项目</td><td>污染物浓度</td><td>监测时间</td>";
	var bodyHtml = "";
	if(data.length>0){
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			bodyHtml+="<tr><td>"+(i+1)+"</td><td>"+currItem.MONITOR_ITEM_NAME+"</td><td>"+(currItem.POLLUTANT_CONCENTRATION!=null?currItem.POLLUTANT_CONCENTRATION:"")+"</td><td>"+currItem.time+"</td></tr>"
		}
	}
	$("#tongjibiao thead tr").html(headHtml);
	$("#tongjibiao tbody").html(bodyHtml);
}

//更新悬浮窗统计图
function updateMapEcharts(data){
	$(".main_graphic .tabtop_left").html(qiyeName+jiancexiangmu+"监测数据");
	var xData = []; 
	var yData = [];
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		xData.push(currItem.time);
		yData.push(currItem.POLLUTANT_CONCENTRATION);
	}
	
	if(tongjituEcharts){
		tongjituEcharts.dispose();
		tongjituEcharts = null;
	}
	tongjituEcharts = echarts.init(document.getElementById('tongjitu'));
	var option = {
		    title: {
		        text: '污染物浓度'
		    },
		    tooltip: {
		        trigger: 'axis'
		    },
		    legend: {
		       
		    },
		    xAxis:  {
		        type: 'category',
		        boundaryGap: false,
		        data:xData
		    },
		    yAxis: {
		        type: 'value',
		        axisLabel: {
		            formatter: '{value}'
		        }
		    },
		    series: [
		        {
		            name:'污染物浓度',
		            type:'line',
		            data:yData
		        }
		    ]
		};
	tongjituEcharts.setOption(option);
}

//回显地图模式的行业类型数据
function huiXianMapIndustry(){
	$.each($(".map-item li"),function(i,obj){
		$(obj).removeClass("metal");
	});
	$(".map-item li[value='"+searchParams.industry+"']").addClass("metal");
}

/*************悬浮窗******************/
$(function(){
	/**********右上角按钮****/
	$("#country").click(function(){
		//点击全国按钮的时候，隐藏省、市
		$("#province").addClass("none");
		$("#city").addClass("none");
		if(xiangmuType=="1"){
			updateCountry_1(true);
		}else if(xiangmuType=="2"){
			updateCountry_2(true);
		}
		
	})
	$("#province").click(function(){
		//点击省份按钮的时候，隐藏市
		$("#city").addClass("none");
		if(xiangmuType=="1"){
			updateProvince_1(false);
		}else if(xiangmuType=="2"){
			updateProvince_2(false);
		}
	})
	$("#city").click(function(){
		if(xiangmuType=="1"){
			updateCity_1(false);
		}else if(xiangmuType=="2"){
			updateCity_2(false);
		}
	})
	
	//条件查询点击事件
	$(".keyword button").click(function(){
		searchParams.industry = $(".industry").val();
		searchParams.keyword = $(".keyword input").val();
		//更新地图
		updateMap();
		//更新表格
		updateTable();
		//回显地图模式的行业类型数据
		huiXianMapIndustry();
	})
	/*******************行业分类定制***************/
	/*//生成下方的行业类别选择类表
	createInsutryClick();
	//填充行业定制弹出框中的内容
	var json = {};
	ajaxPost("/seimp/pic/getMonitorIndustries.do", json).done(function(result){
		if(result.status==0){//请求成功
			var data = result.data;
			var html = "";//模态框中行业类型
			var lihtml = "";//清单模式中行业选择下拉框
			lihtml += "<li><a value=''>请选择产业类型</a></li>";
			for (var i = 0; i < data.length; i++) {
				var currItem = data[i];
				if(i%3==0){
					if(i==0){
						html+="<div class='row' style='margin-bottom:10px;'>";
					}else if(i==data.length-1){
						html+="</div>";
					}else{
						html+="</div><div class='row' style='margin-bottom:10px;'>";
					}
				}
				//获取行业名称
				var industryName = currItem.ONE_BUSINESSNAME;
				if(industryNameArr[currItem.ONE_BUSINESSCODE]!=null){
					industryName = industryNameArr[currItem.ONE_BUSINESSCODE];
				}
				html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem.ONE_BUSINESSCODE+"'  name='industry' industryname='"+industryName+"'>"+industryName+"</label></div>";
				lihtml += "<li><a value='"+currItem.ONE_BUSINESSCODE+"'>"+industryName+"</a></li>";
			}
			$(".modal-body").html(html);
			$(".chayeleixing ul.dropdown-menu").html(lihtml);
			$(".chayeleixing ul.dropdown-menu li a").click(function(){
				$(this).parent().parent().siblings().text($(this).text());//下拉框选中事件
				searchParams.industry=$(this).attr("value");//记录选中的行业类型
			});
		}
	});*/
	
	//生成地图下方的行业选择按钮
	createInsutryClick();
	//生成行业定制框中的内容
	var html = "";//模态框中行业类型
	var lihtml = "";
	lihtml += "<option value=''>请选择行业类型</li>";
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
		lihtml += "<option value='"+currItem.id+"'>"+currItem.name+"</option>";
	}
	$(".modal-body").html(html);
	$(".industry").html(lihtml);
	
	
	/*************省市联动****************/
	//省市联动
	//加载省
	var json = {regionCode:"0"};
	ajaxPost("/seimp/pic/getRegion.do", json).done(function(result){
		if(result.status==0&&result.data.length>0){
				var html = "";
				html += "<option value=''>请选择省、自治区</option>";
				for (var i = 0; i < result.data.length; i++) {
					var province = result.data[i];
					html += "<option value='"+province.code+"'>"+province.name+"</option>";
				}
				$(".province").html(html);
				//点击省，获取当前省下的所有市
				$('.province').change(function(){
				    var value = $(".province").val();
				    if(value==""){//不选择任何省
				    	$(".city").html("<option value=''>请选择市、自治州</option>");
				    	$(".county").html("<option value=''>请选择区、县</option>");
				    	//搜索条件
				    	searchParams.province="";
				    	searchParams.city="";
				    	searchParams.county="";
				    	return;
				    }
				    //搜索条件
				    searchParams.province=value;
				    searchParams.city="";
			    	searchParams.county="";
					var json = {regionCode:value};
					ajaxPost("/seimp/pic/getRegion.do", json).done(function(result){
						if(result.status==0&&result.data.length>0){
							var html = "";
							html += "<option value=''>请选择市、自治州</option>";
							for (var i = 0; i < result.data.length; i++) {
								var city = result.data[i];
								html += "<option value='"+city.code+"'>"+city.name+"</option>";
							}
							$(".city").html(html);
							
							//点击市，获取市下的所有县
							$('.city').change(function(){
								var value = $(".city").val();
							    if(value==""){//不选择任何市
							    	$(".county").html("<option value=''>请选择区、县</option>");
							    	//搜索条件
							    	searchParams.city="";
							    	searchParams.county="";
							    	return;
							    }
							    //搜索条件
						    	searchParams.city=value;
						    	searchParams.county="";
								var json = {regionCode:value};
								ajaxPost("/seimp/pic/getRegion.do", json).done(function(result){
									if(result.status==0&&result.data.length>0){
										var html = "";
										html += "<option value=''>请选择区、县</option>";
										for (var i = 0; i < result.data.length; i++) {
											var city = result.data[i];
											html += "<option value='"+city.code+"'>"+city.name+"</option>";
										}
										$(".county").html(html);
										//点击县
										$('.county').change(function(){
											var value = $(".county").val();
											 //搜索条件
											 searchParams.county=value;
										});
									}
							    })// county ajax end
							});// city click end
						}
				    });// city ajax end 
				});//-- province click end
			}
	})//-- province ajax end
	
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
			$("#div_4").show();
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
			$("#div_4").hide();
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
				$("#div_3").hide();
			}else{
				addGewang();
				$("#div_3").show();
			}
		}else if(mapName=="中文注记"){
			//判断是矢量地图还是影像地图
			//判断矢量地图是否存在
			if(map.getLayer("vectorLayer")){
				//矢量地图
				//判断中文注记的状态
				if(map.getLayer("vectorNoteLayer").visible){
					map.getLayer("vectorNoteLayer").setVisibility(false);
					$("#div_8").hide();
				}else{
					map.getLayer("vectorNoteLayer").setVisibility(true);
					$("#div_8").show();
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
				$("#div_5").hide();
				map.removeLayer(map.getLayer("gaosuLayer"));
				map.removeLayer(map.getLayer("shengdaoLayer"));
			}else{
				addRoad();
				$("#div_5").show();
			}
		}else if(mapName=="加油站点"){
			if(map.getLayer("gasLayer")){
				map.removeLayer(map.getLayer("gasLayer"));
				$("#div_7").hide();
			}else{
				addGas();
				$("#div_7").show();
			}
		}else if(mapName=="河流"){
			if(map.getLayer("riverLayer")){
				map.removeLayer(map.getLayer("riverLayer"));
				$("#div_6").hide();
			}else{
				addRiver();
				$("#div_6").show();
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

/**********行业定制********/
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
				id:$(obj).val(),
				name:$(obj).attr("industry")
		}
		qiYeIndustryArr.push(liSelectedData);
	})
	
	createInsutryClick();
	$("#myModal").modal('hide');
}

//生成地图下方的行业筛选列表
function createInsutryClick(){
	//重新更新下方的企业类别选择条
	var html ="<li class='lt metal' value='' onclick=switchIndustry('',$(this))>全部</li>";
	if(qiYeIndustryArr.length>0){
		for (var i = 0; i < qiYeIndustryArr.length; i++) {
			var currObj = qiYeIndustryArr[i];
			html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
		}
	}
	html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
	$("#mapItem").html(html);
	$(".map-item").css("margin-left","-"+$(".map-item").width()/2+"px");
}


//行业选择
function switchIndustry(switchIndustry,obj){
	//记录选择的行业
	mapIndustry=switchIndustry;
	$(obj).siblings().removeClass("metal");
	$(obj).addClass("metal");
	
	if(mapType=="1"){//全国模式
		updateCountry_2(true);
	}else if(mapType=="2"){//某一个省的所有市模式
		updateProvince_2(true);
	}else if(mapType=="3"){//某一个市的所有点位模式
		updateCity_2(true);
	}
	
	//将选择的行业参数回显到清单模式
//	$(".industry").val(searchParams.industry);
	//更新地图
//	updateMap();
	//更新表格
//	updateTable();
}

/************地图相关方法****************/
//生成图例
function updateLegend(minCount,count){
	$("#ditu li:eq(0) div:eq(1)").html(minCount+"-"+parseInt(minCount+count*1));
	$("#ditu li:eq(1) div:eq(1)").html(parseInt(minCount+count*1)+"-"+parseInt(minCount+count*2));
	$("#ditu li:eq(2) div:eq(1)").html(parseInt(minCount+count*2)+"-"+parseInt(minCount+count*3));
	$("#ditu li:eq(3) div:eq(1)").html(parseInt(minCount+count*3)+"-"+parseInt(minCount+count*4));
	$("#ditu li:eq(4) div:eq(1)").html(parseInt(minCount+count*4)+"-"+parseInt(minCount+count*5));
	$("#ditu li:eq(5) div:eq(1)").html(parseInt(minCount+count*5)+"-"+parseInt(minCount+count*6));
	
}

//清除type属性值为value的graphic
function removeGraphic(value){
	var graphics = map.graphics.graphics;
	for (var i = 0; i < graphics.length; i++) {
		if(graphics[i].attributes&&graphics[i].attributes.type&&graphics[i].attributes.type==value){
			map.graphics.remove(graphics[i]);
		}
	}
}

/***********页面控制相关方法****************/
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


//弹出框中按钮，显示悬浮表格
function showMapTable(){
	$(".table_nav .icon").click();
}

//弹出框中按钮，显示悬浮统计图
function showMapEcharts(){
	$(".graphic_nav .icon").click();
}



//图表省下拉框数据
ajaxPost("/seimp/pic/getallRegion.do",{}).done(function(result){
	if(result.status==0&&result.data.length>0){
		res=result;
		for (var i = 0; i < result.data.length; i++) {
			var province = result.data[i];
			if(province.level==0){
			$(".province2").append("<option value='"+province.name+"'>"+province.name+"</option>");
			}
		}
	}
});


//图标下拉框数据，产业类型，大类，来源
ajaxPost("/seimp/pic/getZXJCALL.do",{}).done(function(result){
	var industrys=result.data;
		for (var i = 0; i < industrys.length; i++) {
			var ind = industrys[i];
			if(ind!=null){
				$(".hangye").append("<option value='"+ind.ONE_BUSINESSNAME+"'>"+ind.ONE_BUSINESSNAME+"</option>");
			}
			}	
		
});
var buttontypes=1; 
function buttontype(id){
	buttontypes=id;	
	if(buttontypes==1){
		$(".province2").val("");
		$(".hangye").val("");
		zxjcs();
	}else{
		$(".province2").val("");
		$(".hangye").val("");
		zxjcs();
	}
}
$(".province2").change(function(){zxjcs()});
$(".hangye").change(function(){zxjcs()});
var cit="";
var cit2="";
//自行监测水
function zxjcs(){
//	$(".citydiv").css("display","block");
//	$(".chanyeleixingdiv").css("display","block");
//	$(".prodiv").css("display","none");
//	$(".daleidiv").css("display","none");
//	$(".laiyuandiv").css("display","none");
	$("#graphs2").show();
	$("#graphs3").hide();
	$("#graphs").hide();
	var c=$(".province2").val();
	var l=$(".hangye").val();
	ajaxPost("/seimp/pic/getZXJCSTB.do", {city:c,hangye:l,type:buttontypes,city2:cit}).done(function (data) {
		var arr = new Array();
		var arr2 = new Array();
		var arrcode = new Array();
		var endleng;
		if (data.status == 0) {
            for (var i = 0; i < data.data.length; i++) {
            	var item = data.data[i];
            	if(buttontypes==1){
            		
            	if(c!=""){
            		if(cit2!=""){
            			if(item.name!=null&&item.name!=undefined&&item.name!=""){
            			arr.push(item.name);
            			arr2.push(item.count);
            			arrcode.push(item.code);
            			endleng=100;
            			}
            		}else{
            			if(item.MUNICIPAL!=null&&item.MUNICIPAL!=undefined&&item.MUNICIPAL!=""){
            		arr.push(item.MUNICIPAL);
            		arr2.push(item.count);
            		arrcode.push(item.code);
            		endleng=100;
            			}
            		}
            	}else{
            		if(item.PROVINCE!=null&&item.PROVINCE!=undefined&&item.PROVINCE!=""){
            		arr.push(item.PROVINCE);
            		arr2.push(item.count);
            		arrcode.push(item.code);
            		endleng=100;
            		}
            	}
            
            	}else{
            		if(item.ONE_BUSINESSNAME!=null){
            			arr.push(item.ONE_BUSINESSNAME);
            			arr2.push(item.count);
            			endleng=50;
            		}
            	}		
            	
            }
            cit2="";
           
	var myChart = echarts.init(document.getElementById('graphs2'));
	myChart.clear();
	option = {
		    title : {
		        text: '污染企业数量统计图',
////		        subtext: '纯属虚构'
		        left:'center'
		    },
		    tooltip : {
		        trigger: 'axis'
		    },
//		    legend: {
//		        data:['污染企业'],
//		        left:'left',
//		        top:'bottom',
//		    },
		    toolbox: {
		        show : true,
		        feature : {
		            mark : {show: true},
//		            dataView : {show: true, readOnly: false},
		            magicType : {show: true, type: ['line', 'bar']},
//		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    xAxis : [
		        {
		        	name:'(省/市)',
		            type : 'category',
		            data : arr,
		            axisLabel:{
		            	interval:0,
		            	rotate:-30
		            	
		            }
		        } 
		    ],
		    dataZoom : {
                show : true,
                realtime : true,
                start : 0,
                end : endleng,
            },
		    yAxis : [
		        {   
		        	name:'(个/企业)',
		            type : 'value'
		        }
		    ],
		    series : [
		        {
		            name:'污染企业数量',
		            type:'bar',
		            data:arr2,
		            barMaxWidth:100,
		            rawdate:arrcode
//		            barWidth:100,
//		            markPoint : {
//		                data : [
//		                    {type : 'max', name: '最大值'},
//		                    {type : 'min', name: '最小值'}
//		                ]
//		            }
		        },
//		        {
//		            name:'降水量',
//		            type:'bar',
//		            data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
////		        markPoint : {
////	                data : [
////	                    {type : 'max', name: '最大值'},
////	                    {type : 'min', name: '最小值'}
////	                ]
////	            }
//		        }
		    ]
		};
	myChart.off('click');
	myChart.on('click', function (params) {
		var name=params.name;
		
		 var cloudid;
         var mes = '【' + params.type + '】';
         if (typeof params.seriesIndex != 'undefined') {
             mes += '  seriesIndex : ' + params.seriesIndex;
             mes += '  dataIndex : ' + params.dataIndex;
             cloudid = option.series[params.seriesIndex].rawdate[params.dataIndex];
           
         }      

	           if(cloudid.substring(cloudid.length-4,cloudid.length)=="0000"){ 
	        	   $(".province2").val(name);
	        	   zxjcs();
	           }else if(cloudid.substring(cloudid.length-2,cloudid.length)=="00"&&cloudid.substring(cloudid.length-4,cloudid.length)!="0000"){
	        	   cit=name;
	        	   cit2=name;
	        	   zxjcs();
		        	   cit="";
		        	  
		           }

	          

	    // 控制台打印数据的名称
	});	
	 myChart.setOption(option);
        }
    });
}
$('.graphs input').click(function(){
    $('.graphs input').removeClass('btn-danger').addClass('btn-default')
    $(this).removeClass('btn-primary').addClass('btn-danger')
})