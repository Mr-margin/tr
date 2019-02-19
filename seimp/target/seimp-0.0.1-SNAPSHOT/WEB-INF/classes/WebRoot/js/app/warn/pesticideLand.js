var pes = {};
pes.searchPar = {
		jgmco : "",
		status : "",
		province : "",
		city : "",
		county : "",
		lCloumnStr : ""
}
pes.searchParForYzcons = {
		hangyeType : ""
}
pes.optionHtml = "";

//查询条件
$(function(){
	//省
	ajaxPost("/seimp/shareExchange/getAllProvince", {}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"' selectValue='"+item.name+"'>"+item.name+"</option>";
 	       })
 	       $("#province").html(html);
 	    }
    })
})

//市
function getCityByProvince(){
	//选择省份的时候，清空县
	$("#county").html('<option value="">全部</option>');
	
	ajaxPost("/seimp/shareExchange/getCityByProvince", {
		provinceID : $("#province").val()
	}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"' selectValue='"+item.name+"'>"+item.name+"</option>";
 	       })
 	       $("#city").html(html);
 	    }
    })
}

//县
function getCountyByCity(){
	ajaxPost("/seimp/shareExchange/getCountyByCity", {
		cityID : $("#city").val()
	}).done(function (result) {
        if (result.status == 0) {
 	       var html="";
 	       html += "<option value='' selectValue=''>全部</option>";
 	       $.each(result.data, function(i, item) {
 	    	  html += "<option value='"+item.code+"' selectValue='"+item.name+"'>"+item.name+"</option>";
 	       })
 	       $("#county").html(html);
 	    }
    })
}
var selectPesticideOrganId = "";

//首先执行的方法
function allPublic(){
	//国界线图层
	app.map.addLayer(new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/guojiexian/MapServer",{id:"guojiexian"}));
	
	//生成地图图层
	//放圆graphic图层
	app.circleLayer = new dong.GraphicsLayer({is:'circleLayer'});
	
	//农药厂图层
	app.pesticideLayer = new dong.GraphicsLayer({is:'pesticideLayer'});
	//鼠标点击
	app.pesticideLayer.on("click", function(evt){
		var graphic = evt.graphic;
		if(graphic){
			if(graphic.attributes.graType && graphic.attributes.graType=="pesticideGra" && graphic.attributes.ORGANID ){
				//农药厂点击高亮
				selectPesticideOrganId = graphic.attributes.ORGANID;
				changeMarkerPicUrl(app.pesticideLayer, "ORGANID", graphic.attributes.ORGANID, "", "_high");
				//农药厂点击，弹出提示框
				pesticideClick(evt);
			}
		}
	})
	//鼠标悬停
	app.pesticideLayer.on("mouse-over", function(evt){
		console.log(evt);
		var graphic = evt.graphic;
		if(graphic){
			if(graphic.attributes.graType && graphic.attributes.graType=="pesticideGra"){
				//添加名称机构TextGraphic到图层上
				addTextGraphicToLayer(graphic.attributes.JGMC0, graphic.geometry, app.map.graphics, "pesticideNameTextGra");
			}
		}
		
	});
	//鼠标离开
	app.pesticideLayer.on("mouse-out", function(evt){
		removeGraByAttr("pesticideNameTextGra", app.map.graphics);
	});
	
	//建设项目图层
	app.yzconsLayer = new dong.GraphicsLayer({is:'yzconsLayer'});
	
	//天地图查询敏感点图层
	app.tidituSearchLayer = new dong.GraphicsLayer({is:'tidituSearchLayer'});
	
	//图层添加到地图
	app.map.addLayer(app.circleLayer);
	app.map.addLayer(app.pesticideLayer);
	app.map.addLayer(app.yzconsLayer);
	app.map.addLayer(app.tidituSearchLayer);
	
	pes.searchPar.jgmco = $("#jgmco").val();
	pes.searchPar.status = $("#status").val();
	pes.searchPar.province = $("#province").val();
	pes.searchPar.city = $("#city").val();
	pes.searchPar.county = $("#county").val();
	pes.searchPar.lCloumnStr = $("label.pesticideRadio_active input").val();
	
	//添加农药厂graphic
	addPesticideGraphic();
	
   //添加农药厂数据到表格上
	addPesticideToTable();
}

//查询按钮点击事件
function pesticideSearch(){
	//关闭弹出框
	$("#tongjituDiv").hide();
	//关闭弹出框
	$("#tongjituDiv_2").hide();
	
	//地图图层操作
	//地图图层操作
	app.circleLayer.clear();
	app.tidituSearchLayer.clear();
	app.yzconsLayer.clear();
	app.pesticideLayer.clear();
	app.pesticideLayer.setVisibility(true);
	app.map.setExtent(extent);
	
	pes.searchPar.jgmco = $("#jgmco").val();
	pes.searchPar.status = $("#status").val();
	pes.searchPar.province = $("#province").val();
	pes.searchPar.city = $("#city").val();
	pes.searchPar.county = $("#county").val();
	pes.searchPar.lCloumnStr = $("label.pesticideRadio_active input").val();
	
	//添加农药厂数据到地图上
	addPesticideGraphic();
	
	//添加农药厂数据到表格上
	addPesticideToTable();
}

//添加农药厂数据到地图上
function addPesticideGraphic(){
	console.log("addPesticideGraphic");
	ajaxPost("/seimp/pesticide/getAllPesticideData", pes.searchPar).done(function (result) {
        if(result.status == 0){
        	var data = result.data;
        	//需要添加到gra上的属性名称
        	var attrColumnArr = ["JGMC0", "ORGANID","ORGANID"];
        	//添加多个图标点到地图上
        	addPicPoinsToMap(data, "LON", "LAT", "4326", app.pesticideLayer, "img/dian/nongyao.png", "32", "32", 0, 16, "pesticideGra", attrColumnArr);
        }
	})
}

/**
 * 农药厂数据点击事件
 * @param evt
 */
function pesticideClick(evt){
	var graphic = evt.graphic;
	
	ajaxPost("/seimp/pesticide/getPesticideByID", {
		ORGANID :graphic.attributes.ORGANID
	}).done(function (result) {
		if(result.status == 0){
			var data = result.data;
			//标题
//			$("#title").html(data.JGMC0);
//            $("#title").attr("title",data.JGMC0);
            //内容
            var html = '<div class="rows"><div class="rows" style="overflow:auto;height:210px;"><div class="rows"><div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">机构名称：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JGMC0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">省份：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.PROVINCE)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">市区：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.CITY)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">县区：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.COUNTY)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经营期限自：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.BZRQ0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经营期限至：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.ZFRQ0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">电话号码：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.DHHM1)+'</div></div>' +
                
                '</div>'+
                
                '<div class="rows" id="xiangqingRows" style="display:none;">'+
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">社会信用代码：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.TYDM0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">组织机构代码：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JGDM0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经营范围：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JYFW0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">注册地址：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JGDZ0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">法定代表人姓名：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.FDDBR0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">成立日期：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.ZCRQ0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">最后变更日期：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.BGRQ0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">注册资本：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.ZCZJ0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">状态：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JYZT0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">电话号码：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.DHHM0)	+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">职工人数：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.ZGRS0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经济行业：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JJHY20110)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">机构类型：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JGLX)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">主管部门代码：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.ZGDM0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">主管部门名称：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.ZGMC0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">电子邮箱：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.EMAIL0)	+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">网址：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.URL0)	+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经营地址：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.SCJYDZ0)	+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经营地址代码：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.SCJYXZQH0)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">数据导入日期：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.GXCLDATE)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">校核标志：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.JHBZ)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">注册地址名称：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.XZQH0_NAME)	+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">经营地址名称：</div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;">'+handleValue(data.SCJYXZQH0_NAME)  +'</div></div>' +
                '</div>'+
                '</div>'+
                
                '<div class="row"  onclick=showDetailsModal2("' + data.ORGANID +'","'+ data.JGMC0 +'")><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="width: 70%;padding-left: 0;"><span style="color:#00A2DA;cursor:pointer;"><a href="javascript:void(0);">详情信息</a></span></div></div>' +
                
                '<div class="rows">'+
                '<hr style="margin: 5px 0;"/><p class="row" style="margin: 0;"><span class="col-sm-3 text-right">附近查询</span></p>'+
                '<div class="row"><div class="col-sm-3 text-right" style="width: 30%;padding-left: 0;">距离：</div><div class="col-sm-6 wrdk_posa"><a class="megl" href="javascript:void(0);" onclick="gongliDj(this,1)">1公里</a><a href="javascript:void(0);" onclick="gongliDj(this,5)" class="megl active">5公里</a><a href="javascript:void(0);" onclick="gongliDj(this,10)">10公里</a></div><div class="col-sm-3 wrdk_ipt"><input type="text" id="srgl" value="5" onchange=gongliChange(this)>公里</div></div>' +
                '<div class="anniu" style="margin-top: 10px;"><button type="button" style="margin-right:10%;" class="btn btn-primary" onclick=jsxmhpfx('+data.LON+','+data.LAT+',"'+data.JGMC0+'")>环评项目分布</button><button type="button" class="btn btn-primary" onclick=tiandituAround('+data.LON+','+data.LAT+',"'+data.JGMC0+'")>敏感点分布</button></div>'+
            	'</div>';
//            $(".table-body").html(html);

//            $("#tongjituDiv").show();
//            $("#tongjituDiv").addClass("yj_table");
//            $(".yj_table .table-body").height($(".yj_table .table-body .rows").height()+10);
//            $(".yj_table").css("minHeight",$(".yj_table .table-body .rows").height()+50);
            //地图弹出框
            mapinfoWindow(data.JGMC0,html,evt);
		}
	})
	
}

