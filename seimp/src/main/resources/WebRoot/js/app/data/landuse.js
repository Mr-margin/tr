$(function(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			ArcGISDynamicMapServiceLayer,InfoTemplate,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			InfoWindowLite,domConstruct
	){
		//初始化地图
		map = new Map("map",{
			logo:false,
			center:[108,34],
			zoom:4
		}) 
		
		/*var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        map.setInfoWindow(infoWindow);*/
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		
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
		
		dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/landuse/MapServer", {
			showAttribution:true,
			infoTemplates: infoTemplates,
			"opacity":1
		});

		map.addLayer(dynamicMapServiceLayer);
	});//--require end
})