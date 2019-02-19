var radioHtml_1 = '<div>'+
'<div class="radio radio-info">'+
    '<input type="radio" id="radio1" name="radio2" data="建设项目环评_5">'+
    '<label for="radio1">建设项目环评</label>'+
    '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(5,this)"></i>'+
    '</div>'+
    '</div>'+
    '<div>'+
    '<div class="radio radio-info">'+
    '<input type="radio" id="radio2" name="radio2" data="排污许可数据_6">'+
    '<label for="radio2">排污许可数据</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(6,this)"></i>'+
    '</div>'+
    '</div>'+
    '<div>'+
    '<div class="radio radio-info">'+
    '<input type="radio" id="radio3" name="radio2" data="尾矿库（绿网）_3">'+
    '   <label for="radio3">尾矿库（绿网）</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(3,this)"></i>'+
'</div>'+
'</div>'+
'<div>'+
'<div class="radio radio-info">'+
    '<input type="radio" id="radio4" name="radio2" data="重点监管企业遥感核查_2">'+
    '<label for="radio4">重点监管企业遥感核查</label>'+
    '   <i class="iconfont icon-filter" onclick="opernModal(2,this)" style="float:right;cursor: pointer;"></i>'+

'   </div>'+
'   </div>'+
'<div>'+
    '<div class="radio radio-info">'+
    '<input type="radio" id="radio5" name="radio2" data ="淘汰落后产能企业_4">'+
    '<label for="radio5">淘汰落后产能企业</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(4,this)"></i>'+
    '</div>'+
    '</div>'+
    '<div>'+
    '<div class="radio radio-info">'+
    '<input type="radio" id="radio6" name="radio2" data="工商企业登记信息_7">'+
    '<label for="radio6">工商企业登记信息</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(7,this)"></i>'+
    '</div>'+
    '</div>'+
    '<div>'+
    '<div class="radio radio-info">'+
    '<input type="radio" id="radio7" name="radio2" data="重点行业监管企业_8">'+
    '<label for="radio7">重点行业监管企业</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(8,this)"></i>'+
    '</div>'+
    '</div>';
var radioHtml_2 = '<div>'+
'<div class="radio radio-info">'+
'   <input type="radio" id="checkbox8" name="radio2" data="疑似污染地块_11">'+
'   <label for="checkbox8">疑似污染地块</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(11,this)"></i>'+
'   </div>'+
'   </div>'+
'   <div>'+
'   <div class="radio radio-info">'+
'   <input type="radio" id="checkbox9" name="radio2" data="污染地块_1">'+
'   <label for="checkbox9">污染地块</label>'+
'   <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(1,this)"></i>'+
'   </div>'+
'   </div>';

var checkedHtml_1='<div>'+
'<div class="checkbox">'+
'   <input type="checkbox" id="radio1" name="radio2" data="建设项目环评_5">'+
'   <label for="radio1">建设项目环评</label>'+
    '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(5,this)"></i>'+
'   </div>'+
'   </div>'+
'   <div>'+
'   <div class="checkbox">'+
'   <input type="checkbox" id="radio2" name="radio2" data="排污许可数据_6">'+
'   <label for="radio2">排污许可数据</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(6,this)"></i>'+
'   </div>'+
'   </div>'+
'   <div>'+
'   <div class="checkbox">'+
'   <input type="checkbox" id="radio3" name="radio2" data="尾矿库（绿网）_3">'+
'   <label for="radio3">尾矿库（绿网）</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(3,this)"></i>'+
'</div>'+
'</div>'+
'<div>'+
'<div class="checkbox">'+
'   <input type="checkbox" id="radio4" name="radio2" data="重点监管企业遥感核查_2">'+
'   <label for="radio4">重点监管企业遥感核查</label>'+
'   <i class="iconfont icon-filter" onclick="opernModal(2,this)" style="float:right;cursor: pointer;"></i>'+

'    </div>'+
'   </div>'+
'   <div>'+
'   <div class="checkbox">'+
'   <input type="checkbox" id="radio5" name="radio2" data ="淘汰落后产能企业_4">'+
'   <label for="radio5">淘汰落后产能企业</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(4,this)"></i>'+
'   </div>'+
'   </div>'+
'   <div>'+
'   <div class="checkbox">'+
'   <input type="checkbox" id="radio6" name="radio2" data="工商企业登记信息_7">'+
'   <label for="radio6">工商企业登记信息</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(7,this)"></i>'+
'   </div>'+
'   </div>'+
'   <div>'+
'   <div class="checkbox">'+
'   <input type="checkbox" id="radio7" name="radio2" data="重点行业监管企业_8">'+
'   <label for="radio7">重点行业监管企业</label>'+
    ' <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(8,this)"></i>'+
'   </div>'+
'   </div>';

var checkedHtml_2 = '<div>'+
'<div class="checkbox">'+
'   <input type="checkbox" id="checkbox8" name="radio2" data="疑似污染地块_11">'+
'   <label for="checkbox8">疑似污染地块</label>'+
'<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(11,this)"></i>'+
'   </div>'+
'   </div>'+
'   <div>'+
'   <div class="checkbox">'+
'   <input type="checkbox" id="checkbox9" name="radio2" data="污染地块_1">'+
'   <label for="checkbox9">污染地块</label>'+
'   <i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(1,this)"></i>'+
'   </div>'+
'   </div>';