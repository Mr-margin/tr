$(function(){
    require(["esri/map","esri/SpatialReference","esri/geometry/Extent","esri/dijit/InfoWindowLite",
        "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
        "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo","dojo/dom-construct","esri/tasks/LengthsParameters",
        "esri/tasks/AreasAndLengthsParameters","esri/tasks/GeometryService","esri/toolbars/draw","esri/geometry/Point","dojo/domReady!"
    ],function(Map,SpatialReference,Extent,InfoWindowLite,
               QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
               WMTSLayer,WMTSLayerInfo,TileInfo,domConstruct,LengthsParameters,AreasAndLengthsParameters,GeometryService,Draw,Point
    ){
        extent = new Extent(extentPar);

        //初始化地图
        map = new Map("map",{
//			basemap: "delorme",//指明底图
            logo:false,
            minZoom:2,
//			center:[108,34],
//			zoom:3,
            extent:extent,
            showLabels:true,
        })

        //加载天地图：全球矢量地图服务、全球矢量中文注记服务
//		vectorMap(map);
        addTiandituVectorLayer(map);
		// addGewang();

        createGoogleLayer();

        map.addLayer(new GoogleMapLayer());
       map.addLayer(new GoogleMapAnooLayer());
        map.resize();
        /***************************************/
        dong.toolbar = new dong.Draw(map);
        dojo.connect(dong.toolbar, "onDrawEnd", doMeasure);
        geometryService  = new GeometryService("http://" + ip + ":6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
        // dojo.connect(geometryService, "onProjectComplete", projectComplete);


        function doMeasure(geometry) {
            //更加类型设置显示样式
            measuregeometry = geometry;
            toolbar.deactivate();
            switch (geometry.type) {
                case "polyline":
                    var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2);
                    break;
                case "polygon":
                    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                    break;
            }
            //设置样式
            var graphic = new esri.Graphic(geometry, symbol);

            //清除上一次的画图内容
            //map.graphics.clear();
            map.infoWindow.hide();

            map.graphics.clear();
            map.graphics.add(graphic);
            // geometryService.project([graphic],new esri.SpatialReference({"wkid":32618}));
            //map.graphics.add(graphic);
            //进行投影转换，完成后调用projectComplete
            MeasureGeometry(geometry);
        }
        function MeasureGeometry(geometry) {
            //如果为线类型就进行lengths距离测算
            if (geometry.type == "polyline") {
                var lengthParams = new LengthsParameters();
                lengthParams.polylines = [geometry];
                lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                lengthParams.geodesic = true;
                lengthParams.polylines[0].spatialReference = new esri.SpatialReference(102100);
                //
                // geometryService.project([geometry],new esri.SpatialReference(102100));

                geometryService.lengths(lengthParams);
                dojo.connect(geometryService, "onLengthsComplete", outputDistance);
            }
            //如果为面类型需要先进行simplify操作在进行面积测算
            else if (geometry.type == "polygon") {
                var areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
                areasAndLengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_METER;
                areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_SQUARE_METERS;
                this.outSR = new esri.SpatialReference({wkid: 102113});
                geometryService.project([geometry], this.outSR, function (geometry) {
                    geometryService.simplify(geometry, function (simplifiedGeometries) {
                        areasAndLengthParams.polygons = simplifiedGeometries;
                        areasAndLengthParams.polygons[0].spatialReference = new esri.SpatialReference(102100);
                        geometryService.areasAndLengths(areasAndLengthParams);
                    });
                });
                dojo.connect(geometryService, "onAreasAndLengthsComplete", outputAreaAndLength);
            }
        }
        function outputDistance(result) {
            var CurX = measuregeometry.paths[0][measuregeometry.paths[0].length - 1][0];
            var CurY = measuregeometry.paths[0][measuregeometry.paths[0].length - 1][1];
            var CurPos = new esri.geometry.Point(CurX, CurY, map.spatialReference);
            map.infoWindow.setTitle("距离测量");
            map.infoWindow.setContent(" 测 量 长 度 ： <strong>" + parseInt(String(result.lengths[0])) + "米</strong>");
            map.infoWindow.show(CurPos);
        }

        //显示测量面积
        function outputAreaAndLength(result) {
            var extent=measuregeometry.getExtent(); //获取查找区域的范围
            var center=measuregeometry.getCentroid();  //获取查询区域的中心点
            var cPoint = new Point([center.x,center.y],new SpatialReference({ wkid:102100 }));
            map.infoWindow.setTitle("面积测量");
            map.infoWindow.setContent(" 面积 ： <strong>" + parseInt(String(result.areas[0])) + "平方米</strong> 周长：" + parseInt(String(result.lengths[0])) + "米");
            map.infoWindow.show(cPoint);
        }











        /*********************************/



    })
})
$("#Button1").click(function(){
    dong.toolbar.activate(dong.Draw.POLYLINE);
})


