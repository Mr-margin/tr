

// var ArcGisUrl = "http://10.100.244.19:8080";
var ArcGisUrl = "http://192.168.1.24:8080";


(function() {
    var isWinRT = (typeof Windows === "undefined") ? false : true;
    var r = new RegExp("(^|(.*?\\/))(Include\.js)(\\?|$)"),
    s = document.getElementsByTagName('script'),
    src, m, baseurl = "";

    for(var i=0, len=s.length; i<len; i++) {
        src = s[i].getAttribute('src');
        if(src) {
            var m = src.match(r);
            if(m) {
                baseurl = m[1];
                break;
            }
        }
    }
    function inputScript(inc){
        if (!isWinRT) {
            var script = '<' + 'script type="text/javascript" src="' + inc + '"' + '><' + '/script>';
            document.writeln(script);
        } else {
            var script = document.createElement("script");
            script.src = inc;
            document.getElementsByTagName("HEAD")[0].appendChild(script);
        }
    }
    function inputCSS(style){
        if (!isWinRT) {
            var css = '<' + 'link rel="stylesheet" href="' + style + '"' + '><' + '/>';
            document.writeln(css);
        } else { 
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = style;
            document.getElementsByTagName("HEAD")[0].appendChild(link);
        }
    }
    function loadSMLibs() {//
        inputCSS(ArcGisUrl+"/arcgis_js_v317_api/arcgis_js_api/library/3.17/3.17/dijit/themes/claro/claro.css");
        inputCSS(ArcGisUrl+"/arcgis_js_v317_api/arcgis_js_api/library/3.17/3.17/esri/css/esri.css");
        inputScript(ArcGisUrl+"/arcgis_js_v317_api/arcgis_js_api/library/3.17/3.17/init.js");
    }
    // function loadSMLibs() {//
    //     inputCSS(ArcGisUrl+"/arcgis_js_v324_api/arcgis_js_api/library/3.24/3.24/dijit/themes/claro/claro.css");
    //     inputCSS(ArcGisUrl+"/arcgis_js_v324_api/arcgis_js_api/library/3.24/3.24/esri/css/esri.css");
    //     inputScript(ArcGisUrl+"/arcgis_js_v324_api/arcgis_js_api/library/3.24/3.24/init.js");
    // }
    loadSMLibs();
})();


