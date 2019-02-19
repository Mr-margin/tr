//一屏幕显示
var CH = document.documentElement.clientHeight;
$('.data').css("minHeight",(CH - 176)+ 'px');
//iframe自适应高度
var browserVersion = window.navigator.userAgent.toUpperCase();
var isOpera = browserVersion.indexOf("OPERA") > -1 ? true : false;
var isFireFox = browserVersion.indexOf("FIREFOX") > -1 ? true : false;
var isChrome = browserVersion.indexOf("CHROME") > -1 ? true : false;
var isSafari = browserVersion.indexOf("SAFARI") > -1 ? true : false;
var isIE = (!!window.ActiveXObject || "ActiveXObject" in window);
var isIE9More = (! -[1,] == false);
function reinitIframe(iframeId, minHeight) {
    try {
        var iframe = document.getElementById(iframeId);
        var bHeight = 0;
        if (isChrome == false && isSafari == false) {
            try {
                bHeight = iframe.contentWindow.document.body.scrollHeight;
            } catch (ex) {                
            }
        }
        var dHeight = 0;
        if (isFireFox == true)
            dHeight = iframe.contentWindow.document.documentElement.offsetHeight;//如果火狐浏览器高度不断增加删除+2
        else if (isIE == false && isOpera == false && iframe.contentWindow) {
            try {
                dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
            } catch (ex) {
            }
        }
        else if (isIE == true && isIE9More) {//ie9+
            var heightDeviation = bHeight - eval("window.IE9MoreRealHeight" + iframeId);
            if (heightDeviation == 0) {
                bHeight += 3;
            } else if (heightDeviation != 3) {
                eval("window.IE9MoreRealHeight" + iframeId + "=" + bHeight);
                bHeight += 3;
            }
        }
        else//ie[6-8]、OPERA
            bHeight += 3;

        var height = Math.max(bHeight, dHeight);
        if (height < minHeight) height = minHeight;
        //alert(iframe.contentWindow.document.body.scrollHeight + "~" + iframe.contentWindow.document.documentElement.scrollHeight);
        iframe.style.height = height + "px";
    } catch (ex) { }
}
function startInit(iframeId, minHeight) {
    eval("window.IE9MoreRealHeight" + iframeId + "=0");
    window.setInterval("reinitIframe('" + iframeId + "'," + minHeight + ")", 100);
} 
startInit('myiframe', 560);
/*获取资源目录*/
ajaxPost("/seimp/authority/getSETreeData", {roleID: 1}).done(function (data) {
    if (data.status == 0) {
        //console.log(data.data.dataRights);
        var menuIcon;
        $.each(data.data,function(i,item){
        	if(item.name=="基础数据") {
        		menuIcon="icon-list1"
        	}else if(item.name=="土壤环境调查"){
        		menuIcon="icon-list2"
        	}else if(item.name=="农产品质量调查"){
        		menuIcon="icon-list3"
        	}else if(item.name=="土壤环境监管"){
        		menuIcon="icon-list4"
        	}else if(item.name=="土壤污染来源"){
        		menuIcon="icon-list5"
        	}else if(item.name=="土壤污染治理修复"){
        		menuIcon="icon-list6"
        	}else if(item.name=="辅助数据"){
        		menuIcon="icon-list7"
        	}
        	$(".menu1").append('<p><i class="iconfont '+menuIcon+'"></i><a href="javascript:void(0);"onclick="listSearch('+item.id+')">'+item.name+'</a><i class="iconfont icon-right"></i></p>')
        	//console.log(item.name)
        })

//        menu1获取子列表
        $(".menu1 p").mouseenter(function(){
        	$(".floatMenu").show();
        	var html="";
        	$(this).addClass("active").siblings(".menu1 p").removeClass("active");
        	var parents=$(this).children("a").html();
			//console.log(parents);
			$.each(data.data,function(i,parent){
				//console.log(parent.name)
				$(".floatMenu").show();
				if(parent.name==parents){
					//console.log(i)
					//console.log(data.data.dataRights[i].children)
					$.each(data.data[i].children,function(j,node1){
						html+='<dl class="clearfix"><dt class="text-right pull-left"><a href="javascript:void(0);" onclick="listSearch('+node1.id+')">'+node1.name+'</a><i class="iconfont icon-right"></i></dt><ul class="clearfix pull-left">';
						if(node1.children != undefined&&node1.children != ""){
							$.each(node1.children,function(i,node2){
								html+='<li class="pull-left"><a href="javascript:void(0);" onclick="listSearch('+node2.id+')">'+node2.name+'</a></li>'
							})
						}else{
//							html+='<li class="pull-left zanwu">暂无数据</li>'
							html+='<li class="pull-left zanwu">暂无分类</li>'
						}
						html+='</ul></dl>';
						$(".floatMenu>div").html(html);
					    $(".floatMenu").niceScroll({cursorcolor:"#fbfbfb",cursorwidth:"5px",cursorborder:"none"});
				      
					})	
					
					}
				})

        })  
        
        $('.menu1 p').mouseenter(function(){
			$('.floatMenu').fadeTo(0,1).stop().animate({'width':'700px'},300);

		})

		$('.dataSort').mouseleave(function(){
			$('.menu1 p').stop().removeClass("active");
			$('.floatMenu').stop().animate({'width':'0px'},300);

		})

    } else {
        toastr.error("获取数据权限失败");
    }
});

ajaxPost("/seimp/user/getDataRightByRole", {roleID: 1}).done(function (data) {
    if (data.status == 0) {
        //console.log(data.data.dataRights);
        $.each(data.data.ministries,function(i,item1){
        	
        	$(".menu2").append('<p><a href="javascript:void(0);" onclick="listSearch('+(item1.id+100)+')">'+item1.name+'</a></p>')
        	
        })
        
    } else {
        toastr.error("获取数据权限失败");
    }
});


