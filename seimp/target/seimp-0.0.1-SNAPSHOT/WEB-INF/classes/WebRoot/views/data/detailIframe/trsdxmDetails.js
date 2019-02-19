//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var ID = infoEntity.ID;
initPart4Content(ID);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(ID) {
    ajaxPost("/seimp/shareExchange/trsdxm/getTrsdxmDataByID",{
    	ID:ID
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.XMMC));
        	$("#pot_2").html(handleNullStr(item.XMLX));
        	$("#pot_3").html(handleNullStr(item.LON));
        	$("#pot_4").html(handleNullStr(item.LAT));
        	$("#pot_5").html(handleNullStr(item.BEIZHU));
        	$("#pot_6").html(handleNullStr(item.DIZHI));
        	$("#pot_7").html(handleNullStr(item.SHENG));
        	$("#pot_8").html(handleNullStr(item.SHI));
        	$("#pot_9").html(handleNullStr(item.XIAN));
        	$("#pot_10").html(handleNullStr(item.ZHEN));
        	$("#pot_11").html(handleNullStr(item.CUN));

            
            
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
