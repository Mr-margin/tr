/**
 * 淘汰落后产能企业-专题图
 * @param str 1是查询
 */
function luohou_zhuangti(str) {
	var jsonData = { sheng: "", shi: "", xian: "", enterprise: "", industry: "" }
    if ($("#provice").val() != "") jsonData.sheng = $("#provice option:selected").text();
    if ($("#city").val() != "") jsonData.shi = $("#city option:selected").text();
    if ($("#county").val() != "") jsonData.xian = $("#county option:selected").text();
    jsonData.enterprise = $("#enterprise").val();
    jsonData.industry = $("#luohouindustry").val();
    if (str == "1") {
        jsonData.str = str;
        chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val())
        getQueryLayer();
        // 判断是市图层还是县图层
        if (dong.tucengType == "shi") {
            app.shi.on("update-end", function (e) {
                addTTLHData(jsonData);
            });
        } else if (dong.tucengType == "xian" && $("#county").val() == "") { // 查询到市一级
            app.xian.on("update-end", function (e) {
                addTTLHData(jsonData);
            });
        } else if (dong.tucengType == "sheng") {
            addTTLHData(jsonData);
        } else if (dong.tucengType == "xian" && $("#county").val() != "") {
            luohouMeaasage(jsonData.xian);
        }
    } else {
        addTTLHData(jsonData)
    }
}
/**
 * 在地图上添加淘汰落后企业产能数据
 * @param jsonData 
 */
function addTTLHData(jsonData) {
    if (afterQueryAndBackProvice()) { // 点击过查询按钮并且是返回省
        jsonData.sheng = $("#fanhuiSheng")[0].innerText;
        jsonData.str = "1";
    }
    ajaxPost("/seimp/yizhangtu/getEliminate", jsonData).done(function (result) {
        removeDengdai();//删除等待框
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                $("#tongjituDiv thead").html("");
                $("#tongjituDiv tbody").html("");
                var data = result.data;
                if (dong.tucengType == "sheng") {
                    shengShu(result.data);
                } else if (dong.tucengType == "shi") {
                    shiShu(result.data);
                } else if (dong.tucengType == "xian") {
                    xianShu(result.data);
                }
                xzqhTable(result.data, "luohou");
                // 显示详情
                getEliminateDetail(jsonData);
            } else {
                removeTc("countLayer");
                toastr.warning("未查询到结果")
            }
        } else removeTc("countLayer"), toastr.warning("未查询到结果")
    })
}
/**
 * 获取详情
 * @param jsonData
 */
function getEliminateDetail(jsonData) {
    ajaxPost("/seimp/yizhangtu/getEliminateDetail", jsonData).done(function (result) {
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
                if (jsonData.sheng == "" && jsonData.shi == "") { // 全国
                    yname = "省份名称";
                    i = 9;
                    if (barData.length <= 9) { // 全国数据展示前十个省
                        i = barData.length - 1;
                    }
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>淘汰落后产能企业数量排名前十的省份</p>")
                    barName = "淘汰落后产能企业数量排名前十的省份";
                } else { // 市县（  市县数据不做展示数量限制）
                    isProvinceOrCity = true;
                    var strButton = goingUpOneLevel(jsonData);
                    yname = "市县名称";
                    i = barData.length - 1;
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>淘汰落后产能企业数量排名</p>"+ strButton)
                    barName = "淘汰落后产能企业数量排名";
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
                showIntroduction(getCurrentCityName(),isProvinceOrCity, result.data.zs[0].COUNT, yst, nameNumOne); // 文字描述
                creatBar(bar_yAxisData, bar_xAxisData, barName, yname, "个"); // 柱状图
            } else {
                toastr.warning("未查询到结果")
            }
        }
    })
}
/**
 * 淘汰落后产能企业-详细数据
 * @param name
 */
function luohouMeaasage(name) {
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
        var src = "img/dian/taotailuohou64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        luohouMessage(evt);
    })
    var queryObject = {
        name: name,
        enterprise: $("#enterprise").val(),
        industry: $("#luohouindustry option:selected").val()
    }
    ajaxPost("/seimp/yizhangtu/getEliminateMessage", queryObject).done(function (result) {
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/taotailuohou.png", 18, 18);
                pointSymbol.setOffset(0, 0);
                $.each(result.data, function (i, item) {
                    var point = new dong.Point(handle_x(item.LON), handle_y(item.LAT), new dong.SpatialReference({ wkid: 102100 }));
                    var graphic = new dong.Graphic(point, pointSymbol, "", "");
                    graphic.setAttributes({ id: item.ELID });
                    app.diangraphicsLayer.add(graphic);
                })
                xzqhTable(result.data, "dian_luohou", "img/dian/taotailuohou64_2.png")
                showCountyDetail(result.data, "dian_luohou", "img/dian/taotailuohou64_2.png");
            } else toastr.warning("未查询到结果")
        } else removeTc("countLayer"), toastr.warning("未查询到结果")
    })
}
/**
 * 淘汰落后产能企业详细信息
 * @param evt
 */
