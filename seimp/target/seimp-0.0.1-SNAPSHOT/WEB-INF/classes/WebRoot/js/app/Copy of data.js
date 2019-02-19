


// 面包屑　
$('.li-data').addClass('bottom-color').siblings().removeClass('bottom-color');
backDatePage();
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
/*$('.text-center li').click(function () {
 //$('.data-city').eq(1).removeClass('none').addClass('active').siblings().removeClass('active').addClass('none');
 $(".v1").hide();
 $(".data-city ").hide();
 $("#searchPart1").show();
 $(".data-basic").show();
 $("#part1").show();
 initPart1Content($(this).val());
 $('.box_crumbs .right_button').remove()
 changeBread([{title: '共享交换', link:'javascript:backPage()'}, {title: '基础背景数据'}]);
 return false;
 });*/
$('.data-one .list-con ul li').eq(1).click(function () {
    $('.data-city').eq(2).removeClass('none').addClass('active').siblings().removeClass('active').addClass('none');
});
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
// 点击左侧改变右侧高度
// $('.data-one .list-con ul li').click(function(){
//     $('.data').css({'height':'820px'});
//     $('.data-every').css({'height':'580px'});
//     $('.data-city').css({'height':'580px'});
//
// });
getCatalog();
getSta();
getRefreshSta();
function getRefreshSta() {
    var nowdate = new Date();
    $("#endDate").val(new Date().format("yyyy-MM-dd"));
    var lastMonth = new Date(nowdate - 30 * 24 * 3600 * 1000).format("yyyy-MM-dd");
    $("#startDate").val(lastMonth);
    $(".selectpicker").selectpicker({
        noneSelectedText: '请选择'//默认显示内容
    });
    ajaxPost("/seimp/share/getRefreshTable", {}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            var fir = "";
            for (var i = 0; i < data.data.length; i++) {
                var item = data.data[i];
                if (i == 0) {
                    fir = item.table_name;
                }
                html += "<option value = '" + item.table_name + "'>" + item.name + "</option>";
            }
            $("#tables").html(html);
            $('.selectpicker').selectpicker('val', fir);
            $('.selectpicker').selectpicker('refresh');
            RefreshData();
        }
    });
}
/*获取数据集更新数据*/
function RefreshData() {
    var time1 = $("#startDate").val();
    var time2 = $("#endDate").val();
    var tt = $("#tables").val();
    if (tt == null || tt == undefined || tt.length == 0) {
        return toastr.error("请选择数据集");
    }
    if (time2 != null && time2 != undefined && time2 != "" && time1 > time2) {
        return toastr.error("开始时间不能大于结束时间");
    }
    var datas = {
        startTime: time1,
        endTime: time2,
        tables: tt,
        type: $("#unit").val()
    };
    ajaxPost("/seimp/share/getRefreshData", datas).done(function (data) {
        if (data.status == 0) {
            var ser = [];
            var leg = [];
            for (var i = 0; i < data.data.values.length; i++) {
                var item = data.data.values[i];
                if (data.data.values.length == 1) {
                    ser.push({
                        name: item.name,
                        type: 'line',
                        data: item.data
                    });
                } else {
                    ser.push({
                        name: item.name,
                        type: 'bar',
                        data: item.data
                    });
                }
                leg.push(item.name);
            }
            var option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '23%',
                    containLabel: true
                }, legend: {
                    data: leg
                },
                xAxis: [
                    {
                        type: 'category',
                        data: data.data.x,
                        axisLabel: {
                            interval: 0,
                            rotate: 45
                        },
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                dataZoom: [{
                    type: 'slider',
                    show: true,
                    xAxisIndex: [0],
                    bottom: -5,
                    startValue: 0,
                    endValue: 30,
                    maxValueSpan: 30//初始化滚动条
                }],
                yAxis: [
                    {
                        type: 'value',
                        name: "新增数量"
                    }
                ],
                series: ser
            };
            // $('#mychart3').bootstrapTable('destroy');
            var myChart3 = echarts.init(document.getElementById('mychart3'));
            myChart3.clear();
            myChart3.setOption(option);
            myChart3.resize();
        }
    });
}
/*获取统计数据*/
function getSta() {
    ajaxPost("/seimp/share/getStatistic", {type: 1}).done(function (data) {
        if (data.status == 0) {
            for (var i = 0; i < data.data.length; i++) {
                var item = data.data[i];
                $("#sta" + item.TYPE).html(formatNumber(item.SUM + "") + "条");
            }
        }
    });
}
function getREYSYSex() {
    ajaxPost("/seimp/share/getREYSYSex", {}).done(function (data) {
        console.log(data.data);

        window.open(data.data);

    });
}
//土壤环境管理专家库
function getZJKex() {
    ajaxPost("/seimp/share/getZJKex", {}).done(function (data) {
        console.log(data.data);

        window.open(data.data);

    });
}
//全国土壤污染状况详查质量控制实验室名录
function getZLKZSYSex() {
    ajaxPost("/seimp/share/getZLKZSYSex", {}).done(function (data) {
        console.log(data.data);

        window.open(data.data);

    });
}
//实验室名录
function getLaboratoryex() {
    ajaxPost("/seimp/share/getLaboratoryex", {}).done(function (data) {
        console.log(data.data);

        window.open(data.data);

    });
}
/*获取资源目录*/
function getCatalog() {

    ajaxPost("/seimp/user/getDataRightByRole", {roleID: storage.roleID}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            for (var i = 0; i < data.data.dataRights.length; i++) {
                var item = data.data.dataRights[i];
                html += "<li value = " + item.id + "><span>" + item.name + "</span>";
                if (item.children != undefined) {
                    html += "<ul>";
                    for (var j = 0; j < item.children.length; j++) {
                        var child = item.children[j];
                        html += "<li value = " + child.id + ">" + child.name;
                        if (child.children != undefined) {
                            html += "<ul>"
                            for (var k = 0; k < child.children.length; k++) {
                                var third = child.children[k];
                                html += "<li value = " + third.id + ">" + third.name;
                                html += "</li>";
                            }
                            html += "</ul>";
                        }
                        html += "</li>";
                    }
                    html += "</ul>";
                }
                html += "</li>";
            }
            $("#sourceMenu").html(html);
            var html1 = "";
            for (var j = 0; j < data.data.ministries.length; j++) {
                var item1 = data.data.ministries[j];
                html1 += "<li value='" + (item1.id + 100) + "'>" + item1.name + "</li>";
            }
            $("#minitries").html(html1);
            $('.mcd-menu ul li').each(function () {
                if ($(this).children('ul').length > 0) {
                    $(this).append('<small class="pull-right"><img src="img/arrow.png" width="20px" height="20px" style="margin-right: 10px;margin-top: 18px;"></small>')
                }
            });
            $('.text-center li').click(function (e) {
                //$('.data-city').eq(1).removeClass('none').addClass('active').siblings().removeClass('active').addClass('none');
                selectDataSet($(this).val());
                //  this.preventDefault();
                //     e.stopPropagation();
                return false;
            });

            for (var key in data.data.statusmap) {
                if (data.data.statusmap[key] == "100") {
                    $(".eeyxz").removeAttr("disabled");


                }

                if (data.data.statusmap[key] == "101") {
                    $(".zjkxz").removeAttr("disabled");


                }
                if (data.data.statusmap[key] == "102") {
                    $(".zlkzsysxz").removeAttr("disabled");


                }
                if (data.data.statusmap[key] == "103") {
                    $(".sysxz").removeAttr("disabled");


                }
            }

        } else {
            toastr.error("获取数据权限失败");
        }
    });
}
function selectDataSet(par) {
    $(".v1").hide();
    $(".data-city ").hide();
    $("#searchPart1").show();
    $(".data-basic").show();
    $("#part1").show();
    initPart1Content(par);
    $('.box_crumbs .right_button').remove();
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {title: '数据集列表'}]);
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
    return false;
}
/*全局搜索*/
function gloSearch() {
    $(".v1").hide();
    $(".data-city ").hide();
    $("#searchPart1").show();
    $(".data-basic").show();
    $("#part1").show();
    $('.box_crumbs .right_button').remove();
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {title: '数据集列表'}]);
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
    var keyword = $("#keyname").val();
    ajaxPost("/seimp/share/getDatalistByName", {
        name: keyword,
        pageNumber: 1,
        pageSize: 12
    }).done(function (result) {
        var html = "";
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            var name = currItem.name;
            if (keyword != "") {
                var arr = new Array;
                var len = keyword.length;
                var str = "<em style='color:#f17303'>" + keyword + "</em>";
                var pos = 0;
                while (name.indexOf(keyword, pos) != -1) {
                    pos = name.indexOf(keyword, pos);
                    name = (name.substring(0, pos) + name.substring(pos + len, name.length));
                    arr.push(pos);
                }
                for (var j = arr.length - 1; j >= 0; j--) {
                    name = (name.substring(0, arr[j]) + str + name.substring(arr[j], name.length));
                }
            }
            var pic = "img/data/zanwu.jpg";
            if (currItem.pic_url != undefined && currItem.pic_url != "") {
                pic = currItem.pic_url;
            }
            html += "<div class='proto-cell lt'><div class='cell-img'><img src='" + pic + "' alt='' style='width:100%;height:100%'>" +
                "</div><div class='cell-word'><p class='cell-name col-xs-12 no-padding'><span style='float:left;'>数据名称：</span><span class='item_title col-xs-7 no-padding'  title='" + currItem.name + "'>" + name + "</span></p><p><span>数据量：</span>" +
                "<span>" + currItem.serviceAccount + "</span></p><p><span>提供单位：</span><span>" + currItem.department + "</span></p><div class='col-xs-12 no-padding'><div class=''>" +
                "<a class='button_blue pull-left' href='javascript:void(0);' onclick=viewDate('" + currItem.name + "','" + currItem.id + "')>查看数据</a></div><div class=''>" +
                "<a class='button_blue pull-right' href='javascript:void(0);' onclick=viewMetadate('" + currItem.name + "','" + currItem.id + "')>查看元数据</a></div></div></div></div>";
        }
        $(".proto-list").html(html);
        if (result.page < 1) {
            //  $('#example3 li').remove();
            return;
        }
        var options = {
            bootstrapMajorVersion: 3,
            currentPage: result.page,//当前页
            totalPages: result.total,//总页数
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
                ajaxPost("/seimp/share/getDatalistByName", {
                    name: $("#keyname").val(),
                    pageNumber: page,
                    pageSize: 12
                }).done(function (result) {
                        var html = "";
                        for (var i = 0; i < result.rows.length; i++) {
                            var currItem = result.rows[i];
                            var name = currItem.name;
                            if (keyword != "") {
                                var arr = new Array;
                                var len = keyword.length;
                                var str = "<em style='color:#f17303'>" + keyword + "</em>";
                                var pos = 0;
                                while (name.indexOf(keyword, pos) != -1) {
                                    pos = name.indexOf(keyword, pos);
                                    name = (name.substring(0, pos) + name.substring(pos + len, name.length));
                                    arr.push(pos);
                                }
                                for (var j = arr.length - 1; j >= 0; j--) {
                                    name = (name.substring(0, arr[j]) + str + name.substring(arr[j], name.length));
                                }
                            }
                            var pic = "img/data/zanwu.jpg";
                            if (currItem.pic_url != undefined && currItem.pic_url != "") {
                                pic = currItem.pic_url;
                            }

                            html += "<div class='proto-cell lt'><div class='cell-img'><img src='" + pic + "' alt='' style='width:100%;height:100%'>" +
                                "</div><div class='cell-word'><p class='cell-name col-xs-12 no-padding'><span style='float:left;'>数据名称：</span><span class='item_title col-xs-7 no-padding'  title='" + currItem.name + "'>" + name + "</span></p><p><span>数据量：</span>" +
                                "<span>" + currItem.serviceAccount + "</span></p><p><span>提供单位：</span><span>" + currItem.department + "</span></p><div class='col-xs-12 no-padding'><div class=''>" +
                                "<a class='button_blue pull-left' href='javascript:void(0);' onclick=viewDate('" + currItem.name + "','" + currItem.id + "')>查看数据</a></div><div class=''>" +
                                "<a class='button_blue pull-right' href='javascript:void(0);' onclick=viewMetadate('" + currItem.name + "','" + currItem.id + "')>查看元数据</a></div></div></div></div>";
                        }
                        $(".proto-list").html(html);
                    }
                );
            },
        };
        $('#example3').bootstrapPaginator(options);
    })
}


//企业排放查询栏
function qypfc() {
    ajaxPost("/seimp/share/getQYPFC", {}).done(function (result) {
        $("#qyp1").html("");
        $("#qyp2").html("");
        $("#qyp1").append('<option value="">全部</option>');
        $("#qyp2").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.ZDYLBMCLIST.length; i++) {
            var currItem = result.data.ZDYLBMCLIST[i];
            $("#qyp1").append('<option value="' + currItem.ZDYLBMC + '">' + currItem.ZDYLBMC + '</option>');
        }
        for (var i = 0; i < result.data.NDLIST.length; i++) {
            var currItem2 = result.data.NDLIST[i];
            $("#qyp2").append('<option value="' + currItem2.SYND + '">' + currItem2.SYND + '</option>');
        }
    })
}
//专家库查询栏
function zjkc() {
    ajaxPost("/seimp/share/getZJKC", {}).done(function (result) {
        $("#zj2").html("");
        $("#zj3").html("");
        $("#zj2").append('<option value="">全部</option>');
        $("#zj3").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.department.length; i++) {
            var currItem = result.data.department[i];
            $("#zj2").append('<option value="' + currItem.department + '">' + currItem.department + '</option>');
        }
        for (var i = 0; i < result.data.field.length; i++) {
            var currItem2 = result.data.field[i];
            $("#zj3").append('<option value="' + currItem2.field + '">' + currItem2.field + '</option>');
        }
    })
}

//工业废水基本信息表查询框
function gyfsc() {
    ajaxPost("/seimp/share/getGYFSC", {}).done(function (result) {
        $("#g2").html("");
        $("#g3").html("");
        $("#g5").html("");
        $("#g2").append('<option value="">全部</option>');
        $("#g3").append('<option value="">全部</option>');
        $("#g5").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.city.length; i++) {
            var currItem = result.data.city[i];
            if (currItem.level == 0) {
                $("#g2").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
            }
        }
        for (var i = 0; i < result.data.city.length; i++) {
            var currItem = result.data.city[i];
            if (currItem.level == 1) {
                $("#g3").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
            }
        }
        for (var i = 0; i < result.data.ONE_BUSINESSNAME.length; i++) {
            var currItem2 = result.data.ONE_BUSINESSNAME[i];
            $("#g5").append('<option value="' + currItem2.ONE_BUSINESSNAME + '">' + currItem2.ONE_BUSINESSNAME + '</option>');
        }
    })
}
//接口查询
function jkcx() {
    ajaxPost("/seimp/share/getJKFWC", {}).done(function (result) {
        $(".tr_backcolor").html("");
        for (var i = 0; i < result.data.tb_interface.length; i++) {
            var currItem = result.data.tb_interface[i];
            var html = "<tr><td>" + (i + 1) + "</td><td>" + currItem.interface_name + "</td><td>" + currItem.interface_url + "</td><td>" + currItem.interface_department + "</td>";
            if (currItem.state == 0) {
                html += "<td>正常运行<span><img class='pull-right' src='img/button_play.png' height='20px' width='20px'></span></td>"
            } else {
                html += "<td>已停止<span><img class='pull-right' src='img/button_stop.png' height='20px' width='20px'></span></td>"
            }
            html += "</tr>";
            $(".tr_backcolor").append(html);
        }
    })
}
//危险废物填埋场
function wxtmc() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#wx2").html("");
        $("#wx2").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#wx2").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
        }
    })
}

