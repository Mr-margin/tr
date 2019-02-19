/**
 * ArcGIS 3.17,引用地图,基本方法
 */
/******变量*******/
var map;

$(function(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "extras/DEBubblePopup"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			DEBubblePopup
	){
		
		var infoWindow = new  DEBubblePopup();
		
		//初始化地图
		map = new Map("map",{
			center:[108,34],
			zoom:4,
			infoWindow:infoWindow
		}) 
		
		
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
	});//--require end
	
	/**********按钮绑定事件****/
	//矢量地图
	$("#vectorMap").click(function(){
		if(map.getLayer("imageLayer")){
			map.removeLayer(map.getLayer("imageLayer"));
			map.removeLayer(map.getLayer("imageNoteLayer"));
			vectorMap(map);
		}
	});
	//影像地图
	$("#imageMap").click(function(){
		if(map.getLayer("vectorLayer")){
			map.removeLayer(map.getLayer("vectorLayer"));
			map.removeLayer(map.getLayer("vectorNoteLayer"));
			imageMap(map);
		}
	});
	//添加弹出框
	$("#addPopup").click(function(){
		addPopup();
	})
	//添加点
	$("#addPoint").click(function(){
		addPoint();
	})
	//添加统计图
	$("#addChart").click(function(){
		addChart();
	})
	//添加热力图
	$("#addHeatMap").click(function(){
		getHeatData();
	})
	//添加聚合
	$("#addCluster").click(function(){
		getYuqingData();
	})
	//添加聚合
	$("#addTextSymbol").click(function(){
		addTextSymbol();
	})
})//load end

/***************添加弹出框*******************/
function addPopup(){
	require(["esri/layers/GraphicsLayer","esri/InfoTemplate",
	         "esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol",
	         "esri/symbols/SimpleMarkerSymbol",
	         "esri/symbols/TextSymbol","esri/symbols/Font","esri/Color"
	],function(GraphicsLayer,InfoTemplate,
			Graphic,Point,PictureMarkerSymbol,
			SimpleMarkerSymbol,
			TextSymbol,Font,Color
	){
		
		var template = new InfoTemplate();
		template.setTitle("污染地块信息")
		template.setContent(getContent);
		var graphicsLayer = new GraphicsLayer({"id":"dikuai"});
		
		//获取
		/*var pictureMarkerSymbol = new PictureMarkerSymbol('img/information/dikuai.png', 25, 25);*/
		var pictureMarkerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CROSS, 20,
			    null,
			    	    new Color([0,255,0,1]));
		var attriubtes = {
				name:"sdsfd",
				
		}
		var point = new Point(110,39);
		var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
		graphicsLayer.add(graphic);
		
		map.addLayer(graphicsLayer);
		
		function getContent(graphic){
			return "sdsdfs";
		}
		
		graphicsLayer.on("click",function(evt){
			map.infoWindow.setTitle("标题");
			map.infoWindow.setContent("<ul><li>sdfsf</li><li>sdfsf</li></ul>");
			map.infoWindow.resize(360,250);
			map.infoWindow.show(evt.graphic.geometry);
			$(".close").click(function(){
				map.infoWindow.hide();
			})
		})
		
		
	});
}




