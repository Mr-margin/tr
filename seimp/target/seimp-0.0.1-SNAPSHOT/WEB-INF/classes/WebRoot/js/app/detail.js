// 一屏幕显示
var CH = document.documentElement.clientHeight;
$('.detail').height((CH - 176) + 'px');

// 新闻切换
$('.detail-left ul li').click(function () {
    var liIndex = $(this).index();
    $('.detail-right>.detail-news').eq(liIndex).show().siblings().hide();
    $(this).addClass('move-detail').siblings('li').removeClass('move-detail');
    if(liIndex==4){
        liIndex++;
    }else if(liIndex==5){
        liIndex++;
    }
    getNews(liIndex + 4);
});
var newsType;
var request = GetRequest();
newsType = request["type"];
if(newsType<9){
    $('.detail-right>.detail-news').eq(newsType - 4).show().siblings().hide();
}else{
    $('.detail-right>.detail-news').eq(newsType - 5).show().siblings().hide();
}
$(".c" + newsType).addClass('move-detail').siblings('li').removeClass('move-detail');
getNews(newsType);
$(function () {

})

function getNews(flag) {
    var part;
    var tableID;
    if (flag == 4) {
        part = "example1";
        tableID = "newsList1";
    } else if (flag == 5) {
        part = "example2";
        tableID = "newsList2";
    } else if (flag == 6) {
        part = "example3";
        tableID = "newsList3";
    } else if (flag == 7) {
        part = "example4";
        tableID = "newsList4";
    }else if (flag == 9) {
        part = "example9";
        tableID = "newsList9";
    }else if (flag == 10) {
        part = "example10";
        tableID = "newsList10";
    }
    ajaxPost("/seimp/news/getNewsList1", {type: flag, pageNumber: 1, pageSize: 12}).done(function (res) {
            var html = "";
            for (var i = 0; i < res.rows.length; i++) {
                var tem = res.rows[i];
               if(flag==9){
                   /*if(tem.url==""){
                       html += " <li><a class=\"no-padding\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                           "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
                   }else{
                       html += " <li><a class=\"no-padding\" href=\"" + tem.url + "\" target='_blank'><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                           "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
                   }*/
            	   html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?type=" + flag + "&id=" + tem.id + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                   "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
               }else{
                   html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?type=" + flag + "&id=" + tem.id + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                       "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
               }
                if (tem.top == '0') {
                    html += "<img src='img/new_top.png' class='img-responsive new_top' height='30px'>";
                }
                html += "<small class=\"pull-right\">" + tem.writeDate + "</small></a></li>";
            }
            $("#" + tableID).html(html);
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
                    ajaxPost("/seimp/news/getNewsList1", {type: flag, pageNumber: page, pageSize: 12}).done(function (res) {
                            $("#newsList").html("");
                            var html = "";
                            for (var i = 0; i < res.rows.length; i++) {
                                var tem = res.rows[i];
                                if(flag==9){
                                    if(tem.url==""){
                                        html += " <li><a class=\"no-padding\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                                            "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
                                    }else{
                                        html += " <li><a class=\"no-padding\" href=\"" + tem.url + "\" target='_blank'><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                                            "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
                                    }
                                }else{
                                    html += " <li><a class=\"col-xs-12 no-padding\" href=\"#newDetails?type=" + flag + "&id=" + tem.id + "\"><img src=\"img/news/news-cell.png\" alt='' class=\"lt\"> " +
                                        "<p class='pull-left newsListTitle' title='" + tem.title + "'>" + tem.title + "</p>";
                                }
                                if (tem.top == '0') {
                                    html += "<img src='img/new_top.png' class='img-responsive new_top' height='30px'>";
                                }
                                html += "<small class=\"pull-right\">" + tem.writeDate + "</small></a></li>";
                            }
                            $("#" + tableID).html(html);
                        }
                    );
                },

            };
            $('#' + part + '').bootstrapPaginator(options);
        }
    );
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
