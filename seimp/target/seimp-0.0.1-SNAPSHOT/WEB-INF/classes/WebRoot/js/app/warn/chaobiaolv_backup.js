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

var eObjProvince = [];//分省echarts对象数组
var iObjProvince = [];//分省窗口对象数组

var provinceCode = "";
var provinceSName = "";
var provinceExtent = "";
var provinceHighGraphic = null;
var cityCode = "";
var citySName = "";
var cityExtent = "";
var cityHighGraphic = null;


var industryPar = "2";//2:有机物 1：无机物
var wuranType="totalCount";//选中的污染类型
var quyuType="0"//0全国 1某个省 2某个市


/********页面加载**********/
$(function(){
	//污染类型按钮
	$("#xiangmuDiv label").click(function(){
		//选中状态切换
		$("#xiangmuDiv button").removeClass("active");
        $(this).addClass('active')
		//记录上一次点击的值
		lastWuranType = wuranType;
		//记录本次点击的值
		wuranType = $(this).attr("value");
		if(quyuType==0){
			updateProvinceLayer();
		}else if(quyuType==1){
//			map.graphics.add(provinceHighGraphic);
			updateCountyLayer();
		}else if(quyuType==2){
//			map.graphics.add(cityHighGraphic);
			updateLastLayer();
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
	
	//加载动画开始
	zmblockUI('body', 'start');
	
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			InfoWindowLite,domConstruct
	){
//		var extent = new Extent(45.835559324485196,-0.4478110749668005,170.1644406755148,68.44781107496681, new SpatialReference({ wkid:4326 }));
		 extent = new Extent(extentPar);
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
		
		/*map.on("zoom-end",function(evt){
			if(evt.level==4){//全国范围
				updateProvinceLayer();
			}else if(evt.level==6){//某一个省范围
				if(lastProvinceCode!=null){
					updateCountyLayer(lastProvinceCode);
				}
			}
		})*/
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		//默认显示重金属、分省统计图
//		updateProvinceLayer();
		initLayerByUser();
		
		//隐藏统计图
		map.on("zoom-end",function(evt){
			if(quyuType==0){
				if(evt.level<=3){
					//隐藏统计图
					hideLayer(iObjProvince);
					//隐藏省名
				}else{
					//显示统计图
					showLayer(iObjProvince);
					//显示省名
				}
			}else if(quyuType==1){
				if(evt.level<=5){
					//隐藏统计图
					hideLayer(iObjProvince);
					//隐藏省名
				}else{
					//显示统计图
					showLayer(iObjProvince);
					//显示省名
				}
			}else if(quyuType==2){
				if(evt.level<=7){
					//隐藏统计图
					hideLayer(iObjProvince);
					//隐藏省名
				}else{
					//显示统计图
					showLayer(iObjProvince);
					//显示省名
				}
			}
		})
		
		
	});//--require end
	
})//--load end


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
			updateProvinceLayer();
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
					 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClickHigh"});
					 //记录边界高亮
					 provinceHighGraphic = highGraphic;
					 map.graphics.add(provinceHighGraphic);
					 //记录省名
					 provinceSName = graphic.attributes.NAME;
					 //改变右上角按钮Text
					 $("#province").html(graphic.attributes.NAME);
					 //显示右上角按钮
					 $("#province").removeClass("none");
					 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
					 $("#city").addClass("none");
				}
				//更新当前省的分市图层
				updateCountyLayer();
		    }
			
			
		}
	})
}


//更新分省饼图
function updateProvinceLayer(){
	//高亮graphic
	removeGraphic("provinceClickHigh");
	removeGraphic("cityClickHigh");
	removeGraphic("provinceHigh");
	removeGraphic("countyHigh");
	removeGraphic("lastHigh");
	//显示国界线图层
	showGuojie();
	//销毁统计图
	destroyEcharts();
	//地图模式
	quyuType = "0";
	//改变地图显示范围边界
	map.setExtent(extent);
	//分省底图
	if(map.getLayer("countryFeatureLayer")!=null){
		map.removeLayer(map.getLayer("countryFeatureLayer"));
	}
	//分省数字
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countryGraphicsLayer"));
	}
	//分市底图
	if(map.getLayer("countyFeatureLayer")!=null){
		map.removeLayer(map.getLayer("countyFeatureLayer"));
	}
	
	//分市数字
	if(map.getLayer("countyGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countyGraphicsLayer"));
	}
	//分县底图
	if(map.getLayer("lastFeatureLayer")!=null){
		map.removeLayer(map.getLayer("lastFeatureLayer"));
	}
	
	//分县数字
	if(map.getLayer("lastGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("lastGraphicsLayer"));
	}
	addProvinceLayer();
}

//更新分市饼图
function updateCountyLayer(currCityCode){
	//高亮graphic
	removeGraphic("provinceClickHigh");
	removeGraphic("cityClickHigh");
	removeGraphic("provinceHigh");
	removeGraphic("countyHigh");
	removeGraphic("lastHigh");
	
	//添加省部高亮
	map.graphics.add(provinceHighGraphic);
	//清除国界线图层
	hideGuoJie();
	//销毁统计图
	destroyEcharts();
	//地图模式
	quyuType = "1";
	//分省底图
	if(map.getLayer("countryFeatureLayer")!=null){
		map.removeLayer(map.getLayer("countryFeatureLayer"));
	}
	//分省数字
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countryGraphicsLayer"));
	}
	//分市底图
	if(map.getLayer("countyFeatureLayer")!=null){
		map.removeLayer(map.getLayer("countyFeatureLayer"));
	}
	//分市数字
	if(map.getLayer("countyGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countyGraphicsLayer"));
	}
	//分县底图
	if(map.getLayer("lastFeatureLayer")!=null){
		map.removeLayer(map.getLayer("lastFeatureLayer"));
	}
	
	//分县数字
	if(map.getLayer("lastGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("lastGraphicsLayer"));
	}
	addCountyLayer();
}

//更新分县底图
function updateLastLayer(){
	//高亮graphic
	removeGraphic("provinceClickHigh");
	removeGraphic("cityClickHigh");
	removeGraphic("provinceHigh");
	removeGraphic("countyHigh");
	removeGraphic("lastHigh");
	
	//添加省部高亮
	map.graphics.add(cityHighGraphic);
	//清除国界线图层
	hideGuoJie();
	//销毁统计图
	destroyEcharts();
	//地图模式
	quyuType = "2";
	//分省底图
	if(map.getLayer("countryFeatureLayer")!=null){
		map.removeLayer(map.getLayer("countryFeatureLayer"));
	}
	//分省数字
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countryGraphicsLayer"));
	}
	//分市底图
	if(map.getLayer("countyFeatureLayer")!=null){
		map.removeLayer(map.getLayer("countyFeatureLayer"));
	}
	//分市数字
	if(map.getLayer("countyGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countyGraphicsLayer"));
	}
	//分县底图
	if(map.getLayer("lastFeatureLayer")!=null){
		map.removeLayer(map.getLayer("lastFeatureLayer"));
	}
	
	//分县数字
	if(map.getLayer("lastGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("lastGraphicsLayer"));
	}
	addLastLayer();
}


