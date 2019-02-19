var yuqingAll;
var cityAll;
var all12369;

//12369所有数据
ajaxPost('/seimp/warn/all12369', "").done(function (result) {
    if( result.status == "0" ) {
        all12369 = result.data;
    }
})
//所有城市数据
ajaxPost('/seimp/warn/allCity', "").done(function (result) {
    if( result.status == "0" ) {
        cityAll = result.data;
    }
})
//舆情所有数据
ajaxPost('/seimp/warn/allYq', "").done(function (result) {
    if( result.status == "0" ) {
        yuqingAll = result.data;
        echartsData();
    }
})

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
$("#yearEnd").val(now.Format("yyyy"));
$("#yearStart").val(now.Format("yyyy")-3);


// 月
$("#jiStart").datetimepicker({
    format: 'yyyy-mm',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startView: 3,
    minView: 3,

}).on("click", function () {
    $("#datetimeStart").datetimepicker("setEndDate", $("#jiEnd").val());
});
$("#jiEnd").datetimepicker({
    format: 'yyyy-mm',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
    startView: 3,
    minView: 3,

}).on("click", function () {
    $("#datetimeStart").datetimepicker("setEndDate", $("#jiStart").val());
});
$("#jiStart").val(new Date(now.getFullYear(),now.getMonth()-1,now.getDate()).Format("yyyy-MM"));
$("#jiEnd").val(now.Format("yyyy-MM"));

// 按天
$("#datetimeStart").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
}).on("click", function () {
    $("#datetimeStart").datetimepicker("setEndDate", $("#datetimeEnd").val());
});
$("#datetimeEnd").datetimepicker({
    format: 'yyyy-mm-dd',
    minView: 'month',
    language: 'zh-CN',
    autoclose: true,
}).on("click", function () {
    $("#datetimeEnd").datetimepicker("setStartDate", $("#datetimeStart").val());
});
// var today = new Date();
$("#datetimeStart").val(new Date(now.getFullYear()-1,now.getMonth(),now.getDate()).Format("yyyy-MM-dd"));
$("#datetimeEnd").val(now.Format("yyyy-MM-dd"));

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
//			center:[108,34],
//			zoom:3,
            showLabels: true,
            infoWindow: infoWindow,
            extent: extent
        })

        //设置弹出框样式
        var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
//        map.setInfoWindow(infoWindow);

        //加载天地图：全球矢量地图服务、全球矢量中文注记服务
        vectorMap(map);

        //更新舆情
//		updateCountry(true);
        initLayerByUser();
//		updateYuqingLayer();


    });//--require end

    //生成类型
    var json = {};
    ajaxPost("/seimp/warn/getNetworkNewsTypes.do", json).done(function (result) {
        if (result.status == 0) {//请求成功
            if (result.data.length > 0) {
                var data = result.data;
                for (var i = 0; i < data.length; i++) {
                    var currItem = data[i];
                    industryArr.push({id: currItem, name: currItem})
                }
                industryArr.push({id: "其它", name: "其它"});
            }
            createInsutryClick();
        }
    });
    //按天 按年 按季按钮
    $("#xz_type input").click(function(){
        if ( $(this).context.id == "d_day") {
            $("#xz_day").show();
            $("#xz_year").hide();
            $("#xz_ji").hide();
        } else if ($(this).context.id == "d_year") {
            $("#xz_day").hide();
            $("#xz_year").show();
            $("#xz_ji").hide();
        } else if ($(this).context.id == "d_ji") {
            $("#xz_day").hide();
            $("#xz_year").hide();
            $("#xz_ji").show();
        }
        $("#d_bf").show();
        $("#d_zt").hide();
        currentIdx = 0;
        gotoDate();
        echartsData();
    })
    // 播放暂停
    $("#xz_bf button").click(function(){
        if ( $(this).context.id == "d_bf") {
            $("#d_zt").show();
            $("#d_bf").hide();
            bf = 1;
            test(1);
        } else if ($(this).context.id == "d_zt") {
            $("#d_bf").show();
            $("#d_zt").hide();
            test(0);
            bf = 0;
        }
    })


})//--load end

