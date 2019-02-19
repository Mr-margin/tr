function getData(){
	ajaxPost(url, parameter).done(function (result) {
        console.log(result);
    });
}

var url = "/seimp/visitStatis/getVisitStatisData";
var parameter = {
		startTime : '',
		endTime : '',
		statisType : ''
}

var url70 = "/seimp/mobile/getStatisDataByUpdateTime";
var parameter70 = {
		startTime : '',
		endTime : '',
		statisType : '',
		statisColumn : 'INSERTTIME',
		statisTable : 'ENTERPRICE_BASEINFO',
		statisColumnType : '2'
}

var url69 = "/seimp/mobile/getMetadataInfoByID";
var parameter69 = {
		MID:'10'
}

//获取权限
var url68 = "/seimp/shareExchange/getDataListByCatalog";
var parameter68 = {
		"type":"0",
		"sortColumn":"DATETIME",
		"pageNumber":1,
		"pageSize":10
}

//获取权限
var url67 = "/seimp/authority/getMenus";
var parameter67 = {
}

//共享交换权限，根据菜单，获取数据集表格
var url66 = "/seimp/authority/getMetadataByCatalog";
var parameter66 = {
		catalogID : "1",
		roleID : ""
}

//共享交换权限，树数据
var url65 = "/seimp/authority/getSETreeData";
var parameter65 = {
}

//共享交换首页-组织机构代码-最后更新时间
var url64 = "/seimp/shareExchange/organCode/getLastUpdateTime.do";
var parameter64 = {
}


//共享交换-组织机构代码-更新历史
var url63 = "/seimp/shareExchange/organCode/getStatisDataByUpdateTime.do";
var parameter63 = {
		startTime : '',
		endTime : '',
		statisType : '日'
}


//共享交换-z组织机构代码-分页数据
var url62 = "/seimp/shareExchange/organCode/getOrganCodeData.do";
var parameter62 = {
		pageSize : 10,
		pageNumber : 0,
		tydmo : '',
		jgdmo : '',
		jgmco : '',
		fddbro : '',
		zcrqoStart : '',
		zcrqoEnd : '',
		province : '',
		city : '',
		county : '',
}

//共享交换首页-淘汰落后产能企业-最后更新时间
var url61 = "/seimp/shareExchange/eb/getLastUpdateTime.do";
var parameter61 = {
}

//共享交换-淘汰落后产能企业-更新历史
var url60 = "/seimp/shareExchange/eb/getStatisDataByUpdateTime.do";
var parameter60 = {
		startTime : '',
		endTime : '',
		statisType : '日'
}

//共享交换-淘汰落后产能企业-所有行业
var url59 = "/seimp/shareExchange/eb/getAllIndustry.do";
var parameter59 = {
}

//共享交换-淘汰落后产能企业-分页数据
var url58 = "/seimp/shareExchange/eb/getEBData.do";
var parameter58 = {
		pageSize : 10,
		pageNumber : 0,
		name : '',
		province : '',
		status : '',
		production : '',
		progress : '',
}

//共享交换首页-重点行业监管企业，遥感核查-最后更新时间
var url57 = "/seimp/shareExchange/wy/getLastUpdateTime.do";
var parameter57 = {
}

//共享交换-重点行业监管企业，遥感核查-更新历史
var url56 = "/seimp/shareExchange/wy/getStatisDataByUpdateTime.do";
var parameter56 = {
		startTime : '',
		endTime : '',
		statisType : '日'
}


//共享交换-重点行业监管企业，遥感核查-分页数据
var url55 = "/seimp/shareExchange/wy/getWYData.do";
var parameter55 = {
		pageSize : 10,
		pageNumber : 0,
		name : '',
		province : '',
		status : '',
		production : '',
		progress : '',
}

//共享交换首页-尾矿库-最后更新时间
var url54 = "/seimp/shareExchange/tailings/getLastUpdateTime.do";
var parameter54 = {
}

//共享交换-尾矿库-更新历史
var url53 = "/seimp/shareExchange/tailings/getStatisDataByUpdateTime.do";
var parameter53 = {
		startTime : '',
		endTime : '',
		statisType : '日'
}


//共享交换-尾矿库-分页数据
var url53 = "/seimp/shareExchange/tailings/getTailingsData.do";
var parameter53 = {
		pageSize : 10,
		pageNumber : 0,
		TAILINGSNAMEPar : '石门雄黄矿业有限公司',
		DETAILEDADDRESSPar : '',
		ENTERPRISENAMEPar : '',
		MINERALTYPEPar : '',
		BASINPar : '',
		LEVELPar : '',
		province : '',
		city : '',
		county : ''
}

//共享交换首页-排污许可证，注销/撤销-最后更新时间
var url52 = "/seimp/shareExchange/enterUndo/getLastUpdateTime.do";
var parameter52 = {
}

//共享交换-排污许可证，注销/撤销-更新历史
var url51 = "/seimp/shareExchange/enterUndo/getStatisDataByUpdateTime.do";
var parameter51 = {
		startTime : '2018-05-26',
		endTime : '',
		statisType : '日'
}


