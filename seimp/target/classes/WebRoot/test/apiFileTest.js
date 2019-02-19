function getExcelFile(){
	ajaxPost(url, parameter).done(function (result) {
        console.log(result);

        window.open(result.data);
    });
}
//污染地块文件下载
var url = "/seimp/wrdk/getExcelFile";
var parameter = {
		wrdkbm : '',
		wrdkmc : '',
		scjdbm : 'S0',
		province : '',
		city : '',
		county : ''
}

//撤销数据文件下载
var url1 = "/seimp/lplw/getExcelFile";
var parameter1 = {
		isType:'',
		unitName:'',
		zxType:'',
		createTimeStart:'2018-05-16',
		createTimeEnd:'2018-06-15',
		timeSort:'DESC',
		timeRange:'30天'
}

