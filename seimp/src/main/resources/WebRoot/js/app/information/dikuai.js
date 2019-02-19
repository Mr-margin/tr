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

//点击地图模式
$('.mapButton').click(function(){
	//更换this本身的按钮图片
    $(this).attr('src','../../img/infor/11.1.png')
    $('.tableButton').attr('src','../../img/infor/12.2.png')
    $('.echartButton').attr('src','../../img/infor/13.2.png')
    $(".graphs").css('display','none');
    $('.map-contain').removeClass('none').addClass('active').siblings('.table-contain').removeClass('active').addClass('none');
    //显示地图模式中右侧的悬浮菜单
    $(".floattool").show();
});
//点击切换清单模式
$('.tableButton').click(function(){
	//更换地图模式按钮背景图片
    $('.mapButton').attr('src','../../img/infor/11.2.png')
    //更换this本身的按钮图片
    $(this).attr('src','../../img/infor/12.1.png')
    $('.echartButton').attr('src','../../img/infor/13.2.png')
    $('.table-contain').removeClass('none').addClass('active').siblings('.map-contain').removeClass('active').addClass('none');
    $(".graphs").css('display','none');
    //隐藏地图模式中右侧的悬浮菜单
    $(".floattool").hide();
    //隐藏地图模式中右侧的悬浮菜单
    $(".main_table").hide();
    //隐藏地图模式中右侧的悬浮菜单
    $(".main_graphic").hide();
    $(".time-axis-box").hide();
});

$('.echartButton').click(function(){
	$(this).attr('src','../../img/infor/13.1.png');
	$('.tableButton').attr('src','../../img/infor/12.2.png');
	$('.mapButton').attr('src','../../img/infor/11.2.png');
	$('.map-contain').removeClass('active').addClass('none');
	$('.table-contain').removeClass('active').addClass('none');
    $('.graphs').show();
	graph();
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
	//加载动画开始
	zmblockUI('#map', 'start');
	require(["esri/map","esri/SpatialReference","esri/geometry/Extent",
	         "esri/layers/WMTSLayer","esri/layers/WMTSLayerInfo","esri/layers/TileInfo",
	         "extras/DEBubblePopup",
	         "esri/tasks/QueryTask","esri/tasks/query","esri/graphic","esri/geometry/Polyline","esri/symbols/SimpleLineSymbol","esri/Color",
	         "esri/dijit/InfoWindowLite","dojo/dom-construct"
	],function(Map,SpatialReference,Extent,
			WMTSLayer,WMTSLayerInfo,TileInfo,
			DEBubblePopup,
			QueryTask, Query,Graphic,Polyline, SimpleLineSymbol,Color,
			InfoWindowLite,domConstruct
	){
		extent = new Extent(extentPar);
		var infoWindow = new  DEBubblePopup();
		var bounds = new Extent({  
    		"xmin": 35.748, "ymin": -37.114, "xmax": 176.179, "ymax": 86.070,  
    		"spatialReference": { "wkid": 4326 }  
    	});
    	/*map = new Map("map", {  
    		extent: bounds,showAttribution:false,logo:false,slider:false,
    		minZoom:1,
    		maxZoom:10,
    		infoWindow:infoWindow
    	});*/
		
		//初始化地图
		map = new Map("map",{
			extent: bounds,
			showAttribution:false,
			slider:false,
			logo:false,
			minZoom:2,
//			center:[108,34],
//			zoom:3,
			extent:extent,
			showLabels:true,
			infoWindow:infoWindow
//			wrapAround180:true
		});
		
		var infoWindow = new InfoWindowLite(null, domConstruct.create("div", null, null, map.root));
        infoWindow.startup();
//        map.setInfoWindow(infoWindow);
        
//        map.infor
		
		//加载天地图：全球矢量地图服务、全球矢量中文注记服务
		vectorMap(map);
		
//		addGewang();
		//更新地图
//		updateMap();
		
		//判断用户是否是省级用户
		var storage = window.sessionStorage;
		//管理员、国家级用户
		if(storage.getItem("userLevel")==null || storage.getItem("userLevel")=="0" || storage.getItem("userLevel")=="1"){
			//更新全国模式
			updateCountry(true);
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
					 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
					 //记录边界高亮
					 provinceClick = highGraphic;
					 map.graphics.add(highGraphic);
					 //改变右上角按钮Text
					 $("#province").html(graphic.attributes.NAME);
					 //显示右上角按钮
					 $("#province").removeClass("none");
					 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
					 $("#city").addClass("none");
				}
		    }
			
			updateProvince(true);
		}
		
		//更新表格
		updateTable();
		
		
		
		
	});//--require end
})

