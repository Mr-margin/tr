//面包屑导航
parent.changeBread([{title: '共享交换'}]);

//获取共享交换首页汇总数
ajaxPost("/seimp/shareExchange/getSumValue", {roleID: 1}).done(function (data) {
    if (data.status == 0) {
    	console.log(data.data)
    	$(".info-tip .tip1").html(data.data.metadataCount);
    	$(".info-tip .tip2").html(data.data.visitCount);
    	$(".info-tip .tip3").html(data.data.downCount)
       
    } else {
        toastr.error("获取数据权限失败");
    }
});
//数据快速浏览列表
ajaxPost("/seimp/shareExchange/getQuickReadList", {roleID: 1}).done(function (data) {
    if (data.status == 0) {
    	var html1="";
    	var html2="";
    	var html3="";
    	var isExit = false;  
    	//console.log(data.data)
    	$.each(data.data.dataTimeList, function(i, e) {
    		html1+='<li><a onclick=toMetaDataInfoPage("' + e.id + '","De1") ><p><i class="iconfont icon-yuan"></i>'+e.name+'</p><span>'+e.dataTime+'</span></a></li>';
    		$("#TimeList").html(html1)
    		if(i>8) {  
	          isExit = true;  
	          return false;  
	       } 
    		
    	})
    	$.each(data.data.visitCountList, function(m, e1) {
    		html2+='<li><a href="javascript:void(0);" onclick=toMetaDataInfoPage("' + e1.id + '","De1") ><p><i class="iconfont icon-yuan"></i>'+e1.name+'</p><span>'+e1.VISITCOUNT+'次</span></a></li>';
    		if(m>9) {  
  	          isExit = true;  
  	          return false;  
  	        } 
    		$("#visitCount").html(html2)
    	})
    	$.each(data.data.downCountList, function(n, e2) {
    		html3+='<li><a href="javascript:void(0);" onclick=toMetaDataInfoPage("' + e2.id + '","De1") ><p><i class="iconfont icon-yuan"></i>'+e2.name+'</p><span>'+e2.DOWNCOUNT+'次</span></a></li>';
    		if(n>9) {  
  	          isExit = true;  
  	          return false;  
  	       } 
    		$("#downCount").html(html3)
    	})
       
    } else {
        toastr.error("获取数据权限失败");
    }
});

//数据快速浏览列表
ajaxPost("/seimp/share/getStaByMinistry", {roleID: 1}).done(function (data) {
    if (data.status == 0) {
    	//console.log(data);
    	$("#sjtj1").html(data.data[0].value)
    	$("#sjtj2").html(data.data[7].value)
    	$("#sjtj3").html(data.data[1].value)
    	$("#sjtj4").html(data.data[4].value)
    	$("#sjtj5").html(data.data[3].value)
    	$("#sjtj6").html(data.data[5].value)    	    	
    } else {
        toastr.error("获取数据权限失败");
    }
});

