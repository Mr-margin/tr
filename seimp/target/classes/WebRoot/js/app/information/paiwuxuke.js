/**
 * 排污许可数据-专题图
 * @param str
 */
function pwxk_zhuanti(str) {
    var jsonData = getConditionOfQueryCode({
        sheng: "",
        shi: "",
        xian: "",
        xkznum: $("#xkznum").val(),
        ispapk: $("#ispapk option:selected").val(),
        zywrwlbid: $("#zywrwlbid option:selected").val()
    });
    if (str == "1") {
        jsonData.sheng = $("#provice").val();
        jsonData.shi = $("#city").val();
        jsonData.xian = $("#county").val();
        jsonData.str = str;
        chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val())
        getQueryLayer();
        // 判断是市图层还是县图层
        if (dong.tucengType == "shi") {
            app.shi.on("update-end", function (e) {
                addpwxkData(jsonData);
            });
        } else if (dong.tucengType == "xian" && $("#county").val() == "") { // 查询到市一级
            app.xian.on("update-end", function (e) {
                addpwxkData(jsonData);
            });
        } else if (dong.tucengType == "sheng") {
            addpwxkData(jsonData);
        } else if (dong.tucengType == "xian" && $("#county").val() != "") { // 查询到县一集
            pwxk_zhuantiMessage(jsonData.xian);
        }
    } else {
        addpwxkData(jsonData);
    }
}
/**
 * 添加排污许可数据
 * @param jsonData
 */
function addpwxkData(jsonData) {
    ajaxPost("/seimp/yizhangtu/paiwuxukeCount", jsonData).done(function (result) {
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
                xzqhTable(result.data, "paiwuxuke");
                // 展示详细信息
                showDetail_paiwuxuke(jsonData);
            } else {
                removeTc("countLayer"); // 清空计数图层
                toastr.warning("未查询到结果")
            }
        } else removeTc("countLayer"), toastr.warning("未查询到结果")
    })
}
/**
 * 排污许可详情数据
 * @param jsonData
 */
function showDetail_paiwuxuke(jsonData) {
    ajaxPost("/seimp/yizhangtu/paiwuxukeDetail", jsonData).done(function (result) {
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
                    $(".wrdk_barTip").append("<p>排污许可数量排名前十的省份</p>")
                    barName = "排污许可数量排名前十的省份";
                } else { // 市县(市县数据不做展示数量限制)
                	var strButton = goingUpOneLevel(jsonData);
                    isProvinceOrCity = true;
                    yname = "市县名称";
                    i = barData.length - 1;
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>排污许可数量排名</p>"+strButton)
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
                showIntroduction(getCurrentCityName(),isProvinceOrCity, result.data.pwxkzs[0].PWXKZS, yst, nameNumOne); // 文字描述
                creatBar(bar_yAxisData, bar_xAxisData, barName, yname, "个"); // 柱状图
            } else {
                toastr.warning("未查询到结果")
            }
        }
    })
}
/**
 * 排污许可数据-分布图
 * @param num 排污许可序号
 * @param str 判断是否是查询
 */
function paiwu_fenbu(num, str) {
    dingweiUserLevel();
    dengdai();
    removeTc(fenbuDy[num]);
    var layer = new dong.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/QL_ENTERPRICE_BASEINFO/MapServer", {
        id: fenbuDy[num]
    });
    var layerDefinitions = [];
    layerDefinitions[0] = "PROVINCECODE like '" + $("#provice").val() + "%' and CITYCODE like '" + $("#city").val() + "%' and COUNTYCODE like '" + $("#county").val() + "%'" +
        " and XKZNUM like '" + $("#xkznum").val() + "%' and ISPARK like '" + $("#ispapk").val() + "%'and ZYWRWLBID like '" + $("#zywrwlbid").val() + "%'";
    layer.setLayerDefinitions(layerDefinitions);
    app.map.addLayer(layer);
    chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()); // 高亮定位
    app.map.getLayer(fenbuDy[num]).on("update-end", removeDengdai)
}
/**
 * 排污许可点位详细信息
 * @param id
 * @param evt
 */