//更新全国模式 true：加载 false：显示
function updateCountry(flag){
	//关闭弹出框
	map.infoWindow.remove();
	//显示国界线图层
	showGuojie();
	//记录地图模式
	mapType = "1";
	//清除高亮
	removeGraphic("provinceClick");
//	map.centerAndZoom([108,34],3);
	map.setExtent(extent);
	//隐藏某一个省模式的图形
	if(map.getLayer("provinceFeatureLayer")!=null){
		map.getLayer("provinceFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("provinceGraphicsLayer")!=null){
		map.getLayer("provinceGraphicsLayer").setVisibility(false);
	}
	//隐藏某一个市的点位图层
	if(map.getLayer("dikuai")!=null){
		map.getLayer("dikuai").setVisibility(false);
	}
	if(flag){
		if(map.getLayer("countryFeatureLayer")!=null){
			map.removeLayer(map.getLayer("countryFeatureLayer"));
		}
		if(map.getLayer("countryGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("countryGraphicsLayer"));
		}
		//加载
		initCountry();
	}else{
		
		//图例
		updateLegend(countryMinCount, countryCount);
		//显示
		if(map.getLayer("countryFeatureLayer")!=null){
			map.getLayer("countryFeatureLayer").setVisibility(true);
		}
		if(map.getLayer("countryGraphicsLayer")!=null){
			map.getLayer("countryGraphicsLayer").setVisibility(true);
		}
	}
}

//更新某一个省份的模式
function updateProvince(flag){
	//关闭弹出框
	map.infoWindow.remove();
	//清除国界线图层
	hideGuoJie();
	//记录地图模式
	mapType = "2";
	//隐藏全国模式的图形
	if(map.getLayer("countryFeatureLayer")!=null){
		map.getLayer("countryFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.getLayer("countryGraphicsLayer").setVisibility(false);
	}
	//隐藏某一个市的点位图层
	if(map.getLayer("dikuai")!=null){
		map.getLayer("dikuai").setVisibility(false);
	}
	if(flag){
		if(map.getLayer("provinceFeatureLayer")!=null){
			map.removeLayer(map.getLayer("provinceFeatureLayer"));
		}
		if(map.getLayer("provinceGraphicsLayer")!=null){
			map.removeLayer(map.getLayer("provinceGraphicsLayer"));
		}
		//加载
		initProvince();
	}else{
		removeGraphic("provinceClick");
		map.graphics.add(provinceClick);
		map.setExtent(provinceExtent);
		//图例
		updateLegend(provinceMinCount, provinceCount);
		//显示
		if(map.getLayer("provinceFeatureLayer")!=null){
			map.getLayer("provinceFeatureLayer").setVisibility(true);
		}
		if(map.getLayer("provinceGraphicsLayer")!=null){
			map.getLayer("provinceGraphicsLayer").setVisibility(true);
		}
		
	}
}

//更新某一个市的模式
function updateCity(flag){
	//关闭弹出框
	map.infoWindow.remove();
	//清除国界线图层
	hideGuoJie();
	//记录地图模式
	mapType = "3";
	//隐藏某一个省模式的图形
	if(map.getLayer("provinceFeatureLayer")!=null){
		map.getLayer("provinceFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("provinceGraphicsLayer")!=null){
		map.getLayer("provinceGraphicsLayer").setVisibility(false);
	}
	//隐藏全国模式的图形
	if(map.getLayer("countryFeatureLayer")!=null){
		map.getLayer("countryFeatureLayer").setVisibility(false);
	}
	if(map.getLayer("countryGraphicsLayer")!=null){
		map.getLayer("countryGraphicsLayer").setVisibility(false);
	}
	if(flag){
		//销毁某一个市的点位图层
		if(map.getLayer("dikuai")!=null){
			map.removeLayer(map.getLayer("dikuai"));
		}
		//加载
		initCounty();
	}else{
		removeGraphic("provinceClick");
		map.graphics.add(cityClick);
		map.setExtent(cityExtent);
		//显示
		if(map.getLayer("dikuai")!=null){
			map.getLayer("dikuai").setVisibility(true);
		}
	}
}

//加载全国图层
function initCountry(){
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
	 	var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"countryFeatureLayer"
	     });
		 
		 //加载省名标签
		 var statesLabel = new TextSymbol().setColor(new Color("#0a162c"));
		 statesLabel.font.setSize("12pt");
		 statesLabel.font.setWeight(700);
		 statesLabel.setOffset(0,-2);
		 var labelClass = new LabelClass({
		     "labelExpressionInfo": {"value": "{NAME}"},
		     "useCodedValues": true,
		     "above-left":'above-left',
		     "fieldInfos": [{fieldName: "NAME"}]
		 });
		 labelClass.symbol = statesLabel;
//		 featureLayer.setLabelingInfo([labelClass]);
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]),0.5);
 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);
	 		
		 //添加点击事件
		 featureLayer.on("click",function(evt){
			 //高亮设置
			 removeGraphic("provinceClick");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0]), 0.5);
			 var highGraphic = new Graphic(highPolyline,highSymbol,{type:"provinceClick"});
			 //记录边界高亮
			 provinceClick = highGraphic;
			 map.graphics.add(highGraphic);			 //获取点击省份的PROV_CODE
			 provinceCode = evt.graphic.attributes.PROV_CODE;
			 //设置地图边界
			 map.setExtent(evt.graphic.geometry.getExtent());
			 //记录地图边界
			 provinceExtent = evt.graphic.geometry.getExtent();
			 //改变右上角按钮Text
			 $("#province").html(evt.graphic.attributes.NAME);
			 //显示右上角按钮
			 $("#province").removeClass("none");
			 //点击某一个省份的时候，隐藏右上角的某一个市的按钮
			 $("#city").addClass("none");
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
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
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
			//添加国界线图层
			addGuojie();
		})

	 	 //ajax获取各省产粮油大县的数量
		 var json = {industry:mapIndustry};
		 ajaxPost('/seimp/pic/getWrdk1.do',json).done(function(result){
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
					//重新计算最大值
					maxCount = maxmain(maxCount);
					
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					countryMinCount = minCount;
					countryCount = count;
					
					//设置分省底图各个分段的symbol
			 		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
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
//					featureLayer.setRenderer(renderer);
					//将分省地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initCountryCount(data);
					})
					
					fikuaiTable(data);
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"PROV_CODE");
//					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initCountryCount();
					})
					fikuaiTable(0)
				}

			}
		});//--ajax end
	});//-require end
}

