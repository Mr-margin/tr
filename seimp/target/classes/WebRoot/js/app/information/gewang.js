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
		tongjibiao:0,
		tongjitu:0,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=0;
//条件查询参数
var searchParams = {//清单模式查询条件
		province:"",
		city:"",
		county:"",
		industry:"",
		keyword:""
}

//默认显示的行业类别
var qiYeIndustryArr=[{id:"S0",name:"疑似地块"},{id:"S1",name:"初步调查"},{id:"S2",name:"详细调查"},
                     {id:"S3",name:"风险评估"},{id:"S4",name:"风险评估"},{id:"S5",name:"土壤修复与治理"},{id:"S6",name:"土壤修复与治理评估"}];
/*var allQiYeIndustryArr=[{id:"有色金属矿采选",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                        {id:"石油加工",name:"石油加工"},{id:"化工",name:"化工"},{id:"焦化",name:"焦化"},{id:"电镀",name:"电镀"},{id:"制革",name:"制革"},
						{id:"医药制造",name:"医药制造"},{id:"铅酸蓄电池制造",name:"铅酸蓄电池制造"},{id:"废旧电子拆解",name:"废旧电子拆解"},
						{id:"危险废物处理处置",name:"危险废物处理处置"},{id:"危险化学品生产、存储、使用",name:"危险化学品生产、存储、使用"}];*/
var graphicsLayer = null;
var provinceClick = null;//省界高亮
var provinceExtent = null;//省界边界
var provinceCode = null;//省code
var cityClick = null;//县界高亮
var cityExtent = null;//县界边界
var cityCode = null;//县code
var mapIndustry = "";//地图上的行业类别
//图例
var countryMinCount = null;
var countryCount = null;
var provinceMinCount = null;
var provinceCount = null;

var mapType = "1";//地图：1：全国模式 2：某一省的所有市模式 3：某一个市的所有点位模式


$(function(){
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent","esri/layers/ArcGISDynamicMapServiceLayer",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "extras/DEBubblePopup","esri/layers/GraphicsLayer",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,ArcGISDynamicMapServiceLayer,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			DEBubblePopup,GraphicsLayer,
			InfoWindowLite,domConstruct
	){
		var extent = new Extent(extentPar);
		var infoWindow = new  DEBubblePopup();
		
		//初始化地图
		map = new Map("map",{
			logo:false,
			minZoom:2,
//			center:[108,34],
//			zoom:3,
			extent:extent,
			showLabels:true,
			infoWindow:infoWindow,
			wrapAround180:true
		});
		
		
		
		var infoWindowLite = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
		infoWindowLite.startup();
//        map.setInfoWindow(infoWindowLite);
        
        /*infoWindowLite.on("hide",function(evt){
        	removeGraphic("gewangClick");
        })*/
        
//        map.infor
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
		//增加个graphics图层，放高亮graphic
		var graphicsLayer = new GraphicsLayer({id:"highLightLayer"});
		map.addLayer(graphicsLayer);
		
		addGewang();
		//更新地图
//		updateMap();
		//更新表格
		
		//更新全国模式
		

		var hemiduLayer = new ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/glgwhmd/MapServer",{
			id:"hemiduLayer"
		});
		console.log(hemiduLayer)
		map.addLayer(hemiduLayer);
			
	});//--require end
})

//更新表格
function updateTable(){
	var columns =[{
	        field : 'WRDKBM',
	        title : '污染地块编码',
	        align : 'center'
		},{
	        field : 'provinceName',
	        title : '省份',
	        align : 'center'
		},{
	        field : 'cityName',
	        title : '市',
	        align : 'center'
		},{
	        field : 'countyName',
	        title : '县',
	        align : 'center'
		},{
			field : 'BZ',
			title : '备注',
			align : 'center',
		},{
			field : 'HYLB',
			title : '行业类别',
			align : 'center',
		},{
			field : 'WRDK_AREA',
			title : '占地面积',
			align : 'center',
		},{
			field : 'POLLUETED',
			title : '是否污染',
			align : 'center',
		},{
			field : 'SCJDBM',
			title : '所处阶段',
			align : 'center',
		}];
	//销毁表格
	$('#table_template').bootstrapTable('destroy');
	//生成表格
	$('#table_template').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/pic/getWrdkTableData.do",
	    columns : columns,
	    //search:true,
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
	    queryParams: function queryParams(params) {   //设置查询参数  
            var param = {    
                pageNumber: params.offset,    
                pageSize: params.limit,
                province:searchParams.province,
                city:searchParams.city,
                county:searchParams.county,
                industry:searchParams.industry,
                keyword:searchParams.keyword
            };    
            return param;                   
          }, 
	    queryParamsType : "limit", 			// 参数格式,发送标准的RESTFul类型的参数请求
	    silent : true, 						// 刷新事件必须设置
	    contentType : "application/x-www-form-urlencoded",	// 请求远程数据的内容类型/"application/x-www-form-urlencoded"
	    onClickRow : function(row, $element) {
	      $('.success').removeClass('success');
	      $($element).addClass('success');
	    },
	    icons : {
	      refresh : "glyphicon-repeat",
	      toggle : "glyphicon-list-alt",
	      columns : "glyphicon-list"
	    }
	});
	
}


/*************悬浮窗******************/
$(function(){
	
	/*******清单模式搜索按钮******/
	//条件查询点击事件
	$(".keyword button").click(function(){
		searchParams.industry = $(".industry").val();
		searchParams.keyword = $(".keyword input").val();
//		updateMap();
		updateTable();
		//回显地图模式的行业类型数据
//		huiXianMapIndustry();
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
				$("#div_3").show();
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
	$(".main_table div.tabtop_rt").click(function(){
		$(".main_table").hide();
	})
	//关闭统计图
	$(".main_graphic div.tabtop_rt").click(function(){
		$(".main_graphic").hide();
	})
	
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
    
    
})

/**********行业定制********/


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
function removeGraphic(value){
	var graphics = map.graphics.graphics;
	for (var i = 0; i < graphics.length; i++) {
		if(graphics[i].attributes&&graphics[i].attributes.type&&graphics[i].attributes.type==value){
			map.graphics.remove(graphics[i]);
		}
	}
}

/***********页面控制相关方法****************/
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