/********地图方法*******/
//添加graphic图层
function addPoint(){
	require(["esri/layers/GraphicsLayer","esri/InfoTemplate",
	         "esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol"
	],function(GraphicsLayer,InfoTemplate,
			Graphic,Point,PictureMarkerSymbol
	){
		var template = new InfoTemplate();
		template.setTitle("企业信息")
		template.setContent(getContent);
		var graphicsLayer = new GraphicsLayer({"id":"qiye",infoTemplate:template});
		map.addLayer(graphicsLayer);
		var pictureMarkerSymbol = new PictureMarkerSymbol('img/qiye/qy.png', 25, 25);
		$.getJSON("data/key_industry_enterprise.json",function(data){
			var industryData = data.keyIndustryEnterprise;
			for (var i = 0; i < industryData.length; i++) {
				var itemData = industryData[i];
				if(itemData.latitude&&itemData.longitude){
					var attriubtes = {
							enterpriseName: itemData.enterpriseName,		
		        			city: itemData.city,				
		        			province: itemData.province,						
		        			district: itemData.district,			
		        			industry: itemData.industry,				
		        			remark: itemData.remark,
		                    longitude: itemData.longitude,
		                    latitude: itemData.latitude,
		                    address: itemData.address,
		                    phone: itemData.phone,
		        			type: "qiye"
					}
					var point = new Point(itemData.longitude,itemData.latitude);
					var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
					graphicsLayer.add(graphic);
				}
			}
		});
		
		function getContent(graphic){
			var attributes = graphic.attributes;
			return '<p>企业名称:<code>' + attributes.enterpriseName + '</code></p>'+
			'<p>所属省份:<code>' + attributes.province + '</code></p>'+
			'<p>所属城市:<code>' + attributes.city + '</code></p>'+
			'<p>所属区域:<code>' + attributes.district + '</code></p>'+
			'<p>工业类型:<code>' + attributes.industry + '</code></p>'+
			'<p>备注:<code>' + attributes.remark + '</code></p>';
		}
	})
}



//添加统计图
function addChart(){
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
		 var Data = [  
                        ["北京市", 116.264115594, 40.451460151, 2023, 4982, 7760],  
                        ["天津市", 117.696341324, 39.000605686, 5200, 7852, 8624],  
                        ["上海市", 1549021.62, 3990244.41, 4582, 5271, 5439],  
                        ["重庆市", 268040.96, 3708718.69, 8494, 9723, 1832],  
                        ["黑龙江省", 1672578.76, 5805333.17, 7922, 9121, 1634],  
                        ["吉林省", 1593237.72, 5412773, 8538, 9241, 1811],  
                        ["辽宁省", 1445669.53, 5114055.01, 1906, 3016, 5635],  
                        ["山西省", 619620.09, 4566763.28, 6854, 8447, 9746],  
                        ["河北省", 870342.74, 4672783.14, 7193, 8057, 9551],  
                        ["陕西省", 347000.06, 4221482.37, 7154, 8474, 1053],  
                        ["甘肃省", -183370.5, 4566763.28, 5509, 6234, 7493],  
                        ["四川省", -194586.104, 3802829.23, 6863, 8182, 9903],  
                        ["贵州省", 207842.81, 3351068.85, 5456, 6218, 7389],  
                        ["云南省", -359506.73, 3090317.29, 5976, 6811, 8278],  
                        ["海南省", 524469.70, 2477127.32,  6695, 7553, 9238],  
                        ["浙江省", 1468077.08, 3756523.19, 5867, 8274, 2346],  
                        ["山东省", 1107036.46, 4475739.03, 1494, 1606, 3524],  
                        ["江苏省", 1346905.968, 4179534.072, 1993, 4035, 7167],  
                        ["安徽省", 1132825.078, 4000082.34, 6829, 8237, 1055],  
                        ["福建省", 1316210.78, 3361097.75, 1336, 3187, 4958],  
                        ["江西省", 1039699.52, 3505800.54, 6212, 7989, 9523],  
                        ["河南省", 761755.55, 4220718.27, 6607, 7837, 9171],  
                        ["湖北省", 715909.12, 3852514.15, 7791, 8977, 10873],  
                        ["湖南省", 662899.19, 3488608.13, 7929, 8922, 10547],  
                        ["广东省", 903093.91, 3054857.94, 5243, 7211, 9578],  
                        ["青海省", -768655.9, 4411625.66, 6501, 7326, 8744],  
                        ["西藏自治区", -1569535.69, 3950295.98, 3985, 4469, 4730],  
                        ["广西壮族自治区", 407591.50, 2997549.91, 6968, 7920, 9181],  
                        ["内蒙古自治区", 745166.41, 5233995, 1925, 3264],  
                        ["宁夏回族自治区", 100579.51, 4519699.09, 7918, 8992, 1937],  
                        ["新疆维吾尔自治区", -1574073.93, 5118209.87, 5945, 7400, 8895]];  
	                             
       graphicsLayer = new GraphicsLayer();
      
       //为featureLayer设置渲染器  
       var defaultSymbol = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_NULL);  
       var renderer = new SimpleRenderer(defaultSymbol);  
       graphicsLayer.setRenderer(renderer);  
         
       map.addLayer(graphicsLayer);
       var showFields = ["A","B","C"];  
       createChartInfoWindow(showFields);  
         
       //创建放置直方图的信息窗口  
       function createChartInfoWindow(showFields) {  
           //假设虚构数据的最大值为1000  
    	   var max = 10000;  
           var optinalChart = null;  
           //for(var i=0;i<Data.length;i++){
           for(var i=0;i<2;i++){
        	   var infoWindow = new ChartInfoWindow({  
                    domNode: domConstruct.create('div', {style:"position:absolute;"}, document.getElementById('map'))  
               });  
               infoWindow.setMap(map);  
                 
               var nodeChart = null;  
               nodeChart = domConstruct.create("div", { id: 'nodeTest' + i, style: "width:80px;height:80px" }, win.body());  
               infoWindow.resize(122, 52);
                 
               //计算几何的中心位置，将图表信息框放置于此  
               var labelPt = new Point(Data[i][1],Data[i][2]);
               infoWindow.setContent(nodeChart);  
               infoWindow.__mcoords = labelPt;
               infoWindow.show(map.toScreen(labelPt));
               //加载echarts统计图
               makeEcharts(nodeChart);
           }  
        }
       
       //创建Echarts统计图
       function makeEcharts(nodeChart){
    	   option = {
    			    tooltip: {
    			        trigger: 'item',
    			        formatter: "{a} <br/>{b}: {c} 家 ({d}%)"
    			    },
    			    series: [
    			        {
    			            name:'污染企业',
    			            type:'pie',
    			            radius: ['50%', '70%'],
    			            avoidLabelOverlap: false,
    			            label: {
    			                normal: {
    			                    show: false,
    			                    position: 'center'
    			                },
    			                emphasis: {
    			                    show: true,
    			                    textStyle: {
    			                        fontSize: '10',
    			                        fontWeight: 'bold'
    			                    }
    			                }
    			            },
    			            labelLine: {
    			                normal: {
    			                    show: false
    			                }
    			            },
    			            data:[
    			                {value:35, name:'新增污染企业'},
    			                {value:45, name:'历史污染企业'},
    			            ]
    			        }
    			    ]
    			};
    		var pieChart = echarts.init(nodeChart);
    		pieChart.setOption(option);
       }
         
   });//--require end
}

