//专题图-建设项目环评
function jiansheCount(str) {
    var json = {};
    var provinceName = "";
    if ($("#provice").val()) {
    	provinceName = $("#provice option:selected").text();
    }
    json = { 
    		sheng: provinceName, 
    		sjly: $("#js_sjly").val(), 
    		hphymc:$("#js_hphymc").val(),
    		gmjjmc:$("#js_hphymc").val(),
    		slrqq:$("#js_slrqq").val(),
    		slrqz:$("#js_slrqz").val()
    }
    if ($("#provice").val() == "") json.sheng = "";
    if (str == "1") {
        //json = { sheng: $("#provice option:selected").text(), sjly: $("#js_sjly").val() }
        if ($("#provice").val() == "") json.sheng = "";
        else chaxunDingwei_zhuantitu($("#provice").val(), "", "")
    }
    addjsxmhpData(json);
}
/**
 * 添加建设环评数据
 * @param jsonData
 */
function addjsxmhpData(json){
	ajaxPost("/seimp/yizhangtu/jsxmhpCount", json).done(function (result) {
        removeDengdai();//删除等待框
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                $("#tongjituDiv thead").html("");
                $("#tongjituDiv tbody").html("");
                var data = result.data;
                var datas = [];
                $.each(data, function (i, item) {
                    if (datas.length > 0) {
                        var flg = true;
                        $.each(datas, function (a, b) {
                            if (item.name == b.name) {
                                datas[a].COUNT = parseInt(item.COUNT) + parseInt(b.COUNT);
                                flg = false;
                            }
                        })
                        if (flg) {
                            datas.push(item);
                        }
                    } else {
                        datas.push(item);
                    }
                })
                shengShu(datas);
                xzqhTable(datas, "jianshe");
                // 详情
                jsxmhpShowDetail(json);
            } else {
            	removeTc("countLayer"); // 清空计数图层
                toastr.warning("未查询到结果")
            }
        } else {
        	removeTc("countLayer"); // 清空计数图层
        	toastr.warning("未查询到结果");
        }
    })
}
/**
 * 建设项目环评详情
 * @param json
 */
