/******变量*******/
var map;
var industryType = "";//舆情类别
var clusterLayer = null;
//默认显示的行业类别

/********页面加载**********/
$(function(){
	
	
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/FeatureLayer",
	         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
	         "esri/symbols/SimpleLineSymbol",   
             "esri/symbols/SimpleFillSymbol",  
             "esri/renderers/SimpleRenderer",  
             "esri/Color",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo"
	],function(Map,SpatialReference,Extent,
			FeatureLayer,
			ArcGISDynamicMapServiceLayer,InfoTemplate,
			SimpleLineSymbol, SimpleFillSymbol,  
            SimpleRenderer, Color,
			WMTSLayer,WMTSLayerInfo,TileInfo
	){
		//初始化地图
		map = new Map("map",{
			logo:false,
			center:[119.776,31.116],
			zoom:6
		})
		
		var infoTemplate = new InfoTemplate("京津冀", "<span class='popupchar'>中国长三角地区经济发达、人口密集，具有良好的发展前景，但是，该地区严峻的环境污染现状已成为制约其经济社会可持续发展的重要障碍。</span");
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		//加载重点区域
		 layer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/长三角/MapServer/0",{
			 mode: FeatureLayer.MODE_ONDEMAND,
			 infoTemplate: infoTemplate,
			 outFields: ["*"],
			 opacity:0.5
		});
		
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([110,110,110,1]), 1);
		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([106,81,163,1]));
		var renderer = new SimpleRenderer(defaultSymbol);
		layer.setRenderer(renderer);
					
		 
		map.addLayer(layer);
		
	});//--require end
	
	
	
})//--load end