function getHeatData(){
	$.getJSON("data/t_wuranquyu3.json",function(data){
		 var heatData = data.RECORDS;
		 addHeatMap(heatData);
	 })
}

//添加热力图
function addHeatMap(data){
	 require([
	          "esri/InfoTemplate",
	          "esri/layers/FeatureLayer","esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol",
	          "esri/map",
	          "esri/renderers/HeatmapRenderer",
	          "dojo/domReady!"
	 ],function (
			 InfoTemplate,FeatureLayer,Graphic,Point,PictureMarkerSymbol,
			 Map,HeatmapRenderer
	 ){
		 var featureCollection = {
		          "layerDefinition": null,
		          "featureSet": {
		            "features": [],
		            "geometryType": "esriGeometryPoint"
		          }
		 }; 
		 featureCollection.layerDefinition = {
	          "geometryType": "esriGeometryPoint",
	          "objectIdField": "ObjectID",
	          "fields": [{
	            "name": "hvalue",
	            "alias": "Description",
	            "type": "esriFieldTypeDouble"
	          }]
	     };
		 featureLayer = new FeatureLayer(featureCollection);
		 $.each(data,function(index,item){
			 var geometry = new Point(item.x,item.y);
			 var graphic = new Graphic(geometry,null,{"hvalue":item.value});
			 featureLayer.add(graphic);
		 })
		 var heatmapRenderer = new HeatmapRenderer({
	          field: "hvalue",
	          blurRadius: 8,
	          maxPixelIntensity: 100,
	          minPixelIntensity: 20
	     });
		 featureLayer.setRenderer(heatmapRenderer);
	     map.addLayer(featureLayer);
	 });
}


