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
		
		ajaxPost("/seimp/shareExchange/enterBase/getLastUpdateTime", {
	    	ID:id
	    }).done(function (result) {
	    	if(result.status == 0){
	    		$("#updateTimeSpan").text(result.data.UPDATETIME);
	    	}
	               
	    })
               
    })
    
    //下载权限
    ajaxPost("/seimp/shareExchange/getDownRight", {
    	ID:id
    }).done(function (result) {
    	if(result.status == 0){
    		if(result.data && result.data == "1"){
    			$("#downBtn").show();
    		}
    	}
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
	getPro();
	//全部行业
	industry();
	//时间
	$('#acceptancedateStart').datetimepicker({
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
	$('#acceptancedateEnd').datetimepicker({
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
		    },
		    {
	            field: 'XKZNUM',
	            title: '许可证书编号',
	            align: 'center',
	            valign: 'middle',
	            class:'w2-100',
	            formatter: function (value, row, index) {
	            	return "<div ><span style='width:100px;' title='"+value+"'>"+value+"</span></div>";
	        	}
	        }, {
	            field: 'DEVCOMPANY',
	            title: '单位名称',
	            align: 'center',
	            valign: 'middle',
//	            class : 'w-200'
	            /*formatter: function (value, row, index) {
		            return "<div style='width:100px;'>"+value+"</div>";
		        }*/

	        },/* {
	            field: 'REGADDRESS',
	            title: '注册地址',
	            align: 'center',
	            valign: 'middle',
	            class : 'w-400'
	        }, */{
	            field: 'PROVINCE',
	            title: '省份',
	            align: 'center',
	            valign: 'middle',
//	            class :'w-100'
	        }, {
	            field: 'CITY',
	            title: '市区',
	            align: 'center',
	            valign: 'middle',
//	            class :'w-100'
	        }, {
	            field: 'COUNTY',
	            title: '县区',
	            align: 'center',
	            valign: 'middle',
//	            class :'w-200'
	        }, {
	            field: 'HYNAME',
	            title: '行业类型',
	            align: 'center',
	            valign: 'middle',
//	            class :'w-200'
	        },/* {
	            field: 'OPERATIME',
	            title: '投产日期',
	            align: 'center',
	            valign: 'middle',
	            class :'w-100'
	        }, {
	            field: 'ORGANCODE',
	            title: '组织机构代码',
	            align: 'center',
	            valign: 'middle'
	        }, {
	            field: 'CREDITCODE',
	            title: '统一社会信用代码',
	            align: 'center',
	            valign: 'middle'
	        }, {
	            field: 'VALITIMES',
	            title: '有效期限',
	            align: 'center',
	            valign: 'middle',
	            class :'w-200'
	        }, {
	            field: 'FZTIME',
	            title: '发证日期',
	            align: 'center',
	            valign: 'middle',
	            class :'w-100'
	        }, {
	            field: 'OPEADDRESS',
	            title: '生产经营场所地址',
	            align: 'center',
	            valign: 'middle',
	            class : 'w-300'
	            
	        }, {
	            field: 'LONGITUDE',
	            title: '生产经营场所中心经度',
	            align: 'center',
	            valign: 'middle'
	        }, {
	            field: 'LATITUDE',
	            title: '生产经营场所中心纬度',
	            align: 'center',
	            valign: 'middle'
	        }, {
	            field: 'ISSHORTPERMIT',
	            title: '是否需整改',
	            align: 'center',
	            valign: 'middle',
	            formatter: function (value, row, index) {
	                if (value == '1') {
	                    return '是';
	                } else if (value == '0'){
	                    return '否';
	                } else if (value=="null"){
	                	return "";
	                }
	            }
	        }, {
	            field: 'POSTCODE',
	            title: '邮政编码',
	            align: 'center',
	            valign: 'middle'
	        }, {
	            field: 'ISPARK',
	            title: '是否位于工业园区',
	            align: 'center',
	            valign: 'middle',
	            formatter: function (value, row, index) {
	                if (value == '1') {
	                    return '是';
	                } else {
	                    return '否';
	                }
	            }
	        }, {
	            field: 'INDUSTRIAL',
	            title: '所属工业园区名称',
	            align: 'center',
	            valign: 'middle',
	            class : 'w-300',
	            formatter : function(value, row, index){
	            	if(value == "null"){
	            		return "";
	            	}
	            	return value;
	            }
	        }, {
	            field: 'ZYWRWLBID',
	            title: '主要污染物类别',
	            align: 'center',
	            valign: 'middle',
	            formatter: function (value, row, index) {
	            	if(value){
	            		value = value.replace("fq","废气");
	            		value = value.replace("fs","废水");
	            	}
	            	return value;
	            }
	        }, {
	            field: 'AIRWRWNAME',
	            title: '废气主要污染物种类',
	            align: 'center',
	            valign: 'middle',
	            class :'w-500'
	        }, {
	            field: 'WATERWRWNAME',
	            title: '废水主要污染物种类',
	            align: 'center',
	            valign: 'middle',
	            class :'w-500'
	        }, {
	            field: 'WATEREMISSIONNAME',
	            title: '废水污染物排放规律',
	            align: 'center',
	            valign: 'middle',
	            class :'w-500'
	        }, {
	            field: 'ITEMTYPE',
	            title: '项目类型',
	            align: 'center',
	            valign: 'middle',
	            formatter: function (value, row, index) {
	                if (value == 'TYPEA') {
	                    return '首次填报';
	                } else if (value == 'TYPEB') {
	                    return '补充填报';
	                } else if (value == 'TYPEC') {
	                    return '变更';
	                } else {
	                    return '';
	                }
	            }
	        }, {
	            field: 'ITEMENDTIME',
	            title: '项目办结时间',
	            align: 'center',
	            valign: 'middle',
	            class :'w-150'
	        }, {
	            field: 'INSERTTIME',
	            title: '更新时间',
	            align: 'center',
	            valign: 'middle',
	            class :'w-150'
	        },*/{
		            field: '',
		            title: '操作',
		            align: 'center',
		            valign: 'middle',
//		            class:'w-200',
		            formatter :function(value,row,inde){
		            	var className = "errorDingwei";
		            	if(row.LONGITUDE && row.LATITUDE){
		            		className = "successDingwei";
		            	}
		                var s = "<a class='"+className+"'  onclick=dingwei('" + row.LONGITUDE +"','"+ row.LATITUDE +"','"+ row.PROJECTNAME + "');>定位</a>";
		                
		                s += "&nbsp;&nbsp;&nbsp;&nbsp;<a   onclick=showDetailsModal('" + row.ENTERID +"','"+ row.DATAID +"','"+ row.DEVCOMPANY + "');>详情</a>";
		                return s;
		            }
		        }];
			//销毁表格
			$('#hangyeTable').bootstrapTable('destroy');
			//生成表格
			$('#hangyeTable').bootstrapTable({
			    method : 'POST',
			    url : "/seimp/shareExchange/enterBase/getEnterpriseBaseinfoData",
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
			    		devcompany : $("#devcompany").val(),
			    		province : $("#province").val()==null?'':$("#province").val(),
			    		city : $("#city").val()==null?'':$("#city").val(),
			    		county : $("#county").val()==null?'':$("#county").val(),
			    		hyName : $("#hyName").val()==null?'':$("#hyName").val()
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
	
	ajaxPost("/seimp/shareExchange/enterBase/getStatisDataOfHyname", {}).done(function (res) {
    	//console.log(res.data);
    	var name = [];
    	var vals=[];
    	var length = 20;
    	var vals2 = [];
    	var maxValue = 0;
    	if(res.data.length<20){
    		length = res.data.length;
    	}
    	for (var i = 0; i < length; i++) {
        	var item = res.data[i];
        	if(item.name!=undefined && item.name!="" && item.name!=null && item.name!=" "){		        		
        		if(item.COUNT>maxValue){
	            	maxValue = item.COUNT;
	            }
        	}
    	}
         for (var i = 0; i < length; i++) {
	        	var item = res.data[i];
	        	if(item.name!=undefined && item.name!="" && item.name!=null && item.name!=" "){		        		
	        		name.push(item.name);
		            vals.push(item.COUNT);
		            vals2.push(maxValue);
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
    		        },
    		        formatter: function (params){                                                                                                                       
                        var result = params[0].name + '<br>'                                                                                                            
                            +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
                            +params[0].seriesName + ': ' + params[0].value + "(家)";                                                                                             
                        return result;                                                                                                                                  
                    }
    		    },
    		    grid: {
    		        left: '5%',
    		        right: '10%',
    		        bottom: '20%',
    		        containLabel: true
    		    },
    		    yAxis: {
    		        type: 'value',
//    		        boundaryGap: [0, 0.01],
    		        name : '单位/家'
    		    
    		    },
    		    xAxis: [{
    		        type: 'category',
    		        data : name,
    		        name : '行业名称',
    		        axisLabel: {
                        interval:0,
                        rotate:40
    		        }
    		    },{
    		    	// 辅助 x 轴
                    show: false,
                    data: name
    		    }],
    		    series: [
					{//辅助系列
						type : 'bar',
						silent : true,
						xAxisIndex : 1,
						itemStyle : {
							normal : {
								barBorderRadius : 20,
								color : '#F2F2F2'
					//			color : '#ddd'
							}
						},
						barWidth: 20,
						data: vals2
					},
    		        {
    		            name: '数据量',
    		            type: 'bar',
    		            itemStyle : {
	                    	normal : {
	                    		color : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
	                    			offset : 0,
	                    			color : '#ff9f7f'//渐变效果
	                    		},{
	                    			offset : 1,
	                    			color : '#e062ae',
	                    		}]),
	                    		barBorderRadius : 20, //圆角效果
	                    		shadowColor: 'rgba(0, 0, 0, 0.4)',
	                            shadowBlur: 20
	                    	},
	                    	emphasis : {
	                    		barBorderRadius : 20 //圆角效果
	                    	}
	                    },
    		            barWidth:20,
    		            data:vals
    		        }
    		    ]
    		};
        myChart.setOption(option);
    })
    
    //判断用户级别
	var staUrl = "/seimp/shareExchange/enterBase/getStatisDataOfProvince";
	var staYAxisName = "省份名称";
	var userLevel = sessionStorage["userLevel"];
	if(userLevel && userLevel=="2"){
		staUrl = "/seimp/shareExchange/enterBase/getStatisDataOfCity";
		staYAxisName = "市区名称";
		$("#staDivName").html("<i></i>按市区统计排污许可证企业");
	}
    
	//数据概览-省份统计
    ajaxPost(staUrl, {}).done(function (res) {
    	//console.log(res.data);
    	var names = [];
    	var num=[];
    	var vals2 = [];
    	var maxValue = 0;
    	 for (var i = 0; i < res.data.length; i++) {
	        	var item = res.data[i];
	        	if(item.name!=undefined && item.name!="" && item.name!=null && item.industry!=" "){		        		
	        		if(item.COUNT>maxValue){
		            	maxValue = item.COUNT;
		            }
	        	}
	      }
		 for (var i = 0; i < res.data.length; i++) {
	        	var item = res.data[i];
	        	if(item.name!=undefined && item.name!="" && item.name!=null && item.industry!=" "){		        		
	        		names.push(item.name);
	        		num.push(item.COUNT);
	        		vals2.push(maxValue);
	        	}
	      }
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
		        },
		        formatter: function (params){                                                                                                                       
                    var result = params[0].name + '<br>'                                                                                                            
                        +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
                        +params[0].seriesName + ': ' + params[0].value + "(家)";                                                                                             
                    return result;                                                                                                                                  
                }	
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
		        name:'单位/家'
		        	
		    },
		    yAxis: [{
		        type: 'category',
		        data : names,
		        name:staYAxisName
		    },{
                // 辅助 x 轴
                show: false,
                data: names
            }],
						    series: [
				{//辅助系列
					type : 'bar',
					silent : true,
					yAxisIndex : 1,
					itemStyle : {
						normal : {
							barBorderRadius : 20,
							color : '#F2F2F2'
						}
					},
					barWidth: 20,
					data: vals2
				},
		        {
		            name: '数据量',
		            type: 'bar',
		            itemStyle : {
                    	normal : {
                    		color : new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                    			offset : 0,
                    			color : '#c5dafa'//渐变效果
                    		},{
                    			offset : 1,
                    			color : '#2a62bb',
                    		}]),
                    		barBorderRadius : 10, //圆角效果
                    		shadowColor: 'rgba(0, 0, 0, 0.4)',
                            shadowBlur: 20
                    	},
                    	emphasis : {
                    		barBorderRadius : 10 //圆角效果
                    	}
                    },
		            barWidth:20,
		            data:num
		        }
		    ]
		};
		//使用刚指定的配置项和数据显示图表。
		myChart1.setOption(option);		
    })
    
}


