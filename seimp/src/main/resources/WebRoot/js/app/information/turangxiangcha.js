/******变量*******/

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


var industryPar = "1";//2:有机物 1：无机物
var wuranType="totalCount";//选中的污染类型
var quyuType="0"//0全国 1某个省 2某个市


/********页面加载**********/
$(function(){
	//污染类型按钮
	$("#xiangmuDiv button").click(function(){
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
})	


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
function updateCountyLayer(){
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
		$("#mapItem li:eq(2)").addClass("metal");
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
var test_year =2016;
//加载分省
function addProvinceLayer(){
    // try{
    //     map.removeLayer(map.getLayer("countryFeatureLayer"));
    // } catch (e) {
    // }

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
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]), 0.5);
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

		fLayerProvince.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
			//添加国界线图层
//			addGuojie();
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
			$('#country').addClass('active_left')
			$("#province").addClass("active_right");
			//显示右上角的省份按钮
			$("#province").text(evt.graphic.attributes.NAME);
			$("#province").removeClass("none");
			
			//隐藏县按钮
			$("#city").addClass("none");
			//区域类型变为1，某一个省的数据
			quyuType = 1;
		})

		$.ajax({
			type:"GET",
			url:"demo.json",
			dataType:"json",
			success:function(result){
				var data;

				for ( var i = 0 ; i < result.length; i ++ ) {
                    if(result[i].year == test_year){
                    	data = result[i].value;
					}
				}
                // console.log(data)
                test_year ++;
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
                if(test_year == 2019 ) {
                    test_year=2016;
                }
                //为分省地图设置渲染
//						fLayerProvince.setRenderer(renderer);
                //将分省地图添加到地图上
                map.addLayer(fLayerProvince,2);
                //分段渲染的底图加载完成之后，才能加载数字图层
                fLayerProvince.on("update-end",function(){
                    //添加统计图
                    //添加数字图层
                    initCountryCount(data,maxTotalCount);
                })
			}
		})
			//销毁图例
		
			//设置分段渲染
			//ajax获取各省产粮油大县的数量
