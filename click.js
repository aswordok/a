/**
 * Created by user on 2017/4/29.
 */

$().ready(function () {
    $("#add").click(function () {
        fillList();
    });
    $("#del").click(function () {
        $("#fileList").find("option:selected").remove();
    });
    $("#empty").click(function () {
        $("#fileList").empty();
    });
    $("#run").click(function () {
        gray();

        let tmpAdFiles=[];
        if ($("#checkPre").prop("checked") && $("#preAdd").val().trim().length > 0) {
            let adFullPreIn = $("#preAdd").val().trim();
            let adShorPre = adFullPreIn.substring(adFullPreIn.lastIndexOf("\\") + 1, adFullPreIn.lastIndexOf("."));//文件名不带后缀
            const {app} = require('electron').remote;
            let temp = app.getPath('temp');
            const path = require('path');
            let adFullPre = path.join(temp, adShorPre) + ".ts";
            tmpAdFiles.push(adFullPre);
        }
        if ($("#checkPost").prop("checked") && $("#postAdd").val().trim().length > 0) {
            let adFullPostIn = $("#postAdd").val().trim();
            let adShorPost = adFullPostIn.substring(adFullPostIn.lastIndexOf("\\") + 1, adFullPostIn.lastIndexOf("."));
            const {app} = require('electron').remote;
            let temp = app.getPath('temp');
            const path = require('path');
            let adFullPost = path.join(temp, adShorPost) + ".ts";
            tmpAdFiles.push(adFullPost);
        }
        delArrFiles(tmpAdFiles);

        checkRight(passRightCallEncoding);
    });
    /*$("#test").click(function () {
     alert("Warn: Exit now!");
     const {app} = require("electron").remote;
     app.quit();
     });*/

    $("#upBtn").click(function () {
        $("#fileList").find(":selected").each(function(){
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

function gray() {//菜单变灰
    $("#codeList").prop("disabled", true);
    $("#run").prop("disabled", true);
    $("#setting input").prop("disabled", true);//不再冒泡泡菜单
    $("#setting button").prop("disabled", true);

    const {Menu} = remote;
    let mainMenu = Menu.getApplicationMenu();
    mainMenu.items[1].submenu.items[0].enabled =false;
    mainMenu.items[1].submenu.items[1].enabled =true;
    //console.log("Menu:");
    //console.log(mainMenu.items[1].submenu.items[0]);
    contextMenu.items[2].enabled =false;
    contextMenuList.items[6].enabled =false;
}

function degray() {//恢复菜单
    $("#codeList").prop("disabled", false);
    $("#run").prop("disabled", false);
    $("#setting input").prop("disabled", false);
    $("#setting button").prop("disabled", false);

    const {Menu} = remote;
    let mainMenu = Menu.getApplicationMenu();
    mainMenu.items[1].submenu.items[0].enabled = true;
    mainMenu.items[1].submenu.items[1].enabled =false;
    contextMenu.items[2].enabled = true;
    contextMenuList.items[6].enabled = true;
}

//拖放文件
$().ready(function () {
    bindDrop(document.getElementById('fileList'), fillListAct);
    bindDrop(document.getElementById('logoAdd'), fillLogoAct);
    bindDrop(document.getElementById('preAdd'), fillPreAct);
    bindDrop(document.getElementById('postAdd'), fillPostAct);
    bindDrop(document.getElementById('outputAdd'), fillOutputAct);
});

document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault() //阻止默认动作
};

let bindDrop = function (obj, callback) {
    obj.ondrop = (ev) => {//绑定drop事件
        ev.preventDefault();//阻止默认动作
        ev.stopPropagation();//阻止冒泡
        if (obj.disabled==true){
            return;
        }
        let files = ev.dataTransfer.files;
        let fileNames = [];
        for (let i = 0; i < files.length; i++) {
            fileNames.push(files[i].path);
        }
        console.log(fileNames);
        callback(fileNames);
    };
};

let unbindDrop = function (obj) {
    obj.ondrop = (ev) => {//绑定drop事件
        ev.preventDefault();//阻止默认动作
        ev.stopPropagation();//阻止冒泡
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
    if ($("#fileList option:first").val() == "dnd") { //drag & drop files here.
        $("#fileList").empty();
    }
    for (let i in fileNames) {
        $("#fileList").append("<option value='" + fileNames[i] + "'  class='lst'>" + fileNames[i] + "</option>");
    }
}
function fillLogoAct(fileNames) {
    if (fileNames[0].slice(-4)!=".png"){
        alert("仅支持.png图片挂角。","提示");
    }else{
        $("#logoAdd").val(fileNames[0]);
    }
    $("#logoAdd").trigger("change");//主动触发事件
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