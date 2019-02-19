dong.shengCode = "";
dong.shiCode = "";
dong.xianCode = "";
dong.shengName = "";
dong.shiName= "";
dong.xianName = "";
dong.scjd ="";
dong.dkbm = "";
//dong.shengExtent="";//省边界
//dong.shiExtent="";//市边界
//dong.shengClick = "";//省边界高亮
//dong.shiClick="";//市边界高亮
dong.level=0;//0全国，1、省2、市3、县
dong.num = 0;
//专题-总方法开始
function wrdkXzqh(num,isBack){//1、污染地块 2、遥感核查3、尾矿库4、淘汰落后产能企业
    dengdai();//提示框
    console.log(num)
    dong.num =num;
    if (!isBack) {
    	qingZhuanti();
    }
    removeGraphic("provinceHigh1");
    removeGraphic("provinceHigh2");
    if (storage.userLevel == "2") { // 省级用户
    	dong.shengCode = storage.regionCode;
    	$("#fanhuiAll").hide(); // 隐藏返回全国
    	if (dong.num == 2) { // 重点遥感
    		$("#provice1").val(dong.shengCode);
    		getCity1();
    		$('#provice1').attr("disabled", true);
    	} else {
    		$("#provice").val(dong.shengCode); // 给下拉框省赋值
    		getCity();
    		$('#provice').attr("disabled", true);
    	}
    	show_shi();
    	chaxunDingwei_zhuantitu(storage.regionCode,"","")// 定位到市
    } else { // 全国用户
    	// 根据查询条件判断加载图层
    	// 省市县都为空 加载省
    	var xianCode = $("#county").val() || $("#county1").val();
    	var shiCode = $("#city").val() || $("#city1").val();
    	var shengCode = $("#provice").val() || $("#provice1").val();
    	chaxunDingwei_zhuantitu(shengCode,shiCode,xianCode);
    	if( xianCode == "" ) {
            if ( shiCode == "" ) { // 省图层
            	if (shengCode == "") {
            		addLayerSheng(); 
            	} else {
            		show_shi();
            	}
            } else { // 市图层
            	show_xian();
            }
        } else { // 展示县图层
           addLayerXian();
           removeDengdai();
        }
    } 
}
/**
 * 添加省图层
 */
function addLayerSheng() {
	showShengLayer();
	shengLayerUpdataEnd();
}

/**
 * 显示省图层
 */
function showShengLayer () {
	var layerSheng = app.map.getLayer("sheng");
    if (layerSheng) {
    	app.map.removeLayer(layerSheng);
    }
    app.sheng = new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
        mode: dong.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        opacity:1,
        id:"sheng"
    });
    app.map.addLayer(app.sheng);
    var statesLabel = new dong.TextSymbol().setColor(new dong.Color("#0a162c"));
    statesLabel.font.setSize("12pt");
    statesLabel.font.setWeight(700);
    var labelClass = new dong.LabelClass({
        "labelExpressionInfo": {"value": "{NAME}"},
        "useCodedValues": true,
        "labelPlacement": "below-right",
        "fieldInfos": [{fieldName: "NAME"}]
    });
    labelClass.symbol = statesLabel;
    var outlineSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([0,0,0,0.5]),0.5);
    var defaultSymbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new dong.Color([0,0,0,0]));
    renderer = new dong.SimpleRenderer(defaultSymbol);
    app.sheng.setRenderer(renderer);
    dong.tucengType = "sheng";
    app.sheng.on("click", function (evt) {
    	removeTc("sheng"); // 省图层点击一次后移除
    	 if (isAttributeQuery()) { // 判断是否是属性查询
         	return;
         }
    	//设置地图边界
    	dong.chaxun = false;
        if (dong.level == "1" || dong.level == "2" || dong.level == "3") return;
        if ( dong.num == "5" ) return;
        //高亮设置
        removeGraphic("provinceHigh1");
        removeGraphic("provinceHigh2");
        var elementShi = document.getElementById('fanhuiShi'); // 获取返回市的元素
        var shi_style = elementShi.style.display;
        if (shi_style != "none") { // 返回市按钮显示
        	fanhuiSheng();
        } else {
        	var lineJson = {
                    "paths": evt.graphic.geometry.rings,
                    "spatialReference": {"wkid": 102100}
                }
                var highPolyline = new dong.Polyline(lineJson);
                var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([252, 78, 42]), 4);
                var highGraphic = new dong.Graphic(highPolyline, highSymbol, {type: "provinceHigh1"});
                app.map.graphics.add(highGraphic);

                // dong.shengClick = highGraphic;
                //获取点击省份的PROV_CODE
                dong.level = 1;
                console.log(evt);
                dong.shengCode = evt.graphic.attributes.PROV_CODE;
                dong.shengName = evt.graphic.attributes.NAME;
                $("#tongjituDiv thead").html("");
                $("#tongjituDiv tbody").html("");
                $("#fanhuiSheng").show();
                $("#fanhuiSheng").val(evt.graphic.attributes.PROV_CODE+"-"+evt.graphic.geometry.x+","+evt.graphic.geometry.y)
                $("#fanhuiSheng").html('<i class="iconfont icon-return"></i>'+evt.graphic.attributes.NAME)
                //dong.shengExtent=evt.graphic.geometry.getExtent();
                if (dong.num != 2) {
                	$("#provice").val(dong.shengCode);
                	getCity(); // 获取市下拉框
                } else {
                	$("#provice1").val(dong.shengCode);
                	getCity1();
                }
                show_shi(evt);
                app.map.setExtent(evt.graphic.geometry.getExtent());
        }
    });
    //添加鼠标进入事件
    app.sheng.on("mouse-over", function (evt) {
        if (isAttributeQuery()) { // 判断是否是属性查询
        	return;
        }
        //设置地图边界
        if(dong.ztorfb=="分布图") return;
        if ( dong.num == "5" ) return;
        removeGraphic("provinceHigh");
        var lineJson = {
            "paths": evt.graphic.geometry.rings,
            "spatialReference": {"wkid": 102100}
        }
        var highPolyline = new dong.Polyline(lineJson);
        var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([255, 106, 106]),1);
        var highGraphic = new dong.Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
        app.map.graphics.add(highGraphic);
    })
    //添加鼠标移出事件
    app.sheng.on("mouse-out", function () {
        if(dong.ztorfb=="分布图") return;
        if ( dong.num == "5" ) return;
        removeGraphic("provinceHigh");
    })
}

/**
 * 省图层加载完毕
 */
function shengLayerUpdataEnd() {
	app.sheng.on("update-end",zhuantiCount);
}

//市图层显示
function show_shi(){
	addLayerShi();
	shiLayerUpdateEnd();
}
/**
 * 市级图层加载完毕事件
 */
function shiLayerUpdateEnd() {
	app.shi.on("update-end",zhuantiCount);
}

//县的图层
function show_xian(evt){
	addLayerXian();
	xianLayerUpdateEnd();
}

function xianLayerUpdateEnd(){
	app.xian.on("update-end",zhuantiCount);
}

/**
 * 省的数字
 * @param data 数据库查询数据
 */
