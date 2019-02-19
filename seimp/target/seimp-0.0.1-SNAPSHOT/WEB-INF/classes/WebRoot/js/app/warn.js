//一屏幕显示
var CH = document.documentElement.clientHeight;
$('.warn').css("minHeight",(CH -176)+ 'px');
$('#warn_myModal').css("maxHeight",(CH -50)+ 'px');
$('#warn_myModal').css("overflow","auto")


//获取访问权限的菜单
var json = {partID:"4"};
ajaxPost('/seimp/user/getMenus.do',json).done(function(result){
	var data = result.data;
	if(result.status==0){
		var html = "<ul class='nav nav-main' id='side-menu'>";
		//新增污染预警
		if( contains(data,'40')){
			html += "<li  class='active'><a href='#'><span><img src='img/xzwryj.png'></span><span class='nav-label'>新增污染分析</span><span class='fa arrow'></span></a>";
			//新增污染企业
			if(contains(data,'400')){
				html += "<ul class='nav nav-second-level'><li><a class='J_menuItem bg_blue' id='yj_qy' onclick='changeBg(this)' >新增污染企业分析</a></li></ul>";
			}
			html += "</li>";
		}
		//污染风险评估
		if(contains(data,'41')){
			html += "<li><a href='javascript:void(0);' id='yj_fxpg'><span><img src='img/wrfxpg.png'></span><span class='nav-label'>污染风险评估</span><span class='fa arrow'></span></a>";
			//污染物点位超标率
			if(contains(data,'410')){
				html += "<ul class='nav nav-second-level'><li><a class='J_menuItem' id='yj_waw'  onclick='changeBg(this)'>污染物点位超标率</a></li></ul>";
			}
			html += "</li>";
		}
		//舆情预警分析
		if(contains(data,'42')){
			html += " <li><a href='javascript:void(0);' ><span><img src='img/yqyjfx.png'></span><span class='nav-label'>舆情分析</span><span class='fa arrow'></span></a>";
			html += "<ul class='nav nav-second-level'>";
			//网络舆情预警
			if(contains(data,'420')){
				html += "<li><a class='J_menuItem' id='yj_wangluo'  onclick='changeBg(this)'>网络舆情分析</a></li>";
			}
			//12369举报预警
			if(contains(data,'421')){
				html += "<li><a class='J_menuItem' id='yj_jubao'  onclick='changeBg(this)'>12369举报分析</a></li>";
			}
			//12369举报预警
			if(contains(data,'421')){
				html += "<li><a class='J_menuItem' id='yj_wenxian'  onclick='changeBg(this)'>文献内容分析</a></li>";
			}
			//舆情文献
            if(contains(data,'422')){
                html += "<li><a class='J_menuItem' id='yj_yqwx'  onclick='changeBg(this)'>舆情文献</a></li>";
            }
			html += "</ul>";
			html += "</li>";
		}
		//综合预警分析
		if(contains(data,'43')){
			html += "<li><a href=''javascript:void(0);' ><span><img src='img/yqyjfx2.png'></span><span class='nav-label'>综合分析</span><span class='fa arrow'></span></a>"
			html += "<ul class='nav nav-second-level'>";
			//综合预警分析
			if(contains(data,'430')){
				html += "<li><a class='J_menuItem' id='yj_zonghe'  onclick='changeBg(this)'>综合预警分析</a></li>";
			}
			if(contains(data,'432')){
				html += "<li><a class='J_menuItem' id='yj_zonghe_bdfx'  onclick='changeBg(this)'>监管企业比对分析</a></li>";
			}
			if(contains(data,'434')){
				html += "<li><a class='J_menuItem' id='yj_zonghe_swfx'  onclick='changeBg(this)'>顺位分析</a></li>";
			}
			html += "</ul></li>";
		}
		//重点区域预警
		if(contains(data,'44')){
			html += "<li class='last_li'><a href='javascript:void(0);' id='yj_qyyj'><span><img src='img/zdqyyj.png'></span><span class='nav-label'>重点区域分析</span><span class='fa arrow'></span></a>";
			html += "<ul class='nav nav-second-level'>";
			html += "</ul>";
			html += "</li>";
		}
		html += "</ul>";
		$(".warn .sidebar-collapse").html(html);
		
		//默认显示
	}



// 一屏幕显示
// var CH = document.documentElement.clientHeight;
//$('.warn').css('min-height','784px');

// 初始化菜单插件MetsiMenu
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

$('.map-view .nav-main').children('li').css({'padding': '0'});

$('.map-view .nav-main').children('li').children('a').css({'padding': '22px', 'border-bottom': '1px solid #ddd'});

//新增污染企业--dy
$("#yj_qy").click(function () {
    $("#warnIframe").attr("src", "views/warn/newPollutedEnterprice.html");
});

//点位超标率--wrwfxpg
$("#yj_waw").click(function () {
    $("#warnIframe").attr("src", "views/warn/chaobiaolv.html");
})

//舆情分析--网络预警
$("#yj_wangluo").click(function () {
    $("#warnIframe").attr("src", "views/warn/wangluo.html");
});

//舆情分析--12369举报
$("#yj_jubao").click(function () {
    $("#warnIframe").attr("src", "views/warn/jubao.html");
});
//舆情文献
$("#yj_yqwx").click(function () {
	$("#warnIframe").attr("src", "views/warn/yqwx.html");
});

//舆情分析--文献统计
$("#yj_wenxian").click(function () {
    $("#warnIframe").attr("src", "views/warn/wenxian.html");
});

//综合预警
$("#yj_zonghe").click(function () {
    $("#warnIframe").attr("src", "views/warn/zonghe.html");
});
//综合预警—比对分析
$("#yj_zonghe_bdfx").click(function () {
    $("#warnIframe").attr("src", "views/warn/biduifenxi.html");
});
//综合预警—顺位分析
$("#yj_zonghe_swfx").click(function () {
    $("#warnIframe").attr("src", "views/warn/shunweifenxi.html");
});

//重点区域--京津冀
$("#yj_jjj").click(function () {
    $("#warnIframe").attr("src", "views/warn/jingjinji.html");
});

//重点区域--长三角
$("#yj_csj").click(function () {
    $("#warnIframe").attr("src", "views/warn/changsanjiao.html");
});

//重点区域--珠三角
$("#yj_zsj").click(function () {
    $("#warnIframe").attr("src", "views/warn/zhusanjiao.html");
});

//$(function(){
	getClickEvent();
//})



// 地图选项菜单
$('.warn .map-item ul li').click(function () {
    $(this).addClass('metal').siblings().removeClass('metal');

})

$('.map-menu ul li').click(function () {
    var mapMenu = (-$('.map-item').width() - 91) / 2 + 'px';
    $('.map-item').css({'margin-left': mapMenu})
})

//记录是否需要设置默认页面
var flag = false;
	//新增污染企业
	if(contains(data,"400")){
		var flag = true;
	}
	//污染物点位超标率
if(!flag){
	if(contains(data,'410')){
		 $("#warnIframe").attr("src", "views/warn/chaobiaolv.html");
		 var flag = true;
	}
}
	//网络舆情预警
if(!flag){
	if(contains(data,'420')){
		$("#warnIframe").attr("src", "views/warn/wangluo.html");
		var flag = true;
	}
}
	//12369举报预警
if(!flag){
	if(contains(data,'421')){
		$("#warnIframe").attr("src", "views/warn/jubao.html");
		var flag = true;
	}
}
	//综合预警分析
if(!flag){
	if(contains(data,'430')){
		$("#warnIframe").attr("src", "views/warn/zonghe.html");
		var flag = true;
	}
}





})//--ajax end
//首页href="#warn?init=chaobaiolv"，预警分析显示点位超标率
function getClickEvent(){
	var request = GetRequest();
    var init = request["init"];
    if(init=="chaobiaolv"){
    	$("#yj_waw").click();
    }else if(init=="yuqing"){
    	$("#yj_wangluo").click();
    }
}



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
function changeBg(th){
    $('.J_menuItem').removeClass('bg_blue');
    $(th).addClass('bg_blue');
}


