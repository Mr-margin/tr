/******变量*******/
var map;
var yuqingType = "";//舆情类别
var clusterLayer = null;
/***********右边悬浮窗变量**********/
var isHaveData={//是否有统计图、统计表、时间轴数据
		tongjibiao:0,
		tongjitu:0,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=0;

//默认显示的行业类别
var industryArr=[];
var newsArr=[],pageIndex,pagesize=10,pageCount;

var box_width = $("#map").width()
var lim_width = $(".map-item").width()
var width_f = (box_width - lim_width)/2
$(".map-item").css("margin-left",+width_f+"px");

/***********分省底图****************/
var graphicsLayer = null;
var provinceClick = null;//省界高亮
var provinceExtent = null;//省界边界
var provinceCode = null;//省code
var cityClick = null;//县界高亮
var cityExtent = null;//县界边界
var cityCode = null;//县code
var mapIndustry = "";//地图模式的行业类别
var mapType = "1";//地图类型 1:全国模式 2：某一个省的所有市模式 3：某一个市的点位

//图例
var countryMinCount = null;
var countryCount = null;
var provinceMinCount = null;
var provinceCount = null;
var cityMinCount = null;
var cityCount = null;

//鼠标进入进出事件
var mouseLastValue = null;

/********页面加载**********/
$(function(){
	//加载动画开始
	zmblockUI('body', 'start');
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			InfoWindowLite,domConstruct
	){
		extent = new Extent(extentPar);
		//初始化地图
		map = new Map("map",{
			logo:false,
			minZoom:2,
			center:[108,34],
			zoom:3,
			showLabels:true,
			extent:extent
		})
		
		//设置弹出框样式
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		initLayerByUser();
		
		//更新地图
//		updateCountry(true);
//		updateYuqingLayer();
		
		map.on("mouse-move",function(evt){
			//判断graphic不存在的时候消除
			//判断graphic不是省界图层，也不是map.graphics图层，也不是的时候消除
			//消除省界高亮和预警值
			if(evt.graphic==null||(evt.graphic._layer.id!="countryFeatureLayer" && evt.graphic._layer.id!="map_graphics" && evt.graphic._layer.id!="countryGraphicsLayer"
				&& evt.graphic._layer.id!="provinceFeatureLayer"  && evt.graphic._layer.id!="provinceGraphicsLayer"
				&&evt.graphic._layer.id!="cityFeatureLayer"  && evt.graphic._layer.id!="cityGraphicsLayer"
			)){
				removeGraphic("provinceHigh");
				removeGraphic("zongheValue");
			}
		})
		
		
	});//--require end
	
	//生成类型
	var json = {};
	ajaxPost("/seimp/warn/getNetworkNewsTypes.do", json).done(function(result){
		if(result.status==0){//请求成功
			if(result.data.length>0){
				var data = result.data;
				for (var i = 0; i < data.length; i++) {
					var currItem = data[i];
					industryArr.push({id:currItem,name:currItem})
				}
				industryArr.push({id:"其它",name:"其它"});
			}
			createInsutryClick();
		}
	});
	
})//--load end

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
			updateCountry(true);
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
			    	 map.setExtent(graphic.geometry.getExtent());
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
				updateProvince(true);
		    }
			
		}
	})
}


