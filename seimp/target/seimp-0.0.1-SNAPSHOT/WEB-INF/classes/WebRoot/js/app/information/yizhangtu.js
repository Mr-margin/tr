
dong.basicGeographyAndOthersClickRecord = 0; // 记录基础地理和其他的点击情况
dong.measure = false;
$("body").on("click", ".tool-jl", function () { // 距离测量
    dong.measure = true;
    toolbar.activate(esri.toolbars.Draw.POLYLINE);
});
$("body").on("click", ".tool-mj", function () { // 面积测量
    dong.measure = true;
    toolbar.activate(esri.toolbars.Draw.POLYGON)
});
/**
 * 鼠标划过表格
 * @param url
 */
function changBkColor(url) {
    $('#tongjituDiv tbody tr').hover(function () {
        var dians = $(this).children('td:eq(0)').text();
        var dian = dians.split(",")
        var lon = dian[0];
        var lat = dian[1];
        $(this).css("background", "#c0d5e8")
        removeTc("messageHeightayer");
        app.messageHeightayer = new dong.GraphicsLayer({ id: "messageHeightayer" });
        app.map.addLayer(app.messageHeightayer);
        var pointSymbol = new dong.PictureMarkerSymbol(url, 45, 45);
        pointSymbol.setOffset(0, 16);
        var point = new dong.Point(lon, lat, new dong.SpatialReference({ wkid: 102100 }));
        var graphic = new dong.Graphic(point, pointSymbol, "", "");
        app.messageHeightayer.add(graphic);
    }, function () {
        removeTc("messageHeightayer");
        $('#tongjituDiv tbody tr').css("background", "none")
    });
}

function changBkColorCountyData(url) {
    $('#countryDetail tbody tr').hover(function () {
        var dians = $(this).children('td:eq(0)').text();
        var dian = dians.split(",")
        var lon = dian[0];
        var lat = dian[1];
        $(this).css("background", "#c0d5e8")
        removeTc("messageHeightayer");
        app.messageHeightayer = new dong.GraphicsLayer({ id: "messageHeightayer" });
        app.map.addLayer(app.messageHeightayer);
        var pointSymbol = new dong.PictureMarkerSymbol(url, 45, 45);
        pointSymbol.setOffset(0, 16);
        var point = new dong.Point(lon, lat, new dong.SpatialReference({ wkid: 102100 }));
        var graphic = new dong.Graphic(point, pointSymbol, "", "");
        app.messageHeightayer.add(graphic);
    }, function () {
        removeTc("messageHeightayer");
        $('#countryDetail tbody tr').css("background", "none")
    });
}
/**
 * 鼠标划过表格info_table1
 * @param url
 */
function changBkColor1(url) {
    $('#info_table1 tbody tr').hover(function () {
        var dians = $(this).children('td:eq(0)').text();
        var dian = dians.split(",")
        var lon = dian[0];
        var lat = dian[1];
        $(this).css("background", "#c0d5e8")
        removeTc("messageHeightayer");
        app.messageHeightayer = new dong.GraphicsLayer({ id: "messageHeightayer" });
        app.map.addLayer(app.messageHeightayer);
        console.log(dian[2])
        var pointSymbol;
        if (url == "poi") {
            if (dian[2] == "xuexiao") {
                pointSymbol = new dong.PictureMarkerSymbol("img/dian/xuexiao_1.png", 45, 45)
            } else if (dian[2] == "yiyuan") {
                pointSymbol = new dong.PictureMarkerSymbol("img/dian/yiyuan32_2.png", 45, 45)
            } else if (dian[2] == "zhuzhai") {
                pointSymbol = new dong.PictureMarkerSymbol("img/dian/zhuzhai_1.png", 45, 45)
            }
        } else {
            pointSymbol = new dong.PictureMarkerSymbol(url, 45, 45)
        }
        pointSymbol.setOffset(0, 16);
        var point = new dong.Point(lon, lat, new dong.SpatialReference({ wkid: 102100 }));
        var graphic = new dong.Graphic(point, pointSymbol, "", "");
        app.messageHeightayer.add(graphic);
    }, function () {
        removeTc("messageHeightayer");
        $('#info_table1 tbody tr').css("background", "none")
    });
}
/**
 * 双击表格定位
 * @param lon
 * @param lat
 */
function ondbclickDingwei(lon, lat) {
    var centerPoint = new dong.Point(handle_x(lon), handle_y(lat), new dong.SpatialReference({ wkid: 102100 }));
    app.map.centerAndZoom(centerPoint, 15);
}
/**
 * 公共方法
 */
function allPublic() {
    app.map.on("click", chaxunDian);
    dingweiUserLevel();
    var hy = ['有色金属矿采选业', '有色金属采选业', '有色金属冶炼', '有色金属冶炼和压延加工业', '石油加工', '石油加工业', '化工', '化工原料和化工制品制造业', '石油加工、炼焦及核燃料加工业',
        '皮革、毛皮、羽毛及其制品和制鞋业', '皮革、毛皮、羽毛(绒)及其制品业', '皮革、毛皮、羽毛（绒）及其制品业', '皮革、毛皮、羽毛及其制品和制造业', '医药', '医药制造', '医药制造业',
        '危险废物处理处置'];
    var html = '<option value="">请选行业类别</option>';
    for (var i = 0; i < hy.length; i++) {
        html += '<option value="' + hy[i] + '">' + hy[i] + '</option>'

    }
    $("#dalei").html(html);
    $('#js_slrqq').datetimepicker({
	    language: 'zh-CN',
	    format: 'yyyy-mm-dd',
	    weekStart: 1,
	    todayBtn: 1,
	    autoclose: 1,
	    todayHighlight: 1,
	    startView: 2,
	    minView: 2,
	    forceParse: 0
	});
	$('#js_slrqz').datetimepicker({
	    language: 'zh-CN',
	    format: 'yyyy-mm-dd',
	    weekStart: 1,
	    todayBtn: 1,
	    autoclose: 1,
	    todayHighlight: 1,
	    startView: 2,
	    minView: 2,
	    forceParse: 0
	});
	// 环评行业名称
    ajaxPost("/seimp/yizhangtu/huanpingqiyeName", {}).done(function (result) {
        var html = '<option value="">全部</option>'
        $.each(result.data, function (i, item) {
            html += '<option value="' + item.EIAMANAGENAME + '">' + item.EIAMANAGENAME + '</option>';
        })
        $("#js_hphymc").html(html)
    })
    // 国民经济名称
    ajaxPost("/seimp/yizhangtu/guominjingjiName", {}).done(function (result) {
        var html = '<option value="">全部</option>'
        $.each(result.data, function (i, item) {
            html += '<option value="' + item.NATIONALECONOMYNAME + '">' + item.NATIONALECONOMYNAME + '</option>';
        })
        $("#js_gmjjmc").html(html)
    })
    //尾矿库污染类型
    ajaxPost("/seimp/yizhangtu/weikuangkuType", {}).done(function (result) {
        var html = '<option value="">全部</option>'
        $.each(result.data, function (i, item) {
            html += '<option value="' + item.POLLUTETYPE + '">' + item.POLLUTETYPE + '</option>';
        })
        $("#pollutetype").html(html)
    })
    //重点行业监管企业-行业分类
    ajaxPost("/seimp/yizhangtu/zhongdianIndustry", {}).done(function (result) {
        var html = '<option value="">全部</option>'
        $.each(result.data, function (i, item) {
            html += '<option value="' + item.industry + '">' + item.industry + '</option>';
        })
        $("#industry").html(html)
    })
    //组织机构代码-机构类型
    ajaxPost("/seimp/yizhangtu/zuzhijigouType", {}).done(function (result) {
        var html = ''
        $.each(result.data, function (i, item) {
            html += '<option value="' + item.JYZT0 + '">' + item.JYZT0 + '</option>';
        })
        $("#jigouType").html(html)
        $("#jigouType").selectpicker("refresh");
    })
    //淘汰落后产能企业-行业类别
    ajaxPost("/seimp/yizhangtu/eliminateType", {}).done(function (result) {
        var html = '<option value="">全部</option>'
        $.each(result.data, function (i, item) {
            html += '<option value="' + item.INDUSTRY + '">' + item.INDUSTRY + '</option>';
        })
        $("#luohouindustry").html(html)
    })
    //省
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#provice").html("");
        $("#provice").append('<option value="">请选择省、自治区</option>')
        $("#provice1").html("");
        $("#provice1").append('<option value="">请选择省、自治区</option>')
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#provice").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
            $("#provice1").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
        }
    });
    // $("#map_zoom_slider").hide();
    app.map.addLayer(new dong.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/guojiexian/MapServer", { id: "guojiexian" }));
    var scalebar = new dong.Scalebar({
        map: app.map, // 必须的
        scalebarUnit: "metric"  // 指定比例尺单位,有效值是"english" or "metric".默认"english"
    }, dong.dom.byId("scalebar"));
    app.map.on("mouse-move", function (e) {
        var normalizedVal = dong.webMercatorUtils.xyToLngLat(e.mapPoint.x, e.mapPoint.y)
        $(".jwd").html(normalizedVal[0].toFixed(6) + "," + normalizedVal[1].toFixed(6))
    });
    $(".esriScalebarRulerBlock").css("background", "white");//比例尺中的背景色
    $(".scaleLabelDiv").css("margin-top", "5px");//比例尺距离文字
    //基础地理复选框的选择
    $('.basicDl input:checkbox').click(function () {
        tuliDiv(this.checked, $(this).context.getAttribute("data"))
        if (this.checked) {
            tjTc($(this).context.getAttribute("data"), 0)//num ： 0 添加 1移除
            dong.basicGeographyAndOthersClickRecord++;
        } else {
            tjTc($(this).context.getAttribute("data"), 1)//num ： 0 添加 1移除
            dong.basicGeographyAndOthersClickRecord--;
        }
    })
    //其他复选框的选择
    $('.qita input:checkbox').click(function () {
        tuliDiv(this.checked, $(this).context.getAttribute("data"))
        if (this.checked) {
            tjTc($(this).context.getAttribute("data"), 0)//num ： 0 添加 1移除
            dong.basicGeographyAndOthersClickRecord++;
        } else {
            tjTc($(this).context.getAttribute("data"), 1)//num ： 0 添加 1移除
            dong.basicGeographyAndOthersClickRecord--;
        }
    })
    //空间网格
    $('.kjwg input:checkbox').click(function () {
        if (this.checked) {
            if (dong.dgwang == "0" || dong.dgwang == undefined) {
                wangge();
                dojo.connect(app.map, "onZoomEnd", resizess);//地图缩放
                app.map.on("mouse-drag-end", resizess)//拖动
            } else {
                app.grideGraphicLayer.show();
                app.wanggeLayer.show();
                dojo.connect(app.map, "onZoomEnd", resizess);//地图缩放
                app.map.on("mouse-drag-end", resizess)//拖动
            }

            tuliDiv(true, "公里网格");
            fenbu_tckz("公里网格", "gongliwangge", 0)
        } else {
            app.grideGraphicLayer.hide();
            app.wanggeLayer.hide();
            fenbu_tckz("公里网格", "gongliwangge", 1)
            tuliDiv(false, "公里网格")
        }
    })
}
var isAttributeSearch = false;
var mapClickEvent = null;
/**
 * 属性查询
 */
