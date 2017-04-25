const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
let mainWindow;

function createWindow () {
  const options = {
      width:800,
      height:555,
      resizable:true,
      icon:'logo.ico',
      show:false,
      hasShadow:true,
      minWidth:800,
      minHeight:555,
      backgroundColor:'#eeeeee'//窗口背景色
      //参考https://github.com/electron/electron/blob/master/docs-translations/zh-CN/api/browser-window.md
  };
  console.log(options);
  mainWindow = new BrowserWindow(options);


  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.once('ready-to-show',()=>{
    mainWindow.show()
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});
