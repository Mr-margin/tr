/**
 * 重点行业监管企业-专题图
 * @param str
 */
function zhongdian_zhuanti(str) {
    var jsonData = getConditionOfQueryCode({
        sheng: "", shi: "", xian: "",
        enterpriseName: $("#enterpriseName").val(),
        industry: $("#industry option:selected").val()
    });
    if (str == "1") {
        jsonData.sheng = $("#provice").val();
        jsonData.shi = $("#city").val();
        jsonData.xian = $("#county").val();
        jsonData.enterpriseName = $("#enterpriseName").val();
        jsonData.industry = $("#industry").val();
        jsonData.str = str;
        chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val())
        getQueryLayer();
        // 判断是市图层还是县图层
        if (dong.tucengType == "shi") {
            app.shi.on("update-end", function (e) {
                addzdhyData(jsonData);
            });
        } else if (dong.tucengType == "xian" && $("#county").val() == "") { // 查询到市一级
            app.xian.on("update-end", function (e) {
                addzdhyData(jsonData);
            });
        } else if (dong.tucengType == "sheng") {
            addzdhyData(jsonData);
        } else if (dong.tucengType == "xian" && $("#county").val() != "") {
            zhongdian_zhuantiMessage(jsonData.xian);
        }
    } else {
        addzdhyData(jsonData);
    }
}
/**
 * 添加重点行业数据
 * @param jsonData
 */
function addzdhyData(jsonData) {
    ajaxPost("/seimp/yizhangtu/zhongdianCount", jsonData).done(function (result) {
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
                xzqhTable(result.data, "zhongdian");
                // 展示详情
                showKeyIndustryregulators(jsonData);
            } else {
                removeTc("countLayer"); // 清空计数图层
                toastr.warning("未查询到结果")
            }
        } else {
            removeTc("countLayer"); // 清空计数图层
            toastr.warning("未查询到结果")
        }
    })
}
/**
 * 重点行业监管企业详情
 * @param jsonData
 */
function showKeyIndustryregulators(jsonData) {
    ajaxPost("/seimp/yizhangtu/getKeyIndustryregulatorsDetail", jsonData).done(function (result) {
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var resultData = result.data;
                var barData = resultData.detail; // 柱状图数据
                var nameNumOne = ""; // 污染地块最多的省
                if (resultData.detail.length > 0) {
                    nameNumOne = resultData.detail[0].name;
                }
                var yst = 0;
                if (result.data.yst[0]) {
                	yst = result.data.yst[0].COUNT;
                }
                var bar_xAxisData = [];
                var bar_yAxisData = [];
                var totalNumPloat = 0;
                var barName;
                var i = barData.length;
                var yname;
                var isProvinceOrCity = false; // 展示的是省市数据标识
                if (jsonData.sheng == "" && jsonData.shi == "") { // 全国
                    yname = "省份名称";
                    i = 9;
                    if (barData.length <= 9) { // 全国数据展示前十个省
                        i = barData.length - 1;
                    }
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>重点行业监管企业数量排名前十的省份</p>")
                    barName = "重点行业监管企业数量排名前十的省份";
                } else { // 市县
                    isProvinceOrCity = true;
                    var strButton = goingUpOneLevel(jsonData);
                    yname = "市县名称";
                    i = barData.length - 1;
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>重点行业监管企业量排名</p>" + strButton)
                    barName = "重点行业监管企业数量排名";
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
 * 重点行业监管企业-分布图
 * @param num 
 * @param str
 */
function zhongdian_fenbu(num, str) {
    dingweiUserLevel();
    dengdai();
    removeTc(fenbuDy[num]);
    app.map.addLayer(new dong.GraphicsLayer({ id: fenbuDy[num] }));
    app.map.getLayer(fenbuDy[num]).on("click", function (evt) {
        tableDingwei(evt.pageX, evt.pageY);
        var src = "img/dian/zhongdian64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        zhongdianMessage(evt);
    })
    var jsonData = {};
    jsonData.sheng = $("#provice").val();
    jsonData.shi = $("#city").val();
    jsonData.xian = $("#county").val();
    jsonData.enterpriseName = $("#enterpriseName").val();
    jsonData.industry = $("#industry").val();
    jsonData.str = str;
    chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()); // 高亮定位
    ajaxPost("/seimp/yizhangtu/zhongdianMessage", jsonData).done(function (result) {
        removeDengdai()
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/zhongdian.png", 18, 18);
                pointSymbol.setOffset(0, 0);
                $.each(result.data, function (i, item) {
                    if (item.longitude > 65.765135846784 && item.longitude < 150.23486415321602 && item.latitude > 13.1245384992698 && item.latitude < 54.8754615007302) {
                        var point = new dong.Point(handle_x(item.longitude), handle_y(item.latitude), new dong.SpatialReference({ wkid: 102100 }));
                        var graphic = new dong.Graphic(point, pointSymbol, "", "");
                        graphic.setAttributes({ id: "zhongdian" + item.id, enterpriseName: item.enterpriseName, unifiedSocialCreditIdentifier: item.unifiedSocialCreditIdentifier, organizingInstitutionBarCode: item.organizingInstitutionBarCode, industry: item.industry });
                        app.map.getLayer(fenbuDy[num]).add(graphic);
                    }
                })
            } else toastr.warning("未查询到结果")
        } else toastr.warning("未查询到结果")
    })
}
/**
 * 重点行业监管企业-详细信息
 * @param code
 */
function zhongdian_zhuantiMessage(code) {
    removeTc("diangraphicsLayer");
    removeTc("countLayer");
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
        var src = "img/dian/zhongdian64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        zhongdianMessage(evt);
    })
    var queryObject = {
        xian: code,
        enterpriseName: $("#enterpriseName").val(),
        industry: $("#industry option:selected").val()
    }
    ajaxPost("/seimp/yizhangtu/zhongdianMessage", queryObject).done(function (result) {
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/zhongdian.png", 18, 18);
                pointSymbol.setOffset(0, 0);
                $.each(result.data, function (i, item) {
                    if (item.longitude > 65.765135846784 && item.longitude < 150.23486415321602 && item.latitude > 13.1245384992698 && item.latitude < 54.8754615007302) {
                        var point = new dong.Point(handle_x(item.longitude), handle_y(item.latitude), new dong.SpatialReference({ wkid: 102100 }));
                        var graphic = new dong.Graphic(point, pointSymbol, "", "");
                        graphic.setAttributes({ id: "zhongdian" + item.id, enterpriseName: item.enterpriseName, unifiedSocialCreditIdentifier: item.unifiedSocialCreditIdentifier, organizingInstitutionBarCode: item.organizingInstitutionBarCode, industry: item.industry });
                        app.diangraphicsLayer.add(graphic);
                    }
                })
                xzqhTable(result.data, "dianZhondian", "img/dian/zhongdian64_2.png");
                showCountyDetail(result.data, "dianZhondian", "img/dian/zhongdian64_2.png");
            } else toastr.warning("未查询到结果");
        } else toastr.warning("未查询到结果");
    })
}
/**
 * 重点行业监管企业-点的详细信息
 * @param evt
 */