//地图下方的有机物、无机物按钮。2：有机物，1：无机物
function switchIndustry(value){
	//记录选择的是有机物还是无机物
	industryPar = value;
	//切换选中状态
	$("#mapItem li").removeClass("metal");
	if(value=="1"){
		$("#mapItem li:eq(1)").addClass("metal");
	}else{
		$("#mapItem li:eq(0)").addClass("metal");
	}
	$(this).addClass("metal");
	//更新地图
	if(quyuType==0){
		updateProvinceLayer();
	}else if(quyuType==1){
		map.graphics.add(provinceHighGraphic);
		updateCountyLayer();
	}else if(quyuType==2){
//		map.graphics.add(cityHighGraphic);
		updateLastLayer();
	}
}

//加载分省
function addProvinceLayer(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol",
	         "esri/renderers/ClassBreaksRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	         "esri/symbols/TextSymbol","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,
			SimpleRenderer,
			SimpleFillSymbol, SimpleMarkerSymbol,
	        ClassBreaksRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color,
			TextSymbol,LabelClass
	){
		var fLayerProvince = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"countryFeatureLayer"
	     });
		
		//加载省名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
		 statesLabel.setOffset(10,10);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 fLayerProvince.setLabelingInfo([labelClass]);
		
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		fLayerProvince.setRenderer(renderer);
 		
 		
//		map.addLayer(fLayerProvince);
		
		fLayerProvince.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
			addGuojie();
		})
		
		
		fLayerProvince.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
		})
		fLayerProvince.on("mouse-out",function(){
			//恢复上次
//			map.graphics.clear();
			if(quyuType==0){
				removeGraphic("provinceHigh");
			}
		})
		
		fLayerProvince.on("click",function(evt){
			 //增加选择的省部边界
			 removeGraphic("provinceClickHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClickHigh"});
			 provinceHighGraphic = highGraphic;
			 map.graphics.add(highGraphic);
			 
			provinceCode = evt.graphic.attributes.PROV_CODE;
			provinceSName = evt.graphic.attributes.NAME;
			
			//updateCityLayer(evt.graphic);
			updateCountyLayer(evt.graphic);
			map.setExtent(evt.graphic.geometry.getExtent());
			provinceExtent = evt.graphic.geometry.getExtent();
//			map.graphics.clear();
			//按钮切换选中状态
			$("#quyuDiv button").removeClass("active");
			$("#quyuDiv button").css("background-color",'#286090');
			$("#quyuDiv button").css("color",'white');
			//显示右上角的省份按钮
			$("#province").text(evt.graphic.attributes.NAME);
			$("#province").removeClass("none");
			
			//隐藏县按钮
			$("#city").addClass("none");
			//区域类型变为1，某一个省的数据
			quyuType = 1;
		})
		
		
			//销毁图例
		
			//设置分段渲染
			//ajax获取各省产粮油大县的数量
			var json = {type:industryPar};
			ajaxPost('/seimp/warn/overproof_Pro.do',json).done(function(result){
				if(result.status==0){//请求成功
					if(result.data.length>0){
						var data = result.data;
						//模拟数据
						//处理数据，获取各省数量的最大值最小值
						var minCount = 0;
						var maxCount = 0;
						var maxTotalCount = 0;
						for(var i=0;i<data.length;i++){
							var graphics = fLayerProvince.graphics;
				            if(graphics&&graphics.length>0){
				           	   	for (var j = 0; j < graphics.length; j++) {
				           	   		var currGra = graphics[j];
				           	   		if(currGra.attributes.PROV_CODE==data[i].CODE){
				           	   			data[i].provinceName =  currGra.attributes.NAME;
				           	   		}
				           	   	}
				            }
				           data[i].totalCount = data[i].SLIGHT+data[i].LIGHT+data[i].MIDDLE+data[i].SERVERE;
				           /*if(i==0){
				        	   var minCount =  data[i][wuranType];
				        	   var maxCount =  data[i][wuranType];
				        	   var maxTotalCount = data[i].totalCount;
				           }*/
				           if(data[i][wuranType]<minCount){
				        	   minCount = data[i][wuranType];
				           }
				           if(data[i][wuranType]>maxCount){
				        	   maxCount = data[i][wuranType];
				           }
				           if(data[i].totalCount>maxTotalCount){
				        	   maxTotalCount = data[i].totalCount;
				           }
						}
						provinceTableData = data;
						updateTable(data);
						
						//重新计算最大值
						maxCount = maxmain(maxCount);
						
						var count = (maxCount - minCount)/6;
						//更新图例
						updateLegend(minCount,count);
						//记录图例参数
						countryMinCount = minCount;
						countryCount = count;
						
						//设置分省底图各个分段的symbol
				 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
				 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
				 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
				 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
				 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
				 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
				 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
				 		renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
						
						
						//更新图例
	//					updateLegend(minCount,count);
						
						for (var i = 0; i < data.length; i++) {
							var currItem = data[i];
							if(minCount<=currItem[wuranType]&&currItem[wuranType]<minCount+count*1){
								renderer.addValue(currItem.CODE, symbol1);
							}else if(minCount+count*1<=currItem[wuranType]&&currItem[wuranType]<minCount+count*2){
								renderer.addValue(currItem.CODE, symbol2);
							}else if(minCount+count*2<=currItem[wuranType]&&currItem[wuranType]<minCount+count*3){
								renderer.addValue(currItem.CODE, symbol3);
							}else if(minCount+count*3<=currItem[wuranType]&&currItem[wuranType]<minCount+count*4){
								renderer.addValue(currItem.CODE, symbol4);
							}else if(minCount+count*4<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*5){
								renderer.addValue(currItem.CODE, symbol5);
							}else if(minCount+count*5<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*6){
								renderer.addValue(currItem.CODE, symbol6);
							}
						}
						//为分省地图设置渲染
						fLayerProvince.setRenderer(renderer);
						//将分省地图添加到地图上
						map.addLayer(fLayerProvince,2);
						//分段渲染的底图加载完成之后，才能加载数字图层
						fLayerProvince.on("update-end",function(){
							//添加统计图
							
							//添加数字图层
							initCountryCount(data,maxTotalCount);
						})
						
						
					}else{//如果没有数据
						var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
						renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
						fLayerProvince.setRenderer(renderer);
						//更新图例
						updateLegend(0,0);
						map.addLayer(featureLayer,2);
						fLayerProvince.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
							initCountryCount(data,0);
						})
					}
	
				}
			});//--ajax end
		
		
	});
}

