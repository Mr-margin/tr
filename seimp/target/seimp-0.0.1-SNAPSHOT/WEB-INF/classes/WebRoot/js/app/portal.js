

// 新闻间隔滚动
var _width = $('#pic_list_2').width()
$('#pic_list_2 .box li').css('width', '' + _width * 0.251 + 'px');
//数据交换滚动
//$("#pic_list_2").cxScroll({direction: "right", step: 1});
$('#mapPortal .corver').click(function () {
    $(this).hide();
})
// $('#mapPortal').mouseout(function () {
// 	$('#mapPortal .corver').show();
//     event.stopPropagation();
// })
var div = document.getElementById("mapPortal");
div.onmouseout = function (event) {
    var div = document.getElementById("mapPortal");
    var e = event || window.event;
    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    var x = e.pageX || e.clientX + scrollX;
    var y = e.pageY || e.clientY + scrollY;
    var divx1 = div.offsetLeft;
    var divy1 = div.offsetTop;
    var divx2 = div.offsetLeft + div.offsetWidth;
    var divy2 = div.offsetTop + div.offsetHeight;
    if (x < divx1 || x > divx2 || y < divy1 || y > divy2) {
//        $('#mapPortal .corver').show();
    }

}
var _width1 = $('#pic_list_2').width()
$('#pic_list_3 .box li').css('width', '' + _width1 * 0.252 + 'px');
$("#pic_list_3").cxScroll({direction: "right", step: 1});
getNews();
function asd() {
    $.fn.countTo = function (options) {
        options = options || {};
        return $(this).each(function () {
            // set options for current element
            var settings = $.extend({}, $.fn.countTo.defaults, {
                from: $(this).data('from'),
                to: $(this).data('to'),
                speed: $(this).data('speed'),
                refreshInterval: $(this).data('refresh-interval'),
                decimals: $(this).data('decimals')
            }, options);
            // how many times to update the value, and how much to increment the value on each update
            var loops = Math.ceil(settings.speed / settings.refreshInterval),
                increment = (settings.to - settings.from) / loops;
            // references & variables that will change with each update
            var self = this,
                $self = $(this),
                loopCount = 0,
                value = settings.from,
                data = $self.data('countTo') || {};
            $self.data('countTo', data);
            // if an existing interval can be found, clear it first
            if (data.interval) {
                clearInterval(data.interval);
            }
            data.interval = setInterval(updateTimer, settings.refreshInterval);
            // initialize the element with the starting value
            render(value);
            function updateTimer() {
                value += increment;
                loopCount++;
                render(value);
                if (typeof(settings.onUpdate) == 'function') {
                    settings.onUpdate.call(self, value);
                }
                if (loopCount >= loops) {
                    // remove the interval
                    $self.removeData('countTo');
                    clearInterval(data.interval);
                    value = settings.to;
                    if (typeof(settings.onComplete) == 'function') {
                        settings.onComplete.call(self, value);
                    }
                }
            }

            function render(value) {
                var formattedValue = settings.formatter.call(self, value, settings);
                $self.html(formattedValue);
            }
        });
    };
    $.fn.countTo.defaults = {
        from: 0,               // the number the element should start at:
       
        to: 0,                 // the number the element should end at
        speed: 1000,           // how long it should take to count between the target numbers
        refreshInterval: 100,  // how often the element should be updated
        decimals: 0,           // the number of decimal places to show
        formatter: formatter,  // handler for formatting the value before rendering
        onUpdate: null,        // callback method for every time the element is updated
        onComplete: null       // callback method for when the element finishes updating
    };

    function formatter(value, settings) {
    	return value.toLocaleString();//使用正则替换，每隔三个数加一个','
    }

// custom formatting example
    $('#count-number').data('countToOptions', {
        formatter: function (value, options) {
            return value.toFixed(options.decimals).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
        }
    });
    getSta1();
// start all the timers
}
asd();


/*获取统计数据*/
function getSta1() {
    ajaxPost("/seimp/share/getStatistic", {type: 1}).done(function (data) {
        if (data.status == 0) {
        	console.log(data)
            for (var i = 0; i < data.data.length; i++) {
                var item = data.data[i];
                $('.sta' + item.TYPE).attr('data-to', item.SUM)
            }
            $('.timer').each(count);
            function count(options) {
                var $this = $(this);
                options = $.extend({}, options || {}, $this.data('countToOptions') || {});
                $this.countTo(options);
            }
        }
    });
}
// 初始化轮播
$('#index-slide').carousel({
    interval: 2000
})

// 主页跳转预警分析
$('.analyse-block').click(function () {
    $('.li-warn').addClass('bottom-color').siblings().removeClass('bottom-color');
});

// 主页跳转数据中心
$('.data-pages ul li').click(function () {
    $('.li-data').addClass('bottom-color').siblings().removeClass('bottom-color');
    window.location.href = "index.html#data";
    scrollTos();
});


// 楼层导航代码
$(function () {
    $("#wrdk_id").attr("href","http://10.10.120.146/checkLogin.do?token="+storage.token);
    //1.楼梯什么时候显示，800px scroll--->scrollTop
    $(window).on('scroll', function () {
        var $scroll = $(this).scrollTop();
        if ($scroll >= 80) {

        } else {

        }
        //4.拖动滚轮，对应的楼梯样式进行匹配
        $('.floor').each(function () {
            var $loutitop = $('.floor').eq($(this).index()).offset().top + 200;
            // if($(this).index()==0){
            //     $loutitop=$('.floor').eq($(this).index()).offset().top+200;
            // }
            if ($(this).index() == 1) {
                $loutitop = $('.floor').eq($(this).index()).offset().top + 500;
            }
            if ($(this).index() == 2) {
                $loutitop = $('.floor').eq($(this).index()).offset().top + 500;
            }
            if ($(this).index() == 3) {
                $loutitop = $('.floor').eq($(this).index()).offset().top + 500;
            }
            if ($loutitop > $scroll) {//楼层的top大于滚动条的距离
                $('.floor-nav li').removeClass('active');
                $('.floor-nav li').eq($(this).index()).addClass('active');
                return false;//中断循环
            }
        });
    });

    //2.获取每个楼梯的offset().top,点击楼梯让对应的内容模块移动到对应的位置  offset().left
    var $loutili = $('.floor-nav li').not('.last');
    $loutili.on('click', function () {
        $(this).addClass('active').siblings('li').removeClass('active');
        var $loutitop = ($('.floor').eq($(this).index()).offset().top);
        if ($(this).index() == 0) {
            $loutitop = ($('.floor').eq($(this).index()).offset().top);
        }
        //获取每个楼梯的offsetTop值
        $('html,body').animate({//$('html,body')兼容问题body属于chrome
            scrollTop: $loutitop
        }, 800)
    });
    // //3.回到顶部
    // $('.active-one').on('click',function(){
    //     $('html,body').animate({//$('html,body')兼容问题body属于chrome
    //         scrollTop:0
    //     },800)
    // });
});
$('.newData').click(function () {
    $('.newData img').attr('src', 'img/newData.png')
    $('.hotData img').attr('src', 'img/hotDataBlack.png')
    $('.otherData img').attr('src', 'img/hotDataBlack.png')
})
$('.hotData').click(function () {
    $('.newData img').attr('src', 'img/newDataBlack.png')
    $('.hotData img').attr('src', 'img/hotData.png')
    $('.otherData img').attr('src', 'img/hotDataBlack.png')
})
$('.otherData').click(function () {
    $('.newData img').attr('src', 'img/newDataBlack.png')
    $('.hotData img').attr('src', 'img/hotDataBlack.png')
    $('.otherData img').attr('src', 'img/hotData.png')
})
// 最新数据热门数据选项卡

$('.map-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
    $('.map-contain').siblings('.table1-contain').removeClass('active').addClass('none');
});

$('.table-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $('.table-contain').siblings('.table1-contain').removeClass('active').addClass('none');
});
$('.table1-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.table1-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $('.table1-contain').siblings('.table-contain').removeClass('active').addClass('none');
});
// 切换选项卡
$('.map-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
});

$('.table-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
})


$('.scenery-list li').click(function () {
    $('.carousel-inner>div.item').css({'border': 'none', 'margin': '0', 'padding': '0'});
})

var map;
//条件查询参数
var searchParams = {//清单模式查询条件
    province: "",
    city: "",
    county: "",
    industry: "",
    keyword: ""
}
//工作推进数据
var gongzuoData = null;
/********************切换地图************/
var allQiYeIndustryArr = [{id: "有色金属矿采选业,有色金属采选业", name: "有色金属矿采选"}, {
    id: "有色金属冶炼,有色金属冶炼和压延加工业",
    name: "有色金属冶炼"
}, {id: "none_1", name: "石油开采"},
    {id: "石油加工,石油加工业", name: "石油加工"}, {id: "化工,化工原料和化工制品制造业", name: "化工"}, {
        id: "石油加工、炼焦及核燃料加工业",
        name: "焦化"
    }, {id: "none_2", name: "电镀"}, {
        id: "皮革、毛皮、羽毛及其制品和制鞋业,皮革、毛皮、羽毛(绒)及其制品业,皮革、毛皮、羽毛（绒）及其制品业,皮革、毛皮、羽毛及其制品和制造业",
        name: "制革"
    },
    {id: "医药,医药制造,医药制造业", name: "医药制造"}, {id: "none_3", name: "铅酸蓄电池制造"}, {id: "none_4", name: "废旧电子拆解"},
    {id: "危险废物处理处置", name: "危险废物处理处置"}, {id: "none_5", name: "危险化学品生产、存储、使用"}];
initMap();
var myChart = echarts.init(document.getElementById('doughnut'));
var provinceCode = null;//省级用户省份行政区划

var userLevel = storage.getItem("userLevel");
//更新统计图
qyLeftUpdate();
//$(function(){

function initMap() {
    require(["esri/map", "esri/SpatialReference", "esri/geometry/Extent",
        "esri/layers/WMTSLayer", "esri/layers/WMTSLayerInfo", "esri/layers/TileInfo",
        "esri/dijit/InfoWindowLite", "dojo/dom-construct"
    ], function (Map, SpatialReference, Extent,
                 WMTSLayer, WMTSLayerInfo, TileInfo,
                 InfoWindowLite, domConstruct) {
        var extent = new Extent(extentPar);
        //初始化地图
        map = new Map("mapPortal", {
            logo: false,
            minZoom:2,
            center: [104.040481, 34.17597],
            zoom: 3,
            extent: extent,
            showLabels: true
        })

        var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        map.setInfoWindow(infoWindow);

        //加载天地图：全球矢量地图服务、全球矢量中文注记服务
        vectorMap(map);

//        updateWurandikuai();
        //判断是否是省级用户
        initLayerByUser();
        wurandikuaiEcharts();
        //显示图例
        $("#mylegend").show();
        //更新图例颜色
        var colorValue = ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014"]
        updateLegendColor(colorValue, "上报地块数量(块)");
    });//--require end

}
//})

