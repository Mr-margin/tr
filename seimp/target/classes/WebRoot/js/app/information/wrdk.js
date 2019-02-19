/**
 * 污染地块基本信息
 * @param name
 * @param num
 */
function wrdkjbxx(name, num) {
	var data;
	if (num == "0") data = dong.wrdkData;
	else data = dong.yswrdkData;
	$("#title").html(name);
	var headHtml = "<tr><td style='width:40px'>序号</td><td>地块名称</td><td>行政区划</td><td>占地面积(㎡)</td><td>四至范围</td><td>所处阶段</td><td>联系人</td><td style='border-right:0'>联系电话</td></tr>";
	var bodyHtml = '';
	var SCJDBM = { S0: "疑似地块", S1: "初步调查", S2: "详细调查", S3: "风险评估", S4: "风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估" }
	$.each(data, function (i, item) {
		var WRDKDZ = item.WRDKDZ;
		if (item.WRDKDZ.length > 10) WRDKDZ = item.WRDKDZ.substr(0, 10) + "...";
		var DKSZFW = item.DKSZFW;
		if (item.DKSZFW.length > 10) DKSZFW = item.DKSZFW.substr(0, 10) + "...";
		// S0: 疑似地块 S1:初步调查 S2: 详细调查 S3: 风险评估 S4:风险管控 S5: 土壤修复与治理 S6: 土壤修复与治理评估
		bodyHtml += "<tr><td>" + (i + 1) + "</td><td>" + item.WRDKMC + "</td><td title='" + item.WRDKDZ + "'>" + WRDKDZ + "</td><td>" + item.ZDMJ + "</td><td title='" + item.DKSZFW + "'>" + DKSZFW + "</td><td>" + SCJDBM[item.SCJDBM] + "</td><td>" + item.SYQDWXR + "</td><td style='border-right:0'>" + item.SYQDWLXDH + "</td></tr>";
	})
	$("#tongjituDiv thead").html(headHtml);
	$("#tongjituDiv tbody").html(bodyHtml);
	$("#tongjituDiv").show();
}
/**
 * 污染企业信息
 * @param name
 */
function showqiye(name) {
	var data = dong.qiyeData;
	//显示弹出框
	$("#title").html(name);
	var headHtml = "<tr><td style='width:40px'>序号</td><td>企业名称</td><td>产业类型</td><td>省份</td><td>市</td><td>县</td><td>乡</td><td>村</td><td>备注</td><td style='border-right:0'>数据来源</td></tr>";
	var bodyHtml = "";
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		bodyHtml += "<tr><td>" + (i + 1) + "</td><td>" + currItem.NAME + "</td><td>" + currItem.DALEI + "</td><td>" + currItem.SHENG + "</td><td>" + currItem.SHI + "</td><td>" + currItem.XIAN + "</td><td>" + currItem.XIANG + "</td><td>" + currItem.CUN + "</td><td>" + currItem.REMARK + "</td><td style='border-right:0'>" + currItem.LAIYUAN + "</td></tr>";
	}
	$("#tongjituDiv").show();
	$("#tongjituDiv thead").html(headHtml);
	$("#tongjituDiv tbody").html(bodyHtml);
}
/**
 * 污染地块数字图层
 */
function wrdkShu() {
	var jsonData = { sheng: "", shi: "", xian: "", scjd: "", dkbm: "", shengCode: "", shiCode: "", xianCode: "" }
	if (dong.num == "11") { // 疑似污染地块
		jsonData.yisi = "1";
		jsonData.dkbm = "S0";
		jsonData.dkmc = $("#dkmc").val();
	}
	if (dong.num == "1") { // 污染地块
		jsonData.scjd = $("#scjd option:selected").val();
		jsonData.fxjb = $("#fxjb option:selected").val();
		jsonData.dkbm = $("#dkbm").val();
		jsonData.dkmc = $("#dkmc").val();
	}
	ajaxPost("/seimp/yizhangtu/wrdkCount", getConditionOfQueryCode(jsonData)).done(function (result) {
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
				xzqhTable(result.data);
				// 展示详细信息 
				var name = "";
				if (dong.shiName) {
					name = dong.shiName;
				} else if (dong.shengName) {
					name = dong.shengName;
				}
				showDetail(jsonData,name);
			} else {
				toastr.warning("未查询到结果")
			}
		}
	})
}
/**
 * 污染地块详情
 * @param jsonData
 */
