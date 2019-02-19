/**
 * Created by liujun on 2017/9/5.
 */

/*根据角色获取菜单*/
//一屏幕显示
var CH = document.documentElement.clientHeight;
$('.system').css("minHeight",(CH -176)+ 'px');
$('.system #updateManage .page_body').css("minHeight",(CH -262)+ 'px')
$('.system #updateManage .roleAdd').css("minHeight",(CH -262)+ 'px')

getMenus();
var rights = [];
function getMenus() {
    ajaxPost("/seimp/user/getMenus", {partID: 7}).done(function (data) {
        if (data.status == 0) {
        	
            var html = "";
            var array = data.data;
            rights = data.data;
            var flag = 0;
            var id = 0;
            if (contains(array, "71")) {
                html += '<li class="active first"> <a href="javascript:void(0);" id="post_info"> <span><img src="img/xxfbgl.png"></span> <span class="nav-label">资讯动态管理</span>' +
                    '<span class="fa arrow"></span></a> <ul class="nav nav-second-level">'
                if (contains(array, "710")) {
                    if (contains(array, "7100")) {
                        if (flag == 0) {
                            flag == 1;
                            id = 5;
                        }
                        html += '<li><a class="J_menuItem" id="record_info" onclick="changeBg(this,5)">增加资讯动态</a></li>';
                    }
                    if (flag == 0) {
                        flag == 1;
                        id = 6;
                    }
                    html += '<li><a class="J_menuItem bg_blue" id="info_manage" onclick="changeBg(this,1)">资讯动态管理</a></li>';
                }
                if (contains(array, "711")) {
                    if (flag == 0) {
                        flag == 1;
                        id = 11;
                    }
                    html += '<li><a class="J_menuItem" id="netWork_manage" onclick="changeBg(this,11)">网络舆情管理</a></li>';
                }
                html += '</ul></li>';
            }
            if (contains(array, "70")) {
                html += ' <li class="second"><a href="javascript:void(0);"> <span><img src="img/yhgl.png"></span><span class="nav-label">用户管理</span><span class="fa arrow"></span></a><ul class="nav nav-second-level">';
                if (contains(array, "700")) {
                    if (contains(array, "7000")) {
                        if (flag == 0) {
                            flag = 1;
                            id = 1;
                        }
                        html += '<li><a class="J_menuItem" id="add_user" onclick="changeBg(this,6)">增加用户</a></li>';
                    }
                    html += '<li><a class="J_menuItem" id="list_user" onclick="changeBg(this,2)">用户列表</a></li>';
                    if (flag == 0) {
                        flag = 1;
                        id = 2;
                    }
                }
                if (contains(array, "701")) {
                    if (contains(array, "7010")) {
                        if (flag == 0) {
                            flag = 1;
                            id = 3;
                        }
                        html += '<li><a class="J_menuItem" id="role_manage" onclick="changeBg(this,3)">增加角色</a></li>';
                    }
                    if (flag == 0) {
                        flag = 1;
                        id = 4;
                    }
                    html += '<li><a class="J_menuItem" id="update_user" onclick="changeBg(this,10)">角色列表</a> </li>';
                }
            
                /*html += '<li><a class="J_menuItem" id="message_alert" onclick="changeBg(this,12)">消息通知</a> </li>';*/
              
                html += '</ul></li>'
            }
            
            if (contains(array, "72")) {
                if (flag == 0) {
                    flag == 1;
                    id = 8;
                }
                html += '<li><a href="javascript:void(0);" id="log"><span><img src="img/rzgl.png"></span><span class="nav-label">日志管理</span><span class="fa arrow">' +
                    '</span></a><ul class="nav nav-second-level"> <li><a class="J_menuItem" id="log_manage" onclick="changeBg(this,8)">日志管理</a></li></ul></li>';
            }
            //申请审批
            if (contains(array, "73")) {
                if (flag == 0) {
                    flag == 1;
                    id = 14;
                }
                html += '<li><a href="javascript:void(0);" id="ask"><span><img src="img/rzgl.png"></span><span class="nav-label">申请审批</span><span class="fa arrow">' +
                    '</span></a><ul class="nav nav-second-level"> <li><a class="J_menuItem" id="ask_manager" onclick="changeBg(this,14)">申请审批</a></li></ul></li>';
            }
          //站内统计
            if (contains(array, "740")) {
                if (flag == 0) {
                    flag == 1;
                    id = 14;
                }
                html += '<li><a href="javascript:void(0);" id="static"><span><img src="img/rzgl.png"></span><span class="nav-label">站内统计</span><span class="fa arrow">' +
                    '</span></a><ul class="nav nav-second-level"> <li><a class="J_menuItem" id="static_manager" onclick="changeBg(this,16)">站内统计</a></li></ul></li>';
            }
            
            
            //站内统计
            
            
            $("#side-menu").html(html);
            $('#side-menu').metisMenu();         
// 动态菜单栏绝对居中;
// var wWidth = ($('.warn .map-item').width())+'px';
// 一二级菜单图标区分
            $('.map-view .sidebar-collapse').find('#side-menu').children('li').children('ul').find('a').children('span:first-child').addClass('fa fa fa-folder');
            $('.map-view .sidebar-collapse').find('#side-menu').children('li').children('a').children('span:first-child').addClass('fa fa fa-folder-o');
// 菜单层级分化
            $('.map-view .sidebar-collapse').find('#side-menu').children('li').children('ul').children('li').children('a').css({
                'padding-left': '40px',
                'font-size': '12px',
                'color': 'rgb(155,155,155);'
            });
// 第一级主菜单设置样式
            $('.map-view .nav-main').children('li').css({'padding': '0'});
            $('.map-view .nav-main').children('li').children('a').css({
                'padding': '22px',
                'border-bottom': '1px solid #ddd'
            });
            $('.map-menu ul li').click(function (tem) {
                var mapMenu = (-$('.map-item').width() - 91) / 2 + 'px';
                $('.map-item').css({'margin-left': mapMenu})
            });
            changeDiv(id);
            
            //点击头部消息提醒跳转消息列表
            var a=window.location.href.substring(window.location.href.indexOf('=')+1);  
    	    if(a!==undefined&&a!==''&&window.location.href.indexOf('=')>0){  
    	    	if(a=="message"){
    	    		if (contains(array, "73")) {
//	    	    		$(".first").removeClass("active");
//	    	    		$(".first>ul").removeClass("in");
//	    	    		$(".second").addClass("active");
//	    	    		$(".second>ul").addClass("in");
	    	    		
//	    	    		changeDiv(14);
    	    			$("#ask").click();
	    	    		$("#ask_manager").click();
    	    		}
    	    	}

    	    }  
            
        } else {
            toastr.error("获取失败");
        }
    });
}

//替换面包屑函数
var classname = '';
function changeBread(classname, arr) {
    $(classname + '.page_title').empty();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].link) {
            $(classname + '.page_title').append("<span><a href='" + arr[i].link + "'>" + arr[i].title + "</a></span>")
        } else {
            $(classname + '.page_title').append("<span>" + arr[i].title + "</span>")
        }
    }
}


$('input').val("");

var userLevels = {
    1: "国家级",
    2: "省级用户",
    3: "市级用户",
    4: "县级用户",
}
var userTypes = {}
var sourceUrl;

getRegion();
/*获取省市县*/
function getRegion() {
    ajaxPost("/seimp/pic/getRegion1", {regionCode: 0}).done(function (data) {
        if (data.status == 0) {
            var html = "<option value=''></option>";
            for (var i = 0; i < data.data.length; i++) {
                var tem = data.data[i];
                html += " <option value='" + tem.code + "'>" + tem.name + "</option>";
                if (i == 0) {
                    ajaxPost("/seimp/pic/getRegion1", {regionCode: tem.code}).done(function (data) {
                        if (data.status == 0) {
                            var html1 = "<option value=''></option>";
                            for (var i = 0; i < data.data.length; i++) {
                                var tem = data.data[i];
                                html1 += " <option value='" + tem.code + "'>" + tem.name + "</option>";
                            }
                            $(".city").html(html1);
                        }
                    });
                }
            }
            $(".province").html(html);
        }
    });
}
/*异步获取市县*/
function getRegions(code, id) {
    ajaxAsyncPost("/seimp/pic/getRegion1", {regionCode: code}).done(function (data) {
        if (data.status == 0) {
            var html = "<option value=''></option>";
            for (var i = 0; i < data.data.length; i++) {
                var tem = data.data[i];
                html += " <option value='" + tem.code + "'>" + tem.name + "</option>";
            }
            $("#" + id).html(html);
        }
    });
}
$("#province1").change(function () {
    var pro = $("#province1").val();
    $("#city1").html("");
    $("#county1").html("");
    if (pro == "") {
        return;
    }
    getRegions(pro, "city1");
});
$("#city1").change(function () {
    var pro = $("#city1").val();
    if (pro == "") {
        $("#county1").html("");
        return;
    }
    getRegions(pro, "county1");
});
$("#province2").change(function () {
    var pro = $("#province2").val();
    $("#city2").html("");
    $("#county2").html("");
    if (pro == "") {
        return;
    }
    getRegions(pro, "city2");
});
$("#city2").change(function () {
    var pro = $("#city2").val();
    if (pro == "") {
        $("#county2").html("");
        return;
    }
    getRegions(pro, "county2");
});
$("#province3").change(function () {
    var pro = $("#province3").val();
    $("#city3").html("");
    $("#county3").html("");
    if (pro == "") {
        return;
    }
    getRegions(pro, "city3");
});
$("#city3").change(function () {
    var pro = $("#city3").val();
    if (pro == "") {
        $("#county3").html("");
        return;
    }
    getRegions(pro, "county3");
});
$("#province4").change(function () {
    var pro = $("#province4").val();
    $("#city4").html("");
    $("#county4").html("");
    if (pro == "") {
        return;
    }
    getRegions(pro, "city4");
});
$("#city4").change(function () {
    var pro = $("#city4").val();
    if (pro == "") {
        $("#county4").html("");
        return;
    }
    getRegions(pro, "county4");
});

function getzf(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}
/*********************变量********************/
//对象
yearTime = "2017";
/***** 初始化页面 ****/
$(function () {
});
getNewsType();
getRights();
getRoles();
/*获取角色*/
function getRoles() {
    ajaxPost("/seimp/user/getAllRoles1", {}).done(function (data) {
        if (data.status == 0) {
            userTypes = {};
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var prop = data.data[i];
                userTypes[prop.ROLEID] = prop.ROLENAME;
                html += "<option value=" + prop.ROLEID + ">" + prop.ROLENAME + "</option>";
            }
            $("#userType").html(html);
            $("#role1").html(html);
            html = "<option value=''>全部</option>" + html;
            $("#k5").html(html);
        }
    });
}
getMinistry();
function getMinistry(){
    ajaxPost("/seimp/news/getMinistry", {}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var item = data.data[i];
                html += "<option value = '" + item.id + "'>" + item.name + "</option>";
            }
            $(".ministry").html(html);
        }
    });
}
/*点击左侧菜单*/