function shengShu(data){
	if ( storage.userLevel != "2" ){
		app.map.setExtent(new dong.Extent(extentPar));
	}
	removeTc("xian");
	$("#fanhuiSheng").hide();
	$("#fanhuiShi").hide();
    if ( dong.num != "5"){
        if ( storage.userLevel == "2" ){
            ajaxPost("/seimp/yizhangtu/cityLonLat", {code:storage.regionCode}).done(function (result){
                if(result.status == "0" ) {
                    $("#fanhuiSheng").show();
                    $("#fanhuiSheng").val(storage.regionCode+"-"+result.data[0].lon+","+result.data[0].lat)
                    $("#fanhuiSheng").html('<i class="iconfont icon-return"></i>'+result.data[0].name)
                }
            })
            //removeGraphic("provinceHigh1");
            dong.shengCode = storage.regionCode;
            //chaxunDingwei(storage.regionCode,"","")
            show_shi();
            return shiShu(data);
        }
    }
    removeTc("countLayer");
    var graphicsLayer = new dong.GraphicsLayer({id:"countLayer"});
    app.map.addLayer(graphicsLayer,1);
    // TODO 已经移除省图层
    var feaGraphics = [];
	showShengLayer();
	app.sheng.on("update-end",function(e){
		feaGraphics = app.map.getLayer("sheng").graphics;
    	addShengDataToMap(feaGraphics,data)
	});
    app.map.getLayer("countLayer").on("click",function(evt){
        if ( dong.num == "5" ) return;
        //高亮设置
        removeGraphic("provinceHigh1");
        dataHeight(1,evt.graphic.attributes.code)
        //获取点击省份的PROV_CODE
        dong.level = 1;
        dong.shengCode = evt.graphic.attributes.code;
        dong.shengName = evt.graphic.attributes.name;
        if (dong.num == "2"){
        	$("#provice1").val(dong.shengCode);
        	getCity1();
        } else {
        	$("#provice").val(dong.shengCode);
        	getCity(); // 获取市下拉框
        }
        $("#tongjituDiv thead").html("");
        $("#tongjituDiv tbody").html("");
        $("#fanhuiSheng").show();
        $("#fanhuiSheng").val(evt.graphic.attributes.code+"-"+evt.graphic.geometry.x+","+evt.graphic.geometry.y)
        $("#fanhuiSheng").html('<i class="iconfont icon-return"></i>'+evt.graphic.attributes.name)
        // 高亮定位
         chaxunDingwei_zhuantitu(dong.shengCode);
        //设置地图边界
        show_shi(evt);
    })
}
/**
 * 添加省数据到地图上
 */
function addShengDataToMap(feaGraphics,data) {
	for (var i = 0; i < feaGraphics.length; i++) {
        var currFeaGraphic = feaGraphics[i];
        //遍历数据
        for (var j = 0; j < data.length; j++) {
            var currItem = data[j];
            //判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
            if (currFeaGraphic.attributes.PROV_CODE == currItem.code) {
                var attributes = {
                    provoinceCode: currItem.code,
                    provinceName: currItem.name
                }
                var point = currFeaGraphic.geometry.getCentroid();
                //处理河北省
                if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                    point = new dong.Point([115.18, 38]);
                }
                var symbolSize = 24;
				if(currItem.COUNT.toString().length==1){
					symbolSize = 24;
				}else if(currItem.COUNT.toString().length==2){
					symbolSize = 30;
				}else if(currItem.COUNT.toString().length==3){
					symbolSize = 40;
				}else if(currItem.COUNT.toString().length==4){
					symbolSize = 50;
				}else if(currItem.COUNT.toString().length==5){
					symbolSize = 60;
				}else{
					symbolSize = currItem.COUNT.toString().length*12;
				}
                var img = "img/information/number.png";
                if( dong.num == "11" || dong.num == "1") {
                    img = "img/information/chang.png";
                    var symbolSize = 34;
                    if (currItem.COUNT.toString().length == 1) {
                        symbolSize = 44;
                    } else if (currItem.COUNT.toString().length == 2) {
                        symbolSize = 50;
                    } else if (currItem.COUNT.toString().length == 3) {
                        symbolSize = 60;
                    } else if (currItem.COUNT.toString().length == 4) {
                        symbolSize = 70;
                    } else if (currItem.COUNT.toString().length == 5) {
                        symbolSize = 80;
                    } else {
                        symbolSize = currItem.COUNT.toString().length * 12;
                    }
                }
                var symbol1 = new dong.PictureMarkerSymbol(img, symbolSize, symbolSize).setOffset(0, symbolSize / 2);
                var symbol2 = new dong.TextSymbol(currItem.COUNT).setOffset(0, symbolSize / 2 - 5).setColor(new dong.Color([255, 255, 255, 1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
                symbol2.font.setFamily("Times");
                symbol2.font.setSize("12pt");
                symbol2.font.setWeight(600);
                var graphic1 = new dong.Graphic(point, symbol1, attributes);
                var graphic2 = new dong.Graphic(point, symbol2, attributes);
                graphic1.setAttributes( {lon:currItem.lon,lat:currItem.lat,name:currItem.name,code:currItem.code,level:"6"});
                graphic2.setAttributes( {lon:currItem.lon,lat:currItem.lat,name:currItem.name,code:currItem.code,level:"6"});
                app.map.getLayer("countLayer").add(graphic1);
                app.map.getLayer("countLayer").add(graphic2);
            }
        }
    }
}

//市的数字
function shiShu(data){
    removeTc("countLayer");
    removeTc("diangraphicsLayer");
    var graphicsLayer = new dong.GraphicsLayer({id:"countLayer"});
    app.map.addLayer(graphicsLayer);
    var shiLayer = app.map.getLayer("shi");
    if (shiLayer) {
    	var feaGraphics = app.map.getLayer("shi").graphics;
    	addGraphicsToMap(data,feaGraphics);
    } else {
    	app.shi = new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
            mode: dong.FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            id: "shi"
        });
    	app.shi.setDefinitionExpression("KIND_1 like '" + (dong.shiCode+ "").substr(0, 2) + "%'");
    	app.map.addLayer(app.shi);
    	var outlineSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([0,0,0,0.5]),0.5);
        var defaultSymbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new dong.Color([0,0,0,0]));
    	var renderer = new dong.SimpleRenderer(defaultSymbol);
        app.shi.setRenderer(renderer);
    	app.shi.on("update-end",function(e){
        	var feaGraphics = app.map.getLayer("shi").graphics;
        	addGraphicsToMap(data,feaGraphics);
        });
    }
    //console.log(feaGraphics);
    app.map.getLayer("countLayer").on("click",function(evt){
        console.log(evt);
        //高亮设置
        removeGraphic("provinceHigh1");
        // var lineJson = {
        //     "spatialReference": {"wkid": 102100}
        // }
        // var highPolyline = new dong.Polyline(lineJson);
        // var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([255, 0, 51]), 2);
        // var highGraphic = new dong.Graphic(highPolyline, highSymbol, {type: "provinceHigh1"});
        // //记录边界高亮
        // dong.shiClick=highGraphic;
        // app.map.graphics.add(highGraphic);
        dataHeight(2,evt.graphic.attributes.code)
        //获取点击省份的PROV_CODE
        dong.level = 2;
        dong.shiCode = evt.graphic.attributes.code;
        dong.shiName = evt.graphic.attributes.name;
        if (dong.num != 2) {
        	$("#city").val(dong.shiCode);
        	getCounty(); // 获取县下拉框
        } else {
        	$("#city1").val(dong.shiCode);
        	getCounty1();
        }
        $("#tongjituDiv thead").html("");
        $("#tongjituDiv tbody").html("");
        $("#fanhuiShi").show();
        $("#fanhuiShi").val(evt.graphic.attributes.code+"-"+evt.graphic.geometry.x+","+evt.graphic.geometry.y);
        $("#fanhuiShi").html('<i class="iconfont icon-return"></i>'+evt.graphic.attributes.name);
        // dong.shiExtent=evt.graphic.geometry.getExtent();
        var centerPoint = new dong.Point(evt.graphic.geometry.x,evt.graphic.geometry.y,new dong.SpatialReference({ wkid:102100 }));
        app.map.centerAndZoom(centerPoint,8);
        show_xian(evt);
    })
   
}
/**
 * 将graphics添加到地图上
 * @param data
 * @param feaGraphics
 */