function showDetails(){
	if($("#showDetailsBtn span").text()=="收起"){
		$("#xiangqingRows").hide();
		$("#showDetailsBtn span").text("详情信息")
	}else{
		$("#showDetailsBtn span").text("收起")
		$("#xiangqingRows").show();
	}
}

//附近公里点击
function  gongliDj(e,num){
    $("#srgl").val(num);
    $(e).siblings().removeClass("megl active");
    $(e).addClass("megl active");
}

//附近公里值改变事件
function gongliChange(obj){
	$(obj).parent().parent().find("div.wrdk_posa a").removeClass("megl active");
	var value = $(obj).val();
	if(value){
		if(value=="1"){
			$(obj).parent().parent().find("div.wrdk_posa a:eq(0)").addClass("megl active");
		}
		if(value=="5"){
			$(obj).parent().parent().find("div.wrdk_posa a:eq(1)").addClass("megl active");
		}
		if(value=="10"){
			$(obj).parent().parent().find("div.wrdk_posa a:eq(2)").addClass("megl active");
		}
	}
}



/**
 * 建设项目环评分析
 * @param lon：经度
 * @param lat：纬度
 */
function jsxmhpfx(lon, lat, jgmco){
	//距离
	dong.circleLength = $("#srgl").val();
	//圆geometry
	var circle = new dong.Circle([parseFloat(lon), parseFloat(lat)], {"radius" : dong.circleLength * 1000})
    var extent = circle.getExtent();
	//请求后台
	ajaxPost("/seimp/pesticide/getYzConsHouseAroundPesticide", {
		minLon : extent.xmin,
        maxLon : extent.xmax,
        minLat : extent.ymin,
        maxLat : extent.ymax,
        hangyeType : pes.searchParForYzcons.hangyeType
	}).done(function (result) {
		if(result.status == 0){
			var data = result.data;
			data = removeNotInCircle(data, circle);
			if(data.length > 0){
				//地图图层操作
				app.pesticideLayer.setVisibility(false);
				app.circleLayer.clear();
				app.yzconsLayer.clear();
				//弹出框关闭
				app.map.infoWindow.remove();
				
				app.map.setExtent(extent);
				addOneCircleToMap(circle, dong.circleLength, app.circleLayer);
				var attrColumnArr = ["LONGITUDE", "LATITUDE","CONSTRUCTIONID"];
				addPicPoinsToMap(data, "LONGITUDE", "LATITUDE", "4326", app.yzconsLayer, "img/dian/jianshexiangmu.png", "32", "32", 0, 16, "yzconsGra", attrColumnArr);
				addYzConsToDiv(data, lon, lat, jgmco);
				appOnePicPointToMap(lon, lat, jgmco, "img/dian/nongyao_high.png", app.yzconsLayer, "yzconsGra")
			}else{
				//未查询到结果
				toastr.warning("建设项目环评分析未查询到结果");
			}
		}
	})
}

/**
 * 判断数据是否在圆内
 * @param data
 * @param circle
 * @returns {Array}
 */
function removeNotInCircle(data, circle){
	var result = [];
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		var point = new dong.Point(currItem.LONGITUDE, currItem.LATITUDE);
		if(circle.contains(point)){
			result.push(data[i]);
		}
	}
	return result;
}

/**
 * 建设项目分析，数据表格
 * @param data
 */
function addYzConsToDiv(data, lon, lat, jgmco){
	var html = '<table id="info_table1" style="width: 100%;height: auto;" class="table table-bordered wrdk-table"><thead><tr><th  width="12%">序号</th><th width="40%">项目名称</th>'
		+'<th width="25%" id="hangyeTh" style="position: relative;">行业分类<b class="caret"></b></a><select id="pot_1" onchange=hangyeType('+lon+','+lat+',"'+jgmco+'") '
		+'style="position: absolute;top: 8px;left: 0;opacity:0;filter:alpha(opacity=0);width:100%;color: #333;"></select></th>'
		+'<th width="23%">操作</th></tr></thead><tbody id="hp_boty">';
	var optionHtml = '<option value="">全部</option>';
	var hengyeArr = [];
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		var PROJECTNAME = currItem.PROJECTNAME;
        if(currItem.PROJECTNAME && currItem.PROJECTNAME.length>8){
        	PROJECTNAME = currItem.PROJECTNAME.substr(0,8)+"...";
        }
        var EIAMANAGENAME = currItem.EIAMANAGENAME
        if(currItem.EIAMANAGENAME && currItem.EIAMANAGENAME.length>4){
        	EIAMANAGENAME = currItem.EIAMANAGENAME.substr(0,4)+"...";
        	if(hengyeArr.indexOf(currItem.EIAMANAGENAME)==-1){
        		hengyeArr.push(currItem.EIAMANAGENAME);
        		optionHtml += '<option value="'+currItem.EIAMANAGENAME+'" title="'+currItem.EIAMANAGENAME+'">'+EIAMANAGENAME+'</option>';
        	}
        }else{
        	EIAMANAGENAME = "";
        	currItem.EIAMANAGENAME = "";
        	
        }
        
        
		html += '<tr changeMap="CONSTRUCTIONID,'+currItem.CONSTRUCTIONID+'"><th>'+(i+1)+'</th><th title="'+currItem.PROJECTNAME+'">'+PROJECTNAME+'</th><th title="'+currItem.EIAMANAGENAME+'">'+EIAMANAGENAME+'</th>' +
	    '<th><a onclick="hpMessage(\''+currItem.CONSTRUCTIONID+'\')">详情</a></th></tr>';
	}
	html+= '</tbody></table>';
	$("#tongjituDiv #title").html("环评项目分布清单");
    $("#tongjituDiv .table-body").html(html);
    $("#pot_1").html(optionHtml)
    pes.optionHtml = optionHtml;
    //表格与地图联动
    changeBackAndMap();

    $("#tongjituDiv").show();
    $("#tongjituDiv").addClass("yj_table");
    
    /*$("#hangyeTh").click(function(){
    	if($("#pot_1").is(":hidden")){
    		$("#pot_1").show();
    	}else{
    		$("#pot_1").hide();
    	}
    })*/
}