var bf = 0;
/*改变时间范围重新加载地图*/
function gotoDate() {
    console.log(mapType)
    if(mapType==1){
        updateCountry(true);
    }else if(mapType==2){
        updateProvince(true);
    }else if(mapType==3){
        updateCity(true);
    }
    echartsData();
    $("#d_bf").show();
    $("#d_zt").hide();
    currentIdx = 0;
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
        $("#d_bf").show();
        $("#d_zt").hide();
        currentIdx = 0;
        echartsData()
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
        $("#d_bf").show();
        $("#d_zt").hide();
        currentIdx = 0;
        echartsData()
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
    updateRightTable(data3);
}
var zs_year =0;
var yue = 0;
var yuejia = 0;
//加载全国图层
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
            console.log(provinceCode)
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
        var url = "";
        var v_type ;
        if($('input:radio[name="radio"]:checked').val() == "yuqing") {
            url="getYq1.do";
            v_type = mapIndustry;
        } else {
            url ="getJbyj1.do";
            v_type = type12369;
        }
        if ($("#xz_day").css('display') =="block"){//日
            json = {industry: v_type,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val()};
        } else if($("#xz_year").css('display') =="block"){//年
            json = {industry: v_type,startTime:$("#yearStart").val()+"-01-01",endTime:$("#yearEnd").val()+"-12-31"};
        } else if ($("#xz_ji").css('display') =="block"){//月
            json = {industry: v_type,startTime:$("#jiStart").val()+"-01",endTime:$("#jiEnd").val()+"-30"};
        }
        ajaxPost('/seimp/warn/'+url, json).done(function (result) {
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
    } catch (e) {}
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
    var json ;
    var v_type ;
    if($('input:radio[name="radio"]:checked').val() == "yuqing")  v_type = mapIndustry;
    else v_type = type12369;
    if ($("#xz_day").css('display') =="block"){//日
        json = {industry: v_type,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val()};
    } else if($("#xz_year").css('display') =="block"){//年
        json = {industry: v_type,startTime:$("#yearStart").val()+"-01-01",endTime:$("#yearEnd").val()+"-12-31"};
    } else if ($("#xz_ji").css('display') =="block"){//月
        json = {industry: v_type,startTime:$("#jiStart").val()+"-01",endTime:$("#jiEnd").val()+"-30"};
    }
    //更新地图的同时，更新右边表格数据
    getTableYq1(json);
}

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
        var url = "";
        var v_type ;
        if($('input:radio[name="radio"]:checked').val() == "yuqing") {
            url="getYq2.do";
            v_type = mapIndustry;
        } else {
            url ="getJbyj2.do";
            v_type = type12369;
        }
        if ($("#xz_day").css('display') =="block"){//日
            json = {industry: v_type,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),code: provinceCode};
        } else if($("#xz_year").css('display') =="block"){//年
            json = {industry: v_type,startTime:$("#yearStart").val()+"-01-01",endTime:$("#yearEnd").val()+"-12-31",code: provinceCode};
        } else if ($("#xz_ji").css('display') =="block"){//月
            json = {industry: v_type,startTime:$("#jiStart").val()+"-01",endTime:$("#jiEnd").val()+"-30",code: provinceCode};
        }
        console.log(json)
        //更新地图的同时，更新右边表格数据

        ajaxPost('/seimp/warn/'+url, json).done(function (result) {
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
    var json ;
    var v_type ;
    if($('input:radio[name="radio"]:checked').val() == "yuqing")  v_type = mapIndustry;
    else v_type = type12369;
    if ($("#xz_day").css('display') =="block"){//日
        json = {industry: v_type,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),code: provinceCode};
    } else if($("#xz_year").css('display') =="block"){//年
        json = {industry: v_type,startTime:$("#yearStart").val()+"-01-01",endTime:$("#yearEnd").val()+"-12-31",code: provinceCode};
    } else if ($("#xz_ji").css('display') =="block"){//月
        json = {industry: v_type,startTime:$("#jiStart").val()+"-01",endTime:$("#jiEnd").val()+"-30",code: provinceCode};
    }
    console.log(json)
    //更新地图的同时，更新右边表格数据
    getTableYq2(json);
}