//判断是国家级用户，还是省级用户，默认显示图层不同
function initLayerByUser(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
			InfoWindowLite,domConstruct
	){
		//判断用户是否是省级用户
		var storage = window.sessionStorage;
		userLevel = storage.getItem("userLevel")
		//管理员、国家级用户
		if(storage.getItem("userLevel")==null || storage.getItem("userLevel")=="0" || storage.getItem("userLevel")=="1"){
			//更新全国模式
//			updateWurandikuai();
			wuranlaiyuanqiye();
        	updateQiye();
		}else if(storage.getItem("userLevel")=="2"){//省级用户
			//当前省的行政区划
			provinceCode = storage.getItem("regionCode");
			//定位到当前省
			var queryTask = new QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0");
			var query = new Query();
			query.returnGeometry = true;
			query.outFields = ["*"];
			query.outSpatialReference = map.spatialReference;
			query.where = "PROV_CODE = '"+provinceCode+"'";
			queryTask.execute(query,showResults);

			function showResults(result){
				//判断查询是否有结果
				if(result.features.length>0){
			    	 var graphic = result.features[0];
			    	 //当前省的边界
//			    	 provinceExtent = graphic.geometry.getExtent();
			    	 map.setExtent(graphic.geometry.getExtent());
			    	 //当前省的高亮
			    	 var lineJson = {
							 "paths":graphic.geometry.rings,
							 "spatialReference":{"wkid":4326}
					 }
					 var highPolyline = new Polyline(lineJson);
					 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
					 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
					 //记录边界高亮
//					 provinceClick = highGraphic;
					 map.graphics.add(highGraphic);
				}
		    }
			//更新污染地块图层
//			initDikuaiProvince();
			wuranlaiyuanqiyeProvince();
        	initQiyeProvince_1();
			
		}
	})
}

$('#2001').click(function () {
    $('#2001 img').attr('src', 'img/wrdk.png')
    $('#trzl img').attr('src', 'img/nydtrzlB.png')
    $('#qy img').attr('src', 'img/zdhyjgqyB.png')
    $('#unusedLand img').attr('src', 'img/wlydB.png')
    $('#gongzuo img').attr('src', 'img/gztjB.png')
})
//$('#trzl').click(function () {
//    $('#2001 img').attr('src', 'img/wrdkB.png')
//    $('#trzl img').attr('src', 'img/nydtrzl.png')
//    $('#qy img').attr('src', 'img/zdhyjgqyB.png')
//    $('#unusedLand img').attr('src', 'img/wlydB.png')
//    $('#gongzuo img').attr('src', 'img/gztjB.png')
//})
$('#qy').click(function () {
    $('#2001 img').attr('src', 'img/wrdkB.png')
    $('#trzl img').attr('src', 'img/nydtrzlB.png')
    $('#qy img').attr('src', 'img/zdhyjgqy.png')
    $('#unusedLand img').attr('src', 'img/wlydB.png')
    $('#gongzuo img').attr('src', 'img/gztjB.png')
})
//$('#unusedLand').click(function () {
//    $('#2001 img').attr('src', 'img/wrdkB.png')
//    $('#trzl img').attr('src', 'img/nydtrzlB.png')
//    $('#qy img').attr('src', 'img/zdhyjgqyB.png')
//    $('#unusedLand img').attr('src', 'img/wlyd.png')
//    $('#gongzuo img').attr('src', 'img/gztjB.png')
//})
$('#gongzuo').click(function () {
    $('#2001 img').attr('src', 'img/wrdkB.png')
    $('#trzl img').attr('src', 'img/nydtrzlB.png')
    $('#qy img').attr('src', 'img/zdhyjgqyB.png')
    $('#unusedLand img').attr('src', 'img/wlydB.png')
    $('#gongzuo img').attr('src', 'img/gztj.png')
})


//地图切换模块
$("#portalMap").children().click(function () {
    var idVal = $(this).attr("id");
	if (idVal == "trzl" || idVal == "unusedLand"){
		return;
	}
    $("#portalMap").children().removeClass("map-table-color img-border");
    $(this).addClass("map-table-color img-border");
    if (idVal == "2001") {
        $(".left").show();
        idVal = parseInt(idVal);
    } else {
        $(".left").hide();
    }

    if (idVal == "2001") {//污染地块
        var data = [{value: 13, name: '污染地块'}, {value: 10, name: '疑似污染地块'}];
        
        if(userLevel==null||userLevel==0||userLevel==1){
        	//右侧统计图
        	wurandikuaiEcharts();
        	//地图
        	updateWurandikuai();
        }else if(userLevel==2){
        	//右侧统计图
        	wurandikuaiEchartsProvince();
        	//
        	initDikuaiProvince();
        }
        //显示图例
        $("#mylegend").show();
        //更新图例颜色
        var colorValue = ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014"]
        updateLegendColor(colorValue, "上报地块数量(块)");
        showGuojie();
//    } else if (idVal == "trzl") {//农用地土壤质量
//        nongyongdiEcharts();
//        updateNongyongdi();
//        hideGuoJie();
        
        //左侧统计图
        wrdkLeftUpdate()
        
        
    } else if (idVal == "qy") {//重点监管企业
        
        if(userLevel==null||userLevel==0||userLevel==1){
        	//右侧统计图
        	wuranlaiyuanqiye();
        	updateQiye();
        }else if(userLevel==2){
        	wuranlaiyuanqiyeProvince();
        	initQiyeProvince_1();
        }
        //显示图例
        $("#mylegend").show();
        //更新图例颜色
        var colorValue = ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d"]
        updateLegendColor(colorValue, "重点行业监管企业数量(个)");
        showGuojie();
//    } else if (idVal == "unusedLand") {
//        weiliyongdiEcharts();
//        updateWeiliyong();
//        hideGuoJie();
        //左侧统计图
        qyLeftUpdate();
        
    } else if (idVal == "gongzuo") {//工作推进
        if (gongzuoData != null) {
            updateGongzuoEcharts(gongzuoData);
        }
        if(userLevel==null||userLevel==0||userLevel==1){
        	updateGongzuoLayer();
        }else if(userLevel==2){
        	updateGongzuoProvinceLayer();
        }
        
        //显示图例
        $("#mylegend").show();
        //更新图例颜色
        var colorValue = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6"]
        updateLegendColor(colorValue, "工作推进资讯(条)");
        showGuojie();
    }

})

//污染地块
function updateWurandikuai() {
    hideLayer();
    if (map.getLayer("dikuaiCountryFeatureLayer")) {
        map.getLayer("dikuaiCountryFeatureLayer").setVisibility(true);
    }
    if (map.getLayer("dikuaiCountryGraphicsLayer")) {
        map.getLayer("dikuaiCountryGraphicsLayer").setVisibility(true);
        return;
    }
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
            id: "dikuaiCountryFeatureLayer"
        });

        //加载省名标签
        var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
        statesLabel.font.setSize("12pt");
        statesLabel.font.setWeight(700);
        statesLabel.setOffset(0, -2);
        var labelClass = new LabelClass({
            "labelExpressionInfo": {"value": "{NAME}"},
            "useCodedValues": true,
            "above-left": 'above-left',
            "fieldInfos": [{fieldName: "NAME"}]
        });
        labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
        
        var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);

        featureLayer.on("click",function(evt){
        	window.location.href = "index.html#information?init=dikuai";
        });
        //添加点击事件
        /*featureLayer.on("click",function(evt){
         //高亮设置
         removeGraphic("provinceClick");
         var lineJson = {
         "paths":evt.graphic.geometry.rings,
         "spatialReference":{"wkid":4326}
         }
         var highPolyline = new Polyline(lineJson);
         var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
         var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
         //记录边界高亮
         provinceClick = highGraphic;
         map.graphics.add(highGraphic);
         //获取点击省份的PROV_CODE
         provinceCode = evt.graphic.attributes.PROV_CODE;
         //设置地图边界
         map.setExtent(evt.graphic.geometry.getExtent());
         //记录地图边界
         provinceExtent = evt.graphic.geometry.getExtent();
         //改变右上角按钮Text
         $("#province").html(evt.graphic.attributes.NAME);
         //显示右上角按钮
         $("#province").removeClass("none");
         //更新某一个省的点位图层
         updateProvince(true);
         });*/

        //添加鼠标进入事件
       /* featureLayer.on("mouse-over", function (evt) {

        	removeGraphic("provinceHigh");
            var lineJson = {
                "paths": evt.graphic.geometry.rings,
                "spatialReference": {"wkid": 4326}
            }
            var highPolyline = new Polyline(lineJson);
            var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([252,78,42]), 2);
            var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
            map.graphics.add(highGraphic);
        })
        //添加鼠标移出事件
        featureLayer.on("mouse-out", function () {
            removeGraphic("provinceHigh");
        })*/


        featureLayer.on("graphic-node-add", function () {
            //加载动画结束
            addGuojie();
        })

        //ajax获取各省产粮油大县的数量
        var json = {industry: ""};
        ajaxPost('/seimp/pic/getWrdk1.do', json).done(function (result) {
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
                    //重新计算最大值
                    maxCount = maxmain(maxCount);

                    var count = (maxCount - minCount) / 6;
                    //更新图例
                    updateLegend(minCount, count);
                    //记录图例参数
                    countryMinCount = minCount;
                    countryCount = count;

                    //设置分省底图各个分段的symbol
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([255, 255, 229, 1]));
                    var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([255, 247, 188, 1]));
                    var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 227, 145, 1]));
                    var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 196, 79, 1]));
                    var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([254, 153, 41, 1]));
                    var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([236, 112, 20, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");


                    //更新图例
//					updateLegend(minCount,count);

                    for (var i = 0; i < data.length; i++) {
                        var currItem = data[i];
                        if (minCount <= currItem.count && currItem.count < minCount + count * 1) {
                            renderer.addValue(currItem.province, symbol1);
                        } else if (minCount + count * 1 <= currItem.count && currItem.count < minCount + count * 2) {
                            renderer.addValue(currItem.province, symbol2);
                        } else if (minCount + count * 2 <= currItem.count && currItem.count < minCount + count * 3) {
                            renderer.addValue(currItem.province, symbol3);
                        } else if (minCount + count * 3 <= currItem.count && currItem.count < minCount + count * 4) {
                            renderer.addValue(currItem.province, symbol4);
                        } else if (minCount + count * 4 <= currItem.count && currItem.count <= minCount + count * 5) {
                            renderer.addValue(currItem.province, symbol5);
                        } else if (minCount + count * 5 <= currItem.count && currItem.count <= minCount + count * 6) {
                            renderer.addValue(currItem.province, symbol6);
                        }
                    }
                    //为分省地图设置渲染
//                    featureLayer.setRenderer(renderer);
                    //将分省地图添加到地图上
                    map.addLayer(featureLayer, 2);
                    //分段渲染的底图加载完成之后，才能加载数字图层
                    featureLayer.on("update-end", function () {
                        initDikuaiCountryCount(data);
                    })


                } else {//如果没有数据
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");
//                    featureLayer.setRenderer(renderer);
                    //更新图例
                    updateLegend(0, 0);
                    map.addLayer(featureLayer, 2);
                    featureLayer.on("update-end", function () {//分段渲染的底图加载完成之后，才能加载分省饼图
                        initDikuaiCountryCount(data);
                    })
                }

            }
        });//--ajax end
    });//-require end


}


