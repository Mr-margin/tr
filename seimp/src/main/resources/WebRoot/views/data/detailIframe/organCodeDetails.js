//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var JGDM0 = infoEntity.JGDM0;
initPart4Content(JGDM0);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(JGDM0) {
    ajaxPost("/seimp/shareExchange/organCode/getOrganCodeDataByID",{
    	jgdmo:JGDM0
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.TYDM0));
        	$("#pot_2").html(handleNullStr(item.JGDM0));
        	$("#pot_3").html(handleNullStr(item.JGMC0));
        	$("#pot_4").html(handleNullStr(item.JGDZ0));
        	$("#pot_5").html(handleNullStr(item.PROVINCE));
        	$("#pot_6").html(handleNullStr(item.CITY));
        	$("#pot_7").html(handleNullStr(item.COUNTY));
        	$("#pot_8").html(handleNullStr(item.FDDBR0));
        	$("#pot_9").html(handleNullStr(item.ZCRQ0));
        	$("#pot_10").html(handleNullStr(item.BGRQ0));
        	$("#pot_11").html(handleNullStr(item.BZRQ0));
        	$("#pot_12").html(handleNullStr(item.ZFRQ0));
        	$("#pot_13").html(handleNullStr(item.ZCZJ0));
        	$("#pot_14").html(handleNullStr(item.JYZT0));
        	$("#pot_15").html(handleNullStr(item.DHHM0));
        	$("#pot_16").html(handleNullStr(item.ZGRS0));
        	$("#pot_17").html(handleNullStr(item.EMAIL0));
        	$("#pot_18").html(handleNullStr(item.URL0));
        	$("#pot_19").html(handleNullStr(item.SCJYDZ0));
        	$("#pot_20").html(handleNullStr(item.XZQH0_NAME));
        	$("#pot_21").html(handleNullStr(item.SCJYXZQH0_NAME));
        	$("#pot_22").html(handleNullStr(item.DHHM1));
        	$("#pot_23").html(handleNullStr(item.LON));
        	$("#pot_24").html(handleNullStr(item.LAT));


            
            
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

function getLon(row){
	var result = "";
	if(row){
		if(row.ZXJD_D){
			result = parseFloat(row.ZXJD_D);
		}
		
		if(row.ZXJD_F){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXJD_F)/60).toFixed(4));
		}
		
		if(row.ZXJD_M){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXJD_M)/3600).toFixed(4));
		}
		
		if((result + "").length>8){
			result = (result + "").substr(0, (result+"").indexOf(".")+5);
		}
		
	}
	return result;
}

function getLat(row){
	var result = "";
	if(row){
		if(row.ZXWD_D){
			result = parseFloat(row.ZXWD_D);
		}
		
		if(row.ZXWD_F){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXWD_F)/60).toFixed(4));
		}
		
		if(row.ZXWD_M){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXWD_M)/3600).toFixed(4));
		}
		
		if((result + "").length>8){
			result = (result + "").substr(0, (result+"").indexOf(".")+5);
		}
		
	}
	return result;
}
