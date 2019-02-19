var app = {};
var dong = {};
$(function(){
    require(["esri/map","esri/SpatialReference","esri/geometry/Extent","esri/dijit/InfoWindowLite",
        "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
        "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo","dojo/dom-construct","esri/tasks/LengthsParameters",
        "esri/tasks/AreasAndLengthsParameters","esri/tasks/GeometryService","esri/toolbars/draw","esri/geometry/Point",
        "esri/tasks/PrintTask","esri/tasks/PrintTemplate","esri/tasks/PrintParameters","esri/layers/FeatureLayer",
        "esri/symbols/SimpleFillSymbol","dojo/dom","esri/layers/GraphicsLayer","esri/symbols/SimpleMarkerSymbol","esri/symbols/Font",
        "esri/symbols/TextSymbol","esri/geometry/Polygon","dojo/domReady!"
    ],function(Map,SpatialReference,Extent,InfoWindowLite,
               QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
               WMTSLayer,WMTSLayerInfo,TileInfo,domConstruct,LengthsParameters,AreasAndLengthsParameters,GeometryService,Draw,Point,
               PrintTask,PrintTemplate,PrintParameters,FeatureLayer,SimpleFillSymbol,dom,GraphicsLayer,SimpleMarkerSymbol,Font,TextSymbol,Polygon
    ){
        dong.SpatialReference = SpatialReference ;
        dong.Extent = Extent ;
        dong.InfoWindowLite = InfoWindowLite ;
        dong.QueryTask = QueryTask;
        dong.Query = Query ;
        dong.Graphic = Graphic ;
        dong.Polyline = Polyline;
        dong.SimpleLineSymbol = SimpleLineSymbol ;
        dong.Color = Color;
        dong.WMTSLayer = WMTSLayer ;
        dong.WMTSLayerInfo= WMTSLayerInfo;
        dong.TileInfo= TileInfo;
        dong.domConstruct = domConstruct;
        dong.LengthsParameters = LengthsParameters;
        dong.AreasAndLengthsParameters = AreasAndLengthsParameters ;
        dong.GeometryService = GeometryService;
        dong.Draw = Draw ;
        dong.Point = Point;
        dong.PrintTask = PrintTask;
        dong.PrintTemplate = PrintTemplate ;
        dong.PrintParameters = PrintParameters;
        dong.FeatureLayer = FeatureLayer;
        dong.SimpleFillSymbol = SimpleFillSymbol;
        dong.dom = dom;
        dong.GraphicsLayer = GraphicsLayer;
        dong.SimpleMarkerSymbol = SimpleMarkerSymbol;
        dong.Font = Font ;
        dong.TextSymbol = TextSymbol;
        dong.Polygon = Polygon;

        extent = new Extent(extentPar);
        //初始化地图
        app.map = new Map("map",{
            logo:false,
            minZoom:2,
            extent:extent,
            showLabels:true,
        })

        //加载天地图：全球矢量地图服务、全球矢量中文注记服务
//		vectorMap(app.map);
        addTiandituVectorLayer(app.map);
        // addGewang();

        createGoogleLayer();
        //
        app.map.addLayer(new GoogleMapLayer());
        // map.addLayer(new GoogleMapAnooLayer());
        // setTimeout(map.resize(),1000)
        /***************************************/
        toolbar = new esri.toolbars.Draw(app.map);
        dojo.connect(toolbar, "onDrawEnd", doMeasure);
        app.geometryService  = new dong.GeometryService("http://" + ip + ":6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
        // dojo.connect(geometryService, "onProjectComplete", projectComplete);

        var fLayerProvince = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            opacity:1,
            id:"countryFeatureLayer"
        });
        app.map.addLayer(fLayerProvince);
        dojo.connect(app.map, "onZoomEnd", resizess);//地图缩放
       // app.map.on("mouse-drag-end", function (evt){console.log(evt)})//拖动
        // app.map.centerAt([0,0]);
        // wangge();
    })
})
//划线 清除上一次记录
function doMeasure(geometry) {
    //更加类型设置显示样式
    measuregeometry = geometry;
    toolbar.deactivate();
    switch (geometry.type) {
        case "polyline":
            var symbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([0, 0, 0]), 2);
            break;
        case "polygon":
            var symbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_NONE, new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT, new dong.Color([255, 0, 0]), 2), new dong.Color([255, 255, 0, 0.25]));
            break;
    }
    //设置样式
    var graphic = new dong.Graphic(geometry, symbol);

    //清除上一次的画图内容
    //map.graphics.clear();
    app.map.infoWindow.hide();

    app.map.graphics.clear();
    app.map.graphics.add(graphic);
    // geometryService.project([graphic],new esri.SpatialReference({"wkid":32618}));
    //map.graphics.add(graphic);
    //进行投影转换，完成后调用projectComplete
    MeasureGeometry(geometry);
}
//判断是线还是面
function MeasureGeometry(geometry) {
    //如果为线类型就进行lengths距离测算
    if (geometry.type == "polyline") {
        var lengthParams = new dong.LengthsParameters();
        lengthParams.polylines = [geometry];
        lengthParams.lengthUnit = dong.GeometryService.UNIT_METER;
        lengthParams.geodesic = true;
        lengthParams.polylines[0].spatialReference = new dong.SpatialReference(102100);

        app.geometryService.lengths(lengthParams);
        dojo.connect(app.geometryService, "onLengthsComplete", outputDistance);
    }
    //如果为面类型需要先进行simplify操作在进行面积测算
    else if (geometry.type == "polygon") {
        var areasAndLengthParams = new dong.AreasAndLengthsParameters();
        areasAndLengthParams.lengthUnit = dong.GeometryService.UNIT_METER;
        areasAndLengthParams.areaUnit = dong.GeometryService.UNIT_SQUARE_METERS;
        this.outSR = new dong.SpatialReference({wkid: 102113});
        app.geometryService.project([geometry], this.outSR, function (geometry) {
            app.geometryService.simplify(geometry, function (simplifiedGeometries) {
                areasAndLengthParams.polygons = simplifiedGeometries;
                areasAndLengthParams.polygons[0].spatialReference = new dong.SpatialReference(102100);
                app.geometryService.areasAndLengths(areasAndLengthParams);
            });
        });
        dojo.connect(app.geometryService, "onAreasAndLengthsComplete", outputAreaAndLength);
    }
}
//距离测量
function outputDistance(result) {
    var CurX = measuregeometry.paths[0][measuregeometry.paths[0].length - 1][0];
    var CurY = measuregeometry.paths[0][measuregeometry.paths[0].length - 1][1];
    var CurPos = new dong.Point(CurX, CurY, app.map.spatialReference);
    app.map.infoWindow.setTitle("距离测量");
    app.map.infoWindow.setContent(" 测 量 长 度 ： <strong>" + parseInt(String(result.lengths[0])) + "米</strong>");
    app.map.infoWindow.show(CurPos);
    $(".esriPopup .titleButton.close").css("margin-left","25px")
}
//显示测量面积
function outputAreaAndLength(result) {
    var extent=measuregeometry.getExtent(); //获取查找区域的范围
    var center=measuregeometry.getCentroid();  //获取查询区域的中心点
    var cPoint = new dong.Point([center.x,center.y],new dong.SpatialReference({ wkid:102100 }));
    app.map.infoWindow.setTitle("面积测量");
    app.map.infoWindow.setContent(" 面积 ： <strong>" + parseInt(String(result.areas[0])) + "平方米</strong> 周长：" + parseInt(String(result.lengths[0])) + "米");
    app.map.infoWindow.show(cPoint);
    $(".esriPopup .titleButton.close").css("margin-left","25px")
}