function startAttributeSearch() {
    console.log("app.map.on.click");
    dong.measure = false;
    if (isAttributeSearch) {
        if (mapClickEvent) {
            mapClickEvent.remove();
            mapClickEvent = null;
            isAttributeSearch = false;
            $("#attributesSearchLi").removeClass("repres_active");
        }
    } else {
        mapClickEvent = app.map.on("click", dianPublic);//点选查询
        $("#attributesSearchLi").addClass("repres_active");
        isAttributeSearch = true;
    }
}
/**
 * 查询市
 */
function getCity() {
    var prov = $("#provice option:selected").text();
    dong.shengName = "";
    dong.shengCode = $("#provice").val();
    if (!dong.shengCode){
    	dong.shengName = "";
        dong.shiCode = "";
        dong.shiName = "";
        dong.xianCode = "";
        dong.xianName = "";	
    }
    if (dong.shengCode) {
    	dong.shengName = prov;
    } 
    ajaxPost("/seimp/eliminate/getCity", { province: prov }).done(function (result) {
        var html = '<option value="">请选择市、自治州</option>'
        if (result.data) {
        	$.each(result.data.result, function (i, item) {
                html += '<option value="' + item.code + '">' + item.name + '</option>';
            });
            $("#city").html(html);	
        }	
    })

    $("#county").html("");
    $("#county").append('<option value="">请选择区、县</option>');

}
/**
 * 重点监管企业遥感核查 查询市
 */
function getCity1() {
    var prov = $("#provice1 option:selected").text();
    dong.shengCode = $("#provice1").val();
    if (!dong.shengCode){
    	dong.shengName = "";
        dong.shiCode = "";
        dong.shiName = "";
        dong.xianCode = "";
        dong.xianName = "";	
    }
    if (dong.shengCode) {
    	dong.shengName = prov;
    } 
    ajaxPost("/seimp/eliminate/getCity", { province: prov }).done(function (result) {
        var html = '<option value="">请选择市、自治州</option>'
        if (result.data) {
        	$.each(result.data.result, function (i, item) {
                html += '<option value="' + item.code + '">' + item.name + '</option>';
            });
            $("#city1").html(html);	
        }	
    })
    $("#county1").html("");
    $("#county1").append('<option value="">请选择区、县</option>');
}
/**
 * 查询县
 */
function getCounty() {
    var prov = $("#city option:selected").text();
    dong.shiCode = $("#city").val();
    if (!dong.shiCode) {
    	dong.shiName = "";
        dong.shiCode = "";
        dong.shiName = "";
        dong.xianCode = "";
        dong.xianName = "";
    }
    if (dong.shiCode) {
    	dong.shiName = prov;	
    }
    ajaxPost("/seimp/eliminate/getCounty", { city: prov }).done(function (result) {
        var html = '<option value="">请选择区、县</option>';
        if (result.data) {
        	$.each(result.data.result, function (i, item) {
                html += '<option value="' + item.code + '">' + item.name + '</option>';
            });
            $("#county").html(html);
        }
    })
}
/**
 * 重点监管企业遥感核查 查询县
 */
function getCounty1() {
    var prov = $("#city1 option:selected").text();
    dong.shiCode = $("#city1").val();
    dong.shiName = "";
    if (dong.shiCode) {
    	dong.shiName = prov;	
    }
    ajaxPost("/seimp/eliminate/getCounty", { city: prov }).done(function (result) {
        var html = '<option value="">请选择区、县</option>';
        if (result.data) {
        	$.each(result.data.result, function (i, item) {
                html += '<option value="' + item.code + '">' + item.name + '</option>';
            });
            $("#county1").html(html);
        }
    })
}
/**
 * 选择县的时候设置dong.xianCode
 */
function setXianCode() {
    dong.xianCode = $("#county").val() || $("#county1").val();
}

