/**
 * 重点企业遥感核查
 */
function Zhongdianhangye() {
    var shengName = "";
    var shiName = "";
    var xianName = "";
    if ($("#provice1").val() != "") shengName = $('#provice1 option:selected').text();
    if ($("#city1").val() != "") shiName = $('#city1 option:selected').text();
    if ($("#county1").val() != "") xianName = $('#county1 option:selected').text();
    var json = { sheng: shengName, shi: shiName, xian: xianName, dalei: $("#dalei").val(), production: $("#production").val() }
    // 获取查询图层
    getQueryLayerZhongDianHangYe();
    ajaxPost("/seimp/yizhangtu/getZhongdianhy", json).done(function (result) {
        removeDengdai();//删除等待框
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                $("#tongjituDiv thead").html("");
                $("#tongjituDiv tbody").html("");
                var data = result.data;
                if (dong.tucengType == "sheng") {
                    shengShu(result.data);
                } else if (dong.tucengType == "shi") {
                    $('#provice1').val(dong.shengCode)
                    getCity1();
                    shiShu(result.data);
                } else if (dong.tucengType == "xian") {
                    $('#provice1').val(dong.shengCode)
                    $('#city1').val(dong.shiCode);
                    getCounty1();
                    xianShu(result.data);
                }
                xzqhTable(result.data, "str1");
                // 详情展示
                showDetail_zdhy(json);
            } else {
                toastr.warning("未查询到结果")
            }
        } else toastr.warning("未查询到结果")
    })
}
/**
 * 重点行业详情
 * @param jsonData
 */
function showDetail_zdhy(jsonData) {
    ajaxPost("/seimp/yizhangtu/getZhongdianhyDetail", jsonData).done(function (result) {
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var resultData = result.data;
                var barData = resultData.detail; // 柱状图数据
                var nameNumOne = ""; // 污染地块最多的省
                if (resultData.detail.length > 0) {
                    nameNumOne = resultData.detail[0].name;
                }
                var bar_xAxisData = [];
                var bar_yAxisData = [];
                var totalNumPloat = 0;
                var barName;
                var i = barData.length;
                var yname;
                var isProvinceOrCity = false; // 展示的是省市数据标识
                var yst = 0;
                if (result.data.yst[0]) {
					yst = result.data.yst[0].COUNT;
				}
                if (jsonData.sheng == "") { // 全国
                    yname = "省份名称";
                    i = 9;
                    if (barData.length <= 9) { // 全国数据展示前十个省
                        i = barData.length - 1;
                    }
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>排污许可数量排名前十的省份</p>")
                    barName = "排污许可数量排名前十的省份";
                } else { // 市县
                    isProvinceOrCity = true;
                    var strButton = goingUpOneLevel(jsonData);
                    yname = "市县名称";
                    i = barData.length - 1;
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>排污许可数量排名</p>" + strButton)
                    barName = "排污许可数量排名";
                }
                for (i; i >= 0; i--) { // 排名前十的数据
                    var temp = {
                        value: barData[i].COUNT,
                        code: barData[i].code
                    }
                    if (barData[i].name) {
                    	 bar_yAxisData.push(barData[i].name);
                    	 bar_xAxisData.push(temp);
                    }
                }
                showIntroduction(getCurrentCityName(),isProvinceOrCity, result.data.zdhyzs[0].COUNT, yst, nameNumOne); // 文字描述
                creatBar(bar_yAxisData, bar_xAxisData, barName, yname, "个"); // 柱状图
            } else {
                toastr.warning("未查询到结果")
            }
        }
    })
}
/**
 * 遥感核查-以及详细数据
 * @param code
 */
