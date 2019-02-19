//尾矿库（绿网）-专题图
function lwwkk(str) {
    var jsonData = getConditionOfQuery({
        sheng: "", shi: "", xian: "",
        tailingsname: $("#tailingsname").val(),
        pollutetype: $("#pollutetype option:selected").val()
    });
    if (str == "1") {
        if ($("#provice").val() != "") jsonData.sheng = $("#provice option:selected").text();
        if ($("#city").val() != "") jsonData.shi = $("#city option:selected").text();
        if ($("#county").val() != "") jsonData.xian = $("#county option:selected").text();
        jsonData.str = str;
        chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()); // 高亮定位
        // 根据省、县、乡加载不同的图层,并给图层绑定单击事件
        getQueryLayer();
        // 判断是市图层还是县图层
        if (dong.tucengType == "shi") {
            app.shi.on("update-end", function (e) {
                addWKKData(jsonData);
            });
        } else if (dong.tucengType == "xian" && $("#county").val() == "") { // 查询到市一级
            app.xian.on("update-end", function (e) {
                addWKKData(jsonData);
            });
        } else if (dong.tucengType == "sheng") {
            addWKKData(jsonData);
        } else if (dong.tucengType == "xian" && $("#county").val() != "") {
            // 点击县；
            lwwkkMessage(jsonData.xian);
        }
    } else {
        addWKKData(jsonData)
    }
}
/**
 * 添加尾矿库数据
 * @param jsonData
 */
function addWKKData(jsonData) {
    if (afterQueryAndBackProvice()) { // 点击过查询按钮并且是返回省
        jsonData.sheng = $("#fanhuiSheng")[0].innerText;
        jsonData.str = "1";
    }
    ajaxPost("/seimp/yizhangtu/lwwkk", jsonData).done(function (result) {
        removeDengdai();//删除等待框
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                $("#tongjituDiv thead").html("");
                $("#tongjituDiv tbody").html("");
                var data = result.data;
                if (dong.tucengType == "sheng") {
                    shengShu(result.data);
                } else if (dong.tucengType == "shi") {
                    $('#provice').val(dong.shengCode)
                    getCity();
                    shiShu(result.data);
                } else if (dong.tucengType == "xian") {
                    $('#provice').val(dong.shengCode)
                    $('#city').val(dong.shiCode);
                    getCounty();
                    xianShu(result.data);
                }
                xzqhTable(result.data, "str2");
                showDetail_wkk(jsonData);
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
 * 尾矿库详情
 * @param queryJson
 */
function showDetail_wkk(jsonData) {
    ajaxPost("/seimp/yizhangtu/lwwkkDetail", jsonData).done(function (result) {
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
                var pieName;
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
                    $(".wrdk_barTip").append("<p>尾矿库（绿网）数量排名前十的省份</p>")
                    barName = "尾矿库（绿网）数量排名前十的省份";
                } else { // 市县
                    isProvinceOrCity = true;
                    var strButton = goingUpOneLevel(jsonData);
                    yname = "市县名称";
                    i = barData.length - 1;
                    $(".wrdk_barTip").empty();
                    $(".wrdk_barTip").append("<p>尾矿库（绿网）数量排名</p>" + strButton)
                    barName = "尾矿库（绿网）数量排名";
                }
                for (i; i >= 0; i--) { // 排名前十的数据
                    var temp = {
                        value: barData[i].COUNT,
                        code: barData[i].code
                    }
                    
                    if (barData[i].name) {
                    	bar_xAxisData.push(temp);
                    	bar_yAxisData.push(barData[i].name);
                    }
                }
                showIntroduction(getCurrentCityName(),isProvinceOrCity, result.data.lwwkkzs[0].COUNT,yst, nameNumOne); // 文字描述
                creatBar(bar_yAxisData, bar_xAxisData, barName, yname, "个"); // 柱状图
            } else {
                toastr.warning("未查询到结果")
            }
        }
    })
}
/**
 * 尾矿库（绿网）详细数据-专题图
 * @param name
 */
function lwwkkMessage(name) {
	removeTc("countLayer");
    removeTc("diangraphicsLayer");
    app.diangraphicsLayer = new dong.GraphicsLayer({ id: "diangraphicsLayer" });
    app.map.addLayer(app.diangraphicsLayer);
    app.diangraphicsLayer.on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id, 0);
    })
    app.diangraphicsLayer.on("click", function (evt) {
        tableDingwei(evt.pageX, evt.pageY);
        var src = "img/dian/weikuangku64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        wkkMessage(evt.graphic.attributes.id, evt);//尾矿库详细信息
    })
    //添加鼠标移出事件
    app.diangraphicsLayer.on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id, 1);
    })
    var jsonData = {
        xian: name,
        tailingsname: $("#tailingsname").val(),
        pollutetype: $("#pollutetype option:selected").val()
    }
    ajaxPost("/seimp/yizhangtu/lwwkkMessage", jsonData).done(function (result) {
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                removeTc("countLayer");
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/weikuangku.png", 24, 24);
                pointSymbol.setOffset(0, 0);
                $.each(result.data, function (i, item) {
                    var lonlat = JSON.parse(item.COORDINATE);
                    var x = lonlat["lng"];
                    var y = lonlat["lat"];
                    var point = new dong.Point(handle_x(x), handle_y(y), new dong.SpatialReference({ wkid: 102100 }));
                    var graphic = new dong.Graphic(point, pointSymbol, "", "");
                    graphic.setAttributes({ ENTERPRISENAME: item.ENTERPRISENAME, id: item.ID, DETAILEDADDRESS: item.DETAILEDADDRESS, MINERALTYPE: item.MINERALTYPE, RISK: item.RISK, TAILINGSNAME: item.TAILINGSNAME });
                    app.diangraphicsLayer.add(graphic);
                })
                xzqhTable(result.data, "dian3", "img/dian/weikuangku64_2.png");
                showCountyDetail (result.data, "dian3", "img/dian/weikuangku64_2.png");
            } else toastr.warning("未查询到结果")
        } else toastr.warning("未查询到结果")
    })
}
/**
 * 尾矿库详细信息
 * @param id
 * @param evt
 */
