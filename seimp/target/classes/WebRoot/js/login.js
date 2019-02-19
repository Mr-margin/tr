$('.user-level').click(function () {
    if ($(this).children('img').src = 'img/login/login-null.png') {
        $(this).children('img').attr('src', 'img/login/login-check.png').parent().siblings().children('img').attr('src', 'img/login/login-null.png');
    }
    userlevel = $(this).attr('userlevel');
});
var userlevel = 0;
function ajaxPost1(url, parameter) {
    var parameterPar = {
        "token": "",
        "data": JSON.stringify(parameter)
    };
    return $.ajax(url, {
        type: "POST",
//        xhrFields: {
//            withCredentials: true
//        },
//        crossDomain: true,
        dataType: 'Json',
        data: parameterPar
    })
}

function getImage() {
    document.getElementById('image').src = "/seimp/user/getImage?" + Math.random();
}

/*登录*/
function login() {
    var name = $("#name").val().trim();
    var pwd = $("#pwd").val().trim();
    if (name == "") {
        return toastr.info("请填写账号");
    }
    if (pwd == "") {
        return toastr.info("请填写密码");
    }
    var rand = $("#rand").val();
    if (rand == "") {
        return toastr.info("请填写验证码");
    }
    var url = '/seimp/user/login';
    var data = {
        loginName: name,
        password: pwd,
//        type: userlevel,
        rand: rand
    }
    ajaxPost1(url, data).done(function (data) {
        if (data.status == 0) {
            $("#name").html("");
            $("#pwd").html("");
            var storage = window.sessionStorage;
            storage["rights"] = JSON.stringify(data.data.rights);
            storage["userID"] = data.data.userID;
            storage["roleName"] = data.data.roleName;
            storage["roleID"] = data.data.roleID;
            storage["regionCode"] = data.data.regionCode;
            storage["name"] = data.data.name;
            storage["userLevel"] = data.data.userLevel;
            storage["isLogin"] = true;
            storage["token"] = data.data.token;

            var url = location.search; //获取url中"?"符后的字串
            if (url.indexOf("?") != -1) {  //判断是否有参数
                var str = url.substr(1); //从第一个字符开始 因为第0个是?号 获取所有除问号的所有符串
                strs = str.split("=");  //用等号进行分隔 （因为知道只有一个参数 所以直接用等号进分隔 如果有多个参数 要用&号分隔 再用等号进行分隔）
                if ( strs[1].indexOf("http://") != -1){//http://114.251.10.109/shareuserlogin.jsp
                    window.location.href = strs[1]+"?token="+data.data.token;
                } else {
                    window.location.href ="http://"+strs[1]+"?token="+data.data.token;
                }

            } else {
                window.location.href = "index.html";
            }
        } else {
            toastr.error(data.msg);
            getImage();
        }
    });
}
document.onkeyup = function (e) {
    if (window.event)//如果window.event对象存在，就以此事件对象为准
        e = window.event;
    var code = e.charCode || e.keyCode;
    if (code == 13) {
        login();
        //此处编写用户敲回车后的代码
    }
};
function isPostalCode(s) {
    var patrn = /(?!^\d+$)(?!^[a-zA-Z]+$)[0-9a-zA-Z]{8,16}/;
    if (!patrn.exec(s)) return false
    return true
};