function hangyeType( lon, lat, jgmco){
	pes.searchParForYzcons.hangyeType = $("#pot_1").val();
	jsxmhpfx2(lon, lat, jgmco);
}

//建设项目分析，带行业类型条件
function jsxmhpfx2(lon, lat, jgmco){
	//距离
	dong.circleLength = $("#srgl").val();
	//圆geometry
	var circle = new dong.Circle([parseFloat(lon), parseFloat(lat)], {"radius" : dong.circleLength * 1000})
    var extent = circle.getExtent();
	//请求后台
	ajaxPost("/seimp/pesticide/getYzConsHouseAroundPesticide", {
		minLon : extent.xmin,
        maxLon : extent.xmax,
        minLat : extent.ymin,
        maxLat : extent.ymax,
        hangyeType : pes.searchParForYzcons.hangyeType
	}).done(function (result) {
		if(result.status == 0){
			var data = result.data;
			data = removeNotInCircle(data, circle);
			if(data.length > 0){
				//地图图层操作
				app.pesticideLayer.setVisibility(false);
				app.circleLayer.clear();
				app.yzconsLayer.clear();
				//弹出框关闭
				app.map.infoWindow.remove();
				
				app.map.setExtent(extent);
				addOneCircleToMap(circle, dong.circleLength, app.circleLayer);
				var attrColumnArr = ["LONGITUDE", "LATITUDE","CONSTRUCTIONID"];
				addPicPoinsToMap(data, "LONGITUDE", "LATITUDE", "4326", app.yzconsLayer, "img/dian/jianshexiangmu.png", "32", "32", 0, 16, "yzconsGra", attrColumnArr);
				addYzConsToDiv2(data, lon, lat, jgmco);
				appOnePicPointToMap(lon, lat, jgmco, "img/dian/nongyao_high.png", app.yzconsLayer, "yzconsGra")
			}else{
				//未查询到结果
				toastr.warning("建设项目环评分析未查询到结果");
			}
		}
	})
}



/**
 * 建设项目分析，数据表格
 * @param data
 */
function addYzConsToDiv2(data, lon, lat, jgmco){
	var html = '<table id="info_table1" style="width: 100%;height: auto !important;" class="table table-bordered wrdk-table"><thead><tr><th  width="12%">序号</th><th width="40%">项目名称</th>'
		+'<th width="25%" id="hangyeTh" style="position: relative;">行业分类<b class="caret"></b></a><select id="pot_1" onchange=hangyeType('+lon+','+lat+',"'+jgmco+'") '
		+'style="position: absolute;top: 8px;left: 0;opacity:0;filter:alpha(opacity=0);width:100%;color: #333;"></select></th>'
		+'<th width="23%">操作</th></tr></thead><tbody id="hp_boty">';
	var hengyeArr = [];
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		var PROJECTNAME = currItem.PROJECTNAME;
        if(currItem.PROJECTNAME && currItem.PROJECTNAME.length>8){
        	PROJECTNAME = currItem.PROJECTNAME.substr(0,8)+"...";
        }
        var EIAMANAGENAME = currItem.EIAMANAGENAME
        if(currItem.EIAMANAGENAME && currItem.EIAMANAGENAME.length>4){
        	EIAMANAGENAME = currItem.EIAMANAGENAME.substr(0,4)+"...";
        	if(hengyeArr.indexOf(currItem.EIAMANAGENAME)==-1){
        		hengyeArr.push(currItem.EIAMANAGENAME);
        	}
        }else{
        	EIAMANAGENAME = "";
        	currItem.EIAMANAGENAME = "";
        	
        }
        
		html += '<tr changeMap="CONSTRUCTIONID,'+currItem.CONSTRUCTIONID+'"><th>'+(i+1)+'</th><th title="'+currItem.PROJECTNAME+'">'+PROJECTNAME+'</th><th title="'+currItem.EIAMANAGENAME+'">'+EIAMANAGENAME+'</th>' +
	    '<th><a onclick="hpMessage(\''+currItem.CONSTRUCTIONID+'\')">详情</a></th></tr>';
	}
	html+= '</tbody></table>';
	$("#tongjituDiv #title").html("环评项目分布清单");
    $("#tongjituDiv .table-body").html(html);
    $("#pot_1").html(pes.optionHtml)
    $("#pot_1").val(pes.searchParForYzcons.hangyeType)
    //表格与地图联动
    changeBackAndMap();

    $("#tongjituDiv").show();
    $("#tongjituDiv").addClass("yj_table");
    
    
}

//鼠标划过表格info_table1
function changeBackAndMap(){
    $('#info_table1 tbody tr').hover(function(evt) {
    	$(this).css("background","#c0d5e8");
    	//
    	var changeMap = $(this).attr("changeMap");
    	if(changeMap!=null && changeMap!=""){
    		var changeMapArr = changeMap.split(",");
    		changeMarkerPicUrl(app.yzconsLayer, changeMapArr[0], changeMapArr[1], "", "_high");
    	}
    }, function(evt) {
        $('#info_table1 tbody tr').css("background","none")
        var changeMap = $(this).attr("changeMap");
    	if(changeMap!=null && changeMap!=""){
    		var changeMapArr = changeMap.split(",");
    		changeMarkerPicUrl(app.yzconsLayer, changeMapArr[0], changeMapArr[1], "_high", "");
    	}
    });
}

function changeBackAndMap2(){
	 $('#info_table1 tbody tr').hover(function(evt) {
    	$(this).css("background","#c0d5e8");
    	//
    	var changeMap = $(this).attr("changeMap");
    	if(changeMap!=null && changeMap!=""){
    		var changeMapArr = changeMap.split(",");
    		changeMarkerPicUrl(app.tidituSearchLayer, changeMapArr[0], changeMapArr[1], "", "_high");
    	}
    }, function(evt) {
        $('#info_table1 tbody tr').css("background","none")
        var changeMap = $(this).attr("changeMap");
    	if(changeMap!=null && changeMap!=""){
    		var changeMapArr = changeMap.split(",");
    		changeMarkerPicUrl(app.tidituSearchLayer, changeMapArr[0], changeMapArr[1], "_high", "");
    	}
    });
}

