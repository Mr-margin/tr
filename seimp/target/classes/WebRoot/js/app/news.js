$('.li-news').addClass('bottom-color').siblings().removeClass('bottom-color');
$('.map-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');

		$(".imgs1").attr("src","img/news/news-line2.png")
		$(".imgs2").attr("src","img/news/news-line.png")
		$(".imgs3").attr("src","img/news/news-line.png")
		$(".imgs1").removeClass("Active3");
		$(".imgs2").removeClass("Active3");
		$(".imgs3").removeClass("Active3");
		$(".imgs1").removeClass("Active2");
		$(".imgs2").removeClass("Active2");
		$(".imgs3").removeClass("Active2");
    $('.map-contain').show();
    $('.bw2').hide();
    $('.bw3').hide();
    $("#tab1").html("<a href=\"#newList?type=1\"> 更多</a>");
});

$('.table-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
		$(".imgs2").attr("src","img/news/news-line2.png")
		$(".imgs1").attr("src","img/news/news-line.png")
		$(".imgs3").attr("src","img/news/news-line.png")
		$(".imgs1").addClass("Active2");
		$(".imgs2").addClass("Active2");
		$(".imgs3").addClass("Active2");
		$(".imgs1").removeClass("Active3");
		$(".imgs2").removeClass("Active3");
		$(".imgs3").removeClass("Active3");
    $('.table-contain').show();
    $('.bw1').hide();
    $('.bw3').hide();
    $("#tab1").html("<a href=\"#newList?type=2\">更多</a>");
});
$('.other-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
	$(".imgs3").attr("src","img/news/news-line2.png")
		$(".imgs2").attr("src","img/news/news-line.png")
		$(".imgs1").attr("src","img/news/news-line.png")
		$(".imgs1").addClass("Active3");
		$(".imgs2").addClass("Active3");
		$(".imgs3").addClass("Active3");
		$(".imgs1").removeClass("Active2");
		$(".imgs2").removeClass("Active2");
		$(".imgs3").removeClass("Active2");
    $('.other-contain').show();
    $('.bw1').hide();
    $('.bw2').hide();
    $("#tab1").html("<a href=\"#newList?type=3\">更多</a>");

});

$('.word-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.bw4').show();
    $('.bw5').hide();
    $('.bw6').hide();
    $("#tab4").html("<a ></a>");
});

$('.city-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.bw5').show();
    $('.bw4').hide();
    $('.bw6').hide();
    $("#tab4").html("<a ></a>");
});
$('.visit-area').click(function () {
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.bw6').show();
    $('.bw4').hide();
    $('.bw5').hide();
    $("#tab4").html("<a ></a>");

});


// 初始化轮播
$('#index-slide').carousel({
    interval: 2500
})

