//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('dataIDJson');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var id = infoEntity.id;
initPart4Content(id);
//更新更多详情信息内容



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(id) {
    ajaxPost("/seimp/shareExchange/mlr/getMlrDataByID",{
    	id:id
    }).done(function (result) {
        if (result.status == 0) {
        	console.log(result.data)
        	var item=result.data;
        
        	$("#pot_1").html(handleNullStr(item.xkzh));
        	$("#pot_2").html(handleNullStr(item.ksmc));
        	$("#pot_3").html(handleNullStr(item.kyqr));
        	$("#pot_4").html(handleNullStr(item.dz));
        	$("#pot_5").html(handleNullStr(item.yxqx));
        	$("#pot_6").html(handleNullStr(item.kz));
        	$("#pot_7").html(handleNullStr(item.zmj));
        	$("#pot_8").html(handleNullStr(item.sjgm));
        	$("#pot_9").html(handleNullStr(item.zxd_x));
        	$("#pot_10").html(handleNullStr(item.zxd_y));
        	$("#pot_11").html(handleNullStr(item.kcfs));

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
