//组织机构代码-专题图
function zuzhijigou_zhuanti (str){
    var jsonData = getConditionOfQueryCode({sheng:"",shi:"",xian:"",
    		jigouName:$("#jigouName").val()
    		});	
    var zjjgType = $("#jigouType").val();
    if (zjjgType != null) {
    	if (zjjgType[0] == "") {
    		//zjjgType.splice(0,1);
    		zjjgType = "";
    	}	
    } else if (zjjgType == null) {
    	zjjgType = "";
    }
    jsonData.zhuangtai = zjjgType;
    if ( str == "1" ) {
        jsonData.sheng=$("#provice").val();
        jsonData.shi = $("#city").val();
        jsonData.xian = $("#county").val();
        jsonData.jigouName = $("#jigouName").val();
        jsonData.str = str;
        chaxunDingwei_zhuantitu($("#provice").val(),$("#city").val(),$("#county").val())
        getQueryLayer();
        // 判断是市图层还是县图层
        if (dong.tucengType == "shi" ) {
        	app.shi.on("update-end",function(e){
        		addzzzgData(jsonData);
            }); 
        } else if (dong.tucengType == "xian" && $("#county").val() == "") { // 查询到市一级
        	app.xian.on("update-end",function(e){
        		addzzzgData(jsonData);
            }); 
        } else if (dong.tucengType == "sheng") {
        	addzzzgData(jsonData);
        } else if (dong.tucengType == "xian" && $("#county").val() != "") {
        	zuzhijigou_zhuantiMessage(jsonData.xian);
        }
    } else {
    	addzzzgData(jsonData);
    }
}
/**
 * 添加组织机构数据
 * @param jsonData
 */
function addzzzgData(jsonData) {
	dengdai();
	if (afterQueryAndBackProvice()) { // 点击过查询按钮并且是返回省
    	jsonData.sheng=dong.shengCode;
        jsonData.str ="1";
    }
	 ajaxPost("/seimp/yizhangtu/zuzhijigouCount", jsonData).done(function (result) {
	        removeDengdai();//删除等待框
	        if ( result.status == 0 ) {
	            if (JSON.stringify(result.data) != "[]"){
	                $("#tongjituDiv thead").html("");
	                $("#tongjituDiv tbody").html("");
	                var data = result.data;
	                if (dong.tucengType == "sheng"){
	                    shengShu(result.data);
	                } else if (dong.tucengType == "shi"){
	                    shiShu(result.data);
	                } else if ( dong.tucengType == "xian"){
	                    xianShu(result.data);
	                }
	                xzqhTable(result.data,"zuzhijigou");
	                // 显示详情
	                showOrganizationDetail(jsonData);
	            } else {
	            	removeTc("countLayer");
	                toastr.warning("未查询到结果")
	            }
	        } else {
	        	removeTc("countLayer");
	        	toastr.warning("未查询到结果");
	        }
	    })
}
/**
 * 组织机构详情
 * @param jsonData
 */
function showOrganizationDetail(jsonData){
	ajaxPost("/seimp/yizhangtu/organizationDetail", jsonData).done(function (result) {
        if ( result.status == 0 ) {
            if (JSON.stringify(result.data) != "[]"){
            	var resultData = result.data;
            	var barData = resultData.detail; // 柱状图数据
            	var nameNumOne = ""; // 污染地块最多的省
            	if (resultData.detail.length > 0) {
            		nameNumOne = resultData.detail[0].name;
            	}
            	var bar_xAxisData = [];
            	var bar_yAxisData = [];
            	var totalNumPloat = 0;
            	var barName;
        		var i = barData.length;
        		var yname;
        		var isProvinceOrCity = false; // 展示的是省市数据标识
        		var yst = 0;
        		if (result.data.yst[0]) {
        			yst = result.data.yst[0].COUNT;
        		}
        		if (jsonData.sheng == "" && jsonData.shi == "") { // 全国
					// 全国
        			yname = "省份名称";
					i = 9; 
            		if (barData.length <= 9) { // 全国数据展示前十个省
            			i = barData.length - 1;
            		}
            		$(".wrdk_barTip").empty();
            		$(".wrdk_barTip").append("<p>工商企业登记信息排名前十的省份</p>")
            		barName = "工商企业登记信息排名前十的省份";
				} else { // 市县
					// 省一节   市县数据不做展示数量限制
					isProvinceOrCity = true;
					var strButton = goingUpOneLevel(jsonData);
					yname = "市县名称";
					i = barData.length-1;
					$(".wrdk_barTip").empty();
            		$(".wrdk_barTip").append("<p>工商企业登记信息排名</p>" + strButton)
            		barName = "工商企业登记信息排名";
				}
            	for (i; i >=0; i--) { // 排名前十的数据
            		var temp = {
            				value:barData[i].COUNT,
            				code:barData[i].code
            		}
            		if (barData[i].name) {
            			bar_yAxisData.push(barData[i].name);
            			bar_xAxisData.push(temp);
            		}
            	}
            	showIntroduction(getCurrentCityName(),isProvinceOrCity,result.data.zs[0].COUNT,yst,nameNumOne); // 文字描述
            	creatBar(bar_yAxisData,bar_xAxisData,barName,yname,"个"); // 柱状图
            } else {
                toastr.warning("未查询到结果")
            }
        }
    })
}