function showOrHide(){
    if(map.getLayersVisibleAtScale()[2].visible){
        map.getLayersVisibleAtScale()[2].setVisibility(false);
//		map.getLayersVisibleAtScale()[3].setVisibility(false);
    }else{
        map.getLayersVisibleAtScale()[2].setVisibility(true);
//		map.getLayersVisibleAtScale()[3].setVisibility(true);
    }
}


function createGoogleLayer(){
    //影像图层
    dojo.declare("GoogleMapLayer", esri.layers.TiledMapServiceLayer, { // create WMTSLayer by extending esri.layers.TiledMapServiceLayer
        constructor: function(){
            this.spatialReference = new esri.SpatialReference({
                wkid: 102113
            });
            this.initialExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
            this.fullExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
            //
            this.tileInfo = new esri.layers.TileInfo({
                "dpi": "90.71428571427429",
                "format": "image/png",
                "compressionQuality": 0,
                "spatialReference": {
                    "wkid": "3857"
                },
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -20037508.342787,
                    "y": 20037508.342787
                },

                // Scales in DPI 96
                "lods": [{"level": 0,"scale": 591657527.591555,"resolution": 156543.033928
                }, {"level": 1,"scale": 295828763.795777,"resolution": 78271.5169639999
                }, {"level": 2,"scale": 147914381.897889,"resolution": 39135.7584820001
                }, {"level": 3,"scale": 73957190.948944,"resolution": 19567.8792409999
                }, {"level": 4,"scale": 36978595.474472,"resolution": 9783.93962049996
                }, {"level": 5,"scale": 18489297.737236,"resolution": 4891.96981024998
                }, {"level": 6,"scale": 9244648.868618,"resolution": 2445.98490512499
                }, {"level": 7,"scale": 4622324.434309,"resolution": 1222.99245256249
                }, {"level": 8,"scale": 2311162.217155,"resolution": 611.49622628138
                }, {"level": 9,"scale": 1155581.108577,"resolution": 305.748113140558
                }, {"level": 10,"scale": 577790.554289,"resolution": 152.874056570411
                }, {"level": 11,"scale": 288895.277144,"resolution": 76.4370282850732
                }, {"level": 12,"scale": 144447.638572,"resolution": 38.2185141425366
                }, {"level": 13,"scale": 72223.819286,"resolution": 19.1092570712683
                }, {"level": 14,"scale": 36111.909643,"resolution": 9.55462853563415
                }, {"level": 15,"scale": 18055.954822,"resolution": 4.77731426794937
                }, {"level": 16,"scale": 9027.977411,"resolution": 2.38865713397468
                }, {"level": 17,"scale": 4513.988705,"resolution": 1.19432856685505
                }, {"level": 18,"scale": 2256.994353,"resolution": 0.597164283559817
                }, {"level": 19,"scale": 1128.497176,"resolution": 0.298582141647617
                }]
            });
            this.loaded = true;
            this.onLoad(this);
        },
        getTileUrl: function(level, row, col){
            return "http://mt" + (col % 4) + ".google.cn/vt/lyrs=s@112&hl=zh-CN&gl=cn&" + "x=" + col + "&" +
                "y=" +
                row +
                "&" +
                "z=" +
                level +
                "&s=";
        }
    });


    //注记图层
    dojo.declare("GoogleMapAnooLayer", esri.layers.TiledMapServiceLayer, { // create WMTSLayer by extending esri.layers.TiledMapServiceLayer
        constructor: function(){
            this.spatialReference = new esri.SpatialReference({
                wkid: 102113
            });
            this.initialExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
            this.fullExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
            //
            this.tileInfo = new esri.layers.TileInfo({
                "dpi": "90.71428571427429",
                "format": "image/png",
                "compressionQuality": 0,
                "spatialReference": {
                    "wkid": "3857"
                },
                "rows": 256,
                "cols": 256,
                "origin": {
                    "x": -20037508.342787,
                    "y": 20037508.342787
                },

                // Scales in DPI 96
                "lods": [{"level": 0,"scale": 591657527.591555,"resolution": 156543.033928
                }, {"level": 1,"scale": 295828763.795777,"resolution": 78271.5169639999
                }, {"level": 2,"scale": 147914381.897889,"resolution": 39135.7584820001
                }, {"level": 3,"scale": 73957190.948944,"resolution": 19567.8792409999
                }, {"level": 4,"scale": 36978595.474472,"resolution": 9783.93962049996
                }, {"level": 5,"scale": 18489297.737236,"resolution": 4891.96981024998
                }, {"level": 6,"scale": 9244648.868618,"resolution": 2445.98490512499
                }, {"level": 7,"scale": 4622324.434309,"resolution": 1222.99245256249
                }, {"level": 8,"scale": 2311162.217155,"resolution": 611.49622628138
                }, {"level": 9,"scale": 1155581.108577,"resolution": 305.748113140558
                }, {"level": 10,"scale": 577790.554289,"resolution": 152.874056570411
                }, {"level": 11,"scale": 288895.277144,"resolution": 76.4370282850732
                }, {"level": 12,"scale": 144447.638572,"resolution": 38.2185141425366
                }, {"level": 13,"scale": 72223.819286,"resolution": 19.1092570712683
                }, {"level": 14,"scale": 36111.909643,"resolution": 9.55462853563415
                }, {"level": 15,"scale": 18055.954822,"resolution": 4.77731426794937
                }, {"level": 16,"scale": 9027.977411,"resolution": 2.38865713397468
                }, {"level": 17,"scale": 4513.988705,"resolution": 1.19432856685505
                }, {"level": 18,"scale": 2256.994353,"resolution": 0.597164283559817
                }, {"level": 19,"scale": 1128.497176,"resolution": 0.298582141647617
                }]
            });
            this.loaded = true;
            this.onLoad(this);
        },
        getTileUrl: function(level, row, col){
            return "http://mt" + (col % 4) + ".google.cn/vt/lyrs=h@177000000&hl=zh-CN&gl=cn&" + "x=" + col + "&" +
                "y=" +
                row +
                "&" +
                "z=" +
                level +
                "&s=";
        }
    });

}