//加载各省数字图层
function initCountryCount(data){
	require([
		"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/CartographicLineSymbol", 
		"esri/graphic", "esri/symbols/TextSymbol","esri/layers/GraphicsLayer",
		"esri/geometry/Point", "esri/symbols/Font",
		"esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
	], function(
		SimpleMarkerSymbol, SimpleLineSymbol,
        PictureMarkerSymbol, CartographicLineSymbol, 
        Graphic, TextSymbol,GraphicsLayer,
        Point,Font,
        Color, dom, on
  	){
		var graphicsLayer = new GraphicsLayer({id:"countryGraphicsLayer"});
//		graphicsLayer.setMinScale(18489334.7159);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("countryFeatureLayer").graphics;
		//添加省名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			//处理河北省
			if(currFeaGraphic.attributes.PROV_CODE=="130000"){
				point = new Point([115.18,38]);
			}
			if( currFeaGraphic.attributes.NAME != "香港特别行政区" && currFeaGraphic.attributes.NAME != "澳门特别行政区"){
				var font = new Font("20px", Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLDER);
				var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
				symbol.font.setSize("10pt");
				symbol.font.setWeight(700);
				symbol.font.setFamily("微软雅黑");
				symbol.setOffset(0,-14);
				var graphic = new Graphic(point,symbol);
				graphicsLayer.add(graphic);
			}
		}
		//计算总数
		var sum = 0;//总数
		for (var i = 0; i < data.length; i++) {
			var currItem = data[i];
			sum += currItem.count;
		}
		
		
		//遍历省界图层的graphics
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			//遍历数据
			for (var j = 0; j < data.length; j++) {
				var currItem = data[j];
				//判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
				if(currFeaGraphic.attributes.PROV_CODE==currItem.province){
					
					/*if(currItem.province=="430000"){
						var attributes = {
								provoinceCode:currItem.province,
								provinceName:currItem.name
						}
						var point = currFeaGraphic.geometry.getCentroid();
						var symbolSize = 24;
						if(currItem.count.toString().length==1){
							symbolSize = 24;
						}else if(currItem.count.toString().length==2){
							symbolSize = 30;
						}else if(currItem.count.toString().length==3){
							symbolSize = 40;
						}else if(currItem.count.toString().length==4){
							symbolSize = 60;
						}else if(currItem.count.toString().length==5){
							symbolSize = 70;
						}else{
							symbolSize = currItem.count.toString().length*14;
						}
						var symbol1 = new PictureMarkerSymbol("../../img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize/2);
						var symbol2 = new TextSymbol(currItem.count).setOffset(0,symbolSize/2-7).setColor(new Color([255,255,255,1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
						symbol2.font.setSize("10pt");
						symbol2.font.setWeight(700);
						symbol3 = new TextSymbol((currItem.count/sum*100).toFixed(2)+"%").setOffset(0,symbolSize/2-17).setColor(new Color([255,255,255,1]));
						symbol3.font.setSize("8pt");
						symbol3.font.setWeight(700);
						var graphic1 = new Graphic(point,symbol1,attributes);
						var graphic2 = new Graphic(point,symbol2,attributes);
						var graphic3 = new Graphic(point,symbol3,attributes);
						graphicsLayer.add(graphic1);
						graphicsLayer.add(graphic2);
//						graphicsLayer.add(graphic3);
						continue;
					}*/
					
					
					var attributes = {
							provoinceCode:currItem.province,
							provinceName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					//处理河北省
					if(currFeaGraphic.attributes.PROV_CODE=="130000"){
						point = new Point([115.18,38]);
					}
					var symbolSize = 20;
					if(currItem.count.toString().length==1){
						symbolSize = 20;
					}else if(currItem.count.toString().length==2){
						symbolSize = 26;
					}else if(currItem.count.toString().length==3){
						symbolSize = 36;
					}else if(currItem.count.toString().length==4){
						symbolSize = 46;
					}else if(currItem.count.toString().length==5){
						symbolSize = 53;
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

//加载某一个省的所有市图层
function initProvince(){
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
		 var featureLayer = new FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
			 mode: FeatureLayer.MODE_SNAPSHOT,  
             outFields: ["*"],
             id:"provinceFeatureLayer"
	     });
		 
		 featureLayer.setDefinitionExpression("KIND_1 like '"+(provinceCode+"").substr(0, 2)+"%'");
		 
		 //加载市名标签
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
		 
		var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([0,0,0,0.5]), 0.5);
		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([0,0,0,0]));
 		renderer = new SimpleRenderer(defaultSymbol);
 		featureLayer.setRenderer(renderer);
		 
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
			 cityClick = highGraphic;
			 map.graphics.add(highGraphic);
			 
			 //获取点击时的PROV_CODE
			 cityCode = evt.graphic.attributes.KIND_1+"00";
			 //设置地图边界
			 map.setExtent(evt.graphic.geometry.getExtent());
			 //记录地图边界
			 cityExtent = evt.graphic.geometry.getExtent();
			 //改变右上角按钮Text
			 $("#city").html(evt.graphic.attributes.NAME);
			 //显示右上角按钮
			 $("#city").removeClass("none");
			 //更新一个市的点位
			 updateCity(true);
		 });
		 
		 //添加鼠标进入事件
		 featureLayer.on("mouse-over",function(evt){
			 removeGraphic("provinceHigh");
			 var lineJson = {
					 "paths":evt.graphic.geometry.rings,
					 "spatialReference":{"wkid":4326}
			 }
			 var highPolyline = new Polyline(lineJson);
			 var highSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([252,78,42]), 2);
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
		})

	 	 //ajax获取某一个省的各个市的数量
		 var json = {industry:mapIndustry,code:provinceCode};
		 ajaxPost('/seimp/pic/getWrdk2.do',json).done(function(result){
			if(result.status==0){//请求成功
				if(result.data.length>0){
					var data = result.data;
					//处理数据，获取各市数量的最大值最小值
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
					//重新计算最大值
					maxCount = maxmain(maxCount);
					
					var count = (maxCount - minCount)/6;
					//更新图例
					updateLegend(minCount,count);
					//记录图例参数
					provinceMinCount = minCount;
					provinceCount = count;
					
					//设置分市底图各个分段的symbol
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 0.1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([217,217,217,1]));
			 		var symbol1 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,255,229,1]));
			 		var symbol2 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([255,247,188,1]));
			 		var symbol3 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,227,145,1]));
			 		var symbol4 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,196,79,1]));
			 		var symbol5 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([254,153,41,1]));
			 		var symbol6 = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([236,112,20,1]));
			 		renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
					
					
					//更新图例
