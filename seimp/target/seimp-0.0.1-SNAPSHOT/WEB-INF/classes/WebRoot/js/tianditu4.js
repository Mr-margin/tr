/**
 * 引用天地图的方法
 */

//全球矢量地图服务、全球矢量中文注记服务
function vectorMap(map){
	var flag =  false;
	if(arguments.length==2){
		flag = arguments[1];
	}
	require(["esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo"
	],function(SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo
	){
		var tileInfo1 = new TileInfo({  
    		"dpi": 96,
    		"format": "tiles",  
    		"compressionQuality": 0,
    		"spatialReference": new SpatialReference({  
    			"wkid": 4326  
    		}),  
    		"rows": 256,  
    		"cols": 256,  
    		"origin": {
    			"x": -180.32,
    			"y": 90.1
    		},  
    		"lods": [{  
    			"level": "1",  
    			"scale": 295829355.455,  
    			"resolution": 0.703914402554
    		}, {  
    			"level": "2",  
    			"scale": 147914677.727,  
    			"resolution": 0.351957201277  
    		}, {  
    			"level": "3",  
    			"scale": 73957338.8636,  
    			"resolution": 0.175978600638  
    		}, {  
    			"level": "4",  
    			"scale": 36978669.4318,  
    			"resolution": 0.0879893003192  
    		}, {  
    			"level": "5",  
    			"scale": 18489334.7159,  
    			"resolution": 0.0439946501596  
    		}, {  
    			"level": "6",  
    			"scale": 9244667.35796,  
    			"resolution": 0.0219973250798  
    		}, {  
    			"level": "7",  
    			"scale": 4622333.67898,  
    			"resolution": 0.0109986625399  
    		}, {  
    			"level": "8",  
    			"scale": 2311166.83949,  
    			"resolution": 0.00549933126995  
    		}, {  
    			"level": "9",  
    			"scale": 1155583.41974,  
    			"resolution": 0.00274966563497  
    		}, {  
    			"level": "10",  
    			"scale": 577791.709872,  
    			"resolution": 0.00137483281749  
    		}]  
    	});  
	    var tileExtent1 = new Extent(-179.99999, -89.99999, 179.99999, 89.99999, new SpatialReference({  
	        wkid: 4326  
	    }));  
	    var layerInfo1 = new WMTSLayerInfo({  
	    	tileInfo: tileInfo1,  
	    	fullExtent: tileExtent1,  
	    	initialExtent: tileExtent1,  
	    	identifier: "vec",  
	    	tileMatrixSet: "c",  
	    	format: "png",  
	    	style: "default"  
	    });  
	    var resourceInfo = {  
          version: "1.0.0",  
          layerInfos: [layerInfo1]
          //copyright: "天地图"  
	    };  
	    var options = {  
          serviceMode: "KVP",  
          resourceInfo: resourceInfo,  
          layerInfo: layerInfo1,
          id:"vectorLayer"
	    };
	    //全球矢量地图服务
	    var wmtsLayer = new WMTSLayer("http://t0.tianditu.com/vec_c/wmts", options);
	    map.addLayer(wmtsLayer,1);
	    
	    var tileInfo2 = new TileInfo({  
	          "dpi": 96,  
	          "format": "tiles",  
	          "compressionQuality": 0,  
	          "spatialReference": new SpatialReference({  
	              "wkid": 4326  
	          }),  
	          "rows": 256,  
	          "cols": 256,  
	          "origin": {  
	    			"x": -180.32,
	    			"y": 90.1
	          },  
	          "lods": [{  
	              "level": "1",  
	              "scale": 295829355.455,  
	              "resolution": 0.703914402554  
	          }, {  
	              "level": "2",  
	              "scale": 147914677.727,  
	              "resolution": 0.351957201277  
	          }, {  
	              "level": "3",  
	              "scale": 73957338.8636,  
	              "resolution": 0.175978600638  
	          }, {  
	              "level": "4",  
	              "scale": 36978669.4318,  
	              "resolution": 0.0879893003192  
	          }, {  
	              "level": "5",  
	              "scale": 18489334.7159,  
	              "resolution": 0.0439946501596  
	          }, {  
	              "level": "6",  
	              "scale": 9244667.35796,  
	              "resolution": 0.0219973250798  
	          }, {  
	              "level": "7",  
	              "scale": 4622333.67898,  
	              "resolution": 0.0109986625399  
	          }, {  
	              "level": "8",  
	              "scale": 2311166.83949,  
	              "resolution": 0.00549933126995  
	          }, {  
	              "level": "9",  
	              "scale": 1155583.41974,  
	              "resolution": 0.00274966563497  
	          }, {  
	              "level": "10",  
	              "scale": 577791.709872,  
	              "resolution": 0.00137483281749  
	          }]  
		    });  
		    var tileExtent2 = new Extent(-179.99999, -89.99999, 179.99999, 89.99999, new SpatialReference({  
	          wkid: 4326  
		    }));  
		    var layerInfo2 = new WMTSLayerInfo({  
	          tileInfo: tileInfo2,  
	          fullExtent: tileExtent2,  
	          initialExtent: tileExtent2,  
	          identifier: "cva",  
	          tileMatrixSet: "c",  
	          format: "png",  
	          style: "default"
		    });  
		    var resourceInfo2 = {  
	          version: "1.0.0",  
	          layerInfos: [layerInfo2]
//	          copyright: "天地图"  
		    };  
		    var options2 = {  
	          serviceMode: "KVP",  
	          resourceInfo: resourceInfo2,  
	          layerInfo: layerInfo2,
	          id:"vectorNoteLayer",
	          visible:flag
		    };
		   //全球矢量中文注记服务
		   var wmtsLayer2 = new WMTSLayer("http://t0.tianditu.com/cva_c/wmts", options2);  
		   map.addLayer(wmtsLayer2,2);
		   if(map.getLayer("gewangLayer")){
			   map.reorderLayer(map.getLayer("gewangLayer"),10);
		   }
	})
}