//建设项目环评点位详细信息
function hpMessage(constructionId){
    ajaxPost('/seimp/wrdk/getJchpfxMessage1',{constructionId:constructionId}).done(function(result){
        if ( result.status == "0" ) {
            console.log(result.data);
            var data = result.data[0];
            var PROJECTNAME = data.PROJECTNAME;
            var PROJECTADDRESS = data.PROJECTADDRESS;
            var NATIONALECONOMYNAME = data.NATIONALECONOMYNAME;
            var EIAMANAGENAME = data.EIAMANAGENAME;
            if ( PROJECTNAME.length >16) PROJECTNAME = PROJECTNAME.substr(0,16)+"...";
            if(EIAMANAGENAME.length>16) EIAMANAGENAME = EIAMANAGENAME.substr(0,16)+"..."
            if ( NATIONALECONOMYNAME.length>16) NATIONALECONOMYNAME = NATIONALECONOMYNAME.substr(0,16)+"...";
            if (PROJECTADDRESS.length > 16 ) PROJECTADDRESS = PROJECTADDRESS.substr(0,16)+"...";

            var html = '<div class="rows"><div class="row"><div class="col-sm-4 text-right">项目名称：</div><div class="col-sm-8 text-left" title="'+data.PROJECTNAME+'">'+PROJECTNAME+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">环评文件类别：</div><div class="col-sm-8 text-left" title="'+data.EIAFILETYPE+'">'+data.EIAFILETYPE+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">受理日期：</div><div class="col-sm-8 text-left" title="'+data.ACCEPTANCEDATE+'">'+data.ACCEPTANCEDATE+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">国民经济代码：</div><div class="col-sm-8 text-left" title="'+data.NATIONALECONOMYCODE+'">'+data.NATIONALECONOMYCODE+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">数据来源：</div><div class="col-sm-8 text-left" title="'+data.DATASOURCE+'">'+data.DATASOURCE+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">环评管理类别：</div><div class="col-sm-8 text-left" title="'+data.EIAMANAGETYPE+'">'+data.EIAMANAGETYPE+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">建设地点：</div><div class="col-sm-8 text-left" title="'+data.PROJECTADDRESS+'">'+PROJECTADDRESS+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">总投资（万元）：</div><div class="col-sm-8 text-left" title="'+data.PROJECTINVEST+'">'+data.PROJECTINVEST+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">环保投资（万元）：</div><div class="col-sm-8 text-left" title="'+data.ENVIRONINVEST+'">'+data.ENVIRONINVEST+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">对接省份名称：</div><div class="col-sm-8 text-left" title="'+data.PROVINCENAME+'">'+data.PROVINCENAME+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">国民经济类别名称：</div><div class="col-sm-8 text-left" title="'+data.NATIONALECONOMYNAME+'">'+NATIONALECONOMYNAME+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">环评管理类别名称：</div><div class="col-sm-8 text-left" title="'+data.EIAMANAGENAME+'">'+EIAMANAGENAME+'</div></div>' +
                '<div class="row"><div class="col-sm-4 text-right">入监管平台时间：</div><div class="col-sm-8 text-left" title="'+data.STORAGETIME+'">'+data.STORAGETIME+'</div></div></div>' ;
            $("#tongjituDiv_2 .table-body").html(html);
            $("#tongjituDiv_2").show();
            $("#tongjituDiv_2").addClass("yj_table2");
            $(".yj_table2 .table-body").height($(".yj_table2 .table-body .rows").height()+10);
            $(".yj_table2").css("minHeight",$(".yj_table2 .table-body .rows").height()+10);
            
        }
    })
}

/**
 * 通过天地图API，附近易受影响点分析
 * @param lon
 * @param lat
 */
function tiandituAround(lon, lat, jgmco){
	//距离
	dong.circleLength = $("#srgl").val();
	//圆geometry
	var circle = new dong.Circle([parseFloat(lon), parseFloat(lat)], {"radius" : dong.circleLength * 1000})
    var extent = circle.getExtent();
	var nameArr = {
			'学校':'img/dian/xuexiao.png',
			'医院':'img/dian/yiyuan.png',
			'住宅':'img/dian/zhuzhai.png'
		}
	;
	getTidituDataByArr(nameArr,lon,lat,jgmco,circle,dong.circleLength);
}

function getTidituDataByArr(nameArr, lon, lat, jgmco, circle, circleLength){
	var isFirstResult = true;
	var isHaveResult = false;
	var index = 0;
	var tableHtml = "";
	tableHtml = '<table id="info_table1" style="width: 100%;height: auto;" changeMap="" class="table table-bordered wrdk-table"><thead><tr><th width="10%">序号</th><th width="45%">名称</th>'
		+'<th width="45%">地址</th></tr></thead><tbody>';
	var dataCount = 1;
	for (var currItem in nameArr) {
		var currVal = nameArr[currItem];
		var url = "http://www.tianditu.com/query.shtml?postStr={\"keyWord\":\""+currItem+"\",\"level\":\"15\"," +
				"\"mapBound\":\"116.40466,39.90684,116.45016,39.93138\",\"queryType\":\"3\",\"pointLonlat\":\""+lon+","+lat+"\"," +
						"\"queryRadius\":\""+circleLength*1000+"\",\"count\":\"2000\",\"start\":\"0\"}&type=query";
		$.ajax({
			url:url,
			async:false,
			success:function(result){
				var result = $.parseJSON(result);
				if (result.count > 0){
	        		isHaveResult = true;
	        		var data = result.pois;
	        		//是否是第一次获取结果
	        		if(isFirstResult){
	        			isFirstResult = false;
	        			
	        			//地图图层操作
	    				app.pesticideLayer.setVisibility(false);
	    				app.circleLayer.clear();
	    				app.tidituSearchLayer.clear();
	    				//弹出框关闭
	    				app.map.infoWindow.remove();
	        			
	        			app.map.setExtent(circle.getExtent());
	    				addOneCircleToMap(circle, circleLength, app.circleLayer);
	        		}
	        		
	        		//处理数据
	    			data = handleTiandituData(data, circle, dataCount);
	    			var attrColumnArr = ["lon", "lat","graIndex"];
					addPicPoinsToMap(data, "lon", "lat", "4326", app.tidituSearchLayer, nameArr[result.keyWord], "32", "32", 0, 16, "tiandituGra", attrColumnArr);
					tableHtml += addTiandituDataToTable(data, dataCount);
					dataCount += data.length;
	        		
	        	}else{
	        		toastr.warning(result.keyWord+"未查询到结果")
	        	}
				//加上中心点和名称
				if(index==2){
	    			if(isHaveResult){
	    				appOnePicPointToMap(lon, lat, jgmco, "img/dian/nongyao_high.png", app.tidituSearchLayer, "tiandituGra");
	    				//弹出框内容改变
	    				$("#tongjituDiv #title").html("敏感点分布清单");
	    			    $("#tongjituDiv .table-body").html(tableHtml);
	    			    //表格与地图联动
	    			    changeBackAndMap2();
	    			    
	    			    $("#tongjituDiv").show();
	    			    $("#tongjituDiv").addClass("yj_table");
	    			}
	    		}
				index++;
			},
			error:function(result){
				toastr.warning(currItem+"未查询到结果")
				index++;
				if(index==2){
	    			if(isHaveResult){
	    				appOnePicPointToMap(lon, lat, jgmco, "img/dian/nongyao_high.png", app.tidituSearchLayer, "tiandituGra");
	    				//弹出框内容改变
	    				$("#tongjituDiv #title").html("敏感点分布清单");
	    			    $("#tongjituDiv .table-body").html(tableHtml);
	    			    //表格与地图联动
	    			    changeBackAndMap2();
	    			    
	    			    $("#tongjituDiv").show();
	    			    $("#tongjituDiv").addClass("yj_table");
	    			}
	    		}
				console.log(result);
			}
		})
		$.get(url,function(result){
			
		},function(evt){
			
		})
            
	}
}