//条件查询参数
var searchParams = {//清单模式查询条件
	isType:"",
	unitName:"",
	zxType:"",
	createTimeStart:"",
	createTimeEnd:"",
	isSort:"",
	timeRange:""
};
//注册/撤销原因

function getOpt() {
    ajaxPost("/seimp/lplw/getAllZXTYPEByZXTYPE", {}).done(function (result) {
    	var html="";
    	
    	
        if (result.status == 0) {
 	       console.log(result.data);
 	      html +='<option value="">全部</option>';
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.ZXTYPE+"'>"+item.ZXTYPE+"</option>";
 	       })
 	      $("#pot_3").html(html);
 	    }
       
    })
   
}
getOpt();
//更新表格

function updateTable(){
	var todayIndex = [];//当天数据编号
	var sevenIndex = [];//7天数据编号
	var thirtyIndex = [];//30天数据编号
	
	var todayDate= new Date();
	var senveDate = DateAdd("d ", -6, new Date());
	var thirtyDate = DateAdd("d ", -29, new Date());
	
	var columns =[{
        checkbox: true,
    	},{  
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
		},{
	        field : 'ISTYPE',
	        title : '注销/撤销类型',
	        align : 'center',
	        formatter: function(value,row,inde){
	        	var result = value;
	        	if(value == "1"){
	        		result = "注销";
	        	}
	        	if(value == "2"){
	        		result = "撤销";
	        	}
	        	return result;
	        }
		},{
			field : 'PROVINCE',
			title : '省',
			class: 'mw-100',
			align : 'center',
		},{
			field : 'CITY',
			title : '市',
			align : 'center',
		},{
			field : 'COUNTY',
			title : '县',
			align : 'center',
		},{
			field : 'UNITNAME',
			title : '单位名称',
			align : 'center',
		},{
			field : 'ZXTYPE',
			title : '注销/撤销原因',
			align : 'center',
		},{
			field : 'CREATETIME',
			title : '注销/撤销时间',
			align : 'center',
			formatter :function(value,row,index){
				if(value){
					
//					todateStr = DateAdd("d ", -1, new Date()).format("yyyy-MM-dd");
					if(new Date(value) >= todayDate ){
						todayIndex.push(index);
					}else if(new Date(value) >= senveDate){
						sevenIndex.push(index);
					}else if(new Date(value) >= thirtyDate){
						thirtyIndex.push(index);
					}
				}
                return value;
            }
		},{
			field : 'REPORTSTATUS',
			title : '是否已上传',
			align : 'center',
			formatter :function(value,row,index){
				var result = "未上传"; 
				if(value && value=="2"){
					result = "已上传"
				}
				if(value && value=="3"){
					result = "不上传"
				}
                return result;
            }
		},{
			field : '',
			title : '操作',
			class: 'last_th2 clearfix',
            formatter :function(value,row,inde){
            	var s = "<a class='btn btn-info'  href='#potential_wurandikuaiDetails'  onclick=Dw('"+row.ENTERID+"','"+row.LONGITUDE+"','"+row.LATITUDE+"','"+row.UNITNAME+"') title='详细信息'><i class='iconfont icon-xxxx'></i></a>";
                if(row.LONGITUDE && row.LATITUDE){
                	s += "<button class='btn btn-success' onclick=showLocation('"+row.LONGITUDE+"','"+row.LATITUDE+"','"+row.UNITNAME+"') title='定位'><i class='glyphicon glyphicon-map-marker'></i></button>";
                }else{
                	s += "<button class='btn btn-gray' title='定位' disabled><i class='glyphicon glyphicon-map-marker'></i></button>";
                }
                /*
                if(row.REPORTSTATUS == null || row.REPORTSTATUS == "1"){
                	s += "<button class='btn btn-primary btn-padding' onclick=addRemindMessage('"+row.ENTERID+"','"+row.UNITNAME+"') title='提醒'><i class='iconfont icon-push mr5' style='padding-left: 2px;font-size: 18px;'></i></button>";
                }*/
                return s;
            }
		},{
			field : 'ENTERID',
			title : '主键',
			align : 'center',
			visible : false
		}];
	//销毁表格
	$('#potential_table').bootstrapTable('destroy');
	//生成表格
	$('#potential_table').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/lplw/getEnterpriceUndoInfoData",
	    columns : columns,
	    //search:true,
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
	    queryParams: function queryParams(params) {   //设置查询参数  
	    	var datas = {};
	    	var data =  JSON.stringify({
	    		isType:searchParams.isType,
	    		unitName:searchParams.unitName,
	    		zxType:searchParams.zxType,
	    		createTimeStart:searchParams.createTimeStart,
	    		createTimeEnd:searchParams.createTimeEnd,
	    		timeRange:searchParams.timeRange,
	    		timeSort:searchParams.isSort,
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		
		    });	    	
			datas.data = data;
			
			datas.data.isType = $("#pot_1").val();
			datas.data.unitName = $("#pot_2").val();

			datas.data.zxType = $("#pot_3").val();
			console.log($("#pot_3").val())
			datas.data.timeSort = $('input:radio[name="time2"]:checked').attr("value");
			datas.data.timeRange = $('input:radio[name="time1"]:checked').attr("value");
			console.log(datas.data)
		    return datas;  
          }, 
	    queryParamsType : "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
	    silent : true, 						// 刷新事件必须设置
	    contentType : "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
	    onClickRow : function(row, $element) {
	      $('.success').removeClass('success');
	      $($element).addClass('success');
	      selectRow = row;
	    },
	    onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        	
        	console.log($("#potential_table tbody tr"));
        	console.log(todayIndex);
        	for (var i = 0; i < todayIndex.length; i++) {
				var currItem = todayIndex[i];
				$("#potential_table tbody tr:eq("+(currItem)+")").addClass("todayDateClass");
			}
        	for (var i = 0; i < sevenIndex.length; i++) {
				var currItem = sevenIndex[i];
				$("#potential_table tbody tr:eq("+(currItem)+")").addClass("sevenDateClass");
			}
        	for (var i = 0; i < thirtyIndex.length; i++) {
				var currItem = thirtyIndex[i];
				$("#potential_table tbody tr:eq("+(currItem)+")").addClass("thirtyDateClass");
			}
        },
        onPageChange : function(data){
        	//编号数组置空
        	todayIndex = [];//当天数据编号
        	sevenIndex = [];//7天数据编号
        	thirtyIndex = [];//30天数据编号
        },
	    icons : {
	      refresh : "glyphicon-repeat",
	      toggle : "glyphicon-list-alt",
	      columns : "glyphicon-list"
	    }
	});
	
}
//updateTable()
$("#potential_table").after('<div  class="clearfix"  style="position: absolute;bottom: 65px;left: 1%;"><span style="float:left;white-space: nowrap;">图例：</span><div style="background-color:#ffdede;width: 70px;height: 20px;float:left;text-align:center;line-height: 20px;"><span>当天</span></div><div style="background-color:#ffffd1;width: 70px;height: 20px;float:left;text-align:center;margin-left: 10px;line-height: 20px;"><span>最近7天</span></div><div style="background-color:#c4dcff;width: 70px;height: 20px;float:left;text-align:center;margin-left: 10px;"><span style="white-space: nowrap;line-height: 20px;">最近30天</span></div></div>')

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
getRefreshSta();
function getRefreshSta() {
  var nowdate = new Date();
//  var lastMonth = new Date(nowdate - 30 * 24 * 3600 * 1000).format("yyyy-MM-dd");
  lastMonth = DateAdd("d ", -29, nowdate).format("yyyy-MM-dd");
//  $("#endTime").val(new Date().format("yyyy-MM-dd"));
  console.log(lastMonth)
//  $("#startTime").val(lastMonth);
  
  //日期控件
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
  
  RefreshData()
}