function addGraphicsToMap(data,feaGraphics) {

    for (var i = 0; i < feaGraphics.length; i++) {
        var currFeaGraphic = feaGraphics[i];
        //遍历数据
        for (var j = 0; j < data.length; j++) {
            var currItem = data[j];
            //判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
            if (currItem.code!="" && currItem.code != undefined && currItem.code!=null){
                if (currFeaGraphic.attributes.KIND_1 == currItem.code.substr(0, 4) || currFeaGraphic.attributes.CODE == currItem.code)
                {
                    var attributes = {
                        provoinceCode: currItem.code,
                        provinceName: currItem.name
                    }
                    var point = currFeaGraphic.geometry.getCentroid();
                    var symbolSize = 30;
                    if (currItem.COUNT.toString().length == 1) {
                        symbolSize = 40;
                    } else if (currItem.COUNT.toString().length == 2) {
                        symbolSize = 50;
                    } else if (currItem.COUNT.toString().length == 3) {
                        symbolSize = 60;
                    } else if (currItem.COUNT.toString().length == 4) {
                        symbolSize = 70;
                    } else if (currItem.COUNT.toString().length == 5) {
                        symbolSize = 80;
                    } else {
                        symbolSize = currItem.COUNT.toString().length * 12;
                    }
                    var img = "img/information/number.png";
                    if( dong.num == "11" || dong.num == "1") {
                        img = "img/information/chang.png";
                    }

                    var symbol1 = new dong.PictureMarkerSymbol(img, symbolSize, symbolSize).setOffset(0, 0);
                    var symbol2 = new dong.TextSymbol(currItem.COUNT).setOffset(0, -3).setColor(new dong.Color([255, 255, 255, 1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
                    symbol2.font.setFamily("Times");
                    symbol2.font.setSize("10pt");
                    symbol2.font.setWeight(600);
                    var graphic1 = new dong.Graphic(point, symbol1, attributes);
                    var graphic2 = new dong.Graphic(point, symbol2, attributes);
                    graphic1.setAttributes( {lon:currItem.lon,lat:currItem.lat,name:currItem.name,code:currItem.code,level:"8"});
                    graphic2.setAttributes( {lon:currItem.lon,lat:currItem.lat,name:currItem.name,code:currItem.code,level:"8"});
                    app.map.getLayer("countLayer").add(graphic1);
                    app.map.getLayer("countLayer").add(graphic2);
                }
            }

        }
    }
}
//县的数字
function xianShu(data){
    console.log(data);
    removeTc("countLayer");
    var graphicsLayer = new dong.GraphicsLayer({id:"countLayer"});
    app.map.addLayer(graphicsLayer);
    console.log(feaGraphics);
    app.map.getLayer("countLayer").on("click",function(evt){
        console.log(evt)
        $("#tongjituDiv thead").html("");
        $("#tongjituDiv tbody").html("");
        dong.xianCode = evt.graphic.attributes.code;
        dong.xianName = evt.graphic.attributes.name;

        dong.level = 3;
        console.log(dong.num)
        if (dong.num == "1" || dong.num == "11" ){
            dianMessage(evt.graphic.attributes.code)
        } else if (dong.num == "2" ){
            yaoganMessage(evt.graphic.attributes.code)
        } else if(dong.num == "3"){
            lwwkkMessage(evt.graphic.attributes.name);
        } else if(dong.num == "4"){
            luohouMeaasage(evt.graphic.attributes.name);
        } else if (dong.num == "6"){
            pwxk_zhuantiMessage(evt.graphic.attributes.code);
        } else if( dong.num == "7"){
            zuzhijigou_zhuantiMessage(evt.graphic.attributes.code);
        } else if ( dong.num == "8"){
            zhongdian_zhuantiMessage(evt.graphic.attributes.code);
        }
    })
    
    var xianLayer = app.map.getLayer("xian");
    if (xianLayer) {
    	var feaGraphics = app.map.getLayer("xian").graphics;
    	addGraphicsToMap(data,feaGraphics);
    } else {
    	/*app.xian = new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0", {
            mode: dong.FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            id: "xian"
        });
        app.xian.setDefinitionExpression("CODE  like '" +(dong.xianCode+"").substr(0,4)+ "%'");
        app.map.addLayer(app.xian);
    	var outlineSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([0,0,0,0.5]),0.5);
        var defaultSymbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new dong.Color([0,0,0,0]));
    	var renderer = new dong.SimpleRenderer(defaultSymbol);
        app.xian.setRenderer(renderer);
    	app.xian.on("update-end",function(e){
        	var feaGraphics = app.map.getLayer("xian").graphics;
        	addGraphicsToMap(data,feaGraphics);
        });*/
    	addLayerXian();
    	app.xian.on("update-end",function(e){
        	var feaGraphics = app.map.getLayer("xian").graphics;
        	addGraphicsToMap(data,feaGraphics);
        });
    }
}
/**
 * 县数据描述
 * @param numberOfPicturesAbove 已上图数量
 */
function countyDataDescribe (numberOfPicturesAbove) {
	$("#wrdk_detail").html("");
	var detail = "";
	if (dong.num == "6") { // 排污许可数据
		detail = "根据上报排污许可数据确认<strong>"+dong.xianName+"</strong>排污许可企业已上图<strong>" + numberOfPicturesAbove + "</strong>个。";
	} else if (dong.num == "1") {
		detail = "根据上报地块数据确认<strong>"+dong.xianName+"</strong>污染地块已上图<strong>" + numberOfPicturesAbove + "</strong>块。"; 
	} else if (dong.num == "11") { // 疑似污染地块
		detail = "<strong>"+dong.xianName+"</strong>当前疑似污染地块已上图<strong>" + numberOfPicturesAbove + "</strong>块。"; 
	} else if (dong.num == "3") {
			detail = "根据上报尾矿库（绿网）数据确认<strong>"+dong.xianName+"</strong>排污许可企业已上图<strong>" + numberOfPicturesAbove + "</strong>个。";
	} else if (dong.num == "2") {
			detail = "根据上报重点监管企业遥感核查数据确认<strong>"+dong.xianName+"</strong>重点监管企业遥感核查企业已上图共计<strong>" + numberOfPicturesAbove + "</strong>个。";
	} else if (dong.num == "4") {
			detail = "根据上报淘汰落后产能企业数据确认<strong>"+dong.xianName+"</strong>淘汰落后产能企业已上图共计<strong>" + numberOfPicturesAbove + "</strong>个。";
	} else if (dong.num == "7") {
			detail = "根据上报工商企业登记信息确认<strong>"+dong.xianName+"</strong>工商企业登记信息上图共计<strong>" + numberOfPicturesAbove + "</strong>个。";
	} else if (dong.num == "8") {
			detail = "根据上报重点行业监管企业数据确认<strong>"+dong.xianName+"</strong>工商企业登记信息上图共计<strong>" + numberOfPicturesAbove + "</strong>个。";
	} else if (dong.num == "5") {
			detail = "根据上报建设项目环评数据确认<strong>"+dong.xianName+"</strong>工商企业登记信息上图共计<strong>" + numberOfPicturesAbove + "</strong>个。";
	}
	$("#wrdk_detail").html(detail);
}

/**
 * 显示县数据详情
 */
function showCountyDetail (data,str,url) {
	var strButton =  "<img src='./img/backToPre.png' onclick = 'fanhuiShi()' style='position: relative;left: 93px;;cursor:pointer' title='返回上一级'/>";
	var headHtml = "";
	var bodyHtml = '';
	if (wrdk_bar != null && wrdk_bar != "" && wrdk_bar != undefined) {
		wrdk_bar.dispose();
	}
	$("#countryDetail").show(); // 显示县表格数据
	$("#wrdk_bar").hide(); // 隐藏柱状图
	countyDataDescribe(data.length);
	$(".wrdk_barTip").empty();
	if ( str == "dian" ) {
        // 污染地块信息
		 $(".wrdk_barTip").append("<p>污染地块信息</p>"+strButton);
	        headHtml = "<tr><td style='width:40px'>序号</td><td>地块名称</td></tr>";
	        var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"}
	        $.each(data,function(i,item){
	            var WRDKMC ="";
	            WRDKMC = item.WRDKMC;
	            if ( item.WRDKMC.length > 12 ) WRDKMC = item.WRDKMC.substr(0,12)+"..."
	            // S0: 疑似地块 S1:初步调查 S2: 详细调查 S3: 风险评估 S4:风险管控 S5: 土壤修复与治理 S6: 土壤修复与治理评估
	            bodyHtml += "<tr id='"+item.WRDKBM+"' ondblclick='ondbclickDingwei("+item.WRDKZXJD+","+item.WRDKZXWD+")'><td style='display:none;'>"+handle_x(item.WRDKZXJD)+","+handle_y(item.WRDKZXWD)+"</td><td>"+(i+1)+"</td><td title='"+item.WRDKMC+"'>"+WRDKMC+"</td></tr>";
	        })
    } else if (str == "dianZuzhijigou"){
        // 组织机构代码
    	$(".wrdk_barTip").append("<p>组织机构代码</p>"+strButton);
        headHtml = "<tr><td style='width:40px'>序号</td><td>机构名称</td></tr>";
        $.each(data,function(i,item){
        	var JGMC0 ="";
        	JGMC0 = item.JGMC0;
            if ( item.JGMC0.length > 12 ) JGMC0 = item.JGMC0.substr(0,12)+"..."
            if ( item.JGLX == undefined || item.JGLX==null) item.JGLX = "";
            bodyHtml += "<tr id='zuzhi"+item.TYDM0+"' ondblclick='ondbclickDingwei("+item.LON+","+item.LAT+")'><td style='display:none;'>"+handle_x(item.LON)+","+handle_y(item.LAT)+"</td><td>"+(i+1)+"</td><td title='"+item.JGMC0+"'>"+JGMC0+"</td></tr>";
        })
    }else if(str == "dianZhondian"){
        // 重点行业监管企业
    	$(".wrdk_barTip").append("<p>重点行业监管企业</p>"+strButton);
        headHtml = "<tr><td style='width:40px'>序号</td><td>企业名称</td></tr>";
        $.each(data,function(i,item){
            if (item.enterpriseName == undefined || item.enterpriseName == null) item.enterpriseName = "";
            if(item.unifiedSocialCreditIdentifier == undefined || item.unifiedSocialCreditIdentifier == null ) item.unifiedSocialCreditIdentifier ="";
            if(item.organizingInstitutionBarCode == undefined || item.organizingInstitutionBarCode == null ) item.organizingInstitutionBarCode = "";
            if(item.industry == undefined || item.industry == null ) item.industry = "";
            var enterpriseName ="";
            enterpriseName = item.enterpriseName
            if ( item.enterpriseName.length > 12 ) enterpriseName = item.enterpriseName.substr(0,12)+"..."
            bodyHtml += "<tr id='zhongdian"+item.id+"' ondblclick='ondbclickDingwei("+item.longitude+","+item.latitude+")'><td style='display:none;'>"+handle_x(item.longitude)+","+handle_y(item.latitude)+"</td><td>"+(i+1)+"</td><td title='"+item.enterpriseName+"'>"+enterpriseName+"</td></tr>";
        })
    } else if (str == "dianPwxk"){
        // 排污许可数据
		$(".wrdk_barTip").append("<p>排污许可数据</p>"+strButton);
	    headHtml = "<tr><td style='width:40px'>序号</td><td>单位名称</td></tr>";
	     $.each(data,function(i,item){
	         if (item.OPERATIME == undefined ) item.OPERATIME = "";
	         var DEVCOMPANY ="";
	         DEVCOMPANY = item.DEVCOMPANY
             if ( item.DEVCOMPANY.length > 12 ) DEVCOMPANY = item.DEVCOMPANY.substr(0,12)+"..."
	         bodyHtml += "<tr id='"+item.ENTERID+"' ondblclick='ondbclickDingwei("+item.LONGITUDE+","+item.LATITUDE+")'><td style='display:none;'>"+handle_x(item.LONGITUDE)+","+handle_y(item.LATITUDE)+"</td><td>"+(i+1)+"</td><td title='"+item.DEVCOMPANY+"'>"+DEVCOMPANY+"</td></tr>";
	     })
    } else if (str == "str1"){
    } else if (str == "str2"){
        // 尾矿库(绿网)
    }else if (str=="luohou"){
       // 淘汰落后产能企业
    } else if(str=="zuzhijigou"){
        // 组织机构代码
    } else if (str == "dian2"){
       // 重点行业遥感核查
    	$(".wrdk_barTip").append("<p>重点行业遥感核查</p>"+strButton);
        headHtml = "<tr><td style='width:40px'>序号</td><td>污染企业名称</td></tr>";
        var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"}
        $.each(data,function(i,item){
            // S0: 疑似地块 S1:初步调查 S2: 详细调查 S3: 风险评估 S4:风险管控 S5: 土壤修复与治理 S6: 土壤修复与治理评估
        	var NAME ="";
        	NAME = item.NAME
            if ( item.NAME.length > 12 ) NAME = item.NAME.substr(0,12)+"..."
        	bodyHtml += "<tr id='"+item.OID+"' ondblclick='ondbclickDingwei("+item.LONGITUDE+","+item.LATITUDE+")'><td style='display:none;'>"+handle_x(item.LONGITUDE)+","+handle_y(item.LATITUDE)+"</td><td>"+(i+1)+"</td><td title='"+item.NAME+"'>"+NAME+"</td></tr>";
        })
    } else if (str == "dian3"){
        // 尾矿库(绿网)
    	 $(".wrdk_barTip").append("<p>尾矿库(绿网)</p>"+strButton);
         headHtml = "<tr><td>序号</td><td>尾矿库名称</td></tr>";
         $.each(data,function(i,item){
             var ENTERPRISENAME = "";
             if (item.TAILINGSNAME!=undefined){
            	 ENTERPRISENAME = item.TAILINGSNAME;
            	 if ( ENTERPRISENAME.length > 12 ) ENTERPRISENAME = ENTERPRISENAME.substr(0,12)+"..."
             } 
             var TAILINGSNAME = "";
             if (item.TAILINGSNAME != undefined) TAILINGSNAME = item.TAILINGSNAME;
             var MINERALTYPE = "";
             if(item.MINERALTYPE!=undefined) MINERALTYPE =item.MINERALTYPE;
             var lonlat = JSON.parse(item.COORDINATE);
             var x = lonlat["lng"];
             var y = lonlat["lat"];
             bodyHtml += "<tr id='"+item.ID+"' ondblclick='ondbclickDingwei("+x+","+y+")'><td style='display:none;'>"+handle_x(x)+","+handle_y(y)+"</td><td>"+(i+1)+"</td><td title='"+item.TAILINGSNAME+"'>"+ENTERPRISENAME+"</td></tr>";
         })
    } else if (str == "dian_luohou"){
        // 淘汰落后产能企业
    	$(".wrdk_barTip").append("<p>淘汰落后产能企业</p>"+strButton);
        headHtml = "<tr><td>序号</td><td>企业名称</td></tr>";
        $.each(data,function(i,item){
            if(item.CAPACITY == null || item.CAPACITY == undefined ) item.CAPACITY ="";
            var ENTERPRISE ="";
            ENTERPRISE = item.ENTERPRISE
            if ( item.ENTERPRISE.length > 12 ) ENTERPRISE = item.ENTERPRISE.substr(0,12)+"..."
            bodyHtml += "<tr id='"+item.ELID+"' ondblclick='ondbclickDingwei("+item.LON+","+item.LAT+")'><td style='display:none;'>"+handle_x(item.LON)+","+handle_y(item.LAT)+"</td><td>"+(i+1)+"</td><td title='"+item.ENTERPRISE+"'>"+ENTERPRISE+"</td></tr>";
        })
    }else if (str == "jianshe"){
        // 建设项目环评
    } else if (str == "paiwuxuke"){
       // 排污许可
    }else if(str == "zhongdian"){
        // 重点行业监管企业
    }else {
    	// 污染地块信息
    }
	$("#countryDetail thead").html(headHtml);
    $("#countryDetail tbody").html(bodyHtml);
    changBkColorCountyData(url);
}


//表格内容
function  xzqhTable(data,str,url){
    $("#tongjituDiv tbody").html("");
    if ( str == "dian" ) {
        $("#title").html("污染地块信息");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>地块名称</td><td>污染地块编码</td><td style='border-right:0'>所处阶段</td></tr>";
        var bodyHtml = '';
        var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"}

        $.each(data,function(i,item){
            var WRDKMC ="";
            if ( item.WRDKMC .length > 12 ) WRDKMC = item.WRDKMC.substr(0,12)+"..."
            // S0: 疑似地块 S1:初步调查 S2: 详细调查 S3: 风险评估 S4:风险管控 S5: 土壤修复与治理 S6: 土壤修复与治理评估
            bodyHtml += "<tr id='"+item.WRDKBM+"' ondblclick='ondbclickDingwei("+item.WRDKZXJD+","+item.WRDKZXWD+")'><td style='display:none;'>"+handle_x(item.WRDKZXJD)+","+handle_y(item.WRDKZXWD)+"</td><td>"+(i+1)+"</td><td title='"+item.WRDKMC+"'>"+WRDKMC+"</td><td>"+item.WRDKBM+"</td><td style='border-right:0'>"+SCJDBM[item.SCJDBM]+"</td></tr>";
        })

        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
        // ondbclickTable();
    } else if (str == "dianZuzhijigou"){
        $("#title").html("组织机构代码");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>机构名称</td><td>组织机构代码</td><td style='border-right:0'>机构类型</td></tr>";
        var bodyHtml = '';
        $.each(data,function(i,item){
            if ( item.JGLX == undefined || item.JGLX==null) item.JGLX = "";
            bodyHtml += "<tr id='zuzhi"+item.TYDM0+"' ondblclick='ondbclickDingwei("+item.LON+","+item.LAT+")'><td style='display:none;'>"+handle_x(item.LON)+","+handle_y(item.LAT)+"</td><td>"+(i+1)+"</td><td>"+item.JGMC0+"</td><td>"+item.JGDM0+"</td><td style='border-right:0'>"+item.JGLX+"</td></tr>";
        })
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
    }else if(str == "dianZhondian"){
        $("#title").html("重点行业监管企业");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>企业名称</td><td>统一社会信用代码</td><td >组织机构代码</td><td style='border-right:0'>行业</td></tr>";
        var bodyHtml = '';
        $.each(data,function(i,item){
            if (item.enterpriseName == undefined || item.enterpriseName == null) item.enterpriseName = "";
            if(item.unifiedSocialCreditIdentifier == undefined || item.unifiedSocialCreditIdentifier == null ) item.unifiedSocialCreditIdentifier ="";
            if(item.organizingInstitutionBarCode == undefined || item.organizingInstitutionBarCode == null ) item.organizingInstitutionBarCode = "";
            if(item.industry == undefined || item.industry == null ) item.industry = "";
            bodyHtml += "<tr id='zhongdian"+item.id+"' ondblclick='ondbclickDingwei("+item.longitude+","+item.latitude+")'><td style='display:none;'>"+handle_x(item.longitude)+","+handle_y(item.latitude)+"</td><td>"+(i+1)+"</td><td>"+item.enterpriseName+"</td>" +
                "<td>"+item.unifiedSocialCreditIdentifier+"</td><td >"+item.organizingInstitutionBarCode+"</td><td style='border-right:0'>"+item.industry+"</td></tr>";
        })
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
    } else if (str == "dianPwxk"){
        $("#title").html("排污许可数据");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>许可证书编号</td><td>单位名称</td><td style='border-right:0'>投产日期</td></tr>";
        var bodyHtml = '';
        $.each(data,function(i,item){
            if (item.OPERATIME == undefined ) item.OPERATIME = "";
            bodyHtml += "<tr id='"+item.ENTERID+"' ondblclick='ondbclickDingwei("+item.LONGITUDE+","+item.LATITUDE+")'><td style='display:none;'>"+handle_x(item.LONGITUDE)+","+handle_y(item.LATITUDE)+"</td><td>"+(i+1)+"</td><td>"+item.XKZNUM+"</td><td>"+item.DEVCOMPANY+"</td><td style='border-right:0'>"+item.OPERATIME+"</td></tr>";
        })
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
    } else if (str == "str1"){
        $("#title").html("重点行业遥感核查");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>地区</td><td style='border-right:0'>污染企业数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.CITY == undefined || item.CITY == "" || item.CITY==null){
                name = ""
            } else {
                name = item.CITY
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td style='border-right:0'>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
        bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    } else if (str == "str2"){
        $("#title").html("尾矿库(绿网)");
        var headHtml = "<tr><td>序号</td><td>地区</td><td>污染企业数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.name == undefined || item.name == null || item.name ==""){
                name = ""
            } else {
                name = item.name
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
        bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    }else if (str=="luohou"){
        $("#title").html("淘汰落后产能企业");
        var headHtml = "<tr><td>序号</td><td>地区</td><td>污染企业数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.name == undefined || item.name == null || item.name== null){
                name = ""
            } else {
                name = item.name
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
         bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    } else if(str=="zuzhijigou"){
        $("#title").html("组织机构代码");
        var headHtml = "<tr><td>序号</td><td>地区</td><td>组织机构数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.name == undefined || item.name == null || item.name == ""){
                name = ""
            } else {
                name = item.name
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
         bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    } else if (str == "dian2"){
        $("#title").html("重点行业遥感核查");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>污染企业名称</td><td>编号</td><td style='border-right:0'>行业类别</td></tr>";
        var bodyHtml = '';
        var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"}
        $.each(data,function(i,item){
            // S0: 疑似地块 S1:初步调查 S2: 详细调查 S3: 风险评估 S4:风险管控 S5: 土壤修复与治理 S6: 土壤修复与治理评估
            bodyHtml += "<tr id='"+item.OID+"' ondblclick='ondbclickDingwei("+item.LONGITUDE+","+item.LATITUDE+")'><td style='display:none;'>"+handle_x(item.LONGITUDE)+","+handle_y(item.LATITUDE)+"</td><td>"+(i+1)+"</td><td>"+item.NAME+"</td><td>"+item.BIANHAO+"</td><td style='border-right:0'>"+item.DALEI+"</td></tr>";
        })
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
    } else if (str == "dian3"){
        $("#title").html("尾矿库(绿网)");
        var headHtml = "<tr><td>序号</td><td>所属企业名称</td><td>尾矿库名称</td><td>矿物种类</td></tr>";
        var bodyHtml = '';
        $.each(data,function(i,item){
            var ENTERPRISENAME = "";
            if (item.ENTERPRISENAME!=undefined) ENTERPRISENAME = item.ENTERPRISENAME;
            var TAILINGSNAME = "";
            if (item.TAILINGSNAME != undefined) TAILINGSNAME = item.TAILINGSNAME;
            var MINERALTYPE = "";
            if(item.MINERALTYPE!=undefined) MINERALTYPE =item.MINERALTYPE;
            var lonlat = JSON.parse(item.COORDINATE);
            var x = lonlat["lng"];
            var y = lonlat["lat"];
            bodyHtml += "<tr id='"+item.ID+"' ondblclick='ondbclickDingwei("+x+","+y+")'><td style='display:none;'>"+handle_x(x)+","+handle_y(y)+"</td><td>"+(i+1)+"</td><td>"+ENTERPRISENAME+"</td><td>"+TAILINGSNAME+"</td><td>"+MINERALTYPE+"</td></tr>";

        })
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
    } else if (str == "dian_luohou"){
        $("#title").html("淘汰落后产能企业");
        var headHtml = "<tr><td>序号</td><td>企业名称</td><td>行业</td><td>产能</td><td>淘汰时间</td></tr>";
        var bodyHtml = '';
        $.each(data,function(i,item){
            if(item.CAPACITY == null || item.CAPACITY == undefined ) item.CAPACITY ="";
            bodyHtml += "<tr id='"+item.ELID+"' ondblclick='ondbclickDingwei("+item.LON+","+item.LAT+")'><td style='display:none;'>"+handle_x(item.LON)+","+handle_y(item.LAT)+"</td><td>"+(i+1)+"</td><td>"+item.ENTERPRISE+"</td><td>"+item.INDUSTRY+"</td><td>"+item.CAPACITY+"</td><td>"+item.ELIMINATION_TIME+"</td></tr>";
        })
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
        changBkColor(url);
    }else if (str == "jianshe"){
        $("#title").html("建设项目环评");
        var headHtml = "<tr><td>序号</td><td>地区</td><td>建设项目环评数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.name == undefined || item.name == null || item.name == ""){
                name = ""
            } else {
                name = item.name
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
         bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    } else if (str == "paiwuxuke"){
        $("#title").html("排污许可");
        var headHtml = "<tr><td>序号</td><td>地区</td><td>排污许可数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.name == undefined || item.name ==null || item.name=="" ){
                name = ""
            } else {
                name = item.name
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
        bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    }else if(str == "zhongdian"){
        $("#title").html("重点行业监管企业");
        var headHtml = "<tr><td>序号</td><td>地区</td><td>重点行业监管企业数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if (item.name == undefined || item.name==null || item.name == ""){
                name = ""
            } else {
                name = item.name
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
        bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    }else {
        $("#title").html("污染地块信息");
        var headHtml = "<tr><td style='width:40px'>序号</td><td>地区</td><td style='border-right: 0;'>污染地块数量</td></tr>";
        var bodyHtml = '';
        var sumCount = 0;
        $.each(data,function(i,item){
            var name = "";
            if ( item.name == undefined || item.name ==null || item.name=="") {
                name = "";
            } else {
                name = item.name;
                bodyHtml += "<tr><td>"+(i+1)+"</td><td>"+name+"</td><td style='border-right: 0;'>"+item.COUNT+"</td></tr>";
                sumCount += item.COUNT;
            }
        })
        bodyHtml += "<tr><td></td><td><strong>总数</strong></td><td><strong>"+sumCount+"</strong></td></tr>"; 
        $("#tongjituDiv thead").html(headHtml);
        $("#tongjituDiv tbody").html(bodyHtml);
    }

}
//模态窗口查询条件
dong.wrdktj="";
function  opernModal(num,evet){
    console.log($(evet));
    dong.measure = false;
    var flg = false;
    $.each($($(evet).parent())[0].childNodes,function(i,item){
        if($(item).context.nodeName == "INPUT"){
            if (!$($(evet).parent())[0].childNodes[i].checked) {
                flg = true;
               toastr.warning("请先选中该项")
            }
        }
    })
    if(flg) return ;
    //
    dong.wrdktj=num;
    if (num=="1"){
        $("#myModal #myModalLabel").html("污染地块条件查询")
        $(".scjd").show();
        $(".jianshe").hide();//建设项目环评
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".dkbm").show()
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(1)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if ( num == "11"){
        $("#myModal #myModalLabel").html("疑似污染地块条件查询")
        $(".scjd").hide();
        $(".jianshe").hide();//建设项目环评
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".dkbm").show()
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $(".zuzhijigou").hide();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(11)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if ( num == "2"){
        $("#myModalZd").modal();
    } else if(num=="5"){//建设项目环评
        $("#myModal #myModalLabel").html("建设项目环评条件查询")
        $('#provice').show();
        $(".jianshe").show();//建设项目环评
        $(".modal-shi").hide();
        $(".modal-xian").hide();
        $(".scjd").hide()
        $(".dkbm").hide()
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $(".zuzhijigou").hide();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(5)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if ( num == "6"){//排污许可
        $("#myModal #myModalLabel").html("排污许可数据条件查询")
        $(".scjd").hide()
        $(".dkbm").hide()
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".pwxksj").show();//排污许可
        $(".jianshe").hide();//建设项目环评
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $(".zuzhijigou").hide();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(6)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if ( num == "3"){
        $("#myModal #myModalLabel").html("尾矿库（绿网）条件查询")
        $(".scjd").hide()
        $(".dkbm").hide()
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".jianshe").hide();//建设项目环评
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").show();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $(".zuzhijigou").hide();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(3)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if( num == "4"){
        $("#myModal #myModalLabel").html("淘汰落后产能企业条件查询")
        $(".scjd").hide()
        $(".dkbm").hide()
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".jianshe").hide();//建设项目环评
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").show();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $(".zuzhijigou").hide();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(4)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if( num == "8"){
        $("#myModal #myModalLabel").html("重点行业监管企业条件查询")
        $(".scjd").hide()
        $(".dkbm").hide()
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".jianshe").hide();//建设项目环评
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").show();//重点行业监管企业
        $(".zuzhijigou").hide();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(8)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();
    } else if( num == "7" ) {
        $("#myModal #myModalLabel").html("组织机构代码条件查询")
        $(".scjd").hide()
        $(".dkbm").hide()
        $(".modal-shi").show();
        $(".modal-xian").show();
        $(".jianshe").hide();//建设项目环评
        $(".pwxksj").hide();//排污许可
        $(".weikuangku").hide();//尾矿库
        $(".taotailuohou").hide();//淘汰落后产能企业
        $(".zhongdianyangye").hide();//重点行业监管企业
        $(".zuzhijigou").show();//组织机构代码
        $("#myModal .modal-footer").html('<button type="button" class="btn btn-primary" onclick="wrdkChaxun(7)">查询</button><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>')
        $("#myModal").modal();

    }
}
//专题图调用的方法
function zhuantiCount(){
	removeTc("xian"); // 清空县图层
    if ( dong.num =="1" || dong.num == "11") {
        wrdkShu();
    } else if ( dong.num == "2"){
        Zhongdianhangye()
    } else if ( dong.num == "3"){
        lwwkk();
    } else if ( dong.num == "4" ) {
        luohou_zhuangti();
    }else if (dong.num == "5"){
        jiansheCount()
    } else if ( dong.num == "6"){
        pwxk_zhuanti();
    } else if ( dong.num == "7" ) {
        zuzhijigou_zhuanti();
    } else if ( dong.num == "8" ) {
        zhongdian_zhuanti();
    }
}

//点击数字进行定位
function clickDingwei(evt){
    var data = evt.graphic.attributes;
    if(data.lon == "" || data.lon == undefined || data.lon == null ){
        return
    } else {
        var centerPoint = new dong.Point(handle_x(data.lon),handle_y(data.lat),new dong.SpatialReference({ wkid:102100 }));
        app.map.centerAndZoom(centerPoint,data.level);
    }
}

//点击数字 省界、市界进行高亮
function dataHeight(num,code){
    var str ;
    var query = new dong.Query();
    if ( num == "1" ) { // 淘汰落后企业产能
       str= new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {});
        query.where = "PROV_CODE ="+code+"";
    } else if (num =="2"){ // 重点监管企业遥感核查
        str= new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {});
        query.where = "KIND_1 ='"+code.substr(0,4)+"'";
    }
    str.queryFeatures(query, function(featureSet) {
        var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([255, 0, 51]), 3);
        var highGraphic = new esri.Graphic(featureSet.features[0].geometry,highSymbol,{type: "provinceHigh1"});
        app.map.graphics.add(highGraphic);
       /* if ( num == "1") dong.shengClick = highGraphic;
        else if ( num == "2") dong.shiClick=highGraphic;*/

    });
}
/**
 * 判断是否是属性查询
 */
