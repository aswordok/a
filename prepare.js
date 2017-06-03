/**
 * Created by user on 2017/4/15.
 */
console.log("start prepare ...");
let tmpFiles = [];
let codeList = [];

$().ready(function () {
    setDesk();

    //for coode list
    $.ajax({
        type: 'get',
        dataType: "json",//xml,html,script,json,jsonp,text
        encode: "utf-8",
        url: 'http://lightcloud.net.cn/streamer/encoder.json', // 需要提交的 url
        // data: {refresh: Math.random()},//强制刷新
        success: function (data) {
            if (!window.console) {//如果console不存在，定义它的空函数
                window.console = {
                    log: function () {
                    }
                };
            }
            //console.log("Show data of code list:");
            //console.log(JSON.stringify(data));
            let i = data.pop().default;
            codeList = data;
            for (let i in data) {
                //console.log(data[i]);
                $("#codeList").append("<option value=" + data[i].value + ">" + data[i].text + "</option>");
            }
            $("#codeList").val(data[i].value);
            $("#codeInfo").html(data[i].description);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (window.console) {
                console.log("数据加载失败：");
                console.log(XMLHttpRequest.status);
                console.log(XMLHttpRequest.readyState);
                console.log(textStatus);//通常情况下textStatus和errorThrown只有其中一个包含信息
                console.log(errorThrown);
            }
            //console.log("获取数据失败，请检查internet网路。");
            document.write("获取数据失败，请检查internet网路。");
            /*const {app} = require('electron').remote;
             app.quit();*/
        }
    });

    $("select#codeList").change(function () {
        console.log($(this).val());
        switch ($(this).val()) {
            case "UHDmp2":
                $("#codeInfo").html(codeList[0].description);
                break;
            case "UHDac3":
                $("#codeInfo").html(codeList[1].description);
                break;
            case "HDmp2":
                $("#codeInfo").html(codeList[2].description);
                break;
            case "HDac3":
                $("#codeInfo").html(codeList[3].description);
                break;
            case "SDts":
                $("#codeInfo").html(codeList[4].description);
                break;
            default:
                $("#codeInfo").html(codeList[5].description);
        }
    });

    $("#checkLogo").change(function () {
        cpLogo();
    });

    $("#logoAdd").change(function () {
        //alert("input change");
        cpLogo();
    });
});

function cpLogo() {
    if ($("#checkLogo").prop("checked") && $("#logoAdd").val().trim().length > 0) {
        const {app} = require('electron').remote;
        let temp = app.getPath('temp');
        const path = require('path');
        let logoTempAdd = path.join(temp, 'logo.png');
        let logoAdd = $("#logoAdd").val().trim();
        cp(logoAdd, logoTempAdd);
    }
}

function cp(source, target) {
    let copyFile=function (from, to) {
        return new Promise((resolve, reject) => {
            const FileSystem = require('fs');
            const rd = FileSystem.createReadStream(from);
            rd.on('error', err => reject(err));
            const wr = FileSystem.createWriteStream(to);
            wr.on('error', err => reject(err));
            wr.on('close', () => resolve("Copy logo.png success."));
            rd.pipe(wr);
        });
    };

    copyFile(source, target).then(
        (data) => {
            console.log(data);
        },
        (err) => {
            console.log(err);
            alert(err.message);
        }
    );

}

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
    let hashId = sha1.digest("hex");
    console.log(hashId);
    return hashId;
};