//更新全国模式 true：加载 false：显示
function updateCountry(flag){
	//显示国界线图层
	showGuojie();
	//处理图例
	//记录地图模式
	mapType = "1";
	//隐藏某一个省模式的图形
	if(map.getLayer("provinceFeatureLayer")!=null){
		map.getLayer("provinceFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("provinceGraphicsLayer")!=null){
		map.getLayer("provinceGraphicsLayer").setVisibility(false);
	}
	//隐藏某一个市的点位图层
	if(map.getLayer("cityFeatureLayer")!=null){
		map.getLayer("cityFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("cityGraphicsLayer")!=null){
		map.getLayer("cityGraphicsLayer").setVisibility(false);
	}
//	map.centerAndZoom([108,34],3);
	map.setExtent(extent);
	//清除高亮
	removeGraphic("provinceClick");
	if(flag){
		if(map.getLayer("countryFeatureLayer")!=null){
			map.removeLayer(map.getLayer("countryFeatureLayer"));
		}
		if(map.getLayer("countryGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("countryGraphicsLayer"));
		}
		//加载
		initCountry();
	}else{
		
		//图例
		updateLegend(countryMinCount, countryCount);
		
		//显示
		if(map.getLayer("countryFeatureLayer")!=null){
			map.getLayer("countryFeatureLayer").setVisibility(true);
		}
		if(map.getLayer("countryGraphicsLayer")!=null){
			map.getLayer("countryGraphicsLayer").setVisibility(true);
		}
	}
}

//更新某一个省份的模式
function updateProvince(flag){
	//清除国界线图层
	hideGuoJie();
	//记录地图模式
	mapType = "2";
	//隐藏全国模式的图形
	if(map.getLayer("countryFeatureLayer")!=null){
		map.getLayer("countryFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.getLayer("countryGraphicsLayer").setVisibility(false);
	}
	//隐藏某一个市的点位图层
	if(map.getLayer("cityFeatureLayer")!=null){
		map.getLayer("cityFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("cityGraphicsLayer")!=null){
		map.getLayer("cityGraphicsLayer").setVisibility(false);
	}
	removeGraphic("provinceClick");
	map.graphics.add(provinceClick);
	if(flag){
		if(map.getLayer("provinceFeatureLayer")!=null){
			map.removeLayer(map.getLayer("provinceFeatureLayer"));
		}
		if(map.getLayer("provinceGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("provinceGraphicsLayer"));
		}
		//加载
		initProvince();
	}else{
		removeGraphic("provinceClick");
		map.graphics.add(provinceClick);
		map.setExtent(provinceExtent);
		//图例
		updateLegend(provinceMinCount, provinceCount);
		//显示
		if(map.getLayer("provinceFeatureLayer")!=null){
			map.getLayer("provinceFeatureLayer").setVisibility(true);
		}
		if(map.getLayer("provinceGraphicsLayer")!=null){
			map.getLayer("provinceGraphicsLayer").setVisibility(true);
		}
		
	}
}

//更新某一个市的模式
function updateCity(flag){
	//清除国界线图层
	hideGuoJie();
	//记录地图模式
	mapType = "3";
	removeGraphic("provinceClick");
	map.graphics.add(cityClick);
	//隐藏某一个省模式的图形
	if(map.getLayer("provinceFeatureLayer")!=null){
		map.getLayer("provinceFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("provinceGraphicsLayer")!=null){
		map.getLayer("provinceGraphicsLayer").setVisibility(false);
	}
	//隐藏全国模式的图形
	if(map.getLayer("countryFeatureLayer")!=null){
		map.getLayer("countryFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.getLayer("countryGraphicsLayer").setVisibility(false);
	}
	if(flag){
		//销毁某一个市的点位图层
		if(map.getLayer("cityFeatureLayer")!=null){
			map.removeLayer(map.getLayer("cityFeatureLayer"));
		}
		if(map.getLayer("cityGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("cityGraphicsLayer"));
		}
		//加载
		initCity();
	}else{
		removeGraphic("provinceClick");
		map.graphics.add(cityClick);
		map.setExtent(cityExtent);
		//图例
		updateLegend(cityMinCount, cityCount);
		//显示
		if(map.getLayer("cityFeatureLayer")!=null){
			map.getLayer("cityFeatureLayer").setVisibility(true);
		}
		if(map.getLayer("cityGraphicsLayer")!=null){
			map.getLayer("cityGraphicsLayer").setVisibility(true);
		}
	}
}

//加载全国图层
function initCountry(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 //加载地图服务
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"countryFeatureLayer"
	     });
		 
		 //加载省名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
		 
		 //添加点击事件
		 featureLayer.on("click",function(evt){
			 //高亮设置
			 removeGraphic("provinceClick");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
			 //记录边界高亮
			 provinceClick = highGraphic;
			 map.graphics.add(highGraphic);
			 //获取点击省份的PROV_CODE
			 provinceCode = evt.graphic.attributes.PROV_CODE;
			 //设置地图边界
			 map.setExtent(evt.graphic.geometry.getExtent());
			 //记录地图边界
			 provinceExtent = evt.graphic.geometry.getExtent();
			 //改变右上角按钮Text
			 $("#province").html(evt.graphic.attributes.NAME);
			 //显示右上角按钮
			 $("#province").removeClass("none");
			 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
			 $("#city").addClass("none");
			 //更新某一个省的点位图层
			 updateProvince(true);
		 });
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-move",function(evt){
			 removeGraphic("provinceHigh");
			 removeGraphic("zongheValue");
			 
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
			 //增加综合预警值graphic
			 if(evt.graphic.attributes.value!=null){
				 var point = evt.mapPoint;
				 var textSymbol = new TextSymbol("综合评估得分："+new Number(evt.graphic.attributes.value).toFixed(2)).setColor(new Color([0,0,0,1])).setOffset(0,10);
				 	textSymbol.font.setFamily("Times");
				 	textSymbol.font.setSize("12pt");
				 	textSymbol.font.setWeight(600);
				 var graphic = new Graphic(point,textSymbol,{type:"zongheValue"});
				 map.graphics.add(graphic);
			 }
			 
//			 mouseLastValue = evt.graphic.attributes.NAME;
			 
		})
		//添加鼠标移出事件
		/*featureLayer.on("mouse-out",function(evt){
			removeGraphic("provinceHigh");
			if(mouseLastValue!=evt.graphic.attributes.NAME){
				removeGraphic("zongheValue");
			}
		})*/
		 
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
			addGuojie();
		})
		
		featureLayer.on("update-end",function(evt){
			var graphics = evt.target.graphics;
			var json = {type:"1",code:""};
			ajaxPost('/seimp/warn/getshangzhi',json).done(function(result){
				var data = result.data;
				if(result.data!=null){
						var provinceValue = data.sc;
						for (var currCode in provinceValue) {
							var currItem = provinceValue[currCode];
							for (var j = 0; j < graphics.length; j++) {
								var currGra = graphics[j];
								if(currGra.attributes.PROV_CODE==currCode){
									currGra.attributes.value = currItem;
								}
							}
						}
				}
			});
		})
		
	 	 //ajax获取各省产粮油大县的数量
		 var json = {type:"1",code:""};
		ajaxPost('/seimp/warn/getshangzhi',json).done(function(result){
			
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data!=null){
//					
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 1;
					/*for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.value<minCount){
							minCount = currItem.value;
						}
						if(currItem.value>maxCount){
							maxCount = currItem.value;
						}
					}*/
					//处理最大值
//					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/5;
					
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
					var provinceValue = data.sc;
					for (var currCode in provinceValue) {
						//当前省份的综合评估得分
						var currItem = provinceValue[currCode];
						if(minCount<=currItem && currItem<minCount+count*1){
							renderer.addValue(currCode, symbol1);
						}else if(minCount+count*1<=currItem && currItem<minCount+count*2){
							renderer.addValue(currCode, symbol2);
						}else if(minCount+count*2<=currItem && currItem<minCount+count*3){
							renderer.addValue(currCode, symbol3);
						}else if(minCount+count*3<=currItem && currItem<minCount+count*4){
							renderer.addValue(currCode, symbol4);
						}else if(minCount+count*4<=currItem && currItem<=minCount+count*5){
							renderer.addValue(currCode, symbol5);
						}
					}
					//为分省地图设置渲染
					featureLayer.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initCountryCount(data);
					})
					
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initCountryCount();
					})
				}
			}
		});//--ajax end
	});//-require end
}