//处理天地图返回数据的经纬度
function handleTiandituData(data, circle, dataCount){
	var result = [];
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		var pointArr = currItem.lonlat.split(" ");
		currItem.lon = pointArr[0];
		currItem.lat = pointArr[1];
		var point = new dong.Point(currItem.lon, currItem.lat);
		if(circle.contains(point)){
			result.push(data[i]);
		}
		
		//添加序号
		currItem.graIndex = (dataCount++);
	}
	return result;
}

//拼接天地图返回数据的表格html
function addTiandituDataToTable(data, dataCount){
	var result = "";
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		result += '<tr changeMap="graIndex,'+currItem.graIndex+'"><th>'+(dataCount++)+'</th><th>'+currItem.name+'</th><th>'+currItem.address+'</th></tr>';
	}
	return result;
}

/**
 * 添加多个图标点到地图上
 * @param data：数据
 * @param lonStr：经度字段名称
 * @param latStr：纬度字段名称
 * @param mapLayer：图层
 * @param picUrl：图片url
 * @param width：图片宽度
 * @param height：图片高度
 * @param offsetX：图片偏移
 * @param offsetY：图片偏移
 * @param attrGraTypeValue：graType属性值
 */
function addPicPoinsToMap(data, lonStr, latStr, apatialStr, mapLayer, picUrl, width, height, offsetX, offsetY, attrGraTypeValue, attrColumnArr){
	
	//symbol
	
	
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		var attrs = {
				graType : attrGraTypeValue,
		}
		
		//判断经纬度是否存在
		if(currItem[lonStr] && currItem[latStr]){
			var pointSymbol = new dong.PictureMarkerSymbol(picUrl, width, height);
			pointSymbol.setOffset(offsetX, offsetY);
			
			//添加到graphic上的属性
			for (var j = 0; j < attrColumnArr.length; j++) {
				var currColumn = attrColumnArr[j];
				attrs[currColumn] = currItem[currColumn];
			}
			
			var point = new dong.Point(currItem[lonStr], currItem[latStr], new dong.SpatialReference({ wkid: parseInt(apatialStr) }));
			var graphic = new dong.Graphic(point,pointSymbol, attrs);
			mapLayer.add(graphic);
		}
	}
	
}

/**
 * 添加一个TextGraphic到地图上
 * @param textStr：名称
 * @param point：点
 * @param mapLayer：图层
 * @param attrGraTypeValue：graType属性的值
 */
function addTextGraphicToLayer(textStr, point, mapLayer, attrGraTypeValue){
	var attrs = {
			graType : attrGraTypeValue
	}
	
	var textSymbol = new dong.TextSymbol(textStr);
    textSymbol.setOffset(textStr.length * 7, 40)
    textSymbol.setHaloSize(1)
    textSymbol.setHaloColor(new dong.Color([255, 255, 255]));
    var font  = new dong.Font();
    font.setSize("10pt");
    font.setWeight(dong.Font.WEIGHT_BOLD);
    textSymbol.setFont(font);
    
    var textGra = new dong.Graphic(point, textSymbol, attrs);
    mapLayer.add(textGra);
}


/**
 * 添加图标点到地图上
 */
function appOnePicPointToMap(lon, lat, enterpriseName, picUrl, mapLayer, graTypeVal){
	var attrs = {
			graType : graTypeVal
	}
	var pointSymbol = new dong.PictureMarkerSymbol(picUrl, 32, 32);
	pointSymbol.setOffset(0, 16)
    var point = new dong.Point(lon,lat, new dong.SpatialReference({ wkid: 4326 }));
    var graphic = new dong.Graphic(point,pointSymbol, attrs);
    mapLayer.add(graphic);
    
    var textSymbol = new dong.TextSymbol(enterpriseName);
    textSymbol.setOffset(enterpriseName.length * 7, 40)
    textSymbol.setHaloSize(2)
    textSymbol.setHaloColor(new dong.Color([255, 255, 255]));
    var font  = new dong.Font();
    font.setSize("12pt");
    font.setWeight(dong.Font.WEIGHT_BOLD);
    textSymbol.setFont(font);
    var textGra = new dong.Graphic(point, textSymbol, attrs);
    mapLayer.add(textGra);
    
}

/**
 * 添加一个圆到地图上
 * @param circle：圆geometry
 * @param length：距离
 * @param mapLayer：图层
 */
function addOneCircleToMap(circle, length, mapLayer){
	removeGraByAttr("circleGra", mapLayer);
	
	var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
		new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 1),
		new dong.Color([255,255,255,0])
	);
	var attrs = {
			graType : "circleGra"
	}
	var graphic = new dong.Graphic(circle, sfs, attrs);
	mapLayer.add(graphic);
	
	var extent = circle.getExtent();
	var textPoint = new dong.Point(extent.xmax, (extent.ymin+extent.ymax)/2);
	
	var textSymbol = new dong.TextSymbol(length + "公里");
    textSymbol.setOffset((length + "公里").length * 7, 0)
    textSymbol.setHaloSize(2)
    textSymbol.setHaloColor(new dong.Color([255, 255, 255]));
    textSymbol.setColor(new dong.Color([255,0,0]));
    var font  = new dong.Font();
    font.setSize("12pt");
    font.setWeight(dong.Font.WEIGHT_NORMAL);
    textSymbol.setFont(font);
    var textGra = new dong.Graphic(textPoint, textSymbol, attrs);
    mapLayer.add(textGra);
	
}

//改变地图图层图标
function changeMarkerPicUrl(mapLayer, attrColumn, attrValue, oldStr, newStr){
	var removeGra = null;
	var graphics = mapLayer.graphics;
	for (var i = 0; i < graphics.length; i++) {
		var currGra = graphics[i];
		var attrs = currGra.attributes;
		if(attrs && attrs[attrColumn] && attrs[attrColumn]==attrValue){
			//添加高亮
			if(oldStr==""){
				var urlStr = currGra.symbol.url;
				if(urlStr.indexOf("_high")!=-1){
					urlStr = urlStr.replace("_high", "");
				}
				urlStr = urlStr.substr(0, urlStr.length-4)+newStr+".png";
				currGra.setSymbol(currGra.symbol.setUrl(urlStr));
				removeGra = currGra;
				
			}
			if(newStr==""){
				var urlStr = currGra.symbol.url;
				urlStr = urlStr.replace(oldStr, "");
				currGra.setSymbol(currGra.symbol.setUrl(urlStr));
				currGra.draw();
			}
		}else{
			var urlStr = currGra.symbol.url;
			if(urlStr.indexOf("_high")!=-1){
				urlStr = urlStr.replace("_high", "");
				currGra.setSymbol(currGra.symbol.setUrl(urlStr));
				currGra.draw();
			}
		}
	}
	if(removeGra){
		mapLayer.remove(removeGra);
		mapLayer.add(removeGra);
	}
//	mapLayer.redraw();
}