//加载污染地块各省数字图层
function initDikuaiCountryCount(data) {
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
        var graphicsLayer = new GraphicsLayer({id: "dikuaiCountryGraphicsLayer"});
//        graphicsLayer.setMinScale(18489334.7159);
        //获取省界图层的Graphics
        var feaGraphics = map.getLayer("dikuaiCountryFeatureLayer").graphics;
        //添加省名
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            var point = currFeaGraphic.geometry.getCentroid();
            //处理河北省
            if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                point = new Point([115.18, 38]);
            }
            var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
            symbol.font.setSize("10pt");
            symbol.font.setWeight(700);
            symbol.font.setFamily("微软雅黑");
            symbol.setOffset(0, -14);
            var graphic = new Graphic(point, symbol);
            graphicsLayer.add(graphic);
        }

        //计算总数
        var sum = 0;//总数
        for (var i = 0; i < data.length; i++) {
            var currItem = data[i];
            sum += currItem.count;
        }

        //遍历省界图层的graphics
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            //遍历数据
            for (var j = 0; j < data.length; j++) {
                var currItem = data[j];
                //判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
                if (currFeaGraphic.attributes.PROV_CODE == currItem.province) {

                    /*if(currItem.province=="430000"){
                     var attributes = {
                     provoinceCode:currItem.province,
                     provinceName:currItem.name
                     }
                     var point = currFeaGraphic.geometry.getCentroid();
                     var symbolSize = 24;
                     if(currItem.count.toString().length==1){
                     symbolSize = 24;
                     }else if(currItem.count.toString().length==2){
                     symbolSize = 30;
                     }else if(currItem.count.toString().length==3){
                     symbolSize = 40;
                     }else if(currItem.count.toString().length==4){
                     symbolSize = 60;
                     }else if(currItem.count.toString().length==5){
                     symbolSize = 70;
                     }else{
                     symbolSize = currItem.count.toString().length*14;
                     }
                     var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
                     var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-7).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
                     symbol2.font.setSize("14pt");
                     symbol2.font.setWeight(700);
                     symbol3 = new TextSymbol((currItem.count/sum*100).toFixed(2)+"%").setOffset(0,symbolSize/2-17).setColor(new Color([255,255,255,1]));
                     symbol3.font.setSize("8pt");
                     symbol3.font.setWeight(700);
                     var graphic1 = new Graphic(point,symbol1,attributes);
                     var graphic2 = new Graphic(point,symbol2,attributes);
                     var graphic3 = new Graphic(point,symbol3,attributes);
                     graphicsLayer.add(graphic1);
                     graphicsLayer.add(graphic2);
                     graphicsLayer.add(graphic3);
                     continue;
                     }*/

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
                    var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
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
        map.addLayer(graphicsLayer);

    });//--require end
}

//省级用户污染地块
function initDikuaiProvince(){
	hideLayer();
    if (map.getLayer("dikuaiCountryFeatureLayer")) {
        map.getLayer("dikuaiCountryFeatureLayer").setVisibility(true);
    }
    if (map.getLayer("dikuaiCountryGraphicsLayer")) {
        map.getLayer("dikuaiCountryGraphicsLayer").setVisibility(true);
        return;
    }
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 //加载地图服务
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"dikuaiCountryFeatureLayer"
	     });
		 
		 featureLayer.setDefinitionExpression("KIND_1 like '"+(provinceCode+"").substr(0, 2)+"%'");
		 
		 //加载市名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
		 
		 var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
	 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
	 		renderer = new SimpleRenderer(defaultSymbol);
	 		featureLayer.setRenderer(renderer);
		 
		 //添加点击事件
        featureLayer.on("click",function(evt){
        	window.location.href = "index.html#information?init=dikuai";
        });
		
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
		})
		//添加鼠标移出事件
		featureLayer.on("mouse-out",function(){
			removeGraphic("provinceHigh");
		})
		 
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
		})

	 	 //ajax获取某一个省的各个市的数量
		 var json = {industry:"",code:provinceCode};
		 ajaxPost('/seimp/pic/getWrdk2.do',json).done(function(result){
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data.length>0){
					
					//处理数据，获取各市数量的最大值最小值
					var minCount = 0;
					var maxCount = 0;
					for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.count<minCount){
							minCount = currItem.count;
						}
						if(currItem.count>maxCount){
							maxCount = currItem.count;
						}
					}
					//重新计算最大值
					maxCount = maxmain(maxCount);
					
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					provinceMinCount = minCount;
					provinceCount = count;
					
					//设置分市底图各个分段的symbol
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol6);
						}
					}
					//为分市地图设置渲染
//					featureLayer.setRenderer(renderer);
					//将分市地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initDikuaiProvinceCount(data);
					})
					
					
				}else{//如果没有数据
					/*var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					featureLayer.setRenderer(renderer);
					*/
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
			 		renderer = new SimpleRenderer(defaultSymbol);
			 		featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initDikuaiProvinceCount(data);
					})
				}
			}
		});//--ajax end
	});//-require end
}

//加载某一个省各市的数字图层
function initDikuaiProvinceCount(data){
	require([
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
		"esri/geometry/Point",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
		SimpleMarkerSymbol, SimpleLineSymbol,
        PictureMarkerSymbol, CartographicLineSymbol, 
        Graphic, TextSymbol,GraphicsLayer,
        Point,
        Color, dom, on
  	){
		var graphicsLayer = new GraphicsLayer({id:"dikuaiCountryGraphicsLayer"});
		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("dikuaiCountryFeatureLayer").graphics;
		
		//添加市名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.KIND_1==currItem.CITY_CODE.substr(0,4)){
					
					var attributes = {
							countyCode:currItem.CITY_CODE,
							countyName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 24;
					if(currItem.count.toString().length==1){
						symbolSize = 24;
					}else if(currItem.count.toString().length==2){
						symbolSize = 30;
					}else if(currItem.count.toString().length==3){
						symbolSize = 40;
					}else if(currItem.count.toString().length==4){
						symbolSize = 50;
					}else if(currItem.count.toString().length==5){
						symbolSize = 60;
					}else{
						symbolSize = currItem.count.toString().length*12;
					}
					console.log(symbolSize);
					var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
					var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
					symbol2.font.setFamily("Times");
					symbol2.font.setSize("10pt");
					symbol2.font.setWeight(600);
					var graphic1 = new Graphic(point,symbol1,attributes);
					var graphic2 = new Graphic(point,symbol2,attributes);
					graphicsLayer.add(graphic1);
					graphicsLayer.add(graphic2);
				}
			}
		}
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//农用地土壤质量
function updateNongyongdi() {
    hideLayer();
    if (map.getLayer("nongyongdi")) {
        map.getLayer("nongyongdi").setVisibility(true);
        return;
    }
    require(["esri/map", "esri/SpatialReference", "esri/geometry/Extent",
        "esri/layers/ArcGISDynamicMapServiceLayer", "esri/InfoTemplate",
        "esri/layers/WMTSLayer", "esri/layers/WMTSLayerInfo", "esri/layers/TileInfo",
        "esri/layers/FeatureLayer", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
        "esri/renderers/SimpleRenderer"
    ], function (Map, SpatialReference, Extent,
                 ArcGISDynamicMapServiceLayer, InfoTemplate,
                 WMTSLayer, WMTSLayerInfo, TileInfo,
                 FeatureLayer, SimpleFillSymbol, SimpleLineSymbol, Color,
                 SimpleRenderer) {

        /*var featureLayer = new FeatureLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/landuse_11/MapServer/0", {
         mode: FeatureLayer.MODE_SNAPSHOT,
         outFields: ["*"],
         opacity: 1,
         id: "nongyongdi"
         });
         //设置定义表达式
         //        featureLayer.setDefinitionExpression("CODE=11");
         //设置渲染
         var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([169, 169, 169, 0]), 1);
         var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color("#6FDE6B"));
         var renderer = new SimpleRenderer(defaultSymbol);
         featureLayer.setRenderer(renderer);
         */
        var layer = new esri.layers.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/landuse_11/MapServer", {
            id: "nongyongdi"
        });
        map.addLayer(layer);


    });//--require end
}