//谷歌影像图层的显示与隐藏
function showOrHide(){
    if(app.map.getLayersVisibleAtScale()[2].visible){
        app.map.getLayersVisibleAtScale()[2].setVisibility(false);
//		map.getLayersVisibleAtScale()[3].setVisibility(false);
    }else{
        app.map.getLayersVisibleAtScale()[2].setVisibility(true);
//		map.getLayersVisibleAtScale()[3].setVisibility(true);
    }
}

//谷歌影像
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
        var baseLayer = new TianDiTuLayer(TianDiTuLayer.IMG_BASE_WEBMERCATOR,{id:"baseLayer"});//影像
        var annoLayer = new TianDiTuLayer(TianDiTuLayer.IMG_ANNO_WEBMERCATOR,{id:"annoLayer"});//中文注记
        if(mapObj){
            mapObj.addLayer(baseLayer);
            mapObj.addLayer(annoLayer);
            mapObj.reorderLayer(baseLayer,2);
            mapObj.reorderLayer(annoLayer,3);
        }else{
            app.map.addLayer(baseLayer);
            app.map.addLayer(annoLayer);
            app.map.reorderLayer(baseLayer,2);
            app.map.reorderLayer(annoLayer,3);
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
        var baseLayer = new TianDiTuLayer(TianDiTuLayer.VEC_BASE_WEBMERCATOR,{id:"vectorLayer"});//矢量
        var annoLayer = new TianDiTuLayer(TianDiTuLayer.VEC_ANNO_WEBMERCATOR,{id:"vectorNoteLayer"});//注记
        if(mapObj){
            mapObj.addLayer(baseLayer);
            mapObj.addLayer(annoLayer);
            mapObj.reorderLayer(baseLayer,0)
            mapObj.reorderLayer(annoLayer,1)
        }else{
            app.map.addLayer(baseLayer);
            app.map.addLayer(annoLayer);
            app.map.reorderLayer(baseLayer,0)
            app.map.reorderLayer(annoLayer,1)
        }


    })
}