//使某个图标作为地图中心
function changeMapCenterByMarker(mapLayer, attrColumn, attrValue){
	var removeGra = null;
	var graphics = mapLayer.graphics;
	for (var i = 0; i < graphics.length; i++) {
		var currGra = graphics[i];
		var attrs = currGra.attributes;
		if(attrs && attrs[attrColumn] && attrs[attrColumn]==attrValue){
			app.map.setLevel(5);
			app.map.centerAt(currGra.geometry);
			
		}
	}
	
}

//地图弹出框
function mapinfoWindow(name,html,evt){
    app.map.infoWindow.setTitle(name);
    app.map.infoWindow.setContent(html);
    var centerPoint = new dong.Point(evt.graphic.geometry.x,evt.graphic.geometry.y,new dong.SpatialReference({ wkid:4326 }));
    //app.map.infoWindow.resize("464","467");
    $(".dextra-bubble-pop").addClass("infoBubble-pop");
    $(".anniu").css("margin-left","100px");
    app.map.infoWindow.show(centerPoint);
    //弹出框关闭事件
    $(".window_table .close").click(function(){
    	changeMarkerPicUrl(app.pesticideLayer, "ORGANID", selectPesticideOrganId, "_high", "");
        app.map.infoWindow.remove();
        // removeTc("countryGraphicsLayer1");
//        removeTc("wrdkcentral");
    })

    var extentPar = {
        "xmin": evt.graphic.geometry.x, "ymin": evt.graphic.geometry.y, "xmax": evt.graphic.geometry.x, "ymax": evt.graphic.geometry.y,
        "spatialReference": {"wkid": 4326}
    }
    app.map.setExtent(new dong.Extent(extentPar));
}

/**
 * 根据属性，删除图层中的graphics
 */
function removeGraByAttr(val, mapLayer){
	var gras = mapLayer.graphics;
	for (var i = gras.length - 1; i >= 0; i--) {
		var gra = gras[i];
		var attrs = gra.attributes;
		if(attrs && attrs.graType && attrs.graType == val){
			mapLayer.remove(gra);
		}
	}
}

/**
 * 处理值
 */
function handleValue(value){
	if(value == null){
		return "";
	}else{
		return value;
	}
}





/************************统计与统计图******************/
//农药制造企业数据概览
function getIndexSumValue(){
	ajaxPost('/seimp/pesticide/getIndexSumValue',{
	}).done(function(result){
        if( result.status == 0 ) {
        	var data = result.data;
        	$("#sumCount1").html(data[0].COUNT+"家");
        	$("#sumCount2").html(data[1].COUNT+"家");
        	$("#sumCount3").html(data[2].COUNT+"家");
        }
	})
}
getIndexSumValue();

//农药制造注销/吊销企业分省统计
getEcharts1();
function getEcharts1(){
	ajaxPost("/seimp/pesticide/getStatisDataByProvince", {
		isCancle : "1"
    }).done(function (result) {
        if(result.status == 0){
        	getOptionParameter1(result.data);
        }
    });
}

//生成统计图option的参数
function getOptionParameter1(data){
	var yAxisArr = [];
	var seriesArr = [];
	for (var i = data.length-1; i>=0 ; i--) {
		var currItem = data[i];
		if(currItem.name && currItem.COUNT){
			yAxisArr.push(currItem.name);
			seriesArr.push(currItem.COUNT);
		}
	}
	
	initEcharts1(yAxisArr, seriesArr);
}


function initEcharts1(yAxisArr, seriesArr){
	option = {
			title: {
		        text: '',
		        subtext: ''
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
		            type: 'shadow'
		        },
		        formatter: function (params){
		        	var result = params[0].name + '<br>'
		        		+'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		        		+params[0].seriesName + ': ' + params[0].value + "(家	)";
		        	return result;
		        }
		    },
		    legend: {
		        data: ['农药制造注销/吊销企业数量']
		    },
		    grid: {
		        left: '3%',
		        right: '10%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		        type: 'value',
		        boundaryGap: [0, 0.01],
		        name : '数量(家)'
		    },
		    yAxis: {
		        type: 'category',
		        data : yAxisArr,
		        name : '省名'
		    },
		    series: [
		        {
		            name: '农药制造注销/吊销企业数量',
		            type: 'bar',
		            itemStyle:{
		                normal:{color:'#d48265'}
		            },
		            barWidth:20,
		            data:seriesArr
		        }
		    ]
		};
	var myChart = echarts.init(document.getElementById('echarts1'));
	myChart.setOption(option);
	
}

//农药制造企业分省统计
getEcharts2();
function getEcharts2(){
	ajaxPost("/seimp/pesticide/getStatisDataByProvince", {
    }).done(function (result) {
        if(result.status == 0){
        	getOptionParameter2(result.data);
        }
    });
}

//生成统计图option的参数
function getOptionParameter2(data){
	var yAxisArr = [];
	var seriesArr = [];
	for (var i = data.length-1; i>=0 ; i--) {
		var currItem = data[i];
		if(currItem.name && currItem.COUNT){
			yAxisArr.push(currItem.name);
			seriesArr.push(currItem.COUNT);
		}
	}
	
	initEcharts2(yAxisArr, seriesArr);
}


function initEcharts2(yAxisArr, seriesArr){
	option = {
			title: {
		        text: '',
		        subtext: ''
		    },
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {
		            type: 'shadow'
		        },
		        formatter: function (params){
		        	var result = params[0].name + '<br>'
		        		+'<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+params[0].color+';"></span>'
		        		+params[0].seriesName + ': ' + params[0].value + "(家)";
		        	return result;
		        }
		    },
		    legend: {
		        data: ['农药制造企业数量']
		    },
		    grid: {
		        left: '3%',
		        right: '10%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		        type: 'value',
		        boundaryGap: [0, 0.01],
		        name : '数量(家)'
		    },
		    yAxis: {
		        type: 'category',
		        data : yAxisArr,
		        name : '省名'
		    },
		    series: [
		        {
		            name: '农药制造企业数量',
		            type: 'bar',
		            itemStyle:{
		                normal:{color:'#61a0a8'}
		            },
		            barWidth:20,
		            data:seriesArr
		        }
		    ]
		};
	var myChart = echarts.init(document.getElementById('echarts2'));
	myChart.setOption(option);
	
}


