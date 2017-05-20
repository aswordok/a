/**
 * Created by user on 2017/4/29.
 */

$().ready(function () {
    $("#add").click(function () {
        fillList();
    });
    $("#del").click(function () {
        $("#list").find("option:selected").remove();
    });
    $("#empty").click(function () {
        $("#list").empty();
    });
    $("#run").click(function () {
        let data=checkRight(passRight);
        if (data.length>0){
            render.encoding(data);
        }else {
            console.log("Fetch nothing when check right!");
        }
    });
    /*$("#test").click(function () {
     alert("Warn: Exit now!");
     const {app} = require("electron").remote;
     app.quit();
     });*/

    $("#upBtn").click(function () {
        $("#list").find(":selected").each(function(){
            $(this).insertBefore($('.lst:first'));
        });
    });

    $("#logoBtn").click(function () {
        fillLogo();
    });
    $("#preBtn").click(function () {
        fillPre();
    });
    $("#postBtn").click(function () {
        fillPost();
    });
    $("#outputBtn").click(function () {
        fillOutput();
    });
});

//拖放文件
$().ready(function () {
    bindDrop(document.getElementById('list'), fillListAct);
    bindDrop(document.getElementById('logoAdd'), fillLogoAct);
    bindDrop(document.getElementById('preAdd'), fillPreAct);
    bindDrop(document.getElementById('postAdd'), fillPostAct);
    bindDrop(document.getElementById('outputAdd'), fillOutputAct);
});
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

/*
 (function(i){//匿名+闭包
 ...
 })(i);
 */

//拾取文件
let fillList = function () {
    selectFile(fillListAct);
}
let fillLogo = function () {
    selectFile(fillLogoAct);
};
let fillPre = function () {
    selectFile(fillPreAct);
};
let fillPost = function () {
    selectFile(fillPostAct);
};
let fillOutput = function () {
    selectDirectory(fillOutputAct);
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
let selectDirectory = function (callback) {
    dialog.showOpenDialog(
        {
            properties: ['openDirectory'],
            //filters: [{name: 'text', extensions: ['txt']}]
        },
        function (dir) {
            if (!dir) return;
            console.log(dir);
            callback(dir);
        }
    );
};

function fillListAct(fileNames) {//提升
    if ($("#list option:first").val() == "dnd") { //drag & drop files here.
        $("#list").empty();
    }
    for (let i in fileNames) {
        $("#list").append("<option value='" + fileNames[i] + "'  class='lst'>" + fileNames[i] + "</option>");
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
function fillOutputAct(directory) {
    $("#outputAdd").val(directory[0]);
}