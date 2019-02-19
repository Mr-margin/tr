
//地方自报更新地图
function updateMap1(){
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
		var json = {tdly:mapIndustry};
		ajaxPost("/seimp/pic/getSoil_quality.do", json).done(function(result){
			if(result.status==0&&result.data.length>0){
				var data = result.data;
				
				var template = new InfoTemplate();
				template.setTitle("土壤详查信息")
				template.setContent(getContent);
				var graphicsLayer = new GraphicsLayer({"id":"xiangchaLayer",infoTemplate:template});
				map.addLayer(graphicsLayer);
				
				for (var i = 0; i < data.length; i++) {
					var itemData = data[i];
					if(itemData.lon&&itemData.lat){
						//获取图标文件名称
						var pictureMarkerSymbol = new PictureMarkerSymbol('../../img/information/diaocha.png', 25, 25);
						var attriubtes = {
								ybbm: itemData.ybbm!=null?itemData.ybbm:"",		
								ydbm: itemData.ydbm!=null?itemData.ydbm:"",		
								lon: itemData.lon!=null?itemData.lon:"",	
								lat: itemData.lat!=null?itemData.lat:"",
								height: itemData.height!=null?itemData.height:"",	
								tdly: itemData.tdly!=null?itemData.tdly:"",				
			        			type: "xiangcha"
						}
						var point = new Point(itemData.lon,itemData.lat);
						var graphic = new Graphic(point,pictureMarkerSymbol,attriubtes);
						graphicsLayer.add(graphic);
					}
				}
				
				function getContent(graphic){
					var attributes = graphic.attributes;
					return '<p>样本编码:<code>' + attributes.ybbm + '</code></p>'+
					'<p>样点编码:<code>' + attributes.ydbm + '</code></p>'+
					'<p>东经:<code>' + attributes.lon + '</code></p>'+
					'<p>北纬:<code>' + attributes.lat + '</code></p>'+
					'<p>海拔:<code>' + attributes.height + '</code></p>'+
					'<p>土地利用类型:<code>' + attributes.tdly + '</code></p>'+
					'<hr/><p><code style="cursor:pointer;color:#038AEC;" onclick=showMapTable()>查看统计表</code></p>';
				}
				
				graphicsLayer.on("click",function(evt){
					//改变地图中心
					map.centerAt(evt.graphic.geometry);
					//回复之间的gif
					var graphics = map.getLayer("xiangchaLayer").graphics;
					for (var i = 0; i < graphics.length; i++) {
						var currGra = graphics[i];
						currGra.setSymbol(currGra.symbol.setUrl(currGra.symbol.url.replace(".gif",".png")));
					}
					//改变当前的png为gif
					evt.graphic.setSymbol(evt.graphic.symbol.setUrl(evt.graphic.symbol.url.replace(".png",".gif")));
					map.getLayer("xiangchaLayer").redraw();
					
					//改变弹出框大小
					map.infoWindow.resize("250","220");
					$(".close").click(function(){
						map.infoWindow.remove();
					})
					var ybbm = evt.graphic.attributes.ybbm;
					var json ={ID:ybbm};
					ajaxPost("/seimp/pic/getSoil_qualityDetail.do", json).done(function(result){
						if(result.status==0){
							isSelect  = 1;
							updateMapTable1(result.data);
						}
					})
				})
				
			}
		});//ajax end
	});//require end
	
}

function getTuDiLiYongLeiXing1(){
	var json = {};
	ajaxPost("/seimp/pic/getDiaoChaoType.do", json).done(function(result){
		if(result.status==0){
			if(result.data.length>0){
				qiYeIndustryArr = [];
				allQiYeIndustryArr = [];
				var data = result.data; 
				//生成类型数组
				for (var i = 0; i < (data.length<=8 ? data.length:8); i++) {
					var currItem  = data[i];
					qiYeIndustryArr.push({
						id:currItem.tdly,
						name:currItem.tdly
					});
				}
				//生成所有的类型数组
				for (var i = 0; i < data.length; i++) {
					var currItem  = data[i];
					allQiYeIndustryArr.push({
						id:currItem.tdly,
						name:currItem.tdly
					});
				}
				
				//生成地图下方
				createModal()
				
			}
		}
	})
}