//加载各省数字图层
function initCountryCount(data){
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
			//河北省单独处理
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
		
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//加载某一个省的所有市图层
function initProvince(){
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 //加载地图服务
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"provinceFeatureLayer"
	     });
		 
		 featureLayer.setDefinitionExpression("KIND_1 like '"+(provinceCode+"").substr(0, 2)+"%'");
		 
		 //加载市名标签
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
//		 featureLayer.setLabelingInfo([labelClass]);
		 
		 //添加点击事件
		 featureLayer.on("click",function(evt){
			 //高亮设置
			 removeGraphic("provinceClick");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
			 cityClick = highGraphic;
			 map.graphics.add(highGraphic);
			 
			 //获取点击时的PROV_CODE
			 cityCode = evt.graphic.attributes.KIND_1+"00";
			 //设置地图边界
			 map.setExtent(evt.graphic.geometry.getExtent());
			 //记录地图边界
			 cityExtent = evt.graphic.geometry.getExtent();
			 //改变右上角按钮Text
			 $("#city").html(evt.graphic.attributes.NAME);
			 //显示右上角按钮
			 $("#city").removeClass("none");
			 //更新一个市的点位
			 updateCity(true);
		 });
		 
		//添加鼠标进入事件
		 featureLayer.on("mouse-move",function(evt){
			 removeGraphic("provinceHigh");
			 removeGraphic("zongheValue");
			 
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
			 //增加综合预警值graphic
			 if(evt.graphic.attributes.value!=null){
				 var point = evt.mapPoint;
				 var textSymbol = new TextSymbol("综合评估得分："+new Number(evt.graphic.attributes.value).toFixed(2)).setColor(new Color([0,0,0,1])).setOffset(0,10);
				 	textSymbol.font.setFamily("Times");
				 	textSymbol.font.setSize("12pt");
				 	textSymbol.font.setWeight(600);
				 var graphic = new Graphic(point,textSymbol,{type:"zongheValue"});
				 map.graphics.add(graphic);
			 }
			 
//			 mouseLastValue = evt.graphic.attributes.NAME;
			 
		})
		
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
		})
		
		
		featureLayer.on("update-end",function(evt){
			var graphics = evt.target.graphics;
			var json = {type:"2",code:provinceCode};
			ajaxPost('/seimp/warn/getshangzhi',json).done(function(result){
				var data = result.data;
				if(result.data!=null){
						var provinceValue = data.sc;
						for (var currCode in provinceValue) {
							var currItem = provinceValue[currCode];
							for (var j = 0; j < graphics.length; j++) {
								var currGra = graphics[j];
								if(currGra.attributes.KIND_1+"00"==currCode){
									currGra.attributes.value = currItem;
								}
							}
						}
				}
			});
		})
		 

	 	 //ajax获取各省产粮油大县的数量
		 var json = {type:"2",code:provinceCode};
		ajaxPost('/seimp/warn/getshangzhi',json).done(function(result){
			
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data!=null){
//					
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 1;
					/*for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.value<minCount){
							minCount = currItem.value;
						}
						if(currItem.value>maxCount){
							maxCount = currItem.value;
						}
					}*/
					//处理最大值
//					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/5;
					
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					provinceMinCount = minCount;
					provinceCount = count;
					
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
					var provinceValue = data.sc;
					for (var currCode in provinceValue) {
						//当前省份的综合评估得分
						var currItem = provinceValue[currCode];
						if(minCount<=currItem && currItem<minCount+count*1){
							renderer.addValue(currCode.substr(0,4), symbol1);
						}else if(minCount+count*1<=currItem && currItem<minCount+count*2){
							renderer.addValue(currCode.substr(0,4), symbol2);
						}else if(minCount+count*2<=currItem && currItem<minCount+count*3){
							renderer.addValue(currCode.substr(0,4), symbol3);
						}else if(minCount+count*3<=currItem && currItem<minCount+count*4){
							renderer.addValue(currCode.substr(0,4), symbol4);
						}else if(minCount+count*4<=currItem && currItem<=minCount+count*5){
							renderer.addValue(currCode.substr(0,4), symbol5);
						}
					}
					//为分省地图设置渲染
					featureLayer.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initProvinceCount(data);
					})
					
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initProvinceCount();
					})
				}
			}
		});//--ajax end
	});//-require end
}

