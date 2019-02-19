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
			center:[113.253,22.945],
			zoom:7
		})
		
		var infoTemplate = new InfoTemplate("京津冀", "<span class='popupchar'>珠江三角洲经济的高速发展是建立在工业化和城市化基础之上的。伴随工业化、城市化的快速增长，环境污染和生态破坏将不可避免。珠三角在近十几年工业化城市化的加速进程中，由于“三废”排放量大，污染处置量少，环境污染问题已充分暴露出来。</span>");
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		//加载重点区域
		 layer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/珠三角/MapServer/0",{
			 mode: FeatureLayer.MODE_ONDEMAND,
			 infoTemplate: infoTemplate,
			 outFields: ["*"],
			 opacity:0.5
		});
		 
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([110,110,110,1]), 1);
		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([8,69,148,1]));
		var renderer = new SimpleRenderer(defaultSymbol);
		layer.setRenderer(renderer);
		
		map.addLayer(layer);
		
	});//--require end
	
	
	
})//--load end
