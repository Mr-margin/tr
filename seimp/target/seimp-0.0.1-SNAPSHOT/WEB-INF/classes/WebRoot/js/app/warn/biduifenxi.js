/******变量*******/
var map;
var clusterLayer = null;
/***********右边悬浮窗变量**********/
var isHaveData={//是否有统计图、统计表、时间轴数据
		tongjibiao:1,
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
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent","extras/DEBubblePopup",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,DEBubblePopup,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			InfoWindowLite,domConstruct
	){
		extent = new Extent(extentPar);
		var infoWindow = new  DEBubblePopup();
		//初始化地图
		map = new Map("map",{
			logo:false,
			minZoom:2,
			center:[108,34],
			zoom:3,
			showLabels:true,
			extent:extent,
			infoWindow:infoWindow
		})
		
		//设置弹出框样式
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
//        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		initLayerByUser();
		
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
	
	getTable("000000",1)
	getTable("000000",2)
	
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
	require(["esri/map","esri/dijit/Legend","esri/InfoTemplate",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,InfoTemplate,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		var template = new InfoTemplate();
		template.setTitle("比对结果信息")
		template.setContent(getContent);
		function getContent(graphic){
			var attributes = graphic.attributes;
			return"<p>自行发布：<code>"+attributes.zbnum+" 家</code></p>"
			 						+ "<p>遥感核查：<code>"+attributes.yghcnum+" 家</code></p>"
			 						+ "<p>相同企业：<code>"+attributes.samenum+" 家</code></p>"
			 						+ "<p>占比比值：<code>"+new Number(attributes.value).toFixed(2)+"%</code></p>";
		}
		 //加载地图服务
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"countryFeatureLayer"
	     });//infoTemplate:template
		 
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
		 
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]), 0.5);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);
	 
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
			 $("#province").val(evt.graphic.attributes.PROV_CODE);
			 
			 //显示右上角按钮
			 $("#province").removeClass("none");
			 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
			 $("#city").addClass("none");
			 //更新某一个省的点位图层
			 updateProvince(true);

	         $(".close").click(function(){
		    		map.infoWindow.remove();
		     });
	         getTable(evt.graphic.attributes.PROV_CODE,1);
	         getTable(evt.graphic.attributes.PROV_CODE,2);
	         
	         
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
				 point.x = point.x;
				 point.y = point.y;
				 function getContent(graphic){
					 
					var attributes = graphic.attributes;
					return"<p>自行发布：<code>"+attributes.zbnum+" 家</code></p>"
					 						+ "<p>遥感核查：<code>"+attributes.yghcnum+" 家</code></p>"
					 						+ "<p>相同企业：<code>"+attributes.samenum+" 家</code></p>"
					 						+ "<p>占比比值：<code>"+new Number(attributes.value).toFixed(2)+"%</code></p>";
				}
				map.infoWindow.setTitle("比对结果信息");
				map.infoWindow.setContent(getContent(evt.graphic));
				map.infoWindow.show(point);
	        	$(".close").click(function(){
					map.infoWindow.remove();
				});
	        	var top = parseInt($(".dextra-bubble-pop").css('top'))-110;
	        	var left =parseInt( $(".dextra-bubble-pop").css('left'))+10;
	        	$(".dextra-bubble-pop").css({'left':left,'top':top})
			 } else{
				 map.infoWindow.remove();
			 }
		})
		 
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
			addGuojie();
		})
		
		featureLayer.on("update-end",function(evt){
			var graphics = evt.target.graphics;
			var json = {type:"1",code:""};
			ajaxPost('/seimp/warn/getBDFX',json).done(function(result){
				var data = result.data;
				if(result.data!=null){
						var provinceValue = data.sc;
						for (var currIdx in provinceValue) {
							var currItem = provinceValue[currIdx]["RATE"];
							var currCode = provinceValue[currIdx]["code"];
							for (var j = 0; j < graphics.length; j++) {
								var currGra = graphics[j];
								if(currGra.attributes.PROV_CODE==currCode){
									currGra.attributes.value = currItem;
									currGra.attributes.yghcnum = provinceValue[currIdx]["YGHCNUM"];
									currGra.attributes.zbnum = provinceValue[currIdx]["ZBNUM"];
									currGra.attributes.samenum = provinceValue[currIdx]["NUM"];
								}
							}
						}
				}
			});
		})
		
	 	 //ajax获取各省产粮油大县的数量
		 var json = {type:"1",code:""};
		ajaxPost('/seimp/warn/getBDFX',json).done(function(result){
			
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data!=null){
//					
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 1;
					//处理最大值
					maxCount = maxmain2(data.maxNum);
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
					
					var provinceValue = data.sc;
					for (var currIdx in provinceValue) {
						var currItem = parseFloat(provinceValue[currIdx]["RATE"]);
						var currCode = provinceValue[currIdx]["code"];
						if(minCount<=currItem && currItem<minCount+count*1){
							renderer.addValue(currCode, symbol1);
						}else if(minCount+count*1<=currItem && currItem<minCount+count*2){
							renderer.addValue(currCode, symbol2);
						}else if(minCount+count*2<=currItem && currItem<minCount+count*3){
							renderer.addValue(currCode, symbol3);
						}else if(minCount+count*3<=currItem && currItem<minCount+count*4){
							renderer.addValue(currCode, symbol4);
						}else if(minCount+count*4<=currItem){//去掉“ && currItem<=minCount+count*5”，保证超出部分也能正确显示
							renderer.addValue(currCode, symbol5);
						}
					}
					//为分省地图设置渲染
//					featureLayer.setRenderer(renderer);
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
		"esri/geometry/Point", "esri/symbols/Font",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
			SimpleMarkerSymbol, SimpleLineSymbol,
	        PictureMarkerSymbol, CartographicLineSymbol, 
	        Graphic, TextSymbol,GraphicsLayer,
	        Point,Font,
	        Color, dom, on
	  	){
		var graphicsLayer = new GraphicsLayer({id:"countryGraphicsLayer"});
//		graphicsLayer.setMinScale(18489334.7159);
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
			if (currFeaGraphic.attributes.NAME!="澳门特别行政区" && currFeaGraphic.attributes.NAME!="香港特别行政区"){
				var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
				var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
				symbol.font.setSize("10pt");
				symbol.font.setWeight(700);
				symbol.font.setFamily("微软雅黑");
				symbol.setOffset(0,-14);
				var graphic = new Graphic(point,symbol);
				graphicsLayer.add(graphic);
			}
		}
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.sc.length; j++) {
				var currItem = data.sc[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.PROV_CODE==currItem.code){
					var attributes = {
							provoinceCode:currItem.code,
							provinceName:currItem.SHENG
					}
					var point = currFeaGraphic.geometry.getCentroid();
					//处理河北省
					if(currFeaGraphic.attributes.PROV_CODE=="130000"){
						point = new Point([115.18,38]);
					}
					var symbolSize = 30;
					var ste = 0;
					if (currItem.RATE == null ){
						currItem.RATE = 0 ;
						ste = 0
					} else {
						ste = parseFloat(currItem.RATE).toFixed(2)+"%"
						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", 45, 45).setOffset(0,45/2);
						var symbol2 = new TextSymbol(ste).setOffset(0,45/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
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
		 
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]), 0.5);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);
		 
		 //添加点击事件
		 featureLayer.on("click",function(evt){
			  getTable(evt.graphic.attributes.KIND_1+"00",1);
			  getTable(evt.graphic.attributes.KIND_1+"00",2);
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
			 $("#city").val(evt.graphic.attributes.KIND_1+"00");
			 //显示右上角按钮
			 $("#city").removeClass("none");
			 //更新一个市的点位
			 updateCity(true);
//			
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
				 point.x = point.x;
				 point.y = point.y;
				 function getContent(graphic){
					var attributes = graphic.attributes;
					return"<p>自行发布：<code>"+attributes.zbnum+" 家</code></p>"
					 						+ "<p>遥感核查：<code>"+attributes.yghcnum+" 家</code></p>"
					 						+ "<p>相同企业：<code>"+attributes.samenum+" 家</code></p>"
					 						+ "<p>占比比值：<code>"+new Number(attributes.value).toFixed(2)+"%</code></p>";
				}
				map.infoWindow.setTitle("比对结果信息");
				map.infoWindow.setContent(getContent(evt.graphic));
				map.infoWindow.show(point);
	        	$(".close").click(function(){
					map.infoWindow.remove();
				});
	        	var top = parseInt($(".dextra-bubble-pop").css('top'))-110;
	        	var left =parseInt( $(".dextra-bubble-pop").css('left'))+10;
	        	$(".dextra-bubble-pop").css({'left':left,'top':top})
			 } else {
				 map.infoWindow.remove();
			 }
			 
		})
		
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('body', 'end');
		})
		
		
		featureLayer.on("update-end",function(evt){
			var graphics = evt.target.graphics;
			var json = {type:"2",code:provinceCode};
			ajaxPost('/seimp/warn/getBDFX2',json).done(function(result){
				var data = result.data;
				if(result.data!=null){
						var provinceValue = data.sc;
						for (var currIdx in provinceValue) {
							var currItem = provinceValue[currIdx]["RATE"];
							var currCode = provinceValue[currIdx]["code"];
							for (var j = 0; j < graphics.length; j++) {
								var currGra = graphics[j];
								if(currGra.attributes.KIND_1+"00"==currCode){
									currGra.attributes.value = currItem;
									currGra.attributes.yghcnum = provinceValue[currIdx]["YGHCNUM"];
									currGra.attributes.zbnum = provinceValue[currIdx]["ZBNUM"];
									currGra.attributes.samenum = provinceValue[currIdx]["NUM"];
								}
							}
						}
				}
			});
		})
		 

	 	 //ajax获取各省产粮油大县的数量
		 var json = {type:"2",code:provinceCode};
		ajaxPost('/seimp/warn/getBDFX2',json).done(function(result){
			
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data!=null){
//					
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 1;
					//处理最大值
					maxCount = maxmain2(data.maxNum);
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
					
					var provinceValue = data.sc;
					for (var currIdx in provinceValue) {
						var currItem = provinceValue[currIdx]["RATE"];
						var currCode = provinceValue[currIdx]["code"];
						if(minCount<=currItem && currItem<minCount+count*1){
							renderer.addValue(currCode.substr(0,4), symbol1);
						}else if(minCount+count*1<=currItem && currItem<minCount+count*2){
							renderer.addValue(currCode.substr(0,4), symbol2);
						}else if(minCount+count*2<=currItem && currItem<minCount+count*3){
							renderer.addValue(currCode.substr(0,4), symbol3);
						}else if(minCount+count*3<=currItem && currItem<minCount+count*4){
							renderer.addValue(currCode.substr(0,4), symbol4);
						}else if(minCount+count*4<=currItem){// && currItem<=minCount+count*5
							renderer.addValue(currCode.substr(0,4), symbol5);
						}
					}
					//为分省地图设置渲染
//					featureLayer.setRenderer(renderer);
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
//					featureLayer.setRenderer(renderer);
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
		var feaGraphics = map.getLayer("provinceFeatureLayer").graphics;
		//添加市名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.sc.length; j++) {
				var currItem = data.sc[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.KIND_1==currItem.code.substr(0,4)){
					
					var attributes = {
							countyCode:currItem.code,
							countyName:currItem.SHI
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 30;
					var ste = 0;
					if (currItem.RATE == null ){
						currItem.RATE = 0 ;
						ste = 0
					} else {
						ste = parseFloat(currItem.RATE).toFixed(2)+"%"
						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", 45, 45).setOffset(0,45/2);
						var symbol2 = new TextSymbol(ste).setOffset(0,45/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
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
		SimpleFillSymbol1, SimpleLineSymbol, Color,
		TextSymbol,LabelClass
){
		var fLayerLast = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"lastFeatureLayer"
	     });
		fLayerLast.setDefinitionExpression("CODE like '"+(cityCode).substr(0, 4)+"%'");

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
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
		var renderer = new SimpleRenderer(defaultSymbol);
		fLayerLast.setRenderer(renderer);
		
		map.addLayer(fLayerLast);
		
		
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
				 point.x = point.x;
				 point.y = point.y;
				 function getContent(graphic){
					var attributes = graphic.attributes;
					return"<p>自行发布：<code>"+attributes.zbnum+" 家</code></p>"
					 						+ "<p>遥感核查：<code>"+attributes.yghcnum+" 家</code></p>"
					 						+ "<p>相同企业：<code>"+attributes.samenum+" 家</code></p>"
					 						+ "<p>占比比值：<code>"+new Number(attributes.value).toFixed(2)+"%</code></p>";
				}
				map.infoWindow.setTitle("比对结果信息");
				map.infoWindow.setContent(getContent(evt.graphic));
				map.infoWindow.show(point);
	        	$(".close").click(function(){
					map.infoWindow.remove();
				});
	        	var top = parseInt($(".dextra-bubble-pop").css('top'))-110;
	        	var left =parseInt( $(".dextra-bubble-pop").css('left'))+10;
	        	$(".dextra-bubble-pop").css({'left':left,'top':top})
			 } else {
				 map.infoWindow.remove();
			 }
		})
		
		fLayerLast.on("update-end",function(evt){
			var graphics = evt.target.graphics;
			var json = {code:cityCode};
			ajaxPost('/seimp/warn/getBDFX3',json).done(function(result){
				var data = result.data;
				if(result.data!=null){
						var provinceValue = data.sc;
						for (var currIdx in provinceValue) {
							var currItem = provinceValue[currIdx]["RATE"];
							var currCode = provinceValue[currIdx]["code"];
							for (var j = 0; j < graphics.length; j++) {
								var currGra = graphics[j];
								if(currGra.attributes.CODE==currCode){
									currGra.attributes.value = currItem;
									currGra.attributes.yghcnum = provinceValue[currIdx]["YGHCNUM"];
									currGra.attributes.zbnum = provinceValue[currIdx]["ZBNUM"];
									currGra.attributes.samenum = provinceValue[currIdx]["NUM"];
								}
							}
						}
				}
			});
		})
			//ajax获取各省产粮油大县的数量
		 var json = {code:cityCode};
 		console.log(json)
		ajaxPost('/seimp/warn/getBDFX3',json).done(function(result){
			
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data!=null){
//					
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 1;
					//处理最大值
					maxCount = maxmain2(data.maxNum);
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
					for (var currIdx in provinceValue) {
						var currItem = provinceValue[currIdx]["RATE"];
						var currCode = provinceValue[currIdx]["code"];
						if(minCount<=currItem && currItem<minCount+count*1){
							renderer.addValue(currCode, symbol1);
						}else if(minCount+count*1<=currItem && currItem<minCount+count*2){
							renderer.addValue(currCode, symbol2);
						}else if(minCount+count*2<=currItem && currItem<minCount+count*3){
							renderer.addValue(currCode, symbol3);
						}else if(minCount+count*3<=currItem && currItem<minCount+count*4){
							renderer.addValue(currCode, symbol4);
						}else if(minCount+count*4<=currItem){// && currItem<=minCount+count*5
							renderer.addValue(currCode, symbol5);
						}
					}
					//为分省地图设置渲染
//					fLayerLast.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(fLayerLast,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					fLayerLast.on("update-end",function(){
						initLastCount(data);
//						initLastCount(data,1);
					})
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"CODE");
//					fLayerLast.setRenderer(renderer);
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
function initLastCount(data){
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
		var feaGraphics = map.getLayer("lastFeatureLayer").graphics;
		console.log(feaGraphics);
		//添加市名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.sc.length; j++) {
				var currItem = data.sc[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.CODE==currItem.code){
					
					var attributes = {
							countyCode:currItem.code,
							countyName:currItem.XIAN
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 30;
					var ste = 0;
					if (currItem.RATE == null ){
						currItem.RATE = 0 ;
						ste = 0
					} else {
						ste = parseFloat(currItem.RATE).toFixed(2)+"%"
						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", 45, 45).setOffset(0,45/2);
						var symbol2 = new TextSymbol(ste).setOffset(0,45/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
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

/**********地图相关方法**************/
//生成图例
function updateLegend(minCount,count){
	$("#ditu li:eq(0) div:eq(1)").html(minCount.toFixed(2)+"-"+(minCount+count*1).toFixed(2));
	$("#ditu li:eq(1) div:eq(1)").html((minCount+count*1).toFixed(2)+"-"+(minCount+count*2).toFixed(2));
	$("#ditu li:eq(2) div:eq(1)").html((minCount+count*2).toFixed(2)+"-"+(minCount+count*3).toFixed(2));
	$("#ditu li:eq(3) div:eq(1)").html((minCount+count*3).toFixed(2)+"-"+(minCount+count*4).toFixed(2));
	$("#ditu li:eq(4) div:eq(1)").html(" > "+(minCount+count*4).toFixed(2));
	
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
			$(".float-tool-title").css("top","290px")
		}else if(classval=="table_nav"){
			$(".float-tool-title .title").html("统计表");
			$(".float-tool-title").css("top","328px");
		}else if(classval=="graphic_nav"){
			$(".float-tool-title .title").html("统计图");
			$(".float-tool-title").css("top","365px");
		}else if(classval=="time_nav"){
			$(".float-tool-title .title").html("时间轴");
			$(".float-tool-title").css("top","405px");
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
					$("#tongjituDiv").show();
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

$(document).ready(function () {
	
    var $div = $(".main_tabletop");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown", function (event) {
        /* 获取需要拖动节点的坐标 */
        var offset_x = $(this)[0].offsetLeft;//x坐标
        var offset_y = $(this)[0].offsetTop;//y坐标
        /* 获取当前鼠标的坐标 */
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;
        /* 绑定拖动事件 */
        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
        $(document).bind("mousemove", function (ev) {
            /* 计算鼠标移动了的位置 */
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;
            /* 设置移动后的元素坐标 */
            var now_x = (offset_x + _x ) + "px";
            var now_y = (offset_y + _y ) + "px";
            /* 改变目标元素的位置 */
            $div.css({
                top: now_y,
                left: now_x
            });
            $('#tongjituDiv').css({
                top: now_y,
                left: now_x
            });
        });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
    	var top = $div.css('top').split('px')
    	var left = $div.css('left').split('px')
    	if(top[0] < 0){
    		$div.css('top','5%')
    		$('#tongjituDiv').css('top','5%')
    	}
    	if(left[0] < 0){
    		$div.css('left','10px')
    		$('#tongjituDiv').css('left','10px')
    	}
        $(this).unbind("mousemove");
        $(this).unbind("mousemove");
    });
})
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

function maxmain2(oldmax) {
//	if (oldmax < 5) {
//        return 5;
//    }
//    var min = oldmax / 5;
//    var last = Math.ceil(min) * 5;
//    return last;
	return oldmax;
}


var columns = [{
	field: "RN",
    title: "序号",
},{
	field: "NM",
    title: "公司名称",
    formatter:function(value,row,index){
    	if(row.YOU === 1 ) {
    		return '<code>'+value+'</code>'
    	} else {
    		return value;
    	}
    }
},{
	field: "YOU",
    title: "是否相同",
    formatter:function(value,row,index){
    	if (value === 1 ){
    		return "相同";
    	}else {
    		return '不相同';
    	}
    }
}];

//统计表
function getTable(code,value){
	
	var div_id = "";
	var url ='';
	if (value===1) {
		div_id="tongjibiao";
		url='/seimp/warn/getZhfxTable';
	} else if(value ===2) {
		div_id = "tongjibiao1"
		url='/seimp/warn/getZhfxTable2';
	}

	$("#"+div_id).bootstrapTable("destroy");
	$("#"+div_id).bootstrapTable({
		url:url,
        method: 'post',
        queryParams: function(param) {
            return { "data":{"pageSize":param.pageSize, "pageNum":param.pageNumber,code:code}}
        },
        queryParamsType:"",
        pageSize:15,
        sidePagination: "server",
        responseHandler: function(res) {
//            //判断是否请求成功
            if (res.status == 0) {
                return res.data
            } else {
                //当后台报错显示错误信息
                swal({
                    title: '查询错误！',
                    text: res.msg,
                    type: 'error',
                    confirmButton: "确定"
                })
            }
        },
        clickToSelect:true,
        striped:true,
        pagination: true,
        columns:columns
	});
}
document.getElementById("tab1").addEventListener('click',function(e){
	$("#table1").show();
	$("#table2").hide();
});
document.getElementById("tab2").addEventListener('click',function(e){
	$("#table1").hide();
	$("#table2").show();
});
document.getElementById("city").addEventListener('click',function(e){
	getTable($(this).val(),1)
	getTable($(this).val(),2)
});
document.getElementById("province").addEventListener('click',function(e){
	getTable($(this).val(),1)
	getTable($(this).val(),2)
});
document.getElementById("country").addEventListener('click',function(e){
	getTable("000000",1)
	getTable("000000",2)
});

