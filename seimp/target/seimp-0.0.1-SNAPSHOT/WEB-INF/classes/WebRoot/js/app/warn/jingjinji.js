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
			center:[116.215,39.582],
			zoom:6
		})
		
//		var infoTemplate = new InfoTemplate("京津冀", "<span class='popupchar'>京津冀地处海河平原和河北平原，其区域主要流经的是海河流域。所以，京津冀地区发展过程中对水资源的需求主要依靠海河流域。在利用水资源的同时也有大量污水、废水排入其中。以消耗环境换来的经济发展导致水资源过度开发，造成河道径流变化、河口生态恶化、入海水量锐减、地下水位下降、水土流失、湿地萎缩等一系列问题。</span>");
		var infoTemplate = new InfoTemplate();
		infoTemplate.setTitle("京津冀");
		infoTemplate.setContent(getContent);
		function getContent(graphic){
			return "<span class='popupchar'>京津冀地处海河平原和河北平原，其区域主要流经的是海河流域。所以，京津冀地区发展过程中对水资源的需求主要依靠海河流域。在利用水资源的同时也有大量污水、废水排入其中。以消耗环境换来的经济发展导致水资源过度开发，造成河道径流变化、河口生态恶化、入海水量锐减、地下水位下降、水土流失、湿地萎缩等一系列问题。</span>";
		}
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		//加载重点区域
		var layer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/京津冀/MapServer/0",{
			 mode: FeatureLayer.MODE_ONDEMAND,
			 infoTemplate: infoTemplate,
			 outFields: ["*"],
			 opacity:0.5
		});
		 
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([110,110,110,1]), 1);
		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([153,0,13,1]));
	 	var renderer = new SimpleRenderer(defaultSymbol);
	 	layer.setRenderer(renderer);
		
		map.addLayer(layer);
		
	});//--require end
	
	
	
})//--load end