function wkkMessage(id, evt) {
    dengdai();
    ajaxPost("/seimp/yizhangtu/weikuangkuMessage", { id: id }).done(function (result) {
        removeDengdai();
        if (result.status == "0") {
            if (JSON.stringify(result.data) != "[]") {
                var data = result.data[0];
                $("#info_table1 #title").html(data.TAILINGSNAME);
                $("#info_table1 #title").attr("title", data.TAILINGSNAME);
                var TAILINGSNAME = data.TAILINGSNAME, DETAILEDADDRESS = data.DETAILEDADDRESS, ENTERPRISENAME = data.ENTERPRISENAME, MINERALTYPE = data.MINERALTYPE, POLLUTETYPE = data.POLLUTETYPE, RISK = data.RISK, AREACOVERAGE = data.AREACOVERAGE;
                if (TAILINGSNAME == undefined) TAILINGSNAME = ""
                if (DETAILEDADDRESS == undefined) DETAILEDADDRESS = ""
                if (ENTERPRISENAME == undefined) ENTERPRISENAME = ""
                if (MINERALTYPE == undefined) MINERALTYPE = ""
                if (POLLUTETYPE == undefined) POLLUTETYPE = ""
                if (RISK == undefined) RISK = ""
                var html = '<div class="rows"><div class="row"><div class="col-sm-3 text-right p0">尾矿库名称：</div><div class="col-sm-9">' + TAILINGSNAME + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0">详细地址：</div><div class="col-sm-9"">' + DETAILEDADDRESS + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0">所属企业名称：</div><div class="col-sm-9">' + ENTERPRISENAME + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0">矿物种类：</div><div class="col-sm-9">' + MINERALTYPE + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0"">污染类型：</div><div class="col-sm-9">' + POLLUTETYPE + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0">风险：</div><div class="col-sm-9">' + RISK + '</div></div>' +
                    '</div>';
                mapinfoWindow(data.TAILINGSNAME + "(尾矿库（绿网）)", html, evt);
            }
        }
    })
}
/**
 *尾矿库（绿网）详细数据-分布图 
 *@param num
 *@param str
 */
function wkk_fenbu(num, str) {
    dingweiUserLevel();
    removeTc(fenbuDy[num]);
    dengdai();
    var layer = new dong.ArcGISDynamicMapServiceLayer("http://" + ip + ":6080/arcgis/rest/services/seimp/QL_TAILINGS/MapServer", { id: fenbuDy[num], maxImageHeight:16, maxImageWidth:16 });
    var layerDefinitions = [];
    var jsonData = { sheng: "", shi: "", xian: "" }
    if ($("#provice").val() != "") jsonData.sheng = $("#provice option:selected").text(),dong.shengCode = $("#provice").val(),dong.shengName = jsonData.sheng;
    if ($("#city").val() != "") jsonData.shi = $("#city option:selected").text(),dong.shiCode = $("#city").val(),dong.shiName = jsonData.shi;
    if ($("#county").val() != "") jsonData.xian = $("#county option:selected").text(),dong.xianCode = $("#county").val(),dong.xianName = jsonData.xian;
    layerDefinitions[0] = "PROVINCENAME like '" + jsonData.sheng.substr(0, 2) + "%' and CITYNAME like '" + jsonData.shi.substr(0, 2) + "%' and DISTRICTNAME like '" + jsonData.xian.substr(0, 2) + "%'" +
        " and TAILINGSNAME like '" + $("#tailingsname").val() + "%' and POLLUTETYPE like '" + $("#pollutetype").val() + "%'";
    layer.setLayerDefinitions(layerDefinitions);
    app.map.addLayer(layer);
    app.map.getLayer(fenbuDy[num]).on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id, 0);
    })
    //添加鼠标移出事件
    app.map.getLayer(fenbuDy[num]).on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id, 1);
    })
    chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()); // 高亮定位
    app.map.getLayer(fenbuDy[num]).on("update-end", removeDengdai);
}
/**
 *尾矿库查询条件 
 */
function weikuangkuChaxun() {
    if (dong.ztorfb == "分布图") return wkk_fenbu(3, "1");
    else lwwkk("1");
}