function jsxmhpShowDetail(jsonData) {
	ajaxPost("/seimp/yizhangtu/jsxmhpDetail", jsonData).done(function (result) {
        if ( result.status == 0 ) {
            if (JSON.stringify(result.data) != "[]"){
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
        		if ($("#provice").val() == "") { // 全国
					// 全国
        			yname = "省份名称";
					i = 9; 
            		if (barData.length <= 9) { // 全国数据展示前十个省
            			i = barData.length - 1;
            		}
            		$(".wrdk_barTip").empty();
            		$(".wrdk_barTip").append("<p>建设项目环评排名前十的省份</p>")
            		barName = "建设项目环评排名前十的省份";
				} else { // 市县
					// 省一节   市县数据不做展示数量限制
					var strButton = goingUpOneLevel(jsonData);
					isProvinceOrCity = true;
					yname = "市县名称";
					i = barData.length-1;
					$(".wrdk_barTip").empty();
            		$(".wrdk_barTip").append("<p>建设项目环评排名</p>"+strButton)
            		barName = "建设项目环评排名";
				}
            	for (i; i >=0; i--) { // 排名前十的数据
            		var temp = {
            				value:barData[i].COUNT,
            				code:barData[i].code
            		}
            		
            		if (barData[i].name) {
            			bar_yAxisData.push(barData[i].name);
            			bar_xAxisData.push(temp);
            		} 
            	}
            	showIntroduction(getCurrentCityName(),isProvinceOrCity,result.data.zs[0].COUNT,result.data.yst,nameNumOne); // 文字描述
            	creatBar(bar_yAxisData,bar_xAxisData,barName,yname,"个"); // 柱状图
            } else {
                toastr.warning("未查询到结果")
            }
        }
    })
}
//分布图-建设项目环评
function jianshe_fenbu(num, str) {
    dingweiUserLevel();
    dengdai();
    removeTc(fenbuDy[num]);
    //将地图服务对象添加到地图容器中
    var json;
    //if (str == "1") {
//        json = { sheng: $("#provice option:selected").text(), sjly: $("#js_sjly").val() }
//        if ($("#provice").val() == "") json.sheng = "";
//        else chaxunDingwei($("#provice").val(), "", "")
    
    	//需做判断处理，查全部时查切片图层，有条件时查另一个图层
		// 判断查询条件是否全部为空
	if ($("#provice").val() == "" && $("#js_sjly").val() == "") {
		var layer = new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/QL_YZ_CONS/MapServer", { id: fenbuDy[num] });
	} else {
		var layer = new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/QL_YZ_CONS2/MapServer", { id: fenbuDy[num] });
	}
	var startData = "";
    var endData = "";
    if ($("#js_slrqq").val()) {
    	startData = " and ACCEPTANCEDATE >= '" + $("#js_slrqq").val() + "'";
    }
    if ($("#js_slrqz").val()) {
    	endData = " and ACCEPTANCEDATE <= '" + $("#js_slrqz").val() + "'"
    }
    var layerDefinitions = [];
    var provinceName = "";
    if ($("#provice").val()) {
    	provinceName = $("#provice option:selected").text();
    }
    layerDefinitions[0] = "PROVINCENAME like '"+provinceName+
    	"%' and DATASOURCE like '"+$("#js_sjly").val() +
    	"%' and EIAMANAGENAME like '"+$("#js_hphymc").val() +
    	"%' and EIAMANAGENAME like '"+$("#js_hphymc").val() + startData + endData +
    	"%' AND LON2 IS NOT NULL";
    layer.setLayerDefinitions(layerDefinitions);
    app.map.addLayer(layer);
//} else {
    app.map.addLayer(new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/QL_YZ_CONS/MapServer", { id: fenbuDy[num] }));
//}
    app.map.getLayer(fenbuDy[num]).on("click", function (evt) {
        console.log(evt.graphic.attributes.ESRI_OID);
        tableDingwei(evt.pageX, evt.pageY);
        var src = "img/dian/jianshe64_2.png";
        clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
        _doSpatialQuery(evt, json);
    })
    app.map.getLayer(fenbuDy[num]).on("update-end", removeDengdai);
    //fenbu_tckz("建设项目环评",fenbuDy[num],0)
    chaxunDingwei_zhuantitu($("#provice").val(),"",""); // 高亮定位
    /*ajaxPost("/seimp/yizhangtu/getjiansheMessage", json).done(function (result) {
        removeDengdai()
        if ( result.status == 0 ) {
            if (JSON.stringify(result.data) != "[]"){
                removeTc("countLayer");
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/jianshe.png", 32, 32);
                pointSymbol.setOffset(0,20);
                $.each(result.data,function(i,item){
                    if( item.LONGITUDE> 65.765135846784 && item.LONGITUDE <150.23486415321602 && item.LATITUDE > 13.1245384992698 && item.LATITUDE < 54.8754615007302){
                        var point = new dong.Point(handle_x(item.LONGITUDE),handle_y(item.LATITUDE), new dong.SpatialReference({ wkid: 102100 }));
                        var graphic = new dong.Graphic(point,pointSymbol,"","");
                        graphic.setAttributes( {CONSTRUCTIONID:item.CONSTRUCTIONID});
                        app.map.getLayer(fenbuDy[num]).add(graphic);
                    }
                })
                fenbu_tckz("建设项目环评",fenbuDy[num],0)
            }else  toastr.warning("未查询到结果")
        } else  toastr.warning("未查询到结果")
    })*/
}



function chaxunDian(event) {
	if (!dong.measure) {
		var layer = app.map.getLayersVisibleAtScale();
	    var layers=[];
	    $.each(layer, function (i, item) {
	        console.log(item.id)
	        if ((item.id).indexOf("fenbu") != -1) {
	            layers.push(item);
	        }
	    })

	    if ( layers.length > 0 ) {
	        var lly=[] ;
	        for(var a = layers.length-1; a >=0 ; a-- ) {
	            lly.push(layers[a]);
	        }
	        console.log(lly);
	        yibuLayer(lly,0,event)
	    }
	}
    
}

function yibuLayer(layers,num,event){
    if ( num > layers.length) return;
    var point = event.mapPoint;
    var idpara = new dong.IdentifyParameters();
    idpara.returnGeometry = true;
    idpara.tolerance = 50;
    idpara.outFields = ["*"];
    idpara.geometry = point;
    idpara.width = app.map.width;
    idpara.height = app.map.height;
    idpara.mapExtent = app.map.extent;
    var url = layers[num].url;
    if (url) {
    	var identifyTask = dong.IdentifyTask(layers[num].url);
        identifyTask.execute(idpara, function (evt) {
            if (evt.length == 0) {
                yibuLayer(layers,num++,event)
            } else {
                var attributes = evt[0].feature.attributes;
                return chooseInterface(layers[num].id, event, evt);
            }
        });
    }
}
/**
 * 执行空间查询
 * @param evt {}
 * 
 */
function _doSpatialQuery(evt, json) {
    var esri_oid = evt.graphic.attributes.ESRI_OID
    var queryTask = new dong.QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/QL_YZ_CONS/MapServer/0");
    var query = new dong.Query();
    query.outFields = ["CONSTRUCTIONID"];
    if (json) {
        query.where = "PROVINCENAME = '" + json.sheng + "' AND DATASOURCE = '" + json.sjly + "'";
    } else {
        query.where = "ESRI_OID=" + esri_oid;
    }
    queryTask.execute(query, function (fs) {
        console.log(fs.features[0].attributes.CONSTRUCTIONID);
        jiansheMessage(fs.features[0].attributes.CONSTRUCTIONID, evt);
    })
}

/**
 * 
 */
function chooseInterface(itemId, event, evt) {
    var num = itemId.split("_")[1];
    if (num == "2") {
    	yaogenMessage(evt[0].feature.attributes.OID,event);//重点监管企业遥感核查
    } else if (num == "3") {
    	wkkMessage(evt[0].feature.attributes.ID,event);//尾矿库（绿网）
    } else if (num == "5") {
        var constructionid = evt[0].feature.attributes.CONSTRUCTIONID;
        jiansheMessage(constructionid, event);//建设项目环评
    } else if (num == "6") {
    	paiwuMessage(evt[0].feature.attributes.DATAID,event);//排污许可数据
    } else if (num == "7") {
    	zuzhijigouMessage(evt[0].feature.attributes.JGMC0,event);//组织机构代码
    }

}
//建设项目环评详细信息
function jiansheMessage(constructionid, evt) {
    dengdai();
    ajaxPost("/seimp/yizhangtu/getjiansheDianMessage", { id: constructionid }).done(function (result) {
        removeDengdai();
        if (result.status == 0) {
            if (JSON.stringify(result.data) != "[]") {
                var data = result.data[0];
                var PROJECTNAME = data.PROJECTNAME, EIAFILETYPE = data.EIAFILETYPE, ACCEPTANCEDATE = data.ACCEPTANCEDATE, DATASOURCE = data.DATASOURCE, PROJECTINVEST = data.PROJECTINVEST, ENVIRONINVEST = data.ENVIRONINVEST,
                    NATIONALECONOMYNAME = data.NATIONALECONOMYNAME, EIAMANAGENAME = data.EIAMANAGENAME, PROJECTADDRESS = data.PROJECTADDRESS;
                if (PROJECTNAME == undefined || PROJECTNAME == "") PROJECTNAME = ""
                if (EIAFILETYPE == undefined || EIAFILETYPE == " ") EIAFILETYPE = ""
                if (ACCEPTANCEDATE == undefined || ACCEPTANCEDATE == " ") ACCEPTANCEDATE = ""
                if (DATASOURCE == undefined || DATASOURCE == "") DATASOURCE = ""
                if (PROJECTINVEST == undefined || PROJECTINVEST == "") PROJECTINVEST = ""
                if (ENVIRONINVEST == undefined || ENVIRONINVEST == "") ENVIRONINVEST = ""
                if (NATIONALECONOMYNAME == undefined || NATIONALECONOMYNAME == "") NATIONALECONOMYNAME = ""
                if (EIAMANAGENAME == undefined || EIAMANAGENAME == "") EIAMANAGENAME = ""
                if (PROJECTADDRESS == undefined || PROJECTADDRESS == "") PROJECTADDRESS = ""

                $("#info_table1 #title").html(PROJECTNAME);
                $("#info_table1 #title").attr("title", PROJECTNAME);
                var html = '<div class="rows"><div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">项目名称：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;" >' + PROJECTNAME + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">环评文件类别：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + EIAFILETYPE + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">受理日期：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + ACCEPTANCEDATE + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">数据来源：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + DATASOURCE + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">建设地点：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + PROJECTADDRESS + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">总投资（万元）：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + PROJECTINVEST + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">环保投资（万元）：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + ENVIRONINVEST + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">国民经济类别名称：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + NATIONALECONOMYNAME + '</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;">环评管理类别名称：</div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;">' + EIAMANAGENAME + '</div></div>' +
                    '</div>';
                // $("#info_table1 .table-body").html(html);
                // $("#info_table1").show();
                // $("#info_table1").addClass("yj_table");
                // $("#info_table1 .table-body").height($(".yj_table .table-body .rows").height()+10);
                // $("#info_table1 ").css("minHeight",$(".yj_table .table-body .rows").height()+50);
                mapinfoWindow(PROJECTNAME+ "(建设项目环评)", html, evt);
            } //else toastr.warning("未查询到结果")

        } //else toastr.warning("未查询到结果")
    })
}
//建设项目环评-查询条件
function jiansheChaxun() {
    if (dong.ztorfb == "分布图") return jianshe_fenbu(5, "1");
    else jiansheCount("1");
}