//侧边栏菜单
$(".menu ul li>a").click(function(){
	if($(this).hasClass("active")){
		$(this).removeClass("active").next(".sub_menu").slideUp(100);
		$(this).children("i").css("transform","rotateZ(-90deg)");
	}else{
		$(document).find(".data-left ul li a.active").children("i").css("transform","rotateZ(-90deg)");
		$(document).find(".data-left ul li a.active").removeClass("active").next(".sub_menu").slideUp(100);
		$(this).addClass("active").next(".sub_menu").slideDown(100);
		$(this).children("i").css("transform","rotateZ(0deg)");
		
	}
	
})

$(function(){
	//判断是否是点击首页数据交换跳转
	var toMetaDataInfoPagePar1 = getQueryString("toMetaDataInfoPagePar1");
	var toMetaDataInfoPagePar2 = getQueryString("toMetaDataInfoPagePar2");
	if(toMetaDataInfoPagePar1 && toMetaDataInfoPagePar1!="" && toMetaDataInfoPagePar2 && toMetaDataInfoPagePar2!=""){
		toMetaDataInfoPage(toMetaDataInfoPagePar1, toMetaDataInfoPagePar2);
	}
	
	var listSearch1Par = getQueryString("listSearch1Par");
	if(listSearch1Par && listSearch1Par!=""){
		listSearch1(listSearch1Par);
	}
})

//从首页跳转到某个部位
//先控制菜单，再跳转
function listSearch1(catalogID){
	
	//控制菜单
	$("div.menu li:eq(1) a:eq(0)").click();
	
	//跳转页面到列表页面
	sessionStorage.setItem("getPageDataFunction","getPageDataByKeyCatalog('"+catalogID+"');");
    document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.document.getElementById("myiframe").src="views/data/dataSets.html";
}


//根据目录查询
function listSearch(catalogID){
	
	sessionStorage.setItem("getPageDataFunction","getPageDataByKeyCatalog('"+catalogID+"');");
    document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.document.getElementById("myiframe").src="views/data/dataSets.html";
	/*
    ajaxPost("/seimp/shareExchange/getDataListByCatalog", {
    	type:id,
    	pageNumber:1,
    	pageSize:12,
    	sortColumn:"DATETIME"
    }).done(function (result) {
        console.log(result);
        sessionStorage.setItem("resultIndex",JSON.stringify(result.data));
        parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
        window.parent.document.getElementById("myiframe").src="views/data/dataSets.html";
        if (result.page < 1) {
            return;
        }
              
    })*/
}

//跳转到数据集详情页面
function toMetaDataInfoPage(metaDataID, DeStr){
	window.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.document.getElementById("myiframe").src=metaDataHtmlUrlObj[metaDataID].url + "#" + metaDataHtmlUrlObj[metaDataID].clickPar + "?id=" + metaDataID;
}

document.getElementById("myiframe").style.height = "0px";
$("#imgOne").click(function() {
	document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
	$("#myiframe").attr("src","views/data/dataImgOne.html");
})
$("#imgTwo").click(function() {
	document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
	$("#myiframe").attr("src","views/data/dataImgTwo.html")
})
$("#imgThree").click(function() {
	document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
	$("#myiframe").attr("src","views/data/dataImgThree.html")
})


//面包屑导航

changeBread([{title: '共享交换'}]);
function backDatePage() {
    changeBread([{title: '共享交换'}]);
    $("#myiframe").attr("src","views/data/dataIndex.html")
}
function changeBread(arr) {
    $('.crumbs').empty();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].link) {
            $('.crumbs').append("<span><a href='" + arr[i].link + "'>" + arr[i].title + "</a></span>")
        } else {
            $('.crumbs').append("<span>" + arr[i].title + "</span>")
        }
    }
}

//跳转数据详情页面
//显示排污许可证详细信息
function showDetailsModal(dataIDJson, titleName, urlStr){
	$("#pwModal").modal('toggle');
	sessionStorage.setItem('dataIDJson', dataIDJson);
	$("#myModalLabel1").text(titleName);
	$("#detailsIframe").attr("src",urlStr);
	$("#detailsDiv").show();
}

//等待框显示
function dataDengdai(){
    var _PageHeight = document.documentElement.clientHeight,
        _PageWidth = document.documentElement.clientWidth;
    //计算loading框距离顶部和左部的距离（loading框的宽度为215px，高度为61px）
    var _LoadingTop = _PageHeight > 61 ? (_PageHeight - 61) / 2 : 0,
        _LoadingLeft = _PageWidth > 215 ? (_PageWidth - 215) / 2 : 0;
        
    var top = document.body.scrollTop||document.documentElement.scrollTop;
    //在页面未加载完毕之前显示的loading Html自定义内容
    var _LoadingHtml = '<div id="loadingDiv" style="position:absolute;left:0;width:100%;height:' + _PageHeight + 'px;top:'+top+'px;background:rgba(0,0,0,.2);z-index:10000;"><div style="position: absolute; cursor1: wait; left: 50%; top:' + _LoadingTop + 'px; width: auto; height: 45px; line-height: 45px; padding-left: 45px; padding-right: 15px; background: #fff url(img/loading.gif) no-repeat scroll 15px 15px; color: #333; font-family:\'Microsoft YaHei\';font-size: 18px;border-radius:6px;transform:translateX(-50%)">请等待...</div></div>';
    //呈现loading效果
    $("#yc").html(_LoadingHtml)
    
    //禁用滑动条
    $("body").css("overflow","hidden");
}

//删除等待框
function removeDataDengdai(){
    $("#loadingDiv").remove();
    $("body").css("overflow","auto");
}