//危险废物填埋场
function yghcc() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#y3").html("");
        $("#y3").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            if (currItem.level == 0) {
                $("#y3").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
            }
        }
    })
}
//污染地块
function wrdkc() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#wr2").html("");
        $("#wr2").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#wr2").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
        }
    })
}
//企业信息
function qyxxc() {
    ajaxPost("/seimp/share/getQYXXC", {}).done(function (result) {
        $("#qy2").html("");
        $("#qy3").html("");
        $("#qy4").html("");
        $("#qy2").append('<option value="">全部</option>');
        $("#qy3").append('<option value="">全部</option>');
        $("#qy4").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.FLMCLIST.length; i++) {
            var currItem = result.data.FLMCLIST[i];
            if (currItem.FLMC != "(null)") {
                $("#qy2").append('<option value="' + currItem.FLMC + '">' + currItem.FLMC + '</option>');
            }
        }
        for (var i = 0; i < result.data.LXMCLIST.length; i++) {
            var currItem = result.data.LXMCLIST[i];
            $("#qy3").append('<option value="' + currItem.LXMC + '">' + currItem.LXMC + '</option>');
        }
        for (var i = 0; i < result.data.LBMCLIST.length; i++) {
            var currItem = result.data.LBMCLIST[i];
            $("#qy4").append('<option value="' + currItem.LBMC + '">' + currItem.LBMC + '</option>');
        }
    })
}

//企业信息
function wlyqc() {
    ajaxPost("/seimp/share/getWLYQC", {}).done(function (result) {
        $("#wlyq2").html("");
        $("#wlyq2").append('<option value="">全部</option>');

        for (var i = 0; i < result.data.newsType.length; i++) {
            var currItem = result.data.newsType[i];
            $("#wlyq2").append('<option value="' + currItem.newsType + '">' + currItem.newsType + '</option>');
        }
    })
}
function qygpfzc() {
    ajaxPost("/seimp/share/getQYGPFZC", {}).done(function (result) {
        $("#gpf1").html("");
        $("#gpf2").html("");
        $("#gpf1").append('<option value="">全部</option>');
        $("#gpf2").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.TJNDLIST.length; i++) {

            var currItem = result.data.TJNDLIST[i];
            $("#gpf1").append('<option value="' + currItem.TJND + '">' + currItem.TJND + '</option>');
        }
        for (var i = 0; i < result.data.CPHYLMCLIST.length; i++) {
            var currItem = result.data.CPHYLMCLIST[i];
            if (currItem.CPHYLMC != "(null)") {
                $("#gpf2").append('<option value="' + currItem.CPHYLMC + '">' + currItem.CPHYLMC + '</option>');
            }
        }
    })
}

//企业信息（固废）查询栏
function qyxxgfc() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#qygf2").html("");
        $("#qygf2").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#qygf2").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
        }
    })
}
function zdhqc() {
    ajaxPost("/seimp/share/getZDHQS", {}).done(function (result) {
        $("#zdhq1").html("");
        $("#zdhq2").html("");
        $("#zdhq1").append('<option value="">全部</option>');
        $("#zdhq2").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.industry.length; i++) {
            var currItem = result.data.industry[i];
            $("#zdhq2").append('<option value="' + currItem.industry + '">' + currItem.industry + '</option>');
        }
        for (var i = 0; i < result.data.codes.length; i++) {
            var currItem = result.data.codes[i];
            $("#zdhq1").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
        }
    })
}
//全国土壤污染状况详查质量控制实验室名录
function zlkzsysc() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#zl2").html("");
        $("#zl2").append('<option value="">全部</option>');
        $("#zl2").append('<option value="全国">全国</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#zl2").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
    })
}

//企业信息查询(危险化学品)下拉框查询条件
function qyxxhc() {
    ajaxPost("/seimp/share/getQYXXHC1", {}).done(function (result) {
        $("#qyh2").html("");
        $("#qyh3").html("");
        $("#qyh4").html("");
        $("#qyh2").append('<option value="">全部</option>');
        $("#qyh3").append('<option value="">全部</option>');
        $("#qyh4").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.citylist.length; i++) {
            var currItem = result.data.citylist[i];
            $("#qyh2").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
        for (var i = 0; i < result.data.HYFLMCLIST.length; i++) {
            var currItem = result.data.HYFLMCLIST[i];
            $("#qyh3").append('<option value="' + currItem.HYFLMC + '">' + currItem.HYFLMC + '</option>');
        }
        for (var i = 0; i < result.data.ZCLXMCLIST.length; i++) {
            var currItem = result.data.ZCLXMCLIST[i];
            $("#qyh4").append('<option value="' + currItem.ZCLXMC + '">' + currItem.ZCLXMC + '</option>');
        }
    })
}
//工业园区
function gyyqc() {
    ajaxPost("/seimp/share/getGYYQC", {}).done(function (result) {
        $("#gy2").html("");
        $("#gy3").html("");
        $("#gy2").append('<option value="">全部</option>');
        $("#gy3").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.citylist.length; i++) {
            var currItem = result.data.citylist[i];
            $("#gy2").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
        for (var i = 0; i < result.data.type_namelist.length; i++) {
            var currItem = result.data.type_namelist[i];
            $("#gy3").append('<option value="' + currItem.type_name + '">' + currItem.type_name + '</option>');
        }
    })
}
//企业信息查询(汞调查)下拉框查询条件 
function qyxxgc() {
    ajaxPost("/seimp/share/getQYXXGC", {}).done(function (result) {
        $("#qyg4").html("");
        $("#qyg2").html("");
        $("#qyg3").html("");
        $("#qyg4").append('<option value="">全部</option>');
        $("#qyg2").append('<option value="">全部</option>');
        $("#qyg3").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.citylist.length; i++) {
            var currItem = result.data.citylist[i];
            $("#qyg4").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
        for (var i = 0; i < result.data.HYFLLIST.length; i++) {
            var currItem = result.data.HYFLLIST[i];
            $("#qyg2").append('<option value="' + currItem.HYFL + '">' + currItem.HYFL + '</option>');
        }
        for (var i = 0; i < result.data.QYZCLXMCLIST.length; i++) {
            var currItem = result.data.QYZCLXMCLIST[i];
            $("#qyg3").append('<option value="' + currItem.QYZCLXMC + '">' + currItem.QYZCLXMC + '</option>');
        }
    })
}
//二噁英实验室
function reysysc() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#rey2").html("");
        $("#rey2").append('<option value="">全部</option>');
        $("#rey2").append('<option value="全国">全国</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#rey2").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
    })
}

//涉重有色金属采矿权项目 初始化查询条件
function ckqc() {
    ajaxPost("/seimp/share/getCKQCX", {}).done(function (result) {
    	$("#gy2").html("");
        $("#gy3").html("");
        $("#gy2").append('<option value="">全部</option>');
        $("#gy3").append('<option value="">全部</option>');
        for (var i = 0; i < result.data.kz.length; i++) {
            var currItem = result.data.kz[i];
            $("#ckq_kz").append('<option value="' + currItem.kz + '">' + currItem.kz + '</option>');
        }
        for (var i = 0; i < result.data.kcfs.length; i++) {
            var currItem = result.data.kcfs[i];
            $("#ckq_kcfs").append('<option value="' + currItem.kcfs + '">' + currItem.kcfs + '</option>');
        }
    })
}



//加载数据集列表
function initPart1Content(typeValue) {
    if (typeValue == undefined) {
        typeValue = "0";
    }
    ajaxPost("/seimp/share/getDatalist", {type: typeValue, pageNumber: 1, pageSize: 12}).done(function (result) {
        var html = "";
        for (var i = 0; i < result.data.rows.length; i++) {
            var currItem = result.data.rows[i];
            var name = currItem.name
            if (name.lengt > 9) {
                name = currItem.name.substring(0, 7) + '...'
            } else {
                name = currItem.name
            }
            var pic = "img/data/zanwu.jpg";
            if (currItem.pic_url != undefined && currItem.pic_url != "") {
                pic = currItem.pic_url;
            }
            html += "<div class='proto-cell lt'><div class='cell-img'><img src='" + pic + "' alt='' style='width:100%;height:100%'>" +
                "</div><div class='cell-word'><p class='cell-name col-xs-12 no-padding'><span style='float:left;'>数据名称：</span><span class='item_title col-xs-7 no-padding'  title='" + name + "'>" + name + "</span></p><p><span>数据量：</span>" +
                "<span>" + currItem.serviceAccount + "</span></p><p><span>提供单位：</span><span>" + currItem.department + "</span></p><div class='col-xs-12 no-padding'><div class=''>" +
                "<a class='button_blue pull-left' href='javascript:void(0);' onclick=viewDate('" + currItem.name + "','" + currItem.id + "')>查看数据</a></div><div class=''>" +
                "<a class='button_blue pull-right' href='javascript:void(0);' onclick=viewMetadate('" + currItem.name + "','" + currItem.id + "')>查看元数据</a></div></div></div></div>";
        }
        $(".proto-list").html(html);

        if (result.data.total == 0) {
            $('#example3 li').remove();
        } else {
            var options = {
                bootstrapMajorVersion: 3,
                currentPage: result.data.page,//当前页
                totalPages: result.data.total,//总页数
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
                    ajaxPost("/seimp/share/getDatalist", {
                        type: typeValue,
                        pageNumber: page,
                        pageSize: 12
                    }).done(function (result) {
                            var html = "";
                            for (var i = 0; i < result.data.rows.length; i++) {
                                var currItem = result.data.rows[i];
                                var name = currItem.name
                                if (name.lengt > 9) {
                                    name = currItem.name.substring(0, 7) + '...'
                                } else {
                                    name = currItem.name
                                }
                                var pic = "img/data/zanwu.jpg";
                                if (currItem.pic_url != undefined && currItem.pic_url != "") {
                                    pic = currItem.pic_url;
                                }
                                html += "<div class='proto-cell lt'><div class='cell-img'><img src='" + pic + "' alt='' style='width:100%;height:100%'>" +
                                    "</div><div class='cell-word'><p class='cell-name col-xs-12 no-padding'><span style='float:left;'>数据名称：</span><span class='item_title col-xs-7 no-padding'  title='" + name + "'>" + name + "</span></p><p><span>数据量：</span>" +
                                    "<span>" + currItem.serviceAccount + "</span></p><p><span>提供单位：</span><span>" + currItem.department + "</span></p><div class='col-xs-12 no-padding'><div class=''>" +
                                    "<a class='button_blue pull-left' href='javascript:void(0);' onclick=viewDate('" + currItem.name + "','" + currItem.id + "')>查看数据</a></div><div class=''>" +
                                    "<a class='button_blue pull-right' href='javascript:void(0);' onclick=viewMetadate('" + currItem.name + "','" + currItem.id + "')>查看元数据</a></div></div></div></div>";
                            }
                            $(".proto-list").html(html);
                        }
                    );
                },
            };
            $('#example3').bootstrapPaginator(options);
        }
    })
}
/*查询，刷新表格*/
function search() {
    metTable_initialization1();
}
/*查看数据*/
function viewDate(name, id) {
    type = id;
    ajaxPost("/seimp/share/hitData", {ID: id});
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {
        title: '数据集列表',
        link: 'javascript:back()'
    }, {title: '' + name + ''}]);
    $('.box_crumbs .right_button').remove()
    $('.box_crumbs').append("<a class='button_blue pull-right right_button' onclick='viewMetadate(\"" + name + "\"," + id + ")'>查看元数据</a>");
    $(".v1").hide();
    $('.data-city ').hide();
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
    if (id == "27") {//土地利用数据
        $(".part2").hide();
        $(".part3").show();
        $(".part3").parent().show();
        $(".part3 iframe").attr("src", "views/data/landuse.html");
    } else {
        $(".part3").hide();
        initTable(id);
        $(".part2").show();
        metTable_initialization1();
    }
}
function viewDate1(name, id) {
    type = id;
    ajaxPost("/seimp/share/hitData", {ID: id});
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {title: '' + name + ''}]);
    $('.box_crumbs .right_button').remove()
    $('.box_crumbs').append("<a class='button_blue pull-right right_button' onclick='viewMetadate1(\"" + name + "\"," + id + ")'>查看元数据</a>");
    $(".v1").hide();
    $('.data-city ').hide();
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
    if (id == "27") {//土地利用数据
        $(".part2").hide();
        $(".part3").show();
        $(".part3").parent().show();
        $('.data-basic').show()
        $(".part3 iframe").attr("src", "views/data/landuse.html");
    } else {
        $(".part3").hide();
        initTable(id);
        $(".part2").show();
        $('.data-basic').show()
        metTable_initialization1();
    }
}
getLastStaData();
function getLastStaData() {
    ajaxPost("/seimp/share/getLatestMetaData", {}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            var tem1 = data.data[0];
            if (tem1.name.length > 11) {
                $(".middle-one").html("<p title =" + tem1.name + " >" + tem1.name.substring(0, 10) + "..." + "（<a style='text-decoration: underline;' href='#data?type=1&dataID=" + tem1.id + "&dataName=" + tem1.name + "'>" + tem1.serviceAccount + "</a>）条</p><p>来源于：" + (tem1.department == undefined ? "" : tem1.department) + "</p><p>发布于：" + tem1.dataTime + "</p>");
            } else {
                $(".middle-one").html("<p>" + tem1.name + "（<a style='text-decoration: underline;' href='#data?type=1&dataID=" + tem1.id + "&dataName=" + tem1.name + "'>" + tem1.serviceAccount + "</a>）条</p><p>来源于：" + (tem1.department == undefined ? "" : tem1.department) + "</p><p>发布于：" + tem1.dataTime + "</p>");
            }
            var tem2 = data.data[1];
            if (tem2.name.length > 11) {
                $(".middle-two").html("<p title =" + tem2.name + ">" + tem2.name.substring(0, 10) + "..." + "（<a style='text-decoration: underline;' href='#data?type=1&dataID=" + tem2.id + "&dataName=" + tem2.name + "'>" + tem2.serviceAccount + "</a>）条</p><p>来源于：" + (tem2.department == undefined ? "" : tem2.department) + "</p><p>发布于：" + tem2.dataTime + "</p>");
            } else {
                $(".middle-two").html("<p>" + tem2.name + "（<a style='text-decoration: underline;' href='#data?type=1&dataID=" + tem2.id + "&dataName=" + tem2.name + "'>" + tem2.serviceAccount + "</a>）条</p><p>来源于：" + (tem2.department == undefined ? "" : tem2.department) + "</p><p>发布于：" + tem2.dataTime + "</p>");
            }
            var tem3 = data.data[2];
            if (tem3.name.length > 11) {
                $(".middle-three").html("<p title =" + tem3.name + ">" + tem3.name.substring(0, 10) + "..." + "（<a style='text-decoration: underline;' href='#data?type=1&dataID=" + tem3.id + "&dataName=" + tem3.name + "'>" + tem3.serviceAccount + "</a>）条</p><p>来源于：" + (tem3.department == undefined ? "" : tem3.department) + "</p><p>发布于：" + tem3.dataTime + "</p>");
            } else {
                $(".middle-three").html("<p>" + tem3.name + "（<a style='text-decoration: underline;' href='#data?type=1&dataID=" + tem3.id + "&dataName=" + tem3.name + "'>" + tem3.serviceAccount + "</a>）条</p><p>来源于：" + (tem3.department == undefined ? "" : tem3.department) + "</p><p>发布于：" + tem3.dataTime + "</p>");
            }
        }
    });
}

