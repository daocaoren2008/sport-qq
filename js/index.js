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


    function formatTime(template) {
        //template = "{1}-{2}"
        template = template || "{0}年{1}月{2}日{3}时{4}分{5}秒";
        var ary = this.match(/(\d+)/g);//["2016", "08", "28", "13", "34", "30"];
        template = template.replace(/{(\d)}/g, function () {
            return ary[arguments[1]];
        });
        return template;
    }

    pro.queryUrlParameter = queryUrlParameter;
    pro.formatTime = formatTime;
})(String.prototype);

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
    var $menuUl = $(".menu ul"),
        $link = null,
        myScroll = null;

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
        $link = $menuUl.find("a");
    }

    //局部滚动
    function completeScroll() {
        myScroll = new IScroll('.menu', {
            scrollbars: true,//有滚动条
            mouseWheel: true,//通过鼠标滚轮控制滚动效果
            // fadeScrollbars:true,//滚动时显示滚动条，不滚动时消失
            // bounce:false,//去掉反弹效果
        })
    }

    //-->通过hash值定位元素
    function getLocation() {
        var url = window.location.href;
        // console.log(url.queryUrlParameter().HASH);
        var hash = url.substr(url.lastIndexOf('#'));
        var $cur = $link.filter("[href='" + hash + "']");
        $cur.length == 0 ? $cur = $link.eq(0) : null;
        $cur.addClass("bg");
        /*滚动条定位到这个元素，第一个参数是js对象，不是jq对象，第二个参数是动画时间*/
        myScroll.scrollToElement($cur[0], 300)
        //获取当前赛事日期
        calenderRender.init($cur.attr('data-id'));
    }

//给所有A标签绑定点击事件
    function bindA() {
        $link.on("click", function () {
            $(this).addClass('bg').parent().siblings().children('a').removeClass('bg');
            //获取到当前赛事的日期数据
            calenderRender.init($(this).attr('data-id'));
        })
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
                        completeScroll();
                        getLocation();
                        bindA();
                    }
                }
            })
        }
    }
})()
menuRender.init();
/*
 * 跨域请求
 * 跨域满足条件：协议、域名、端口号，只要一个不同，这属于跨域请求
 * 一般情况下是通过jsonp来请求数据，jquery这边只需要把dataType设置成jsonp，这样则是跨域请求数据
 *
 * */
var calenderRender = (function () {
    var $wrapper = $(".calender .con .wrapper");

    var $calenderPlan = $.Callbacks();//返回一个计划表
    //在这个计划表里通过add/remove去添加或删除计划，通过ire()执行计划

    //绑定数据
    $calenderPlan.add(function (today, data) {
        var calTemStr = $("#calenderTemplate").html();
        // console.log(data);
        var result = ejs.render(calTemStr, {calenderData: data});

        $wrapper.html(result).css('width', data.length * 110);

    });
    $calenderPlan.add(function (today, data) {
        today = today.replace(/-/g, '');
        $link = $wrapper.children('a');
        var $cur = $link.filter("[data-time='" + today + "']");
        //如果没有和today想匹配的，选择和today日期往后最靠近的一天。
        // console.log($cur.length);
        if ($cur.length == 0) {
            $link.each(function (index, item) {
                var time = $(item).attr('data-time');
                time = time.replace(/-/g, '');
                if (time > today) {//这一项是今天日期往后靠近的一项
                    $cur = $(item);
                    return false;
                }
            });
            //如果往后一个都没有则选中最后一项
            if ($cur.length == 0) {
                $cur = $link.eq($link.length - 1);
            }
        }
        $cur.addClass('bg');
        //把选中的这一项，移动到显示区域第一个位置
        //选中的这一项需要向前移动的距离 = 索引 x 他的宽度
        var maxL = 0, minL = 0;
        minL = -($link.length - 7) * 110;//能移动的最小距离

        var index = $cur.index();
        var curL = -index * 110;
        curL += 110 * 3;//再向后移动3个步长，居中

        curL = curL > maxL ? maxL : (curL < minL ? minL : curL);//处理边界
        //stop(),停止当前正在执行的动画，处理动画积累
        $wrapper.stop().animate({left: curL}, 300)
    })


    /*    function bindHTML(today, data) {
     var calenderStr = $("#calenderTemplate").html();
     /!*把模板里的内容和数据交给ejs模板引擎渲染，最终返回拼接后的一个字符串*!/
     var result = ejs.render(calenderStr, {calenderData: data});
     /!*calenderData指的是返回的数据，必须html页面里面的模板里的一致*!/

     //把最终结果反倒ul中
     // console.log(result);

     $wrapper.html(result);
     /!*        $wrapper.children().each(function (index,item) {
     if(today=item.dataset.date){
     $(this).addClass('bg').siblings().removeClass('bg');
     }
     })*!/


     }*/

    return {

        init: function (columnId) {
            $.ajax({
                url: 'http://matchweb.sports.qq.com/kbs/calendar?columnId=' + columnId,
                method: 'GET',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result.code == 0) {
                        // console.log(result)
                        var data = result.data,
                            today = data.today;//今天日期
                        data = data.data;//日期数组
                        $calenderPlan.fire(today, data);
                        //绑定数据
                        // bindHTML(today, data);
                        /*
                         * 1、ejs绑定数据
                         * 2、从所有日期中选中今天日期，如果没有找到，则选中今天日期往后的靠近的日期，如果往后的日期都没有，则选中最后的一个
                         * 3、把选中日期移动显示区域的中间位置
                         * 4、左右奇幻，切换完成后把显示区域的第一个元素张选中
                         * */
                    }
                }
            })
        }
    }
})();