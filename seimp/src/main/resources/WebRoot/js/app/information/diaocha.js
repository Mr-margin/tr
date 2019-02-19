// 地图切换选项卡
/*$('.map-area').click(function(){
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
    $(".floattool").show();
});

$('.table-area').click(function(){
    $(this).addClass('map-table-color').siblings().removeClass('map-table-color');
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $(".floattool").hide();
    $(".main_table").hide();
    $(".main_graphic").hide();
    $(".time-axis-box").hide();GraphicsLayer
})*/
$('.mapButton').click(function(){
    $(this).attr('src','../../img/infor/12.1.png')
    $('.tableButton').attr('src','../../img/infor/11.2.png')
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
    $(".floattool").show();
});
$('.tableButton').click(function(){
    $('.mapButton').attr('src','../../img/infor/11.2.png')
    $(this).attr('src','../../img/infor/12.1.png')
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $(".floattool").hide();
    $(".main_table").hide();
    $(".main_graphic").hide();
    $(".time-axis-box").hide();
});
$('.xc_one').click(function () {
	$('.xc_one img').attr('src','../../img/trdcsj.png')
	$('.xc_two img').attr('src','../../img/trsjxqB.png')
})
$('.xc_two').click(function () {
    $('.xc_one img').attr('src','../../img/trdcsjB.png')
    $('.xc_two img').attr('src','../../img/trsjxq.png')
})
// 统一下拉框选中
$('ul.dropdown-menu li a').click(function(){
    $(this).parent().parent().siblings().text($(this).text());
})