function changeDiv(flag) {

    $(".parts").hide();
    
    switch (flag) {

	    case 1://资讯动态管理
	        if (contains(rights, "7102")) {
	            $("#deletenews").show();
	        } else {
	            $("#deletenews").hide();
	        }
	        if (contains(rights, "7103")) {
	            $(".checknews").show();
	        } else {
	            $(".checknews").hide();
	        }
	        if (contains(rights, "7104")) {
	            $(".topNews").show();
	        } else {
	            $(".topNews").hide();
	        }
	        $("#infoManage").show();
	        $("#title6").val("");
	        $("#newsType1").val("");
	        $("#checkType").val("");
	        initBootstrapTable2();
	        break;
        case 2://用户列表
            $("#userList").show();
            getRoles();
            $("#k1").val("");
            $("#k2").val("");
            $("#k3").val("");
            $("#k4").val("");
            initBootstrapTable();
            break;
        case 3://添加角色
            $("#updateManage").show();
            $("#updateManage .one").show();
            $("#updateManage .two").hide();
            $("#updateManage .three").hide();
            $("#updateManage .four").hide();
            var treeObj = $.fn.zTree.getZTreeObj("rights");
            treeObj.checkAllNodes(false);
            var treeObj1 = $.fn.zTree.getZTreeObj("yztRights");
            treeObj1.checkAllNodes(false);
            //修改角色ID置空
            //按钮改为“确认添加”
            $("#add_button").text("确认添加")
            operatingRoleID = "";
            updateTable();
            initBootstrapTable_add("0");
            break;
        case 4://角色列表
            $("#perManage").show();
            break;
        case 5://增加资讯动态
        	//文件
        	$("#file0").val("");
            $("#pic0").val("");
            $("#file00").val("");
            $("#pic00").val("");
        	
        	
            $("#recordInfo").show();
            $('.search_input').hide();
            $("#keyword").html("");
            $("#title1").val("");
            $("#attach").val("");
            $("#author1").val("");
            $("#source").val("");
            $("#checker").val("");
            ue.setEnabled();
            $("input[name='radio3']:eq(1)").prop("checked", true)
            $("#newsType option").eq(0).prop("selected", true);
            $("#county1").html("");
            $("#date1").val(new Date().Format("yyyy-MM-dd"));
            $("#city1").html("");
            getRegions(0, "province1");
            $('.city_show').hide();
            $('.ministry_show').hide();
            if ($("#newsType").val() == 2) {
                $('.city_show').show();
            } else if ($("#newsType").val() == 1) {
                $('.ministry_show').show();
            }
            ue.setContent("");
            break;
        case 6://添加用户
            $("#addUser").show();
            $("#loginName").val("");
            $("#password").val("");
            $("#password2").val("");
            $("#name").val("");
            $("#mobile").val("");
            $("#email").val("");
            $("#part").val("");
            getRegions(0, "province3");
            $("#city3").html("");
            $("#county3").html("");
            $("#userlevel option").eq(0).prop("selected", true);
            $("#code1").html("行政区划");
            $("#source").val("");
            getRoles();
            
            break;
        
        case 7:
            $("#typeManage").show();
            break;
        case 8://日志管理
            $("#name8").val("");
            $("#content8").val("");
            $("#startDate").val("");
            $("#endDate").val("");
            $("#logManage").show();
            initBootstrapTable3();
            break;
        case 9:
            $("#importInfo").show();
            break;
        case 10:
            $("#roleManage").show();
            $("#key2").val("");
            initBootstrapTable1();
            break;
        case 11://网络舆情管理
            if (contains(rights, "7112")) {
                $(".checknet").show();
            } else {
                $(".checknet").hide();
            }
            if (contains(rights, "7111")) {
                $("#deletenet").show();
            } else {
                $("#deletenet").hide();
            }
            $("#networkManage").show();
            $("#title11").val("");
            $("#soutce11").val("");
            $("#checkType1").val("");
            initBootstrapTable4();
            initRegions();
            break;
        case 12://消息通知
            $("#messageAlert").show();
            getMsgTypes();
            searchMsg()
            break;
        case 13://消息通知
            $("#msgDetails").show();
            break;
        case 14://申请审批列表
        	$("#askDataTablePart").show();
        	$("#adVerifyStatus").val("0");
        	initBootstrapTable14();
            break;
        case 15://审批申请
        	$("#verifyAskData").show();
            break;
        case 16://站内统计
        	$("#visitStatis").show();
        	initVisitStatis();
            break;

            
    }
    console.log(flag)

}
/*初始化省市县*/
function initRegions() {
    $('.selectpicker3').selectpicker('destroy');
    $(".selectpicker3").selectpicker({
        noneSelectedText : '请选择'//默认显示内容
    });
    $(window).on('load', function() {
        $('.selectpicker3').selectpicker('val', '');
        $('.selectpicker3').selectpicker('refresh');
    });
    ajaxPost("/seimp/news/getRegion",{}).done(function (res) {
        if(res.status==0){
            var datas = res.data;
            var region1=$("#region1");
            var region2=$("#region2");
            var region3=$("#region3");
            region1.html("");
            region2.html("");
            region3.html("");
            for(var i=0;i<datas.province.length;i++){
                var val=datas.province[i].code+"_"+datas.province[i].name;
                region1.append("<option value='"+val+"'>"+val+"</option>");
            }
            for(var j=0;j<datas.city.length;j++){
                var val=datas.city[j].code+"_"+datas.city[j].name;
                region2.append("<option value='"+val+"'>"+val+"</option>");;
            }
            for(var k=0;k<datas.country.length;k++){
                var val=datas.country[k].code+"_"+datas.country[k].name;
                region3.append("<option value='"+val+"'>"+val+"</option>");
            }
            $('.selectpicker3').selectpicker('refresh');
         //   $('.selectpicker').selectpicker('render');
        }
    });
}
/*修改用户级别*/
function changeLevel() {
    var level = $("#userlevel").val();
    if (level == 1) {
        $("#code1").html("行政区划");
    } else {
        $("#code1").html("行政区划<code>*</code>");
    }
}
/*查询用户*/
function search() {
    initBootstrapTable();
}
/*用户列表*/
function initBootstrapTable() {
    //销毁表格
    $('#table_template').bootstrapTable('destroy');
    //生成表格
    $('#table_template').bootstrapTable({
        method: 'POST',
        url: "/seimp/user/getUsers",
        ajaxOptions: {async: true, timeout: 10000},
        columns: [
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: 'USERNAME',
                title: '登录账号',
                align: 'center',
                valign: 'middle',
                //  sortable: true // 开启排序功能
            }, {
                field: 'NAME',
                title: '姓名',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'ROLEID',
                title: '角色',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    return userTypes[value];
                }
            }, {
                field: 'SECTION',
                title: '部门',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'USERLEVEL',
                title: '用户级别',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    return userLevels[value];
                }
            }, {
                field: 'province',
                title: '省份',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'TEL',
                title: '手机号',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'EMAIL',
                title: '邮箱',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                valign: 'middle',
                class: 'w-15',
                formatter: function (value, row, index) {
                    var arr = [];
                    var html = "";
                    if (contains(rights, "7001")) {
                        arr.push('<a  class="edit" title="edit" onclick="updateUser(' + row.USERID + ')" style="cursor:pointer" >修改</a>  ');
                    }
                    if (contains(rights, "7002")) {
                        arr.push('<a class="remove"  onclick="removeUser(' + row.USERID + ')" title="Remove" style="cursor:pointer">删除</a>');
                    }
                    return arr.join('&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            }],
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
        pageNumber: 1,
        pageSize: 15,
        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
        pagination: true,				// 在表格底部显示分页工具栏
        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        queryParams: function queryParams(params) {   //设置查询参数
            var param = {
                pageNumber: params.offset,
                pageSize: params.limit,
                loginName: $("#k1").val(),
                name: $("#k2").val(),
                section: $("#k3").val(),
                level: $("#k4").val(),
                role: $("#k5").val(),
            };
            return param;
        },
        queryParamsType: "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
};

/*角色列表*/
function initBootstrapTable1() {
    //销毁表格
    $('#table_template2').bootstrapTable('destroy');
    //生成表格
    $('#table_template2').bootstrapTable({
        method: 'POST',
        url: "/seimp/user/getAllRoles",
        ajaxOptions: {async: true, timeout: 10000},
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        columns: [
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: 'ROLENAME',
                title: '角色名称',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'COMMENTS',
                title: '角色说明',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    var arr = [];
                    if (contains(rights, "7011")) {
                        arr.push('<a  class="edit" title="edit" onclick="updateRole(' + row.ROLEID + ')" style="cursor:pointer" >修改</a>');
                    }
                    if (contains(rights, "7012")) {
                        arr.push('<a class="remove"  onclick="removeRole(' + row.ROLEID + ')" title="Remove" style="cursor:pointer">删除</a>');
                    }
                    return arr.join('&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            }],
        //search:true,
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
        pageNumber: 1,
        pageSize: 15,
        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
        pagination: true,				// 在表格底部显示分页工具栏
        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        queryParams: function queryParams(params) {   //设置查询参数
            var param = {
                pageNumber: params.offset,
                pageSize: params.limit,
                name: $("#key2").val(),
            };
            return param;
        },
        queryParamsType: "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
};

/*信息列表*/
function initBootstrapTable2() {
    //销毁表格
    $('#table_template6').bootstrapTable('destroy');
    //生成表格
    $('#table_template6').bootstrapTable({
        method: 'POST',
        url: "/seimp/news/getNewsList",
        ajaxOptions: {async: true, timeout: 10000},
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        columns: [
            { // 列设置
                field: 'state',
                checkbox: true,
                align: 'center',
                valign: 'middle',
                // 使用单选框
            },
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: 'title',
                title: '标题',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    if (value.length > 30) {
                        return value.substring(0, 29) + "...";
                    } else {
                        return value;
                    }
                }
                //  sortable: true // 开启排序功能
            }, {
                field: 'author',
                title: '作者',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'type',
                title: '资讯类型',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    return newsType[value];
                }
            }, {
                field: 'writeDate',
                title: '发布时间',
                align: 'center',
                valign: 'middle',
                class:'w-12'
            }, {
                field: 'top',
                title: '是否置顶',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    if (value == "0") {
                        return "是";
                    } else {
                        return "否";
                    }
                }
            }, {
                field: 'checkStatus',
                title: '审核状态',
                align: 'center',
                valign: 'middle',
                cellStyle: getcolor,
                formatter: function (value, row, index) {
                    if (value == "0") {
                        return "已通过";
                    } else if (value == "1") {
                        return "未通过";
                    } else {
                        return "未审核";
                    }
                }
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                valign: 'middle',
                class: 'w-15',
                formatter: function (value, row, index) {
                    var arr = [];
                    if (row.checkStatus == '0' || row.checkStatus == '-1') {
                        if (contains(rights, "7101")) {
                            arr.push('<a  class="edit" title="edit" onclick="updateInfo(' + row.id + ')" style="cursor:pointer" >修改</a>');
                        }
                        if (contains(rights, "7102")) {
                            arr.push('<a class="remove"  onclick="removeInfo(' + row.id + ')" title="Remove" style="cursor:pointer">删除</a>');
                        }
                    } else {
                        if (contains(rights, "7103")) {
                            arr.push('<a  class="edit" title="edit" onclick="checkInfo(' + row.id + ')" style="cursor:pointer" >审核</a>  ');
                        }
                        if (contains(rights, "7101")) {
                            arr.push('<a  class="edit" title="edit" onclick="updateInfo(' + row.id + ')" style="cursor:pointer" >修改</a>');
                        }
                        if (contains(rights, "7102")) {
                            arr.push('<a class="remove"  onclick="removeInfo(' + row.id + ')" title="Remove" style="cursor:pointer">删除</a>');
                        }
                    }
                    return arr.join('&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            }],
        //search:true,
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
        pageNumber: 1,
        pageSize: 15,
        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
        pagination: true,				// 在表格底部显示分页工具栏
        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        queryParams: function queryParams(params) {   //设置查询参数
            var param = {
                pageNumber: params.offset,
                pageSize: params.limit,
                title: $("#title6").val(),
                type: $("#newsType1").val(),
                state: $("#checkType").val(),
                top: $("#topSel").val(),
            };
            return param;
        },
        queryParamsType: "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
};

/*网络舆情*/
function initBootstrapTable4() {
    //销毁表格
    $('#table_template11').bootstrapTable('destroy');
    //生成表格
    $('#table_template11').bootstrapTable({
        method: 'POST',
        url: "/seimp/news/getNetworkData",
        ajaxOptions: {async: true, timeout: 10000},
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        columns: [
            { // 列设置
                field: 'state',
                checkbox: true,
                align: 'center',
                valign: 'middle',
                // 使用单选框
            },
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: 'title',
                title: '标题',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    if (value.length < 30) {
                        return value;
                    } else {
                        return value.substring(0, 29) + "...";
                    }
                }
                //  sortable: true // 开启排序功能
            }, {
                field: 'source',
                title: '来源',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'fetchTime',
                title: '抓取时间',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'DICT_type',
                title: '类型',
                align: 'center',
                valign: 'middle',
            },
            {
                field: 'status',
                title: '审核状态',
                align: 'center',
                valign: 'middle',
                cellStyle: getcolor,
                formatter: function (value, row, index) {
                    if (value == "0") {
                        return "已通过";
                    } else if (value == "1") {
                        return "未通过";
                    } else {
                        return "未审核";
                    }
                }
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                valign: 'middle',
                class:'w-15',
                formatter: function (value, row, index) {
                    var arr = [];
                    if (row.status == '0' || row.status == '1') {
                        if (contains(rights, "7110")) {
                            arr.push('<a  class="edit" title="edit" onclick="updateNetwork(\'' + row.newsid + '\')" style="cursor:pointer" >修改</a>');
                        }
                        if (contains(rights, "7111")) {
                            arr.push('<a class="remove"  onclick="removeNetwork(\'' + row.newsid + '\')" title="Remove" style="cursor:pointer">删除</a>');
                        }
                    } else {
                        if (contains(rights, "7112")) {
                            arr.push('<a  class="edit" title="edit" onclick="checkNetwork(\'' + row.newsid + '\')" style="cursor:pointer" >审核</a>');
                        }
                        if (contains(rights, "7110")) {
                            arr.push('<a  class="edit" title="edit" onclick="updateNetwork(\'' + row.newsid + '\')" style="cursor:pointer" >修改</a>');
                        }
                        if (contains(rights, "7111")) {
                            arr.push('<a class="remove"  onclick="removeNetwork(\'' + row.newsid + '\')" title="Remove" style="cursor:pointer">删除</a>');
                        }
                    }
                    return arr.join('&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            }],
        //search:true,
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
        pageNumber: 1,
        pageSize: 15,
        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
        pagination: true,				// 在表格底部显示分页工具栏
        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        queryParams: function queryParams(params) {   //设置查询参数
            var param = {
                pageNumber: params.offset,
                pageSize: params.limit,
                title: $("#title11").val(),
                source: $("#soutce11").val(),
                state: $("#checkType1").val(),
            };
            return param;
        },
        queryParamsType: "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
};
function getcolor(value, row, index) {
    var color = "black";
    if (value == "已通过") {
        color = "green";
    } else if (value == "未通过") {
        color = "red";
    }
    return {
        css: {
            "color": color
            // "background-color":color
        }
    }
}
/*舆情ID*/
var opetatingNewworkID;
/*点击修改舆情*/
function modifyNetwork() {
    var r1="";
    var r2="";
    var r3="";
    if( $("#region1").val()!=null){
        r1=$("#region1").val().join(",");
    }
    if( $("#region2").val()!=null){
        r2=$("#region2").val().join(",");
    }
    if( $("#region3").val()!=null){
        r3=$("#region3").val().join(",");
    }
    var spans = $("#keyword3 span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    var keywords = arr.join(",");
    var datas = {
        newsID: opetatingNewworkID,
        title: $("#title12").val(),
        url: $("#url").val(),
        time: $("#date12").val(),
        source: $("#source11").val(),
        type: keywords,
        chinaRegion1:r1,
        chinaRegion2: r2,
        chinaRegion3:r3,
        lon: $("#lon").val(),
        lat: $("#lat").val(),
        summary: $("#summary").val(),
        content: ue3.getContent()
    };
    systemDengdai();
    ajaxPost("/seimp/news/moidfyNetworkNews", datas).done(function (data) {
    	removeSystemDengdai();
        if (data.status == 0) {
            swal("成功修改舆情信息", "", "success");
            changeDiv(11);
        } else {
            swal("修改舆情信息失败", "", "error");
        }
    });
}
/*审核通过*/
function passNetwork() {
    ajaxPost("/seimp/news/passNetworkNews", {newsIDs: opetatingNewworkID}).done(function (data) {
        if (data.status == 0) {
            swal("成功通过舆情信息", "", "success");
        } else {
            swal("通过舆情信息失败", "", "error");
        }
        changeDiv(11);
    });
}
/*审核不通过*/
function rejectNetwork() {

    ajaxPost("/seimp/news/rejectNetworkNews", {newsIDs: opetatingNewworkID}).done(function (data) {
        if (data.status == 0) {
            swal("成功不通过舆情信息", "", "success");
        } else {
            swal("不通过舆情信息失败", "", "error");
        }
        changeDiv(11);
    });
}
/*删除舆情*/
function removeNetwork(id) {
    swal({
        title: "确认删除",
        text: "确认删除该舆情？",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62"
    }, function () {
        ajaxPost("/seimp/news/deleteNetworkNews", {newsIDs: id}).done(function (data) {
            if (data.status == 0) {
                swal("成功删除舆情信息", "", "success");
            } else {
                swal("删除舆情信息失败", "", "error");
            }
            initBootstrapTable4();
        });
    });
}
/*删除选中的舆情*/
function deleteSelected() {
    var rows = $('#table_template11').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择舆情");
    }
    swal({
        title: "确认删除",
        text: "确认删除这些舆情信息？",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62"
    }, function () {
        var arr = $.map(rows, function (v) {
            return v.newsid;
        }).join(",");
        ajaxPost("/seimp/news/deleteNetworkNews", {newsIDs: arr}).done(function (data) {
            if (data.status == 0) {
                swal("成功删除选中舆情信息", "", "success");
            } else {
                swal("删除舆情失败", "", "error");
            }
            initBootstrapTable4();
        });
    });
}
/*删除选中的资讯*/
function deleteSelected1() {
    var rows = $('#table_template6').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择资讯");
    }
    swal({
        title: "确认删除",
        text: "确认删除这些资讯？",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62"
    }, function () {
        var arr = $.map(rows, function (v) {
            return v.id;
        }).join(",");
        ajaxPost("/seimp/news/deleteNews", {newsIDs: arr}).done(function (data) {
            if (data.status == 0) {
                swal("成功删除选中资讯", "", "success");
            } else {
                swal("资讯舆情失败", "", "error");
            }
            initBootstrapTable2();
        });
    });
}
/*通过选择舆情*/
function passSelected() {
    var rows = $('#table_template11').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择舆情");
    }
    var arr = $.map(rows, function (v) {
        return v.newsid;
    }).join(",");
    ajaxPost("/seimp/news/passNetworkNews", {newsIDs: arr}).done(function (data) {
        if (data.status == 0) {
            swal("成功通过选中舆情信息", "", "success");
        } else {
            swal("通过舆情失败", "", "error");
        }
        initBootstrapTable4();
    });
}

/*通过选择资讯*/
function passSelected1() {
    var rows = $('#table_template6').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择资讯");
    }
    var arr = $.map(rows, function (v) {
        return v.id;
    }).join(",");
    ajaxPost("/seimp/news/passNews", {newsIDs: arr}).done(function (data) {
        if (data.status == 0) {
            swal("成功通过选中资讯", "", "success");
        } else {
            swal(data.msg, "", "error");
        }
        initBootstrapTable2();
    });
}
/*审核不通过选择舆情*/
function rejectSelected() {
    var rows = $('#table_template11').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择舆情");
    }
    var arr = $.map(rows, function (v) {
        return v.newsid;
    }).join(",");
    ajaxPost("/seimp/news/rejectNetworkNews", {newsIDs: arr}).done(function (data) {
        if (data.status == 0) {
            swal("成功不通过选中的舆情信息", "", "success");
        } else {
            swal("不通过失败", "", "error");
        }
        initBootstrapTable4();
    });
}
/*审核不通过选择资讯*/
function rejectSelected1() {
    var rows = $('#table_template6').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择资讯");
    }
    var arr = $.map(rows, function (v) {
        return v.id;
    }).join(",");
    ajaxPost("/seimp/news/rejectNews", {newsIDs: arr}).done(function (data) {
        if (data.status == 0) {
            swal("成功不通过选中的资讯", "", "success");
        } else {
            swal("不通过失败", "", "error");
        }
        initBootstrapTable2();
    });
}
/*取消置顶 选择资讯*/
function cancelTop() {
    var rows = $('#table_template6').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择资讯");
    }
    var arr = $.map(rows, function (v) {
        return v.id;
    }).join(",");
    ajaxPost("/seimp/news/cancelTopNews", {newsIDs: arr}).done(function (data) {
        if (data.status == 0) {
            swal("成功取消置顶选中的资讯", "", "success");
        } else {
            swal("取消置顶失败", "", "error");
        }
        initBootstrapTable2();
    });
}

/*置顶选择资讯*/
function setupTop() {
    var rows = $('#table_template6').bootstrapTable('getSelections');
    if (rows.length < 1) {
        return toastr.warning("请选择资讯");
    }
    var arr = $.map(rows, function (v) {
        return v.id;
    }).join(",");
    ajaxPost("/seimp/news/setupTopNews", {newsIDs: arr}).done(function (data) {
        if (data.status == 0) {
            swal("成功置顶选中的资讯", "", "success");
        } else {
            swal("置顶失败", "", "error");
        }
        initBootstrapTable2();
    });
}



/*日志表格*/
function initBootstrapTable3() {
    //销毁表格
    if ($("#endDate").val()!=""&&$("#startDate").val() > $("#endDate").val()) {
        return toastr.error("起始时间不能大于结束时间");
    }


    $('#table_template8').bootstrapTable('destroy');
    //生成表格
    $('#table_template8').bootstrapTable({
        method: 'POST',
        url: "/seimp/user/getLogs",
        ajaxOptions: {async: true, timeout: 10000},
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        columns: [
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            /* { // 列设置
             field: 'state',
             // 使用单选框
             },*/
            /* {
             field: 'user_id',
             title: '用户ID',
             align: 'center',
             valign: 'middle',
             //  sortable: true // 开启排序功能
             },*/ {
                field: 'user_name',
                title: '操作用户',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'time',
                title: '操作时间',
                align: 'center',
                valign: 'middle',
                //  sortable: true // 开启排序功能
            }, {
                field: 'content',
                title: '操作内容',
                align: 'center',
                valign: 'middle',
            }
        ],
        //search:true,
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
        pageNumber: 1,
        pageSize: 15,
        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
        pagination: true,				// 在表格底部显示分页工具栏
        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        queryParams: function queryParams(params) {   //设置查询参数
            var param = {
                pageNumber: params.offset,
                pageSize: params.limit,
                name: $("#name8").val(),
                content: $("#content8").val(),
                startTime: $("#startDate").val(),
                endTime: $("#endDate").val()
            };
            return param;
        },
        queryParamsType: "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
};

/*审核资讯*/
function checkInfo(id) {
    changeType = 3;
    operatingInfoID = id;
    $('.info_update').hide();
    $('.info_check').show();
    classname = '#updateInfo '
    changeBread(classname, [{title: '信息管理', link: "javascript:updateInfoBack()"}, {title: '信息审核'}]);
    $('#infoManage').hide();
    $('#recordInfo').hide();
    $('#updateInfo').show();
    $("#keyword1").html("");
    $('#updateInfo input').attr('disabled', true);
    $('#updateInfo select').attr('disabled', true);
    $('#updateInfo div').attr('disabled', true);
    $("#compare1").show();
    $("#compare0").hide();
    $('#updateInfo .simditor-body').attr('contenteditable', false)
    ajaxPost("/seimp/news/getNewsDetail", {newsID: id}).done(function (data) {
        if (data.status == 0) {
            var tem = data.data;
            $("#title").val(tem.title);
            $("#newsType2").val(tem.type);
            $("#author").val(tem.author);
            $("#comment").val(tem.comment);
            $("#source1").val(tem.source);
            $("#date2").val(tem.writeDate);
            var flag = tem.top == "" ? "0" : tem.top;
            $("input[name='top'][data_value='" + flag + "']").prop("checked", "checked");
            ue1.setContent(tem.content);
            ue1.setDisabled();
            $(".filename").hide();
            $("#filename").html("");
            $("#picname").html("");
            if (tem.type == 2) {
                $(".city_show2").show();
                var code = tem.regionCode;
                if (code == "") {
                    getRegions(0, "province2");
                    $("#province2").val("");
                    $("#city2").html("");
                    $("#county2").html("");
                } else {
                    getRegions(0, "province2");
                    if (code.indexOf("0000") != -1) {
                        $("#province2").val(code);
                    } else if (code.indexOf("00") != -1) {
                        getRegions(code.substring(0, 2) + "0000", "city2");
                        $("#province2").val(code.substring(0, 2) + "0000");
                        $("#city2").val(code);
                    } else {
                        getRegions(code.substring(0, 2) + "0000", "city2");
                        getRegions(code.substring(0, 4) + "00", "county2");
                        $("#province2").val(code.substring(0, 2) + "0000");
                        $("#city2").val(code.substring(0, 4) + "00");
                        $("#county2").val(code);
                    }
                }
            } else if (tem.type == 1) {
                $(".ministry_show2").show();
                $("#ministry1").val(tem.ministry.trim());
            }
            $("#kpart1").hide();
            if (tem.type == 1 || tem.type == 2 || tem.type == 3) {
                $("#kpart1").show();
                var keywords = tem.keyword;
                if (keywords != "") {
                    var arr = keywords.split(/[,，]/);
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] != "") {
                            var lab = "<span class='label label-info' style='margin-left: 2px'>" + arr[i] + "<i class='fa fa-times-circle keyitem1' style='cursor: pointer'></i></span>";
                            $("#keyword1").append(lab);
                        }
                    }
                }
            }
            if (tem.files.length > 0) {
                $(".filename").show();
                $("#filename").html(tem.files[0].FILENAME);
            }
            if (tem.pics.length > 0) {
                $(".filename").show();
                $("#picname").html(tem.pics[0].FILENAME);
            }
        } else {

        }
    });
}
var operatingRoleID;
/*跳转修改角色信息界面*/
function updateRole(id) {
    operatingRoleID = id;
    classname = '#updateManage '
    changeBread(classname, [{title: '角色管理', link: "javascript:updateManageBack()"}, {title: '角色修改'}]);
    $('#roleManage').hide();
    $('#updateManage').show();
    $("#p1").hide();
    $("#p2").show();
    
    //修改角色
    $("#updateManage").show();
    $("#updateManage .one").show();
    $("#updateManage .two").hide();
    $("#updateManage .three").hide();
    $("#updateManage .four").hide();
    
    //确认按钮改为“确认修改”
    $("#add_button").text("确认修改");
    
    ajaxPost("/seimp/authority/getARole", {roleID: id}).done(function (data) {
    	
        if (data.status == 0) {
        	console.log(data.data)
            $("#roleName").val(data.data.name);
            $("#roleDesc").val(data.data.comment);
            /*功能权限*/
            var zTree = $.fn.zTree.getZTreeObj("rights");
            zTree.checkAllNodes(false);
            var right = data.data.rights;
            if (right.length > 0) {
                var arr = right.split(/[,，]/);
                for (var i = 0; i < arr.length; i++) {
                    var node = zTree.getNodeByParam("id", arr[i]);
                    if(node){
                    	zTree.checkNode(node, true, false);
                    }
                }
            }
            /*数据权限*/
            var zTree1 = $.fn.zTree.getZTreeObj("yztRights");
            zTree1.checkAllNodes(false);
            var dataRight = data.data.dataRights;
            if (dataRight.length > 0) {
                var arr1 = dataRight.split(/[,，]/);
                for (var j = 0; j < arr1.length; j++) {
                    var node1 = zTree1.getNodeByParam("id", arr1[j]);
                    if(node1){
                    	zTree1.checkNode(node1, true, false);
                    }
                }
            }

        } else {
            toastr.error("连接失败");
        }
    });
    initBootstrapTable_add("0");
}

/*删除角色*/
function removeRole(id) {
    swal({
        title: "确认删除",
        text: "确认删除角色？",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62"
    }, function () {
        ajaxPost("/seimp/user/deleteRole", {roleID: id}).done(function (data) {
            if (data.status == 0) {
                swal("成功删除角色", "", "success");
            } else {
                swal(data.msg, "", "error");
            }
            initBootstrapTable1();
        });
    });

}

/*添加角色*/
function addRole() {
	if(operatingRoleID==""){
	    var roleName = $("#roleName").val();
	    if (roleName == "") {
	        return toastr.warning("请填写角色名");
	    }
	    var treeObj = $.fn.zTree.getZTreeObj("rights");
	    var nodes = treeObj.getCheckedNodes(true);
	    if (nodes.length < 1) {
	        return toastr.warning("请选择功能权限");
	    }
	    var rights = "";
	    for (var i = 0; i < nodes.length; i++) {
	        rights += nodes[i].id + ",";
	    }
	    rights = rights.substring(0, rights.length - 1);
	    /*数据权限*/
	    var rights1 = "";
	    if (contains(rights.split(","), "3")) {
	        var treeObj1 = $.fn.zTree.getZTreeObj("yztRights");
	        var nodes1 = treeObj1.getCheckedNodes(true);
	        if (nodes1.length < 1) {
	            return toastr.warning("请选择图层目录权限");
	        }
	        for (var j = 0; j < nodes1.length; j++) {
	            rights1 += nodes1[j].id + ",";
	        }
	        rights1 = rights1.substring(0, rights1.length - 1);
	    }
	    //数据集权限,查看、查询、下载
	    var rights2 = getMetadataRights();
	    var datas = {
	        roleName: roleName,
	        comments: $("#roleDesc").val(),
	        rights: rights,
	        rights1: rights1,
	        rights2:rights2
	    };
	    ajaxPost("/seimp/authority/addRole", datas).done(function (data) {
	        if (data.status == 0) {
	            swal("成功添加角色", "", "success");
	            changeDiv(3);
	        } else {
	            swal(data.msg, "", "error");
	        }
	        initBootstrapTable1();
	    });								
	}else{
		modifyRole();
	}
		
}

/**
 * 获取数据集的查看权限和下载权限
 * @returns {Array}
 */
function getMetadataRights(){
	var result = [];
	var visInpArr = $("input[name='visitInput']:checked");//查看权限选中的checkbox
	$.each(visInpArr, function(i, visInp){
		var resultObj = {
				id : $(visInp).val()
		}
		if($("input[name='downInput'][value='"+ $(visInp).val()+"']:checked").length>0){
			resultObj.DOWN = "1";
		}else{
			resultObj.DOWN = "0";
		}
		if($("input[name='selectInput'][value='"+ $(visInp).val()+"']:checked").length>0){
			resultObj.SELECT = "1";
		}else{
			resultObj.SELECT = "0";
		}
		result.push(resultObj);
	})
	return result;
}



/*修改角色*/
function modifyRole() {
    var roleName = $("#roleName").val();
    if (roleName == "") {
        return toastr.warning("请填写角色名称");
    }
    //功能权限
    var treeObj = $.fn.zTree.getZTreeObj("rights");
    var nodes = treeObj.getCheckedNodes(true);
    if (nodes.length < 1) {
        return toastr.warning("请选择功能权限");
    }
    var rights = "";
    var rights1 = "";
    for (var i = 0; i < nodes.length; i++) {
        rights += nodes[i].id + ",";
    }
    rights = rights.substring(0, rights.length - 1);
    //一张图图层目录权限
    var treeObj1 = $.fn.zTree.getZTreeObj("yztRights");
    var nodes1 = treeObj1.getCheckedNodes(true);
    if (contains(rights.split(","), "3")) {
        if (nodes1.length < 1) {
            return toastr.warning("请选择图层目录权限");
        }
    }
    for (var j = 0; j < nodes1.length; j++) {
        rights1 += nodes1[j].id + ",";
    }
    rights1 = rights1.substring(0, rights1.length - 1);
    //数据集权限
    var rights2 = getMetadataRights();
    var datas = {
        roleID: operatingRoleID,
        roleName: roleName,
        comments: $("#roleDesc").val(),
        rights: rights,
        rights1: rights1,
        rights2 : rights2
    };
    ajaxPost("/seimp/authority/modifyRole", datas).done(function (data) {
        if (data.status == 0) {
            swal("成功修改角色", "", "success");
            //修改角色ID置空
            operatingRoleID = "";
            changeDiv(10);
        } else {
            swal("修改角色失败", "", "error");
        }
    });
//    ajaxPost("/seimp/user/modifyRole", datas).done(function (data) {
//        if (data.status == 0) {
//            swal("成功修改角色", "", "success");
//            changeDiv(10);
//        } else {
//            swal("修改角色失败", "", "error");
//        }
//    });
}

var operatingInfoID;
var operateUserID;
/*跳转到修改用户信息界面*/
function updateUser(id) {
    operateUserID = id;
    $("#password1").val("");
    $("#password3").val("");
    classname = '#updateUser '
    changeBread(classname, [{title: '用户列表', link: "javascript:updateUserBack()"}, {title: '修改用户'}]);
    $('#updateUser').show();
    $('#userList').hide();
    ajaxPost("/seimp/user/getAUser", {"userID": id}).done(function (data) {
        if (data.status == 0) {
            var row = data.data;
            $("#tel1").val(row.TEL);
            $("#email1").val(row.EMAIL);
            $("#name1").val(row.NAME);
            $("#level1").val(row.USERLEVEL);
            $("#role1").val(row.ROLEID);
            $("#section1").val(row.SECTION);
            $("#loginName1").val(row.USERNAME);
            var regionCode = row.REGIONCODE;
            $("#province4").html("");
            $("#city4").html("");
            $("#county4").html("");
            getRegions(0, "province4");
            if (regionCode != "") {
                var province = regionCode.substring(0, 2) + "0000";
                $("#province4").val(province);
                getRegions(province, "city4");
                if (regionCode.indexOf("0000") == -1) {
                    var city = regionCode.substring(0, 4) + "00";
                    $("#city4").val(city);
                    getRegions(city, "county4")
                    if (regionCode.indexOf("00") == -1) {
                        $("#county4").val(regionCode);
                    }
                }
            }
        } else {
        }
    });

}

/*修改用户信息*/
function modifyUser() {
    var tel = $("#tel1").val();
    if (tel != "") {
        if (!(/^1[345789]\d{9}$/.test(tel))) {
            return toastr.warning("手机号格式有误请重新填写");
        }
    }
    var pwd = $("#password1").val();
    var rwd = $("#password3").val();
    if (pwd != "" || rwd != "") {
    	if(isAllChar(pwd)){
    		return toastr.warning("密码须是8到20位字母和数字");
    	}else if(isAllNum(pwd)){
    		return toastr.warning("密码须是8到20位字母和数字");
    	}else if (!isPostalCode(pwd)) {
            return toastr.warning("密码须是8到20位字母和数字");
        } else if (pwd != rwd) {
            return toastr.warning("两次输入密码不一致");
        }
    }
    if ($("#name1").val() == "") {
        return toastr.warning("请填写姓名");
    }
    var regionCode = "";
    var level = $("#level1").val();
    if (level != 1) {
        if (level == 2) {
            if ($("#county4").val() != "" && $("#county4").val() != null) {
                regionCode = $("#county4").val();
            } else if ($("#city4").val() != "" && $("#city4").val() != null) {
                regionCode = $("#city4").val();
            } else if ($("#province4").val() != "" && $("#province4").val() != null) {
                regionCode = $("#province4").val();
            }
            if (regionCode == "" || regionCode == null) {
                return toastr.warning("省级用户，请选择省行政区划");
            }
        } else if (level == 3) {
            if ($("#county4").val() != "") {
                regionCode = $("#county4").val();
            } else if ($("#city4").val() != "") {
                regionCode = $("#city4").val();
            }
            if (regionCode == "" || regionCode == null) {
                return toastr.warning("市级用户，请选择市行政区划");
            }
        } else if (level == 4) {
            if ($("#county4").val() != "") {
                regionCode = $("#county4").val();
            }
            if (regionCode == "" || regionCode == null) {
                return toastr.warning("县级用户，请选择县行政区划");
            }
        }
    }
    var data = {
        userID: operateUserID,
        tel: tel,
        email: $("#email1").val(),
        name: $("#name1").val(),
        level: $("#level1").val(),
        roleID: $("#role1").val(),
        section: $("#section1").val(),
        password: pwd,
        regionCode: regionCode
    };
    ajaxPost("/seimp/user/modifyUser", data).done(function (data) {
        if (data.status == 0) {
            swal("成功修改用户信息", "", "success");
            changeDiv(2);
        } else {
            swal(data.msg, "", "error");
        }
        // initBootstrapTable();
    });
}
/*删除用户*/
function removeUser(id) {
    swal({
        title: "确认删除",
        text: "确认删除该用户？",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62"
    }, function () {
        ajaxPost("/seimp/user/deleteUser", {userID: id}).done(function (data) {
            if (data.status == 0) {
                swal("成功删除用户", "", "success");
            } else {
                swal("删除用户失败", "", "error");
            }
            initBootstrapTable();
        });
    });

}
/*添加用户*/
function addUser() {
    var tel = $("#mobile").val();
    if (tel != "") {
        if (!(/^1[345789]\d{9}$/.test(tel))) {
            return toastr.warning("手机号格式有误请重新填写");
        }
    }
    var pwd = $("#password").val();
    var rwd = $("#password2").val();
    var loginName = $("#loginName").val();
    
    if (!isPostalName(loginName)) {
        return toastr.warning("登录账号须是5到16位字母或数字");
    }else if(isAllChar(pwd)){
		return toastr.warning("密码须是8到20位字母和数字");
	}else if(isAllNum(pwd)){
		return toastr.warning("密码须是8到20位字母和数字");
	}else  if (!isPostalCode(pwd)) {
        return toastr.warning("密码须是8到20位字母和数字");
    } else if (pwd != rwd) {
        return toastr.warning("两次输入密码不一致");
    } else if (loginName.indexOf(" ") != -1) {
        return toastr.warning("登录账号不能含有空格");
    } else if (pwd.indexOf(" ") != -1) {
        return toastr.warning("密码不能含有空格");
    } else if ($("#name").val() == "") {
        return toastr.warning("请填写姓名");
    }
    var regionCode = "";
    var level = $("#userlevel").val();
    if (level != 1) {
        if (level == 2) {
            if ($("#county3").val() != "" && $("#county3").val() != null) {
                regionCode = $("#county3").val();
            } else if ($("#city3").val() != "" && $("#city3").val() != null) {
                regionCode = $("#city3").val();
            } else if ($("#province3").val() != "" && $("#province3").val() != null) {
                regionCode = $("#province3").val();
            }
            if (regionCode == "" || regionCode == null) {
                return toastr.warning("创建省级用户，请选择省行政区划");
            }
        } else if (level == 3) {
            if ($("#county3").val() != "") {
                regionCode = $("#county3").val();
            } else if ($("#city3").val() != "") {
                regionCode = $("#city3").val();
            }
            if (regionCode == "" || regionCode == null) {
                return toastr.warning("创建市级用户，请选择市行政区划");
            }
        } else if (level == 4) {
            if ($("#county3").val() != "") {
                regionCode = $("#county3").val();
            }
            if (regionCode == "" || regionCode == null) {
                return toastr.warning("创建县级用户，请选择县行政区划");
            }
        }
    }
    var datas = {
        loginName: loginName,
        password: pwd,
        tel: tel,
        email: $("#email").val(),
        section: $("#part").val(),
        roleID: $("#userType").val(),
        level: level,
        name: $("#name").val(),
        regionCode: regionCode
    };
    ajaxPost("/seimp/user/addUser", datas).done(function (data) {
        if (data.status == 0) {
            swal("成功创建用户", "", "success");
            changeDiv(2);
        } else {
            swal(data.msg, "", "error");
        }
    });
}


//多选，选择事件
$('.list1').click(function () {
    if ($(this).prop('checked')) {
        $("input[name='list1']").prop("checked", true);
    } else {
        $("input[name='list1']").prop("checked", false);
    }
});
//getRights();
/*获取权限树*/
function getRights() {
    ajaxPost("/seimp/user/getAllRights", {}).done(function (data) {
        /*var setting = {
            check: {
                enable: true,
                chkboxType: {"Y": "s", "N": "s"}
            }
        };*/
        if (data.status == 0) {
            $.fn.zTree.init($("#rights"), setting, data.data);
        }
    });
    ajaxPost("/seimp/authority/getAllYztRights", {}).done(function (res) {
    	
        if (res.status == 0) {
            $.fn.zTree.init($("#yztRights"), setting, res.data);
        }
    });
    
    ajaxPost("/seimp/authority/getSETreeData", {}).done(function (res) {

        if (res.status == 0) {
            $.fn.zTree.init($("#exRights"), setting, res.data);
        }
    });
    
    
}
var setting = {
    check: {//表示tree的节点在点击时的相关设置
        enable: true,//是否显示radio/checkbox
        chkStyle: "checkbox",//值为checkbox或者radio表示
        checkboxType: {"Y": "ps", "N": "ps"},//表示父子节点的联动效果
        radioType: "level"//设置tree的分组
    },
    showLine: true,                  //是否显示节点间的连线
    checkable: true                  //每个节点上是否显示 CheckBox
};

/*var setting = {
 view:{//表示tree的显示状态
 selectMulti:true//表示禁止多选
 },
 check:{//表示tree的节点在点击时的相关设置
 enable:true,//是否显示radio/checkbox
 chkStyle:"checkbox",//值为checkbox或者radio表示
 checkboxType:{p:"",s:""},//表示父子节点的联动效果
 radioType:"level"//设置tree的分组
 },
 /!* callback:{//表示tree的一些事件处理 onClick:handlerClick,函数

 onCheck:handlerCheck
 }*!/
 }*/

function checkBox(th) {
    if ($(th).prop('checked')) {
        $(th).parent().siblings('ul').find('input').prop("checked", true);
        //$(th).parent().siblings('ul').children('li').children('label').children('input').prop("checked", true);
    } else {
        $(th).parent().siblings('ul').find('input').prop("checked", false);
        //$(th).parent().siblings('ul').children().children('label').children('input').prop("checked", false);
    }
}
$('.list2').click(function () {
    if ($(this).prop('checked')) {
        $("input[name='list2']").prop("checked", true);
    } else {
        $("input[name='list2']").prop("checked", false);
    }
})
$("input[name='list2']").click(function () {
    var num = ''
    var i = 0;
    $("input[name='list2']").each(function (key, val) {
        num = key + 1;
        if ($(this).prop('checked')) {
            i++;
        }
    })
    if (i == num) {
        $('.list2').prop("checked", true)
    } else {
        $('.list2').prop("checked", false)
    }
})
//角色创建、修改点击编辑页面跳转
function updateTable() {
    classname = '#updateManage '
    changeBread(classname, [{title: '角色管理', link: "javascript:updateManageBack()"}, {title: '角色添加'}]);
    $('#roleManage').hide();
    $('#updateManage').show();
    $("#p1").show();
    $("#p2").hide();
    $("#roleName").val("");
    $("#roleDesc").val("");
    $(".rights li input").prop("checked", false);
}

//信息编辑页面
function updateInfo(id) {
    operatingInfoID = id;
    changeType = 2;
    $('#updateInfo input').attr('disabled', false)
    $('#updateInfo select').attr('disabled', false)
    $('#updateInfo .simditor-body').attr('contenteditable', true)
    $('.info_update').show();
    $('.info_check').hide();
    classname = '#updateInfo ';
    changeBread(classname, [{title: '信息管理', link: "javascript:updateInfoBack()"}, {title: '信息修改'}]);
    $('#infoManage').hide();
    $('.parts').hide();
    $('#recordInfo').hide();
    $('#updateInfo').show();
    $("#compare1").show();
    ajaxPost("/seimp/news/getNewsDetail", {newsID: id}).done(function (data) {
        if (data.status == 0) {
            var tem = data.data;
            $("#title").val(tem.title);
            $("#newsType2").val(tem.type);
            $("#author").val(tem.author);
            if (tem.url != "") {
                $("#compare0").show();
                sourceUrl = tem.url;
            } else {
                $("#compare0").hide();
                sourceUrl = "";
            }
            $("#checker1").val(tem.checker);
            $("#comment").val(tem.comment);
            $("#source1").val(tem.source);
            $("#date2").val(tem.writeDate);
            var flag = tem.top == "" ? "0" : tem.top;
            $("input[name='top'][data_value='" + flag + "']").prop("checked", "checked");
            $(".ministry_show2").hide();
            $(".city_show2").hide();
            if (tem.type == 2) {
                $(".city_show2").show();
                var code = tem.regionCode;
                if (code == "") {
                    getRegions(0, "province2");
                    $("#province2").val("");
                    $("#city2").html("");
                    $("#county2").html("");
                } else {
                    if (code.indexOf("0000") != -1) {
                        $("#province2").val(code);
                        getRegions(code, "city2");
                        $("#county2").html("");
                    } else if (code.indexOf("00") != -1) {
                        getRegions(code.substring(0, 2) + "0000", "city2");
                        getRegions(code.substring(0, 4) + "00", "county2");
                        $("#province2").val(code.substring(0, 2) + "0000");
                        $("#city2").val(code);
                        $("#county2").val("");
                    } else {
                        getRegions(code.substring(0, 2) + "0000", "city2");
                        getRegions(code.substring(0, 4) + "00", "county2");
                        $("#province2").val(code.substring(0, 2) + "0000");
                        $("#city2").val(code.substring(0, 4) + "00");
                        $("#county2").val(code);
                    }
                }
            } else if (tem.type == 1) {
                $(".ministry_show2").show();
                $("#ministry1").val(tem.ministry.trim());
            }
            $("#kpart1").hide();
            if (tem.type == 1 || tem.type == 2 || tem.type == 3) {
                $("#kpart1").show();
                var keywords = tem.keyword;
                $("#keyword1").html("");
                if (keywords != "") {
                    var arr = keywords.split(/[,，]/);
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] != "") {
                            var lab = "<span class='label label-info' style='margin-left: 2px'>" + arr[i] + "<i class='fa fa-times-circle keyitem1' style='cursor: pointer'></i></span>";
                            $("#keyword1").append(lab);
                        }
                    }
                    $(".keyitem1").click(function (obj) {
                        this.parentNode.remove();
                        return false;
                    });
                }
            }
            ue1.setEnabled();
            ue1.setContent(tem.content);
            $(".filename").hide();
            $("#filename").html("");
            $("#picname").html("");
            if (tem.files.length > 0) {
                $(".filename").show();
                $("#filename").html(tem.files[0].FILENAME);
            }
            if (tem.pics.length > 0) {
                $(".filename").show();
                $("#picname").html(tem.pics[0].FILENAME);
            }
        } else {

        }
    });
}
/*点击修改舆情*/
function updateNetwork(id) {
    flag=1;
    opetatingNewworkID = id;
    $('#updateNetword textarea').attr('disabled', false)
    
    $('#updateNetword input').attr('disabled', false)
    $('#updateNetword select').attr('disabled', false)
    $('#updateNetword .simditor-body').attr('contenteditable', true)
    $('.network_update').show();
    $('.network_check').hide();
    classname = '#updateNetword '
    changeBread(classname, [{title: '舆情管理', link: "javascript:changeDiv(11)"}, {title: '舆情修改'}]);
    $('.parts').hide();
    $('#updateNetword').show();
    ajaxPost("/seimp/news/getNetworkNewsDetail", {newsID: id}).done(function (data) {
        if (data.status == 0) {
            var tem = data.data;
            $("#keyword3").html("");
            var keywords = tem.DICT_type;
            if (undefined!=keywords&& keywords!=null && keywords != "") {
                var arr = keywords.split(/[,，]/);
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] != "") {
                        var lab = "<span class='label label-info' style='margin-left: 2px'>" + arr[i] + "<i class='fa fa-times-circle keyitem3' style='cursor: pointer'></i></span>";
                        $("#keyword3").append(lab);
                    }
                }
                $(".keyitem3").click(function (obj) {
                    this.parentNode.remove();
                    return false;
                });
            }
            $("#title12").val(tem.title);
            $("#url").val(tem.url);
            $("#date12").val(tem.fetchTime);
            $("#source11").val(tem.source);
            $("#region1").selectpicker('val', tem.chinaRegion1.split(","));
            $("#region2").selectpicker('val', tem.chinaRegion2.split(","));
            $("#region3").selectpicker('val', tem.chinaRegion3.split(","));
            $("#lon").val(tem.lon);
            $("#lat").val(tem.lat);
            //    ue2.setEnabled();
            ue3.setEnabled();
            $("#summary").val(tem.summary);
            //    ue2.setContent(tem.summary);
            ue3.setContent(tem.content);
        } else {
        }
    });
}