function RefreshData() {
    var time1 = $("#startTime").val();
    var time2 = $("#endTime").val();
    
    if (time2 != null && time2 != undefined && time2 != "" && time1 > time2) {
        return toastr.error("开始时间不能大于结束时间");
    }   
}


//search()
//单选按钮改变时间
$("#undoTableLabel .radioItem").change(function() {
	  var nowdate = new Date();
//	  var lastMonth  = DateAdd("d ", -30, nowdate).format("yyyy-MM-dd");//默认30天
	  
	  var val1=$('input:radio[name="time1"]:checked').attr("value");
	  
	  console.log(val1)
	  if(val1=="1天"){
		  	lastMonth = new Date().format("yyyy-MM-dd");
	  }else if(val1=="7天"){
//	  	lastMonth = new Date(nowdate - 7 * 24 * 3600 * 1000).format("yyyy-MM-dd");
		  lastMonth = DateAdd("d ", -6, nowdate).format("yyyy-MM-dd");
	  }else if(val1=="30天"){
		  lastMonth = DateAdd("d ", -29, nowdate).format("yyyy-MM-dd");
//	  	lastMonth = new Date(nowdate - 30 * 24 * 3600 * 1000).format("yyyy-MM-dd");
	  }else if(val1=="90天"){
		  lastMonth = DateAdd("d ", -89, nowdate).format("yyyy-MM-dd");
//	  	lastMonth = new Date(nowdate - 90 * 24 * 3600 * 1000).format("yyyy-MM-dd");
	  }else if(val1=="6月"){
		  lastMonth = DateAdd("m ", -6, nowdate).format("yyyy-MM-dd");
//	  	lastMonth = new Date(nowdate - 180 * 24 * 3600 * 1000).format("yyyy-MM-dd");
	  }else if(val1=="1年"){
		  lastMonth = DateAdd("y ", -1, nowdate).format("yyyy-MM-dd");
//	  	lastMonth = new Date(nowdate - 360 * 24 * 3600 * 1000).format("yyyy-MM-dd");
	  }else if(val1==""){
		  lastMonth = "";
	  }
	  console.log(lastMonth)
	  $("#startTime").val(lastMonth);
		  
	  $("#endTime").val(new Date().format("yyyy-MM-dd"));
	  search()	 
});
//查询        
function search() {
	searchParams.isType = $("#pot_1").val();
	searchParams.unitName = $("#pot_2").val();
	searchParams.zxType =$("#pot_3").val();
	if($("#pot_3").val()==null){
		searchParams.zxType=""
	}	
	
	searchParams.isSort=$('input:radio[name="time2"]:checked').attr("value");
	searchParams.timeRange=$('input:radio[name="time1"]:checked').attr("value");
	searchParams.createTimeStart = $('#startTime').val();
	searchParams.createTimeEnd = $('#endTime').val();
	
	/*if($('input:radio[name="time1"]:checked').attr("value")==""){
		$('#startTime').val("")
	}*/
	updateTable()	
}


