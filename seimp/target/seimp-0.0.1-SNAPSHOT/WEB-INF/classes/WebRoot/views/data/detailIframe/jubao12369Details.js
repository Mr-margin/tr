//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var REPORT_ID = infoEntity.REPORT_ID;
initPart4Content(REPORT_ID);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(REPORT_ID) {
    ajaxPost("/seimp/shareExchange/jubao12369/getJubaoDataByID",{
    	REPORT_ID:REPORT_ID
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.EVENT_NUMBER));
        	$("#pot_2").html(handleNullStr(handleREPORT_FROM(item.REPORT_FROM)));
        	$("#pot_3").html(handleNullStr(item.REPORT_DEPT_NAME));
        	$("#pot_4").html(handleNullStr(item.LOCATION_LABEL));
        	$("#pot_5").html(handleNullStr(item.PROVINCE));
        	$("#pot_6").html(handleNullStr(item.CITY));
        	$("#pot_7").html(handleNullStr(item.COUNTY));
        	$("#pot_8").html(handleNullStr(item.REPORT_CONTENT));
        	$("#pot_9").html(handleNullStr(item.REPORT_LONGITUDE));
        	$("#pot_10").html(handleNullStr(item.REPORT_LATITUDE));
        	$("#pot_11").html(handleNullStr(item.PROCESS_AREA_UNITNAME));
        	$("#pot_12").html(handleNullStr(item.FINALOPINION));
        	$("#pot_13").html(handleNullStr(item.REPORT_TIME));
        	$("#pot_14").html(handleNullStr(item.INSERTTIME));



            
            
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
		0 : '微信',
		1 : '电话',
		2 : '网络',
}

function handleREPORT_FROM(value){
	var result = "";
	if(value && value!="null"){
		result = scjdbmObj[value];
	}
	return result;
}
