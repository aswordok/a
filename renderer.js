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
fs.exists(path.join(__dirname, 'f.zip'), function (exists) {
    if (exists) {
        var f = path.join(__dirname, 'f.zip');
        console.log("Found f:");
        console.log(f);
    } else {
        fs.exists(path.join(__dirname, 'resources/app.asar/f.zip'), function (exists) {
            if (exists) {
                var f = path.join(__dirname, 'resources/app.asar/f.zip');
                console.log("Found f:");
                console.log(f);
            } else {
                alert("Warn: Encorder has lost!");
                debugger;
                this.process = null;
            }
        });
    }
});


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

//f.exe  -i "d:/user/desktop/myVideo.ts" -vcodec libx264 -acodec mp2 -f mpegts "d:/user/desktop/myVideo_out.ts"
function encoder() {
    var fIn = "d:/user/desktop/myVideo.ts";
    var fOut = "d:/user/desktop/myVideo_out.ts";

    const spawn = require('child_process').spawn;
    const ff = spawn('f.exe', ['-i', fIn, '-vcodec', 'libx264', '-acodec', 'mp2', '-f', 'mpegts', fOut]);
    ff.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ff.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ff.on('close', (code) => {
        console.log(`子进程退出码：${code}`);
    });
}

exports.encoding = encoder;