function yaoganMessage(code) {
	removeTc("countLayer");
    removeTc("diangraphicsLayer");
    app.diangraphicsLayer = new dong.GraphicsLayer({ id: "diangraphicsLayer" });
    app.map.addLayer(app.diangraphicsLayer);
    app.diangraphicsLayer.on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id, 0);
    })
    //添加鼠标移出事件
    app.diangraphicsLayer.on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id, 1);
    })
    app.diangraphicsLayer.on("click", function (evt) {
        tableDingwei(evt.pageX, evt.pageY);
        var src = "img/dian/yaoganhecha64_1.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        console.log(evt)
        yaogenMessage(evt.graphic.attributes.id, evt);
    })
    var queryObject = {
        code: code,
        dalei: $("#dalei option:selected").val(),
        production: $("#production option:selected").val()
    }
    ajaxPost("/seimp/yizhangtu/yghcDelei", queryObject).done(function (result) {
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/yaoganhecha.png", 24, 24);
                pointSymbol.setOffset(0, 0);
                $.each(result.data, function (i, item) {
                    var point = new dong.Point(handle_x(item.LONGITUDE), handle_y(item.LATITUDE), new dong.SpatialReference({ wkid: 102100 }));
                    var graphic = new dong.Graphic(point, pointSymbol, "", "");
                    graphic.setAttributes({ id: item.OID });
                    app.diangraphicsLayer.add(graphic);
                })
                xzqhTable(result.data, "dian2", "img/dian/yaoganhecha64_1.png");
                showCountyDetail(result.data, "dian2", "img/dian/yaoganhecha64_1.png");
            } else toastr.warning("未查询到结果")
        } else toastr.warning("未查询到结果")
    })
}
/**
 * 重点监管企业遥感核查详细信息
 * @param id
 * @param evt
 */
function yaogenMessage(id, evt) {
    dengdai();
    ajaxPost("/seimp/yizhangtu/yghcDeleiDian", { id: id }).done(function (result) {
        removeDengdai();
        if (result.status == 0) {
            var data = result.data[0];
            var name = data.NAME, TYPE = data.TYPE, REMARK = data.REMARK, DALEI = data.DALEI, BIEMIN = data.BIEMIN, BIANHAO = data.BIANHAO, GUIMO = data.GUIMO;
            if (name == undefined) name = ""
            if (TYPE == undefined || TYPE == "") TYPE = ""
            if (REMARK == undefined || REMARK == "") REMARK = ""
            if (DALEI == undefined || DALEI == " ") DALEI = ""
            if (BIEMIN == undefined || BIEMIN == " ") BIEMIN = ""
            if (BIANHAO == undefined || BIANHAO == "") BIANHAO = ""
            if (GUIMO == undefined || GUIMO == "") GUIMO = ""
            if (name.length > 12) { name = name.substr(0, 12) + "..." }
            $("#info_table1 #title").html(name);
            $("#info_table1 #title").attr("title", name);
            $("#info_table1 #title").css("top", "initial");
            $("#info_table1 #title").css("right", "initial");
            $("#info_table1 #title").css("left", "initial");
            $("#info_table1 #title").css("width", "initial");
            var html = '<div class="rows"><div class="row"><div class="col-sm-4 text-right p0">污染企业名称：</div><div class="col-sm-8" title="' + data.name + '">' + name + '</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right p0">污染企业类型：</div><div class="col-sm-8">' + TYPE + '</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right p0">备注：</div><div class="col-sm-8">' + REMARK + '</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right p0">行业大类别：</div><div class="col-sm-8">' + DALEI + '</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right p0">行业小类别名：</div><div class="col-sm-8">' + BIEMIN + '</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right p0">编号：</div><div class="col-sm-8"">' + BIANHAO + '</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right p0">企业规模：</div><div class="col-sm-8">' + GUIMO + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;"><span data-toggle="modal" data-target="#pwModal" onclick=showWyDetailsModal(\"' + data.OID + '\",\"' + data.NAME + '\") style="color:#00A2DA;cursor:pointer;">详情信息</span></div></div>' +
                '</div>';
            mapinfoWindow(name + "(重点监管企业遥感核查)", html, evt);
        }
    })
}
/**
 * 重点企业遥感核查点位分布
 * @param num
 * @param str
 */
