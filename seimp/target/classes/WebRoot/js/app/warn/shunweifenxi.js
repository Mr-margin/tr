var buttontypes=1;
var y=0;

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
var qiYeIndustryArr=[{id:"有色金属矿采选业,有色金属采选业",name:"有色金属矿采选"},{id:"有色金属冶炼,有色金属冶炼和压延加工业",name:"有色金属冶炼"},{id:"none_1",name:"石油开采"},
                     {id:"石油加工,石油加工业",name:"石油加工"},{id:"化工,化工原料和化工制品制造业",name:"化工"},{id:"石油加工、炼焦及核燃料加工业",name:"焦化"},{id:"none_2",name:"电镀"},{id:"皮革、毛皮、羽毛及其制品和制鞋业,皮革、毛皮、羽毛(绒)及其制品业,皮革、毛皮、羽毛（绒）及其制品业,皮革、毛皮、羽毛及其制品和制造业",name:"制革"}];
var allQiYeIndustryArr=[{id:"有色金属矿采选业,有色金属采选业",name:"有色金属矿采选"},{id:"有色金属冶炼,有色金属冶炼和压延加工业",name:"有色金属冶炼"},{id:"none_1",name:"石油开采"},
                        {id:"石油加工,石油加工业",name:"石油加工"},{id:"化工,化工原料和化工制品制造业",name:"化工"},{id:"石油加工、炼焦及核燃料加工业",name:"焦化"},{id:"none_2",name:"电镀"},{id:"皮革、毛皮、羽毛及其制品和制鞋业,皮革、毛皮、羽毛(绒)及其制品业,皮革、毛皮、羽毛（绒）及其制品业,皮革、毛皮、羽毛及其制品和制造业",name:"制革"},
						{id:"医药,医药制造,医药制造业",name:"医药制造"},{id:"none_3",name:"铅酸蓄电池制造"},{id:"none_4",name:"废旧电子拆解"},
						{id:"危险废物处理处置",name:"危险废物处理处置"},{id:"none_5",name:"危险化学品生产、存储、使用"}];

