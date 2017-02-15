;(function (pro) {
    function queryUrlParameter() {
        var reg = /([^?&#=]+)=([^?&#=]+)/g;
        var obj = {};
        this.replace(reg, function () {
            obj[arguments[i]] = arguments[2];
        })
        reg = /(#[^?&#=]+)/;
        if (reg.test(this)) {
            obj['HASH'] = reg.exec(this)[1];
        }
    }

    pro.queryUrlParameter = queryUrlParameter;
})(String.prototype);

//-->通过hash值定位元素
function getLocation() {
    var url = window.location.href;
    var hash=url.subStr(url.lastIndexOf('#'))
    // console.log(url.queryUrlParameter().HASH);
}

//控制mian部分的高度，menu的高度
//innerHeight 相当于js中的clientHeight
//outerHeight 相当于js中的offsetHeight;
~(function () {
    function fn() {
        var $main = $(".main"),
            $menu = $(".menu"),
            $body = $(window).innerHeight(),
            $header = $(".headerWrap").outerHeight();
        $main.css('height', $body - $header - 40);
        $menu.css('height', $body - $header - 40 - 2);
    }

    fn();
    $(window).on('resize', fn);
    /*当窗口大小发生改变时，会触发resize事件*/
})();
//menu区域的步骤
/*
 * 1.通过ajax请求到menu部分的数据
 * 2.实现局部滚动（留着）
 * 3.通过Hash值定位到具体的某个A标签，如果没有hash值则定位到第一个元素
 * 4.给每个A标签绑定点击事件
 *
 * */
/*
 * $(ele).children('ul') 查找子元素
 * $(ele).find('ul') 查找后代元素
 * $(ele).filter(".a1") 在同级元素下，二次筛选
 *
 * */
var menuRender = (function () {
    var $menuUl = $(".menu ul");

    function bindHtml(data) {
        /*        var str = '';
         $.each(data, function (index, item) {
         str += '<li><a href="#' + item.hash + '" data-id="' + item.columnId + '">' + item.title + '<i></i></a></li>'
         })
         $menuUl.html(str);*/
        /*模板里的内容*/
        var menuTemStr = $("#menuTemplate").html();
        /*把模板里的内容和数据交给ejs模板引擎渲染，最终返回拼接后的一个字符串*/
        var result = ejs.render(menuTemStr, {menuData: data});
        /*menuData指的是返回的数据，必须html页面里面的模板里的一致*/

        //把最终结果反倒ul中
        $menuUl.html(result);
    }

    return {
        init: function () {
            $.ajax({
                url: 'json/menu.json',
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    if (data && data.length > 0) {
                        bindHtml(data);
                    }
                }
            })
        }
    }
})()
menuRender.init();