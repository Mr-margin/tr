/**
 * 配置文件
 */
var myconfig = {};

/*****信息公开*********/
myconfig.warn = {
    jjj: "http://10.100.244.19:60800/geoserver/lwb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=lwb:京津冀&maxFeatures=50&outputFormat=application/json",
    csj: "http://10.100.244.19:60800/geoserver/lwb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=lwb:长三角&maxFeatures=50&outputFormat=application/json",
    zsj: "http://10.100.244.19:60800/geoserver/lwb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=lwb:珠三角&maxFeatures=50&outputFormat=application/json"
}

/*********预警分析***********/
myconfig.warn = {
    jjj: "http://10.100.196.8:6080/arcgis/rest/services/seimp/京津冀/MapServer",
    csj: "http://10.100.196.8:6080/arcgis/rest/services/seimp/长三角/MapServer",
    zsj: "http://10.100.196.8:6080/arcgis/rest/services/seimp/珠三角/MapServer"
}


// var ip = "10.100.244.19";
var ip = "192.168.1.24";

//地图初始化边界
var extentPar = {
    "xmin": 65.765135846784, "ymin": 13.1245384992698, "xmax": 150.23486415321602, "ymax": 54.8754615007302,
    "spatialReference": {"wkid": 4326}
}

function showHide() {
    $('#mylegend .sldeDown').slideToggle("slow")
    if ($('#mylegend small img').attr('src') == '../../img/arrow_down.png') {
        $('#mylegend small img').attr('src', '../../img/arrow_up.png')
    } else {
        $('#mylegend small img').attr('src', '../../img/arrow_down.png')
    }
}
function showHide1() {
    $('.find_box').slideToggle("slow")
    if ($('.findBoxTitle').attr('src') == '../../img/arrow_down.png') {
        $('.findBoxTitle').attr('src', '../../img/arrow_up.png')
    } else {
        $('.findBoxTitle').attr('src', '../../img/arrow_down.png')
    }
}

function maxmain(oldmax) {
    if (oldmax < 6) {
        return 6;
    }
    var min = oldmax / 6;
    var last = Math.ceil((min) / 10) * 60;
    return last;

}

/*封装一个遮罩层载入效果
 * 使用插件为blockUI
 * parameter：selector，method
 * selector：string，为css选择器，按照jquery中$的选择器
 * method：string，'start'or'end','start'表示启动载入效果，'end'表示关闭载入效果
 * */
function zmblockUI(selector, method) {
    if ($(selector).length == 0) {
        console.info

        (selector + "没有匹配dom元素,无法执行加载动画");
        return
    }
    if (typeof method === undefined || ["start", "end"].toString().indexOf(method) == -1) {
        console.info

        (selector + "的加载动画的method参数有误！");
        return
    }
    if (method === "start") {
        $(selector).block({
            message: '<div class="loading-message-boxed"><img src="../../img/loading-spinner-blue.gif"><span style="color:white; font-size: 18px;">&nbsp;&nbsp;努力加载中…</span></div>',
            css: {border: 0, backgroundColor: 'transparent'},
            overlayCSS: {opacity: 0.4}
        });
    } else if (method === 'end') {
        $(selector).unblock();
    }
}

function checkState(data) {
    var data = JSON.parse(data);
    if (data.status == 2) {
        swal({
            title: "用户信息失效,请重新登录",
            type: "warning",
            showCancelButton: false,
            closeOnConfirm: false,
            confirmButtonText: "确定",
            confirmButtonColor: "#ec6c62"
        }, function () {
            window.parent.location.href = "/seimp/login.html";
            return false;
        });
    } else if (data.status == 3) {
        swal({
            title: "没有访问权限",
            type: "warning",
            showCancelButton: false,
            closeOnConfirm: false,
            confirmButtonText: "确定",
            confirmButtonColor: "#ec6c62"
        }, function () {
            window.history.back(-1);
            swal.close();
            // swal("请联系管理员获取权限", "", "success");
            //  window.location.href = "/seimp/index.html";
            return false;
        });
    } else if(data.status == 4){
    	toastr.error("输入参数包含敏感字符");
    	return false;
	}else{
        return true;
    }
}

