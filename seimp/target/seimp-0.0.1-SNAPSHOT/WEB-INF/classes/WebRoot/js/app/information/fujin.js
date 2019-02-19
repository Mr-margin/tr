//污染地块点位的详细信息
function fujin(evt,num){
    dengdai();//等待提示框
    var json = {wrdkbm:evt.graphic.attributes.WRDKBM};
    if ( num == "11" ) json.yisi = "1";
    ajaxPost('/seimp/wrdk/getDianMessage',json).done(function(result){
        removeDengdai();//删除提示框
        if(result.status == "0") {
            app.countryGraphicsLayer = new dong.GraphicsLayer({id:"countryGraphicsLayer"});//数字图层
            app.map.addLayer(app.countryGraphicsLayer);
            var data=result.data[0];
            $("#info_table1 #title").html(data.WRDKMC);
            $("#info_table1 #title").attr("title",data.WRDKMC);
            var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"}
            var html = '<div class="rows"><div class="rows" style="overflow:auto;height:270px;"><div class="rows"><div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">地块名称：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(data.WRDKMC)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">行政区划：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(data.WRDKDZ)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">占地面积：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(data.ZDMJ)+'(㎡)</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">四至范围：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(data.DKSZFW)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">所处阶段：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+SCJDBM[data.SCJDBM]+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">联系人：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+handleNullValue(data.SYQDWXR)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">联系电话：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.SYQDWLXDH)+'</div></div>' +
                
                '</div>'+
                
                /*'<div class="rows" id="xiangqingRows" style="display:none;">'+
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">地块编码：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.BM)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">调查ID：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.CBDCID)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">电子邮箱：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.EMAIL)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">联系传真：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.FAX)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">法人代表：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.FRDB)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">风险级别：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.FXJB)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">工商执照：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.GSYYZZH)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">法人名称：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.SYQDWMC)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">时间戳：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.TSAMP)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">经度：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.WRDKZXJD)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">纬度：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.WRDKZXWD)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">邮政编码：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.YZBM)+'</div></div>' +
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">坐标说明：</div><div class="col-sm-9 text-left" style="padding:0;">'+handleNullValue(data.ZBSM)+'</div></div>' +
                '</div>'*/
                '</div>'+
                
                /*'<div class="row" id="showDetailsBtn" onclick="showDetails()"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="padding:0;"><span style="color:#00A2DA;cursor:pointer;"><a href="javascript:void(0);">详情信息</a></span></div></div>' +*/
                '<div class="row" id="showDetailsBtn" ><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;"></div><div class="col-sm-9 text-left" style="padding:0;"><span style="color:#00A2DA;cursor:pointer;"><a data-toggle="modal" data-target="#pwModal" href="javascript:void(0);" onclick=showDataDeDetailsModal("' + data.WRDKBM +'","'+ data.WRDKMC +'") >详情信息</a></span></div></div>' +
                
                '<div class="rows">'+
                '<hr style="margin: 5px 0;"/><p class="row" style="margin: 0;"><span class="col-sm-3 text-right" style="width: 22%;padding-left: 0;font-weight: bold;">附近查询</span></p>'+
                '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">距离：</div><div class="col-sm-6 wrdk_posa"><a class="megl" href="javascript:void(0);" onclick="gongliDj(this,1)">1公里</a><a href="javascript:void(0);" onclick="gongliDj(this,5)" class="megl active">5公里</a><a href="javascript:void(0);" onclick="gongliDj(this,10)">10公里</a></div><div class="col-sm-3 wrdk_ipt"><input type="text" id="srgl" value="5">公里</div></div>' +
                '<div class="anniu" style="margin-top: 10px;"><button type="button" style="margin-right:10%;" class="btn btn-primary" onclick="jchpxm('+evt.graphic.geometry.x+','+evt.graphic.geometry.y+')">环评项目分布</button><button type="button" class="btn btn-primary" onclick="fjysyxfx('+evt.graphic.geometry.x+','+evt.graphic.geometry.y+')">敏感点分布</button></div>' +
                '</div>';
            // $("#info_table1 .table-body").html(html);
            // $("#info_table1").show();
            // $("#info_table1").addClass("yj_table");
            // $("#info_table1 .table-body").css("overflowX","auto");
            // $("#info_table1 .table-body").height($(".yj_table .table-body .rows").height()+20);
            // $("#info_table1 ").css("minHeight",$(".yj_table .table-body .rows").height()+60);
            debugger;
            if ( num == "11" ){
            	 mapinfoWindow(data.WRDKMC + "(疑似污染地块)",html,evt);
            } else {
            	mapinfoWindow(data.WRDKMC + "(污染地块)",html,evt);
            }
           
        }
    })
}

