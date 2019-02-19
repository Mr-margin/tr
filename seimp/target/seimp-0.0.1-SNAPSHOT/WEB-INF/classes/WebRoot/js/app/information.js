/**
 * Created by liujun on 2017/9/5.
 */
//一屏幕显示
var CH = document.documentElement.clientHeight;
$('.informations').css("height",(CH -176)+ 'px');



//*****二级菜单点击事件****//
//点击左侧菜单弹出标题弹窗
$(function(){
	//动态生成左侧菜单
	ajaxPost("/seimp/authority/getMenus", {}).done(function (result) {
        if (result.status == 0) {
            var html = "";
            if(result.data && result.data.right2){
            	var array = result.data.right2;
            	if(contains(array,"1")){
    				html += '<li class="soilDl"><a href="javascript:void(0);"><i class="iconfont icon-bottom"></i><span>土壤污染来源</span></a>';
    				html += '<div class="sub_menu">';
    				if(contains(array, "10")){
    					html += '<div><div class="radio radio-info">'
								      + '<input type="radio" id="radio1" name="radio2" data="建设项目环评_5">'
								      + '<label for="radio1">建设项目环评</label>'
                                      + '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(5,this)"></i>'
								+ '</div></div>';
    				}
    				if(contains(array, "11")){
    					html += '<div><div class="radio radio-info">'
    								  + '<input type="radio" id="radio2" name="radio2" data="排污许可数据_6">'
								      + '<label for="radio2">排污许可数据</label>'
								      + '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(6,this)"></i>'
								+ '</div></div>';
    				}
    				if(contains(array, "12")){
    					html += '<div><div class="radio radio-info">'
    								+ '<input type="radio" id="radio3" name="radio2" data="尾矿库（绿网）_3">'
    								+ '<label for="radio3">尾矿库（绿网）</label>'
    								+ '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(3,this)"></i>'
                      			+ '</div></div>';
    				}
    				if(contains(array, "13")){
    					html += '<div><div class="radio radio-info">'
								      + '<input type="radio" id="radio4" name="radio2" data="重点监管企业遥感核查_2">'
								      + '<label for="radio4">重点监管企业遥感核查</label>'
                                      + '<i class="iconfont icon-filter" onclick="opernModal(2,this)" style="float:right;cursor: pointer;"></i>'
								+ '</div></div>';
    				}
    				if(contains(array, "14")){
    					html += '<div><div class="radio radio-info">'
    									+ '<input type="radio" id="radio5" name="radio2" data ="淘汰落后产能企业_4">'
    									+ '<label for="radio5">淘汰落后产能企业</label>'
    									+ '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(4,this)"></i>'
                                    + '</div></div>';
    				}
    				if(contains(array, "15")){
    					html += ' <div><div class="radio radio-info">'
    									+ '<input type="radio" id="radio6" name="radio2" data="工商企业登记信息_7">'
    									+ '<label for="radio6">工商企业登记信息</label>'
    									+ '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(7,this)"></i>'
    									+ '</div></div>';
    				}
    				if(contains(array, "16")){
    					html += '<div><div class="radio radio-info">'
    									+ '<input type="radio" id="radio7" name="radio2" data="重点行业监管企业_8">'
    									+ '<label for="radio7">重点行业监管企业</label>'
    									+ '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(8,this)"></i>'
    								+ '</div></div>';
    				}
    				
    				html += "</div></li>";
    				
    			}
            	if(contains(array,"2")){
            		html += ' <li class="wurandikuai"><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>污染地块</span></a>';
            		html += '<div class="sub_menu freeH" >';
            		if(contains(array,"17")){
            			html += '<div><div class="radio radio-info">'
            						+ '<input type="radio" id="checkbox8" name="radio2" data="疑似污染地块_11">'
            						+ '<label for="checkbox8">疑似污染地块</label>'
            						+ '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(11,this)"></i>'
								 + '</div></div>';
            		}
            		if(contains(array,"18")){
            			html += '<div><div class="radio radio-info">'
            						+ '<input type="radio" id="checkbox9" name="radio2" data="污染地块_1">'
            						+ '<label for="checkbox9">污染地块</label>'
            						+ '<i class="iconfont icon-filter"  style="margin-right: 20px;float:right;cursor: pointer;" onclick="opernModal(1,this)"></i>'
            					+ '</div></div>';
            		}
            		html += '</div></li>';
            	}
            	if(contains(array,"3")){
            		html += '<li><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>农用地土壤环境质量</span></a></li>';
            	}
            	if(contains(array, "4")){
            		html += '<li><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>土壤环境例行监测</span></a></li>';
            	}
            	if(contains(array, "5")){
            		html += '<li><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>土壤环境调查</span></a></li>';
            	}
            	if(contains(array, "6")){
            		html += '<li class="kjwg"><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>空间网格</span></a>';
                    html += '<div class="sub_menu freeH" >';
                    if(contains(array, "19")){
                    	html += '<div><div class="checkbox">'
                                    + '<input type="checkbox" id="wg" data="公里网格">'
                                    + '<label for="wg">公里网格</label>'
                                + '</div></div>';
                    }
                    html += '</div></li>';
            	}
            	if(contains(array, "7")){
            		html += '<li><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>舆情数据</span></a></li>';
            	}
            	if(contains(array, "8")){
            		html += '<li class="basicDl"><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>基础地理</span></a>';
					html += '<div class="sub_menu freeH" >';
					if(contains(array, "20")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox1" data="省级行政界线">'
									+ '<label for="checkbox1">省级行政界线</label>'
								+ '</div></div>';
					}
					if(contains(array, "21")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox2" data="市级行政界线">'
									+ '<label for="checkbox2">市级行政界线</label>'
								+ '</div></div>';
					}
					if(contains(array, "22")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox3" data="县级行政界线">'
									+ '<label for="checkbox3">县级行政界线</label>'
								+ '</div></div>';
					}
					if(contains(array, "23")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox4" data="河流">'
									+ '<label for="checkbox4">河流</label>'
								+ '</div></div>';
					}
					if(contains(array, "24")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox5" data="道路">'
									+ '<label for="checkbox5">道路</label>'
								+ '</div></div>';
					}
					if(contains(array, "25")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox6" data="土地利用">'
									+ '<label for="checkbox6">土地利用</label>'
								+ '</div></div>';
					}
					if(contains(array, "26")){
						html += '<div><div class="checkbox">'
									+ '<input type="checkbox" id="checkbox7" data="土壤类型">'
									+ '<label for="checkbox7">土壤类型</label>'
								+ '</div></div>';
					}
					html += '</div></li>';
            	}
            	if(contains(array, "9")){
            		html += '<li class="qita"><a href="javascript:void(0);" ><i class="iconfont icon-bottom"></i><span>其他</span></a>';
            		html += '<div class="sub_menu" >';
            		if(contains(array, "27")){
            			html += '<div><div class="checkbox">'
            						+ '<input type="checkbox" id="checkbox12" data="大型灌区分布">'
            						+ '<label for="checkbox12">大型灌区分布</label>'
            					+ '</div></div>';
            		}
            		if(contains(array, "28")){
            			html += '<div><div class="checkbox">'
                                    + '<input type="checkbox" id="checkbox13" data="人口分布">'
                                    + '<label for="checkbox13">人口分布</label>'
                                + '</div></div>';
            		}
            		html += '</div></li>';
            	}
            	
            	
            	//写入html
            	$("#leftMenu").html(html);
            	
            	//菜单点击事件
            	radioCheckedClick();
            	//侧边栏菜单
            	$(".info_menuList .list1>ul>li>a").click(function(){
            		if($(this).hasClass("active")){
            			$(this).removeClass("active").next(".sub_menu").slideUp(100);
            			$(this).children(".icon-bottom").css("transform","rotateZ(-90deg)");
            		}else{
            			if($(this).siblings().size() != 0){
            				$(this).addClass("active").next(".sub_menu").slideDown(100);
            				$(this).children(".icon-bottom").css("transform","rotateZ(0deg)");	
            			}
            		}		
            	})
            	//侧边栏其他菜单
            	$(".others>ul>li>a").click(function(){
            		if($(this).hasClass("active")){
            			$(this).removeClass("active").next(".sub_menu").slideUp(100);
            			$(this).children(".icon-bottom").css("transform","rotateZ(-90deg)");
            		}else{
            			if($(this).siblings().size() != 0){
            				$(this).addClass("active").next(".sub_menu").slideDown(100);
            				$(this).children(".icon-bottom").css("transform","rotateZ(0deg)");	
            			}
            		}		
            	})
            	//主菜单切换
            	$(".info_menuTip li").click(function() {
            		$(this).addClass("list_active").siblings(".info_menuTip li").removeClass("list_active");
            		$(".info_menuList").eq($(this).index()).show().siblings(".info_menuList").hide();
            	})
            }
        }
	})
        
	
	
	$(".soil_item p").bind("click", function() {
		$(this).addClass("soil_active").siblings(".soil_item p").removeClass("soil_active");
		$(".menuTip").slideDown(100);
		$(".menuTip h4").html($(this).attr("data"));
		$(".menuTip .close").click(function() {
            removeTc("sheng");
            removeTc("shi");
            removeTc("xian")
            removeGraphic("provinceHigh");
            removeGraphic("provinceHigh1");
            removeTc("diangraphicsLayer");
            removeTc("countLayer");
            app.map.setExtent(new dong.Extent(extentPar));
			$(".menuTip").slideUp(100);
			$(".menuTip h4").html("");
		})
	})
	
	
})

