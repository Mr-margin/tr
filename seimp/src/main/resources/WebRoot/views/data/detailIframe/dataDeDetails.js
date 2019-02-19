//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var WRDKBM = infoEntity.WRDKBM;
initPart4Content(WRDKBM);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(WRDKBM) {
    ajaxPost("/seimp/wrdk/getWrdkDataByID",{
    	WRDKBM:WRDKBM
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
            $("#pot_1").html(handleNullStr(item.WRDKID));
            $("#pot_2").html(handleNullStr(item.USER_ID));
            $("#pot_3").html(handleNullStr(item.WRDKBM));
            $("#pot_4").html(handleNullStr(item.WRDKMC));
            $("#pot_5").html(handleNullStr(item.provinceName));
            $("#pot_6").html(handleNullStr(item.cityName));
            $("#pot_7").html(handleNullStr(item.countyName));
            $("#pot_8").html(handleNullStr(item.BZ));
            $("#pot_9").html(handleNullStr(item.POLLUETED));
            $("#pot_10").html(handleSCJDBM(item.SCJDBM));
            $("#pot_11").html(handleNullStr(item.FXJB));
//            $("#pot_12").html(handleNullStr(item.OPEADDRESS));
//            $("#pot_13").html(handleNullStr(item.CBDCID));
            $("#pot_14").html(handleNullStr(item.SYQDWMC));
            $("#pot_15").html(handleNullStr(item.FRDB));
            $("#pot_16").html(handleNullStr(item.GSYYZZH));
            $("#pot_17").html(handleNullStr(item.WRDKDZ));
            $("#pot_18").html(handleNullStr(item.YZBM));
            $("#pot_19").html(handleNullStr(item.DKSZFW));
            $("#pot_20").html(handleNullStr(item.ZDMJ));
            $("#pot_21").html(handleNullStr(item.ZBSM));
            $("#pot_22").html(handleNullStr(item.SYQDWXR));
            $("#pot_23").html(handleNullStr(item.SYQDWLXDH));
            $("#pot_24").html(handleNullStr(item.WRDKZXJD));
            $("#pot_25").html(handleNullStr(item.WRDKZXWD));
            $("#pot_26").html(handleNullStr(item.FAX));
            $("#pot_27").html(handleNullStr(item.EMAIL));
            
            $("#pot_28").html(handleNullStr(item.CBDCID));
            $("#pot_29").html(handleNullStr(item.CBDCBT));
            $("#pot_30").html(handleNullStr(item.DCBGNR));
            $("#pot_31").html(handleNullStr(item.CBDCZZ));
            $("#pot_32").html(handleNullStr(item.CBDCFBSJ));
            $("#pot_33").html(handleNullStr(item.DCBGLJ));
            $("#pot_34").html(handleNullStr(item.JCBGLJ));
            $("#pot_35").html(handleNullStr(handleTBJDBM(item.TBJDBM)));
            $("#pot_36").html(handleNullStr(item.SFWRDK));
            
            
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
var scjdbmObj = {
		S0 : '疑似地块',
		S1 : '初步调查',
		S2 : '详细调查',
		S3 : '风险评估',
		S4 : '风险管控',
		S5 : '土壤修复与治理',
		S6 : '土壤修复与治理评估'
}
function handleSCJDBM(value){
	var result = "";
	if(value && value!="null"){
		result = scjdbmObj[value];
	}
	return result;
}

var TBJDBMObj = {
		T1 : '填报',
		S1 : '填报完成',
		S2 : '退改'
}
function handleTBJDBM(value){
	var result = "";
	if(value && value!="null"){
		result = TBJDBMObj[value];
	}
	return result;
}