//污染来源企业
function updateQiye() {
    hideLayer();
    if (map.getLayer("qiyeCountryGraphicsLayer")) {
        map.getLayer("qiyeCountryGraphicsLayer").setVisibility(true);
    }
    if (map.getLayer("qiyeCountryFeatureLayer")) {
        map.getLayer("qiyeCountryFeatureLayer").setVisibility(true);
        return;
    }
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
            id: "qiyeCountryFeatureLayer"
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
 		
        featureLayer.on("click",function(evt){
        	window.location.href = "index.html#information?init=zhongdianqiye";
        });
        //添加点击事件
        /*featureLayer.on("click",function(evt){
         //高亮设置
         removeGraphic("provinceClick");
         var lineJson = {
         "paths":evt.graphic.geometry.rings,
         "spatialReference":{"wkid":4326}
         }
         var highPolyline = new Polyline(lineJson);
         var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
         var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
         //记录边界高亮
         provinceClick = highGraphic;
         map.graphics.add(highGraphic);
         //获取点击省份的PROV_CODE
         provinceCode = evt.graphic.attributes.PROV_CODE;
         //设置地图边界
         map.setExtent(evt.graphic.geometry.getExtent());
         //记录地图边界
         provinceExtent = evt.graphic.geometry.getExtent();
         //改变右上角按钮Text
         $("#province").html(evt.graphic.attributes.NAME);
         //显示右上角按钮
         $("#province").removeClass("none");
         //更新某一个省的点位图层
         updateProvince_1(true);
         });*/

        //添加鼠标进入事件
        /*featureLayer.on("mouse-over", function (evt) {
            removeGraphic("provinceHigh");
            var lineJson = {
                "paths": evt.graphic.geometry.rings,
                "spatialReference": {"wkid": 4326}
            }
            var highPolyline = new Polyline(lineJson);
            var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([252,78,42]), 2);
            var highGraphic = new Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
            map.graphics.add(highGraphic);
        })*/
        //添加鼠标移出事件
       /* featureLayer.on("mouse-out", function () {
            removeGraphic("provinceHigh");
        })*/

        featureLayer.on("graphic-node-add", function () {
            //加载动画结束
            addGuojie();
        })

        //ajax获取各省产粮油大县的数量
        var json = {industry: ""};
        ajaxPost('/seimp/pic/getYGHC1.do', json).done(function (result) {
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
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([247, 252, 245, 1]));
                    var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([229, 245, 224, 1]));
                    var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([199, 233, 192, 1]));
                    var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([161, 217, 155, 1]));
                    var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([116, 196, 118, 1]));
                    var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([65, 171, 93, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");


                    //更新图例
//					updateLegend(minCount,count);

                    for (var i = 0; i < data.length; i++) {
                        var currItem = data[i];
                        if (minCount <= currItem.count && currItem.count < minCount + count * 1) {
                            renderer.addValue(currItem.province, symbol1);
                        } else if (minCount + count * 1 <= currItem.count && currItem.count < minCount + count * 2) {
                            renderer.addValue(currItem.province, symbol2);
                        } else if (minCount + count * 2 <= currItem.count && currItem.count < minCount + count * 3) {
                            renderer.addValue(currItem.province, symbol3);
                        } else if (minCount + count * 3 <= currItem.count && currItem.count < minCount + count * 4) {
                            renderer.addValue(currItem.province, symbol4);
                        } else if (minCount + count * 4 <= currItem.count && currItem.count <= minCount + count * 5) {
                            renderer.addValue(currItem.province, symbol5);
                        } else if (minCount + count * 5 <= currItem.count && currItem.count <= minCount + count * 6) {
                            renderer.addValue(currItem.province, symbol6);
                        }
                    }
                    //为分省地图设置渲染
//                    featureLayer.setRenderer(renderer);
                    //将分省地图添加到地图上
                    map.addLayer(featureLayer, 2);
                    //分段渲染的底图加载完成之后，才能加载数字图层
                    featureLayer.on("update-end", function () {
                        initQiyeCountryCount(data);
                    })


                } else {//如果没有数据
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");
                    featureLayer.setRenderer(renderer);
                    //更新图例
                    updateLegend(0, 0);
                    map.addLayer(featureLayer, 2);
                    featureLayer.on("update-end", function () {//分段渲染的底图加载完成之后，才能加载分省饼图
                        initQiyeCountryCount(data);
                    })
                }
            }
        });//--ajax end
    });//-require end

}


//加载重点监管企业各省数字图层
function initQiyeCountryCount(data) {
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
        var graphicsLayer = new GraphicsLayer({id: "qiyeCountryGraphicsLayer"});
//        graphicsLayer.setMinScale(18489334.7159);
        //获取省界图层的Graphics
        var feaGraphics = map.getLayer("qiyeCountryFeatureLayer").graphics;
        //添加省名
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            var point = currFeaGraphic.geometry.getCentroid();
            //处理河北省
            if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                point = new Point([115.18, 38]);
            }
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

                    var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
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
        map.addLayer(graphicsLayer);

    });//--require end
}


//省级用户，某一个省的重点行业监管企业
//加载某一个省的所有市图层
function initQiyeProvince_1(){
	hideLayer();
    if (map.getLayer("qiyeCountryGraphicsLayer")) {
        map.getLayer("qiyeCountryGraphicsLayer").setVisibility(true);
    }
    if (map.getLayer("qiyeCountryFeatureLayer")) {
        map.getLayer("qiyeCountryFeatureLayer").setVisibility(true);
        return;
    }
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 //加载地图服务
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"qiyeCountryFeatureLayer"
	     });
		 
		 featureLayer.setDefinitionExpression("KIND_1 like '"+(provinceCode+"").substr(0, 2)+"%'");
		 
		 //加载市名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
		 
		 var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);
		 
		 //添加点击事件
         featureLayer.on("click",function(evt){
        	 window.location.href = "index.html#information?init=zhongdianqiye";
         });
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
		})
		//添加鼠标移出事件
		featureLayer.on("mouse-out",function(){
			removeGraphic("provinceHigh");
		})
		
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
		})
		 

	 	 //ajax获取某一个省的各个市的数量
		 var json = {industry:"",code:provinceCode};
		 ajaxPost('/seimp/pic/getYGHC2.do',json).done(function(result){
			if(result.status==0){//请求成功
				var data = result.data;
				if(result.data.length>0){
					
					//处理数据，获取各市数量的最大值最小值
					var minCount = 0;
					var maxCount = 0;
					for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.count<minCount){
							minCount = currItem.count;
						}
						if(currItem.count>maxCount){
							maxCount = currItem.count;
						}
					}
					//重新计算最大值
					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					provinceMinCount = minCount;
					provinceCount = count;
					
					//设置分市底图各个分段的symbol
			 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([247,252,245,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([229,245,224,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([199,233,192,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([161,217,155,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([116,196,118,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([65,171,93,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.code.substr(0, 4), symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.code.substr(0, 4), symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.code.substr(0, 4), symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.code.substr(0, 4), symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.code.substr(0, 4), symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.code.substr(0, 4), symbol6);
						}
					}
					//为分市地图设置渲染
//					featureLayer.setRenderer(renderer);
					//将分市地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initQiyeProvinceCount_1(data);
					})
					
					
				}else{//如果没有数据
					/*var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					featureLayer.setRenderer(renderer);*/
					
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
			 		renderer = new SimpleRenderer(defaultSymbol);
			 		featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initQiyeProvinceCount_1(data);
					})
				}
			}
		});//--ajax end
	});//-require end
}

//加载某一个省各市的数字图层
function initQiyeProvinceCount_1(data){
	require([
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
		"esri/geometry/Point",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
		SimpleMarkerSymbol, SimpleLineSymbol,
        PictureMarkerSymbol, CartographicLineSymbol, 
        Graphic, TextSymbol,GraphicsLayer,
        Point,
        Color, dom, on
  	){
		var graphicsLayer = new GraphicsLayer({id:"qiyeCountryGraphicsLayer"});
		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("qiyeCountryFeatureLayer").graphics;
		
		//添加市名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.KIND_1==currItem.code.substr(0,4)){
					
					var attributes = {
							countyCode:currItem.code,
							countyName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 24;
					if(currItem.count.toString().length==1){
						symbolSize = 24;
					}else if(currItem.count.toString().length==2){
						symbolSize = 30;
					}else if(currItem.count.toString().length==3){
						symbolSize = 40;
					}else if(currItem.count.toString().length==4){
						symbolSize = 50;
					}else if(currItem.count.toString().length==5){
						symbolSize = 60;
					}else{
						symbolSize = currItem.count.toString().length*12;
					}
					
					var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
					var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
					symbol2.font.setFamily("Times");
					symbol2.font.setSize("10pt");
					symbol2.font.setWeight(600);
					var graphic1 = new Graphic(point,symbol1,attributes);
					var graphic2 = new Graphic(point,symbol2,attributes);
					graphicsLayer.add(graphic1);
					graphicsLayer.add(graphic2);
				}
			}
		}
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//未利用地
function updateWeiliyong() {
    hideLayer();
    if (map.getLayer("unusedland")) {
        map.getLayer("unusedland").setVisibility(true);
        return;
    }
    require(["esri/map", "esri/SpatialReference", "esri/geometry/Extent",
        "esri/layers/ArcGISDynamicMapServiceLayer", "esri/InfoTemplate",
        "esri/layers/WMTSLayer", "esri/layers/WMTSLayerInfo", "esri/layers/TileInfo",
        "esri/layers/FeatureLayer", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
        "esri/renderers/SimpleRenderer"
    ], function (Map, SpatialReference, Extent,
                 ArcGISDynamicMapServiceLayer, InfoTemplate,
                 WMTSLayer, WMTSLayerInfo, TileInfo,
                 FeatureLayer, SimpleFillSymbol, SimpleLineSymbol, Color,
                 SimpleRenderer) {

        var layer = new esri.layers.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/landuse_67/MapServer", {
            id: "unusedland"
        });
        map.addLayer(layer);
    });//--require end
}

//工作推进
function updateGongzuoLayer() {
    hideLayer();
    if (map.getLayer("gongzuo")) {
        map.getLayer("gongzuo").setVisibility(true);
    }
    if (map.getLayer("gongzuoGraphicsLayer")) {
        map.getLayer("gongzuoGraphicsLayer").setVisibility(true);
        return;
    }
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
            id: "gongzuo"
        });

        //加载省名标签
        var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
        statesLabel.font.setSize("12pt");
        statesLabel.font.setWeight(700);
//        statesLabel.setOffset(20, -20);
        var labelClass = new LabelClass({
            "labelExpressionInfo": {"value": "{NAME}"},
            "useCodedValues": true,
            "labelPlacement": "below-right",
            "fieldInfos": [{fieldName: "NAME"}]
        });
        labelClass.symbol = statesLabel;
//        featureLayer.setLabelingInfo([labelClass]);

        featureLayer.on("graphic-node-add", function () {
            //加载动画结束
            addGuojie();
        })

        //ajax获取各省产粮油大县的数量
        var json = {};
        ajaxPost('/seimp//news/getGZTJ.do', json).done(function (result) {
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

                    //更新饼图
                    updateGongzuoEcharts(data);
                    gongzuoData = data;
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
                    //设置分省底图各个分段的symbol
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([247, 251, 255, 1]));
                    var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([222, 235, 247, 1]));
                    var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([198, 219, 239, 1]));
                    var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([158, 202, 225, 1]));
                    var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([107, 174, 214, 1]));
                    var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([66, 146, 198, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");

                    //更新图例
//					updateLegend(minCount,count);

                    for (var i = 0; i < data.length; i++) {
                        var currItem = data[i];
                        if (minCount <= currItem.count && currItem.count < minCount + count * 1) {
                            renderer.addValue(currItem.province, symbol1);
                        } else if (minCount + count * 1 <= currItem.count && currItem.count < minCount + count * 2) {
                            renderer.addValue(currItem.province, symbol2);
                        } else if (minCount + count * 2 <= currItem.count && currItem.count < minCount + count * 3) {
                            renderer.addValue(currItem.province, symbol3);
                        } else if (minCount + count * 3 <= currItem.count && currItem.count < minCount + count * 4) {
                            renderer.addValue(currItem.province, symbol4);
                        } else if (minCount + count * 4 <= currItem.count && currItem.count <= minCount + count * 5) {
                            renderer.addValue(currItem.province, symbol5);
                        } else if (minCount + count * 5 <= currItem.count && currItem.count <= minCount + count * 6) {
                            renderer.addValue(currItem.province, symbol6);
                        }
                    }
                    //为分省地图设置渲染
                    featureLayer.setRenderer(renderer);
                    //将分省地图添加到地图上
                    map.addLayer(featureLayer, 2);

                    //分段渲染的底图加载完成之后，才能加载数字图层
                    featureLayer.on("update-end", function () {
                        initGongzuoCountryCount(data);
                    })

                } else {//如果没有数据
                    var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([51, 51, 51]), 0.1);
                    var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outlineSymbol, new Color([217, 217, 217, 1]));
                    renderer = new UniqueValueRenderer(defaultSymbol, "PROV_CODE");
                    featureLayer.setRenderer(renderer);
                    //更新图例
                    map.addLayer(featureLayer, 2);
                    featureLayer.on("update-end", function () {//分段渲染的底图加载完成之后，才能加载分省饼图
                        updatePieLayer();
                    })

                    //分段渲染的底图加载完成之后，才能加载数字图层
                    featureLayer.on("update-end", function () {
                        initGongzuoCountryCount(data);
                    })
                }
            }
        });//--ajax end
    });//-require end

}