/**********************************经纬网格*******************************************/
dong.oOriginX= "8175445.558800001";  //获取原点X坐标
dong.oOriginY="1927027.8757999986";  //获取原点Y坐标
dong.oPixelSize="400000"; //获取像元大小
dong.oStartRow="0"; //获取起始行号
dong.oEndRow="13";    //获取结束行号
dong.oStartColumn="0";//获取起始列号
dong.oEndColumn="18";  //获取结束列号
dong.oLable="10";     //获取间隔标注
function  wangge (){//网格线
    app.axisContentGraphicLayer=new dong.GraphicsLayer();//定义一个存放坐标轴及标注的全局变量
    app.grideGraphicLayer=new dong.GraphicsLayer();   //定义一个存放格网的全局变量
    var oOriginRow=parseFloat(dong.oOriginY)/parseFloat(dong.oPixelSize); //原点的行号
    var oOriginColumn=parseFloat(dong.oOriginX)/parseFloat(dong.oPixelSize);//原点的列号
    var V1=0;   //在绘制格网的的时候，让最下面的横线一个一个单位的向上移动，V1起一个标识作用，为什么不用i，因为i可能为负值
    var oReallyStartRow=parseInt(dong.oStartRow)+oOriginRow;//相对于原点的起始行号
    var oReallyEndRow=parseInt(dong.oEndRow)+oOriginRow; //相对于原点的结束行号
    var oReallyStartColumn=parseInt(dong.oStartColumn)+oOriginColumn;//相对于原点的起始列号
    var oReallyEndColumn=parseInt(dong.oEndColumn)+oOriginColumn;//相对于原点的结束列号
    app.grideGraphicLayer.clear();//绘制格网之前，先把上次的grideGraphicLayer给clear了
    //将横轴线一条条向上移动函数,之前写的是i=oReallyStartRow,i<oReallyEndRow这个时候不能用相对位置了，因为这个相对位置是对线的坐标而言，而这个延长线的位置必须用绝对位置
    for (var i=parseInt(dong.oStartRow);i<parseInt(dong.oEndRow)+1;i++){
        var textFont=new dong.Font('15px').setWeight(dong.Font.WEIGHT_BOLD);//横轴标注字体
        var textSymbol=new dong.TextSymbol(i,textFont,new dong.Color([0,0,0]));//横轴标注样式
        textSymbol.setOffset(20,0);  //横轴标注偏移量
        var k=0;         //定义一个k，是为了找到需要延长的线，让它的末点坐标+i*k，当然，如果不符合条件，那么k=0，相当于没加
        var p1=changePoint(oReallyStartColumn*parseFloat(dong.oPixelSize),oReallyStartRow*parseFloat(dong.oPixelSize)+parseFloat(dong.oPixelSize)*V1,"1");//格网左下角的点
        var p2=changePoint(oReallyEndColumn*parseFloat(dong.oPixelSize)+k*parseFloat(dong.oPixelSize)*3,oReallyStartRow*parseFloat(dong.oPixelSize)+parseFloat(dong.oPixelSize)*V1,"1");//格网右下角的点
        var line=new dong.Polyline({"wkid":102100});//定义横轴的线，注意这个{"wkid":102100}很重要，不能使用map.spatialReference,要使用自己发布地图的坐标系编码
        line.addPath([p1,p2]);  //将上面两点加进去
        var linesymbol=new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([255,0,0]),1);
        var graphicLine=new dong.Graphic(line,linesymbol);
        app.grideGraphicLayer.add(graphicLine);
        V1++;  //为了使横轴能够向上移动，V1每次需要+1
    }
    var V2=0;    //这个是纵轴的向右移动标识，和V1同理
    for (var i=parseInt(dong.oStartColumn);i<parseInt(dong.oEndColumn)+1;i++){//对纵轴进行平移，与上面的同理
        var textFont=new dong.Font('15px').setWeight(dong.Font.WEIGHT_BOLD);
        var textSymbol=new dong.TextSymbol(i,textFont,new dong.Color([0,0,0]));
        textSymbol.setOffset(0,20);
        var k=0;
        var p1=changePoint(oReallyStartColumn*parseFloat(dong.oPixelSize)+parseFloat(dong.oPixelSize)*V2,oReallyStartRow*parseFloat(dong.oPixelSize),"2");//格网左下角的点
        var p2=changePoint(oReallyStartColumn*parseFloat(dong.oPixelSize)+parseFloat(dong.oPixelSize)*V2,oReallyEndRow*parseFloat(dong.oPixelSize)+k*parseFloat(dong.oPixelSize)*3,"2");//格网左上角的点
        var line=new dong.Polyline({"wkid":102100});
        line.addPath([p1,p2]);
        var linesymbol=new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([255,0,0]),1);
        var graphicLine=new dong.Graphic(line,linesymbol);
        app.grideGraphicLayer.add(graphicLine);
        V2++;
    }
    app.map.addLayer(app.grideGraphicLayer);
    mian_point();


}
//生成点函数
var shu_point = [];
var heng_point = [];
function changePoint(x,y,num) {
    var p=new dong.Point({
        "x":x,
        "y":y,
        "spatialReference": {"wkid": 102100}
    });
    if ( num == "1"){
        heng_point.push({x:x,y:y})
    } else if(num=="2") {
        shu_point.push({x:x,y:y})
    }

    return p;
};
//全网个坐标
function  mian_point(){
    dong.mian_point = [];
    for ( var i = 0 ; i < heng_point.length/2; i ++ ) {
        var heng = heng_point[i];
        if ((i+1)%2 == 1 ) {
            for (var j = 0 ; j < shu_point.length/2-1 ; j ++ ){
                dong.mian_point.push({
                    hang:(i+1),
                    lie:(j+1),
                    point1:{x:heng.x+(j*dong.oPixelSize),y:heng.y+((i/2)*dong.oPixelSize)},
                    point2:{x:heng.x+((j+1)*dong.oPixelSize),y:heng.y+((i/2)*dong.oPixelSize)},
                    point3:{x:heng.x+(j*dong.oPixelSize),y:heng.y+(((i/2)+1)*dong.oPixelSize)},
                    point4:{x:heng.x+((j+1)*dong.oPixelSize),y:heng.y+(((i/2)+1)*dong.oPixelSize)},
                })
            }
        } else if ( (i+1)%2 == 0 ) {
            for (var j = 0 ; j < shu_point.length/2-1 ; j ++ ){
                dong.mian_point.push({
                    hang:(i+1),
                    lie:(shu_point.length/2-1)-j,
                    point1:{x:heng.x-(j*dong.oPixelSize),y:heng.y+((i+1)/2*dong.oPixelSize)},
                    point2:{x:heng.x-((j+1)*dong.oPixelSize),y:heng.y+((i+1)/2*dong.oPixelSize)},
                    point3:{x:heng.x-(j*dong.oPixelSize),y:heng.y+(((i+1)/2+1)*dong.oPixelSize)},
                    point4:{x:heng.x-((j+1)*dong.oPixelSize),y:heng.y+(((i+1)/2+1)*dong.oPixelSize)},
                })
            }
        }
    }
    // if (dong.resizess =1) {
    //     dong.data = dong.mian_point;
    // }
    // console.log(mian_point);
    sc_mian();
}
//根据四个点生成面
function sc_mian(){
    app.wanggeLayer = new dong.GraphicsLayer();
    app.map.addLayer(app.wanggeLayer)
    for ( var i = 0 ; i <  dong.oEndRow* dong.oEndColumn; i ++ ) {
        var str = dong.mian_point[i];
        var polygonJson  = {"rings":[[[str.point1.x,str.point1.y],[str.point2.x,str.point2.y],[str.point4.x,str.point4.y],[str.point3.x,str.point3.y]
            ]],"spatialReference":{"wkid":102100 }};
        var polygon = new dong.Polygon(polygonJson);
        // var linesymbol=new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([255,0,0]),1);
        var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
            new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,
                new dong.Color([255,0,0]),1),new dong.Color([0,0,0,0.25])
        );
        // dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([255,0,0]),1
        var graphic = new dong.Graphic(polygon,sfs)
        graphic.setAttributes( {"lineNum":str.hang,"columnNum":str.lie,point1:str.point1,point2:str.point2,point3:str.point3,point4:str.point4});
        app.wanggeLayer.add(graphic);
    }
    // app.wanggeLayer.redraw();
    app.wanggeLayer.on("click",function(evt){
        console.log(evt)

    })
    // app.wanggeLayer.on("mouse-over",function(evt){
    //     app.map.graphics.remove(app.wanggeLayer);
    //     var point =new dong.Point({
    //         "x":evt.mapPoint.x,
    //         "y":evt.mapPoint.y,
    //         "spatialReference": {"wkid": 102100}
    //     });
    //     var textSymbol = new dong.TextSymbol("行号："+evt.graphic.attributes.lineNum+"   列号："+evt.graphic.attributes.columnNum).setColor(new dong.Color([0,0,0,1]));
    //     textSymbol.font.setFamily("Times");
    //     textSymbol.font.setSize("20pt");
    //     textSymbol.font.setWeight(600);
    //     var graphic = new dong.Graphic(point,textSymbol,{type:"gewangover"});
    //     app.map.graphics.add(graphic);
    // })
}
//清除type属性值为value的graphic
function removeGraphic(value) {
    var graphics = app.map.graphics.graphics;
    for (var i = 0; i < graphics.length; i++) {
        if (graphics[i].attributes && graphics[i].attributes.type && graphics[i].attributes.type == value) {
            console.log(graphics[i])
            app.map.graphics.remove(graphics[i]);
        }
    }
}
dong.resizess =1;
//缩放事件
function resizess(event){
    // 15075445.5588, 7327027.875799999
    var left_x = event.xmin+200000;
    var left_y = event.ymin+300000;
    console.log(app.map.getScale().toFixed())
    if(app.map.getScale().toFixed()>=9244659){//省
        if ( dong.resizess == 1 ) return;
        dong.resizess =1;
        app.grideGraphicLayer.clear();
        app.wanggeLayer.clear();
        dong.oOriginX= "8175445.558800001";  //获取原点X坐标
        dong.oOriginY="1927027.8757999986";  //获取原点Y坐标
        dong.oPixelSize="400000"; //获取像元大小
        dong.oEndRow="13";    //获取结束行号
        dong.oEndColumn="18";  //获取结束列号
        app.map.removeLayer(app.grideGraphicLayer)
        app.map.removeLayer(app.wanggeLayer)
        shu_point = [];
        heng_point = [];
        wangge();
    } else if( app.map.getScale().toFixed() < 9244659) {
        console.log(2)
        if(app.map.getScale().toFixed()>4622323 ) {//市
            if ( dong.resizess == 2 ) return;
            dong.resizess =2;
            var left_x = event.xmin;
            var left_y = event.ymin+300000;
            for ( var i = 0 ; i < dong.mian_point.length;i ++ ) {
                var str = dong.mian_point[i];
                var x1,x2,y1,y2;
                if ( str.point1.x > str.point2.x ){
                    x1 = str.point2.x;
                    x2=str.point1.x;
                } else if (str.point1.x < str.point2.x ) {
                    x1 = str.point1.x;
                    x2 = str.point2.x;
                }
                if ( str.point1.y > str.point4.y ){
                    y1 = str.point4.y;
                    y2=str.point1.y;
                } else if (str.point1.y < str.point4.y ) {
                    y1 = str.point1.y;
                    y2 = str.point4.y;
                }
                if ( x1 <= left_x && left_x<=x2){
                    if( y1 <= left_y && left_y <= y2){
                        console.log(str);
                        var x = 15075445.5588-str.point1.x;
                        var y = 7327027.875799999-str.point1.y;
                        console.log(x+","+y)
                        dong.oOriginX= str.point1.x;  //获取原点X坐标
                        dong.oOriginY=str.point1.y;  //获取原点Y坐标
                        dong.oPixelSize="200000"; //获取像元大小
                        dong.oEndRow=Math.round(x/parseFloat(dong.oPixelSize));    //获取结束行号
                        dong.oEndColumn=Math.round(y/parseFloat(dong.oPixelSize));  //获取结束列号
                        app.map.removeLayer(app.grideGraphicLayer)
                        app.map.removeLayer(app.wanggeLayer)
                        shu_point = [];
                        heng_point = [];
                        wangge();
                        break;
                    }
                }
            }
        } else{//县
            if ( dong.resizess ==3 ) return;
            dong.resizess =3;
            var left_x = event.xmin;
            var left_y = event.ymin+300000;
            for ( var i = 0 ; i < dong.mian_point.length;i ++ ) {
                var str = dong.data[i];
                var x1,x2,y1,y2;
                if ( str.point1.x > str.point2.x ){
                    x1 = str.point2.x;
                    x2=str.point1.x;
                } else if (str.point1.x < str.point2.x ) {
                    x1 = str.point1.x;
                    x2 = str.point2.x;
                }
                if ( str.point1.y > str.point4.y ){
                    y1 = str.point4.y;
                    y2=str.point1.y;
                } else if (str.point1.y < str.point4.y ) {
                    y1 = str.point1.y;
                    y2 = str.point4.y;
                }
                if ( x1 <= left_x && left_x<=x2){
                    if( y1 <= left_y && left_y <= y2){
                        console.log(str);
                        var x = 15075445.5588-str.point1.x;
                        var y = 7327027.875799999-str.point1.y;
                        console.log(x+","+y)
                        dong.oOriginX= str.point1.x;  //获取原点X坐标
                        dong.oOriginY=str.point1.y;  //获取原点Y坐标
                        dong.oPixelSize="100000"; //获取像元大小
                        dong.oEndRow=Math.round(x/parseFloat(dong.oPixelSize));    //获取结束行号
                        dong.oEndColumn=Math.round(y/parseFloat(dong.oPixelSize));  //获取结束列号
                        app.map.removeLayer(app.grideGraphicLayer)
                        app.map.removeLayer(app.wanggeLayer)
                        shu_point = [];
                        heng_point = [];
                        wangge();
                        break;
                    }
                }
            }
        }
    }
}
