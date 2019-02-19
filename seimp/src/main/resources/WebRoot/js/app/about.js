/**
 * Created by liujun on 2017/9/5.
 */

// 一屏幕显示
var CH = document.documentElement.clientHeight;
$('.about').css("minHeight",(CH -176)+ 'px');

// 初始化菜单插件MetsiMenu
$('#side-menu').metisMenu();

// 动态菜单栏绝对居中;
// var wWidth = ($('.warn .map-item').width())+'px';


// 一二级菜单图标区分
$('.map-view .sidebar-collapse').find('#side-menu').children('li').children('ul').find('a').children('span:first-child').addClass('fa fa fa-folder');
$('.map-view .sidebar-collapse').find('#side-menu').children('li').children('a').children('span:first-child').addClass('fa fa fa-folder-o');

// 菜单层级分化
$('.map-view .sidebar-collapse').find('#side-menu').children('li').
children('ul').children('li').css({'padding-top':'10px'}).children('a').css({'padding-left':'40px','font-size':'12px','color':'rgb(155,155,155);'});

// $('.map-view .sidebar-collapse').find('#side-menu').children('li').
// children('ul').children('li').children('ul').children('li').
// children('a').css({'padding-left':'41px'});
//
// $('.map-view .sidebar-collapse').find('#side-menu').children('li').
// children('ul').children('li').children('ul').children('li').children('ul').children('li').
// children('a').css({'padding-left':'74px'});
// $('.map-view .sidebar-collapse').find('#side-menu').children('li').
// children('ul').children('li').children('ul').children('li').children('ul').children('li').
// children('ul').children('li').children('a').css({'padding-left':'101px'});

// 第一级主菜单设置样式

$('.map-view .nav-main').children('li').css({'padding':'0'});

$('.map-view .nav-main').children('li').children('a').css({'padding':'22px','border-bottom':'1px solid #ddd'});



function getMyDate(str){
    var oDate = new Date(str),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth()+1,
        oDay = oDate.getDate(),
        oTime = oYear +'-'+ getzf(oMonth) +'-'+ getzf(oDay);//最后拼接时间
    return oTime;
};

function getzf(num){
    if(parseInt(num) < 10){
        num = '0'+num;
    }
    return num;
}

$('.map-menu ul li').click(function(tem){
    var mapMenu = (-$('.map-item').width()-91)/2+'px';
    $('.map-item').css({'margin-left':mapMenu})
})



function changeBread(arr) {
    $('.page_title').empty();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].link) {
            $('.page_title').append("<span><a href='" + arr[i].link + "'>" + arr[i].title + "</a></span>")
        } else {
            $('.page_title').append("<span>" + arr[i].title + "</span>")
        }
    }
}
/*********************变量********************/
//对象
yearTime="2017";

/***** 初始化页面 ****/
$(function(){
    //initBootstrapTable();
});
$("#intruction").click(function () {
    changeDiv(1);
})
$("#version_info").click(function () {
    changeDiv(2);
})
function changeDiv(flag) {
    $(".parts").hide();
    switch (flag) {
        case 1://
            $("#intruction1").show();
            break;
        case 2://
            $("#versionInfo").show();
            var $timeline_block = $('.cd-timeline-block');
            $timeline_block.each(function(){
                console.log($(this).offset().top)
                if($(this).offset().top > $(window).scrollTop()+$(window).height()*0.75) {
                    $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
                }
            });
            //on scolling, show/animate timeline blocks when enter the viewport
            $(window).on('scroll', function(){
                $timeline_block.each(function(){
                    if( $(this).offset().top <= $(window).scrollTop()+$(window).height()*0.75 && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) {
                        $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
                    }
                });
            });
            break;
    }
}

function initBootstrapTable(){
    //销毁表格
    $('#table_template').bootstrapTable('destroy');
    //生成表格
    $('#table_template').bootstrapTable({
        method: 'POST',
        url: "system/getUserList",
        dataType: "JSON",
        /*contentType: "text/html; charset=utf-8",*/
        iconSize: "outline",
        //crossDomain: true,
        // clickToSelect: true,//点击选中行
        pagination: true,	//在表格底部显示分页工具栏
        pageSize: 15,	//页面大小
        /* pageNumber: 1,	//页数*/
        pageList: [10, 15, 20, 50],
        striped: true,	 //使表格带有条纹
        sidePagination: "server",//表格分页的位置 client||server
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        },
        columns: [{ // 列设置
            field: 'state',
            // 使用单选框

        }, {
            field: 'id',
        }, {
            field: 'login_name',
            title: '登录名',
            align: 'center',
            valign: 'middle',
            //  sortable: true // 开启排序功能
        }, {
            field: 'user_name',
            title: '用户姓名',
            align: 'center',
            valign: 'middle',
        },{
            field: 'user_name',
            title: '用户角色',
            align: 'center',
            valign: 'middle',
        },{
            field: 'user_name',
            title: '用户等级',
            align: 'center',
            valign: 'middle',
        },{
            field: 'tel',
            title: '电话',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'email',
            title: '邮箱',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'create_time',
            title: '创建时间',
            align: 'center',
            valign: 'middle',
        },  {
            field: 'operate',
            title: '操作',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                return [
                    '<a  class="edit" title="edit" onclick="update(' + row.id + ')" style="cursor:pointer" >',
                    '修改',
                    '</a>  ',
                    '&nbsp;&nbsp;&nbsp;&nbsp;',
                    '<a class="remove"  onclick="remove('+row.id+')" title="Remove" style="cursor:pointer">',
                    '删除',
                    '</a>',
                ].join('');
            },
            events: window.operateEvents,
        }]
    });
};

function queryParams1(params) {
    var datas = {};
    datas.pageSize = params.limit;
    datas.pageNumber = params.offset;
    return datas;
}

function queryParams2(params) {
    var datas = {};
    datas.pageSize = params.limit;
    datas.pageNumber = params.offset;
    return datas;
}