function isAttributeQuery() {
	if (($("#attributesSearchLi").attr("class") == "repres_active" && dong.basicGeographyAndOthersClickRecord > 0) || dong.measure ) { // 点击属性查询按钮后不下钻
		return true;
	} else {
		return false;
	}
}
/**
 * 获取查询条件所需图层
 */
function getQueryLayer() {
	var sheng = $("#provice").val() || $("#provice1").val();
	var shi = $("#city").val() || $("#city1").val();
	var xian = $("#county").val() || $("#county1").val();
	if(xian == "" ) {
	    if ( shi == "" ) {
	        if ( sheng == ""){
	        	dong.tucengType = "sheng";
	        } else { // 省
	        	removeTc("sheng"); // 移除省图层
	        	addLayerShi(); // 省不为空显示市图层
	        	if (dong.num == "2") {
	        		dong.shengName = $("#provice1 option:selected").text();
	        	} else {
	        		dong.shengName = $("#provice option:selected").text();
	        	}
	        	
	        }
	    } else { // 市
	    	addLayerXian(); // 市不为空添加县图层
	    	if (dong.num == "2") {
	    		dong.shiName = $("#city1 option:selected")[0].innerHTML; // 返回市用
	    	} else {
	    		dong.shiName = $("#city option:selected")[0].innerHTML; // 返回市用
	    	}
	    }
	} else { // 县
		// 查询到县时，直接查询的是县图层  "http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0"
		if (dong.num == "2") {
			dong.shiName = $("#city1 option:selected")[0].innerHTML; // 返回市用
		} else {
			dong.shiName = $("#city option:selected")[0].innerHTML; // 返回市用
		}
		dong.shiCode = shi; // 查询到县，返回市用
	} 
}
/**
 * 获取重点行业查询图层
 */