//全部行业
function industry(){
	 ajaxPost("/seimp/shareExchange/enterBase/getAllHyname", {}).done(function (result) {
	    	console.log(result.data);
	    	var html="";
	    	html += "<option value=''>全部</option>";
	    	for(var i=1;i<result.data.length;i++){
	    		if(result.data[i].HYNAME!=undefined && result.data[i].HYNAME!="" && result.data[i].HYNAME!=null && result.data[i].HYNAME!=" "){		        		
	    			html += "<option value='"+result.data[i].HYNAME+"'>"+""+result.data[i].HYID+" "+result.data[i].HYNAME+"</option>";
	    		}
	    	}
	    	$("#hyName").html(html)
	    	$("#hyName").selectpicker("refresh");
	               
	    })
}

//省份
function getPro() {
    ajaxPost("/seimp/shareExchange/getAllProvince", {}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"'>"+item.name+"</option>";
 	       })
 	       $("#province").html(html);
 	    }
       
    })
}

//市
function getCityByProvince(){
	
	//选择省份的时候，清空县
	$("#county").html('<option value="">全部</option>');
	
	ajaxPost("/seimp/shareExchange/getCityByProvince", {
		provinceID : $("#province").val()
	}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"'>"+item.name+"</option>";
 	       })
 	       $("#city").html(html);
 	    }
       
    })
}

