//var indexResult = sessionStorage.getItem('resultIndex');
//console.log(indexResult);
//var dataIndex=JSON.parse(indexResult);
//$(".setNum").html(dataIndex.total)
//keyname
//var Key=sessionStorage.getItem('Key');
//var Sort=sessionStorage.getItem('Sort');
//$("#keyname").val(Key);
//面包屑导航
parent.changeBread([{title: '共享交换'}]);
//初始化页面高度
parent.document.getElementById("myiframe").style.height = "0px";
$(function(){	
	var functionStr = sessionStorage.getItem('getPageDataFunction');
	eval(functionStr);
})

var pageSize = 10;
var pageNumber = 1;

//条件查询参数
var searchParams = {//清单模式查询条件
	name: "",
    sortColumn:"",
};

//条件查询参数
var searchParams2 = {//清单模式查询条件
	type: "",
    sortColumn:"",
};

//设置参数，调用方法获取数据
function getPageDataByKeyName(keyName){
	searchParams.sortColumn=$('input:radio[name="require"]:checked').attr("value");
	searchParams.name = keyName;
	pageNumber = 1;
	$("#keyname").val(keyName);
	gloSearch();
}

function gloSearch() {
	ajaxPost("/seimp/shareExchange/getDatalistByName", {
        name: searchParams.name,
        sortColumn:searchParams.sortColumn,
        pageNumber: pageNumber,
        pageSize: pageSize
    }).done(function (result) {
    	if(result.status == 0){
    		$(".setNum").html(result.data.total)
    		showSearch(result.data);
    		
    	}
    })
		
}
function showSearch(result){	
	var html="";
	
	//console.log(dataIndex.rows)	
	if(result.rows<1){
		html+='<li class="text-center">没有找到匹配的记录</li>';
		$(".setsList").html(html);
	}else{
		$.each(result.rows, function(i, el) {
			var num= ((pageNumber-1)*pageSize) + (++i);
			var abstra=$('.abstra').html();
			html+='<li class="clearfix">';
			html+='<b>'+ num +'</b>';
			if(metaDataHtmlUrlObj[el.id]){
				if(metaDataHtmlUrlObj[el.id]["clickPar"]=="De2"){
					//如果显示De2,需要判断是否有数据集详情权限
					if(el.SELECTAUTH && el.SELECTAUTH=="1"){
						//有权限，显示De2
						html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","'+metaDataHtmlUrlObj[el.id]["clickPar"]+'")>'+el.name+'</a><span></span></h2><p>';
					}else{
						//无权限,显示De3
						html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","De3")>'+el.name+'</a><span></span></h2><p>';
					}
				}else{
					html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","'+metaDataHtmlUrlObj[el.id]["clickPar"]+'")>'+el.name+'</a><span></span></h2><p>';
				}
			}else{
				html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","De1")>'+el.name+'</a><span></span></h2><p>';
			}
			//配置字符串不存在的时候显示，或者配置字符串“isHasDe1”为true的时候显示
			if(!metaDataHtmlUrlObj[el.id] || (metaDataHtmlUrlObj[el.id] && metaDataHtmlUrlObj[el.id]["isHasDe1"])){
				html+='<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De1")>数据概览</a>';
			}
			//如果显示De2,需要判断是否有数据集详情权限
			if(el.SELECTAUTH && el.SELECTAUTH=="1"){
				html+='<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De2")>数据详情</a>';
			}
			html += '<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De3")>元数据</a><a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De4")>数据申请</a>';
			//配置字符串不存在的时候显示，或者配置字符串“isHasDe5”不存在的时候显示
			if(!metaDataHtmlUrlObj[el.id] || (metaDataHtmlUrlObj[el.id] && metaDataHtmlUrlObj[el.id]["isHasDe5"]==null)
					){
				html+='<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De5")>更新历史</a>';
			}
			html+='</p></div>';
			html+='<p class"abstra">'+(el.abstract==null ? '' : '数据集描述：'+el.abstract)+'</p>';
			html+='<div class="list2 clearfix"><p class="data-set1"><i class="iconfont icon-set1"></i><span title="'+el.catalogUrl+'">'+el.catalogUrl+'</span></p><p class="data-set2"><i class="iconfont icon-set2"></i><span>'+el.SERVICEACCOUNT+'</span></p><p class="data-set3"><i class="iconfont icon-set3"></i><span>'+el.VISITCOUNT+'</span></p><p class="data-set4"><i class="iconfont icon-set4"></i><span>'+el.DOWNCOUNT+'</span></p><p class="data-set5"><i class="iconfont icon-set5"></i><span>'+el.shareLevel+'</span></p></div>';
			html+='</div></li>';
			
			if(abstra==undefined){
				abstra="";
			}								
		})
		
		if(result.page == 1){
			$(".setsList").html(html);
			window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
		}else{
			
			$(".setsList").append(html);
		}
		
		if(result.page < result.total/pageSize){
			$('#showmoreBtn').text("点击加载更多......");
			$('#showmoreBtn').unbind("click");
			$("#showmoreBtn").click(function(){
				//设置参数，调用方法
				pageNumber = parseInt(result.page) + 1;
				gloSearch();
			});
		}else{
			$('#showmoreBtn').unbind("click");
			$('#showmoreBtn').text("数据加载完成");
		}
		
		
	}
	
	
}