/*点击审核舆情*/
function checkNetwork(id) {
    flag=3;
    opetatingNewworkID = id;
    $('#updateNetword textarea').attr('disabled', true);
    
    $('#updateNetword input').attr('disabled', true);
    $('#updateNetword select').attr('disabled', true);
    $('#updateNetword div').attr('disabled', true);
    $('#updateNetword .simditor-body').attr('contenteditable', false);
    $('.network_update').hide();
    $('.network_check').show();
    classname = '#updateNetword ';
    changeBread(classname, [{title: '舆情管理', link: "javascript:changeDiv(11)"}, {title: '审核舆情'}]);
    $('.parts').hide();
    $('#updateNetword').show();
    ajaxPost("/seimp/news/getNetworkNewsDetail", {newsID: id}).done(function (data) {
        if (data.status == 0) {
            var tem = data.data;
            var keywords = tem.DICT_type;
            $("#keyword3").html("");
            if (undefined!=keywords&&keywords!=null &&keywords != "") {
                var arr = keywords.split(/[,，]/);
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] != "") {
                        var lab = "<span class='label label-info' style='margin-left: 2px'>" + arr[i] + "<i class='fa fa-times-circle keyitem3' style='cursor: pointer'></i></span>";
                        $("#keyword3").append(lab);
                    }
                }
            }

            $("#title12").val(tem.title);
            $("#url").val(tem.url);
            $("#date12").val(tem.fetchTime);
            $("#source11").val(tem.source);
            $("#region1").selectpicker('val', tem.chinaRegion1.split(","));
            $("#region2").selectpicker('val', tem.chinaRegion2.split(","));
            $("#region3").selectpicker('val', tem.chinaRegion3.split(","));
            $("#lon").val(tem.lon);
            $("#lat").val(tem.lat);
            $("#summary").val(tem.summary);
            //  ue2.setContent(tem.summary);
            ue3.setContent(tem.content);
            //   ue2.setDisabled();
            ue3.setDisabled();
            // editor2.setValue(tem.summary);
            // editor3.setValue(tem.content);
        } else {

        }
    });
}
/*审核通过咨询*/
function passInfo() {
    ajaxPost("/seimp/news/passNews", {newsIDs: operatingInfoID}).done(function (data) {
        if (data.status == 0) {
            swal("成功通过信息", "", "success");
        } else {
            swal(data.msg, "", "error");
        }
        changeDiv(1);
    });
}
/*审核不通过咨询*/
function rejectInfo() {
    ajaxPost("/seimp/news/rejectNews", {newsIDs: operatingInfoID}).done(function (data) {
        if (data.status == 0) {
            swal("成功不通过信息", "", "success");
        } else {
            swal("不通过信息失败", "", "error");
        }
        changeDiv(1);
    });
}
/*确定修改信息*/
function modifyInfo() {
    var title = $("#title").val();
    var type = $("#newsType2").val();
    var author = $("#author").val();
    var source = $("#source1").val();
    var top = $("input[name='top']:checked").attr("data_value");
    var content = ue1.getContent();
    var regionCode = "";
    var ministry = "";
    if (title == "") {
        return toastr.warning("请填写标题");
    }
    if (content == "") {
        return toastr.warning("请填写正文");
    }
    if (type == 2) {
        var county = $("#county2").val();
        if (county != "" && county != null) {
            regionCode = county;
        } else if ($("#city2").val() != "" && $("#city2").val() != null) {
            regionCode = $("#city2").val();
        } else if ($("#province2").val() != "") {
            regionCode = $("#province2").val();
        }
        if (regionCode == "") {
            return toastr.warning("请选择行政区划");
        }
    } else if (type == 1) {
        ministry = $("#ministry1").val();
        if (ministry == "" || ministry == undefined || ministry == null) {
            return toastr.warning("请选择部委");
        }
    }
    var pic = $('#pic2')[0].files[0];
    if (type == 8 && pic == undefined) {
//        return toastr.warning("请选择图片");
    }
    var spans = $("#keyword1 span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    var keywords = arr.join(",");
    var datas = {
        title: title,
        type: type,
        content: content,
        source: source,
        newsID: operatingInfoID,
        top: top,
        keyword: keywords,
        checker: $("#checker1").val(),
        author: author,
        fileNumber: "",
        date: $("#date2").val(),
        regionCode: regionCode,
        ministry: ministry
    };
    
    var fileUpload = false;
    var picUpload = false;
    //等待框
	systemDengdai();
    ajaxPost("/seimp/news/modifyNews", datas).done(function (data) {
        if (data.status == 0) {
            var fileNumber = data.data;
            var file = $('#file2')[0].files[0];
            if (file != undefined && file != null) {
                var formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    url: "/seimp/news/uploadFile?type=2&picNumber=" + fileNumber,
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function (data) {
                	fileUpload = true;
                    if (data.status == 0) {
                    	if(pic==null||picUpload==true){
                    		//删除等待框
                    		removeSystemDengdai();
                    		changeDiv(5);
                    		swal("成功修改信息", "", "success");
                    	}
                    } else {
                    	//删除等待框
                		removeSystemDengdai();
                        return toastr.error("文件上传失败");
                    }
                });
            }
            if (pic != undefined && pic != null) {
                var formData1 = new FormData();
                formData1.append('file', pic);
                $.ajax({
                    url: "/seimp/news/uploadFile?type=1&picNumber=" + fileNumber,
                    type: 'POST',
                    data: formData1,
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function (data) {
                	picUpload = true;
                    if (data.status == 0) {
                    	if(file==null||fileUpload==true){
                    		//删除等待框
                    		removeSystemDengdai();
                    		changeDiv(5);
                    		swal("成功修改信息", "", "success");
                    	}
                    } else {
                    	//删除等待框
                		removeSystemDengdai();
                        return toastr.error("图片上传失败");
                    }
                });
            }
            if(file==null && pic==null){
            	//删除等待框
        		removeSystemDengdai();
            	changeDiv(5);
            	swal("成功修改信息", "", "success");
            }
            swal("成功修改信息", "", "success");
            changeDiv(1);
        } else {
        	//删除等待框
    		removeSystemDengdai();
            swal("修改信息失败", "", "error");
        }
    });
}

/*确定修改信息，并审核通过*/
function modifyInfoAndPass() {
    var title = $("#title").val();
    var type = $("#newsType2").val();
    var author = $("#author").val();
    var source = $("#source1").val();
    var top = $("input[name='top']:checked").attr("data_value");
    var content = ue1.getContent();
    var regionCode = "";
    var ministry = "";
    if (title == "") {
        return toastr.warning("请填写标题");
    }
    if (content == "") {
        return toastr.warning("请填写正文");
    }
    if (type == 2) {
        var county = $("#county2").val();
        if (county != "" && county != null) {
            regionCode = county;
        } else if ($("#city2").val() != "" && $("#city2").val() != null) {
            regionCode = $("#city2").val();
        } else if ($("#province2").val() != "") {
            regionCode = $("#province2").val();
        }
        if (regionCode == "") {
            return toastr.warning("请选择行政区划");
        }
    } else if (type == 1) {
        ministry = $("#ministry1").val();
        if (ministry == "" || ministry == undefined || ministry == null) {
            return toastr.warning("请选择部委");
        }
    }
    var pic = $('#pic2')[0].files[0];
    if (type == 8 && pic == undefined) {
//        return toastr.warning("请选择图片");
    }
    var spans = $("#keyword1 span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    var keywords = arr.join(",");
    var datas = {
        title: title,
        type: type,
        content: content,
        source: source,
        newsID: operatingInfoID,
        top: top,
        keyword: keywords,
        checker: $("#checker1").val(),
        author: author,
        fileNumber: "",
        date: $("#date2").val(),
        regionCode: regionCode,
        ministry: ministry
    };
    
    var fileUpload = false;
    var picUpload = false;
    //等待框
	systemDengdai();
    ajaxPost("/seimp/news/modifyNewsAndPass", datas).done(function (data) {
        if (data.status == 0) {
            var fileNumber = data.data;
            var file = $('#file2')[0].files[0];
            if (file != undefined && file != null) {
                var formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    url: "/seimp/news/uploadFile?type=2&picNumber=" + fileNumber,
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function (data) {
                	fileUpload = true;
                    if (data.status == 0) {
                    	if(pic==null||picUpload==true){
                    		//删除等待框
                    		removeSystemDengdai();
                    		changeDiv(5);
                    		swal("成功修改信息", "", "success");
                    	}
                    } else {
                    	//删除等待框
                		removeSystemDengdai();
                        return toastr.error("文件上传失败");
                    }
                });
            }
            if (pic != undefined && pic != null) {
                var formData1 = new FormData();
                formData1.append('file', pic);
                $.ajax({
                    url: "/seimp/news/uploadFile?type=1&picNumber=" + fileNumber,
                    type: 'POST',
                    data: formData1,
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function (data) {
                	picUpload = true;
                    if (data.status == 0) {
                    	if(file==null||fileUpload==true){
                    		//删除等待框
                    		removeSystemDengdai();
                    		changeDiv(5);
                    		swal("成功修改信息", "", "success");
                    	}
                    } else {
                    	//删除等待框
                		removeSystemDengdai();
                        return toastr.error("图片上传失败");
                    }
                });
            }
            
            if(file==null && pic==null){
            	//删除等待框
        		removeSystemDengdai();
            	changeDiv(5);
            	swal("成功修改信息", "", "success");
            }
        } else {
        	//删除等待框
    		removeSystemDengdai();
            swal("修改信息失败", "", "error");
        }
    });
}

//角色创建、修改面包屑返回
function updateManageBack() {
    changeBg($("#update_user"), 4);
    $('#roleManage').show();
    $('#updateManage').hide();
    initBootstrapTable1();
}

/*删除信息*/
function removeInfo(id) {
    swal({
        title: "确认删除",
        text: "确认删除该信息？",
        type: "warning",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62"
    }, function () {
        ajaxPost("/seimp/news/deleteNews", {newsIDs: id}).done(function (data) {
            if (data.status == 0) {
                swal("成功删除信息", "", "success");
            } else {
                swal("删除信息失败", "", "error");
            }
            initBootstrapTable2();
        });
    });

}
//用户修改页面返回
function updateUserBack() {
    changeBg($("#list_user"), 2);
    $('#addUser').hide();
    $('#updateUser').hide();
    $('#userList').show();
    initBootstrapTable();
}
//信息编辑页面返回信息管理
function updateInfoBack() {
    $('#updateInfo').hide();
    $('#infoManage').show();
    initBootstrapTable2();
}
//删除
function del() {
    swal("删除成功", "三秒后自动关闭", "success", {
        timer: 3000
    });
    $('.swal-button').remove();
}
var newsType = {};
/**/
function getNewsType() {
    ajaxPost("/seimp/news/getNewsType", {}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var tem = data.data[i];
                newsType[tem.ID] = tem.TYPENAME;
                html += "<option value='" + tem.ID + "'>" + tem.TYPENAME + "</option>";
            }
            $("#newsType").html(html);
            $("#newsType2").html(html);
            $("#newsType1").html("<option value=''>全部</option>" + html);
            $("#newsType3").html("<option value=''>全部</option>" + html);
        }
    });
}
/*新建信息*/
function publishNews() {
	
    var title = $("#title1").val();
    var type = $("#newsType").val();
    var source = $("#source").val();
    var author = $("#author1").val();
    var top = $("input[name='radio3']:checked").attr("data_value");
    var content = ue.getContent();
    var date = $("#date1").val();
    var regionCode = "";
    var ministry = "";
    if (type == 2) {
        var county = $("#county1").val();
        if (county != "" && county != null) {
            regionCode = county;
        } else if ($("#city1").val() != "" && $("#city1").val() != null) {
            regionCode = $("#city1").val();
        } else if ($("#province1").val() != "") {
            regionCode = $("#province1").val();
        }
        if (regionCode == "") {
            return toastr.warning("请选择行政区划");
        }
    } else if (type == 1) {
        ministry = $("#ministry").val();
        if (ministry == "") {
            return toastr.warning("请选择部委");
        }
    }
    if (title == "") {
        return toastr.warning("请填写标题");
    }
    if (content == "") {
        return toastr.warning("请填写正文");
    }
//    var pic = $('#pic0')[0].files[0];
    var pic = null;
    if($('#pic00')[0].files){
    	pic = $('#pic00')[0].files[0];
    }
    if (type == 8 && pic == undefined) {
        return toastr.warning("请选择图片");
    }
    $("#add_button1").attr("disabled", true);
    var spans = $("#keyword span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    var keywords = arr.join(",");
    var datas = {
        title: title,
        type: type,
        date: date,
        regionCode: regionCode,
        content: content,
        source: source,
        checker: $("#checker").val(),
        keyword: keywords,
        author: author,
        fileNumber: "",
        ministry: ministry,
        "top": top,
    };
    var fileUpload = false;
    var picUpload = false;
    //等待框
	systemDengdai();
    ajaxPost("/seimp/news/addNews", datas).done(function (te) {
        if (te.status == 0) {
            var fileNumber = te.data;
//            var file = $('#file0')[0].files[0];
            var file = null;
            if($('#file00')[0].files){
            	file = $('#file00')[0].files[0];
            }
            if (file != undefined && file != null) {
                var formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    url: "/seimp/news/uploadFile?type=2&picNumber=" + fileNumber,
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function (data) {
                	fileUpload = true;
                	
                    if (data.status == 0) {
                    	if(pic==null||picUpload==true){
                    		//删除等待框
                    		removeSystemDengdai();
                    		changeDiv(5);
                    		swal("成功录入信息", "", "success");
                    	}
                    } else {
                    	//删除等待框
                		removeSystemDengdai();
                        return toastr.error("文件上传失败");
                    }
                });
            }

            if (pic != undefined && pic != null) {
                var formData1 = new FormData();
                formData1.append('file', pic);
                $.ajax({
                    url: "/seimp/news/uploadFile?type=1&picNumber=" + fileNumber,
                    type: 'POST',
                    data: formData1,
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function (data) {
                	picUpload = true;
                    if (data.status == 0) {
                    	if(file==null||fileUpload==true){
                    		//删除等待框
                    		removeSystemDengdai();
                    		changeDiv(5);
                    		swal("成功录入信息", "", "success");
                    	}
                    } else {
                    	//删除等待框
                		removeSystemDengdai();
                        return toastr.error("图片上传失败");
                    }
                });
            }
            
            if(file==null && pic==null){
            	//删除等待框
        		removeSystemDengdai();
            	changeDiv(5);
            	swal("成功录入信息", "", "success");
            }
        } else {
        	//删除等待框
    		removeSystemDengdai();
            swal("录入信息失败", "", "error");
        }
        $("#add_button1").attr("disabled", false);
    });


}

/**
 * 富文本编辑器Simditor进行初始化
 */
var ue = UE.getEditor('editor', {
    initialFrameHeight: 250,
    elementPathEnabled: false,
    autoHeightEnabled: false,
    wordCount: false
});
var ue1 = UE.getEditor('editor1', {
    initialFrameHeight: 250,
    elementPathEnabled: false,
    autoHeightEnabled: false,
    wordCount: false
});
var ue3 = UE.getEditor('editor3', {
    initialFrameHeight: 250,
    elementPathEnabled: false,
    autoHeightEnabled: false,
    wordCount: false
});
var ue4 = UE.getEditor('editor4', {
    initialFrameHeight: 400,
    elementPathEnabled: false,
    autoHeightEnabled: false,
    wordCount: false
});

function uploadFile() {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('picture', pic);
    $.ajax({
        url: "/seimp/news/uploadFile?type=1&picNumber=",
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false
    }).done(function (data) {
        if (data.status == 0) {
            toastr.success("上传成功");
        } else {
        }
    });
}
/*新增资讯改变资讯类型*/
$('#newsType').change(function () {
    $('.city_show').hide();
    $('.ministry_show').hide();
    $('#kpart').hide();
    if ($(this).val() == 2) {
        $('.city_show').show();
        $('#kpart').show();
    } else if ($(this).val() == 1) {
        $('.ministry_show').show();
        $('#kpart').show();
    } else if ($(this).val() == 3) {
        $('#kpart').show();
    }
});

/*修改资讯改变资讯类型*/
$('#newsType2').change(function () {
    $('.city_show2').hide();
    $('.ministry_show2').hide();
    $('#kpart1').hide();
    if ($(this).val() == 2) {
        $('.city_show2').show();
        $('#kpart1').show();
    } else if ($(this).val() == 1) {
        $('.ministry_show2').show();
        $('#kpart1').show();
    } else if ($(this).val() == 3) {
        $('#kpart1').show();
    }
});
$('.form_date').datetimepicker({
    language: 'zh-CN',
    format: 'yyyy-mm-dd',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
});
/*$('.form_date').datetimepicker({
 language: 'zh-CN',
 weekStart: 1,
 format: 'yyyy-mm-dd HH:mm:ss',
 todayBtn: 1,
 autoclose: 1,
 todayHighlight: 1,
 startView: 2,
 minView: 3,
 forceParse: 0

 });*/

function changeBg(th, type) {
    $('.J_menuItem').removeClass('bg_blue')
    $(th).addClass('bg_blue')
    changeDiv(type);
}
$("#keyword").click(function () {
    if ($(".spart1").is(":hidden")) {
        $("#searchkeyword").val("");
        var data = {
            keyword: "",
            newsType: $("#newsType").val(),
            pageSize: "5"
        }
        var url = '/seimp/news/getKeywords';
        ajaxPost(url, data).done(function (res) {
            $(".keywordpart p").remove();
            $('.spart1').show();
            $.each(res.data, function (key, val) {
                var dom = ''
                dom += '<p onclick="getText(\'' + val + '\')">' + val + '</p>'
                $(".keywordpart").append(dom)
            })
        })
    } else {
        $('.spart1').hide();
    }
})
$(".spart1").on("input propertychange", function () {
    var data = {
        keyword: $("#searchkeyword").val(),
        newsType: $("#newsType").val(),
        pageSize: "5"
    }
    var url = '/seimp/news/getKeywords';
    ajaxPost(url, data).done(function (res) {
        $(".keywordpart p").remove();
        $('.spart1').show();
        $.each(res.data, function (key, val) {
            var dom = '';
            dom += '<p onclick="getText(\'' + val + '\')">' + val + '</p>'
            $(".keywordpart").append(dom)
        })
    })
})
function getText(word) {
    // var data = $(th).text();
    var spans = $("#keyword span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    if (arr.indexOf(word) != -1) {
        return toastr.info("已添加该关键词");
    }
    var lab = "<span class='label label-info' style='margin-left: 2px'>" + word + "<i class='fa fa-times-circle keyitem' style='cursor: pointer' ></i></span>";
    $("#keyword").append(lab);
    $(".keyitem").click(function (obj) {
        this.parentNode.remove();
        return false;
    });
}


$("#keyword3").click(function () {
    if ($(".spart3").is(":hidden") && flag != 3) {
        $("#searchkeyword3").val("");
        var data = {
            keyword: "",
            pageSize: "5"
        }
        var url = '/seimp/user/getNetwoorkTypes';
        ajaxPost(url, data).done(function (res) {
            $(".keywordpart3 p").remove();
            $('.spart3').show();
            $.each(res.data, function (key, val) {
                var dom = ''
                dom += '<p onclick="getText3(\'' + val + '\')">' + val + '</p>'
                $(".keywordpart3").append(dom)
            })
        })
    } else {
        $('.spart3').hide();
    }
})
$(".spart3").on("input propertychange", function () {
    var data = {
        keyword: $("#searchkeyword3").val(),
        pageSize: "5"
    }
    var url = '/seimp/user/getNetwoorkTypes';
    ajaxPost(url, data).done(function (res) {
        $(".keywordpart3 p").remove();
        $('.spart3').show();
        $.each(res.data, function (key, val) {
            var dom = '';
            dom += '<p onclick="getText3(\'' + val + '\')">' + val + '</p>'
            $(".keywordpart3").append(dom)
        })
    })
})
function getText3(word) {
    // var data = $(th).text();
    var spans = $("#keyword3 span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    if (arr.indexOf(word) != -1) {
        return toastr.info("已添加该关键词");
    }
    var lab = "<span class='label label-info' style='margin-left: 2px'>" + word + "<i class='fa fa-times-circle keyitem3' style='cursor: pointer' ></i></span>";
    $("#keyword3").append(lab);
    $(".keyitem3").click(function (obj) {
        this.parentNode.remove();
        return false;
    });
}


/*修改资讯*/
$("#keyword1").click(function () {
    if ($(".spart2").is(":hidden") && changeType != 3) {
        $("#searchkeyword1").val("");
        var data = {
            keyword: "",
            newsType: $("#newsType2").val(),
            pageSize: "5"
        }
        var url = '/seimp/news/getKeywords';
        ajaxPost(url, data).done(function (res) {
            $(".keywordpart1 p").remove();
            $('.spart2').show();
            $.each(res.data, function (key, val) {
                var dom = ''
                dom += '<p onclick="getText1(\'' + val + '\')">' + val + '</p>'
                $(".keywordpart1").append(dom)
            })
        })
    } else {
        $('.spart2').hide();
    }
})
$(".spart2").on("input propertychange", function () {
    var data = {
        keyword: $("#searchkeyword1").val(),
        newsType: $("#newsType2").val(),
        pageSize: "5"
    }
    var url = '/seimp/news/getKeywords';
    ajaxPost(url, data).done(function (res) {
        $(".keywordpart1 p").remove();
        $('.spart2').show();
        $.each(res.data, function (key, val) {
            var dom = '';
            dom += '<p onclick="getText1(\'' + val + '\')">' + val + '</p>'
            $(".keywordpart1").append(dom)
        })
    })
})
function getText1(word) {
    // var data = $(th).text();
    var spans = $("#keyword1 span");
    var arr = [];
    for (var i = 0; i < spans.length; i++) {
        arr.push(spans[i].innerText);
    }
    if (arr.indexOf(word) != -1) {
        return toastr.info("已添加该关键词");
    }
    var lab = "<span class='label label-info' style='margin-left: 2px'>" + word + "<i class='fa fa-times-circle keyitem1' style='cursor: pointer' ></i></span>";
    $("#keyword1").append(lab);
    $(".keyitem1").click(function (obj) {
        this.parentNode.remove();
        return false;
    });
}
var changeType;
/*添加关键词模态窗*/
function addKeyword(type) {
    if (changeType != 3) {
        changeType = type;
        $("#word").val("");
        $("#example").modal();
    }
}
var flag;
/*添加关键词模态窗*/
function addKeyword3() {
    if(flag!=3){
        $("#word3").val("");
        $("#example3").modal();
    }
}
/*添加关键词*/
function insertKeyword() {
    var word = $("#word").val();
    if (word == "") {
        return toastr.warning("请填写关键词");
    }
    if (changeType == 1) {
        var spans = $("#keyword span");
        var arr = [];
        for (var i = 0; i < spans.length; i++) {
            arr.push(spans[i].innerText);
        }
        if (arr.indexOf(word) != -1) {
            return toastr.info("已添加该关键词");
        }
        var lab = "<span class='label label-info' style='margin-left: 2px'>" + word + "<i class='fa fa-times-circle keyitem' style='cursor: pointer'></i></span>";
        $("#keyword").append(lab);
        $(".keyitem").click(function (obj) {
            this.parentNode.remove();
            return false;
        });
    } else {
        var spans = $("#keyword1 span");
        var arr = [];
        for (var i = 0; i < spans.length; i++) {
            arr.push(spans[i].innerText);
        }
        if (arr.indexOf(word) != -1) {
            return toastr.info("已添加该关键词");
        }
        var lab = "<span class='label label-info' style='margin-left: 2px'>" + word + "<i class='fa fa-times-circle keyitem1' style='cursor: pointer'></i></span>";
        $("#keyword1").append(lab);
        $(".keyitem1").click(function (obj) {
            this.parentNode.remove();
            return false;
        });
    }
    $("#example").modal('hide');
}

/*添加分类*/
function insertKeyword3() {
    var word = $("#word3").val();
    if (word == "") {
        return toastr.warning("请填写关分类名称");
    }
        var spans = $("#keyword3 span");
        var arr = [];
        for (var i = 0; i < spans.length; i++) {
            arr.push(spans[i].innerText);
        }
        if (arr.indexOf(word) != -1) {
            return toastr.info("已添加该关键词");
        }
        var lab = "<span class='label label-info' style='margin-left: 2px'>" + word + "<i class='fa fa-times-circle keyitem3' style='cursor: pointer'></i></span>";
        $("#keyword3").append(lab);
        $(".keyitem3").click(function (obj) {
            this.parentNode.remove();
            return false;
        });
    $("#example3").modal('hide');
}
/*验证用户名*/
function isPostalName(s) {
    var patrn = /(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]{5,16}/;
    if (!patrn.exec(s)) return false
    return true
};
/*验证密码*/
function isPostalCode(s) {
    var patrn = /(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]{8,20}/;
    /*^(?![a-zA-z]+$)(?!\d+$)[a-zA-Z\d]+$*/
    if (!patrn.exec(s)) return false
    return true
};

function isAllChar(s){
	var patrn = /^[a-zA-Z]*$/;
	if (patrn.test(s)) return true
    return false
}

function isAllNum(s){
	var patrn = /^[0-9]*$/;
	if (patrn.test(s)) return true
    return false
}

UE.Editor.prototype._bkGetActionUrl = UE.Editor.prototype.getActionUrl;
//action是config.json配置文件的action
UE.Editor.prototype.getActionUrl = function (action) {
    if (action == 'uploadimage') {
        return "/seimp/news/uploadimage";
    } else if (action == 'uploadvideo') {
        return "/seimp/news/uploadimage";
        // return [[@{/common/upload/image}]];
    } else if (action == 'config') {
        return "/seimp/ueditor/jsp/config.json";
        //  return this._bkGetActionUrl.call(this, action);
    }
};

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function compare() {
    $("#compare1").hide();
    $("#compare2").show();
    $("#sourceIframe").attr("src", sourceUrl.replace("watch?v=", "v/"));
    $("#openUrl").attr("href", sourceUrl.replace("watch?v=", "v/"));
    $("#sourceUrl").html(sourceUrl.replace("watch?v=", "v/"));
    ue4.setContent(ue1.getContent());
}
function completeCompare() {
    $("#compare2").hide();
    $("#compare1").show();
    ue1.setContent(ue4.getContent());

}

function exportFile() {
    $("#startDate1").val(""),
        $("#endDate1").val(""),
        $("#title4").val(""),
        $("#source4").val(""),
        $("#checkType4").val("")
    $("#exportPart").modal();
}
function ensureExportFile() {
    if ( $("#endDate1").val()!=""&&$("#startDate1").val() > $("#endDate1").val()) {
        return toastr.error("开始时间不能大于结束时间")
    }
    var datas = {
        startTime: $("#startDate1").val(),
        endTime: $("#endDate1").val(),
        title: $("#title4").val(),
        source: $("#source4").val(),
        status: $("#checkType4").val()
    };
    $("#exportPart").modal('hide');
    toastr.info("请稍候");
    ajaxPost("/seimp/news/exportFile", datas).done(function (res) {
        if (res.status == 0) {
            window.location.href = res.data;
        } else {
            toastr.error("导出失败");
        }
    });
}


/**
	**yss
**/
//条件查询参数
var searchParams = {//清单模式查询条件
	msgType: "",
	msgStartTime: "",
	msgEndTime: "",
	msgStatus: "",
};
/*获取消息类型*/
function getMsgTypes() {
    ajaxPost("/seimp/user/getAllRoles1", {}).done(function (data) {
        if (data.status == 0) {
            userTypes = {};
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var prop = data.data[i];
                userTypes[prop.ROLEID] = prop.ROLENAME;
                html += "<option value=" + prop.ROLEID + ">" + prop.ROLENAME + "</option>";
            }
            html = "<option value=''>全部</option>" + html;
            $("#msgType").html(html);
            
        }
    });
}

