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
$('.echartButton').click(function(){
	$(this).attr('src','../../img/oneMapButtonClick3.png');
	$('.tableButton').attr('src','../../img/oneMapButton2.png');
	$('.mapButton').attr('src','../../img/oneMapButton1.png');
	$('.map-contain').removeClass('active').addClass('none');
	$('.table-contain').removeClass('active').addClass('none');
    $('.graphs').show();
	qt();
});

// 统一下拉框选中
$('ul.dropdown-menu li a').click(function(){
    $(this).parent().parent().siblings().text($(this).text());
})

/********************变量***************/
var map;
//是否有统计图、统计表、时间轴数据
var isHaveData={
		tongjibiao:1,
		tongjitu:0,
		shijianzhou:0,
		
		tongjituState:0,
		tongjibiaoState:0,
		shijianzhouState:0
},isSelect=0;
//省界底图
var featureLayer = null;
//省界地图上的数字图层
var graphicsLayer = null;
//某一个省的点位图层
var provinceLayer = null;
//某一个省的code
var provinceCode = "";
//某一个省的边界
var provinceExtent = "";
//某一个省的边界高亮
var provinceClick = "";
//条件查询参数
var searchParams = {//清单模式查询条件
		province:"",
		city:"",
		county:"",
		industry:"",
		keyword:""
}

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
			showLabels:true,
			infoWindow:infoWindow
		}) 

		//设置弹出框样式
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
        map.setInfoWindow(infoWindow);
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		//加载公里格网数据
//		addGewang();
		//加载基于各省产粮油大县数量的分省分段专题图
		updateCountry(true);
		//更新表格
		updateTable();
	});//--require end
})

//更新全国图层
function updateCountry(flag){
	//显示国界线图层
	showGuojie();
	//处理图例
	$("#mylegend .sldeDown p:eq(0)").addClass("none");
	$("#mylegend .sldeDown ul:eq(0)").addClass("none");
	$("#mylegend .sldeDown p:eq(1)").removeClass("none");
	$("#mylegend .sldeDown ul:eq(1)").removeClass("none");
	//隐藏其他图层
	hideLayer(provinceLayer);
	hideLayer(map.getLayer("countyGraphicsLayer"));
	if(flag){//加载图层
		initProvinceLayer();
	}else{//显示图层
		//设置地图边界
		map.centerAndZoom([108,34],4);
		//消除省界高亮
		removeGraphic("provinceClick");
		showLayer(featureLayer);
		showLayer(graphicsLayer);
	}
}

//更新某一个省的图层
function updateProvince(flag){
	//清除国界线图层
	hideGuoJie();
	//处理图例
	$("#mylegend .sldeDown p:eq(0)").removeClass("none");
	$("#mylegend .sldeDown ul:eq(0)").removeClass("none");
	$("#mylegend .sldeDown p:eq(1)").addClass("none");
	$("#mylegend .sldeDown ul:eq(1)").addClass("none");
	//隐藏其他图层
	hideLayer(featureLayer);
	hideLayer(graphicsLayer);
	if(flag){//加载图层
		updateGraphicsOfProvince();
	}else{
		//设置地图边界
		map.setExtent(provinceExtent);
		//加载省界高亮
		map.graphics.add(provinceClick);
		//显示图层
		showLayer(provinceLayer);
		showLayer(map.getLayer("countyGraphicsLayer"));
	}
}