//全球影像地图服务、全球影像中文注记服务
function imageMap(map){
	var flag =  false;
	if(arguments.length==2){
		flag = arguments[1];
	}
	require(["esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo"
	],function(SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo
	){
		var tileInfo1 = new TileInfo({  
    		"dpi": 96,
    		"format": "tiles",  
    		"compressionQuality": 0,
    		"spatialReference": new SpatialReference({  
    			"wkid": 4326  
    		}),  
    		"rows": 256,  
    		"cols": 256,  
    		"origin": {  
    			"x": -180.32,
    			"y": 90.1
    		},  
    		"lods": [{  
    			"level": "1",  
    			"scale": 295829355.455,  
    			"resolution": 0.703914402554
    		}, {  
    			"level": "2",  
    			"scale": 147914677.727,  
    			"resolution": 0.351957201277  
    		}, {  
    			"level": "3",  
    			"scale": 73957338.8636,  
    			"resolution": 0.175978600638  
    		}, {  
    			"level": "4",  
    			"scale": 36978669.4318,  
    			"resolution": 0.0879893003192  
    		}, {  
    			"level": "5",  
    			"scale": 18489334.7159,  
    			"resolution": 0.0439946501596  
    		}, {  
    			"level": "6",  
    			"scale": 9244667.35796,  
    			"resolution": 0.0219973250798  
    		}, {  
    			"level": "7",  
    			"scale": 4622333.67898,  
    			"resolution": 0.0109986625399  
    		}, {  
    			"level": "8",  
    			"scale": 2311166.83949,  
    			"resolution": 0.00549933126995  
    		}, {  
    			"level": "9",  
    			"scale": 1155583.41974,  
    			"resolution": 0.00274966563497  
    		}, {  
    			"level": "10",  
    			"scale": 577791.709872,  
    			"resolution": 0.00137483281749  
    		}]  
    	});  
	    var tileExtent1 = new Extent(-179.99999, -89.99999, 179.99999, 89.99999, new SpatialReference({  
	        wkid: 4326  
	    }));  
	    var layerInfo1 = new WMTSLayerInfo({  
	    	tileInfo: tileInfo1,  
	    	fullExtent: tileExtent1,  
	    	initialExtent: tileExtent1,  
	    	identifier: "img",  
	    	tileMatrixSet: "c",  
	    	format: "tiles",  
	    	style: "default"  
	    });  
	    var resourceInfo = {  
          version: "1.0.0",  
          layerInfos: [layerInfo1]
//          copyright: "天地图"  
	    };  
	    var options = {  
          serviceMode: "KVP",  
          resourceInfo: resourceInfo,  
          layerInfo: layerInfo1,
          id:"imageLayer"
	    };
	    //全球影像地图服务
	    var wmtsLayer = new WMTSLayer("	http://t0.tianditu.com/img_c/wmts", options);
	    map.addLayer(wmtsLayer,1);
	    
	    var tileInfo2 = new TileInfo({  
	          "dpi": 96,  
	          "format": "tiles",  
	          "compressionQuality": 0,  
	          "spatialReference": new SpatialReference({  
	              "wkid": 4326  
	          }),  
	          "rows": 256,  
	          "cols": 256,  
	          "origin": {  
	    			"x": -180.32,
	    			"y": 90.1
	          },  
	          "lods": [{  
	              "level": "1",  
	              "scale": 295829355.455,  
	              "resolution": 0.703914402554  
	          }, {  
	              "level": "2",  
	              "scale": 147914677.727,  
	              "resolution": 0.351957201277  
	          }, {  
	              "level": "3",  
	              "scale": 73957338.8636,  
	              "resolution": 0.175978600638  
	          }, {  
	              "level": "4",  
	              "scale": 36978669.4318,  
	              "resolution": 0.0879893003192  
	          }, {  
	              "level": "5",  
	              "scale": 18489334.7159,  
	              "resolution": 0.0439946501596  
	          }, {  
	              "level": "6",  
	              "scale": 9244667.35796,  
	              "resolution": 0.0219973250798  
	          }, {  
	              "level": "7",  
	              "scale": 4622333.67898,  
	              "resolution": 0.0109986625399  
	          }, {  
	              "level": "8",  
	              "scale": 2311166.83949,  
	              "resolution": 0.00549933126995  
	          }, {  
	              "level": "9",  
	              "scale": 1155583.41974,  
	              "resolution": 0.00274966563497  
	          }, {  
	              "level": "10",  
	              "scale": 577791.709872,  
	              "resolution": 0.00137483281749  
	          }]  
		    });  
		    var tileExtent2 = new Extent(-179.99999, -89.99999, 179.99999, 89.99999, new SpatialReference({  
	          wkid: 4326  
		    }));  
		    var layerInfo2 = new WMTSLayerInfo({  
	          tileInfo: tileInfo2,  
	          fullExtent: tileExtent2,  
	          initialExtent: tileExtent2,  
	          identifier: "cia",  
	          tileMatrixSet: "c",  
	          format: "tiles",  
	          style: "default"
		    });  
		    var resourceInfo2 = {  
	          version: "1.0.0",  
	          layerInfos: [layerInfo2]
//	          copyright: "天地图"  
		    };  
		    var options2 = {  
	          serviceMode: "KVP",  
	          resourceInfo: resourceInfo2,  
	          layerInfo: layerInfo2,
	          id:"imageNoteLayer",
	          visible:flag
		    };
		   //全球矢量中文注记服务
		   var wmtsLayer2 = new WMTSLayer("http://t0.tianditu.com/cia_c/wmts", options2);  
		   map.addLayer(wmtsLayer2,2);
		   if(map.getLayer("gewangLayer")){
			   map.reorderLayer(map.getLayer("gewangLayer"),10);
		   }
	})
}

