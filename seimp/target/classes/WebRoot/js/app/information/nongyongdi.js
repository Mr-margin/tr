// 地图切换选项卡
$('.map-area').click(function(){
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
    $(".time-axis-box").hide();
    
})
$('.mapButton').click(function(){
    $(this).attr('src','../../img/oneMapButtonClick1.png')
    $('.tableButton').attr('src','../../img/oneMapButton2.png')
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
    $(".floattool").show();
});
$('.tableButton').click(function(){
    $('.mapButton').attr('src','../../img/oneMapButton1.png')
    $(this).attr('src','../../img/oneMapButtonClick2.png')
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $(".floattool").hide();
    $(".main_table").hide();
    $(".main_graphic").hide();
    $(".time-axis-box").hide();
});
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
},isSelect=0;

$(function(){
	//加载动画开始
	zmblockUI('#map', 'start');
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/ArcGISDynamicMapServiceLayer","esri/InfoTemplate",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "extras/DEBubblePopup",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			ArcGISDynamicMapServiceLayer,InfoTemplate,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			DEBubblePopup,
			InfoWindowLite,domConstruct
	){
		var infoWindow = new  DEBubblePopup();
		//初始化地图
		map = new Map("map",{
			logo:false,
			minZoom:2,
			center:[108,34],
			zoom:4,
			infoWindow:infoWindow
		}) 

		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
//		addGewang();
		
		var infoTemplate = new InfoTemplate();
		infoTemplate.setTitle("土地利用");
		infoTemplate.setContent(getContent);
		function getContent(graphic){
			var attributes = graphic.attributes;
			var html = "";
			for(var name in attributes){
				html += "<p>"+name+"：<code>"+attributes[name]+"</code></p>";
			}
			return html;
		}
		
		var infoTemplates = {
			0: {
				infoTemplate: infoTemplate,
				layerUrl: null
			}
		};
		
		dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/landuse/MapServer", {
			showAttribution:true,
			infoTemplates: infoTemplates,
			"opacity":1
		});
		
		dynamicMapServiceLayer.on("load",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
		})

		map.addLayer(dynamicMapServiceLayer);
	});//--require end
})

/*************悬浮窗******************/
$(function(){
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
			if($(".main_table").is(":visible")){
				$(".main_table").hide();
			}else{
				if(isHaveData.tongjibiao==1){
					if(isSelect==1){
						$(".main_table").show();
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
			}else{
				addGewang();
			}
		}else if(mapName=="中文注记"){
			//判断是矢量地图还是影像地图
			//判断矢量地图是否存在
			if(map.getLayer("vectorLayer")){
				//矢量地图
				//判断中文注记的状态
				if(map.getLayer("vectorNoteLayer").visible){
					map.getLayer("vectorNoteLayer").setVisibility(false);
				}else{
					map.getLayer("vectorNoteLayer").setVisibility(true);
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
				map.removeLayer(map.getLayer("gaosuLayer"));
				map.removeLayer(map.getLayer("shengdaoLayer"));
			}else{
				addRoad();
			}
		}else if(mapName=="加油站点"){
			if(map.getLayer("gasLayer")){
				map.removeLayer(map.getLayer("gasLayer"));
			}else{
				addGas();
			}
		}else if(mapName=="河流"){
			if(map.getLayer("riverLayer")){
				map.removeLayer(map.getLayer("riverLayer"));
			}else{
				addRiver();
			}
		}
	})
	//关闭统计表
	$(".main_table div.tabtop_rt").click(function(){
		$(".main_table").hide();
	})
	//关闭统计图
	$(".main_graphic div.tabtop_rt").click(function(){
		$(".main_graphic").hide();
	})
	
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
})


/***********页面控制相关方法****************/
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

