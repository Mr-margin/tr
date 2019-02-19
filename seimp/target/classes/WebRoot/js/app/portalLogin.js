$(function(){
	var urlStr = window.location.href;
	var result = parseUrl(urlStr);
	for (var i = 0; i < result.length; i++) {
		var currItem = result[i];
		if(currItem && currItem.TOKEN && currItem.TOKEN!='undefined' && currItem.TOKEN!=""){
			var token = currItem.TOKEN;
			var url = '/seimp/user/portalLogin';
		    var data = {
		    	token: token
		    }
		    ajaxPost1(url, data).done(function (data) {
		    	if (data.status == 0) {
		            $("#name").html("");
		            $("#pwd").html("");
		            var storage = window.sessionStorage;
		            storage["rights"] = JSON.stringify(data.data.rights);
		            storage["userID"] = data.data.userID;
		            storage["roleName"] = data.data.roleName;
		            storage["roleID"] = data.data.roleID;
		            storage["regionCode"] = data.data.regionCode;
		            storage["name"] = data.data.name;
		            storage["userLevel"] = data.data.userLevel;
		            storage["isLogin"] = true;
		            storage["token"] = data.data.token;

		            
		            window.location.href = "/seimp/index.html";
		            /*var url = location.search; //获取url中"?"符后的字串
		            if (url.indexOf("?") != -1) {  //判断是否有参数
		                var str = url.substr(1); //从第一个字符开始 因为第0个是?号 获取所有除问号的所有符串
		                strs = str.split("=");  //用等号进行分隔 （因为知道只有一个参数 所以直接用等号进分隔 如果有多个参数 要用&号分隔 再用等号进行分隔）
		                if ( strs[1].indexOf("http://") != -1){//http://114.251.10.109/shareuserlogin.jsp
		                    window.location.href = strs[1]+"?token="+data.data.token;
		                } else {
		                    window.location.href ="http://"+strs[1]+"?token="+data.data.token;
		                }

		            } else {
		                window.location.href = "/seimp/index.html";
		            }*/
		        } else {
		            toastr.error(data.msg);
		            getImage();
		        }
		    })
			console.log(token);
		}
	}
})

function parseUrl(url){
    var result = [];
    var query = url.split("?")[1];
    if(query){
	    var queryArr = query.split("&");
	    queryArr.forEach(function(item){
	        /*var obj = {};
	        var value = item.split("=")[1];
	        var key = item.split("=")[0];
	        obj[key] = value;
	        result.push(obj);*/
	    	
	    	var obj = {};
	    	var key = "TOKEN";
	    	var value = item.substr(6);
	        obj[key] = value;
	        result.push(obj);
	    	
	    });
    }
    return result;
}

function ajaxPost1(url, parameter) {
    var parameterPar = {
        "token": "",
        "data": JSON.stringify(parameter)
    };
    return $.ajax(url, {
        type: "POST",
        dataType: 'Json',
        data: parameterPar
    })
}

function getImage() {
    document.getElementById('image').src = "/seimp/user/getImage?" + Math.random();
}