var qiYeIndustryArr2=[{id:"有色金属矿采选,有色金属矿采选业",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                     {id:"石油加工,石油加工及石油制品制造,石油加工及石油制品制造,精炼石油产品制造",name:"石油加工"},{id:"化工,有机化工",name:"化工"},{id:"焦化,钢铁、焦化,炼焦行业,炼焦,炼焦业",name:"焦化"},{id:"电镀,电镀行业",name:"电镀"},{id:"制革",name:"制革"}];
var allQiYeIndustryArr2=[{id:"有色金属矿采选,有色金属矿采选业 ",name:"有色金属矿采选"},{id:"有色金属冶炼",name:"有色金属冶炼"},{id:"石油开采",name:"石油开采"},
                         {id:"石油加工,石油加工及石油制品制造,石油加工及石油制品制造,精炼石油产品制造",name:"石油加工"},{id:"化工,有机化工",name:"化工"},{id:"焦化,钢铁、焦化,炼焦行业,炼焦,炼焦业",name:"焦化"},{id:"电镀,电镀行业",name:"电镀"},{id:"制革",name:"制革"},
						{id:"none_1",name:"医药制造"},{id:"蓄电池制造",name:"铅酸蓄电池制造"},{id:"废旧电器电子拆解",name:"废旧电子拆解"},
						{id:"危险废物治理,危险废物处理",name:"危险废物处理处置"},{id:"none_2",name:"危险化学品生产、存储、使用"}];
//图片名称对应数组
//var pictureArr={};
var graphicsLayer = null;
var xiangmuType = "1";//项目类型 1：遥感核查 2：地方自报
var mapType = "1";//地图：1：全国模式 2：某一省的所有市模式 3：某一个市的所有点位模式

var graphicsLayer = null;
var provinceClick = null;//省界高亮
var provinceExtent = null;//省界边界
var provinceCode = null;//省code
var cityClick = null;//县界高亮
var cityExtent = null;//县界边界
var cityCode = null;//县code
var mapIndustry = "";//地图模式的行业类别

//图例
var countryMinCount = null;
var countryCount = null;
var provinceMinCount = null;
var provinceCount = null;


$(function(){
	yghc();
});

//判断是国家级用户，还是省级用户，默认显示图层不同
function initLayerByUser(){
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
		//判断用户是否是省级用户
		var storage = window.sessionStorage;
		//管理员、国家级用户
		if(storage.getItem("userLevel")==null || storage.getItem("userLevel")=="0" || storage.getItem("userLevel")=="1"){
			//更新全国模式
			if(xiangmuType=="1"){
				updateCountry_1(true);
			}else if(xiangmuType=="2"){
				updateCountry_2(true);
			}
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
			if(xiangmuType=="1"){
				updateProvince_1(true);
			}else if(xiangmuType=="2"){
				updateProvince_2(true);
			}
			
		}
	})
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
		ajaxPost("/seimp/pic/getWrdkYghcData.do", json).done(function(result){
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
				template.setTitle("企业信息")
				template.setContent(getContent);
				graphicsLayer = new GraphicsLayer({"id":"qiye",infoTemplate:template});
				map.addLayer(graphicsLayer);
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					if(itemData.LONGITUDE&&itemData.LATITUDE&&itemData.DALEI){
						//获取图标文件名称
						var pictureUrl = getImgName(itemData.DALEI);
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/zhongdianqiye/'+pictureUrl+'.png', 25, 25);
						var attriubtes = {
								enterpriseName: itemData.NAME!=null?itemData.NAME:"",		
								province: itemData.SHENG!=null?itemData.SHENG:"",	
								city: itemData.SHI!=null?itemData.SHI:"",
			        			district: itemData.XIAN!=null?itemData.XIAN:"",	
			        			xiang: itemData.XIANG!=null?itemData.XIANG:"",	
			        			cun: itemData.CUN!=null?itemData.CUN:"",	
			        			laiyuan: itemData.LAIYUAN!=null?itemData.LAIYUAN:"",	
			        			industry: itemData.DALEI!=null?itemData.DALEI:"",				
			        			remark: itemData.REMARK!=null?itemData.REMARK:"",
			                    longitude: itemData.LONGITUDE,
			                    latitude: itemData.LATITUDE,
			        			type: "qiye"
						}
						var point = new Point(itemData.LONGITUDE,itemData.LATITUDE);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}
				}
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<p>企业名称:<code>' + attributes.enterpriseName + '</code></p>'+
					'<p>所属省份:<code>' + attributes.province + '</code></p>'+
					'<p>所属城市:<code>' + attributes.city + '</code></p>'+
					'<p>所属县区:<code>' + attributes.district + '</code></p>'+
					'<p>所属乡镇:<code>' + attributes.xiang + '</code></p>'+
					'<p>所属村:<code>' + attributes.cun + '</code></p>'+
					'<p>来源:<code>' + attributes.laiyuan + '</code></p>'+
					'<p>备注:<code>' + attributes.remark + '</code></p>'+
					'<p>行业类别:<code>' + attributes.industry + '</code></p>';
				}
				
				//鼠标移上去，显示企业名称
				graphicsLayer.on("mouse-over",function(evt){
					map.graphics.clear();
					var offsetX = evt.graphic.attributes.enterpriseName.length*13.3/2;
					var font = new Font().setSize("12pt");
					var symbol = new TextSymbol(evt.graphic.attributes.enterpriseName,font)
									.setOffset(offsetX,20).setHaloColor(new Color([255, 255, 255])).setHaloSize(3);
					var graphic = new Graphic(evt.mapPoint,symbol);
					map.graphics.add(graphic);
				})
			}
		});//ajax end
	});//require end
	
}

