//更新全国模式 true：加载 false：显示
function updateCountry_1(flag){
	//关闭弹出框
	map.infoWindow.remove();
	//清除企业名称
	removeGraphic("graphicName");
	//显示国界线图层
	showGuojie();
	//处理图例
	$("#mylegend .sldeDown p:eq(0)").removeClass("none");
	$("#mylegend .sldeDown ul:eq(0)").removeClass("none");
	$("#mylegend .sldeDown p:eq(1)").addClass("none");
	$("#mylegend .sldeDown ul:eq(1)").addClass("none");
	
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
	if(map.getLayer("qiye")!=null){
		map.getLayer("qiye").setVisibility(false);
	}
//	map.centerAndZoom([108,34],3);
	map.setExtent(extent);
	if(flag){
		if(map.getLayer("countryFeatureLayer")!=null){
			map.removeLayer(map.getLayer("countryFeatureLayer"));
		}
		if(map.getLayer("countryGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("countryGraphicsLayer"));
		}
		//加载
		initCountry_1();
	}else{
		//清除高亮
		removeGraphic("provinceClick");
		
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
function updateProvince_1(flag){
	//关闭弹出框
	map.infoWindow.remove();
	//清除企业名称
	removeGraphic("graphicName");
	//清除国界线图层
	hideGuoJie();
	//处理图例
	$("#mylegend .sldeDown p:eq(0)").removeClass("none");
	$("#mylegend .sldeDown ul:eq(0)").removeClass("none");
	$("#mylegend .sldeDown p:eq(1)").addClass("none");
	$("#mylegend .sldeDown ul:eq(1)").addClass("none");
	
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
	if(map.getLayer("qiye")!=null){
		map.getLayer("qiye").setVisibility(false);
	}
	if(flag){
		if(map.getLayer("provinceFeatureLayer")!=null){
			map.removeLayer(map.getLayer("provinceFeatureLayer"));
		}
		if(map.getLayer("provinceGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("provinceGraphicsLayer"));
		}
		//加载
		initProvince_1();
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
function updateCity_1(flag){
	//关闭弹出框
	map.infoWindow.remove();
	//清除企业名称
	removeGraphic("graphicName");
	//清除国界线图层
	hideGuoJie();
	//处理图例
	$("#mylegend .sldeDown p:eq(0)").addClass("none");
	$("#mylegend .sldeDown ul:eq(0)").addClass("none");
	$("#mylegend .sldeDown p:eq(1)").removeClass("none");
	$("#mylegend .sldeDown ul:eq(1)").removeClass("none");
	
	//记录地图模式
	mapType = "3";
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
		if(map.getLayer("qiye")!=null){
			map.removeLayer(map.getLayer("qiye"));
		}
		//加载
		initCounty_1();
	}else{
		removeGraphic("provinceClick");
		map.graphics.add(cityClick);
		map.setExtent(cityExtent);
		//显示
		if(map.getLayer("qiye")!=null){
			map.getLayer("qiye").setVisibility(true);
		}
	}
}

//加载全国图层
function initCountry_1(){
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
		 
	 	var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
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
			 //显示右上角按钮
			 $("#province").removeClass("none");
			//点击某一个省份的时候，隐藏右上角的某一个市的按钮
			 $("#city").addClass("none");
			 //更新某一个省的点位图层
			 updateProvince_1(true);
		 });
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
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
		//添加鼠标移出事件
		featureLayer.on("mouse-out",function(){
			removeGraphic("provinceHigh");
		})
		 
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
			addGuojie();
		})
		
	 	 //ajax获取各省产粮油大县的数量
		 var json = {industry:mapIndustry};
		 ajaxPost('/seimp/pic/getYGHC1.do',json).done(function(result){
			if(result.status==0){//请求成功
				if(result.data.length>0){
					var data = result.data;
					//模拟数据
					/*var data = [{
						province:'110000',
						count:1
					},{
						province:'120000',
						count:1
					},{
						province:'130000',
						count:3
					}];*/
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 0;
					for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.count<minCount){
							minCount = currItem.count;
						}
						if(currItem.count>maxCount){
							maxCount = currItem.count;
						}
					}
					//处理最大值
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
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([247,252,245,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([229,245,224,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([199,233,192,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([161,217,155,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([116,196,118,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([65,171,93,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.province, symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.province, symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.province, symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.province, symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.province, symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.province, symbol6);
						}
					}
					//为分省地图设置渲染
//					featureLayer.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initCountryCount_1(data);
					})
					zhongdianTable(data)
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
//					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initCountryCount_1();
					})
					zhongdianTable(0)
				}
			}
		});//--ajax end
	});//-require end
}

//加载各省数字图层
function initCountryCount_1(data){
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
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.PROV_CODE==currItem.province){
					
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
					if(currItem.count.toString().length==1){
						symbolSize = 24;
					}else if(currItem.count.toString().length==2){
						symbolSize = 30;
					}else if(currItem.count.toString().length==3){
						symbolSize = 40;
					}else if(currItem.count.toString().length==4){
						symbolSize = 50;
					}else if(currItem.count.toString().length==5){
						symbolSize = 60;
					}else{
						symbolSize = currItem.count.toString().length*12;
					}
					
					var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
					var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
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
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//加载某一个省的所有市图层
function initProvince_1(){
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
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
	 	var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
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
			 updateCity_1(true);
		 });
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
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
		//添加鼠标移出事件
		featureLayer.on("mouse-out",function(){
			removeGraphic("provinceHigh");
		})
		
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
		})
		 

	 	 //ajax获取某一个省的各个市的数量
		 var json = {industry:mapIndustry,code:provinceCode};
		 ajaxPost('/seimp/pic/getYGHC2.do',json).done(function(result){
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data.length>0){
					
					//处理数据，获取各市数量的最大值最小值
					var minCount = 0;
					var maxCount = 0;
					for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.count<minCount){
							minCount = currItem.count;
						}
						if(currItem.count>maxCount){
							maxCount = currItem.count;
						}
					}
					//重新计算最大值
					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					provinceMinCount = minCount;
					provinceCount = count;
					
					//设置分市底图各个分段的symbol
			 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([247,252,245,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([229,245,224,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([199,233,192,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([161,217,155,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([116,196,118,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([65,171,93,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.code.substr(0, 4), symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.code.substr(0, 4), symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.code.substr(0, 4), symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.code.substr(0, 4), symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.code.substr(0, 4), symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.code.substr(0, 4), symbol6);
						}
					}
					//为分市地图设置渲染
//					featureLayer.setRenderer(renderer);
					//将分市地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initProvinceCount_1(data);
					})
					zhongdianTable(data)
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
//					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initProvinceCount_1(data);
					})
					zhongdianTable(0)
				}
			}
		});//--ajax end
	});//-require end
}