//加载各省数字图层
function initCountryCount(data,maxTotalCount){
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
		var feaGraphics = map.getLayer("countryFeatureLayer").graphics;
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
		if(wuranType=="totalCount"){
			//销毁图例
			updateProvinceEcharts(data,maxTotalCount);
			//处理图例
			$("#ditu1").removeClass("none");
			$("#ditu1").siblings("p:eq(0)").removeClass("none");
		}else{
			//处理图例
			$("#ditu1").addClass("none");
			$("#ditu1").siblings("p:eq(0)").addClass("none");
			//遍历省界图层的graphics
			for (var i = 0; i < feaGraphics.length; i++) {
				var currFeaGraphic = feaGraphics[i];
				//遍历数据
				for (var j = 0; j < data.length; j++) {
					var currItem = data[j];
					//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
					if(currFeaGraphic.attributes.PROV_CODE==currItem.CODE){
						var attributes = {
								provoinceCode:currItem.province,
								provinceName:currItem.name
						}
						var point = currFeaGraphic.geometry.getCentroid();
						//处理河北省
						if(currFeaGraphic.attributes.PROV_CODE=="130000"){
							point = new Point([115.18,38]);
						}
						var symbolSize = 24;
						if(currItem[wuranType].toString().length==1){
							symbolSize = 24;
						}else if(currItem[wuranType].toString().length==2){
							symbolSize = 30;
						}else if(currItem[wuranType].toString().length==3){
							symbolSize = 40;
						}else if(currItem[wuranType].toString().length==4){
							symbolSize = 50;
						}else if(currItem[wuranType].toString().length==5){
							symbolSize = 60;
						}else{
							symbolSize = currItem[wuranType].toString().length*12;
						}
						
						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
						var symbol2 = new TextSymbol(currItem[wuranType]).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
						symbol2.setText(currItem[wuranType]);
						symbol2.font.setFamily("Times");
						symbol2.font.setSize("10pt");
						symbol2.font.setWeight(600);
						var graphic1 = new Graphic(point,symbol1,attributes);
						var graphic2 = new Graphic(point,symbol2,attributes);
						graphicsLayer.add(graphic1);
						graphicsLayer.add(graphic2);
					}
				}
			}
		
		}
		map.addLayer(graphicsLayer);
		
	});//--require end
}


//加载分市
function addCountyLayer(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol",
	         "esri/renderers/ClassBreaksRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	         "esri/symbols/TextSymbol","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,
			SimpleRenderer,
			SimpleFillSymbol, SimpleMarkerSymbol,
	        ClassBreaksRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color,
			TextSymbol,LabelClass
	){
		var fLayerCounty = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"countyFeatureLayer"
	     });
		
		fLayerCounty.setDefinitionExpression("KIND_1 like '"+(provinceCode+"").substr(0, 2)+"%'");
		
		//加载县名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 fLayerCounty.setLabelingInfo([labelClass]);
		
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		fLayerCounty.setRenderer(renderer);
 		
		map.addLayer(fLayerCounty);
		
		fLayerCounty.on("mouse-over",function(evt){
			 removeGraphic("countyHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"countyHigh"});
			 map.graphics.add(highGraphic);
		})
		fLayerCounty.on("mouse-out",function(){
			//恢复上次
//			map.graphics.clear();
			removeGraphic("countyHigh");
		})
		
		fLayerCounty.on("click",function(evt){
			 //增加选择的省部边界
			 removeGraphic("cityClickHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"cityClickHigh"});
			 cityHighGraphic = highGraphic;
			 map.graphics.add(highGraphic);
			 
			cityCode = evt.graphic.attributes.KIND_1;
			citySName = evt.graphic.attributes.NAME;
			
			//updateCityLayer(evt.graphic);
			updateLastLayer(evt.graphic);
			map.setExtent(evt.graphic.geometry.getExtent());
			cityExtent = evt.graphic.geometry.getExtent();
//			map.graphics.clear();
			//按钮切换选中状态
			$("#quyuDiv button").removeClass("active");
			$("#quyuDiv button").css("background-color",'#286090');
			$("#quyuDiv button").css("color",'white');
			//显示右上角的市按钮
			$("#city").text(evt.graphic.attributes.NAME);
			$("#city").removeClass("none");
			
			//隐藏县按钮
//			$("#city").addClass("none");
			//区域类型变为2，某一个市的数据
			quyuType = 2;
		})
		
		fLayerCounty.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
		})
		
			//设置分段渲染
			var json = {type:industryPar,regionCode:provinceCode};
			ajaxPost('/seimp/warn/overproof_Shi.do',json).done(function(result){
				if(result.status==0){//请求成功
					if(result.data.length>0){
						var data = result.data;
						//模拟数据
						//处理数据，获取各省数量的最大值最小值
						var minCount = 0;
						var maxCount = 0;
						var maxTotalCount = 0;
						for(var i=0;i<data.length;i++){
							var graphics = fLayerCounty.graphics;
				            if(graphics&&graphics.length>0){
				           	   	for (var j = 0; j < graphics.length; j++) {
				           	   		var currGra = graphics[j];
				           	   		if(currGra.attributes.KIND_1==data[i].CODE){
				           	   			data[i].provinceName =  currGra.attributes.NAME;
				           	   		}
				           	   	}
				            }
				           data[i].totalCount = data[i].SLIGHT+data[i].LIGHT+data[i].MIDDLE+data[i].SERVERE;
				           /*if(i==0){
				        	   var minCount =  data[i][wuranType];
				        	   var maxCount =  data[i][wuranType];
				        	   var maxTotalCount = data[i].totalCount;
				           }*/
				           if(data[i][wuranType]<minCount){
				        	   minCount = data[i][wuranType];
				           }
				           if(data[i][wuranType]>maxCount){
				        	   maxCount = data[i][wuranType];
				           }
				           if(data[i].totalCount>maxTotalCount){
				        	   maxTotalCount = data[i].totalCount;
				           }
						}
						countyTableData = data;
						//更新表格数据
						updateTable(data);
						
						//重新计算最大值
						maxCount = maxmain(maxCount);
						
						var count = (maxCount - minCount)/6;
						//更新图例
						updateLegend(minCount,count);
						//记录图例参数
						countryMinCount = minCount;
						countryCount = count;
						
						//设置分省底图各个分段的symbol
				 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
				 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
				 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
				 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
				 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
				 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
				 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
				 		renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
						
						
						//更新图例
	//					updateLegend(minCount,count);
						
						for (var i = 0; i < data.length; i++) {
							var currItem = data[i];
							if(minCount<=currItem[wuranType]&&currItem[wuranType]<minCount+count*1){
								renderer.addValue(currItem.CODE.substr(0,4), symbol1);
							}else if(minCount+count*1<=currItem[wuranType]&&currItem[wuranType]<minCount+count*2){
								renderer.addValue(currItem.CODE.substr(0,4), symbol2);
							}else if(minCount+count*2<=currItem[wuranType]&&currItem[wuranType]<minCount+count*3){
								renderer.addValue(currItem.CODE.substr(0,4), symbol3);
							}else if(minCount+count*3<=currItem[wuranType]&&currItem[wuranType]<minCount+count*4){
								renderer.addValue(currItem.CODE.substr(0,4), symbol4);
							}else if(minCount+count*4<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*5){
								renderer.addValue(currItem.CODE.substr(0,4), symbol5);
							}else if(minCount+count*5<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*6){
								renderer.addValue(currItem.CODE.substr(0,4), symbol6);
							}
						}
						//为分省地图设置渲染
						fLayerCounty.setRenderer(renderer);
						//将分省地图添加到地图上
						map.addLayer(fLayerCounty,2);
						//分段渲染的底图加载完成之后，才能加载数字图层
						fLayerCounty.on("update-end",function(){
							//添加统计图
							
							//添加数字图层
							initCountyCount(data,maxTotalCount);
						})
						
						
					}else{//如果没有数据
						var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
						renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
						fLayerCounty.setRenderer(renderer);
						//更新图例
						updateLegend(0,0);
						map.addLayer(fLayerCounty,2);
						fLayerCounty.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
							initCountyCount(data,0);
						})
					}
	
				}
			});//--ajax end
		
	});
}

