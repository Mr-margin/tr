//面包屑导航
parent.changeBread([{title: '共享交换'}]);
//初始化页面高度
parent.document.getElementById("myiframe").style.height = "0px";
var id;

$(function(){
	var indexResult = sessionStorage.getItem('resultIndex');
	console.log(indexResult);
	var dataIndex=JSON.parse(indexResult);
	console.log(dataIndex)
	
	//二维码hover效果
	$(".tab_line>div p").hover(function() {
		$(".qrcodeDiv").show();
	},function(){
		$(".qrcodeDiv").hide();
	})
	//tab切换
	if($(".sjTabs li").eq(0).css("display")=="none"){
		$(".sjTabs li").eq(1).css("marginLeft","-4px");
		$(".tab_line").addClass("tab_line1");
	}
	$(".sjTabs li").click(function(){
		parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
		$(this).addClass("active").siblings(".sjTabs li").removeClass("active");
		$(".sj-item").eq(($(this).index())/2).show().siblings(".sj-item").hide();
		
		console.log();
		var thisIndex = $(this).index(".sjTabs li");
		if(thisIndex == "0"){
			De1();
		}
		if(thisIndex == "4"){
			De5();
		}
		
	})
	
    // 截取当前页面链接后的参数
	demopage_switchslider();
	function demopage_switchslider(){  
	    id=window.location.href.substring(window.location.href.indexOf('=')+1);  
	    if(id!==undefined&&id!==''&&window.location.href.indexOf('=')>0){  
	        console.log(id) 
	    }  
	}
		
	//数据名称、描述、分类、数据量、服务量、下载量、共享方式
    ajaxPost("/seimp/shareExchange/getDatalistByID", {
    	ID:id
    }).done(function (result) {
    	var html="";
    	html+='<h1><span class="l"></span><b>'+result.data.name+'</b><span class="r"></span></h1>';
    	html+='<p>'+(result.data.abstract==null?'':result.data.abstract)+'</p><div>';
		html+='<p class="data-set1"><i class="iconfont icon-set1"></i><span>'+result.data.catalogUrl+'</span></p><p class="data-set2"><i class="iconfont icon-set2"></i><span>'+result.data.SERVICEACCOUNT+'</span></p><p class="data-set3"><i class="iconfont icon-set3"></i><span>'+result.data.VISITCOUNT+'</span></p><p class="data-set4"><i class="iconfont icon-set4"></i><span>'+result.data.DOWNCOUNT+'</span></p><p class="data-set5"><i class="iconfont icon-set5"></i><span>'+result.data.shareLevel+'</span></p><p class="data-set6"><i class="iconfont icon-set6"></i><span id="updateTimeSpan"></span></p>';
		html+='</div>'
		
		$(".sjxq-item").html(html);
		
		//判断数据集权限
		if(result.data.SELECTAUTH && result.data.SELECTAUTH=="1"){
			//有权限
			$("#selectLi").show();
			$("#selectSpan").show();
		}
		$(".tab_line1").css("width", "calc(100% - "+$(".sjTabs").width()+"px)");
		
		/*
		ajaxPost("/seimp/shareExchange/mlr/getLastUpdateTime", {
	    	ID:id
	    }).done(function (result) {
	    	if(result.status == 0){
//	    		$("#updateTimeSpan").text(result.data.UPDATETIME);
	    	}
	               
	    })
	    */
               
    })

    //更新历史时间控件
    var endDate = new Date().format("yyyy-MM-dd");
	$('#endTime').val(endDate);
	var startDate = DateAdd('m ', -3, new Date()).format("yyyy-MM-dd");
	$('#startTime').val(startDate);
	$('#startTime').datetimepicker({
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
	$('#endTime').datetimepicker({
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
    
    
	//判断显示哪个选项卡
	var urlstr = location.href;
	console.log(urlstr);
	if(urlstr.match("De1")){
		$(".sjTabs li").eq(0).addClass("active");
		$(".sj-item").eq(0).show();
		De1();
	}else if(urlstr.match("De2")){
		$(".sjTabs li").eq(1).addClass("active");
		$(".sj-item").eq(1).show();
		De2();
	}else if(urlstr.match("De3")){
		$(".sjTabs li").eq(2).addClass("active");
		$(".sj-item").eq(2).show()
		De3();
	}else if(urlstr.match("De4")){
		$(".sjTabs li").eq(3).addClass("active");
		$(".sj-item").eq(3).show()
	}else if(urlstr.match("De5")){
		$(".sjTabs li").eq(4).addClass("active");
		$(".sj-item").eq(4).show()
		De5();
	}
	
	//数据详情，条件
	//省
	getMlrCon();
	//全部行业
	//时间
	$('#zcrqoStart').datetimepicker({
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
	$('#zcrqoEnd').datetimepicker({
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
	
	De2();
	$("#tableSearchBtn").click(function(){
		De2();
	})
	function De2(){
		//更新表格
			var columns =[{
		        //field: 'Number',//可不加  
		        title: '序号',//标题  可不加  
		        formatter: function (value, row, index) {
		            return index + 1;
		        }
			}, {
		        field: 'xkzh',
		        title: '许可证号',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'ksmc',
		        title: '矿山名称',
		        align: 'center',
		        valign: 'middle',
		        class:'w-200',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'kyqr',
		        title: '矿业权人',
		        align: 'center',
		        valign: 'middle',
		        class:'w-200',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'dz',
		        title: '地址',
		        align: 'center',
		        valign: 'middle',
		        class:'w-200',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'yxqx',
		        title: '有效期限',
		        align: 'center',
		        valign: 'middle',
		        class:'w-200',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'kz',
		        title: '矿种',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'zmj',
		        title: '总面积',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'sjgm',
		        title: '设计规模',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'kcfs',
		        title: '开采方式',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'zxd_x',
		        title: '中心点X',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }

		    }, {
		        field: 'zxd_y',
		        title: '中心点Y',
		        align: 'center',
		        valign: 'middle',
		        formatter: function (value, row, index) {
		            if (value == "(null)") {
		                return "-";
		            } else {
		                return value
		            }
		        }
	        },{
		            field: '',
		            title: '操作',
		            align: 'center',
		            valign: 'middle',
		            formatter :function(value,row,inde){
		            	var className = "errorDingwei";
		            	if(row.zxd_x && row.zxd_y){
		            		className = "successDingwei";
		            	}
		                var s = "<a class='"+className+"'  onclick=dingwei('" + row.zxd_x +"','"+ row.zxd_y +"','"+ row.ksmc + "');>定位</a>";
		                return s;
		            }
		        }];
			//销毁表格
			$('#hangyeTable').bootstrapTable('destroy');
			//生成表格
			$('#hangyeTable').bootstrapTable({
			    method : 'POST',
			    url : "/seimp/shareExchange/mlr/getMlrData",
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
//			    onlyInfoPagination:false,
			    queryParams: function queryParams(params) {   //设置查询参数  
			    	var datas = {};
			    	var data =  JSON.stringify({
			    		metaID : id,
			    		pageSize : params.limit,  //页面大小
			    		pageNumber : params.offset,   //页码
			    		xkzh : $("#xkzh").val(),
			    		ksmc : $("#ksmc").val(),
			    		kyqr : $("#kyqr").val(),
			    		kz : $("#kz").val(),
			    		kcfs : $("#kcfs").val(),
			    		
				    });	    	
					datas.data = data;
				    return datas;  
				    console.log(datas)
		          }, 
			    queryParamsType : "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
			    silent : true, 						// 刷新事件必须设置
			    contentType : "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
			    onClickRow : function(row, $element) {
			      $('.success').removeClass('success');
			      $($element).addClass('success');
			    },
			    onLoadError: function (status) {
		            toastr.error("请求超时");
		            return false;
		        },
		        onLoadSuccess:function(data){
		        	//初始化页面高度
		    		parent.document.getElementById("myiframe").style.height = "0px";
		        },
			    icons : {
			      refresh : "glyphicon-repeat",
			      toggle : "glyphicon-list-alt",
			      columns : "glyphicon-list"
			    }
			});
	}
	
	
	De3();
	//元数据信息
	function De3(){
		ajaxPost("/seimp/shareExchange/getMetadataInfoByID", {
			MID:id
	    }).done(function (result) {
	        if(result.status == 0){
	        	var data = result.data;
	        	//基本信息
	        	$("#jibenxinxiTalbe tr:eq(0) td:eq(1)").text(data.name==null ? "" : data.name);
	        	$("#jibenxinxiTalbe tr:eq(0) td:eq(3)").text(data.department==null ? "" : data.department);
	        	
	        	$("#jibenxinxiTalbe tr:eq(1) td:eq(1)").text(data.serviceAccount==null ? "" : data.serviceAccount);
	        	$("#jibenxinxiTalbe tr:eq(1) td:eq(3)").text(data.VISITCOUNT==null ? "" : data.VISITCOUNT);
	        	
	        	$("#jibenxinxiTalbe tr:eq(2) td:eq(1)").text(data.catalogUrl==null ? "" : data.catalogUrl);
	        	$("#jibenxinxiTalbe tr:eq(2) td:eq(3)").text(data.updateTime==null ? "" : data.updateTime);
	        	
	        	$("#jibenxinxiTalbe tr:eq(3) td:eq(1)").text(data.contact==null ? "" : data.contact);
	        	$("#jibenxinxiTalbe tr:eq(3) td:eq(3)").text(data.tel==null ? "" : data.tel);
	        	
	        	$("#jibenxinxiTalbe tr:eq(4) td:eq(1)").text(data.email==null ? "" : data.email);
	        	$("#jibenxinxiTalbe tr:eq(4) td:eq(3)").text(data.address==null ? "" : data.address);

	        	$("#jibenxinxiTalbe tr:eq(5) td:eq(1)").text(data.location==null ? "" : data.location);
	        	$("#jibenxinxiTalbe tr:eq(5) td:eq(3)").text(data.subjectTerms==null ? "" : data.subjectTerms);
	        	
	        	$("#jibenxinxiTalbe tr:eq(6) td:eq(1)").text(data["abstract"]==null ? "" : data["abstract"]);
	        	$("#jibenxinxiTalbe tr:eq(7) td:eq(1)").text(data.instructions==null ? "" : data.instructions);
	        	
	        	
	        	//数据生产
	        	$("#produceInfoTable tr:eq(0) td:eq(1)").text(data.produce_name==null ? "" : data.produce_name);
	        	$("#produceInfoTable tr:eq(1) td:eq(1)").text(data.produce_people==null ? "" : data.produce_people);
	        	$("#produceInfoTable tr:eq(2) td:eq(1)").text(data.produce_tel==null ? "" : data.produce_tel);
	        	$("#produceInfoTable tr:eq(3) td:eq(1)").text(data.produce_email==null ? "" : data.produce_email);
	        	$("#produceInfoTable tr:eq(4) td:eq(1)").text(data.produce_address==null ? "" : data.produce_address);
	        	
	        	//数据处理
//	        	$("#handleInfoTable tr:eq(0) td:eq(1)").text(data.handle_name==null ? "" : data.handle_name);
//	        	$("#handleInfoTable tr:eq(1) td:eq(1)").text(data.handle_people==null ? "" : data.handle_people);
//	        	$("#handleInfoTable tr:eq(2) td:eq(1)").text(data.handle_tel==null ? "" : data.handle_tel);
	        	
	        	///数据入库
	        	$("#todatabaseInfoTable tr:eq(0) td:eq(1)").text(data.todatabase_name==null ? "" : data.todatabase_name);
	        	$("#todatabaseInfoTable tr:eq(1) td:eq(1)").text(data.todatabase_people==null ? "" : data.todatabase_people);
	        	$("#todatabaseInfoTable tr:eq(2) td:eq(1)").text(data.todatabase_tel==null ? "" : data.todatabase_tel);
	        	$("#todatabaseInfoTable tr:eq(3) td:eq(1)").text(data.todatabase_email==null ? "" : data.todatabase_email);
	        	$("#todatabaseInfoTable tr:eq(4) td:eq(1)").text(data.todatabase_address==null ? "" : data.todatabase_address);
	        	
	        	//目录信息
	        	$("#catalogInfoTable tr:eq(0) td:eq(1)").text(data.name==null ? "" : data.name);
	        	$("#catalogInfoTable tr:eq(1) td:eq(1)").text(data.catalogUrl==null ? "" : data.catalogUrl);
	        	$("#catalogInfoTable tr:eq(2) td:eq(1)").text(data.department==null ? "" : data.department);
	        }
	    })
	}
	
	
	
	De4();
	function De4(){
		//数据项信息
		ajaxPost("/seimp/shareExchange/getMetadataColumnInfoByID", {
			MID:id
	    }).done(function (result) {
	        if(result.status == 0){
	        	var data = result.data;
	        	var html = "";
	        	for (var i = 0; i < data.length; i++) {
					var currItem = data[i];
					html += "<tr><td>"+ currItem.COLUMNNAMECHN +"</td><td>"+ currItem.COLUMNTYPE +"</td><td>"+ currItem.COLUMNLENGTH +"</td></tr>";
				}
	        	$("#dataColumnInfoTable").append(html);
	        	
	        }
	    });
		
	}
	
	//更新历史
	$("#statisType").change(function() {
		De5();
	})
	
	$("#startTime").change(function() {
		De5();
	})
	
	$("#endTime").change(function() {
		De5();
	})
	
})

//数据概览-按行业统计
function De1(){
	/*
	ajaxPost("/seimp/kep/getStatisDataOfIndustry", {}).done(function (res) {
    	//console.log(res.data);
    	var name = [];
    	var vals=[];
         for (var i = 0; i < 10; i++) {
	        	var item = res.data[i];
	        	if(item.industry!=undefined && item.industry!="" && item.industry!=null && item.industry!=" "){		        		
	        		name.push(item.industry);
		            vals.push(item.COUNT)
	        	}
	      }
        var myChart = echarts.init(document.getElementById('hangye_chart1'));
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
    		    grid: {
    		        left: '3%',
    		        right: '4%',
    		        bottom: '3%',
    		        containLabel: true
    		    },
    		    xAxis: {
    		        type: 'value',
    		        boundaryGap: [0, 0.01]
    		    },
    		    yAxis: {
    		        type: 'category',
    		        data : name
    		    },
    		    series: [
    		        {
    		            name: '数据量',
    		            type: 'bar',
    		            itemStyle:{
    		                normal:{color:'#5b9bd5'}
    		            },
    		            barWidth:20,
    		            data:vals
    		        }
    		    ]
    		};
        myChart.setOption(option);
    })
	//数据概览-省份统计
    ajaxPost("/seimp/kep/getStatisDataOfProvince", {}).done(function (res) {
    	//console.log(res.data);
    	var names = [];
    	var num=[];
        $.each(res.data, function (key, val) {
            names.push(val.name);
            num.push(val.COUNT)
        })
	    var myChart1 = echarts.init(document.getElementById('hangye_chart2'));
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
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		        type: 'value',
		        boundaryGap: [0, 0.01]
		    },
		    yAxis: {
		        type: 'category',
		        data : names
		    },
		    series: [
		        {
		            name: '数据量',
		            type: 'bar',
		            itemStyle:{
		                normal:{color:'#5b9bd5'}
		            },
		            barWidth:20,
		            data:num
		        }
		    ]
		};
		//使用刚指定的配置项和数据显示图表。
		myChart1.setOption(option);		
    })
    */
}


//全部行业


//矿种、开采方式查询条件
function getMlrCon() {
    ajaxPost("/seimp/shareExchange/mlr/getMlrCon", {}).done(function (result) {
    	if (result.status == 0) {
    		var html="",html2="";
    		html += "<option value='' selectValue=''>全部</option>";
    		html2 += "<option value='' selectValue=''>全部</option>";
    		for (var i = 0; i < result.data.kz.length; i++) {
    			var currItem = result.data.kz[i];
    			html += '<option value="' + currItem.kz + '">' + currItem.kz + '</option>';
    		}
    		for (var i = 0; i < result.data.kcfs.length; i++) {
 	            var currItem = result.data.kcfs[i];
 	            html2 += '<option value="' + currItem.kcfs + '">' + currItem.kcfs + '</option>';
    		}
    		$("#kz").html(html);
    		$("#kcfs").html(html2);
 	    }
       
    })
}




//定位s
function dingwei(WRDKZXJD, WRDKZXWD, WRDKMC){
	if(WRDKZXJD && WRDKZXWD && WRDKZXJD!='undefined' && WRDKZXWD!='undefined'){
		arcgisDw(WRDKZXJD, WRDKZXWD, WRDKMC);
	}else{
		swal("该污染地块无坐标！", "", "info");
	}
}


//提交申请信息
function submitAskInfo(){
	var askDepartment = $("#askDepartment").val();
	var askName = $("#askName").val();
	var askTel = $("#askTel").val();
	var askEmail = $("#askEmail").val();
	var askReason = $("#askReason").val();
	
	if(askDepartment==null || askDepartment==""){
		parent.toastr.warning("请填写申请部门！");
		return;
	}
	if(askName==null || askName==""){
		parent.toastr.warning("请填写联系人姓名！");
		return;
	}
	if(askTel==null || askTel==""){
		parent.toastr.warning("请填写联系人电话！");
		return;
	}
	if(askEmail==null || askEmail==""){
		parent.toastr.warning("请填写联系人邮箱！");
		return;
	}
	if(askReason==null || askReason==""){
		parent.toastr.warning("请填写申请理由！");
		return;
	}else{
		if(askReason.length > 200){
			parent.toastr.warning("申请理由不能超过200字！");
			return;
		}
	}
	
	//数据项信息
	ajaxPost("/seimp/askData/addAskData", {
		metadataID : id,
		askDepartment : askDepartment,
		askName : askName,
		askTel : askTel,
		askEmail : askEmail,
		askReason : askReason
    }).done(function (result) {
        if(result.status == 0){
        	//清空输入框
        	$("#askDepartment").val("");
        	$("#askName").val("");
        	$("#askTel").val("");
        	$("#askEmail").val("");
        	$("#askReason").val("");
        	//添加成功
        	parent.swal("提交成功", "", "success");
        }else{
        	parent.swal("提交失败", result.msg, "error");
        }
    });
	
}

function De5(){
	ajaxPost("/seimp/shareExchange/mlr/getStatisDataByUpdateTime", {
		startTime : $("#startTime").val(),
		endTime : $("#endTime").val(),
		statisType : $("#statisType").val()
    }).done(function (result) {
        if(result.status == 0){
        	getOptionParameter(result.data);
        }
    });
}

//生成统计图option的参数
function getOptionParameter(data){
	var xAxisData = [];
	var seriesData = [];
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		if(currItem.UPDATETIME!=null && currItem.UPDATETIME!="" && currItem.COUNT!=null){
			xAxisData.push(currItem.UPDATETIME);
			seriesData.push(currItem.COUNT);
		}
	}
	
	initEcharts(xAxisData, seriesData);
}


function initEcharts(xAxisData, seriesData){
	option = {
	    title: {
	        text: ''
	    },
	    tooltip: {
	        trigger: 'axis'
	    },
	    legend: {
	        data:['']
	    },
	    dataZoom: [
           {
               show: true,
               realtime: true,
//               start: 30,
//               end: 70,
//               xAxisIndex: [0, 1]
           },
           {
               type: 'inside',
               realtime: true,
//               start: 30,
//               end: 70,
//               xAxisIndex: [0, 1]
           }
	    ],
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '13%',
	        containLabel: true
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: xAxisData
	    },
	    yAxis: {
	        type: 'value',
	        name : "数据量"
	    },
	    series: [
	        {
	            name:'涉重有色金属采矿权项目清单',
	            type:'line',
	            stack: '总量',
	            data:seriesData
	        }
	    ]
	};
	var myChart = echarts.init(document.getElementById('updata_chart'));
	myChart.setOption(option);
	
}


//污染地块excel下载
function kepGetExcelFile(){
	var parameter = {
			tydmo : $("#tydmo").val(),
    		jgdmo : $("#jgdmo").val(),
    		jgmco : $("#jgmco").val(),
    		fddbro : $("#fddbro").val(),
    		zcrqoStart : $("#zcrqoStart").val(),
    		zcrqoEnd : $("#zcrqoEnd").val(),
    		province : $("#province").val(),
    		city : $("#city").val(),
    		county : $("#county").val(),
    		metadataID : id
	}
	ajaxPost("/seimp/shareExchange/organCode/getExcelFile", parameter).done(function (result) {
        console.log(result);
        window.open("/seimp/" + result.data);
    });
}

//展示属性查询结果
var searchPar = {
		//不显示的字段
		deletePar:["FID","Shape","E_NAME","FID_小麦产","FID_水稻产","Id_1"],
		//翻译字段
		translatePar:{
			"AREA" : "面积"
		},
		//添加单位
		addPar:{
			
		}
}

/**
 * 地图功能
 */
function  allPublic(){
	var infoTemplate = new dong.InfoTemplate();
	infoTemplate.setTitle(getTitle);
	function getTitle(evt){
		return evt._layer.name;
	}
	infoTemplate.setContent(getContent);
	function getContent(graphic){
		var attributes = graphic.attributes;
		var html = "";
		for(var attrName in attributes){
			//判断属性信息是否显示
			if(searchPar.deletePar.indexOf(attrName) == -1){
				var columnName = attrName;
				if(searchPar.translatePar[columnName]){
					columnName = searchPar.translatePar[columnName];
				}
				html += "<p>"+columnName+"：<code>"+attributes[attrName]+"</code></p>";
			}
		}
		return html;
	}
	
	var infoTemplates = {
		0: {
			infoTemplate: infoTemplate,
			layerUrl: null
		},
		1: {
			infoTemplate: infoTemplate,
			layerUrl: null
		},
		2: {
			infoTemplate: infoTemplate,
			layerUrl: null
		}
	
	};
	dynamicMapServiceLayer = new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/plant/MapServer", {
		showAttribution:true,
		infoTemplates: infoTemplates,
		"opacity":1,
		id:"zwzzqLayer"
	});

	app.map.addLayer(dynamicMapServiceLayer);
	
	dynamicMapServiceLayer.setVisibleLayers([0,1,2]);
}

$(function(){
	$(".layerCheck").change(function(){
		var visibleLayersIds = [];
		var eles = $(".layerCheck:checked");
		for (var i = 0; i < eles.length; i++) {
			var currEle = eles[i];
			visibleLayersIds.push($(currEle).val());
		}
		dynamicMapServiceLayer.setVisibleLayers(visibleLayersIds);
	})
})