/*function addGewang(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			ArcGISDynamicMapServiceLayer,InfoTemplate,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			InfoWindowLite,domConstruct
	){
		var infoTemplate = new InfoTemplate();
		infoTemplate.setTitle("土地利用");
		infoTemplate.setContent(getContent);
		function getContent(graphic){
			var attributes = graphic.attributes;
			var html = "";
			for(var name in attributes){
				html += "<p>"+name+"：<code>"+attributes[name]+"</code></p>";
			}
			return html;
		}
		
		var infoTemplates = {
			0: {
				infoTemplate: infoTemplate,
				layerUrl: null
			}
		};
		
		var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/全国公里格网/MapServer", {
			"opacity":1,
			infoTemplates:infoTemplates,
			"id":"gewangLayer"
		});
		
		map.addLayer(dynamicMapServiceLayer,10);
	});//--require end
}*/


//添加添加国界线图层
function addGuojie(){
	if(map.getLayer("guojieLayer")==null){
		require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
		         "esri/layers/FeatureLayer",
		         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
		         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
		         "esri/renderers/SimpleRenderer",
		         "esri/graphic","esri/geometry/Polyline",
		         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
		         "esri/dijit/InfoWindowLite","dojo/dom-construct"
		],function(Map,SpatialReference,Extent,
				FeatureLayer,
				ArcGISDynamicMapServiceLayer,InfoTemplate,
				WMTSLayer,WMTSLayerInfo,TileInfo,
				SimpleRenderer,
				Graphic,Polyline,
				SimpleFillSymbol, SimpleLineSymbol, Color,
				InfoWindowLite,domConstruct
		){	
			
			var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/guojiexian/MapServer/0", {
				mode: FeatureLayer.MODE_SNAPSHOT,  
	            outFields: ["*"],
	            id:"guojieLayer"
		     });
			
			var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([199,106,121,1]), 2);
	 		renderer = new SimpleRenderer(lineSymbol);
	 		featureLayer.setRenderer(renderer);
	
		    map.addLayer(featureLayer,100);
		})
	}else{
		map.getLayer("guojieLayer").setVisibility(true)
		map.reorderLayer(map.getLayer("guojieLayer"),100);
	}
}

