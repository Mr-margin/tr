//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var OID = infoEntity.OID;
initPart4Content(OID);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(OID) {
    ajaxPost("/seimp/shareExchange/wy/getWYDataByID",{
    	OID:OID
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.NAME));
        	$("#pot_2").html(handleNullStr(item.SHENG));
        	$("#pot_3").html(handleNullStr(item.SHI));
        	$("#pot_4").html(handleNullStr(item.XIAN));
        	$("#pot_5").html(handleNullStr(item.XIANG));
        	$("#pot_6").html(handleNullStr(item.CUN));
        	$("#pot_7").html(handleNullStr(item.LONGITUDE));
        	$("#pot_8").html(handleNullStr(item.LATITUDE));
        	$("#pot_9").html(handleNullStr(item.LAIYUAN));
        	$("#pot_10").html(handleNullStr(item.REMARK));
        	$("#pot_11").html(handleNullStr(item.DALEI));
        	$("#pot_12").html(handleNullStr(item.BIEMIN));
        	$("#pot_13").html(handleNullStr(item.BIANHAO));
        	$("#pot_14").html(handleNullStr(item.PREDID));
        	$("#pot_15").html(handleNullStr(item.AFTDID));
        	$("#pot_16").html(handleNullStr(handleValue(item.PRODUCTION, PRODUCTIONObj)));
        	$("#pot_17").html(handleNullStr(item.BUILDTIME));
        	$("#pot_18").html(handleNullStr(handleValue(item.LINK, PRODUCTIONObj)));
        	$("#pot_19").html(handleNullStr(handleValue(item.IS_GUIMO, PRODUCTIONObj)));
        	$("#pot_20").html(handleNullStr(item.qiye));
        	$("#pot_21").html(handleNullStr(handleValue(item.SURVEY_STATUS, SURVEY_STATUSObj)));
        	$("#pot_22").html(handleNullStr(handleValue(item.SURVEY_PROGRESS, SURVEY_PROGRESSObj)));
        	$("#pot_23").html(handleNullStr(handleValue(item.UPDATA_STATUS, UPDATA_STATUSObj)));
        	$("#pot_24").html(handleNullStr(item.ELSEINFO));



            
            
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
