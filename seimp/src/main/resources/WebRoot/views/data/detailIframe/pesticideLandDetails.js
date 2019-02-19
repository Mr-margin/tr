//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var ORGANID = infoEntity.ORGANID;
initPart4Content(ORGANID);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(ORGANID) {
    ajaxPost("/seimp/pesticide/getPesticideByID",{
    	ORGANID:ORGANID
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.JGMC0));
        	$("#pot_2").html(handleNullStr(item.PROVINCE));
        	$("#pot_3").html(handleNullStr(item.CITY));
        	$("#pot_4").html(handleNullStr(item.COUNTY));
        	$("#pot_5").html(handleNullStr(item.BZRQ0));
        	$("#pot_6").html(handleNullStr(item.ZFRQ0));
        	$("#pot_7").html(handleNullStr(item.DHHM1));
        	$("#pot_8").html(handleNullStr(item.TYDM0));
        	$("#pot_9").html(handleNullStr(item.JGDM0));
        	$("#pot_10").html(handleNullStr(item.JYFW0));
        	$("#pot_11").html(handleNullStr(item.JGDZ0));
        	$("#pot_12").html(handleNullStr(item.FDDBR0));
        	$("#pot_13").html(handleNullStr(item.ZCRQ0));
        	$("#pot_14").html(handleNullStr(item.BGRQ0));
        	$("#pot_15").html(handleNullStr(item.ZCZJ0));
        	$("#pot_16").html(handleNullStr(item.JYZT0));
        	$("#pot_17").html(handleNullStr(item.DHHM0));
        	$("#pot_18").html(handleNullStr(item.ZGRS0));
        	$("#pot_19").html(handleNullStr(item.JJHY20110));
        	$("#pot_20").html(handleNullStr(item.JGLX));
        	$("#pot_21").html(handleNullStr(item.ZGDM0));
        	$("#pot_22").html(handleNullStr(item.ZGMC0));
        	$("#pot_23").html(handleNullStr(item.EMAIL0));
        	$("#pot_24").html(handleNullStr(item.URL0));
        	$("#pot_25").html(handleNullStr(item.SCJYDZ0));
        	$("#pot_26").html(handleNullStr(item.SCJYXZQH0));
        	$("#pot_27").html(handleNullStr(item.GXCLDATE));
        	$("#pot_28").html(handleNullStr(item.JHBZ));
        	$("#pot_29").html(handleNullStr(item.XZQH0_NAME));
        	$("#pot_30").html(handleNullStr(item.SCJYXZQH0_NAME  ));



            
            
            console.log($(".table-left").height())
        	$(".table-right").height($(".table-left").height()-52);
            $(".table-right .qiye_map").height($(".table-left").height()-120);
        }
    });
    
}




//处理字符串为null的情况和没有值显示undefined的情况；
function handleNullStr(value){
	var result = "";
	if(value && value!="null"){
		result = value;		
	}
	return result;
}

var PRODUCTIONObj = {
		1 : '是',
		2 : '否',
}

var SURVEY_STATUSObj = {
		0:"待核查",
		1:"存疑",
		2:"完成"
}

var SURVEY_PROGRESSObj = {
		0:"国家",
		1:"省",
		2:"市",
		3:"县"
}

var UPDATA_STATUSObj = {
		1 : "默认未变化",
		3 : "位置更新",
		5 : "属性更新",
		7 : "位置更新和属性更新",
		8 : "新增点",
		10 : "新增点和位置更新",
		12 : "新增点和属性更新",
		14 : "新增点、位置更新和属性更新"
}

function handleValue(value, dataObj){
	var result = "";
	if(value && value!="null"){
		result = dataObj[value];
	}
	return result;
}
