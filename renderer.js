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

    let adFullPre = "";
    let adFullPreIn = "";
    if ($("#checkPre").prop("checked") && $("#preAdd").val().trim().length > 0) {
        adFullPreIn = $("#preAdd").val().trim();
        let adShorPre = adFullPreIn.substring(adFullPreIn.lastIndexOf("\\") + 1, adFullPreIn.lastIndexOf("."));//文件名不带后缀
        const {app} = require('electron').remote;
        let temp = app.getPath('temp');
        const path = require('path');
        adFullPre = path.join(temp, adShorPre) + ".ts";
        //console.log("adFullPre:")
        //console.log(adFullPre);
    } else {
        let adFullPre = "";
        let adFullPreIn = "";
    }

    let adFullPost = "";
    let adFullPostIn = "";
    if ($("#checkPost").prop("checked") && $("#postAdd").val().trim().length > 0) {
        adFullPostIn = $("#postAdd").val().trim();
        let adShorPost = adFullPostIn.substring(adFullPostIn.lastIndexOf("\\") + 1, adFullPostIn.lastIndexOf("."));
        const {app} = require('electron').remote;
        let temp = app.getPath('temp');
        const path = require('path');
        adFullPost = path.join(temp, adShorPost) + ".ts";
        //console.log("adFullPost:")
        //console.log(adFullPost);
    } else {
        let adFullPost = "";
        let adFullPostIn = "";
    }

    let mainFullPre = "";
    let mainFullIn = "";
    if (adFullPre.length > 0 || adFullPost.length > 0) {
        mainFullIn = $("#fileList option:first").val();
        let mainShortIn = mainFullIn.substring(mainFullIn.lastIndexOf("\\") + 1, mainFullIn.lastIndexOf("."));
        let mainPathIn = mainFullIn.substr(0, mainFullIn.lastIndexOf("\\") + 1);//含最后一个\
        mainFullPre = mainPathIn + mainShortIn + "_pre.ts"
        //console.log("mainFullPre");
        //console.log(mainFullPre);
    } else {
        mainFullPre = "";
        mainFullIn = "";
    }

    let fFullIn = "";
    let fFullOut = "";
    let plain = true;
    const fs = require('fs');
    if (adFullPre.length > 0 && !fs.existsSync(adFullPre)) {//do pre
        fFullIn = adFullPreIn;
        fFullOut = adFullPre;
        plain = true;
        tmpFiles.push(adFullPre);
        console.log("Prepare for adpre.")
    } else if (adFullPost.length > 0 && !fs.existsSync(adFullPost)) {//do post
        fFullIn = adFullPostIn;
        fFullOut = adFullPost;
        plain = true;
        tmpFiles.push(adFullPost);
        console.log("Prepare for adpost.")
    } else if (mainFullPre.length > 0 && !fs.existsSync(mainFullPre)) {//do main pre
        fFullIn = mainFullIn;
        fFullOut = mainFullPre;
        plain = false;
        //需要清理mainFullPre---------------------------
        console.log("Prepare for main.")
    } else {//直接编码或连接
        let tmpIn = $("#fileList option:first").val();
        $("#fileList option:first").remove();
        let tmpShort = tmpIn.substring(tmpIn.lastIndexOf("\\") + 1, tmpIn.lastIndexOf("."));
        let tmpPathIn = tmpIn.substr(0, tmpIn.lastIndexOf("\\") + 1);//含最后一个\
        if (adFullPre.length == 0 && adFullPost.length == 0) {//直接编码
            fFullIn = tmpIn;
            const path = require('path');
            fFullOut = path.join($("#outputAdd").val().trim(), tmpShort) + "_out.ts";
            plain = false;
            console.log("Start encoding the main file.");
        } else {//连接
            if (adFullPre.length > 0) {
                fFullIn = "concat:" + adFullPre + "|";
            } else {
                fFullIn = "concat:";
            }
            fFullIn += mainFullPre;
            if (adFullPost.length > 0) {
                fFullIn += "|" + adFullPost;
            }
            fFullOut = tmpPathIn + tmpShort + "_out.ts";
            plain = true;
            console.log("Start connecting the adpre+main+adpost file.");
        }
    }
    //console.log("fFullIn:");
    //console.log(fFullIn);
    //console.log("fFullOut:");
    //console.log(fFullOut);
    fFullIn = "\"" + fFullIn + "\"";//测试支持空格？
    fFullOut = "\"" + fFullOut + "\"";

    if (plain) {
        args = data.argsPlain;
    } else {
        args = data.argsMain;
    }
    args[0] = fFullIn;
    args[args.length - 1] = fFullOut
    console.log("args:");
    console.log(args);
    //act(args);
}

function act(args) {
    $("#outInfo").empty();
    const spawn = require('child_process').spawn; //HTML5的Web Worker是在客户端开线程的另一方法，示例：http://blog.jobbole.com/30592/
    //args=['-i', fIn, '-vcodec', 'libx264', '-acodec', 'mp2', '-f', 'mpegts', fOut, '-y'];
    fProcess = spawn(f, args);
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
        console.log(`完成，子进程退出码：${code}`);
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