var initParam;
/*初始化表格参数*/
function initTable(id) {
    if (id == 8) {
        $("#ysxm").show();
        initTable8();
    } else if (id == 1) {
        $("#gyyq").show();
        gyyqc();
        initTable1();
    } else if (id == 7) {
        $("#jsxm").show();
        initTable7();

    } else if (id == 2) {
        $("#laboratory").show();
        laboratory();
    } else if (id == 9) {
        $("#yaogan").show();
        yghcc();
        yaoganhecha();
    } else if (id == 4) {
        $("#gyfs").show();
        gyfsc();
        gyfs();
    } else if (id == 5) {
        $("#zdhq").show();
        zdhqc();
        zdhq();
    } else if (id == 3) {
        $("#sy").show();
        sy();
    } else if (id == 6) {
        $("#jbyj").show();
        jbyj();
    } else if (id == 10) {
        $("#wrdk").show();
        wrdkc();
        wrdk();
    } else if (id == 12) {
        $("#wlyq").show();
        wlyqc();
        wlyq();
    } else if (id == 13) {
        $("#qyxx").show();
        qyxxc();
        qyxx();
    } else if (id == 14) {
        $("#qypf").show();
        qypfc();
        qypf();

    } else if (id == 15) {
        $("#qyxxh").show();
        qyxxhc();
        qyxxh();
    } else if (id == 16) {
        $("#cpqd").show();
        cpqd();
    } else if (id == 17) {
        $("#qyxxg").show();
        qyxxgc();
        qyxxg();
    } else if (id == 18) {
        $("#qygpfz").show();
        qygpfzc();
        qygpfz();
    } else if (id == 19) {
        $("#ysgsc").show();
        ysgsc();
    } else if (id == 20) {
        $("#hgsj").show();
        hgsj();
    } else if (id == 21) {
        $("#qyxxgf").show();
        qyxxgfc();
        qyxxgf();
    } else if (id == 22) {
        $("#wxjy").show();
        wxjy();
    } else if (id == 23) {
        $("#wxtm").show();
        wxtmc();
        wxtm();
    } else if (id == 24) {
        $("#zlkzsys").show();
        zlkzsysc();
        zlkzsys();
    } else if (id == 25) {
        $("#reysys").show();
        reysysc();
        reysys();
    } else if (id == 26) {
        $("#zjk").show();
        zjkc();
        zjk();
    } else if (id == 28) {
        $("#ckq").show();
        ckqc();
        ckq();
    } else if (id == 30) {//淘汰落后企业
        $("#eli").show();
        eliminatec();
        eliminate();
    }else if ( id == 97){//修复舆情分类汇总
        $("#xfyq").show();
        xfyqChushi();
        xfyqData();
    } else if (id == 31) {
        $("#pwBaseinfo").show();
        ENTERPRICE_BASEINFOSel();
        ENTERPRICE_BASEINFO();
    } else if (id == 32) {
        $("#pwUndoinfo").show();
        ENTERPRICE_UNDOINFO();
    } else if (id == 34) {//污染地块结构
        $("#pollutionLandStructure").show();
        /*$('#STARTRUNYEARTIMEPar').datetimepicker({  
            format: 'YYYY',  
            locale: moment.locale('zh-cn')  
        });  
        $('#ENDRUNYEARTIMEPar').datetimepicker({  
            format: 'YYYY',  
            locale: moment.locale('zh-cn')  
        });  */
        $('#STARTRUNYEARTIMEParStart').datetimepicker({
        	startView: 'decade',  
            minView: 'decade',  		//选择日期后，不会再跳转去选择时分秒
	  		language: 'zh-CN',		//选择语言
	  		format: 'yyyy',		//对应日期格式
	  		todayBtn: 1,
	  		autoclose: 1,
		}).on("changeDate",function(evt){
			$('#STARTRUNYEARTIMEParEnd').datetimepicker("setStartDate",evt.date);
		});
        $('#STARTRUNYEARTIMEParEnd').datetimepicker({
        	startView: 'decade',  
            minView: 'decade',  		//选择日期后，不会再跳转去选择时分秒
	  		language: 'zh-CN',		//选择语言
	  		format: 'yyyy',		//对应日期格式
	  		todayBtn: 1,
	  		autoclose: 1,
		}).on("changeDate",function(evt){
			$('#STARTRUNYEARTIMEParStart').datetimepicker("setEndDate",evt.date);
		});
        $('#ENDRUNYEARTIMEParStart').datetimepicker({
        	startView: 'decade',  
            minView: 'decade',  		//选择日期后，不会再跳转去选择时分秒
	  		language: 'zh-CN',		//选择语言
	  		format: 'yyyy',		//对应日期格式
	  		todayBtn: 1,
	  		autoclose: 1,
		}).on("changeDate",function(evt){
			$('#ENDRUNYEARTIMEParEnd').datetimepicker("setStartDate",evt.date);
		});
        $('#ENDRUNYEARTIMEParEnd').datetimepicker({
        	startView: 'decade',  
            minView: 'decade',  		//选择日期后，不会再跳转去选择时分秒
	  		language: 'zh-CN',		//选择语言
	  		format: 'yyyy',		//对应日期格式
	  		todayBtn: 1,
	  		autoclose: 1,
		}).on("changeDate",function(evt){
			$('#ENDRUNYEARTIMEParStart').datetimepicker("setEndDate",evt.date);
		});
        //获取污染地块结构查询条件
        getDATASOURCEParData();//地块名单来源
        getINDUSTRYTYPEParData();//行业分类
        getPOTENTIALPOLLUTANTParData();//潜在污染物
        getLANDSTATUSParData();//地块状态
        
        pollutionLandStructure();
    } else if (id == 35) {//尾矿库
        $("#tailings").show();
//        getTailingsPar();
        tailings();
    }
}
/*排污许可证企业基本信息条件*/
function ENTERPRICE_BASEINFOSel() {
    ajaxPost("/seimp/share/getENTERPRICE_BASEINFOType", {}).done(function (result) {
        if (result.status == 0) {
            $("#pwtype").html("");
            $("#pwtype").append('<option value="">全部</option>');
            for (var i = 0; i < result.data.length; i++) {
                var currItem = result.data[i];
                $("#pwtype").append('<option value="' + currItem + '">' + currItem + '</option>');
            }
        }
    });
}
// 修复舆情分类汇总初始条件
function xfyqChushi(){
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#xfyq1").html("");
        $("#xfyq1").append('<option value="">全部</option>')
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#xfyq1").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
    });
    ajaxPost("/seimp/eliminate/getXfyqIndustry", {}).done(function (result) {
        $("#xfyq3").html("");
        $("#xfyq3").append('<option value="">全部</option>');
        console.log(result)
        $.each(result.data.WJJS, function (i, item) {
            $("#xfyq3").append('<option value="' + item.WJJS + '">' + item.WJJS + '</option>');
        });
        $("#xfyq4").html("");
        $("#xfyq4").append('<option value="">全部</option>');
        $.each(result.data.WJWRCD, function (i, item) {
            $("#xfyq4").append('<option value="' + item.WJWRCD + '">' + item.WJWRCD + '</option>');
        });
    })
    eli_charts();
}
/*淘汰落后企业初始条件*/
function eliminatec() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#eli1").html("");
        $("#eli1").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#eli1").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
    });
    ajaxPost("/seimp/eliminate/getIndustry", {}).done(function (result) {
        $("#eli3").html("");
        $("#eli3").append('<option value="">全部</option>');
        $.each(result.data.result, function (i, item) {
            $("#eli3").append('<option value="' + item.INDUSTRY + '">' + item.INDUSTRY + '</option>');
        });
    })
    eli_charts();
}
// 淘汰落后产能企业饼图
function eli_charts() {
    ajaxPost("/seimp/eliminate/getEcharts", {}).done(function (result) {
        console.log(result);
        var bar = result.data.bar;
        var line = result.data.line;
        var bar_name = [];
        var bar_data = [];
        $.each(bar, function (i, item) {
            bar_name.push(item.INDUSTRY);
            bar_data.push(item.COUNT)
        });
        var line_name = [];
        var line_data = [];
        $.each(line, function (i, item) {
            line_name.push(item.ELIMINATION_TIME);
            line_data.push(item.COUNT);
        })
        var option1 = {

            color: ['#3398DB'],
            title: {
                text: '各个行业下淘汰的企业数目',
                x: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            dataZoom: {
                show: true,
                start: 0,
                end: 20,

            },
            grid: {
                left: '8%',
                right: '15%',
                y2: 120,
            },
            xAxis: [
                {
                    type: 'category',
                    data: bar_name,
                    axisTick: {
                        alignWithLabel: true
                    },
                    axisLabel: {
                        interval: 0,
                        rotate: 40
                    }
                }
            ],
            yAxis: [
                {
                    name: '企业个数',
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '企业个数',
                    type: 'bar',
                    barWidth: '60%',
                    data: bar_data
                }
            ]
        }
        var option2 = {
            title: {
                text: '各年份淘汰的企业数目',
                x: 'center'
            },
            tooltip: {
                trigger: 'axis',
            },
            xAxis: {
                type: 'category',
                data: line_name
            },
            yAxis: {
                type: 'value',
                name: "企业个数"
            },
            series: [{
                data: line_data,
                type: 'line',
                smooth: true
            }]
        }
        var myChart1 = echarts.init(document.getElementById('pie'));
        var myChart2 = echarts.init(document.getElementById('line'));
        myChart1.setOption(option1);
        myChart2.setOption(option2);

    })

}
// 查询市
function getCity() {
    var prov ;
    if ($("#xfyq").css('display') =="block"){
        prov = $("#xfyq1").val();
    } else if ($("#eli").css('display') =="block"){
        prov = $("#eli1").val();
    }
    ajaxPost("/seimp/eliminate/getCity", {province:prov}).done(function (result) {
        $("#eli2").html("");
        $("#eli2").append('<option value="">全部</option>');
        $("#xfyq2").html("");
        $("#xfyq2").append('<option value="">全部</option>');
        $.each(result.data.result, function (i, item) {
            $("#eli2").append('<option value="' + item.name + '">' + item.name + '</option>');
            $("#xfyq2").append('<option value="' + item.name + '">' + item.name + '</option>');
        });
    })
    $("#eli5").html("");
    $("#eli5").append('<option value="">全部</option>');
    $("#xfyq5").html("");
    $("#xfyq5").append('<option value="">全部</option>');
}
// 查询县
function getCounty() {
    var prov ;
    if ($("#xfyq").css('display') =="block"){
        prov = $("#xfyq2").val();
    } else if ($("#eli").css('display') =="block"){
        prov = $("#eli2").val();
    }
    ajaxPost("/seimp/eliminate/getCounty", {city: prov}).done(function (result) {
        $("#eli5").html("");
        $("#eli5").append('<option value="">全部</option>');
        $("#xfyq5").html("");
        $("#xfyq5").append('<option value="">全部</option>');
        console.log(result)
        $.each(result.data.result, function (i, item) {
            $("#eli5").append('<option value="' + item.name + '">' + item.name + '</option>');
            $("#xfyq5").append('<option value="' + item.name + '">' + item.name + '</option>');
        });
    })
}
/*修复舆情分类汇总表头以及接口地址*/
function xfyqData() {
    var xfyq = {
        url: "/seimp/eliminate/getSelectXfyq",
        queryParam: function queryParams(params) {
            var datas = {};
            datas.pageSize = params.limit;
            datas.pageNumber = params.offset;
            datas.province = $("#xfyq1").val();
            datas.city = $("#xfyq2").val();
            datas.wjjs = $("#xfyq3").val();
            datas.county = $("#xfyq5").val();
            datas.wjwrcd = $("#xfyq4").val();
            return datas;
        },
        columns: [{
            title: '序号',//标题  可不加
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'PROVINCE',
            title: '省份',
            align: 'center',
        }, {
            field: 'CITY',
            title: '市区',
            align: 'center',
        }, {
            field: 'XIAN',
            title: '县区',
            align: 'center',

        }, {
            field: 'COUNTY',
            title: '乡镇',
            align: 'center',

        }, {
            field: 'LON',
            title: '经度',
            align: 'center',
        }, {
            field: 'LAT',
            title: '纬度',
            align: 'center',
        }, {
            field: 'INVOLVEENTERPRICE',
            title: '涉及企业',
            align: 'center',
        }, {
            field: 'WJJS',
            title: '无机重金属',
            align: 'center',
        }, {
            field: 'WJWRCD',
            title: '污染程度',
            align: 'center',
        }, {
            field: 'YJXM',
            title: '有机类项目',
            align: 'center',
        }, {
            field: 'YJWRCD',
            title: '污染程度',
            align: 'center',
        }, {
            field: 'POLLUTEDAREA',
            title: '污染面积（km²）',
            align: 'center',
        }, {
            field: 'SAMPLETIME',
            title: '采样/污染时间',
            align: 'center',
        }, {
            field: 'TITLE',
            title: '标题',
            align: 'center',
        }, {
            field: 'SOURCE',
            title: '来源',
            align: 'center',
        }, {
            field: 'PUBLISHTIME',
            title: '发表时间',
            align: 'center',
        }, {
            field: 'BZ',
            title: '备注',
            align: 'center',
        }
        ]
    }
    initParam = xfyq;
}

/*淘汰落后企业查询条件以及表头*/
function eliminate() {
    var eli = {
        url: "/seimp/eliminate/getSelectEliminate",
        queryParam: function queryParams(params) {
            var datas = {};
            datas.pageSize = params.limit;
            datas.pageNumber = params.offset;
            datas.province = $("#eli1").val();
            datas.city = $("#eli2").val();
            datas.industry = $("#eli3").val();
            datas.county = $("#eli5").val();
            datas.enterprise = $("#eli4").val();
            return datas;
        },
        columns: [{
            title: '序号',//标题  可不加
            formatter: function (value, row, index) {
                return index + 1;
            }
        }, {
            field: 'PROVINCE',
            title: '省份',
            align: 'center',
        }, {
            field: 'CIRY',
            title: '市区',
            align: 'center',
        }, {
            field: 'COUNTY',
            title: '县区',
            align: 'center',

        }, {
            field: 'INDUSTRY',
            title: '行业',
            align: 'center',
        }, {
            field: 'ENTERPRISE',
            title: '企业名称',
            align: 'center',
        }, {
            field: 'LON',
            title: '经度',
            align: 'center',
        }, {
            field: 'LAT',
            title: '纬度',
            align: 'center',
        }, {
            field: 'CAPACITY',
            title: '产能(万吨)',
            align: 'center',
        }, {
            field: 'ELIMINATION_TIME',
            title: '淘汰时间',
            align: 'center',
        }, {
            field: 'REMARKS',
            title: '备注',
            align: 'center',
        }
        ]
    }
    initParam = eli;
}

/*工业园区*/
function initTable1() {
    initParam = initParam1;
}
/*实验室*/
function laboratory() {
    initParam = laboratory1;
}
function yaoganhecha() {
    initParam = yaoganhecha1;
}
function zlkzsys() {
    initParam = zlkzsys1;
}
function wlyq() {
    initParam = wlyq1;
}
//二噁英实验室
function reysys() {
    initParam = reysys1;
}
//专家库
function zjk() {
    initParam = zjk1;
}
function ENTERPRICE_UNDOINFO() {
    initParam = ENTERPRICE_UNDOINFO1;
}
function ENTERPRICE_BASEINFO() {
    initParam = ENTERPRICE_BASEINFO1;
}
function wxtm() {
    initParam = wxtm1;
}
function hgsj() {
    initParam = hgsj1;
}
function ysgsc() {
    initParam = ysgsc1;
}
function wxjy() {
    initParam = wxjy1;
}
function qygpfz() {
    initParam = qygpfz1;
}
function qyxxg() {
    initParam = qyxxg1;
}
function qyxxgf() {
    initParam = qyxxgf1;
}
function wrdk() {
    initParam = wrdk1;
}
function qyxx() {
    initParam = qyxx1;
}
function qyxxh() {
    initParam = qyxxh1;
}
function qypf() {
    initParam = qypf1;
}
function gyfs() {
    initParam = gyfs1;
}
function zdhq() {
    initParam = zdhq1;
}
function sy() {
    initParam = sy1;
}
function jbyj() {
    initParam = jbyj1;
}

function cpqd() {
    initParam = cpqd1;
}
/*验收项目*/
function initTable8() {
    initParam = initParam8;
}
/*建设项目*/
function initTable7() {
    initParam = initParam7;
}
function ckq() {
    initParam = ckq1;
}

/*污染地块结构*/
function pollutionLandStructure(){
	initParam = initParam34;
}

/*尾矿库*/
function tailings(){
	initParam = initParam35;
}


/*查看元数据*/
function viewMetadate(name, id) {
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {
        title: '数据集列表',
        link: 'javascript:back()'
    }, {title: '' + name + ''}]);
    $('.box_crumbs .right_button').remove()
    $('.box_crumbs').append("<a class='button_blue pull-right right_button' onclick='viewDate(\"" + name + "\"," + id + ")'>查看数据</a>");
    $(".v1").hide();
    $("#part4").show();
    $("#name").html("name");
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
    //加载元数据信息
    initPart4Content(id);
}
function viewMetadate1(name, id) {
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {title: '' + name + ''}]);
    $('.box_crumbs .right_button').remove()
    $('.box_crumbs').append("<a class='button_blue pull-right right_button' onclick='viewDate1(\"" + name + "\"," + id + ")'>查看数据</a>");
    $(".v1").hide();
    $("#part4").show();
    $("#name").html("name");
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
    //加载元数据信息
    initPart4Content(id);
}
/*元数据页面赋值*/
function initPart4Content(id) {
    var json = {type: id};
    ajaxPost("/seimp/share/getSourceData", json).done(function (result) {
        if (result.status == 0 && result.data.length > 0) {
            var currItem = result.data[0];
            $("#name").html(currItem.name);
            $("#danwei").html(currItem.department);
            $("#dataAccount").html(currItem.serviceAccount);
            $("#visitAccount").html(currItem.visitAccount);
            $("#dataType").html(currItem.dataName);
            $("#updateTime").html(currItem.updateTime);
            $("#contract").html(currItem.contact);
            $("#telNumber").html(currItem.tel);
            $("#email").html(currItem.email);
            $("#address").html(currItem.address);
            $("#abstract").html(currItem.abstract);
            $("#note").html(currItem.instructions);
            $("#position").html(currItem.location);
            $("#words").html(currItem.subjectTerms);
            if (currItem.interface_url != undefined) {
                $("#interfacePart").show();
                $("#url").html("<a style='text-decoration: underline'>" + currItem.interface_url + "</a>");
            } else {
                $("#interfacePart").hide();
            }
        }
    });
}
var type = 0;
function metTable_initialization1() {
    $('#metTable1').bootstrapTable('destroy');
    $('#metTable1').bootstrapTable({
        method: 'POST',
        url: initParam.url,
        dataType: "JSON",
        /*contentType: "text/html; charset=utf-8",*/
        iconSize: "outline",
        //crossDomain: true,
        // clickToSelect: true,//点击选中行
        pagination: true,	//在表格底部显示分页工具栏
        ajaxOptions: {async: true, timeout: 10000},
        pageSize: 10,	//页面大小
        /* pageNumber: 1,	//页数*/
        pageList: [10, 15, 20, 50],
        striped: true,	 //使表格带有条纹
        sidePagination: "server",//表格分页的位置 client||server
        queryParams: initParam.queryParam, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        	if(data.status == 4){
            	toastr.error("输入参数包含敏感字符");
        	}
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        },
        columns: initParam.columns
    });
}
/*验收项目*/
var initParam8 = {
    url: "/seimp/share/getYZ_BAS_ACPT.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.type = $("#ys3").val();
        datas.province = $("#ys4").val();
        datas.name = $("#ys1").val();
        datas.address = $("#ys2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'PROJECTNAME',
            title: '项目名称',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'PROJECTADDRESS',
            title: '项目地址',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == "(null)") {
                    return "-";
                } else {
                    return value;
                }
            }
        }, {
            field: 'EIAMANAGENAME',
            title: '行业类别',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == "(null)") {
                    return "-";
                } else {
                    return value;
                }
            }

        }, {
            field: 'EIAEVALUATIONNUMBER',
            title: '环评审批文号',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == "(null)") {
                    return "-";
                } else {
                    return value;
                }
            }
        }, {
            field: 'UPDATEFLAG_HBB_BIGDATA',
            title: '更新标记',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'PROVINCENAME',
            title: '对接省份',
            align: 'center',
            valign: 'middle',
        }
    ]
};