//					updateLegend(minCount,count);
					
					for (var i = 0; i < data.length; i++) {
						var currItem = data[i];
						if(minCount<=currItem.count&&currItem.count<minCount+count*1){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol1);
						}else if(minCount+count*1<=currItem.count&&currItem.count<minCount+count*2){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol2);
						}else if(minCount+count*2<=currItem.count&&currItem.count<minCount+count*3){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol3);
						}else if(minCount+count*3<=currItem.count&&currItem.count<minCount+count*4){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol4);
						}else if(minCount+count*4<=currItem.count&&currItem.count<=minCount+count*5){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol5);
						}else if(minCount+count*5<=currItem.count&&currItem.count<=minCount+count*6){
							renderer.addValue(currItem.CITY_CODE.substr(0, 4), symbol6);
						}
					}
					//为分市地图设置渲染
//					featureLayer.setRenderer(renderer);
					//将分市地图添加到地图上
					map.addLayer(featureLayer,2);
					//分段渲染的底图加载完成之后，才能加载数字图层
					featureLayer.on("update-end",function(){
						initProvinceCount(data);
					})
					
					fikuaiTable(data);
				}else{//如果没有数据
					var outlineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([51,51,51]), 1);
			 		var defaultSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new Color([237,248,251,1]));
					renderer = new UniqueValueRenderer(defaultSymbol,"KIND_1");
//					featureLayer.setRenderer(renderer);
					//更新图例
					updateLegend(0,0);
					map.addLayer(featureLayer,2);
					featureLayer.on("update-end",function(){//分段渲染的底图加载完成之后，才能加载分省饼图
						initProvinceCount(data);
					})
					fikuaiTable(0)
				}
			}
		});//--ajax end
	});//-require end
}

//加载某一个省各市的数字图层
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
		var graphicsLayer = new GraphicsLayer({id:"provinceGraphicsLayer"});
