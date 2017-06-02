// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
console.log("Start render process");
//模块内部变量用this.访问

//f.exe  -i "d:/user/desktop/myVideo.ts" -vcodec libx264 -acodec mp2 -f mpegts "d:/user/desktop/myVideo_out.ts -y"
//-y 输出覆盖
let fProcess;
let lastLogoAdd = "";
function encoder() {
    if ($("#checkLogo").prop("checked") && $("#logoAdd").val().trim().length > 0) {
        const {app} = require('electron').remote;
        let temp = app.getPath('temp');

        const fs = require('fs');
        const path = require('path');
        let logoAdd = $("#logoAdd").val().trim();
        logoTempAdd = path.join(temp, 'logo.png');
        fs.exists(logoTempAdd, function (exists) {
            if (exists) {
                if (lastLogoAdd.length > 0 && lastLogoAdd === logoAdd) {
                } else {
                    fs.unlink(logoTempAdd, (err) => {
                        if (err) {
                            console.log("An error ocurred while delete the file " + logoTempAdd);
                            console.log(err);
                            return;
                        }
                        console.log(tmp + " has be deleted success.");
                    });
                    lastLogoAdd === logoAdd;
                    cp();
                }
            } else {
                tmpFiles.push(logoTempAdd);
                lastLogoAdd === logoAdd;
                cp(logoAdd,logoTempAdd);
            }
        });
    }
    function cp(logoAdd,logoTempAdd) {

    }

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
}
exports.encoding = encoder;
exports.killSpawn = () => {
    if (fProcess) {
        console.log('killing encoder ...');
        fProcess.kill('SIGTERM');//SIGTERM为结束信号
        fProcess = null;
    }
};