//筛选消息时间
$('#msgStartTime').datetimepicker({
    language: 'zh-CN',
    format: 'yyyy-mm-dd',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
});
$('#msgEndTime').datetimepicker({
    language: 'zh-CN',
    format: 'yyyy-mm-dd',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
});

function RefreshData() {
    var time1 = $("#msgStartTime").val();
    var time2 = $("#msgEndTime").val();
    
    if (time2 != null && time2 != undefined && time2 != "" && time1 > time2) {
        return toastr.error("开始时间不能大于结束时间");
    }   
}
/*消息列表*/
function getMessage() {    
    ajaxPost("/seimp/news/getNewsByKey", {
    	msgType: searchParams.msgType,
    	msgStartTime: searchParams.msgStartTime,
    	msgEndTime: searchParams.msgEndTime,
    	msgStatus: searchParams.msgStatus,
        pageNumber: 1,
        pageSize: 13
    }).done(function (res) {
            var html = "";
            //var msgFlag=0;
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
                html += '<li class="msg-li ">';
                html += "<a onclick='updateMsg(" + tem.id + ")'  class='clearfix'>";
                html += '<i class="iconfont icon-right pull-left"></i>';
                html += "<p class='pull-left' title=" + tem.title + ">" + tem.title + "</p>"
                if (tem.top == '0') {
                    html += "<img src='img/new_top.png' class='pull-left'>";
                    msgFlag++;
                }
                html += "<span class='pull-right'>" + tem.writeDate + "</span></a></li>";
                //console.log(magflag);
                //sessionStorage.setItem("msgNum",magflag);
            }
            $("#msgList").html(html);
            var options = {
                bootstrapMajorVersion: 3,
                currentPage: 1,//当前页
                totalPages: res.total,//总页数
                numberofPages: 5,//显示的页数
                itemTexts: function (type, page, current) { //修改显示文字
                    switch (type) {
                        case "first":
                            return "第一页";
                        case "prev":
                            return "上一页";
                        case "next":
                            return "下一页";
                        case "last":
                            return "最后一页";
                        case "page":
                            return page;
                    }
                }, onPageClicked: function (event, originalEvent, type, page) { //异步换页
                    console.log(page);
                    ajaxPost("/seimp/news/getNewsByKey", {
                    	msgType: searchParams.msgType,
                    	msgStartTime: searchParams.msgStartTime,
                    	msgEndTime: searchParams.msgEndTime,
                    	msgStatus: searchParams.msgStatus,
                        pageNumber: page,
                        pageSize: 13
                    }).done(function (res) {
                            $("#msgList").html("");
                            var html = "";
                            for (var i = 0; i < res.rows.length; i++) {
                                var tem = res.rows[i];
                                html += '<li class="msg-li ">';
                                html += "<a onclick='updateMsg(" + tem.id + ")' class='clearfix'>";
                                html += '<i class="iconfont icon-right pull-left"></i>';
                                html += "<p class='pull-left' title=" + tem.title + ">" + tem.title + "</p>"
                                if (tem.top == '0') {
                                    html += "<img src='img/new_top.png' class='pull-left'>";
                                }
                                html += "<span class='pull-right'>" + tem.writeDate + "</span></a></li>";
                            }
                            $("#msgList").html(html);
                        }
                    );
                },
            };
            $('#msgPag').bootstrapPaginator(options);
        }
    );
}
//查询        
function searchMsg() {
	searchParams.msgType=$("#msgType").val();
	searchParams.msgStartTime=$("#msgStartTime").val();
	searchParams.msgEndTime=$("#msgEndTime").val();
	searchParams.msgStatus=$("#msgStatus").val();
	
	if($("#msgType").val()==null){
		searchParams.msgType=""
	}	
	if($("#msgStatus").val()==null){
		searchParams.msgStatus=""
	}	
	RefreshData()
	console.log($("#msgType").val());
	console.log($("#msgStartTime").val());
	console.log($("#msgEndTime").val());
	console.log($("#msgStatus").val());
	//getMessage()	
}