//加载分省分段专题图
function initProvinceLayer(){
	if(featureLayer!=null){
		map.removeLayer(featureLayer);
	}
	if(graphicsLayer!=null){
		map.removeLayer(graphicsLayer);
	}
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer","esri/symbols/TextSymbol","esri/renderers/SimpleRenderer",
	         "esri/graphic","esri/geometry/Polyline","esri/renderers/ClassBreaksRenderer",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,TextSymbol,SimpleRenderer,
			Graphic,Polyline,ClassBreaksRenderer,
			SimpleFillSymbol, SimpleLineSymbol, Color,LabelClass
	){

		 //加载地图服务
		 featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"]
             
	     });
		 
		 //加载省名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
		 
		 //添加点击事件
		 featureLayer.on("click",function(evt){
			 //高亮设置
			 removeGraphic("provinceClick");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
			 provinceClick = highGraphic;
			 map.graphics.add(highGraphic);
			 
			 //获取点击省份的PROV_CODE
			 provinceCode = evt.graphic.attributes.PROV_CODE;
			 //设置地图边界
			 map.setExtent(evt.graphic.geometry.getExtent());
			 //记录地图边界
			 provinceExtent = evt.graphic.geometry.getExtent();
			 //改变右上角按钮Text
			 $("#province").html(evt.graphic.attributes.NAME);
			 //显示右上角按钮
			 $("#province").removeClass("none");
			 //更新某一个省的点位图层
			 updateProvince(true);
		 });
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([255,0,51]), 2);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceHigh"});
			 map.graphics.add(highGraphic);
		})
		
		//添加鼠标移出事件
		featureLayer.on("mouse-out",function(){
			removeGraphic("provinceHigh");
		})
		
		featureLayer.on("graphic-node-add",function(){
			//加载动画结束
			zmblockUI('#map', 'end');
			addGuojie();
		})

	 	 //ajax获取各省产粮油大县的数量
		 var json = {};
		 ajaxPost('/seimp/pic/getFood1.do',json).done(function(result){
			if(result.status==0){//请求成功
				if(result.data.length>0){
					var data = result.data;
					//模拟数据
					/*var data = [{
						province:'110000',
						count:1
					},{
						province:'120000',
						count:1
					},{
						province:'130000',
						count:3
					}];*/
					//处理数据，获取各省数量的最大值最小值
					var minCount = 0;
					var maxCount = 0;
					for (var i = 0; i < data.length; i++) {
						currItem = data[i];
						if(currItem.count<minCount){
							minCount = currItem.count;
						}
						if(currItem.count>maxCount){
							maxCount = currItem.count;
						}
					}
					//处理最大值
					maxCount = maxmain(maxCount);
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					
					//设置分省底图各个分段的symbol
			 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([247,251,255,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([222,235,247,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([198,219,239,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([158,202,225,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([107,174,214,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([66,146,198,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.province, symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.province, symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.province, symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.province, symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.province, symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.province, symbol6);
						}
					}
					//为分省地图设置渲染
					featureLayer.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initProvinceCount(data);
					})
					
					
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
					featureLayer.setRenderer(renderer);
					//更新图例
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						updatePieLayer();
					})
				}
			}
		});//--ajax end
	});//-require end
}

//加载各省数字图层
function initProvinceCount(data){
	require([
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
		"esri/geometry/Point",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
		SimpleMarkerSymbol, SimpleLineSymbol,
        PictureMarkerSymbol, CartographicLineSymbol, 
        Graphic, TextSymbol,GraphicsLayer,
        Point,
        Color, dom, on
  	){
		graphicsLayer = new GraphicsLayer();
		//获取省界图层的Graphics
		var feaGraphics = featureLayer.graphics;
		
		//添加省名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			//处理河北省
			if(currFeaGraphic.attributes.PROV_CODE=="130000"){
				point = new Point([115.18,38]);
			}
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
			symbol.setOffset(0,-14);
			var graphic = new Graphic(point,symbol);
			graphicsLayer.add(graphic);
		}
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.PROV_CODE==currItem.province){
					
					var attributes = {
							provoinceCode:currItem.province,
							provinceName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					//处理河北省
					if(currFeaGraphic.attributes.PROV_CODE=="130000"){
						point = new Point([115.18,38]);
					}
					var symbolSize = 24;
					if(currItem.count.toString().length==1){
						symbolSize = 24;
					}else if(currItem.count.toString().length==2){
						symbolSize = 30;
					}else if(currItem.count.toString().length==3){
						symbolSize = 40;
					}else if(currItem.count.toString().length==4){
						symbolSize = 50;
					}else if(currItem.count.toString().length==5){
						symbolSize = 60;
					}else{
						symbolSize = currItem.count.toString().length*12;
					}
					
					var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
					var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-5).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
					symbol2.font.setFamily("Times");
					symbol2.font.setSize("10pt");
					symbol2.font.setWeight(600);
					var graphic1 = new Graphic(point,symbol1,attributes);
					var graphic2 = new Graphic(point,symbol2,attributes);
					graphicsLayer.add(graphic1);
					graphicsLayer.add(graphic2);
				}
			}
		}
		map.addLayer(graphicsLayer);
		
	});//--require end
}