//日期   

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

  $("#endTime").val(new Date().format("yyyy-MM-dd"));
  //console.log(lastMonth)
  $("#startTime").val(DateAdd("m ", -1, new Date()).format("yyyy-MM-dd"));
  
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
        return parent.toastr.error("开始时间不能大于结束时间");
    }   
}
//部委数据统计/数据分类统计
function datePage() {  
    var url = '/seimp/shareExchange/getStaByMinistry'
    ajaxPost(url, {}).done(function (res) {
    	//console.log(res.data);
    	//表格
    	var html="";
    	html+="<tr><th>序号</th><th>部门</th><th>数据集数量</th><th>数据量</th></tr>";	
        $.each(res.data, function(i, el) {        	
        	html+="<tr><td>"+ (++i) +"</td><td>"+el.name+"</td><td>"+el.metadataCount+"</td><td>"+el.serviceCount+"</td></tr>";
        	$("#bw_table").html(html)
        })
        //统计图
    	var name = [];
    	var serviceCount=[];
    	var metadataCount = [];
        $.each(res.data, function (key, val) {
            name.push(val.name);
            serviceCount.push(val.serviceCount)
            metadataCount.push(val.metadataCount);
        })
       // console.log(name)
        var myChart = echarts.init(document.getElementById('mychart1'));
        var option1 = {
        	    tooltip: {
        	        trigger: 'axis',
        	        axisPointer: {
        	            type: 'cross',
        	            crossStyle: {
        	                color: '#999'
        	            }
        	        },
        	        formatter: function (params){                                                                                                                       
        	            var result = params[0].name + '<br>';
        	            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
        	                +params[0].seriesName + ': ' + params[0].value + "(个)";
        	            result += '<br>';
        	            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[1].color+';"></span>'
    	                +params[1].seriesName + ': ' + params[1].value + "(条)";
        	            return result;                                                                                                                                  
        	        }
        	    },
        	    legend: {
        	        x : 'center',
        	        y : 'bottom',
        	        data:['数据集数量','数据量']
        	    },
        	    grid: {
	                left: '5%',
	                right: '5%',
	                bottom: '9%',
	                containLabel: true
	            },
        	    xAxis: [
        	        {
        	            type: 'category',
        	            data: name,
        	            axisPointer: {
        	                type: 'shadow'
        	            }
        	        }
        	    ],
        	    yAxis: [
        	        {
        	            type: 'value',
        	            name: '数据集数量(个)',
        	            min: 0,
        	            axisLabel: {
        	                formatter: '{value}'
        	            }
        	        },
        	        {
        	            type: 'value',
        	            name: '数据量(条)',
        	            min: 0,
        	            axisLabel: {
        	                formatter: '{value}'
        	            }
        	        }
        	    ],
        	    series: [
        	        {
        	            name:'数据集数量',
        	            type:'bar',
        	            itemStyle:{
			                normal:{
			                  //动态设置柱状图颜色
			                  color: ['#61a0a8']
			                }
			           },
			           barWidth :20,
        	            data:metadataCount
        	         },
        	        {
        	            name:'数据量',
        	            type:'line',
        	            yAxisIndex: 1,
        	            data:serviceCount
        	        }
        	    ]
        };
        myChart.setOption(option1);
    })
    var url2 = '/seimp/share/getStaByDateType'
    ajaxPost(url2, {}).done(function (res) {
    	//console.log(res)
    	
    	//表格

        var valueArr=[];
		var nameArr = []; 
        for(var i=0;i<res.data.names.length;i++){
                valueArr.push({"name":res.data.names[i],"value":res.data.values[i]});
				nameArr.push(res.data.names[i]);
         }
    	//console.log(nameValue)
        //表格
    	var html="";
    	html+="<tr><th>序号</th><th>数据分类</th><th>数据量</th></tr>";	
        $.each(valueArr, function(i, el) {        	
        	html+="<tr><td>"+ (++i) +"</td><td>"+el.name+"</td><td>"+el.value+"</tdh></tr>";
        	$("#sj_table").html(html)
        })
        //统计图
        var myChart = echarts.init(document.getElementById('mychart'));
        var option = {
        	   
        	    tooltip : {
        	        trigger: 'item',
//        	        formatter: "{a} <br/>{b} : {c} ({d}%)"
        	        formatter: function (params){                                                                                                                       
        	            var result = params.seriesName + '<br>'                                                                                                            
        	                + params.marker
        	                +params.name + ': ' + params.value + "(条)(" + params.percent + "%)";                                                                                             
        	            return result;                                                                                                                                  
        	        }
        	    },
        	    legend: {
        	        x : 'center',
        	        y : 'bottom',
        	        data:nameArr
        	    },
        	    calculable : true,
        	    series : [
        	        
        	        {
        	            name:'数据量',
        	            type:'pie',
        	            radius : [30, 80],
        	            center : ['50%', '50%'],
        	            roseType : 'area',
        	            data:valueArr
        	        }
        	    ]
        	};
        myChart.setOption(option);
    })
    
    //表格/统计图切换1
    $('input:radio[name="dataType1"]').change(function() {
    	if($('input:radio[name="dataType1"]:checked').attr("data")=="统计图"){
    		$("#mychart1").show();
    		$("#bw_table").hide();
    	}else if($('input:radio[name="dataType1"]:checked').attr("data")=="表格"){
    		$("#mychart1").hide();
    		$("#bw_table").show();
    	}
    })
    //表格/统计图切换2
    $('input:radio[name="dataType2"]').change(function() {
    	if($('input:radio[name="dataType2"]:checked').attr("data")=="统计图"){
    		$("#mychart").show();
    		$("#sj_table").hide();
    	}else if($('input:radio[name="dataType2"]:checked').attr("data")=="表格"){
    		$("#mychart").hide();
    		$("#sj_table").show();
    	}
    })
    
}
datePage()