function paiwuMessage(id, evt) {
    dengdai();
    ajaxPost("/seimp/yizhangtu/paiwuxukeDianMessage", { id: id }).done(function (result) {
        removeDengdai();
        if (result.status == 0) {
            var data = result.data[0];
            var XKZNUM = data.XKZNUM, DEVCOMPANY = data.DEVCOMPANY, REGADDRESS = data.REGADDRESS, HYNAME = data.HYNAME, OPERATIME = data.OPERATIME, ISPARK = data.ISPARK, INDUSTRIAL = data.INDUSTRIAL, ZYWRWLBID = data.ZYWRWLBID;
            if (XKZNUM == undefined || XKZNUM == null) XKZNUM = ""
            if (DEVCOMPANY == undefined || DEVCOMPANY == null) DEVCOMPANY = ""
            if (REGADDRESS == undefined || REGADDRESS == null) REGADDRESS = ""
            if (HYNAME == undefined || HYNAME == null) HYNAME = ""
            if (OPERATIME == undefined || OPERATIME == null) OPERATIME = ""
            if (ISPARK == undefined || ISPARK == null || ISPARK == "null") ISPARK = ""
            if (INDUSTRIAL == undefined || INDUSTRIAL == null || INDUSTRIAL == "null") INDUSTRIAL = ""
            if (ZYWRWLBID == undefined || ZYWRWLBID == null) ZYWRWLBID = ""
            if (ISPARK == "1") ISPARK = "是";
            else if (ISPARK == "0") ISPARK = "否";
            var fqfs = ZYWRWLBID.split(",");
            if (fqfs.length == 2) ZYWRWLBID = "废气、废水";
            if (fqfs.length == 1) {
                if (fqfs[0] == "fq") ZYWRWLBID = "废气";
                else if (fqfs[0] = "fs") ZYWRWLBID = "废水"
            }
            $("#info_table1 #title").html(DEVCOMPANY);
            $("#info_table1 #title").attr("title", DEVCOMPANY);
            var html = '<div class="rows"><div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">许可证书编号：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;" >' + XKZNUM + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">单位名称：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + DEVCOMPANY + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">注册地址：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + REGADDRESS + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">行业类型：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + HYNAME + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">投产日期：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + OPERATIME + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">工业园区：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + ISPARK + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">所属工业园区名称：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + INDUSTRIAL + '</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;"><span data-toggle="modal" data-target="#pwModal" onclick=toEnterpriseDetailsPage("' + data.ENTERID + '","' + data.DATAID + '","' + data.DEVCOMPANY + '") style="color:#00A2DA;cursor:pointer;">详情信息</span></div></div>' +
                '</div>';
            mapinfoWindow(DEVCOMPANY+"(排污许可数据)", html, evt);
        }
    })
}
/**
 * 排污许可-专题图点的详细信息
 * @param code 县代码
 */
function pwxk_zhuantiMessage(code) {
	removeTc("countLayer");
    removeTc("diangraphicsLayer");
    app.diangraphicsLayer = new dong.GraphicsLayer({ id: "diangraphicsLayer" });
    app.map.addLayer(app.diangraphicsLayer);
    app.diangraphicsLayer.on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.ENTERID, 0);
    })
    //添加鼠标移出事件
    app.diangraphicsLayer.on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.ENTERID, 1);
    })
    app.diangraphicsLayer.on("click", function (evt) {
        tableDingwei(evt.pageX, evt.pageY);
        var src = "img/dian/paiwuxuke64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        paiwuMessage(evt.graphic.attributes.ENTERID, evt);
    })
    var queryObject = {
        xian: code,
        xkznum: $("#xkznum").val(),
        ispapk: $("#ispapk option:selected").val(),
        zywrwlbid: $("#zywrwlbid option:selected").val()
    }
    ajaxPost("/seimp/yizhangtu/paiwuxukeMessage", queryObject).done(function (result) {
        if (result.status == 0) {
            var pointSymbol = new dong.PictureMarkerSymbol("img/dian/paiwuxuke.png", 24, 24);
            pointSymbol.setOffset(0, 0);
            $.each(result.data, function (i, item) {
                if (item.LONGITUDE > 65.765135846784 && item.LONGITUDE < 150.23486415321602 && item.LATITUDE > 13.1245384992698 && item.LATITUDE < 54.8754615007302) {
                    var point = new dong.Point(handle_x(item.LONGITUDE), handle_y(item.LATITUDE), new dong.SpatialReference({ wkid: 102100 }));
                    var graphic = new dong.Graphic(point, pointSymbol, "", "");
                    graphic.setAttributes({ ENTERID: item.ENTERID });
                    app.diangraphicsLayer.add(graphic);
                }
            })
            xzqhTable(result.data, "dianPwxk", "img/dian/paiwuxuke64_2.png");
            showCountyDetail(result.data, "dianPwxk", "img/dian/paiwuxuke64_2.png");
        }
    })
}
/**
 * 排污许可-查询条件
 */
function paiwuChaxun() {
    if (dong.ztorfb == "分布图") return paiwu_fenbu(6, "1");
    else pwxk_zhuanti("1");
}
/**
 * 显示排污许可证详细信息
 * @param ENTERID
 * @param DATAID
 * @param enterpriseName
 */
function toEnterpriseDetailsPage(ENTERID, DATAID, enterpriseName) {
    var enterPriseInfo = {
        enterId: ENTERID,
        DATAID: DATAID,
        enterpriseName: enterpriseName
    };
    sessionStorage.setItem('dataIDJson', JSON.stringify(enterPriseInfo));
    $("#myModalLabel1").text(enterpriseName);
    $("#detailsIframe").attr("src", "views/data/detailIframe/enterBaseDetails.html");
    $("#detailsDiv").show();
}