/**
 * 接口服务
 * TB_WRDKJBXXB
 */
parent.changeBread([{title: '共享交换', link: 'javascript:parent.backDatePage()'}, {title: '接口服务'}]);
//初始化页面高度
parent.document.getElementById("myiframe").style.height = "0px";
jkcx();
//接口查询
function jkcx() {
	
    ajaxPost("/seimp/share/getJKFWC", {}).done(function (result) {
        $(".tr_backcolor").html("");
        for (var i = 0; i < result.data.tb_interface.length; i++) {
            var currItem = result.data.tb_interface[i];
            var html = "<tr><td>" + (i + 1) + "</td><td>" + currItem.interface_name + "</td><td>" + currItem.interface_url + "</td><td>" + currItem.interface_department + "</td>";
            //if (currItem.state == 0) {
                html += "<td>正常运行<span><img class='pull-right' src='../../img/button_play.png' height='20px' width='20px'></span></td>"
            //} else {
               // html += "<td>已停止<span><img class='pull-right' src='../../img/button_stop.png' height='20px' width='20px'></span></td>"
            //}
            html += "</tr>";
            $(".tr_backcolor").append(html);
        }
    })
}


//跳转到数据集详情页面
function toMetaDataInfoPage(metaDataID, DeStr){
	if(metaDataHtmlUrlObj[metaDataID]){
		window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
		window.parent.document.getElementById("myiframe").src=metaDataHtmlUrlObj[metaDataID]["url"] + "#" + DeStr + "?id=" + metaDataID;
	}else{
		window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
		window.parent.document.getElementById("myiframe").src= "views/data/dataDefault.html"
	}
}