//更新某一个省的所有县
function updateGraphicsOfProvince(){
	if(provinceLayer!=null){
		map.removeLayer(provinceLayer);
	}
	if(map.getLayer("countyGraphicsLayer")!=null){
		map.removeLayer(map.getLayer("countyGraphicsLayer"));
	}
	require(["esri/map","esri/dijit/Legend",
	         "esri/layers/FeatureLayer","esri/renderers/UniqueValueRenderer",
	         "esri/renderers/SimpleRenderer",
	         "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol",
	         "esri/renderers/ClassBreaksRenderer",
	         "esri/graphic","esri/geometry/Polyline",
	         "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",
	         "esri/symbols/TextSymbol","esri/layers/LabelClass"
	],function(Map, Legend,
			FeatureLayer,UniqueValueRenderer,
			SimpleRenderer,
			SimpleFillSymbol, SimpleMarkerSymbol,
	        ClassBreaksRenderer,
			Graphic,Polyline,
			SimpleFillSymbol, SimpleLineSymbol, Color,
			TextSymbol,LabelClass
	){
		provinceLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
			 outFields: ["*"],
			 opacity:1,
			 id:"countyFeatureLayer"
	     });
		
		provinceLayer.setDefinitionExpression("CODE like '"+(provinceCode+"").substr(0, 2)+"%'");
		
		//加载县名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("8pt");
		 statesLabel.font.setWeight(700);
//		 statesLabel.setOffset(20,-20);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "labelPlacement":"below-right",
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 provinceLayer.setLabelingInfo([labelClass]);
		
		//设置渲染
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([169,169,169,1]), 2);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		var renderer = new SimpleRenderer(defaultSymbol);
 		provinceLayer.setRenderer(renderer);
 		
		//标出产粮油大县
		var json = {code:provinceCode};
		ajaxPost('/seimp/pic/getFood2.do',json).done(function(result){
			if(result.status==0){//请求成功
				var data = result.data;
				var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
		 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([247,251,255,1]));
		 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([35,139,69,1]));
		 		renderer = new UniqueValueRenderer(defaultSymbol,"CODE");
		 		for (var i = 0; i < data.length; i++) {
					var currItem = data[i];
					renderer.addValue(currItem.county,symbol1);
				}
		 		//为分省地图设置渲染
		 		provinceLayer.setRenderer(renderer);
		 		
		 		//将分省地图添加到地图上
				map.addLayer(provinceLayer,2);
		 		
			}
		});//--ajax end
		
		//一个省的所有县图层的graphic加载完成之后，再加载县名
		provinceLayer.on("update-end",function(){
			updateTextOfProvince();
		});
		
		
	});//--require end
}

//加载县名
function updateTextOfProvince(){
	require([
 		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
 		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
 		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
 		"esri/geometry/Point",
 		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
 	], function(
 		SimpleMarkerSymbol, SimpleLineSymbol,
         PictureMarkerSymbol, CartographicLineSymbol, 
         Graphic, TextSymbol,GraphicsLayer,
         Point,
         Color, dom, on
   	){
		var graphicsLayer = new GraphicsLayer({id:"countyGraphicsLayer"});
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("countyFeatureLayer").graphics;
		var json = {code:provinceCode};
		ajaxPost('/seimp/pic/getFood2.do',json).done(function(result){
			if(result.status==0){//请求成功
				var data = result.data;
				for (var i = 0; i < data.length; i++) {
					var currItem = data[i];
					for (var j = 0; j < feaGraphics.length; j++) {
						var currGra = feaGraphics[j];
						if(currItem.county==currGra.attributes.CODE){
							//添加省名标签
								var point = currGra.geometry.getCentroid();
								var symbol = new TextSymbol(currGra.attributes.NAME).setColor(new Color([0,0,0,1]));
								symbol.font.setSize("12pt");
								symbol.font.setWeight(700);
//								symbol.setOffset(0,-14);
								var graphic = new Graphic(point,symbol);
								graphicsLayer.add(graphic);
						}
					}
					map.addLayer(graphicsLayer);
				}
			}//if end
		});//ajax end
		
	});//require end
}