search()


//下载excel文件
function warnGetExcelFile() {
	//获取选中行
	var selectRows = $('#potential_table').bootstrapTable('getSelections');
	if(selectRows.length < 1){
		swal("请至少选择一条数据!", "", "error");
	}else{
		var enterIds = "'";
		for (var i = 0; i < selectRows.length; i++) {
			var currItem = selectRows[i];
			enterIds += currItem.ENTERID + "','";
		}
		var parameter = {
			enterIds:enterIds.substr(0, enterIds.length-2)
		}
		ajaxPost("/seimp/lplw/getExcelFileByIds", parameter).done(function (result) {
	        console.log(result);
	        window.open(result.data);
	    });
	}
	
	/*
	searchParams.isType = $("#pot_1").val();
	searchParams.unitName = $("#pot_2").val();
	searchParams.zxType =$("#pot_3").val();
	if($("#pot_3").val()==null){
		searchParams.zxType=""
	}	
	
	searchParams.isSort=$('input:radio[name="time2"]:checked').attr("value");
	searchParams.timeRange=$('input:radio[name="time1"]:checked').attr("value");
	searchParams.createTimeStart = $('#startTime').val();
	searchParams.createTimeEnd = $('#endTime').val();
	
	if($('input:radio[name="time1"]:checked').attr("value")==""){
		$('#startTime').val("")
	}
	
	var parameter = {
		isType:searchParams.isType,
		unitName:searchParams.unitName,
		zxType:searchParams.zxType,
		createTimeStart:searchParams.createTimeStart,
		createTimeEnd:searchParams.createTimeEnd,
		timeRange:searchParams.timeRange,
		timeSort:searchParams.isSort
	}
	ajaxPost("/seimp/lplw/getExcelFile", parameter).done(function (result) {
        console.log(result);
        window.open(result.data);
    });
	*/
}