//工作推进数字图层
function initGongzuoCountryCount(data) {
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
        var graphicsLayer = new GraphicsLayer({id: "gongzuoGraphicsLayer"});
        graphicsLayer.setMinScale(18489334.7159);
        //获取省界图层的Graphics
        var feaGraphics = map.getLayer("gongzuo").graphics;

        //添加省名
        for (var i = 0; i < feaGraphics.length; i++) {
            var currFeaGraphic = feaGraphics[i];
            var point = currFeaGraphic.geometry.getCentroid();
            //处理河北省
            if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                point = new Point([115.18, 38]);
            }
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

                    var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
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
        map.addLayer(graphicsLayer);

    });//--require end
}

//省级用户，某一个省的工作推进
//加载某一个省的所有市图层
function updateGongzuoProvinceLayer(){
	hideLayer();
    if (map.getLayer("gongzuo")) {
        map.getLayer("gongzuo").setVisibility(true);
    }
    if (map.getLayer("gongzuoGraphicsLayer")) {
        map.getLayer("gongzuoGraphicsLayer").setVisibility(true);
        return;
    }
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 //加载地图服务
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
           outFields: ["*"],
           id:"gongzuo"
	     });
		 
		 featureLayer.setDefinitionExpression("KIND_1 like '"+(provinceCode+"").substr(0, 2)+"%'");
		 
		 //加载市名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
		 
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
		})
		//添加鼠标移出事件
		featureLayer.on("mouse-out",function(){
			removeGraphic("provinceHigh");
		})
		
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
		})
		 

	 	 //ajax获取某一个省的各个市的数量
		 var json = {provinceCode:provinceCode};
		 ajaxPost('/seimp/news/getGZTJOfProvince.do',json).done(function(result){
			if(result.status==0){//请求成功
				var data = result.data;
				//更新饼图
                updateGongzuoEcharts(data);
                gongzuoData = data;
				if(result.data.length>0){
					
					//更新饼图
//                    updateGongzuoEcharts(data);
//                    gongzuoData = data;
					
					//处理数据，获取各市数量的最大值最小值
					var minCount = 0;
					var maxCount = 0;
					for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.count<minCount){
							minCount = currItem.count;
						}
						if(currItem.count>maxCount){
							maxCount = currItem.count;
						}
					}
					//重新计算最大值
					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					provinceMinCount = minCount;
					provinceCount = count;
					
					//设置分市底图各个分段的symbol
			 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([247,252,245,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([229,245,224,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([199,233,192,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([161,217,155,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([116,196,118,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([65,171,93,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.province.substr(0, 4), symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.province.substr(0, 4), symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.province.substr(0, 4), symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.province.substr(0, 4), symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.province.substr(0, 4), symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.province.substr(0, 4), symbol6);
						}
					}
					//为分市地图设置渲染
					featureLayer.setRenderer(renderer);
					//将分市地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initGongzuoProvinceCount(data);
					})
					
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initGongzuoProvinceCount(data);
					})
				}
			}
		});//--ajax end
	});//-require end
}

//加载某一个省各市的数字图层
function initGongzuoProvinceCount(data){
	require([
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
		"esri/geometry/Point",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
		SimpleMarkerSymbol, SimpleLineSymbol,
      PictureMarkerSymbol, CartographicLineSymbol, 
      Graphic, TextSymbol,GraphicsLayer,
      Point,
      Color, dom, on
	){
		var graphicsLayer = new GraphicsLayer({id:"gongzuoGraphicsLayer"});
		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("gongzuo").graphics;
		
		//添加市名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.KIND_1==currItem.province.substr(0,4)){
					
					var attributes = {
							countyCode:currItem.code,
							countyName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 24;
					if(currItem.count.toString().length==1){
						symbolSize = 24;
					}else if(currItem.count.toString().length==2){
						symbolSize = 30;
					}else if(currItem.count.toString().length==3){
						symbolSize = 40;
					}else if(currItem.count.toString().length==4){
						symbolSize = 50;
					}else if(currItem.count.toString().length==5){
						symbolSize = 60;
					}else{
						symbolSize = currItem.count.toString().length*12;
					}
					
					var symbol1 = new PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
					var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
					symbol2.font.setFamily("Times");
					symbol2.font.setSize("10pt");
					symbol2.font.setWeight(600);
					var graphic1 = new Graphic(point,symbol1,attributes);
					var graphic2 = new Graphic(point,symbol2,attributes);
					graphicsLayer.add(graphic1);
					graphicsLayer.add(graphic2);
				}
			}
		}
		map.addLayer(graphicsLayer);
		
	});//--require end
}


/************获取图标文件名称*****************/
function getImgName(industryName) {
    industryName = industryName.replace(/[ ]/g, "");
    industryName = industryName.replace(/[\r\n]/g, "");
    for (var i = 0; i < allQiYeIndustryArr.length; i++) {
        var currItem = allQiYeIndustryArr[i];
        var ids = currItem.id;
        var idArr = ids.split(",");
        for (var j = 0; j < idArr.length; j++) {
            var currId = idArr[j];
            if (industryName == currId) {
                currItem.name;
                return i + 1;
            }
        }
    }
    return "default";
}

//隐藏图层
function hideLayer() {
    var idArr = ["dikuaiCountryFeatureLayer", "dikuaiCountryGraphicsLayer", "nongyongdi", "qiyeCountryGraphicsLayer", "qiyeCountryFeatureLayer", "unusedland", "gongzuo", "gongzuoGraphicsLayer"];
    for (var i = 0; i < idArr.length; i++) {
        var currItem = idArr[i];
        if (map.getLayer(currItem)) {
            map.getLayer(currItem).setVisibility(false);
        }
    }
    //隐藏图例
    $("#mylegend").hide();
}

//图例隐藏显示
function portalShowHide() {
    $('#mylegend .sldeDown').slideToggle("slow")
    if ($('#mylegend small img').attr('src') == 'img/arrow_down.png') {
        $('#mylegend small img').attr('src', 'img/arrow_up.png')
    } else {
        $('#mylegend small img').attr('src', 'img/arrow_down.png')
    }
}

//生成图例
function updateLegend(minCount, count) {
    $("#ditu li:eq(0) div:eq(1)").html(minCount + "-" + parseInt(minCount + count * 1));
    $("#ditu li:eq(1) div:eq(1)").html(parseInt(minCount + count * 1) + "-" + parseInt(minCount + count * 2));
    $("#ditu li:eq(2) div:eq(1)").html(parseInt(minCount + count * 2) + "-" + parseInt(minCount + count * 3));
    $("#ditu li:eq(3) div:eq(1)").html(parseInt(minCount + count * 3) + "-" + parseInt(minCount + count * 4));
    $("#ditu li:eq(4) div:eq(1)").html(parseInt(minCount + count * 4) + "-" + parseInt(minCount + count * 5));
    $("#ditu li:eq(5) div:eq(1)").html(parseInt(minCount + count * 5) + "-" + parseInt(minCount + count * 6));
}