//清除国界图层
function hideGuoJie(){
	if(map.getLayer("guojieLayer")!=null){
		map.getLayer("guojieLayer").setVisibility(false);
	}
}

function showGuojie(){
	if(map.getLayer("guojieLayer")!=null){
		map.getLayer("guojieLayer").setVisibility(true)
	}
}


//添加道路图层
function addRoad(){
	if(map.getLayer("gaosuLayer")==null){
		require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
		         "esri/layers/FeatureLayer",
		         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
		         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
		         "esri/renderers/SimpleRenderer",
		         "esri/graphic","esri/geometry/Polyline",
		         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
		         "esri/dijit/InfoWindowLite","dojo/dom-construct"
		],function(Map,SpatialReference,Extent,
				FeatureLayer,
				ArcGISDynamicMapServiceLayer,InfoTemplate,
				WMTSLayer,WMTSLayerInfo,TileInfo,
				SimpleRenderer,
				Graphic,Polyline,
				SimpleFillSymbol, SimpleLineSymbol, Color,
				InfoWindowLite,domConstruct
		){	
			
			
			var gaosuLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/高速/MapServer",{
				id:"gaosuLayer"
			});
			var shengdaoLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/省道/MapServer",{
				id:"shengdaoLayer"
			});
			map.addLayer(gaosuLayer);
			map.addLayer(shengdaoLayer);
			
		})
	}
}

//添加加油站点图层
function addGas(){
	if(map.getLayer("gasLayer")==null){
		require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
		         "esri/layers/FeatureLayer",
		         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
		         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
		         "esri/renderers/SimpleRenderer",
		         "esri/graphic","esri/geometry/Polyline",
		         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
		         "esri/dijit/InfoWindowLite","dojo/dom-construct"
		],function(Map,SpatialReference,Extent,
				FeatureLayer,
				ArcGISDynamicMapServiceLayer,InfoTemplate,
				WMTSLayer,WMTSLayerInfo,TileInfo,
				SimpleRenderer,
				Graphic,Polyline,
				SimpleFillSymbol, SimpleLineSymbol, Color,
				InfoWindowLite,domConstruct
		){	
			
			
			var gasLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/加油站/MapServer",{
				id:"gasLayer"
			});
			map.addLayer(gasLayer);
			
		})
	}
}

var gewangClick

//加载公里格网图层
function addGewang(){
	
	map.graphics.on("click",function(evt){
		if(evt.graphic.attributes.type=="gewangover"){
			var gewangID = evt.graphic.attributes.gewangID;
			var gewagnLayer = map.getLayer("gewangLayer");
			var graphics = gewagnLayer.graphics;
			for (var i = 0; i < graphics.length; i++) {
				var currGra = graphics[i];
				if(currGra.attributes.FID==gewangID){
					gewangClick(currGra)
				}
			}
		}
	})
	
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/FeatureLayer",
	         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/geometry/Point",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/symbols/TextSymbol",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			FeatureLayer,
			ArcGISDynamicMapServiceLayer,InfoTemplate,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			SimpleRenderer,
			Graphic,Polyline,
			Point,
			SimpleFillSymbol, SimpleLineSymbol, Color,TextSymbol,
			InfoWindowLite,domConstruct
	){
		
		var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/全国公里格网/MapServer/0", {
			mode: FeatureLayer.MODE_SNAPSHOT,  
            outFields: ["*"],
            id:"gewangLayer"
	     });
		
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([150,150,150,1]), 1);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);
 		
 		featureLayer.on("click",function(evt){
 			gewangClick(evt.graphic);
 		})
 		
 		//添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
			//清除高亮graphic
			 removeGraphic("gewangover");
				removeGraphic("gewangHigh");
			 //恢复上次
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"gewangHigh"});
			 map.graphics.add(highGraphic);
			 //行号、列号
			 removeGraphic("gewangover");
