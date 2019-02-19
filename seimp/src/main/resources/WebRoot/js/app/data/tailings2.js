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
		
		ajaxPost("/seimp/shareExchange/tailings2/getLastUpdateTime", {
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
			/*}, {
			      title: '序号',
			      field: 'XH',
			      align: 'center',
			      valign: 'middle',*/
			}, {
			      title: '行政区划',
			      field: 'XZQH',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-200'
			}, /*{
			      title: '行政区划名',
			      field: 'XZQHM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否为无主库',
			      field: 'SFWWZK',
			      align: 'center',
			      valign: 'middle',
			}, */{
			      title: '尾矿库企业名称',
			      field: 'WKKQYMC',
			      align: 'center',
			      valign: 'middle',
			      class:'w-300'
			},/* {
			      title: '尾矿库企业是否有曾用名',
			      field: 'WKKQYSFYCYM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库企业曾用名',
			      field: 'WKKQYCYM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '企业代码',
			      field: 'QYDM',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-100'
			}, {
			      title: '法定代表人',
			      field: 'FDDBR',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '联系电话',
			      field: 'LXDH',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '所涉主要矿种',
			      field: 'SSZYKZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '所涉主要矿种其他说明',
			      field: 'SSZYKZQTSM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '所涉附属矿种',
			      field: 'SSFSKZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '所涉附属矿种其他说明',
			      field: 'SSFSKZQTSM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '采选矿工艺',
			      field: 'CXKGY',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '安全许可证编号',
			      field: 'AQXKZBH',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-300'
			}, {
			      title: '安全许可证发放单位',
			      field: 'AQXKZFFDW',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '安全许可证颁（换）发时间',
			      field: 'AQXKZBFSJ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '排污许可证编号',
			      field: 'PWXKZBH',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '排污许可证发放单位',
			      field: 'PWXKZFFDW',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '排污许可证颁（换）发时间',
			      field: 'PWXKZBFSJ',
			      align: 'center',
			      valign: 'middle',
			},*/ {
			      title: '尾矿库名称',
			      field: 'WKKMC',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-300'
			},/* {
			      title: '尾矿库是否有曾用名',
			      field: 'WKKSFYCYM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库曾用名',
			      field: 'WKKCYM',
			      align: 'center',
			      valign: 'middle',
			}, {
	            field: 'ZXJD_D',
	            title: '中心经度',
	            align: 'center',
	            valign: 'middle',
	            formatter: function (value, row, index) {
	                return getLon(row);
	            }
	        }, {
	            field: 'ZXWD_D',
	            title: '中心纬度',
	            align: 'center',
	            valign: 'middle',
	            formatter: function (value, row, index) {
	            	return getLat(row);
	            }
//			}, {
//			      title: '中心经度_度',
//			      field: 'ZXJD_D',
//			      align: 'center',
//			      valign: 'middle',
//			}, {
//			      title: '中心经度_分',
//			      field: 'ZXJD_F',
//			      align: 'center',
//			      valign: 'middle',
//			}, {
//			      title: '中心经度_秒',
//			      field: 'ZXJD_M',
//			      align: 'center',
//			      valign: 'middle',
//			}, {
//			      title: '中心纬度_度',
//			      field: 'ZXWD_D',
//			      align: 'center',
//			      valign: 'middle',
//			}, {
//			      title: '中心纬度_分',
//			      field: 'ZXWD_F',
//			      align: 'center',
//			      valign: 'middle',
//			}, {
//			      title: '中心纬度_秒',
//			      field: 'ZXWD_M',
//			      align: 'center',
//			      valign: 'middle',
			}, {
			      title: '高程',
			      field: 'GC',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '所在乡镇名称',
			      field: 'SZXZMC',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '所在村名称',
			      field: 'SZCMC',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '相对方位',
			      field: 'XDFW',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '距村中心距离',
			      field: 'JCZXJL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库型式',
			      field: 'WKKXS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库其它型式',
			      field: 'WKKQTXS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿入库形式',
			      field: 'WKRKXS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '坝体类型',
			      field: 'BTLX',
			      align: 'center',
			      valign: 'middle',
			}, */{
			      title: '尾矿库等别',
			      field: 'WKKDB',
			      align: 'center',
			      valign: 'middle',
			},/* {
			      title: '安全度等级',
			      field: 'AQDDJ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尚未核定原因',
			      field: 'SWHDYY',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '生产状况',
			      field: 'SCZK',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库开工建设日期',
			      field: 'WKKKGJSRQ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库投入使用日期',
			      field: 'WKKTRSYRQ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '设计地震烈度',
			      field: 'SJDZLD',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '防洪标准',
			      field: 'FHBZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '设计总库容',
			      field: 'SJZKR',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '实际库容',
			      field: 'SJKR',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '设计总坝高',
			      field: 'SJZBG',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '现状总坝高',
			      field: 'XZZBG',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '设计年排尾量',
			      field: 'SJNPWL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '设计使用年限',
			      field: 'SJSYNX',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '已使用年限',
			      field: 'YSYNX',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿主要成分',
			      field: 'WKZYCF',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿附属成分',
			      field: 'WKFSCF',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿水主要成分',
			      field: 'WKSZYCF',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿水附属成分',
			      field: 'WKSFSCF',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '实际年尾矿入库量',
			      field: 'SJNWKRKL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿水产生量',
			      field: 'WKSCSL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿水和渗滤液排放量',
			      field: 'WKSHSLYPFL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿水回用率',
			      field: 'WKSHYL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿输送方式',
			      field: 'WKSSFS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '输送距离',
			      field: 'SSJL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否进行了环评',
			      field: 'SFJXLHP',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '未进行环评原因',
			      field: 'WJXHPYY',
			      align: 'center',
			      valign: 'middle',
			      class :'w-150'
			}, {
			      title: '环境影响评价文件是否按《建设项目环境风险评价技术导则（HJ/T169号）》要求编制环境风险评价专篇',
			      field: 'HJYXPJWJ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否通过环保“三同时”验收',
			      field: 'SFTGHBSTSYS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '未通过原因',
			      field: 'WTGYY',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否进行排污申报登记',
			      field: 'SFJXPWSBDJ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否采取防渗漏处理措施',
			      field: 'SFCQFSLCLCS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否采取防扬散处理措施',
			      field: 'SFCQFYSCLCS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否采取防流失处理措施',
			      field: 'SFCQFLSCLCS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否建设防洪设施',
			      field: 'SFJSFHSS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '排洪方式',
			      field: 'PHFS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '防洪设施是否正常',
			      field: 'FHSSSFZC',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '存在问题',
			      field: 'CZWT',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否建有尾矿水和渗滤液处理设施',
			      field: 'SFJYWKSHSLYCLSS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '排放是否达标',
			      field: 'PFSFDB',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库是否建在饮用水源地保护区、自然保护区、重要生态功能区',
			      field: 'WKKSFJZYZZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库周边是否有环境敏感点',
			      field: 'WKKZBSFYHJMGD',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '具体情况1',
			      field: 'JTQK1',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否存在影响公路、铁路饮用水源安全的情况',
			      field: 'SFCZYXGT',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '尾矿库下游是否有居民或重要设施',
			      field: 'WKKXYSFYJM',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '具体情况2',
			      field: 'JTQK2',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-200'
			}, {
			      title: '尾矿库下游是否建有流域防控设施',
			      field: 'WKKXYSFJYLYFKSS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '具体情况3',
			      field: 'JTQK3',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否配备环境应急人员',
			      field: 'SFPBHJYJRY',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '人数',
			      field: 'RS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否储备环境应急物资',
			      field: 'SFCBHJYJWZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '应急物资情况',
			      field: 'YJWZQK',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-400'
			}, {
			      title: '是否建设环境应急设施',
			      field: 'SFJSHJYJSS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '应急设施情况',
			      field: 'YJSSQK',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否编制环境应急预案',
			      field: 'SFBZHJYJYA',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '环境应急预案是否向环保部门备案',
			      field: 'HJYJYASFXHBBMBA',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否定期开展环境应急演练',
			      field: 'SFDQKZHJYJYL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否配备环境监测设备',
			      field: 'SFPBHJJCSB',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否进行环境日常监测',
			      field: 'SFJXHJRCJC',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '监测指标项',
			      field: 'JCZBX',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '指标项年平均监测值',
			      field: 'ZBXNPJJCZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '监测频率',
			      field: 'JCPL',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '周边是否有环境应急物资外部供应单位',
			      field: 'ZBSFYHJYJWZWBGYDW',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '是否发生突发环境事件（截至2012年5月31日）',
			      field: 'SFFSTFHJSJ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '突发环境事件次数',
			      field: 'TFHJSJCS',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '以往发现问题整改落实情况',
			      field: 'YWFXWTZGLSQK',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-400'
			}, {
			      title: '检查组发现的主要问题及整改要求',
			      field: 'JCZFXDZYWTJZGYQ',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-400'
			}, {
			      title: '被检查单位负责人意见',
			      field: 'BJCDWFZRYJ',
			      align: 'center',
			      valign: 'middle',
			     
			}, {
			      title: '备注',
			      field: 'BZ',
			      align: 'center',
			      valign: 'middle',
			}, {
			      title: '检查人员',
			      field: 'JCRY',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-150'
			}, {
			      title: '检查时间',
			      field: 'JCSJ',
			      align: 'center',
			      valign: 'middle',
			      class : 'w-150'
		    },*/{
	            field: '',
	            title: '操作',
	            align: 'center',
	            valign: 'middle',
	            formatter :function(value,row,inde){
	            	var className = "errorDingwei";
	            	if(row.ZXJD_D && row.ZXWD_D){
	            		className = "successDingwei";
	            	}
	                var s = "<a class='"+className+"'  onclick=dingwei('" + getLon(row) +"','"+ getLat(row) +"','"+ row.WRDKMC + "');>定位</a>";
	                s += "&nbsp;&nbsp;&nbsp;&nbsp;<a   onclick=showDetailsModal('" + row.XH +"','"+row.WKKMC+"'); >详情</a>";
	                return s;
	            }
		    }];
			//销毁表格
			$('#hangyeTable').bootstrapTable('destroy');
			//生成表格
			$('#hangyeTable').bootstrapTable({
			    method : 'POST',
			    url : "/seimp/shareExchange/tailings2/getTailingsData",
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
			    		WKKMC : $("#WKKMC").val(),//尾矿库名称
			    		XZQH : $("#XZQH").val(),//行政区划
			    		WKKQYMC : $("#WKKQYMC").val(),//尾矿库企业名称
			    		WKKDB : $("#WKKDB").val(),//尾矿库等别
			    		province : $("#province option[value='"+$("#province").val()+"']").attr("selectValue") ,//省份
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
	
	ajaxPost("/seimp/shareExchange/tailings2/getStatisDataOfHyname", {}).done(function (res) {
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
                            +params[0].seriesName + ': ' + params[0].value + "(座)";                                                                                             
                        return result;                                                                                                                                  
                    }
    		    },
    		    grid: {
    		        left: '5%',
    		        right: '10%',
    		        bottom: '10%',
    		        containLabel: true
    		    },
    		    yAxis: {
    		        type: 'value',
//    		        boundaryGap: [0, 0.01],
    		        name : '单位/座'
    		    
    		    },
    		    xAxis: [{
    		        type: 'category',
    		        data : name,
    		        name : '矿物种类名称',
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
    		            name: '尾款库数量',
    		            type: 'bar',
    		            itemStyle : {
	                    	normal : {
	                    		color : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
	                    			offset : 0,
	                    			color : '#ff8c94'//渐变效果
	                    		},{
	                    			offset : 1,
	                    			color : '#e5323e',
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
	var staUrl = "/seimp/shareExchange/tailings2/getStatisDataOfProvince";
	var staYAxisName = "省份名称";
	var userLevel = sessionStorage["userLevel"];
	if(userLevel && userLevel=="2"){
		$("#staDivName").parent().hide();
		return;
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
                        +params[0].seriesName + ': ' + params[0].value + "(座)";                                                                                             
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
//		        boundaryGap: [0, 0.01],
		        name:'单位/座'
		        	
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
		            name: '尾矿库数量',
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


function getLon(row){
	var result = "";
	if(row){
		if(row.ZXJD_D){
			result = parseFloat(row.ZXJD_D);
		}
		
		if(row.ZXJD_F){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXJD_F)/60).toFixed(4));
		}
		
		if(row.ZXJD_M){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXJD_M)/3600).toFixed(4));
		}
		
		if((result + "").length>8){
			result = (result + "").substr(0, (result+"").indexOf(".")+5);
		}
		
	}
	return result;
}

function getLat(row){
	var result = "";
	if(row){
		if(row.ZXWD_D){
			result = parseFloat(row.ZXWD_D);
		}
		
		if(row.ZXWD_F){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXWD_F)/60).toFixed(4));
		}
		
		if(row.ZXWD_M){
			result = parseFloat(result) + parseFloat((parseFloat(row.ZXWD_M)/3600).toFixed(4));
		}
		
		if((result + "").length>8){
			result = (result + "").substr(0, (result+"").indexOf(".")+5);
		}
		
	}
	return result;
}


function getPro() {
    ajaxPost("/seimp/shareExchange/getAllProvince", {}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"' selectValue='"+item.name+"'>"+item.name+"</option>";
 	       })
 	       $("#province").html(html);
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
	ajaxPost("/seimp/shareExchange/tailings2/getStatisDataByUpdateTime", {
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
	            name:'尾矿库',
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
			WKKMC : $("#WKKMC").val(),//尾矿库名称
    		XZQH : $("#XZQH").val(),//行政区划
    		WKKQYMC : $("#WKKQYMC").val(),//尾矿库企业名称
    		WKKDB : $("#WKKDB").val(),//尾矿库等别
    		province : $("#province option[value='"+$("#province").val()+"']").attr("selectValue") ,//省份
    		metadataID : id
	}
	ajaxPost("/seimp/shareExchange/tailings2/getExcelFile", parameter).done(function (result) {
		//删除等待提示框
		parent.removeDataDengdai();
        console.log(result);
        window.open("/seimp/" + result.data);
    });
}

//详情信息
function showDetailsModal(XH, WKKMC){
	var enterPriseInfo = {
			XH:XH
		};
	parent.showDetailsModal(JSON.stringify(enterPriseInfo), WKKMC, "views/data/detailIframe/tailings2Details.html")
}
