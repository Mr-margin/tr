//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('enterPriseInfo');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var pointLon=infoEntity.lon;
var pointLat=infoEntity.lat;
var enterId=infoEntity.enterId;
initPart4Content(enterId);
//更新更多详情信息内容
initWrdkPanelContent(enterId);
search()
var len=$('input:radio[name="s"]:checked').attr("value");
var lens=$('input:radio[name="s"]:checked').attr("data");
//$("#length").html(lens);
$("#len_ipt").val(len);
//getPolluteLandByAround(lon,lat, len);

//距离单选按钮
function getPolluteLand0(){
	console.log($('input:radio[name="s"]:checked').attr("value"));
	$("#len_ipt").val($('input:radio[name="s"]:checked').attr("value"))
	getPolluteLandByAround(pointLon,pointLat, $('input:radio[name="s"]:checked').attr("value"));
}
//距离输入框
function getPolluteLand(){
	console.log($("#len_ipt").val())
	len=$("#len_ipt").val();
	var s1=$("#lengthItem1").attr("value");
	var s2=$("#lengthItem2").attr("value");
	var s3=$("#lengthItem3").attr("value");
	$('input:radio[name="s"]:checked').removeAttr('checked')
	if(s1==$("#len_ipt").val()){
		console.log("1")
		$("#lengthItem1").attr('checked','true');
		$("#lengthItem2").removeAttr('checked');
		$("#lengthItem3").removeAttr('checked');
		$(".lengthItem1").addClass("radioShow_active");
		$(".lengthItem2").removeClass("radioShow_active");
		$(".lengthItem3").removeClass("radioShow_active");
	}else if(s2==$("#len_ipt").val()){
		console.log("2")
		$("#lengthItem2").prop("checked","true");
		$("#lengthItem1").removeAttr('checked');
		$("#lengthItem3").removeAttr('checked');
		$(".lengthItem2").addClass("radioShow_active");
		$(".lengthItem1").removeClass("radioShow_active");
		$(".lengthItem3").removeClass("radioShow_active");
	}else if(s3==$("#len_ipt").val()){
		console.log("3")
		$("#lengthItem3").prop("checked","true");
		$("#lengthItem1").removeAttr('checked');
		$("#lengthItem2").removeAttr('checked');
		$(".lengthItem3").addClass("radioShow_active");
		$(".lengthItem1").removeClass("radioShow_active");
		$(".lengthItem2").removeClass("radioShow_active");
	}else{
		$("#lengthItem1").removeAttr('checked');
		$("#lengthItem2").removeAttr('checked');
		$("#lengthItem3").removeAttr('checked');
		$(".lengthItem1").removeClass("radioShow_active");
		$(".lengthItem2").removeClass("radioShow_active");
		$(".lengthItem3").removeClass("radioShow_active");
	}
	getPolluteLandByAround(pointLon,pointLat, len);
}