//			 var point = evt.mapPoint;
			 var point = new Point(evt.graphic.attributes.x,evt.graphic.attributes.y);
			 var textSymbol = new TextSymbol("行号："+evt.graphic.attributes.lineNum+"   列号："+evt.graphic.attributes.columnNum).setColor(new Color([0,0,0,1]));
			 	textSymbol.font.setFamily("Times");
			 	textSymbol.font.setSize("12pt");
			 	textSymbol.font.setWeight(600);
			 var graphic = new Graphic(point,textSymbol,{type:"gewangover",gewangID:evt.graphic.attributes.FID});
			 map.graphics.add(graphic);
		})
		//添加鼠标移出事件
		/*featureLayer.on("mouse-out",function(){
			removeGraphic("gewangover");
			removeGraphic("gewangHigh");
		})*/
		
		map.addLayer(featureLayer,10);
	});//--require end
}

//土壤网格中的污染企业数据
var qiyeData = null;
//土地利用数据
var tuDiLiYong = [{
	name:"水田",
	area:"",
	code:"11"
},{
	name:"旱地",
	area:"",
	code:"12"
},{
	name:"有林地",
	area:"",
	code:"21,22,23,31,32,33"
},{
	name:"湖泊水域",
	area:"",
	code:"41,42,43,44,45,46"
},{
	name:"城镇住宅用地",
	area:"",
	code:"51,52,53"
},{
	name:"沙地",
	area:"",
	code:"61,62,63,64,64,66"
},{
	name:"未利用地",
	area:"",
	code:"67"
},]

