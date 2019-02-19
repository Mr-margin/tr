//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var newsid = infoEntity.newsid;
initPart4Content(newsid);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(newsid) {
    ajaxPost("/seimp/shareExchange/networkNews/getNetworkNewsDataByID",{
    	newsid:newsid
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
            $("#pot_1").html(handleNullStr(item.title));
            $("#pot_2").html(handleNullStr(item.content));
            $("#pot_3").html(handleNullStr(item.url));
            $("#pot_4").html(handleNullStr(item.source));
            $("#pot_5").html(handleNullStr(item.fetchTime));
            $("#pot_6").html(handleNullStr(item.summary));
            $("#pot_7").html(handleNullStr(item.newsType));
            $("#pot_8").html(handleNullStr(item.domain));
            $("#pot_9").html(handleNullStr(handleChinaRegion(item.chinaRegion1)));
            $("#pot_10").html(handleNullStr(handleChinaRegion(item.chinaRegion2)));
            $("#pot_11").html(handleNullStr(handleChinaRegion(item.chinaRegion3)));
            $("#pot_12").html(handleNullStr(item.DICT_type));
            $("#pot_13").html(handleNullStr(handlState(item.state)));
            
            
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

function handleValue(value, dataObj){
	var result = "";
	if(value && value!="null"){
		result = dataObj[value];
	}
	return result;
}

function handlState(value){
	var result = "";
	if(value){
		if(value == 0){
			result = "审核通过";
		}else if(value == 1){
			result = "审核未通过";
		}
	}else{
		result = "未审核";
	}
	return result;
}

function handleChinaRegion(value){
	var result = "";
	if(value){
		var codeAndNameArr = value.split(",");
		for (var i = 0; i < codeAndNameArr.length; i++) {
			var currCodeAndName = codeAndNameArr[i];
			var codeOrNameArr = currCodeAndName.split("_");
			if(codeOrNameArr.length>1){
				result += codeOrNameArr[1] + ",";
			}
		}
		if(result.length>1){
			return result.substr(0, result.length-1);
		}
		return result;
	}
	return result;
}