//组织机构代码-分布图
function zuzhijigou_fenbu(num,str){
    dingweiUserLevel();
    dengdai();
    removeTc(fenbuDy[num]);
    var jsonData = {};
	// 需做判断处理，查全部时查切片图层，有条件时查另一个图层
	// 判断查询条件是否全部为空
	if (queryContionIsNull_zzjg()) {
		var layer = new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/QL_ORGANIZATION_CODE2/MapServer",{id:fenbuDy[num]});
	} else {
		var layer = new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/QL_ORGANIZATION_CODE/MapServer",{id:fenbuDy[num]});
	}
    var layerDefinitions = []; 
    var zjjgType = $("#jigouType").val();
    var whereZzjg = ""; // 组织机构查询条件
    if (zjjgType != null) {
    	if (zjjgType[0] == "") {
    		//zjjgType.splice(0,1);
    		zjjgType = "";
    		whereZzjg += " and JYZT0 like '"+zjjgType+"%'"
    	} else {
    		for (var i = 0; i < zjjgType.length; i++) {
    			if (i == 0) {
    				whereZzjg += " and JYZT0 like '"+zjjgType[i]+"%'"
    			} else {
    				whereZzjg += " or JYZT0 like '"+zjjgType[i]+"%'"
    			}
    		}
    	}	
    }
    layerDefinitions[0] = "XZQH0 like '"+$("#provice").val().substr(0,2)+"%' and XZQH0 like '"+$("#city").val().substr(0,4)+"%' and XZQH0 like '"+$("#county").val().substr(0,6)+"%'" +
        " and JGMC0 like '"+$("#jigouName").val()+"%'" + whereZzjg;
    layer.setLayerDefinitions(layerDefinitions);
    app.map.addLayer(layer);
    app.map.addLayer( new dong.ArcGISDynamicMapServiceLayer("http://"+ip+":6080/arcgis/rest/services/seimp/QL_ORGANIZATION_CODE/MapServer",{id:fenbuDy[num]}));
    chaxunDingwei_zhuantitu($("#provice").val(),$("#city").val(),$("#county").val()); // 高亮定位  
    app.map.getLayer(fenbuDy[num]).on("update-end",removeDengdai);
}
/**
 * 判断组织机构查询条件是否全部为空
 * @returns {Boolean}
 */
function queryContionIsNull_zzjg () {
	if ($("#provice").val() == "" && $("#city").val() == "" && $("#county").val()=="" && $("#jigouName").val() == ""
		&& $("#jigouType").val() == "") {
		return false;
	}
	return true;
}

