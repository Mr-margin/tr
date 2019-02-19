//单选按钮距离定位
var infoJsonStr = sessionStorage.getItem('enterPriseInfo');
infoEntity = JSON.parse(infoJsonStr);
console.log(infoEntity)
var enterId=infoEntity.DATAID;
var realEnterID = infoEntity.enterId;
initPart4Content(enterId);
//更新更多详情信息内容
initWrdkPanelContent(enterId);



/**
 * 
 * ----------------------排污许可证注销、撤销详情----------------------
 */

/*排污许可证撤销/撤销证据页面赋值*/

function initPart4Content(enterId) {
    ajaxPost("/seimp/enterDetails/getEnterpriceBaseInfoDataByEnterId",{
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
            $("#pot_6").html(item.XKZNUM);
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
        url: "/seimp/enterDetails/getProductInfoPageData",
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
        url: "/seimp/enterDetails/getMaterialPageData",
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
        url: "/seimp/enterDetails/getFuelPageData",
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
        url: "/seimp/enterDetails/getDrectlyPageData",
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
        url: "/seimp/enterDetails/getIndirectPageData",
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
        url: "/seimp/enterDetails/getSolidwastePageData",
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
        url: "/seimp/enterDetails/getMonitorInfoPageData",
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
	    		enterId : realEnterID
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
        url: "/seimp/enterDetails/getApplyrecordPageData",
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
	    url : "/seimp/enterDetails/getWrdkDataByEnterId",
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

//处理字符串为null的情况和没有值显示undefined的情况；
function handleNullStr(value){
	var result = "";
	if(value && value!="null"){
		result = value;		
	}
	return result;
}