//加载某一个省各市的数字图层
function initProvinceCount_1(data){
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
//		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("provinceFeatureLayer").graphics;
		
		//添加市名
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
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.KIND_1==currItem.code.substr(0,4)){
					
					var attributes = {
							countyCode:currItem.code,
							countyName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 24;
					if(currItem.count.toString().length==1){
						symbolSize = 24;
					}else if(currItem.count.toString().length==2){
						symbolSize = 30;
					}else if(currItem.count.toString().length==3){
						symbolSize = 40;
					}else if(currItem.count.toString().length==4){
						symbolSize = 50;
					}else if(currItem.count.toString().length==5){
						symbolSize = 60;
					}else{
						symbolSize = currItem.count.toString().length*12;
					}
					
					var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
					var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
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
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//加载某一个县的所有地块的点位信息
function initCounty_1(){
	/*if(graphicsLayer!=null){
		map.removeLayer(graphicsLayer);
	}*/
	require(["esri/layers/GraphicsLayer","esri/InfoTemplate",
	         "esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol",
	         "esri/symbols/TextSymbol","esri/symbols/Font","esri/Color"
	],function(GraphicsLayer,InfoTemplate,
			Graphic,Point,PictureMarkerSymbol,
			TextSymbol,Font,Color
	){
		var json = {industry:mapIndustry,code:cityCode};
		ajaxPost("/seimp/pic/getYGHC3.do", json).done(function(result){
			if(result.status==0&&result.data.length>0){
				var data = result.data;
//				data = [{
//					enterpriseName:"河北吉藁化纤有限责任公司",
//					province:"河北省",
//					city:"石家庄市",
//					district:"藁城区",
//					industry:"化工",
//					remark:"产废",
//					longitude:"114.88403",
//					latitude:"38.041968",
//					address:"河北省石家庄市藁城区东宁路２号",
//					phone:"0310-58323388"
//				}]
				
				var template = new InfoTemplate();
				template.setTitle("企业信息")
				template.setContent(getContent);
				var graphicsLayer = new GraphicsLayer({"id":"qiye",infoTemplate:template});
				map.addLayer(graphicsLayer);
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					if(itemData.LONGITUDE&&itemData.LATITUDE&&itemData.DALEI){
						//获取图标文件名称
						var pictureUrl = getImgName(itemData.DALEI);
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/zhongdianqiye/'+pictureUrl+'.png', 25, 25);
						var attriubtes = {
								enterpriseName: itemData.NAME!=null?itemData.NAME:"",		
								province: itemData.SHENG!=null?itemData.SHENG:"",	
								city: itemData.SHI!=null?itemData.SHI:"",
			        			district: itemData.XIAN!=null?itemData.XIAN:"",	
			        			xiang: itemData.XIANG!=null?itemData.XIANG:"",	
			        			cun: itemData.CUN!=null?itemData.CUN:"",	
			        			laiyuan: itemData.LAIYUAN!=null?itemData.LAIYUAN:"",	
			        			industry: itemData.DALEI!=null?itemData.DALEI:"",				
			        			remark: itemData.REMARK!=null?itemData.REMARK:"",
			                    longitude: itemData.LONGITUDE,
			                    latitude: itemData.LATITUDE,
			        			type: "qiye"
						}
						var point = new Point(itemData.LONGITUDE,itemData.LATITUDE);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}
				}
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<p>企业名称:<code>' + attributes.enterpriseName + '</code></p>'+
					'<p>所属省份:<code>' + attributes.province + '</code></p>'+
					'<p>所属城市:<code>' + attributes.city + '</code></p>'+
					'<p>所属县区:<code>' + attributes.district + '</code></p>'+
					'<p>所属乡镇:<code>' + attributes.xiang + '</code></p>'+
					'<p>所属村:<code>' + attributes.cun + '</code></p>'+
					'<p>来源:<code>' + attributes.laiyuan + '</code></p>'+
					'<p>备注:<code>' + attributes.remark + '</code></p>'+
					'<p>行业类别:<code>' + attributes.industry + '</code></p><hr/>'+
					'<p><code style="cursor:pointer;color:#038AEC;"><a style="cursor: default;">环统数据</a></code><code style="cursor:pointer;color:#038AEC;"><a target="_blank" href="http://10.100.241.203:9090/DataCenterController/index.vm?tomenuid=20170801-d8ae-4b3f-a778-bb532400a1af&name=' + attributes.enterpriseName + '">污染源普查数据</a></code><code style="cursor:pointer;color:#038AEC;"><a style="cursor: default;">排污许可证数据</a></code></p>';
				}
				
				//改变弹出框大小
				graphicsLayer.on("click",function(evt){
					//改变地图中心
					map.centerAt(evt.graphic.geometry);
					
					//回复之间的gif
					var graphics = map.getLayer("qiye").graphics;
					for (var i = 0; i < graphics.length; i++) {
						var currGra = graphics[i];
						currGra.setSymbol(currGra.symbol.setUrl(currGra.symbol.url.replace(".gif",".png")));
					}
					//改变当前的png为gif
					evt.graphic.setSymbol(evt.graphic.symbol.setUrl(evt.graphic.symbol.url.replace(".png",".gif")));
					map.getLayer("qiye").redraw();
					
					 map.infoWindow.resize("270","340");
					 $(".close").click(function(){
							map.infoWindow.remove();
					 })
				})
				
				//鼠标移上去，显示企业名称
				graphicsLayer.on("mouse-over",function(evt){
					removeGraphic("graphicName");
					var offsetX = evt.graphic.attributes.enterpriseName.length*13.3/2;
					var font = new Font().setSize("12pt");
					var symbol = new TextSymbol(evt.graphic.attributes.enterpriseName,font)
									.setOffset(offsetX,20).setHaloColor(new Color([255, 255, 255])).setHaloSize(3);
					var graphic = new Graphic(evt.mapPoint,symbol,{type:"graphicName"});
					map.graphics.add(graphic);
				})
			}
		});//ajax end
	});//require end
}

//表格数据
function  zhongdianTable(data){
	if ( data != 0 ) {
		isSelect =1;
		if (data.length>0){
			var headHtml = "<thead> <tr><td>序号</td><td>地区</td><td>重点行业企业数量(家)</td></tr></thead><tbody>";
			var num = 1;
			$.each(data,function(i,item){
				if (item.name != null ){
					headHtml += '<tr><td>'+num+'</td><td>'+item.name+'</td><td>'+item.count+'</td></tr>';
					num++;
				}
				
			})
		}
		headHtml += '</tbody>';
		$("#tongjibiao").html(headHtml);
	} else {
		isSelect = 0;
	}
}
	