function addPesticideToTable(){
	//更新表格
		var columns =[{
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {
	            return index + 1;
	        }
		}, {
	        field: 'JGMC0',
	        title: '机构名称',
	        align: 'center',
	        class :'w-200'
	
	    }, {
	        field: 'PROVINCE',
	        title: '省份',
	        align: 'center',
	        class :'w-70'
	    }, {
	        field: 'CITY',
	        title: '市区',
	        align: 'center',
	        class :'w-70'
	    }, {
	        field: 'COUNTY',
	        title: '县区',
	        align: 'center',
	        class :'w-70'
	    },{
	        field: 'JGDZ0',
	        title: '注册地址',
	        align: 'center',
	        class :'w-300'
	    }, {
	        field: 'BZRQ0',
	        title: '经营期限自',
	        align: 'center',
	    }, {
	        field: 'ZFRQ0',
	        title: '经营期限至',
	        align: 'center',
	
	    },{
            field: '',
            title: '操作',
            align: 'center',
            valign: 'middle',
//            class:'w-200',
            formatter :function(value,row,inde){
            	var className = "errorDingwei";
            	if(row.LONGITUDE && row.LATITUDE){
            		className = "successDingwei";
            	}
//                var s = "<a class='"+className+"'  onclick=dingwei('" + row.LONGITUDE +"','"+ row.LATITUDE +"','"+ row.PROJECTNAME + "');>定位</a>";
            	var s = "<a class='btn btn-info'    onclick=showDetailsModal2('" + row.ORGANID +"','"+ row.JGMC0 +"') title='详细信息'><i class='iconfont icon-xxxx'></i></a>";
//                var s = "<a   onclick=showDetailsModal2('" + row.ORGANID +"','"+ row.JGMC0 +"');>详情</a>";
                return s;
            }
        }];
		//销毁表格
		$('#pesticideTable').bootstrapTable('destroy');
		//生成表格
		$('#pesticideTable').bootstrapTable({
		    method : 'POST',
		    url : "/seimp/pesticide/getPesticidePageData",
		    columns : columns,
		    //search:true,
		    //classes:'table-no-bordered',	//消除表格边框
		    iconSize : "outline",
		    clickToSelect : true,			// 点击选中行
		    pageNumber : 1,
		    pageSize : 10, 					
		    striped : true, 				// 使表格带有条纹
		    pagination : true,				// 在表格底部显示分页工具栏
		    //showPaginationSwitch: true,       //是否显示选择分页数按钮
	        clickToSelect: true,
		    sidePagination : "server",		// 表格分页的位置 client||server
//		    onlyInfoPagination:false,
		    queryParams: function queryParams(params) {   //设置查询参数  
		    	var datas = {};
		    	var data =  JSON.stringify({
		    		pageSize : params.limit,  //页面大小
		    		pageNumber : params.offset,   //页码
		    		jgmco : pes.searchPar.jgmco,
		    		status : pes.searchPar.status,
		    		province : pes.searchPar.province,
		    		city : pes.searchPar.city,
		    		county : pes.searchPar.county,
		    		lCloumnStr : pes.searchPar.lCloumnStr
			    });	    	
				datas.data = data;
			    return datas;  
			    console.log(datas)
	          }, 
		    queryParamsType : "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
		    silent : true, 						// 刷新事件必须设置
		    contentType : "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
		    onClickRow : function(row, $element) {
		      $('.success').removeClass('success');
		      $($element).addClass('success');
		    },
		    onLoadError: function (status) {
	            toastr.error("请求超时");
	            return false;
	        },
	        onLoadSuccess:function(data){

	        },
	        onDblClickRow:function(row, $element){
	        	//div切换
	        	$(".btnSwitch .btn:eq(1)").click();
	        	//使用某一个图标作为地图中心
	        	changeMapCenterByMarker(app.pesticideLayer, "ORGANID", row.ORGANID);
	        	//图标高亮
				changeMarkerPicUrl(app.pesticideLayer, "ORGANID", row.ORGANID, "", "_high");
				//
	        },
		    icons : {
		      refresh : "glyphicon-repeat",
		      toggle : "glyphicon-list-alt",
		      columns : "glyphicon-list"
		    }
		});
}




$(document).ready(function(){
	//关闭统计表
	$("#tongjituDiv  .switch").click(function(){
		//
		$("#tongjituDiv").hide();
		
		//地图图层操作
		app.circleLayer.clear();
		app.tidituSearchLayer.clear();
		app.yzconsLayer.clear();
		app.pesticideLayer.setVisibility(true);

    	changeMarkerPicUrl(app.pesticideLayer, "ORGANID", selectPesticideOrganId, "_high", "");
//		app.map.setExtent(extent);
	})
	
	//建设项目距离分析
	$("label.yzconsAnaBtn").click(function(evt) {
		//关闭弹出框
		$("#tongjituDiv").hide();
		//关闭弹出框
		$("#tongjituDiv_2").hide();
		
		//地图图层操作
		//地图图层操作
		app.circleLayer.clear();
		app.tidituSearchLayer.clear();
		app.yzconsLayer.clear();
		app.pesticideLayer.clear();
		app.pesticideLayer.setVisibility(true);
		app.map.setExtent(extent);
		
		pes.searchPar.jgmco = $("#jgmco").val();
		pes.searchPar.status = $("#status").val();
		pes.searchPar.province = $("#province").val();
		pes.searchPar.city = $("#city").val();
		pes.searchPar.county = $("#county").val();
		pes.searchPar.lCloumnStr = $("label.pesticideRadio_active input").val();
		
		//添加农药厂数据到地图上
		addPesticideGraphic();
		
		//添加农药厂数据到表格上
		addPesticideToTable();
	})

	
//	*****拖拽--start*****
	var $div = $("#tongjituDiv .table-title");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown", function (event) {
    	if($('#tongjituDiv .large').attr('data') == 1){
	        /* 获取需要拖动节点的坐标 */
	        var offset_x = $(this)[0].offsetLeft;//x坐标
	        var offset_y = $(this)[0].offsetTop;//y坐标
	        /* 获取当前鼠标的坐标 */
	        var mouse_x = event.pageX;
	        var mouse_y = event.pageY;
	        /* 绑定拖动事件 */
	        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
	        $(document).bind("mousemove", function (ev) {
	            /* 计算鼠标移动了的位置 */
	            var _x = ev.pageX - mouse_x;
	            var _y = ev.pageY - mouse_y;
	            /* 设置移动后的元素坐标 */
	            var now_x = (offset_x + _x ) + "px";
	            var now_y = (offset_y + _y ) + "px";
	            /* 改变目标元素的位置 */
	            if(now_y < 0){
	            	now_y = 0
	            }
	            $div.css({
	                top: now_y,
	                left: now_x
	            });
	            $('#tongjituDiv').css({
	                top: now_y,
	                left: now_x
	            });
	        });
    	 }else{
 			return;
 		}
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
    	var top = $div.css('top').split('px')
    	var left = $div.css('left').split('px')
    	if(top[0] < 0){
    		$div.css('top','0')
    		$('#tongjituDiv').css('top','5%')
    	}
    	if(left[0] < 0){
    		$div.css('left','0')
    		$('#tongjituDiv').css('left','10px')
    	}
        $(this).unbind("mousemove");
    });
    
