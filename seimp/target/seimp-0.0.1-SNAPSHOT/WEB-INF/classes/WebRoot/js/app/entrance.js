var entranceLayers = {};
var provinceTongJiTu = [];
var xianTongJiTU=[];
// 一屏幕显示
var CH = document.documentElement.clientHeight;
$('.entrance').css("minHeight",(CH -176)+ 'px');
getMenus();
function getMenus() {
    ajaxPost("/seimp/user/getMenus", {partID: 6}).done(function (data) {
        if (data.status == 0) {
            var html = "";
            var array = data.data;
			if(contains(array,"60")){
				html+='<li><a href="javascript:void(0);" id="entr_mubiao"><span><img src="img/mbwcqk.png"></span>' +
					'<span class="nav-label">目标完成情况</span><span class="fa arrow"></span></a></li>';
			}
            if(contains(array,"61")){
                html+='<li><a href="javascript:void(0);" id="entr_xiufuzhili"><span><img src="img/xfzljd.png"></span>' +
                    '<span class="nav-label">防治项目库</span><span class="fa arrow"></span></a></li>';
            }
            if(contains(array,"62")){
                html+='<li><a href="javascript:void(0);" id="entr_mubiao"><span><img src="img/mbwcqk.png"></span>' +
                    '<span class="nav-label">修复治理进展</span><span class="fa arrow"></span></a></li>';
            }
            if(contains(array,"63")){
                html+='<li><a href="javascript:void(0);" id="entr_shifanqu"><span><img src="img/lizi.png"></span>' +
                    '<span class="nav-label">先行示范区</span><span class="fa arrow"></span></a></li>';
            }
            if(contains(array,"64")){
                html+='<li><a href="javascript:void(0);" id="entr_kaohepinggu"><span><img src="img/khpg.png"></span>' +
                    '<span class="nav-label">考核评估</span><span class="fa arrow"></span></a></li>';
            }
            $("#side-menu").html(html);
            // 初始化菜单插件MetsiMenu
            $('#side-menu').metisMenu();
// 一二级菜单图标区分
            $('.map-view .sidebar-collapse').find('#side-menu').children('li').children('ul').find('a').children('span:first-child').addClass('fa fa fa-folder');
            $('.map-view .sidebar-collapse').find('#side-menu').children('li').children('a').children('span:first-child').addClass('fa fa fa-folder-o');
// 菜单层级分化
            $('.map-view .sidebar-collapse').find('#side-menu').children('li').
            children('ul').children('li').css({'padding-top':'10px'}).children('a').css({'padding-left':'40px','font-size':'12px','color':'rgb(155,155,155);'});
            $('.map-view .nav-main').children('li').css({'padding':'0'});
            $('.map-view .nav-main').children('li').children('a').css({'padding':'22px','border-bottom':'1px solid #ddd'});
        }
    });
};



function getTitleLayer(url,servername,map,layerName,visibleValue){
	entranceLayers[layerName] =  new ol.layer.Tile({
		source:new ol.source.TileWMS({
        	url: url,
        	params: {'LAYERS': servername},
        	serverType: 'geoserver'
        	//tileGrid: tileGrid
      	}),
      	visible:visibleValue
	});
	map.addLayer(entranceLayers[layerName])
}