//获取访问权限的菜单
var json = {partID:"3"};
ajaxPost('/seimp/user/getMenus.do',json).done(function(result){
	if(result.status==0){
		var data = result.data;
		var flag = false;//记录是否有污染地块
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			//土壤网格
			if(currItem=="30"){
				$("#xxgk_glgw").css("cursor","default");
				//添加点击事件
				$("#xxgk_glgw").click(function () {
					$(".model-img").removeClass('borderColor')
					$(this).addClass('borderColor');
					ghPhoto("xxgk_glgw");
					$("#informationIframe").attr("src", "views/information/gewang.html")
				})
			}
			//土壤环境状况调查
			if(currItem=="32"){
				$("#xxgk_diaocha").css("cursor","default");
				//添加点击事件
				$("#xxgk_diaocha").click(function () {
					$(".model-img").removeClass('borderColor')
					$(this).addClass('borderColor');
					ghPhoto("xxgk_diaocha");
					$("#informationIframe").attr("src", "views/information/diaocha.html")
				})
			}
			//污染地块清单
			if(currItem=="33"){
				//由污染地块权限
				flag = true;
				$("#xxgk_dkqd").css("cursor","default");
				//添加点击事件
				$("#xxgk_dkqd").click(function () {
				    $(".model-img").removeClass('borderColor')
				    $(this).addClass('borderColor');
				    ghPhoto("xxgk_dkqd");
				    $("#informationIframe").attr("src", "views/information/dikuai.html")
				})
			}
			//重点企业行业名录
			if(currItem=="34"){
				$("#xxgk_hyqyml").css("cursor","default");
				//添加点击事件
				$("#xxgk_hyqyml").click(function () {
				    $(".model-img").removeClass('borderColor')
				    $(this).addClass('borderColor');
				    ghPhoto("xxgk_hyqyml");
				    $("#informationIframe").attr("src", "views/information/zhongdianqiye.html")
				})
			}
			//污染企业自行监测
			if(currItem=="35"){
				$("#xxgk_qyjcxx").css("cursor","default");
				//添加点击事件
				$("#xxgk_qyjcxx").click(function () {
				    $(".model-img").removeClass('borderColor')
				    $(this).addClass('borderColor');
				    ghPhoto("xxgk_qyjcxx");
				    $("#informationIframe").attr("src", "views/information/zixingjiance.html")
				})
			}
			
		}//--for end
		//若权限里没有污染地块，默认显示菜单中的第一个
		if(!flag){
			//土壤网格
			if(data[0]=="30"){
				$("#xxgk_glgw").click();
			}
			//土壤环境状况调查
			if(data[0]=="32"){
				$("#xxgk_diaocha").click();
			}
			//重点企业行业名录
			if(data[0]=="34"){
				$("#xxgk_hyqyml").click();
			}
			//污染企业自行监测
			if(data[0]=="35"){
				$("#xxgk_qyjcxx").click();
			}
		}
		
		getClickEvent();
	}
})