//排污许可证注销/撤销分省统计
ajaxPost("/seimp/lplw/getStatisDataOfEnterpriceUndoDataByProvince", {}).done(function (data) {
	console.log(data.data)
	console.log(data.data[0]["COUNT(1)"])
	var arr = new Array();
	var arr2 = new Array();
	if (data.status == 0) {		
        for (var i = 0; i < data.data.length; i++) {
        	var item = data.data[i];
        	if(item.PROVINCE!=undefined && item.PROVINCE!="" && item.PROVINCE!=null && item.PROVINCE!=" "){
        		
        		arr.push(item.PROVINCE);
        		arr2.push(item["COUNT(1)"]);
        	}
        }
	
        // 初始化echarts实例
        var myChart = echarts.init(document.getElementById('myChart1'));

		option = {
		    title: {
		        text: '',
		        subtext: ''
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
		            type: 'shadow'
		        },
		        formatter: function (params){                                                                                
		            var result = params[0].name + '<br>'                                                                                                            
		                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		                +params[0].seriesName + ': ' + params[0].value + "(家)";                                                                                             
		            return result;                                                                                                                                  
		        }
		    },
		    legend: {
		        data: ['注销/撤销企业数量']
		    },
		    grid: {
		        left: '3%',
		        right: '10%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		        type: 'value',
		        boundaryGap: [0, 0.01],
		        name:'数量(家)'
		    },
		    yAxis: {
		        type: 'category',
		        name:'省名',
		        data : arr
		    },
		    series: [
		        {
		            name: '注销/撤销企业数量',
		            type: 'bar',
		            itemStyle:{
		                normal:{color:'#e27469'}
		            },
		            barWidth:20,
		            data:arr2
		        }
		    ]
		};
		//使用刚指定的配置项和数据显示图表。
		myChart.setOption(option);
	}
})
//排污许可证注销/撤销分行业统计
ajaxPost("/seimp/lplw/getStatisDataOfEnterpriceUndoDataByHYNAME", {}).done(function (data) {
	console.log(data.data)
	var arr = new Array();
	var arr2 = new Array();
	var wantLength = 10;
	var currLength = 0;
	if (data.status == 0) {		
        for (var i = 0; i < data.data.length; i++) {
        	if(currLength>=wantLength){
        		break;
        	}
        	var item = data.data[i];
        	if(item.HYNAME!=undefined && item.HYNAME!="" && item.HYNAME!=null && item.HYNAME!=" "){
        		
        		arr.push(item.HYNAME);
        		arr2.push(item["COUNT(1)"]);
        		currLength++;
        	}
        }
	
        // 初始化echarts实例
        var myChart = echarts.init(document.getElementById('myChart2'));

		option = {
		    title: {
		        text: '',
		        subtext: ''
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
		            type: 'shadow'
		        },
		        formatter: function (params){                                                                                                                       
		            var result = params[0].name + '<br>'                                                                                                            
		                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		                +params[0].seriesName + ': ' + params[0].value + "(家)";                                                                                             
		            return result;                                                                                                                                  
		        }
		    },
		    legend: {
		        data: ['注销/撤销企业数量']
		    },
		    grid: {
		        left: '3%',
		        right: '10%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		        type: 'value',
		        boundaryGap: [0, 0.01],
		        name:'数量(家)'
		    },
		    yAxis: {
		        type: 'category',
		        name:'行业名称',
		        data : arr
		    },
		    series: [
		        {
		            name: '注销/撤销企业数量',
		            type: 'bar',
		            itemStyle:{
		                normal:{color:'#5b9bd5'}
		            },
		            barWidth:20,
		            data:arr2
		        }
		    ]
		};
		//使用刚指定的配置项和数据显示图表。
		myChart.setOption(option);
	}
})
//首页潜在污染地块统计图1
ajaxPost("/seimp/lplw/getStatisDataOfEnterpriceUndoDataByProvince", {}).done(function (data) {
	var arr = new Array();
	var arr2 = new Array();
	if (data.status == 0) {		
		
		var length = data.data.length <= 4 ? data.data.length : 4;
		
        for (var i = 0; i < length; i++) {
        	var item = data.data[i];
        	if(item.PROVINCE!=undefined && item.PROVINCE!="" && item.PROVINCE!=null && item.PROVINCE!=" "){        		
        		arr.push(item.PROVINCE);
        		arr2.push(item["COUNT(1)"]);
        	}
        }
	
        // 初始化echarts实例
        var myChart1 = echarts.init(document.getElementById('myChart_1'));

		option = {
		    title: {
		        text: '',
		        subtext: ''
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
		            type: 'shadow'
		        }
		    },
		    legend: {
		    	textStyle: {
		    		color:"#74bade",
		    	},
		    	itemWidth: 10,
		    	itemHeight: 10,
		    	y:"30px",
		    	x:"60px",
		        data: ['注销/撤销企业数量']
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		    	axisLine:{                  //---坐标轴 轴线
                    show:true,  
                    lineStyle:{
                        color:'#e58177',
                    },//---是否显示

                },
                axisTick:{                  //---坐标轴 刻度
                    show:true,                  //---是否显示                  
                },
                axisLabel:{                 //---坐标轴 标签
                    show:true,                  //---是否显示                    
                  color:'#74bade'           //---默认取轴线的颜色
                },
		    	
		        type: 'value',
		        splitLine:false,
		        boundaryGap: [0, 0.01]
		    },
		    yAxis: {
		    	axisLine:{                  //---坐标轴 轴线
                    show:false,                  //---是否显示

                },
                axisTick:{                  //---坐标轴 刻度
                    show:false,                  //---是否显示
                   
                },
                axisLabel:{                 //---坐标轴 标签
                    show:true,  
                    color:'#74bade',   //---是否显示
                  
                },
                splitLine:{                 //---grid 区域中的分隔线
                    show:false,                 //---是否显示，'category'类目轴不显示，此时我的X轴为类目轴，splitLine属性是无意义的
                  
                },
		        type: 'category',
		        data : arr
		    },
		    series: [
		        {
		            name: '注销/撤销企业数量',
		            type: 'bar',
		            itemStyle:{
		                normal:{color:'#5b9bd5'}
		            },
		            barWidth:10,
		            data:arr2
		        }
		    ]
		};
		//使用刚指定的配置项和数据显示图表。
		myChart1.setOption(option);
	}
})
//首页潜在污染地块安全统计图2
ajaxPost("/seimp/wrdk/shouyeTjt", {}).done(function (data) {
	if (data.status == 0) {		
		var myChart2 = echarts.init(document.getElementById('myCharts'));
		option = {
			    tooltip : {
			        formatter: "{a} <br/>{b} : {c}%"
			    },
			    series : [
			        {
			            name:'业务指标',
			            type:'gauge',
			            splitNumber: 10,       // 分割段数，默认为5
			            axisLine: {            // 坐标轴线
			                lineStyle: {       // 属性lineStyle控制线条样式
			                	color:[[0.2, '#bae4e5'],[0.8, '#74bade'],[1, '#f44442']],
			                    width: 8
			                }
			            },
			            radius:"85px",
			            axisTick: {            // 坐标轴小标记
			                splitNumber: 10,   // 每份split细分多少段
			                length :4,        // 属性length控制线长
			                lineStyle: {       // 属性lineStyle控制线条样式
			                    color: '#fff'
			                }
			            },
			            axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
			                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
			                    color: '#fff',
			                    fontSize:"10px"
			                }
			            },
			            splitLine: {           // 分隔线
			                show: true,        // 默认显示，属性show控制显示与否
			                length :8,         // 属性length控制线长
			                lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
			                    color: 'auto'
			                }
			            },
			            pointer : {
			                width : 2,
			                itemStyle:{
			                	color: '#74bade'
			                }
			            },
			            title : {
			                show : true,
			                offsetCenter: [0, '-40%'],       // x, y，单位px
			                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
			                	color: '#fff',
			                	fontSize:"12px"
			                }
			            },
			            detail : {
			                formatter:'{value}%',
			                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
			                    color: '#fff',
			                    fontSize:"12px"
			                }
			            },
			            data:[{value: data.data.num, name: '污染地块安全利用率'}]
			        }
			    ]
			};
		myChart2.setOption(option,true);