//更新表格
function updateTable(){
	var columns =[{
	        field : 'PARTICULARNAME',
	        title : '省份',
	        align : 'center'
		},{
			field : 'ONE_BUSINESSNAME',
			title : '市',
			align : 'center',
		},{
	        field : 'provinceName',
	        title : '县',
	        align : 'center'
		}];
	//销毁表格
	$('#table_template').bootstrapTable('destroy');
	//生成表格
	$('#table_template').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/pic/getFoodTable.do",
	    columns : columns,
	    //search:true,
	    classes:'table-no-bordered',	//消除表格边框
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
	/**********右上角按钮****/
	$("#country").click(function(){
		//点击全国按钮的时候，隐藏省、市
		$("#city").addClass("none");
		updateCountry(false);
	})
	$("#province").click(function(){
		updateProvince(false);
	})
	
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

/***********地图相关方法***************/
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

//隐藏图层
function hideLayer(layer){
	if(layer!=null){
		layer.setVisibility(false);
	}
}

//显示图层
function showLayer(layer){
	if(layer!=null){
		layer.setVisibility(true);
	}
}

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


//省市区县的全局变量
var res;
ajaxPost("/seimp/pic/getallRegion.do",{}).done(function(result){
	if(result.status==0&&result.data.length>0){
		res=result;
		for (var i = 0; i < result.data.length; i++) {
			var province = result.data[i];
			if(province.level==0){
			$(".province2").append("<option value='"+province.code+"'>"+province.name+"</option>");
				
			}else if(province.level==1){
				$(".city2").append("<option value='"+province.code+"'>"+province.name+"</option>");
			}
		}
	}
});


$(".province2").change(function(){
		if(res.status==0&&res.data.length>0){
			var pro=$(".province2").val();
			$(".city2").html("");
			$(".city2").append("<option value=''>请选择市</option>");
			if(pro!=""){
			for (var i = 0; i < res.data.length; i++) {
				var province = res.data[i];
				pro=pro.substr(0, 2);
				var code=province.code.substr(0, 2);
				if(code==pro&&province.level==1){
					$(".city2").append("<option value='"+province.code+"'>"+province.name+"</option>");
				}
			}
			}else{
				for (var i = 0; i < res.data.length; i++) {
					var province = res.data[i];
					$(".city2").val("");
				if(province.level==1){
				$(".city2").append("<option value='"+province.code+"'>"+province.name+"</option>");
				}
				}
			}
		}
		qt();
}
);

$(".city2").change(function(){
	var pro=$(".province2").val();
	var city=$(".city2").val();
	if(pro==""){
		$(".province2").val(city.substr(0, 2)+"0000");	
	}
	
	qt();
})
//图表
	function qt(){
		var p=$(".province2").val();
		var c=$(".city2").val();
		ajaxPost("/seimp/pic/getQTTB", {province:p,city:c}).done(function (data) {
			var arr = new Array();
			var arr2 = new Array();
			if (data.status == 0) {
	            for (var i = 0; i < data.data.length; i++) {
	            	var item = data.data[i];
	            	if(item.name!=undefined){
	            	arr.push(item.name);
	            	arr2.push(item.count);
	            	}
	            }
		var myChart = echarts.init(document.getElementById('graphs'));
		myChart.clear();
		option = {
			    title : {
			        text: '产粮油大县数量统计图',
//			        subtext: '纯属虚构'
			        left:'center'
			    },
			    tooltip : {
			        trigger: 'axis'
			    },
//			    legend: {
//			        data:['产粮油大县']
//			    },
			    toolbox: {
			        show : true,
			        feature : {
//			            mark : {show: true},
//			            dataView : {show: true, readOnly: false},
			            magicType : {show: true, type: ['line', 'bar']},
//			            restore : {show: true},
			            saveAsImage : {show: true}
			        }
			    },
			    calculable : true,
			    xAxis : [
			        {
			        	name:'(省/市/区县)',
			            type : 'category',
			            data : arr,
			            axisLabel:{
			            	interval:0,
			            	rotate:-30
			            	
			            }
			        }
			    ],
			    dataZoom : {
	                show : true,
	                realtime : true,
	                start : 0,
	                end : 100
	            },
			    yAxis : [
			        {   
			        	name:'(个)',
			            type : 'value'
			        }
			    ],
			    series : [
			        {
			            name:'产粮油大县数',
			            type:'bar',
			            data:arr2,
			            barMaxWidth:100
//			            markPoint : {
//			                data : [
//			                    {type : 'max', name: '最大值'},
//			                    {type : 'min', name: '最小值'}
//			                ]
//			            }
			        },
//			        {
//			            name:'降水量',
//			            type:'bar',
//			            data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
////			        markPoint : {
////		                data : [
////		                    {type : 'max', name: '最大值'},
////		                    {type : 'min', name: '最小值'}
////		                ]
////		            }
//			        }
			    ]
			};
		 myChart.setOption(option);
	        }
	    });
}