//县
function getCountyByCity(){
	ajaxPost("/seimp/shareExchange/getCountyByCity", {
		cityID : $("#city").val()
	}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"'>"+item.name+"</option>";
 	       })
 	       $("#county").html(html);
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
	ajaxPost("/seimp/shareExchange/enterBase/getStatisDataByUpdateTime", {
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
	        trigger: 'axis',
	        formatter: function (params){                                                                                                                       
	            var result = params[0].name + '<br>'                                                                                                            
	                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
	                +params[0].seriesName + ': ' + params[0].value + "(条)";                                                                                             
	            return result;                                                                                                                                  
	        }
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
	        name : '时间',
	        boundaryGap: false,
	        data: xAxisData
	    },
	    yAxis: {
	        type: 'value',
	        name : "数据量(条)"
	    },
	    series: [
	        {
	            name:'排污许可证企业信息',
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
	//等待提示框
	parent.dataDengdai();
	var parameter = {
			devcompany : $("#devcompany").val(),
    		province : $("#province").val()==null?'':$("#province").val(),
    		city : $("#city").val()==null?'':$("#city").val(),
    		county : $("#county").val()==null?'':$("#county").val(),
    		hyName : $("#hyName").val()==null?'':$("#hyName").val(),
    		metadataID : id
	}
	ajaxPost("/seimp/shareExchange/enterBase/getExcelFile", parameter).done(function (result) {
		//删除等待提示框
		parent.removeDataDengdai();
        console.log(result);
        window.open("/seimp/" + result.data);
    });
}
//详情信息
function showDetailsModal(ENTERID,DATAID,enterpriseName){
	var enterPriseInfo = {
			enterId:ENTERID,
			DATAID:DATAID,
			enterpriseName:enterpriseName
		};
	parent.showDetailsModal(JSON.stringify(enterPriseInfo), enterpriseName, "views/data/detailIframe/enterBaseDetails.html")
}