//获取数据，更新舆情图层
function updateYuqingLayer() {
    /*var json = {industry:yuqingType,code:cityCode};
     ajaxPost("/seimp/warn/getYq3.do", json).done(function(data){
     if(data.status==0){//请求成功
     //			if(data.data.length>0){
     updateClusterLayer(data.data);
     //			}
     }
     });*/
    var url = "";
    var v_type ;
    if($('input:radio[name="radio"]:checked').val() == "yuqing") {
        url="staNetwork1.do";
        v_type = mapIndustry;
    } else {
        url ="staYQ123691FO1.do";
        v_type = type12369;
    }
    var json = {industry: v_type, code: cityCode,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val()};
    //更新地图的同时，更新右边表格数据
    // getTableYq3(json);
    ajaxPost("/seimp/warn/"+url, json).done(function (data) {
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
            var json = {industry: yuqingType, code: attributes.countyCode,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val()};
            ajaxPost("/seimp/warn/staNetwork2.do", json).done(function (result) {
                if (result.status == 0) {
                    var data = result.data;
                    if (data.length == 1) {
                        var html = '<p>标题:<code>' + data[0].title + '</code></p>' +
                            '<p>时间:<code>' + data[0].time.substr(0, 10) + '</code></p>' +
                            '<p>来源:<code>' + (data[0].source != null ? data[0].source : '') + '</code></p>' +
                            '<p>摘要:<code>' + data[0].summary.substr(0, 100) + "..." + '</code></p>' +
                            "<hr/><p><a href='/seimp/index.html#yuqingDetails?nids=" + data[0].newsid + "&type=wangluo' target='_blank'>查看详情</a>";
                        map.infoWindow.resize("290", "300");
                        $(".close").css("left", "270px");
                        map.infoWindow.setTitle("网络舆情详细信息");
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
            })
        })

    });
    var v_type ;
    if($('input:radio[name="radio"]:checked').val() == "yuqing")  v_type = mapIndustry;
    else v_type = type12369;
    var json = {industry: v_type, code: cityCode,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val()};
    //更新地图的同时，更新右边表格数据
    getTableYq3(json);
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
        $("#d_bf").show();
        $("#d_zt").hide();
        currentIdx = 0;
        echartsData()
        updateCountry(true);
    })

    $("#province").click(function () {
        //点击省份按钮的时候，隐藏市
        $("#city").addClass("none");
        $("#d_bf").show();
        $("#d_zt").hide();
        currentIdx = 0;
        echartsData()
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
            if (i == industryArr.length - 1) {
                html += "<a class='lt' value='' >网络举报</a>";
            }
            html += "<a class='lt' value='" + currObj.id + "' onclick=switchIndustry('" + currObj.id + "',$(this))>" + currObj.name + "</a>";
        }
    }
