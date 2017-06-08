/**
 * Created by user on 2017/4/16.
 */
let template = [{
    label: '文件',
    submenu: [{
        label: '添加',
        accelerator: 'CmdOrCtrl+O',
        click: function () {
            $("#add").click();
        }
    }, {
        label: '清空',
        accelerator: 'Alt+E',
        click: function () {
            $("#empty").click();
        }
    }, {
        type: 'separator'
    }, {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
            const {app} = require('electron').remote;
            app.quit();
        }
    }]
}, {
    label: '运行',
    submenu: [{
        label: '编码',
        accelerator: 'CmdOrCtrl+R',
        click: function () {
            $("#run").click();
        }
    }, {
        label: '中止',
        accelerator: 'CmdOrCtrl+C',
        enabled:false,
        click: function () {
            render.killSpawn();

            //恢复菜单
            ungray();
        }
    }]
}, {
    label: '帮助',
    submenu: [{
        label: '帮助',
        accelerator: 'CmdOrCtrl+H',
        click: function () {
            help();
        }
    }, {
        type: 'separator'
    }, {
        label: '软件注册',
        click: function () {
            let machineId = getMachineId();
            const clipboard = require('electron').clipboard;
            clipboard.writeText(machineId);
            register(machineId);
        }
    }, {
        label: '注册查询',
        click: function () {
            checkRight(altRight);
        }
    }]
}];

const {remote} = require('electron');//{变量名}是ES6中新语法，叫解构
const {Menu, MenuItem} = remote;
let mainMenu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(mainMenu);

//绑定全局泡泡
var contextMenu = new Menu();
contextMenu.append(new MenuItem({
    label: '添加', click: function () {
        $("#add").click();
    }
}));
contextMenu.append(new MenuItem({type: 'separator'}));
contextMenu.append(new MenuItem({
    label: '编码', click: function () {
        $("#run").click();
    }
}));
window.addEventListener('contextmenu', function (e) {
    //console.log("Bind window popup menu.");
    e.preventDefault();//阻止默认动作
    contextMenu.popup(remote.getCurrentWindow(e.sender));
}, false);

//list泡泡
var contextMenuList = new Menu();
contextMenuList.append(new MenuItem({
    label: '添加', click: function () {
        $("#add").click();
    }
}));
contextMenuList.append(new MenuItem({
    label: '删除', click: function () {
        $("#del").click();
    }
}));
contextMenuList.append(new MenuItem({
    label: '清空', click: function () {
        $("#empty").click();
    }
}));
contextMenuList.append(new MenuItem({type: 'separator'}));
contextMenuList.append(new MenuItem({
    label: '优先', click: function () {
        $("#upBtn").click();
    }
}));
contextMenuList.append(new MenuItem({type: 'separator'}));
contextMenuList.append(new MenuItem({
    label: '编码', click: function () {
        $("#run").click();
    }
}));
$(document).ready(function () {
        const listArea = document.getElementById('fileList');//放到ready中，或放在html最后，否则值为null
        //console.log("Bind fileList popup menu:");
        //console.log(listArea);
        listArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuList.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);

//output泡泡
let contextMenuOutput = new Menu();
contextMenuOutput.append(new MenuItem({
    label: '浏览', click: function () {
        $("#outputBtn").click();
    }
}));
contextMenuOutput.append(new MenuItem({type: 'separator'}));
contextMenuOutput.append(new MenuItem({
    label: '桌面', click: function () {
        setDesk();
    }
}));
$(document).ready(function () {
        const outputArea = document.getElementById('outputAdd');
        //console.log("Bind popup menu:");
        //console.log(outputArea);
        outputArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuOutput.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);
function setDesk() {//提升
    const {app} = require('electron').remote;
    $("#outputAdd").val(app.getPath('desktop'));
}

//logo泡泡
let contextMenuLogo = new Menu();
contextMenuLogo.append(new MenuItem({
    label: '浏览', click: function () {
        $("#logoBtn").click();
    }
}));
$(document).ready(function () {
        const logoArea = document.getElementById('logoAdd');
        //console.log("Bind logo popup menu:");
        //console.log(logoArea);
        logoArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuLogo.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);

//pre泡泡
let contextMenuPre = new Menu();
contextMenuPre.append(new MenuItem({
    label: '浏览', click: function () {
        $("#preBtn").click();
    }
}));
$(document).ready(function () {
        const preArea = document.getElementById('preAdd');
        //console.log("Bind pre popup menu:");
        //console.log(preArea);
        preArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuPre.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);

//post泡泡
let contextMenuPost = new Menu();
contextMenuPost.append(new MenuItem({
    label: '浏览', click: function () {
        $("#postBtn").click();
    }
}));
$(document).ready(function () {
        const postArea = document.getElementById('postAdd');
        //console.log("Bind post popup menu:");
        //console.log(postArea);
        postArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuPost.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);