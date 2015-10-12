$(document).ready(function (e) {
    var active = $('ul.nav li a');
    $('ul.nav li a+span').css({"visibility": "hidden"});
    active.mouseenter(function () {
        $(this).siblings('span').css({"visibility": "visible"});
    });
    active.mouseleave(function () {
        $(this).siblings('span').css({"visibility": "hidden"});
    })
});