//加载各市数字图层
function initCountyCount(data,maxTotalCount){
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
		var graphicsLayer = new GraphicsLayer({id:"countyGraphicsLayer"});
		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("countyFeatureLayer").graphics;
		//添加省名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		/***********如果污染类型是全部，显示统计图******/
		if(wuranType=="totalCount"){
			//销毁图例
			updateCountyEcharts(data,maxTotalCount);
			//处理图例
			$("#ditu1").removeClass("none");
			$("#ditu1").siblings("p:eq(0)").removeClass("none");
		}else{
			//处理图例
			$("#ditu1").addClass("none");
			$("#ditu1").siblings("p:eq(0)").addClass("none");
			
			//遍历省界图层的graphics
			for (var i = 0; i < feaGraphics.length; i++) {
				var currFeaGraphic = feaGraphics[i];
				//遍历数据
				for (var j = 0; j < data.length; j++) {
					var currItem = data[j];
					//判断省界的KIND_1属性值与当前数据的CODE属性值是否相同
					if(currFeaGraphic.attributes.KIND_1+"00"==currItem.CODE){
						var attributes = {
								provoinceCode:currItem.province,
								provinceName:currItem.name
						}
						var point = currFeaGraphic.geometry.getCentroid();
						var symbolSize = 24;
						if(currItem[wuranType].toString().length==1){
							symbolSize = 24;
						}else if(currItem[wuranType].toString().length==2){
							symbolSize = 30;
						}else if(currItem[wuranType].toString().length==3){
							symbolSize = 40;
						}else if(currItem[wuranType].toString().length==4){
							symbolSize = 50;
						}else if(currItem[wuranType].toString().length==5){
							symbolSize = 60;
						}else{
							symbolSize = currItem[wuranType].toString().length*12;
						}
						
						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
						var symbol2 = new TextSymbol(currItem[wuranType]).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
						symbol2.setText(currItem[wuranType]);
						symbol2.font.setFamily("Times");
						symbol2.font.setSize("10pt");
						symbol2.font.setWeight(600);
						var graphic1 = new Graphic(point,symbol1,attributes);
						var graphic2 = new Graphic(point,symbol2,attributes);
						graphicsLayer.add(graphic1);
						graphicsLayer.add(graphic2);
					}
				}
			}
		
		}
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//加载分县统计图
function addLastLayer(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol",
	         "esri/renderers/ClassBreaksRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	         "esri/symbols/TextSymbol","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,
			SimpleRenderer,
			SimpleFillSymbol, SimpleMarkerSymbol,
	        ClassBreaksRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color,
			TextSymbol,LabelClass
	){
		var fLayerLast = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"lastFeatureLayer"
	     });
		
		fLayerLast.setDefinitionExpression("CODE like '"+(cityCode)+"%'");
		
		//加载县名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 fLayerLast.setLabelingInfo([labelClass]);
		
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		fLayerLast.setRenderer(renderer);
 		
		map.addLayer(fLayerLast);
		
		fLayerLast.on("mouse-over",function(evt){
			 removeGraphic("lastHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"lastHigh"});
			 map.graphics.add(highGraphic);
		})
		fLayerLast.on("mouse-out",function(){
			//恢复上次
//			map.graphics.clear();
			removeGraphic("countyHigh");
		})
		
			//设置分段渲染
			var json = {type:industryPar,regionCode:cityCode};
			ajaxPost('/seimp/warn/overproof_Xian.do',json).done(function(result){
				if(result.status==0){//请求成功
					if(result.data.length>0){
						var data = result.data;
						//模拟数据
						//处理数据，获取各省数量的最大值最小值
						var minCount = 0;
						var maxCount = 0;
						var maxTotalCount = 0;
						for(var i=0;i<data.length;i++){
							var graphics = fLayerLast.graphics;
				            if(graphics&&graphics.length>0){
				           	   	for (var j = 0; j < graphics.length; j++) {
				           	   		var currGra = graphics[j];
				           	   		if(currGra.attributes.CODE==data[i].CODE){
				           	   			data[i].provinceName =  currGra.attributes.NAME;
				           	   		}
				           	   	}
				            }
				           data[i].totalCount = data[i].SLIGHT+data[i].LIGHT+data[i].MIDDLE+data[i].SERVERE;
				           /*if(i==0){
				        	   var minCount =  data[i][wuranType];
				        	   var maxCount =  data[i][wuranType];
				        	   var maxTotalCount = data[i].totalCount;
				           }*/
				           if(data[i][wuranType]<minCount){
				        	   minCount = data[i][wuranType];
				           }
				           if(data[i][wuranType]>maxCount){
				        	   maxCount = data[i][wuranType];
				           }
				           if(data[i].totalCount>maxTotalCount){
				        	   maxTotalCount = data[i].totalCount;
				           }
						}
						countyTableData = data;
						//更新表格数据
						updateTable(data);
						
						//重新计算最大值
						maxCount = maxmain(maxCount);
						
						var count = (maxCount - minCount)/6;
						//更新图例
						updateLegend(minCount,count);
						//记录图例参数
						countryMinCount = minCount;
						countryCount = count;
						
						//设置分省底图各个分段的symbol
				 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
				 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
				 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
				 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
				 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
				 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
				 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
				 		renderer = new UniqueValueRenderer(defaultSymbol,"CODE");
						
						
						//更新图例
	//					updateLegend(minCount,count);
						
						for (var i = 0; i < data.length; i++) {
							var currItem = data[i];
							if(minCount<=currItem[wuranType]&&currItem[wuranType]<minCount+count*1){
								renderer.addValue(currItem.CODE, symbol1);
							}else if(minCount+count*1<=currItem[wuranType]&&currItem[wuranType]<minCount+count*2){
								renderer.addValue(currItem.CODE, symbol2);
							}else if(minCount+count*2<=currItem[wuranType]&&currItem[wuranType]<minCount+count*3){
								renderer.addValue(currItem.CODE, symbol3);
							}else if(minCount+count*3<=currItem[wuranType]&&currItem[wuranType]<minCount+count*4){
								renderer.addValue(currItem.CODE, symbol4);
							}else if(minCount+count*4<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*5){
								renderer.addValue(currItem.CODE, symbol5);
							}else if(minCount+count*5<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*6){
								renderer.addValue(currItem.CODE, symbol6);
							}
						}
						//为分省地图设置渲染
						fLayerLast.setRenderer(renderer);
						//将分省地图添加到地图上
						map.addLayer(fLayerLast,2);
						//分段渲染的底图加载完成之后，才能加载数字图层
						fLayerLast.on("update-end",function(){
							//添加统计图
							
							//添加数字图层
							initLastCount(data,maxTotalCount);
						})
						
						
					}else{//如果没有数据
						var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
						renderer = new UniqueValueRenderer(defaultSymbol,"CODE");
						fLayerLast.setRenderer(renderer);
						//更新图例
						updateLegend(0,0);
						map.addLayer(fLayerLast,2);
						fLayerLast.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
							initLastCount(data,0);
						})
					}
	
				}
			});//--ajax end
		
	});
}