//通知详情页面返回
function updateMsgBack() {
    $('#msgDetails').hide();
    $('#messageAlert').show();
    getMsgTypes();
    searchMsg()
}
/*跳转到消息详情界面*/
var operateMsgID;
function updateMsg(id) {
    $('#msgDetails').show();
    $('#messageAlert').hide();
//    ajaxPost("/seimp/user/getAUser", {"msgID": id}).done(function (data) {
//        if (data.status == 0) {
//            var row = data.data;
//            $("#msgDetails .msgInfo").html()
//        } else {
//        }
//    });

}



/*增加用户角色第四部*/
/*用户列表*/
function initBootstrapTable_add(catalogID) {
    //销毁表格
    $('#table_addUser').bootstrapTable('destroy');
    //生成表格
    $('#table_addUser').bootstrapTable({
        method: 'POST',
        url: "/seimp/authority/getMetadataByCatalog",
        ajaxOptions: {async: true, timeout: 10000},
        queryParams:function(params){
		    	var data =  JSON.stringify({
		    		catalogID : catalogID,
		    		roleID : operatingRoleID
	        });
	    	var datas = {};
	    	datas.data = data;
	        return datas;
	    },
        columns: [
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },{
                field: 'id',
                align: 'center',
                valign: 'middle',
                visible:false
            },{
                field: 'name',
                title: '名称',
                align: 'center',
                valign: 'middle',
            }, {
                title: '查看权限',
                align: 'center',
                valign: 'middle',
				formatter: function (value, row, index) {
					if(row.READAUTH){
						return '<input type="checkbox"  name="visitInput" value="' + row.id + '" checked/>';   
					}
				    return '<input type="checkbox"  name="visitInput" value="' + row.id + '" />';          
				}
            },{
                title: '查询权限',
                align: 'center',
                valign: 'middle',
				formatter: function (value, row, index) {
					if(row.SELECTAUTH){
						return '<input type="checkbox"  name="selectInput" value="' + row.id + '" checked/>';   
					}
				    return '<input type="checkbox"  name="selectInput" value="' + row.id + '" />';          
				}
            }, {
                title: '下载权限',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                	//土地利用和发改委不需要下载权限
                	if(row.id=="27"||row.id=="39"||row.id=="42"){
                		return "";
                	}
                	if(row.DOWNAUTH && row.DOWNAUTH==1){
                		return '<input type="checkbox"  name="downInput" value="' + row.id + '" checked/>'; 
                	}
                    return '<input type="checkbox"  name="downInput" value="' + row.id + '" />';
                }
            }],
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
//        pageNumber: 1,
//        pageSize: 15,
//        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
//        pagination: true,				// 在表格底部显示分页工具栏
//        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
};