//资源共享情况统计
function sharing(){
	
	var url3 = '/seimp/shareExchange/getResourceShareDataStatisAll'
    ajaxPost(url3, {dateStart:$("#startTime").val(),dateEnd:$("#endTime").val()}).done(function (res) {
    	//console.log(res.data);
        //统计图
    	var nameArr = [];
    	var visitCountArr=[];
    	var downCountArr = [];
        $.each(res.data.visitList, function (key, val) {
        	nameArr.push(val.dateStr);
            visitCountArr.push(val.count)
        })
        $.each(res.data.downList, function (key, val) {
        	downCountArr.push(val.count)
        })
       // console.log(name)
        var myChart = echarts.init(document.getElementById('mychart2'));
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
        	                +params[0].seriesName + ': ' + params[0].value + '(次)';
        	            result += "<br><br>"
        	            result += params[1].name + '<br>'                                                                                                            
    	                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[1].color+';"></span>'
    	                +params[1].seriesName + ': ' + params[1].value + '(次)';
        	            return result;                                                                                                                                  
        	        }
        	    },
        	    legend: {
        	        data:['访问量','下载量'],
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
        	            name : '访问量(次)',
        	            type : 'value',
        	        },
        	        {
        	            gridIndex: 1,
        	            name : '下载量(次)',
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
        	            name:'下载量',
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
    })
	
	/*
	var url3 = '/seimp/shareExchange/getResourceShareDataStatis'
	    ajaxPost(url3, {type:$('input:radio[name="dataType3"]:checked').attr("value"),dateStart:$("#startTime").val(),dateEnd:$("#endTime").val()}).done(function (res) {
	    	//console.log(res);
	    	var date = [];
	    	var count=[];
	        $.each(res.data, function (key, val) {
	        	date.push(val.DAYDATE);
	        	count.push(val.COUNT)
	        })
	        var myChart = echarts.init(document.getElementById('mychart2'));
	        option = {
	            color: ['#d7a963'],
	            title: {
	                text: '',
	                subtext: '',
	                x: 'center'
	            },
	            legend:{
	                data:['访问量']
	            },
	            tooltip: {
	                trigger: 'axis',
	                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	                }
	            },
	            grid: {
	                left: '3%',
	                right: '4%',
	                bottom: '3%',
	                containLabel: true
	            },
	            xAxis: [
	                {
	                    type: 'category',
	                    data: date
	                }
	            ],
	            yAxis: [
	                {
	                    type: 'value'
	                }
	            ],
	            series: [
	                {
	                    name: '访问量',
	                    type: 'line',
	                    barWidth: '60%',
	                    data: count
	                }
	            ]
	        };
	        myChart.setOption(option);
	    })
	    */
}
sharing()
$(".share_ipt").change(function() {
	  sharing()	  
});
function search(){
	sharing()	  
}
/*全局搜索*/
//条件查询参数
var searchParams1 = {//清单模式查询条件
	name: "",
    sortColumn:"",
    pageNumber: 1,
    pageSize: 10
};

//关键词搜索
function gloSearch() {
	var keyName = $("#keyname").val();
	sessionStorage.setItem("getPageDataFunction","getPageDataByKeyName('"+keyName+"');");
    parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.parent.document.getElementById("myiframe").src="views/data/dataSets.html";
	
}

//点击当前包含28个数据集
function getAllMetadataList(){
	var keyName = $("#keyname").val();
	sessionStorage.setItem("getPageDataFunction","getPageDataByKeyName('"+keyName+"');");
    parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.parent.document.getElementById("myiframe").src="views/data/dataSets.html";
}

//点击常用关键词，搜索
function keyName(thisObj){
	var keyName = $(thisObj).val();
	sessionStorage.setItem("getPageDataFunction","getPageDataByKeyName('"+keyName+"');");
    parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.parent.document.getElementById("myiframe").src="views/data/dataSets.html";
}

ajaxPost("/seimp/shareExchange/getIndexSumValue", {}).done(function (data) {
	console.log(data)
    if (data.status == 0) {
    	$("#wrdk").html(data.data[0].COUNT+"块");
    	$("#jshp").html(data.data[1].COUNT+"个");
    	$("#zdhy").html(data.data[2].COUNT+"家");
    	$("#ttlh").html(data.data[3].COUNT+"条");
    	$("#sz").html(data.data[4].COUNT.toFixed(4)+"GB");
    }
})

//跳转到数据集详情页面
function toMetaDataInfoPage(metaDataID, DeStr){
	window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
    window.parent.document.getElementById("myiframe").src=metaDataHtmlUrlObj[metaDataID].url + "#" + metaDataHtmlUrlObj[metaDataID].clickPar + "?id=" + metaDataID;
}
//部委数据统计/数据分类统计/资源共享 radio 按钮切换
$(".dataShow2").on("click",function(){  //点击label 
    var _in = $(this).children("input:radio[name='dataType1']");         
    $(this).addClass("dataShow_active2").siblings().removeClass("dataShow_active2");     
});
$(".dataShow3").on("click",function(){  //点击label 
    var _in = $(this).children("input:radio[name='dataType2']");         
    $(this).addClass("dataShow_active2").siblings().removeClass("dataShow_active2");     
});
$(".dataShow4").on("click",function(){  //点击label 
    var _in = $(this).children("input:radio[name='dataType3']");         
    $(this).addClass("dataShow_active2").siblings().removeClass("dataShow_active2");     
});