//加载分县的名称和数字
function initLastCount(data,maxTotalCount){
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
	 		var graphicsLayer = new GraphicsLayer({id:"lastGraphicsLayer"});
	 		graphicsLayer.setMinScale(1155583.41974);
	 		//获取省界图层的Graphics
	 		var feaGraphics = map.getLayer("lastFeatureLayer").graphics;
	 		//添加省名
	 		for (var i = 0; i < feaGraphics.length; i++) {
	 			var currFeaGraphic = feaGraphics[i];
	 			var point = currFeaGraphic.geometry.getCentroid();
	 			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
	 			symbol.font.setSize("10pt");
	 			symbol.font.setWeight(700);
	 			symbol.font.setFamily("微软雅黑");
	 			symbol.setOffset(0,-14);
	 			var graphic = new Graphic(point,symbol);
	 			graphicsLayer.add(graphic);
	 		}
	 		
	 		/***********如果污染类型是全部，显示统计图******/
	 		if(wuranType=="totalCount"){
	 			//销毁图例
	 			updateLastEcharts(data,maxTotalCount);
	 			//处理图例
	 			$("#ditu1").removeClass("none");
	 			$("#ditu1").siblings("p:eq(0)").removeClass("none");
	 		}else{
	 			//处理图例
	 			$("#ditu1").addClass("none");
	 			$("#ditu1").siblings("p:eq(0)").addClass("none");
	 			
	 			//遍历省界图层的graphics
	 			for (var i = 0; i < feaGraphics.length; i++) {
	 				var currFeaGraphic = feaGraphics[i];
	 				//遍历数据
	 				for (var j = 0; j < data.length; j++) {
	 					var currItem = data[j];
	 					//判断省界的KIND_1属性值与当前数据的CODE属性值是否相同
	 					if(currFeaGraphic.attributes.CODE==currItem.CODE){
	 						var attributes = {
	 								provoinceCode:currItem.province,
	 								provinceName:currItem.name
	 						}
	 						var point = currFeaGraphic.geometry.getCentroid();
	 						var symbolSize = 24;
	 						if(currItem[wuranType].toString().length==1){
	 							symbolSize = 24;
	 						}else if(currItem[wuranType].toString().length==2){
	 							symbolSize = 30;
	 						}else if(currItem[wuranType].toString().length==3){
	 							symbolSize = 40;
	 						}else if(currItem[wuranType].toString().length==4){
	 							symbolSize = 50;
	 						}else if(currItem[wuranType].toString().length==5){
	 							symbolSize = 60;
	 						}else{
	 							symbolSize = currItem[wuranType].toString().length*12;
	 						}
	 						
	 						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
	 						var symbol2 = new TextSymbol(currItem[wuranType]).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
	 						symbol2.setText(currItem[wuranType]);
	 						symbol2.font.setFamily("Times");
	 						symbol2.font.setSize("10pt");
	 						symbol2.font.setWeight(600);
	 						var graphic1 = new Graphic(point,symbol1,attributes);
	 						var graphic2 = new Graphic(point,symbol2,attributes);
	 						graphicsLayer.add(graphic1);
	 						graphicsLayer.add(graphic2);
	 					}
	 				}
	 			}
	 		
	 		}
	 		map.addLayer(graphicsLayer);
	 		
	 	});//--require end
}


