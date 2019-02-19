var fenbuDy = {"1":"fenbu_1","2":"fenbu_2","3":"fenbu_3","4":"fenbu_4","11":"fenbu_11","5":"fenbu_5","6":"fenbu_6","7":"fenbu_7","8":"fenbu_8"};
function fenbu(num){
    if( num == "1" || num == "11") wrdk_fenbu(num);//污染地块
    else if ( num == "2" ) yaogan_fenbu(num);//重点监管企业遥感核查
    else if ( num == "3" ) wkk_fenbu(num);//尾矿库（绿网）
    else if ( num == "4") luohou_fenbu(num);//淘汰落后产能企业
    else if ( num == "11") yisidk_fenbu(num);//疑似污染地块
    else if ( num == "5") jianshe_fenbu(num);//建设项目环评
    else if ( num == "6") paiwu_fenbu(num);//排污许可数据
    else if ( num == "8") zhongdian_fenbu(num);//重点行业监管企业
    else if( num == "7") zuzhijigou_fenbu(num);//组织机构代码
}
//清空分布图
function  qingFenbu(){
    removeTc("sheng");
    removeTc("shi");
    removeTc("xian");
    if ( storage.userLevel != "2" ) removeGraphic("provinceHigh1");
    $.each(fenbuDy,function(i,item){
        removeTc(item);
    })
    removeFujin();
}

//分布图的图层控制
function fenbu_tckz(name,id,num){
    var html = '<div class="row warning-element warnings" id="'+id+'" data="'+id+'">'+
        '<div class="col-sm-12" style="padding:0;margin-bottom:12px;">'+
        '   <i id="ss1" class="fa fa-eye fa-lg eye" checked="true" data="'+id+'"></i>'+
        '   <span style="cursor: move;">'+name+'</span>'+
        '   </div>'+
        '   <div class="col-sm-12 eyeSel" style="margin-left:19px;">'+
        '       <div class="'+id+'" style="width:88%;height: 2px;margin-right: 20px;"></div>'+
        '   </div>'+
        '</div>';
    if ( num == 0) {
        $(".tool_hover").html(html+$(".tool_hover").html());
        huaDiv();
    } else if( num == 1 ) {
        removeDiv(id);
    }
}