/**
 * 加载天地图：影像图
 */
function addTiandituLayer(mapObj){
    require([
        "extras/TianDiTuLayer",
        "esri/map", "esri/geometry/Extent",
        "dojo/domReady!"
    ], function(
        TianDiTuLayer, Map, Extent
    ){
        var baseLayer = new TianDiTuLayer(TianDiTuLayer.IMG_BASE_WEBMERCATOR,{id:"baseLayer"});
        var annoLayer = new TianDiTuLayer(TianDiTuLayer.IMG_ANNO_WEBMERCATOR,{id:"annoLayer"});
        if(mapObj){
            mapObj.addLayer(baseLayer);
            mapObj.addLayer(annoLayer);
            mapObj.reorderLayer(baseLayer,2);
            mapObj.reorderLayer(annoLayer,3);
        }else{
            map.addLayer(baseLayer);
            map.addLayer(annoLayer);
            map.reorderLayer(baseLayer,2);
            map.reorderLayer(annoLayer,3);
        }


    })
}

/**
 * 加载天地图：矢量图
 */
function addTiandituVectorLayer(mapObj){
    require([
        "extras/TianDiTuLayer",
        "esri/map", "esri/geometry/Extent",
        "dojo/domReady!"
    ], function(
        TianDiTuLayer, Map, Extent
    ){
        var baseLayer = new TianDiTuLayer(TianDiTuLayer.VEC_BASE_WEBMERCATOR,{id:"baseVectorLayer"});
        var annoLayer = new TianDiTuLayer(TianDiTuLayer.VEC_ANNO_WEBMERCATOR,{id:"annoVectorLayer"});
        if(mapObj){
            mapObj.addLayer(baseLayer);
            mapObj.addLayer(annoLayer);
            mapObj.reorderLayer(baseLayer,0)
            mapObj.reorderLayer(annoLayer,1)
        }else{
            map.addLayer(baseLayer);
            map.addLayer(annoLayer);
            map.reorderLayer(baseLayer,0)
            map.reorderLayer(annoLayer,1)
        }


    })
}
		