function getTitleLayer2(url,servername,map,layerName,visibleValue){
	
		var vectorSource = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: function(extent) {
              //return 'http://localhost:60800/geoserver/lwb/ows?service=WFS'+
              //'&version=1.0.0&request=GetFeature&typeName=lwb:%E7%9C%81%E7%95%8C&maxFeatures=50&outputFormat=application%2Fjson'
            	//return 'http://localhost:60800/geoserver/lwb/ows?parseResponse=parseResponse&service=WFS&version=1.0.0&request=GetFeature&typeName=lwb:%E7%9C%81%E7%95%8C&maxFeatures=50&outputFormat=text%2Fjavascript';
            	return 'http://localhost:60800/geoserver/lwb/ows?service=WFS&version=1.0.0&request=GetFeature&typeName='+servername+'&maxFeatures=50&outputFormat=application/json';
            },
            strategy: ol.loadingstrategy.bbox
          });

		entrVisibleLayers[layerName] = new ol.layer.Vector({
            source:vectorSource,
            style:new ol.style.Style({
            	/*fill:new ol.style.Fill({
            		color:'#0E6CFA'
            	}),*/
            	stroke:new ol.style.Stroke({
            		color:'#0E6CFA',
            		width:1
            	})
            }),
            opacity:1,
            visible:visibleValue
          });
    	map.addLayer(entrVisibleLayers[layerName]);
	
}




function initProviceTongJiTu(){
	map.setView(new ol.View({  
		center: ol.proj.transform([117.192834,39.106542],'EPSG:4326', 'EPSG:3857'),
		projection: "EPSG:3857",
		zoom: 4,
    }));
	addTongjitu("beijing","北京市",[116.346,39.941],90,10,1);
	addTongjitu("hubeisheng","湖北省",[114.256,30.606],80,20,1);
	addTongjitu("gansusheng","甘肃省",[103.667,36.005],70,30,1);
	
	addTongjitu("xizang","西藏自治区",[91.093,29.521],75,25,1);
	addProvinceMouseEvent();
}

function addTongjitu(divName,provinceName,point,completeValue,undoneValue,level){
	var div;
	if($("#"+divName).length==0){
		//showProvinceTongJiTu();
		div = "<div id='"+divName+"' class='ol-popup ol-popup-en' isLevel='"+level+"' style='width:100px;height:100px;'></div>";
		$(".entrance").append(div);
		var pos = ol.proj.transform(point,'EPSG:4326', 'EPSG:3857');
		if(level=="1"){
			provinceTongJiTu.push(document.getElementById(divName));
		}else if(level=="3"){
			xianTongJiTU.push(document.getElementById(divName));
		}
		var popup = new ol.Overlay({
		        position: pos,
		        positioning: 'center-center',
		        element: document.getElementById(divName),
		        stopEvent: false
		});
		map.addOverlay(popup);
		addEcharts(divName,provinceName,completeValue,undoneValue);
		addClickEvent(divName);
	}else{
		$("#"+divName).show();
	}
	
	
}

function hideProvinceTongJiTu(level){
	var data;
	if(level==1){
		data = provinceTongJiTu;
	}else if(level==3){
		data = xianTongJiTU;
	}
	for (var i = 0; i < data.length; i++) {
		$(data[i]).hide();
	}
}

function showProvinceTongJiTu(){
	for (var i = 0; i < provinceTongJiTu.length; i++) {
		$(provinceTongJiTu[i]).show();
	}
}

function addEcharts(divName,provinceName,completeValue,undoneValue){
	var option  = {
		    tooltip: {
		        trigger: 'item',
		        formatter: "{a} <br/>{b}: {c} ({d}%)"
		    },
		    series: [
		        {
		            name:provinceName+'完成率',
		            type:'pie',
		            radius: ['50%', '70%'],
		            avoidLabelOverlap: false,
		            label: {
		                normal: {
		                    show: false,
		                    position: 'center'
		                },
		                emphasis: {
		                    show: true,
		                    textStyle: {
		                        fontSize: '10',
		                        fontWeight: 'bold'
		                    }
		                }
		            },
		            labelLine: {
		                normal: {
		                    show: false
		                }
		            },
		            data:[
		                {value:completeValue, name:'已完成'},
		                {value:undoneValue, name:'未完成'},
		                
		            ],
		            color:['#11CE32','#F5B822']
		        }
		    ]
		};
	
	 var myChart = echarts.init(document.getElementById(divName));
	 myChart.setOption(option);
}