var tuceng = [{ name: "省级行政界线", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/provincemap/MapServer", id: "shengJie" },
{ name: "市级行政界线", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/citymap/MapServer", id: "shiJie" }, { name: "县级行政界线", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/countymap/MapServer", id: "xianJie" },
{ name: "地名数据", url: "" }, { name: "地形地貌", url: "" }, { name: "卫星影像", url: "http://t0.tianditu.com/img_c/wmts" },
{ name: "河流", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/river/MapServer", id: "heliu" }, { name: "湖泊", url: "" },
{ name: "道路", url: ["http://" + ip + ":6080/arcgis/rest/services/seimp/高速/MapServer", "http://" + ip + ":6080/arcgis/rest/services/seimp/省道/MapServer"], id: ["gaosu", "shengdao"] },
{ name: "京津冀", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/京津冀/MapServer", id: "jingjinji" },
{ name: "长三角", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/长三角/MapServer", id: "changsanjiao" },
{ name: "珠三角", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/珠三角/MapServer", id: "zhusanjiao" }, { name: "六大综合防治先行区", url: "" }, { name: "土壤污染治理与修复试点", url: "" }, { name: "重点地区-其他", url: "" }, { name: "第二次全国土地调查数据", url: "" },
{ name: "土地利用", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/landuse/MapServer", id: "tudiliyong" },
{ name: "土壤类型", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/soiltype/MapServer", id: "turangleixing" }, { name: "土壤PH值", url: "" }, { name: "有机质", url: "" }, { name: "地质类型", url: "" }, { name: "矿带分布", url: "" }, { name: "作物类型", url: "" },
{ name: "作物分布", url: "" }, { name: "降雨数据", url: "" }, { name: "温度数据", url: "" }, { name: "大型灌区分布", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/灌区/MapServer", id: "guanqu" }, { name: "“七五”背景调查", url: "" }, { name: "多目标区域地球化学调查", url: "" },
{ name: "农产品产地土壤重金属污染调查", url: "" }, { name: "环境重金属污染健康监测数据", url: "" }, { name: "汞污染排放调查", url: "" }, { name: "全国土壤污染状况调查", url: "" },
{ name: "全国土壤污染状况详查（2017年-2020年）", url: "" }, { name: "自行监测", url: "" }, { name: "例行监测", url: "" }, { name: "农产品质量检测", url: "" }, { name: "农产品临田检测", url: "" },
{ name: "严格管控类", url: "" }, { name: "优先保护类", url: "" }, { name: "安全利用类", url: "" }, { name: "污染地块", url: "" }, { name: "疑似污染地块", url: "" }, { name: "未利用地", url: "" }, { name: "突发环境事件监管", url: "" },
{ name: "有色金属矿采选", url: "" }, { name: "石油开采", url: "" }, { name: "有色金属冶炼", url: "" }, { name: "石油加工", url: "" }, { name: "化工", url: "" }, { name: "焦化", url: "" }, { name: "电镀", url: "" },
{ name: "制革", url: "" }, { name: "畜禽", url: "" }, { name: "农药", url: "" }, { name: "化肥", url: "" }, { name: "废弃农膜", url: "" }, { name: "灌溉水", url: "" }, { name: "生活垃圾污染", url: "" }, { name: "垃圾填埋场", url: "" },
{ name: "危险废物集中处置", url: "" }, { name: "修复治理技术", url: "" }, { name: "修复治理项目", url: "" }, { name: "土地利用总体规划", url: "" }, { name: "城市总体规划", url: "" }, { name: "控制性详细规划", url: "" },
{ name: "建设工程施工许可", url: "" }, { name: "农村饮用水工程", url: "" }, { name: "工业园区", url: "" }, { name: "网络舆情", url: "" }, { name: "举报投诉", url: "" }, { name: "文献资料", url: "" },
{ name: "人口分布", url: "http://" + ip + ":6080/arcgis/rest/services/seimp/population/MapServer", id: "renkou" }];
/**
 * 添加图层或者移除图层
 * @param
 * @param 
 */
function tjTc(name, num) {//num ： 0 添加 1移除
    var data;
    $.each(tuceng, function (i, item) {
        if (item.name == name) {
            data = item;
        }
    })
    if (data.url == "") return;
    var id = "";
    if (name == "道路") {
        id = "daolu"
    } else {
        id = data.id;
    }
    var html = '<div class="row warning-element warnings" id="' + id + '" data="' + id + '">' +
        '<div class="col-sm-12" style="padding:0;margin-bottom:12px;">' +
        '   <i id="ss1" class="fa fa-eye fa-lg eye" checked="true" data="' + id + '"></i>' +
        '   <span style="cursor: move;">' + name + '</span>' +
        '   </div>' +
        '   <div class="col-sm-12 eyeSel" style="margin-left:19px;">' +
        '       <div class="' + id + '" style="width:88%;height: 2px;margin-right: 20px;"></div>' +
        '   </div>' +
        '</div>';
    if (num == 0) {
        if (name == "道路") {
            var gaosuLayer = new dong.ArcGISDynamicMapServiceLayer(data.url[0], { id: "gaosuLayer" });
            var shengdaoLayer = new dong.ArcGISDynamicMapServiceLayer(data.url[1], { id: "shengdaoLayer" });
            app.map.addLayer(gaosuLayer);
            app.map.addLayer(shengdaoLayer);
        } else {
            app.map.addLayer(new dong.ArcGISDynamicMapServiceLayer(data.url, { id: data.id }));
        }
        $(".tool_hover").html(html + $(".tool_hover").html());
        huaDiv();
    } else if (num == 1) {
        if (name == "道路") {
            app.map.removeLayer(app.map.getLayer("gaosuLayer"));
            app.map.removeLayer(app.map.getLayer("shengdaoLayer"));
        } else {
            app.map.removeLayer(app.map.getLayer(data.id));
        }
        removeDiv(id);
    }
}
/**
 * 天地图矢量
 */
function tianShi() {
    $(".tool_hover").each(function (i, item) {
        for (var a = 0; a < $(item).context.children.length; a++) {
            if ($(item).context.children[a].getAttribute("data") == "annoLayerImg" || $(item).context.children[a].getAttribute("data") == "baseLayer") {//影像
                $($(item).context.children[a]).hide();
            } else if ($(item).context.children[a].getAttribute("data") == "vectorNoteLayer" || $(item).context.children[a].getAttribute("data") == "vectorLayer") {//矢量
                $($(item).context.children[a]).show();
            } else if ($(item).context.children[a].getAttribute("data") == "layer0") {//谷歌
                $($(item).context.children[a]).hide();
            }
        }
    });
    if (app.map.getLayer("layer0") != null && app.map.getLayer("layer0") != undefined && app.map.getLayer("layer0") != "") {
        app.map.getLayer("layer0").setOpacity(0.0);
    }
    if (app.baseLayerImg != "" && app.baseLayerImg != undefined && app.baseLayerImg != undefined) {
        app.map.getLayer("baseLayer").setOpacity(0.0);
    }
    if (app.annoLayerImg != "" && app.annoLayerImg != undefined && app.annoLayerImg != null) {
        app.map.getLayer("annoLayerImg").setOpacity(0.0);
    }
    app.map.getLayer("vectorLayer").setOpacity(1);
    app.map.getLayer("vectorNoteLayer").setOpacity(1);
    paixu();
}
/**
 * 天地图影像
 */
function tianYing() {
    $(".tool_hover").each(function (i, item) {
        for (var a = 0; a < $(item).context.children.length; a++) {
            if ($(item).context.children[a].getAttribute("data") == "annoLayerImg" || $(item).context.children[a].getAttribute("data") == "baseLayer") {//影像
                $($(item).context.children[a]).show();
            } else if ($(item).context.children[a].getAttribute("data") == "vectorNoteLayer" || $(item).context.children[a].getAttribute("data") == "vectorLayer") {//矢量
                $($(item).context.children[a]).hide();
            } else if ($(item).context.children[a].getAttribute("data") == "layer0") {//谷歌
                $($(item).context.children[a]).hide();
            }
        }
    });
    //谷歌
    if (app.map.getLayer("layer0") != null && app.map.getLayer("layer0") != undefined && app.map.getLayer("layer0") != "") {
        app.map.getLayer("layer0").setOpacity(0.0);
    }
    //矢量
    if (app.baseLayer != null && app.baseLayer != undefined && app.baseLayer != "") {
        app.map.getLayer("vectorLayer").setOpacity(0.0);
    }
    if (app.annoLayer != null && app.annoLayer != undefined && app.annoLayer != "") {
        app.map.getLayer("vectorNoteLayer").setOpacity(0.0);
    }
    //影像
    if (app.baseLayerImg != "" && app.baseLayerImg != undefined && app.baseLayerImg != undefined) {
        app.map.getLayer("baseLayer").setOpacity(1);
    } else {
        app.baseLayerImg = new dong.TianDiTuLayer(dong.TianDiTuLayer.IMG_BASE_WEBMERCATOR, { id: "baseLayer" });//影像
        app.map.addLayer(app.baseLayerImg);
        app.map.getLayer("baseLayer").setOpacity(1);
    }
    if (app.annoLayerImg != "" && app.annoLayerImg != undefined && app.annoLayerImg != null) {
        app.map.getLayer("annoLayerImg").setOpacity(1);
    } else {
        app.annoLayerImg = new dong.TianDiTuLayer(dong.TianDiTuLayer.IMG_ANNO_WEBMERCATOR, { id: "annoLayerImg" });//中文注记
        app.map.addLayer(app.annoLayerImg);
        app.map.getLayer("annoLayerImg").setOpacity(1);
    }
    paixu();
}
/**
 * 谷歌影像
 */
function googleYing() {
    $(".tool_hover").each(function (i, item) {
        for (var a = 0; a < $(item).context.children.length; a++) {
            if ($(item).context.children[a].getAttribute("data") == "annoLayerImg" || $(item).context.children[a].getAttribute("data") == "baseLayer") {//影像
                $($(item).context.children[a]).hide();
            } else if ($(item).context.children[a].getAttribute("data") == "vectorNoteLayer" || $(item).context.children[a].getAttribute("data") == "vectorLayer") {//矢量
                $($(item).context.children[a]).hide();
            } else if ($(item).context.children[a].getAttribute("data") == "layer0") {//谷歌
                $($(item).context.children[a]).show();
            }
        }
    });
    //矢量
    if (app.baseLayer != null && app.baseLayer != undefined && app.baseLayer != "") {
        app.map.getLayer("vectorLayer").setOpacity(0.0);
    }
    if (app.annoLayer != null && app.annoLayer != undefined && app.annoLayer != "") {
        app.map.getLayer("vectorNoteLayer").setOpacity(0.0);

    }
    //影像
    if (app.baseLayerImg != "" && app.baseLayerImg != undefined && app.baseLayerImg != undefined) {
        app.map.getLayer("baseLayer").setOpacity(0.0);
    }
    if (app.annoLayerImg != "" && app.annoLayerImg != undefined && app.annoLayerImg != null) {
        eye("annoLayerImg", true);
        app.map.getLayer("annoLayerImg").setOpacity(0.0);
    }

    if (app.map.getLayer("layer0") != null && app.map.getLayer("layer0") != undefined && app.map.getLayer("layer0") != "") {
        app.map.getLayer("layer0").setOpacity(1);
    } else {
        createGoogleLayer();
        app.map.addLayer(new GoogleMapLayer());
        app.map.getLayer("layer0").setOpacity(1);
    }
    paixu();
}
var startSearchLayerIndex = -1;//循环查询地图图形，开始索引
/**
 * 图层属性点选查询（通用）
 * @param event
 * @returns
 */
function dianPublic(event) {
    //第一次查询，初始化索引
    if (startSearchLayerIndex == -1) {
        startSearchLayerIndex = app.map.getLayersVisibleAtScale().length - 1;
    }
    var layer = app.map.getLayersVisibleAtScale()[startSearchLayerIndex];
    // TODO 注记层，矢量图层、影像图层、高亮图层 不做属性查询，查询中等待只让显示一次， 查询出结果后return
    if (layer.layerInfos && layer.layerInfos.length > 0) {
        var point = event.mapPoint;
        var idpara = new dong.IdentifyParameters();
        idpara.returnGeometry = true;
        idpara.tolerance = 3;
        idpara.outFields = ["*"];
        idpara.geometry = point;
        idpara.width = app.map.width;
        idpara.height = app.map.height;
        idpara.mapExtent = app.map.extent;
        var identifyTask = dong.IdentifyTask(app.map.getLayersVisibleAtScale()[startSearchLayerIndex].url);
        identifyTask.execute(idpara, function (evt) {
            if (evt.length == 0) {
                if (startSearchLayerIndex == 0) {
                    //未查询到结果，索引恢复到默认值
                    startSearchLayerIndex = -1;
                    return;
                } else {
                    //无结果，进行下一次查询
                    startSearchLayerIndex--;
                    dianPublic(event);
                }
            } else {
                showDianClickResult(evt, event);
                //查询到结果，索引恢复到默认值
                startSearchLayerIndex = -1;
            }
        });
    } else {
        //图层类型不支持查询，不是Dynamic类型图层，进行下一次查询 
        if (startSearchLayerIndex == 0) {
            //未查询到结果，索引恢复到默认值
            startSearchLayerIndex = -1;
            return;
        } else {
            //无结果，进行下一次查询
            startSearchLayerIndex--;
            dianPublic(event);
        }
    }
}

//展示属性查询结果
var searchPar = {
    deletePar: ["FID", "Shape", "E_NAME"],
    translatePar: {
        "AREA": "面积"
    },
    addPar: {

    }
}
/**
 * 属性查询结果
 * @param evt
 * @param event
 */
function showDianClickResult(evt, event) {
    //清除高亮
    yztRemoveGraByAttr("searchResultHigh", app.map.graphics);
    //添加高亮
    var feature = evt[0].feature;
    var symbol = null;
    if (evt[0].geometryType && evt[0].geometryType == "esriGeometryPolygon") {
        symbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
            new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,
                new dong.Color([255, 0, 0]), 1),
            new dong.Color([0, 0, 0, 0.25])
        );
    }
    if (evt[0].geometryType && evt[0].geometryType == "esriGeometryPolyline") {
        symbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,
            new dong.Color([255, 0, 0]), 1
        );
    }

    var attributes = {
        graType: 'searchResultHigh'
    }
    var geometry = feature.geometry;
    var gra = new dong.Graphic(geometry, symbol, attributes);
    app.map.graphics.add(gra);


    var html = "";
    var attributes = evt[0].feature.attributes;
    html += "<div class='row' style='max-height:350px;over-flow:auto;'>";
    for (var attrName in attributes) {
        //判断属性信息是否显示
        if (searchPar.deletePar.indexOf(attrName) == -1) {
            var columnName = attrName;
            if (searchPar.translatePar[columnName]) {
                columnName = searchPar.translatePar[columnName];
            }
            html += '<div class="row"><div class="col-sm-4 text-right">' + columnName + '：</div>'
                + '<div class="col-sm-8 text-left" >' + attributes[attrName] + '</div></div>';
        }
    }
    html += "</div>";
    mapinfoWindow2("信息", html, event);
}
/**
 * 透明度滑动
 */
function huadong(e) {
    $("." + e).slider({//基础地图滑动条滑动事件
        max: 10,//最右侧值
        value: 10,//初始值
        orientation: "horizonal",//朝向
        slide: function (event, ui) {//滑动回调函数
            var value = ui.value;
            var type = event.target.getAttribute("data");
            var percent = (value / $(event.target).slider("option", "max")).toFixed(1);
            if (e == "daolu") {
                var targetLayer = app.map.getLayer("gaosuLayer");
                if (targetLayer == null) { return; }
                targetLayer.setOpacity(percent);
                var targetLayer1 = app.map.getLayer("shengdaoLayer");
                if (targetLayer1 == null) { return; }
                targetLayer1.setOpacity(percent);
            } else {
                var targetLayer = app.map.getLayer(e);
                if (targetLayer == null) { return; }
                targetLayer.setOpacity(percent);
            }
            return;
        }
    });
}
/**
 * 点击网格数据
 */
function wanggeShu(evt) {
    dengdai()
    var xmin, xmax, ymin, ymax;
    if (evt.graphic.attributes.point1.x > evt.graphic.attributes.point2.x) {
        xmin = evt.graphic.attributes.point2.x;
        xmax = evt.graphic.attributes.point1.x;
    } else {
        xmax = evt.graphic.attributes.point2.x;
        xmin = evt.graphic.attributes.point1.x;
    }
    if (evt.graphic.attributes.point1.y > evt.graphic.attributes.point3.y) {
        ymin = evt.graphic.attributes.point3.y;
        ymax = evt.graphic.attributes.point1.y;
    } else {
        ymax = evt.graphic.attributes.point3.y;
        ymin = evt.graphic.attributes.point1.y;
    }
    var max = dong.webMercatorUtils.xyToLngLat(xmax, ymax);
    var min = dong.webMercatorUtils.xyToLngLat(xmin, ymin);
    ajaxPost("/seimp/yizhangtu/getWangge", { xmin: min[0], xmax: max[0], ymin: min[1], ymax: max[1] }).done(function (result) {
        removeDengdai();
        if (result.status == 0) {
            dong.qiyeData = result.data.qiyeData;
            dong.wrdkData = result.data.wrdk;
            dong.yswrdkData = result.data.yisiwrdk;
            //计算污染企业的行业类型数量
            var qiyeIndustryCount = 0;
            var qiyeIndustryArr = [];
            for (var i = 0; i < result.data.qiyeData.length; i++) {
                var currItem = result.data.qiyeData[i];
                var flag = false;
                for (var j = 0; j < qiyeIndustryArr.length; j++) {
                    var currInd = qiyeIndustryArr[j];
                    if (currItem.DALEI == currInd) {
                        flag = true;
                    }
                }
                if (!flag) {//如果数组中没有当前企业的行业类型
                    qiyeIndustryCount++;
                    qiyeIndustryArr.push(currItem.DALEI);
                }
            }
            var html = "<div style='margin-left:10px;'>";
            html += "<p class='gewangTitle'>污染地块信息</p>";
            html += "<p>污染地块：<code style='color:#038AEC;'><a href='javascript:void(0)' onclick='wrdkjbxx(\"污染地块\",0)'>" + result.data.wrdk.length + "</a></code></p>";
            html += "<p>疑似污染地块：<code style='color:#038AEC;'><a href='javascript:void(0)' onclick='wrdkjbxx(\"疑似污染地块\",1)'>" + result.data.yisiwrdk.length + "</a></code></p>";
            html += "<hr style='margin-top: 10px;margin-bottom: 10px;' /><p class='gewangTitle'>土壤环境质量</p>";
            html += "<p>农用地污染面积：<code></code></p>";
            html += "<p>未利用地污染面积：<code></code></p>";
            html += "<hr style='margin-top: 10px;margin-bottom: 10px;' /><p class='gewangTitle'>重点行业监管企业</p>";
            // html += "<p>污染地块：<code style='color:#038AEC;'><a href='javascript:void(0)' >0块</a></code></p>";
            html += "<p>监管企业总数：<code style='color:#038AEC;'><a href='javascript:void(0)' onclick='showqiye(\"污染企业\")'>" + result.data.qiyeData.length + "家</a></code></p>";
            html += "<p>监管企业行业类型：<code>" + qiyeIndustryCount + "个</code></p>";
            html += "<hr style='margin-top: 10px;margin-bottom: 10px;' /><p class='gewangTitle'>舆情信息</p>";
            html += "<p>网络舆情：<code style='color:#038AEC;'><a href='javascript:void(0)' onclick=''>" + "0" + "条</code></p>";
            html += "<p>12369举报：<code style='color:#038AEC;'><a href='javascript:void(0)' onclick=''>" + "0" + "条</code></p>";
            html += "<hr style='margin-top: 10px;margin-bottom: 10px;' /><p class='gewangTitle'>人口信息</p>";
            html += "<p>人口数量：<code style='color:#038AEC;'><a href='javascript:void(0)' onclick=''>" + "--" + "</code></p></div>";
            app.map.infoWindow.setTitle("网格信息");
            app.map.infoWindow.setContent(html);
            //改变弹出框大小
            app.map.infoWindow.resize("270", "500");
            var cPoint = new dong.Point([xmax, ymax], new dong.SpatialReference({ wkid: 102100 }));
            app.map.infoWindow.show(cPoint);
            var extentPar = {
                "xmin": xmax, "ymin": ymax, "xmax": xmax, "ymax": ymax,
                "spatialReference": { "wkid": 102100 }
            }
            app.map.setExtent(new dong.Extent(extentPar));
            $(".close").click(function () {
                app.map.infoWindow.remove();
            })
        }

    });
}
/**
 * 删除图层控制中的div
 */
function removeDiv(id) {
    $(".tool_hover").each(function (i, item) {
        for (var a = 0; a < $(item).context.children.length; a++) {
            if ($(item).context.children[a].getAttribute("data") == id) {
                $(item).context.children[a].remove()
            }
        }
    });
}
/**
 * 清除type属性值为value的graphic
 */
function removeGraphic(value) {
	if ( app.map.graphics) {
		var graphics = app.map.graphics.graphics;
	    for (var i = 0; i < graphics.length; i++) {
	        if (graphics[i].attributes && graphics[i].attributes.type && graphics[i].attributes.type == value) {
	            app.map.graphics.remove(graphics[i]);
	        }
	    }
	}
}
/**
 * 删除图层
 */
function removeTc(id) {
    try {
        app.map.removeLayer(app.map.getLayer(id))
    } catch (e) {

    }
}
/**
 * 排序
 */
function paixu() {
    var layerSortArr = [];
    var itemCount = $(".warning-element").length;
    $(".warning-element").each(function (i, item) {
        if (item.getAttribute("data") == "gaosuLayer-shengdaoLayer") {
            var tempObj = { layer: app.map.getLayer("gaosuLayer"), index: itemCount - 1 - i };
            var tempObj1 = { layer: app.map.getLayer("shengdaoLayer"), index: itemCount - 1 - i };
            layerSortArr.push(tempObj);
            layerSortArr.push(tempObj1);
        } else if (item.getAttribute("data") == "googleLayer") {
            var tempObj = { layer: app.map.getLayersVisibleAtScale()[2], index: itemCount - 1 - i };
            layerSortArr.push(tempObj);
        } else {
            var tempObj = { layer: app.map.getLayer(item.getAttribute("data")), index: itemCount - 1 - i };
            layerSortArr.push(tempObj);
        }
    });
    resortMapLayers(layerSortArr);//重排序图层
}
/**
 * 返回全国
 */
function fanhuiAll() {
    dong.level = 0;
    removeFujin();
    removeTc("shi"); // 清除市图层 
    removeGraphic("provinceHigh");
    removeGraphic("provinceHigh1");
    removeTc("diangraphicsLayer");
    $("#fanhuiSheng").hide();
    $("#fanhuiShi").hide();
    clearQueryCondition();
    if (storage.userLevel == "2") { // 省级用户
    } else { // 全国用户
        wrdkXzqh(dong.num);
    }
    app.map.setExtent(new dong.Extent(extentPar))
    if (storage.userLevel != "2") {
        $("#provice").val("");
        $("#city").val("");
        $("#county").val("");
    }
}
/**
 * 返回省
 */
function fanhuiSheng() {
    dong.shiName = "";
    dong.shiCode = "";
    dong.xianName = "";
    dong.xianCode = "";
    dong.level = 1;
    removeFujin();
    removeGraphic("provinceHigh");
    removeGraphic("provinceHigh1");
    removeGraphic("provinceHigh2");
    removeTc("diangraphicsLayer");
    
    $("#city1").val(""); // 重点企业遥感核查，返回省时设置市的下拉框值为空
    $("#county1").val(""); // 重点企业遥感核查，返回省时设置县下拉框的值为空
    if (dong.num == "2") { // 重点监管企业遥感核查
    	if ($("#provice1").val() == "") {
    		$("#provice1").val(dong.shengCode);
    		getCity1(); // 获取市下拉框
    	} 
        chaxunDingwei_zhuantitu($("#provice1").val());
    } else {
    	if ($("#provice").val() == "") {
    		getCity(); // 获取市下拉框
    		$("#provice").val(dong.shengCode);
    	}
        chaxunDingwei_zhuantitu($("#provice").val());
    }
    $("#fanhuiShi").hide();
    show_shi();
    if (dong.num == "2") {
        $("#city1").val("");
        $("#county1").val("");
    } else {
    	$("#city").val("");
        $("#county").val("");
    }
}
/**
 * 返回市
 */
function fanhuiShi() {
    dong.level = 2;
    dong.xianName = "";
    dong.xianCode = "";
    dong.shiName = $("#fanhuiShi")[0].text;
    removeFujin();
    removeGraphic("provinceHigh");
    removeGraphic("provinceHigh1");
    removeGraphic("provinceHigh2");
    removeTc("diangraphicsLayer");
    $("#county1").val(""); // 重点企业遥感核查清空县
    if (dong.num == "2") { // 重点监管企业遥感核查
        chaxunDingwei_zhuantitu($("#provice1").val(), $("#city1").val());
    } else {
        chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val());
    }
    show_xian();
    if (storage.userLevel != "2") {
        $("#county").val("");
    }
}
/**
 * 定位
 */
function LocationMethod(lon, lat) {
    var centerPoint = new esri.geometry.Point(lon, lat,
        new esri.SpatialReference({ wkid: 4490 }));
    app.map.centerAt(centerPoint, 16);
}
/**
 * 表格高亮
 */
function tableHight(id, num) {//0高亮 1 删除高亮
    if (num == "0") {//高亮
        $('#' + id).css("background", "#c0d5e8");
    } else if (num == "1") {//移除高亮
        $('tbody tr').css("background", "none")
    }
}
/**
 * 基础地理下的图例添加与删除
 * 图例
 */
function tuliDiv(flg, name) {
    if (flg) {
        var src = "";
        var size = '';
        if (dong.ztorfb == "专题图") {
            if (name == "疑似污染地块" || name == "污染地块" || name == "建设项目环评" || name == "排污许可数据" || name == "尾矿库（绿网）" || name == "重点监管企业遥感核查" || name == "淘汰落后产能企业" || name == "工商企业登记信息" || name == "重点行业监管企业") {
                if (name == "疑似污染地块" || name == "污染地块") src = "img/information/chang.png";
                else src = "img/information/number.png";
                size = 'style="width:24px;height:24px;"'
                if (name == "重点监管企业遥感核查" || name == "淘汰落后产能企业") {
                	 size = 'style="width:18px;height:18px;"'
                }	
                var html = '<div class="row" data = "' + name + '"><div class="row"><div class="col-lg-12 col-md-12 col-sm-12">' + name + '</div></div><div class="row" style="margin-left: 35px;"><div class="col-lg-7 col-md-7 col-sm-7" style="line-height:24px;">0-9</div>' +
                    '<div class="col-lg-5 col-md-5 col-sm-5 text-center"> <img src="' + src + '" style="width:24px;height:24px;" /></div></div><div class="row" style="margin-left: 35px;"><div class="col-lg-7 col-md-7 col-sm-7" style="line-height:30px;">10-99</div>' +
                    '<div class="col-lg-5 col-md-5 col-sm-5 text-center"> <img src="' + src + '" style="width:30px;height:30px;" /></div></div><div class="row" style="margin-left: 35px;"><div class="col-lg-7 col-md-7 col-sm-7" style="line-height:40px;">100-999</div>' +
                    '<div class="col-lg-5 col-md-5 col-sm-5 text-center"> <img src="' + src + '" style="width:40px;height:40px;" /></div></div><div class="row" style="margin-left: 35px;"><div class="col-lg-7 col-md-7 col-sm-7" style="line-height:50px;">1000-999</div>' +
                    '<div class="col-lg-5 col-md-5 col-sm-5 text-center"> <img src="' + src + '" style="width:50px;height:50px;" /></div></div><div class="row no-border" style="margin-left: 35px;"><div class="col-lg-7 col-md-7 col-sm-7" style="line-height:60px;">10000-9999</div>' +
                    '<div class="col-lg-5 col-md-5 col-sm-5 text-center"> <img src="' + src + '" style="width:60px;height:60px;" /></div></div>' +
                    '</div>';
                $(".tuli").html(html + $(".tuli").html());
            }
        } else if (dong.ztorfb = "分布图") {
        	size = 'style="width:24px;height:24px;"'
            if (name == "疑似污染地块" || name == "污染地块" || name == "建设项目环评" || name == "排污许可数据" || name == "尾矿库（绿网）" || name == "重点监管企业遥感核查" || name == "淘汰落后产能企业" || name == "工商企业登记信息" || name == "重点行业监管企业") {
            	if (name == "重点监管企业遥感核查" || name == "淘汰落后产能企业") {
               	 size = 'style="width:18px;height:18px;"'
               }
            	if (name == "尾矿库（绿网）") src = "img/dian/weikuangku.png";
                else if (name == "重点监管企业遥感核查") src = "img/dian/yaoganhecha.png";
                else if (name == "疑似污染地块") src = "img/dian/yisiwrdk.png";
                else if (name == "污染地块") src = "img/dian/wurandikuai.png";
                else if (name == "建设项目环评") src = "img/dian/jianshe.png";
                else if (name == "排污许可数据") src = "img/dian/paiwuxuke.png";
                else if (name == "重点行业监管企业") src = "img/dian/zhongdian.png";
                else if (name == "工商企业登记信息") src = "img/dian/zuzhijigou.png";
                else if (name == "淘汰落后产能企业") src = "img/dian/taotailuohou.png";
                addTuli(name, src, size)
            }
        }
        if (name == "省级行政界线") {
            src = "img/tuli/sheng.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "市级行政界线") {
            src = "img/tuli/shi.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "县级行政界线") {
            src = "img/tuli/xian.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "土地利用") {
            src = "img/tuli/tudiliyong.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "河流") {
            src = "img/tuli/heliu.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "道路") {
            src = "img/tuli/daolu.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "土壤类型") {
            src = "img/tuli/turangleixing.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "大型灌区分布") {
            src = "img/tuli/guanqu.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "人口分布") {
            src = "img/tuli/renkoufenbu.png";
            size = "";
            addTuli(name, src, size)
        } else if (name == "公里网格") {
            src = "img/tuli/gongliwangge.png"
            size = "";
            addTuli(name, src, size)
        }
    } else {
        $.each($(".tuli div"), function (i, item) {
            if (item.getAttribute("data") == name) {
                $(item).remove();
            }
        })
    }
}
/**
 * 添加图例
 * @param name
 * @param src
 * @param size
 */
function addTuli(name, src, size) {
    var html = '<div class="row" data = "' + name + '"><div class="col-lg-12 col-md-12 col-sm-12">' + name + '</div><div class="col-lg-12 col-md-12 col-sm-12 p5_30"> <img src="' + src + '" ' + size + '></img></div></div>';
    $(".tuli").html(html + $(".tuli").html());
}
/**
 * 土壤污染来源
 */
$('.soilDl input:radio').click(function () {
    var str = $(this).context.getAttribute("data");
    str = str.split("_");
    wrdkXzqh(str[1]);
    qingkongZt();
    tuliDiv(this.checked, str[0])
    $(".menuTip").show();
    $("#fanhuiSheng").hide();
    $("#fanhuiShi").hide();
})
/**
 * 污染地块
 */
$('.wurandikuai input:radio').click(function () {
    var str = $(this).context.getAttribute("data");
    str = str.split("_");
    wrdkXzqh(str[1]);
    qingkongZt();
    tuliDiv(this.checked, str[0])
    $(".menuTip").show();
    $("#fanhuiSheng").hide();
    $("#fanhuiShi").hide();
})
/**
 * 清除图层-量距量面
 */
function qingHua() {
    dong.measure = false; // 设置测量按钮状态为false
    if (app.map.graphics != null && app.map.graphics != null && app.map.graphics != undefined) {
        app.map.graphics.clear();
    }
    removeFujin();
    removeTc("wrdkcentral");
}
/**
 * 清空专题图图例
 */
function qingkongZt() {
    $.each($(".soilDl .sub_menu input"), function (i, item) {
        var str = $(item).context.getAttribute("data");
        str = str.split("_")
        tuliDiv(false, str[0])
    })
    $.each($(".wurandikuai .sub_menu input"), function (i, item) {
        var str = $(item).context.getAttribute("data");
        str = str.split("_")
        tuliDiv(false, str[0])
    })
}
/**
 * 单选框复选框点选事件
 * @param isBack {boolean} 判断是否是点击完分布图后再点击专题图
 */
function radioCheckedClick(isBack) {
    //土壤污染来源-radio
    $('.soilDl input:radio').click(function () {
        if (!isBack) { // 点击完分布图再返回专题图时不清空查询框内容
            clearQueryCondition();
            qingkongZt();
        }
        removeTc("diangraphicsLayer"); // 清除点图层
        $("#toggle-sidebar").click(); // 点击全图显示
        removeTc("shi");
        var str = $(this).context.getAttribute("data");
        str = str.split("_");
        wrdkXzqh(str[1], isBack);
        tuliDiv(this.checked, str[0]);
        $(".menuTip").show();
        $("#fanhuiSheng").hide();
        $("#fanhuiShi").hide();
        isBack = false;
    })
    //土壤污染来源-checked
    $('.soilDl input:checkbox').click(function () {
        var str = $(this).context.getAttribute("data");
        str = str.split("_");
        tuliDiv(this.checked, str[0])
        if (this.checked) {
            fenbu(str[1]);
            fenbu_tckz(str[0], fenbuDy[str[1]], 0);
        } else {
            fenbu_tckz("", fenbuDy[str[1]], 1)
            removeTc(fenbuDy[str[1]]);
            removeGraphic("provinceHigh1"); // 清除地图高亮图层
        }

    })
    //污染地块-radio
    $('.wurandikuai input:radio').click(function () {
    	if (!isBack) { // 点击完分布图再返回专题图时不清空查询框内容
            clearQueryCondition();
            qingkongZt();
            // 清空查询框
            $("#county").val("");
            $("#city").val("");
            $("#provice").val("");
            removeGraphic("provinceHigh1");
            clearQueryCondition(); // 清空查询条件
        }
    	removeTc("diangraphicsLayer"); // 清除点图层
        removeTc("shi");
        removeTc("xian");
        var str = $(this).context.getAttribute("data");
        str = str.split("_");
        wrdkXzqh(str[1],isBack);
        qingkongZt();
        tuliDiv(this.checked, str[0]);
        $(".menuTip").show();
        $("#fanhuiSheng").hide();
        $("#fanhuiShi").hide();
        $("#toggle-sidebar").click(); // 点击污染地块时全图显示
        isBack = false;
    })
    //污染地块-checked
    $('.wurandikuai input:checkbox').click(function () {
        var str = $(this).context.getAttribute("data");
        str = str.split("_");
        tuliDiv(this.checked, str[0])
        if (this.checked) {
            fenbu(str[1]);
            fenbu_tckz(str[0], fenbuDy[str[1]], 0);
        } else {
            fenbu_tckz("", fenbuDy[str[1]], 1)
            removeTc(fenbuDy[str[1]]);
            removeGraphic("provinceHigh1"); // 清除地图高亮图层
        }
    })
}
/**
 * 清除 上次记录-专题图
 */
function qingZhuanti() {
    removeTc("countLayer");
    removeTc("diangraphicsLayer");
    removeTc("diangraphicsLayer");
    dong.shengCode = "";
    dong.shiCode = "";
    dong.xianCode = "";
    dong.shengName = "";
    dong.shiName = "";
    dong.xianName = "";
    dong.level = 0;//0全国，1、省2、市3、县
    removeGraphic("provinceHigh");
    removeFujin();
}
/**
 * 查询省图层
 * @param provinceCode
 */
function queryProviceLayer(provinceCode) {
    var queryUrl = "http://" + ip + ":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0";
    var whereString = "PROV_CODE = " + provinceCode;
    // 根据省市县选择查询不同的图层，显示并高亮
    var queryTask = new dong.QueryTask(queryUrl);
    //定义查询参数对象
    var query = new dong.Query();
    //查询条件，类似于sql语句的where子句
    query.where = whereString;
    //返回的字段信息：*代表返回全部字段
    query.outFields = ["*"];
    //是否返回几何形状
    query.returnGeometry = true;
    //执行属性查询
    queryTask.execute(query, showQueryResult);
}
/**
 * 查询市图层
 * @param provinceCode
 */
function queryCityLayer(cityCode) {
    var queryUrl = "http://" + ip + ":6080/arcgis/rest/services/seimp/city/MapServer/0";
    var whereString = "KIND_1 = '" + cityCode.substring(0, 4) + "'";
    // 根据省市县选择查询不同的图层，显示并高亮
    var queryTask = new dong.QueryTask(queryUrl);
    //定义查询参数对象
    var query = new dong.Query();
    //查询条件，类似于sql语句的where子句
    query.where = whereString;
    //返回的字段信息：*代表返回全部字段
    query.outFields = ["*"];
    //是否返回几何形状
    query.returnGeometry = true;
    //执行属性查询
    queryTask.execute(query, showQueryResult);
}
/**
 * 专题图查询定位
 * @param sheng
 * @param shi
 * @param xian
 */
function chaxunDingwei_zhuantitu(sheng, shi, xian) {
    if (isAttributeQuery()) { // 判断是否是属性查询
        return;
    }
    dong.chaxun = true;
    var queryUrl = "";
    var whereString = "";
    var shengUrl = "http://" + ip + ":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0";
    var shiUrl = "http://" + ip + ":6080/arcgis/rest/services/seimp/city/MapServer/0";
    var xianUrl = "http://" + ip + ":6080/arcgis/rest/services/seimp/countynew/MapServer/0";
    if (sheng) {
        var whereStringSheng = "PROV_CODE = '" + sheng + "'";
    }
    if (shi) {
        var whereStringXian = "KIND_1 = '" + shi.substring(0, 4) + "'";
    }
    if (xian == "" || xian == null) {
        if (shi == "" || shi == null) {
            if (sheng == "" || sheng == null) {
                $(".close").click(); // 关闭查询窗口 
                removeGraphic("provinceHigh"); // 清除高亮图层
                removeGraphic("provinceHigh1");
                return;
            } else { // 省
                queryUrl = shengUrl;
                whereString = whereStringSheng;
                dong.shengCode = sheng;
                dong.tucengType = "sheng";
            }
        } else { // 市
            queryUrl = shiUrl;
            whereString = whereStringXian;
            dong.shiCode = shi;
            dong.tucengType = "shi";
            // 返回省和市
            if (iszhuantitu()) {
                retrunToUpperLevel(shengUrl, whereStringSheng);
            }
        }
    } else { // 县
        queryUrl = xianUrl;
        whereString = "CODE = '" + xian + "'";
        dong.xianCode = xian;
        dong.tucengType = "xian"
        if (iszhuantitu()) {
            isQueryXian(shengUrl, whereStringSheng, shiUrl, whereStringXian)
        }
    }
    // 根据省市县选择查询不同的图层，显示并高亮
    var queryTask = new dong.QueryTask(queryUrl);
    //定义查询参数对象
    var query = new dong.Query();
    //查询条件，类似于sql语句的where子句
    query.where = whereString;
    //返回的字段信息：*代表返回全部字段
    query.outFields = ["*"];
    //是否返回几何形状
    query.returnGeometry = true;
    //执行属性查询
    queryTask.execute(query, showQueryResult);
}
/**
 * 查询县下一级
 * @param shengUrl
 * @param whereStringSheng
 * @param shiUrl
 * @param whereStringXian
 */
function isQueryXian(shengUrl, whereStringSheng, shiUrl, whereStringXian) {
    // 返回省
    retrunToUpperLevel_sheng(shengUrl, whereStringSheng);
    // 返回市
    retrunToUpperLevel(shiUrl, whereStringXian);
    if (dong.num == "1" || dong.num == "11") {
        dianMessage(dong.xianCode);
    } else if (dong.num == "2") {
        yaoganMessage(dong.xianCode)
    } else if (dong.num == "3") {
        lwwkkMessage($("#county option:selected").text());
    } else if (dong.num == "4") {
        luohouMeaasage($("#county option:selected").text());
    } else if (dong.num == "6") {
        pwxk_zhuantiMessage(dong.xianCode);
    } else if (dong.num == "7") {
        zuzhijigou_zhuantiMessage(dong.xianCode);
    } else if (dong.num == "8") {
        zhongdian_zhuantiMessage(dong.xianCode);
    }
}
/**
 * 返回上一级
 * @param queryUrl
 * @param whereString
 */
function retrunToUpperLevel(queryUrl, whereString) {
    // 根据省市县选择查询不同的图层，显示并高亮
    var queryTask = new dong.QueryTask(queryUrl);
    //定义查询参数对象
    var query = new dong.Query();
    //查询条件，类似于sql语句的where子句
    query.where = whereString;
    //返回的字段信息：*代表返回全部字段
    query.outFields = ["*"];
    //是否返回几何形状
    query.returnGeometry = true;
    //执行属性查询
    queryTask.execute(query, function (queryResult) {
        if (queryResult.features.length >= 1) {
            for (var i = 0; i < queryResult.features.length; i++) {
                //获得图形graphic
                var graphic = queryResult.features[i];
                //赋予相应的符号
                var attributes = graphic.attributes;
                //graphic.setSymbol(fill);
                //将graphic添加到地图中，从而实现高亮效果
                var extent = graphic.geometry.getExtent();
                //app.map.graphics.add(highGraphic);
                //app.map.setExtent(extent);
                var centerX = (extent.xmin + extent.xmax) / 2;
                var centerY = (extent.ymin + extent.ymax) / 2;
                if (attributes.PROV_CODE) {
                    $("#fanhuiSheng").show();
                    $("#fanhuiSheng").val(attributes.PROV_CODE + "-" + centerX + "," + centerY)
                    $("#fanhuiSheng").html('<i class="iconfont icon-return"></i>' + attributes.NAME)
                }
                if (attributes.KIND_1) {
                    $("#fanhuiShi").show();
                    $("#fanhuiShi").val(attributes.KIND_1 + "-" + centerX + "," + centerY)
                    var name = attributes.NAME_1
                    $("#fanhuiShi").html('<i class="iconfont icon-return"></i>' + name)
                }
            }
        }
    });
}
function retrunToUpperLevel_sheng(queryUrl, whereString) {
    // 根据省市县选择查询不同的图层，显示并高亮
    var queryTask = new dong.QueryTask(queryUrl);
    //定义查询参数对象
    var query = new dong.Query();
    //查询条件，类似于sql语句的where子句
    query.where = whereString;
    //返回的字段信息：*代表返回全部字段
    query.outFields = ["*"];
    //是否返回几何形状
    query.returnGeometry = true;
    //执行属性查询
    queryTask.execute(query, function (queryResult) {
        if (queryResult.features.length >= 1) {
            for (var i = 0; i < queryResult.features.length; i++) {
                //获得图形graphic
                var graphic = queryResult.features[i];
                //赋予相应的符号
                var attributes = graphic.attributes;
                //graphic.setSymbol(fill);
                //将graphic添加到地图中，从而实现高亮效果
                var extent = graphic.geometry.getExtent();
                //app.map.graphics.add(highGraphic);
                //app.map.setExtent(extent);
                var centerX = (extent.xmin + extent.xmax) / 2;
                var centerY = (extent.ymin + extent.ymax) / 2;
                if (attributes.PROV_CODE) {
                    $("#fanhuiSheng").show();
                    $("#fanhuiSheng").val(attributes.PROV_CODE + "-" + centerX + "," + centerY)
                    $("#fanhuiSheng").html('<i class="iconfont icon-return"></i>' + attributes.NAME)
                }
                if (attributes.KIND_1) {
                    $("#fanhuiShi").show();
                    $("#fanhuiShi").val(attributes.KIND_1 + "-" + centerX + "," + centerY)
                    var name = attributes.NAME || attributes.NAME_1
                    $("#fanhuiShi").html('<i class="iconfont icon-return"></i>' + name)
                }
            }
        }
    });
}
/**
 * 属性查询完成之后，用showQueryResult来处理返回的结果
 * @param queryResult
 */
function showQueryResult(queryResult) {
    //创建线符号
    var lineSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([252, 78, 42]), 4);
    //创建面符号
    var fill = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID, lineSymbol);
    if (queryResult.features.length == 0) {
        return;
    }
    removeGraphic("provinceHigh1");
    removeGraphic("provinceHigh2"); // 移除省高亮
    if (queryResult.features.length >= 1) {
        for (var i = 0; i < queryResult.features.length; i++) {
            //获得图形graphic
            var graphic = queryResult.features[i];
            //赋予相应的符号
            var highGraphic = new esri.Graphic(graphic.geometry, lineSymbol, { type: "provinceHigh1" });
            var attributes = graphic.attributes;
            //将graphic添加到地图中，从而实现高亮效果
            var extent = graphic.geometry.getExtent();
            app.map.graphics.add(highGraphic);
            app.map.setExtent(extent);
            $(".modal-content .close").click(); // 关闭查询窗口
            var centerX = (extent.xmin + extent.xmax) / 2;
            var centerY = (extent.ymin + extent.ymax) / 2;
            if (attributes.PROV_CODE) {
                $("#fanhuiSheng").show();
                $("#fanhuiShi").hide();
                $("#fanhuiSheng").val(attributes.PROV_CODE + "-" + centerX + "," + centerY)
                $("#fanhuiSheng").html('<i class="iconfont icon-return"></i>' + attributes.NAME)
            }
            if (attributes.KIND_1) {
                $("#fanhuiShi").show();
                $("#fanhuiShi").val(attributes.KIND_1 + "00" + "-" + centerX + "," + centerY);
                $("#fanhuiShi").html('<i class="iconfont icon-return"></i>' + attributes.NAME_1);
            }
        }
    }
}
/**
 * 模态框查询定位
 */
function chaxunDingwei(sheng, shi, xian) {
    //定位
    console.log(sheng);
    var code = "";
    var level = 0;
    if (xian == "") {
        if (shi == "") {
            if (sheng == "") {
                code = "";
            } else {
                code = sheng;
                level = 6;
            }
        } else {
            code = shi;
            level = 8;
        }
    } else {
        code = xian;
        level = 10;
    }
    if (code != "") {
        ajaxPost("/seimp/yizhangtu/cityLonLat", { code: code }).done(function (result) {
            if (result.status == "0") {
                var centerPoint = new dong.Point(handle_x(result.data[0].lon), handle_y(result.data[0].lat), new dong.SpatialReference({ wkid: 102100 }));
                app.map.centerAndZoom(centerPoint, level);
            }
        })
    }
    if (storage.userLevel == "2") {
        removeGraphic("provinceHigh1");
        var str = new dong.FeatureLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {});
        var query = new dong.Query();
        query.where = "PROV_CODE =" + storage.regionCode + "";
        str.queryFeatures(query, function (featureSet) {
            console.log(featureSet)
            var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([252, 78, 42]), 2);
            var highGraphic = new esri.Graphic(featureSet.features[0].geometry, highSymbol, { type: "provinceHigh2" });
            app.map.graphics.add(highGraphic);
        });
    }
}
/**
 * 表格定位
 */