//更新全国统计图
function updateProvinceEcharts(data,maxTotalCount){
	require([  
	          "esri/map",
	          "esri/layers/GraphicsLayer","esri/SpatialReference","esri/geometry/webMercatorUtils",
	              "esri/geometry/Point",  
	              "esri/layers/FeatureLayer",   
	              "esri/layers/ArcGISDynamicMapServiceLayer",   
	              "esri/symbols/SimpleLineSymbol",   
	              "esri/symbols/SimpleFillSymbol",  
	              "esri/renderers/SimpleRenderer",  
	              "esri/Color",  "esri/geometry/Point",
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
	                SimpleRenderer, Color,   Point,
	                ChartInfoWindow,  
	                array, domConstruct, win,  
	                Chart,Chart2D,Highlight, Tooltip,ClusteredColumns  
   ) {   
		
		var gLayerProvince = new GraphicsLayer({id:"countryEchartsLayer"});
		gLayerProvince.setMinScale(18489334.7159);
    
		//为featureLayer设置渲染器  
		var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);  
		var renderer = new SimpleRenderer(defaultSymbol);  
		gLayerProvince.setRenderer(renderer);
		    
		map.addLayer(gLayerProvince);
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
	            var graphics = map.getLayer("countryFeatureLayer").graphics;
	            if(graphics&&graphics.length>0){
	           	   	for (var j = 0; j < graphics.length; j++) {
	           	   		var currGra = graphics[j];
	           	   		if(currGra.attributes.PROV_CODE==currItem.CODE){
	           	   			var labelPt = currGra.geometry.getCentroid();
	           	   			if(currItem.CODE=="130000"){
	           	   				labelPt = new Point([115.18,38]);
	           	   			}
	           	   			provinceName =  currGra.attributes.NAME;
	           	   		}
	           	   	}
	            }
	            if(labelPt!=null){
		       	   	var infoWindow = new ChartInfoWindow({  
		       	   		domNode: domConstruct.create('div', {style:"position:absolute;width:50px;height:120px;"}, document.getElementById('map'))  
		            });
		            infoWindow.setMap(map);
		            
		                
		            var nodeChart = null;  
		            nodeChart = domConstruct.create("div", { id: 'nodeTest' + i, style: "width:50px;height:120px" }, win.body());  
		            infoWindow.resize(50, 120);
		                
		            infoWindow.setContent(nodeChart);  
		            infoWindow.__mcoords = labelPt;
		            infoWindow.show(map.toScreen(labelPt));
		            var obj = {
		            		infoWindow:infoWindow,
		            		location:labelPt
		            }
		            iObjProvince.push(obj);
		              //加载echarts统计图
		            makeEcharts(nodeChart,currItem,provinceName,maxTotalCount);
	            }
			}
			//隐藏统计图
			if(map.getLevel()<=3){
				//隐藏统计图
				hideLayer(iObjProvince);
				//隐藏省名
			}else{
				//显示统计图
				showLayer(iObjProvince);
				//显示省名
			}
//			hideLayer(iObjProvince);
    }
     
    //创建Echarts统计图
    function makeEcharts(nodeChart,currItem,provinceName,maxTotalCount){
  	   var seriesData = [{	
  		   					name:'轻微污染',
  		   					type:'bar',
  		   					barWidth : 30,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.SLIGHT)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'轻度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.LIGHT)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'中度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.MIDDLE)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'重度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.SERVERE)],
  		   					barMinHeight:3
  	   					}]
  	   //计算百分比
  	   var sum = parseInt(currItem.SLIGHT+currItem.LIGHT+currItem.MIDDLE+currItem.SERVERE);
  	   var d0 = (currItem.SLIGHT/sum*100).toFixed(2);
  	   var d1 = (currItem.LIGHT/sum*100).toFixed(2);
  	   var d2 = (currItem.MIDDLE/sum*100).toFixed(2);
  	   var d3 = (currItem.SERVERE/sum*100).toFixed(2);
  	  var option = {
  		    tooltip : {
  		        trigger: 'axis',
  		        axisPointer : {
  		            type : 'shadow'
  		        },
  		        formatter:"{b} <br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#48D738'></span>{a0} : {c0} 个("+d0+"%)<br/>" +
  		        		"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#3F54CE'></span>{a1} : {c1} 个("+d1+"%)<br/>"+
  		        		"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#A86283'></span>{a2} : {c2} 个("+d2+"%)<br/>" +
  		        		"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#DC3D44'></span>{a3} : {c3} 个("+d3+"%)"
  		    },
  		    color:["#48D738","#3F54CE","#A86283","#DC3D44"],
  		    grid: {
  		        left: '3%',
  		        right: '4%',
  		        bottom: '3%',
  		        containLabel: true
  		    },
  		    xAxis : [{
		            type : 'category',
  		            data : [provinceName],
  		            show:false
  		    }],
  		    yAxis : [
  		        {
  		            type : 'value',
  		            show:false,
  		            max:maxTotalCount
  		        }
  		    ],
  		    series :seriesData
  		};

  		var pieChart = echarts.init(nodeChart);
  		eObjProvince.push(pieChart);
  		pieChart.setOption(option);
     }
       
 });//--require end
}

//更新某一个省的统计图
function updateCountyEcharts(data,maxTotalCount){
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
		
		var gLayerProvince = new GraphicsLayer({id:"countryEchartsLayer"});
    
		//为featureLayer设置渲染器  
		var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);  
		var renderer = new SimpleRenderer(defaultSymbol);
		gLayerProvince.setRenderer(renderer);
		    
		map.addLayer(gLayerProvince);
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
	            var graphics = map.getLayer("countyFeatureLayer").graphics;
	            if(graphics&&graphics.length>0){
	           	   	for (var j = 0; j < graphics.length; j++) {
	           	   		var currGra = graphics[j];
	           	   		if(currGra.attributes.KIND_1+"00"==currItem.CODE){
	           	   			var labelPt = currGra.geometry.getCentroid();
	           	   			provinceName =  currGra.attributes.NAME;
	           	   		}
	           	   	}
	            }
	            if(labelPt!=null){
		       	   	var infoWindow = new ChartInfoWindow({  
		       	   		domNode: domConstruct.create('div', {style:"position:absolute;width:50px;height:120px;"}, document.getElementById('map'))  
		            });  
		            infoWindow.setMap(map);
		            
		                
		            var nodeChart = null;  
		            nodeChart = domConstruct.create("div", { id: 'nodeTest' + i, style: "width:50px;height:120px" }, win.body());  
		            infoWindow.resize(50, 120);
		                
		            infoWindow.setContent(nodeChart);  
		            infoWindow.__mcoords = labelPt;
		            infoWindow.show(map.toScreen(labelPt));
		            var obj = {
		            		infoWindow:infoWindow,
		            		location:labelPt
		            }
		            iObjProvince.push(obj);
		              //加载echarts统计图
		            makeEcharts(nodeChart,currItem,provinceName,maxTotalCount);
	            }
			}  
			//隐藏统计图
//			hideLayer(iObjProvince);
			//隐藏统计图
			if(map.getLevel()<=5){
				//隐藏统计图
				hideLayer(iObjProvince);
				//隐藏省名
			}else{
				//显示统计图
				showLayer(iObjProvince);
				//显示省名
			}
    }
     
    //创建Echarts统计图
    function makeEcharts(nodeChart,currItem,provinceName,maxTotalCount){
  	   var seriesData = [{	
  		   					name:'轻微污染',
  		   					type:'bar',
  		   					barWidth : 30,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.SLIGHT)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'轻度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.LIGHT)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'中度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.MIDDLE)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'重度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.SERVERE)],
  		   					barMinHeight:3
  	   					}];
  	 //计算百分比
  	   var sum = parseInt(currItem.SLIGHT+currItem.LIGHT+currItem.MIDDLE+currItem.SERVERE);
  	   var d0 = (currItem.SLIGHT/sum*100).toFixed(2);
  	   var d1 = (currItem.LIGHT/sum*100).toFixed(2);
  	   var d2 = (currItem.MIDDLE/sum*100).toFixed(2);
  	   var d3 = (currItem.SERVERE/sum*100).toFixed(2);
  	  var option = {
  		    tooltip : {
  		        trigger: 'axis',
  		        axisPointer : {
  		            type : 'shadow'
  		        },
  		        formatter:"{b} <br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#48D738'></span>{a0} : {c0} 个("+d0+"%)<br/>" +
  		        	"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#3F54CE'></span>{a1} : {c1} 个("+d1+"%)<br/>"+
  		        	"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#A86283'></span>{a2} : {c2} 个("+d2+"%)<br/>" +
  		        	"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#DC3D44'></span>{a3} : {c3} 个("+d3+"%)"

  		    },
  		    color:["#48D738","#3F54CE","#A86283","#DC3D44"],
  		    grid: {
  		        left: '3%',
  		        right: '4%',
  		        bottom: '3%',
  		        containLabel: true
  		    },
  		    xAxis : [{
		            type : 'category',
  		            data : [provinceName],
  		            show:false
  		    }],
  		    yAxis : [
  		        {
  		            type : 'value',
  		            show:false,
  		            max:maxTotalCount
  		        }
  		    ],
  		    series :seriesData
  		};

  		var pieChart = echarts.init(nodeChart);
  		eObjProvince.push(pieChart);
  		pieChart.setOption(option);
     }
       
 });//--require end
}