function addClickEvent(divName){
	$("#"+divName).click(function(){
		
		var level = $(this).attr("islevel");
		hideProvinceTongJiTu(level);
		if(level=="3"){
			entranceLayers.shengjie.setVisible(true);
			entranceLayers.xianjie.setVisible(false);
			initProviceTongJiTu();
		}else if(level=="1"){
		
			entranceLayers.xianjie.setVisible(true);
			if(divName=="beijing"){
				map.setView(new ol.View({  
					center: ol.proj.transform([116.346,39.941],'EPSG:4326', 'EPSG:3857'),
					projection: "EPSG:3857",
					zoom: 8,
			    }));
				addTongjitu("yanqing","延庆县",[116.152,40.518],90,10,3);
				addTongjitu("miyun","密云县",[116.959,40.528],80,20,3);
			}else if(divName=="gansusheng"){
				map.setView(new ol.View({  
					center: ol.proj.transform([103.667,36.005],'EPSG:4326', 'EPSG:3857'),
					projection: "EPSG:3857",
					zoom: 8,
			    }));
				addTongjitu("yongjin","永靖县",[103.117,35.989],90,10,3);
				addTongjitu("yuzhong","榆中县",[104.244,35.978],80,20,3);
			}else if(divName=="hubeisheng"){
				map.setView(new ol.View({  
					center: ol.proj.transform([114.256,30.606],'EPSG:4326', 'EPSG:3857'),
					projection: "EPSG:3857",
					zoom: 8,
			    }));
				addTongjitu("yanmeng","云梦县",[113.769,31.001],90,10,3);
				addTongjitu("wuhan","武汉市",[114.298,30.377],80,20,3);
			}else if(divName=="xizang"){
				map.setView(new ol.View({  
					center: ol.proj.transform([91.093,29.521],'EPSG:4326', 'EPSG:3857'),
					projection: "EPSG:3857",
					zoom: 9,
			    }));
				addTongjitu("qushui","曲水县",[90.665,29.454],90,10,3);
				addTongjitu("damei","达枚县",[91.465,29.715],80,20,3);
			}
		}
		
	});
}

function addProvinceMouseEvent(){
	map.on()
}

/*********************变量*****************/
var entrRemoveLayers={};
var entrVisibleLayers={};

$(function(){
    //window.onload = init('.map-con');//initLayerMarker(2001,null,map);

    //initProviceTongJiTu();
	/*getTitleLayer("http://"+ip+"/geoserver/lwb/wms?","lwb:县界",map,"xianjie",false);
	getTitleLayer2("http://"+ip+"/geoserver/lwb/wms?","lwb:省界",map,"shengjie",true);
	getTitleLayer("http://"+ip+"/geoserver/lwb/wms?","lwb:省点",map,"shengdian",true);
	
	map.on("click",function(evt){
		var feature = map.forEachFeatureAtPixel(evt.pixel,
				function(feature) {
			return feature;
		});
		
		//如果选择了图形
		if (feature) {
			var html = "<table id='windowtale'>";
			var coordinates = feature.getGeometry().getCoordinates();
			var type = feature.get("type");
			if(type=="entr_mubiao"){
				var i = 0;
				if(feature.get("provinceName")=="河北省"){
					content.innerHTML = "<img src='img/entrance/map1.jpg' />";
					overlay.setPosition(coordinates);
				}
			}
		}
	})
	mubiaoClick("entr_mubiao");*/
})

/**********点击事件*******/
$("#entr_mubiao").click(function(){
	var id = $(this).attr("id");
	itemClickControl(id);
	mubiaoClick(id);
})

$("#entr_xiangmuku").click(function(){
	var id = $(this).attr("id");
	itemClickControl(id);
	xiangmukuClick(id);
})

$("#entr_xiufuzhili").click(function(){
	var id = $(this).attr("id");
	itemClickControl(id);
})

$("#entr_shifanqu").click(function(){
	var id = $(this).attr("id");
	itemClickControl(id);
	shifanquClick(id);
})

$("#entr_kaohepinggu").click(function(){
	var id = $(this).attr("id");
	itemClickControl(id);
})