function showDetail(jsonData,name) {
	ajaxPost("/seimp/yizhangtu/wrdkDetail", jsonData).done(function (result) {
		if (result.status == 0) {
			if (JSON.stringify(result.data) != "[]") {
				var resultData = result.data;
				var data_scjdbm = resultData.scjdbm; // 饼图数据
				var showNum = resultData.detail.length;
				var numLaterMonth = resultData.nearlyMonth[0].NEARLYONEMONTH;
				var barData = resultData.detail; // 柱状图数据
				var nameNumOne = ""; // 污染地块最多的省
				if (resultData.detail.length > 0) {
					nameNumOne = resultData.detail[0].name;
				}
				var pieLegends = [];
				var pie_data = [];
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
					if (dong.num == 11) {
						$(".wrdk_barTip").empty();
						$(".wrdk_barTip").append("<p>疑似污染地块数量排名前十的省份</p>")
						barName = "疑似污染地块数量排名前十的省份";
					} else {
						$(".wrdk_barTip").empty();
						$(".wrdk_barTip").append("<p>污染地块数量排名前十的省份</p>")
						barName = "污染地块数量排名前十的省份";
					}
				} else { // 市县
					isProvinceOrCity = true;
					var strButton = goingUpOneLevel(jsonData);
					yname = "市县名称";
					i = barData.length - 1;
					if (dong.num == 11) {
						$(".wrdk_barTip").empty();
						$(".wrdk_barTip").append("<p>疑似污染地块数量排名</p>"+strButton);
						barName = "疑似污染地块数量排名";
					} else {
						$(".wrdk_barTip").empty();
						$(".wrdk_barTip").append("<p>污染地块数量排名</p>"+strButton);
						barName = "污染地块数量排名";
					}
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
				//S0: 疑似地块 S1:初步调查 S2: 详细调查 S3: 风险评估 S4:风险管控 S5: 土壤修复与治理 S6: 土壤修复与治理评估
				var landType = {
					S0: '疑似地块', S1: '初步调查', S2: '详细调查', S3: '风险评估',
					S4: '风险管控', S5: '土壤修复与治理', S6: '土壤修复与治理评估'
				}
				for (var i = 0; i < data_scjdbm.length; i++) {
					var tempObj = {};
					var type = result.data.scjdbm[i].SCJDBM;
					var typeNumber = result.data.scjdbm[i].COUNT1;
					tempObj.value = typeNumber;
					tempObj.name = landType[type];
					pieLegends.push(landType[type]);
					pie_data.push(tempObj);
				}
				showIntroduction(name,isProvinceOrCity, result.data.wrdkzs[0].COUNT, yst, nameNumOne, numLaterMonth); // 文字描述
				if (!jsonData.xian) { // 县级以下不再生成柱状图
					creatBar(bar_yAxisData, bar_xAxisData, barName, yname, "块"); // 柱状图
				}
			} else {
				toastr.warning("未查询到结果")
			}
		}
	})
}
/**
 * 污染地块文字简介
 * @param isProvinceOrCity 是否是省或者市
 * @param totalNumPloat 总数
 * @param showNum 已上图
 * @param nameNumOne 数量第一
 * @param numLaterMonth 最近一月
 */