//更新某一个市的统计图
function updateLastEcharts(data,maxTotalCount){
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
		
		var gLayerProvince = new GraphicsLayer({id:"countryEchartsLayer"});
    
		//为featureLayer设置渲染器  
		var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);  
		var renderer = new SimpleRenderer(defaultSymbol);
		gLayerProvince.setRenderer(renderer);
		    
		map.addLayer(gLayerProvince);
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
	            var graphics = map.getLayer("lastFeatureLayer").graphics;
	            if(graphics&&graphics.length>0){
	           	   	for (var j = 0; j < graphics.length; j++) {
	           	   		var currGra = graphics[j];
	           	   		if(currGra.attributes.CODE==currItem.CODE){
	           	   			var labelPt = currGra.geometry.getCentroid();
	           	   			provinceName =  currGra.attributes.NAME;
	           	   		}
	           	   	}
	            }
	            if(labelPt!=null){
		       	   	var infoWindow = new ChartInfoWindow({  
		       	   		domNode: domConstruct.create('div', {style:"position:absolute;width:50px;height:120px;"}, document.getElementById('map'))  
		            });  
		            infoWindow.setMap(map);
		            
		                
		            var nodeChart = null;  
		            nodeChart = domConstruct.create("div", { id: 'nodeTest' + i, style: "width:50px;height:120px" }, win.body());  
		            infoWindow.resize(50, 120);
		                
		            infoWindow.setContent(nodeChart);  
		            infoWindow.__mcoords = labelPt;
		            infoWindow.show(map.toScreen(labelPt));
		            var obj = {
		            		infoWindow:infoWindow,
		            		location:labelPt
		            }
		            iObjProvince.push(obj);
		              //加载echarts统计图
		            makeEcharts(nodeChart,currItem,provinceName,maxTotalCount);
	            }
			}  
			
			//隐藏统计图
//			hideLayer(iObjProvince);
			//隐藏统计图
			if(map.getLevel()<=7){
				//隐藏统计图
				hideLayer(iObjProvince);
				//隐藏省名
			}else{
				//显示统计图
				showLayer(iObjProvince);
				//显示省名
			}
    }
     
    //创建Echarts统计图
    function makeEcharts(nodeChart,currItem,provinceName,maxTotalCount){
  	   var seriesData = [{	
  		   					name:'轻微污染',
  		   					type:'bar',
  		   					barWidth : 30,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.SLIGHT)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'轻度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.LIGHT)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'中度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.MIDDLE)],
  		   					barMinHeight:3
  	   					},{	
  		   					name:'重度污染',
  		   					type:'bar',
  		   					barWidth : 5,
  		   					stack: '污染点位',
  		   					data:[parseInt(currItem.SERVERE)],
  		   					barMinHeight:3
  	   					}];
  	 //计算百分比
  	   var sum = parseInt(currItem.SLIGHT+currItem.LIGHT+currItem.MIDDLE+currItem.SERVERE);
  	   var d0 = (currItem.SLIGHT/sum*100).toFixed(2);
  	   var d1 = (currItem.LIGHT/sum*100).toFixed(2);
  	   var d2 = (currItem.MIDDLE/sum*100).toFixed(2);
  	   var d3 = (currItem.SERVERE/sum*100).toFixed(2);
  	  var option = {
  		    tooltip : {
  		        trigger: 'axis',
  		        axisPointer : {
  		            type : 'shadow'
  		        },
  		        formatter:"{b} <br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#48D738'></span>{a0} : {c0} 个("+d0+"%)<br/>" +
  		        	"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#3F54CE'></span>{a1} : {c1} 个("+d1+"%)<br/>"+
  		        	"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#A86283'></span>{a2} : {c2} 个("+d2+"%)<br/>" +
  		        	"<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#DC3D44'></span>{a3} : {c3} 个("+d3+"%)"

  		    },
  		    color:["#48D738","#3F54CE","#A86283","#DC3D44"],
  		    grid: {
  		        left: '3%',
  		        right: '4%',
  		        bottom: '3%',
  		        containLabel: true
  		    },
  		    xAxis : [{
		            type : 'category',
  		            data : [provinceName],
  		            show:false
  		    }],
  		    yAxis : [
  		        {
  		            type : 'value',
  		            show:false,
  		            max:maxTotalCount
  		        }
  		    ],
  		    series :seriesData
  		};

  		var pieChart = echarts.init(nodeChart);
  		eObjProvince.push(pieChart);
  		pieChart.setOption(option);
     }
       
 });//--require end
}