function allPublic(){
	
	//国界线图层
	app.map.addLayer(new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/guojiexian/MapServer",{id:"guojiexian"}));
	
	//附近污染地块图层
	app.aroundLayer = new dong.GraphicsLayer();
	//鼠标悬停
	app.aroundLayer.on("mouse-over",function(evt){
		console.log(evt);
		var graphic = evt.graphic;
		if(graphic){
			if(graphic.attributes.graType && graphic.attributes.graType=="wurandikuaiGra"){
				var attrs = {
						graType : "wurandikuaiText"
				}
				var textSymbol = new dong.TextSymbol(graphic.attributes.WRDKMC);
			    textSymbol.setOffset(graphic.attributes.WRDKMC.length * 7, 40)
			    textSymbol.setHaloSize(1)
			    textSymbol.setHaloColor(new dong.Color([255, 255, 255]));
			    var font  = new dong.Font();
			    font.setSize("10pt");
			    font.setWeight(dong.Font.WEIGHT_BOLD);
			    textSymbol.setFont(font);
			    var textGra = new dong.Graphic(graphic.geometry, textSymbol, attrs);
			    app.map.graphics.add(textGra);
			}
		}
		
	});
	//鼠标离开
	app.aroundLayer.on("mouse-out", function(evt){
		removeGraByAttr("wurandikuaiText", app.map.graphics);
	});
	
	//鼠标点击
	app.aroundLayer.on("click", function(evt){
		if(evt.graphic){
			var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"};
			var attr = evt.graphic.attributes;
			var html = '<div class="rows">' + 
			'<div class="rows" style="overflow:auto;height:90px;">' +
            '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">名称：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(attr.WRDKMC)+'</div></div>' +
            '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">编码：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(attr.WRDKBM)+'</div></div>' +
            '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">所处阶段：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(SCJDBM[attr.scjdbmChn])+'</div></div>' +
            '</div>'+
            '<div class="row" id="showDetailsBtn" ><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="padding:0;"><span style="color:#00A2DA;cursor:pointer;"><a href="javascript:void(0);" onclick=showDetailsModal("' + attr.WRDKBM +'","'+ attr.WRDKMC +'") >详情信息</a></span></div></div>' +
            '</div>';
			debugger;
			mapinfoWindow("按距离分析污染地块信息", html, evt);
		}
		
		
//		removeGraByAttr("wurandikuaiText", app.map.graphics);
		
	});
		
	
	app.map.addLayer(app.aroundLayer);
	
	var infoJsonStr = sessionStorage.getItem('enterPriseInfo');
	infoEntity = JSON.parse(infoJsonStr);
//	if(infoEntity.lon && infoEntity.lat && infoEntity.lon!="undefined" && infoEntity.lat!="undefined"){
		//将污染地块点位加到地图上
		showLocationToMap(infoEntity.lon,infoEntity.lat,infoEntity.enterpriseName);
//	}
//	getPolluteLandByAround(infoEntity.lon,infoEntity.lat, $('input:radio[name="s"]:checked').attr("value"));
	console.log($('input:radio[name="s"]:checked').attr("value"))
	
	
	$("div.window_rt.close").click(function(){
//		app.map.infoWindow.destroy();
		app.map.infoWindow.hide();
	})
}

//详情信息
function showDetailsModal(WRDKBM, WRDKMC){
	var enterPriseInfo = {
			WRDKBM:WRDKBM
		};
	showDetailsModal1(JSON.stringify(enterPriseInfo), WRDKMC, "views/data/detailIframe/dataDeDetails.html")
}

//跳转数据详情页面
//显示排污许可证详细信息
function showDetailsModal1(dataIDJson, titleName, urlStr){
	$("#pwModal").modal('toggle');
	sessionStorage.setItem('dataIDJson', dataIDJson);
	$("#myModalLabel1").text(titleName);
	$("#detailsIframe").attr("src",urlStr);
	$("#detailsDiv").show();
}

/**
 * 定位功能
 * 参数：
 * 	lon：经度
 * 	lat：纬度
 */

function showLocationToMap(lon, lat, enterpriseName){
	if(lon && lat && lon >= 73.66 && lon <= 135.0416 && lat >= 3.866 && lat <= 53.9166){
		removeGraByAttr("enterpriseGra", app.map.graphics);
		appOnePicPointToMap(lon, lat, enterpriseName, "img/dian/qianzaiwurandikuai.png", app.map.graphics, "enterpriseGra");
		changeMapExtent(lon, lat);
		//查询附近污染地块
		getPolluteLandByAround(infoEntity.lon,infoEntity.lat, $('input:radio[name="s"]:checked').attr("value"));
//		/*
	}else{
		ajaxPost("/seimp/tianditu/getAddress", {
			name : enterpriseName
		}).done(function (result) {
	        if(result.status == 0){
	        	if(result.data[0].status == "成功"){
	        		//存储查询到坐标
	        		pointLon = result.data[0].lon;
	        		pointLat = result.data[0].lat;
	        		
	        		removeGraByAttr("enterpriseGra", app.map.graphics);
	        		appOnePicPointToMap(result.data[0].lon, result.data[0].lat, enterpriseName, "img/dian/qianzaiwurandikuaiYuGu.png", app.map.graphics, "enterpriseGra");
	        		changeMapExtent(result.data[0].lon, result.data[0].lat);
	        		//查询附近污染地块
	        		getPolluteLandByAround(pointLon,pointLat, $('input:radio[name="s"]:checked').attr("value"));
	        	}else{
	        		toastr.error("未查询到位置！");
	        		//查询附近污染地块
	        		getPolluteLandByAround("","", $('input:radio[name="s"]:checked').attr("value"));
	        	}
	        }
	    });
	    
	}
//	*/
}

/**
 * 附件污染地块
 * @param lon：经度
 * @param lat：纬度
 * @param length：距离
 */
function getPolluteLandByAround(lon, lat, length){
	
	//清除附近污染地块
	removeGraByAttr("wurandikuaiGra", app.aroundLayer);
	
		var circle = new dong.Circle([parseFloat(lon), parseFloat(lat)], {"radius" : length * 1000})
		
		if(lon && lat && lon!='' && lat!='' && lon!='undefined' && lat!='undefined'){
			addOneCircleToMap(circle, length);
		}
		var extent = circle.getExtent();
		if(lon && lat && lon!='' && lat!=''  && lon!='undefined' && lat!='undefined'){
			app.map.setExtent(extent.expand(1.5));
		}
		
		//销毁当前表格数据
	    $("#wurandikuaiByAroundTable").bootstrapTable('destroy');
	    //表格查询参数
	    
	    var queryParams = function(params){
	    	var data =  JSON.stringify({
		    		minLon : extent.xmin,
		            maxLon : extent.xmax,
		            minLat : extent.ymin,
		            maxLat : extent.ymax,
		    		pageSize : params.limit,  //页面大小
		    		pageNumber : params.offset,   //页码
	        });
	    	var datas = {};
	    	datas.data = data;
	        return datas;
	    }
	    //表格字段
	    var columns = [{  
	        field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        align:'center',
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
	    },{
	        field:'WRDKBM',
	        title:'污染地块编码',
	        align:'center'
	    },{
	        field:'WRDKMC',
	        title:'污染地块名称',
	        align:'center'
	    },{
	        field:'SCJDBM',
	        title:'所处阶段',
	        align:'center',
	        formatter: function (value, row, index) {
	        	if(value != null){
	        		switch (value) {
						case "S0":
							return "疑似地块";
							break;
						case "S1":
							return "初步调查";
							break;
						case "S2":
							return "详细调查";
							break;
						case "S3":
							return "风险评估";
							break;
						case "S4":
							return "风险管控";
							break;
						case "S5":
							return "土壤修复与治理";
							break;
						case "S6":
							return "土壤修复与治理评估";
							break;
				
						default:
							return "";
							break;
					}
	        	}
	        }
	    },{
	        title:'操作',
	        align:'center',
	        formatter: function (value, row, index) {
	        	var s = '<a href="javascript:void(0);" onclick="arcgisDw('+row.LON+', '+row.LAT+')";>定位</a>';
	        	return s;
	        }
	    }]
	    $("#wurandikuaiByAroundTable").bootstrapTable({
	    	method: 'POST',
	        url: "/seimp/lplw/getWrdkDataByRange",
	        dataType: "JSON",
		    //classes:'table-no-bordered',	//消除表格边框
		    iconSize : "outline",
		    //clickToSelect : true,			// 点击选中行
		    //pageNumber : 1,
		    //pageSize : 5, 					
		    striped : true, 				// 使表格带有条纹
		    //pagination : true,				// 在表格底部显示分页工具栏
		    //showPaginationSwitch: true,       //是否显示选择分页数按钮
	        clickToSelect: true,
		    sidePagination : "server",		// 表格分页的位置 client||server
//		   
	        ajaxOptions: {async: true, timeout: 10000},
	        
	        queryParams: queryParams, //参数
	        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
	        silent: true,  //刷新事件必须设置
	        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
	        onClickRow: function (row, $element) {
	            $('.success').removeClass('success');
	            $($element).addClass('success');
	        },
	        onLoadError: function (status) {
	            toastr.error("请求超时");
	            return false;
	        },
	        onLoadSuccess:function(data){
	        	var rows = data.rows;
	        	var newRows = [];
	        	if(rows && rows.length > 0){
	        		$.each(rows, function(i, r){
	        			var point = new dong.Point(r.LON, r.LAT);
	            		if(circle.contains(point)){
	            			newRows.push(r);
	            		}
	        		})
	        		
	        		addPicPoinsToMap(newRows, app.aroundLayer);
	        		data.rows = newRows;
	        		$("#wurandikuaiByAroundTable").bootstrapTable("load",data)
	        	}
	        },
	        icons: {
	            refresh: "glyphicon-repeat",
	            toggle: "glyphicon-list-alt",
	            columns: "glyphicon-list"
	        },
	        columns: columns
	    });								
    
	
}


var scjdbmObj = {
		S0 : '疑似地块',
		S1 : '初步调查',
		S2 : '详细调查',
		S3 : '风险评估',
		S4 : '风险管控',
		S5 : '土壤修复与治理',
		S6 : '土壤修复与治理评估'
}

function addPicPoinsToMap(data, mapLayer){
	var pointSymbol = new dong.PictureMarkerSymbol("img/dian/wurandikuai.png", 32, 32);
	pointSymbol.setOffset(0, 16);
	
	var template = new dong.InfoTemplate();
	for (var i = 0; i < data.length; i++) {
		var currItem = data[i];
		
		var attrs = {
				graType : "wurandikuaiGra",
		}
		attrs.WRDKMC = currItem.WRDKMC;
		attrs.WRDKBM = currItem.WRDKBM;
		attrs.scjdbmChn = currItem.scjdbmChn;
//		template.setTitle("按距离分析污染地块信息");
//		template.setContent("<div class='clearfix'><span class='pull-left'>名称：</span><p class='pull-left'>${WRDKMC}</p></div><div class='clearfix'><span class='pull-left'>编码：</span><p class='pull-left'>${WRDKBM}</p></div><div class='clearfix'><span class='pull-left'>所处阶段：</span><p class='pull-left'>${scjdbmChn}</p></div>");
		
		var point = new dong.Point(currItem.LON, currItem.LAT, new dong.SpatialReference({ wkid: 4326 }));
		var graphic = new dong.Graphic(point,pointSymbol, attrs);
		mapLayer.add(graphic);
	}
	$(".windowTitle").css("width","80%");
	$(".windowContent").addClass("pgfx_mapTip");
	$(".dextra-bubble-pop").addClass("pgfx_pop");
	
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
 *	改变地图范围 
 */
function changeMapExtent(lon, lat){
	var extent = new dong.Extent(lon, lat, lon, lat, new dong.SpatialReference({ wkid:4326 }));
	app.map.setExtent(extent);
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
 * 添加一个圆到地图上
 * @param circle
 */
function addOneCircleToMap(circle, length){
	removeGraByAttr("circleGra", app.aroundLayer);
	
	var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
		new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 1),
		new dong.Color([255,255,255,0])
	);
	var attrs = {
			graType : "circleGra"
	}
	var graphic = new dong.Graphic(circle, sfs, attrs);
	app.aroundLayer.add(graphic);
	
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
    app.aroundLayer.add(textGra);
	
}




/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(enterId) {
    ajaxPost("/seimp/lplw/getEnterpriceBaseInfoDataByEnterId",{
    	enterId:enterId
    }).done(function (result) {
        if (result.status == 0 && result.msg == "success") {
        	console.log(result.data)
        	var item=result.data;
        
            $("#pot_1").html(item.ISTYPE=="1"?"注销":"撤销");
            $("#pot_2").html(item.UNITNAME);
            $("#pot_3").html(item.ZXTYPE);
            $("#pot_4").html(item.ZXREASON);
            $("#pot_5").html(item.CREATETIME);
            $("#pot_6").html(item.XKZNUMBER);
            $("#pot_7").html(item.PROVINCE+item.CITY+item.COUNTY);
            $("#pot_8").html(item.REGADDRESS);
            $("#pot_9").html(item.HYNAME);
            $("#pot_10").html(item.ORGANCODE);
            $("#pot_11").html(item.CREDITCODE);
            $("#pot_12").html(item.OPEADDRESS);
            $("#pot_13").html(item.POSTCODE);
            var zywrwlbid = item.ZYWRWLBID;
            if(zywrwlbid){
            	zywrwlbid = zywrwlbid.replace("fq","废气");
            	zywrwlbid = zywrwlbid.replace("fs","废水");
        	}
            $("#pot_14").html(zywrwlbid);
            $("#pot_15").html(item.AIRWRWNAME);
            $("#pot_16").html(item.WATERWRWNAME);
            $("#pot_17").html(item.WATEREMISSIONNAME);
            //$("#pot_18").html(item.ITEMTYPE);//没有字段
            var report = "<button onclick=shangbao('"+item.ENTERID+"','"+item.UNITNAME+"') class='btn btn-warning'>是</button>" +
            		"<button onclick=shangbaoNo('"+item.ENTERID+"','"+item.UNITNAME+"') class='btn btn-warning'>否</button>";
            if(item.REPORTSTATUS == 2){
            	report = "已上报";
            }
            if(item.REPORTSTATUS == 3){
            	report = "不上报";
            }
            $("#pot_18").html(report);
            console.log($(".table-left").height())
        	$(".table-right").height($(".table-left").height()-52);
            $(".table-right .qiye_map").height($(".table-left").height()-120);
        }
    });
    
}

/**
 * 更新更多详情信息内容
 * @param enterId：排污许可证注销/撤销 enterId
 */
function initWrdkPanelContent(enterId) {
	 
	/*
	ajaxPost("/seimp/lplw/getDetailsDataByEnterId",{
		enterId:enterId
	}).done(function (result) {
		if (result.status == 0 && result.msg == "success") {
			var data = result.data;
			//主要产品及产能信息
			var productInfo = data.productInfo;
			if(productInfo){
				var html = "";
				for (var i = 0; i < productInfo.length; i++) {
					var currItem = productInfo[i];
					html += "<tr><td>"+handleNullStr(currItem.PRODUCTNAME)+"</td><td>"+handleNullStr(currItem.CAPACITY)+"</td><td>"+handleNullStr(currItem.PRODUNITSNAME)+"</td></tr>";
				}
				$("#productInfoTable tbody").html(html);
			}
			
			//主要原辅料信息
			var material = data.material;
			if(material){
				var html = "";
				for (var i = 0; i < material.length; i++) {
					var currItem = material[i];
					//有毒有害成分数据
					var poisonStr = "";
					if(currItem.POISON){
						poisonStr = currItem.POISON;
					}else{
						var poisonsStr = currItem.poisonsStr;
						if(poisonsStr.length > 0){
							poisonStr = poisonsStr.substr(0,poisonsStr.length-1);
						}
						
					}
					html += "<tr><td>"+handleNullStr(currItem.HYNAME)+"</td><td>"+handleNullStr(currItem.DEVICENAME)+"</td><td>"+handleNullStr(currItem.FUELNAME)+"</td>" +
							"<td>"+handleNullStr(currItem.YEARMAX)+"</td>" +
							"<td>"+handleNullStr(currItem.UNITSNAME)+"</td><td>"+poisonStr+"</td></tr>"
				}
				$("#materialTable tbody").html(html);
			}
			
			//燃料信息
			var fuel = data.fuel;
			if(fuel){
				var html = "";
				for (var i = 0; i < fuel.length; i++) {
					var currItem = fuel[i];
					html += "<tr><td>"+handleNullStr(currItem.DEVICENAME)+"</td><td>"+handleNullStr(currItem.FUELNAME)+"</td><td>"+handleNullStr(currItem.YEARMAX)+"</td></tr>";
				}
				$("#fuelTable tbody").html(html);
			}
			
			//直接排放口数据
			var drectly = data.drectly;
			if(drectly){
				var html = "";
				for (var i = 0; i < drectly.length; i++) {
					var currItem = drectly[i];
					html += "<tr><td>"+handleNullStr(currItem.XKDRAINCODE)+"</td><td>"+handleNullStr(currItem.DRAINNAME)+"</td><td>"+handleNullStr(currItem.LONGITUDE)+"</td>" +
							"<td>"+handleNullStr(currItem.LATITUDE)+"</td>" +
							"<td>"+handleNullStr(currItem.PFQXNAME)+"</td><td>"+handleNullStr(currItem.PFFSNAME)+"</td><td>"+handleNullStr(currItem.EMISSIONTIME)+"</td>" +
							"<td>"+handleNullStr(currItem.SEWAGENAME)+"</td><td>"+handleNullStr(currItem.FUNCTIONNAME)+"</td><td>"+handleNullStr(currItem.FUNCTIONNAME)+"</td>" +
							"<td>"+handleNullStr(currItem.NATURELATITUDE)+"</td></tr>";
				}
				$("#drectlyTable tbody").html(html);
			}
			
			//间接排放口数据
			var indirect = data.indirect;
			if(indirect){
				var html = "";
				for (var i = 0; i < indirect.length; i++) {
					var currItem = indirect[i];
					html += "<tr><td>"+handleNullStr(currItem.XKDRAINCODE)+"</td><td>"+handleNullStr(currItem.DRAINNAME)+"</td><td>"+handleNullStr(currItem.LONGITUDE)+"</td>" +
							"<td>"+handleNullStr(currItem.LATITUDE)+"</td>" +
							"<td>"+handleNullStr(currItem.PFQXNAME)+"</td><td>"+handleNullStr(currItem.PFFSNAME)+"</td><td>"+handleNullStr(currItem.EMISSIONTIME)+"</td>" +
							"<td>"+handleNullStr(currItem.SEWAGENAME)+"</td></tr>";
				}
				$("#indirectTable tbody").html(html);
			}
			
			//固体废物排放信息
			var solidwaste = data.solidwaste;
			if(solidwaste){
				var html = "";
				for (var i = 0; i < solidwaste.length; i++) {
					var currItem = solidwaste[i];
					html += "<tr><td>"+handleNullStr(currItem.FWLY)+"</td><td>"+handleNullStr(currItem.FWMC)+"</td><td>"+handleNullStr(currItem.FWZLNAME)+"</td>" +
							"<td>"+handleNullStr(currItem.FWLBNAME)+"</td>" +
							"<td>"+handleNullStr(currItem.FWMS)+"</td><td>"+handleNullStr(currItem.FWSCL)+"</td><td>"+handleNullStr(currItem.FWCLFSNAME)+"</td>" +
							"<td>"+handleNullStr(currItem.FWZHLYCLL)+"</td><td>"+handleNullStr(currItem.FWCZL)+"</td><td>"+handleNullStr(currItem.FWCCL)+"</td>" +
							"<td>"+handleNullStr(currItem.FWPFL)+"</td></tr>";
				}
				$("#solidwasteTable tbody").html(html);
			}
			
			//自行监测及记录信息
			var monitorInfo = data.monitorInfo;
			if(monitorInfo){
				var html = "";
				for (var i = 0; i < monitorInfo.length; i++) {
					var currItem = monitorInfo[i];
					html += "<tr><td>"+handleNullStr(currItem.POLLNAME)+"</td><td>"+handleNullStr(currItem.XKDRAINCODE)+"</td><td>"+handleNullStr(currItem.DRAINNAME)+"</td>" +
							"<td>"+handleNullStr(currItem.MONCONTENT)+"</td>" +
							"<td>"+handleNullStr(currItem.WRWNAME)+"</td><td>"+handleNullStr(currItem.ISLINKSCODE)+"</td><td>"+handleNullStr(currItem.ISSAFE)+"</td></tr>";
				}
				$("#monitorInfoTable tbody").html(html);
			}
			
			//许可证变更、延续记录信息
			var applyrecord = data.applyrecord;
			if(applyrecord){
				var html = "";
				for (var i = 0; i < applyrecord.length; i++) {
					var currItem = applyrecord[i];
					html += "<tr><td>"+handleNullStr(currItem.DEVCOMPANY)+"</td><td>"+handleNullStr(currItem.ITEMENDTIME)+"</td><td>"+handleNullStr(currItem.INFORMATION)+"</td>" +
							"<td>"+handleNullStr(currItem.XKZNUM)+"</td>" +
							"<td>"+handleNullStr(currItem.ITEMTYPE)+"</td></tr>";
				}
				$("#applyrecordTable tbody").html(html);
			}
		}
	});
	*/
	
	getProductInfoPageData(enterId);
	getMaterialPageData(enterId);
	getFuelPageData(enterId)
	getDrectlyPageData(enterId)
	getIndirectPageData(enterId)
	getSolidwastePageData(enterId)
	getMonitorInfoPageData(enterId)
	getApplyrecordPageData(enterId)
}

/**
 * 主要产品及产能信息
 * @param enterId
 */
function getProductInfoPageData(enterId){
	//销毁当前表格数据
    $("#productInfoTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'PRODUCTNAME',
        title:'产品名称',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'CAPACITY',
        title:'生产能力',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'PRODUNITSNAME',
        title:'计量单位',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    }]
    $("#productInfoTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getProductInfoPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 主要原辅料信息
 * @param enterId
 */
function getMaterialPageData(enterId){
	//销毁当前表格数据
    $("#materialTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'HYNAME',
        title:'行业大类',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'DEVICENAME',
        title:'种类（原料或辅料）',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'FUELNAME',
        title:'名称',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'YEARMAX',
        title:'年最大使用量',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'UNITSNAME',
        title:'计量单位',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'POISON',
        title:'有毒有害物质及占比',
        align:'center',
        formatter: function (value, row, index) {
        	var poisonStr = "";
			if(row.POISON){
				poisonStr = row.POISON;
			}else{
				var poisonsStr = row.poisonsStr;
				if(poisonsStr.length > 0){
					poisonStr = poisonsStr.substr(0,poisonsStr.length-1);
				}
				
			}
        	return poisonStr;
        }  
    }]
    $("#materialTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getMaterialPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 燃料信息
 * @param enterId
 */
function getFuelPageData(enterId){
	//销毁当前表格数据
    $("#fuelTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'DEVICENAME',
        title:'种类',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'FUELNAME',
        title:'名称',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'YEARMAX',
        title:'年最大使用量',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    }]
    $("#fuelTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getFuelPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 直接排放口数据
 * @param enterId
 */
function getDrectlyPageData(enterId){
	//销毁当前表格数据
    $("#drectlyTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [
	    [
	     	{  
		        field: 'Number',
		        title: '序号', 
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        formatter: function (value, row, index) {  
		            return index+1;  
		        }  
		    },{
		        field:'XKDRAINCODE',
		        title:'编号',
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }
		    },{
		        field:'DRAINNAME',
		        title:'名称',
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        class:'w-200',
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }  
		    },{
		        field:'LONGITUDE',
		        title:'经度',
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        formatter: function (value, row, index) {  
		        	return handleNullStr(value);
		        }  
		    },{
		        field:'LATITUDE',
		        title:'纬度',
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }
		    },{
		        field:'PFQXNAME',
		        title:'排放去向',
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        class:'w-200',
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }  
		    },{
		        field:'PFFSNAME',
		        title:'排放规律',
		        align:'center',
		        rowspan : 2,
		        valign:"middle",
		        class:'w-300',
		        formatter: function (value, row, index) {  
		        	return handleNullStr(value);
		        }  
		    },{
		        field:'EMISSIONTIME',
		        title:'间歇式排放时段',
		        align:'center',
		        valign:"middle",
		        rowspan : 2,
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }
		    },{
		        title:'受纳自然水体信息',
		        align:'center',
		        colspan : 2
		    },{
		        title:'汇入受纳自然水体',
		        align:'center',
		        colspan : 2
		    }
		],[{
		        field:'SEWAGENAME',
		        title:'名称',
		        align:'center',
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }  
		    },{
		        field:'FUNCTIONNAME',
		        title:'功能目标',
		        align:'center',
		        formatter: function (value, row, index) {  
		        	return handleNullStr(value);
		        }  
		    },{
		        field:'FUNCTIONNAME',
		        title:'经度',
		        align:'center',
		        formatter: function (value, row, index) {  
		            return handleNullStr(value); 
		        }
		    },{
		        field:'NATURELATITUDE',
		        title:'纬度',
		        align:'center',
		        formatter: function (value, row, index) {  
		        	return handleNullStr(value);
		        }  
		    }
		]
    ]
    $("#drectlyTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getDrectlyPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 间接排放口数据
 * @param enterId
 */
function getIndirectPageData(enterId){
	//销毁当前表格数据
    $("#indirectTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'XKDRAINCODE',
        title:'编号',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'DRAINNAME',
        title:'名称',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'LONGITUDE',
        title:'经度',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'LATITUDE',
        title:'纬度',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'PFQXNAME',
        title:'排放去向',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'PFFSNAME',
        title:'排放规律',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'EMISSIONTIME',
        title:'间歇式排放时段',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    }]
    $("#indirectTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getIndirectPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 固体废物排放信息
 * @param enterId
 */
function getSolidwastePageData(enterId){
	//销毁当前表格数据
    $("#solidwasteTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'FWLY',
        title:'来源',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'FWMC',
        title:'名称',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'FWZLNAME',
        title:'种类',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'FWLBNAME',
        title:'类别',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'FWMS',
        title:'描述',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'FWSCL',
        title:'产生量（t/a）',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'FWCLFSNAME',
        title:'处理方式',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'FWZHLYCLL',
        title:'综合利用处理量（t/a）',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'FWCZL',
        title:'处置量（t/a）',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'FWCCL',
        title:'贮存量（t/a）',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'FWPFL',
        title:'排放量（t/a）',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    }]
    $("#solidwasteTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getSolidwastePageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 自行监测及记录信息
 * @param enterId
 */
function getMonitorInfoPageData(enterId){
	//销毁当前表格数据
    $("#monitorInfoTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'POLLNAME',
        title:'污染源类别',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'XKDRAINCODE',
        title:'排放口编号',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'DRAINNAME',
        title:'排放口名称',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'MONCONTENT',
        title:'监测内容',
        align:'center',
        class:'w-200',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'WRWNAME',
        title:'污染物名称',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'ISLINKSCODE',
        title:'自动监测是否联网',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'ISSAFE',
        title:'自动监测设施是否符合安装、运行、维护等管理要求',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    }]
    $("#monitorInfoTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getMonitorInfoPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}

/**
 * 许可证变更、延续记录信息
 * @param enterId
 */
function getApplyrecordPageData(enterId){
	//销毁当前表格数据
    $("#applyrecordTable").bootstrapTable('destroy');
    //表格查询参数
    var queryParams = function(params){
    	var data =  JSON.stringify({
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    		enterId : enterId
        });
    	var datas = {};
    	datas.data = data;
        return datas;
    }
    //表格字段
    var columns = [{  
        field: 'Number',
        title: '序号', 
        align:'center',
        formatter: function (value, row, index) {  
            return index+1;  
        }  
    },{
        field:'DEVCOMPANY',
        title:'单位名称',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'ITEMENDTIME',
        title:'补充填报/变更/延续时间（办结时间）',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    },{
        field:'INFORMATION',
        title:'内容/事由',
        align:'center',
        formatter: function (value, row, index) {  
        	return handleNullStr(value);
        }  
    },{
        field:'XKZNUM',
        title:'补充填报/变更/延续前证书编号',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }
    },{
        field:'ITEMTYPE',
        title:'项目类型',
        align:'center',
        formatter: function (value, row, index) {  
            return handleNullStr(value); 
        }  
    }]
    $("#applyrecordTable").bootstrapTable({
    	method: 'POST',
        url: "/seimp/lplw/getApplyrecordPageData",
        columns: columns,
        dataType: "JSON",
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    //clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 10, 					
	    striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
        ajaxOptions: {async: true, timeout: 10000},
        queryParams: queryParams, //参数
        queryParamsType: "limit", //参数格式,发送标准的RESTFul类型的参数请求
        silent: true,  //刷新事件必须设置
        contentType: "application/x-www-form-urlencoded",//请求远程数据的内容类型。
        onClickRow: function (row, $element) {
            $('.success').removeClass('success');
            $($element).addClass('success');
        },
        onLoadError: function (status) {
            toastr.error("请求超时");
            return false;
        },
        onLoadSuccess:function(data){
        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        }
        
    });			
}


/**
 * 上报污染地块
 */
function shangbao(enterId, unitName){
	swal({
        title: "确认上传",
        text: "是否上传“" + unitName + "”污染地块？",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62",
        inputPlaceholder: "输入上传理由" 
    }, function () {
        //上报污染地块
    	
    });
}

/**
 * 不上报污染地块
 */
function shangbaoNo(enterId, unitName){
	swal({
        title: "确认不上传",
        text: "是否确认不上传“" + unitName + "”污染地块？",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#ec6c62",
//        text: "不上报理由：",
        inputPlaceholder: "输入不上传理由" 
    }, function (inputValue) {
    	console.log(inputValue);
    	if(inputValue!=false){//选择确定
	        //不上报污染地块
	    	ajaxPost("/seimp/lplw/updateReportStatus",{
	        	enterId:enterId,
	        	reportStatus : "3",
	        	reportReason : inputValue
	        }).done(function (result) {
	        	if(result.status == 0){
	        		swal("提交成功！", "","success");
	        		location.reload();
	        	}else{
	        		swal("提交失败！", "","error");
	        	}
	        })
    	}
    });
}


//排污许可证关联污染地块
//条件查询参数
var searchParams = {//清单模式查询条件
	enterId:"",
	joinType:"",
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
			field : 'WRDKMC',
			title : '污染地块名称',
			align : 'center',
		},{
			field : 'SCJDBM',
			title : '所处阶段',
			align : 'center',
		},{
			field : '',
			title : '操作',
            formatter :function(value,row,inde){
                var s = "<a href='javascript:void(0);'>定位</a>";
                return s;
            }
		}];
	//销毁表格
	$('#potential_info').bootstrapTable('destroy');
	//生成表格
	$('#potential_info').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/lplw/getWrdkDataByEnterId",
	    columns : columns,
	    //search:true,
	    //classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 5, 					
	    //striped : true, 				// 使表格带有条纹
	    pagination : true,				// 在表格底部显示分页工具栏
	    //showPaginationSwitch: true,       //是否显示选择分页数按钮
        clickToSelect: true,
	    sidePagination : "server",		// 表格分页的位置 client||server
//	    onlyInfoPagination:false,
	    queryParams: function queryParams(params) {   //设置查询参数  
	    	var datas = {};
	    	var data =  JSON.stringify({
	    		enterId:searchParams.enterId,
	    		joinType:searchParams.joinType,
	    		pageSize : params.limit,  //页面大小
	    		pageNumber : params.offset,   //页码
	    			    		
		    });
			
			datas.data = data;
			console.log(datas.data)
		    return datas;  
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
	    icons : {
	      refresh : "glyphicon-repeat",
	      toggle : "glyphicon-list-alt",
	      columns : "glyphicon-list"
	    }
	});
	
}

//查询        
function search() {
	searchParams.enterId = enterId;
	searchParams.joinType=$('input:radio[name="info"]:checked').attr("value");
	updateTable();
	console.log("1")
}

//单选按钮改变关联类型
//var type=$('input:radio[name="info"]:checked').attr("data");
//$("#type_name").html(type);
//$(".infoItem").change(function() {
//	  var type=$('input:radio[name="info"]:checked').attr("data");
//	  $("#type_name").html(type)	  
//});

//数据更新时间
ajaxPost("/seimp/lplw/getLastUpdateTime", {}).done(function (data) {
	if (data.status == 0) {		
		console.log(data.data.UPDATETIME);
		console.log($(".warn_UPDATETIME").html())
		$(".warn_UPDATETIME").html(data.data.UPDATETIME)
	}
})

//处理字符串为null的情况和没有值显示undefined的情况；
function handleNullStr(value){
	var result = "";
	if(value && value!="null"){
		result = value;		
	}
	return result;
}