/**
 * 验证是否有模块权限与增加元数据的点击量
 * @param url
 * @param parameter
 * @returns
 */
function ajaxPost(url, parameter) {
    var parameterPar = {
        "token": "",
        "data": JSON.stringify(parameter)
    };
    return $.ajax(url, {
        type: "POST",
        xhrFields: {
            withCredentials: true
        },
        dataFilter: function (data, type) {
            if (checkState(data)) {
                return data;
            }
        },
        crossDomain: true,
        dataType: 'Json',
        data: parameterPar
    })
}
function ajaxAsyncPost(url, parameter) {
    var parameterPar = {
        "token": "",
        "data": JSON.stringify(parameter)
    };
    return $.ajax(url, {
        type: "POST",
        async: false,
        xhrFields: {
            withCredentials: true
        },
        dataFilter: function (data, type) {
            if (checkState(data)) {
                return data;
            }
        },
        crossDomain: true,
        dataType: 'Json',
        data: parameterPar
    })
}
function contains(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//获取url参数
function getQueryString(name) { 
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.hash.substr(6).match(reg); 
	if (r != null) return unescape(r[2]); return null; 
}

function handleNullValue(value){
	if(value == null){
		return "";
	}else{
		return value;
	}
}


var metaDataHtmlUrlObj = {
		"10" : {
			"url" : "views/data/dataDe.html",//污染地块
			"isHasDe1" : true,
			"clickPar" : "De1",
			"statisColumn" : "TSAMP",
			"statisTable" : "TB_WRDKJBXXB",
			"statisColumnType" : "1"
		},
		"5" : {
			"url" : "views/data/hangyejianguan.html",//重点行业监管企业
			"isHasDe1" : true,
			"clickPar" : "De1",
			"statisColumn" : "createTime",
			"statisTable" : "tb_key_industry_enterprise",
			"statisColumnType" : "2"
		},
		"7" : {
			"url" : "views/data/yzCons.html",//建设项目环评
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "INSERTTIME",
			"statisTable" : "YZ_CONS",
			"statisColumnType" : "2"
		},
		"37" : {
			"url" : "views/data/enterBase.html",//排污许可证-企业基本信息
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "INSERTTIME",
			"statisTable" : "ENTERPRICE_BASEINFO",
			"statisColumnType" : "2"
		},
		"36" : {
			"url" : "views/data/enterUndo.html",//排污许可证-注销/撤销数据
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "INSERTTIME",
			"statisTable" : "ENTERPRICE_UNDOINFO",
			"statisColumnType" : "2"
		},
		"35" : {
			"url" : "views/data/tailings.html",//尾矿库（滤网）数据
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "INSERTTIME",
			"statisTable" : "TB_TAILINGS",
			"statisColumnType" : "2"
		},
		"9" : {
			"url" : "views/data/wy.html",//重点行业监管企业，遥感核查
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "GW_UPDATE_TIME",
			"statisTable" : "tb_wurandikuai_yaoganhecha",
			"statisColumnType" : "1"
		},
		"30" : {
			"url" : "views/data/eb.html",//淘汰落后产能企业
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "IMPORT_TIME",
			"statisTable" : "ELIMINATE_BACKWARD",
			"statisColumnType" : "1"
		},
		"38" : {
			"url" : "views/data/organCode.html",//组织机构代码
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "GXCLDATE",
			"statisTable" : "TB_ORGANIZATION_CODE",
			"statisColumnType" : "2"
		},
		"28" : {
			"url" : "views/data/mlr.html",//涉重有色金属采矿权项目
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "inserttime",
			"statisTable" : "mlr_mining_rights",
			"statisColumnType" : "3"
		},
		"27" : {
			"url" : "views/data/dataLanduse.html",//土地利用
			"isHasDe1" : false,
			"isHasDe5" : false,
			"clickPar" : "De2",
			"statisColumn" : "",
			"statisTable" : "",
			"statisColumnType" : ""
		},
		"39" : {
			"url" : "views/data/dataGq.html",//发改委灌区
			"isHasDe1" : false,
			"isHasDe5" : false,
			"clickPar" : "De2",
			"statisColumn" : "",
			"statisTable" : "",
			"statisColumnType" : ""
		},
		"4" : {
			"url" : "views/data/water.html",//工业废水基本信息表
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME_HBB_BIGDATA",
			"statisTable" : "T_GY_WASTEBASCIMESSAGE",
			"statisColumnType" : "3"
		},
		"6" : {
			"url" : "views/data/jubao12369.html",//12369举报预警
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "INSERTTIME",
			"statisTable" : "YQ12369_DSJ_REPORTINFO",
			"statisColumnType" : "3"
		},
		"1" : {
			"url" : "views/data/indPar.html",//工业园区
			"isHasDe1" : false,
			"isHasDe5" : false,
			"clickPar" : "De2",
			"statisColumn" : "",
			"statisTable" : "",
			"statisColumnType" : ""
		},
		"12" : {
			"url" : "views/data/networkNews.html",//网络舆情
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "INSERTTIME",
			"statisTable" : "tb_network_news",
			"statisColumnType" : "3"
		},
		"23" : {
			"url" : "views/data/wxfwtmc.html",//危险废物填埋场
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "SCRQ",
			"statisTable" : "T_CER_BURYREPORT",
			"statisColumnType" : "3"
		},
		"22" : {
			"url" : "views/data/wxfwjydw.html",//危险废物经营单位
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "FZRQ",
			"statisTable" : "T_CER_BASEREPORT",
			"statisColumnType" : "3"
		},
		"20" : {
			"url" : "views/data/ghggtfwqx.html",//含汞试剂生产_含汞固体废物去向
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_HBHG302_GFQX",
			"statisColumnType" : "3"
		},
		"19" : {//没找到
			"url" : "views/data/ggtfwqx.html",//含汞试剂生产_固体废物去向
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_HBHG301_GFQX",
			"statisColumnType" : "3"
		},
		"18" : {
			"url" : "views/data/gpfygk.html",//企业汞排放源概况
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_HBHG201_SUB",
			"statisColumnType" : "3"
		},
		"17" : {
			"url" : "views/data/gqyjbxx.html",//企业基本信息(汞调查)
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_HBHG101",
			"statisColumnType" : "3"
		},
		"16" : {
			"url" : "views/data/cpqd.html",//产品清单
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_JH102",
			"statisColumnType" : "3"
		},
		"15" : {
			"url" : "views/data/hqyjbxx.html",//企业基本信息(危险化学品)
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_JH101",
			"statisColumnType" : "3"
		},
		"14" : {
			"url" : "views/data/qypfgk.html",//企业排放概况
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_EEY_PFY_GK",
			"statisColumnType" : "3"
		},
		"13" : {
			"url" : "views/data/jqyjbxx.html",//企业基本信息(持久性有机物)
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME",
			"statisTable" : "T_BUS_EEY_QY_XX",
			"statisColumnType" : "3"
		},
		"3" : {
			"url" : "views/data/suanyu.html",//酸雨
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "DATA_UPLOADINGTIME",
			"statisTable" : "INI_ACIDRAIN_INFO",
			"statisColumnType" : "3"
		},
		"8" : {
			"url" : "views/data/ysxm.html",//验收项目
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "UPDATETIME_HBB_BIGDATA",
			"statisTable" : "YZ_BAS_ACPT",
			"statisColumnType" : "3"
		},
		"34" : {
			"url" : "views/data/yswrdk.html",//（疑似）污染地块
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "LANDSTATUSUPDATETIME",
			"statisTable" : "TB_POLLUTION_LAND_STRUCTURE",
			"statisColumnType" : "2"
		},
		"40" : {
			"url" : "views/data/tailings2.html",//尾矿库数据
			"isHasDe1" : false,
			"clickPar" : "De2",
			"statisColumn" : "JCSJ",
			"statisTable" : "TB_TAILINGS2",
			"statisColumnType" : "1"
		},
}