function luohouMessage(evt) {
    dengdai()
    ajaxPost("/seimp/yizhangtu/getEliminateDianMessage", { id: evt.graphic.attributes.id }).done(function (result) {
        removeDengdai();
        if (result.status == 0) {
            var data = result.data[0];
            if (!data) {
                return;
            }
            var INDUSTRY = data.INDUSTRY, ENTERPRISE = data.ENTERPRISE, CAPACITY = data.CAPACITY, ELIMINATION_TIME = data.ELIMINATION_TIME, REMARKS = data.REMARKS;
            if (INDUSTRY == undefined || INDUSTRY == "") INDUSTRY = ""
            if (ENTERPRISE == undefined || ENTERPRISE == " ") DALEI = ""
            if (CAPACITY == undefined || CAPACITY == " ") CAPACITY = ""
            if (ELIMINATION_TIME == undefined || ELIMINATION_TIME == "") ELIMINATION_TIME = ""
            if (REMARKS == undefined || REMARKS == "") REMARKS = ""

            $("#info_table1 #title").html(ENTERPRISE);
            $("#info_table1 #title").attr("title", ENTERPRISE);
            var html = '<div class="rows"><div class="row"><div class="col-sm-3 text-right p0">企业名称：</div><div class="col-sm-9">' + ENTERPRISE + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right p0">行业：</div><div class="col-sm-9">' + INDUSTRY + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right p0">产能：</div><div class="col-sm-9">' + CAPACITY + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right p0">淘汰时间：</div><div class="col-sm-9">' + ELIMINATION_TIME + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right p0">备注：</div><div class="col-sm-9">' + REMARKS + '</div></div>' +
                '</div>';
            mapinfoWindow(ENTERPRISE+"(淘汰落后产能企业)", html, evt);
        }
    })
}
/**
 * 淘汰落后产能企业-分布
 * @param num
 * @param str
 */
function luohou_fenbu(num, str) {
    dingweiUserLevel();
    dengdai();
    removeTc(fenbuDy[num]);
    app.map.addLayer(new dong.GraphicsLayer({ id: fenbuDy[num] }));
    app.map.getLayer(fenbuDy[num]).on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id, 0);
    })
    //添加鼠标移出事件
    app.map.getLayer(fenbuDy[num]).on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id, 1);
    })
    app.map.getLayer(fenbuDy[num]).on("click", function (evt) {
        console.log(evt)
        tableDingwei(evt.pageX, evt.pageY);
        var src = "img/dian/taotailuohou64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        luohouMessage(evt);
    })
    var jsonData = {};
    jsonData = { sheng: "", shi: "", xian: "", enterprise: "", industry: "" }
    if ($("#provice").val() != "") jsonData.sheng = $("#provice option:selected").text();
    if ($("#city").val() != "") jsonData.shi = $("#city option:selected").text();
    if ($("#county").val() != "") jsonData.xian = $("#county option:selected").text();
    jsonData.enterprise = $("#enterprise").val();
    jsonData.industry = $("#luohouindustry").val();
    jsonData.str = str;
    if (!iszhuantitu()) { // 分布图高亮定位
        chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()); // 高亮定位
    }
    ajaxPost("/seimp/yizhangtu/getEliminateMessage", jsonData).done(function (result) {
        removeDengdai();
        //removeTc("fenbu_4"); // 先移除图层
        if (result.status == 0) {
            removeTc("countLayer");
            if (JSON.stringify(result.data) != "[]") {
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/taotailuohou.png", 18, 18);
                pointSymbol.setOffset(0, 0);
                $.each(result.data, function (i, item) {
                    if (item.LON > 65.765135846784 && item.LON < 150.23486415321602 && item.LAT > 13.1245384992698 && item.LAT < 54.8754615007302) {
                        var point = new dong.Point(handle_x(item.LON), handle_y(item.LAT), new dong.SpatialReference({ wkid: 102100 }));
                        var graphic = new dong.Graphic(point, pointSymbol, "", "");
                        graphic.setAttributes({ id: item.ELID });
                        app.map.getLayer(fenbuDy[num]).add(graphic);
                    }
                })
            } else toastr.warning("未查询到结果")
        } else toastr.warning("未查询到结果")
    })
}
/**
 * 淘汰落后产能企业查询条件
 */
function luohouChaxun() {
    if (dong.ztorfb == "分布图") return luohou_fenbu(4, "1");
    else luohou_zhuangti("1");
}