//		
//		clearInterval(timeTicket);
//		var timeTicket = setInterval(function (){
//		    option.series[0].data[0].value = (Math.random()*100).toFixed(2) - 0;
//		    myChart2.setOption(option,true);
//		},1000)

	}
})
function Dw	(ENTERID,lon,lat,enterpriseName){
	var enterPriseInfo = {
			enterId:ENTERID,
			lon: lon,
			lat: lat,
			enterpriseName:enterpriseName
		};
	sessionStorage.setItem('enterPriseInfo', JSON.stringify(enterPriseInfo))
}
/**
 * 定位功能
 * 参数：
 * 	lon：经度
 * 	lat：纬度
 */
function showLocation(lon, lat, enterpriseName){
	console.log(lon)
	if(lon && lat && lon!="undefined" && lat!="undefined" && lon >= 73.66 && lon <= 135.0416 && lat >= 3.866 && lat <= 53.9166){
		arcgisDw(lon, lat);
	}else{
		/*ajaxPost("/seimp/tianditu/getAddress", {
			name : enterpriseName
		}).done(function (result) {
	        if(result.status == 0){
	        	if(result.data[0].status == "成功"){
	        		arcgisDw(result.data[0].lon, result.data[0].lat);
	        	}else{
	        		toastr.error("未查询到位置！");
	        	}
	        }
	    });*/
	}
	
}

