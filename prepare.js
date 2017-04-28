/**
 * Created by user on 2017/4/15.
 */
console.log("start prepare ...");

//alert($(window).width());
$(window).resize(
    function () {
        $("#list").height($(window).height() - 245);//496-(250-5)
        $("#fileList").height($(window).height() - 265);//496-(236+29)
        $("#upBtn").height($(window).height() - 252);//496-(247+5)
        $("#code").height($(window).height() - 383);//496-(110+3)
        $("#codeInfo").height($(window).height() - 399);//496-(94+3)
        $("#logoAdd").width($(window).width() - 442);//784-442
        $("#preAdd,#postAdd").width(($(window).width() - 306) / 2);//[784-(239+67)]/2
        $("#outputAdd").width($(window).width() - 270);//784-(514-244)
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
    $("#test").click(function () {
        alert("Warn: Exit now!");
        const {app} = require("electron").remote;
        app.quit();
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

let getMachineId = function () {
    let {execSync} = require('child_process');
    let tmpId = "id";
    try {
        let buff = execSync("wmic cpu get ProcessorId");
        let str = buff.toString();
        let arr = str.split(/[\r\n]/);
        for (let i = 1; i < arr.length; i++) {
            if (arr[i].trim().length != 0) {
                console.log(arr[i]);
                tmpId += "|" + arr[i].trim();
            }
        }
        buff = execSync("wmic diskdrive get SerialNumber");
        str = buff.toString();
        arr = str.split(/[\r\n]/);
        for (let i = 1; i < arr.length; i++) {
            if (arr[i].trim().length != 0) {
                console.log(arr[i]);
                tmpId += "|" + arr[i].trim();
                break;//只绑第一硬盘，防止挺入U盘
            }
        }
        buff = execSync("wmic baseboard get SerialNumber");
        str = buff.toString();
        arr = str.split(/[\r\n]/);
        for (let i = 1; i < arr.length; i++) {
            if (arr[i].trim().length != 0) {
                console.log(arr[i]);
                tmpId += "|" + arr[i].trim();
                break;
            }
        }
    } catch (e) {
        console.log(e.message);
        alert("Catch a error when get MachineId.Exit now!");
        alert(e.message);
        const {app} = require('electron').remote;
        app.quit();
    }
    console.log(tmpId);
    const crypto = require('crypto');
    let sha1 = crypto.createHash('sha1');
    sha1.update(tmpId, 'utf8');
    let hashId=sha1.digest("hex");
    console.log(hashId);
    return hashId;
};

function checkRight(callback) {
    $.ajax({
        type: 'get',
        dataType: "json",//xml,html,script,json,jsonp,text
        encode: "utf-8",
        url: '/streamer/checkRight.js', // 需要提交的 url
        data:data,
        success: function (data) {
            if (window.console){
                console.log(typeof(data));
                console.log(JSON.stringify(data));
            }
            callback(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (window.console){
                console.log("数据加载失败：");
                console.log(XMLHttpRequest.status);
                console.log(XMLHttpRequest.readyState);
                console.log(textStatus);//通常情况下textStatus和errorThrown只有其中一个包含信息
                console.log(errorThrown);
            }
            alert("在线鉴权失败，请检查internet网路。","警告");
        }
    });
}
function altRight(data) {
    if (!data["pay"]){
        alert("本机未授权");
        return;
    }
    let myDate = new Date();
    if (data["validDate"]>myDate){
        alert("你的授权有效期为："+data["validDate"].toLocaleDateString()+"\n\r当前有效。");
    }else{
        alert("你的授权有效期为："+data["validDate"].toLocaleDateString()+"\n\r当前失效。");
    }
}