function gewangClick(graphic){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/FeatureLayer",
	         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/geometry/Point","esri/geometry/ScreenPoint",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/symbols/TextSymbol",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			FeatureLayer,
			ArcGISDynamicMapServiceLayer,InfoTemplate,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			SimpleRenderer,
			Graphic,Polyline,
			Point,ScreenPoint,
			SimpleFillSymbol, SimpleLineSymbol, Color,TextSymbol,
			InfoWindowLite,domConstruct
	){
		 //清除高亮graphic
		 removeGraphic("gewangClick")
		 
		 var lineJson = {
				 "paths":graphic.geometry.rings,
				 "spatialReference":{"wkid":4326}
		 }
		 var highPolyline = new Polyline(lineJson);
		 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
		 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"gewangClick"});
		 map.graphics.add(highGraphic);
		 var gewangExtent =graphic.geometry.getExtent(); 
		 
		 //改变地图边界
		 map.setExtent(gewangExtent);
		 
		 //获取数据，显示地图弹出框
		 var json = {xmin:gewangExtent.xmin,xmax:gewangExtent.xmax,ymin:gewangExtent.ymin,ymax:gewangExtent.ymax,industry:""};
		 ajaxPost('/seimp/warn/staYghc.do',json).done(function(result){
			if(result.status==0){//请求成功
				 //记录土壤网格中的污染企业数据
				 qiyeData = result.data;
				 //计算污染企业的行业类型数量
				 var qiyeIndustryCount = 0;
				 var qiyeIndustryArr = [];
				 for (var i = 0; i < qiyeData.length; i++) {
					var currItem = qiyeData[i];
					var flag = false;
					for (var j = 0; j < qiyeIndustryArr.length; j++) {
						var currInd = qiyeIndustryArr[j];
						if(currItem.DALEI==currInd){
							flag = true;
						}
					}
					if(!flag){//如果数组中没有当前企业的行业类型
						qiyeIndustryCount++;
						qiyeIndustryArr.push(currItem.DALEI);
					}
				}
				 
				 //弹窗
				 map.infoWindow.setTitle("网格信息");
				 var attributes = graphic.attributes;
				 
				 var json = {lineNum:attributes.lineNum,columnNum:attributes.columnNum};
				 ajaxPost('/seimp/warn/getTudiliyongData.do',json).done(function(result){
					 if(result.status==0){
						 var tuDiData = result.data;
						 //处理数据
						 //1.清空数据
						 for (var i = 0; i < tuDiLiYong.length; i++) {
							tuDiLiYong[i].area=null;
						 }
						 //2.处理土地利用code
						 //遍历后台返回的数据
						 for (var i = 0; i < tuDiData.length; i++) {
							var currTuDi = tuDiData[i];
							//遍历土里利用数组
							for (var j = 0; j < tuDiLiYong.length; j++) {
								var currItem = tuDiLiYong[j];
								var codeArr = currItem.code.split(",");
								//遍历土地利用code
								for (var k = 0; k < codeArr.length; k++) {
									var currCode = codeArr[k];
									if(currTuDi.CODE==currCode){
										if(currItem.area!=null){
											currItem.area += currTuDi.AREA;
										}else{
											currItem.area = currTuDi.AREA;
										}
									}
									
								}
							}
							
						}
						//3.计算总面积
						 var sum = 0.25;
						/* for (var i = 0; i < tuDiLiYong.length; i++) {
							var currItem = tuDiLiYong[i];
							if(currItem.area!=null){
								sum += currItem.area;
							}
						}*/
						 //4.计算百分比
						 var tudiHtml = "";
						 for (var i = 0; i < tuDiLiYong.length; i++) {
							var currItem = tuDiLiYong[i];
							if(currItem.area!=null){
								var biLi = (currItem.area/sum*100).toFixed(2);
								tudiHtml += (currItem.name + "：" + biLi + "%;");
							}
						}
						 
						 
						 var html = "";
						 html += "<p class='gewangTitle'>网格位置</p>";
						 html += "<p>行号：<code>"+attributes.lineNum+"</code>&nbsp;&nbsp;&nbsp;&nbsp;列号：<code>"+attributes.columnNum+"</code></p>";
						 html += "<p>行政区划：<code><a href='#' onclick=showProvince('"+attributes.NAME+"')>"+attributes.NAME+"</a>"+" "+" <a href='#' onclick=showCity('"+attributes.CAPNAME+"')>"+attributes.CAPNAME+"</a>"+" "+"<a href='#' onclick=showCounty('"+attributes.CNTY_NAME+"')>"+attributes.CNTY_NAME+"</a></code></p>";
						 html += "<hr/><p class='gewangTitle'>土壤背景</p>";
						 html += "<p><a href='#' onclick=shoTuDiLiYong() >土地利用类型：</a><code>"+tudiHtml+"</code></p>";
						 html += "<hr/><p class='gewangTitle'>土壤污染情况</p>";
						 html += "<p>农用地污染面积：<code></code></p>";
						 html += "<p>未利用地污染面积：<code></code></p>";
						 html += "<hr/><p class='gewangTitle'>污染地块</p>";
						 html += "<p>污染地块：<code style='color:#038AEC;'><a href='#' onclick='showdianWei()'>0块</a></code></p>";
						 html += "<p>污染企业：<code style='color:#038AEC;'><a href='#' onclick='showqiye()'>"+qiyeData.length+"家</a></code></p>";
						 html += "<p>污染行业类型：<code>"+qiyeIndustryCount+"个</code></p>";
						 html += "<hr/><p class='gewangTitle'>舆情信息</p>";
						 html += "<p>网络舆情：<code style='color:#038AEC;'><a href='#' onclick=''>"+"0"+"条</code></p>";
						 html += "<p>12369举报：<code style='color:#038AEC;'><a href='#' onclick=''>"+"0"+"条</code></p>";
						 map.infoWindow.setContent(html);
						 var gExtent = graphic.geometry.getExtent();
						 //改变弹出框大小
						 map.infoWindow.resize("270","479");
						 map.infoWindow.show(new Point(gExtent.xmax,(gExtent.ymin+gExtent.ymax)/2));
						 
						 $(".close").click(function(){
								map.infoWindow.remove();
								//清除高亮graphic
								removeGraphic("gewangClick")
								//清除土地利用图层
								if(map.getLayer("geWangTuDiLayer") != null){
									map.getLayer("geWangTuDiLayer").setVisibility(false);
								}
								//清除行政区划
								removeGraphicOfGrahics("gewangXingZheng");
								//隐藏图例
								$("#mylegend").hide();
						 })
						 
						 var $div3 = $("div.dextra-bubble-pop");
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
						        var now_x = (offset_x + _x) + "px";
						        var now_y = (offset_y + _y) + "px";
						        
						        //屏幕坐标转地图坐标
						        var mapPoint = map.toMap(new ScreenPoint(offset_x + _x,offset_y + _y+$div3.height()/2));
						        map.infoWindow.show(mapPoint);
						        /* 改变目标元素的位置 */
						       /* $div3.css({
						          top:now_y,
						          left:now_x
						        });*/
						      });
						    });
						    /* 当鼠标左键松开，接触事件绑定 */
						    $(document).bind("mouseup",function(){
						      $(this).unbind("mousemove");
						    });
						 
					 }
				 });//--ajax end
			} 
		 })
		 
		 
		 
		 
	})
}

