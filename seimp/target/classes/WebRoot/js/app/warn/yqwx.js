/******变量*******/
var map;
var yuqingType = "";//舆情类别
var clusterLayer = null;
/***********右边悬浮窗变量**********/
var isHaveData = {//是否有统计图、统计表、时间轴数据
    tongjibiao: 1,
    tongjitu: 0,
    shijianzhou: 0,
    tongjituState: 0,
    tongjibiaoState: 0,
    shijianzhouState: 0
}, isSelect = 1;

//默认显示的行业类别
var industryArr = [];
var newsArr = [], pageIndex, pagesize = 10, pageCount;

var box_width = $("#map").width()
var lim_width = $(".map-item").width()
var width_f = (box_width - lim_width) / 2
$(".map-item").css("margin-left", +width_f + "px");

/***********分省底图****************/
var graphicsLayer = null;
var provinceClick = null;//省界高亮
var provinceExtent = null;//省界边界
var provinceCode = null;//省code
var cityClick = null;//县界高亮
var cityExtent = null;//县界边界
var cityCode = null;//县code
var mapIndustry = "";//地图模式的行业类别
var mapIndustry1 = "";//地图模式的行业类别
var mapIndustry2 = "";//地图模式的行业类别
var mapIndustry3 = "";//地图模式的行业类别
var mapType = "1";//地图类型 1:全国模式 2：某一个省的所有市模式 3：某一个市的点位

//右边表格数据
var data1,data2,data3;

//图例
var countryMinCount = null;
var countryCount = null;
var provinceMinCount = null;
var provinceCount = null;
// 按年
var now = new Date();//当前时间
var YearDate=now.getFullYear();
$("#yearStart").datetimepicker({
    format: 'yyyy',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startView: 4,
    minView: 4,
    endDate:YearDate
}).on("click", function () {
    $("#yearStart").datetimepicker("setEndDate", $("#yearEnd").val());
});
$("#yearEnd").datetimepicker({
    format: 'yyyy',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startView: 4,
    minView: 4,
    endDate:YearDate
}).on("click", function () {
    $("#yearEnd").datetimepicker("setStartDate", $("#yearStart").val());
});
// $("#yearEnd").val(now.Format("yyyy"));
// $("#yearStart").val(now.Format("yyyy")-3);


/********页面加载**********/
$(function () {
    //加载动画开始
    zmblockUI('body', 'start');
    require(["esri/map", "esri/SpatialReference", "esri/geometry/Extent",
        "esri/layers/WMTSLayer", "esri/layers/WMTSLayerInfo", "esri/layers/TileInfo",
        "extras/DEBubblePopup",
        "esri/dijit/InfoWindowLite", "dojo/dom-construct"
    ], function (Map, SpatialReference, Extent,
                 WMTSLayer, WMTSLayerInfo, TileInfo,
                 DEBubblePopup,
                 InfoWindowLite, domConstruct) {
        extent = new Extent(extentPar);
        var infoWindow = new DEBubblePopup();
        //初始化地图
        map = new Map("map", {
            logo: false,
            minZoom: 2,
            showLabels: true,
            infoWindow: infoWindow,
            extent: extent
        })

        //设置弹出框样式
        var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        //加载天地图：全球矢量地图服务、全球矢量中文注记服务
        vectorMap(map);
        //更新舆情
        initLayerByUser();


    });//--require end

    //生成类型
    var json = {};
    ajaxPost("/seimp/eliminate/getXfyqIndustry", json).done(function (result) {
        if (result.status == 0) {//请求成功
            $.each(result.data.WJJS,function(i,item){
                industryArr.push({id: item.WJJS, name: item.WJJS})
            })
            createInsutryClick();
            var html = '<a class=\'lt metal\' onclick=switchIndustry(\'\',$(this))>全部</a>';
            $.each(result.data.YJXM,function(i,item){
               html += "<a class='lt' value='" + item.YJXM + "' onclick=switchIndustry2('" + item.YJXM + "',$(this))>" + item.YJXM + "</a>";
            })
            $("#mapItem2").html(html);
        }
    });
})//--load end

/*改变时间范围重新加载地图*/
function gotoDate() {
    $("#timeAll").siblings().removeClass("metal");
    $("#timeAll").removeClass("metal");
    if(mapType==1){
        updateCountry(true);
    }else if(mapType==2){
        updateProvince(true);
    }else if(mapType==3){
        updateCity(true);
    }
}
//时间设置全部时间
function allTime(){
    $("#yearEnd").val("");
    $("#yearStart").val("");
    $("#timeAll").addClass("metal");
    if(mapType==1){
        updateCountry(true);
    }else if(mapType==2){
        updateProvince(true);
    }else if(mapType==3){
        updateCity(true);
    }
}
//判断是国家级用户，还是省级用户，默认显示图层不同
function initLayerByUser() {
    require(["esri/map", "esri/SpatialReference", "esri/geometry/Extent",
        "esri/layers/WMTSLayer", "esri/layers/WMTSLayerInfo", "esri/layers/TileInfo",
        "extras/DEBubblePopup",
        "esri/tasks/QueryTask", "esri/tasks/query", "esri/graphic", "esri/geometry/Polyline", "esri/symbols/SimpleLineSymbol", "esri/Color",
        "esri/dijit/InfoWindowLite", "dojo/dom-construct"
    ], function (Map, SpatialReference, Extent,
                 WMTSLayer, WMTSLayerInfo, TileInfo,
                 DEBubblePopup,
                 QueryTask, Query, Graphic, Polyline, SimpleLineSymbol, Color,
                 InfoWindowLite, domConstruct) {
        //判断用户是否是省级用户
        var storage = window.sessionStorage;
        //管理员、国家级用户
        if (storage.getItem("userLevel") == null || storage.getItem("userLevel") == "0" || storage.getItem("userLevel") == "1") {
            //更新全国模式
            updateCountry(true);
        } else if (storage.getItem("userLevel") == "2") {//省级用户
            //当前省的行政区划
            provinceCode = storage.getItem("regionCode");
            //定位到当前省
            var queryTask = new QueryTask("http://" + ip + ":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0");
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.outSpatialReference = map.spatialReference;
            query.where = "PROV_CODE = " + provinceCode;
            queryTask.execute(query, showResults);

            function showResults(result) {
                //判断查询是否有结果
                if (result.features.length > 0) {
                    var graphic = result.features[0];
                    //当前省的边界
                    provinceExtent = graphic.geometry.getExtent();
                    map.setExtent(provinceExtent);
                    //当前省的高亮
                    var lineJson = {
                        "paths": graphic.geometry.rings,
                        "spatialReference": {"wkid": 4326}
                    }
                    var highPolyline = new Polyline(lineJson);
                    var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 51]), 2);
                    var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceClick"});
                    //记录边界高亮
                    provinceClick = highGraphic;
                    map.graphics.add(provinceClick);
                    //记录省名
//					 provinceSName = graphic.attributes.NAME;
                    //改变右上角按钮Text
                    $("#province").html(graphic.attributes.NAME);
                    //显示右上角按钮
                    $("#province").removeClass("none");
                    //点击某一个省份的时候，隐藏右上角的某一个市的按钮
                    $("#city").addClass("none");
                }
                //更新当前省的分市图层
                updateProvince(true);
            }
        }
    })
}