//	*****拖拽--end*****
//放大/缩小
    $('#tongjituDiv .large').click(function(){
        if($(this).attr('data') == 1){
            $('#tongjituDiv ').css({
                top:0,
                right:0,
                left:0,
                width:'100%',
                height:'97%',
            })
            $("#tongjituDiv .table-title").css({
                top:'0px',
                right:0,
                left:0,
                width:'100%'
            })
            $(this).css('background-image','url("img/min_big.png")')
            $('#tongjituDiv .table-body').css('width','98%')
            $('#tongjituDiv .table-body').css('height','88%')
            $('#tongjituDiv .table-body table').css('width','100%')
            $('#tongjituDiv .table-body table').css('height','auto')
            $(this).attr('data','2')
        }else{
            $(this).attr('data','1')
            $('#tongjituDiv').css({
                top:'116px',
                right:'79px',
                left:'auto',
                width:'550px',
                height:'550px',
            })
            $("#tongjituDiv #main_tabletitle").css({
                top:'116px',
                right:'79px',
                left:'auto',
                width:'550px',
            })
            $(this).css('background-image','url("img/max_big.png")')
            $('#tongjituDiv #main_tabletitle').addClass('main_tabletitle1')
            $('#tongjituDiv .table-body').css('width','98%')
            $('#tongjituDiv .table-body').css('height','88%')
            $('#tongjituDiv .table-body table').css('width','100%')
            $('#tongjituDiv .table-body table').css('height','auto')
        }

    })

})

$(document).ready(function(){
//	*****拖拽--start*****
	var $div0 = $("#tongjituDiv_2 .table-title");
    /* 绑定鼠标左键按住事件 */
    $div0.bind("mousedown", function (event) {
    	if($('#tongjituDiv_2 .large').attr('data') == 1){
	        /* 获取需要拖动节点的坐标 */
	        var offset_x = $(this)[0].offsetLeft;//x坐标
	        var offset_y = $(this)[0].offsetTop;//y坐标
	        /* 获取当前鼠标的坐标 */
	        var mouse_x = event.pageX;
	        var mouse_y = event.pageY;
	        /* 绑定拖动事件 */
	        /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
	        $(document).bind("mousemove", function (ev) {
	            /* 计算鼠标移动了的位置 */
	            var _x = ev.pageX - mouse_x;
	            var _y = ev.pageY - mouse_y;
	            /* 设置移动后的元素坐标 */
	            var now_x = (offset_x + _x ) + "px";
	            var now_y = (offset_y + _y ) + "px";
	            /* 改变目标元素的位置 */
	            if(now_y < 0){
	            	now_y = 0
	            }
	            $div0.css({
	                top: now_y,
	                left: now_x
	            });
	            $('#tongjituDiv_2').css({
	                top: now_y,
	                left: now_x
	            });
	        });
    	 }else{
 			return;
 		}
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup", function () {
    	var top = $div0.css('top').split('px')
    	var left = $div0.css('left').split('px')
    	if(top[0] < 0){
    		$div0.css('top','0')
    		$('#tongjituDiv_2').css('top','5%')
    	}
    	if(left[0] < 0){
    		$div0.css('left','0')
    		$('#tongjituDiv_2').css('left','10px')
    	}
        $(this).unbind("mousemove");
    });

})   
//	*****拖拽--end*****
//关闭统计表
$("#tongjituDiv_2  .switch").click(function(){
	$("#tongjituDiv_2").hide();
})
//滚动条
//$(".basic_item").niceScroll({cursorcolor:"#9e9e9e",cursorwidth:"5px",cursorborder:"none"});

//等待框显示
function dengdai(){
    var _PageHeight = document.documentElement.clientHeight,
        _PageWidth = document.documentElement.clientWidth;
    //计算loading框距离顶部和左部的距离（loading框的宽度为215px，高度为61px）
    var _LoadingTop = _PageHeight > 61 ? (_PageHeight - 61) / 2 : 0,
        _LoadingLeft = _PageWidth > 215 ? (_PageWidth - 215) / 2 : 0;
    //在页面未加载完毕之前显示的loading Html自定义内容
    var _LoadingHtml = '<div id="loadingDiv" style="position: fixed;left: 0;width: 100%;height: 100%;top: 0;background: rgba(0,0,0,.2);z-index: 10000;"><div style="position: absolute;cursor1: wait;left: 50%;top: 50%;width: auto;height: 60px;line-height: 56px;padding-left: 50px;padding-right: 10px;background: #fff url(img/loading.gif) no-repeat scroll 10px 22px;color: #333;font-family: \'Microsoft YaHei\';font-size: 18px;border-radius: 6px;transform: translate(-50%,-50%);">页面加载中，请等待...</div></div>';
    //呈现loading效果
    $("#yc").html(_LoadingHtml)
}
//删除等待框
function removeDengdai(){
    $("#loadingDiv").remove();
}


/******处理数据***********/
function handlePesticideData(columnMode){
	var circleLength = 10;
	var lColumnStr = 'L10';
	if(columnMode=="1"){
		circleLength = 10;
		lColumnStr = 'L10';
	}
	if(columnMode=="2"){
		circleLength = 100;
		lColumnStr = 'L100';
	}
	if(columnMode=="3"){
		circleLength = 1000;
		lColumnStr = 'L1000';
	}
	var organIDs = [];
	ajaxPost("/seimp/pesticide/getPesticideAndYzcons", {
    }).done(function (result) {
        if(result.status == 0){
        	var data = result.data;
        	var pesticide = data.pesticide;
        	var yzcons = data.yzcons;
        	//遍历农药厂数据
        	for (var i = 0; i < pesticide.length; i++) {
				var currPesticide = pesticide[i];
				var circle = new dong.Circle([parseFloat(currPesticide.LON), parseFloat(currPesticide.LAT)], {"radius" : circleLength});
				var organID = currPesticide.ORGANID;
				var falg= false;
				//遍历建设项目
				for (var j = 0; j < yzcons.length; j++) {
					var currYzcons = yzcons[j];
					var point = new dong.Point(currYzcons.LON, currYzcons.LAT);
					if(circle.contains(point)){
						falg = true;
						break;
					}
				}
				if(falg){
					organIDs.push(organID);
				}
				
			}
        	
        	
        	//是否更新数据库
        	if(organIDs.length > 0){
        		var organIDsStr = "'"+ organIDs.join("','") +"'";
        		ajaxPost("/seimp/pesticide/updatePesticideL", {
        			organIDs : organIDsStr,
        			lColumnStr : lColumnStr
        	    }).done(function (result) {
        	    	if(result.status == 0){
        	    		console.log("数据处理成功");
        	    	}
        	    })
        	}else{
        		console.log("无结果");
        	}
        }
    });
}


//地图模式/清单模式按钮切换
$(function(){
	$(".btnSwitch .btn").click(function() {
		$(this).addClass("btnSwitchActive").parent(".btnSwitch li").siblings(".btnSwitch li").children(".btnSwitch .btn").removeClass("btnSwitchActive");
		var _html=$(this).html();
		console.log(_html);
		if(_html=="地图模式"){
			$(".btnSwitchMap").show();
			$(".btnSwitchTable").hide();
		}else if(_html=="清单模式"){
			$(".btnSwitchMap").hide();
			$(".btnSwitchTable").show();
		}
	})
})


//详情信息
function showDetailsModal2(ORGANID,JGMC0){
	var enterPriseInfo = {
			ORGANID:ORGANID,
		};
	showDetailsModal3(JSON.stringify(enterPriseInfo), JGMC0, "views/data/detailIframe/pesticideLandDetails.html")
}

//跳转数据详情页面
//显示排污许可证详细信息
function showDetailsModal3(dataIDJson, titleName, urlStr){
	$("#pwModal2").modal('toggle');
	sessionStorage.setItem('dataIDJson', dataIDJson);
	$("#myModalLabel2").text(titleName);
	$("#detailsIframe2").attr("src",urlStr);
	$("#detailsDiv2").show();
}