//	html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
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
    echartsData();

}
//12369行业选择
var type12369 = "";
function switchIndustry12369(switchIndustry, obj) {
    type12369 = switchIndustry;
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
    echartsData();
}
//点击舆情分类
$('input:radio[name="radio"]').change(function(){
    if($(this).val() == "yuqing"){
        $("#map12369").hide();
        $("#mapItem").show();
        echartsData()
    } else {
        $("#map12369").show();
        $("#mapItem").hide();
        echartsData()
    }
    //更新舆情
    if (mapType == "1") {//全国模式
        updateCountry(true);
    } else if (mapType == "2") {//某一个省的所有市模式
        updateProvince(true);
    } else if (mapType == "3") {//某一个市的所有点位模式
        updateCity(true);
    }
});

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
	var $div = $(".data_table");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown", function (event) {
    	if($('.large').attr('data') == 1){
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
    	 }else{
 			return;
 		}
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
    	var top = $div.css('top').split('px')
    	var left = $div.css('left').split('px')
    	if(top[0] < 0){
    		$div.css('top','0')
    		$('#tongjituDiv').css('top','5%')
    	}
    	if(left[0] < 0){
    		$div.css('left','0')
    		$('#tongjituDiv').css('left','10px')
    	}
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
    var url = "/seimp/warn/getTabkeYq1.do";
    if($('input:radio[name="radio"]:checked').val() == "yuqing") {
        url = "/seimp/warn/getTabkeYq1.do";
    } else {
        url = "/seimp/warn/getJbyj1.do";
    }
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
    var url = "/seimp/warn/getTableYq2.do";
    if($('input:radio[name="radio"]:checked').val() == "yuqing") {
        url = "/seimp/warn/getTableYq2.do";
    } else {
        url = "/seimp/warn/getJbyj2.do";
    }
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
    var url = "/seimp/warn/getTabkeYq3.do";
    if($('input:radio[name="radio"]:checked').val() == "yuqing") {
        url = "/seimp/warn/getTableYq3.do";
    } else {
        url = "/seimp/warn/staYQ123691FO1.do";
    }
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

    if($('input:radio[name="radio"]:checked').val() == "yuqing") {
        $("#tongjituDiv tabtop_left").html("网络舆情列表");
        //遍历数据
        var headHtml = "<td width='10%'>序号</td><td width='30%'>标题</td><td width='15%'>来源</td><td width='30%'>时间</td><td width='15%'>链接</td>";
        var bodyHtml = "";
        if(data && data.length>0){
            for (var i = 0; i < data.length; i++) {
                var currItem = data[i];
                currItem.title = currItem.title==null?"":currItem.title;
                currItem.source = currItem.source==null?"":currItem.source;
                currItem.time = currItem.time==null?"":currItem.time;
                bodyHtml += "<tr><td width='10%'>"+(i+1)+"</td>" +
                    "<td width='30%' style='white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'><a title="+currItem.title+" style='color:black;'>"+currItem.title+"</a></td>" +

                    "<td width='15%' style='white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'><a title="+currItem.source+" style='color:black;'>"+currItem.source+"</a></td>" +
                    "<td width='30%'>"+currItem.time+"</td>" +
                    "<td width='15%'><a href='/seimp/index.html#yuqingDetails?nids=" + currItem.newsid + "&type=wangluo' target='_blank' >查看详情</a></td></tr>";
            }
        }
        $("#tongjibiao thead tr").html(headHtml);
        $("#tongjibiao tbody").html(bodyHtml);

    } else{
        $("#tongjituDiv tabtop_left").html("12369举报分析列表");
        //遍历数据
        var headHtml = "<td>序号</td><td>地区</td><td>预报预警信息数量(条)</td><td width='15%'>操作</td>";
        var bodyHtml = "";
        $.each(data,function(i,item){
            if( item.name != null ) {
                bodyHtml += '<tr><td>'+(i+1)+'</td><td>'+item.name+'</td><td>'+item.count+'</td><td><a href="" onclick="download12369(\''+item.name+'\',\''+item.code+'\')">文件下载</a></td></tr>'
            }
        })
        $("#tongjibiao thead tr").html(headHtml);
        $("#tongjibiao tbody").html(bodyHtml);

    }

}
//12369举报分析文件下载
function download12369(name,code){
    var json;
    if(mapType == "1") code = code.substr(0,2);
    else if (mapType == "2" ) code = code.substr(0,4);
    else if ( mapType == "3" ) code = code;

    if ($("#xz_day").css('display') =="block"){//日
        // json = {industry: type12369,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),code:code,name:name};
        json = "industry="+type12369+"&startTime="+$("#datetimeStart").val()+"&endTime="+$("#datetimeEnd").val()+"&code="+code+"&name="+name+"";
    } else if($("#xz_year").css('display') =="block"){//年
        // json = {industry: type12369,startTime:$("#yearStart").val()+"-01-01",endTime:$("#yearEnd").val()+"-12-31",code:code,name:name};
        json = "industry="+type12369+"&startTime="+$("#yearStart").val()+"-01-01"+"&endTime="+$("#yearEnd").val()+"-12-31"+"&code="+code+"&name="+name+"";
    } else if ($("#xz_ji").css('display') =="block"){//月
        // json = {industry: type12369,startTime:$("#jiStart").val()+"-01",endTime:$("#jiEnd").val()+"-30",code:code,name:name};
        json = "industry="+type12369+"&startTime="+$("#jiStart").val()+"-01"+"&endTime="+$("#jiEnd").val()+"-30"+"&code="+code+"&name="+name+""
    }
    window.open("/seimp/warn/getDowloand?"+json)
}


