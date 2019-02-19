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
    ajaxPost("/seimp/pesticide2/getPesticideByID",{
    	ID:ID
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.XIANQIMINGCHENG));
        	$("#pot_2").html(handleNullStr(item.XIANQIDIZHI));
        	$("#pot_3").html(handleNullStr(item.YUANQIYEMINGCHENG));
        	$("#pot_4").html(handleNullStr(item.YUANQIDIZHI));
        	$("#pot_5").html(handleNullStr(item.SHENG));
        	$("#pot_6").html(handleNullStr(item.SHI));
        	$("#pot_7").html(handleNullStr(item.XIAN));
        	$("#pot_8").html(handleNullStr(item.CHANGNENG));
        	$("#pot_9").html(handleNullStr(item.LEIXING));
        	$("#pot_10").html(handleNullStr(item.BEIZHU));

        	var tableHtml = "";
        	if(item.productList && item.productList.length>0){
        		var productList = item.productList;
        		for (var i = 0; i < productList.length; i++) {
					var productItem = productList[i];
					tableHtml += "<tr><td>"+(i+1)+"</td><td>"+handleNullStr(productItem.CHANPINLEIBIE)+"</td><td>"+handleNullStr(productItem.CHANPINMINGCHENG)+"</td><td>"+handleNullStr(productItem.SHENGCHANPIJIANHAO)+"</td></tr>";
				}
        		$("#pesticideInfoTable tbody").html(tableHtml);
        	}else{
        		$("#pesticideInfoTable tbody").html("");
        	}
        	
            
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
