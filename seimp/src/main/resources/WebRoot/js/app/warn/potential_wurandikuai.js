/**
 * 定位功能
 * 参数：
 * 	lon：经度
 * 	lat：纬度
 */
function showLocation(lon, lat, enterpriseName){
	if(lon && lat && lon >= 73.66 && lon <= 135.0416 && lat >= 3.866 && lat <= 53.9166){
		arcgisDw(lon, lat);
	}else{
		ajaxPost("/seimp/tianditu/getAddress", {
			name : enterpriseName
		}).done(function (result) {
	        if(result.status == 0){
	        	if(result.data.status == "成功"){
	        		arcgisDw(result.data.lon, result.data.lat);
	        	}
	        }
	    });
	}
}