/*************************************地图定位通用脚本****************************************************************/
function publicDingwei(lon,lat){
    var app = {};
    var dong = {};
    var extentPar = {
        "xmin": 65.765135846784, "ymin": 13.1245384992698, "xmax": 150.23486415321602, "ymax": 54.8754615007302,
        "spatialReference": {"wkid": 4326}
    }
    require(["esri/map","esri/SpatialReference","esri/geometry/Extent","esri/dijit/InfoWindowLite",
             "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
             "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo","dojo/dom-construct","esri/tasks/LengthsParameters",
             "esri/tasks/AreasAndLengthsParameters","esri/tasks/GeometryService","esri/toolbars/draw","esri/geometry/Point",
             "esri/tasks/PrintTask","esri/tasks/PrintTemplate","esri/tasks/PrintParameters","esri/layers/FeatureLayer",
             "esri/symbols/SimpleFillSymbol","dojo/dom","esri/layers/GraphicsLayer","esri/symbols/SimpleMarkerSymbol","esri/symbols/Font",
             "esri/symbols/TextSymbol","esri/geometry/Polygon","extras/TianDiTuLayer", "esri/layers/LabelClass","esri/renderers/SimpleRenderer",
             "esri/symbols/PictureMarkerSymbol","extras/DEBubblePopup","esri/geometry/Circle","esri/geometry/webMercatorUtils","esri/layers/ArcGISDynamicMapServiceLayer","dojo/domReady!"
         ],function(Map,SpatialReference,Extent,InfoWindowLite,
                    QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
                    WMTSLayer,WMTSLayerInfo,TileInfo,domConstruct,LengthsParameters,AreasAndLengthsParameters,GeometryService,Draw,Point,
                    PrintTask,PrintTemplate,PrintParameters,FeatureLayer,SimpleFillSymbol,dom,GraphicsLayer,SimpleMarkerSymbol,Font,TextSymbol,Polygon,
                    TianDiTuLayer,LabelClass,SimpleRenderer,PictureMarkerSymbol,DEBubblePopup,Circle,webMercatorUtils,ArcGISDynamicMapServiceLayer
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
             dong.TianDiTuLayer = TianDiTuLayer;
             dong.LabelClass = LabelClass;
             dong.SimpleRenderer = SimpleRenderer;
             dong.PictureMarkerSymbol = PictureMarkerSymbol;
             dong.DEBubblePopup =DEBubblePopup ;
             dong.Circle = Circle;
             dong.webMercatorUtils = webMercatorUtils;
             dong.ArcGISDynamicMapServiceLayer = ArcGISDynamicMapServiceLayer;
        app.map = new Map("publicMap", {
            logo: false,
            minZoom:4,
            maxZoom:20,
            zoom: 4,
            showLabels: true,
            extent: new dong.Extent(extentPar)
        })
        //全球矢量地图服务
        app.baseLayer = new TianDiTuLayer(TianDiTuLayer.VEC_BASE_WEBMERCATOR,{id:"vectorLayer"});//矢量
        app.annoLayer = new TianDiTuLayer(TianDiTuLayer.VEC_ANNO_WEBMERCATOR,{id:"vectorNoteLayer"});//注记

        app.map.addLayer(app.baseLayer);
        app.map.addLayer(app.annoLayer);
        app.graphicsLayer = new dong.GraphicsLayer({id: "publicCityGraphicLayer"});
        app.map.addLayer(app.graphicsLayer);
        var pointSymbol = new dong.PictureMarkerSymbol("/seimp/img/dian/tongyong.png", 32, 32);
        pointSymbol.setOffset(0,16);
        var point = new dong.Point(handle_x(lon),handle_y(lat), new dong.SpatialReference({ wkid: 3857 }));
        var graphic = new dong.Graphic(point,pointSymbol,"","");
        app.graphicsLayer.add(graphic);
        for(var i = 0 ; i < 12 ; i ++ ){
            $("#publicMap .esriSimpleSliderIncrementButton").click();
        }
        //定位
        var extent = new dong.Extent(handle_x(lon),handle_y(lat),handle_x(lon),handle_y(lat), new dong.SpatialReference({ wkid:3857 }));
        // var extent = new dong.Extent(handle_x("116.366711"),handle_y("39.942213"),handle_x("116.366711"),handle_y("39.942213"), new dong.SpatialReference({ wkid:3857 }));
        app.map.setExtent(extent);
    });
}
function handle_x(x) {
    return (x / 180.0) * 20037508.34;
}
//纬度度转墨卡托
function handle_y(y) {
    if (y > 85.05112) {
        y = 85.05112;
    }
    if (y < -85.05112) {
        y = -85.05112;
    }
    y = (Math.PI / 180.0) * y;
    var tmp = Math.PI / 4.0 + y / 2.0;
    return 20037508.34 * Math.log(Math.tan(tmp)) / Math.PI;
}
//小地图悬浮框的操作
function tuoDongDiv(){
	
	var $div0 = $(".data_table");
    /* 绑定鼠标左键按住事件 */
    $div0.bind("mousedown",function(event){
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
        var now_x = (offset_x + _x ) + "px";
        var now_y = (offset_y + _y ) + "px";
        /* 改变目标元素的位置 */
        if(now_y < 0){
        	now_y = 0
        }
        $div0.css({
          top:now_y,
          left:now_x
        });
        $('#tongjituDivPublic').css({
        	top:now_y,
            left:now_x
        })
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
    	var top = $div0.css('top').split('px')
    	var left = $div0.css('left').split('px')
    	if(top[0] < 0){
    		$div0.css('top','5%')
    		$('#tongjituDivPublic').css('top','5%')
    	}
    	if(left[0] < 0){
    		$div0.css('left','10px')
    		$('#tongjituDivPublic').css('left','10px')
    	}
      $(this).unbind("mousemove");
    });
    $(document).bind("mouseup", function () {
        $(this).unbind("mousemove");
    });
	


    //关闭小地图并删除
    $("#tongjituDivPublic  div.tabtop_rt").click(function () {
        var box = document.getElementById("tongjituDivPublic");
        document.body.removeChild(box);
    })
}
/****************dom添加地图div**********************/
function arcgisDw(lon,lat){
    // ajaxPost('/seimp/tianditu/getAddress', {name:"国兴大厦"}).done(function (result) {
    //     console.log(result)
    // })
    if ( $("#tongjituDivPublic").length > 0 ) {
        $("#publicMap").html("");
    } else {
        var dom = document.createElement("div");
        document.body.appendChild(dom);
        // dom.id = "publicMap";
        dom.id = "tongjituDivPublic";
        dom.style.left = "32%";
        dom.style.top ="15%";
        dom.style.width = "541px";
        dom.style.height = "465px";
        dom.style.position="fixed";
        dom.style.zIndex="99";
        dom.setAttribute("class","main_table");

        dom.innerHTML = '<div class="main_tabletop data_table" id="main_tabletitle" style="width: 541px;text-align: center;height: 40px;position: fixed;top: 15%;left:32%;cursor: move;line-height: 40px;background: #005bac;color: #fff;text-align: center;border-top-left-radius: 8px;border-top-right-radius: 8px;">' +
            '<div class="tabtop_left" style="float: left;padding-left: 42%;font-size: 16px;line-height: 40px;height: 40px;font-weight: normal;">地图定位</div><div class="tabtop_rt arcMap_img"></div><i class="large" data=\'1\'></i></div>' +
            ' <div class="data1" style="margin-top:40px;width: 541px;background: #fff;border-bottom-left-radius: 8px;border-bottom-right-radius: 8px;"><div id="publicMap" class="table-body ps-container"style="border-bottom-left-radius: 8px;border-bottom-right-radius: 8px;width: 541px;height:425px;overflow: auto;max-height: 425px;position: initial;border:1px solid #ededed">' +
            '</div></div></div>';
    }
    tuoDongDiv();
    publicDingwei(lon,lat);
}