//共享交换-排污许可证，注销/撤销-所有行业类型
var url50 = "/seimp/shareExchange/enterUndo/getAllZXTYPEByZXTYPE.do";
var parameter50 = {
}

//共享交换-排污许可证，注销/撤销-分页数据
var url49 = "/seimp/shareExchange/enterUndo/getEnterpriseUndoinfoData.do";
var parameter49 = {
		pageSize : 10,
		pageNumber : 0,
		isType : '',
		unitName : '',
		zxType : '',
		createTimeStart : '',
		createTimeEnd : ''
}

//共享交换-企业基本信息-最后更新时间
var url48 = "/seimp/shareExchange/enterBase/getLastUpdateTime.do";
var parameter48 = {
}

//共享交换-企业基本信息-更新历史
var url47 = "/seimp/shareExchange/enterBase/getStatisDataByUpdateTime.do";
var parameter47 = {
		startTime : '2018-05-26',
		endTime : '',
		statisType : '日'
}


//共享交换-排污许可证，企业基本信息-所有行业类型
var url46 = "/seimp/shareExchange/enterBase/getAllHyname.do";
var parameter46 = {
}

//共享交换-排污许可证，企业基本信息-分页数据
var url45 = "/seimp/shareExchange/enterBase/getEnterpriseBaseinfoData.do";
var parameter45 = {
		pageSize : 10,
		pageNumber : 0,
		devcompany : '',
		hyName : '',
		province : '440000',
		city : '',
		county : ''
}


//共享交换-建设项目-最后更新时间
var url44 = "/seimp/shareExchange/yzCons/getLastUpdateTime.do";
var parameter44 = {
}

//共享交换-建设项目-更新历史
var url43 = "/seimp/shareExchange/yzCons/getStatisDataByUpdateTime.do";
var parameter43 = {
		startTime : '2018-05-26',
		endTime : '',
		statisType : '日'
}

//共享交换-建设项目-所有环评管理类别名称
var url42 = "/seimp/shareExchange/yzCons/getAllEiamanagename.do";
var parameter42 = {
}

//共享交换-建设项目-所有数据来源
var url41 = "/seimp/shareExchange/yzCons/getAllDatasource.do";
var parameter41 = {
}

//共享交换-建设项目分页数据
var url40 = "/seimp/shareExchange/yzCons/getYzConsData.do";
var parameter40 = {
		projectname : "",
		provincename : "",
		eiamanagename : "",
		datasource : "",
		acceptancedateStart : "",
		acceptancedateEnd : "",
		pageSize : '10',
		pageNumber : '0'
}


//共享交换-汇总数
var url39 = "/seimp/pic/getKeyIndustry1.do";
var parameter39 = {
		industry : ""
}

//共享交换-汇总数
var url38 = "/seimp/pic/getYGHC1.do";
var parameter38 = {
		industry : ""
}

//共享交换-汇总数
var url37 = "/seimp/shareExchange/getIndexSumValue";
var parameter37 = {
}

//疑似污染地块预警首页-汇总数
var url36 = "/seimp/lplw/getIndexSumValue";
var parameter36 = {
}

//首页-站内统计
var url37 = "/seimp/portal/getVisitStatisData";
var parameter37 = {
}

//重点行业监管企业-获取最后更新时间
var url36 = "/seimp/kep/getLastUpdateTime";
var parameter36 = {
}

//重点行业监管企业-获取最后更新时间
var url35 = "/seimp/wrdk/getLastUpdateTime";
var parameter35 = {
}

//重点行业监管企业-数据更新统计接口
var url34 = "/seimp/kep/getStatisDataByUpdateTime";
var parameter34 = {
		startTime : '2018-02-07',
		endTime : '',
		statisType : '年'		
}

//重点行业监管企业-按省份统计
var url33 = "/seimp/kep/getAllIndustry";
var parameter33 = {
					
}

//重点行业监管企业-按省份统计
var url32 = "/seimp/kep/getKeyEnterprise";
var parameter32 = {
		pageSize:10,
		pageNumber:0,
		enterpriseName : '',
		industry : '',
		province : '',
		city : '',
		county : ''
					
}

//重点行业监管企业-按省份统计
var url31 = "/seimp/kep/getStatisDataOfProvince";
var parameter31 = {
}

//重点行业监管企业-按行业统计
var url30 = "/seimp/kep/getStatisDataOfIndustry";
var parameter30 = {
}

//污染地块数据，获取最后更新时间
var url29 = "/seimp/lplw/getLastUpdateTime";
var parameter29 = {
}

//污染地块数据，更新时间统计
var url28 = "/seimp/wrdk/getStatisDataByUpdateTime";
var parameter28 = {
		startTime : '',
		endTime : '',
		statisType : '年'
}

//根据id，获取申请详情数据接口
var url27 = "/seimp/askData/getAskDataByID";
var parameter27 = {
		AID : '65',
}