/*举报预警*/
var jbyj1 = {
    url: "/seimp/share/getReportData.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.name = $("#j1").val();
        datas.label = $("#j2").val();
        datas.province = $("#j3").val();
        datas.type = $("#j4").val();
        datas.report = $("#j5").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    }, {
        field: 'EVENT_NUMBER',
        title: '举报编号',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REPORT_FROM',
        title: '举报方式',
        align: 'center',
        valign: 'middle',
        formatter: function (value, row, index) {
            if (value == 0) {
                return "微信";
            } else if (value == 1) {
                return "电话"
            } else if (value == 2) {
                return "网络"
            }
        }
    }, {
        field: 'REPORT_DEPT_NAME',
        title: '举报对象',
        align: 'center',
        valign: 'middle',
        formatter: function (value, row, index) {
            if (value == "(null)") {
                return "-";
            } else {
                return value;
            }
        }
    }, {
        field: 'LOCATION_LABEL',
        title: '详细地址',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'PROVINCENAME',
        title: '对接省份',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REPORT_CONTENT',
        title: '污染描述',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REPORT_LONGITUDE',
        title: '经度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REPORT_LATITUDE',
        title: '纬度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'PROCESS_AREA_UNITNAME',
        title: '办理单位',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'FINALOPINION',
        title: '办结意见',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REPORT_TIME',
        title: '举报时间',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'INSERTTIME',
        title: '更新时间',
        align: 'center',
        valign: 'middle',
    }
    ]
};


/*重点行业企业*/
var zdhq1 = {
    url: "/seimp/share/getZDHQ.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.province = $("#zdhq1").val();
        datas.industry = $("#zdhq2").val();

        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'provinceName',
            title: '省',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'cityName',
            title: '市',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'countyName',
            title: '区/县',
            align: 'center',
            valign: 'middle',

        }, {
            field: 'enterpriseName',
            title: '企业名称',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'industry',
            title: '行业',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'unifiedSocialCreditIdentifier',
            title: '统一社会信用代码',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'remark',
            title: '备注',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'enabled',
            title: '是否有效',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 0) {
                    return "无效";
                } else if (value == 1) {
                    return "有效"
                }
            }
        }, {
            field: 'latitude',
            title: '纬度',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'longitude',
            title: '经度',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'mainContaminant',
            title: '主要污染物',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'date',
            title: '年份信息',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'address',
            title: '所在企业地址',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'phone',
            title: '企业联系电话',
            align: 'center',
            valign: 'middle',
        }
    ]
};

/*建设项目*/
var initParam7 = {
    url: "/seimp/share/getYZ_BAS_CONS.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        //    datas.type = $("#js3").val();
        datas.province = $("#js4").val();
        datas.name = $("#js1").val();
        datas.jg = $("#js2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'PROJECTNAME',
            title: '项目名称',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'DATASOURCE',
            title: '数据来源',
            align: 'center',
            valign: 'middle',
        },  {
            field: 'EIAMANAGENAME',
            title: '环评管理类别名称',
            align: 'center',
            valign: 'middle',

        }, {
            field: 'APPROVALDATE',
            title: '受理日期',
            align: 'center',
            valign: 'middle',

        }, {
            field: 'CONSREPORTPATH',
            title: '附件-报告书/表',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == undefined || value == "") {
                    return "没有附件";
                } else {
                    return "<a href='javascript:;' onclick='viewFiles(\"" + row.ID + "\")'>查看附件</a>";
                }
            }
        },{
            field: 'PROVINCENAME',
            title: '对接省份',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'NATIONALECONOMYNAME',
            title: '国民经济名称',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'PROJECTINVEST',
            title: '总投资（万元）',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'ENVIRONINVEST',
            title: '环保投资（万元）',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'PROJECTADDRESS',
            title: '建设地点',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'LONGITUDE',
            title: '经度',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'LATITUDE',
            title: '纬度',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'NATIONALECONOMYNAME',
            title: '国民经济类别名称',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'STORAGETIME',
            title: '入监管平台时间',
            align: 'center',
            valign: 'middle',
        }, {
            field: 'INSERTTIME',
            title: '更新时间',
            align: 'center',
            valign: 'middle'
        }, {
            field: '',
            title: '操作',
            align: 'center',
            valign: 'middle',
            formatter :function(value,row,inde){
                var s = '<a href="javascript:void(0)" onclick="arcgisDw(\''+row.LONGITUDE+'\',\''+row.LATITUDE+'\')">定位</a>';
                return s;
            }
        }
    ]
};
/*查看文件*/
function viewFiles(id) {
    ajaxPost("/seimp/share/getConsFiles", {id: id}).done(function (data) {
        if (data.status == 0) {
            if (data.data.length > 0) {
                var html = "";
                for (var i = 0; i < data.data.length; i++) {
                    var item = data.data[i];
                    html += "<tr><td>" + item.FILENAME + "</td><td>" + item.UPDATETIME + "</td><td>";
                    if (item.STATE == 0) {
                        html += "<a onclick='getConsFile(\"" + item.URL + "\")' target='_blank'>获取</a>";
                    } else {
                        html += "<a onclick='downloadConsFile(\"" + item.ID + "\")' target='_blank'>下载</a>";
                    }
                    html += "</td></tr>";
                }
                $("#fileTable").html(html);
                $("#files").modal();
            } else {
                return toastr.info("查看失败");
            }
        }
    });
}
/*先在服务器下载文件，后获取*/
function downloadConsFile(id) {
    ajaxPost("/seimp/share/downloadConsFile", {id: id}).done(function (data) {
        if (data.status == 0) {
            var url = data.data;
            window.open("/seimp/" + url);
        } else {
            return toastr.error("下载失败");
        }
    });
}
/*直接服务器获取文件*/
function getConsFile(url) {
    window.open("/seimp/" + url);
  //  window.location.href = "/seimp/" + url;
}
/*工业园区*/
var initParam1 = {
    url: "/seimp/share/getIndustryPark.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.type = $("#gy3").val();
        datas.province = $("#gy2").val();
        datas.name = $("#gy1").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'name',
            title: '名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'type_name',
            title: '类型',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'province_name',
            title: '省份',
            align: 'center',
            valign: 'middle'
        }
    ]
};

/*全国土壤污染状况详查质量控制实验室名录*/
var zlkzsys1 = {
    url: "/seimp/share/getZLKZSYS.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.laboratory_name = $("#zl1").val();
        datas.working_range = $("#zl2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'laboratory_name',
            title: '实验室名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'working_range',
            title: '工作范围',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'recommendation_department',
            title: '推荐部门',
            align: 'center',
            valign: 'middle'
        }
    ]
};


/*二噁英实验室*/
var reysys1 = {
    url: "/seimp/share/getREYSYS.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.laboratory_name = $("#rey1").val();
        datas.working_range = $("#rey2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'laboratory_name',
            title: '实验室名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'working_range',
            title: '工作范围',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'recommendation_department',
            title: '推荐部门',
            align: 'center',
            valign: 'middle'
        }
    ]
};

/*专家库*/
var zjk1 = {
    url: "/seimp/share/getZJK.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.name = $("#zj1").val();
        datas.department = $("#zj2").val();
        datas.field = $("#zj3").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'name',
            title: '专家名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'department',
            title: '所属部门',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'field',
            title: '擅长领域',
            align: 'center',
            valign: 'middle'
        }
    ]
};
/*排污许可证企业基本信息*/
var ENTERPRICE_BASEINFO1 = {
    url: "/seimp/share/getENTERPRICE_BASEINFO.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.name = $("#pwname").val();
        datas.type = $("#pwtype").val();
        return datas;
    },
    columns: [{
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
            valign: 'middle'

        }, {
            field: 'DEVCOMPANY',
            title: '单位名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'REGADDRESS',
            title: '注册地址',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'PROVINCE',
            title: '省份',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'CITY',
            title: '市',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'COUNTY',
            title: '县',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'HYNAME',
            title: '行业类型',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'OPERATIME',
            title: '投产日期',
            align: 'center',
            valign: 'middle'
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
            valign: 'middle'
        }, {
            field: 'FZTIME',
            title: '发证日期',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'OPEADDRESS',
            title: '生产经营场所地址',
            align: 'center',
            valign: 'middle'
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
                } else {
                    return '否';
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
            valign: 'middle'
        }, {
            field: 'ZYWRWLBID',
            title: '主要污染物类别',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 'fq') {
                    return '废弃';
                } else if (value == 'fs') {
                    return '废水';
                } else {
                    return '';
                }
            }
        }, {
            field: 'AIRWRWNAME',
            title: '废气主要污染物种类',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'WATERWRWNAME',
            title: '废水主要污染物种类',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'WATEREMISSIONNAME',
            title: '废水污染物排放规律',
            align: 'center',
            valign: 'middle'
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
            valign: 'middle'
        }, {
            field: 'INSERTTIME',
            title: '更新时间',
            align: 'center',
            valign: 'middle'
        }
    ]
};
/*撤销、注销企业信息*/
var ENTERPRICE_UNDOINFO1 = {
    url: "/seimp/share/getENTERPRICE_UNDOINFO.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.name = $("#pwname1").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加
        title: '序号',//标题  可不加
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'UNITNAME',
            title: '单位名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XKZNUMBER',
            title: '许可证编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZXTYPE',
            title: '撤销类型',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZXREASON',
            title: '撤销原因',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ISTYPE',
            title: '撤销、注销类型',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == '1') {
                    return '注销';
                } else if (value == '2') {
                    return '撤销';
                } else {
                    return '';
                }
            }
        }, {
            field: 'CREATETIME',
            title: '撤销、注销时间',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'INSERTTIME',
            title: '更新时间',
            align: 'center',
            valign: 'middle'
        }
    ]
};
/*实验室名录*/
var laboratory1 = {
    url: "/seimp/share/getLaboratory.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.soil = $("#l2").val();
        datas.path = $("#l3").val();
        datas.name = $("#l1").val();
        datas.ariculture = $("#l4").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'laboratory_name',
            title: '实验室名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'domain_soil_heavymetal',
            title: '监测领域范围(土壤重金属)',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "否";
                } else if (value == 0) {
                    return "是"
                }
            }
        }, {
            field: 'domain_soil_pahs',
            title: '监测领域范围(土壤PAHs)',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "否";
                } else if (value == 0) {
                    return "是"
                }
            }
        }, {
            field: 'domain_ariculture_heavymetal',
            title: '监测领域范围(农产品重金属)',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "否";
                } else if (value == 0) {
                    return "是"
                }
            }

        }, {
            field: 'working_range',
            title: '检测工作范围',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'recommendation_department',
            title: '推荐部门',
            align: 'center',
            valign: 'middle'

        }
    ]
};


/*原生汞生产情况_固体废物去向*/
var ysgsc1 = {
    url: "/seimp/share/getYSGSC.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.hggtfwzl = $("#ysg1").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'TJND',
            title: '调查年度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XH',
            title: '序号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SSSDS',
            title: '所属省地市',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CZJGMC',
            title: '含汞固体废物处置机构名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HGGTFWZL',
            title: '含汞固体废物重量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UpdateTime',
            title: '更新日期',
            align: 'center',
            valign: 'middle'

        }
    ]
};


