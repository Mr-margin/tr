//获取屏幕的高度防止底部版权栏到上面去的现象
var allHeight=document.documentElement.clientHeight;
$(".view").css("minHeight",(allHeight-176)+'px');

var storage = window.sessionStorage;
if (!storage.isLogin == true) {
    window.location.href = "/seimp/login.html";
}

$(function () {
    var name = storage.getItem("name");
    var roleName = storage.getItem("roleName");
    $("#welcome").html("<b>"+name+"</b> <i>" + roleName+"</i>");
    getRouters();
});
var routers = {};
function getRouters() {
    var rights = JSON.parse(storage.getItem("rights"));
    routers = {
        'about': {
            templateUrl: 'views/about.html',
            controller: 'js/app/about.js'
        },
        'detail': {
            templateUrl: 'views/detail.html',
            controller: 'js/app/detail.js'
        },
        'newList': {
            templateUrl: 'views/newList/newList.html',
            controller: 'views/newList/newList.js'
        },
        'newDetails': {
            templateUrl: 'views/newDetails/newDetails.html',
            controller: 'views/newDetails/newDetails.js'
        },
        'yuqingDetails': {
            templateUrl: 'views/newDetails/yuqingDetails.html',
            controller: 'views/newDetails/yuqingDetails.js'
        },
        'potential_wurandikuai': {
            templateUrl: 'views/warn/potential_wurandikuai.html',
            controller: 'js/app/warn.js'
        },
        'potential_wurandikuaiDetails': {
            templateUrl: 'views/warn/potential_wurandikuaiDetails.html',
            controller: 'js/app/warn/potential_wurandikuaiDetails.js'
        },
        'yujingDetails': {
            templateUrl: 'views/warn/yujingDetails.html',
        },
        'pesticideLand': {
            templateUrl: 'views/warn/pesticideLand.html',
        }
        /*'defaults': '#portal' //默认路由*/
    };
    var html = "";
    for (var i = 0; i < rights.length; i++) {
        var tem = rights[i];
        var name = tem.ROUTER_NAME;
        
        if (i == 0) {
            routers.defaults = "#" + name;
            html += "<li class='bottom-color li-" + name + "' data='li-" + name + "'><a href='#" + name + "'>" + tem.NAME + "</a></li>"
        } else {
            html += "<li class='li-" + name + "' data='li-" + name + "'><a href='#" + name + "'>" + tem.NAME + "</a></li>"
        }
      
        var obj = {};
        obj.templateUrl = tem.URL_HTML;
        obj.controller = tem.URL_JS;
        routers[tem.ROUTER_NAME] = obj;
    }
    html += " <li class='li-about' data='li-about'><a href='#about'>关于平台</a></li>";
    vipspa.start({
        view: '#ui-view',
        router: routers,
        errorTemplateId: '#error'  //可选的错误模板，用来处理加载html模块异常时展示错误内容
    });
    $("#menus").html(html);
    $('.header li').click(function () {
        storage.item = $(this).attr('data');
        $(this).addClass('bottom-color').siblings().removeClass('bottom-color');
    });
    if (storage.item) {
        $('.' + storage.item + '').addClass('bottom-color').siblings().removeClass('bottom-color');
    }
    console.log(storage.item)
   //从首页跳转一张图改变导航状态
    console.log(window.location.href)
    if(window.location.href.indexOf("information") >= 0 ) {
    	$(".menu-head>ul>li").eq(0).removeClass("bottom-color")
    	$(".menu-head>ul>li").eq(2).addClass("bottom-color")
    }

}
$(window).bind('hashchange', function (e) {
    var hashStr = location.hash.replace("#", "");
    var tem = hashStr.split("?")[0];
    if (!storage.isLogin == true) {
            window.location.href = "/seimp/login.html";
    } else {
        console.log(tem)
        if ( tem == "portal" || tem == "yujingDetails" || tem == "information" || tem=="potential_wurandikuai" || tem=="pesticideLand" ) location.reload();
        $('.li-' + tem + '').addClass('bottom-color').siblings().removeClass('bottom-color');
       
        
    }
});

/*

function ajaxPost(url, parameter) {
    var parameterPar = {
        "token": "",
        "data": JSON.stringify(parameter)
    };
    return $.ajax(url, {
        type: "POST",
        xhrFields: {
            withCredentials: true
        },
        dataFilter: function (data, type) {
            if(checkState(data)){
                return data;
            }
        },
        crossDomain: true,
        dataType: 'Json',
        data: parameterPar
    })
}
*/


function delHtmlTag(str) {
    return str.replace(/<[^>]+>/g, "");//去掉所有的html标记
}

function GetRequest() { //截取URL的方法
    var url = window.location.hash; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?") + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

/*function checkState(data) {
    var data = JSON.parse(data);
    alert("123123");
    if (data.status == 2) {
        swal({
            title: "用户信息失效,请重新登录",
            type: "warning",
            showCancelButton: false,
            closeOnConfirm: false,
            confirmButtonText: "确定",
            confirmButtonColor: "#ec6c62"
        }, function () {
            window.location.href = "/seimp/login.html";
            return false;
        });
    } else if (data.status == 3) {
        swal({
            title: "没有访问权限",
            type: "warning",
            showCancelButton: false,
            closeOnConfirm: false,
            confirmButtonText: "确定",
            confirmButtonColor: "#ec6c62"
        }, function () {
            swal.close();
            window.history.back(-1);
            return false;
        });
    } else {
        return true;
    }
}*/
function getMyDate(str) {
    var oDate = new Date(str),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oTime = oYear + '-' + getzf(oMonth) + '-' + getzf(oDay);//最后拼接时间
    return oTime;
};
function getzf(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}


//评估分析鼠标滑过显示二级菜单
$(function(){
	ajaxPost("/seimp/authority/getMenus", {partID: 4}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            var array = data.data.right1;
			
			$(".li-warn").addClass("warn-hover");
				//$(".li-warn").append('<div><p style="border-radius: 4px;"><a href="#potential_wurandikuai"><i class="iconfont icon-tjb"></i>疑似污染地块预警</a></p><p style="border-top: 1px solid #e5e5e5;border-radius: 4px;"><a href="#yujingDetails"><i class="iconfont icon-ybp"></i>污染地块安全利用预警</a></p></div>')
			var html = "";
			html += '<div>';
			if(contains(array,"40")){
				html += '<p class="warn-hover1"><a href="#potential_wurandikuai"><i></i><span>疑似污染地块预警</span></a></p>';
			}
			if(contains(array,"41")){
				html += '<p class="warn-hover2"><a href="#pesticideLand"><i></i><span>农药厂地分析</span></a></p>';
			}
			html += '</div>';
			$(".li-warn").append(html);
			$(".li-warn").hover(function() {
				$(".li-warn>div").show();
			}, function() {
				$(".li-warn>div").hide();
			})
			$(".li-data").click(function(){
				$(".data #myiframe").attr("src","views/data/dataIndex.html")
			});
		}
    })
})