function checkRight(callback) {
    let rotateVal = $("#rotation input:checked").val();
    let args = {
        machineId: getMachineId(),
        ver: "3.0",
        code: $("#codeList").val(),
        rotate: rotateVal == undefined ? "" : rotateVal,
        putLogo: $("#checkLogo").prop("checked") && $("#logoAdd").val().trim().length > 0 ? true : false,
        x: $("#x").val(),
        y: $("#y").val(),
    };//key不需要引号，val需要引号
    console.log(JSON.stringify(args));
    $.ajax({
        type: 'get',
        dataType: "json",//xml,html,script,json,jsonp,text
        encode: "utf-8",
        url: 'http://lightcloud.net.cn/streamer/access.js', // 需要提交的 url
        data: args,
        success: function (data) {
            if (!window.console) {//如果console不存在，定义它的空函数
                window.console = {
                    log: function () {
                    }
                };
            }
            console.log("Show data of fetch:");
            console.log(JSON.stringify(data));
            callback(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (window.console) {
                console.log("数据加载失败：");
                console.log(XMLHttpRequest.status);
                console.log(XMLHttpRequest.readyState);
                console.log(textStatus);//通常情况下textStatus和errorThrown只有其中一个包含信息
                console.log(errorThrown);
            }
            document.write("在线鉴权失败，请检查internet网路。");
        }
    });
}
function altRight(data) {
    let curDate = new Date();
    let myValidData = new Date(data[0]["validDate"]);
    console.log("Valid date:");
    console.log(myValidData.toLocaleDateString());
    console.log("Is date?");
    console.log(myValidData instanceof Date);//判断是不是日期
    if (myValidData >= curDate) {
        alert("你的授权有效期为：" + myValidData.toLocaleDateString() + "\n\r当前有效。", "授权检查");
    } else if (data[0]["trail"]) {//试用
        alert("你的授权有效期为：" + myValidData.toLocaleDateString() + "\n\r当前失效,目前试用状态。", "授权检查");
    } else {//过期且关闭试用
        alert("本机未授权！", "授权检查");
    }
    if (data[0]["alert"] != null && data[0]["alert"].trim().length > 0) {
        alert(data[0]["alert"], "提示");
    }
    if (data[0]["pop"] != null && data[0]["pop"].trim().length > 0) {
        const {exec} = require("child_process");
        exec("start " + data[0]["pop"], function (error, stdout, stderr) {
            if (error) {
                console.log(error.message);
            }
        });
    }
}

function passRightCallEncoding(data) {
    let curDate = new Date();
    let myValidData = new Date(data[0]["validDate"]);
    console.log("Valid date:");
    console.log(myValidData.toLocaleDateString());
    console.log("Is date?");
    console.log(myValidData instanceof Date);//true 判断是不是日期
    if (myValidData >= curDate || data[0]["trail"]) {
    } else {//过期且关闭试用
        alert("本机未授权！", "授权检查");
    }
    //if (data[0]["alert"]==null){alert("null");}//true
    if (data[0]["alert"] != null && data[0]["alert"].trim().length > 0) {
        alert(data[0]["alert"], "提示");
    }
    if (data[0]["pop"] != null && data[0]["pop"].trim().length > 0) { //不能弹双窗？
        const {exec} = require("child_process");
        exec("start " + data[0]["pop"], function (error, stdout, stderr) {
            if (error) {
                console.log(error.message);
            }
        });
    }
    if (data.length == 1) {
        console.log("Can't fetch args for encoding,data.length:");
        console.log(data.length);
        return;
    } else {
        let enData = data.pop();
        console.log("Data for endcoding:");
        console.log(JSON.stringify(enData));
        render.encoding(enData);
    }
}

//清理临时文件
window.onbeforeunload = function (e) {
    console.log("Now clean the tmpFiles.");

    const {app} = require('electron').remote;
    let temp = app.getPath('temp');
    const path = require('path');
    let logoTempAdd = path.join(temp, 'logo.png');
    const fs = require('fs');
    fs.exists(logoTempAdd, function (exists) {
        if (exists) {
            fs.unlink(logoTempAdd, (err) => {
                if (err) {
                    console.log("An error ocurred while delete the file " + logoTempAdd);
                    console.log(err);
                }else {
                    console.log(logoTempAdd + " has be deleted successfully.");
                }
            });
        }
    });

    while (tmpFiles.length > 0) {
        let tmp = tmpFiles.pop();
        if (fs.existsSync(tmp)) {
            fs.unlink(tmp, (err) => {
                if (err) {
                    console.log("An error ocurred while delete the file " + tmp);
                    console.log(err);
                    return;
                }
                console.log(tmp + " has be deleted successfully.");
            });
        } else {
            console.log("This file doesn't exist, cannot delete");
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
        unZip(fZip);
    } else {
        fs.exists(path.join(__dirname, 'resources/app.asar/f.zip'), function (exists) {
            if (exists) {
                var fZip = path.join(__dirname, 'resources/app.asar/f.zip');
                console.log("Found f.zip:");
                console.log(fZip);
                unZip(fZip);
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
let unZip = function (fZip) {
    const extract = require('extract-zip')
    //console.log("Now extract f.zip:");
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

function help() {
    const {exec} = require("child_process");
    exec("start http://lightcloud.net.cn/streamer/help.html", function (error, stdout, stderr) {
        if (error) {
            console.log(error.message);
        }
    });
}

function register(id) {
    const {exec} = require("child_process");
    exec("start http://lightcloud.net.cn/streamer/register.html?machineId=" + id, function (error, stdout, stderr) {
        if (error) {
            console.log(error.message);
        }
    });
}