//更新全国模式 true：加载 false：显示
function updateCountry(flag) {
    //关闭弹出框
    map.infoWindow.remove();
    //显示国界线图层
    showGuojie();
    //处理图例
    //记录地图模式
    mapType = "1";
    //清除高亮
    removeGraphic("provinceClick");
    //隐藏某一个省模式的图形
    if (map.getLayer("provinceFeatureLayer") != null) {
        map.getLayer("provinceFeatureLayer").setVisibility(false);
    }
    if (map.getLayer("provinceGraphicsLayer") != null) {
        map.getLayer("provinceGraphicsLayer").setVisibility(false);
    }
    //隐藏某一个市的点位图层
    if (map.getLayer("cityGraphicLayer") != null) {
        map.getLayer("cityGraphicLayer").setVisibility(false);
    }
//	map.centerAndZoom([108,34],3);
    map.setExtent(extent);
    if (flag) {
        if (map.getLayer("countryFeatureLayer") != null) {
            map.removeLayer(map.getLayer("countryFeatureLayer"));
        }
        if (map.getLayer("countryGraphicsLayer") != null) {
            map.removeLayer(map.getLayer("countryGraphicsLayer"));
        }
        //加载
        initCountry()

    } else {
        //清除高亮
        removeGraphic("provinceClick");

        //图例
        updateLegend(countryMinCount, countryCount);
        //显示
        if (map.getLayer("countryFeatureLayer") != null) {
            map.getLayer("countryFeatureLayer").setVisibility(true);
        }
        if (map.getLayer("countryGraphicsLayer") != null) {
            map.getLayer("countryGraphicsLayer").setVisibility(true);
        }

        //切换表格数据
        updateRightTable(data1);
    }
}

//更新某一个省份的模式
function updateProvince(flag) {
    //关闭弹出框
    map.infoWindow.remove();
    //清除国界线图层
    hideGuoJie();
    //记录地图模式
    mapType = "2";
    //隐藏全国模式的图形
    if (map.getLayer("countryFeatureLayer") != null) {
        map.getLayer("countryFeatureLayer").setVisibility(false);
    }
    if (map.getLayer("countryGraphicsLayer") != null) {
        map.getLayer("countryGraphicsLayer").setVisibility(false);
    }
    //隐藏某一个市的点位图层
    if (map.getLayer("cityGraphicLayer") != null) {
        map.getLayer("cityGraphicLayer").setVisibility(false);
    }
    if (flag) {
        if (map.getLayer("provinceFeatureLayer") != null) {
            map.removeLayer(map.getLayer("provinceFeatureLayer"));
        }
        if (map.getLayer("provinceGraphicsLayer") != null) {
            map.removeLayer(map.getLayer("provinceGraphicsLayer"));
        }
        //加载
        initProvince();
    } else {
        removeGraphic("provinceClick");
        map.graphics.add(provinceClick);
        map.setExtent(provinceExtent);
        //图例
        updateLegend(provinceMinCount, provinceCount);
        //显示
        if (map.getLayer("provinceFeatureLayer") != null) {
            map.getLayer("provinceFeatureLayer").setVisibility(true);
        }
        if (map.getLayer("provinceGraphicsLayer") != null) {
            map.getLayer("provinceGraphicsLayer").setVisibility(true);
        }

        //显示表格数据
        updateRightTable(data2);

    }
}

//更新某一个市的模式
function updateCity(flag) {
    //关闭弹出框
    map.infoWindow.remove();
    //清除国界线图层
    hideGuoJie();
    //记录地图模式
    mapType = "3";
    //隐藏某一个省模式的图形
    if (map.getLayer("provinceFeatureLayer") != null) {
        map.getLayer("provinceFeatureLayer").setVisibility(false);
    }
    if (map.getLayer("provinceGraphicsLayer") != null) {
        map.getLayer("provinceGraphicsLayer").setVisibility(false);
    }
    //隐藏全国模式的图形
    if (map.getLayer("countryFeatureLayer") != null) {
        map.getLayer("countryFeatureLayer").setVisibility(false);
    }
    if (map.getLayer("countryGraphicsLayer") != null) {
        map.getLayer("countryGraphicsLayer").setVisibility(false);
    }
    if (flag) {
        //销毁某一个市的点位图层
        if (map.getLayer("cityGraphicLayer") != null) {
            map.removeLayer(map.getLayer("cityGraphicLayer"));
        }
        //加载
        updateYuqingLayer();
    } else {
        removeGraphic("provinceClick");
        map.graphics.add(cityClick);
        map.setExtent(cityExtent);
        //显示
        if (map.getLayer("cityGraphicLayer") != null) {
            map.getLayer("cityGraphicLayer").setVisibility(true);
        }
    }

    //显示表格数据
    // updateRightTable(data3);
}
var zs_year =0;
var yue = 0;
var yuejia = 0;
//加载全国图层
var provinceName = "";
function initCountry() {
    require(["esri/map", "esri/dijit/Legend",
        "esri/layers/FeatureLayer", "esri/renderers/UniqueValueRenderer", "esri/symbols/TextSymbol", "esri/renderers/SimpleRenderer",
        "esri/graphic", "esri/geometry/Polyline", "esri/renderers/ClassBreaksRenderer",
        "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/layers/LabelClass"
    ], function (Map, Legend,
                 FeatureLayer, UniqueValueRenderer, TextSymbol, SimpleRenderer,
                 Graphic, Polyline, ClassBreaksRenderer,
                 SimpleFillSymbol, SimpleLineSymbol, Color, LabelClass) {

        //加载地图服务
        var featureLayer = new FeatureLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            id: "countryFeatureLayer"
        });

        //加载省名标签
        var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
        statesLabel.font.setSize("12pt");
        statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
        var labelClass = new LabelClass({
            "labelExpressionInfo": {"value": "{NAME}"},
            "useCodedValues": true,
            "labelPlacement": "below-right",
            "fieldInfos": [{fieldName: "NAME"}]
        });
        labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);

        var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
        var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
        renderer = new SimpleRenderer(defaultSymbol);
        featureLayer.setRenderer(renderer);

        //添加点击事件
        featureLayer.on("click", function (evt) {
            //高亮设置
            removeGraphic("provinceClick");
            var lineJson = {
                "paths": evt.graphic.geometry.rings,
                "spatialReference": {"wkid": 4326}
            }
            var highPolyline = new Polyline(lineJson);
            var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 51]), 2);
            var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceClick"});
            //记录边界高亮
            provinceClick = highGraphic;
            map.graphics.add(highGraphic);
            //获取点击省份的PROV_CODE
            provinceCode = evt.graphic.attributes.PROV_CODE;
            provinceName = evt.graphic.attributes.NAME_S;
            //设置地图边界
            map.setExtent(evt.graphic.geometry.getExtent());
            //记录地图边界
            provinceExtent = evt.graphic.geometry.getExtent();
            //改变右上角按钮Text
            $("#province").html(evt.graphic.attributes.NAME);
            //显示右上角按钮
            $("#province").removeClass("none");
            //点击某一个省份的时候，隐藏右上角的某一个市的按钮
            $("#city").addClass("none");
            //更新某一个省的点位图层
            updateProvince(true);
        });

        //添加鼠标进入事件
        featureLayer.on("mouse-over", function (evt) {
            removeGraphic("provinceHigh");
            var lineJson = {
                "paths": evt.graphic.geometry.rings,
                "spatialReference": {"wkid": 4326}
            }
            var highPolyline = new Polyline(lineJson);
            var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([252, 78, 42]), 2);
            var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
            map.graphics.add(highGraphic);
        })
        //添加鼠标移出事件
        featureLayer.on("mouse-out", function () {
            removeGraphic("provinceHigh");
        })

        featureLayer.on("graphic-node-add", function () {
            //加载动画结束
            zmblockUI('body', 'end');
            addGuojie();
        })

        //ajax获取各省产粮油大县的数量
        var json ;
        json = {industry: mapIndustry,industry1: mapIndustry1,industry2: mapIndustry2,industry3: mapIndustry3,startTime:$("#yearStart").val(),endTime:$("#yearEnd").val(),type:"1"};

        getTableYq1(json);
        ajaxPost('/seimp/eliminate/getYqwx', json).done(function (result) {
            if (result.status == 0) {//请求成功
                if (result.data.length > 0) {
                    var data = result.data;
                    //模拟数据
                    /*var data = [{
                     province:'110000',
                     count:1
                     },{
                     province:'120000',
                     count:1
                     },{
                     province:'130000',
                     count:3
                     }];*/
                    //处理数据，获取各省数量的最大值最小值
                    var minCount = 0;
                    var maxCount = 0;
                    for (var i = 0; i < data.length; i++) {
                        currItem = data[i];
                        if (currItem.count < minCount) {
                            minCount = currItem.count;
                        }
                        if (currItem.count > maxCount) {
                            maxCount = currItem.count;
                        }
                    }
                    //处理最大值
                    maxCount = maxmain(maxCount);
                    var count = (maxCount - minCount) / 6;

                    //更新图例
                    updateLegend(minCount, count);
                    //记录图例参数
                    countryMinCount = minCount;
                    countryCount = count;

                    //设置分省底图各个分段的symbol
                    // var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    // var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    // var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([255, 255, 229, 1]));
                    // var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([255, 247, 188, 1]));
                    // var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 227, 145, 1]));
                    // var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 196, 79, 1]));
                    // var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 153, 41, 1]));
                    // var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([236, 112, 20, 1]));
                    // renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");


                    //更新图例
//					updateLegend(minCount,count);

                    // for (var i = 0; i < data.length; i++) {
                    //     var currItem = data[i];
                    //     if (minCount <= currItem.count && currItem.count < minCount + count * 1) {
                    //         renderer.addValue(currItem.province, symbol1);
                    //     } else if (minCount + count * 1 <= currItem.count && currItem.count < minCount + count * 2) {
                    //         renderer.addValue(currItem.province, symbol2);
                    //     } else if (minCount + count * 2 <= currItem.count && currItem.count < minCount + count * 3) {
                    //         renderer.addValue(currItem.province, symbol3);
                    //     } else if (minCount + count * 3 <= currItem.count && currItem.count < minCount + count * 4) {
                    //         renderer.addValue(currItem.province, symbol4);
                    //     } else if (minCount + count * 4 <= currItem.count && currItem.count <= minCount + count * 5) {
                    //         renderer.addValue(currItem.province, symbol5);
                    //     } else if (minCount + count * 5 <= currItem.count && currItem.count <= minCount + count * 6) {
                    //         renderer.addValue(currItem.province, symbol6);
                    //     }
                    // }
                    //为分省地图设置渲染
//                    featureLayer.setRenderer(renderer);
                    //将分省地图添加到地图上
                    map.addLayer(featureLayer, 2);
                    //分段渲染的底图加载完成之后，才能加载数字图层
                    featureLayer.on("update-end", function () {
                        initCountryCount(data);
                        // setTimeout("initCountry()",5000)
                    })


                } else {
                    //如果没有数据
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");
//                    featureLayer.setRenderer(renderer);
                    //更新图例
                    updateLegend(0, 0);
                    map.addLayer(featureLayer, 2);
                    featureLayer.on("update-end", function () {//分段渲染的底图加载完成之后，才能加载分省饼图
                        // initCountryCount();
                        // setTimeout("initCountry()",5000)
                    })
                }
            }
        });//--ajax end
    });//-require end
}