/*
$("#xxgk_trhj").click(function () {
    $(".model-img").removeClass('borderColor')
    $(this).addClass('borderColor');
    $("#informationIframe").attr("src", "views/information/nongyongdi.html")
})
$("#xxgk_glgw").click(function () {
	$(".model-img").removeClass('borderColor')
	$(this).addClass('borderColor');
	$("#informationIframe").attr("src", "views/information/gewang.html")
})
$("#xxgk_diaocha").click(function () {
	$(".model-img").removeClass('borderColor')
	$(this).addClass('borderColor');
	$("#informationIframe").attr("src", "views/information/diaocha.html")
})
$("#xxgk_dkqd").click(function () {
    $(".model-img").removeClass('borderColor')
    $(this).addClass('borderColor');
    $("#informationIframe").attr("src", "views/information/dikuai.html")
})
$("#xxgk_hyqyml").click(function () {
    $(".model-img").removeClass('borderColor')
    $(this).addClass('borderColor');
    $("#informationIframe").attr("src", "views/information/zhongdianqiye.html")
})
$("#xxgk_qyjcxx").click(function () {
    $(".model-img").removeClass('borderColor')
    $(this).addClass('borderColor');
    $("#informationIframe").attr("src", "views/information/zixingjiance.html")
})
$("#qt").click(function () {
    $(".model-img").removeClass('borderColor')
    $(this).addClass('borderColor');
    $("#informationIframe").attr("src", "views/information/qita.html")
})
*/