//		graphicsLayer.setMinScale(4622333.67898);
		//获取省界图层的Graphics
		var feaGraphics = map.getLayer("provinceFeatureLayer").graphics;
		
		//添加市名
		for (var i = 0; i < feaGraphics.length; i++) {
			var currFeaGraphic = feaGraphics[i];
			var point = currFeaGraphic.geometry.getCentroid();
			var symbol = new TextSymbol(currFeaGraphic.attributes.NAME).setColor(new Color("#0a162c"));
			symbol.font.setSize("10pt");
			symbol.font.setWeight(700);
			symbol.font.setFamily("微软雅黑");
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
				if(currFeaGraphic.attributes.KIND_1==currItem.CITY_CODE.substr(0,4)){
					
					var attributes = {
							countyCode:currItem.CITY_CODE,
							countyName:currItem.name
					}
					var point = currFeaGraphic.geometry.getCentroid();
					var symbolSize = 20;
					if(currItem.count.toString().length==1){
						symbolSize = 20;
					}else if(currItem.count.toString().length==2){
						symbolSize = 26;
					}else if(currItem.count.toString().length==3){
						symbolSize = 36;
					}else if(currItem.count.toString().length==4){
						symbolSize = 46;
					}else if(currItem.count.toString().length==5){
						symbolSize = 53;
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

//加载某一个县的所有地块的点位信息
function initCounty(){
	/*if(graphicsLayer!=null){
		map.removeLayer(graphicsLayer);
	}*/
	require(["esri/layers/GraphicsLayer","esri/InfoTemplate",
	         "esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol",
	         "esri/symbols/TextSymbol","esri/symbols/Font","esri/Color"
	],function(GraphicsLayer,InfoTemplate,
			Graphic,Point,PictureMarkerSymbol,
			TextSymbol,Font,Color
	){
		var json = {industry:mapIndustry,code:cityCode};
		ajaxPost("/seimp/pic/getWrdk3.do", json).done(function(result){
			if(result.status==0&&result.data.length>0){
				var data = result.data;
//				data = [{
//					enterpriseName:"河北吉藁化纤有限责任公司",
//					province:"河北省",
//					city:"石家庄市",
//					district:"藁城区",
//					industry:"化工",
//					remark:"产废",
//					longitude:"114.88403",
//					latitude:"38.041968",
//					address:"河北省石家庄市藁城区东宁路２号",
//					phone:"0310-58323388"
//				}]
				
				var template = new InfoTemplate();
				template.setTitle("污染地块信息")
				template.setContent(getContent);
				var graphicsLayer = new GraphicsLayer({"id":"dikuai",infoTemplate:template});
				
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					if(parseFloat(itemData.WRDKZXJD).toString() != "NaN" && parseFloat(itemData.WRDKZXWD).toString() != "NaN"){
						//获取
						/*var pictureUrl = "default";
						if(pictureArr[itemData.industry]!=null){
							pictureUrl = pictureArr[itemData.industry]; 
						}*/
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/information/dikuai.png', 25, 25);
						var attriubtes = {
								Wrdkid:itemData.WRDKID!=null?itemData.WRDKID:"",
								Wrdkbm: itemData.WRDKBM!=null?itemData.WRDKBM:"",		
								province: itemData.provinceName!=null?itemData.provinceName:"",	
								city: itemData.cityName!=null?itemData.cityName:"",
			        			district: itemData.countyName!=null?itemData.countyName:"",			
			        			industry: itemData.HYLB!=null?itemData.HYLB:"",				
			        			remark: itemData.FLAG!=null?itemData.FLAG:"",
			                    longitude: itemData.WRDK_LNG,
			                    latitude: itemData.WRDK_LAT,
			        			type: "dikuaiLayer"
						}
						var point = new Point(itemData.WRDKZXJD,itemData.WRDKZXWD);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}else if(parseFloat(itemData.lon).toString() != "NaN" && parseFloat(itemData.lat).toString() != "NaN"){
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/information/dikuai.png', 25, 25);
						var attriubtes = {
								Wrdkid:itemData.WRDKID!=null?itemData.WRDKID:"",
								Wrdkbm: itemData.WRDKBM!=null?itemData.WRDKBM:"",		
								province: itemData.provinceName!=null?itemData.provinceName:"",	
								city: itemData.cityName!=null?itemData.cityName:"",
			        			district: itemData.countyName!=null?itemData.countyName:"",			
			        			industry: itemData.HYLB!=null?itemData.HYLB:"",				
			        			remark: itemData.FLAG!=null?itemData.FLAG:"",
			                    longitude: itemData.WRDK_LNG,
			                    latitude: itemData.WRDK_LAT,
			        			type: "dikuaiLayer"
						}
						var point = new Point(itemData.lon,itemData.lat);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
						
					}
				}
				map.addLayer(graphicsLayer);
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">污染地块ID:</p><p class="col-xs-8 no-padding"><code>' + (attributes.Wrdkid!=null?attributes.Wrdkid:'') + '</code></p></div>'+
			/*		'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">初步调查ID:</p><p class="col-xs-8 no-padding"><code>' + (attributes.Cbdcid!=null?attributes.Cbdcid:'') + '</code></p></div>'+*/
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">地块编码:</p><p class="col-xs-8 no-padding"><code>' + (attributes.Wrdkbm!=null?attributes.Wrdkbm:'') + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">所属省份:</p><p class="col-xs-8 no-padding"><code>' + (attributes.province!=null?attributes.province:'') + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">所属城市:</p><p class="col-xs-8 no-padding"><code>' + (attributes.city!=null?attributes.city:'') + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">所属区域:</p><p class="col-xs-8 no-padding"><code>' + (attributes.district!=null?attributes.district:'') + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">行业类别:</p><p class="col-xs-8 no-padding"><code>' + (attributes.industry!=null?attributes.industry:'') + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">备注:</p><p class="col-xs-8 no-padding"><code>' + (attributes.remark!=null?attributes.remark:'') + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><hr/></div><div class="col-xs-12 no-padding"><code style="cursor:pointer;color:#038AEC;" onclick=showMapTable()>查看详情</code></p></div>';
				}
				
				//点击事件
				graphicsLayer.on("click",function(evt){
					//改变地图中心
					map.centerAt(evt.graphic.geometry);
					//回复之间的gif
					var graphics = map.getLayer("dikuai").graphics;
					for (var i = 0; i < graphics.length; i++) {
						var currGra = graphics[i];
						currGra.setSymbol(currGra.symbol.setUrl(currGra.symbol.url.replace(".gif",".png")));
					}
					//改变当前的png为gif
					evt.graphic.setSymbol(evt.graphic.symbol.setUrl(evt.graphic.symbol.url.replace(".png",".gif")));
					map.getLayer("dikuai").redraw();
					
					//改变弹出框大小
					map.infoWindow.resize("250","290");
					$(".close").click(function(){
						map.infoWindow.remove();
					})
					var Wrdkid = evt.graphic.attributes.Wrdkid;
					var json = {ID:Wrdkid};
					ajaxPost("/seimp/pic/getWrdkDataDetail.do", json).done(function(result){
						if(result.status==0){
							if(result.data.length>0){
								var data = result.data[0];
								isSelect=1;
								updateMapTable(data)
							}
						}
					});
				})
				
				//鼠标移上去，显示企业名称
				/*graphicsLayer.on("mouse-over",function(evt){
					map.graphics.clear();
					var offsetX = evt.graphic.attributes.enterpriseName.length*13.3/2;
					var font = new Font().setSize("12pt");
					var symbol = new TextSymbol(evt.graphic.attributes.enterpriseName,font)
									.setOffset(offsetX,20).setHaloColor(new Color([255, 255, 255])).setHaloSize(3);
					var graphic = new Graphic(evt.mapPoint,symbol);
					map.graphics.add(graphic);
				})*/
			}
		});//ajax end
	});//require end
}







//更新地图
function updateMap(){
	if(graphicsLayer!=null){
		map.removeLayer(graphicsLayer);
	}
	require(["esri/layers/GraphicsLayer","esri/InfoTemplate",
	         "esri/graphic","esri/geometry/Point","esri/symbols/PictureMarkerSymbol",
	         "esri/symbols/TextSymbol","esri/symbols/Font","esri/Color"
	],function(GraphicsLayer,InfoTemplate,
			Graphic,Point,PictureMarkerSymbol,
			TextSymbol,Font,Color
	){
		var json = {province:searchParams.province,city:searchParams.city,county:searchParams.county,industry:searchParams.industry,keyword:searchParams.keyword};
		ajaxPost("/seimp/pic/getWrdkData.do", json).done(function(result){
			if(result.status==0&&result.data.length>0){
				var data = result.data;
//				data = [{
//					enterpriseName:"河北吉藁化纤有限责任公司",
//					province:"河北省",
//					city:"石家庄市",
//					district:"藁城区",
//					industry:"化工",
//					remark:"产废",
//					longitude:"114.88403",
//					latitude:"38.041968",
//					address:"河北省石家庄市藁城区东宁路２号",
//					phone:"0310-58323388"
//				}]
				
				var template = new InfoTemplate();
				template.setTitle("污染地块信息")
				template.setContent(getContent);
				graphicsLayer = new GraphicsLayer({"id":"dikuai1",infoTemplate:template});
				map.addLayer(graphicsLayer);
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					if(parseFloat(itemData.WRDKZXJD).toString() != "NaN" && parseFloat(itemData.WRDKZXWD).toString() != "NaN"){
						//获取
						/*var pictureUrl = "default";
						if(pictureArr[itemData.industry]!=null){
							pictureUrl = pictureArr[itemData.industry]; 
						}*/
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/information/dikuai1.png', 25, 25);
						var attriubtes = {
								Wrdkid:itemData.WRDKID!=null?itemData.WRDKID:"",
								Wrdkbm: itemData.WRDKBM!=null?itemData.WRDKBM:"",		
								province: itemData.provinceName!=null?itemData.provinceName:"",	
								city: itemData.cityName!=null?itemData.cityName:"",
			        			district: itemData.countyName!=null?itemData.countyName:"",			
			        			industry: itemData.HYLB!=null?itemData.HYLB:"",				
			        			remark: itemData.WRDKDZ!=null?itemData.WRDKDZ:"",
			                    longitude: itemData.WRDKZXWD,
			                    latitude: itemData.WRDKZXWD,
			        			type: "dikuaiLayer"
						}
						var point = new Point(itemData.WRDKZXJD,itemData.WRDKZXWD);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}else if(parseFloat(itemData.lon).toString() != "NaN" && parseFloat(itemData.lat).toString() != "NaN"){
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/zhongdianqiye/2.png', 25, 25);
						var attriubtes = {
								Wrdkid:itemData.WRDKID!=null?itemData.WRDKID:"",
								Wrdkbm: itemData.WRDKBM!=null?itemData.WRDKBM:"",		
								province: itemData.provinceName!=null?itemData.provinceName:"",	
								city: itemData.cityName!=null?itemData.cityName:"",
			        			district: itemData.countyName!=null?itemData.countyName:"",			
			        			industry: itemData.HYLB!=null?itemData.HYLB:"",				
			        			remark: itemData.WRDKDZ!=null?itemData.WRDKDZ:"",
			                    longitude: itemData.lon,
			                    latitude: itemData.lat,
			        			type: "dikuaiLayer"
						}
						var point = new Point(itemData.lon,itemData.lat);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}
				}
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">污染地块ID:</p><p class="col-xs-8 no-padding"><code>' + attributes.Wrdkid + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">地块编码:</p><p class="col-xs-8 no-padding"><code>' + attributes.Wrdkbm + '</code></p></div>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">所属省份:</p><p class="col-xs-8 no-padding"><code>' + attributes.province + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">所属城市:</p><p class="col-xs-8 no-padding"><code>' + attributes.city + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">所属区域:</p><p class="col-xs-8 no-padding"><code>' + attributes.district + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">行业类别:</p><p class="col-xs-8 no-padding"><code>' + attributes.industry + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">备注:</p><p class="col-xs-8 no-padding"><code>' + attributes.remark + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">备注:</p><p class="col-xs-8 no-padding"><code>' + attributes.remark + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">备注:</p><p class="col-xs-8 no-padding"><code>' + attributes.remark + '</code></p>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-4 no-padding">备注:</p><p class="col-xs-8 no-padding"><code>' + attributes.remark + '</code></p><hr/>'+
					'<div class="col-xs-12 no-padding"><p class="col-xs-8 no-padding"><code >更多</code></p>';
				}
				
				//点击事件
				graphicsLayer.on("click",function(evt){
					var Wrdkid = evt.graphic.attributes.Wrdkid;
					var json = {ID:Wrdkid};
					ajaxPost("/seimp/pic/getWrdkDataDetail.do", json).done(function(result){
						if(result.status==0){
							if(result.data.length>0){
								var data = result.data[0];
								isSelect=1;
								updateMapTable(data)
							}
						}
					});
				})
				
				//鼠标移上去，显示企业名称
				/*graphicsLayer.on("mouse-over",function(evt){
					map.graphics.clear();
					var offsetX = evt.graphic.attributes.enterpriseName.length*13.3/2;
					var font = new Font().setSize("12pt");
					var symbol = new TextSymbol(evt.graphic.attributes.enterpriseName,font)
									.setOffset(offsetX,20).setHaloColor(new Color([255, 255, 255])).setHaloSize(3);
					var graphic = new Graphic(evt.mapPoint,symbol);
					map.graphics.add(graphic);
				})*/
			}
		});//ajax end
	});//require end
	
}