//加载各省数字图层
var sheng_bs = 0 ;
function initCountryCount(data) {
    try {
        map.removeLayer(map.getLayer("countryGraphicsLayer"));
    } catch (e) {

    }
    require([
        "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
        "esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol",
        "esri/graphic", "esri/symbols/TextSymbol", "esri/layers/GraphicsLayer",
        "esri/geometry/Point",
        "esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
    ], function (SimpleMarkerSymbol, SimpleLineSymbol,
                 PictureMarkerSymbol, CartographicLineSymbol,
                 Graphic, TextSymbol, GraphicsLayer,
                 Point,
                 Color, dom, on) {
        var graphicsLayer = new GraphicsLayer({id:"countryGraphicsLayer"});
        map.addLayer(graphicsLayer);
//        graphicsLayer.setMinScale(18489334.7159);
        //获取省界图层的Graphics
        var feaGraphics = map.getLayer("countryFeatureLayer").graphics;
        //添加省名
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            var point = currFeaGraphic.geometry.getCentroid();
            //处理河北省
            if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                point = new Point([115.18, 38]);
            }
            if (currFeaGraphic.attributes.NAME!="澳门特别行政区" && currFeaGraphic.attributes.NAME!="香港特别行政区"){
                var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
                symbol.font.setSize("10pt");
                symbol.font.setWeight(700);
                symbol.font.setFamily("微软雅黑");
                symbol.setOffset(0, -14);
                var graphic = new Graphic(point, symbol);
                map.getLayer("countryGraphicsLayer").add(graphic);
            }
        }
        //遍历省界图层的graphics
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            //遍历数据
            for (var j = 0; j < data.length; j++) {
                var currItem = data[j];
                //判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
                if (currFeaGraphic.attributes.PROV_CODE == currItem.province) {

                    var attributes = {
                        provoinceCode: currItem.province,
                        provinceName: currItem.name
                    }
                    var point = currFeaGraphic.geometry.getCentroid();
                    //处理河北省
                    if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                        point = new Point([115.18, 38]);
                    }
                    var symbolSize = 24;
                    if (currItem.count.toString().length == 1) {
                        symbolSize = 24;
                    } else if (currItem.count.toString().length == 2) {
                        symbolSize = 30;
                    } else if (currItem.count.toString().length == 3) {
                        symbolSize = 40;
                    } else if (currItem.count.toString().length == 4) {
                        symbolSize = 50;
                    } else if (currItem.count.toString().length == 5) {
                        symbolSize = 60;
                    } else {
                        symbolSize = currItem.count.toString().length * 12;
                    }

                    var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
                    var symbol2 = new TextSymbol(currItem.count).setOffset(0, symbolSize / 2 - 5).setColor(new Color([255, 255, 255, 1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
                    symbol2.font.setFamily("Times");
                    symbol2.font.setSize("10pt");
                    symbol2.font.setWeight(600);
                    var graphic1 = new Graphic(point, symbol1, attributes);
                    var graphic2 = new Graphic(point, symbol2, attributes);
                    map.getLayer("countryGraphicsLayer").add(graphic1);
                    map.getLayer("countryGraphicsLayer").add(graphic2);
                }
            }
        }
        // map.addLayer(graphicsLayer);
        map.on("update-end",function(){
            // setTimeout("initCountry()",5000)
        })

    });//--require end
}
var cityName = "";
//加载某一个省的所有市图层
function initProvince() {
    require(["esri/map", "esri/dijit/Legend",
        "esri/layers/FeatureLayer", "esri/renderers/UniqueValueRenderer", "esri/symbols/TextSymbol", "esri/renderers/SimpleRenderer",
        "esri/graphic", "esri/geometry/Polyline", "esri/renderers/ClassBreaksRenderer",
        "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/layers/LabelClass"
    ], function (Map, Legend,
                 FeatureLayer, UniqueValueRenderer, TextSymbol, SimpleRenderer,
                 Graphic, Polyline, ClassBreaksRenderer,
                 SimpleFillSymbol, SimpleLineSymbol, Color, LabelClass) {

        //加载地图服务
        var featureLayer = new FeatureLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/city/MapServer/0", {
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            id: "provinceFeatureLayer"
        });

        featureLayer.setDefinitionExpression("KIND_1 like '" + (provinceCode + "").substr(0, 2) + "%'");

        //加载市名标签
        var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
        statesLabel.font.setSize("12pt");
        statesLabel.font.setWeight(700);
        statesLabel.setOffset(20, -20);
        var labelClass = new LabelClass({
            "labelExpressionInfo": {"value": "{NAME}"},
            "useCodedValues": true,
            "labelPlacement": "below-right",
            "fieldInfos": [{fieldName: "NAME"}]
        });
        labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);

        var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
        var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
        renderer = new SimpleRenderer(defaultSymbol);
        featureLayer.setRenderer(renderer);

        //添加点击事件
        featureLayer.on("click", function (evt) {
            //高亮设置
            removeGraphic("provinceClick");
            var lineJson = {
                "paths": evt.graphic.geometry.rings,
                "spatialReference": {"wkid": 4326}
            }
            var highPolyline = new Polyline(lineJson);
            var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 51]), 2);
            var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceClick"});
            cityClick = highGraphic;
            map.graphics.add(highGraphic);

            //获取点击时的PROV_CODE
            cityCode = evt.graphic.attributes.KIND_1 + "00";
            cityName = evt.graphic.attributes.NAME;
            console.log(evt.graphic.attributes)
            //设置地图边界
            map.setExtent(evt.graphic.geometry.getExtent());
            //记录地图边界
            cityExtent = evt.graphic.geometry.getExtent();
            //改变右上角按钮Text
            $("#city").html(evt.graphic.attributes.NAME);
            //显示右上角按钮
            $("#city").removeClass("none");
            //更新一个市的点位
            updateCity(true);
        });

        //添加鼠标进入事件
        featureLayer.on("mouse-over", function (evt) {
            removeGraphic("provinceHigh");
            var lineJson = {
                "paths": evt.graphic.geometry.rings,
                "spatialReference": {"wkid": 4326}
            }
            var highPolyline = new Polyline(lineJson);
            var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([252, 78, 42]), 2);
            var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
            map.graphics.add(highGraphic);
        })
        //添加鼠标移出事件
        featureLayer.on("mouse-out", function () {
            removeGraphic("provinceHigh");
        })

        featureLayer.on("graphic-node-add", function () {
            //加载动画结束
            zmblockUI('body', 'end');
        })

        //ajax获取某一个省的各个市的数量
        var json ;
        json = {industry: mapIndustry,industry1: mapIndustry1,industry2: mapIndustry2,industry3: mapIndustry3,startTime:$("#yearStart").val(),endTime:$("#yearEnd").val(),type:"2",code: provinceCode,name:provinceName};
        //更新地图的同时，更新右边表格数据
        getTableYq2(json);
        ajaxPost('/seimp/eliminate/getYqwx', json).done(function (result) {
            if (result.status == 0) {//请求成功
                if (result.data.length > 0) {
                    var data = result.data;
                    //处理数据，获取各市数量的最大值最小值
                    var minCount = 0;
                    var maxCount = 0;
                    for (var i = 0; i < data.length; i++) {
                        currItem = data[i];
                        if (currItem.count < minCount) {
                            minCount = currItem.count;
                        }
                        if (currItem.count > maxCount) {
                            maxCount = currItem.count;
                        }
                    }
                    //重新计算最大值
                    maxCount = maxmain(maxCount);
                    var count = (maxCount - minCount) / 6;
                    //更新图例
                    updateLegend(minCount, count);
                    //记录图例参数
                    provinceMinCount = minCount;
                    provinceCount = count;

                    //设置分市底图各个分段的symbol
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([255, 255, 229, 1]));
                    var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([255, 247, 188, 1]));
                    var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 227, 145, 1]));
                    var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 196, 79, 1]));
                    var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 153, 41, 1]));
                    var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([236, 112, 20, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "KIND_1");


                    //更新图例
//					updateLegend(minCount,count);

                    for (var i = 0; i < data.length; i++) {
                        var currItem = data[i];
                        if (minCount <= currItem.count && currItem.count < minCount + count * 1) {
                            renderer.addValue(currItem.city.substr(0, 4), symbol1);
                        } else if (minCount + count * 1 <= currItem.count && currItem.count < minCount + count * 2) {
                            renderer.addValue(currItem.city.substr(0, 4), symbol2);
                        } else if (minCount + count * 2 <= currItem.count && currItem.count < minCount + count * 3) {
                            renderer.addValue(currItem.city.substr(0, 4), symbol3);
                        } else if (minCount + count * 3 <= currItem.count && currItem.count < minCount + count * 4) {
                            renderer.addValue(currItem.city.substr(0, 4), symbol4);
                        } else if (minCount + count * 4 <= currItem.count && currItem.count <= minCount + count * 5) {
                            renderer.addValue(currItem.city.substr(0, 4), symbol5);
                        } else if (minCount + count * 5 <= currItem.count && currItem.count <= minCount + count * 6) {
                            renderer.addValue(currItem.city.substr(0, 4), symbol6);
                        }
                    }
                    //为分市地图设置渲染
//                    featureLayer.setRenderer(renderer);
                    //将分市地图添加到地图上
                    map.addLayer(featureLayer, 2);
                    //分段渲染的底图加载完成之后，才能加载数字图层
                    featureLayer.on("update-end", function () {
                        initProvinceCount(data);
                    })


                } else {//如果没有数据
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "KIND_1");
//                    featureLayer.setRenderer(renderer);
                    //更新图例
                    updateLegend(0, 0);
                    map.addLayer(featureLayer, 2);
                    featureLayer.on("update-end", function () {//分段渲染的底图加载完成之后，才能加载分省饼图
                        initProvinceCount(data);
                    })
                }
            }
        });//--ajax end
    });//-require end
}

