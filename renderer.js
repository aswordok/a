// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
console.log("Start render process");
//模块内部变量用this.访问

//f.exe  -i "d:/user/desktop/myVideo.ts" -vcodec libx264 -acodec mp2 -f mpegts "d:/user/desktop/myVideo_out.ts -y"
//-y 输出覆盖
let fProcess;
let myData;
let delFile={
    file:[],
    del:false
};
function encoder(data) {
    myData=data;
    delFile.del=false;
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
        let tmpPathOutput = $("#outputAdd").val().trim();
        if ($("#checkOutput").prop("checked")) {
            mainFullPre = mainPathIn + mainShortIn + "_pre.ts"
        } else {
            const path = require('path');
            mainFullPre = path.join(tmpPathOutput, mainShortIn) + "_pre.ts";
        }
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
        delFile.file.push(adFullPre);
        console.log("Prepare for adpre.")
    } else if (adFullPost.length > 0 && !fs.existsSync(adFullPost)) {//do post
        fFullIn = adFullPostIn;
        fFullOut = adFullPost;
        plain = true;
        delFile.file.push(adFullPost);
        console.log("Prepare for adpost.")
    } else if (mainFullPre.length > 0 && !fs.existsSync(mainFullPre)) {//do main pre
        fFullIn = mainFullIn;
        fFullOut = mainFullPre;
        plain = false;
        //需要清理mainFullPre---------------------------
        delFile.file.push(mainFullPre);
        console.log("Prepare for main.")
    } else {//直接编码或连接
        let tmpIn = $("#fileList option:first").val();
        $("#fileList option:first").remove();
        let tmpShort = tmpIn.substring(tmpIn.lastIndexOf("\\") + 1, tmpIn.lastIndexOf("."));
        let tmpPathIn = tmpIn.substr(0, tmpIn.lastIndexOf("\\") + 1);//含最后一个\
        if (adFullPre.length == 0 && adFullPost.length == 0) {//直接编码
            fFullIn = tmpIn;
            const path = require('path');
            if ($("#checkOutput").prop("checked")) {
                fFullOut = tmpPathIn + tmpShort + "_out.ts";
            } else {
                fFullOut = path.join($("#outputAdd").val().trim(), tmpShort) + "_out.ts";//是否以\结尾均可
            }
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
            if ($("#checkOutput").prop("checked")) {
                fFullOut = tmpPathIn + tmpShort + "_out.ts";
            } else {
                fFullOut = path.join($("#outputAdd").val().trim(), tmpShort) + "_out.ts";//是否以\结尾均可
            }
            fFullOut = tmpPathIn + tmpShort + "_out.ts";
            plain = true;
            delFile.del=true;
            console.log("Start connecting the adpre+main+adpost file.");
        }
    }
    fFullIn = fFullIn.replace(/\\/g, "/");//所有反斜杠替换成正斜杠
    fFullOut = fFullOut.replace(/\\/g, "/");
    //console.log("fFullIn:");
    //console.log(fFullIn);
    //console.log("fFullOut:");
    //console.log(fFullOut);

    if (plain) {
        args = data.argsPlain;
    } else {
        args = data.argsMain;
    }
    args[1] = fFullIn;//支持文件名及路径空格
    args[args.length - 1] = fFullOut;//支持文件名及路径空格
    console.log("args:");
    console.log(args);
    act(args);
}

function act(args) {
    //var fIn = "d:/user/desktop/myVideo.mp4";
    //var fOut = "d:/user/desktop/myVideo_out.ts";
    //var args=['-i', fIn, '-vcodec', 'libx264', '-acodec', 'mp2', '-f', 'mpegts', fOut, '-y'];

    $("#outInfo").empty();
    const spawn = require('child_process').spawn; //HTML5的Web Worker是在客户端开线程的另一方法，示例：http://blog.jobbole.com/30592/
    const {app} = require('electron').remote;
    let temp = app.getPath('temp');
    fProcess = spawn(f, args,{cwd:temp});
    //手动杀掉spawn,参见：https://discuss.atom.io/t/quitting-electron-app-no-process-exit-event-or-window-unload-event-on-renderer/27363
    fProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        console.log(typeof(data));
        if (data.toString().substr(0, 6) == "frame=") {
            $("#outInfo").append(`${data}`);
            $("#outInfo").scrollTop($("#outInfo")[0].scrollHeight);
        }
    });

    fProcess.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        console.log(typeof(data));
        if (data.toString().substr(0, 6) == "frame=") {
            $("#outInfo").append(`${data}`);
            $("#outInfo").scrollTop($("#outInfo")[0].scrollHeight);
        }
    });

    fProcess.on('close', (code) => {
        console.log(`子进程退出码：${code}`);

        if (delFile.del){
            const fs = require('fs');
            while (delFile.file.length > 0) {
                let tmp = delFile.file.pop();
                if (fs.existsSync(tmp)) {
                    fs.unlink(tmp, (err) => {
                        if (err) {
                            console.log("An error ocurred while delete the file " + tmp);
                            console.log(err);
                            return;
                        }
                        console.log(tmp + " has be deleted successfully.");
                    });
                } else {
                    console.log("This file doesn't exist, cannot delete");
                }
            }
        }

        encoder(myData);
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
