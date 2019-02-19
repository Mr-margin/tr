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
$('.checkbox  input[name="type1"]').change(function () {
    RefreshData();
});
$('input[name="optionsRadios"]').change(function () {
    RefreshData();
});

getRefreshSta();
function getRefreshSta() {
    $('.selectpicker1').selectpicker('destroy');
    $(".selectpicker1").selectpicker({
        noneSelectedText : '请选择'//默认显示内容
    });
    var nowdate = new Date();
    $("#endDate").val(new Date().format("yyyy-MM-dd"));
    var lastMonth = new Date(nowdate - 30 * 24 * 3600 * 1000).format("yyyy-MM-dd");
    $("#startDate").val(lastMonth);
    ajaxPost("/seimp/warn/getYZ_CONS_SEL", {}).done(function (data) {
        if (data.status == 0) {
            var tem1 = data.data.EIAMANAGENAME;
            var tem2=data.data.NATIONALECONOMYNAME;
            var tem3=data.data.PROVINCENAME;
            var html1 = "";
            var html2="";
            var html3="";
            for (var i = 0; i < tem1.length; i++) {
                html1 += "<option value = '" + tem1[i].CODE + "'>" + tem1[i].NAME+ "</option>";
            }
            for (var i = 0; i < tem2.length; i++) {
                html2 += "<option value = '" + tem2[i].CODE + "'>" + tem2[i].NAME + "</option>";
            }
            for (var i = 0; i < tem3.length; i++) {
                html3 += "<option value = '" + tem3[i].name + "'>" + tem3[i].name + "</option>";
            }
            $("#eiamanagename").html(html1);
            $("#nationaleconomyname").html(html2);
            $("#province").html(html3);
            $('.selectpicker1').selectpicker('refresh');
            RefreshData();
        }
    });
}
function RefreshData() {
    var  obj = document.getElementsByName("type1");
    var check_val = [];
    for(var k in obj){
        if(obj[k].checked)
            check_val.push(obj[k].value);
    }
    if(check_val.length<1){
        return toastr.error("请选择");
    }
    var time1=$("#startDate").val();
    var time2=$("#endDate").val();
    if(time1>time2){
        return toastr.error("开始时间不能大于结束时间");
    }
    var nationaleconomyname = $("#nationaleconomyname").val();
    var eiamanagename = $("#eiamanagename").val();
    var province = $("#province").val();
    if(nationaleconomyname==undefined||nationaleconomyname==""){
        nationaleconomyname="";
    }else{
        nationaleconomyname=nationaleconomyname.join(",");
    }
    if(eiamanagename==undefined||eiamanagename==""){
        eiamanagename="";
    }else{
        eiamanagename=eiamanagename.join(",");
    }
    if(province==undefined||province==""){
        province="";
    }else{
        province=province.join(",");
    }
    var datas={nationaleconomyname:nationaleconomyname,eiamanagename:eiamanagename,province:province,startTime:time1,endTime:time2,type1:check_val,type:$('input[name="optionsRadios"]:checked').val()};
    ajaxPost("/seimp/warn/getYZ_BAS_CONS", datas).done(function (data) {
        if (data.status == 0) {
            var ser=[];
            var leg=[];
            if(data.data.r1.length>0){
                ser.push({
                    name: "建设项目",
                    type: 'bar',
                    barMaxWidth:100,
                    data: data.data.r1
                });
                leg.push("建设项目");
            }
            if(data.data.r2.length>0){
                ser.push({
                    name: "核对已关停企业",
                    type: 'bar',
                    barMaxWidth:100,
                    data: data.data.r2
                });
                leg.push("核对已关停企业");
            }
            if(data.data.r3.length>0){
                ser.push({
                    name: "核对疑似污染地块",
                    type: 'bar',
                    barMaxWidth:100,
                    stack:"污染情况分析",
                    data: data.data.r3
                });
                leg.push("核对疑似污染地块");
            }
            if(data.data.r4.length>0){
                ser.push({
                    name: "核对污染地块",
                    type: 'bar',
                    barMaxWidth:100,
                    stack:"污染情况分析",
                    data: data.data.r4
                });
                leg.push("核对污染地块");
            }
            var option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data:leg
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '20%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: data.data.x,
                        axisLabel: {
                            interval: 0,
                            rotate: 30
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
                    bottom: 15,
                   /* startValue :0,
                    endValue:30,*/
                 /*   maxValueSpan:100//初始化滚动条*/
                }],
           /*     dataZoom: [{
                    type: 'slider',
                    show: true,
                    xAxisIndex: [0],
                    bottom: -5,
                    startValue :0,
                    endValue:30,
                    maxValueSpan:30//初始化滚动条
                }],*/
                yAxis: [
                    {
                        type: 'value',
                        name: "个"
                    }
                ],
                series: ser
            };
            // $('#mychart3').bootstrapTable('destroy');
            var myChart3 = echarts.init(document.getElementById('mychart3'));
            myChart3.clear();
            myChart3.setOption(option);
            myChart3.resize();
        }else {
            return toastr.error("获取数据失败");
        }
    });
}