/*含汞试剂生产_含汞固体废物去向*/
var hgsj1 = {
    url: "/seimp/share/getHGSJ.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.hggtfwczjgmc = $("#hg1").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'TJND',
            title: '调查年度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SHENGSHI',
            title: '省、地市',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HGGTFWCZJGMC',
            title: '机构名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HGGTFWZL',
            title: '含汞固体废物重量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CZJGMC',
            title: '含汞固体废物处置机构名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HGGTFWZL',
            title: '含汞固体废物重量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UpdateTime',
            title: '更新日期',
            align: 'center',
            valign: 'middle'

        }
    ]
};
/*企业信息(汞调查)*/
var qyxxg1 = {

    url: "/seimp/share/getQYXXG.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.dwmc = $("#qyg1").val();
        datas.hyfl = $("#qyg2").val();
        datas.qyzclxmc = $("#qyg3").val();
        datas.sheng = $("#qyg4").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'TJND',
            title: '调查年度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWMC',
            title: '单位名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FDDBR',
            title: '法定代表人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SHENG',
            title: '省',
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
            field: 'SHI',
            title: '市',
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
            field: 'XIAN',
            title: '县',
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
            field: 'XIANG',
            title: '乡',
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
            field: 'HAO',
            title: '号',
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
            field: 'YZBM',
            title: '邮政编码 ',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZXJD',
            title: '中心经度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZXWD',
            title: '中心纬度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HYFL',
            title: '行业分类',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QYZCLXMC',
            title: '企业注册类型',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'danwei',
            title: '单位类别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'lishu',
            title: '隶属关系',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'qygmmc',
            title: '企业规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GYZCZ',
            title: '工业总产值',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'JCSJ',
            title: '建厂时间',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CYRS',
            title: '从业人数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXR',
            title: '联系人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXDH',
            title: '联系电话',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CZHM',
            title: '传真号码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'Email',
            title: '电子邮箱',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWWZ',
            title: '单位网址',
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
            field: 'pflbmc',
            title: '排放类别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWFZR',
            title: '单位负责人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SHR',
            title: '审核人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TBR',
            title: '填表人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TBRQ',
            title: '填表日期',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UpdateTime',
            title: '更新日期',
            align: 'center',
            valign: 'middle'

        }
    ]

}

/*企业基本排放*/
var qygpfz1 = {

    url: "/seimp/share/getQYGPFZ.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.tjnd = $("#gpf1").val();
        datas.cphylmc = $("#gpf2").val();
        datas.sfdb = $("#gpf3").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'TJND',
            title: '调查年度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFYLB',
            title: '排放源类别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CPHYLMC',
            title: '产品或原料名称/种类',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == "(null)") {
                    return "";
                } else {
                    return value
                }
            }
        }, {
            field: 'CN',
            title: '产能',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CL',
            title: '产量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFYSL',
            title: '排放源数量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJYGZL',
            title: '实际用汞/原料含汞总量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CPHGZL',
            title: '产品含汞总量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFFSHGL',
            title: '排放废水含汞量 ',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFFQHGL',
            title: '排放废气含汞量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GTFWHGL',
            title: '固体废物含汞量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HSGL',
            title: '回收汞量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SFDB',
            title: '是否达标',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "否";
                } else if (value == 0) {
                    return "是"
                }
            }
        }, {
            field: 'PFYLB_Sub',
            title: '排放源列表子类',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFFSCSL',
            title: '排放废水产生量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFFQCSL',
            title: '排放废气产生量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GTFWCSL',
            title: '排放废物产生量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFFSPFL',
            title: '排放废水排放量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFFQPFL',
            title: '排放废气排放量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GTFWPFL',
            title: '排放废物排放量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HSL',
            title: '回收量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QYDBL',
            title: '企业达标率',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UpdateTime',
            title: '更新日期',
            align: 'center',
            valign: 'middle'

        }
    ]

}
/*企业排放*/
var qypf1 = {
    url: "/seimp/share/getQYPF.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.zdylbmc = $("#qyp1").val();
        datas.synd = $("#qyp2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'provinceName',
            title: '行政区划',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SYND',
            title: '统计年度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QYName',
            title: '企业名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZDYLBMC',
            title: '排放源类别名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZCL',
            title: '总产量/总处理量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WD',
            title: '单位',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'YSL',
            title: '生产线/窑/炉数量（个）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXSL',
            title: '窑型/工艺种类数量（个）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FQJCPFL',
            title: '废气二恶英检测年排放量（mg TEQ）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FQGSPFL',
            title: '废气二恶英估算年排放量（mg TEQ）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PFZL',
            title: '二恶英年总排放量（mg TEQ）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FHNCL',
            title: '飞灰年产生量（吨）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FZNCL',
            title: '废渣年产生量（万吨）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UPDATETIME',
            title: '更新日期',
            align: 'center',
            valign: 'middle'

        }
    ]
};

/*产品清单*/
var cpqd1 = {
    url: "/seimp/share/getCPQD.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.cpmc = $("#cp1").val();
        datas.wxhxp = $("#cp2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'DWMC',
            title: '企业名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'provinceName',
            title: '行政区划',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TJND',
            title: '调查年度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'BH',
            title: '编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CPMC',
            title: '产品名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CAS',
            title: '化学文摘号/流水号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WXHXP',
            title: '是否属于危险化学品',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'CN',
            title: '历史最大产量（吨/年）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CL',
            title: '产量（吨/年）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZCL',
            title: '调查年底储存量（吨）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UpdateTime',
            title: '更新日期',
            align: 'center',
            valign: 'middle'

        }
    ]
};

/*遥感核查*/
var yaoganhecha1 = {
    url: "/seimp/share/getWrdkYghc.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.province = $("#y3").val();
        datas.name = $("#y1").val();
        datas.production = $("#y5").val();
        datas.status = $("#y4").val();
        datas.progress = $("#y6").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'NAME',
            title: '污染企业名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GEOMETRY',
            title: 'poi点坐标',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SHENG',
            title: '省',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SHI',
            title: '市',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XIAN',
            title: '县',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XIANG',
            title: '乡',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CUN',
            title: '村',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LONGITUDE',
            title: '经度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LATITUDE',
            title: '纬度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LAIYUAN',
            title: '来源',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'REMARK',
            title: '备注',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DALEI',
            title: '行业大类别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'BIEMIN',
            title: '行业小类别名',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'BIANHAO',
            title: '编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PREDID',
            title: '原始编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AFTDID',
            title: '修改后的编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PRODUCTION',
            title: '是否在产',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'BUILDTIME',
            title: '建厂时间',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 'null') {
                    return "-";
                } else {
                    return value;
                }
            }
        }, {
            field: 'LINK',
            title: '筛选企业',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'IS_GUIMO',
            title: '是否符合筛选原则',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'qiye',
            title: '企业规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SURVEY_STATUS',
            title: '核查状态',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "存疑";
                } else if (value == 0) {
                    return "待核查";
                } else if (value == 2) {
                    return "完成";
                }
            }
        }, {
            field: 'SURVEY_PROGRESS',
            title: '核查进度',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "省";
                } else if (value == 0) {
                    return "国家";
                } else if (value == 2) {
                    return "市";
                } else if (value == 3) {
                    return "县";
                }
            }
        }, {
            field: 'UPDATA_STATUS',
            title: '更新类型',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "默认未变化";
                } else if (value == 3) {
                    return "位置更新";
                } else if (value == 5) {
                    return "属性更新";
                } else if (value == 7) {
                    return "位置更新和属性更新";
                } else if (value == 8) {
                    return "新增点";
                } else if (value == 10) {
                    return "新增点和位置更新";
                } else if (value == 12) {
                    return "新增点和属性更新";
                } else if (value == 14) {
                    return "新增点、位置更新和属性更新";
                }
            }
        },
    ]
};


/*工业废水*/
var gyfs1 = {
    url: "/seimp/share/getT_GY_WASTEBASCIMESSAGE2.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.city = $("#g3").val();
        datas.province = $("#g2").val();
        datas.keyword = $("#g1").val();
        datas.county = "";
        datas.industry = $("#g5").val();

        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'PARTICULARNAME',
            title: '详细名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'YEAR',
            title: '监测年',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QUARTER',
            title: '季度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'MONITORNAME',
            title: '监测点名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'MONITOR_ITEM_NAME',
            title: '监测项目名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WASTE_IMPORT',
            title: '废水处理设施进口浓度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'POLLUTANT_CONCENTRATION',
            title: '污染物浓度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DISCHARGE_S',
            title: '排放上限',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DISCHARGE_X',
            title: '排放下限',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DISCHARGE_MONAD',
            title: '排放单位',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'EXCEED_NUMBER',
            title: '超标倍数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'POLLUTANT_QUALIFIED',
            title: '污染物浓度是否达标',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'VALUATION',
            title: '是否参与评价',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'RECEIVING_WATERNAME',
            title: '受纳水体名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'THE_DIRECTION',
            title: '排水去向',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'REGISTER_TYPE',
            title: '登记注册类型',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SCALE',
            title: '规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'RUN_NORMAL_MOVE',
            title: '治理设施是否正常运行',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WASTE_RANK',
            title: '废水控制级别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GASE_RANK',
            title: '废气控制级别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LONGTITUDE_INDEX',
            title: '中心经度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LATITUDE_INDEX',
            title: '中心纬度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ENTERPRISE_SITE',
            title: '企业详细地址',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WASTE_MOUTH_NUMBER',
            title: '废水排放口数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GAS_EQUIPMENT_NUMBER',
            title: '废气排放设备数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'GAS_MOUTH_NUMBER',
            title: '废气排放口数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'S02_GROSS_VALUE',
            title: 'SO2总量控制值',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'C0D_GROSS_VALUE',
            title: 'COD总量控制值',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'POLLUTION_DECLARE_MARK',
            title: '排污申报登记号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'INORGANIZATION_PFDS',
            title: '无组织排放点数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'EGALPERSON_NAME',
            title: '法人代表姓名',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SOURCE_CONTACTS',
            title: '污染源监测联系人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PHONE',
            title: '电话',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FAXES',
            title: '传真',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DAWK_CODE',
            title: '邮政编码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CWGY_SKETCH',
            title: '产污工艺简述',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WRCL_SKETCH',
            title: '污染处理工艺简述',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CONTACT_SECTION',
            title: '污染源监测联系部门',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'POLLUTED_ATTRIBUTE',
            title: '排口属性',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'MONITOR_JD',
            title: '监测点经度',
            align: 'center',
            valign: 'middle'


        }, {
            field: 'MONITOR_WD',
            title: '监测点纬度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'MONTH',
            title: '监测月',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DAYS',
            title: '监测日',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'POLLUTE_PF_VALUE',
            title: '污染物排放量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WASTE_PF_VALUE',
            title: '废水排放量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'MONITORING_VALUE',
            title: '在线监测污染物排放浓度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LOAD_CONDITION',
            title: '工况负荷',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DATA_INTEGRITY',
            title: '数据是否完整',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'CAUSE',
            title: '原因',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FREQUENCY',
            title: '次数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'IMPORT_GAS_QUANTITY',
            title: '进口水量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PROVINCE',
            title: '省级行政区',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'MUNICIPAL',
            title: '市级行政区',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ONE_BUSINESSNAME',
            title: '一级行业名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TWO_BUSINESSNAME',
            title: '二级行业名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'THREE_BUSINESSNAME',
            title: '三级行业名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CUSTOM_ATTRIBUTE',
            title: '自定义属性',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'STANDARD_NAME',
            title: '标准名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'UPDATETIME_HBB_BIGDATA',
            title: '是否更新',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'UPDATEFLAG_HBB_BIGDATA',
            title: '推送时间',
            align: 'center',
            valign: 'middle'
        }
    ]
};

/*企业信息*/
var qyxx1 = {

    url: "/seimp/share/getQYXX.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.xxmc = $("#qy1").val();
        datas.flmc = $("#qy2").val();
        datas.lxmc = $("#qy3").val();
        datas.lbmc = $("#qy4").val();
        datas.xxdz = $("#qy5").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'SYND',
            title: '统计年度',
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
            field: 'XXMC',
            title: '法人单位名称',
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
            field: 'FRDB',
            title: '法定代表人',
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
            field: 'FLMC',
            title: '行业分类',
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
            field: 'LXMC',
            title: '登记注册类型',
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
            field: 'LBMC',
            title: '单位类别',
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
            field: 'GXMC',
            title: '企业关系名称',
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
            field: 'GMMC',
            title: '企业规模名称',
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
            field: 'DZ_1',
            title: '省',
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
            field: 'DZ_2',
            title: '市',
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
            field: 'DZ_3',
            title: '县',
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
            field: 'DZ_4',
            title: '乡',
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
            field: 'DZ_5',
            title: '村',
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
            field: 'JD',
            title: '街道',
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
            field: 'SQ',
            title: '社区门牌',
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
            field: 'XXDZ',
            title: '详细地址',
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
            field: 'QH',
            title: '区号',
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
            field: 'YZBM',
            title: '邮政编码',
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
            field: 'DH',
            title: '电话',
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
            field: 'FJ',
            title: '分机',
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
            field: 'CZ',
            title: '传真',
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
            field: 'YJ',
            title: '邮件',
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
            field: 'WZ',
            title: '网站',
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
            field: 'JD_D',
            title: '中心经度-度',
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
            field: 'JD_F',
            title: '中心经度-分',
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
            field: 'JD_M',
            title: '中心经度-秒',
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
            field: 'WD_D',
            title: '中心纬度-度',
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
            field: 'WD_F',
            title: '中心纬度-分',
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
            field: 'WD_M',
            title: '中心纬度-秒',
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
            field: 'ZDYLBMC',
            title: '排放源分类名称',
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
            field: 'BZ',
            title: '备注',
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
            field: 'UpdateTime',
            title: '更新时间',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == "(null)") {
                    return "-";
                } else {
                    return value
                }
            }

        }
    ]

}