//加载部委动态和地方动态--by：罗文斌
$(function () {

})
getNews1();
function getNews1() {
    var datas = {type: "1", pageNumber: 0, pageSize: 10};
    ajaxPost("/seimp/news/getNews", datas).done(function (data) {
        if (data.status == 0) {
        	console.log(data)
            var html = "";
            for (var i = 0; i < data.data.length-5; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li  col-lg-12  col-md-12  col-sm-12 '>";
                html += "<a href=\"#newDetails?type=1&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#buwei1").html(html);
            
            var html1 = "";
            for (var i = 5; i < data.data.length; i++) {
                var newItem = data.data[i];
                html1 += "<li class='news-li  col-lg-12  col-md-12  col-sm-12 '>";
                html1 += "<a href=\"#newDetails?type=1&id=" + newItem.id + "\">";
                html1 += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html1 += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html1 += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html1 += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html1 += "</a>";
                html1 += "</li>";
            }
            $("#buwei2").html(html1);
        }
    });
    var datas1 = {type: "2", pageNumber: 0, pageSize: 10};
    ajaxPost("/seimp/news/getNews", datas1).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length-5; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li  col-lg-12  col-md-12  col-sm-12'>";
                html += "<a href=\"#newDetails?type=2&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#difang1").append(html);
            
            var html1 = "";
            for (var i = 5; i < data.data.length; i++) {
                var newItem = data.data[i];
                html1 += "<li class='news-li  col-lg-12  col-md-12  col-sm-12'>";
                html1 += "<a href=\"#newDetails?type=2&id=" + newItem.id + "\">";
                html1 += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html1 += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html1 += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html1 += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html1 += "</a>";
                html1 += "</li>";
            }
            $("#difang2").append(html1);
        }
    });
    var datas1 = {type: "3", pageNumber: 0, pageSize: 10};
    ajaxPost("/seimp/news/getNews", datas1).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length-5; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li   col-lg-12  col-md-12  col-sm-12'>";
                html += "<a href=\"#newDetails?type=3&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#other1").html(html);
            
            var html1 = "";
            for (var i = 5; i < data.data.length; i++) {
                var newItem = data.data[i];
                html1 += "<li class='news-li   col-lg-12  col-md-12  col-sm-12'>";
                html1 += "<a href=\"#newDetails?type=3&id=" + newItem.id + "\">";
                html1 += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html1 += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html1 += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html1 += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html1 += "</a>";
                html1 += "</li>";
            }
            $("#other2").html(html1);
        }
    });
    var datas4 = {type: "4", pageNumber: 0, pageSize: 7};
    ajaxPost("/seimp/news/getNews", datas4).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newDetails?type=4&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>"
                html += "</a>";
                html += "</li>";
            }
            $("#part1").html(html);
        }
    });
    var datas5 = {type: "5", pageNumber: 0, pageSize: 7};
    ajaxPost("/seimp/news/getNews", datas5).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newDetails?type=5&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#part2").html(html);
        }
    });
    var datas6 = {type: "6", pageNumber: 0, pageSize: 7};
    ajaxPost("/seimp/news/getNews", datas6).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newDetails?type=6&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#part3").html(html);
        }
    });
    var datas7 = {type: "7", pageNumber: 0, pageSize: 7};
    ajaxPost("/seimp/news/getNews", datas7).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newDetails?type=7&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#part4").html(html);
        }
    });
    var datas9 = {type: "9", pageNumber: 0, pageSize: 7};
    ajaxPost("/seimp/news/getNews", datas9).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li '>";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                /*if (newItem.url != "") {
                    html += "<a href=\"" + newItem.url + "\" target='_blank'>";
                    
                } else {
                    html += "<a >";
                }*/
                html += "<a href=\"#newDetails?type=9&id=" + newItem.id + "\">";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "</a>";
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</li>";
            }
            $("#part9").html(html);
        }
    });

    var datas10 = {type: "10", pageNumber: 0, pageSize: 7};
    ajaxPost("/seimp/news/getNews", datas10).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var newItem = data.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newDetails?type=10&id=" + newItem.id + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title=" + newItem.title + ">" + newItem.title + "</span>"
                if (newItem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top pull-left' height='30px'>";
                }
                html += "<span class='rt' >" + getMyDate(newItem.writeDate) + "</span>";
                html += "</a>";
                html += "</li>";
            }
            $("#part10").html(html);
        }
    });
    getNewsSta();
    getKewword();
  //  getTopKeywords();
    getTopPro();
    getTopHitsNews();
}
/*获取资讯统计*/
function getNewsSta() {
    ajaxPost("/seimp/news/staNewsBybuwei1", {startTime: "", endTime: "", keyword: ""}).done(function (data) {
        var myChart = echarts.init(document.getElementById('mychart1'));
        var option = {
            color: ['#3398DB'],
            title: {
                text: '部委资讯统计',
                subtext: '',
                x: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params){                                                                                                                       
                    var result = params[0].name + '<br>'                                                                                                            
                        +'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
                        +params[0].seriesName + ': ' + params[0].value + "(条)";                                                                                             
                    return result;                                                                                                                                  
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
                    name : '数据量(条)'
                }
            ],
            series: [
                {
                    name: '数据量',
                    type: 'bar',
                    barWidth: '60%',
                    data: data.data.values
                }
            ]
        };
        myChart.setOption(option);
        myChart.on('click', function (params) {
            window.location.href = "#newList?searchType=1&ministry=" + params.name + "&startTime=&endTime=&keyword=";
        });
    });
    ajaxPost("/seimp/news/getTopKeywords1", {pageSize: 10, newsType: "", ministryType: ""}).done(function (data) {
        if (data.status == 0) {
            var option = {
                title: {
                    text: '关键词统计',
                    left: 'center',
                },
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
                        avoidLabelOverlap: true,
                        radius: [20, 60],
                        roseType: 'radius',
                        center: ['55%', '50%'],
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

                                }
                            },
                            emphasis:{
                            	labelLine: {
                                    show: true,
                                    length: 0.001,

                                }
                            }
                            
                        },
                        label:{
                            
                            normal:{
                            	formatter:function(v) {
                            			var name=v.name;
                            			if(name.length>4){
                            				return name.substring(0,4)+'\n'+name.substring(4);
                            				
                            			}else{
                            				return name
                            			}
                            		    
                            		
                                }
                            }
                        },
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        animationDelay: function (idx) {
                            return Math.random() * 200;
                        }
                    }
                ]
            };
            
        }
        var myChart2 = echarts.init(document.getElementById('mychart2'));
        myChart2.setOption(option);
        myChart2.on('click', function (params) {
            window.location.href = "#newList?searchType=2&newsType=&ministryType=&keyword=" + params.name;
        });

        
    });
};