function tableDingwei(left,top){
    // $("#info_table1").css("top",top-30+"px");
    // $("#info_table1").css("left",left+20+"px")
} 

/**
 * 地图弹出框
 * @param name
 * @param html
 * @param evt
 */
function mapinfoWindow(name, html, evt) {
    app.map.infoWindow.setTitle(name);
    app.map.infoWindow.setContent(html);
    var lon, lat;
    if (evt.graphic == undefined) {
        lon = evt.mapPoint.x;
        lat = evt.mapPoint.y;
    } else {
        lon = evt.graphic.geometry.x;
        lat = evt.graphic.geometry.y;
    }
    var centerPoint = new dong.Point(lon, lat, new dong.SpatialReference({ wkid: 102100 }));
    $(".dextra-bubble-pop").addClass("infoBubble-pop");
    $(".anniu").css("margin-left", "100px");
    app.map.infoWindow.show(centerPoint);
    $(".window_table .close").click(function () {
        app.map.infoWindow.remove();
        removeTc("wrdkcentral");
    })
    var extentPar = {
        "xmin": lon, "ymin": lat, "xmax": lon, "ymax": lat,
        "spatialReference": { "wkid": 102100 }
    }
    app.map.setExtent(new dong.Extent(extentPar));
}
/**
 * 地图弹出框 属性查询弹出框
 * @param name
 * @param html
 * @param evt
 */
