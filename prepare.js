/**
 * Created by user on 2017/4/15.
 */
function pop() {
    alert("popup here");
}
//alert($(window).width());
$(window).resize(
    function () {
        $("#list").height($(window).height()-245);//496-(250-5)
        $("#fileList").height($(window).height()-265);//496-(236+29)
        $("#upBtn").height($(window).height()-252);//496-(247+5)
        $("#code").height($(window).height()-383);//496-(110+3)
        $("#codeInfo").height($(window).height()-399);//496-(94+3)
        $("#logoAdd").width($(window).width()-442);//784-442
        $("#preAdd,#postAdd").width(($(window).width()-306)/2);//[784-(239+67)]/2
        $("#outputAdd").width($(window).width()-270);//784-(514-244)
    }
);

$().ready(function () {
    $("#add").click(function () {
        render.fillList();
    });
    $("#del").click(function () {
            $("#fileList").find("option:selected").remove();
    });
    $("#empty").click(function () {
            $("#fileList").empty();
    });
    $("#run").click(function () {
            render.encoding();
    });

    $("#logoButton").click(function () {
        render.fillLogo();
    });
    $("#preBtn").click(function () {
        render.fillPre();
    });
    $("#postBtn").click(function () {
        render.fillPost();
    });
    $("#outputBtn").click(function () {
        render.fillOutput();
    });
});