//地方自报更新地图
function updateMap2(){
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
		ajaxPost("/seimp/pic/getIndustryEnterprise.do", json).done(function(result){
			if(result.status==0&&result.data.length>0){
				var data = result.data;
				
				var template = new InfoTemplate();
				template.setTitle("企业信息")
				template.setContent(getContent);
				graphicsLayer = new GraphicsLayer({"id":"qiye",infoTemplate:template});
				map.addLayer(graphicsLayer);
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					if(itemData.longitude&&itemData.latitude&&itemData.industry){
						//获取图标文件名称
						var pictureUrl = getImgName(itemData.industry);
						
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/zhongdianqiye/'+pictureUrl+'.png', 25, 25);
						var attriubtes = {
								enterpriseName: itemData.enterpriseName!=null?itemData.enterpriseName:"",		
								province: itemData.provinceName!=null?itemData.provinceName:"",	
								city: itemData.cityName!=null?itemData.cityName:"",
			        			district: itemData.countyName!=null?itemData.countyName:"",	
			        			industry: itemData.industry!=null?itemData.industry:"",				
			        			remark: itemData.remark!=null?itemData.remark:"",
			                    longitude: itemData.longitude,
			                    latitude: itemData.longitude,
			                    address:itemData.address!=null?itemData.address:"",
			        			type: "qiye"
						}
						var point = new Point(itemData.longitude,itemData.latitude);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}
				}
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<p>企业名称:<code>' + attributes.enterpriseName + '</code></p>'+
					'<p>所属省份:<code>' + attributes.province + '</code></p>'+
					'<p>所属城市:<code>' + attributes.city + '</code></p>'+
					'<p>所属县区:<code>' + attributes.district + '</code></p>'+
					'<p>地址:<code>' + attributes.address + '</code></p>'+
					'<p>备注:<code>' + attributes.remark + '</code></p>'+
					'<p>行业类别:<code>' + attributes.industry + '</code></p>';
				}
				
				//鼠标移上去，显示企业名称
				graphicsLayer.on("mouse-over",function(evt){
					map.graphics.clear();
					var offsetX = evt.graphic.attributes.enterpriseName.length*13.3/2;
					var font = new Font().setSize("12pt");
					var symbol = new TextSymbol(evt.graphic.attributes.enterpriseName,font)
									.setOffset(offsetX,20).setHaloColor(new Color([255, 255, 255])).setHaloSize(3);
					var graphic = new Graphic(evt.mapPoint,symbol);
					map.graphics.add(graphic);
				})
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
	        field : 'NAME',
	        title : '企业名称',
	        align : 'center'
		},{
			field : 'DALEI',
			title : '行业类型',
			align : 'center',
		},{
			field : 'SHENG',
			title : '省份',
			align : 'center',
		},{
			field : 'SHI',
			title : '市',
			align : 'center',
		},{
			field : 'XIAN',
			title : '县',
			align : 'center',
		},{
			field : 'LAIYUAN',
			title : '来源',
			align : 'center',
		},{
			field : 'REMARK',
			title : '备注',
			align : 'center',
		}];
	//销毁表格
	$('#table_template').bootstrapTable('destroy');
	//生成表格
	$('#table_template').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/pic/getWrdkYghc.do",
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