function getQueryLayerZhongDianHangYe() {
	var sheng = $("#provice1").val();
	var shi = $("#city1").val();
	var xian = $("#county1").val();
	if(xian == "" ) {
	    if ( shi == "" ) {
	        if ( sheng == ""){
	        	showShengLayer();
	        	removeGraphic("provinceHigh");
	            removeGraphic("provinceHigh1");
	            $("#fanhuiSheng").hide();
	            $("#fanhuiShi").hide();
	            removeTc("shi");
	            removeTc("xian");
	        } else { // 省
	        	removeTc("sheng"); // 移除省图层
	        	addLayerShi(); // 省不为空显示市图层
        		dong.shengName = $("#provice1 option:selected").text();
	        }
	    } else { // 市
	    	addLayerXian(); // 市不为空添加县图层
	    	dong.shiName = $("#city1 option:selected")[0].innerHTML; // 返回市用
	    }
	} else { // 县
		// 查询到县时，直接查询的是县图层  "http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0"
		dong.shiName = $("#city1 option:selected")[0].innerHTML; // 返回市用
		dong.shiCode = shi; // 查询到县，返回市用
	} 
}

function addLayerShi() {
	removeTc("sheng");
    removeTc("shi");
    dengdai();//等待提示框
    var shiCode;
	app.shi = new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/city/MapServer/0", {
        mode: dong.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        id: "shi"
    });
	if (dong.shengCode != "") {
		shiCode = (dong.shengCode+ "").substr(0, 2);
	} else {
		shiCode =(storage.regionCode + "").substr(0, 2);
	}
	app.shi.setDefinitionExpression("KIND_1 like '" + shiCode + "%'");
    app.map.addLayer(app.shi);
    //加载市名标签
    var statesLabel = new dong.TextSymbol().setColor(new dong.Color("#0a162c"));
    statesLabel.font.setSize("12pt");
    statesLabel.font.setWeight(700);
    statesLabel.setOffset(20, -20);
    var labelClass = new dong.LabelClass({
        "labelExpressionInfo": {"value": "{NAME}"},
        "useCodedValues": true,
        "labelPlacement": "below-right",
        "fieldInfos": [{fieldName: "NAME"}]
    });
    labelClass.symbol = statesLabel;
    var outlineSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([0,0,0,0.5]),0.5);
    var defaultSymbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new dong.Color([0,0,0,0]));
    renderer = new dong.SimpleRenderer(defaultSymbol);
    app.shi.setRenderer(renderer);
    dong.tucengType = "shi";
    app.shi.on("mouse-over", function (evt) {
    	if (isAttributeQuery()) { // 判断是否是属性查询
         	return;
        }
        if(dong.ztorfb=="分布图") return;
        removeGraphic("provinceHigh");
        var lineJson = {
            "paths": evt.graphic.geometry.rings,
            "spatialReference": {"wkid": 102100}
        }
        var highPolyline = new dong.Polyline(lineJson);
        var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([255, 106, 106]),1);
        var highGraphic = new dong.Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
        app.map.graphics.add(highGraphic);
    })
    //添加鼠标移出事件
    app.shi.on("mouse-out", function () {
        if(dong.ztorfb=="分布图") return;
        removeGraphic("provinceHigh");
    })
    app.shi.on("click", function (evt) {
    	if (dong.num == 5) { // 建设项目环评 没有市点击事件
    		return;
    	}
    	if (isAttributeQuery()) { // 判断是否是属性查询
         	return;
        }
    	dong.chaxun = false;
        //高亮设置
        removeGraphic("provinceHigh1");
        removeGraphic("provinceHigh2");
        var lineJson = {
            "paths": evt.graphic.geometry.rings,
            "spatialReference": {"wkid": 102100}
        }
        var highPolyline = new dong.Polyline(lineJson);
        var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([255, 0, 51]), 4);
        var highGraphic = new dong.Graphic(highPolyline, highSymbol, {type: "provinceHigh1"});
        //记录边界高亮
        // provinceClick = highGraphic;
        //dong.shiClick=highGraphic;
        app.map.graphics.add(highGraphic);
        //获取点击省份的PROV_CODE
        dong.level = 2;
        dong.shiCode = evt.graphic.attributes.KIND_1+"00";
        dong.shiName = evt.graphic.attributes.NAME_1;
        $("#tongjituDiv thead").html("");
        $("#tongjituDiv tbody").html("");
        $("#fanhuiShi").show();
        $("#fanhuiShi").val(evt.graphic.attributes.KIND_1+"00"+"-"+evt.graphic.geometry.x+","+evt.graphic.geometry.y);
        $("#fanhuiShi").html('<i class="iconfont icon-return"></i>'+evt.graphic.attributes.NAME_1);
        if (dong.num != 2) {
        	$("#city").val(dong.shiCode);
        	getCounty(); // 获取县下拉框
        } else {
        	$("#city1").val(dong.shiCode);
        	getCounty1();
        }
        //dong.shiExtent=evt.graphic.geometry.getExtent();
        //设置地图边界
        app.map.setExtent(evt.graphic.geometry.getExtent());
        //记录地图边界
        // provinceExtent = evt.graphic.geometry.getExtent();
        //更新某一个省的点位图层
        show_xian(evt);
    });
}

