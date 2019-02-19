/**
 * 数据上传
 * TB_WRDKJBXXB
 */
//初始化页面高度
parent.document.getElementById("myiframe").style.height = "0px";
parent.changeBread([{title: '共享交换', link: 'javascript:parent.backDatePage()'}, {title: '数据上传'}]);
function showUploadDate() {	
    $('#getExile').bootstrapTable({
        data: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        columns: [{
            field: 'num',
            title: '序号'
        }, {
            field: 'province',
            title: '省'
        }, {
            field: 'city',
            title: '市'
        }, {
            field: 'county',
            title: '县'
        }, {
            field: 'name',
            title: '企业名称'
        }, {
            field: 'code',
            title: '组织机构代码'
        }, {
            field: 'enterpriceType',
            title: '企业类型'
        }, {
            field: 'lon',
            title: '经度'
        }, {
            field: 'lat',
            title: '纬度'
        }, {
            field: 'legend',
            title: '法人'
        }, {
            field: 'time',
            title: '发布时间'
        }, {
            field: 'note',
            title: '备注'
        }]
    });
}
showUploadDate();

/*上传数据站点文件*/
var uploadFLag;
var templateType;
function uploadFile(type) {
    var file;
    if (type == 1) {
        file = $('#uploadFile')[0].files[0];
    } else if (type == 2) {
        file = $('#uploadFile1')[0].files[0];
    }
    if (file == undefined) {
        return toastr.info("请选择文件");
    }
    var formData = new FormData();
    formData.append('file', file);
    templateType = type;
    $.ajax({
        url: "/seimp/share/getFileJson1?type=" + type,
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false
    }).done(function (data) {
        if (data.status == 0) {
            var columns = [];
            for (var k = 0; k < data.data.titles.length; k++) {
                var tem = {
                    field: 'par' + k,
                    title: data.data.titles[k]
                };
                columns.push(tem);
            }
            var len = data.data.result.length;
            if (len < 10) {
                for (var i = 10; i > len; i--)
                    data.data.result.push({});
            }
            $('.show_table_title').show();
            $('.saveandclear').show();
            $('#getExile').bootstrapTable('destroy');
            $('#getExile').bootstrapTable({
                data: data.data.result,
                columns: columns
            });
            var mes = "";
            if (data.data.errors.length > 0) {
                mes += "文件中省份-企业名称重复：";
                mes += data.data.errors.join(",");
                mes += "\r\n";
            }
            if (data.data.errors1.length > 0) {
                mes += "文件中组织机构代码重复：";
                mes += data.data.errors1.join(",");
                mes += "\r\n";
            }
            if (data.data.errors2.length > 0) {
                mes += "与库中省份-企业名称冲突：";
                mes += data.data.errors2.join(",");
                mes += "\r\n";
            }
            if (data.data.errors3.length > 0) {
                mes += "与库中组织机构代码冲突：";
                mes += data.data.errors3.join(",");
                mes += "\r\n";
            }
            if (mes.length > 0) {
                uploadFLag = 1;
                swal("校验失败", mes, "error");
            } else {
                swal("校验成功", "可以进行保存", "success");
                uploadFLag = 0;
            }
        } else {
            toastr.info("上传失败");
        }
    });
}

function saveData() {
    return;
    if (uploadFLag == 1) {
        toastr.info("数据异常无法保存");
    }
    var rows = $('#getExile').bootstrapTable('getData');
    if (rows.length > 0) {
        ajaxPost("/seimp/share/addDatasite", {array: rows, type: templateType}).done(function (data) {
            if (data.status == 0) {
                swal("上传站点信息成功", "", "success");
            } else {
                swal("上传站点信息失败", "", "error");
            }
        });
    }
}