function showqiye(){
	//显示弹出框
	$("#geWangTable").removeClass("none");
	//改变标题
	$("#geWangTable .tabtop_left").html("企业信息列表");
	/*var data = [{name:'会东县大鑫矿业有限公司',industry:'有色金属矿采选业',address:'',bz:'企业不符合筛选原则，原因是：生产年限及规模达不到筛选要求',laiyuan:'遥感核查'},
	            {name:'兴发皮革厂',industry:'皮革、毛皮、羽毛及其制品和制鞋业',address:'',bz:'企业为“死亡企业”，没有变更土地用途',laiyuan:'遥感核查'},
	            {name:'廊坊增发油脂有限公司',industry:'石油加工',address:'',bz:'10）其他备注：关闭闲置',laiyuan:'遥感核查'},
	            {name:'涞源县边疆矿业有限责任公司',industry:'有色金属矿采选业',address:'',bz:'5）名单中重复出现，不属于“一厂多址”的情况。',laiyuan:'遥感核查'},];*/
	var headHtml = "<tr><td>序号</td><td>企业名称</td><td>产业类型</td><td>省份</td><td>市</td><td>县</td><td>乡</td><td>村</td><td>备注</td><td>数据来源</td></tr>";
	var data = qiyeData;
	var bodyHtml = "";
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+currItem.NAME+"</td><td>"+currItem.DALEI+"</td><td>"+currItem.SHENG+"</td><td>"+currItem.SHI+"</td><td>"+currItem.XIAN+"</td><td>"+currItem.XIANG+"</td><td>"+currItem.CUN+"</td><td>"+currItem.REMARK+"</td><td>"+currItem.LAIYUAN+"</td></tr>";
	}
	$("#geWangTable thead").html(headHtml);
	$("#geWangTable tbody").html(bodyHtml);
}

function showdianWei(){
	//显示弹出框
	$("#geWangTable").removeClass("none");
	//改变标题
	$("#geWangTable .tabtop_left").html("污染地位信息列表");
	var data = [{id:'3713021320006',sheng:'山东省',shi:'临沂市',xian:'兰山区',mianji:'0.0',type:'国控点'},
	            {id:'3713021320007',sheng:'山东省',shi:'临沂市',xian:'兰山区',mianji:'0.0',type:'国控点'},
	            {id:'3713021320008',sheng:'山东省',shi:'临沂市',xian:'兰山区',mianji:'0.0',type:'省控点'}];
	data = [];
	var headHtml = "<tr><td>污染地块编码</td><td>省份</td><td>市</td><td>县</td><td>占地面积</td><td>点位类型</td></tr>";
	var bodyHtml = "";
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		bodyHtml += "<tr><td>"+currItem.id+"</td><td>"+currItem.sheng+"</td><td>"+currItem.shi+"</td><td>"+currItem.xian+"</td><td>"+currItem.mianji+"</td><td>"+currItem.type+"</td></tr>";
	}
	$("#geWangTable thead").html(headHtml);
	$("#geWangTable tbody").html(bodyHtml);
	
}

//点击行政区划，定位到省份
function showProvince(provinceName){
	 require([
	           "esri/map", 
	           "esri/layers/FeatureLayer",
	           "esri/tasks/QueryTask",
	           "esri/tasks/query",
	           "esri/tasks/StatisticDefinition",
	           "esri/geometry/geometryEngine",
	           "esri/symbols/SimpleMarkerSymbol",
	           "esri/symbols/SimpleLineSymbol",
	           "esri/symbols/SimpleFillSymbol",
	           "esri/graphic",
	           "esri/Color",
	           "dojo/dom",
	           "dojo/domReady!"
	 ], function(
			  Map, FeatureLayer,QueryTask, Query, StatisticDefinition, geometryEngine,
	          SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, dom
	 ){
		 
		 //清除
		 removeGraphicOfGrahics("gewangXingZheng");
		 
		var queryTask = new QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0");
		var query = new Query();
		query.returnGeometry = true;
		query.outFields = ["*"];
		query.outSpatialReference = map.spatialReference;
		query.where = "NAME = '"+provinceName+"'";
		queryTask.execute(query,showResults);

		function showResults(result){
			//判断查询是否有结果
			if(result.features.length>0){
		    	 var graphic = result.features[0];
		    	 map.setExtent(graphic.geometry.getExtent());
		    	 var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([227,26,28,1]), 2);
			 	 var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
		    	 var newGraphic = new Graphic(graphic.geometry,defaultSymbol,{type:"gewangXingZheng"})
		    	 map.getLayer("highLightLayer").add(newGraphic);
			}
	    }
		  
		  
	 })//--require end
}