function zhongdianMessage(evt) {
    var data = evt.graphic.attributes;
    var enterpriseName = data.enterpriseName,
        unifiedSocialCreditIdentifier = data.unifiedSocialCreditIdentifier, organizingInstitutionBarCode = data.organizingInstitutionBarCode, industry = data.industry, mainContaminant = data.mainContaminant;
    if (enterpriseName == undefined || enterpriseName == null) enterpriseName = ""
    if (unifiedSocialCreditIdentifier == undefined || unifiedSocialCreditIdentifier == null) unifiedSocialCreditIdentifier = ""
    if (organizingInstitutionBarCode == undefined || organizingInstitutionBarCode == null) organizingInstitutionBarCode = ""
    if (industry == undefined || industry == null) industry = ""
    if (mainContaminant == undefined || mainContaminant == null) mainContaminant = ""
    $("#info_table1 #title").html(enterpriseName);
    $("#info_table1 #title").attr("title", enterpriseName);
    var html = '<div class="rows"><div class="row"><div class="col-sm-3 text-right" style="width: 33%;padding-left: 0;">企业名称：</div><div class="col-sm-9 text-left" style="width: 67%;padding-left: 0;" >' + enterpriseName + '</div></div>' +
        '<div class="row"><div class="col-sm-3 text-right" style="width: 33%;padding-left: 0;">统一社会信用代码：</div><div class="col-sm-9 text-left" style="width: 67%;padding-left: 0;">' + unifiedSocialCreditIdentifier + '</div></div>' +
        '<div class="row"><div class="col-sm-3 text-right" style="width: 33%;padding-left: 0;">组织机构代码：</div><div class="col-sm-9 text-left" style="width: 67%;padding-left: 0;">' + organizingInstitutionBarCode + '</div></div>' +
        '<div class="row"><div class="col-sm-3 text-right" style="width: 33%;padding-left: 0;">行业：</div><div class="col-sm-9 text-left" style="width: 67%;padding-left: 0;">' + industry + '</div></div>' +
        '<div class="row"><div class="col-sm-3 text-right" style="width: 33%;padding-left: 0;">主要污染物：</div><div class="col-sm-9 text-left" style="width: 67%;padding-left: 0;">' + mainContaminant + '</div></div>' +
        '</div>';
    mapinfoWindow(enterpriseName + "(重点行业监管企业)", html, evt);
}
/**
 * 重点行业监管企业-查询条件
 */
function zhongdainChaxun() {
    if (dong.ztorfb == "分布图") return zhongdian_fenbu(8, "1");
    else zhongdian_zhuanti("1");
}