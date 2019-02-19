// 一屏幕显示
var CH = document.documentElement.clientHeight;
$('.new_list').css("minHeight",(CH -176)+ 'px');

$('.li-news').addClass('bottom-color').siblings().removeClass('bottom-color');
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

getDetail();
$(function () {
});
var newsType;
function getDetail() {
    var request = GetRequest();
    var id = request["id"];
    var type = request["type"];
    newsType=type;
    ajaxPost("/seimp/news/getNewsDetail", {newsID: id}).done(function (data) {
        if (data.status == 0) {
            var tem = data.data;
            if (type == 3) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '其他资讯',
                    link: "#newList?type=3"
                }, {title: tem.title}]);
            } else if (type == 1) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '部委动态',
                    link: "#newList?type=1"
                }, {title: tem.title}]);
            } else if (type == 2) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '地方动态',
                    link: "#newList?type=2"
                }, {title: tem.title}]);
            } else if (type == 4) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '政策法规',
                    link: "#detail?type=4"
                }, {title: tem.title}]);
            } else if (type == 5) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '标准规范',
                    link: "#detail?type=5"
                }, {title: tem.title}]);
            } else if (type == 6) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '土壤详查',
                    link: "#detail?type=6"
                }, {title: tem.title}]);
            } else if (type == 7) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '修复治理',
                    link: "#detail?type=7"
                }, {title: tem.title}]);
            } else if (type == 8) {
                changeBread([{title: '资讯动态', link: "#news"}, {title: tem.title}]);
            } else if (type == 9) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '行动计划编制',
                    link: "#detail?type=9"
                }, {title: tem.title}]);
            }else if (type == 10) {
                changeBread([{title: '资讯动态', link: "#news"}, {
                    title: '文献资料',
                    link: "#detail?type=10"
                }, {title: tem.title}]);
            }
            $("#title").html(tem.title);
            var mainInfo = "";
            if (type == 8) {
                if (tem.pics.length > 0) {
                    var html = "";
                    for (var i = 0; i < tem.pics.length; i++) {
                        var tem1 = tem.pics[i];
                        html += "<div style='text-align: center'><img  src='" + tem1.URL + "' alt=''></div>";
                    }
                    mainInfo += html;
                }
            }
            mainInfo += "  <p align='justify' id='content'>" + tem.content + "</p>";
            if (tem.files.length > 0) {
                var html = "附件：";
                for (var i = 0; i < tem.files.length; i++) {
                    var tem1 = tem.files[i];
                    if (i == 0) {
                        html += (i + 1) + ". <a oldsrc=\"W020161124342809842622.pdf\" href=\"" + tem1.URL + "\" style='text-decoration: underline;' target='_blank'>" + tem1.FILENAME + "</a>";
                    } else {
                        html += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + (i + 1) + ".<a oldsrc=\"W020161124342809842622.pdf\" href=\"" + tem1.URL +
                            "\" style='text-decoration: underline;' target='_blank'>" + tem1.FILENAME + "</a>";
                    }
                }
                mainInfo += "<p align='justify' id='files' style='padding-top: 2rem;color: gray;'>" + html + "</p>";
            }
            var str = "";
            if (tem.source != "") {
                str += "来源：" + tem.source;
            } else {
                str += "来源：暂无";
            }
            if (tem.checker != "") {
                str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;校核人：" + tem.checker;
            } else {
                str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;校核人：暂无";
            }
            if (tem.writeDate != "") {
                str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;发布时间：" + tem.writeDate;
            } else {
                str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;发布时间：暂无"
            }
//            if(newsType ==1||newsType==2||newsType==3){
            if(tem.keyword){
                if (tem.keyword != "") {
                    str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;关键词：";
                    var keyword = tem.keyword;
                    var arr = keyword.split(/[,，]/);
                    for (var j = 0; j < arr.length; j++) {
                        str += "<a type='button' class='btn btn-default btn-xs' href='#newList?searchType=4&keyword=" + arr[j] + "' style='margin-right:3px'>" + arr[j] + "</a>";
                    }
                } else {
                    str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;关键词：暂无";
                }
            }
            if (tem.url != "") {
                str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='" + tem.url + "' style='text-decoration: underline' target='_blank'>查看原文</a>";
            }
            mainInfo += "<span class='wzxq_fbt2'> <p class='' id='time' style='color:grey'>" + str + "</p></span>";
            $("#mainInfo").html(mainInfo);
        }
    });
    ajaxPost("/seimp/news/hitNews", {newsID: id});
}