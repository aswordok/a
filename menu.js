/**
 * Created by user on 2017/4/16.
 */
let template = [{
    label: '文件',
    submenu: [{
        label: '打开',
        accelerator: 'CmdOrCtrl+O',
        click: function() { pop(); }
    }, {
        label: '设置',
        accelerator: 'Alt+s',
        click: function() {  }
    },{
        type: 'separator'
    },{
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        click: function() { app.quit(); }
    }]
}, {
    label: '运行',
    submenu: [{
        label: '编码',
        accelerator: 'CmdOrCtrl+R',
        click: function() {  }
    }, {
        label: '中止',
        accelerator: 'CmdOrCtrl+C',
        click: function() {  }
    }]
}, {
    label: '帮助',
    submenu: [{
        label: '帮助',
        accelerator: 'CmdOrCtrl+H',
        click: function() {  }
    }, {
        type: 'separator'
    }, {
        label: '获取机器码',
        accelerator: 'CmdOrCtrl+',
        click: function() {  }
    }, {
        label: '注册状态',
        click: function() {  }
    }]
}]
const {remote} = require('electron');//{变量名}是ES6中新语法，叫解构
const {Menu, MenuItem} = remote;
var mainMenu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(mainMenu);

var  contextMenu  = new Menu();
contextMenu.append(new MenuItem({ label: '添加', click: function() {$("input").val("abcde"); } }));
contextMenu.append(new MenuItem({ type: 'separator' }));
contextMenu.append(new MenuItem({ label: '转码', click: function() { pop(); } }));
window.addEventListener('contextmenu', function (e) {
    e.preventDefault();//阻止默认动作
    contextMenu.popup(remote.getCurrentWindow(e.sender));
}, false);

var  contextMenuList  = new Menu();
contextMenuList.append(new MenuItem({ label: '添加', click: function() {$("input").val("abcde"); } }));
contextMenuList.append(new MenuItem({ label: '删除', click: function() { pop(); } }));
contextMenuList.append(new MenuItem({ label: '清空', click: function() { pop(); } }));
contextMenuList.append(new MenuItem({ type: 'separator' }));
contextMenuList.append(new MenuItem({ label: '优先', click: function() { pop(); } }));
$(document).ready(function () {
        const listArea = document.getElementById('list');//放到ready中，或放在html最后，否则值为null
        console.log(listArea);
        listArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuList.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);

var  contextMenuOutput  = new Menu();
contextMenuOutput.append(new MenuItem({ label: '浏览', click: function() {$("input").val("abcde"); } }));
contextMenuOutput.append(new MenuItem({ type: 'separator' }));
contextMenuOutput.append(new MenuItem({ label: '桌面', click: function() { pop(); } }));
$(document).ready(function () {
        const outputArea = document.getElementById('outputAdd');
        console.log(outputArea);
        outputArea.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            contextMenuOutput.popup(remote.getCurrentWindow(e.sender));
            if (!e) window.event.cancelBubble = true;//微软模型阻止冒泡
            if (e.stopPropagation) e.stopPropagation();//w3c模型阻止冒泡
        }, false);
    }
);
