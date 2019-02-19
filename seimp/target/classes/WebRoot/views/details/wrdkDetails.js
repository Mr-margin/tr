//单选按钮距离定位
var WRDKBM = sessionStorage.getItem('WRDKBM');
//更新更多详情信息内容
showDetails(WRDKBM);

//污染地块点位的详细信息
function showDetails(WRDKBM){
    dengdai();//等待提示框
    var json = {wrdkbm:WRDKBM};
    if ( num == "11" ) json.yisi = "1";
    ajaxPost('/seimp/wrdk/getDianMessage',json).done(function(result){
        removeDengdai();//删除提示框
        if(result.status == "0") {
            
        }
    })
}