/*转换时间格式*/
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
getImg()
function getImg() {
    var url = '/seimp/news/getPics'
    ajaxPost(url).done(function (res) {
        $.each(res.data, function (key, val) {
            if (val.pics.length > 0) {
                var dom = '';
                dom += '<div class="item" style="height:100%;width:100%;" onclick="getDetail(' + val.id + ')">'
                dom += '<img  src=' + val.pics[0].URL + ' alt="" style="width:100%;height:100%">'
                dom += '</div>'
                $('.carousel-inner').append(dom);
                var dom1 = ''
                dom1 += '<li data-target="#index-slide" data-slide-to=' + key + ' class=""></li>'
                $('.carousel-indicators').append(dom1)
            }
        })
        $('.item').eq(0).addClass('active')
        $('.carousel-indicators li').eq(0).addClass('active')
    })
}
function getDetail(id) {
    window.location.href = "#newDetails?type=8&id=" + id;
}
$('.newTop1').click(function () {
    $('.newTop1 .home_title img').attr('src', 'img/newTopR1.png')
    $('.newTop2 .home_title img').attr('src', 'img/newTopR2Black.png')
    $('.newTop3 .home_title img').attr('src', 'img/newTopR3Black.png')
})
$('.newTop2').click(function () {
    $('.newTop1 .home_title img').attr('src', 'img/newTopR1Black.png')
    $('.newTop2 .home_title img').attr('src', 'img/newTopR2.png')
    $('.newTop3 .home_title img').attr('src', 'img/newTopR3Black.png')
})
$('.newTop3').click(function () {
    $('.newTop1 .home_title img').attr('src', 'img/newTopR1Black.png')
    $('.newTop2 .home_title img').attr('src', 'img/newTopR2Black.png')
    $('.newTop3 .home_title img').attr('src', 'img/newTopR3.png')
})

$('.newTop4').click(function () {
    $('.newTop4 img').attr('src', 'img/newTopR1.png')
    $('.newTop5 img').attr('src', 'img/newTopR2Black.png')
    $('.newTop6 img').attr('src', 'img/newTopR3Black.png')
})
$('.newTop5').click(function () {
    $('.newTop4 img').attr('src', 'img/newTopR1Black.png')
    $('.newTop5 img').attr('src', 'img/newTopR2.png')
    $('.newTop6 img').attr('src', 'img/newTopR3Black.png')
})
$('.newTop6').click(function () {
    $('.newTop4 img').attr('src', 'img/newTopR1Black.png')
    $('.newTop5 img').attr('src', 'img/newTopR2Black.png')
    $('.newTop6 img').attr('src', 'img/newTopR3.png')
})

function getTopPro() {
    ajaxPost("/seimp/news/getTopPro", {pageSize: 7}).done(function (res) {
        if (res.status == 0) {
            $("#cityRank").html("");
            var html = "";
            for (var i = 0; i < res.data.length; i++) {
                var tem = res.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newList?searchType=3&city=" + tem.name + "&startTime=&endTime=&keyword=\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' >" + tem.name + "</span>"
                html += "<small class=\"pull-right\">[资讯数：" + tem.SUM + "]</small>";
                html += "</a>";
                html += "</li>";
            }
            $("#cityRank").html(html);
        }
    });
}

/*获取最高点击资讯*/
function getTopHitsNews() {
    ajaxPost("/seimp/news/getTopHitsNews", {type: "", pageNumber: 1, pageSize: 7}).done(function (res) {
        if (res.status == 0) {
            $("#visitRank").html("");
            var html = "";
            for (var i = 0; i < res.data.length; i++) {
                var tem = res.data[i];
                html += "<li class='news-li '>";
                html += "<a href=\"#newDetails?id=" + tem.id + "&type=" + tem.type + "\">";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle' title='" + tem.title + "'>" + tem.title + "</span>"
                html += "<small class=\"pull-right\">[访问量：" + tem.number + "]</small>";
                html += "</a>";
                html += "</li>";
            }
            $("#visitRank").html(html);
        }
    });
}

function getTopKeywords() {
    ajaxPost("/seimp/news/getTopKeywords", {
        pageSize: 7,
        newsType: "",
        ministryType: ""
    }).done(function (data) {
        if (data.status == 0) {
            $("#hotWord").html("");
            var html = "";
            for (var i = 0; i < data.data.length; i++) {
                var tem = data.data[i];
                html += "<li class='news-li '>";
                html += "<a >";
                html += "<img src='img/news/news-cell.png' alt='' class='lt'>";
                html += "<span class='lt  newsListTitle'>" + tem.name + "</span>"
                html += "<small class=\"pull-right\">[频次：" + tem.value + "]</small>";
                html += "</a>";
                html += "</li>";
            }
            $("#hotWord").html(html);
        }
    });
}

function getKewword() {
    try {
        ajaxPost("/seimp/news/getTopKeywords", {
            pageSize: 20,
            newsType: "",
            ministryType: ""
        }).done(function (data) {
            if (data.status == 0) {
                var html = "";
                if (data.data.length > 0) {
                    for (var i = 0; i < data.data.length; i++) {
                        var item = data.data[i];
                        html += "<a onclick='getNewsByKeyword(\"" + item.name + "\")'>" + item.name + "</a>";
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

function getNewsByKeyword(word){
    window.location.href = "#newList?searchType=4&newsType=&ministryType=&keyword=" + word;
}