function mapinfoWindow2(name, html, evt) {
    app.map.infoWindow.setTitle(name);
    app.map.infoWindow.setContent(html);
    var centerPoint = evt.mapPoint;
    $(".dextra-bubble-pop").addClass("infoBubble-pop");
    $(".anniu").css("margin-left", "100px");
    app.map.infoWindow.show(centerPoint);
    $(".window_table .close").click(function () {
        app.map.infoWindow.remove();
        yztRemoveGraByAttr("searchResultHigh", app.map.graphics);
    })
}
/**
 * 根据属性，删除图层中的graphics
 */
function yztRemoveGraByAttr(val, mapLayer) {
    var gras = mapLayer.graphics;
    for (var i = gras.length - 1; i >= 0; i--) {
        var gra = gras[i];
        var attrs = gra.attributes;
        if (attrs && attrs.graType && attrs.graType == val) {
            mapLayer.remove(gra);
        }
    }
}
/**
 * 省级用户定位
 */
function dingweiUserLevel() {
    if (storage.userLevel == "2") {
    	chaxunDingwei_zhuantitu(storage.regionCode, "", "")
        var str = new dong.FeatureLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {});
        var query = new dong.Query();
        query.where = "PROV_CODE =" + storage.regionCode + "";
        str.queryFeatures(query, function (featureSet) {
            console.log(featureSet)
            var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([252, 78, 42]), 2);
            var highGraphic = new esri.Graphic(featureSet.features[0].geometry, highSymbol, { type: "provinceHigh1" });
            app.map.graphics.add(highGraphic);
        });
    }
}
/**
 * 判断当前窗口是否是专题图
 * @returns {Boolean}
 */
function iszhuantitu() {
    if ($(".typeShow label i")[0].style.display == "block") {
        return true;
    }
    return false;
}