/**********************目标完成情况************/
function mubiaoClick(id){
	setMapViewMercator([12032140.122701617, 4472165.751313683], 4);
	$.ajax({
		url:'City/getProvinceData.do',
		type:"POST",
		dataType:"JSON",
		success:function(data){
			if(data&&data.length>0){
				addmubiaoLayer(data,id);
			}
		}
	});
}

function addmubiaoLayer(data,id){
	var marker_features = [];//点集合
	for (var i = 0; i < data.length; i++) {
		var currData = data[i]
		if(currData.lon&&currData.lat){
			marker_features.push(new ol.Feature({
				type: 'icon',
				geometry: new ol.geom.Point(ol.proj.transform([currData.lon,currData.lat],'EPSG:4326', 'EPSG:3857')),
				//以下为添加属性
				provinceName:currData.name,
				feaId:currData.id,
				type: id
			}));
		}
	}
	
	entrRemoveLayers[id] = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: marker_features
		}),
		style:function(feature){
			var src= "img/entrance/hong.net.png";
			if(feature){
				var feaId = feature.get("feaId");
				if(feaId){
					if(feaId%4==0){
						var src= "img/entrance/hong.net.png";
					}else if(feaId%4==1){
						var src= "img/entrance/huang.net.png";
					}else if(feaId%4==2){
						var src= "img/entrance/lan.net.png";
					}else{
						var src= "img/entrance/lv.net.png";
					}
				}
			}
			return new ol.style.Style({
				image: new ol.style.Icon({
					anchor: [0.5, 1],
					src: src
				})
			});
			
		},
		title:id
		
	});
	map.addLayer(entrRemoveLayers[id]);
}

/**************防治项目库******************/
function xiangmukuClick(id){
	//添加表格参数
	tablePar = {
			id : 'dk_Table',
			url : 'xiangmuku/getXiangmukuData.do',
			//url : '/TRHJ/js/app/dk_Table.json',
			columns : [
			 		     {
			 		        field : 'id',
			 		        title : '序号',
			 		        align : 'center'
			 		      	}, 
			 		      {
			 		          field : 'name',
			 		          title : '项目名称',
			 		          align : 'center',
			 		        }, 
			 		      {
			 		        field : 'danwei',
			 		        title : '项目单位',
			 		        align : 'center',
			 		      },
			 		      {
				 		        field : 'suozaidi',
				 		        title : '所在地(市/县/乡镇)',
				 		        align : 'center',
				 		  	},
			 		      {
				 		      field : 'jiansheshijian',
				 		      title : '建设时间（年）',
				 		      align : 'center',
				 		  	}, 
				 		   {
				 		      field : 'wanchengshijian',
				 		      title : '完成时间（年）',
				 		      align : 'center',
				 		  	}, 
				 		   {
					 		   field : 'zijin',
					 		   title : '资金额度（万元）',
					 		   align : 'center',
				 		   }, 
			 		   ],
	};
	initBootstrapTable(tablePar);
}