/**
 * 添加县图层，并给县图层绑定事件
 */
function addLayerXian() {
	removeTc("shi");
	removeTc("xian");
    removeGraphic("provinceHigh2"); // 移除省份高亮
	app.xian = new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/countynew/MapServer/0", {
        mode: dong.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        id: "xian"
    });
	var code = dong.shiCode || $("#city").val() || $("#city1").val();
    app.xian.setDefinitionExpression("CODE  like '" +(code+"").substr(0,4)+ "%'");
    app.map.addLayer(app.xian);
    //加载市名标签
    var statesLabel = new dong.TextSymbol().setColor(new dong.Color("#0a162c"));
    statesLabel.font.setSize("12pt");
    statesLabel.font.setWeight(700);
    statesLabel.setOffset(20, -20);
    var labelClass = new dong.LabelClass({
        "labelExpressionInfo": {"value": "{NAME}"},
        "useCodedValues": true,
        "labelPlacement": "below-right",
        "fieldInfos": [{fieldName: "NAME"}]
    });
    labelClass.symbol = statesLabel;
    var outlineSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID,new dong.Color([0,0,0,0.5]),1);
    var defaultSymbol = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,outlineSymbol,new dong.Color([0,0,0,0]));
    renderer = new dong.SimpleRenderer(defaultSymbol);
    app.xian.setRenderer(renderer);
    dong.tucengType = "xian";
    
    app.xian.on("mouse-over", function (evt) {
    	if (isAttributeQuery()) { // 判断是否是属性查询
         	return;
        }
        if(dong.ztorfb=="分布图") return;
        removeGraphic("provinceHigh");
        var lineJson = {
            "paths": evt.graphic.geometry.rings,
            "spatialReference": {"wkid": 102100}
        }
        var highPolyline = new dong.Polyline(lineJson);
        var highSymbol = new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_SOLID, new dong.Color([255, 106, 106]),1);
        var highGraphic = new dong.Graphic(highPolyline, highSymbol, {type: "provinceHigh"});
        app.map.graphics.add(highGraphic);
    })
    //添加鼠标移出事件
    app.xian.on("mouse-out", function () {
        if(dong.ztorfb=="分布图") return;
        removeGraphic("provinceHigh");
    })
    app.xian.on("click", function (evt) {
    	// 柱状图返回按钮
    	var barTitle = $(".wrdk_barTip p")[0].innerHTML;
    	$(".wrdk_barTip").empty();
    	//var strButton =  "<button type='button' onclick = 'fanhuiShi()' style='position: relative;left: 93px;'>返回</button>";
    	var strButton =  "<img src='./img/backToPre.png' onclick = 'fanhuiShi()' style='position: relative;left: 93px;cursor:pointer' title='返回上一级'/>";
    	// <img src="../../img/arrow_up.png"
    	$(".wrdk_barTip").append("<p>"+barTitle+"</p>" + strButton);
    	if (isAttributeQuery()) { // 判断是否是属性查询
         	return;
        }
    	dong.chaxun = false;
        $("#tongjituDiv thead").html("");
        $("#tongjituDiv tbody").html("");
        dong.xianCode = evt.graphic.attributes.CODE;
        dong.xianName = evt.graphic.attributes.NAME;
        // $("#fanhuiShi").show();
        // $("#fanhuiShi").val(evt.graphic.attributes.CNTY_CODE);
        // $("#fanhuiShi").html("返回"+evt.graphic.attributes.NAME);
        dong.level = 3;
        console.log(dong.num)
        if (dong.num != 2) {
        	$("#county").val(evt.graphic.attributes.CODE);
        } else {
        	$("#county1").val(evt.graphic.attributes.CODE);
        }
        // 定位到县
    	chaxunDingwei_zhuantitu(dong.shengCode,dong.shiCode,dong.xianCode);
        if (dong.num == "1" || dong.num == "11" ){
            dianMessage(evt.graphic.attributes.CODE)
        } else if (dong.num == "2" ){
            yaoganMessage(evt.graphic.attributes.CODE)
        } else if(dong.num == "3"){
            lwwkkMessage(evt.graphic.attributes.NAME);
        } else if(dong.num == "4"){
            luohouMeaasage(evt.graphic.attributes.NAME);
        } else if (dong.num == "6"){
            pwxk_zhuantiMessage(evt.graphic.attributes.CODE);
        } else if( dong.num == "7"){
            zuzhijigou_zhuantiMessage(evt.graphic.attributes.CODE);
        } else if ( dong.num == "8"){
            zhongdian_zhuantiMessage(evt.graphic.attributes.CODE);
        }
    });
}
/**
 * 点击过查询按钮并且是返回省
 */