function showIntroduction(name,isProvinceOrCity, totalNumPloat, showNum, nameNumOne, numLaterMonth) {
	$("#wrdk_detail").html("");
	var detail = "";
	if (dong.num == "6") { // 排污许可数据
		if (isProvinceOrCity) { // 市县不展示污染最多的名称
			detail = "根据上报排污许可数据确认<strong>"+name+"</strong>为排污许可企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报排污许可数据确认<strong>"+name+"</strong>为排污许可企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，排污许可企业数量最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	} else if (dong.num == "1") {
		if (isProvinceOrCity) { // 市县不展示污染最多的名称
			detail = "根据上报地块数据确认<strong>"+name+"</strong>污染地块共计<strong>" + totalNumPloat + "</strong>块，已上图<strong>" + showNum +
				"</strong>块，其中最近 30 天内确认污染地块数据为<strong>" + numLaterMonth + "块。</strong>";
		} else {
			detail = "根据上报地块数据确认<strong>"+name+"</strong>污染地块共计<strong>" + totalNumPloat + "</strong>块，已上图<strong>" + showNum +
				"</strong>块，其中最近 30 天内确认污染地块数据为<strong>" + numLaterMonth + "</strong>块，污染地块最多的省份为<strong>" + nameNumOne + "</strong>";

		}
	} else if (dong.num == "11") { // 疑似污染地块
		if (isProvinceOrCity) { // 市县不展示污染最多的名称
			detail = "<strong>"+name+"</strong>当前疑似污染地块共计<strong>" + totalNumPloat + "</strong>块，已上图<strong>" + showNum +
				"</strong>块，其中最近 30 天内确认污染地块数据为<strong>" + numLaterMonth + "块。</strong>";
		} else {
			detail = "<strong>"+name+"</strong>当前疑似污染地块共计<strong>" + totalNumPloat + "</strong>块，已上图<strong>" + showNum +
				"</strong>块，其中最近 30 天内确认污染地块数据为<strong>" + numLaterMonth + "</strong>块，污染地块最多的省份为<strong>" + nameNumOne + "</strong>";
		}
	} else if (dong.num == "3") {
		if (isProvinceOrCity) {
			detail = "根据上报尾矿库（绿网）数据确认<strong>"+name+"</strong>排污许可企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报尾矿库（绿网）数据确认<strong>"+name+"</strong>排污许可企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，尾矿库（绿网）数量最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	} else if (dong.num == "2") {
		if (isProvinceOrCity) {
			detail = "根据上报重点监管企业遥感核查数据确认<strong>"+name+"</strong>重点监管企业遥感核查企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报重点监管企业遥感核查数据确认<strong>"+name+"</strong>重点监管企业遥感核查企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，重点监管企业遥感核查数量最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	} else if (dong.num == "4") {
		if (isProvinceOrCity) {
			detail = "根据上报淘汰落后产能企业数据确认<strong>"+name+"</strong>淘汰落后产能企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报淘汰落后产能企业数据确认<strong>"+name+"</strong>淘汰落后产能企业共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，淘汰落后产能企业数量最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	} else if (dong.num == "7") {
		if (isProvinceOrCity) {
			detail = "根据上报组织机构代码数据确认<strong>"+name+"</strong>组织机构代码数据共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报组织机构代码数据确认<strong>"+name+"</strong>组织机构代码数据共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，组织机构代码数据最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	} else if (dong.num == "8") {
		if (isProvinceOrCity) {
			detail = "根据上报重点行业监管企业数据确认<strong>"+name+"</strong>组织机构代码数据共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报重点行业监管企业数据确认<strong>"+name+"</strong>组织机构代码数据共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，重点行业监管企业数据最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	} else if (dong.num == "5") {
		if (isProvinceOrCity) {
			detail = "根据上报建设项目环评数据确认<strong>"+name+"</strong>组织机构代码数据共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个。";
		} else {
			detail = "根据上报建设项目环评企业数据确认<strong>"+name+"</strong>组织机构代码数据共计<strong>" + totalNumPloat + "</strong>个，已上图<strong>" + showNum +
				"</strong>个，建设项目环评数据最多的省份为<strong>" + nameNumOne + "。</strong>";
		}
	}
	$("#wrdk_detail").html(detail);
}
/**
 * 柱状图
 * @param xdata
 * @param ydata
 * @param dw // 单位
 */
var wrdk_bar;
function creatBar(xdata, ydata, name, yname, dw) {
	option = {
		title: {
			text: "",
			x: 'center',
			textStyle: {
				fontSize: 15
			},
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			confine: true,
			formatter: function (params) {
				var result = '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[0].color + ';"></span>'
					+ params[0].seriesName + '<br>' + params[0].name + ': ' + params[0].value + "(" + dw + ")";
				return result;
			}
		},
		grid: {
			left: '5%',
			bottom: '3%',
			top:'2%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			name: dw,
			nameGap: 2,
			axisLabel: {
				fontSize: 8,
				rotate:40 
			}
		},
		yAxis: {
			type: 'category',
			data: xdata,
			name: yname,
			axisLabel: {
				interval: 0,
				fontSize: 11,
				formatter: function (v) {
					var name = v;
					if (name.length > 5) {
						return name.substring(0, 5) + '\n' + name.substring(5);

					} else {
						return name
					}
				}
			}
		},
		series: [
			{
				name: name,
				type: 'bar',
				itemStyle: {
					normal: { color: '#5b9bd5' }
				},
				barWidth: 5,
				barCateGoryGap:10,
				data: ydata
			}
		]
	};
	if (wrdk_bar != null && wrdk_bar != "" && wrdk_bar != undefined) {
		wrdk_bar.dispose();
	}
	$("#wrdk_bar").show();
	$("#countryDetail").hide();
	wrdk_bar = echarts.init(document.getElementById("wrdk_bar"));
	wrdk_bar.setOption(option);
	wrdk_bar.on('click', function (params) {
		var code = params.data.code;
		var name = params.name;
		if (dong.num == "5") {
			return; // 建设项目环评柱状图取消点击
		}
		if (dong.num == "2") {
			// 1.设置下拉框的值
			if (!$("#provice1").val()) {
				$("#provice1").val(code);
				getCity1();
			} else if (!$("#city1").val()) {
				$("#city1").val(code)
				// 获取县
				getCounty1();
				removeTc("shi");
			} else {
				$("#county1").val(code)
				removeTc("xian");
				//chaxunDingwei_zhuantitu($("#provice1").val(), $("#city1").val(), $("#county1").val()) // 地图高亮定位
			}
		} else {
			// 1.设置下拉框的值
			if (!$("#provice").val()) {
				$("#provice").val(code);
				getCity();
				dong.shengName = name;
			} else if (!$("#city").val()) {
				$("#city").val(code)
				// 获取县
				getCounty();
				removeTc("shi");
				dong.shiName = name;
			} else {
				$("#county").val(code)
				removeTc("xian");
				dong.xianName = name;
				//chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()) // 地图高亮定位
			}
		}
		if (dong.num == "1" || dong.num == "11") { // 污染地块或疑似污染地块
			chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()) // 地图高亮定位
			getQueryLayer(); // 添加图层
			// 数据展示 addwrdkData(json);
			var queryJson = getWrdkQueryCondition();
			// 从新生成柱状图和详细信息
			if (!$("#county").val()) { // 县级通过点显示详情，这里不显示
				showDetail(queryJson,name);
			}
			updateEndLayerAddData(queryJson); // 获取查询条件并在地图上添加数据
		} else if (dong.num == "6") {
			pwxk_zhuanti("1")
		} else if (dong.num == "3") {
			lwwkk("1");
		} else if (dong.num == "2") {
			yaoganChaxun(); // 重点监管企业遥感核查
		} else if (dong.num == "4") {
			luohou_zhuangti("1");
		} else if (dong.num == "7") {
			zuzhijigou_zhuanti("1");
		} else if (dong.num == "8") {
			zhongdian_zhuanti("1")
		}
	});
}
/**
 * 污染地块条件查询
 * @param num
 */
function wrdkChaxun(num) {
	console.log(num);
	if (num == "5") return jiansheChaxun();
	else if (num == "6") return paiwuChaxun();
	else if (num == "3") return weikuangkuChaxun();
	else if (num == "4") return luohouChaxun();
	else if (num == "8") return zhongdainChaxun();
	else if (num == "7") return zuzhijigouChaxun();
	if (dong.ztorfb == "分布图") return wrdk_fenbu(dong.wrdktj, "1");
	// if (app.map.getLayer("sheng") == undefined) return toastr.warning("未查询到结果");
	var json = { sheng: $("#provice").val(), shi: $("#city").val(), xian: $("#county").val(), scjd: $("#scjd").val(), dkbm: $("#dkbm").val(), fxjb: $("#fxjb").val(), dkmc: $("#dkmc").val() }
	var queryJson = getWrdkQueryCondition();
	//查询定位
	chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val())
	getQueryLayer();
	// 判断是市图层还是县图层
	updateEndLayerAddData(queryJson);
}
/**
 * 图层加载完毕添加数据
 * @param queryJson
 */
function updateEndLayerAddData(queryJson) {
	if (dong.tucengType == "shi") {
		app.shi.on("update-end", function (e) {
			addwrdkData(queryJson);
		});
	} else if (dong.tucengType == "xian" && $("#county").val() == "") { // 查询到市一级
		app.xian.on("update-end", function (e) {
			addwrdkData(queryJson);
		});
	} else if (dong.tucengType == "sheng") {
		addwrdkData(queryJson);
	} else if (dong.tucengType == "xian" && $("#county").val() != "") { // 县下一级
		// 县下一级
		dianMessage(queryJson.xian)
	}
}
/**
 * 获取污染地块查询条件
 */
function getWrdkQueryCondition() {
	var json = { sheng: $("#provice").val(), shi: $("#city").val(), xian: $("#county").val(), scjd: $("#scjd").val(), dkbm: $("#dkbm").val(), fxjb: $("#fxjb").val(), dkmc: $("#dkmc").val() }
	if (dong.num == "11") { // 疑似污染地块
		json.yisi = "1";
		json.dkmc = $("#dkmc").val();
	}
	if (dong.num == "1") { // 污染地块
		json.scjd = $("#scjd option:selected").val();
		json.fxjb = $("#fxjb option:selected").val();
		json.dkbm = $("#dkbm").val();
		json.dkmc = $("#dkmc").val();
	}
	return json
}
/**
 * 添加污染地块条件查询数据
 */
function addwrdkData(json) {
	dengdai();
	ajaxPost("/seimp/yizhangtu/wrdkCount", json).done(function (result) {
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
				var name = "";
				if (dong.shiName) {
					name = dong.shiName;
				} else if (dong.shengName) {
					name = dong.shengName;
				}
				xzqhTable(result.data);
				showDetail(json,name);
			} else {
				removeTc("countLayer");
				toastr.warning("未查询到结果")
			}
		}
	})
}
/**
 * 污染地块点的详细信息
 * @param code
 */
function dianMessage(code) {
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
	//点击事件
	app.diangraphicsLayer.on("click", function (evt) {
		tableDingwei(evt.pageX, evt.pageY);
		var src = "img/dian/wurandikuai64_2.png";
		if (dong.num == "11") src = "img/dian/yisiwrdk64_1.png";
		clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
		fujin(evt, dong.num);
	})
	var json = { code: code }
	if (dong.num == "11") {
		json.yisi = "1";
		json.dkbm = $("#dkbm").val();
		json.dkmc = $("#dkmc").val();
	}
	if (dong.num == "1") {
		json.scjd = $("#scjd option:selected").val();
		json.fxjb = $("#fxjb option:selected").val();
		json.dkbm = $("#dkbm").val();
		json.dkmc = $("#dkmc").val();
	}
	ajaxPost("/seimp/yizhangtu/xianDian", json).done(function (result) {
		if (result.status == 0) {
			if (JSON.stringify(result.data) != "[]") {
				var src = "wurandikuai";
				if (dong.num == "11") src = "yisiwrdk"
				var pointSymbol = new dong.PictureMarkerSymbol("img/dian/" + src + ".png", 24, 24);
				pointSymbol.setOffset(0, 0);
				$.each(result.data, function (i, item) {
					var point = new dong.Point(handle_x(item.WRDKZXJD), handle_y(item.WRDKZXWD), new dong.SpatialReference({ wkid: 102100 }));
					var graphic = new dong.Graphic(point, pointSymbol, "", "");
					graphic.setAttributes({ id: item.WRDKBM, WRDKBM: item.WRDKBM, WRDKMC: item.WRDKMC, BZ: item.BZ, POLLUETED: item.POLLUETED, SCJDBM: item.SCJDBM, FXJB: item.FXJB });
					app.diangraphicsLayer.add(graphic);
				})
				var url = "img/dian/wurandikuai64_2.png"
				if (dong.num == "11") url = "img/dian/yisiwrdk64_1.png"
				xzqhTable(result.data, "dian", url);
				showCountyDetail(result.data, "dian", url);
			} else toastr.warning("未查询到结果")
		} else toastr.warning("未查询到结果")
	})
}
/**
 * 污染地块点的分布
 * @param num
 * @param str
 */
function wrdk_fenbu(num, str) {
	dingweiUserLevel();
	removeTc(fenbuDy[num]);
	dengdai();
	app.map.addLayer(new dong.GraphicsLayer({ id: fenbuDy[num] }));

	app.map.getLayer(fenbuDy[num]).on("mouse-over", function (evt) {
		tableHight(evt.graphic.attributes.id, 0);
	})
	//添加鼠标移出事件
	app.map.getLayer(fenbuDy[num]).on("mouse-out", function (evt) {
		tableHight(evt.graphic.attributes.id, 1);
	})
	//点击事件
	app.map.getLayer(fenbuDy[num]).on("click", function (evt) {
		tableDingwei(evt.pageX, evt.pageY);
		var src = "img/dian/wurandikuai64_2.png";
		if (num == "11") src = "img/dian/yisiwrdk64_1.png";
		clickDian(evt.graphic.geometry.x, evt.graphic.geometry.y, src);
		fujin(evt, num);
	})
	var json = { sheng: $("#provice").val(), shi: $("#city").val(), xian: $("#county").val(), scjd: $("#scjd").val(), dkbm: $("#dkbm").val(), fxjb: $("#fxjb").val(), dkmc: $("#dkmc").val() }
	dong.shengCode = $("#provice").val();
    dong.shiCode = $("#city").val();
    dong.xianCode = $("#county").val();
	if (num == "11") {
		json.yisi = "1";
		json.scjd = "";
	}
	if (str != null && str != undefined) {
		json.sheng = $("#provice").val();
		json.shi = $("#city").val();
		json.xian = $("#county").val();
		if (json.sheng != "") {
			//查询定位
			chaxunDingwei($("#provice").val(), "", "")
		}
	}
	if (!iszhuantitu()) { // 分布图高亮定位
		chaxunDingwei_zhuantitu($("#provice").val(), $("#city").val(), $("#county").val()); // 高亮定位
	}
	ajaxPost("/seimp/yizhangtu/xianDian", json).done(function (result) {
		removeDengdai()
		if (result.status == 0) {
			if (JSON.stringify(result.data) != "[]") {
				removeTc("countLayer");
				var src = "wurandikuai";
				if (num == "11") src = "yisiwrdk";
				var pointSymbol = new dong.PictureMarkerSymbol("img/dian/" + src + ".png", 24, 24);
				pointSymbol.setOffset(0, 0);
				$.each(result.data, function (i, item) {
					if (item.WRDKZXJD > 65.765135846784 && item.WRDKZXJD < 150.23486415321602 && item.WRDKZXWD > 13.1245384992698 && item.WRDKZXWD < 54.8754615007302) {
						var point = new dong.Point(handle_x(item.WRDKZXJD), handle_y(item.WRDKZXWD), new dong.SpatialReference({ wkid: 102100 }));
						var graphic = new dong.Graphic(point, pointSymbol, "", "");
						graphic.setAttributes({ id: item.WRDKBM, WRDKBM: item.WRDKBM, WRDKMC: item.WRDKMC, BZ: item.BZ, POLLUETED: item.POLLUETED, SCJDBM: item.SCJDBM, FXJB: item.FXJB });
						app.map.getLayer(fenbuDy[num]).add(graphic);
					}
				})
			} else toastr.warning("未查询到结果")
		} else toastr.warning("未查询到结果")
	})
}
/**
 * 点击点进行标识
 * @param lon
 * @param lat
 * @param str
 */
function clickDian(lon, lat, str) {
	removeTc("wrdkcentral")
	app.map.addLayer(new dong.GraphicsLayer({ id: "wrdkcentral" }));
	var attrs = {
		graType: "wrdkcentral"
	}
	var pointSymbol = new dong.PictureMarkerSymbol(str, 45, 45);
	pointSymbol.setOffset(0, 20);
	var point = new dong.Point(lon, lat, new dong.SpatialReference({ wkid: 102100 }));
	var graphic = new dong.Graphic(point, pointSymbol, attrs);
	graphic.setAttributes({ id: "" });
	app.map.getLayer("wrdkcentral").add(graphic);
}

/**
 * 创建饼图
 * @param legends
 * @param data
 * @param text
 */
/*function creatPie(legends,data,text) {
	option = {
			title : {
		        text: text,
		        x:'center',
		        textStyle:{
			       fontSize:15
			    },
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    legend: {
		        orient: 'horizontal',
		        top: '60%',
		        textStyle: {
		        	fontSize: 12
		        },
		        data: legends //  ['直接访问','邮件营销','联盟广告','视频广告']
		    },
		   
		    series : [
		        {
		            name: '污染地块',
		            type: 'pie',
		            radius : '16%',
		            center: ['40%', '40%'],		           
		            labelLine:{  
		                normal:{  
		                    length:5  
		                }  
		            },  
		           
		            data:data,
		            avoidLabelOverlap:true,
		            itemStyle: {
		                emphasis: {
		                    shadowBlur: 10,
		                    shadowOffsetX: 0,
		                    shadowColor: 'rgba(0, 0, 0, 0.5)'
		                }
		            },
		           
		        }
		    ]
		};
	var wrdk_pie = echarts.init(document.getElementById("wrdk_pie"));
	wrdk_pie.setOption(option);
}*/