var echarts_data;
//柱状图数据
var x_data;
function  echartsData(){
    var json ;
    var width = 60;
    var code = "";
    if (mapType == "2" ) code = provinceCode.toString().substr(0,2);
    if (mapType == "3") code = cityCode.toString().substr(0,4);
    if ($("#xz_day").css('display') =="block"){
        width = "";
        json = {industry: mapIndustry,startTime:$("#datetimeStart").val(),endTime:$("#datetimeEnd").val(),type:"1",regionCode:code};
    } else if($("#xz_year").css('display') =="block"){
        json = {industry: mapIndustry,startTime:$("#yearStart").val()+"-01-01",endTime:$("#yearEnd").val()+"-12-30",type:"3",regionCode:code};
    } else if ($("#xz_ji").css('display') =="block"){
        json = {industry: mapIndustry,startTime:$("#jiStart").val()+"-01",endTime:$("#jiEnd").val()+"-30",type:"2",regionCode:code};
    }
    ajaxPost('/seimp/warn/staYq', json).done(function (result) {
        if( result.status == "0" ) {
            var x =[];
            var values = [];
            if($('input:radio[name="radio"]:checked').val() == "yuqing"){
                for ( var j = 0 ; j < result.data.x.length;j++){
                    var num;
                    if ($("#xz_day").css('display') =="block"){//日
                        num=yuqing_year(result.data.x[j],10,1,false);
                    } else if($("#xz_year").css('display') =="block"){//年
                        num=yuqing_year(result.data.x[j],4,3,false);
                    } else if ($("#xz_ji").css('display') =="block"){//月
                        num=yuqing_year(result.data.x[j],7,2,false);
                    }
                    x.push(result.data.x[j]);
                    values.push(parseInt(num));
                }
            } else if($('input:radio[name="radio"]:checked').val() == "12369"){
                for ( var j = 0 ; j < result.data.x.length;j++){
                    var num;
                    if ($("#xz_day").css('display') =="block"){//日
                        num=all12306_year(result.data.x[j],10,1,false);
                    } else if($("#xz_year").css('display') =="block"){//年
                        num=all12306_year(result.data.x[j],4,3,false);
                    } else if ($("#xz_ji").css('display') =="block"){//月
                        num=all12306_year(result.data.x[j],7,2,false);
                    }
                    x.push(result.data.x[j]);
                    values.push(parseInt(num));
                }
            }
            echarts_data = {x:x,values:values};
            di_echarts(echarts_data,width);
        }
    })
}
var option;
//柱状图
function  di_echarts(data,width){
    var name =""
    if($('input:radio[name="radio"]:checked').val() == "yuqing") name = "网络舆情分析";
    else name = "12369举报分析";
    option = {
        // color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : data.x,
                axisTick: {
                    alignWithLabel: true
                },
                textStyle: {
                    color: '#56595e',
                    fontSize: 18,
                    fontFamily: 'microsoft yahei light',
                    fontWeight: 300
                }
            }
        ],
        yAxis : [
            {
                show:false,
                type : 'value',
                axisLine: {show: false},
                splitLine: {show: false},
                axisTick: {show: false}
            }
        ],
        series : [
            {
                name:name,
                type:'bar',
                barWidth: '60%',
                data:data.values,
                barWidth : width,
                itemStyle: {
                    normal: {
                        color: function(params) {
                            // build a color map as your need.
                            var colorList = [
                                '#FCCE10','#FCCE10','#FCCE10','#FCCE10','#FCCE10'
                            ];
                            return colorList[params.dataIndex]
                        },
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{b}\n{c}'
                        }
                    }
                },
                // itemStyle: {
                //     normal:{
                //         color: '#EEEE00'
                //     },
                //
                // },
            }
        ]
    }
    myChart.setOption(option);
}
var myChart = echarts.init(document.getElementById('bar'));
var currentIdx = 0;
//统计图轮流高亮
function test (num) {
    if ( num == 0 ) return;
    if (bf == 0 ) return;
    //取消所有选中效果
    for(var i = 0 ; i < option.series[0].data.length ; i++){
        // option.series[0].data[i].itemStyle.normal.color="rgb(164,205,238)";
        myChart.dispatchAction({
            type: 'downplay',
            // 可选，数据的 index
            dataIndex: i
        })
    }


    //设置当前选中数据
    myChart.dispatchAction({
        type: 'highlight',
        dataIndex: currentIdx
    })
    currentIdx++;
    if ( currentIdx == echarts_data.x.length+1){
        window.setTimeout(function(a){
            var li_color = "#FCCE10";
            var colorList = [];
            for (var a = 0 ;a<option.series[0].data.length;a++){
                colorList.push("#FCCE10")
            }
            option.series[0].itemStyle.normal.color =function(params){return colorList[params.dataIndex]}
            myChart.setOption(option);
        },3000)
    }
    //递归调用，增加判断条件
    if(currentIdx<echarts_data.x.length+1){
        setTimeout(function (args) {
            if($('input:radio[name="radio"]:checked').val() == "yuqing"){
                if ($("#xz_day").css('display') =="block"){//日
                    yuqing_year(echarts_data.x[currentIdx-1],10,1,true);
                } else if($("#xz_year").css('display') =="block"){//年
                    yuqing_year(echarts_data.x[currentIdx-1],4,3,true);
                } else if ($("#xz_ji").css('display') =="block"){//月
                    yuqing_year(echarts_data.x[currentIdx-1],7,2,true);
                }
            }else {
                if ($("#xz_day").css('display') =="block"){//日
                    all12306_year(echarts_data.x[currentIdx-1],10,1,true);
                } else if($("#xz_year").css('display') =="block"){//年
                    all12306_year(echarts_data.x[currentIdx-1],4,3,true);
                } else if ($("#xz_ji").css('display') =="block"){//月
                    all12306_year(echarts_data.x[currentIdx-1],7,2,true);
                }
            }
            var li_color = "#FCCE10";
            var colorList = [];
            for (var a = 0 ;a<option.series[0].data.length;a++){
                colorList.push("#FCCE10")
            }
            colorList[currentIdx-1] = "#C1232B";
            option.series[0].itemStyle.normal.color =function(params){return colorList[params.dataIndex]}
            myChart.setOption(option);

            test();
            if (currentIdx == echarts_data.x.length +1){
                $("#d_bf").show();
                $("#d_zt").hide();
                currentIdx = 0;
            }
        }, 3000);
    }
}
// 舆情年份数据
function  yuqing_year(year,num,str,o){
    var data=[] ;
    var fan_num=0 ;
    $.each(yuqingAll.data,function(i,item){
        if ( mapIndustry== "" || item.type == mapIndustry) {
            var sj = item.time.substr(0,num);
            if (year == sj ) {
                var region1 = item.chinaRegion1;
                var region2 = item.chinaRegion2;
                var region3 = item.chinaRegion3;
                if ( mapType == 1 ) {
                    if(region1 != null && region1 != "" && region1 != undefined ) {
                        if ( data.length > 0 ) {
                            region1= region1.split(",");
                            for ( var i = 0 ; i < region1.length;i++){
                                var ss =region1[i].split("_");
                                var sf = true;
                                for (var j = 0 ; j < data.length; j ++) {
                                    if (data[j].province.trim() == ss[0].trim()){
                                        data[j].count=parseInt(data[j].count)+1;
                                        sf = false;
                                        fan_num++;

                                    }
                                }
                                if (sf){
                                    data.push({name:ss[1],count:1,province:ss[0].trim()});
                                    fan_num++;
                                }
                            }
                        } else {
                            region1= region1.split(",");
                            for ( var i = 0 ; i < region1.length; i++ ){
                                var ss =region1[i].split("_");
                                data.push({name:ss[1],count:1,province:ss[0].trim()})
                                fan_num++;
                            }
                        }
                    }
                    if(o) {
                        try {
                            map.removeLayer(map.getLayer("countryGraphicsLayer"));
                        } catch (e) {}
                        initCountryCount(data);
                    }
                } else if( mapType == 2 ) {
                    // provinceCode
                    if(region2 != null && region2 != "" && region2 != undefined ) {
                        if ( data.length > 0 ) {//[{city:,name:,count:}]
                            region2= region2.split(",");
                            for ( var i = 0 ; i < region2.length;i++){
                                var ss =region2[i].split("_");//[350000，上海]
                                if (provinceCode.toString().substr(0,2) == ss[0].trim().substr(0,2)){
                                    var sf = true;
                                    for (var j = 0 ; j < data.length; j ++) {
                                        if (data[j].city.trim() == ss[0].trim()){
                                            data[j].count=parseInt(data[j].count)+1;
                                            sf = false;
                                            fan_num++;
                                        }
                                    }
                                    if (sf){
                                        var city_name = "";
                                        $.each(cityAll.data,function(c,t){
                                            if (ss[0].trim() == t.code) city_name = t.name;
                                        })
                                        data.push({name:city_name,count:1,city:ss[0].trim()})
                                        fan_num++;
                                    }
                                }
                            }
                        } else {
                            region2= region2.split(",");
                            for ( var i = 0 ; i < region2.length; i++ ){
                                var ss =region2[i].split("_");
                                if ( provinceCode.toString().substr(0,2) == ss[0].trim().substr(0,2)){
                                    var city_name = "";
                                    $.each(cityAll.data,function(c,t){
                                        if (ss[0].trim() == t.code) city_name = t.name;
                                    })
                                    data.push({name:city_name,count:1,city:ss[0].trim()})
                                    fan_num++;
                                }
                            }
                        }
                    }
                    if(o) {
                        try {
                            map.removeLayer(map.getLayer("provinceGraphicsLayer"));
                        } catch (e) {

                        }
                        initProvinceCount(data)
                    }
                } else if ( mapType == 3) {
                    // cityCode
                    if(region3 != null && region3 != "" && region3 != undefined ) {
                        if ( data.length > 0 ) {//[{city:,name:,count:}]
                            region3= region3.split(",");
                            for ( var i = 0 ; i < region3.length;i++){
                                var ss =region3[i].split("_");//[350000，上海]
                                if (cityCode.toString().substr(0,4) == ss[0].trim().substr(0,4)){
                                    var sf = true;
                                    for (var j = 0 ; j < data.length; j ++) {
                                        if (data[j].city.trim() == ss[0].trim()){
                                            data[j].count=parseInt(data[j].count)+1;
                                            sf = false;
                                            fan_num++;
                                        }
                                    }
                                    if (sf){
                                        var city_name = "";
                                        var lat ="";
                                        var lon = "";
                                        $.each(cityAll.data,function(c,t){
                                            if (ss[0].trim() == t.code){
                                                city_name = t.name;
                                                lat = t.lat;
                                                lon = t,lon;
                                            }
                                        })
                                        data.push({name:city_name,count:1,city:ss[0].trim(),lat:lat,lon:lon})
                                        fan_num++;
                                    }
                                }
                            }
                        } else {
                            region3= region3.split(",");
                            for ( var i = 0 ; i < region3.length; i++ ){
                                var ss =region3[i].split("_");
                                if (cityCode.toString().substr(0,4) == ss[0].trim().substr(0,4)){
                                    var city_name = "";
                                    var lat ="";
                                    var lon = "";
                                    $.each(cityAll.data,function(c,t){
                                        if (ss[0].trim() == t.code){
                                            city_name = t.name;
                                            lat = t.lat;
                                            lon = t.lon;
                                        }
                                    })
                                    data.push({name:city_name,count:1,city:ss[0].trim(),lat:lat,lon:lon})
                                    fan_num++;
                                }
                            }
                        }
                    }
                    if(o){
                        try {
                            map.removeLayer(map.getLayer("cityGraphicLayer"));
                        } catch (e) {

                        }
                        updateCityLayer(data)
                    }
                }
            }
        }

    })
    return fan_num;

}
//12369根据年份得到的数据
function  all12306_year(year,num,str,o){
    var data=[] ;
    var fan_num=0 ;
    $.each(all12369.data,function(i,item){
        if ( mapIndustry== "" || item.type == mapIndustry) {
            var sj = item.REPORT_TIME.substr(0,num);
            if (year == sj ) {
                if ( mapType == 1 ) {
                    var sf = true;
                    var code_12369 = item.AREA_CODE.substr(0,2);
                    for (var j = 0 ; j < data.length; j ++) {
                        if (data[j].province.trim() == (code_12369+"0000")){
                            data[j].count=parseInt(data[j].count)+1;
                            sf = false;
                            fan_num++;
                        }
                    }
                    if (sf){
                        var name = "";
                        $.each(cityAll.data,function(c,t){
                            if (t.code == (code_12369+"0000")){
                                name = t.name;
                            }
                        })
                        data.push({name:name,count:1,province:code_12369+"0000"});
                        fan_num++;
                    }
                    if(o) {
                            try {
                                map.removeLayer(map.getLayer("countryGraphicsLayer"));
                            } catch (e) {}
                        initCountryCount(data);
                    }
                } else if (mapType == "2"){
                    var sf = true;
                    var code_12369 = item.AREA_CODE.substr(0,2);
                    if (provinceCode.toString().substr(0,2) == code_12369 ){
                        for (var j = 0 ; j < data.length; j ++) {
                            if (data[j].province.trim() == (item.AREA_CODE.substr(0,4)+"00")){
                                data[j].count=parseInt(data[j].count)+1;
                                sf = false;
                                fan_num++;
                            }
                        }
                        if (sf){
                            var name = "";
                            $.each(cityAll.data,function(c,t){
                                if (t.code == (item.AREA_CODE.substr(0,4)+"00")){
                                    name = t.name;
                                }
                            })
                            data.push({name:name,count:1,city:item.AREA_CODE.substr(0,4)+"00"});
                            fan_num++;
                        }
                    }
                    if(o) {
                        try {
                            map.removeLayer(map.getLayer("provinceGraphicsLayer"));
                        } catch (e) {

                        }
                        initProvinceCount(data)
                    }
                } else if (mapType == "3" ) {
                    var sf = true;
                    var code_12369 = item.AREA_CODE.substr(0,4);
                    // if (cityCode.toString().substr(0,4) == ss[0].trim().substr(0,4)){
                    if (cityCode.toString().substr(0,4) == code_12369 ){
                        for (var j = 0 ; j < data.length; j ++) {
                            if (data[j].province.trim() == (item.AREA_CODE)){
                                data[j].count=parseInt(data[j].count)+1;
                                sf = false;
                                fan_num++;
                            }
                        }
                        if (sf){
                            var city_name = "";
                            var lat ="";
                            var lon = "";
                            $.each(cityAll.data,function(c,t){
                                if (item.AREA_CODE == t.code){
                                    city_name = t.name;
                                    lat = t.lat;
                                    lon = t,lon;
                                }
                            })
                            data.push({name:city_name,count:1,city:item.AREA_CODE,lat:lat,lon:lon});
                            fan_num++;
                        }
                    }
                    if(o) {
                        try {
                            map.removeLayer(map.getLayer("cityGraphicLayer"));
                        } catch (e) {

                        }
                        updateCityLayer(data)
                    }
                }
            }
        }
    })
    return fan_num;
}


//悬浮窗拖动
$(document).ready(function () {
	
	/*鼠标拖动div事件*/

	var $div = $(".mapWindow");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown",function(event){
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
        $div.css({
          top:now_y,
          left:now_x
        });
        $('.find_bogBox').css({
        	top:now_y,
            left:now_x
        })
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
    	var top = $div.css('top').split('px')
    	var left = $div.css('left').split('px')
    	if(top[0] < 0){
    		$div.css('top','5%')
    		$('.find_bogBox').css('top','5%')
    	}
    	if(left[0] < 0){
    		$div.css('left','10px')
    		$('.find_bogBox').css('left','10px')
    	}
      $(this).unbind("mousemove");
    });
})