//显示排污许可证详细信息
function toWrdkDetailsPage(WRDKBM){
	sessionStorage.setItem('WRDKBM', WRDKBM);
	$("#detailsIframe").attr("src","views/details/wrdkDetails.html");
	$("#detailsDiv").show();
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

dong.gongli = 5;
//附近公里点击
function  gongliDj(e,num){
    dong.gongli = num ;
    $("#srgl").val(num);
    $(e).siblings().removeClass("megl active");
    $(e).addClass("megl active");
}
//环评建设项目
function jchpxm(lon,lat){
    dengdai();//等待提示框
    $("#info_table1 #title").html("");
    $("#info_table1 .table-body").html("");
    var normalizedVal = dong.webMercatorUtils.xyToLngLat(lon, lat)
    if ($("#srgl").val() != "" && $("#srgl").val() != undefined && $("#srgl").val()!= null  ){
        dong.gongli = $("#srgl").val();
    }
    var circle = new dong.Circle([normalizedVal[0], normalizedVal[1]], {"radius" : dong.gongli * 1000})
    var extent = circle.getExtent();
    var num= 1;
    var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
        new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 3),
        new dong.Color([255,255,255,0])
    );
    var attrs = {
        graType : "circleGra"
    }
    var graphic = new dong.Graphic(circle, sfs, attrs);
    removeTc("countryGraphicsLayer2");
    removeTc("countryGraphicsLayer1");
    app.map.addLayer(new dong.GraphicsLayer({id: "countryGraphicsLayer2"}));
    app.map.addLayer(new dong.GraphicsLayer({id: "countryGraphicsLayer1"}));

    var extents = circle.getExtent();
    var textPoint = new dong.Point(extents.xmax, (extents.ymin+extents.ymax)/2);

    var textSymbol = new dong.TextSymbol(dong.gongli + "公里");
    textSymbol.setOffset((dong.gongli + "公里").length * 7, 0)
    textSymbol.setHaloSize(2)
    textSymbol.setHaloColor(new dong.Color([255, 255, 255]));
    textSymbol.setColor(new dong.Color([255,0,0]));
    var font  = new dong.Font();
    font.setSize("12pt");
    font.setWeight(dong.Font.WEIGHT_NORMAL);
    textSymbol.setFont(font);
    var attrs1 = {
        graType : "Gra"
    }
    var textGra = new dong.Graphic(textPoint, textSymbol, attrs1);
    app.map.infoWindow.show(new dong.Point(extents.xmax+0.015, (extents.ymin+extents.ymax)/2));

    app.map.getLayer("countryGraphicsLayer1").on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id,0);
    })
    //添加鼠标移出事件
    app.map.getLayer("countryGraphicsLayer1").on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id,1);
    })

    ajaxPost('/seimp/wrdk/getJchpfx',{xmin:extent.xmin,xmax:extent.xmax,ymin:extent.ymin,ymax:extent.ymax,type:""}).done(function(result){
        removeDengdai();//删除等待提示框
        if(result.status == "0") {
            if (result.data.length == 0 || JSON.stringify(result.data) == "[]") {
                toastr.warning("未查询到结果")
            } else {
                app.map.getLayer("countryGraphicsLayer2").add(graphic);
                app.map.reorderLayer(app.map.getLayer("countryGraphicsLayer2"),0)
                app.map.getLayer("countryGraphicsLayer1").add(textGra);

                app.map.infoWindow.remove();
                // var centerPoint = new dong.Point(lon,lat,new dong.SpatialReference({ wkid:102100 }));
                // app.map.centerAndZoom(centerPoint,11);
                app.map.setExtent(extent);
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/jianshexiangmu.png", 32, 32);
                pointSymbol.setOffset(0,16);
                var attrs = {
                    graType : "wurandikuaiGra"
                }

                // var html='<div class="row" style="margin-top:10px;"><div class="col-sm-12"><label for="lastname" class="control-label pull-left">行业类型</label><div class="pull-left">' +
                //     '<select id="pot_1" class="form-control" style="width:150px" onchange="hangyeType('+lon+','+lat+')"></select></div></div></div>'
                var html = '<table class="table table-bordered wrdk-table hyTable"><thead><tr><th  width="15%">序号</th><th width="40%">项目名称</th><th width="25%" style="position: relative;">行业分类<b class="caret"></b></a><select id="pot_1" onchange="hangyeType('+lon+','+lat+')" style="position: absolute;top: 18px;left: 0;opacity:0;filter:alpha(opacity=0);width:100%;color: #333;"></select></th><th width="20%">操作</th></tr></thead><tbody id="hp_boty">';
                var htmls = '<option value="">全部</option>';
                
                var temp=[];
                $.each(result.data,function(i,item){
                    var point = new dong.Point(item.LON2, item.LAT2);
                    if(circle.contains(point)){
                        var PROJECTNAME = item.PROJECTNAME;
                        if(item.PROJECTNAME.length>8) PROJECTNAME = item.PROJECTNAME.substr(0,8)+"...";
                        var EIAMANAGENAME = item.EIAMANAGENAME
                        if (EIAMANAGENAME == undefined ) {
                            EIAMANAGENAME = "";
                            item.EIAMANAGENAME="";
                        } else {
                            if(item.EIAMANAGENAME.length>4) EIAMANAGENAME = item.EIAMANAGENAME.substr(0,4)+"...";
                            if(temp.indexOf(EIAMANAGENAME) == -1){
                                temp.push(EIAMANAGENAME);
                                if(item.EIAMANAGENAME.length>4) EIAMANAGENAME = item.EIAMANAGENAME.substr(0,4)+"...";
                                htmls+='<option value="'+item.EIAMANAGENAME+'" title="'+item.EIAMANAGENAME+'">'+EIAMANAGENAME+'</option>';
                            }
                        }
                    // <a onclick="arcgisDw('+item.LON+','+item.LAT+')">定位</a> &nbsp;&nbsp
                        html += '<tr id="'+item.CONSTRUCTIONID+'" ondblclick="ondbclickDingwei('+item.LON2+','+item.LAT2+')"><td style="display:none;">'+handle_x(item.LON2)+','+handle_y(item.LAT2)+'</td><td>'+num+'</td><td title="'+item.PROJECTNAME+'">'+PROJECTNAME+'</td><td title="'+item.EIAMANAGENAME+'">'+EIAMANAGENAME+'</td>' +
                            '<td><a onclick="hpMessage(\''+item.CONSTRUCTIONID+'\')">详情</a></td></tr>';
                        var point = new dong.Point(item.LON2, item.LAT2, new dong.SpatialReference({ wkid: 4326 }));
                        var graphic = new dong.Graphic(point,pointSymbol, attrs);
                        graphic.setAttributes( {id:item.CONSTRUCTIONID});
                        app.map.getLayer("countryGraphicsLayer1").add(graphic);
                        num++;
                    }
                })

                var src = "img/dian/wurandikuai64_2.png";
                if ( dong.num == "11") src = "img/dian/yisiwrdk64_1.png";
                clickDian(lon,lat,src);
                html+= '</tbody></table>';

                $("#info_table1 #title").html("环评项目分布");
                $("#info_table1 .table-body").html(html);
                $("#pot_1").html(htmls)
                changBkColor1("img/dian/jianshexiangmu_1.png");
                $("#info_table1").show();
                // var json  ={};
                // json.graphic.geometry.x=normalizedVal[0];
                // json.graphic.geometry.y=normalizedVal[1]
                // mapinfoWindow("环评项目分布",html,json)
            }
        }
    })
}
//建设项目环评点位详细信息
function hpMessage(constructionId){
    ajaxPost('/seimp/wrdk/getJchpfxMessage',{constructionId:constructionId}).done(function(result){
        if ( result.status == "0" ) {
            var data = result.data[0];
            var PROJECTNAME = data.PROJECTNAME;
            var PROJECTADDRESS = data.PROJECTADDRESS;
            var NATIONALECONOMYNAME = data.NATIONALECONOMYNAME;
            var EIAMANAGENAME = data.EIAMANAGENAME;
            if ( PROJECTNAME.length >16) PROJECTNAME = PROJECTNAME.substr(0,16)+"...";
            if(EIAMANAGENAME.length>16) EIAMANAGENAME = EIAMANAGENAME.substr(0,16)+"..."
            if ( NATIONALECONOMYNAME.length>16) NATIONALECONOMYNAME = NATIONALECONOMYNAME.substr(0,16)+"...";
            if (PROJECTADDRESS.length > 16 ) PROJECTADDRESS = PROJECTADDRESS.substr(0,16)+"...";



            var html = '<div class="row"><div class="col-sm-4 text-right">项目名称：</div><div class="col-sm-8 text-left" title="'+data.PROJECTNAME+'">'+PROJECTNAME+'</div>' +
                '<div class="col-sm-4 text-right">环评文件类别：</div><div class="col-sm-8 text-left" title="'+data.EIAFILETYPE+'">'+data.EIAFILETYPE+'</div>' +
                '<div class="col-sm-4 text-right">受理日期：</div><div class="col-sm-8 text-left" title="'+data.ACCEPTANCEDATE+'">'+data.ACCEPTANCEDATE+'</div>' +
                '<div class="col-sm-4 text-right">国民经济代码：</div><div class="col-sm-8 text-left" title="'+data.NATIONALECONOMYCODE+'">'+data.NATIONALECONOMYCODE+'</div>' +
                '<div class="col-sm-4 text-right">数据来源：</div><div class="col-sm-8 text-left" title="'+data.DATASOURCE+'">'+data.DATASOURCE+'</div>' +
                '<div class="col-sm-4 text-right">环评管理类别：</div><div class="col-sm-8 text-left" title="'+data.EIAMANAGETYPE+'">'+data.EIAMANAGETYPE+'</div>' +
                '<div class="col-sm-4 text-right">建设地点：</div><div class="col-sm-8 text-left" title="'+data.PROJECTADDRESS+'">'+PROJECTADDRESS+'</div>' +
                '<div class="col-sm-4 text-right">总投资（万元）：</div><div class="col-sm-8 text-left" title="'+data.PROJECTINVEST+'">'+data.PROJECTINVEST+'</div>' +
                '<div class="col-sm-4 text-right">环保投资（万元）：</div><div class="col-sm-8 text-left" title="'+data.ENVIRONINVEST+'">'+data.ENVIRONINVEST+'</div>' +
                '<div class="col-sm-4 text-right">对接省份名称：</div><div class="col-sm-8 text-left" title="'+data.PROVINCENAME+'">'+data.PROVINCENAME+'</div>' +
                '<div class="col-sm-4 text-right">国民经济类别名称：</div><div class="col-sm-8 text-left" title="'+data.NATIONALECONOMYNAME+'">'+NATIONALECONOMYNAME+'</div>' +
                '<div class="col-sm-4 text-right">环评管理类别名称：</div><div class="col-sm-8 text-left" title="'+data.EIAMANAGENAME+'">'+EIAMANAGENAME+'</div>' +
                '<div class="col-sm-4 text-right">入监管平台时间：</div><div class="col-sm-8 text-left" title="'+data.STORAGETIME+'">'+data.STORAGETIME+'</div>' ;
            $("#tongjituDiv_2 #title1").html(data.PROJECTNAME);
            $("#tongjituDiv_2 .table-body").html(html);
            $("#tongjituDiv_2 .table-body").css("overflow","hidden");

            $("#tongjituDiv_2").show();
        }
    })
}
//建设项目环评行业类型选择
function hangyeType(lon,lat){
    dengdai();//等待提示框
    var normalizedVal = dong.webMercatorUtils.xyToLngLat(lon, lat)
    var circle = new dong.Circle([normalizedVal[0], normalizedVal[1]], {"radius" : dong.gongli * 1000})
    var extent = circle.getExtent();
    var num= 1;
    ajaxPost('/seimp/wrdk/getJchpfx',{xmin:extent.xmin,xmax:extent.xmax,ymin:extent.ymin,ymax:extent.ymax,type:$("#pot_1").val()}).done(function(result){
        removeDengdai();//删除等待提示框
        if(result.status == "0") {
            if (result.data.length == 0 || JSON.stringify(result.data) == "[]") {
                $("#hp_boty").html("");
                toastr.warning("未查询到结果")
            } else {
                removeTc("countryGraphicsLayer1");
                app.map.addLayer(new dong.GraphicsLayer({id: "countryGraphicsLayer1"}));
                app.map.getLayer("countryGraphicsLayer1").on("mouse-over", function (evt) {
                    tableHight(evt.graphic.attributes.id,0);
                })
                //添加鼠标移出事件
                app.map.getLayer("countryGraphicsLayer1").on("mouse-out", function (evt) {
                    tableHight(evt.graphic.attributes.id,1);
                })
                var centerPoint = new dong.Point(lon,lat,new dong.SpatialReference({ wkid:102100 }));
                app.map.centerAndZoom(centerPoint,11);
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/jianshexiangmu.png", 32, 32);
                pointSymbol.setOffset(0,16);
                var attrs = {
                    graType : "wurandikuaiGra"
                }
                var html='';
                $.each(result.data,function(i,item){
                    var point = new dong.Point(item.LON2, item.LAT2);
                    if(circle.contains(point)){
                        var PROJECTNAME = item.PROJECTNAME;
                        if(item.PROJECTNAME.length>8) PROJECTNAME = item.PROJECTNAME.substr(0,8)+"...";
                        var EIAMANAGENAME = item.EIAMANAGENAME
                        if(item.EIAMANAGENAME.length>4) EIAMANAGENAME = item.EIAMANAGENAME.substr(0,4)+"...";
                        html += '<tr id="'+item.CONSTRUCTIONID+'" ondblclick="ondbclickDingwei('+item.LON2+','+item.LAT2+')"><td style="display:none;">'+handle_x(item.LON2)+','+handle_y(item.LAT2)+'</td><td>'+num+'</td><td title="'+item.PROJECTNAME+'">'+PROJECTNAME+'</td><td title="'+item.EIAMANAGENAME+'">'+EIAMANAGENAME+'</td>' +
                            '<td><a onclick="hpMessage(\''+item.CONSTRUCTIONID+'\')">详情</a></td></tr>';
                        var point = new dong.Point(item.LON2, item.LAT2, new dong.SpatialReference({ wkid: 4326 }));
                        var graphic = new dong.Graphic(point,pointSymbol, attrs);
                        graphic.setAttributes( {id:item.CONSTRUCTIONID});
                        app.map.getLayer("countryGraphicsLayer1").add(graphic);
                        num++;
                    }
                })
                var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
                    new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]),3),
                    new dong.Color([255,255,255,0])
                );
                var attrs = {
                    graType : "circleGra"
                }
                var graphic = new dong.Graphic(circle, sfs, attrs);
                app.map.getLayer("countryGraphicsLayer1").add(graphic);
                $("#hp_boty").html(html);
                //中心点坐标
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/central.png", 64, 64);
                pointSymbol.setOffset(0,16);
                var point = new dong.Point(lon, lat, new dong.SpatialReference({ wkid: 102100 }));
                var graphic = new dong.Graphic(point,pointSymbol, attrs);
                graphic.setAttributes( {id:""});
                app.map.getLayer("countryGraphicsLayer1").add(graphic);
                changBkColor1("img/dian/jianshexiangmu_1.png");
            }
        }
    })
}
//附近易受影响分析
function fjysyxfx(lon,lat){
    app.map.infoWindow.remove();
    $("#info_table1 #title").html("");
    $("#info_table1 .table-body").html("");
    dengdai();//等待提示框
    removeTc("countryGraphicsLayer2");
    removeTc("countryGraphicsLayer1");
    app.map.addLayer(new dong.GraphicsLayer({id: "countryGraphicsLayer2"}));
    app.map.addLayer(new dong.GraphicsLayer({id: "countryGraphicsLayer1"}));
    if ($("#srgl").val() != "" && $("#srgl").val() != undefined && $("#srgl").val()!= null  ){
        dong.gongli = $("#srgl").val();
    }
    var normalizedVal = dong.webMercatorUtils.xyToLngLat(lon, lat)
    var shuju =[];
    var name;
    var html = '<table class="table table-bordered wrdk-table"><thead><tr><th width="10%">序号</th><th width="45%">名称</th><th width="45%">地址</th></tr></thead><tbody>';
    var num =1;
    var aa =0;
    var circle = new dong.Circle([normalizedVal[0], normalizedVal[1]], {"radius" : dong.gongli * 1000})
    var centerPoint = new dong.Point(lon,lat,new dong.SpatialReference({ wkid:102100 }));

    app.map.setExtent(circle.getExtent());
    var attrs = {
        graType : "circleGra"
    }
    var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
        new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 3),
        new dong.Color([255,255,255,0])
    );
    var graphic = new dong.Graphic(circle, sfs, attrs);
    app.map.getLayer("countryGraphicsLayer2").add(graphic);
    app.map.reorderLayer(app.map.getLayer("countryGraphicsLayer2"),0)

    var extents = circle.getExtent();
    var textPoint = new dong.Point(extents.xmax, (extents.ymin+extents.ymax)/2);

    var textSymbol = new dong.TextSymbol(dong.gongli + "公里");
    textSymbol.setOffset((dong.gongli + "公里").length * 7, 0)
    textSymbol.setHaloSize(2)
    textSymbol.setHaloColor(new dong.Color([255, 255, 255]));
    textSymbol.setColor(new dong.Color([255,0,0]));
    var font  = new dong.Font();
    font.setSize("12pt");
    font.setWeight(dong.Font.WEIGHT_NORMAL);
    textSymbol.setFont(font);
    var textGra = new dong.Graphic(textPoint, textSymbol, attrs);
    app.map.getLayer("countryGraphicsLayer1").add(textGra);
    app.map.getLayer("countryGraphicsLayer1").on("mouse-over", function (evt) {
        tableHight(evt.graphic.attributes.id,0);
    })
    app.map.getLayer("countryGraphicsLayer1").on("mouse-out", function (evt) {
        tableHight(evt.graphic.attributes.id,1);

    })
    for ( var i = 0 ; i < 3; i ++ ){
        if ( i == 0 ) {
            name = "学校";
        } else if ( i ==1 ) {
            name = "医院";
        } else if ( i == 2 ) {
            name = "住宅";
        }
        var url = "http://www.tianditu.com/query.shtml?postStr={\"keyWord\":\""+name+"\",\"level\":\"15\",\"mapBound\":\"116.40466,39.90684,116.45016,39.93138\",\"queryType\":\"3\",\"pointLonlat\":\""+normalizedVal[0]+","+normalizedVal[1]+"\",\"queryRadius\":\""+dong.gongli*1000+"\",\"count\":\"20\",\"start\":\"0\"}&type=query"
        $.ajax({
        	url: url,
        	data:{},
        	type: "GET",
        	dataType:'json',
        	success:function(result) {
                aa++;
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/xuexiao.png", 32, 32);
                var ss ="";
                if (result.keyWord == "学校"){
                   pointSymbol = new dong.PictureMarkerSymbol("img/dian/xuexiao.png", 32, 32);
                    ss = "xuexiao";
                } else if (result.keyWord == "医院"){
                    pointSymbol = new dong.PictureMarkerSymbol("img/dian/yiyuan.png", 32, 32);
                    ss = "yiyuan"
                } else if(result.keyWord == "住宅"){
                    pointSymbol = new dong.PictureMarkerSymbol("img/dian/zhuzhai.png", 32, 32);
                    ss = "zhuzhai"
                }
                pointSymbol.setOffset(0,16);
                var attrs = {
                    graType : "wurandikuaiGra"
                }
                if (result.pois!=null && result.pois!=undefined && result.pois!= ""){
                    $.each(result.pois,function(i,item){
                        var p = item.lonlat.split(" ")
                        var point = new dong.Point(handle_x(p[0]),handle_y(p[1]), new dong.SpatialReference({ wkid: 102100 }));
                        if(circle.contains(point)){
                             html += '<tr id="poi'+num+'" ondblclick="ondbclickDingwei('+p[0]+','+p[1]+')"><td style="display:none;">'+handle_x(p[0])+','+handle_y(p[1])+','+ss+'</td><td>'+num+'</td><td>'+item.name+'</td><td>'+item.address+'</td></tr>';
                             var graphic = new dong.Graphic(point,pointSymbol, attrs);
                             graphic.setAttributes( {id:"poi"+num});
                             app.map.getLayer("countryGraphicsLayer1").add(graphic);
                             num++;
                         }
                     })
                 } else {
                     toastr.warning(result.keyWord+"未查询到结果")
                 }
                 if ( aa == 3 ) {
                     html+= '</tbody></table>';
                     $("#info_table1 #title").html("敏感点分布");
                     $("#info_table1 .table-body").html(html);
                     changBkColor1("poi");
                     $("#info_table1").show();

                     var src = "img/dian/wurandikuai64_2.png";
                     if ( dong.num == "11") src = "img/dian/yisiwrdk64_1.png";
                     clickDian(lon,lat,src);
                     removeDengdai();//删除等待提示框

                 }
        	},
        	error:function(er){
        		 removeDengdai();//删除等待提示框
        	}
        });
     }
}


//清空附近的点
function removeFujin(){
    try {
        app.map.removeLayer(app.map.getLayer("countryGraphicsLayer"))
        app.map.removeLayer(app.map.getLayer("countryGraphicsLayer1"))
        app.map.removeLayer(app.map.getLayer("countryGraphicsLayer2"))
    }  catch (e) {
        
    }
}

//详情信息
function showDataDeDetailsModal(WRDKBM, WRDKMC){
	var enterPriseInfo = {
			WRDKBM:WRDKBM
		};
	
	sessionStorage.setItem('dataIDJson', JSON.stringify(enterPriseInfo));
	$("#myModalLabel1").text(WRDKMC);
	$("#detailsIframe").attr("src","views/data/detailIframe/dataDeDetails.html");
	$("#detailsDiv").show();
}