//数据集权限全选
function quanxuanDataRight(obj){
	var flag = $(obj).is(":checked");
	if(flag){
		$("input[name='visitInput']").prop("checked",true);
	}else{
		$("input[name='visitInput']").prop("checked",false);
	}
}
function quanxuanDataSelectRight(obj){
	var flag = $(obj).is(":checked");
	if(flag){
		$("input[name='selectInput']").prop("checked",true);
	}else{
		$("input[name='selectInput']").prop("checked",false);
	}
}

function quanxuanDataDownRight(obj){
	var flag = $(obj).is(":checked");
	if(flag){
		$("input[name='downInput']").prop("checked",true);
	}else{
		$("input[name='downInput']").prop("checked",false);
	}
}


$(".roleAdd_menu h3").click(function(){
	if($(this).hasClass("active")){
		$(this).removeClass("active").next(".allMenu").slideUp(100);
		$(this).children(".icon-bottom").css("transform","rotateZ(-90deg)");
		$(".roleAdd_menu h3 span").html("展开")
	}else{
		
			$(this).addClass("active").next(".allMenu").slideDown(100);
			$(this).children(".icon-bottom").css("transform","rotateZ(0deg)");	
			$(".roleAdd_menu h3 span").html("收起")
	}	
})
//数据集目录

