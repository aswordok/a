// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
console.log("Start render process");
//模块内部变量用this.访问

//f.exe  -i "d:/user/desktop/myVideo.ts" -vcodec libx264 -acodec mp2 -f mpegts "d:/user/desktop/myVideo_out.ts -y"
//-y 输出覆盖
let fProcess;
function encoder(data) {
    if ($("#fileList option").length == 0 || $("#fileList option:first").val() == "dnd") {
        console.log("No item to encode.");
        degray();
        return;
    }



    if ($("#checkPre").prop("checked") && $("#preAdd").val().trim().length > 0) {
        let adShorPre=$("#preAdd").val().trim().replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi, "$1");
        const {app} = require('electron').remote;
        let temp = app.getPath('temp');
        const path = require('path');
        let adFullPre = path.join(temp, adShorPre)+".ts";
        console.log("adFullPre:")
        console.log(adFullPre);

    }

    if ($("#checkPost").prop("checked") && $("#postAdd").val().trim().length > 0) {

    }

    let fFullIn = $("#fileList option:first").val();
    console.log("fFullIn:")
    console.log(fFullIn);
    $("#fileList option:first").remove();

    let fShortOut = fFullIn.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi, "$1");  //正则表达式获取文件名，不带后缀
    const path = require('path');
    fFullOut = path.join($("#outputAdd").val().trim(), fShortOut)+"_out.ts";
    console.log("fFullOut:")
    console.log(fFullOut);
    /*
     var fIn = "d:/user/desktop/myVideo.mp4";
     var fOut = "d:/user/desktop/myVideo_out.ts";

     $("#outInfo").empty();
     const spawn = require('child_process').spawn; //HTML5的Web Worker是在客户端开线程的另一方法，示例：http://blog.jobbole.com/30592/
     fProcess = spawn(f, ['-i', fIn, '-vcodec', 'libx264', '-acodec', 'mp2', '-f', 'mpegts', fOut, '-y']);
     //手动杀掉spawn,参见：https://discuss.atom.io/t/quitting-electron-app-no-process-exit-event-or-window-unload-event-on-renderer/27363
     fProcess.stdout.on('data', (data) => {
     console.log(`stdout: ${data}`);
     if (data.substr(0, 6) == "frame=") {
     $("#outInfo").append(`${data}`);
     $("#outInfo").scrollTop($("#outInfo")[0].scrollHeight);
     }
     });

     fProcess.stderr.on('data', (data) => {
     console.log(`stderr: ${data}`);
     console.log(typeof(data));
     if (data.substr(0, 6) == "frame=") {
     $("#outInfo").append(`${data}`);
     $("#outInfo").scrollTop($("#outInfo")[0].scrollHeight);
     }
     });

     fProcess.on('close', (code) => {
     console.log(`子进程退出码：${code}`);
     });
     */
}
exports.encoding = encoder;
exports.killSpawn = () => {
    if (fProcess) {
        console.log('killing encoder ...');
        fProcess.kill('SIGTERM');//SIGTERM为结束信号
        fProcess = null;
    }
};
