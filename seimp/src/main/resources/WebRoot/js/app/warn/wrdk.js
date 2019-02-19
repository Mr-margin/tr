// app.fLayerProvince.on("update-end",wrdk)
$(function(){
    ajaxPost("/seimp/share/getQYXXHC", {}).done(function (result) {
        $("#wrdk1").html("");
        $("#wrdk1").append('<option value="">请选择省、自治区</option>')
        for (var i = 0; i < result.rows.length; i++) {
            var currItem = result.rows[i];
            $("#wrdk1").append('<option value="' + currItem.code + '">' + currItem.name + '</option>');
        }
    });
})
//首先执行的方法
function  allPublic(){
    shengmian();
}
// 查询市
function getCity() {
    var  prov = $("#wrdk1 option:selected").text();
    ajaxPost("/seimp/eliminate/getCity", {province:prov}).done(function (result) {
        var html = '<option value="">请选择市、自治州</option>'
        $.each(result.data.result, function (i, item) {
            html += '<option value="'+item.code+'">'+item.name+'</option>';
        });
        $("#wrdk2").html(html);
    })

    $("#wrdk3").html("");
    $("#wrdk3").append('<option value="">请选择区、县</option>');

}
// 查询县
function getCounty() {
    var prov = $("#wrdk2 option:selected").text();
    ajaxPost("/seimp/eliminate/getCounty", {city: prov}).done(function (result) {
        var html ='<option value="">请选择区、县</option>';
        $.each(result.data.result, function (i, item) {
            html += '<option value="'+item.code+'">'+item.name+'</option>';
        });
        $("#wrdk3").html(html);
    })
}
//查询
function  search() {
    dengdai();//等待提示框
    app.map.infoWindow.remove();
    if ( app.diangraphicsLayer == null || app.diangraphicsLayer == undefined ) {
        app.diangraphicsLayer = new dong.GraphicsLayer({id: "diangraphicsLayer"});
        app.map.addLayer(app.diangraphicsLayer);
        app.map.getLayer("diangraphicsLayer").on("click", function (evt) {
            dianMessage(evt);
        })
    } else {
        app.diangraphicsLayer.clear();
    }
    if($("#bl").hasClass("active")) wrdk();
    if($("#dk").hasClass("active")) wrdk_dian(true)
    
}
//加载省的图层
function shengmian(){
    dengdai();//等待提示框
    app.fLayerProvince = new dong.FeatureLayer("http://"+ip+":6080/arcgis/rest/services/seimp/shengjienew/MapServer/0", {
        mode: dong.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        opacity:1,
        id:"countryFeatureLayer"
    });
    app.map.addLayer(app.fLayerProvince);

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
    app.fLayerProvince.setRenderer(renderer);
    app.countryGraphicsLayer = new dong.GraphicsLayer({id:"countryGraphicsLayer"});//数字图层
    app.map.addLayer(app.countryGraphicsLayer);

    app.fLayerProvince.on("update-end",wrdk)
    //百分比的点击事件
    app.map.getLayer("countryGraphicsLayer").on("click", function (evt) {
        console.log(evt);
        if ( !$("#bl").hasClass("active") && !$("#dk").hasClass("active")) return;
        dong.dianCode =evt.graphic.attributes.provoinceCode;
        if ($("#bl").hasClass("active") )$("#bl").click();

        if ($("#dk").hasClass("active") )  $("#dk").click();
        console.log(evt)
        // app.map.setExtent(evt.graphic._extent());
        // $(".esriSimpleSliderIncrementButton").click();
        // $(".esriSimpleSliderIncrementButton").click();
        if (evt.graphic.attributes.provoinceCode == "130000"){
            // var extent = new dong.Extent(handle_x(115.18),handle_y(38),handle_x(115.18),handle_y(38), new dong.SpatialReference({ wkid:102100 }));
            // app.map.setExtent(extent);
            var centerPoint = new dong.Point(handle_x(115.18),handle_y(38),new dong.SpatialReference({ wkid:102100 }));
            app.map.centerAndZoom(centerPoint,5);
        }else{
            var centerPoint = new dong.Point(evt.graphic.geometry.x,evt.graphic.geometry.y,new dong.SpatialReference({ wkid:102100 }));
            app.map.centerAndZoom(centerPoint,5);
            // var extent = new dong.Extent(evt.graphic.geometry.x,evt.graphic.geometry.y,evt.graphic.geometry.x,evt.graphic.geometry.y, new dong.SpatialReference({ wkid:102100 }));
            // app.map.setExtent(extent);
        }

        wrdk_dian(false);
    })
}
dong.dianCode = "";
//污染地块的比率数据
function wrdk(){
    var json = {wrdk1:$("#wrdk1").val(),wrdk2:$("#wrdk2").val(),wrdk3:$("#wrdk3").val(),wrdk4:$("#wrdk4").val(),wrdk5:$("#wrdk5").val(),wrdk6:$("#wrdk6").val(),}
    ajaxPost('/seimp/wrdk/getWrdk',json).done(function(result){
        removeDengdai();//删除等待框
      if(result.status == "0") {
          wrdkbl(result.data)
          wrdkTable()
      }
    })
}
//污染地块点位信息
function  wrdk_dian(flg){
    // app.diangraphicsLayer
    //点位图层
    dengdai();//等待提示框
    if ( app.diangraphicsLayer == null || app.diangraphicsLayer == undefined ) {
        app.diangraphicsLayer = new dong.GraphicsLayer({id: "diangraphicsLayer"});
        app.map.addLayer(app.diangraphicsLayer);
        app.map.getLayer("diangraphicsLayer").on("click", function (evt) {
            dianMessage(evt);
        })
        //添加鼠标进入事件
        app.map.getLayer("diangraphicsLayer").on("mouse-over",function(evt){
            removeGraphic("gewangover");
            var point = new dong.Point(evt.graphic.geometry.x,evt.graphic.geometry.y,new dong.SpatialReference({ wkid: 102100 }));
            var textSymbol = new dong.TextSymbol(evt.graphic.attributes.WRDKMC).setColor(new dong.Color([0,0,0,1]));
            textSymbol.font.setFamily("Times");
            textSymbol.font.setSize("13pt");
            textSymbol.font.setWeight(600);
            textSymbol.setOffset(0,40)
            var graphic = new dong.Graphic(point,textSymbol,{type:"gewangover",gewangID:evt.graphic.attributes.WRDKBM});
            app.map.graphics.add(graphic);
        })
        //添加鼠标移出事件
        app.map.getLayer("diangraphicsLayer").on("mouse-out",function(){
            removeGraphic("gewangover");
        })

    } else {
        app.diangraphicsLayer.clear();
    }
    var pointSymbol = new dong.PictureMarkerSymbol("img/dian/wurandikuai.png", 32, 32);
    pointSymbol.setOffset(0,16);
    var json = {wrdk1:$("#wrdk1").val(),wrdk2:$("#wrdk2").val(),wrdk3:$("#wrdk3").val(),wrdk4:$("#wrdk4").val(),wrdk5:$("#wrdk5").val(),wrdk6:$("#wrdk6").val(),code:dong.dianCode}
    if (flg){
        json.code="";
    } else {
        app.map.getLayer("countryGraphicsLayer").clear()
    }
    // app.map.getLayer("countryGraphicsLayer").clear()
    ajaxPost('/seimp/wrdk/getWrdklyl',json).done(function(result){
        removeDengdai();//删除等待框
        if(result.status == "0") {
            $.each(result.data,function(i,item){
                var point = new dong.Point(handle_x(item.WRDKZXJD),handle_y(item.WRDKZXWD), new dong.SpatialReference({ wkid: 102100 }));
                var graphic = new dong.Graphic(point,pointSymbol,"","");
                graphic.setAttributes( {WRDKBM:item.WRDKBM,WRDKMC:item.WRDKMC});
                app.diangraphicsLayer.add(graphic);
            })

        }
    })
}
//污染地块比率
function  wrdkbl (data) {
    app.map.getLayer("countryGraphicsLayer").clear();
    $.each(data.zong,function(i,item){
        var num = 0;
        $.each(data.fenzi,function(a,b){
            if ( item.PROVINCE_CODE == b.PROVINCE_CODE){
                if ( b.SCJDBM == "S4" || b.SCJDBM == "S5" || b.SCJDBM == "S6"){
                    num = num+b.COUNT;
                }
            }
        })
        item.bilv = ((num/item.COUNT)*100).toFixed(1);
    })
    data = data.zong;
    var feaGraphics = app.map.getLayer("countryFeatureLayer").graphics;
    //遍历省界图层的graphics
    for (var i = 0; i < feaGraphics.length; i++) {
        var currFeaGraphic = feaGraphics[i];
        //遍历数据
        for (var j = 0; j < data.length; j++) {
            var currItem = data[j];
            //判断省界的PROV_CODE属性值与当前数据的province属性值是否相同
            if (currFeaGraphic.attributes.PROV_CODE == currItem.PROVINCE_CODE) {
                var attributes = {
                    provoinceCode: currItem.PROVINCE_CODE,
                    provinceName: currItem.name
                }
                var point = currFeaGraphic.geometry.getCentroid();
                //处理河北省
                if (currFeaGraphic.attributes.PROV_CODE == "130000") {
                    point = new dong.Point([115.18, 38]);
                }
                var symbolSize = 45;
                var symbol1 = new dong.PictureMarkerSymbol("img/information/number.png", symbolSize, symbolSize).setOffset(0, symbolSize / 2);
                var symbol2 = new dong.TextSymbol(currItem.bilv+"%").setOffset(0, symbolSize / 2 - 5).setColor(new dong.Color([255, 255, 255, 1]));//.setHaloSize(3).setHaloColor(new Color([255,255,255]));
                symbol2.font.setFamily("Times");
                symbol2.font.setSize("10pt");
                symbol2.font.setWeight(600);
                var graphic1 = new dong.Graphic(point, symbol1, attributes);
                var graphic2 = new dong.Graphic(point, symbol2, attributes);
                app.map.getLayer("countryGraphicsLayer").add(graphic1);
                app.map.getLayer("countryGraphicsLayer").add(graphic2);
            }
        }
    }

}
//污染地块表格
function wrdkTable(){
    $('#wrdkTable').bootstrapTable('destroy');
    $('#wrdkTable').bootstrapTable({
        method: 'POST',
        url: "/seimp/wrdk/getWrdTable",
        cache: false, // 设置为 false 禁用 AJAX 数据缓存， 默认为true
        striped: true,  //表格显示条纹，默认为false
        pagination: true, // 在表格底部显示分页组件，默认false
        pageList: [10, 20], // 设置页面可以显示的数据条数
        pageSize: 10, // 页面数据条数
        pageNumber: 1, // 首页页码
        sidePagination: 'server', // 设置为服务器端分页
        queryParams: function (params) { // 请求服务器数据时发送的参数，可以在这里添加额外的查询参数，返回false则终止请求

            return {
                pageSize: params.limit, // 每页要显示的数据条数
                pageNumber: params.offset, // 每页显示数据的开始行号
                wrdk1:$("#wrdk1").val(),wrdk2:$("#wrdk2").val(),wrdk3:$("#wrdk3").val(),wrdk4:$("#wrdk4").val(),wrdk5:$("#wrdk5").val(),wrdk6:$("#wrdk6").val()
            }
        },
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
            if(data.status == 4){
                toastr.error("输入参数包含敏感字符");
            } else if (data.status == 0 ) {
                data = data.data;
            }

        },
        icons: {
            refresh: "glyphicon-repeat",
            toggle: "glyphicon-list-alt",
            columns: "glyphicon-list"
        },
        columns: [{
            title: '序号',//标题  可不加
            formatter: function (value, row, index) {
                return index + 1;
            }
        },
            {
                field: 'WRDKBM',
                title: '污染地块编码',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'name',
                title: '省',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'name1',
                title: '市',
                align: 'center',
                valign: 'middle',

            }, {
                field: 'name2',
                title: '县',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'WRDKMC',
                title: '污染地块名称',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'HYLB',
                title: '行业类别',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'ZDMJ',
                title: '占地面积',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'BZ',
                title: '污染地块备注',
                align: 'center',
                valign: 'middle',
            }, {
                field: 'PROVINCENAME',
                title: '操作',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                   return ' <button class="btn btn-success" onclick="dian_dingwei(\''+row.WRDKZXJD+'\',\''+row.WRDKZXWD+'\')"><i class="glyphicon glyphicon-map-marker mr5"></i>定位</button>'

                }
            }
        ]
    });
}
//点位定位
function dian_dingwei(x,y){
    if (x== "" ||x == undefined || x == null || y == "" || y == undefined || y ==null ) return toastr.warning("暂无该位置信息")
    return arcgisDw(x,y)
    if(app.dingweiLayer == null || app.dingweiLayer == undefined ) {
        app.dingweiLayer = new dong.GraphicsLayer({id: "dingweiLayer"});
        app.map.addLayer(app.dingweiLayer);
    } else {
        app.dingweiLayer.clear();
    }
    var pointSymbol = new dong.PictureMarkerSymbol("img/dian/tongyong.png", 32, 32);
    pointSymbol.setOffset(0,16);
    var point = new dong.Point(handle_x(x),handle_y(y), new dong.SpatialReference({ wkid: 3857 }));
    var graphic = new dong.Graphic(point,pointSymbol,"","");
    app.dingweiLayer.add(graphic);
    //定位
    var extent = new dong.Extent(handle_x(x),handle_y(y),handle_x(x),handle_y(y), new dong.SpatialReference({ wkid:3857 }));
    app.map.setExtent(extent);
}
//点击点出详细信息
function dianMessage(evt){
    app.map.getLayer("countryGraphicsLayer").clear();
    dengdai();//等待提示框
    ajaxPost('/seimp/wrdk/getDianMessage',{wrdkbm:evt.graphic.attributes.WRDKBM}).done(function(result){
        removeDengdai();//删除提示框
        if(result.status == "0") {
           var data=result.data[0];
            // var cPoint = new dong.Point([evt.graphic.geometry.x,evt.graphic.geometry.y],new dong.SpatialReference({ wkid:102100 }));
            // app.map.infoWindow.setTitle(data.WRDKMC);
            $("#title").html(data.WRDKMC);
            $("#title").attr("title",data.WRDKMC);
            var SCJDBM = {S0:"疑似地块",S1:"初步调查", S2: "详细调查", S3: "风险评估", S4:"风险管控", S5: "土壤修复与治理", S6: "土壤修复与治理评估"}
            var html = '<div class="row"><div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">地块名称：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+data.WRDKMC+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">行政区划：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+data.WRDKDZ+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">占地面积：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+data.ZDMJ+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">四至范围：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+data.DKSZFW+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">所处阶段：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+SCJDBM[data.SCJDBM]+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">联系人：</div><div class="col-sm-9 text-left" style="width: 78%;padding-left: 0;">'+data.SYQDWXR+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">联系电话：</div><div class="col-sm-9 text-left" style="padding:0;">'+data.SYQDWLXDH+'</div>' +
                '<div class="col-sm-3 text-right" style="width: 22%;padding-left: 0;">附近：</div><div class="col-sm-6 wrdk_posa"><a class="megl" href="javascript:void(0);" onclick="gongliDj(this,1)">1公里</a><a href="javascript:void(0);" onclick="gongliDj(this,5)" class="megl active">5公里</a><a href="javascript:void(0);" onclick="gongliDj(this,10)">10公里</a></div><div class="col-sm-3 wrdk_ipt"><input type="text" id="srgl" value="5">公里</div>' +
                '<div class="col-sm-12" style="height: 1px;background: #eeeeee;margin: 30px 0 10px;"></div><div class="col-sm-6 text-center" > <button type="button" class="btn btn-primary" onclick="jchpxm('+evt.graphic.geometry.x+','+evt.graphic.geometry.y+')">建设项目环评分析</button></div><div class="col-sm-6 text-center"> <button type="button" class="btn btn-primary" onclick="fjysyxfx('+evt.graphic.geometry.x+','+evt.graphic.geometry.y+')">附近易受影响分析</button></div></div>';
            $(".table-body").html(html);

            $("#tongjituDiv").show();
            $("#tongjituDiv").addClass("yj_table");
            $(".yj_table .table-body").height($(".yj_table .table-body .row").height()+10);
            $(".yj_table").css("minHeight",$(".yj_table .table-body .row").height()+50);
            // app.map.infoWindow.setContent(html);
            // app.map.infoWindow.show(cPoint);
            // app.map.infoWindow.resize("430",300);
            // $(".windowContent").css("overflow","scroll");
            // $(".close").click(function(){
            //     app.map.infoWindow.remove();
            // })
        }
    })
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
	$("#tongjituDiv #title").html("");
    $("#tongjituDiv .table-body").html("");
    var normalizedVal = dong.webMercatorUtils.xyToLngLat(lon, lat)
    if ($("#srgl").val() != "" && $("#srgl").val() != undefined && $("#srgl").val()!= null  ){
        dong.gongli = $("#srgl").val();
    }
    var circle = new dong.Circle([normalizedVal[0], normalizedVal[1]], {"radius" : dong.gongli * 1000})
    var extent = circle.getExtent();
    var num= 1;
    ajaxPost('/seimp/wrdk/getJchpfx',{xmin:extent.xmin,xmax:extent.xmax,ymin:extent.ymin,ymax:extent.ymax,type:""}).done(function(result){
        removeDengdai();//删除等待提示框
        if(result.status == "0") {
            console.log(result)
            if (result.data.length == 0 || JSON.stringify(result.data) == "[]") {
                toastr.warning("未查询到结果")
            } else {
                // for (var i = 0 ; i < 6;i ++ ){
                //     $(".esriSimpleSliderIncrementButton").click();
                // }
                // var extent = new dong.Extent(lon,lat,lon,lat, new dong.SpatialReference({ wkid:102100 }));
                // app.map.setExtent(extent);
                var centerPoint = new dong.Point(lon,lat,new dong.SpatialReference({ wkid:102100 }));
                app.map.centerAndZoom(centerPoint,11);
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/jianshexiangmu.png", 32, 32);
                pointSymbol.setOffset(0,16);
                var attrs = {
                    graType : "wurandikuaiGra"
                }
                app.map.getLayer("countryGraphicsLayer").clear();
                // app.diangraphicsLayer.clear();
                app.map.infoWindow.remove();
                var html='<div class="row" style="margin-top:10px;"><div class="col-sm-12"><label for="lastname" class="control-label pull-left">行业类型</label><div class="pull-left">' +
                    '<select id="pot_1" class="form-control" style="width:150px" onchange="hangyeType('+lon+','+lat+')"></select></div></div></div>'
                html += '<table class="table table-bordered wrdk-table"><thead><tr><th  width="12%">序号</th><th width="40%">项目名称</th><th width="25%">行业分类</th><th width="23%">操作</th></tr></thead><tbody id="hp_boty">';
                $.each(result.data,function(i,item){
                    var point = new dong.Point(item.LON2, item.LAT2);
                    if(circle.contains(point)){
                        var PROJECTNAME = item.PROJECTNAME;
                        if(item.PROJECTNAME.length>8) PROJECTNAME = item.PROJECTNAME.substr(0,8)+"...";
                        var EIAMANAGENAME = item.EIAMANAGENAME
                        if(item.EIAMANAGENAME.length>4) EIAMANAGENAME = item.EIAMANAGENAME.substr(0,4)+"...";
                        html += '<tr><th>'+num+'</th><th title="'+item.PROJECTNAME+'">'+PROJECTNAME+'</th><th title="'+item.EIAMANAGENAME+'">'+EIAMANAGENAME+'</th>' +
                            '<th><a onclick="arcgisDw('+item.LON2+','+item.LAT2+')">定位</a> &nbsp;&nbsp;<a onclick="hpMessage(\''+item.CONSTRUCTIONID+'\')">详情</a></th></tr>';
                        var point = new dong.Point(item.LON2, item.LAT2, new dong.SpatialReference({ wkid: 4326 }));
                        var graphic = new dong.Graphic(point,pointSymbol, attrs);
                        app.map.getLayer("countryGraphicsLayer").add(graphic);
                        num++;
                    }
                })
                html+= '</tbody></table>';
                var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
                    new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 1),
                    new dong.Color([255,255,255,0])
                );
                var attrs = {
                    graType : "circleGra"
                }
                var graphic = new dong.Graphic(circle, sfs, attrs);
                app.map.getLayer("countryGraphicsLayer").add(graphic);
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
                app.map.getLayer("countryGraphicsLayer").add(textGra);
                $("#tongjituDiv #title").html("环评项目分布");
                $("#tongjituDiv .table-body").html(html);
                ajaxPost('/seimp/wrdk/getJchpfxType',{}).done(function(result){
                    if (result.status == "0"){
                        var htmls = '<option value="">全部</option>';
                        $.each(result.data,function(i,item){
                            var ss = item.EIAMANAGENAME;
                            if (item.EIAMANAGENAME.length > 12 ){
                                ss = item.EIAMANAGENAME.substr(0,12)+"..."
                            }
                            htmls+='<option value="'+item.EIAMANAGENAME+'">'+ss+'</option>'
                        })
                        $("#pot_1").html(htmls)
                    }
                })
            }

        }
    })
}
//建设项目环评点位详细信息
function hpMessage(constructionId){
    ajaxPost('/seimp/wrdk/getJchpfxMessage',{constructionId:constructionId}).done(function(result){
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
    console.log($("#pot_1").val())
    ajaxPost('/seimp/wrdk/getJchpfx',{xmin:extent.xmin,xmax:extent.xmax,ymin:extent.ymin,ymax:extent.ymax,type:$("#pot_1").val()}).done(function(result){
        removeDengdai();//删除等待提示框
        if(result.status == "0") {
            if (result.data.length == 0 || JSON.stringify(result.data) == "[]") {
                toastr.warning("未查询到结果")
            } else {
                var centerPoint = new dong.Point(lon,lat,new dong.SpatialReference({ wkid:102100 }));
                app.map.centerAndZoom(centerPoint,11);
                var pointSymbol = new dong.PictureMarkerSymbol("img/dian/jianshexiangmu.png", 32, 32);
                pointSymbol.setOffset(0,16);
                var attrs = {
                    graType : "wurandikuaiGra"
                }
                app.map.getLayer("countryGraphicsLayer").clear();
                app.diangraphicsLayer.clear();
                app.map.infoWindow.remove();
                var html='';
                $.each(result.data,function(i,item){
                    var point = new dong.Point(item.LON, item.LAT);
                    if(circle.contains(point)){
                        var PROJECTNAME = item.PROJECTNAME;
                        if(item.PROJECTNAME.length>8) PROJECTNAME = item.PROJECTNAME.substr(0,8)+"...";
                        var EIAMANAGENAME = item.EIAMANAGENAME
                        if(item.EIAMANAGENAME.length>4) EIAMANAGENAME = item.EIAMANAGENAME.substr(0,4)+"...";
                        html += '<tr><th>'+num+'</th><th title="'+item.PROJECTNAME+'">'+PROJECTNAME+'</th><th title="'+item.EIAMANAGENAME+'">'+EIAMANAGENAME+'</th>' +
                            '<th><a onclick="arcgisDw('+item.LON+','+item.LAT+')">定位</a> &nbsp;&nbsp;<a onclick="hpMessage(\''+item.CONSTRUCTIONID+'\')">详情</a></th></tr>';
                        var point = new dong.Point(item.LON, item.LAT, new dong.SpatialReference({ wkid: 4326 }));
                        var graphic = new dong.Graphic(point,pointSymbol, attrs);
                        app.map.getLayer("countryGraphicsLayer").add(graphic);
                        num++;
                    }
                })
                var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
                    new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 1),
                    new dong.Color([255,255,255,0])
                );
                var attrs = {
                    graType : "circleGra"
                }
                var graphic = new dong.Graphic(circle, sfs, attrs);
                app.map.getLayer("countryGraphicsLayer").add(graphic);
                $("#hp_boty").html(html);
            }
        }
    })
}
//附近易受影响分析
function fjysyxfx(lon,lat){
	$("#tongjituDiv #title").html("");
    $("#tongjituDiv .table-body").html();
    dengdai();//等待提示框
    
    if ($("#srgl").val() != "" && $("#srgl").val() != undefined && $("#srgl").val()!= null  ){
        dong.gongli = $("#srgl").val();
    }
    var normalizedVal = dong.webMercatorUtils.xyToLngLat(lon, lat)
    var shuju =[];
    var name;
    var html = '<table class="table table-bordered wrdk-table"><thead><tr><th width="10%">序号</th><th width="45%">地址</th><th width="45%">名称</th></tr></thead><tbody>';
    var num =1;
    var aa =0;
    app.map.getLayer("countryGraphicsLayer").clear();
    // app.diangraphicsLayer.clear();
    app.map.infoWindow.remove();
    var circle = new dong.Circle([normalizedVal[0], normalizedVal[1]], {"radius" : dong.gongli * 1000})
    // for (var i = 0 ; i < 6;i ++ ){
    //     //     $(".esriSimpleSliderIncrementButton").click();
    //     // }
    //     // var extent = new dong.Extent(lon,lat,lon,lat, new dong.SpatialReference({ wkid:102100 }));
    //     // app.map.setExtent(extent);
    var centerPoint = new dong.Point(lon,lat,new dong.SpatialReference({ wkid:102100 }));
    app.map.centerAndZoom(centerPoint,11);
    var attrs = {
        graType : "circleGra"
    }
    var sfs = new dong.SimpleFillSymbol(dong.SimpleFillSymbol.STYLE_SOLID,
        new dong.SimpleLineSymbol(dong.SimpleLineSymbol.STYLE_DASHDOT,new dong.Color([255,0,0]), 1),
        new dong.Color([255,255,255,0])
    );
    var graphic = new dong.Graphic(circle, sfs, attrs);
    app.map.getLayer("countryGraphicsLayer").add(graphic);




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
    app.map.getLayer("countryGraphicsLayer").add(textGra);

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
dong.EARTH_RADIUS = 6378137.0;    //单位M
dong.PI = Math.PI;
//两点之间的距离
function getGreatCircleDistance(lat1,lng1,lat2,lng2){
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);
    var a = radLat1 - radLat2;
    var b = getRad(lng1) - getRad(lng2);
    var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s*EARTH_RADIUS;
    s = Math.round(s*10000)/10000.0;
    return s;
}
function getRad(d){
    return d*dong.PI/180.0;
}
$(function(){
    //污染地块分布/污染地块安全利用率---按钮切换
    $(".wrdk_tabs li").click(function(){
        if ( $(this).hasClass("active")) {
            $(this).removeClass('active');
            $(this).children("i").removeClass('glyphicon-eye-open');
            $(this).children("i").addClass('glyphicon-eye-close');
            if ($(this).context.getAttribute("data") == "污染地块安全利用率"){
                app.map.infoWindow.remove();
                try {
                    app.map.getLayer("countryGraphicsLayer").clear();
                } catch (e) {
                }
            } else if ($(this).context.getAttribute("data") == "污染地块分布"){
               try {
                   app.diangraphicsLayer.clear();
               }catch (e) {
               }
            }
        } else {
            app.map.setExtent(new dong.Extent(extentPar));
            $(this).children("i").removeClass('glyphicon-eye-close');
            $(this).addClass('active');
            $(this).children("i").addClass('glyphicon-eye-open');
            if ($(this).context.getAttribute("data") == "污染地块安全利用率"){
                search();
            } else if ($(this).context.getAttribute("data") == "污染地块分布"){
                wrdk_dian(true)
            }
        }
        // $(this).addClass("active").siblings(".wrdk_tabs li").removeClass("active");
        // $(this).children("i").addClass("glyphicon-eye-open").removeClass("glyphicon-eye-close");
        // $(this).siblings(".wrdk_tabs li").children("i").addClass("glyphicon-eye-close").removeClass("glyphicon-eye-open");
    })
    //map/表格---按钮切换1
    $(".wrdk_type li").click(function(){
        // $(this).addClass("active").siblings(".wrdk_type li").removeClass("active");
        if($(this).context.getAttribute("data") == "表格"){
            document.getElementById('wrdkTable').scrollIntoView()
        } else if($(this).context.getAttribute("data") == "地图"){
            document.getElementById('map').scrollIntoView()
        }
    })
    //map/表格---按钮切换2
    $(".wrdk_type1 li").click(function(){
        // $(this).addClass("active").siblings(".wrdk_type1 li").removeClass("active");
        if($(this).context.getAttribute("data") == "表格"){
            document.getElementById('wrdkTable').scrollIntoView()
        } else if($(this).context.getAttribute("data") == "地图"){
            document.getElementById('map').scrollIntoView()
        }
    })

})
$(document).ready(function(){
//	*****拖拽--start*****
	var $div = $("#tongjituDiv .table-title");
    /* 绑定鼠标左键按住事件 */
    $div.bind("mousedown", function (event) {
    	if($('.large').attr('data') == 1){
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
    $('.large').click(function(){
        if($(this).attr('data') == 1){
            $('#tongjituDiv ').css({
                top:0,
                right:0,
                left:0,
                width:'100%',
                height:'97%',
            })
            $(".table-title").css({
                top:'0px',
                right:0,
                left:0,
                width:'100%'
            })
            $(this).css('background-image','url("img/min_big.png")')
            $('.table-body').css('width','98%')
            $('.table-body').css('height','auto')
            $('.table-body table').css('width','100%')
            $(this).attr('data','2')
        }else{
            $(this).attr('data','1')
            $('#tongjituDiv').css({
                top:'116px',
                right:'79px',
                left:'auto',
                width:'464px',
                height:'auto',
            })
            $("#main_tabletitle").css({
                top:'116px',
                right:'79px',
                left:'auto',
                width:'464px',
            })
            $(this).css('background-image','url("img/max_big.png")')
            $('#main_tabletitle').addClass('main_tabletitle1')
            $('.table-body').css('width','98%')
            $('.table-body').css('height','auto')
            $('.table-body table').css('width','100%')
            $('.table-body table').css('height','92%')
        }

    })
//关闭统计表
$("#tongjituDiv  .switch").click(function(){
$("#tongjituDiv").hide();
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