//常用检索关键词检索-设置参数，调用方法获取数据
function changSort(){
	window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
	var functionStr = sessionStorage.getItem('getPageDataFunction');
	eval(functionStr);
//	searchParams.sortColumn=$('input:radio[name="require"]:checked').attr("value");
//	searchParams.name=$("#keyname").val();
//	pageNumber = 1;
//	gloSearch();
}

//按名称查询按钮点击事件
function sortName(){
	window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
	searchParams.sortColumn=$('input:radio[name="require"]:checked').attr("value");
	var keyName = $("#keyname").val();
	searchParams.name=keyName;
	sessionStorage.setItem("getPageDataFunction","getPageDataByKeyName('"+keyName+"');");
	pageNumber = 1;
	gloSearch();
}

/**************************点击菜单，获取数据集列表*******************/

//设置参数，调用方法获取数据
function getPageDataByKeyCatalog(catalogID){
	searchParams2.sortColumn=$('input:radio[name="require"]:checked').attr("value");
	searchParams2.type = catalogID;
	pageNumber = 1;
	$("#keyname").val();
	gloSearch2();
}

function gloSearch2() {
	ajaxPost("/seimp/shareExchange/getDataListByCatalog", {
		type: searchParams2.type,
        sortColumn:searchParams2.sortColumn,
        pageNumber: pageNumber,
        pageSize: pageSize
    }).done(function (result) {
    	if(result.status == 0){
    		$(".setNum").html(result.data.total)
    		showSearch2(result.data);
    		
    	}
    })
		
}
function showSearch2(result){
	//parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
	var html="";
	//console.log(dataIndex.rows)
	
	if(result.rows<1){
		html+='<li class="text-center">没有找到匹配的记录</li>';
		$(".setsList").html(html);
	}else{
		$.each(result.rows, function(i, el) {
			var num= ((pageNumber-1)*pageSize) + (++i);
			var abstra=$('.abstra').html();
			html+='<li class="clearfix">';
			html+='<b>'+ num +'</b>';
			if(metaDataHtmlUrlObj[el.id]){
				if(metaDataHtmlUrlObj[el.id]["clickPar"]=="De2"){
					//如果显示De2,需要判断是否有数据集详情权限
					if(el.SELECTAUTH && el.SELECTAUTH=="1"){
						//有权限，显示De2
						html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","'+metaDataHtmlUrlObj[el.id]["clickPar"]+'")>'+el.name+'</a><span></span></h2><p>';
					}else{
						//无权限,显示De3
						html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","De3")>'+el.name+'</a><span></span></h2><p>';
					}
				}else{
					html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","'+metaDataHtmlUrlObj[el.id]["clickPar"]+'")>'+el.name+'</a><span></span></h2><p>';
				}
			}else{
				html+='<div class="list pull-left"><div class="list1 clearfix"><h2><a href="#" onclick=toMetaDataInfoPage("'+el.id+'","De1")>'+el.name+'</a><span></span></h2><p>';
			}
			
			if(!metaDataHtmlUrlObj[el.id] || (metaDataHtmlUrlObj[el.id] && metaDataHtmlUrlObj[el.id]["isHasDe1"])){
				html+='<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De1")>数据概览</a>';
			}
			//如果显示De2,需要判断是否有数据集详情权限
			if(el.SELECTAUTH && el.SELECTAUTH=="1"){
				html+='<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De2")>数据详情</a>';
			}
			html += '<a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De3")>元数据</a><a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De4")>数据申请</a><a  href="#" onclick=toMetaDataInfoPage("'+el.id+'","De5")>更新历史</a></p></div>';
			html+='<p class"abstra">'+(el.abstract==null ? '' : '数据集描述：'+el.abstract)+'</p>';
			html+='<div class="list2 clearfix"><p class="data-set1"><i class="iconfont icon-set1"></i><span title="'+el.catalogUrl+'">'+el.catalogUrl+'</span></p><p class="data-set2"><i class="iconfont icon-set2"></i><span>'+el.SERVICEACCOUNT+'</span></p><p class="data-set3"><i class="iconfont icon-set3"></i><span>'+el.VISITCOUNT+'</span></p><p class="data-set4"><i class="iconfont icon-set4"></i><span>'+el.DOWNCOUNT+'</span></p><p class="data-set5"><i class="iconfont icon-set5"></i><span>'+el.shareLevel+'</span></p></div>';
			html+='</div></li>';
			
			
			if(abstra==undefined){
				abstra="";
			}								
		})
		
		if(result.page == 1){
			window.parent.document.getElementById("myiframe").style.height = "0px";//最好设置为minHeight
			$(".setsList").html(html);
		}else{
			$(".setsList").append(html);
		}
		
		if(result.page < result.total/pageSize){
			$('#showmoreBtn').text("点击加载更多......");
			$('#showmoreBtn').unbind("click");
			$("#showmoreBtn").click(function(){
				//设置参数，调用方法				
				pageNumber = parseInt(result.page) + 1;
				gloSearch2();
			});
		}else{
			$('#showmoreBtn').unbind("click");			
			$('#showmoreBtn').text("数据加载完成");
		}
		
		
	}
	
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

//按条件排序 radio 按钮切换
$(".dataShow5").on("click",function(){  //点击label 
    var _in = $(this).children("input:radio[name='require']");         
    $(this).addClass("dataShow_active").siblings().removeClass("dataShow_active");     
});