//$(function(){
//	getClickEvent();
//})

//首页href="#warn?init=chaobaiolv"，预警分析显示点位超标率
function getClickEvent(){
	var request = GetRequest();
    var init = request["init"];
    if(init=="dikuai"){
    	$("#xxgk_dkqd").click();
    }else if(init=="zhongdianqiye"){
    	$("#xxgk_hyqyml").click();
    }
}
/**
 * 跟换图片
 */
function  ghPhoto (id ) {
	var html_id = ["xxgk_glgw","xxgk_trhj","xxgk_diaocha","xxgk_dkqd","xxgk_hyqyml","xxgk_qyjcxx","qt"]
	$.each(html_id,function(i,item){
		if (id == item ) {
			$("#"+item+" img").attr("src", "img/infor/"+(i+1)+".1.png");
			$("#"+item).css('z-index',100)
		} else {
			$("#"+item+" img").attr("src", "img/infor/"+(i+1)+".2.png")
			$("#"+item).css('z-index',(7-i))
		}
		
	})
}



$(function(){
//	工具条点击
    $('.map_layerTools li').click(function(){
    	if($(this).index()==0){
            if($(this).hasClass("tool_active")){
                $(".tool_hover").hide();
                return  $(this).removeClass("tool_active")
            } else {
                $(".tool_hover").show()
            }
    	}else{
    		$(".tool_hover").hide()
    	}
        $(this).addClass("tool_active").siblings(".map_layerTools li").removeClass("tool_active");
    	console.log($(this).index())
        if ( $(this).index() == 0 ) {//图层控制
        } else if ($(this).index() ==1 ) {//放大按钮
            $(".esriSimpleSliderIncrementButton").click();
        } else if($(this).index()==2){//缩小按钮
            $(".esriSimpleSliderDecrementButton").click();
        }else if($(this).index() == 3){//量距
            toolbar.activate(esri.toolbars.Draw.LINE)
        } else if ($(this).index() == 4){//量面
            toolbar.activate(esri.toolbars.Draw.POLYGON);
        } else if ($(this).index() ==5){//清空绘制图层
            if(app.map.graphics !=null && app.map.graphics != null && app.map.graphics != undefined ) {
                app.map.graphics.clear();
            }
        }
    })
   

    //缩放按钮
    $("#map_zoom_slider").hide();
//    滑动条样式
    $('#range1').RangeSlider({ min: 0,   max: 100,  step: 0.1});
    $('#range2').RangeSlider({ min: 0,   max: 100,  step: 0.1});
})