//更新表格
function updateTable(){
	var columns =[{  
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
		},{
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

//更新悬浮窗表格
function updateMapTable(data){
	var headHtml = "<td>项目</td><td>信息</td>";
	var bodyHtml = "";
	bodyHtml+="<tr><td>编码</td><td>"+(data.WRDKBM!=null?data.WRDKBM:"")+"</td></tr>";
    bodyHtml+="<tr><td>省份</td><td>"+(data.provinceName!=null?data.provinceName:"")+"</td></tr>";
    bodyHtml+="<tr><td>市</td><td>"+(data.cityName!=null?data.cityName:"")+"</td></tr>";
    bodyHtml+="<tr><td>县</td><td>"+(data.countyName!=null?data.countyName:"")+"</td></tr>";
    bodyHtml+="<tr><td>地块名称</td><td>"+(data.WRDKMC!=null?data.WRDKMC:"")+"</td></tr>";
	bodyHtml+="<tr><td>是否污染</td><td>"+(data.POLLUTED!=null?data.POLLUTED:"")+"</td></tr>";
	bodyHtml+="<tr><td>所处阶段编码</td><td>"+(data.SCJDBM!=null?data.SCJDBM:"")+"</td></tr>";
	bodyHtml+="<tr><td>风险级别</td><td>"+(data.FXJB!=null?data.FXJB:"")+"</td></tr>";
    bodyHtml+="<tr><td>备注</td><td>"+(data.BZ!=null?data.BZ:"")+"</td></tr>";
	$("#tongjibiao thead tr").html(headHtml);
	$("#tongjibiao tbody").html(bodyHtml);
}
/*************悬浮窗******************/
$(function(){
	/**********右上角按钮****/
	$("#country").click(function(){
		updateCountry(true);
		//点击全国按钮的时候，隐藏省、市
		$("#province").addClass("none");
		$("#city").addClass("none");
	})
	$("#province").click(function(){
		updateProvince(false);
		//点击省份按钮的时候，隐藏市
		$("#city").addClass("none");
	})
	$("#city").click(function(){
		updateCity(false);
	})
	
	
	//生成地图下方的行业选择按钮
	createInsutryClick();
	//生成行业定制框中的内容
	
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
	$(".main_table div.tabtop_rt").click(function(){
		$(".main_table").hide();
	})
	//关闭统计图
	$(".main_graphic div.tabtop_rt").click(function(){
		$(".main_graphic").hide();
	})
})

/**********行业定制********/
//行业定制弹出框显示
function qiYeCheckBoxShow(){
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
}

//行业定制弹出框确定按钮收集数据，并重新生成行业选择
function shouJiShuJu(){
	if($("#myModal input:checkbox:checked").length>8){
		toastr.warning("行业定制数量不能超过8个");
		return;
	}
	qiYeIndustryArr = [];
	//弹出框收集选中
	$.each($("#myModal input:checkbox:checked"),function(index,obj){
		var liSelectedData = {
				id:$(obj).val(),
				name:$(obj).attr("industry")
		}
		qiYeIndustryArr.push(liSelectedData);
	})
	
	createInsutryClick();
	$("#myModal").modal('hide');
}

//生成地图下方的行业筛选列表
function createInsutryClick(){
	//重新更新下方的企业类别选择条
	var html ="<li class='lt metal' value='' onclick=switchIndustry('',$(this))>全部</li>";
	if(qiYeIndustryArr.length>0){
		for (var i = 0; i < qiYeIndustryArr.length; i++) {
			var currObj = qiYeIndustryArr[i];
			html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
		}
	}
	$("#mapItem").html(html);
    var box_width = $("#map").width()
    var lim_width = $(".map-item").width()
    var width_f = (box_width - lim_width)/2
    $(".map-item").css("margin-left",+width_f+"px");
}

//行业选择
function switchIndustry(switchIndustry,obj){
	//地图记录选择的行业
	mapIndustry = switchIndustry;
	$(obj).siblings().removeClass("metal");
	$(obj).addClass("metal");
	//将选择的行业参数回显到清单模式
//	$(".industry").val(searchParams.industry);
	//更新地图
	if(mapType=="1"){//全国模式
		updateCountry(true);
	}else if(mapType=="2"){//某一个省的所有市模式
		updateProvince(true);
	}else if(mapType=="3"){//某一个市的所有点位模式
		updateCity(true);
	}
	
//	updateMap();
	//更新表格
//	updateTable();
	
}

/**********回显地图模式的行业类型数据******/
function huiXianMapIndustry(){
	$.each($(".map-item li"),function(i,obj){
		$(obj).removeClass("metal");
	});
	$(".map-item li[value='"+searchParams.industry+"']").addClass("metal");
}

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

$(document).ready(function(){
    var $div = $("div#tongjituDiv");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown",function(event){
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
        $div.css({
          top:now_y,
          left:now_x
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
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
        var now_x = (offset_x + _x +350 ) + "px";
        var now_y = (offset_y + _y +200) + "px";
        /* 改变目标元素的位置 */
        $div2.css({
          top:now_y,
          left:now_x,
          
        });
      });
    });
    /* 当鼠标左键松开，接触事件绑定 */
    $(document).bind("mouseup",function(){
      $(this).unbind("mousemove");
    });
})



var buttontypes=1;

function buttontype(id){
//	$(".province2").val("");
//	$(".city2").val("");
	buttontypes=id;
	
	graph();
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
				graph();
	}
	);
	
	$(".city2").change(function(){
		var pro=$(".province2").val();
		var city=$(".city2").val();
		if(pro==""){
			$(".province2").val(city.substr(0, 2)+"0000");	
		}
		
		graph();
	})

	//图表
	function graph(){
		var p=$(".province2").val();
		var c=$(".city2").val();
console.log(c)
		var tit="";
		var danw="";
		var len="";
		if(buttontypes==1){
			tit="污染地块数量统计图";
			danw="(个)";
			len="污染地块数";
		}else if(buttontypes==2){
			tit="污染地块面积统计图";
			danw="(平方米)";
			len="污染地块面积";
		}
		ajaxPost("/seimp/pic/getWrdkTBData", {province:p,city:c,type:buttontypes}).done(function (data) {
			var arr = new Array();
			var arr2 = new Array();
			var arr3 =new Array();
			var arrcode=new Array();
			if (data.status == 0) {
	            for (var i = 0; i < data.data.length; i++) {
	            	var item = data.data[i];
	            	//去除空值
	            	if(item.name!=undefined){
	            	arr.push(item.name);
	            	arrcode.push(item.code);
	            	if(buttontypes==1){
	            		arr2.push(item.count);
	            	}else{
	            		arr2.push(item.sum);
	            		arr3.push({value:item.sum,name:item.name});
	            	}
	            	}
	            }

		var myChart = echarts.init(document.getElementById('graphs'));
		
		myChart.clear();
		//1为地块数量2为地块面积，不同统计图表
		if(buttontypes==1){
		option = {
 			    title : {
		        text:tit,
		        left:'center'
// //			        subtext: '纯属虚构'
			    },
			    tooltip : {
			        trigger: 'axis'
			    },
//			    legend: {
//			        data:['污染地块']
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
			        	name:'(省/市)',
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
			        	name:danw,
			            type : 'value'
			        }
			    ],
			    series : [
			        {
			            name:len,
			            type:'bar',
			            data:arr2,
			            barMaxWidth:100,
			            rawdate:arrcode
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
		}else{
			option = {
				    title : {
				        text: tit,
//				        subtext: '纯属虚构',
				        x:'center'
				    },
				    tooltip : {
				        trigger: 'item',
				        formatter: "{a} <br/>{b} : {c} ({d}%)"
				    },
				    legend: {
				        orient: 'vertical',
				        left: 'left',
				        top:'bottom',
				        data:arr
				    },
				    toolbox: {
				        show : true,
				        feature : {
				            mark : {show: true},
				          
				            saveAsImage : {show: true}
				        }
				    },
				    series : [
				        {
				            name: len,
				            type: 'pie',
				            radius : '55%',
				            center: ['50%', '60%'],
				            data:arr3,
				            itemStyle: {
				                emphasis: {
				                    shadowBlur: 10,
				                    shadowOffsetX: 0,
				                    shadowColor: 'rgba(0, 0, 0, 0.5)'
				                }
				            }
				        }
				    ]
				};
				                    
		}

		
			myChart.off('click');
		//柱状图图柱点击事件
		myChart.on('click',function (params) {
			//获取传递的code参数
			  var cloudid;
	            var mes = '【' + params.type + '】';
	            if (typeof params.seriesIndex != 'undefined') {
	                mes += '  seriesIndex : ' + params.seriesIndex;
	                mes += '  dataIndex : ' + params.dataIndex;
	                //alert(option.series[param.dataIndex].rawdate);
	                cloudid = option.series[params.seriesIndex].rawdate[params.dataIndex];
	              
	            }
			console.log(params);
			console.log(cloudid+"1");
			var name=params.name;      
			
			//判断code级别，省或者市，并修改相应的下拉框，随后执行查询函数
		           if(cloudid.substring(cloudid.length-4,cloudid.length)=="0000"){
		        	   
		        	   $(".province2").val(cloudid);
		        	   graph();
		        	   
		           }else if(cloudid.substring(cloudid.length-2,cloudid.length)=="00"&&cloudid.substring(cloudid.length-4,cloudid.length)!="0000"){
		        	   $(".city2").val(cloudid);
		        	   graph();
		           }
		    // 控制台打印数据的名称
		    console.log(params.name);
		});	
		
			 myChart.setOption(option);
	
			 
	        }
	    });
}
	
	
	$('.two_input input').click(function () {
	    $('.two_input input').removeClass('btn-danger').addClass('btn-default')
	    $(this).removeClass('btn-default').addClass('btn-danger')
	})

	
//表格数据
function  fikuaiTable(data){
	if ( data != 0 ) {
		isSelect =1;
		console.log()
		if (data.length>0){
			var headHtml = "<thead> <tr><td>序号</td><td>地区</td><td>污染地块数量(块)</td></tr></thead><tbody>";
			$.each(data,function(i,item){
				headHtml += '<tr><td>'+(i+1)+'</td><td>'+item.name+'</td><td>'+item.count+'</td></tr>'
			})
		}
		headHtml += '</tbody>';
		$("#tongjibiao").html(headHtml);
	} else {
		isSelect = 0;
	}
}