//更新图例颜色
function updateLegendColor(data, name) {
    //改变图例标题
    $("#ditu").siblings("p").html(name);
    //改变图例颜色
    $("#ditu li:eq(0) div:eq(0)").css("background", data[0]);
    $("#ditu li:eq(1) div:eq(0)").css("background", data[1]);
    $("#ditu li:eq(2) div:eq(0)").css("background", data[2]);
    $("#ditu li:eq(3) div:eq(0)").css("background", data[3]);
    $("#ditu li:eq(4) div:eq(0)").css("background", data[4]);
    $("#ditu li:eq(5) div:eq(0)").css("background", data[5]);
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

/*获取新闻*/
function getNews() {
    ajaxPost("/seimp/news/getNews", {type: "0", pageNumber: 0, pageSize: 4}).done(function (data) {
        if (data.status == 0) {
            var maphtml = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
//                if (i == 0) {
//                    if (newItem.pics.length > 0) {
//                        maphtml = "<li class='clear important-li'><a href=\"#newDetails?type=" + newItem.type + "&id=" + newItem.id + "\"><div class='lt important-img'>" +
//                            "<img src='" + newItem.pics[0].URL + "' alt=''>" +
//                            "</div><div class='lt important-word'><h3 class='newsListTitle'><span class='pull-left' style='max-width: 85%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'>" + newItem.title + "</span>";
//                        if (newItem.top == '0') {
//                            maphtml += "<img src='img/new_top.png' class='img-responsive' height='30px' style='position:relative;left:10px;margin-top: 0px;'>";
//                        }
//                        maphtml += "</h3><p>" + delHtmlTag(newItem.content).substring(0, 110) + "</p></div></li>";
//                    } else {
//                        maphtml = "<li class='clear important-li'><a href=\"#newDetails?type=" + newItem.type + "&id=" + newItem.id + "\">" +
//                            "<div class='lt important-word' style='width: 100%'><h3 class='newsListTitle'><span class='pull-left' style='max-width: 85%;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;'>" + newItem.title + "</span>";
//                        if (newItem.top == '0') {
//                            maphtml += "<img src='img/new_top.png' class='img-responsive' height='30px' style='position:relative;left:10px;margin-top: 0px;'>";
//                        }
//                        maphtml += "</h3><p>" + delHtmlTag(newItem.content).substring(0, 160) + "</p></div></li>";
//                    }
              //  } else {
                    maphtml += "<li class='clear news-li'><a href=\"#newDetails?type=" + newItem.type + "&id=" + newItem.id + "\" title='" + newItem.title + "'><img src='img/news/news-cell.png' alt='' class='lt'><span class='lt xwzxlt'>"
                        + newItem.title;
                    if (newItem.top == '0') {
                        maphtml += "</span><img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px' ><span class='rt'>" + getMyDate(newItem.writeDate) + "</span></a></li>";
                    }else{
                        maphtml += "</span><span class='rt'>" + getMyDate(newItem.writeDate) + "</span></a></li>";
                    }
              //  }
            }
            $(".xwzx ul").html(maphtml);
        }
    });
    ajaxPost("/seimp/news/getMetadataList", {}).done(function (data) {
        var zssjhtml = "";
        var zrsjhtml = "";
        for (var i = 0; i < data.data.hotest.length; i++) {
            var newItem = data.data.hotest[i];
            /*
            zrsjhtml += "<li class='clear news-li'><a  ><img src='img/news/news-cell.png' alt='' class='lt'><span class='lt zxsjlt'>" + newItem.name +
                "【<a style='text-decoration: underline' href='#data?type=1&dataID=" + newItem.id + "&dataName=" + newItem.name + "'>" + formatNumber(newItem.serviceAccount + "") + "</a>条】" + "</span><span class='rt'>访问量：" + newItem.visitAccount + "</span></a></li>";
                */
            zrsjhtml += "<li class='clear news-li'><a  ><img src='img/news/news-cell.png' alt='' class='lt'><span class='lt zxsjlt'>" + newItem.name +
//            "【<a style='text-decoration: underline' href=#data?gotoFunction=toMetaDataInfoPage('" + newItem.id + "','De1') >" + formatNumber(newItem.serviceAccount + "") + "</a>条】" + "</span><span class='rt'>访问量：" + newItem.VISITCOUNT + "</span></a></li>";
            "【<a style='text-decoration: underline' href=#data?toMetaDataInfoPagePar1=" + newItem.id + "&toMetaDataInfoPagePar2=De1 >" + formatNumber(newItem.serviceAccount + "") + "</a>条】" + "</span><span class='rt'>访问量：" + newItem.VISITCOUNT + "</span></a></li>";
        }
        /**/
        for (var j = 0; j < data.data.latest.length; j++) {
            var newItem1 = data.data.latest[j];
            /*
            zssjhtml += "<li class='clear news-li'><a  ><img src='img/news/news-cell.png' alt='' class='lt'><span class='lt zrsjlt'>" + newItem1.name +
                "【<a style='text-decoration: underline' href='#data?type=1&dataID=" + newItem1.id + "&dataName=" + newItem1.name + "'>" + formatNumber(newItem1.serviceAccount + "") + "</a>条】" + "</span><span class='rt'>" + getMyDate(newItem1.dataTime) + "</span></a></li>";
                */
            zssjhtml += "<li class='clear news-li'><a  ><img src='img/news/news-cell.png' alt='' class='lt'><span class='lt zrsjlt'>" + newItem1.name +
//            "【<a style='text-decoration: underline' href=#data?gotoFunction=toMetaDataInfoPage('" + newItem1.id + "','De1')>" + formatNumber(newItem1.serviceAccount + "") + "</a>条】" + "</span><span class='rt'>" + getMyDate(newItem1.dataTime) + "</span></a></li>";
            "【<a style='text-decoration: underline' href=#data?toMetaDataInfoPagePar1=" + newItem.id + "&toMetaDataInfoPagePar2=De1 >" + formatNumber(newItem1.serviceAccount + "") + "</a>条】" + "</span><span class='rt'>" + getMyDate(newItem1.dataTime) + "</span></a></li>";
        }
        $(".zxsj ul").html(zssjhtml);
        $(".zrsj ul").html(zrsjhtml);
    });
}


//点击数据交换，跳转
function gotoData(par) {
//    window.location.href = "#data?type=2&dataID=" + par;
//	window.location.href = "#data?gotoFunction=listSearch1('" + par + "')";
	window.location.href = "#data?listSearch1Par=" + par + "";
    
}
function getMyDate(str) {
    var oDate = new Date(str),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oTime = oYear + '-' + getzf(oMonth) + '-' + getzf(oDay);//最后拼接时间
    return oTime;
};

function getzf(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}


//获取污染地块分布统计图的数据
function wurandikuaiEcharts() {
    var json = {};
    ajaxPost("/seimp/warn/staWurandikuai.do", json).done(function (result) {
        if (result.status == 0) {
            var data = result.data;
            updatewurandikuaiEcharts(data);
            var total=0;
            for(var i = 0;i<data.length;i++){
                total+=data[i].SUM;
            }
         //   var total=data[0].SUM+data[1].SUM+data[2].SUM+data[3].SUM+data[4].SUM+data[5].SUM+data[6].SUM;
            $(".doughnut_tip").empty();
            $(".doughnut_tip").append("<div>"+total+"<span>块</span></div>")
//            $(".doughnut_tip3").empty();
//            $(".doughnut_tip3").append("<p>上报地块  TOP10</p>")
//            $(".doughnut_tip4").empty();
//            $(".doughnut_tip4").append("<p>地块所属行业分布</p>")
        }
    });
}
//获取污染地块分布统计图的数据
function wurandikuaiEchartsProvince() {
	 /*var json = {industry:"",code:provinceCode};
	 ajaxPost('/seimp/pic/getWrdk2.do',json).done(function(result){
		if (result.status == 0) {
			var data = result.data;
			updatewurandikuaiEcharts(data);
		}
	});*/

    var json = {};
    ajaxPost("/seimp/warn/staWurandikuai.do", json).done(function (result) {
        if (result.status == 0) {
            var data = result.data;
            updatewurandikuaiEcharts(data);
            
            //更新数字
            var total=0;
            for(var i = 0;i<data.length;i++){
                total+=data[i].SUM;
            }
         //   var total=data[0].SUM+data[1].SUM+data[2].SUM+data[3].SUM+data[4].SUM+data[5].SUM+data[6].SUM;
            $(".doughnut_tip").empty();
            $(".doughnut_tip").append("<div>"+total+"<span>块</span></div>")
//            $(".doughnut_tip3").empty();
//            $(".doughnut_tip3").append("<p>上报地块  TOP10</p>")
//            $(".doughnut_tip4").empty();
//            $(".doughnut_tip4").append("<p>地块所属行业分布</p>")
        }
    });
}