/***************************图层控制***********************************************/

//图层控制中的眼睛  显隐
$('.tool_hover').on('click','.fa-lg',function(){
    var data = "";
    // var lid = $(this).attr("id");
    var ischeck=$(this).attr("checked");
    var fz = true;

    if(ischeck == "checked"){
        data =  $(this).context.getAttribute("data");
        $(this).attr("checked",false);
        $(this).removeClass('fa-eye');
        $(this).addClass('fa-eye-slash');
        fz = true ;

    }else{
        data =  $(this).context.getAttribute("data");
        $(this).attr("checked",true);
        $(this).removeClass('fa-eye-slash');
        $(this).addClass('fa-eye');
        fz = false
    }
    if ( data == "daolu"){
        eye("gaosuLayer",fz);
        eye("shengdaoLayer",fz);
    } else if (data == "gongliwangge"){
        if ( fz ){
            app.grideGraphicLayer.setOpacity(0.0);
            app.wanggeLayer.setOpacity(0.0);
        } else {
            app.grideGraphicLayer.setOpacity(1);
            app.wanggeLayer.setOpacity(1);
        }
        eye("gaosuLayer",fz);
        eye("shengdaoLayer",fz);
    } else if(data=="xzjj"){
        eye("ssheng",fz);
        eye("sshi",fz);
        eye("sxian",fz);
    } else {
        eye(data,fz);
    }

});
//图层显示与隐藏的通用方法
function eye(id,fz){
    try {
        var layer = app.map.getLayer(id);
        if ( fz )  layer.setOpacity(0.0);
        else  layer.setOpacity(1);
    } catch (e) {

    }
}