//企业基本信息(危险化学品)
var qyxxh1 = {
    url: "/seimp/share/getQYXXH.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.dwmc = $("#qyh1").val();
        datas.dz_1 = $("#qyh2").val();
        datas.hyflmc = $("#qyh3").val();
        datas.zclxmc = $("#qyh4").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'DWMC',
            title: '企业名称',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'CYM',
            title: '曾用名',
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
            field: 'FDDBR',
            title: '法定代表人',
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
            field: 'TJND',
            title: '调查年度',
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
            field: 'FRDB',
            title: '法定代表人',
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
            field: 'DZ_1',
            title: '省',
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
            field: 'DZ_2',
            title: '市',
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
            field: 'DZ_3',
            title: '县',
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
            field: 'DZ_4',
            title: '乡',
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
            field: 'DZ_5',
            title: '街道',
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
            field: 'DZ_6',
            title: '号',
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
            field: 'YB',
            title: '邮编',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZXJD_D',
            title: '中心经度-度',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZXJD_F',
            title: '中心经度-分',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZXJD_M',
            title: '中心经度-秒',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZXWD_D',
            title: '中心纬度-度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZXWD_F',
            title: '中心纬度-分',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZXWD_M',
            title: '中心纬度-秒',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'WXQY',
            title: '危险化学品生产企业',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'MC',
            title: '工业园区级别',
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
            field: 'YQJB_QT',
            title: '工业园区其他级别',
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
            field: 'YQMC',
            title: '所在工业园区名称',
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
            field: 'HYFLMC',
            title: '行业分类名称',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZCLXMC',
            title: '企业登记注册类型',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZCZJ',
            title: '注册资金（万元）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'CQMJ',
            title: '厂区面积（平方米）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'ZGRS',
            title: '职工人数（人）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'NSCXS',
            title: '年生产小时',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'QYGMMC',
            title: '企业规模',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'JCSJ_N',
            title: '建厂时间-年',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'JCSJ_Y',
            title: '建厂时间-月',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'KJSJ_N',
            title: '最新改扩建时间-年',
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
            field: 'KJSJ_Y',
            title: '最新改扩建时间-月',
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
            field: 'DH',
            title: '填表人联系电话',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'CZ',
            title: '传真号码',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'SJ',
            title: '手机号码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'EMAIL',
            title: '电子邮箱',
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
            field: 'FQPFL',
            title: '废气排放量（万立方米/年）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'FSCSL',
            title: '废水产生量（吨/年）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FSPFL',
            title: '废水排放量（吨/年）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'FSPFQXMC',
            title: '废水排放去向',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SNSTMC',
            title: '废水受纳水体名称',
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
            field: 'GFCSL',
            title: '一般固体废物产生量（吨/年）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'WFCSL',
            title: '危险废物产生量（吨/年）',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'WFCZ_ZX',
            title: '危险废物处置方式-自行处理',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == "(null)") {
                    return "-";
                } else if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'WFCZ_WT',
            title: '危险废物处置方式-委托处理',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'WFCZJGMC',
            title: '危险废物处置机构名称',
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
            field: 'YJYA',
            title: '环境应急预案编制情况',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "有";
                } else if (value == 0) {
                    return "无"
                }
            }
        }, {
            field: 'YJYADW',
            title: '环境应急预案备案单位',
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
            field: 'HJPJ',
            title: '环境影响评价情况',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "有";
                } else if (value == 0) {
                    return "无"
                }
            }
        }, {
            field: 'HJPJZZ',
            title: '环评文件中环境风险评价专章情况',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "有";
                } else if (value == 0) {
                    return "无"
                }
            }
        }, {
            field: 'HJSG',
            title: '近10年发生突发环境事件情况',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "有";
                } else if (value == 0) {
                    return "无"
                }
            }
        }, {
            field: 'HJSG_COUNT',
            title: '事故次数',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'DWFZR',
            title: '单位负责人',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'SHR',
            title: '审核人',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'TBR',
            title: '填表人',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'TBSJ',
            title: '填表时间',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'REMARK',
            title: '备注',
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
            field: 'UPDATETIME',
            title: '更新日期',
            align: 'center',
            valign: 'middle'
        }
    ]

}

/*网络舆情*/
var wlyq1 = {
    url: "/seimp/share/getWLYQ.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.newsType = $("#wlyq2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'title',
            title: '标题',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'content',
            title: '内容',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'url',
            title: '链接',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'source',
            title: '发布部门',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'fetchTime',
            title: '抓取时间',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'summary',
            title: '摘要',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'newsType',
            title: '所属分类',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'domain',
            title: '网站',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'chinaRegion1',
            title: '相关省份',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'chinaRegion2',
            title: '相关市',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'chinaRegion3',
            title: '相关县',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DICT_type',
            title: '资讯类型',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'state',
            title: '审核状态',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 0) {
                    return "已审核";
                }
            }
        }
    ]
};
/*污染地块*/
var wrdk1 = {
    url: "/seimp/share/getWrdkData.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.wrdkbm = $("#wr1").val();
        datas.province = $("#wr2").val();
        datas.lxrxm = $("#wr3").val();
        datas.fddbr = $("#wr4").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'WRDKBM',
            title: '污染地块编码',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'provinceName',
            title: '省',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'cityName',
            title: '市',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'countyName',

            title: '县',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'COUNTRY_CODE',
            title: '行政编码',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'BZ',
            title: '污染地块备注',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'HYLB ',
            title: '行业类别 ',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WRDK_AREA',
            title: '占地面积',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WRDK_LAT',
            title: '污染地块中心经度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'WRDK_LNG',
            title: '污染地块中心纬度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TSAMP',
            title: '时间',
            align: 'center',
            valign: 'middle'

        },
        {
            field: 'POLLUETED',
            title: '是否污染',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'SCJDBM',
            title: '所处阶段',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'FXJB',
            title: '风险级别',
            align: 'center',
            valign: 'middle'
        }, {
            field: 'INSERTTIME',
            title: '更新时间',
            align: 'center',
            valign: 'middle'
        }
    ]
};


/*酸雨*/
var sy1 = {
    url: "/seimp/share/getAcidrainInfo.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.so = $("#s1").val();
        datas.k = $("#s3").val();
        datas.ca = $("#s2").val();
        datas.na = $("#s4").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'A06005_DT_FLAG',
            title: '硫酸根离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06010_DT_FLAG',
            title: '钙离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06013_DT_FLAG',
            title: '钾离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06012_DT_FLAG',
            title: '钠离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06013',
            title: '钾离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06010',
            title: '钙离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06008',
            title: '氯离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06006',
            title: '硝酸根离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06003',
            title: '降水pH值',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06012',
            title: '钠离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06005',
            title: '硫酸根离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06011',
            title: '镁离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06009',
            title: '铵离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06007',
            title: '氟离子',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06004',
            title: '电导率(mS/m)',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_UPFLAG',
            title: '上传状态',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'INF_SAMPLEDATE_TIME',
            title: '采样时间',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_EMI',
            title: '结束分',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_EH',
            title: '结束时',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_ED',
            title: '结束日',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_EM',
            title: '结束月',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_EY',
            title: '结束年',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_SMI',
            title: '开始分',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_SH',
            title: '开始时',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_SD',
            title: '开始日',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_SM',
            title: '开始月',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_SY',
            title: '开始年',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DATA_VERSION',
            title: '数据版本',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DATA_UPLOADINGTIME',
            title: '数据上传时间',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'REDUNDANCY_FLAG',
            title: '冗余标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AUDIT_FLAG',
            title: '审核标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'AR_INF_RAINFALL',
            title: '降雨量(mm)',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'PT_CODE',
            title: '降水类型代码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ARM_P_CODE',
            title: '点位代码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06006_DT_FLAG',
            title: '硝酸根离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06003_DT_FLAG',
            title: '降水 pH 值监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06011_DT_FLAG',
            title: '镁离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06004_DT_FLAG',
            title: '电导率(mS/m)监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06007_DT_FLAG',
            title: '氟离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06009_DT_FLAG',
            title: '铵离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'A06008_DT_FLAG',
            title: '氯离子监测标志',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CS_FILENAME',
            title: '文件名',
            align: 'center',
            valign: 'middle'

        }
    ]
};


/*企业基本信息(固废)*/
var qyxxgf1 = {
    url: "/seimp/share/getQYXXGF.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.dwmc = $("#qygf1").val();
        datas.dwszsf = $("#qygf2").val();
        datas.qybz = $("#qygf3").val();
        datas.sfwfcsy = $("#qygf4").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'DWMC',
            title: '单位名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'provinceName',
            title: '单位所在省份',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'cityName',
            title: '单位所在城市',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'countyName',
            title: '单位所在区县',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWDZ',
            title: '单位地址',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XZQHBZBB',
            title: '行政区划版本',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'JD',
            title: '经度',
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
            field: 'WD',
            title: '纬度',
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
            field: 'YZBM',
            title: '邮政编码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HYFLBZBB',
            title: '行业分类版本',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QYGM',
            title: '企业规模',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "大型";
                } else if (value == 2) {
                    return "中型"
                } else if (value == 3) {
                    return "小型"
                } else if (value == 4) {
                    return "微型"
                }
            }
        }, {
            field: 'DLMC',
            title: '登陆名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FDDBR',
            title: '法定代表人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FDDBRDH',
            title: '法定代表人电话',
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
            field: 'LXR',
            title: '联系人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXRDH',
            title: '联系人电话',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXRCZ',
            title: '联系人传真',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXRDZYX',
            title: '联系人电子邮箱',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXRSJ',
            title: '联系人手机',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SFWFCSY',
            title: '是否危废产生源企业',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFYFCSY',
            title: '是否医废产生源',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFYBGYCSY',
            title: '是否一般工业产生源',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFWSWNCSY',
            title: '是否污水污泥产生源',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFWFYS',
            title: '是否危废运输',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFWFJY',
            title: '是否危废经营',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFWFCK',
            title: '是否危废出口企业',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFJKLY',
            title: '是否进口利用企业',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SFZX',
            title: '是否最新',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SHZT',
            title: '审核状态',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'SYNC',
            title: '是否同步',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }, {
            field: 'USERNAME',
            title: '用户名',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QYBZ',
            title: '是否启用',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }

        }, {
            field: 'SJC',
            title: '时间',
            align: 'center',
            valign: 'middle'

        },
    ]
};


/*危险废物经营单位基本情况信息*/
var wxjy1 = {
    url: "/seimp/share/getWXJY.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.dwmc = $("#wxj1").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'BBNF',
            title: '报表年份',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWMC',
            title: '单位名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FRMC',
            title: '法人名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FDDBR',
            title: '法定代表人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZS',
            title: '住所',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'YZBM',
            title: '邮政编码',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'provinceName',
            title: '设施行政区划',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SSJD',
            title: '设施所在经度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SSWD',
            title: '设施所在纬度',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'YXQX',
            title: '有效期限',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FZRQ',
            title: '发证日期',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                return getMyDate(value);
            },
        }, {
            field: 'HZNJYZGM',
            title: '核准年经营总规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HZNJYCZGM',
            title: '核准年经营处置规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HZNJYLYGM',
            title: '核准年经营利用规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XKZBH',
            title: '许可证编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FZJG',
            title: '发证机关',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'danwei',
            title: '经营单位类别',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJNJYZGM',
            title: '时机年经营总规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJNJYCZGM',
            title: '实际年经营处置规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJNJYLYGM',
            title: '实际年经营利用规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SGYAQK',
            title: '事故预案情况',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "制定";
                } else if (value == 2) {
                    return "制定并参照《危险废物经营单位编制应急预案指南》（原国家环境保护总局公告2007年第48号）确定了应急协调人或建立类似制度。";
                } else {
                    return "";
                }
            }
        }, {
            field: 'YLQK',
            title: '演练情况',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SGFSCS',
            title: '事故发生次数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'JYJLBQK',
            title: '建立危险废物经营情况记录簿情况',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "已建立";
                } else if (value == 0) {
                    return "未建立";
                }
            }
        }, {
            field: 'ZCZ',
            title: '总产值',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'ZGRS',
            title: '职工总人数',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'LXR',
            title: '联系人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DZYX',
            title: '电子邮箱',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DH',
            title: '电话',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'CZ',
            title: '传真',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJ',
            title: '手机',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWFZR',
            title: '单位发证人',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SCRQ',
            title: '生产日期',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'BBZT',
            title: '报表状态',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FJBCLJ',
            title: '附件路径',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XKZBHSD',
            title: '许可证编号（手动）',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJWXFWCZL',
            title: '实际危险废物处置量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJYLFWCZL',
            title: '实际医疗废物处置量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TJBZ',
            title: '提交标识',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }

        }, {
            field: 'YTJLHZL',
            title: '以桶计量核准量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJYTJLHZL',
            title: '实际以桶计量核准量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HZNJYWXCZGM',
            title: '核准年经营危险处置规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HZNJYYLCZGM',
            title: '核准年经营医疗处置规模',
            align: 'center',
            valign: 'middle'

        }
    ]
};

/*危险废物填埋场基本情况信息*/
var wxtm1 = {
    url: "/seimp/share/getWXTM.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.dwmc = $("#wx1").val();
        datas.sjqh = $("#wx2").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
        {
            field: 'BBNF',
            title: '报表年份',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'DWMC',
            title: '单位名称',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'XKZBH',
            title: '许可证编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'provinceName',
            title: '省级区划',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'cityName',
            title: '市级区划',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'countyName',
            title: '县级区划',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'QYLSBH',
            title: '企业历史编号',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'FZJG',
            title: '发证机关',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TMCRL',
            title: '填埋场容量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'YTMRL',
            title: '截至年底已填埋容量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'HZTMGM',
            title: '核准填埋规模',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SJTML',
            title: '实际填埋量',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'BBZT',
            title: '报表状态',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'SCRQ',
            title: '时间',
            align: 'center',
            valign: 'middle'

        }, {
            field: 'TJBZ',
            title: '提交标识',
            align: 'center',
            valign: 'middle',
            formatter: function (value, row, index) {
                if (value == 1) {
                    return "是";
                } else if (value == 0) {
                    return "否"
                }
            }
        }
    ]
};


/*涉重有色金属采矿权项目*/
var ckq1 = {
    url: "/seimp/share/getCKQ.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.xkzh = $("#ckq_xkzh").val();
        datas.ksmc = $("#ckq_ksmc").val();
        datas.kyqr = $("#ckq_kyqr").val();
        datas.kz = $("#ckq_kz").val();
        datas.kcfs = $("#ckq_kcfs").val();
        return datas;
    },
    columns: [{
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

    },
    ]
}

var glocolumns;
var column1 = [
    /*  { // 列设置
     field: 'state',
     // 使用单选框
     },*/
    {
        field: 'NAME',
        title: '详细名称',
        align: 'center',
        valign: 'middle',
        //  sortable: true // 开启排序功能
    }, {
        field: 'WASTE_IMPORT',
        title: '废水处理设施进口浓度',
        align: 'center',
        valign: 'middle',
        //  sortable: true // 开启排序功能
    }, {
        field: 'POLLUTANT_CONCENTRATION',
        title: '污染物浓度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DISCHARGE_S',
        title: '排放上限',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DISCHARGE_X',
        title: '排放下限',
        align: 'center',
        valign: 'middle'
    }, {
        field: 'EXCEED_NUMBER',
        title: '排放单位',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DISTRICT_CODE',
        title: '超标倍数',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'POLLUTANT_QUALIFIED',
        title: '污染物浓度是否达标',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'VALUATION',
        title: '是否参与评价',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'RECEIVING_WATERNAME',
        title: '受纳水体名称',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'THE_DIRECTION',
        title: '排水去向',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REGISTER_TYPE',
        title: '登记注册类型',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'SCALE',
        title: '规模',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'RUN_NORMAL_MOVE',
        title: '治理设施是否正常运行',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'WASTE_RANK',
        title: '废水控制级别',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'GASE_RANK',
        title: '废气控制级别',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'SCALE_CODE',
        title: '规模代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'POLLUTION_RANK_CODE',
        title: '污染源控制级别代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'POLLUTION_TYPE_CODE',
        title: '污染源类型代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'LONGTITUDE_INDEX',
        title: '中心经度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'LATITUDE_INDEX',
        title: '中心纬度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'ENTERPRISE_SITE',
        title: '企业详细地址',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'WASTE_MOUTH_NUMBER',
        title: '废水排放口数',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'C0D_GROSS_VALUE',
        title: 'COD总量控制值',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'POLLUTION_DECLARE_MARK',
        title: '排污申报登记号',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'INORGANIZATION_PFDS',
        title: '无组织排放点数',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'EGALPERSON_NAME',
        title: '法人代表姓名',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'SOURCE_CONTACTS',
        title: '污染源监测联系人',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'PHONE',
        title: '电话',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'FAXES',
        title: '传真',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DAWK_CODE',
        title: '邮政编码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'START_BUSINESS_TIME',
        title: '开业时间',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'CWGY_SKETCH',
        title: '产污工艺简述',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'WRCL_SKETCH',
        title: '污染处理工艺简述',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'FINALLY_ALTER_TIME',
        title: '最后修改时间',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DELETE_SATE',
        title: '删除状态',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'GAS_POLLUTION_RANK_CODE',
        title: '污染源控制级别代码气',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'EXEC_STANDARD_CODE',
        title: '执行标准代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'EXEC_CONDITION_CODE',
        title: '执行标准条件代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'POLLUTED_ATTRIBUTE',
        title: '排口属性',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'MONITOR_JD',
        title: '监测点经度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'MONITOR_WD',
        title: '监测点纬度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'MONTH',
        title: '监测月',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DAYS',
        title: '监测日',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'POLLUTE_PF_VALUE',
        title: '污染物排放量',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'WASTE_PF_VALUE',
        title: '废水排放量',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'MONITORING_VALUE',
        title: '在线监测污染物排放浓度',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DATA_INTEGRITY',
        title: '数据是否完整',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'CAUSE',
        title: '原因',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'FREQUENCY',
        title: '次数',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'IMPORT_GAS_QUANTITY',
        title: '进口水量',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'ENTERPRISE_CODE',
        title: '企业代码',
        align: 'center',
        valign: 'middle',
    }
    , {
        field: 'RECEIVING_WATERCODE',
        title: '受纳水体代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'THE_DIRECTION_TYPECODE',
        title: '排水去向类型代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DISTRICT_CODE',
        title: '行政区代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'PROVINCE',
        title: '省级行政区',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'MUNICIPAL',
        title: '市级行政区',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'ONE_BUSINESSNAME',
        title: '一级行业名称',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'ONE_BUSINESSCODE',
        title: '一级行业代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'TWO_BUSINESSNAME',
        title: '二级行业名称',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'TWO_BUSINESSCODE',
        title: '二级行业代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'THREE_BUSINESSNAME',
        title: '三级行业名称',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'THREE_BUSINESSCODE',
        title: '三级行业代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'DISCHARGE_GL_CODE',
        title: '排放规律代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'REGISTER_TYPECODE',
        title: '登记注册类型代码',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'CUSTOM_ATTRIBUTE',
        title: '自定义属性',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'STANDARD_NAME',
        title: '标准名称',
        align: 'center',
        valign: 'middle',
    }, {
        field: 'UPDATEFLAG_HBB_BIGDATA',
        title: '是否更新',
        align: 'center',
        valign: 'middle',
    }
];