//更新表格
function updateTable(data){
	//设置表格标题
	var quyuName = "全国";
	if(quyuType==0){
		quyuName = "全国";
	}else if(quyuType==1){
		quyuName = provinceSName;
	}else if(quyuType==2){
		quyuName = provinceSName +citySName;
	}
	$("#tongjituDiv .tabtop_left").html(quyuName+"污染信息");
	
	var headHtml = "<td>序号</td><td>地区</td><td>总污染计数</td><td>轻微污染数</td><td>轻度污染数</td><td>中度污染数</td><td>重度污染数</td>";
	var bodyHtml = "";
	if(data.length>0){
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			if(currItem.provinceName==null){
				currItem.provinceName="";
			}
			bodyHtml+="<tr areaCode='"+data[i].CODE+"'><td>"+(i+1)+"</td><td>"+(currItem.NAME!=null?currItem.NAME:"")+"</td><td>"+currItem.totalCount+"</td><td dataType='1'><a href='#'>"+currItem.SLIGHT+"</a></td><td dataType='2'><a href='#'>"+currItem.LIGHT+"</a></td><td dataType='3'><a href='#'>"+currItem.MIDDLE+"</a></td><td dataType='4'><a href='#'>"+currItem.SERVERE+"</a></td></tr>"
			
		}
	}
	$("#tongjibiao thead tr").html(headHtml);
	$("#tongjibiao tbody").html(bodyHtml);
	$("#tongjibiao tr td").click(function(evt){
		$("#detailTable").css("top",evt.screenY-160);
		var areaCode = $(this).parent().attr("areaCode");
		var dataType = $(this).attr("dataType");
		var wuranName = "轻微污染计数";
		if(dataType==1){
			wuranName = "轻微污染计数";
		}else if(dataType==2){
			wuranName = "轻度污染计数";
		}else if(dataType==3){
			wuranName = "重度污染计数";
		}else if(dataType==4){
			wuranName = "轻微污染计数";
		}
		var sTableName = $(this).parent().find("td:eq(1)").html();
		
		if(dataType){
			var json = {regionCode:areaCode,type:dataType};
			ajaxPost('/seimp/warn/overproof_Detail.do',json).done(function(data){
				if(data.status==0){//请求成功
					//设置表格标题
					$("#detailTable .tabtop_left").html(sTableName+wuranName+"详细信息");
					if(data.data.length>0){
						data = data.data;
						var headHtml="";
						var bodyHtml = "";
						//判断是有机物还是无机物
						if(industryPar=="2"){//有机物
							headHtml = "<tr><td>序号</td><td>bhc</td><td>ddt</td></tr>";
							bodyHtml = "";
							for (var i = 0; i < data.length; i++) {
								var currItem = data[i];
								bodyHtml+="<tr><td>"+(i+1)+"</td><td>"+currItem.BHC+"</td><td>"+currItem.DDT+"</td></tr>"
							}
						}else if(industryPar=="1"){//无机物
							headHtml = "<tr><td>序号</td><td>Cr</td><td>Pb</td><td>Cd</td><td>Hg</td><td>As</td><td>Cu</td><td>Zn</td><td>Ni</td></tr>";
							bodyHtml = "";
								for (var i = 0; i < data.length; i++) {
									var currItem = data[i];
									bodyHtml+="<tr><td>"+(i+1)+"</td><td>"+currItem.CR+"</td><td>"+currItem.PB+"</td><td>"+currItem.CD+"</td><td>"+currItem.HG+"</td><td>"+currItem.SUMAS+"</td><td>"+currItem.CU+"</td><td>"+currItem.ZN+"</td><td>"+currItem.NI+"</td></tr>"
								}
						}
						
						$("#detailTable thead").html(headHtml);
						$("#detailTable tbody").html(bodyHtml);
						$("#detailTable").show();
						
					}else{
						var headHtml="";
						var bodyHtml = "";
						//判断是有机物还是无机物
						if(industryPar=="2"){//有机物
							headHtml = "<tr><td>序号</td><td>bhc</td><td>ddt</td></tr>";
						}else if(industryPar=="1"){//无机物
							headHtml = "<tr><td>序号</td><td>Cr</td><td>Pb</td><td>Cd</td><td>Hg</td><td>As</td><td>Cu</td><td>Zn</td><td>Ni</td></tr>";
						}
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
//生成图例
function updateLegend(minCount,count){
	$("#ditu li:eq(0) div:eq(1)").html(minCount+"-"+parseInt(minCount+count*1));
	$("#ditu li:eq(1) div:eq(1)").html(parseInt(minCount+count*1)+"-"+parseInt(minCount+count*2));
	$("#ditu li:eq(2) div:eq(1)").html(parseInt(minCount+count*2)+"-"+parseInt(minCount+count*3));
	$("#ditu li:eq(3) div:eq(1)").html(parseInt(minCount+count*3)+"-"+parseInt(minCount+count*4));
	$("#ditu li:eq(4) div:eq(1)").html(parseInt(minCount+count*4)+"-"+parseInt(minCount+count*5));
	$("#ditu li:eq(5) div:eq(1)").html(parseInt(minCount+count*5)+"-"+parseInt(minCount+count*6));
	
}

function destroyEcharts(){
	//清除echarts饼图
	if(eObjProvince.length>0){
		for (var i = 0; i < eObjProvince.length; i++) {
			eObjProvince[i].dispose();
		}
		eObjProvince=[];
	}
	//清除饼图窗口
	if(iObjProvince.length>0){
		for (var i = 0; i < iObjProvince.length; i++) {
			iObjProvince[i].infoWindow.destroy();
		}
		iObjProvince=[];
	}
	//清除饼图图层
	if(map.getLayer("countryEchartsLayer")!=null){
		map.removeLayer(map.getLayer("countryEchartsLayer"));
	}
}

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
//	if(graphicsLayer!=null){
//		graphicsLayer.setVisibility(false);
//	}
	//隐藏底图图层
//	if(fLayerCounty!=null){
//		fLayerCounty.setVisibility(false);
//	}
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

/*****获取颜色*************/
function getColor(){
	if(wuranType=="totalCount"){
//		return "#4daf4a";
		return "#45BBE1";
	}else if(wuranType=="SLIGHT"){
		return "#48D738";
	}else if(wuranType=="LIGHT"){
		return "#3F54CE";
	}else if(wuranType=="MIDDLE"){
		return "#A86283";
	}else if(wuranType=="SERVERE"){
		return "#DC3D44";
	}
}
	

/*******页面点击方法*******/
//右上角全国按钮点击方法
$(function(){
	$("#country").click(function(){
		$("#quyuDiv button").removeClass("active");
		$("#quyuDiv button").css("background-color","#286090");
        $("#quyuDiv button").css("color",'white');
		
//		map.centerAndZoom([108,34],3);
		quyuType = 0;
		
		$("#province").addClass("none");
		$("#city").addClass("none");
		updateProvinceLayer();
	})
	
	$("#province").click(function(){
		//添加省部高亮
		map.graphics.add(provinceHighGraphic);
		//updateCityLayer(lastProvinceCode);shi
//		updateCountyLayer(provinceCode);
		map.setExtent(provinceExtent);
		//区域类型变为1，分省数据
		quyuType = 1;
		
		$("#city").addClass("none");
		updateCountyLayer();
	})
	
	$("#city").click(function(){
		//添加省部高亮
		map.graphics.add(cityHighGraphic);
		//updateCityLayer(lastProvinceCode);shi
//		updateLastLayer(cityCode);
		map.setExtent(cityExtent);
		//区域类型变为2，分市数据
		quyuType = 2;
		
		updateLastLayer();
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
    
    var $div3 = $("div#detailTable");
    /* 绑定鼠标左键按住事件 */
    $div3.bind("mousedown",function(event){
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
        $div3.css({
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



var box_width = $("#map").width()
var lim_width = $(".map-item").width()
var width_f = (box_width - lim_width)/2
$(".map-item").css("margin-left",+width_f+"px");

$('#mylegend p').click(function(){
    $('#mylegend ul').slideDown()
})