//获取舆情数据
function getYuqingData(){
	$.getJSON("data/pollution_events.json",function(data){
		addCluster(data.pollutionEvents);
	})
}

//添加聚合图层
function addCluster(data){
	require([
	         "dojo/parser", 
	         "dojo/ready",
	         "dojo/_base/array",
	         "esri/Color",
	         "dojo/dom-style",
	         "dojo/query",

	         "esri/map", 
	         "esri/request",
	         "esri/graphic",
	         "esri/geometry/Extent",

	         "esri/symbols/SimpleMarkerSymbol",
	         "esri/symbols/SimpleFillSymbol",
	         "esri/symbols/PictureMarkerSymbol",
	         "esri/renderers/ClassBreaksRenderer",

	         "esri/layers/GraphicsLayer",
	         "esri/SpatialReference",
	         "esri/dijit/PopupTemplate",
	         "esri/geometry/Point",
	         "esri/geometry/webMercatorUtils",

	         "extras/ClusterLayer",

	         "dijit/layout/BorderContainer", 
	         "dijit/layout/ContentPane",
	         "dojo/domReady!"
	],function(
	         parser, ready, arrayUtils, Color, domStyle, query,
	         Map, esriRequest, Graphic, Extent,
	         SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
	         GraphicsLayer, SpatialReference, PopupTemplate, Point, webMercatorUtils,
	         ClusterLayer
	){
		var newInfo = {};
		var wgs = new SpatialReference({
            "wkid": 4326
        });
		newInfo.data=arrayUtils.map(data,function(p){
			var latlng = new  Point(parseFloat(p.longitude), parseFloat(p.latitude), wgs);
            var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
			var attributes = {
				"nid":p.id,
				"url":p.infoUrl,
				"title":p.pollutionRemark,
				"time":p.createTime,
				"eventesType":p.eventsType
			}
			return {
				"x":webMercator.x,
				"y":webMercator.y,
				"attributes":attributes
			}
		});
		
		var clusterLayer = new ClusterLayer({
			 "data": newInfo.data,
             "distance": 100,
             "id": "clusters",
             "labelColor": "#fff",
             "labelOffset": 10,
             "resolution": map.extent.getWidth() / map.width,
             "singleColor": "#888",
		});
		
		var defaultSym = new SimpleMarkerSymbol().setSize(4);
        var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

        var picBaseUrl = "img/cluster/";
        var blue = new PictureMarkerSymbol(picBaseUrl + "m0.png", 32, 32).setOffset(0, 15);
        var green = new PictureMarkerSymbol(picBaseUrl + "m1.png", 64, 64).setOffset(0, 15);
        var red = new PictureMarkerSymbol(picBaseUrl + "m2.png", 72, 72).setOffset(0, 15);
        renderer.addBreak(0, 2, blue);
        renderer.addBreak(2, 200, green);
        renderer.addBreak(200, 1001, red);

        clusterLayer.setRenderer(renderer);
        map.addLayer(clusterLayer);
        
	})
}



//添加TextSymbol
function addTextSymbol(){
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
	 		//获取省界图层的Graphics
	 		//添加省名
	 			var point = new Point([115.18,38]);
	 			var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
	 			var symbol = new TextSymbol("新疆维吾尔").setColor(new Color("#0a162c"));
	 			symbol.font.setSize("28pt");
//	 			symbol.font.setWeight(700);
	 			symbol.font.setFamily("华文新魏");
	 			symbol.setOffset(0,-14);
	 			var graphic = new Graphic(point,symbol);
	 			graphicsLayer.add(graphic);
	 		
	 		
	 		map.addLayer(graphicsLayer);
	 		
	 	});//--require end
}