//数据更新时间
ajaxPost("/seimp/lplw/getLastUpdateTime", {}).done(function (data) {
	if (data.status == 0) {		
		console.log(data.data.UPDATETIME);
		console.log($(".warn_UPDATETIME").html())
		$(".warn_UPDATETIME").html(data.data.UPDATETIME)
	}
})

var selectRow = null;
/*************上报***************/
function shangbao(){
	//获取选中行
	var selectRows = $('#potential_table').bootstrapTable('getSelections');
	if(selectRows.length < 1){
		 swal("请至少选择一条数据", "", "error");
	}else{
		swal({
	        title: "确认上传",
	        text: "是否上传污染地块数据？",
	        type: "warning",
	        showCancelButton: true,
	        closeOnConfirm: false,
	        cancelButtonText: "取消",
	        confirmButtonText: "确定",
	        confirmButtonColor: "#ec6c62"
	    }, function () {
	        //上报污染地块
	    	
	    });
	}
}


/*****增加提醒消息******/
function addRemindMessage(enterId,UNITNAME){
//	if(!selectRow){
//		 swal("请选择一条数据", "", "error");
//	}else{
		swal({
	        title: "确认推送",
	        text: "是否将“" + UNITNAME + "”污染地块消息推送给用户？",
	        type: "warning",
	        showCancelButton: true,
	        closeOnConfirm: false,
	        cancelButtonText: "取消",
	        confirmButtonText: "确定",
	        confirmButtonColor: "#ec6c62"
	    }, function () {
	        //上报污染地块
	    	
	    });
//	}
}



ajaxPost("/seimp/lplw/getIndexSumValue", {}).done(function (data) {
    if (data.status == 0) {
    	$("#pw1").html(data.data[0].COUNT+"家");
    	$("#pw2").html(data.data[1].COUNT+"家&nbsp;/&nbsp;"+data.data[2].COUNT+"家");
    	$("#pw3").html(data.data[3].COUNT+"家");
    	$("#pw4").html(data.data[4].COUNT+"块");
    	$("#pw5").html(data.data[5].COUNT+"块");
    }
})