//加载某一个省各市的数字图层
function initProvinceCount(data) {
    try {
        map.removeLayer(map.getLayer("provinceGraphicsLayer"));
    } catch (e) {

    }
    require([
        "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
        "esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol",
        "esri/graphic", "esri/symbols/TextSymbol", "esri/layers/GraphicsLayer",
        "esri/geometry/Point",
        "esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
    ], function (SimpleMarkerSymbol, SimpleLineSymbol,
                 PictureMarkerSymbol, CartographicLineSymbol,
                 Graphic, TextSymbol, GraphicsLayer,
                 Point,
                 Color, dom, on) {
        var graphicsLayer = new GraphicsLayer({id: "provinceGraphicsLayer"});
//        graphicsLayer.setMinScale(4622333.67898);
        //获取省界图层的Graphics
        var feaGraphics = map.getLayer("provinceFeatureLayer").graphics;

        //添加省名
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            var point = currFeaGraphic.geometry.getCentroid();
            var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
            symbol.font.setSize("10pt");
            symbol.font.setWeight(700);
            symbol.font.setFamily("微软雅黑");
            symbol.setOffset(0, -14);
            var graphic = new Graphic(point, symbol);
            graphicsLayer.add(graphic);
        }

        //遍历省界图层的graphics
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            if(JSON.stringify(data) != "[]") {
                //遍历数据
                for (var j = 0; j < data.length; j++) {
                    var currItem = data[j];
                    //判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
                    if (currFeaGraphic.attributes.KIND_1 == currItem.city.substr(0, 4)) {

                        var attributes = {
                            countyCode: currItem.code,
                            countyName: currItem.name
                        }
                        var point = currFeaGraphic.geometry.getCentroid();
                        var symbolSize = 24;
                        if (currItem.count.toString().length == 1) {
                            symbolSize = 24;
                        } else if (currItem.count.toString().length == 2) {
                            symbolSize = 30;
                        } else if (currItem.count.toString().length == 3) {
                            symbolSize = 40;
                        } else if (currItem.count.toString().length == 4) {
                            symbolSize = 50;
                        } else if (currItem.count.toString().length == 5) {
                            symbolSize = 60;
                        } else {
                            symbolSize = currItem.count.toString().length * 12;
                        }

                        var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
                        var symbol2 = new TextSymbol(currItem.count).setOffset(0, symbolSize / 2 - 5).setColor(new Color([255, 255, 255, 1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
                        symbol2.font.setFamily("Times");
                        symbol2.font.setSize("10pt");
                        symbol2.font.setWeight(600);
                        var graphic1 = new Graphic(point, symbol1, attributes);
                        var graphic2 = new Graphic(point, symbol2, attributes);
                        graphicsLayer.add(graphic1);
                        graphicsLayer.add(graphic2);
                    }
                }
            }

        }
        map.addLayer(graphicsLayer);

    });//--require end

}


//获取数据，更新舆情图层
function updateYuqingLayer() {
    var json = {industry: mapIndustry,industry1: mapIndustry1,industry2: mapIndustry2,industry3: mapIndustry3,startTime:$("#yearStart").val(),endTime:$("#yearEnd").val(),type:"3",code: cityCode,name:cityName};
    //更新地图的同时，更新右边表格数据
    getTableYq3(json);
    ajaxPost("/seimp/eliminate/getYqwx", json).done(function (data) {
        if (data.status == 0) {//请求成功
//			if(data.data.length>0){
            updateCityLayer(data.data);
//			}
        }
    });
}

//某一个市的点位图层
function updateCityLayer(data) {
    try {
        map.removeLayer(map.getLayer("cityGraphicLayer"));
    } catch (e) {

    }
    require([
        "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
        "esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol",
        "esri/graphic", "esri/symbols/TextSymbol", "esri/layers/GraphicsLayer",
        "esri/geometry/Point",
        "esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
    ], function (SimpleMarkerSymbol, SimpleLineSymbol,
                 PictureMarkerSymbol, CartographicLineSymbol,
                 Graphic, TextSymbol, GraphicsLayer,
                 Point,
                 Color, dom, on) {
        var graphicsLayer = new GraphicsLayer({id: "cityGraphicLayer"});
        if ( JSON.stringify(data) == "[]") return;
        for (var i = 0; i < data.length; i++) {
            var currItem = data[i];
            var attributes = {
                countyCode: currItem.code,
                countyName: currItem.name
            }
            var point = new Point(currItem.lon, currItem.lat);
            var symbolSize = 30;
            if (currItem.count.toString().length == 1) {
                symbolSize = 40;
            } else if (currItem.count.toString().length == 2) {
                symbolSize = 50;
            } else if (currItem.count.toString().length == 3) {
                symbolSize = 40;
            } else if (currItem.count.toString().length == 4) {
                symbolSize = 50;
            } else if (currItem.count.toString().length == 5) {
                symbolSize = 60;
            } else {
                symbolSize = currItem.count.toString().length * 12;
            }

            var symbol1 = new PictureMarkerSymbol("../../img/cluster/m0.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
            var symbol2 = new TextSymbol(currItem.count).setOffset(0, symbolSize / 2 - 5).setColor(new Color([255, 255, 255, 1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
            symbol2.font.setFamily("Times");
            symbol2.font.setSize("10pt");
            symbol2.font.setWeight(600);
            var graphic1 = new Graphic(point, symbol1, attributes);
            var graphic2 = new Graphic(point, symbol2, attributes);
            graphicsLayer.add(graphic1);
            graphicsLayer.add(graphic2);
        }

        map.addLayer(graphicsLayer);

        //添加点击事件
        graphicsLayer.on("click", function (evt) {
            //改变地图中心
            map.centerAt(evt.graphic.geometry);
            var attributes = evt.graphic.attributes;
            //获取舆情数据
            console.log(attributes)
            var json = {industry: yuqingType, code: attributes.countyCode,startTime:$("#yearStart").val(),name:attributes.countyName};
            ajaxPost("/seimp/eliminate/getYqwxMessage", json).done(function (result) {
                if (result.status == 0) {
                    var data = result.data;
                    if (data.length == 1) {
                        var html = '<p>标题:<code>' + data[0].TITLE + '</code></p>' +
                            '<p>时间:<code>' + data[0].PUBLISHTIME + '</code></p>' +
                            '<p>来源:<code>' + (data[0].SOURCE) + '</code></p>';
                            // "<hr/><p><a href='/seimp/index.html#yuqingDetails?nids=" + data[0]. + "&type=wIDangluo' target='_blank'>查看详情</a>";
                        map.infoWindow.resize("290", "300");
                        $(".close").css("left", "270px");
                        map.infoWindow.setTitle("舆情文献详细信息");
                        map.infoWindow.setContent(html);
                        map.infoWindow.show(evt.graphic.geometry);
                        $(".close").click(function () {
                            map.infoWindow.remove();
                        })
                    } else if (data.length > 1) {
                        newsArr = data;
                        pageIndex = 1;
                        if (newsArr.length % pagesize == 0) {
                            pageCount = newsArr.length / pagesize;
                        } else {
                            pageCount = parseInt(newsArr.length / pagesize) + 1;
                        }
                        var html = "<table class='table'>";
                        var count = pagesize;
                        if (newsArr.length < pagesize) {
                            count = newsArr.length;
                        }
                        for (var i = 0; i < count; i++) {
                            var content = newsArr[i].title;
                            if (newsArr[i].title.length > 15) {
                                content = newsArr[i].title.substring(0, 14) + "...";
                            }
                            html += "<tr><td class='tdstyle'>" + (i + 1) + "</td><td><a href='/seimp/index.html#yuqingDetails?nids=" + newsArr[i].newsid + "&type=wangluo' target='_blank' title='" + newsArr[i].title + "'>" + content + "</a></td></tr>";
                        }
                        html += "</table>";

                        html += createpagebutton(1);
                        map.infoWindow.resize("290", "395");
                        $(".close").css("left", "270px");
                        map.infoWindow.setTitle("舆情文献信息列表");
                        map.infoWindow.setContent(html);
                        map.infoWindow.show(evt.graphic.geometry);
                        $(".close").click(function () {
                            map.infoWindow.remove();
                        })
                    }
                }
            })
        })

    });
    // var json = {industry: yuqingType, code: attributes.countyCode,startTime:$("#datetimeStart").val(),name:attributes.NAME};
    // //更新地图的同时，更新右边表格数据
    // getTableYq3(json);
}

function updateClusterLayer(data) {
    if (clusterLayer != null) {
        map.removeLayer(clusterLayer);
    }
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
    ], function (parser, ready, arrayUtils, Color, domStyle, query,
                 Map, esriRequest, Graphic, Extent,
                 SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, ClassBreaksRenderer,
                 GraphicsLayer, SpatialReference, PopupTemplate, Point, webMercatorUtils,
                 ClusterLayer) {
        var newInfo = {};
        var wgs = new SpatialReference({
            "wkid": 4326
        });
        newInfo.data = [];
        for (var i = 0; i < data.length; i++) {
            var currItem = data[i];

            var attributes = {
                "nid": currItem.newsid,
//				"url":p.infoUrl,
//				"title":p.pollutionRemark,
//				"time":p.createTime,
//				"eventesType":p.eventsType
            }
//			if(currItem.pos.length>0){
//				for (var j = 0; j < currItem.length; j++) {
            var latlng = new Point(parseFloat(currItem.lon), parseFloat(currItem.lat));
            var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
            newInfo.data.push({
                "x": webMercator.x,
                "y": webMercator.y,
                "attributes": attributes
            });
//				}
//			}
        }

        /*newInfo.data=arrayUtils.map(data,function(p){
         var latlng = new  Point(parseFloat(p.REPORT_LONGITUDE), parseFloat(p.REPORT_LATITUDE));
         var webMercator = webMercatorUtils.geographicToWebMercator(latlng);
         var attributes = {
         "nid":p.REPORT_ID,
         //				"url":p.infoUrl,
         //				"title":p.pollutionRemark,
         //				"time":p.createTime,
         //				"eventesType":p.eventsType
         }
         return {
         "x":webMercator.x,
         "y":webMercator.y,
         "attributes":attributes
         }
         });*/


        clusterLayer = new ClusterLayer({
            "data": newInfo.data,
            "distance": 1,
            "id": "clusters",
            "labelColor": "#fff",
            "labelOffset": 10,
            "resolution": map.extent.getWidth() / map.width,
            "singleColor": "#888"
        });

        var defaultSym = new SimpleMarkerSymbol().setSize(4);
        var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");

        var picBaseUrl = "../../img/cluster/";
        var one = new PictureMarkerSymbol(picBaseUrl + "2.png", 32, 32).setOffset(0, 15);
        var blue = new PictureMarkerSymbol(picBaseUrl + "m0.png", 32, 32).setOffset(0, 15);
        var green = new PictureMarkerSymbol(picBaseUrl + "m1.png", 64, 64).setOffset(0, 15);
        var red = new PictureMarkerSymbol(picBaseUrl + "m2.png", 72, 72).setOffset(0, 15);
        renderer.addBreak(0, 1, one);
        renderer.addBreak(1, 20, blue);
        renderer.addBreak(20, 200, green);
        renderer.addBreak(200, 1001, red);

        clusterLayer.setRenderer(renderer);

        clusterLayer.on("graphic-node-add", function () {
            //加载动画结束
            zmblockUI('body', 'end');
        })

        map.addLayer(clusterLayer);

        clusterLayer.on("click", function (evt) {
            //改变地图中心
            map.centerAt(evt.graphic.geometry);
            var json = {IDs: evt.graphic.attributes.nids};
            ajaxPost("/seimp/warn/getNetworkNewsDetail.do", json).done(function (data) {
                if (data.status == 0) {//请求成功
                    data = data.data;
                    if (data.length == 1) {
                        var html = '<p>标题:<code>' + data[0].title + '</code></p>' +
                            '<p>来源:<code>' + (data[0].source != null ? data[0].source : '') + '</code></p>' +
                            '<p>内容:<code>' + data[0].summary + '</code></p>';
                        map.infoWindow.setTitle("网络舆情详细信息");
                        map.infoWindow.setContent(html);
                        map.infoWindow.resize("290", "300");
                        $(".close").css("left", "270px");
                        map.infoWindow.show(evt.graphic.geometry);
                        $(".close").click(function () {
                            map.infoWindow.remove();
                        })
                    } else if (data.length > 1) {
                        newsArr = data;
                        pageIndex = 1;
                        if (newsArr.length % pagesize == 0) {
                            pageCount = newsArr.length / pagesize;
                        } else {
                            pageCount = parseInt(newsArr.length / pagesize) + 1;
                        }
                        var html = "<table class='table'>";
                        var count = pagesize;
                        if (newsArr.length < pagesize) {
                            count = newsArr.length;
                        }
                        for (var i = 0; i < count; i++) {
                            var content = newsArr[i].title;
                            if (newsArr[i].title.length > 15) {
                                content = newsArr[i].title.substring(0, 14) + "...";
                            }
                            html += "<tr><td class='tdstyle'>" + (i + 1) + "</td><td><a href='/seimp/index.html#yuqingDetails?nids=" + newsArr[i].newsid + "&type=wangluo' target='_blank' title='" + newsArr[i].title + "'>" + content + "</a></td></tr>";
                        }
                        html += "</table>";
                        /*html += "<a onclick=pageclick('up')>上一页</a><a onclick=pageclick('down')>下一页</a>";
                         if(newsArr.length>pagesize){
                         html += "<a onclick=pageclick('down')>下一页</a>";//"<a onclick=javascript:(0) >上一页</a><a onclick=pageclick('down')>下一页</a>";
                         }else{
                         html += "<a onclick=javascript:(0) >上一页</a><a onclick=javascript:(0)>下一页</a>";
                         }*/
                        html += createpagebutton(1);
                        map.infoWindow.resize("290", "395");
                        $(".close").css("left", "270px");
                        map.infoWindow.setTitle("网络舆情信息列表");
                        map.infoWindow.setContent(html);
                        map.infoWindow.show(evt.graphic.geometry);
                        $(".close").click(function () {
                            map.infoWindow.remove();
                        })
                    }
                }
            });


        });

    })
}

/*******列表分页*****************/
function pageclick(currentPage) {

    var start = pagesize * (currentPage - 1);
    var end = pagesize * currentPage;
    if (end > newsArr.length) {
        end = newsArr.length;
    }
    var html = "<table class='table'>";
    var j = 1;
    for (var i = start; i < end; i++) {
        var content = newsArr[i].title;
        if (newsArr[i].title.length > 15) {
            content = newsArr[i].title.substring(0, 14) + "...";
        }
        html += "<tr><td class='tdstyle'>" + (i + 1) + "</td><td><a href='/seimp/index.html#yuqingDetails?nids=" + newsArr[i].newsid + "&type=wangluo' target='_blank' title='" + newsArr[i].title + "'>" + content + "</a></td></tr>";
        j++;
    }
    html += "</table>";
    /*if(pageIndex!=0){
     html += "<a onclick=pageclick('up') >上一页</a>";
     }
     if(pageIndex<newsArr.length/pagesize){
     html += "<a onclick=pageclick('down') >下一页</a>";
     }*/
    html += createpagebutton(currentPage);
    map.infoWindow.setContent(html);
}

function createpagebutton(currentPage) {
    var html = "<div class='boxButton'>";
    if (pageCount <= 7) {
        for (var i = 1; i <= pageCount; i++) {
            if (currentPage == i) {
                html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>" + i + "</button>";
            } else {
                html += "<button class='btn btn-default' style='padding: 3px 6px;' onclick=pageclick(" + i + ")>" + i + "</button>";
            }

        }
        return html;
    } else {
        if (currentPage == 1) {
            html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>" + 1 + "</button>";
        } else {
            html += "<button class='btn btn-default'  style='padding: 3px 6px;' onclick=pageclick(" + 1 + ")>" + 1 + "</button>";
        }
        if (currentPage >= 3) {
            html += "<button class='btn btn-default' style='padding: 3px 6px;'>...</button>";
        }
        var start = currentPage - 1;
        var end = currentPage + 1;
        if (start <= 2) {
            start = 2;
            end = 4;
        }
        if (end >= pageCount - 1) {
            end = pageCount - 1;
            start = pageCount - 4;
        }
        for (var i = start; i <= end; i++) {
            if (currentPage == i) {
                html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>" + i + "</button>";
            } else {
                html += "<button class='btn btn-default' style='padding: 3px 6px;' onclick=pageclick(" + i + ")>" + i + "</button>";
            }
        }
        if (currentPage <= pageCount - 3) {
            html += "<button class='btn btn-default' style='padding: 3px 6px;'>...</button>";
        }
        if (currentPage == pageCount) {
            html += "<button class='activebtn btn btn-default' style='padding: 3px 6px;'>" + pageCount + "</button>";
        } else {
            html += "<button class='btn btn-default' style='padding: 3px 6px;' onclick=pageclick(" + pageCount + ")>" + pageCount + "</button>";
        }
        html += "</div>"
        return html;
    }

}
/**************页面加载****************/
$(function () {
    /**********右上角按钮****/
    $("#country").click(function () {
        //点击全国按钮的时候，隐藏省、市
        $("#province").addClass("none");
        $("#city").addClass("none");
        updateCountry(true);
    })

    $("#province").click(function () {
        //点击省份按钮的时候，隐藏市
        $("#city").addClass("none");
        updateProvince(false);
    })

    $("#city").click(function () {
        updateCity(false);
    })
})

/****行业筛选*******/
//生成地图下方的行业筛选列表
function createInsutryClick() {
    //重新更新下方的企业类别选择条
    var html = "<a class='lt metal' onclick=switchIndustry('',$(this))>全部</a>";
    if (industryArr.length > 0) {
        for (var i = 0; i < industryArr.length; i++) {
            var currObj = industryArr[i];
            html += "<a class='lt' value='" + currObj.id + "' onclick=switchIndustry('" + currObj.id + "',$(this))>" + currObj.name + "</a>";
        }
    }
    $("#mapItem").html(html);
}

//舆情行业选择
function switchIndustry(switchIndustry, obj) {
    yuqingType = switchIndustry;
    mapIndustry = switchIndustry;
    $(obj).siblings().removeClass("metal");
    $(obj).addClass("metal");
    //更新舆情
    if (mapType == "1") {//全国模式
        updateCountry(true);
    } else if (mapType == "2") {//某一个省的所有市模式
        updateProvince(true);
    } else if (mapType == "3") {//某一个市的所有点位模式
        updateCity(true);
    }
}
function switchIndustry1(switchIndustry, obj) {
    mapIndustry1 = switchIndustry;
    $(obj).siblings().removeClass("metal");
    $(obj).addClass("metal");
    //更新舆情
    if (mapType == "1") {//全国模式
        updateCountry(true);
    } else if (mapType == "2") {//某一个省的所有市模式
        updateProvince(true);
    } else if (mapType == "3") {//某一个市的所有点位模式
        updateCity(true);
    }
}
function switchIndustry2(switchIndustry, obj) {
    mapIndustry2 = switchIndustry;
    $(obj).siblings().removeClass("metal");
    $(obj).addClass("metal");
    //更新舆情
    if (mapType == "1") {//全国模式
        updateCountry(true);
    } else if (mapType == "2") {//某一个省的所有市模式
        updateProvince(true);
    } else if (mapType == "3") {//某一个市的所有点位模式
        updateCity(true);
    }
}
function switchIndustry3(switchIndustry, obj) {
    mapIndustry3 = switchIndustry;
    $(obj).siblings().removeClass("metal");
    $(obj).addClass("metal");
    //更新舆情
    if (mapType == "1") {//全国模式
        updateCountry(true);
    } else if (mapType == "2") {//某一个省的所有市模式
        updateProvince(true);
    } else if (mapType == "3") {//某一个市的所有点位模式
        updateCity(true);
    }
}

/**********地图相关方法**************/
//生成图例
function updateLegend(minCount, count) {
    $("#ditu li:eq(0) div:eq(1)").html(minCount + "-" + parseInt(minCount + count * 1));
    $("#ditu li:eq(1) div:eq(1)").html(parseInt(minCount + count * 1) + "-" + parseInt(minCount + count * 2));
    $("#ditu li:eq(2) div:eq(1)").html(parseInt(minCount + count * 2) + "-" + parseInt(minCount + count * 3));
    $("#ditu li:eq(3) div:eq(1)").html(parseInt(minCount + count * 3) + "-" + parseInt(minCount + count * 4));
    $("#ditu li:eq(4) div:eq(1)").html(parseInt(minCount + count * 4) + "-" + parseInt(minCount + count * 5));
    $("#ditu li:eq(5) div:eq(1)").html(parseInt(minCount + count * 5) + "-" + parseInt(minCount + count * 6));
}

//清除type属性值为value的graphic
function removeGraphic(value) {
    var graphics = map.graphics.graphics;
    for (var i = 0; i < graphics.length; i++) {
        if (graphics[i].attributes && graphics[i].attributes.type && graphics[i].attributes.type == value) {
            map.graphics.remove(graphics[i]);
        }
    }
}

/*****悬浮窗**************/
$(function () {

    $(".floattool .icon").mouseover(function (evt) {
        $(".float-tool-title").show();
        //alert($(this).index());
        var classval = $(this).parent().attr("class");
        if (classval == "layer_nav") {
            $(".float-tool-title .title").html("地图");
            $(".float-tool-title").css("top", "290px");
        } else if (classval == "table_nav") {
            $(".float-tool-title .title").html("统计表");
            $(".float-tool-title").css("top", "328px");
        } else if (classval == "graphic_nav") {
            $(".float-tool-title .title").html("统计图");
            $(".float-tool-title").css("top", "365px");
        } else if (classval == "time_nav") {
            $(".float-tool-title .title").html("时间轴");
            $(".float-tool-title").css("top", "405px");
        }
    })
    $(".floattool .icon").mouseout(function () {
        $(".float-tool-title").hide();
    })
    $(".floattool .icon").click(function (evt) {
        var classval = $(this).parent().attr("class");
        if (classval == "layer_nav") {
            if ($(this).parent().find("div.common-panel").is(":visible")) {
                $(this).parent().find("div.common-panel").hide();
            } else {
                $(this).parent().find("div.common-panel").show();
            }
        } else if (classval == "table_nav") {
            if ($("#tongjituDiv").is(":visible")) {
                $("#tongjituDiv").hide();
            } else {
                if (isHaveData.tongjibiao == 1) {
                    if (isSelect == 1) {
                        $("#tongjituDiv").show();
                    } else {
                        showTiShi("请选择数据");
                    }
                } else {
                    showTiShi("没有数据");
                }
            }
        } else if (classval == "graphic_nav") {
            if ($(".main_graphic").is(":visible")) {
                $(".main_graphic").hide();
            } else {
                if (isHaveData.tongjitu == 1) {
                    if (isSelect == 1) {
                        $(".main_graphic").show();
                    } else {
                        showTiShi("请选择数据");
                    }
                } else {
                    showTiShi("没有数据");
                }

                //加载统计图
                //initEcarts();
            }
        } else if (classval == "time_nav") {
            if ($(".time-axis-box").is(":visible")) {
                $(".time-axis-box").hide();
            } else {
                if (isHaveData.shijianzhou == 1) {
                    if (isSelect == 1) {
                        $(".time-axis-box").show();
                    } else {
                        showTiShi("请选择数据");
                    }
                } else {
                    showTiShi("没有数据");
                }
            }
        }
    })


//时间轴
// var chart_bar = echarts.init(document.getElementById('timeLine'))
// chart_bar.setOption(
//         {
//         //timeline基本配置都写在baseoption 中
//     baseOption: {
//         timeline: {
//             //loop: false,
//             axisType: 'category',
//             show: true,
//             autoPlay: true,
//             playInterval: 1500,
//             label: {
//             	normal:{
//             		color:'#5cb85c',
//             	},
//             },
//            lineStyle:{
//         	   color:'#5cb85c',
//            },
//             controlStyle:{
//             	normal:{
//             		color:'#5cb85c',
//             		borderColor:"#5cb85c",
//
//             	},
//             	position:"right"
//             },
//             data: ['1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998','1999','2000','2001','2002', '2003','2004','2005','2006']
//         },
//         //grid: {containLabel: true},
//
//         },
//
//
//
//     }
// );
    //关闭悬浮窗
    $(".layer_nav .common-panel>a").click(function () {
        $(this).parent().hide();
    })
    //切换地图底图
    $(".layer-items a").click(function () {
        var mapName = $.trim($(this).text());
        //设置选中状态
        if (mapName == "影像" || mapName == "地图") {
            $(this).siblings(":eq(2),:eq(3)").removeClass("active");
            $(this).addClass("active");
        } else {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
            } else {
                $(this).addClass("active");
            }
        }

        if (mapName == "影像") {
            if (map.getLayer("vectorLayer")) {
                map.removeLayer(map.getLayer("vectorLayer"));
                map.removeLayer(map.getLayer("vectorNoteLayer"));

                //判断中文注记的状态
                if ($(this).siblings(":eq(1)").hasClass("active")) {
                    imageMap(map, true);
                } else {
                    imageMap(map, false);
                }
            }
        } else if (mapName == "地图") {
            if (map.getLayer("imageLayer")) {
                map.removeLayer(map.getLayer("imageLayer"));
                map.removeLayer(map.getLayer("imageNoteLayer"));

                //判断中文注记的状态
                if ($(this).siblings(":eq(1)").hasClass("active")) {
                    vectorMap(map, true);
                } else {
                    vectorMap(map, false);
                }
            }
        } else if (mapName == "公里格网") {
            if (map.getLayer("gewangLayer")) {
                map.removeLayer(map.getLayer("gewangLayer"));
            } else {
                addGewang();
            }
        } else if (mapName == "中文注记") {
            //判断是矢量地图还是影像地图
            //判断矢量地图是否存在
            if (map.getLayer("vectorLayer")) {
                //矢量地图
                //判断中文注记的状态
                if (map.getLayer("vectorNoteLayer").visible) {
                    map.getLayer("vectorNoteLayer").setVisibility(false);
                } else {
                    map.getLayer("vectorNoteLayer").setVisibility(true);
                }
            } else {
                //影像地图
                if (map.getLayer("imageNoteLayer").visible) {
                    map.getLayer("imageNoteLayer").setVisibility(false);
                } else {
                    map.getLayer("imageNoteLayer").setVisibility(true);
                }
            }
        } else if (mapName == "道路") {
            if (map.getLayer("gaosuLayer")) {
                map.removeLayer(map.getLayer("gaosuLayer"));
                map.removeLayer(map.getLayer("shengdaoLayer"));
            } else {
                addRoad();
            }
        } else if (mapName == "加油站点") {
            if (map.getLayer("gasLayer")) {
                map.removeLayer(map.getLayer("gasLayer"));
            } else {
                addGas();
            }
        } else if (mapName == "河流") {
            if (map.getLayer("riverLayer")) {
                map.removeLayer(map.getLayer("riverLayer"));
            } else {
                addRiver();
            }
        }
    })
    //关闭统计表
    $("#tongjituDiv  div.tabtop_rt").click(function () {
        $("#tongjituDiv").hide();
    })

    //关闭弹出的污染物表格
    $("#detailTable  div.tabtop_rt").click(function () {
        $("#detailTable").hide();
    })

    //关闭统计图
    $(".main_graphic div.tabtop_rt").click(function () {
        $(".main_graphic").hide();
    })
})//--load end

/*******右边悬浮窗方法****/
//两秒钟后清除提示
function qingChuTiShi() {
    setTimeout(function () {
        $(".noDataTips").hide();
    }, "2000")
}

//显示提示
function showTiShi(info) {
    $(".noDataTips .tabtop_left").text(info);
    $(".noDataTips").show();
    qingChuTiShi();
}

$(document).ready(function () {
    var $div = $(".main_tabletop");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown", function (event) {
        /* 获取需要拖动节点的坐标 */
        var offset_x = $(this)[0].offsetLeft;//x坐标
        var offset_y = $(this)[0].offsetTop;//y坐标
        /* 获取当前鼠标的坐标 */
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;
        /* 绑定拖动事件 */
        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
        $(document).bind("mousemove", function (ev) {
            /* 计算鼠标移动了的位置 */
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;
            /* 设置移动后的元素坐标 */
            var now_x = (offset_x + _x ) + "px";
            var now_y = (offset_y + _y ) + "px";
            /* 改变目标元素的位置 */
            $div.css({
                top: now_y,
                left: now_x
            });
            $('#tongjituDiv').css({
                top: now_y,
                left: now_x
            });
        });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
        var top = $div.css('top').split('px')
        var left = $div.css('left').split('px')
        if(top[0] < 0){
            $div.css('top','5%')
            $('#tongjituDiv').css('top','5%')
        }
        if(left[0] < 0){
            $div.css('left','10px')
            $('#tongjituDiv').css('left','10px')
        }
        $(this).unbind("mousemove");
        $(this).unbind("mousemove");
    });


    var $div1 = $("div.main_graphic");
    /* 绑定鼠标左键按住事件 */
    $div1.bind("mousedown", function (event) {
        /* 获取需要拖动节点的坐标 */
        var offset_x = $(this)[0].offsetLeft;//x坐标
        var offset_y = $(this)[0].offsetTop;//y坐标
        /* 获取当前鼠标的坐标 */
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;
        /* 绑定拖动事件 */
        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
        $(document).bind("mousemove", function (ev) {
            /* 计算鼠标移动了的位置 */
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;
            /* 设置移动后的元素坐标 */
            var now_x = (offset_x + _x ) + "px";
            var now_y = (offset_y + _y ) + "px";
            /* 改变目标元素的位置 */
            $div1.css({
                top: now_y,
                left: now_x
            });
        });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
        $(this).unbind("mousemove");
    });

    var $div2 = $("div#geWangTable");
    /* 绑定鼠标左键按住事件 */
    $div2.bind("mousedown", function (event) {
        /* 获取需要拖动节点的坐标 */
        var offset_x = $(this)[0].offsetLeft;//x坐标
        var offset_y = $(this)[0].offsetTop;//y坐标
        /* 获取当前鼠标的坐标 */
        var mouse_x = event.pageX;
        var mouse_y = event.pageY;
        /* 绑定拖动事件 */
        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
        $(document).bind("mousemove", function (ev) {
            /* 计算鼠标移动了的位置 */
            var _x = ev.pageX - mouse_x;
            var _y = ev.pageY - mouse_y;
            /* 设置移动后的元素坐标 */
            var now_x = (offset_x + _x + 350) + "px";
            var now_y = (offset_y + _y + 200) + "px";
            /* 改变目标元素的位置 */
            $div2.css({
                top: now_y,
                left: now_x
            });
        });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
        $(this).unbind("mousemove");
    });
})