//加载某一个省各市的数字图层
function initProvinceCount(data){
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
		var graphicsLayer = new GraphicsLayer({id:"provinceGraphicsLayer"});
		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("provinceFeatureLayer").graphics;
		
		//添加省名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("12pt");
			symbol.font.setWeight(700);
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//加载某一个市的所有县数据
function initCity(){
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
			 id:"cityFeatureLayer"
	     });
		
		fLayerLast.setDefinitionExpression("CODE like '"+(cityCode.substr(0,4))+"%'");
		
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
 		
//		map.addLayer(fLayerLast);
		
 		//添加鼠标进入事件
 		fLayerLast.on("mouse-move",function(evt){
			 removeGraphic("provinceHigh");
			 removeGraphic("zongheValue");
			 
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
			 //增加综合预警值graphic
			 if(evt.graphic.attributes.value!=null){
				 var point = evt.mapPoint;
				 var textSymbol = new TextSymbol("综合评估得分："+new Number(evt.graphic.attributes.value).toFixed(2)).setColor(new Color([0,0,0,1])).setOffset(0,10);
				 	textSymbol.font.setFamily("Times");
				 	textSymbol.font.setSize("12pt");
				 	textSymbol.font.setWeight(600);
				 var graphic = new Graphic(point,textSymbol,{type:"zongheValue"});
				 map.graphics.add(graphic);
			 }
			 
//			 mouseLastValue = evt.graphic.attributes.NAME;
			 
		})
		
		fLayerLast.on("update-end",function(evt){
			var graphics = evt.target.graphics;
			var json = {type:"3",code:cityCode};
			ajaxPost('/seimp/warn/getshangzhi',json).done(function(result){
				var data = result.data;
				if(result.data!=null){
						var provinceValue = data.sc;
						for (var currCode in provinceValue) {
							var currItem = provinceValue[currCode];
							for (var j = 0; j < graphics.length; j++) {
								var currGra = graphics[j];
								if(currGra.attributes.CODE==currCode){
									currGra.attributes.value = currItem;
								}
							}
						}
				}
			});
		})
		
			//ajax获取各省产粮油大县的数量
		 var json = {type:"3",code:cityCode};
		ajaxPost('/seimp/warn/getshangzhi',json).done(function(result){
			
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data!=null){
//					
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 1;
					/*for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.value<minCount){
							minCount = currItem.value;
						}
						if(currItem.value>maxCount){
							maxCount = currItem.value;
						}
					}*/
					//处理最大值
//					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/5;
					
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					cityMinCount = minCount;
					cityCount = count;
					
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
					var provinceValue = data.sc;
					for (var currCode in provinceValue) {
						//当前省份的综合评估得分
						var currItem = provinceValue[currCode];
						if(minCount<=currItem && currItem<minCount+count*1){
							renderer.addValue(currCode, symbol1);
						}else if(minCount+count*1<=currItem && currItem<minCount+count*2){
							renderer.addValue(currCode, symbol2);
						}else if(minCount+count*2<=currItem && currItem<minCount+count*3){
							renderer.addValue(currCode, symbol3);
						}else if(minCount+count*3<=currItem && currItem<minCount+count*4){
							renderer.addValue(currCode, symbol4);
						}else if(minCount+count*4<=currItem && currItem<=minCount+count*5){
							renderer.addValue(currCode, symbol5);
						}
					}
					//为分省地图设置渲染
					fLayerLast.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(fLayerLast,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					fLayerLast.on("update-end",function(){
						initLastCount(data);
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
						initLastCount();
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
	 		var graphicsLayer = new GraphicsLayer({id:"cityGraphicsLayer"});
	 		graphicsLayer.setMinScale(1155583.41974);
	 		//获取省界图层的Graphics
	 		var feaGraphics = map.getLayer("cityFeatureLayer").graphics;
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
	 		
	 		
	 		map.addLayer(graphicsLayer);
	 		
	 	});//--require end
}



/*******列表分页*****************/
function pageclick(currentPage){

	var start = pagesize * (currentPage-1);
	var end = pagesize * currentPage;
	if(end>newsArr.length){
		end = newsArr.length;
	}
	var html = "<table class='table'>";
	var j = 1;
	for (var i = start; i < end; i++) {
		 var content = newsArr[i].title;
			if(newsArr[i].title.length>15){
				content = newsArr[i].title.substring(0,14)+"...";
			}
			html += "<tr><td class='tdstyle'>"+(i+1)+"</td><td><a href='/seimp/index.html#yuqingDetails?nids="+newsArr[i].newsid+"&type=wangluo' target='_blank' title='"+newsArr[i].title+"'>"+content+"</a></td></tr>";
		j++;
	}
	html +="</table>";
	/*if(pageIndex!=0){
		html += "<a onclick=pageclick('up') >上一页</a>";
	}
	if(pageIndex<newsArr.length/pagesize){
		html += "<a onclick=pageclick('down') >下一页</a>";
	}*/
	html += createpagebutton(currentPage);
	map.infoWindow.setContent(html);
}

function createpagebutton(currentPage){
    var html = "<div class='boxButton'>";
    if(pageCount<=7){
        for (var i = 1; i <= pageCount ; i++) {
            if(currentPage==i){
                html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>"+i+"</button>";
            }else{
                html += "<button class='btn btn-default' style='padding: 3px 6px;' onclick=pageclick("+i+")>"+i+"</button>";
            }

        }
        return html;
    }else{
        if(currentPage==1){
            html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>"+1+"</button>";
        }else{
            html += "<button class='btn btn-default'  style='padding: 3px 6px;' onclick=pageclick("+1+")>"+1+"</button>";
        }
        if(currentPage>=3){
            html += "<button class='btn btn-default' style='padding: 3px 6px;'>...</button>";
        }
        var start = currentPage-1;
        var end = currentPage+1;
        if(start<=2){
            start = 2;
            end = 4;
        }
        if(end>=pageCount-1){
            end=pageCount-1;
            start=pageCount-4;
        }
        for(var i=start;i<=end;i++){
            if(currentPage==i){
                html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>"+i+"</button>";
            }else{
                html += "<button class='btn btn-default' style='padding: 3px 6px;' onclick=pageclick("+i+")>"+i+"</button>";
            }
        }
        if(currentPage<=pageCount-3){
            html += "<button class='btn btn-default' style='padding: 3px 6px;'>...</button>";
        }
        if(currentPage==pageCount){
            html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>"+pageCount+"</button>";
        }else{
            html += "<button class='btn btn-default' style='padding: 3px 6px;' onclick=pageclick("+pageCount+")>"+pageCount+"</button>";
        }
        html += "</div>"
        return html;
    }

}
/**************页面加载****************/
$(function(){
	/**********右上角按钮****/
	$("#country").click(function(){
		//点击全国按钮的时候，隐藏省、市
		$("#province").addClass("none");
		$("#city").addClass("none");
		updateCountry(true);
	})
	
	$("#province").click(function(){
		//点击省份按钮的时候，隐藏市
		$("#city").addClass("none");
		updateProvince(false);
	})
	
	$("#city").click(function(){
		updateCity(false);
	})
})	

/****行业筛选*******/
//生成地图下方的行业筛选列表
function createInsutryClick(){
	//重新更新下方的企业类别选择条
	var html ="<li class='lt metal' onclick=switchIndustry('',$(this))>全部</li>";
	if(industryArr.length>0){
		for (var i = 0; i < industryArr.length; i++) {
			var currObj = industryArr[i];
			if(i==industryArr.length-1){
				html +="<li class='lt' value='' >网络举报</li>";
			}
			html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
		}
	}
//	html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
	$("#mapItem").html(html);
}

//行业选择
function switchIndustry(switchIndustry,obj){
	yuqingType=switchIndustry;
	mapIndustry = switchIndustry;
	$(obj).siblings().removeClass("metal");
	$(obj).addClass("metal");
	//更新舆情
	if(mapType=="1"){//全国模式
		updateCountry(true);
	}else if(mapType=="2"){//某一个省的所有市模式
		updateProvince(true);
	}else if(mapType=="3"){//某一个市的所有点位模式
		updateCity(true);
	}
	
}

/**********地图相关方法**************/
//生成图例
function updateLegend(minCount,count){
	$("#ditu li:eq(0) div:eq(1)").html(minCount.toFixed(2)+"-"+(minCount+count*1).toFixed(2));
	$("#ditu li:eq(1) div:eq(1)").html((minCount+count*1).toFixed(2)+"-"+(minCount+count*2).toFixed(2));
	$("#ditu li:eq(2) div:eq(1)").html((minCount+count*2).toFixed(2)+"-"+(minCount+count*3).toFixed(2));
	$("#ditu li:eq(3) div:eq(1)").html((minCount+count*3).toFixed(2)+"-"+(minCount+count*4).toFixed(2));
	$("#ditu li:eq(4) div:eq(1)").html((minCount+count*4).toFixed(2)+"-"+(minCount+count*5).toFixed(2));
	
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

/*****悬浮窗**************/
$(function(){
	
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
			$(this).siblings(":eq(1),:eq(2)").removeClass("active");
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
				if($(this).siblings(":eq(0)").hasClass("active")){
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
				if($(this).siblings(":eq(0)").hasClass("active")){
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
})//--load end

/*******右边悬浮窗方法****/
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