//点击行政区划，定位到市
function showCity(cityName){
	 require([
	           "esri/map", 
	           "esri/layers/FeatureLayer",
	           "esri/tasks/QueryTask",
	           "esri/tasks/query",
	           "esri/tasks/StatisticDefinition",
	           "esri/geometry/geometryEngine",
	           "esri/symbols/SimpleMarkerSymbol",
	           "esri/symbols/SimpleLineSymbol",
	           "esri/symbols/SimpleFillSymbol",
	           "esri/graphic",
	           "esri/Color",
	           "dojo/dom",
	           "dojo/domReady!"
	 ], function(
			  Map, FeatureLayer,QueryTask, Query, StatisticDefinition, geometryEngine,
	          SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, dom
	 ){
		 
		 //清除
		 removeGraphicOfGrahics("gewangXingZheng");
		 
		var queryTask = new QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0");
		var query = new Query();
		query.returnGeometry = true;
		query.outFields = ["*"];
		query.outSpatialReference = map.spatialReference;
		query.where = "NAME = '"+cityName+"'";
		queryTask.execute(query,showResults);

		function showResults(result){
			//判断查询是否有结果
			if(result.features.length>0){
		    	 var graphic = result.features[0];
		    	 map.setExtent(graphic.geometry.getExtent());
		    	 var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([227,26,28,1]), 2);
			 	 var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
		    	 var newGraphic = new Graphic(graphic.geometry,defaultSymbol,{type:"gewangXingZheng"})
		    	 map.getLayer("highLightLayer").add(newGraphic);
			}
	    }
		  
		  
	 })//--require end
}

//点击行政区划，定位到县
function showCounty(countyName){
	 require([
	           "esri/map", 
	           "esri/layers/FeatureLayer",
	           "esri/tasks/QueryTask",
	           "esri/tasks/query",
	           "esri/tasks/StatisticDefinition",
	           "esri/geometry/geometryEngine",
	           "esri/symbols/SimpleMarkerSymbol",
	           "esri/symbols/SimpleLineSymbol",
	           "esri/symbols/SimpleFillSymbol",
	           "esri/graphic",
	           "esri/Color",
	           "dojo/dom",
	           "dojo/domReady!"
	 ], function(
			  Map, FeatureLayer,QueryTask, Query, StatisticDefinition, geometryEngine,
	          SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Graphic, Color, dom
	 ){
		 
		 //清除
		 removeGraphicOfGrahics("gewangXingZheng");
		 
		var queryTask = new QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0");
		var query = new Query();
		query.returnGeometry = true;
		query.outFields = ["*"];
		query.outSpatialReference = map.spatialReference;
		query.where = "NAME = '"+countyName+"'";
		queryTask.execute(query,showResults);

		function showResults(result){
			//判断查询是否有结果
			if(result.features.length>0){
		    	 var graphic = result.features[0];
		    	 map.setExtent(graphic.geometry.getExtent());
		    	 var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([227,26,28,1]), 2);
			 	 var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
		    	 var newGraphic = new Graphic(graphic.geometry,defaultSymbol,{type:"gewangXingZheng"})
		    	 map.getLayer("highLightLayer").add(newGraphic);
			}
	    }
		  
		  
	 })//--require end
}

//显示土地利用图层
function shoTuDiLiYong(){
	require([
	         "esri/layers/ArcGISDynamicMapServiceLayer"
	],function(
			ArcGISDynamicMapServiceLayer
	){
		var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/landuse/MapServer", {
			showAttribution:true,
			"opacity":1,
			id:"geWangTuDiLayer"
		});

		if(map.getLayer("geWangTuDiLayer")==null){
			map.addLayer(dynamicMapServiceLayer);
		}else{
			map.getLayer("geWangTuDiLayer").setVisibility(true);
		}
		
		//显示图例
		$("#mylegend").show();
	})
}

//清除type属性值为value的graphic
function removeGraphicOfGrahics(value){
	var graphics = map.getLayer("highLightLayer").graphics;
	for (var i = 0; i < graphics.length; i++) {
		if(graphics[i].attributes&&graphics[i].attributes.type&&graphics[i].attributes.type==value){
			map.getLayer("highLightLayer").remove(graphics[i]);
		}
	}
}

/******关闭弹出框****/
$("#geWangTable .tabtop_rt").click(function(){
	$("#geWangTable").addClass("none");
})