/*********************2018/01/29 更新**********************/
/**
 * 添加右边表格更新,全国模式
 */
function getTableYq1(json){
    var url = "/seimp/eliminate/getYqwxtable";
    ajaxPost(url, json).done(function (result) {
        if (result.status == 0) {//请求成功
            if (result.data) {
                var data = result.data;
                data1 = data;
                updateRightTable(data);
            }
        }
    })//--ajaxPost end
}
/**
 * 添加右边表格更新,省内市
 */
function getTableYq2(json){
    var url = "/seimp/eliminate/getYqwxtable";
    ajaxPost(url, json).done(function (result) {
        if (result.status == 0) {//请求成功
            if (result.data) {
                var data = result.data;
                data2 = data;
                updateRightTable(data);
            }
        }
    })//--ajaxPost end
}
/**
 * 添加右边表格更新,市内点位
 */
function getTableYq3(json){
    var url = "/seimp/eliminate/getYqwxtable";
    ajaxPost(url, json).done(function (result) {
        if (result.status == 0) {//请求成功
            if (result.data) {
                var data = result.data;
                data3 = data;
                updateRightTable(data);
            }
        }
    })//--ajaxPost end
}

/**
 * 更新表格数据
 */
function updateRightTable(data){
    $("#tongjituDiv tabtop_left").html("舆情文献列表");
    //遍历数据
    var headHtml = "<td>序号</td><td>省</td><td>市</td><td>县</td><td>乡</td>" +
        "<td>涉及企业</td><td>无机重金属</td><td>污染程度</td><td>有机类项目</td><td>污染程度</td><td>污染面积<br>（km²）</td><td>采样时间</td>";
    var bodyHtml = "";
    $.each(data,function(i,item){
        var PROVINCE = "",CITY = "",XIAN = "",COUNTY = "",INVOLVEENTERPRICE = "",WJJS = "",WJWRCD="",WJWRCD = "",POLLUTEDAREA="",SAMPLETIME="",YJXM="",YJWRCD="";
        if(item.PROVINCE != "" && item.PROVINCE != null && item.PROVINCE != undefined )PROVINCE = item.PROVINCE;
        if(item.CITY != "" && item.CITY != null && item.CITY != undefined ) CITY = item.CITY;
        if(item.XIAN != "" && item.XIAN != null && item.XIAN != undefined ) XIAN = item.XIAN;
        if(item.COUNTY != "" && item.COUNTY != null && item.COUNTY != undefined ){
            COUNTY = item.COUNTY;
            if ( COUNTY.length>5){
                COUNTY = COUNTY.substr(0,4)+"<br>"+COUNTY.substr(4,COUNTY.length);
            }
        }
        if(item.INVOLVEENTERPRICE != "" && item.INVOLVEENTERPRICE != null && item.INVOLVEENTERPRICE != undefined ){
            INVOLVEENTERPRICE = item.INVOLVEENTERPRICE;
            if ( INVOLVEENTERPRICE.length>5){
                INVOLVEENTERPRICE = INVOLVEENTERPRICE.substr(0,4)+"<br>"+INVOLVEENTERPRICE.substr(4,INVOLVEENTERPRICE.length);
            }
        }
        if(item.WJJS != "" && item.WJJS != null && item.WJJS != undefined )WJJS = item.WJJS;
        if(item.WJWRCD != "" && item.WJWRCD != null && item.WJWRCD != undefined )WJWRCD = item.WJWRCD;
        if(item.YJXM !="" && item.YJXM != null && item.YJXM!=undefined ) YJXM = item.YJXM;
        if(item.YJWRCD!="" && item.YJWRCD != null && item.YJWRCD != undefined ) YJWRCD = item.YJWRCD;
        if(item.POLLUTEDAREA != "" && item.POLLUTEDAREA != null && item.POLLUTEDAREA != undefined )POLLUTEDAREA = item.POLLUTEDAREA;
        if(item.SAMPLETIME != "" && item.SAMPLETIME != null && item.SAMPLETIME != undefined )SAMPLETIME = item.SAMPLETIME;

        bodyHtml += '<tr><td>'+(i+1)+'</td><td>'+PROVINCE+'</td><td>'+CITY+'</td><td>'+XIAN+'</td><td>'+COUNTY+'</td>' +
            '<td>'+INVOLVEENTERPRICE+'</td><td>'+WJJS+'</td><td>'+WJWRCD+'</td><td>'+YJXM+'</td><td>'+YJWRCD+'</td><td>'+POLLUTEDAREA+'</td><td>'+SAMPLETIME+'</td></tr>'
    })

    $("#tongjibiao thead tr").html(headHtml);
    $("#tongjibiao tbody").html(bodyHtml);
}