/***************************图层控制***********************************************/
//图层控制按钮
$("#tuceng").click(function(){
    var  aaa =document.getElementById("tucengDiv").style.display;
    if (aaa =="none") {
        $("#tucengDiv").show();
        $("#meaDiv").hide();
        $("#toumingduDiv").hide();
    }
    else $("#tucengDiv").hide();

})
//图层控制中的眼睛  显隐
$('#tucengDiv').on('click','.fa-lg',function(){
    var lid = $(this).attr("id");
    var ischeck=$(this).attr("checked");
    var fz = true;
    if(ischeck == "checked"){
        $(this).attr("checked",false);
        $(this).removeClass('fa-eye');
        $(this).addClass('fa-eye-slash');
        fz = true ;
    }else{
        $(this).attr("checked",true);
        $(this).removeClass('fa-eye-slash');
        $(this).addClass('fa-eye');
        fz = false
    }
    if(lid == "ss2"){//基础地图
        eye("vectorLayer",fz);
    } else if(lid=="ss1"){//统计图层
        eye("countryFeatureLayer",fz);
        // if (map.graphicsLayerIds.length>1) {
        // 	for( var i = 0 ; i < map.graphicsLayerIds.length; i ++ ) {
        // 		lid = map.graphicsLayerIds[i];
        // 		console.log(lid)
        // 		var layer = map.getLayer(lid);
        // 		if ( fz )  layer.setOpacity(0.0);
        // 		else  layer.setOpacity(1);
        // 	}
        // }
    } else if (lid=="ss3"){//公里网格
        eye("gewangLayer",fz);
    }else if (lid=="ss4"){//影像图层
        eye("imageLayer",fz);
    }else if (lid=="ss5"){//道路图层
        eye("gaosuLayer",fz);
        eye("shengdaoLayer",fz);
    }else if (lid=="ss6"){//河流图层
        eye("riverLayer",fz);
    }else if (lid=="ss7"){//加油站图层
        eye("gasLayer",fz);
    }else if (lid=="ss8"){//中文注记
        eye("vectorNoteLayer",fz);
        eye("annoLayer",fz);
    } else if (lid == "ss9")   app.map.getLayersVisibleAtScale()[2].setVisibility(!fz);
});
//图层显示与隐藏的通用方法
function eye(id,fz){
    try {
        var layer = app.map.getLayer(id);
        if ( fz )  layer.setOpacity(0.0);
        else  layer.setOpacity(1);
    } catch (e) {

    }
}

