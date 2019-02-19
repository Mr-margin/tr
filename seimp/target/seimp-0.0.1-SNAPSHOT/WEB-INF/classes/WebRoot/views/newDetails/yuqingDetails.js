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

$(function () {
    getDetail();
});

function getDetail() {
    var request = GetRequest();
    var nids = request["nids"];
    var type = request["type"];
    if(type=="wangluo"){
    	//导航条
    	changeBread([{title: '预警分析', link: "#warn"},{title: "网络舆情预警详情"}]);
    	
    	var json = {IDs:nids};
    	ajaxPost("/seimp/warn/getNetworkNewsDetail.do", json).done(function(result){
    		if(result.status==0&&result.data.length>0){
    			var currItem = result.data[0];
    			$("#title").html(currItem.title);
                var str="";
                /*if(currItem.time!=""){
                    str+="时间："+currItem.time.substr(0, 10);
                }
                if(currItem.source!=""&&currItem.source!=null){
                    str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;来源："+currItem.source;
                }
                if(currItem.url!=""){
                    str+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;链接：<a href='"+currItem.url+"' target='_blank'>"+currItem.url+"</a>"
                }*/

                $("#time").html(str);
                var content = "<table class='table table-striped table-bordered' style='width:100%;'> ";
                content +="<tr><td width='200px;'>时间</td><td><div>"+(currItem.time!=null?currItem.time.substr(0, 10):"")+"</div></td></tr>";
                content +="<tr><td width='200px;'>来源</td><td><div>"+(currItem.source!=null?currItem.source:"")+"</div></td></tr>";
                content +="<tr><td width='200px;'>链接</td><td><div>"+(currItem.url!=null?"<a href='"+currItem.url+"' target='_blank'>"+currItem.url+"</a>":"")+"</div></td></tr>";
                content +="<tr><td width='200px;'>摘要</td><td style='text-align: left;'><div>"+(currItem.summary!=null?currItem.summary:"")+"</div></td></tr>";
                content +="<tr><td>内容</td><td style='text-align: left;'>"+(currItem.content!=null?currItem.content:"")+"</td></tr>";
                content +="</table>";
                $("#content").html(content);
			}
		})
    }else if(type=="jubao"){
    	//导航条
    	changeBread([{title: '预警分析', link: "#warn"},{title: "12369举报预警详情"}]);
    	var json = {reportID:nids};
    	ajaxPost("/seimp/warn/weixin_ReportDetail.do", json).done(function(result){
    		if(result.status==0&&result.data.length>0){
    			var currItem = result.data[0];
    			$("#title").html((currItem.REPORT_DEPT_NAME!=null&&currItem.REPORT_DEPT_NAME!='(null)'?currItem.REPORT_DEPT_NAME:""));
                var str="";
                /*if(currItem.REPORT_TIME!=""){
                    str+="举报时间："+(currItem.REPORT_TIME!=null?currItem.REPORT_TIME:"");
                }
                $("#time").html(str);*/
                var content = "<table class='table table-striped table-bordered'>";
                content +="<tr><td width='200px;'>举报时间</td><td>"+(currItem.REPORT_TIME!=null?currItem.REPORT_TIME:"")+"</td></tr>";
                content +="<tr><td width='200px;'>举报方式</td><td>"+(currItem.REPORT_FROM!=null?currItem.REPORT_FROM:"")+"</td></tr>";
                content +="<tr><td>详细地址</td><td>"+(currItem.LOCATION_LABEL!=null?currItem.LOCATION_LABEL:"")+"</td></tr>";
                content +="<tr><td>办理单位</td><td>"+(currItem.PROCESS_AREA_UNITNAME!=null?currItem.PROCESS_AREA_UNITNAME:"")+"</td></tr>";
                content +="<tr><td>行业类型</td><td>"+(currItem.INDUSTRY_TYPE!=null?currItem.INDUSTRY_TYPE:"")+"</td></tr>";
                content +="<tr><td>污染描述</td><td>"+(currItem.REPORT_CONTENT!=null?currItem.REPORT_CONTENT:"")+"</td></tr>";
                content +="<tr><td>办理意见</td><td>"+(currItem.FINALOPINION!=null?currItem.FINALOPINION:"")+"</td></tr>";
                content +="</table>";
                $("#content").html(content);
			}
    	})
    }   
    
}