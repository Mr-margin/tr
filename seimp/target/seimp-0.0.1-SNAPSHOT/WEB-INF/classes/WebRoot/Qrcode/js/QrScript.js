$(".wraper").css("minHeight",$(window).height())
$(".wraper .body").css("minHeight",$(window).height()-85)

//Tab切换
$(".tab-list>li").on('touchstart mousedown',function(e){
	e.preventDefault()
	$(".tab-list .active").removeClass('active');
	$(this).addClass('active');
	$(".tab-pane").eq($(this).index()).show().siblings(".tab-pane").hide();
});

$(".tab-list>li").click(function(e){
	e.preventDefault();
});
//背景
//$(".tab-list li").bind("click",function(){
//	if($(this).index()==1||$(this).index()==2){
//		$(".body").css("backgroundSize","cover")
//	}else{
//		$(".body").css("backgroundSize","cover")
//	}
//	
//})
 // 截取当前页面链接后的参数 
var  metaID;
function demopage_switchslider(){  
	 metaID=window.location.href.substring(window.location.href.indexOf('=')+1);  
    if( metaID!==undefined&& metaID!==''&&window.location.href.indexOf('=')>0){  
        console.log( metaID) 
    }  
}
demopage_switchslider()	

var statis1=metaDataHtmlUrlObj[metaID].statisColumn;
var statis2=metaDataHtmlUrlObj[metaID].statisTable;
var statis3=metaDataHtmlUrlObj[metaID].statisColumnType;

ajaxPost("/seimp/mobile/getMetadataInfoByID", {
		MID: metaID
}).done(function (result) {
	if(result.status == 0){
			console.log(result.data);			
			var data=result.data;
			$(".body h2").html(data.name==null ? "" : data.name);
			
			$("#tab1").html(data.name==null ? "" : data.name);
			$("#tab2").html(data.department==null ? "" : data.department);
			
			$("#tab3").html(data.serviceAccount==null ? "" : data.serviceAccount);
			$("#tab4").html(data.VISITCOUNT==null ? "" : data.VISITCOUNT);
			
			$("#tab5").html(data.catalogUrl==null ? "" : data.catalogUrl);
        	$("#tab6").html(data.updateTime==null ? "" : data.updateTime);
        	
        	$("#tab7").html(data.contact==null ? "" : data.contact);
        	$("#tab8").html(data.tel==null ? "" : data.tel);
        	
        	$("#tab9").html(data.email==null ? "" : data.email);
        	$("#tab10").html(data.address==null ? "" : data.address);
        	
        	$("#tab11").html(data.location==null ? "" : data.location);
        	$("#tab12").html(data.subjectTerms==null ? "" : data.subjectTerms);
        	
        	$("#tab13").html(data["abstract"]==null ? "" : data["abstract"]);
        	
        	$("#tab14").html(data.instructions==null ? "" : data.instructions);
        	//数据生产
        	$("#tab15").html(data.produce_name==null ? "" : data.produce_name);
        	$("#tab16").html(data.produce_people==null ? "" : data.produce_people);
        	$("#tab17").html(data.produce_tel==null ? "" : data.produce_tel);
        	$("#tab18").html(data.produce_email==null ? "" : data.produce_email);
        	$("#tab19").html(data.produce_address==null ? "" : data.produce_address);
        	//数据入库
        	$("#tab20").html(data.todatabase_name==null ? "" : data.todatabase_name);
        	$("#tab21").html(data.todatabase_people==null ? "" : data.todatabase_people);
        	$("#tab22").html(data.todatabase_tel==null ? "" : data.todatabase_tel);
        	$("#tab23").html(data.todatabase_email==null ? "" : data.todatabase_email);
        	$("#tab24").html(data.todatabase_address==null ? "" : data.todatabase_address);
        	
        	//判断文字显示是否超过一行，如果超过文字自左向右显示
        	extra()
	}
})

//折线图

Update()
function Update(){
	ajaxPost("/seimp/mobile/getStatisDataByUpdateTime", {
		statisColumn: statis1,
		statisTable: statis2,
		statisColumnType: statis3
    }).done(function (result) {
    	console.log(result)
        if(result.status == 0){
        	getOptionParameter(result.data);
        	console.log(result.data)
        }else{
        	$("#updata_chart").html("暂无数据");
        	$("#updata_chart").addClass("blank")
        }
    });
}
//生成统计图option的参数
function getOptionParameter(data){
	var xAxisData = [];
	var seriesData = [];
	
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		if(currItem.UPDATETIME1 && currItem.COUNT){
			xAxisData.push(currItem.UPDATETIME1);
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
           },
           {
               type: 'inside',
               realtime: true,
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
	        data: xAxisData,
	        name : '时间'
	    },
	    yAxis: {
	        type: 'value',
	        name : "数据量/条"
	    },
	    series: [
	        {
	            name:'',
	            type:'line',
	            stack: '总量',
	            data:seriesData
	        }
	    ]
	};
	var myChart = echarts.init(document.getElementById('updata_chart'));
	myChart.setOption(option);
	
}


function  extra(){
	for(var i=1;i<24;i++){
		if($('#tab'+i+'').height()>17){
			$('#tab'+i+'').css("textAlign","left")
		}		
	}
	
}