//增加透明样式以及事件
$(".vectorLayer").slider({//矢量图滑动条滑动事件
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("vectorLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".baseLayer").slider({//影像
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("baseLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".layer0").slider({//谷歌影像
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("layer0");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".annoLayerImg").slider({//影像中文
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("annoLayerImg");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});
$(".vectorNoteLayer").slider({//矢量中文
    max:10,//最右侧值
    value:10,//初始值
    orientation:"horizonal",//朝向
    slide: function(event, ui) {//滑动回调函数
        var value=ui.value;
        var type=event.target.getAttribute("data");
        var percent=(value/$(event.target).slider("option","max")).toFixed(1);
        var targetLayer=app.map.getLayer("vectorNoteLayer");
        if(targetLayer==null){return;}
        targetLayer.setOpacity(percent);
        return;
    }
});

//拖动div 开始加载图层顺序
$(".tool_hover").sortable({
    stop:function(event,ui){
        var layerSortArr=[];
        var itemCount=$(".warning-element").length;
        $(".warning-element").each(function(i,item){
            if (item.getAttribute("data") == "gaosuLayer-shengdaoLayer"){
                var tempObj={layer:app.map.getLayer("gaosuLayer"),index:itemCount-1-i};
                var tempObj1={layer:app.map.getLayer("shengdaoLayer"),index:itemCount-1-i};
                layerSortArr.push(tempObj);
                layerSortArr.push(tempObj1);
            } else if(item.getAttribute("data") == "googleLayer"){
                var tempObj={layer:app.map.getLayersVisibleAtScale()[2],index:itemCount-1-i};
                layerSortArr.push(tempObj);
            }else if(item.getAttribute("data")=="gongliwangge"){
                var tempObj={layer:app.map.getLayer("wangmian"),index:itemCount-1-i};
                var tempObj1={layer:app.map.getLayer("wangxian"),index:itemCount-1-i};
                layerSortArr.push(tempObj);
                layerSortArr.push(tempObj1);
            }  else {
                var tempObj={layer:app.map.getLayer(item.getAttribute("data")),index:itemCount-1-i};
                layerSortArr.push(tempObj);
            }
        });
        resortMapLayers(layerSortArr);//重排序图层
    }
});
//图层顺序
function resortMapLayers(obj){
    var tempStr="[";
    for(var i=0;i<=obj.length-1;i++){
        if(obj[obj.length-1-i].layer!=null){
            tempStr+="{id:"+obj[obj.length-1-i].layer.id+",index:"+obj[obj.length-1-i].index+"},";
            // app.map.reorderLayer(obj[i].layer,obj[i].index);//index越大,则优先级越高
            app.map.reorderLayer(app.map.getLayer(obj[obj.length-1-i].layer.id),obj[obj.length-1-i].index);//index越大,则优先级越高
        }
    }
    tempStr+="]";
    console.log(tempStr);
}


// 影像图/网格/表格控制显示 
    $('.map_representation>li').click(function(){
        if ($(this).index() == 0){
            app.map.setExtent(new dong.Extent(extentPar));
            //$(this).toggleClass("repres_active");
            //$(this).addClass("repres_active").siblings(".map_representation>li").removeClass("repres_active");
        } else if ($(this).index() == 4 ) {
            $("#tongjituDiv").show();
            $(this).addClass("repres_active").siblings(".map_representation>li").removeClass("repres_active")
            // if ($(this).hasClass("repres_active")){
            //     $(this).removeClass("repres_active");
            //     $("#tongjituDiv").hide();
            // } else {
            //     if ( dong.ztorfb=="分布图" ){
            //         $("#tongjituDiv thead").html("");
            //         $("#tongjituDiv tbody").html("");
            //         $("#tongjituDiv #title").html("暂无数据");
            //     }
            //     $("#tongjituDiv").show();
            //     $(this).addClass("repres_active").siblings(".map_representation>li").removeClass("repres_active");
            // }
        }else{
            //$(this).addClass("repres_active").siblings(".map_representation>li").removeClass("repres_active");
        }

    })
    $('.map_representation>li').eq(0).hover(function(){
    	$(this).toggleClass("repres_active");})
    $('.map_representation>li').eq(1).hover(function(){
    	$(this).toggleClass("repres_active");})
    $('.map_representation>li').eq(2).hover(function(){
    	$(this).toggleClass("repres_active");})	
    $('.map_representation>li').eq(3).hover(function(){
    	$(this).toggleClass("repres_active");})	
    $('.map_representation>li').eq(4).hover(function(){
    	$(this).toggleClass("repres_active");})	
   



jQuery(document).ready(function () {	
    //地图堆叠效果
    $('ul.cards').mouseenter(function () {
        $(this).toggleClass('transition');
        
    }).mouseleave(function(){
    	$(this).toggleClass('transition');
    });
    
});

//switch开关
dong.ztorfb="专题图"
$(".typeShow input").click(function() {
	$("#poi_info_window .window_table .close").click(); // 关闭弹出信息框
	$(".typeShow1").toggle();
	$(".typeShowp1").toggle();
	$(".typeShow2").toggle();
	$(".typeShowp2").toggle();
    dong.ztorfb=$(this).context.getAttribute("data")
    var name = "";
    if ($(this).context.getAttribute("data") == "专题图"){
    	$(".infor-map").removeClass("toggle2"); 
    	$("#toggle-sidebar2").show();
        $('.tab').show();//右侧表格图标
        var xuan ;
        var num =0;
        $.each($(".soilDl .sub_menu input"),function(i,item){
            if(item.checked) {
               var str= $(item).context.getAttribute("data");
                str=str.split("_");
                removeDiv(fenbuDy[str[1]]);
                xuan=item;
                num++;
            }
        })
        $.each($(".wurandikuai .sub_menu input"),function(i,item){
            if(item.checked) {
                var str= $(item).context.getAttribute("data");
                str=str.split("_");
                removeDiv(fenbuDy[str[1]]);
                xuan=item;
                num++;
            }
        })
        qingFenbu();
        $(".soilDl .sub_menu").html(radioHtml_1)
        $(".wurandikuai .sub_menu").html(radioHtml_2)
        radioCheckedClick(true);
        if ( num == 1 ) {
            if ( xuan != undefined && xuan!= null && xuan != "") {
                $.each($(".soilDl .sub_menu input"),function(i,item){
                    if ( $(item).context.getAttribute("data") == $(xuan).context.getAttribute("data")){
                        var str =$(item).context.getAttribute("data");
                        str = str.split("_")
                        name =str[0]
                        $(item).click();
                    }
                })
                $.each($(".wurandikuai .sub_menu input"),function(i,item){
                    if ( $(item).context.getAttribute("data") == $(xuan).context.getAttribute("data")){
                        var str =$(item).context.getAttribute("data");
                        str = str.split("_")
                        name =str[0]
                        $(item).click();
                    }
                })
            }
        }
    } else if($(this).context.getAttribute("data")=="分布图"){
    	$("#toggle-sidebar2").hide();
    	$(".infor-map").addClass("toggle2");
        $('.tab').hide();//右侧表格图标
        $("#tongjituDiv thead").html("");
        $("#tongjituDiv tbody").html("");
        $("#tongjituDiv #title").html("暂无数据");
        $(".menuTip").hide();
        var xuan ;
        $.each($(".soilDl .sub_menu input"),function(i,item){
            if(item.checked) xuan=item
        })
        $.each($(".wurandikuai .sub_menu input"),function(i,item){
            if(item.checked) xuan=item
        })
        qingZhuanti()
        $(".soilDl .sub_menu").html(checkedHtml_1)
        $(".wurandikuai .sub_menu").html(checkedHtml_2)
        radioCheckedClick(true);
        if ( xuan != undefined && xuan!= null && xuan != "") {
            $.each($(".soilDl .sub_menu input"),function(i,item){
                if ( $(item).context.getAttribute("data") == $(xuan).context.getAttribute("data")){
                    var str =$(item).context.getAttribute("data");
                    str = str.split("_")
                    name =str[0]
                    $(item).click();
                }
            })
            $.each($(".wurandikuai .sub_menu input"),function(i,item){
                if ( $(item).context.getAttribute("data") == $(xuan).context.getAttribute("data")){
                    var str =$(item).context.getAttribute("data");
                    str = str.split("_")
                    name =str[0]
                    $(item).click();
                }
            })
        }
        // 移除专题图图层
        removeTc("sheng");
        removeTc("shi");
        removeTc("xian");
        removeTc("countLayer");
		// 移除高亮图层和点图层
		removeGraphic("provinceHigh");
		removeGraphic("provinceHigh1");
	    removeGraphic("provinceHigh2");
    }
    $.each($(".soilDl .sub_menu input"),function(i,item){
        var str =$(item).context.getAttribute("data");
        str = str.split("_")
        tuliDiv(false,str[0])
    })
    $.each($(".wurandikuai .sub_menu input"),function(i,item){
        var str =$(item).context.getAttribute("data");
        str = str.split("_")
        tuliDiv(false,str[0])
    })
    if ( name != "" && name != undefined && name != null ) {
        tuliDiv(true,name)
    }
})




//关闭统计表1
$("#info_table1  .switch").click(function(){
    $("#info_table1").hide();
    if($("#info_table1 span").text().indexOf("环评项目分布") != -1 || $("#info_table1 span").text().indexOf("敏感点分布")!=-1){//附近易受影响分析
        removeTc("countryGraphicsLayer1");
        removeTc("countryGraphicsLayer2")
    }
    removeTc("wrdkcentral")
})