/********************变量***************/
var map;
var isHaveData={//是否有统计图、统计表、时间轴数据
		tongjibiao:1,
		tongjitu:0,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=1;
//条件查询参数
var searchParams = {//清单模式查询条件
		province:"",
		city:"",
		county:"",
		industry:"",
		keyword:""
}

//默认显示的行业类别
var qiYeIndustryArr=[{id:"有色金属矿采选业,有色金属采选业",name:"有色金属矿采选"},{id:"有色金属冶炼,有色金属冶炼和压延加工业",name:"有色金属冶炼"},{id:"none_1",name:"石油开采"},
                     {id:"石油加工,石油加工业",name:"石油加工"},{id:"化工,化工原料和化工制品制造业",name:"化工"},{id:"石油加工、炼焦及核燃料加工业",name:"焦化"},{id:"none_2",name:"电镀"},{id:"皮革、毛皮、羽毛及其制品和制鞋业,皮革、毛皮、羽毛(绒)及其制品业,皮革、毛皮、羽毛（绒）及其制品业,皮革、毛皮、羽毛及其制品和制造业",name:"制革"}];
var allQiYeIndustryArr=[{id:"有色金属矿采选业,有色金属采选业",name:"有色金属矿采选"},{id:"有色金属冶炼,有色金属冶炼和压延加工业",name:"有色金属冶炼"},{id:"none_1",name:"石油开采"},
                        {id:"石油加工,石油加工业",name:"石油加工"},{id:"化工,化工原料和化工制品制造业",name:"化工"},{id:"石油加工、炼焦及核燃料加工业",name:"焦化"},{id:"none_2",name:"电镀"},{id:"皮革、毛皮、羽毛及其制品和制鞋业,皮革、毛皮、羽毛(绒)及其制品业,皮革、毛皮、羽毛（绒）及其制品业,皮革、毛皮、羽毛及其制品和制造业",name:"制革"},
						{id:"医药,医药制造,医药制造业",name:"医药制造"},{id:"none_3",name:"铅酸蓄电池制造"},{id:"none_4",name:"废旧电子拆解"},
						{id:"危险废物处理处置",name:"危险废物处理处置"},{id:"none_5",name:"危险化学品生产、存储、使用"}];

var qiYeIndustryArr2=[{id:"有色金属矿采选,有色金属矿采选业",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                     {id:"石油加工,石油加工及石油制品制造,石油加工及石油制品制造,精炼石油产品制造",name:"石油加工"},{id:"化工,有机化工",name:"化工"},{id:"焦化,钢铁、焦化,炼焦行业,炼焦,炼焦业",name:"焦化"},{id:"电镀,电镀行业",name:"电镀"},{id:"制革",name:"制革"}];
var allQiYeIndustryArr2=[{id:"有色金属矿采选,有色金属矿采选业 ",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                         {id:"石油加工,石油加工及石油制品制造,石油加工及石油制品制造,精炼石油产品制造",name:"石油加工"},{id:"化工,有机化工",name:"化工"},{id:"焦化,钢铁、焦化,炼焦行业,炼焦,炼焦业",name:"焦化"},{id:"电镀,电镀行业",name:"电镀"},{id:"制革",name:"制革"},
						{id:"none_1",name:"医药制造"},{id:"蓄电池制造",name:"铅酸蓄电池制造"},{id:"废旧电器电子拆解",name:"废旧电子拆解"},
						{id:"危险废物治理,危险废物处理",name:"危险废物处理处置"},{id:"none_2",name:"危险化学品生产、存储、使用"}];
//图片名称对应数组
//var pictureArr={};
var graphicsLayer = null;
var xiangmuType = "1";//项目类型 1：遥感核查 2：地方自报
var mapType = "1";//地图：1：全国模式 2：某一省的所有市模式 3：某一个市的所有点位模式

var graphicsLayer = null;
var provinceClick = null;//省界高亮
var provinceExtent = null;//省界边界
var provinceCode = null;//省code
var cityClick = null;//县界高亮
var cityExtent = null;//县界边界
var cityCode = null;//县code
var mapIndustry = "";//地图模式的行业类别

//图例
var countryMinCount = null;
var countryCount = null;
var provinceMinCount = null;
var provinceCount = null;


$(function(){
	//加载动画开始
	zmblockUI('#map', 'start');
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent","esri/dijit/InfoWindowLite",
	         "extras/DEBubblePopup",
	         "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,InfoWindowLite,
			DEBubblePopup,
			QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
			WMTSLayer,WMTSLayerInfo,TileInfo,domConstruct
	){
		 extent = new Extent(extentPar);
		var infoWindow = new  DEBubblePopup();
		
		//初始化地图
		map = new Map("map",{
			basemap: "delorme",//指明底图
			logo:false,
			minZoom:2,
//			center:[108,34],
//			zoom:3,
			extent:extent,
			showLabels:true,
			infoWindow:infoWindow
		}) 
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
//        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
//		addGewang();
		
		//判断用户是否是省级用户
		var storage = window.sessionStorage;
		//管理员、国家级用户
		if(storage.getItem("userLevel")==null || storage.getItem("userLevel")=="0" || storage.getItem("userLevel")=="1"){
			//更新全国模式
			updateProvinceLayer();
		}else if(storage.getItem("userLevel")=="2"){//省级用户
			//当前省的行政区划
			provinceCode = storage.getItem("regionCode");
			//定位到当前省
			var queryTask = new QueryTask("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0");
			var query = new Query();
			query.returnGeometry = true;
			query.outFields = ["*"];
			query.outSpatialReference = map.spatialReference;
			query.where = "PROV_CODE = "+provinceCode;
			queryTask.execute(query,showResults);

			function showResults(result){
				//判断查询是否有结果
				if(result.features.length>0){
			    	 var graphic = result.features[0];
			    	 //当前省的边界
			    	 provinceExtent = graphic.geometry.getExtent();
			    	 map.setExtent(provinceExtent);
			    	 //当前省的高亮
			    	 var lineJson = {
							 "paths":graphic.geometry.rings,
							 "spatialReference":{"wkid":4326}
					 }
					 var highPolyline = new Polyline(lineJson);
					 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
					 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClickHigh"});
					 //记录边界高亮
					 provinceHighGraphic = highGraphic;
					 map.graphics.add(highGraphic);
					 //记录当前省名
					 provinceSName = graphic.attributes.NAME;
					 //改变右上角按钮Text
					 $("#province").html(graphic.attributes.NAME);
					 //显示右上角按钮
					 $("#province").removeClass("none");
					 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
					 $("#city").addClass("none");
				}
				//更新当前省的分市图层
				updateCountyLayer();
		    }
			
		}
		
		//更新地图
//		updateProvinceLayer();
		//更新表格
		updateChaoBiaoLvTable();
		
//		getTuDiLiYongLeiXing1();
	});//--require end
	
	//项目类型选择事件。土壤调查数据、土壤详查数据
	$(".xiangmuType").click(function(){
		//选中样式切换
		$(this).addClass('map-table-color').siblings().removeClass('map-table-color');
		//记录当前是项目类型
		xiangmuType = $(this).attr("value");
		
		//切换清单模式数据
		searchParams = {//清单模式查询条件
				province:"",
				city:"",
				county:"",
				industry:"",
				keyword:""
		}
		$(".province").val('');
		$(".city").val('');
		$(".county").val('');
		$(".industry").val('');
		$(".keyword input").val('');
		if(xiangmuType=="2"){
			updateTable1();
		}else if(xiangmuType=="1"){//土壤调查、超标率
			updateChaoBiaoLvTable();
		}
		
		/********yaoganhecha.js、difangzibao.js********/
		//超标率恢复默认状态
		//销毁统计图
		destroyEcharts();
		//分省底图
		if(map.getLayer("countryFeatureLayer")!=null){
			map.removeLayer(map.getLayer("countryFeatureLayer"));
		}
		//分省数字
		if(map.getLayer("countryGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("countryGraphicsLayer"));
		}
		//分市底图
		if(map.getLayer("countyFeatureLayer")!=null){
			map.removeLayer(map.getLayer("countyFeatureLayer"));
		}
		
		//分市数字
		if(map.getLayer("countyGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("countyGraphicsLayer"));
		}
		eObjProvince = [];//分省echarts对象数组
		iObjProvince = [];//分省窗口对象数组

		provinceCode = "";
		provinceSName = "";
		provinceExtent = "";
		provinceHighGraphic = null;

		industryPar = "2";//2:有机物 1：无机物
		wuranType="totalCount";//选中的污染类型
		quyuType="0"//0全国 1某个省
		//超标率恢复默认状态--end
		//土壤调查数据恢复默认状态
		map.infoWindow.remove();
		//分市底图
		if(map.getLayer("xiangchaLayer")!=null){
			map.removeLayer(map.getLayer("xiangchaLayer"));
		}
		//土壤调查数据恢复默认状态--end
		
		//图例
		countryMinCount = null;
		countryCount = null;
		provinceMinCount = null;
		provinceCount = null;
		
		//隐藏右上角按钮
		$("#province").addClass("none");
		$("#city").addClass("none");
		//更新地图
		if(xiangmuType=="2"){//土壤调查数据
			//隐藏图例、污染类型按钮、全国按钮、行业类别
			$("#mylegend").hide();
			$("#xiangmuDiv").hide();
			$("#quyuDiv").hide();
			$(".map-item").hide();
			//统计表是否显示
			isSelect=0;
			updateMap1(true);
		}else if(xiangmuType=="1"){//土壤详查数据
			//显示图例、污染类型按钮、全国按钮、行业类别
//			$("#mylegend").show();
//			$("#xiangmuDiv").show();
			$("#quyuDiv").show();
			$(".map-item").show();
			//统计表是否显示
			isSelect=1;
			updateProvinceLayer();
			
		}
		createModal();
	})
	
})


//回显地图模式的行业类型数据
function huiXianMapIndustry(){
	$.each($(".map-item li"),function(i,obj){
		$(obj).removeClass("metal");
	});
	$(".map-item li[value='"+searchParams.industry+"']").addClass("metal");
}

/*************悬浮窗******************/
$(function(){
	/**********右上角按钮****/
	
	
	//条件查询点击事件
	$(".keyword button").click(function(){
		//收集查询条件
		searchParams.province = $(".province").val();
		searchParams.city = $(".city").val();
		searchParams.county = $(".county").val();
		searchParams.industry = $(".industry").val();
		if(xiangmuType=="1"){//土壤调查 超标率
//			updateMap();
			updateChaoBiaoLvTable();
		}else if(xiangmuType=="2"){
//			updateMap2();
//			updateTable2();
		}
		//回显地图模式的行业类型数据
//		huiXianMapIndustry();
	})
	
	/*******************行业分类定制***************/
	
	
	
	/*************省市联动****************/
	//省市联动
	//加载省
	var json = {regionCode:"0"};
	ajaxPost("/seimp/pic/getRegion.do", json).done(function(result){
		if(result.status==0&&result.data.length>0){
				var html = "";
				html += "<option value=''>请选择省、自治区</option>";
				for (var i = 0; i < result.data.length; i++) {
					var province = result.data[i];
					html += "<option value='"+province.code+"'>"+province.name+"</option>";
				}
				$(".province").html(html);
				//点击省，获取当前省下的所有市
				$('.province').change(function(){
				    var value = $(".province").val();
				    if(value==""){//不选择任何省
				    	$(".city").html("<option value=''>请选择市、自治州</option>");
				    	$(".county").html("<option value=''>请选择区、县</option>");
				    	//搜索条件
				    	searchParams.province="";
				    	searchParams.city="";
				    	searchParams.county="";
				    	return;
				    }
				    //搜索条件
				    searchParams.province=value;
				    searchParams.city="";
			    	searchParams.county="";
					var json = {regionCode:value};
					ajaxPost("/seimp/pic/getRegion.do", json).done(function(result){
						if(result.status==0&&result.data.length>0){
							var html = "";
							html += "<option value=''>请选择市、自治州</option>";
							for (var i = 0; i < result.data.length; i++) {
								var city = result.data[i];
								html += "<option value='"+city.code+"'>"+city.name+"</option>";
							}
							$(".city").html(html);
							
							//点击市，获取市下的所有县
							$('.city').change(function(){
								var value = $(".city").val();
							    if(value==""){//不选择任何市
							    	$(".county").html("<option value=''>请选择区、县</option>");
							    	//搜索条件
							    	searchParams.city="";
							    	searchParams.county="";
							    	return;
							    }
							    //搜索条件
						    	searchParams.city=value;
						    	searchParams.county="";
								var json = {regionCode:value};
								ajaxPost("/seimp/pic/getRegion.do", json).done(function(result){
									if(result.status==0&&result.data.length>0){
										var html = "";
										html += "<option value=''>请选择区、县</option>";
										for (var i = 0; i < result.data.length; i++) {
											var city = result.data[i];
											html += "<option value='"+city.code+"'>"+city.name+"</option>";
										}
										$(".county").html(html);
										//点击县
										$('.county').change(function(){
											var value = $(".county").val();
											 //搜索条件
											 searchParams.county=value;
										});
									}
							    })// county ajax end
							});// city click end
						}
				    });// city ajax end 
				});//-- province click end
			}
	})//-- province ajax end
	
	/*****悬浮窗**/
	$(".floattool .icon").mouseover(function(evt){
		$(".float-tool-title").show();
		//alert($(this).index());
		var classval = $(this).parent().attr("class");
		if(classval=="layer_nav"){
			$(".float-tool-title .title").html("地图");
			$(".float-tool-title").css("top","290px");
			$(".float-tool-title").css("left","92%");
		}else if(classval=="table_nav"){
			$(".float-tool-title .title").html("统计表");
			$(".float-tool-title").css("top","328px");
			$(".float-tool-title").css("left","92%");
		}else if(classval=="graphic_nav"){
			$(".float-tool-title .title").html("统计图");
			$(".float-tool-title").css("top","365px");
			$(".float-tool-title").css("left","92%");
		}else if(classval=="time_nav"){
			$(".float-tool-title .title").html("时间轴");
			$(".float-tool-title").css("top","405px");
			$(".float-tool-title").css("left","92%");
		}
	})
	$(".floattool .icon").mouseout(function(){
		$(".float-tool-title").hide();
	})
	$(".floattool .icon").click(function(evt){
		//alert($(this).index());
		var classval = $(this).parent().attr("class");
		if(classval=="layer_nav"){
			if($(this).parent().find("div.common-panel").is(":visible")){
				$(this).parent().find("div.common-panel").hide();
			}else{
				$(this).parent().find("div.common-panel").show();
			}
		}else if(classval=="table_nav"){
			if($("#tongjituDiv").is(":visible")){
				$("#tongjituDiv").hide();
			}else{
				if(isHaveData.tongjibiao==1){
					if(isSelect==1){
						$("#tongjituDiv").show();
					}else{
						showTiShi("请选择数据");
					}
				}else{
					showTiShi("没有数据");
				}
			}
		}else if(classval=="graphic_nav"){
			if($(".main_graphic").is(":visible")){
				$(".main_graphic").hide();
			}else{
				if(isHaveData.tongjitu==1){
					 if(isSelect==1){
						 $(".main_graphic").show();
					 }else{
						 showTiShi("请选择数据");
					 }
				}else{
					showTiShi("没有数据");
				}
				
				//加载统计图
				//initEcarts();
			}
		}else if(classval=="time_nav"){
			if($(".time-axis-box").is(":visible")){
				$(".time-axis-box").hide();
			}else{
				if(isHaveData.shijianzhou==1){
					if(isSelect==1){
						$(".time-axis-box").show();
					}else{
						showTiShi("请选择数据");
					}
				}else{
					showTiShi("没有数据");
				}
			}
		}
	})
	//关闭悬浮窗
	$(".layer_nav .common-panel>a").click(function(){
		$(this).parent().hide();
	})
	//切换地图底图
	$(".layer-items a").click(function(){
		var mapName = $.trim($(this).text());
		//设置选中状态
		if(mapName=="影像"||mapName=="地图"){
			$(this).siblings(":eq(2),:eq(3)").removeClass("active");
			$(this).addClass("active");
		}else{
			if($(this).hasClass("active")){
				$(this).removeClass("active");
			}else{
				$(this).addClass("active");
			}
		}
		
		if(mapName=="影像"){
			$("#div_4").show();
			if(map.getLayer("vectorLayer")){
				map.removeLayer(map.getLayer("vectorLayer"));
				map.removeLayer(map.getLayer("vectorNoteLayer"));
				
				//判断中文注记的状态
				if($(this).siblings(":eq(1)").hasClass("active")){
					imageMap(map,true);
				}else{
					imageMap(map,false);
				}
			}
		}else if(mapName=="地图"){
			$("#div_4").hide();
			if(map.getLayer("imageLayer")){
				map.removeLayer(map.getLayer("imageLayer"));
				map.removeLayer(map.getLayer("imageNoteLayer"));
				
				//判断中文注记的状态
				if($(this).siblings(":eq(1)").hasClass("active")){
					vectorMap(map,true);
				}else{
					vectorMap(map,false);
				}
			}
		}else if(mapName=="公里格网"){
			if(map.getLayer("gewangLayer")){
				map.removeLayer(map.getLayer("gewangLayer"));
				$("#div_3").hide();
			}else{
				addGewang();
				$("#div_3").show();
			}
		}else if(mapName=="中文注记"){
			//判断是矢量地图还是影像地图
			//判断矢量地图是否存在
			if(map.getLayer("vectorLayer")){
				//矢量地图
				//判断中文注记的状态
				if(map.getLayer("vectorNoteLayer").visible){
					map.getLayer("vectorNoteLayer").setVisibility(false);
					$("#div_8").hide();
				}else{
					map.getLayer("vectorNoteLayer").setVisibility(true);
					$("#div_8").show();
				}
			}else{
				//影像地图
				if(map.getLayer("imageNoteLayer").visible){
					map.getLayer("imageNoteLayer").setVisibility(false);
				}else{
					map.getLayer("imageNoteLayer").setVisibility(true);
				}
			}
		}else if(mapName=="道路"){
			if(map.getLayer("gaosuLayer")){
				$("#div_5").hide();
				map.removeLayer(map.getLayer("gaosuLayer"));
				map.removeLayer(map.getLayer("shengdaoLayer"));
			}else{
				addRoad();
				$("#div_5").show();
			}
		}else if(mapName=="加油站点"){
			if(map.getLayer("gasLayer")){
				map.removeLayer(map.getLayer("gasLayer"));
				$("#div_7").hide();
			}else{
				addGas();
				$("#div_7").show();
			}
		}else if(mapName=="河流"){
			if(map.getLayer("riverLayer")){
				map.removeLayer(map.getLayer("riverLayer"));
				$("#div_6").hide();
			}else{
				addRiver();
				$("#div_6").show();
			}
		}
	})
	//关闭统计表
	$("#tongjituDiv  div.tabtop_rt").click(function(){
		$("#tongjituDiv").hide();
	})
	
	//关闭弹出的污染物表格
	$("#detailTable  div.tabtop_rt").click(function(){
		$("#detailTable").hide();
	})
	//关闭统计图
	$(".main_graphic div.tabtop_rt").click(function(){
		$(".main_graphic").hide();
	})
})




/**********行业定制********/

//生成行业定制弹出框中的内容
function createModal(){
	//生成下方的列表
//	createInsutryClick();
	
	if(xiangmuType=="1"){
		//生成行业定制框中的内容
		var html = "";//模态框中行业类型
		var lihtml = "";
		lihtml += "<option value=''>请选择行业类型</option>";
		for (var i = 0; i < allQiYeIndustryArr.length; i++) {
			var currItem = allQiYeIndustryArr[i];
			if(i%3==0){
				if(i==0){
					html+="<div class='row' style='margin-bottom:10px;'>";
				}else{
					html+="</div><div class='row' style='margin-bottom:10px;'>";
				}
				
			}
			html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem.id+"'  name='industry' industry='"+currItem.name+"'>"+currItem.name+"</label></div>";
			if(i==allQiYeIndustryArr.length-1){
				html+="</div>";
			}
			lihtml += "<option value='"+currItem.id+"'>"+currItem.name+"</option>";
		}
		$(".modal-body").html(html);
		$(".industry").html(lihtml);
		
	}else if(xiangmuType=="2"){
		//生成行业定制框中的内容
		var html = "";//模态框中行业类型
		var lihtml = "";
		lihtml += "<option value=''>请选择行业类型</option>";
		for (var i = 0; i < allQiYeIndustryArr2.length; i++) {
			var currItem = allQiYeIndustryArr2[i];
			if(i%3==0){
				if(i==0){
					html+="<div class='row' style='margin-bottom:10px;'>";
				}else{
					html+="</div><div class='row' style='margin-bottom:10px;'>";
				}
				
			}
			html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem.id+"'  name='industry' industry='"+currItem.name+"'>"+currItem.name+"</label></div>";
			if(i==allQiYeIndustryArr2.length-1){
				html+="</div>";
			}
			lihtml += "<option value='"+currItem.id+"'>"+currItem.name+"</li>";
		}
		$(".modal-body").html(html);
		$(".industry").html(lihtml);
	}
	
}


//行业定制弹出框显示
function qiYeCheckBoxShow(){
	if(xiangmuType=="1"){
		//回显选中数据
		if(qiYeIndustryArr.length>0){
			//弹出框回显
			$("#myModal input:checkbox").prop("checked",false);
			for (var i = 0; i < qiYeIndustryArr.length; i++) {
				var currObj = qiYeIndustryArr[i];
				$("#myModal input:checkbox[value='"+currObj.id+"']").prop("checked",true);
			}
		}
		//弹出框
		$("#myModal").modal();
	}else if(xiangmuType=="2"){
		//回显选中数据
		if(qiYeIndustryArr2.length>0){
			//弹出框回显
			$("#myModal input:checkbox").prop("checked",false);
			for (var i = 0; i < qiYeIndustryArr2.length; i++) {
				var currObj = qiYeIndustryArr2[i];
				$("#myModal input:checkbox[value='"+currObj.id+"']").prop("checked",true);
			}
		}
		//弹出框
		$("#myModal").modal();
	}
	
}

//行业定制弹出框确定按钮收集数据，并重新生成行业选择
function shouJiShuJu(){
	if($("#myModal input:checkbox:checked").length>8){
		toastr.warning("行业定制数量不能超过8个");
		return;
	}
	if(xiangmuType=="1"){
		qiYeIndustryArr = [];
		//弹出框收集选中
		$.each($("#myModal input:checkbox:checked"),function(index,obj){
			var liSelectedData = {
					name:$(obj).attr("industry"),
					id:$(obj).val()
			}
			qiYeIndustryArr.push(liSelectedData);
		})
		
		createInsutryClick();
		$("#myModal").modal('hide');
	}else if(xiangmuType=="2"){
		qiYeIndustryArr = [];
		//弹出框收集选中
		$.each($("#myModal input:checkbox:checked"),function(index,obj){
			var liSelectedData = {
					name:$(obj).attr("industry"),
					id:$(obj).val()
			}
			qiYeIndustryArr2.push(liSelectedData);
		})
		
		createInsutryClick();
		$("#myModal").modal('hide');
	}
	
}

//生成地图下方的行业筛选列表
/*function createInsutryClick(){
	if(xiangmuType=="1"){
		//重新更新下方的企业类别选择条
		var html ="<li class='lt metal' value='' onclick=switchIndustry('',$(this))>全部</li>";
		if(qiYeIndustryArr.length>0){
			for (var i = 0; i < qiYeIndustryArr.length; i++) {
				var currObj = qiYeIndustryArr[i];
				html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
			}
		}
		html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
		$("#mapItem").html(html);
		$(".map-item").css("margin-left","-"+$(".map-item").width()/2+"px");
	}else if(xiangmuType=="2"){
		//重新更新下方的企业类别选择条
		var html ="<li class='lt metal' value='' onclick=switchIndustry('',$(this))>全部</li>";
		if(qiYeIndustryArr.length>0){
			for (var i = 0; i < qiYeIndustryArr2.length; i++) {
				var currObj = qiYeIndustryArr2[i];
				html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
			}
		}
		html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
		$("#mapItem").html(html);
		$(".map-item").css("margin-left","-"+$(".map-item").width()/2+"px");
	}
	
}*/

//行业选择
/*function switchIndustry(switchIndustry,obj){
	//记录选择的行业
//	searchParams.industry=switchIndustry;
	//记录地图所选行业类别
	mapIndustry = switchIndustry;
	
	$(obj).siblings().removeClass("metal");
	$(obj).addClass("metal");
	//将选择的行业参数回显到清单模式
//	$(".industry").val(searchParams.industry);
	if(xiangmuType=="1"){//遥感核查
		//更新地图
		updateMap1();
		//更新表格
//		updateTable1();
	}else if(xiangmuType=="2"){//地方自报
		if(mapType=="1"){//全国模式
			updateCountry_2(true);
		}else if(mapType=="2"){//某一个省的所有市模式
			updateProvince_2(true);
		}else if(mapType=="3"){//某一个市的所有点位模式
			updateCity_2(true);
		}
//		updateMap2();
		updateTable2();
	}
	
}*/

/************地图相关方法****************/
//生成图例
function updateLegend(minCount,count){
	$("#ditu li:eq(0) div:eq(1)").html(minCount+"-"+parseInt(minCount+count*1));
	$("#ditu li:eq(1) div:eq(1)").html(parseInt(minCount+count*1)+"-"+parseInt(minCount+count*2));
	$("#ditu li:eq(2) div:eq(1)").html(parseInt(minCount+count*2)+"-"+parseInt(minCount+count*3));
	$("#ditu li:eq(3) div:eq(1)").html(parseInt(minCount+count*3)+"-"+parseInt(minCount+count*4));
	$("#ditu li:eq(4) div:eq(1)").html(parseInt(minCount+count*4)+"-"+parseInt(minCount+count*5));
	$("#ditu li:eq(5) div:eq(1)").html(parseInt(minCount+count*5)+"-"+parseInt(minCount+count*6));
	
}

//清除type属性值为value的graphic
 

/***********页面控制相关方法****************/
//弹出框中按钮，显示悬浮表格
function showMapTable(){
	$(".table_nav .icon").click();
}

//两秒钟后清除提示
function qingChuTiShi(){
	setTimeout(function(){
		$(".noDataTips").hide();
	},"2000")
}

//显示提示
function showTiShi(info){
	$(".noDataTips .tabtop_left").text(info);
	$(".noDataTips").show();
	qingChuTiShi();
}

$(document).ready(function(){
	
		var $div = $("#tongji_title");
	    /* 绑定鼠标左键按住事件 */
	    $div.bind("mousedown",function(event){
	    if($('.large').attr('data') == 1){
	      /* 获取需要拖动节点的坐标 */
	      var offset_x = $(this)[0].offsetLeft;//x坐标
	      var offset_y = $(this)[0].offsetTop;//y坐标
	      /* 获取当前鼠标的坐标 */
	      var mouse_x = event.pageX;
	      var mouse_y = event.pageY;
	      /* 绑定拖动事件 */
	      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
	      $(document).bind("mousemove",function(ev){
	        /* 计算鼠标移动了的位置 */
	        var _x = ev.pageX - mouse_x;
	        var _y = ev.pageY - mouse_y;
	        /* 设置移动后的元素坐标 */
	        var now_x = (offset_x + _x ) + "px";
	        var now_y = (offset_y + _y ) + "px";
	        var pow_y = (offset_y + _y - 50) + "px";
	        /* 改变目标元素的位置 */
	        if(offset_x + _x < 0){
	        	console.log(now_y)
	        	now_y = 0
	        }
	        $div.css({
	          top:now_y,
	          left:now_x
	        });
	        $('div#tongjituDiv').css({
	        	top:now_y,
	            left:now_x
	          });
	      });
	    }else{
			return;
		}
	    });
	    /* 当鼠标左键松开，接触事件绑定 */
	    $(document).bind("mouseup",function(){
	    	var top = $("div#tongjituDiv").css('top').split('px')
	    	var left = $("div#tongjituDiv").css('left').split('px')
	    	var top1 = $("#tongji_title").css('top').split('px')
	    	var left1 = $("#tongji_title").css('left').split('px')
	    	if(top[0] < 0){
	    		$("div#tongjituDiv").css('top','50px')
	    	}
	    	if(left[0] < 0){
	    		$("div#tongjituDiv").css('left','0')
	    	}
	    	if(top1[0] < 0){
	    		$("#tongji_title").css('top','50px')
	    	}
	    	if(left1[0] < 0){
	    		$("#tongji_title").css('left','0')
	    	}
	      $(this).unbind("mousemove");
	    });
	
    
    
    
    var $div1 = $("div.main_graphic");
    /* 绑定鼠标左键按住事件 */
    $div1.bind("mousedown",function(event){
      /* 获取需要拖动节点的坐标 */
      var offset_x = $(this)[0].offsetLeft;//x坐标
      var offset_y = $(this)[0].offsetTop;//y坐标
      /* 获取当前鼠标的坐标 */
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      /* 绑定拖动事件 */
      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
      $(document).bind("mousemove",function(ev){
        /* 计算鼠标移动了的位置 */
        var _x = ev.pageX - mouse_x;
        var _y = ev.pageY - mouse_y;
        /* 设置移动后的元素坐标 */
        var now_x = (offset_x + _x ) + "px";
        var now_y = (offset_y + _y ) + "px";
        /* 改变目标元素的位置 */
        $div1.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
    
    var $div2 = $("div#geWangTable");
    /* 绑定鼠标左键按住事件 */
    $div2.bind("mousedown",function(event){
      /* 获取需要拖动节点的坐标 */
      var offset_x = $(this)[0].offsetLeft;//x坐标
      var offset_y = $(this)[0].offsetTop;//y坐标
      /* 获取当前鼠标的坐标 */
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      /* 绑定拖动事件 */
      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
      $(document).bind("mousemove",function(ev){
        /* 计算鼠标移动了的位置 */
        var _x = ev.pageX - mouse_x;
        var _y = ev.pageY - mouse_y;
        /* 设置移动后的元素坐标 */
        var now_x = (offset_x + _x +350) + "px";
        var now_y = (offset_y + _y +200) + "px";
        /* 改变目标元素的位置 */
        $div2.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
    
    var $div3 = $("div#detailTable");
    /* 绑定鼠标左键按住事件 */
    $div3.bind("mousedown",function(event){
      /* 获取需要拖动节点的坐标 */
      var offset_x = $(this)[0].offsetLeft;//x坐标
      var offset_y = $(this)[0].offsetTop;//y坐标
      /* 获取当前鼠标的坐标 */
      var mouse_x = event.pageX;
      var mouse_y = event.pageY;
      /* 绑定拖动事件 */
      /* 由于拖动时，可能鼠标会移出元素，所以应该使用全局（document）元素 */
      $(document).bind("mousemove",function(ev){
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
        $div3.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
})
$('.large').click(function(){
	if($(this).attr('data') == 1){
		$('#tongjituDiv ').css({
			top:'50px',
			right:0,
			left:0,
			width:'100%',
			height:'92%',
		})
		$("#tongji_title").css({
			top:'50px',
			right:0,
			left:0,
			width:'100%'
		})
		$(this).css('background-image','url("../../img/min_big.png")')
		$('.ps-container').css('width','100%')
		$('.ps-container').css('height','100%')
		$(this).attr('data','2')
	}else{
		$(this).attr('data','1')
		$('#tongjituDiv').css({
			top:'116px',
			right:'79px',
			left:'auto',
			width:'600px',
			height:'467px',
		})
		$("#tongji_title").css({
			top:'116px',
			right:'79px',
			left:'auto',
			width:'600px',
		})
		$(this).css('background-image','url("../../img/max_big.png")')
		
		$('.ps-container').css('width','590px')
	}
	
})


/********************************************************************************************************/