function afterQueryAndBackProvice() {
	if (dong.chaxun && $("#city").val() == "" && document.getElementById("fanhuiShi").style.display == "none" && document.getElementById("fanhuiSheng").style.display != "none") {
		return true;
	} else {
		return false;
	}
}
/**
 * 获取当前的省或市名
 */
function getCurrentCityName() {
	 var name = "";
	if (dong.shiName) {
		name = dong.shiName;
	} else if (dong.shengName) {
		name = dong.shengName;
	}
	return name;
}
/**
 * 获取省市县查询条件
 */
function getConditionOfQuery(jsonData) {
	if ( dong.xianName == "" ) {
        if ( dong.shiName == ""){
            if ( dong.shengName != "请选择省、自治区"){
            	jsonData.sheng = dong.shengName
            }
        } else {
            jsonData.shi = dong.shiName
        }
    } else {
        jsonData.xian = dong.xianName
    }
	return jsonData;
}
/**
 * 获取省市县查询条件代码
 * @param jsonData
 * @returns {___anonymous50097_50104}
 */
function getConditionOfQueryCode(jsonData) {
	if (!dong.xianCode) {
        if (!dong.shiCode){
            if (dong.shengCode != ""){
            	jsonData.sheng = dong.shengCode
            }
        } else {
            jsonData.shi = dong.shiCode
        }
    } else {
        jsonData.xian = dong.xianCode
    }
	return jsonData;
}
/**
 * 清空查询条件
 */
