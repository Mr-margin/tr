

/*退出登录*/
function logout() {
    ajaxPost("/seimp/user/loginOut",{});
    storage.clear();
    window.location.href = "/seimp/login.html";
}

/*********** 展开和收起按钮 **********/
$("#configMenu").click(function () {

    if ($("#configMenu a").text() == '展开') {
        $(".menu").show();
        $("#configMenu a").text('收起');
    } else {
        $(".menu").hide();
        $("#configMenu a").text('展开');
    }
});

// 楼层导航代码
$(function () {
    //1.楼梯什么时候显示，800px scroll--->scrollTop
    $(window).on('scroll', function () {
        var $scroll = $(this).scrollTop();
        if ($scroll >= 80) {

        } else {

        }

        //4.拖动滚轮，对应的楼梯样式进行匹配
        $('.floor').each(function () {
            var $loutitop = $('.floor').eq($(this).index()).offset().top + 496;
            if ($(this).index() == 1) {
                $loutitop = $('.floor').eq($(this).index()).offset().top + 596;
            }
            if ($(this).index() == 2) {
                $loutitop = $('.floor').eq($(this).index()).offset().top + 696;
            }
            if ($(this).index() == 3) {
                $loutitop = $('.floor').eq($(this).index()).offset().top + 796;
            }
            //console.log($loutitop);
            if ($loutitop > $scroll) {//楼层的top大于滚动条的距离
                $('.floor-nav li').removeClass('active');
                $('.floor-nav li').eq($(this).index()).addClass('active');
                return false;//中断循环
            }
        });
    });

    //2.获取每个楼梯的offset().top,点击楼梯让对应的内容模块移动到对应的位置  offset().left
    var $loutili = $('.floor-nav li').not('.last');
    $loutili.on('click', function () {
        $(this).addClass('active').siblings('li').removeClass('active');
        var $loutitop = ($('.floor').eq($(this).index()).offset().top) - 80;
        if ($(this).index() == 0) {
            $loutitop = ($('.floor').eq($(this).index()).offset().top) - 80;
        }
        //获取每个楼梯的offsetTop值
        $('html,body').animate({//$('html,body')兼容问题body属于chrome
            scrollTop: $loutitop
        }, 800)
    });
    //3.回到顶部
    $('.last').on('click', function () {
        $('html,body').animate({//$('html,body')兼容问题body属于chrome
            scrollTop: 0
        }, 800)
    });
    
    //申请审批数量
    getAskDataCount();
    
 
});


/**
 * 申请审批数量
 */
function getAskDataCount(){
	 //获取访问权限的菜单
    var json = {partID:"7"};
    ajaxPost('/seimp/user/getMenus.do',json).done(function(result){
    	var data = result.data;
    	if(result.status==0){
    		//申请审批
    		if( contains(data,'730')){
    			ajaxPost('/seimp/askData/getAskDataCountByStatus.do',{}).done(function(result){
    				if(result.status==0){
    					if(result.data != "0"){
	    					$("#adkDataCount").text(result.data);
	    					$("#adkDataCount").show();
    					}else{
    						$("#adkDataCount").text("");
	    					$("#adkDataCount").hide();
    					}
    				}else{
    					$("#adkDataCount").text("");
    					$("#adkDataCount").hide();
    				}
    			})
    		}
    	}
    })
}




// 最新数据热门数据选项卡
$('.map-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
});

$('.table-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
})

/**
 * 1、叠加图层
 * 2、鼠标移动获取坐标
 * 3、鼠标移动跟随增加小窗口
 * 4、点击后跳转到实景
 */







/*** 通用跳转顶部 **/
function scrollTos() {
    window.scrollTo(0, 0);
};

/**重构方法**/

function formatNumber(number) {
    if (number.length <= 3)
        return (number == '' ? '0' : number);
    else if (number.length >= 7) {
        return formatNumber(Math.round(number / 10000) + "") + "万"
    }
    {
        var mod = number.length % 3;
        var output = (mod == 0 ? '' : (number.substring(0, mod)));
        for (i = 0; i < Math.floor(number.length / 3); i++) {
            if ((mod == 0) && (i == 0))
                output += number.substring((mod + 3 * i), (mod + 3 * i + 3));
            else
                output += ',' + number.substring((mod + 3 * i), ( mod + 3 * i + 3));
        }
        return output;
    }
}

/*封装一个遮罩层载入效果
 * 使用插件为blockUI
 * parameter：selector，method
 * selector：string，为css选择器，按照jquery中$的选择器
 * method：string，'start'or'end','start'表示启动载入效果，'end'表示关闭载入效果
 * */
function zmblockUI(selector, method) {
    if ($(selector).length == 0) {
        console.info

        (selector + "没有匹配dom元素,无法执行加载动画");
        return
    }
    if (typeof method === undefined || ["start", "end"].toString().indexOf(method) == -1) {
        console.info

        (selector + "的加载动画的method参数有误！");
        return
    }
    if (method === "start") {
        $(selector).block({
            message: '<div class="loading-message-boxed"><img src="img/loading-spinner-blue.gif"><span>&nbsp;&nbsp;努力加载中…</span></div>',
            css: {border: 0, backgroundColor: 'transparent'},
            overlayCSS: {opacity: 0.4}
        });
    } else if (method === 'end') {
        $(selector).unblock();
    }
}