// 			var json = {type:industryPar};
// 			ajaxPost('/seimp/warn/overproof_Pro.do',json).done(function(result){
// 				console.log(result)
// 				if(result.status==0){//请求成功
// 					console.log(result)
// 					if(result.data.length>0){
// 						var data = result.data;
// 						//模拟数据
// 						//处理数据，获取各省数量的最大值最小值
// 						var minCount = 0;
// 						var maxCount = 0;
// 						var maxTotalCount = 0;
// 						for(var i=0;i<data.length;i++){
// 							var graphics = fLayerProvince.graphics;
// 				            if(graphics&&graphics.length>0){
// 				           	   	for (var j = 0; j < graphics.length; j++) {
// 				           	   		var currGra = graphics[j];
// 				           	   		if(currGra.attributes.PROV_CODE==data[i].CODE){
// 				           	   			data[i].provinceName =  currGra.attributes.NAME;
// 				           	   		}
// 				           	   	}
// 				            }
// 				           data[i].totalCount = data[i].SLIGHT+data[i].LIGHT+data[i].MIDDLE+data[i].SERVERE;
// 				           /*if(i==0){
// 				        	   var minCount =  data[i][wuranType];
// 				        	   var maxCount =  data[i][wuranType];
// 				        	   var maxTotalCount = data[i].totalCount;
// 				           }*/
// 				           if(data[i][wuranType]<minCount){
// 				        	   minCount = data[i][wuranType];
// 				           }
// 				           if(data[i][wuranType]>maxCount){
// 				        	   maxCount = data[i][wuranType];
// 				           }
// 				           if(data[i].totalCount>maxTotalCount){
// 				        	   maxTotalCount = data[i].totalCount;
// 				           }
// 						}
// 						provinceTableData = data;
// 						updateTable(data);
//
// 						//重新计算最大值
// 						maxCount = maxmain(maxCount);
//
// 						var count = (maxCount - minCount)/6;
// 						//更新图例
// 						updateLegend(minCount,count);
// 						//记录图例参数
// 						countryMinCount = minCount;
// 						countryCount = count;
//
// 						//设置分省底图各个分段的symbol
// 				 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
// 				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
// 				 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
// 				 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
// 				 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
// 				 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
// 				 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
// 				 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
// 				 		renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
//
//
// 						//更新图例
// 	//					updateLegend(minCount,count);
//
// 						for (var i = 0; i < data.length; i++) {
// 							var currItem = data[i];
// 							if(minCount<=currItem[wuranType]&&currItem[wuranType]<minCount+count*1){
// 								renderer.addValue(currItem.CODE, symbol1);
// 							}else if(minCount+count*1<=currItem[wuranType]&&currItem[wuranType]<minCount+count*2){
// 								renderer.addValue(currItem.CODE, symbol2);
// 							}else if(minCount+count*2<=currItem[wuranType]&&currItem[wuranType]<minCount+count*3){
// 								renderer.addValue(currItem.CODE, symbol3);
// 							}else if(minCount+count*3<=currItem[wuranType]&&currItem[wuranType]<minCount+count*4){
// 								renderer.addValue(currItem.CODE, symbol4);
// 							}else if(minCount+count*4<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*5){
// 								renderer.addValue(currItem.CODE, symbol5);
// 							}else if(minCount+count*5<=currItem[wuranType]&&currItem[wuranType]<=minCount+count*6){
// 								renderer.addValue(currItem.CODE, symbol6);
// 							}
// 						}
// 						//为分省地图设置渲染
// //						fLayerProvince.setRenderer(renderer);
// 						//将分省地图添加到地图上
// 						map.addLayer(fLayerProvince,2);
// 						//分段渲染的底图加载完成之后，才能加载数字图层
// 						fLayerProvince.on("update-end",function(){
// 							//添加统计图
//
// 							//添加数字图层
// 							initCountryCount(data,maxTotalCount);
// 						})
//
//
// 					}else{//如果没有数据
// 						var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
// 				 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
// 						renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
// //						fLayerProvince.setRenderer(renderer);
// 						//更新图例
// 						updateLegend(0,0);
// 						map.addLayer(featureLayer,2);
// 						fLayerProvince.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
// 							initCountryCount(data,0);
// 						})
// 					}
//
// 				}
// 			});//--ajax end
		
		
	});
}
var jiazai = 0 ;
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
        if (jiazai == 0 ) {
            var graphicsLayer = new GraphicsLayer({id:"countryGraphicsLayer"});
            map.addLayer(graphicsLayer);
            jiazai  =1;
        } else {
            map.getLayer("countryGraphicsLayer").clear();
        }

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
			if( currFeaGraphic.attributes.NAME != "香港特别行政区" && currFeaGraphic.attributes.NAME != "澳门特别行政区"){
				var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
				symbol.font.setSize("10pt");
				symbol.font.setWeight(700);
				symbol.font.setFamily("微软雅黑");
				symbol.setOffset(0,-14);
				var graphic = new Graphic(point,symbol);
                map.getLayer("countryGraphicsLayer").add(graphic);
			}
			
		}
		
		
		
		/***********如果污染类型是全部，显示统计图******/
		if(wuranType!="totalCount"){
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
						var symbolSize = 20;
						if(currItem[wuranType].toString().length==1){
							symbolSize = 20;
						}else if(currItem[wuranType].toString().length==2){
							symbolSize = 26;
						}else if(currItem[wuranType].toString().length==3){
							symbolSize = 36;
						}else if(currItem[wuranType].toString().length==4){
							symbolSize = 46;
						}else if(currItem[wuranType].toString().length==5){
							symbolSize = 56;
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
                        map.getLayer("countryGraphicsLayer").add(graphic1);
                        map.getLayer("countryGraphicsLayer").add(graphic2);
					}
				}
			}
		
		}


        map.getLayer("countryGraphicsLayer").on("update-end",function(){
            alert(11)
        })
        map.on("update-end",function(){
            if(text_num == 0 ) {
            	text_num =1;
			} else {
            	text_num = 0;
            	setTimeout(addProvinceLayer(),5000)
			}
        })
	});//--require end
}
var text_num=0;

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
			SimpleFillSymbol1, SimpleLineSymbol, Color,
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
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		fLayerCounty.setRenderer(renderer);
 		
		map.addLayer(fLayerCounty);
		dojo.connect(map,"onZoomEnd", resizess);
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
			$('#country').addClass('active_left')
			$("#province").addClass("active_right");
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
			zmblockUI('#map', 'end');
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
//						fLayerCounty.setRenderer(renderer);
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
//		graphicsLayer.setMinScale(4622333.67898);
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
		if(wuranType!="totalCount"){
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
function resizess (event) {
	// console.log(event)
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
			SimpleFillSymbol1, SimpleLineSymbol, Color,
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
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
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
			removeGraphic("lastHigh");
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
//						fLayerLast.setRenderer(renderer);
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
//	 		graphicsLayer.setMinScale(4622333.67898);
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
	 		if(wuranType!="totalCount"){
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
	                SimpleRenderer, Color,   Point1,
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
	            var graphics = fLayerProvince.graphics;
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
	            var graphics = fLayerCounty.graphics;
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
	
	var headHtml = "<td>序号</td><td>地区</td><td>总计</td><td>轻微污染数</td><td>轻度污染数</td><td>中度污染数</td><td>重度污染数</td>";
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
		$("#detailTable").css("top",evt.screenY-270);
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
							headHtml = "<tr><td>序号</td><td>六六六</td><td>滴滴涕</td></tr>";
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
							headHtml = "<tr><td>序号</td><td>六六六</td><td>滴滴涕</td></tr>";
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
		$(this).addClass("active_left");
		
		updateProvinceLayer();
		map.centerAndZoom([108,34],3);
		quyuType = 0;
		
		$("#province").addClass("none");
		$("#city").addClass("none");
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


//更新超标率的清单模式
function updateChaoBiaoLvTable(){
	var columns =[{  
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {  
            return index+1;  
        }  
	},{
        field : 'provinceName',
        title : '省',
        align : 'center'
	},{
        field : 'cityName',
        title : '市',
        align : 'center'
	},{
		field : 'countyName',
		title : '县',
		align : 'center',
	},{
		field : 'tatal_number',
		title : '总计',
		align : 'center',
	},{
		field : 'none_pollution_number',
		title : '无污染',
		align : 'center',
	},{
		field : 'slight_pollution_number',
		title : '轻微污染',
		align : 'center',
	},{
		field : 'light_pollution_number',
		title : '轻度污染',
		align : 'center',
	},{
		field : 'middle_pollution_number',
		title : '中度污染',
		align : 'center',
	},{
		field : 'severe_pollution_number',
		title : '重度污染',
		align : 'center',
	}];
//销毁表格
$('#table_template').bootstrapTable('destroy');
//生成表格
$('#table_template').bootstrapTable({
    method : 'POST',
    url : "/seimp/warn/getOverproofTotal.do",
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
//    onlyInfoPagination:false,
    queryParams: function queryParams(params) {   //设置查询参数  
        var param = {    
            pageNumber: params.offset,    
            pageSize: params.limit,
            province:searchParams.province,
            city:searchParams.city,
            county:searchParams.county,
            type:searchParams.industry,
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


/*var box_width = $("#map").width()
var lim_width = $(".map-item").width()
var width_f = (box_width - lim_width)/2
$(".map-item").css("margin-left",+width_f+"px");

$('#mylegend p').click(function(){
    $('#mylegend ul').slideDown()
})*/