function clearQueryCondition() {
	dong.shengCode = "";
	dong.shiCode = "";
	dong.shiCode = "";
	dong.shengName = "";
	dong.shiName = "";
	dong.shiName = "";
	$("#provice").val("");
	$("#provice1").val("");
	$("#city").val("");
	$("#city1").val("");
	$("#county").val("");
	$("#county1").val("");
	/*$("#xkznum").val(""); // 许可证书编号
	$("#ispapk").val(""); // 工业园区
	$("#zywrwlbid").val(""); // 主要污染物类别
	$("#tailingsname").val(""); // 尾矿库名称
	$("#pollutetype").val(""); // 污染类型
	$("#dalei").val(""); // 行业类别
	$("#production").val(""); // 是否生产
	$("#enterprise").val(""); // 企业名称
	$("#luohouindustry").val(""); // 行业类型
	$("#jigouName").val(""); // 经营状态
	$("#jigouType").val(""); // 机构类型
	$("#enterpriseName").val(""); // 企业名称
	$("#industry").val(""); // 行业
	$("#dkbm").val(""); // 地块编码
	$("#dkmc").val(""); // 地块名称
	$("#scjd").val(""); // 所处阶段
	$("#fxjb").val(""); // 风险级别
*/}
/**
 * 柱状图返回上一级
 * @param jsonData
 * @returns {String}
 */
function goingUpOneLevel(jsonData) {
	var strButton = "";
	if (jsonData.sheng != "" && jsonData.shi == "") { // 显示的是市
		 if (storage.userLevel == "2") { // 省级用户
			 strButton = "";
		 } else {
			 strButton =  "<img src='./img/backToPre.png' onclick = 'fanhuiAll()' style='position: relative;left: 93px;cursor:pointer' title='返回上一级'/>";
		 }
	} else if (jsonData.sheng == "" && jsonData.shi != "") { // 显示的是县
		strButton =  "<img src='./img/backToPre.png' onclick = 'fanhuiSheng()'style='position: relative;left: 93px;cursor:pointer' title='返回上一级'/>";
	} else if (jsonData.xian) {
		strButton =  "<img src='./img/backToPre.png' onclick = 'fanhuiShi()' style='position: relative;left: 93px;;cursor:pointer' title='返回上一级'/>";
	} else if (jsonData.sheng != "" && jsonData.shi != "" && jsonData.xian == "") {
		strButton =  "<img src='./img/backToPre.png' onclick = 'fanhuiSheng()' style='position: relative;left: 93px;;cursor:pointer' title='返回上一级'/>";
	}
	return strButton;
}