//组织机构代码-专题图点位详细数据
function zuzhijigou_zhuantiMessage(code){
    dengdai();
    removeTc("countLayer");
    removeTc("diangraphicsLayer");
    app.diangraphicsLayer = new dong.GraphicsLayer({id: "diangraphicsLayer"});
    app.map.addLayer(app.diangraphicsLayer);
    app.diangraphicsLayer.on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.TYDM0,0);
    })
    //添加鼠标移出事件
    app.diangraphicsLayer.on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.TYDM0,1);
    })
    app.diangraphicsLayer.on("click",function(evt){
        tableDingwei(evt.pageX,evt.pageY);
        var src = "img/dian/zuzhijigou64_1.png";
        clickDian(evt.graphic.geometry.x,evt.graphic.geometry.y,src);
        console.log(evt)
        zuzhijigouMessage(evt.graphic.attributes.TYDM0,evt);
    })
    var queryObject = {
    	xian:code,
    	jigouName:$("#jigouName").val(),
    	zhuangtai:$("#jigouType option:selected").val()	
    }
    ajaxPost("/seimp/yizhangtu/zuzhijigouMessage", queryObject).done(function (result) {
        removeDengdai()
        if ( result.status == 0 ) {
            if (JSON.stringify(result.data) != "[]"){
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/zuzhijigou.png", 24, 24);
                pointSymbol.setOffset(0,0);
                $.each(result.data,function(i,item){
                    if( parseInt(item.LON)> 65.765135846784 && parseInt(item.LON) <150.23486415321602 && parseInt(item.LAT) > 13.1245384992698 && parseInt(item.LAT) < 54.8754615007302){
                        var point = new dong.Point(handle_x(item.LON),handle_y(item.LAT), new dong.SpatialReference({ wkid: 102100 }));
                        var graphic = new dong.Graphic(point,pointSymbol,"","");
                        graphic.setAttributes( {TYDM0:item.JGDM0,JGMC0:item.JGMC0});
                        app.diangraphicsLayer.add(graphic);
                    }
                })
                xzqhTable(result.data,"dianZuzhijigou","img/dian/zuzhijigou64_1.png");
                showCountyDetail(result.data,"dianZuzhijigou","img/dian/zuzhijigou64_1.png");
            }else toastr.warning("未查询到结果")

        }else toastr.warning("未查询到结果")
    })
}
//组织机构代码-分布图详细信息
function zuzhijigouMessage(id,evt){
    console.log(evt)
    dengdai()
    ajaxPost("/seimp/yizhangtu/zuzhijigouDianMessage", {id:id}).done(function (result) {
        removeDengdai()
        if(result.status == 0 ) {
            if (JSON.stringify(result.data) != "[]"){
            	var data = result.data[0];
                var JGDM0 = data.JGDM0,JGLX=data.JGLX,JGMC0=data.JGMC0,JJHY20110 =data.JJHY20110,JYFW0=data.JYFW0,JYZT0=data.JYZT0,TYDM0=data.TYDM0,ZCRQ0 = data.ZCRQ0;
                if( JGDM0 == undefined || JGDM0 == null) JGDM0 = ""
                if( JGLX == undefined || JGLX == null) JGLX = ""
                if( JGMC0 == undefined || JGMC0 == null) JGMC0 = ""
                if( JJHY20110 == undefined || JJHY20110 == null) JJHY20110 = ""
                if( JYFW0 == undefined || JYFW0 ==null) JYFW0 = ""
                if( JYZT0 == undefined || JYZT0 ==null) JYZT0 = ""
                if( TYDM0 == undefined || TYDM0 ==null) TYDM0 = ""
                if( ZCRQ0 == undefined || ZCRQ0 ==null) ZCRQ0 = ""
                $("#info_table1 #title").html(JGMC0);
                $("#info_table1 #title").attr("title",JGMC0);
                var html = '<div class="rows"><div class="row"><div class="col-sm-3 text-right p0" style="width:30%">组织机构代码：</div><div class="col-sm-9" style="width:70%">'+JGDM0+'</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0" style="width:30%">统一社会信用代码：</div><div class="col-sm-9" style="width:70%">'+TYDM0+'</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0" style="width:30%">机构名称：</div><div class="col-sm-9" style="width:70%">'+JGMC0+'</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0" style="width:30%">经济行业：</div><div class="col-sm-9" style="width:70%">'+JJHY20110+'</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0" style="width:30%">经营范围：</div><div class="col-sm-9" style="width:70%">'+JYFW0+'</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right p0" style="width:30%">状态：</div><div class="col-sm-9" style="width:70%">'+JYZT0+'</div></div>' +
                    // '<div class="row"><div class="col-sm-3 text-right p0" style="width:30%">成立日期：</div><div class="col-sm-9" style="width:70%">'+ZCRQ0+'</div></div>' +
                    '<div class="row"><div class="col-sm-3 text-right" style="width: 35%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="width: 65%;padding-left: 0;"><span data-toggle="modal" data-target="#pwModal" onclick=showOrganCodeDetailsModal(\"'+encodeURI(data.JGDM0)+'\",\"'+data.JGMC0+'\") style="color:#00A2DA;cursor:pointer;">详情信息</span></div></div>' +
                    '</div>';
                // $("#info_table1 .table-body").html(html);
                // $("#info_table1").show();
                // $("#info_table1").addClass("yj_table");
                // $("#info_table1 .table-body").height($(".yj_table .table-body .rows").height()+10);
                // $("#info_table1 ").css("minHeight",$(".yj_table .table-body .rows").height()+50);

                mapinfoWindow(JGMC0 + "(工商企业登记信息)",html,evt);
            } //else toastr.warning("未查询到结果")
            
        }
    })

}
function zuzhijigouChaxun(){
    if(dong.ztorfb=="分布图")  return zuzhijigou_fenbu(7,"1");
    else zuzhijigou_zhuanti("1");
}

//详情信息
function showOrganCodeDetailsModal(JGDM0, JGMC0){
	JGDM0 = decodeURI(JGDM0);
	var enterPriseInfo = {
			JGDM0:JGDM0
		};
	
	sessionStorage.setItem('dataIDJson', JSON.stringify(enterPriseInfo));
	$("#myModalLabel1").text(JGMC0);
	$("#detailsIframe").attr("src","views/data/detailIframe/organCodeDetails.html");
	$("#detailsDiv").show();
}