// 更新地图表格
function updateMapTable1(data){
	if(data.length>0){
		var data = data[0];
		var headHtml = "<td>项目</td><td>信息</td>";
		var bodyHtml = "";
		bodyHtml+="<tr><td>样本编码</td><td>"+(data.ybbm!=null?data.ybbm:"")+"</td></tr>";
		bodyHtml+="<tr><td>样点编码</td><td>"+(data.ydbm!=null?data.ydbm:"")+"</td></tr>";
		bodyHtml+="<tr><td>东经</td><td>"+(data.lon!=null?data.lon:"")+"</td></tr>";
		bodyHtml+="<tr><td>北纬</td><td>"+(data.lat!=null?data.lat:"")+"</td></tr>";
		bodyHtml+="<tr><td>海拔（m）</td><td>"+(data.height!=null?data.height:"")+"</td></tr>";
		bodyHtml+="<tr><td>土地利用类型</td><td>"+(data.tdly!=null?data.tdly:"")+"</td></tr>";
		bodyHtml+="<tr><td>有机质（%）</td><td>"+(data.yjz!=null?data.yjz:"")+"</td></tr>";
		bodyHtml+="<tr><td>pH值（PH）</td><td>"+(data.phz!=null?data.phz:"")+"</td></tr>";
		bodyHtml+="<tr><td>全氮（%）</td><td>"+(data.qd !=null?data.qd :"")+"</td></tr>";
		bodyHtml+="<tr><td>砂粒（%）</td><td>"+(data.sl !=null?data.sl :"")+"</td></tr>";
		bodyHtml+="<tr><td>粉粒（%）</td><td>"+(data.fl !=null?data.fl :"")+"</td></tr>";
		bodyHtml+="<tr><td>粘粒（%）</td><td>"+(data.nl !=null?data.nl :"")+"</td></tr>";
		bodyHtml+="<tr><td>容重</td><td>"+(data.rz !=null?data.rz :"")+"</td></tr>";
		bodyHtml+="<tr><td>砷As（mg/kg）</td><td>"+(data.as !=null?data.as :"")+"</td></tr>";
		bodyHtml+="<tr><td>镉Cd（mg/kg）</td><td>"+(data.cd !=null?data.cd :"")+"</td></tr>";
		bodyHtml+="<tr><td>铬Cr（mg/kg）</td><td>"+(data.cr !=null?data.cr :"")+"</td></tr>";
		bodyHtml+="<tr><td>铜Cu（mg/kg）</td><td>"+(data.cu !=null?data.cu :"")+"</td></tr>";
		bodyHtml+="<tr><td>汞Hg（mg/kg）</td><td>"+(data.gh !=null?data.gh :"")+"</td></tr>";
		bodyHtml+="<tr><td>镍Ni（mg/kg）</td><td>"+(data.ni !=null?data.ni :"")+"</td></tr>";
		bodyHtml+="<tr><td>铅Pb（mg/kg）</td><td>"+(data.pb !=null?data.pb :"")+"</td></tr>";
		bodyHtml+="<tr><td>锌Zn（mg/kg）</td><td>"+(data.zn !=null?data.zn :"")+"</td></tr>";
		bodyHtml+="<tr><td>六六六总量</td><td>"+(data.bhc!=null?data.bhc:"")+"</td></tr>";
		bodyHtml+="<tr><td>滴滴涕总量</td><td>"+(data.ddt!=null?data.ddt:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_As</td><td>"+(data.p_as!=null?data.p_as:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Cd</td><td>"+(data.p_cd!=null?data.p_cd:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Cr</td><td>"+(data.p_cr!=null?data.p_cr:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Cu</td><td>"+(data.p_cu!=null?data.p_cu:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Hg</td><td>"+(data.p_hg!=null?data.p_hg:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Ni</td><td>"+(data.p_ni!=null?data.p_ni:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Pb</td><td>"+(data.p_pb!=null?data.p_pb:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_Zn</td><td>"+(data.p_zn!=null?data.p_zn:"")+"</td></tr>";
		bodyHtml+="<tr><td>PZ</td><td>"+(data.pz!=null?data.pz:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_666</td><td>"+(data.p_666!=null?data.p_666:"")+"</td></tr>";
		bodyHtml+="<tr><td>P_DDT</td><td>"+(data.p_ddt!=null?data.p_ddt:"")+"</td></tr>";

		$("#tongjibiao thead tr").html(headHtml);
		$("#tongjibiao tbody").html(bodyHtml);
	}
}

//更新表格
function updateTable1(){
	var columns =[{  
	        //field: 'Number',//可不加  
	        title: '序号',//标题  可不加  
	        formatter: function (value, row, index) {  
	            return index+1;  
	        }  
    	},{
	        field : 'ybbm',
	        title : '样本编码',
	        align : 'center'
		},{
	        field : 'ydbm',
	        title : '样点编码',
	        align : 'center'
		},{
			field : 'lon',
			title : '东经',
			align : 'center',
		},{
			field : 'lat',
			title : '北纬',
			align : 'center',
		},{
			field : 'height',
			title : '海拔',
			align : 'center',
		},{
			field : 'tdly',
			title : '土地利用类型',
			align : 'center',
		},{
			field : 'yjz',
			title : '有机质（%）',
			align : 'center',
		},{
			field : 'phz',
			title : 'pH值（PH）',
			align : 'center',
		},{
			field : 'qd',
			title : '全氮（%）',
			align : 'center',
		},{
			field : 'sl',
			title : '砂粒（%）',
			align : 'center',
		},{
			field : 'fl',
			title : '粉粒（%）',
			align : 'center',
		},{
			field : 'nl',
			title : '粘粒（%）',
			align : 'center',
		},{
			field : 'rz',
			title : '容重',
			align : 'center',
		},{
			field : 'as',
			title : '砷As（mg/kg）',
			align : 'center',
		},{
			field : 'cd',
			title : '镉Cd（mg/kg）',
			align : 'center',
		},{
			field : 'cr',
			title : '铬Cr（mg/kg）',
			align : 'center',
		},{
			field : 'cu',
			title : '铜Cu（mg/kg）',
			align : 'center',
		},{
			field : 'gh',
			title : '汞Hg（mg/kg）',
			align : 'center',
		},{
			field : 'ni',
			title : '镍Ni（mg/kg）',
			align : 'center',
		},{
			field : 'pb',
			title : '铅Pb（mg/kg）',
			align : 'center',
		},{
			field : 'zn',
			title : '锌Zn（mg/kg）',
			align : 'center',
		},{
			field : 'bhc',
			title : '六六六总量',
			align : 'center',
		},{
			field : 'ddt',
			title : '滴滴涕总量',
			align : 'center',
		},{
			field : 'p_as',
			title : 'P_As',
			align : 'center',
		},{
			field : 'p_cd',
			title : 'P_Cd',
			align : 'center',
		},{
			field : 'p_cr',
			title : 'P_Cr',
			align : 'center',
		},{
			field : 'p_cu',
			title : 'P_Cu',
			align : 'center',
		},{
			field : 'p_hg',
			title : 'P_Hg',
			align : 'center',
		},{
			field : 'p_ni',
			title : 'P_Ni',
			align : 'center',
		},{
			field : 'p_pb',
			title : 'P_Pb',
			align : 'center',
		},{
			field : 'p_zn',
			title : 'P_Zn',
			align : 'center',
		},{
			field : 'pz',
			title : 'PZ',
			align : 'center',
		},{
			field : 'p_666',
			title : 'P_666',
			align : 'center',
		},{
			field : 'p_ddt',
			title : 'P_DDT',
			align : 'center',
		}];
	//销毁表格
	$('#table_template').bootstrapTable('destroy');
	//生成表格
	$('#table_template').bootstrapTable({
	    method : 'POST',
	    url : "/seimp/pic/getSoil_qualityTable.do",
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
                tdly:searchParams.industry,
                ybbm:searchParams.keyword
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


