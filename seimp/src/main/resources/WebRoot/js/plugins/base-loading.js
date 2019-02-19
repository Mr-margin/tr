//获取浏览器页面可见高度和宽度

        var _PageHeight = document.documentElement.clientHeight,

            _PageWidth = document.documentElement.clientWidth;

        //计算loading框距离顶部和左部的距离（loading框的宽度为215px，高度为61px）

        var _LoadingTop = _PageHeight > 61 ? (_PageHeight - 61) / 2 : 0,

            _LoadingLeft = _PageWidth > 215 ? (_PageWidth - 215) / 2 : 0;

        //在页面未加载完毕之前显示的loading Html自定义内容

        var _LoadingHtml = '<div id="loadingDiv" style="position: fixed;left: 0;width: 100%;height: 100%;top: 0;background: rgba(0,0,0,.2);z-index: 10000;"><div style="position: absolute;cursor1: wait;left: 50%;top: 50%;width: auto;height: 60px;line-height: 56px;padding-left: 50px;padding-right: 10px;background: #fff url(img/loading.gif) no-repeat scroll 10px 22px;color: #333;font-family: \'Microsoft YaHei\';font-size: 18px;border-radius: 6px;transform: translate(-50%,-50%);">页面加载中，请等待...</div></div>';

        //呈现loading效果

        document.write(_LoadingHtml);




        //window.onload = function () {

        //    var loadingMask = document.getElementById('loadingDiv');

        //    loadingMask.parentNode.removeChild(loadingMask);

        //};

 

        //监听加载状态改变

        document.onreadystatechange = completeLoading;

 

        //加载状态为complete时移除loading效果

        function completeLoading() {

            if (document.readyState == "complete") {

                var loadingMask = document.getElementById('loadingDiv');

                loadingMask.parentNode.removeChild(loadingMask);

            }

        }