//更新污染地块分布统计图
function updatewurandikuaiEcharts(data) {
	
    var seriesData = [{value: 0, name: "疑似污染地块"}, {value: 0, name: "非污染地块"},{value:0,name:'污染地块'}];
    if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var currItem = data[i];
            console.log(data)
            if (currItem.POLLUETED) {
            	if(currItem.POLLUETED=="0"){
            		seriesData[1].value = seriesData[1].value + currItem.SUM;
            	}
            	if(currItem.POLLUETED=="1"){
            		seriesData[2].value = seriesData[2].value + currItem.SUM;
            	}
            } else {
                seriesData[0].value = seriesData[0].value + currItem.SUM;
            }
        }
    }
    option = {
        title: {
            text: '',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
//            formatter: "{a} <br/>{b} : {c} ({d}%)"
            formatter: function (params){                                                                                                                       
	            var result = params.seriesName + '<br>'                                                                                                            
	                + params.marker
	                +params.name + ': ' + params.value + "(块)(" + params.percent + "%)";                                                                                             
	            return result;                                                                                                                                  
	        }
        },
        legend: {
        	orient: 'horizontal',
            left: 'left',
            top: '80%',
            data: ['疑似污染地块',"非污染地块",'污染地块']
        },
        color:["#2f4554","#61a0a8","#c23531"],
        series: [
            {
                name: '上报地块数量分布',
                type: 'pie',
                radius: '46%',
                center: ['50%', '35%'],
                label: {
                    normal: {
                        formatter: '{d}% ',
                        padding:0
                    }
                },
                data: seriesData,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
//    myChart.dispose();
//    myChart = echarts.init(document.getElementById('doughnut'));
//    myChart.setOption(option);

}

function nongyongdiEcharts() {
    option = {
        title: {
            text: '农用地分省面积排行',
            x: 'center'
        },
        color: ['#6FDE6B'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: "{a} <br/>{b} : {c}  万平方公里"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'value',
                name: "万平方公里",
                nameLocation: 'middle',
                nameGap: 20
            }

        ],
        yAxis: [
            {
                type: 'category',
                data: ["上海市", "江西省", "广东省", "湖南省", "四川省", '广西壮族自治区', '浙江省', '湖北省', '安徽省', '江苏省'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        series: [
            {
                name: '农用地面积',
                type: 'bar',
                barWidth: '60%',
                data: [3.68, 3.69, 3.91, 4.07, 4.14, 4.61, 5.70, 8.12, 9.64, 10.19]
            }
        ]
    };
//    myChart.dispose();
//    myChart = echarts.init(document.getElementById('doughnut'));
//    myChart.setOption(option);

}

//获取重点行业监管企业分布统计图的数据
function wuranlaiyuanqiye() {
    var json = {};
    ajaxPost("/seimp/warn/staKeyIndustry.do", json).done(function (result) {
        if (result.status == 0) {
            var data = result.data;
            updatewuranlaiyuanqiye(data);
            console.log(data)
            $(".doughnut_tip").empty();
            $(".doughnut_tip").append("<div>"+data.total+"<span>家</span></div>")
            
        }
    });
}
//获取重点行业监管企业分布统计图的数据
function wuranlaiyuanqiyeProvince() {
	 /*var json = {industry:"",code:provinceCode};
	 ajaxPost('/seimp/pic/getYGHC2.do',json).done(function(result){
		if (result.status == 0) {
			var data = result.data;
			updatewuranlaiyuanqiye(data);
		}
	});*/

    var json = {};
    ajaxPost("/seimp/warn/staKeyIndustry.do", json).done(function (result) {
        if (result.status == 0) {
            var data = result.data;
            updatewuranlaiyuanqiye(data);
            console.log(data)
            $(".doughnut_tip").empty();
            $(".doughnut_tip").append("<div>"+data.total+"<span>家</span></div>")
           
        }
    });
}

//更新重点行业监管企业分布统计图
function updatewuranlaiyuanqiye(data) {
    var seriesData = [{value: handleNullToZero(data['有色金属矿采选']), name: '有色金属矿采选'},
        {value: handleNullToZero(data['有色金属冶炼']), name: '有色金属冶炼'},
        {value: handleNullToZero(data['石油开采']), name: '石油开采'},
        {value: handleNullToZero(data['石油加工']), name: '石油加工'},
        {value: handleNullToZero(data['化工']), name: '化工'},
        {value: handleNullToZero(data['焦化']), name: '焦化'},
        {value: handleNullToZero(data['电镀']), name: '电镀'},
        {value: handleNullToZero(data['制革']), name: '制革'}]
    option = {
        title: {
            text: '',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
//            formatter: "{a} <br/>{b} : {c} ({d}%)",
        	formatter: function (params){                                                                                                                       
	            var result = params.seriesName + '<br>'                                                                                                            
	                + params.marker
	                +params.name + ': ' + params.value + "(家)(" + params.percent + "%)";                                                                                             
	            return result;                                                                                                                                  
	        }
        },
        color: ['#B22BA4', '#95A03B', '#7E4B1E', '#329334', '#1296DB', '#903C6E', '#6F56CC', '#749F83'],
        legend: {
            orient: 'vertical',
            left: 'left',
            top: '60%',
            width:10,
            data: ['有色金属矿采选' , '有色金属冶炼', '石油开采', '石油加工', '化工'
                   , '焦化', '电镀', '制革'
            ]
        },
        series: [
            {
                name: '重点行业总监管企业分布',
                type: 'pie',
                radius: '42%',
                center: ['50%', '30%'],
                label: {
                    normal: {
                        formatter: '{d}% ',
                        padding:0
                    }
                },
                labelLine:{
                	normal:{
                    	length:5,
                    	length2:5
                	}
                },
                data: seriesData,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
//    myChart.dispose();
//    myChart = echarts.init(document.getElementById('doughnut'));
//    myChart.setOption(option);

}


function weiliyongdiEcharts() {
    option = {
        title: {
            text: '未利用地分省面积排行',
            x: 'center'
        },
        color: ['#B8BB60'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: "{a} <br/>{b} : {c}  万平方公里"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'value',
                name: "万平方公里",
                nameLocation: 'middle',
                nameGap: 20
            }
        ],
        yAxis: [
            {
                type: 'category',
                data: ['陕西省', '台湾省', '甘肃省', '四川省', '西藏自治区', '新疆维吾尔自治区', '青海省'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        series: [
            {
                name: '未利用地面积',
                type: 'bar',
                barWidth: '60%',
                data: [0.0012, 0.0499, 0.3994, 0.8076, 6.7398, 8.9781, 9.8067]
            }
        ]
    };
//    myChart.dispose();
//    myChart = echarts.init(document.getElementById('doughnut'));
//    myChart.setOption(option);

}

//更新工作推进统计图
function updateGongzuoEcharts(data) {
    var ydata = [];
    var sdata = [];
    var length = data.length <= 10 ? data.length : 10;
    if (data.length > 0) {
        for (var i = length - 1; i >= 0; i--) {
            var currItem = data[i];
            ydata.push(currItem.name);
            sdata.push(currItem.count);
        }
    }
    option = {
        title: {
            text: '各省工作推进情况排行',
            x: 'center'
        },
        color: ['#41ae76'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: "{a} <br/>{b} : {c} 条"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'value',
                name: "条",
                nameLocation: 'middle',
                nameGap: 20
            }
        ],
        yAxis: [
            {
                type: 'category',
                data: ydata,
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        series: [
            {
                name: '新闻资讯',
                type: 'bar',
                barWidth: '60%',
                data: sdata
            }
        ]
    };
//    myChart.dispose();
//    myChart = echarts.init(document.getElementById('doughnut'));
//    myChart.setOption(option);
}


/*** 点击污染物超标率 ****/
//$("#dwcb").click(function(){
//	scrollTos();
//	window.location.href = "index.html#warn";
//});

/**平台共建单位**/
$(".footDiv").click(function () {
    $(".footDiv").removeClass("map-table-color img-border");
    $(this).addClass("map-table-color img-border");
});

/**平台共建单位**/
/*$("#ptgjdw").click(function(){
 $(".xtgl").hide();
 $(".ptgjdw").show();

 })

 $("#xtgl").click(function(){
 $(".ptgjdw").hide();
 $(".xtgl").show();
 })*/

/**系统管理**/



/*获取评估分析统计数据*/
function getAnalyse() {
	$.ajax({
	     type: 'POST',
	     url: "/seimp/warn/getAnalyzeSta" ,
	     success: function(res){
	    	 if(res.msg=="success"&&res.status=="0"){
	    		 console.log(res.data);
	    		 for(var i=0;i<res.data.length;i++){
	    			 	if(res.data[0].name="污染物点位超标率"){
	    			 		$("#dwcb i").html(res.data[0].total);
	    			 	}
	    		 		 if(res.data[1].name="污染地块分布"){
	    		 			$("#wrdk i").html(res.data[1].total);
	    		 		 }
	    		 		if(res.data[2].name="污染企业名录"){
	    		 			$("#qyml i").html(res.data[2].total);
	    		 		 }
	    		 		if(res.data[3].name="污染舆情监测"){
	    		 			$("#yqjc i").html(res.data[3].total);
	    		 		 }
	    		 	
	    		 }
	    		
	    	 }
	    	
	     } 
	});
}
getAnalyse()

/**
 * 站内统计
 */
function getVisitStatisData(){
	var json = {};
    ajaxPost("/seimp/portal/getVisitStatisData.do", json).done(function (result) {
        if (result.status == 0) {
            var data = result.data;
            $("#visitStatis span.span1").text(data[0].count);
            $("#visitStatis span.span2").text(data[1].count);
            $("#visitStatis span.span3").text(data[2].count);
            $("#visitStatis span.span4").text(data[3].count);
        }
    });
}
getVisitStatisData();


//初始化轮播
$('#index-slide').carousel('pause')

getImg()
function getImg() {
    var url = '/seimp/news/getPics'
    ajaxPost(url).done(function (res) {
    	console.log(res)
        $.each(res.data, function (key, val) {
            if (val.pics.length > 0) {
            	console.log(val.title)
                var dom = '';
                dom += '<div class="item" style="height:100%;width:100%;position: relative;" onclick="getDetail(' + val.id + ')">'
                dom += '<img  src=' + val.pics[0].URL + ' alt="" style="position: absolute;top: 50%;left: 50%;transform: translateX(-50%) translateY(-50%);">'
                dom += '<div class="carousel-caption">'+val.title+'</div>'
                dom += '</div>'
                $('.carousel-inner').append(dom);
                var dom1 = ''
                dom1 += '<li data-target="#index-slide" data-slide-to=' + key + ' class=""></li>'
                $('.carousel-indicators').append(dom1)
            }
        })
        $('.item').eq(0).addClass('active')
        $('.carousel-indicators li').eq(0).addClass('active')
    })
}

function getDetail(id) {
    window.location.href = "#newDetails?type=8&id=" + id;
}

//污染地块左侧统计图
var chart1 = null;
var chart2 = null;
var chart3 = null;
function wrdkLeftUpdate(){
	//更新标题
	$(".doughnut_tip3").html("上报地块TOP10");
	//$(".doughnut_tip4").html("地块所处阶段分布");
	$("#barPortal").css("height","270px");
	//$(".doughnut_tip4").show();
	$("#piePortal").show();
	
	
	 if(userLevel==null||userLevel==0||userLevel==1){
		 ajaxPost("/seimp/portal/wrdkByProvince.do", {}).done(function (result) {
	        if (result.status == 0) {
	        	//处理数据
	        	var names = [];
	        	var counts=[];
	        	var maxLength = 10;
	        	var startIndex = 0;
	        	if(maxLength<result.data.length){
	        		startIndex = result.data.length - 10;
	        	}
	            for (var i = startIndex; i < result.data.length; i++) {
					var currItem = result.data[i];
					names.push(currItem.NAME);
	                counts.push(currItem.COUNT);
				}
	    	   

	    		option = {
	    		    title: {
	    		        text: '',
	    		        subtext: ''
	    		    },
	    		    tooltip: {
	    		        trigger: 'axis',
	    		        axisPointer: {
	    		            type: 'shadow'
	    		        },
	    		        formatter: function (params){                                                                                                                       
	                        var result = params[0].name + '<br>'                                                                                                            
	                            +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
	                            +params[0].seriesName + ': ' + params[0].value + "(块)";                                                                                             
	                        return result;                                                                                                                                  
	                    }
	    		    },
	    		    grid: {
	    		        left: '3%',
	    		        right: '22%',
	    		        bottom: '3%',
	    		        containLabel: true
	    		    },
	    		    xAxis: {
	    		        type: 'value',
	    		        boundaryGap: [0, 0.01],
	    		        name : '单位/块'
	    		    },
	    		    yAxis: {
	    		        type: 'category',
	    		        data : names,
	    		        name : '省份名称'
	    		        
	    		    },
	    		    series: [
	    		        {
	    		            name: '上报地块',
	    		            type: 'bar',
	    		            itemStyle:{
	    		                normal:{color:'#5b9bd5'}
	    		            },
	    		            barWidth:10,
	    		            data:counts
	    		        }
	    		    ]
	    		};
	    		if(chart1){
	    			chart1.dispose();
	    		}
	    		chart1 = echarts.init(document.getElementById('barPortal'));
	    		//使用刚指定的配置项和数据显示图表。
	    		 chart1.setOption(option);	
	        	
	        	
	        }
		 })
     }else if(userLevel==2){
    	 ajaxPost("/seimp/portal/wrdkByCity.do", {}).done(function (result) {
 	        if (result.status == 0) {
 	        	if (result.status == 0) {
 		        	//处理数据
 		        	var names = [];
 		        	var counts=[];
 		        	var maxLength = 10;
 		        	var startIndex = 0;
 		        	if(maxLength<result.data.length){
 		        		startIndex = result.data.length - 10;
 		        	}
 		            for (var i = startIndex; i < result.data.length; i++) {
 						var currItem = result.data[i];
 						names.push(currItem.NAME);
 		                counts.push(currItem.COUNT);
 					}
 		    	   

 		    		option = {
 		    		    title: {
 		    		        text: '',
 		    		        subtext: ''
 		    		    },
 		    		    tooltip: {
 		    		        trigger: 'axis',
 		    		        axisPointer: {
 		    		            type: 'shadow'
 		    		        },
 		    		        formatter: function (params){                                                                                                                       
 		                        var result = params[0].name + '<br>'                                                                                                            
 		                            +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
 		                            +params[0].seriesName + ': ' + params[0].value + "(块)";                                                                                             
 		                        return result;                                                                                                                                  
 		                    }
 		    		    },
 		    		    grid: {
 		    		        left: '3%',
 		    		        right: '22%',
 		    		        bottom: '3%',
 		    		        containLabel: true
 		    		    },
 		    		    xAxis: {
 		    		        type: 'value',
 		    		        boundaryGap: [0, 0.01],
 		    		        name : '单位/块'
 		    		    },
 		    		    yAxis: {
 		    		        type: 'category',
 		    		        data : names,
 		    		        name : '市区名称'
 		    		        
 		    		    },
 		    		    series: [
 		    		        {
 		    		            name: '上报地块',
 		    		            type: 'bar',
 		    		            itemStyle:{
 		    		                normal:{color:'#5b9bd5'}
 		    		            },
 		    		            barWidth:10,
 		    		            data:counts
 		    		        }
 		    		    ]
 		    		};
 		    		if(chart1){
 		    			chart1.dispose();
 		    		}
 		    		chart1 = echarts.init(document.getElementById('barPortal'));
 		    		//使用刚指定的配置项和数据显示图表。
 		    		chart1.setOption(option);	
 		        	
 		        	
 		        }
 	        }
 		 })
     }
	 var scjdbmObj = {
				S0 : '疑似地块',
				S1 : '初步调查',
				S2 : '详细调查',
				S3 : '风险评估',
				S4 : '风险管控',
				S5 : '土壤修复与治理',
				S6 : '土壤修复与治理评估'
	 }
	 ajaxPost("/seimp/portal/wrdkByScjdbm.do", {}).done(function (result) {
        if (result.status == 0) {
        	var data = result.data;
        	var seriesData = [];
        	var names = [];
            for (var i = 0; i < data.length; i++) {
                var currItem = data[i];
                if(currItem.NAME){
                	seriesData.push({name:scjdbmObj[currItem.NAME],value:currItem.COUNT})
                	names.push(scjdbmObj[currItem.NAME]);
                }
            }
            option = {
                title: {
                    text: '',
                    x: 'center'
                },
                tooltip: {
                    trigger: 'item',
//                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                    formatter: function (params){                                                                                                                       
        	            var result = params.seriesName + '<br>'                                                                                                            
        	                + params.marker
        	                +params.name + ': ' + params.value + "(块)(" + params.percent + "%)";                                                                                             
        	            return result;                                                                                                                                  
        	        }
                },
                /*legend: {
                	orient: 'horizontal',
                    left: 'left',
                    top: '70%',
                    data: names
                },*/
//                color:["#2f4554","#61a0a8","#c23531"],
                series: [
                    {
                        name: '地块所处阶段分布',
                        type: 'pie',
                        radius: ['20%', '30%'],
                        center: ['50%', '50%'],
                        label: {
                            normal: {
                                formatter: '{b}({d}%)',
                                padding:0
                            }
                        },
                        data: seriesData,
                        
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            if(chart2){
            	chart2.dispose();
	    	}
            chart2 = echarts.init(document.getElementById('piePortal'));
            chart2.setOption(option);
        }
	 })
	 ajaxPost("/seimp/portal/wrdkByFxjb.do", {}).done(function (result) {
        if (result.status == 0) {
        	var data = result.data;
        	var seriesData = [];
        	var names = [];
            for (var i = 0; i < data.length; i++) {
                var currItem = data[i];
                if(currItem.NAME){
                	seriesData.push({name:currItem.NAME,value:currItem.COUNT})
                	names.push(currItem.NAME);
                }
            }
            option = {
                title: {
                    text: '',
                    x: 'center'
                },
                tooltip: {
                    trigger: 'item',
//                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                    formatter: function (params){                                                                                                                       
        	            var result = params.seriesName + '<br>'                                                                                                            
        	                + params.marker
        	                +params.name + ': ' + params.value + "(块)(" + params.percent + "%)";                                                                                             
        	            return result;                                                                                                                                  
        	        }
                },
                /*legend: {
                	orient: 'horizontal',
                    left: 'left',
                    top: '80%',
                    data: names
                },*/
//                color:["#2f4554","#61a0a8","#c23531"],
                series: [
                    {
                        name: '上报地块风险分布',
                        type: 'pie',
                        radius: '40%',
                        center: ['50%', '45%'],
                        label: {
                            normal: {
                                formatter: '{b}({d}%)',
                                padding:0
                            }
                        },
                        data: seriesData,
                        roseType : 'radius',
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            if(chart3){
            	chart3.dispose();
	    	}
            chart3 = echarts.init(document.getElementById('doughnut'));
            chart3.setOption(option);
        }
	 })
}




function qyLeftUpdate(){
	//更新标题
	$(".doughnut_tip3").html("重点监管企业TOP10");
	//$(".doughnut_tip4").html("重点监管企业所属行业分布");
	$("#barPortal").css("height","548px");
	//$(".doughnut_tip4").hide();
	$("#piePortal").hide();
	
	 if(userLevel==null||userLevel==0||userLevel==1){
		 ajaxPost("/seimp/portal/qyByProvince.do", {}).done(function (result) {
	        if (result.status == 0) {
		        	//处理数据
		        	var names = [];
		        	var counts=[];
		        	var maxLength = 10;
		        	var startIndex = 0;
		        	if(maxLength<result.data.length){
		        		startIndex = result.data.length - 10;
		        	}
		            for (var i = startIndex; i < result.data.length; i++) {
						var currItem = result.data[i];
						names.push(currItem.NAME);
		                counts.push(currItem.COUNT);
					}
		    	   

		    		option = {
		    		    title: {
		    		        text: '',
		    		        subtext: ''
		    		    },
		    		    tooltip: {
		    		        trigger: 'axis',
		    		        axisPointer: {
		    		            type: 'shadow'
		    		        },
		    		        formatter: function (params){                                                                                                                       
		                        var result = params[0].name + '<br>'                                                                                                            
		                            +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		                            +params[0].seriesName + ': ' + params[0].value + "(家)";                                                                                             
		                        return result;                                                                                                                                  
		                    }
		    		    },
		    		    grid: {
		    		        left: '3%',
		    		        right: '22%',
		    		        bottom: '3%',
		    		        containLabel: true
		    		    },
		    		    xAxis: {
		    		        type: 'value',
		    		        boundaryGap: [0, 0.01],
		    		        name : '单位/家'
		    		    },
		    		    yAxis: {
		    		        type: 'category',
		    		        data : names,
		    		        name : '省份名称'
		    		        
		    		    },
		    		    series: [
		    		        {
		    		            name: '重点监管企业',
		    		            type: 'bar',
		    		            itemStyle:{
		    		                normal:{color:'#5b9bd5'}
		    		            },
		    		            barWidth:10,
		    		            data:counts
		    		        }
		    		    ]
		    		};
		    		if(chart1){
		    			chart1.dispose();
		    		}
		    		chart1 = echarts.init(document.getElementById('barPortal'));
		    		//使用刚指定的配置项和数据显示图表。
		    		chart1.setOption(option);	
		        	
		        	
	        }
		 })
    }else if(userLevel==2){
   	 ajaxPost("/seimp/portal/qyByCity.do", {}).done(function (result) {
	        if (result.status == 0) {
		        	//处理数据
		        	var names = [];
		        	var counts=[];
		        	var maxLength = 10;
		        	var startIndex = 0;
		        	if(maxLength<result.data.length){
		        		startIndex = result.data.length - 10;
		        	}
		            for (var i = startIndex; i < result.data.length; i++) {
						var currItem = result.data[i];
						names.push(currItem.NAME);
		                counts.push(currItem.COUNT);
					}
		    	   

		    		option = {
		    		    title: {
		    		        text: '',
		    		        subtext: ''
		    		    },
		    		    tooltip: {
		    		        trigger: 'axis',
		    		        axisPointer: {
		    		            type: 'shadow'
		    		        },
		    		        formatter: function (params){                                                                                                                       
		                        var result = params[0].name + '<br>'                                                                                                            
		                            +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		                            +params[0].seriesName + ': ' + params[0].value + "(家)";                                                                                             
		                        return result;                                                                                                                                  
		                    }
		    		    },
		    		    grid: {
		    		        left: '3%',
		    		        right: '22%',
		    		        bottom: '3%',
		    		        containLabel: true
		    		    },
		    		    xAxis: {
		    		        type: 'value',
		    		        boundaryGap: [0, 0.01],
		    		        name : '单位/家'
		    		    },
		    		    yAxis: {
		    		        type: 'category',
		    		        data : names,
		    		        name : '省份名称'
		    		        
		    		    },
		    		    series: [
		    		        {
		    		            name: '重点监管企业',
		    		            type: 'bar',
		    		            itemStyle:{
		    		                normal:{color:'#5b9bd5'}
		    		            },
		    		            barWidth:10,
		    		            data:counts
		    		        }
		    		    ]
		    		};
		    		if(chart1){
		    			chart1.dispose();
		    		}
		    		chart1 = echarts.init(document.getElementById('barPortal'));
		    		//使用刚指定的配置项和数据显示图表。
		    		chart1.setOption(option);	
		        	
		        	
	        }
		 })
    }
	 ajaxPost("/seimp/warn/staKeyIndustry.do", {}).done(function (result) {
		 if (result.status == 0) {
	        	var data = result.data;
	        	var seriesData = [];
	        	var names = [];
	        	seriesData = [{value: handleNullToZero(data['有色金属矿采选']), name: '有色金属矿采选'},
	        	                   {value: handleNullToZero(data['有色金属冶炼']), name: '有色金属冶炼'},
	        	                   {value: handleNullToZero(data['石油开采']), name: '石油开采'},
	        	                   {value: handleNullToZero(data['石油加工']), name: '石油加工'},
	        	                   {value: handleNullToZero(data['化工']), name: '化工'},
	        	                   {value: handleNullToZero(data['焦化']), name: '焦化'},
	        	                   {value: handleNullToZero(data['电镀']), name: '电镀'},
	        	                   {value: handleNullToZero(data['制革']), name: '制革'}]
	        	names = ["有色金属矿采选","有色金属冶炼","石油开采","石油加工","化工","焦化","电镀","制革"]
	            option = {
	                title: {
	                    text: '',
	                    x: 'center'
	                },
	                tooltip: {
	                    trigger: 'item',
//	                    formatter: "{a} <br/>{b} : {c} ({d}%)"
	                    formatter: function (params){                                                                                                                       
	        	            var result = params.seriesName + '<br>'                                                                                                            
	        	                + params.marker
	        	                +params.name + ': ' + params.value + "(家)(" + params.percent + "%)";                                                                                             
	        	            return result;                                                                                                                                  
	        	        }
	                },
	                /*legend: {
	                	orient: 'horizontal',
	                    left: 'left',
	                    top: '80%',
	                    data: names
	                },*/
//	                color:["#2f4554","#61a0a8","#c23531"],
	                series: [
	                    {
	                        name: '重点行业比例',
	                        type: 'pie',
	                        radius: '20%',
	                        center: ['50%', '45%'],
	                        label: {
	                            normal: {
	                                formatter: '{b}({d}%) ',
	                                padding:0
	                            }
	                        },
	                        data: seriesData,
	                        roseType : 'radius',
	                        itemStyle: {
	                            emphasis: {
	                                shadowBlur: 10,
	                                shadowOffsetX: 0,
	                                shadowColor: 'rgba(0, 0, 0, 0.5)'
	                            }
	                        }
	                    }
	                ]
	            };
	            if(chart3){
	            	chart3.dispose();
		    	}
	            chart3 = echarts.init(document.getElementById('doughnut'));
	            chart3.setOption(option);
	        }
	 })
}