//更新审核数据
var url26 = "/seimp/askData/updateAskData";
var parameter26 = {
		AID : '65',
		verifyStatus : '1',
		verifyReason : '审核通过'
}

//查询申请数据列表
var url25 = "/seimp/askData/getAskDataByStatus";
var parameter25 = {
		verifyStatus : '0',
		pageNumber : 0,
		pageSize : 10
}

//查询未审核申请数据数量
var url24 = "/seimp/askData/getAskDataCountByStatus";
var parameter24 = {
}

//添加申请数据
var url23 = "/seimp/askData/addAskData";
var parameter23 = {
		metadataID:'10',
		askDepartment : '环保部',
		askName : '黄贯中',
		askTel : '18303017982',
		askEmail : '1202993211@qq.com',
		askReason : '用于...'
}

//元数据数据项信息
var url22 = "/seimp/shareExchange/getMetadataColumnInfoByID";
var parameter22 = {
		MID:'10'
}

//元数据信息
var url21 = "/seimp/shareExchange/getMetadataInfoByID";
var parameter21 = {
	MID:'10'
}

//污染地块
var url20 = "/seimp/wrdk/getWrdkData";
var parameter20 = {
	pageSize : "10",
	pageNumber : 0,
	wrdkbm : '',
	wrdkmc : '',
	scjdbm : 'S0',
	province : '',
	city : '',
	county : ''
		
}

//某一个市的所有县
var url19 = "/seimp/shareExchange/getCountyByCity";
var parameter19 = {
		cityID : "126"
}
//某一个省的所有市
var url18 = "/seimp/shareExchange/getCityByProvince";
var parameter18 = {
		provinceID : "11"
}
//所有省份
var url17 = "/seimp/shareExchange/getAllProvince";
var parameter17 = {
}


//污染地块按省份查询
var url16 = "/seimp/wrdk/getStatisDataOfProvince";
var parameter16 = {
}
//污染地块按所处阶段统计
var url15 = "/seimp/wrdk/getStatisDataOfSCJDBM";
var parameter15 = {
}

//数据集ID查询
var url14 = "/seimp/shareExchange/getDatalistByID";
var parameter14 = {
		ID:'10'
}

//共享交换-数据集列表接口
var url13 = "/seimp/shareExchange/getDataListByCatalog";
var parameter13 = {
		"type":101,
		"pageNumber":1,
		"pageSize":12,
		sortColumn:"SERVICEACCOUNT"
}

//共享交换首页-访问、下载记录
var url12 = "/seimp/shareExchange/addVisitOrDownData";
var parameter12 = {
		metadataID : '1',
		type : '1'
}


//共享交换首页-资源共享情况统计
var url11 = "/seimp/shareExchange/getResourceShareDataStatis";
var parameter11 = {
		type : '1',
		dateStart : '2018-05-29',
		dateEnd : ''
}

var url10 = "/seimp/shareExchange/getResourceShareDataStatisAll";
var parameter10 = {
		dateStart : '2018-05-29',
		dateEnd : '2018-06-16'
}

//共享交换首页-数据快速浏览列表
var url10 = "/seimp/shareExchange/getQuickReadList";
var parameter10 = {
		
}
//共享交换首页汇总数
var url9 = "/seimp/shareExchange/getSumValue";
var parameter9 = {
	
}
//数据集名称查询
var url8 = "/seimp/shareExchange/getDatalistByName";
var parameter8 = {
		name:'金属',
		sortColumn:'DATETIME',
		pageNumber:1,
		pageSize:10
}


//排序许可证企业周围污染地块
var ur7 = "/seimp/lplw/getWrdkDataByRange";
var paramete7 = {
		enterId:'80859948-2825-4303-b741-92741aba7648'
}

//所有注销/撤销原因类型
var url6 = "/seimp/lplw/getAllZXTYPEByZXTYPE";
var parameter6 = {
		
}

//排污许可证，关联污染地块
var url5 = "/seimp/lplw/getWrdkDataByEnterId";
var parameter5 = {
		enterId:'80859948-2825-4303-b741-92741aba7648',
		joinType:'1'
}

//排污许可证，分行业
var url4 = "/seimp/lplw/getStatisDataOfEnterpriceUndoDataByHYNAME";
var parameter4 = {	
}

//排污许可证，分省
var url3 = "/seimp/lplw/getStatisDataOfEnterpriceUndoDataByProvince";
var parameter3 = {	
}


//排序许可证详细信息，关联企业
var url2 = "/seimp/lplw/getEnterpriceBaseInfoDataByEnterId";
var parameter2 = {
		enterId:'80859948-2825-4303-b741-92741aba7648'
}

//排污许可证列表
var url1 = "/seimp/lplw/getEnterpriceUndoInfoData";
var parameter1 = {
		isType:'',
		unitName:'',
		zxType:'',
		createTimeStart:'',
		createTimeEnd:'',
		timeRange:'30天',
		timeSort:'DESC',
		pageSize:10,
		pageNumber:0
}