ajaxPost("/seimp/authority/getSETreeData", {roleID: 1}).done(function (data) {
    if (data.status == 0) {
        var html="";
        $.each(data.data,function(i,item){  
        	html+="<li>";
			html+="<a href='javascript:void(0);' onclick=initBootstrapTable_add('"+item.id+"')><i class='iconfont icon-bottom'></i><b class='iconfont icon-folder'></b><span>"+item.name+"</span></a>",
			html+="<div class='sub_menu others'>";
			html+="<ul>";
			$.each(item.children,function(j,item1){
				html+="<li>";
				if(item1.children != undefined&&item1.children != ""){
					html+="<a href='javascript:void(0);'  onclick=initBootstrapTable_add('"+item1.id+"')><i class='iconfont icon-bottom'></i><b class='iconfont icon-file'></b><span>"+item1.name+"</span></a>";
					html+="<div class='sub_menu'>";	
					$.each(item1.children,function(m,item2){
						html+="<p class='_hovers'  onclick=initBootstrapTable_add('"+item2.id+"')>";
						html+="<b class='iconfont icon-file'></b><span>"+item2.name+"</span>";
						html+="</p>"
								
					})
					html+="</div>";
				}
				else{
					html+="<a href='javascript:void(0);'  onclick=initBootstrapTable_add('"+item1.id+"') class='_hovers'><b class='iconfont icon-file' style='margin-left:16px;'></b><span>"+item1.name+"</span></a>";
					
				}
				html+="</li>";	
				})
				html+="</ul>";
				html+="</div>";
				html+="</li>";
				$(".roleAdd_menu .menu>ul").html(html)
        })
        //侧边栏一级菜单
		$(".roleAdd_menu .allMenu>li>a").click(function(){
		
			if($(this).hasClass("active")){
				$(this).removeClass("active").next(".menu").slideUp(100);
				$(this).children(".icon-bottom").css("transform","rotateZ(-90deg)");
			}else{
				if($(this).siblings().size() != 0){
					
					$(this).addClass("active").next(".menu").slideDown(100);
					$(this).children(".icon-bottom").css("transform","rotateZ(0deg)");	
				}
			}		
		})
		//侧边栏二级菜单
		$(".roleAdd_menu .menu>ul>li>a").click(function(){
		
			if($(this).hasClass("active")){
				$(this).removeClass("active").next(".sub_menu").slideUp(100);
				$(this).children(".icon-bottom").css("transform","rotateZ(-90deg)");
			}else{
				if($(this).siblings().size() != 0){
					
					$(this).addClass("active").next(".sub_menu").slideDown(100);
					$(this).children(".icon-bottom").css("transform","rotateZ(0deg)");	
				}
			}		
		})
		//侧边栏三级菜单
		$(".others>ul>li>a").click(function(){
			if($(this).hasClass("active")){
				$(this).removeClass("active").next(".sub_menu").slideUp(100);
				$(this).children(".icon-bottom").css("transform","rotateZ(-90deg)");
			}else{
				
					$(this).addClass("active").next(".sub_menu").slideDown(100);
					$(this).children(".icon-bottom").css("transform","rotateZ(0deg)");	
				
				}		
		})
       
    } else {
        toastr.error("获取数据权限失败");
    }
});