/*污染地块结构*/
var initParam34 = {
    url: "/seimp/share/getPollutionLandStructureData.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        //    datas.type = $("#js3").val();
        datas.OLDENTERPRISENAMEPar = $("#OLDENTERPRISENAMEPar").val();//原用地企业名称
        var DATASOURCEPar = $("#DATASOURCEPar").selectpicker("val");//地块名单来源
        if(DATASOURCEPar != null && DATASOURCEPar.length > 1){
        	datas.DATASOURCEPar = $.inArray("",DATASOURCEPar) >=0 ? "" : DATASOURCEPar.join(",");
        }else if(DATASOURCEPar != null && DATASOURCEPar.length == 1){
        	datas.DATASOURCEPar = DATASOURCEPar.toString();
        }
        datas.STARTRUNYEARTIMEParStart = $("#STARTRUNYEARTIMEParStart").val();//开始运营时间
        datas.STARTRUNYEARTIMEParEnd = $("#STARTRUNYEARTIMEParEnd").val();//开始运营时间
        
        datas.ENDRUNYEARTIMEParStart = $("#ENDRUNYEARTIMEParStart").val();//结束运营时间
        datas.ENDRUNYEARTIMEParEnd = $("#ENDRUNYEARTIMEParEnd").val();//结束运营时间
        
        datas.MAINPRODUCTPar = $("#MAINPRODUCTPar").val();//主要产品
        var INDUSTRYTYPEPar = $("#INDUSTRYTYPEPar").selectpicker("val");//行业分类
        if(INDUSTRYTYPEPar != null && INDUSTRYTYPEPar.length > 1){
        	datas.INDUSTRYTYPEPar = $.inArray("",INDUSTRYTYPEPar) >=0 ? "" : INDUSTRYTYPEPar.join(",");
        }else if(INDUSTRYTYPEPar != null && INDUSTRYTYPEPar.length == 1){
        	datas.INDUSTRYTYPEPar = INDUSTRYTYPEPar.toString();
        }
        var POTENTIALPOLLUTANTPar = $("#POTENTIALPOLLUTANTPar").val();//潜在污染物
        if(POTENTIALPOLLUTANTPar != null && POTENTIALPOLLUTANTPar.length > 1){
        	datas.POTENTIALPOLLUTANTPar = $.inArray("",POTENTIALPOLLUTANTPar) >=0 ? "" : POTENTIALPOLLUTANTPar.join(",");
        }else if(POTENTIALPOLLUTANTPar != null && POTENTIALPOLLUTANTPar.length == 1){
        	datas.POTENTIALPOLLUTANTPar = POTENTIALPOLLUTANTPar.toString();
        }
        datas.NOWENTERPRISENAMEPar = $("#NOWENTERPRISENAMEPar").val();//现用地企业名称
        var LANDSTATUSPar = $("#LANDSTATUSPar").selectpicker("val");//地块状态
        if(LANDSTATUSPar != null && LANDSTATUSPar.length > 1){
        	datas.LANDSTATUSPar = $.inArray("",LANDSTATUSPar) >=0 ? "" : LANDSTATUSPar.join(",");
        }else if(LANDSTATUSPar != null && LANDSTATUSPar.length == 1){
        	datas.LANDSTATUSPar = LANDSTATUSPar.toString();
        }
        
        //处理时间
        
        
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    },
    {
        title: '原用地企业名称',
        field: 'OLDENTERPRISENAME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '地块名单来源',
        field: 'DATASOURCE',
        align: 'center',
        valign: 'middle',
    }, {
        title: '省',
        field: 'PROVINCENAME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '市',
        field: 'CITYNAME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '区',
        field: 'DISTRICTNAME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '详细地址',
        field: 'DETAILEDADDRESS',
        align: 'center',
        valign: 'middle',
    }, {
        title: '地块点坐标',
        field: 'POINTCOORDINATE',
        align: 'center',
        valign: 'middle',
        
    }, {
        title: '地块面坐标（百度坐标）',
        field: 'POLYGONCOORDINATE',
        align: 'center',
        valign: 'middle',
        visible:false
    }, {
        title: '开始运营时间',
        field: 'STARTRUNYEARTIME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '结束运营时间',
        field: 'ENDRUNYEARTIME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '占地面积（万平方米）',
        field: 'AREA',
        align: 'center',
        valign: 'middle',
    }, {
        title: '主要产品',
        field: 'MAINPRODUCT',
        align: 'center',
        valign: 'middle',
    }, {
        title: '行业分类',
        field: 'INDUSTRYTYPE',
        align: 'center',
        valign: 'middle',
    }, {
        title: '潜在污染物',
        field: 'POTENTIALPOLLUTANT',
        align: 'center',
        valign: 'middle',
    }, {
        title: '其他潜在污染物',
        field: 'ELSEPOTENTIALPOLLUTANT',
        align: 'center',
        valign: 'middle',
    }, {
        title: '调查信息',
        field: 'RESEARCHINFO',
        align: 'center',
        valign: 'middle',
    }, {
        title: '附件',
        field: 'RESEARCHINFOATTACHMENTFILE',
        align: 'center',
        valign: 'middle',
        visible:false
    }, {
        title: '修复方案',
        field: 'FIXPLAN',
        align: 'center',
        valign: 'middle',
    }, {
        title: '附件',
        field: 'FIXPLANATTACHMENTFILE',
        align: 'center',
        valign: 'middle',
        visible:false
    }, {
        title: '修复验收信息',
        field: 'FIXCHECKINFO',
        align: 'center',
        valign: 'middle',
    }, {
        title: '附件',
        field: 'FIXCHECKINFOATTACHMENTFILE',
        align: 'center',
        valign: 'middle',
        visible:false
    }, {
        title: '现用地单位',
        field: 'NOWENTERPRISENAME',
        align: 'center',
        valign: 'middle',
    }, {
        title: '现用地性质',
        field: 'NOWLANDTYPE',
        align: 'center',
        valign: 'middle',
    }, {
        title: '备注',
        field: 'REMARK',
        align: 'center',
        valign: 'middle',
    }, {
        title: '地块状态',
        field: 'LANDSTATUS',
        align: 'center',
        valign: 'middle',
    }, {
        title: '地块状态更新时间',
        field: 'LANDSTATUSUPDATETIME',
        align: 'center',
        valign: 'middle',
    }
    ]
};

//地块名单来源-查询条件
function getDATASOURCEParData(){
	ajaxPost("/seimp/share/getDATASOURCEParData", {}).done(function (result) {
		$("#DATASOURCEPar").html("");
        $("#DATASOURCEPar").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#DATASOURCEPar").append('<option value="' + currItem.DATASOURCE + '">' + currItem.DATASOURCE + '</option>');
        }
        $("#DATASOURCEPar").selectpicker("refresh");
        $("#DATASOURCEPar").selectpicker("val","");
    })
}

//行业分类-查询条件
function getINDUSTRYTYPEParData(){
	ajaxPost("/seimp/share/getINDUSTRYTYPEParData", {}).done(function (result) {
        $("#INDUSTRYTYPEPar").html("");
        $("#INDUSTRYTYPEPar").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#INDUSTRYTYPEPar").append('<option value="' + currItem.INDUSTRYTYPE + '">' + currItem.INDUSTRYTYPE + '</option>');
        }
        $("#INDUSTRYTYPEPar").selectpicker("refresh");
        $("#INDUSTRYTYPEPar").selectpicker("val","");
    })
}

//潜在污染物-查询条件
function getPOTENTIALPOLLUTANTParData(){
	ajaxPost("/seimp/share/getPOTENTIALPOLLUTANTParData", {}).done(function (result) {
		$("#POTENTIALPOLLUTANTPar").html("");
        $("#POTENTIALPOLLUTANTPar").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#POTENTIALPOLLUTANTPar").append('<option value="' + currItem + '">' + currItem + '</option>');
        }
        $("#POTENTIALPOLLUTANTPar").selectpicker("refresh");
        $("#POTENTIALPOLLUTANTPar").selectpicker("val","");
    })
}

//地块状态-查询条件
function getLANDSTATUSParData(){
	ajaxPost("/seimp/share/getLANDSTATUSParData", {}).done(function (result) {
		$("#LANDSTATUSPar").html("");
        $("#LANDSTATUSPar").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#LANDSTATUSPar").append('<option value="' + currItem.LANDSTATUS + '">' + currItem.LANDSTATUS + '</option>');
        }
        $("#LANDSTATUSPar").selectpicker("refresh");
        $("#LANDSTATUSPar").selectpicker("val","");
    })
}

function getPollutionLandStructureFile() {
	var datas = {};
    //    datas.type = $("#js3").val();
    datas.OLDENTERPRISENAMEPar = $("#OLDENTERPRISENAMEPar").val();//原用地企业名称
    var DATASOURCEPar = $("#DATASOURCEPar").selectpicker("val");//地块名单来源
    if(DATASOURCEPar != null && DATASOURCEPar.length > 1){
    	datas.DATASOURCEPar = $.inArray("",DATASOURCEPar) >=0 ? "" : DATASOURCEPar.join(",");
    }else if(DATASOURCEPar != null && DATASOURCEPar.length == 1){
    	datas.DATASOURCEPar = DATASOURCEPar.toString();
    }
    datas.STARTRUNYEARTIMEParStart = $("#STARTRUNYEARTIMEParStart").val();//开始运营时间
    datas.STARTRUNYEARTIMEParEnd = $("#STARTRUNYEARTIMEParEnd").val();//开始运营时间
    
    datas.ENDRUNYEARTIMEParStart = $("#ENDRUNYEARTIMEParStart").val();//结束运营时间
    datas.ENDRUNYEARTIMEParEnd = $("#ENDRUNYEARTIMEParEnd").val();//结束运营时间
    
    datas.MAINPRODUCTPar = $("#MAINPRODUCTPar").val();//主要产品
    var INDUSTRYTYPEPar = $("#INDUSTRYTYPEPar").selectpicker("val");//行业分类
    if(INDUSTRYTYPEPar != null && INDUSTRYTYPEPar.length > 1){
    	datas.INDUSTRYTYPEPar = $.inArray("",INDUSTRYTYPEPar) >=0 ? "" : INDUSTRYTYPEPar.join(",");
    }else if(INDUSTRYTYPEPar != null && INDUSTRYTYPEPar.length == 1){
    	datas.INDUSTRYTYPEPar = INDUSTRYTYPEPar.toString();
    }
    var POTENTIALPOLLUTANTPar = $("#POTENTIALPOLLUTANTPar").val();//潜在污染物
    if(POTENTIALPOLLUTANTPar != null && POTENTIALPOLLUTANTPar.length > 1){
    	datas.POTENTIALPOLLUTANTPar = $.inArray("",POTENTIALPOLLUTANTPar) >=0 ? "" : POTENTIALPOLLUTANTPar.join(",");
    }else if(POTENTIALPOLLUTANTPar != null && POTENTIALPOLLUTANTPar.length == 1){
    	datas.POTENTIALPOLLUTANTPar = POTENTIALPOLLUTANTPar.toString();
    }
    datas.NOWENTERPRISENAMEPar = $("#NOWENTERPRISENAMEPar").val();//现用地企业名称
    var LANDSTATUSPar = $("#LANDSTATUSPar").selectpicker("val");//地块状态
    if(LANDSTATUSPar != null && LANDSTATUSPar.length > 1){
    	datas.LANDSTATUSPar = $.inArray("",LANDSTATUSPar) >=0 ? "" : LANDSTATUSPar.join(",");
    }else if(LANDSTATUSPar != null && LANDSTATUSPar.length == 1){
    	datas.LANDSTATUSPar = LANDSTATUSPar.toString();
    }
    
    ajaxPost("/seimp/share/getPollutionLandStructureFile", datas).done(function (data) {
        console.log(data.data);

        window.open(data.data);

    });
}