//地方上报更新表格
function updateTable2(){
	var columns =[{  
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
		},{
	        field : 'enterpriseName',
	        title : '企业名称',
	        align : 'center'
		},{
			field : 'industry',
			title : '行业类型',
			align : 'center',
		},{
			field : 'mainContaminant',
			title : '主要污染物',
			align : 'center',
		},{
			field : 'provinceName',
			title : '省份',
			align : 'center',
		},{
			field : 'cityName',
			title : '市',
			align : 'center',
		},{
			field : 'countyName',
			title : '县',
			align : 'center',
		},{
			field : 'address',
			title : '地址',
			align : 'center',
		},{
			field : 'remark',
			title : '备注',
			align : 'center',
		}];
	//销毁表格
	$('#table_template').bootstrapTable('destroy');
	//生成表格
	$('#table_template').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/pic/getEnterpriseTable.do",
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

//回显地图模式的行业类型数据
function huiXianMapIndustry(){
	$.each($(".map-item li"),function(i,obj){
		$(obj).removeClass("metal");
	});
	$(".map-item li[value='"+searchParams.industry+"']").addClass("metal");
}

/*************悬浮窗******************/
$(function(){
	/**********右上角按钮****/
	$("#country").click(function(){
		//点击全国按钮的时候，隐藏省、市
		$("#province").addClass("none");
		$("#city").addClass("none");
		if(xiangmuType=="1"){
			updateCountry_1(true);
		}else if(xiangmuType=="2"){
			updateCountry_2(true);
		}
		
	})
	$("#province").click(function(){
		//点击省份按钮的时候，隐藏市
		$("#city").addClass("none");
		if(xiangmuType=="1"){
			updateProvince_1(false);
		}else if(xiangmuType=="2"){
			updateProvince_2(false);
		}
	})
	$("#city").click(function(){
		if(xiangmuType=="1"){
			updateCity_1(false);
		}else if(xiangmuType=="2"){
			updateCity_2(false);
		}
	})
	
	//条件查询点击事件
	$(".keyword button").click(function(){
		searchParams.industry = $(".industry").val();
		searchParams.keyword = $(".keyword input").val();
		if(xiangmuType=="1"){
//			updateMap();
			updateTable();
		}else if(xiangmuType=="2"){
//			updateMap2();
			updateTable2();
		}
		//回显地图模式的行业类型数据
//		huiXianMapIndustry();
	})
	
	/*******************行业分类定制***************/
	/*//生成下方的行业类别选择类表
	createInsutryClick();
	//填充行业定制弹出框中的内容
	var json = {};
	ajaxPost("/seimp/pic/getIndustries.do", json).done(function(result){
		if(result.status==0){//请求成功
			var data = result.data;
			var html = "";//模态框中行业类型
			var lihtml = "";//清单模式中行业选择下拉框
			lihtml += "<li><a value=''>请选择产业类型</a></li>";
			for (var i = 0; i < data.length; i++) {
				var currItem = data[i];
				if(i%3==0){
					if(i==0){
						html+="<div class='row' style='margin-bottom:10px;'>";
					}else if(i==data.length-1){
						html+="</div>";
					}else{
						html+="</div><div class='row' style='margin-bottom:10px;'>";
					}
					
				}
				html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem+"'  name='industry' industryname='"+currItem+"'>"+currItem+"</label></div>";
				
				lihtml += "<li><a value='"+currItem+"'>"+currItem+"</a></li>";
			}
			$(".modal-body").html(html);
			$(".chayeleixing ul.dropdown-menu").html(lihtml);
			$(".chayeleixing ul.dropdown-menu li a").click(function(){
				$(this).parent().parent().siblings().text($(this).text());//下拉框选中事件
				searchParams.industry=$(this).attr("value");//记录选中的行业类型
			});
		}
		
	});*/
	
	//生成地图下方的行业选择按钮
	createModal()
	
	
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
})

/************获取图标文件名称*****************/
function getImgName(industryName){
	industryName = industryName.replace(/[ ]/g, "");
	industryName = industryName.replace(/[\r\n]/g, "");
	if(xiangmuType=="1"){
		for (var i = 0; i < allQiYeIndustryArr.length; i++) {
			var currItem = allQiYeIndustryArr[i];
			var ids = currItem.id;
			var idArr = ids.split(",");
			for (var j = 0; j < idArr.length; j++) {
				var currId = idArr[j];
				if(industryName==currId){
					currItem.name;
					return i+1;
				}
			}
		}
	}else if(xiangmuType=="2"){
		for (var i = 0; i < allQiYeIndustryArr2.length; i++) {
			var currItem = allQiYeIndustryArr2[i];
			var ids = currItem.id;
			var idArr = ids.split(",");
			for (var j = 0; j < idArr.length; j++) {
				var currId = idArr[j];
				if(industryName==currId){
					currItem.name;
					return i+1;
				}
			}
		}
	}
	return "default";
}


/**********行业定制********/
//生成图标模式


//生成行业定制弹出框中的内容
function createModal(){
	createInsutryClick();
	if(xiangmuType=="1"){
		//生成行业定制框中的内容
		var html = "";//模态框中行业类型
		var lihtml = "";
		lihtml += "<option value=''>请选择行业类型</option>";
		for (var i = 0; i < allQiYeIndustryArr.length; i++) {
			var currItem = allQiYeIndustryArr[i];
			if(i%3==0){
				if(i==0){
					html+="<div class='row' style='margin-bottom:10px;'>";
				}else{
					html+="</div><div class='row' style='margin-bottom:10px;'>";
				}
				
			}
			html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem.id+"'  name='industry' industry='"+currItem.name+"'>"+currItem.name+"</label></div>";
			if(i==allQiYeIndustryArr.length-1){
				html+="</div>";
			}
			lihtml += "<option value='"+currItem.id+"'>"+currItem.name+"</option>";
		}
		$(".modal-body").html(html);
		$(".industry").html(lihtml);
		
	}else if(xiangmuType=="2"){
		//生成行业定制框中的内容
		var html = "";//模态框中行业类型
		var lihtml = "";
		lihtml += "<option value=''>请选择行业类型</option>";
		for (var i = 0; i < allQiYeIndustryArr2.length; i++) {
			var currItem = allQiYeIndustryArr2[i];
			if(i%3==0){
				if(i==0){
					html+="<div class='row' style='margin-bottom:10px;'>";
				}else{
					html+="</div><div class='row' style='margin-bottom:10px;'>";
				}
				
			}
			html += "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' value='"+currItem.id+"'  name='industry' industry='"+currItem.name+"'>"+currItem.name+"</label></div>";
			if(i==allQiYeIndustryArr2.length-1){
				html+="</div>";
			}
			lihtml += "<option value='"+currItem.id+"'>"+currItem.name+"</li>";
		}
		$(".modal-body").html(html);
		$(".industry").html(lihtml);
	}
	
}




//行业定制弹出框显示
function qiYeCheckBoxShow(){
	if(xiangmuType=="1"){
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
	}else if(xiangmuType=="2"){
		//回显选中数据
		if(qiYeIndustryArr2.length>0){
			//弹出框回显
			$("#myModal input:checkbox").prop("checked",false);
			for (var i = 0; i < qiYeIndustryArr2.length; i++) {
				var currObj = qiYeIndustryArr2[i];
				$("#myModal input:checkbox[value='"+currObj.id+"']").prop("checked",true);
			}
		}
		//弹出框
		$("#myModal").modal();
	}
	
}

//行业定制弹出框确定按钮收集数据，并重新生成行业选择
function shouJiShuJu(){
	if($("#myModal input:checkbox:checked").length>8){
		toastr.warning("行业定制数量不能超过8个");
		return;
	}
	if(xiangmuType=="1"){
		qiYeIndustryArr = [];
		//弹出框收集选中
		$.each($("#myModal input:checkbox:checked"),function(index,obj){
			var liSelectedData = {
					name:$(obj).attr("industry"),
					id:$(obj).val()
			}
			qiYeIndustryArr.push(liSelectedData);
		})
		
		createInsutryClick();
		$("#myModal").modal('hide');
	}else if(xiangmuType=="2"){
		qiYeIndustryArr = [];
		//弹出框收集选中
		$.each($("#myModal input:checkbox:checked"),function(index,obj){
			var liSelectedData = {
					name:$(obj).attr("industry"),
					id:$(obj).val()
			}
			qiYeIndustryArr2.push(liSelectedData);
		})
		
		createInsutryClick();
		$("#myModal").modal('hide');
	}
	
}

//生成地图下方的行业筛选列表
function createInsutryClick(){
	if(xiangmuType=="1"){
		//重新更新下方的企业类别选择条
		var html ="<li class='lt metal' value='' onclick=switchIndustry('',$(this))>全部</li>";
		if(qiYeIndustryArr.length>0){
			for (var i = 0; i < qiYeIndustryArr.length; i++) {
				var currObj = qiYeIndustryArr[i];
				html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
			}
		}
		html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
		$("#mapItem").html(html);
		$(".map-item").css("margin-left","-"+$(".map-item").width()/2+"px");
	}else if(xiangmuType=="2"){
		//重新更新下方的企业类别选择条
		var html ="<li class='lt metal' value='' onclick=switchIndustry('',$(this))>全部</li>";
		if(qiYeIndustryArr.length>0){
			for (var i = 0; i < qiYeIndustryArr2.length; i++) {
				var currObj = qiYeIndustryArr2[i];
				html +="<li class='lt' value='"+currObj.id+"' onclick=switchIndustry('"+currObj.id+"',$(this))>"+currObj.name+"</li>";
			}
		}
		html +="<li class='lt' ><img alt='' onclick='qiYeCheckBoxShow()' src='../../img/warn/plus.png'  style='height:16px;margin:0;'></li>";
		$("#mapItem").html(html);
		$(".map-item").css("margin-left","-"+$(".map-item").width()/2+"px");
	}
	
}
//行业选择
function switchIndustry(switchIndustry,obj){
	//记录选择的行业
//	searchParams.industry=switchIndustry;
	//记录地图所选行业类别
	mapIndustry = switchIndustry;
	
	$(obj).siblings().removeClass("metal");
	$(obj).addClass("metal");
	//将选择的行业参数回显到清单模式
	if(xiangmuType=="1"){//遥感核查
		if(mapType=="1"){//全国模式
			updateCountry_1(true);
		}else if(mapType=="2"){//某一个省的所有市模式
			updateProvince_1(true);
		}else if(mapType=="3"){//某一个市的所有点位模式
			updateCity_1(true);
		}
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


//图表省市下拉框数据
ajaxPost("/seimp/pic/getallRegion.do",{}).done(function(result){
	if(result.status==0&&result.data.length>0){
		res=result;
		for (var i = 0; i < result.data.length; i++) {
			var province = result.data[i];
			if(province.level==0){
			$(".province2").append("<option value='"+province.name+"'>"+province.name+"</option>");
			$(".city3").append("<option value='"+province.code+"'>"+province.name+"</option>");
			}
		}
	}
});


//图标下拉框数据，产业类型，大类，来源
ajaxPost("/seimp/pic/getallOption.do",{}).done(function(result){
	var industry=result.data.industry;
	var DALEI=result.data.DALEI;
	var LAIYUAN=result.data.LAIYUAN;
		for (var i = 0; i < industry.length; i++) {
				var ind = industry[i];
				if(ind && ind.industry){
					var inds=ind.industry.trim();
					if(inds!=""&&inds!=null&&inds!=undefined){
						$(".chanyeleixing").append("<option value='"+inds+"'>"+inds+"</option>");
					}
				}
			}	
		for (var i = 0; i < DALEI.length; i++) {
				var da = DALEI[i];
				if(da && da.DALEI){
					var das=da.DALEI.trim();
					if(das!=""&&das!=null&&das!=undefined){
						$(".dalei").append("<option value='"+das+"'>"+das+"</option>");
					}
				}
			}	
		for (var i = 0; i < LAIYUAN.length; i++) {
				var lai = LAIYUAN[i];
				if(lai && lai.LAIYUAN){
					var lais=lai.LAIYUAN.trim();
					if(lais!=""&&lais!=null&&lais!=undefined){
						$(".laiyuan").append("<option value='"+lais+"'>"+lais+"</option>");
					}
				}
			}	
});

function buttontype(id){
	buttontypes=id;	
	if(xiangmuType=="1"){
	if(buttontypes==1){
		yghc();
	}else if(buttontypes==2){
		yghc();
	}else if(buttontypes==3){
		yghc();
	}
	}
}

//下拉框内容变更事件
$(".province2").change(function(){yghc()});
$(".laiyuan").change(function(){yghc()});
$(".dalei").change(function(){yghc()});
$(".city3").change(function(){dfzb()});
$(".chanyeleixing").change(function(){dfzb()});
var c="";
var c2="";
//遥感核查图表
function yghc(){
    $('#graphs1').hide()
    $('#graphs').show()
	$(".citydiv").css("display","none");
	$(".chanyeleixingdiv").css("display","none");
	$(".prdiv").css("display","block");

	$(".daleidiv").css("display","block");
	$(".laiyuandiv").css("display","block");
	var p=$(".province2").val();
	var d=$(".dalei").val();
	var l=$(".laiyuan").val();
	
	
	ajaxPost("/seimp/pic/getYGHCSWFX.do", {sheng:p,dalei:d,laiyuan:l,type:buttontypes,shi:c}).done(function (data) {
		var arr = new Array();
		var arr2 = new Array();
		var arr3 =new Array();
		var arrcode =new Array();
		var long= 100;
		if (data.status == 0) {
            for (var i = 0; i < data.data.length; i++) {
            	var item = data.data[i];
            	if(buttontypes==1){
					long = 100
            	if(p!=""){
            		if(c2!=""){
            			 if(item.XIAN!=undefined&&item.XIAN!=""&&item.XIAN!=null&&item.XIAN!=" "){
                     		arr.push(item.XIAN);	
                     		arr2.push(item.count);
                     		arrcode.push(item.code);
                     		 }
            			
            		}else{
            			if(item.XIAN!=undefined&&item.XIAN!=""&&item.XIAN!=null&&item.XIAN!=" "){
                    		arr.push(item.XIAN);
                    		arr2.push(item.count);
                    		arrcode.push(item.code);
            		 }
            		}
            	}else{
            		if(item.XIAN!=undefined&&item.XIAN!=""&&item.XIAN!=null&&item.XIAN!=" "){
                		arr.push(item.XIAN);	
                		arr2.push(item.count);
                		arrcode.push(item.code);
            		}
            	}
            	}else if(buttontypes==2){
            		long = 20
            		 if(item.DALEI!=undefined&&item.DALEI!=""&&item.DALEI!=null&&item.DALEI!=" "){
            		arr.push(item.DALEI);
            		arr2.push(item.count);
            		 }
            	}else{
                    long = 100
                    if(item.LAIYUAN!=undefined&&item.LAIYUAN!=""&&item.LAIYUAN!=null&&item.LAIYUAN!=" "){
            		arr.push(item.LAIYUAN);
                    arr3.push({value:item.count,name:item.LAIYUAN});
                    }
            	}
            	
            }
            c2="";
	var myChart = echarts.init(document.getElementById('graphs'));
	myChart.clear();
	if(buttontypes!=3){
	var option = {
		    title : {
		        text: '遥感核查重点行业企业数量统计图',
		        left:'center'
		    },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
		    tooltip : {
		        trigger: 'axis'
		    },
		    legend: {
		        data:['污染企业']
		    },
		    toolbox: {
		        show : false,
		        feature : {
		            magicType : {show: true, type: ['line', 'bar']},
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
		    	type: 'inside',
                show : true,
                realtime : true,
                start : 0,
                end : long
            },
		    yAxis : [
		        {   
		        	name:'(个/企业)',
		            type : 'value'
		        }
		    ],
		    visualMap: {
		        show: false,
		        min: 0,
		        max: 50,
		        dimension: 0,
		        inRange: {
		            color: ['#4a657a', '#308e92', '#b1cfa5', '#f5d69f', '#f5898b', '#ef5055']
		        }
		    },
		    series : [
		        {
		            name:'重点行业企业数',
		            type:'bar',
		            data:arr2,
		            barMaxWidth:100,
		            rawdate:arrcode
		        }
		    ]
		};
	}else{
		
		option = {
			    title : {
			        text: '遥感核查重点行业企业数量统计图',
//			        subtext: '纯属虚构',
			        x:'center'
			    },
	            grid: {
	                left: '3%',
	                right: '4%',
	                bottom: '3%',
	                containLabel: true
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
			        show : false,
			        feature : {
			            mark : {show: true},
			            saveAsImage : {show: true}
			        }
			    },
			    series : [
			        {
			            name: '重点行业企业数',
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
	/*myChart.on('click', function (params) {
		 var cloudid;
         var mes = '【' + params.type + '】';
         if (typeof params.seriesIndex != 'undefined') {
             mes += '  seriesIndex : ' + params.seriesIndex;
             mes += '  dataIndex : ' + params.dataIndex;
             cloudid = option.series[params.seriesIndex].rawdate[params.dataIndex];
           
         }
		var name=params.name;
	           if(cloudid.substring(cloudid.length-4,cloudid.length)=="0000"){

	        	   $(".province2").val(name);
	        	   yghc();
	           }else if(cloudid.substring(cloudid.length-2,cloudid.length)=="00"&&cloudid.substring(cloudid.length-4,cloudid.length)!="0000"){
	        	   c=name;
	        	  c2=name;
	        	   yghc();
	        	   c="";
	           }
	    // 控制台打印数据的名称
	  
	});	*/
	
	 myChart.setOption(option);
        }
    });
}

var cit="";
//地方自报图表
function dfzb(){
	$('#graphs1').show()
	$('#graphs').hide()
	$(".citydiv").css("display","block");
	$(".chanyeleixingdiv").css("display","block");
	$(".prdiv").css("display","none");
	$(".daleidiv").css("display","none");
	$(".laiyuandiv").css("display","none");

	var city=$(".city3").val();
	
	var l=$(".chanyeleixing").val();
	var ty;
	ajaxPost("/seimp/pic/getDFZBTB.do", {city:city,chanyeleixing:l,type:buttontypes,city2:cit}).done(function (data) {
		var arr = new Array();
		var arr2 = new Array();
		var arrcode = new Array();
		var long = 100;
		if (data.status == 0) {
			
            for (var i = 0; i < data.data.length; i++) {
            	
            	var item = data.data[i];
            	if(buttontypes==4){
            		long = 100;
            		if(item.name!=undefined&&item.name!=""&&item.name!=null&&item.name!=" "){
            		arrcode.push(item.code);
            		arr.push(item.name);	
            		}
            		ty="(省/市)";
            	}else if(buttontypes==5){
                    long = 35;
            		arr.push(item.industry);
            		ty="(产业类型)";
            	}
            			
            	arr2.push(item.count);
            	
            }
	var myChart = echarts.init(document.getElementById('graphs1'));
	var option = {
		    title : {
		        text: '地方自报重点行业企业数量统计图',
		        left:'center'
		    },
		    tooltip : {
		        trigger: 'axis'
		    },
		    
		    toolbox: {
		        show : false,
		        feature : {
		            magicType : {show: true, type: ['line', 'bar']},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    xAxis : [
		        {
		        	name:ty,
		            type : 'category',
		            data : arr,
		            axisLabel:{
		            	interval:0,
		            	rotate:-30
		            	
		            }
		        }
		    ],dataZoom : {
                show : true,
                realtime : true,
                start : 0,
                end : long
            },
		    yAxis : [
		        {   
		        	name:'(个/企业)',
		            type : 'value'
		        }
		    ],
		    series : [
		        {
		            name:'重点行业企业数',
		            type:'bar',
		            data:arr2,
		            barMaxWidth:100,
		            rawdate:arrcode
		        }
		    ]
		}
	myChart.off('click');
	myChart.on('click', function (params) {
		var name=params.name;
		 var cloudid;
         var mes = '【' + params.type + '】';
         if (typeof params.seriesIndex != 'undefined') {
             mes += '  seriesIndex : ' + params.seriesIndex;
             mes += '  dataIndex : ' + params.dataIndex;
             cloudid = option.series[params.seriesIndex].rawdate[params.dataIndex];
         }
	           if(cloudid.substring(cloudid.length-4,cloudid.length)=="0000"){
	        	   $(".city3").val(cloudid);
	        	   dfzb();
	           }else if(cloudid.substring(cloudid.length-2,cloudid.length)=="00"&&cloudid.substring(cloudid.length-4,cloudid.length)!="0000"){
	        	   cit=cloudid;
	        	   dfzb();
		        	   cit="";
		           }
	          
	    // 控制台打印数据的名称
	    console.log(params.name);
	});	
	 myChart.setOption(option);
        }
    });
}

$('.first_input input').click(function () {
    $('.first_input input').removeClass('btn-danger').addClass('btn-default')
	$(this).removeClass('btn-default').addClass('btn-danger')
})
$('.two_input input').click(function () {
    $('.two_input input').removeClass('btn-danger').addClass('btn-default')
    $(this).removeClass('btn-default').addClass('btn-danger')
})