//增加透明样式以及事件
$(".sjTm").slider({//统计图层滑动条滑动事件
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        for( var i = 0 ; i < app.map.graphicsLayerIds.length; i ++ ) {
            var targetLayer=app.map.getLayer(app.map.graphicsLayerIds[i]);
            if(targetLayer==null){return;}
            targetLayer.setOpacity(percent);
        }
        return;
    }
});
$(".sjTms").slider({//基础地图滑动条滑动事件
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("countryFeatureLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});

$(".dtTm").slider({//基础地图滑动条滑动事件
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("vectorLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".glwgTm").slider({//公里网格滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("gewangLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".yxTm").slider({//影像滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("imageLayer")
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".dlTm").slider({//道路滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("gaosuLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);

        var targetLayer1=app.map.getLayer("shengdaoLayer");
        if(targetLayer1==null){return;}
        targetLayer1.setOpacity(percent);
        return;
    }
});
$(".hlTm").slider({//河流滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer();
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".jyzTm").slider({//加油站滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("gasLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".zwTm").slider({//中文注记滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("vectorNoteLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".google").slider({//谷歌滑动条
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayersVisibleAtScale()[2];
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
//拖动div 开始加载图层顺序
$("#tcDiv").sortable({
    stop:function(event,ui){
        var layerSortArr=[];
        var itemCount=$(".warning-element").length;
        $(".warning-element").each(function(i,item){
            if (item.getAttribute("data") == "gaosuLayer-shengdaoLayer"){
                var tempObj={layer:app.map.getLayer("gaosuLayer"),index:itemCount-1-i};
                var tempObj1={layer:app.map.getLayer("shengdaoLayer"),index:itemCount-1-i};
                layerSortArr.push(tempObj);
                layerSortArr.push(tempObj1);
            } else if(item.getAttribute("data") == "googleLayer"){
                var tempObj={layer:app.map.getLayersVisibleAtScale()[2],index:itemCount-1-i};
                layerSortArr.push(tempObj);
            }  else {
                var tempObj={layer:app.map.getLayer(item.getAttribute("data")),index:itemCount-1-i};
                layerSortArr.push(tempObj);
            }
        });
        resortMapLayers(layerSortArr);//重排序图层
    }
});
//图层顺序
function resortMapLayers(obj){
    var tempStr="[";
    for(var i=0;i<=obj.length-1;i++){
        if(obj[i].layer!=null){
            tempStr+="{id:"+obj[i].layer.id+",index:"+obj[i].index+"},";
            app.map.reorderLayer(obj[i].layer,obj[i].index);//index越大,则优先级越高
        }
    }
    tempStr+="]";
    // console.log(tempStr);
}
//导出
function export_click () {
    //创建地图打印对象
    var printMap = new dong.PrintTask("http://"+ip+":6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task");
    //创建地图打印模版
    var template = new dong.PrintTemplate();
    //创建地图的打印参数，参数里面包括：模版和地图
    var params = new dong.PrintParameters();
    //输出图片的空间参考
    printMap.outSpatialReference = app.map.SpatialReference
    //打印图片的各种参数
    template.exportOptions = {
        width: 900,
        height: 600,
        dpi: 96
    };
    //打印输出的格式
    template.format = "jpg";
//    template.layout = "MAP_ONLY"; // 导出的版式，A3 横向、A3纵向...
    //输出地图的布局
    template.layout = "MAP_ONLY";

    template.layoutOptions={
        titleText:"标题",
        authorText:"制图单位：",
        copyrightText:"版权所有：",
        scalebarUnit:"Kilometers",
    }
    //设置参数地图
    params.map = app.map;
    //设置参数模版
    params.template = template;
    //运行结果
    printMap.execute(params, function(result){
        console.log(result)
        if (result != null) {
            //网页打开生成的地图
            window.open(result.url);
        }
    })
}