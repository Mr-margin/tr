// 一屏幕显示
var CH = document.documentElement.clientHeight;
$('.new_list').css("minHeight",(CH -176)+ 'px');
/*新闻类型*/
$('.li-news').addClass('bottom-color').siblings().removeClass('bottom-color');
var newsType;
var searchType;
var request = GetRequest();
newsType = request["type"];
searchType = request["searchType"];
var myChart,myChart2,myChart3,myChart4;
if (newsType != undefined) {
    $(".right_hot").show();
    getNews();
    getLastestNews();
    getTopHitsNews();
} else if (searchType == 2) {
    var keyword = request["keyword"];
    var newsType = request["newsType"];
    var ministryType = request["ministryType"];
    getNewsByKeyword(keyword, newsType, ministryType);
} else if (searchType == 4) {
    var keyword = request["keyword"];
    getNewsByKeyword(keyword, "", "");
} else if (searchType == 1) {
    getNewsByMinistry();
} else if (searchType == 3) {
    getNewsByCity();
}

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

function getKewword() {
    try {
        ajaxPost("/seimp/news/getTopKeywords", {
            pageSize: 20,
            newsType: newsType,
            ministryType: ""
        }).done(function (data) {
            if (data.status == 0) {
                var html = "";
                if (data.data.length > 0) {
                    for (var i = 0; i < data.data.length; i++) {
                        var item = data.data[i];
                        html += "<a onclick='getNewsByKeyword(\"" + item.name + "\",\"\",\"\")'>" + item.name + "</a>";
                    }
                } else {
                    html += "<a>暂无关键词</a>";
                }
                $("#tags").html(html);
                var i, et = document.getElementById('tags').childNodes;
                for (i in et) {
                    et[i].nodeName == 'A' && et[i].addEventListener('click', function (e) {
                        e.preventDefault();
                    });
                }
                TagCanvas.Start('myCanvas', 'tags', {
                    textColour: '#222',
                    outlineColour: '#fff',
                    reverse: true,
                    depth: 0.8,
                    dragControl: true,
                    decel: 0.95,
                    maxSpeed: 0.05,
                    initial: [-0.2, 0]
                });
            }
        });
    } catch (err) {
    }
}
/*获取资讯列表*/
function getNews() {
    $(".p1").show();
    $(".type2").hide();
    $(".keywords").hide();
    $(".pic").hide();
    if (newsType == 3) {
        changeBread([{title: '资讯动态', link: "#news"}, {title: '其他资讯'}]);
        $(".keywords").show();
        getKewword();
    } else if (newsType == 1) {
        changeBread([{title: '资讯动态', link: "#news"}, {title: '部委动态'}])
        $(".keywords").show();
        getKewword();
    } else if (newsType == 2) {
        changeBread([{title: '资讯动态', link: "#news"}, {title: '地方动态'}]);
        $(".type2").show();
        getTopPro();
    } else if (newsType == 0) {
        changeBread([{title: '资讯动态', link: "#news"}, {title: '资讯统计'}]);
        $(".p1").hide();
        $(".pic").show();
        getPics();
        return;
    }
    ajaxPost("/seimp/news/getNewsList1", {type: newsType, pageNumber: 1, pageSize: 13}).done(function (res) {
            var html = "";
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
                html += "<li class='col-xs-12 no-padding news-li '>";
                html += "<a href=\"#newDetails?type=" + newsType + "&id=" + tem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' style='line-height: 48px' title=" + tem.title + ">" + tem.title + "</span>"
                if (tem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt'  style='line-height: 48px'>" + tem.writeDate + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#newsList").html(html);

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
                    ajaxPost("/seimp/news/getNewsList1", {
                        type: newsType,
                        pageNumber: page,
                        pageSize: 13
                    }).done(function (res) {
                            $("#newsList").html("");
                            var html = "";
                            for (var i = 0; i < res.rows.length; i++) {
                                var tem = res.rows[i];
                                html += "<li class='col-xs-12 no-padding news-li '>";
                                html += "<a href=\"#newDetails?type=" + newsType + "&id=" + tem.id + "\">";
                                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                                html += "<span class='lt  newsListTitle' style='line-height: 48px' title=" + tem.title + ">" + tem.title + "</span>"
                                if (tem.top == '0') {
                                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                                }
                                html += "<span class='rt'  style='line-height: 48px'>" + tem.writeDate + "</span></a></li>";
                            }
                            $("#newsList").html(html);
                        }
                    );
                },
            };
            $('#example').bootstrapPaginator(options);
        }
    );
}
/*地方统计*/
function getCityRank() {
    /*var time1 = $("#date3").val();
    var time2 = $("#date4").val();
    if (time1 > time2) {
        return toastr.info("起始时间不能大于截止时间");
    }*/
	var xzhouName = "市名";
    var time1 = $("#date3").val();
    var time2 = $("#date4").val();
    if(time1 && time2 && time1!="" && time2!=""){
    	var timeDate1 = new Date(time1);
    	var timeDate2 = new Date(time2);
    	if (timeDate1 > timeDate2) {
        	return toastr.info("起始时间不能大于截止时间");
    	}
    }
    
    var region = "";
    if (!$("#city").val() == "") {
        region = $("#city").val();
    } else if (!$("#pro").val() == "") {
        region = $("#pro").val();
    }
    if(""==$("#pro").val()){
    	xzhouName = "省名";
    }

    var keyword = $("#keyword1").val();
    ajaxPost("/seimp/news/getCityRank", {
        code: region,
        startTime: time1,
        endTime: time2,
        keyword: keyword
    }).done(function (data) {
        if (myChart3 != null && myChart3 != "" && myChart3 != undefined) {
            myChart3.dispose();
        }
        myChart3 = echarts.init(document.getElementById('chart3'));
        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params){                                                                                                                       
		            var result = params[0].name + '<br>'                                                                                                            
		                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		                +params[0].seriesName + ': ' + params[0].value + '(条)';                                                                                             
		            return result;                                                                                                                                  
		        }
            },
            grid: {
                left: '3%',
                right: '6%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    name : xzhouName,
                    data: data.data.names,
                    axisLabel: {
                        interval: 0,
                        formatter: function (val) {
                            return val.split("").join("\n");
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '资讯量(条)'
                }
            ],
            series: [
                {
                    name: '资讯量',
                    type: 'bar',
                    barWidth: '60%',
                    barMaxWidth: 80,//最大宽度
                    data: data.data.values
                }
            ]
        };
        myChart3.setOption(option);
        myChart3.on('click', function (params) {
            var url = "#newList?searchType=3&city=" + params.name + "&startTime=" + $("#date3").val() + "&endTime=" + $("#date4").val() + "&keyword=" + $("#keyword1").val();
            window.location.href = url;
        });
    });
}
/*部委统计*/
function getMinistryRank() {
    var time1 = $("#dateBuwei1").val();
    var time2 = $("#dateBuwei2").val();
    if(time1 && time2 && time1!="" && time2!=""){
    	var timeDate1 = new Date(time1);
    	var timeDate2 = new Date(time2);
    	if (timeDate1 > timeDate2) {
        	return toastr.info("起始时间不能大于截止时间");
    	}
    }
    var keyword = $("#keywordBuwei").val();
    ajaxPost("/seimp/news/staNewsBybuwei1", {startTime: time1, endTime: time2, keyword: keyword}).done(function (data) {
        if (data.status == 0) {
            var names = data.data.names;
            var values = data.data.values;
            if (myChart2 != null && myChart2 != "" && myChart2 != undefined) {
                myChart2.dispose();
            }
            myChart2 = echarts.init(document.getElementById('chart1'));
            option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: function (params){                                                                                                                       
    		            var result = params[0].name + '<br>'                                                                                                            
    		                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
    		                +params[0].seriesName + ': ' + params[0].value + '(条)';                                                                                             
    		            return result;                                                                                                                                  
    		        }
                },
                grid: {
                    left: '3%',
                    right: '8%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        name : '部委名称',
                        data: names,
                        axisLabel: {
                            interval: 0,
                            rotate:-10
                        },
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '资讯量(条)'
                    }
                ],
                series: [
                    {
                        name: '资讯量',
                        type: 'bar',
                        barWidth: '60%',
                        data: values
                    }
                ]
            };
            myChart2.setOption(option);
            myChart2.on('click', function (params) {
                console.log($("#date1").val())
                var url = "#newList?searchType=1&ministry=" + params.name + "&startTime=" + $("#date1").val() + "&endTime=" + $("#date2").val() + "&keyword=" + $("#keyword").val();
                window.location.href = url;
            });
        }
    });
}
/*资讯数量统计*/
function getNewsNum() {
    /*var time1 = $("#date1").val();
    var time2 = $("#date2").val();
    if (time1 > time2) {
        return toastr.info("起始时间不能大于截止时间");
    }*/
    var time1 = $("#date1").val();
    var time2 = $("#date2").val();
    if(time1 && time2 && time1!="" && time2!=""){
    	var timeDate1 = new Date(time1);
    	var timeDate2 = new Date(time2);
    	if (timeDate1 > timeDate2) {
        	return toastr.info("起始时间不能大于截止时间");
    	}
    }
    var keyword = $("#keyword").val();
    ajaxPost("/seimp/news/staNewsByDate", {startTime: time1, endTime: time2, keyword: keyword}).done(function (data) {
        if (data.status == 0) {
            var dates = data.data.date;
            var nums = data.data.num;
            if (myChart4 != null && myChart4 != "" && myChart4 != undefined) {
            	myChart4.dispose();
            }
            myChart4 = echarts.init(document.getElementById('chart4'));
            option = {
            	    tooltip: {
            	        trigger: 'axis',
            	        position: function (pt) {
            	            return [pt[0], '10%'];
            	        },
			            formatter: function (params){                                                                                                                       
				            var result = params[0].name + '<br>'                                                                                                            
				                +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
				                +params[0].seriesName + ': ' + params[0].value + '(条)';                                                                                             
				            return result;                                                                                                                                  
				        }
            	    },
            	    toolbox: {
            	    	show:false,
            	        feature: {
            	            dataZoom: {
            	                yAxisIndex: 'none'
            	            },
            	            restore: {},
            	            saveAsImage: {}
            	        }
            	    },
            	    xAxis: {
            	        type: 'category',
            	        boundaryGap: false,
            	        name : '发布时间',
            	        data: dates
            	    },
            	    yAxis: {
            	        type: 'value',
            	        boundaryGap: [0, '100%'],
            	        name : '资讯量(条)',
            	    },
                    grid: {
                        left: '3%',
                        right: '8%',
                        bottom: '3%',
                        containLabel: true
                    },
            	    dataZoom: [{
            	        type: 'inside',
            	        start: 80,
            	        end: 100
            	    }, {
            	        start: 0,
            	        end: 10,
            	        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            	        handleSize: '80%',
            	        handleStyle: {
            	            color: '#fff',
            	            shadowBlur: 3,
            	            shadowColor: 'rgba(0, 0, 0, 0.6)',
            	            shadowOffsetX: 2,
            	            shadowOffsetY: 2
            	        }
            	    }],
            	    series: [
            	        {
            	            name:'资讯量',
            	            type:'line',
            	            smooth:true,
            	            symbol: 'none',
            	            sampling: 'average',
            	            itemStyle: {
            	                normal: {
            	                    color: 'rgb(255, 70, 131)'
            	                }
            	            },
            	            areaStyle: {
            	                normal: {
            	                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            	                        offset: 0,
            	                        color: 'rgb(255, 158, 68)'
            	                    }, {
            	                        offset: 1,
            	                        color: 'rgb(255, 70, 131)'
            	                    }])
            	                }
            	            },
            	            data: nums
            	        }
            	    ]
            	};
            myChart4.setOption(option);
        }
    });
}
var newsTypes = {1: "部委动态", 2: "地方动态", 3: "其他资讯"};
/*改变资讯类型*/
function changeNewsType() {
    var type = $("#type").val();
    if (type == 1) {
        $("#buwei").show();
        ajaxPost("/seimp/news/getMinistry", {}).done(function (data) {
            if (data.status == 0) {
                var html = "";
                var ministries = {};
                html += "<option value=''>全部</option>";
                for (var i = 0; i < data.data.length; i++) {
                    var item = data.data[i];
                    ministries[item.id] = item.name;
                    html += "<option value='" + item.id + "'>" + item.name + "</option>";
                }
                storage["ministries"] = JSON.stringify(ministries);
                $("#ministry").html(html);
                getKeywordPie();
            }
        });
    } else {
        $("#buwei").hide();
        getKeywordPie();
    }
}
/*关键词统计*/
function getKeywordPie() {
    var type = $("#type").val();
    var ministryType = "";
    if (type == 1) {
        ministryType = $("#ministry").val();
    }
    ajaxPost("/seimp/news/getTopKeywords1", {
        pageSize: 10,
        newsType: type,
        ministryType: ministryType
    }).done(function (data) {
        if (data.status == 0) {
            option = {
                tooltip: {
                    trigger: 'item',
//                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                    formatter: function (params){                                                                                                                       
        	            var result = params.seriesName + '<br>'                                                                                                            
        	                + params.marker
        	                +params.name + ': ' + params.value + "(条)(" + params.percent + "%)";                                                                                             
        	            return result;                                                                                                                                  
        	        }
                },
                series: [
                    {
                    	 name: '关键词统计',
	                        type: 'pie',
	                        radius: '46%',
	                        center: ['50%', '45%'],
	                       
	                        data: data.data,
	                        roseType : 'radius',
	                        itemStyle: {
	                            emphasis: {
	                                shadowBlur: 10,
	                                shadowOffsetX: 0,
	                                shadowColor: 'rgba(0, 0, 0, 0.5)'
	                            }
	                        }
                        /*name: '关键词统计',
                        type: 'pie',
                        radius: [30, 120],
                        roseType: 'radius',
                        center: ['50%', '50%'],
                        data: data.data,
                        roseType: 'radius',
                        itemStyle: {
                            normal: {
                                label: {
                                    show: true,
                                },
                                labelLine: {
                                    show: true,
                                    length: 0.001,
                                    length2: 0.001,

                                }
                            }
                        },
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: function (idx) {
                            return Math.random() * 200;
                        }*/
                    }
                ]
            };
        } if (myChart != null && myChart != "" && myChart != undefined) {
            myChart.dispose();
        }
        var myChart = echarts.init(document.getElementById('chart2'));
        myChart.setOption(option);
        myChart.on('click', function (params) {
            var ministry = "";
            if ($("#ministry").val() != undefined && $("#ministry").val() != null) {
                ministry = $("#ministry").val();
            }
            var url = "#newList?searchType=2&keyword=" + params.name + "&newsType=" + $("#type").val() + "&ministryType=" + ministryType;
            window.location.href = url;
        });
        $("#wordsTable").html("");
        var html="";
        for (var i = 0; i < data.data.length; i++) {
            html+="<tr><td>"+data.data[i].name+"</td><td>"+data.data[i].value+"</td></tr>";
        }
        $("#wordsTable").html(html);
    });
}
/*获取*/
function getPics() {
    ajaxPost("/seimp/pic/getRegion", {regionCode: 0}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            html += "<option value=''>全部</option>";
            for (var i = 0; i < data.data.length; i++) {
                var item = data.data[i];
                html += "<option value='" + item.code + "'>" + item.name + "</option>";
            }
            $("#pro").html(html);
            getCityRank();
        }
    });
    getKeywordPie();
    //getMinistryRank();
    getNewsNum();
}
/*改变省份*/
function changePro() {
    var pro = $("#pro").val();
    if (!pro == "") {
        ajaxPost("/seimp/pic/getRegion", {regionCode: pro}).done(function (data) {
            if (data.status == 0) {
                var html = "";
                html += "<option value=''>全部</option>";
                for (var i = 0; i < data.data.length; i++) {
                    var item = data.data[i];
                    html += "<option value='" + item.code + "'>" + item.name + "</option>";
                }
                $("#city").html(html);
            }
        });
    } else {
        $("#city").html("");
    }
    getCityRank();
}
/*关键词搜索资讯列表*/
function getNewsByKeyword(keyword, newsType, ministryType) {
    var title = '[';
    if (newsType != "") {
        title += newsTypes[newsType] + "-";
        if (ministryType != "") {
            var ministries = JSON.parse(storage.getItem("ministries"))
            title += ministries[ministryType] + "-";
        }
    }
    title += "关键词：" + keyword + ']资讯列表';
    $(".right_hot").hide();
    $(".newsTable").removeClass('col-xs-9');
    $(".newsTable").addClass('col-xs-12');
    changeBread([{title: '资讯动态', link: "#news"}, {title: title}]);
    ajaxPost("/seimp/news/getNewsByKey", {
        keyword: keyword,
        newsType: newsType,
        ministryType: ministryType,
        pageNumber: 1,
        pageSize: 13
    }).done(function (res) {
            var html = "";
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
                html += "<li class='col-xs-12 no-padding news-li '>";
                html += "<a href=\"#newDetails?type=" + tem.type + "&id=" + tem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' style='line-height: 48px' title=" + tem.title + ">" + tem.title + "</span>"
                if (tem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt'  style='line-height: 48px'>" + tem.writeDate + "</span></a></li>";
            }
            $("#newsList").html(html);
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
                        keyword: keyword, newsType: newsType, ministryType: ministryType,
                        pageNumber: page,
                        pageSize: 13
                    }).done(function (res) {
                            $("#newsList").html("");
                            var html = "";
                            for (var i = 0; i < res.rows.length; i++) {
                                var tem = res.rows[i];
                                html += "<li class='col-xs-12 no-padding news-li '>";
                                html += "<a href=\"#newDetails?type=" + newsType + "&id=" + tem.id + "\">";
                                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                                html += "<span class='lt  newsListTitle' style='line-height: 48px' title=" + tem.title + ">" + tem.title + "</span>"
                                if (tem.top == '0') {
                                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                                }
                                html += "<span class='rt'  style='line-height: 48px'>" + tem.writeDate + "</span></a></li>";
                            }
                            $("#newsList").html(html);
                        }
                    );
                },
            };
            $('#example').bootstrapPaginator(options);
        }
    );
}
/*关键词搜索资讯列表*/
function getNewsByMinistry() {
    var ministry = request["ministry"];
    var startTime = request["startTime"];
    var endTime = request["endTime"];
    var keyword = request["keyword"];
    $(".right_hot").hide();
    $(".newsTable").removeClass('col-xs-9');
    $(".newsTable").addClass('col-xs-12');
    var title = '[' + ministry;
    if (startTime != "") {
        title += "-" + startTime;
        if (endTime != "") {
            title += "至" + endTime
        } else {
            title += "之后";
        }
    } else if (endTime != "") {
        title += "-" + endTime + "之前";
    }
    if (keyword != "") {
        title += "-关键词：" + keyword;
    }
    title += ']资讯列表';
    changeBread([{title: '资讯动态', link: "#news"}, {title: title}]);
    ajaxPost("/seimp/news/getNewsByMinis", {
        ministry: ministry,
        startTime: startTime,
        endTime: endTime,
        keyword: keyword,
        pageNumber: 1,
        pageSize: 13
    }).done(function (res) {
            var html = "";
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
                html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?id=" + tem.id + "&type=" + tem.type + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                    "<p class=\"pull-left newsListTitle\" title='" + tem.title + "'>" + tem.title;
                if (tem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top' height='30px'>";
                }
                html += "</p><small class=\"pull-right\">[" + tem.writeDate + "]</small></a></li>";
            }
            $("#newsList").html(html);
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
                    ajaxPost("/seimp/news/getNewsByMinis", {
                        ministry: ministry,
                        startTime: startTime,
                        endTime: endTime,
                        keyword: keyword,
                        pageNumber: page,
                        pageSize: 13
                    }).done(function (res) {
                            $("#newsList").html("");
                            var html = "";
                            for (var i = 0; i < res.rows.length; i++) {
                                var tem = res.rows[i];
                                html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?id=" + tem.id + "&type=" + tem.type + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                                    "<p class=\"pull-left newsListTitle\" title='" + tem.title + "'>" + tem.title;
                                if (tem.top == '0') {
                                    html += "<img src='img/new_top.png' class='img-responsive new_top' height='30px'>";
                                }
                                html += "</p><small class=\"pull-right\">[" + tem.writeDate + "]</small></a></li>";
                            }
                            $("#newsList").html(html);
                        }
                    );
                },
            };
            $('#example').bootstrapPaginator(options);
        }
    );
}
/*根据城市查询资讯*/
function getNewsByCity() {
    var city = request["city"];
    var startTime = request["startTime"];
    var endTime = request["endTime"];
    var keyword = request["keyword"];
    $(".right_hot").hide();
    $(".newsTable").removeClass('col-xs-9');
    $(".newsTable").addClass('col-xs-12');
    var title = '[' + city;
    if (startTime != "") {
        title += "-" + startTime;
        if (endTime != "") {
            title += "至" + endTime
        } else {
            title += "之后";
        }
    } else if (endTime != "") {
        title += "-" + endTime + "之前";
    }
    if (keyword != "") {
        title += "-关键词：" + keyword;
    }
    title += ']资讯列表';
    changeBread([{title: '资讯动态', link: "#news"}, {title: title}]);
    ajaxPost("/seimp/news/getNewsByCity", {
        city: city,
        startTime: startTime,
        endTime: endTime,
        keyword: keyword,
        pageNumber: 1,
        pageSize: 13
    }).done(function (res) {
            var html = "";
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
                html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?id=" + tem.id + "&type=" + tem.type + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                    "<p class=\"pull-left newsListTitle\" title='" + tem.title + "'>" + tem.title;
                if (tem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top' height='30px'>";
                }
                html += "</p><small class=\"pull-right\">[" + tem.writeDate + "]</small></a></li>";
            }
            $("#newsList").html(html);
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
                    ajaxPost("/seimp/news/getNewsByCity", {
                        city: city,
                        startTime: startTime,
                        endTime: endTime,
                        keyword: keyword,
                        pageNumber: page,
                        pageSize: 13
                    }).done(function (res) {
                            $("#newsList").html("");
                            var html = "";
                            for (var i = 0; i < res.rows.length; i++) {
                                var tem = res.rows[i];
                                html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?id=" + tem.id + "&type=" + tem.type + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                                    "<p class=\"pull-left newsListTitle\" title='" + tem.title + "'>" + tem.title;
                                if (tem.top == '0') {
                                    html += "<img src='img/new_top.png' class='img-responsive new_top' height='30px'>";
                                }
                                html += "</p><small class=\"pull-right\">[" + tem.writeDate + "]</small></a></li>";
                            }
                            $("#newsList").html(html);
                        }
                    );
                },
            };
            $('#example').bootstrapPaginator(options);
        }
    );
}
//var rankColors = ["text-red", "text-orange", "text-yellow"];
/*获取最新资讯*/
function getLastestNews() {
    ajaxPost("/seimp/news/getNewsList1", {type: newsType, pageNumber: 1, pageSize: 5}).done(function (res) {
            $("#latestNews").html("");
            var html = "";
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
                html += " <li><a class=\"col-xs-12\" href=\"#newDetails?id=" + tem.id + "&type=" + newsType + "\"> " +
                    "<p class=\"pull-left newsListTitle\" title='" + tem.title + "'><i >" + (i + 1) + "、</i>" + tem.title + "</p><small class=\"pull-right\">[" + tem.writeDate + "]</small></a></li>";
            }
            $("#latestNews").html(html);
        }
    );
}
/*获取最高点击资讯*/
function getTopHitsNews() {
    ajaxPost("/seimp/news/getTopHitsNews", {type: newsType, pageNumber: 1, pageSize: 5}).done(function (res) {
        $("#topHitsNews").html("");
        var html = "";
        for (var i = 0; i < res.data.length; i++) {
            var tem = res.data[i];
            html += " <li><a class=\"col-xs-12\" href=\"#newDetails?id=" + tem.id + "&type=" + newsType + "\"> " +
                "<p class=\"pull-left newsListTitle\" title='" + tem.title + "'><i >" + (i + 1) + "、</i>" + tem.title.substring(0, 13) + "..." + "</p><small class=\"pull-right\">[访问量：" + tem.number + "]</small></a></li>";
        }
        $("#topHitsNews").html(html);
    });
}

/**/
function getTopPro() {
    ajaxPost("/seimp/news/getTopPro", {}).done(function (res) {
        $("#proRankNews").html("");
        var html = "";
        for (var i = 0; i < res.data.length; i++) {
            var tem = res.data[i];
            html += " <li><a class=\"col-xs-12\" href=\"#newList?searchType=3&city=" + tem.name + "&startTime=&endTime=&keyword=\"> " +
                "<p class=\"pull-left newsListTitle\" ><i>" + (i + 1) + "、</i>" + tem.name + "</p><small class=\"pull-right\">[资讯数：" + tem.SUM + "]</small></a></li>";
        }
        $("#proRankNews").html(html);
    });
}

function showAnaPart(type) {
    if(type==1){
        $("#cityPart").hide();
        $("#buweiPart").show();
        $("#newsnumPart").hide();
        getMinistryRank();
    }else if(type == 2){
        $("#buweiPart").hide();
        $("#cityPart").show();
        $("#newsnumPart").hide();
        getCityRank();
    }else if(type == 3){
        $("#buweiPart").hide();
        $("#cityPart").hide();
        $("#newsnumPart").show();
        getNewsNum();
    }
}