/********点击排污许可证注销/撤销企业数量********/
/********点击即将到期企业数量（30天到期）********/
$(function(){
	 $("#undoCountDiv").click(function() {
	        $("html, body").animate({
	            scrollTop: $("#potential_table").offset().top }, {duration: 500,easing: "swing"});
	        return false;
	    });
	 
	 //模态框，快速查询按钮
	 $(".radioShow3").on("click",function(){  //点击label 
		 //开始时间
		 var todayStr = new Date().format("yyyy-MM-dd");
		 $('#valiTimesStart').val(todayStr);
		 var todayDate = new Date();
		 //选中的值
		 var selectVal = $(this).children("input:radio[name='time3']").val();
		 if(selectVal == ""){
			 $('#valiTimesEnd').val("");
		 }
		 if(selectVal == "一周"){
			 $('#valiTimesEnd').val(DateAdd("d ", +7, todayDate).format("yyyy-MM-dd"));
		 }
		 if(selectVal == "一月"){
			 $('#valiTimesEnd').val(DateAdd("m ", +1, todayDate).format("yyyy-MM-dd"));
		 }
		 if(selectVal == "半年"){
			 $('#valiTimesEnd').val(DateAdd("m ", +6, todayDate).format("yyyy-MM-dd"));
		 }
		 if(selectVal == "一年"){
			 $('#valiTimesEnd').val(DateAdd("y ", +1, todayDate).format("yyyy-MM-dd"));
		 }
		 updateEnterBaseTable();
	 });
	 
	 //默认时间
	 var nowDate = new Date();
	 var deadline = DateAdd("d ", +30, nowDate).format("yyyy-MM-dd");
	 $('#valiTimesEnd').val(deadline);
	 var todayDate = new Date().format("yyyy-MM-dd");
	 $('#valiTimesStart').val(todayDate);
	 updateEnterBaseTable();
})


function updateEnterBaseTable(){
	
	
	var columns =[{  
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
		},{
	        field : 'XKZNUM',
	        title : '许可证书编号 ',
	        align : 'center',
	        
		},{
			field : 'DEVCOMPANY',
			title : '单位名称',
			class: 'mw-100',
			align : 'center',
		},{
			field : 'PROVINCE',
			title : '省份',
			align : 'center',
		},{
			field : 'CITY',
			title : '市区',
			align : 'center',
		},{
			field : 'COUNTY',
			title : '县区',
			align : 'center',
		},{
			field : 'VALITIMES',
			title : '有效期限',
			align : 'center',
		},{
            field: '',
            title: '操作',
            align: 'center',
            valign: 'middle',
//            class:'w-200',
            formatter :function(value,row,inde){
            	var className = "errorDingwei";
            	if(row.LONGITUDE && row.LATITUDE){
            		className = "successDingwei";
            	}
//                var s = "<a class='"+className+"'  onclick=dingwei('" + row.LONGITUDE +"','"+ row.LATITUDE +"','"+ row.PROJECTNAME + "');>定位</a>";
                
                var s = "<a   onclick=showDetailsModal2('" + row.ENTERID +"','"+ row.DATAID +"','"+ row.DEVCOMPANY + "');>详情</a>";
                return s;
            }
        }];
	//销毁表格
	$('#enterBaseTable').bootstrapTable('destroy');
	//生成表格
	$('#enterBaseTable').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/enterBase/getEnterpriceBaseInfoData",
	    columns : columns,
	    //search:true,
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
	    queryParams: function queryParams(params) {   //设置查询参数  
	    	var datas = {};
	    	var data =  JSON.stringify({
	    		
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		devcompany : $("#devcompany").val(),
	    		valiTimesEnd : $("#valiTimesEnd").val(),
	    		valiTimesStart : $("#valiTimesStart").val(),
	    		
		    });	    	
			datas.data = data;
		    return datas;  
          }, 
	    queryParamsType : "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
	    silent : true, 						// 刷新事件必须设置
	    contentType : "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
	    onClickRow : function(row, $element) {
	      $('.success').removeClass('success');
	      $($element).addClass('success');
	      selectRow = row;
	    },
	    onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        	
        },
        onPageChange : function(data){
        	
        },
	    icons : {
	      refresh : "glyphicon-repeat",
	      toggle : "glyphicon-list-alt",
	      columns : "glyphicon-list"
	    }
	});
	
}

//详情信息
function showDetailsModal2(ENTERID,DATAID,enterpriseName){
	var enterPriseInfo = {
			enterId:ENTERID,
			DATAID:DATAID,
			enterpriseName:enterpriseName
		};
	showDetailsModal3(JSON.stringify(enterPriseInfo), enterpriseName, "views/data/detailIframe/enterBaseDetails.html")
}

//跳转数据详情页面
//显示排污许可证详细信息
function showDetailsModal3(dataIDJson, titleName, urlStr){
	$("#pwModal2").modal('toggle');
	sessionStorage.setItem('dataIDJson', dataIDJson);
	$("#myModalLabel3").text(titleName);
	$("#detailsIframe2").attr("src",urlStr);
	$("#detailsDiv2").show();
}