function initBootstrapTable(parameter){
	//销毁表格
	$('#xinagmukuTable').bootstrapTable('destroy');
	//生成表格
	$('#xinagmukuTable').bootstrapTable({
	    method : 'POST',
	    url : parameter.url,
	    columns : parameter.columns,
	    //search:true,
	    classes:'table-no-bordered',	//消除表格边框
	    iconSize : "outline",
	    clickToSelect : true,			// 点击选中行
	    pageNumber : 1,
	    pageSize : 15, 					
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
};

/**************先行示范区****************/
function shifanquClick(id){
	setMapViewMercator([12677057.359356776, 3187965.6254904186], 6);
	var marker_features = [];//点集合
	marker_features.push(new ol.Feature({//浙江台州
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.transform([121.425846,28.668636],'EPSG:4326', 'EPSG:3857')),
		//以下为添加属性
		featrueName:'浙江台州土壤污染综合防治先行区'
	}));
	marker_features.push(new ol.Feature({//湖北黄石
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.transform([115.02876,30.197845],'EPSG:4326', 'EPSG:3857')),
		//以下为添加属性
		featrueName:'湖北黄石土壤污染综合防治先行区'
	}));
	marker_features.push(new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.transform([111.695795,29.054395],'EPSG:4326', 'EPSG:3857')),
		//以下为添加属性
		featrueName:'湖南常德土壤污染综合防治先行区'
	}));
	marker_features.push(new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.transform([113.58421,24.804104],'EPSG:4326', 'EPSG:3857')),
		//以下为添加属性
		featrueName:'广东韶关土壤污染综合防治先行区'
	}));
	marker_features.push(new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.transform([108.0758,24.702505],'EPSG:4326', 'EPSG:3857')),
		//以下为添加属性
		featrueName:'广西河池土壤污染综合防治先行区',
	}));
	marker_features.push(new ol.Feature({
		type: 'icon',
		geometry: new ol.geom.Point(ol.proj.transform([109.196154,27.726589],'EPSG:4326', 'EPSG:3857')),
		//以下为添加属性
		featrueName:'贵州铜仁土壤污染综合防治先行区',
	}));
	entrRemoveLayers[id] = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: marker_features
		}),
		style:function(feature){
			style = new ol.style.Style({
		        image: new ol.style.Icon({
		        	anchor:[0.5,1],
		        	src:"img/entrance/point_xxq.png"
		        }),
		        text: new ol.style.Text({
		          text: feature.get("featrueName"),
		          fill: new ol.style.Fill({
			            color: '#FF7F00'
			          }),
			      font:'italic small-caps 600 11px arial,sans-serif',
		          offsetY:10,
		          scale:1.5,
		          stroke:new ol.style.Stroke({
		        	  color:"white"
		          })
		        })
		      });
			return style;
			
		},
		title:id
		
	});
	map.addLayer(entrRemoveLayers[id]);
}


/**********页面控制************/
function itemClickControl(itemId){
	overlay.setPosition(undefined);
	content.innerHTML = "";
	closer.blur();
	overlay.setPosition(undefined);
	content.innerHTML = "";
	closer.blur();
	map.removeLayer(entrRemoveLayers["entr_mubiao"]);
	map.removeLayer(entrRemoveLayers["entr_shifanqu"]);
	switch (itemId) {
		case 'entr_mubiao':
			$("#table").hide();
			$("#map").show();
			visibleLayers("shengjie");
			break;
		case 'entr_xiangmuku':
			$("#table").show();
			$("#map").hide();
			visibleLayers("");
			break;
		case 'entr_xiufuzhili':
			$("#table").hide();
			$("#map").show();
			visibleLayers("");
			break;
		case 'entr_shifanqu':
			$("#table").hide();
			$("#map").show();
			visibleLayers("");
			break;
		case 'entr_kaohepinggu':
			$("#table").hide();
			$("#map").show();
			visibleLayers("");
			break;
			
	}
}


//隐藏其他菜单图层
function visibleLayers(layername){
	for(var item in entrVisibleLayers){
		if(item==layername){
			entrVisibleLayers[item].setVisible(true);
		}else{
			entrVisibleLayers[item].setVisible(false);
		}
	}
}

function removeLayers(){
	
}

/**
 * 给地图设置缩放级别和范围
 * @param point
 * @param zoom
 */
function setMapView(point,zoom){
	map.setView(new ol.View({
		center: ol.proj.transform(point,'EPSG:4326', 'EPSG:3857'),
		projection: "EPSG:3857",
		zoom: zoom,
		minZoom: 3, 
    }));
}

/**
 * 给地图设置缩放级别和范围
 * @param point
 * @param zoom
 */
function setMapViewMercator(point,zoom){
	map.setView(new ol.View({  
		center: point,
		projection: "EPSG:3857",
		zoom: zoom,
		minZoom: 3, 
    }));
}

