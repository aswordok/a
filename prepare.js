/**
 * Created by user on 2017/4/15.
 */
console.log("start prepare ...");
let tmpFiles = [];

$().ready(function () {
    setDesk();
});

//alert($(window).width());
$(window).resize(
    function () {
        $("#fileList").height($(window).height() - 245);//496-(250-5)
        $("#list").height($(window).height() - 265);//496-(236+29)
        $("#upBtn").height($(window).height() - 252);//496-(247+5)
        $("#code").height($(window).height() - 383);//496-(110+3)
        $("#codeInfo").height($(window).height() - 399);//496-(94+3)
        $("#logoAdd").width($(window).width() - 442);//784-442
        $("#preAdd,#postAdd").width(($(window).width() - 306) / 2);//[784-(239+67)]/2
        $("#outputAdd").width($(window).width() - 270);//784-(514-244)
    }
);

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
        url: 'http://lightcloud.net.cn/streamer/access.js', // 需要提交的 url
        data:{machineId:getMachineId()},
        success: function (data) {
            if(!window.console){
                window.console = {log : function(){}};
            }
            console.log("Show data of access:");
            console.log(JSON.stringify(data));
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
    if (!data[0]["trail"]){
        alert("本机未授权");
        return;
    }
    let myDate = new Date();
    let myValidData=new Date(data[0]["validDate"]);
    console.log("Valid date:");
    console.log(myValidData.toLocaleDateString());
    if (data[0]["validDate"]>myDate){
        alert("你的授权有效期为："+myValidData+"\n\r当前有效。");
    }else{
        alert("你的授权有效期为："+myValidData+"\n\r当前失效。");
    }
}

//清理临时文件
window.onbeforeunload = function (e) {
    console.log("Now clean the tmpFiles.");
    while (tmpFiles.length > 0) {
        let tmp = tmpFiles.pop();
        if (fs.existsSync(tmp)) {
            fs.unlink(tmp, (err) => {
                if (err) {
                    console.log("An error ocurred while delete the file " + tmp);
                    console.log(err);
                    return;
                }
                console.log(tmp + " has be deleted success.");
            });
        } else {
            alert("This file doesn't exist, cannot delete");
        }
    }
    //e.returnValue = false;//官方写法，与下一条二选一
    //return false; //阻止退出
};

//unzip f.exe
//参考https://github.com/maxogden/extract-zip
const {app} = require('electron').remote;
const fs = require('fs');
const path = require('path');
fs.exists(path.join(__dirname, 'f.zip'), function (exists) {
    if (exists) {
        var fZip = path.join(__dirname, 'f.zip');
        console.log("Found f.zip:");
        console.log(fZip);
        cp(fZip);
    } else {
        fs.exists(path.join(__dirname, 'resources/app.asar/f.zip'), function (exists) {
            if (exists) {
                var fZip = path.join(__dirname, 'resources/app.asar/f.zip');
                console.log("Found f.zip:");
                console.log(fZip);
                cp(fZip);
            } else {
                alert("Warn: Encorder has lost!");
                alert("Warn: Exit now!");
                app.quit();
            }
        });
    }
});
let temp = app.getPath('temp');
let f = "";
let cp = function (fZip) {
    const extract = require('extract-zip')
    console.log("Now extract f.zip:");
    extract(fZip, {dir: temp}, function (err) {
        f = path.join(temp, 'f.exe');
        tmpFiles.push(path.join(temp, 'f.exe'));
        if (err) {
            console.log(err);
            alert("Catch a error when extract the encorder!");
            alert(err.message);
            alert("Warn: Exit now!");
            app.quit();
        }
    })
};