/*尾矿库*/
var initParam35 = {
    url: "/seimp/share/getTailingsData.do",
    queryParam: function queryParams(params) {
        var datas = {};
        datas.pageSize = params.limit;
        datas.pageNumber = params.offset;
        datas.TAILINGSNAMEPar = $("#TAILINGSNAMEPar").val();//尾矿库名称
        datas.DETAILEDADDRESSPar = $("#DETAILEDADDRESSPar").val();//详细地址
        datas.ENTERPRISENAMEPar = $("#ENTERPRISENAMEPar").val();//所属企业名称
        datas.MINERALTYPEPar = $("#MINERALTYPEPar").val();//矿物种类
        datas.BASINPar = $("#BASINPar").val();//所属流域
        datas.LEVELPar = $("#LEVELPar").val();//等别
        datas.province = $("#tailing1").val();
        datas.city = $("#tailing2").val();
        datas.cunty = $("#tailing3").val();
        return datas;
    },
    columns: [{
        //field: 'Number',//可不加  
        title: '序号',//标题  可不加  
        formatter: function (value, row, index) {
            return index + 1;
        }
    
    }, {
	    title: '尾矿库名称',
	    field: 'TAILINGSNAME',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '经度',
	    field: 'COORDINATE',
	    align: 'center',
	    valign: 'middle',
	    formatter: function (value, row, index) {
	    	var result = "";
	    	var arr1 = value.split(",");
	    	if(arr1.length > 0){
	    		var arr2 = arr1[0].split(":");
	    		if(arr2.length > 1){
	    			result = arr2[1];
	    		}
	    	}
	    	return result;
	    }
	}, {
	    title: '纬度',
	    field: 'COORDINATE',
	    align: 'center',
	    valign: 'middle',
	    formatter: function (value, row, index) {
	    	var result = "";
	    	var arr1 = value.split(",");
	    	if(arr1.length > 1){
	    		var arr2 = arr1[1].split(":");
	    		if(arr2.length > 1){
	    			result = arr2[1];
	    			if(result != ""){
	    				result = result.substr(0, result.length-1);
	    			}
	    		}
	    	}
	    	return result;
	    }
	}, {
	    title: '省',
	    field: 'PROVINCENAME',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '市',
	    field: 'CITYNAME',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '区',
	    field: 'DISTRICTNAME',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '详细地址',
	    field: 'DETAILEDADDRESS',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '所属企业名称',
	    field: 'ENTERPRISENAME',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '矿物种类',
	    field: 'MINERALTYPE',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '污染类型',
	    field: 'POLLUTETYPE',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '所属流域',
	    field: 'BASIN',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '风险',
	    field: 'RISK',
	    align: 'center',
	    valign: 'middle' 
	}, {
	    title: '等别',
	    field: 'LEVEL',
	    align: 'center',
	    valign: 'middle',
	    formatter: function (value, row, index) {
	    	console.log(typeof value);
            var result = "未知";
            
            switch (value) {
			case 0:
				result = "未知";
				break;
				
			case 1:
				result = "一等";
				break;
			
			case 2:
				result = "二等";
				break;
				
			case 3:
				result = "三等";
				break;
				
			case 4:
				result = "四等";
				break;
				
			case 5:
				result = "五等";
				break;
				
			default:
				result = "未知";
				break;
			}
             
            return result;
        }
	}, {
	    title: '图片',
	    field: 'PICTURE',
	    align: 'center',
	    valign: 'middle',
	    visible:false
	   
	}, {
	    title: '尾矿库区域范围',
	    field: 'AREACOVERAGE',
	    align: 'center',
	    valign: 'middle',
	    visible:false
	    
	}, {
	    title: '其他信息',
	    field: 'ELSEINFO',
	    align: 'center',
	    valign: 'middle' 
	

        }
    ]
};


//尾矿库
function getTailingsPar() {
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#tailing2").html("");
        $("#tailing3").html("");
        $("#tailing2").append('<option value="">全部</option>');
        $("#tailing3").append('<option value="">全部</option>');
        $("#tailing1").html("");
        $("#tailing1").append('<option value="">全部</option>');
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#tailing1").append('<option value="' + currItem.name + '">' + currItem.name + '</option>');
        }
    })
}

// 查询市
function getCityPar(idValue) {
    ajaxPost("/seimp/eliminate/getCity", {province: $("#" + idValue + "1").val()}).done(function (result) {
        $("#" + idValue + "2").html("");
        $("#" + idValue + "2").append('<option value="">全部</option>');
        $.each(result.data.result, function (i, item) {
            $("#" + idValue + "2").append('<option value="' + item.name + '">' + item.name + '</option>');
        });
    })
    $("#" + idValue + "3").html("");
    $("#" + idValue + "3").append('<option value="">全部</option>');
}
// 查询县
function getCountyPar(idValue) {
    ajaxPost("/seimp/eliminate/getCounty", {city: $("#" + idValue + "2").val()}).done(function (result) {
        $("#" + idValue + "3").html("");
        $("#" + idValue + "3").append('<option value="">全部</option>');
        console.log(result)
        $.each(result.data.result, function (i, item) {
            $("#" + idValue + "3").append('<option value="' + item.name + '">' + item.name + '</option>');
        });
    })
}

///尾矿库下载
function getTailingsFile() {
	var datas = {};
    datas.TAILINGSNAMEPar = $("#TAILINGSNAMEPar").val();//尾矿库名称
    datas.DETAILEDADDRESSPar = $("#DETAILEDADDRESSPar").val();//详细地址
    datas.ENTERPRISENAMEPar = $("#ENTERPRISENAMEPar").val();//所属企业名称
    datas.MINERALTYPEPar = $("#MINERALTYPEPar").val();//矿物种类
    datas.BASINPar = $("#BASINPar").val();//所属流域
    datas.LEVELPar = $("#LEVELPar").val();//等别
    datas.province = $("#tailing1").val();
    datas.city = $("#tailing2").val();
    datas.cunty = $("#tailing3").val();
    ajaxPost("/seimp/share/getTailingsFile", datas).done(function (data) {
        console.log(data.data);

        window.open(data.data);

    });
}

/*返回*/
function back() {
    changeBread([{title: '共享交换', link: 'javascript:backPage()'}, {title: '数据集列表'}]);
    $('.box_crumbs .right_button').remove()
    $(".v1").hide();
    $("#searchPart1").show();
    $("#part1").show();
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
}
function backPage() {
    window.location.href="#data";
    changeBread([{title: '共享交换'}]);
    $('.box_crumbs .right_button').remove()
    $(".v1").show();
    $(".data-city ").show();
    $("#part1").show();
    $("#part4").hide();
    $("#searchPart1").show();
    $(".data-basic").hide();
}

//左侧菜单

$('.data-proto .proto-list .proto-cell').hover(function () {
    $(this).children('.cell-img').css('border', 'none')
}, function () {
    $(this).children('.cell-img').css('border', '1px solid #ccc')
})
function changePage(type) {
    if (type == 1) {
        $(".v1").hide();
        $("#part4").show();
        $('.box_crumbs .right_button').remove()
        $('.data_page ').hide();
        $('.data_bottom_table ').hide();
        $('.data_bottom_upload ').hide();
        $('.box_crumbs').append('<a class="button_blue pull-right right_button" onclick="changePage(type = 2)">查看数据</a>')
    } else {
        $(".v1").hide();
        $("#part2").show();
        $('.box_crumbs .right_button').remove()
        $('.data_page ').hide();
        $('.data_bottom_table ').hide();
        $('.data_bottom_upload ').hide();
        $('.box_crumbs').append('<a class="button_blue pull-right right_button" onclick="changePage(type = 1)">查看元数据</a>');

    }
}
function datePage() {
    changeBread([{title: '共享交换', link: 'javascript:backDatePage()'}, {title: '数据统计'}]);
    $('.data-city ').hide();
    $('#pic1 ').hide();
    $(".v1").hide();
    $('.data_page ').show();
    var url = '/seimp/share/getStaByMinistry'
    ajaxPost(url, {}).done(function (res) {
        var name = []
        $.each(res.data, function (key, val) {
            name.push(val.name)
        })
        var myChart1 = echarts.init(document.getElementById('mychart1'));
        option1 = {
            title: {
                text: '部委数据统计',
                subtext: '',
                x: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                /*left: 'right',*/
                x: 'right',
                y: 'bottom',
                data: name
            },
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: res.data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart1.setOption(option1);
    })
    var url2 = '/seimp/share/getStaByDateType'
    ajaxPost(url2, {}).done(function (res) {
        var myChart = echarts.init(document.getElementById('mychart'));
        option = {
            color: ['#3398DB'],
            title: {
                text: '数据分类统计',
                subtext: '',
                x: 'center'
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
                    data: res.data.names,
                    axisLabel: {
                        interval: 0
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '数据量',
                    type: 'bar',
                    barWidth: '60%',
                    data: res.data.values
                }
            ]
        };
        myChart.setOption(option);
    })
    getTables();
}
function getTables() {
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
    var nowdate = new Date();
    var lastWeek = new Date(nowdate - 7 * 24 * 3600 * 1000).format("yyyy-MM-dd");
    $("#date1").val(lastWeek);
    $(".selectpicker").selectpicker({
        noneSelectedText: '请选择'//默认显示内容
    });
    $(window).on('load', function () {
        $('.selectpicker').selectpicker('val', '');
        $('.selectpicker').selectpicker('refresh');
    });
    ajaxPost("/seimp/share/getRefreshTable", {}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            var first = "";
            for (var i = 0; i < data.data.length; i++) {
                var tem = data.data[i];
                if (i == 0) {
                    first = tem.table_name;
                }
                html += "<option value='" + tem.table_name + "'>" + tem.name + " </option>";
            }
            $("#tables").html(html);
            $('.selectpicker').selectpicker('refresh');
            if (first != "") {
                $("#tables").selectpicker('val', first);
            }
            getRefreshData();
        }
    });
}

function getRefreshData() {
    var tables = $("#tables").val();
    if (tables == "" || tables == undefined || tables == null) {
        return toastr.error("请选择数据集");
    }
    var time1 = $("#date1").val();
    var time2 = $("#date2").val();
    if (time2 != "" && time2 != undefined && time2 != null) {
        if (time1 > time2) {
            return toastr.error("起始时间不能大于结束时间");
        }
    }
    var datas = {
        startTime: time1,
        endTime: time2,
        tables: tables
    };
    ajaxPost("/seimp/share/getRefreshData", datas).done(function (res) {
        if (res.status == 0) {
            var myChart3 = echarts.init(document.getElementById('mychart3'));
            var option3 = {
                color: ['#3398DB'],
                title: {
                    text: '数据更新统计',
                    subtext: '',
                    x: 'center'
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
                        data: res.data.names,
                        axisLabel: {
                            interval: 0
                        },
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '数据量',
                        type: 'bar',
                        barWidth: '60%',
                        data: res.data.values
                    }
                ]
            };
            myChart3.setOption(option3);
        }
    });
}
function backDatePage() {
    changeBread([{title: '共享交换'}]);
    $('.data-city ').show();
    $('#pic1 ').show();
    $('.data_page ').hide();
    $('.data_bottom_table ').hide();
    $('.data_bottom_upload ').hide();
    $('.showUploadDate ').hide();
    $('.showUploadAdd ').hide();
    $('.businessSystem ').hide();
}
function showBottomData() {
    changeBread([{title: '共享交换', link: 'javascript:backDatePage()'}, {title: '接口服务'}]);
    $('.data-city ').hide();
    $('#pic1 ').hide();
    $(".v1").hide();
    $('.data_bottom_table ').show();
    $('.showUploadAdd ').show();
    $('.data_bottom_upload ').hide();
    jkcx();
}
function showUpLoad() {
    changeBread([{title: '共享交换', link: 'javascript:backDatePage()'}, {
        title: '服务接口',
        link: 'javascript:showBottomData()'
    }, {title: '接口注册'}]);
    $('.data-city ').hide();
    $('#pic1 ').hide();
    $(".v1").hide();
    $('.data_bottom_upload ').show();
    $('.data_bottom_table ').hide();
    $('.showUploadAdd ').hide();
}

function showUploadDate() {
    changeBread([{title: '共享交换', link: 'javascript:backDatePage()'}, {title: '数据上传'}]);
    $('.data-city ').hide();
    $('#pic1 ').hide();
    $(".v1").hide();
    $('.showUploadDate ').show();
    $('#getExile').bootstrapTable({
        data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        columns: [{
            field: 'num',
            title: '序号'
        }, {
            field: 'province',
            title: '省'
        }, {
            field: 'city',
            title: '市'
        }, {
            field: 'county',
            title: '县'
        }, {
            field: 'name',
            title: '企业名称'
        }, {
            field: 'code',
            title: '组织机构代码'
        }, {
            field: 'enterpriceType',
            title: '企业类型'
        }, {
            field: 'lon',
            title: '经度'
        }, {
            field: 'lat',
            title: '纬度'
        }, {
            field: 'legend',
            title: '法人'
        }, {
            field: 'time',
            title: '发布时间'
        }, {
            field: 'note',
            title: '备注'
        }]
    });
}

/*上传数据站点文件*/
var uploadFLag;
var templateType;
function uploadFile(type) {
    var file;
    if (type == 1) {
        file = $('#uploadFile')[0].files[0];
    } else if (type == 2) {
        file = $('#uploadFile1')[0].files[0];
    }
    if (file == undefined) {
        return toastr.info("请选择文件");
    }
    var formData = new FormData();
    formData.append('file', file);
    templateType = type;
    $.ajax({
        url: "/seimp/share/getFileJson1?type=" + type,
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false
    }).done(function (data) {
        if (data.status == 0) {
            var columns = [];
            for (var k = 0; k < data.data.titles.length; k++) {
                var tem = {
                    field: 'par' + k,
                    title: data.data.titles[k]
                };
                columns.push(tem);
            }
            var len = data.data.result.length;
            if (len < 10) {
                for (var i = 10; i > len; i--)
                    data.data.result.push({});
            }
            $('.show_table_title').show();
            $('.saveandclear').show();
            $('#getExile').bootstrapTable('destroy');
            $('#getExile').bootstrapTable({
                data: data.data.result,
                columns: columns
            });
            var mes = "";
            if (data.data.errors.length > 0) {
                mes += "文件中省份-企业名称重复：";
                mes += data.data.errors.join(",");
                mes += "\r\n";
            }
            if (data.data.errors1.length > 0) {
                mes += "文件中组织机构代码重复：";
                mes += data.data.errors1.join(",");
                mes += "\r\n";
            }
            if (data.data.errors2.length > 0) {
                mes += "与库中省份-企业名称冲突：";
                mes += data.data.errors2.join(",");
                mes += "\r\n";
            }
            if (data.data.errors3.length > 0) {
                mes += "与库中组织机构代码冲突：";
                mes += data.data.errors3.join(",");
                mes += "\r\n";
            }
            if (mes.length > 0) {
                uploadFLag = 1;
                swal("校验失败", mes, "error");
            } else {
                swal("校验成功", "可以进行保存", "success");
                uploadFLag = 0;
            }
        } else {
            toastr.info("上传失败");
        }
    });
}
function saveData() {
    return;
    if (uploadFLag == 1) {
        toastr.info("数据异常无法保存");
    }
    var rows = $('#getExile').bootstrapTable('getData');
    if (rows.length > 0) {
        ajaxPost("/seimp/share/addDatasite", {array: rows, type: templateType}).done(function (data) {
            if (data.status == 0) {
                swal("上传站点信息成功", "", "success");
            } else {
                swal("上传站点信息失败", "", "error");
            }
        });
    }
}
function showBusinessSystem() {
    changeBread([{title: '共享交换', link: 'javascript:backDatePage()'}, {title: '业务系统'}]);
    $('.data-city ').hide();
    $('#pic1 ').hide();
    $(".v1").hide();
    $('.businessSystem ').show();
}

var request = GetRequest();
var type = request["type"];
if (type != undefined) {
    var dataID = request["dataID"];
    if (type == 1) {
        var dataName = request["dataName"];
        viewDate1(dataName, dataID)
    } else if (type == 2) {
        selectDataSet(dataID);
    }
}
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


/****************dom添加地图div**********************/
function arcgisDw(lon,lat){
    // ajaxPost('/seimp/tianditu/getAddress', {name:"国兴大厦"}).done(function (result) {
    //     console.log(result)
    // })
    if ( $("#tongjituDivPublic").length > 0 ) {
        $("#publicMap").html("");
    } else {
        var dom = document.createElement("div");
        document.body.appendChild(dom);
        // dom.id = "publicMap";
        dom.id = "tongjituDivPublic";
        dom.style.right = "7%";
        dom.style.top ="25%";
        dom.style.width = "541px";
        dom.style.height = "470px";
        dom.style.position="fixed";
        dom.setAttribute("class","main_table");

        dom.innerHTML = '<div class="main_tabletop data_table" id="main_tabletitle" style="right:7%;left: auto;top: 25%;width: 541px;position: fixed;">' +
            '<div class="tabtop_left">地图定位</div><div class="tabtop_rt"></div><i class="large" data=\'1\'></i></div>' +
            ' <div class="data1"><div id="publicMap" class="table-body ps-container"style="top:37px;width: 523px;height:425px;overflow: auto;max-height: 425px;">' +
            '</div></div></div>';
    }
    tuoDongDiv();
    publicDingwei(lon,lat);
}









