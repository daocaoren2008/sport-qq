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

var menuRender = (function () {
    var $menuUl = $(".menu ul");

    function bindHtml(data) {
        var str = '';
        $.each(data, function (index, item) {
            str += '<li><a href="#' + item.hash + '" data-id="' + item.columnId + '">' + item.title + '<i></i></a></li>'
        })
        $menuUl.html(str);
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
}
)()
menuRender.init();