function yaogan_fenbu(num, str) {
    dingweiUserLevel();
    removeTc(fenbuDy[num]);
    dengdai()
    if (queryContionIsNull_zdjgqy()) {
        var layer = new dong.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/QL_YGHC2/MapServer", { id: fenbuDy[num] });
    } else {
        var layer = new dong.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/QL_YGHC/MapServer", { id: fenbuDy[num] });
    }
    var layerDefinitions = [];
    var jsonData = { sheng: "", shi: "", xian: "" }
    if ($("#provice1").val() != "") jsonData.sheng = $("#provice1 option:selected").text();
    if ($("#city1").val() != "") jsonData.shi = $("#city1 option:selected").text();
    if ($("#county1").val() != "") jsonData.xian = $("#county1 option:selected").text();
    // 需做判断处理，查全部时查切片图层，有条件时查另一个图层
    layerDefinitions[0] = "SHENG like '" + jsonData.sheng + "%' and SHI like '" + jsonData.shi + "%' and XIAN like '" + jsonData.xian + "%'" +
        " and DALEI like '" + $("#dalei").val() + "%' and PRODUCTION like '" + $("#production").val() + "%'";
    layer.setLayerDefinitions(layerDefinitions);
    app.map.addLayer(layer);
    app.map.getLayer(fenbuDy[num]).on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id, 0);
    })
    //添加鼠标移出事件
    app.map.getLayer(fenbuDy[num]).on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id, 1);

    })
    app.map.getLayer(fenbuDy[num]).on("update-end", removeDengdai)
    chaxunDingwei_zhuantitu($("#provice1").val(), $("#city1").val(), $("#county1").val()); // 高亮定位
}
/**
 * 判断重点监管企业查询条件是否全部为空
 * @returns {Boolean}
 */
function queryContionIsNull_zdjgqy() {
    if ($("#provice1").val() == "" && $("#city1").val() == "" && $("#county1").val() == "" && $("#dalei").val() == ""
        && $("#production").val() == "") {
        return false;
    }
    return true;
}
/**
 * 遥感核查条件查询
 */
function yaoganChaxun() {
    if (dong.ztorfb == "分布图") return yaogan_fenbu(2, "1");
    var sheng = "", shi = "", xian = "";
    if ($("#provice1").val() == "") sheng = "";
    else sheng = $("#provice1 option:selected").text(), dong.shengName = sheng;
    if ($("#city1").val() == "") shi = "";
    else shi = $("#city1 option:selected").text(), dong.shiName = shi;
    if ($("#county1").val() == "") xian = "";
    else xian = $("#county1 option:selected").text(), dong.xianName = xian;
    var json = { sheng: sheng, shi: shi, xian: xian, dalei: $("#dalei").val(), production: $("#production").val() }
    //查询定位
    chaxunDingwei_zhuantitu($("#provice1").val(), $("#city1").val(), $("#county1").val())
    getQueryLayer();
    // 判断是市图层还是县图层
    if (dong.tucengType == "shi") {
        app.shi.on("update-end", function (e) {
            addZDHYData(json);
        });
    } else if (dong.tucengType == "xian" && $("#county1").val() == "") { // 查询到市一级
        app.xian.on("update-end", function (e) {
            addZDHYData(json);
        });
    } else if (dong.tucengType == "sheng") {
        addZDHYData(json);
    } else if (dong.tucengType == "xian" && $("#county1").val() != null) {
        yaoganMessage($("#county1").val())
    }
}
/**
 * 在地图上添加数据
 * @param json
 */
function addZDHYData(json) {
    ajaxPost("/seimp/yizhangtu/getZhongdianhy", json).done(function (result) {
        removeDengdai();
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                $("#tongjituDiv thead").html("");
                $("#tongjituDiv tbody").html("");
                if (dong.tucengType == "sheng") {
                    shengShu(result.data);
                } else if (dong.tucengType == "shi") {
                    shiShu(result.data);
                } else if (dong.tucengType == "xian") {
                    xianShu(result.data);
                }
                xzqhTable(result.data);
                showDetail_zdhy(json);
            } else {
                removeTc("countLayer");
                toastr.warning("未查询到结果");
            }
        } else {
            removeTc("countLayer");
            toastr.warning("未查询到结果");
        }
    })
}
/**
 * 重点行业监管企业查询条件
 * @returns
 */
function zhongdainChaxun() {
    if (dong.ztorfb == "分布图") return paiwu_fenbu(6, "1");
    else pwxk_zhuanti("1");
} 
/**
 * 详情信息
 * @param OID
 * @param NAME
 */
function showWyDetailsModal(OID, NAME) {
    var enterPriseInfo = {OID: OID};
    sessionStorage.setItem('dataIDJson', JSON.stringify(enterPriseInfo));
    $("#myModalLabel1").text(NAME);
    $("#detailsIframe").attr("src", "views/data/detailIframe/wyDetails.html");
    $("#detailsDiv").show();
}