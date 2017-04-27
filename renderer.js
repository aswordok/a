// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
console.log("Start render process");

//unzip f.exe
//参考https://github.com/maxogden/extract-zip
//到达当前用户桌面
const {app} = require('electron').remote;
console.log("Get environmental path:");
console.log(app.getPath('desktop'));
console.log(app.getPath('temp'));
const fs = require('fs');
const path = require('path');
let tmpFiles = [];
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
    //return false; //阻止退出
};

const {dialog} = require('electron').remote;
let selectFile = function (callback) {
    dialog.showOpenDialog(
        {
            properties: ['multiSelections'],
            //filters: [{name: 'text', extensions: ['txt']}]
        },
        function (fileNames) {
            if (!fileNames) return;
            console.log(fileNames);
            callback(fileNames);
        }
    );
};

//拖放待转码文件
document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault() //阻止默认动作
};

let bindDrop = function (obj, callback) {
    obj.ondrop = (ev) => {
        ev.preventDefault();//阻止默认动作
        ev.stopPropagation();//阻止冒泡
        let files = ev.dataTransfer.files;
        let fileNames = [];
        for (let i = 0; i < files.length; i++) {
            fileNames.push(files[i].path);
        }
        console.log(fileNames);
        callback(fileNames);
    };
};
bindDrop(document.getElementById('fileList'), fillListAct);

bindDrop(document.getElementById('logoAdd'), fillLogoAct);
bindDrop(document.getElementById('preAdd'), fillPreAct);
bindDrop(document.getElementById('postAdd'), fillPostAct);
bindDrop(document.getElementById('outputAdd'), fillOutputAct);

/*
 (function(i){//匿名+闭包
 ...
 })(i);
 */

exports.fillList = function () {
    selectFile(fillListAct);
}
exports.fillLogo = function () {
    selectFile(fillLogoAct);
};
exports.fillPre = function () {
    selectFile(fillPreAct);
};
exports.fillPost = function () {
    selectFile(fillPostAct);
};
exports.fillOutput = function () {
    selectFile(fillOutputAct);
};

function fillListAct(fileNames) {
    if ($("#fileList option:first").val() == "dnd") { //drag & drop files here.
        $("#fileList").empty();
    }
    for (let i in fileNames) {
        $("#fileList").append("<option value='" + fileNames[i] + "'>" + fileNames[i] + "</option>");
    }
}
function fillLogoAct(fileNames) {
    $("#logoAdd").val(fileNames[0]);
}
function fillPreAct(fileNames) {
    $("#preAdd").val(fileNames[0]);
}
function fillPostAct(fileNames) {
    $("#postAdd").val(fileNames[0]);
}
function fillOutputAct(fileNames) {
    $("#outputAdd").val(fileNames[0]);
}

//f.exe  -i "d:/user/desktop/myVideo.ts" -vcodec libx264 -acodec mp2 -f mpegts "d:/user/desktop/myVideo_out.ts -y"
//-y 输出覆盖
let fProcess;
function encoder() {
    var fIn = "d:/user/desktop/myVideo.mp4";
    var fOut = "d:/user/desktop/myVideo_out.ts";

    const spawn = require('child_process').spawn;
    fProcess = spawn(f, ['-i', fIn, '-vcodec', 'libx264', '-acodec', 'mp2', '-f', 'mpegts', fOut, '-y']);
    //手动杀掉spawn,参见：https://discuss.atom.io/t/quitting-electron-app-no-process-exit-event-or-window-unload-event-on-renderer/27363
    fProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    fProcess.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    fProcess.on('close', (code) => {
        console.log(`子进程退出码：${code}`);
    });
}
exports.encoding = encoder;
exports.killSpawn = () => {
    if (fProcess) {
        console.log('killing encoder ...');
        fProcess.kill('SIGTERM');//SIGTERM为结束信号
        fProcess = null;
    }
};

exports.help = () => {
    const {exec} = require("child_process");
    exec("start http://115.28.2.167/streamer/help.html", function (error, stdout, stderr) {
        if (error) {
            console.log(error.message);
        }
    });
};