//申请审批列表
function initBootstrapTable14(){
	//销毁表格
    $('#table_template14').bootstrapTable('destroy');
    //生成表格
    $('#table_template14').bootstrapTable({
        method: 'POST',
        url: "/seimp/askData/getAskDataByStatus",
        ajaxOptions: {async: true, timeout: 10000},
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        columns: [
            {
                title: '序号',//标题  可不加
                formatter: function (value, row, index) {
                    return index + 1;
                }
            },
            {
                field: 'name',
                title: '申请数据',
                align: 'center',
                valign: 'middle',
            },
            {
                field: 'ASK_DEPARTMENT',
                title: '申请部门',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'ASK_NAME',
                title: '申请人',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'ASK_TIME',
                title: '申请时间',
                align: 'center',
                valign: 'middle',
            },
            {
                field: 'VERIFY_STATUS',
                title: '审核状态',
                align: 'center',
                valign: 'middle',
                cellStyle: getcolor,
                formatter: function (value, row, index) {
                	var result = "";
                    if (value == "0") {
                        result = "未审核";
                    } else if (value == "1") {
                        return "已通过";
                    } else if(value == "2"){
                        return "未通过";
                    }
                    return result;
                }
            }, {
                field: 'operate',
                title: '操作',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    var arr = [];
                    if (row.VERIFY_STATUS == '0') {
                    	arr.push('<a  class="edit" title="edit" onclick="verifyAskData(\'' + row.ID + '\')" style="cursor:pointer" >审核</a>');
                    }else{
                    	arr.push('<a  class="edit" title="edit" onclick="viewAskData(\'' + row.ID + '\')" style="cursor:pointer" >查看</a>');
                    }
                    return arr.join('&nbsp;&nbsp;&nbsp;&nbsp;');
                }
            }],
        //search:true,
        classes: 'table-no-bordered',	//消除表格边框
        iconSize: "outline",
        clickToSelect: true,			// 点击选中行
        pageNumber: 1,
        pageSize: 15,
        pageList: [10, 15, 50, 100],
        striped: true, 				// 使表格带有条纹
        pagination: true,				// 在表格底部显示分页工具栏
        showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
        sidePagination: "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
        queryParams: function queryParams(params) {   //设置查询参数
            var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		verifyStatus: $("#adVerifyStatus").val(),
	    		sAdName : $("#sAdName").val()
	        });
	    	var datas = {};
	    	datas.data = data;
	        return datas;
        },
        queryParamsType: "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
        silent: true, 						// 刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
    });
}

//审批申请
function verifyAskData(id){
	//切换界面
	changeDiv(15);
	$("div.viewAskData").hide();
	$("div.verifyAskData").show();
	
	$("#adVerifyReadson").removeAttr("disabled");
	
	//回显数据
	ajaxPost("/seimp/askData/getAskDataByID", {
		AID : id
	}).done(function (result) {
        if(result.status == 0){
        	$("#adID").val(handleNullValue(result.data.ID));
        	$("#askDataName").val(handleNullValue(result.data.name));
        	$("#adAskTime").val(handleNullValue(result.data.ASK_TIME));
        	$("#adAskDepartment").val(handleNullValue(result.data.ASK_DEPARTMENT));
        	$("#adAskName").val(handleNullValue(result.data.ASK_NAME));
        	$("#adAskTel").val(handleNullValue(result.data.ASK_TEL));
        	$("#adAskEmail").val(handleNullValue(result.data.ASK_EMAIL));
        	var verifyStatus = "";
        	if(result.data.VERIFY_STATUS){
        		if(result.data.VERIFY_STATUS == "0"){
        			verifyStatus = "未审核";
        		}
        		if(result.data.VERIFY_STATUS == "1"){
        			verifyStatus = "审核通过";
        		}
        		if(result.data.VERIFY_STATUS == "2"){
        			verifyStatus = "审核未通过";
        		}
        		
        	}
        	$("#adVerifyStaus").val(verifyStatus);
        	$("#adAskReason").val(handleNullValue(result.data.ASK_REASON));
        	$("#adVerifyReadson").val(handleNullValue(result.data.VERIFY_READSON));
        }
	})
}

//查看申请
function viewAskData(id){
	//切换界面
	changeDiv(15);
	$("div.verifyAskData").hide();
	$("div.viewAskData").show();
	
	$("#adVerifyReadson").attr('disabled',"true");
	
	//回显数据
	//回显数据
	ajaxPost("/seimp/askData/getAskDataByID", {
		AID : id
	}).done(function (result) {
        if(result.status == 0){
        	$("#adID").val(handleNullValue(result.data.ID));
        	$("#askDataName").val(handleNullValue(result.data.name));
        	$("#adAskTime").val(handleNullValue(result.data.ASK_TIME));
        	$("#adAskDepartment").val(handleNullValue(result.data.ASK_DEPARTMENT));
        	$("#adAskName").val(handleNullValue(result.data.ASK_NAME));
        	$("#adAskTel").val(handleNullValue(result.data.ASK_TEL));
        	$("#adAskEmail").val(handleNullValue(result.data.ASK_EMAIL));
        	var verifyStatus = "";
        	if(result.data.VERIFY_STATUS){
        		if(result.data.VERIFY_STATUS == "0"){
        			verifyStatus = "未审核";
        		}
        		if(result.data.VERIFY_STATUS == "1"){
        			verifyStatus = "审核通过";
        		}
        		if(result.data.VERIFY_STATUS == "2"){
        			verifyStatus = "审核未通过";
        		}
        		
        	}
        	$("#adVerifyStaus").val(verifyStatus);
        	$("#adAskReason").val(handleNullValue(result.data.ASK_REASON));
        	$("#adVerifyReadson").val(handleNullValue(result.data.VERIFY_READSON));
        }
	})
}

//申请审核通过
function passAskData(){
	
	var adID = $("#adID").val();
	var adVerifyReadson = $("#adVerifyReadson").val();
    
    if (adVerifyReadson.length < 1) {
        return toastr.warning("请填写审核理由");
    }
    
    ajaxPost("/seimp/askData/updateAskData", {
    	AID : adID,
    	verifyStatus : '1',
    	verifyReason : adVerifyReadson
    }).done(function (data) {
        if (data.status == 0) {
            swal("审核通过成功", "", "success");
            changeDiv(14);
        } else {
            swal("审核通过失败", "", "error");
        }
        //更新审批数量
        getAskDataCount()
        initBootstrapTable4();
    });
}

//申请审核不通过
function rejectAskData(){
	
	var adID = $("#adID").val();
	var adVerifyReadson = $("#adVerifyReadson").val();
    
    if (adVerifyReadson.length < 1) {
        return toastr.warning("请填写审核理由");
    }
    
    ajaxPost("/seimp/askData/updateAskData", {
    	AID : adID,
    	verifyStatus : '2',
    	verifyReason : adVerifyReadson
    }).done(function (data) {
        if (data.status == 0) {
            swal("审核不通过成功", "", "success");
            changeDiv(14);
        } else {
            swal("审核不通过失败", "", "error");
        }
        //更新审批数量
        getAskDataCount();
        initBootstrapTable4();
    });
}


//站内统计图
//获取数据
function initVisitStatis(){
	var startTime = $("#visitStartDate").val();
	var endTime = $("#visitEndDate").val();
	var statisType = $("#visitStatisType").val();
	if(startTime && endTime && startTime!="" && endTime!=""){
    	var timeDate1 = new Date(startTime);
    	var timeDate2 = new Date(endTime);
    	if (timeDate1 > timeDate2) {
        	return toastr.info("起始时间不能大于截止时间");
    	}
    }
	
	ajaxPost("/seimp/visitStatis/getVisitStatisData", {
		startTime : startTime,
		endTime : endTime,
		statisType : statisType
    }).done(function (result) {
        if (result.status == 0) {
        	initVisitStatisPic(result.data);
        } 
    });
}

var myChart = null;

function initVisitStatisPic(result){
	
	var nameArr = [];
	var visitCountArr=[];
	var downCountArr = [];
    $.each(result.visit, function (key, val) {
    	nameArr.push(val.TIME);
        visitCountArr.push(val.COUNT)
    })
    $.each(result.ipVisit, function (key, val) {
    	downCountArr.push(val.COUNT)
    })
   // console.log(name)
    if (myChart != null && myChart != "" && myChart != undefined) {
    	 myChart.dispose();
    }
     myChart = echarts.init(document.getElementById('visitStatisPic'));
    var option1 = {
    		title: {
    	        text: '',
    	        subtext: '',
    	        x: 'center'
    	    },
    	    tooltip: {
    	        trigger: 'axis',
    	        axisPointer: {
    	            animation: false
    	        },
    	        formatter: function (params){                                                                                                                       
    	            var result = params[0].name + '<br>'                                                                                                            
    	                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
    	                +params[0].seriesName + ': ' + params[0].value + '(个)';
    	            result += "<br><br>"
    	            result += params[1].name + '<br>'                                                                                                            
	                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[1].color+';"></span>'
	                +params[1].seriesName + ': ' + params[1].value + '(次)';
    	            return result;                                                                                                                                  
    	        }
    	    },
    	    legend: {
    	        data:['总访问量','独立访客'],
    	        left : 'center',
    	        bottom :'10'
    	        
    	    },
    	    color:['#61a0a8', '#d48265'],
    	    axisPointer: {
    	        link: {xAxisIndex: 'all'}
    	    },
    	    dataZoom: [
    	        {
    	            show: true,
    	            realtime: true,
    	            start: 0,
    	            end: 100,
    	            xAxisIndex: [0, 1],
    	            top :'86%'
    	        },
    	        {
    	            type: 'inside',
    	            realtime: true,
    	            start: 0,
    	            end: 100,
    	            xAxisIndex: [0, 1],
    	            
    	        }
    	    ],
    	    grid: [{
    	        left: 50,
    	        right: 50,
    	        height: '30%'
    	    }, {
    	        left: 50,
    	        right: 50,
    	        top: '50%',
    	        height: '30%'
    	    }],
    	    xAxis : [
    	        {
    	            type : 'category',
    	            boundaryGap : false,
    	            axisLine: {onZero: true},
    	            data: nameArr
    	        },
    	        {
    	            gridIndex: 1,
    	            type : 'category',
    	            boundaryGap : false,
    	            axisLine: {onZero: true},
    	            data: nameArr,
    	            position: 'top'
    	        }
    	    ],
    	    yAxis : [
    	        {
    	            name : '总访问量(次)',
    	            type : 'value',
    	        },
    	        {
    	            gridIndex: 1,
    	            name : '独立访客(个)',
    	            type : 'value',
    	            inverse: true
    	        }
    	    ],
    	    series : [
    	        {
    	            name:'访问量',
    	            type:'line',
    	            symbolSize: 8,
    	            smooth:true,
    	            hoverAnimation: false,
    	            data:visitCountArr
    	        },
    	        {
    	            name:'独立访客',
    	            type:'line',
    	            xAxisIndex: 1,
    	            yAxisIndex: 1,
    	            symbolSize: 8,
    	            smooth:true,
    	            hoverAnimation: false,
    	            data: downCountArr
    	        }
    	    ]
    };
    myChart.setOption(option1);
	
	
}

/**
 * 站内统计
 */
function getVisitStatisData(){
	var json = {};
    ajaxPost("/seimp/portal/getVisitStatisData.do", json).done(function (result) {
        if (result.status == 0) {
            var data = result.data;
            $("#visitStatis span.span1").text(data[0].count);
            $("#visitStatis span.span2").text(data[1].count);
            $("#visitStatis span.span3").text(data[2].count);
            $("#visitStatis span.span4").text(data[3].count);
        }
    });
}


//等待框显示
function systemDengdai(){
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
function removeSystemDengdai(){
    $("#loadingDiv").remove();
    $("body").css("overflow","auto");
}

