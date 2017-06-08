// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
console.log("Start render process");
//模块内部变量用this.访问

//f.exe  -i "d:/user/desktop/myVideo.ts" -vcodec libx264 -acodec mp2 -f mpegts "d:/user/desktop/myVideo_out.ts -y"
//-y 输出覆盖
let fProcess;
let myData;
let delObjFile={
    delMainFile:false,
    mainFile:"",
    adFiles:[]
};
let iDur={
    process:0,//0.no ad、1adPre、2.main、3.adPost、4.connect
    adPre:0,//second
    adPost:0,
    main:0
};
function encoder(data) {
    myData=data;
    delObjFile.delMainFile=false;
    if ($("#fileList option").length == 0 || $("#fileList option:first").val() == "dnd") {
        console.log("No item to encode.");
        iDur.process=0;
        iDur.adPre=0;
        iDur.adPost=0;
        iDur.main=0;

        delArrFiles(delObjFile.adFiles);

        ungray();
        return;
    }

    //后缀ts or mpeg
    let ext;
    switch ($("select#codeList").val()) {
        case "SDts":
            ext=".mpg";
            break;
        case "SDps":
            ext=".mpg";
            break;
        default:
            ext=".ts";
    }

    let adFullPre = "";
    let adFullPreIn = "";
    if ($("#checkPre").prop("checked") && $("#preAdd").val().trim().length > 0) {
        adFullPreIn = $("#preAdd").val().trim();
        let adShorPre = adFullPreIn.substring(adFullPreIn.lastIndexOf("\\") + 1, adFullPreIn.lastIndexOf("."));//文件名不带后缀
        const {app} = require('electron').remote;
        let temp = app.getPath('temp');
        const path = require('path');
        adFullPre = path.join(temp, adShorPre) + ext;
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
        adFullPost = path.join(temp, adShorPost) + ext;
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
            mainFullPre = mainPathIn + mainShortIn + "_pre" + ext;
        } else {
            const path = require('path');
            mainFullPre = path.join(tmpPathOutput, mainShortIn) + "_pre" + ext;
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
        delObjFile.adFiles.push(adFullPre);
        iDur.process=1;
        console.log("Prepare for adpre.")
    } else if (adFullPost.length > 0 && !fs.existsSync(adFullPost)) {//do post
        fFullIn = adFullPostIn;
        fFullOut = adFullPost;
        plain = true;
        delObjFile.adFiles.push(adFullPost);
        iDur.process=3;
        console.log("Prepare for adpost.")
    } else if (mainFullPre.length > 0 && !fs.existsSync(mainFullPre)) {//do main pre
        fFullIn = mainFullIn;
        fFullOut = mainFullPre;
        plain = false;
        //需要清理mainFullPre---------------------------
        delObjFile.mainFile=mainFullPre;
        iDur.process=2;
        console.log("Prepare for main.")
    } else {//do 直接编码或连接
        let tmpIn = $("#fileList option:first").val();
        $("#fileList option:first").remove();
        let tmpShort = tmpIn.substring(tmpIn.lastIndexOf("\\") + 1, tmpIn.lastIndexOf("."));
        let tmpPathIn = tmpIn.substr(0, tmpIn.lastIndexOf("\\") + 1);//含最后一个\
        if (adFullPre.length == 0 && adFullPost.length == 0) {//直接编码
            fFullIn = tmpIn;
            const path = require('path');
            if ($("#checkOutput").prop("checked")) {
                fFullOut = tmpPathIn + tmpShort + "_out" + ext;
            } else {
                fFullOut = path.join($("#outputAdd").val().trim(), tmpShort) + "_out" + ext;//是否以\结尾均可
            }
            plain = false;
            iDur.process=0;
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
                fFullOut = tmpPathIn + tmpShort + "_out" + ext;
            } else {
                fFullOut = path.join($("#outputAdd").val().trim(), tmpShort) + "_out" + ext;//是否以\结尾均可
            }
            plain = true;
            delObjFile.delMainFile=true;
            iDur.process=4;
            console.log("Start connecting the adpre+main+adpost file.");
        }
    }

    //处理进度条
    $("#progressRight").html("Uncomplete");
    $("#progressWalk").prop("width","0.1%");
    $("#progressMiddle").html("0%");
    let nowDoWithArr=fFullIn.split("|");
    if (nowDoWithArr.length==1){
        let nowDoWith=fFullIn.substr(fFullIn.lastIndexOf("\\")+1);//取文件名
        $("#progressLeft").html("Encoding:"+nowDoWith);
    }else{
        while (nowDoWithArr.length>0){
            let nowDoWith=nowDoWithArr.pop();
            const {app} = require('electron').remote;
            let temp = app.getPath('temp');
            if (nowDoWith.indexOf(temp)==-1){
                nowDoWith=nowDoWith.substr(nowDoWith.lastIndexOf("\\")+1);//取文件名
                $("#progressLeft").html("Encoding:"+nowDoWith);
                break;
            }
        }
    }

    fFullIn = fFullIn.replace(/\\/g, "/");//所有反斜杠替换成正斜杠
    fFullOut = fFullOut.replace(/\\/g, "/");
    let args;
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
    $("#outInfo").append("免责声明：\n");
    $("#outInfo").append("    本程序仅供测试研究用，并且作者不承担使用软件造成任何直接或者间接损失。\n");
    $("#outInfo").append("    包括但不限于H.265、H.264、mpeg2、AC3、mp2等音视频编码器、mpeg-TS封装格式的使用皆需授权费，请自行负责。\n");
    $("#outInfo").append("Author:一剑\n");
    $("#outInfo").append("E-mail:234107@qq.com\n");
    $("#outInfo").append("官方网站：http://www.lightcloud.net.cn\n");

    const spawn = require('child_process').spawn; //HTML5的Web Worker是在客户端开线程的另一方法，示例：http://blog.jobbole.com/30592/
    const {app} = require('electron').remote;
    let temp = app.getPath('temp');
    let iCur=0;
    fProcess = spawn(f, args,{cwd:temp});
    fProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        console.log(typeof(data));
        $("#outInfo").append(`${data}`);
        $("#outInfo").scrollTop($("#outInfo")[0].scrollHeight);
    });

    fProcess.stderr.on('data', (data) => {
        //所有输出信息,都为错误输出流,用StandardOutput是捕获不到任何消息的
        console.log(`stderr: ${data}`);
        console.log(typeof(data));
        let s=data.toString();
        if (s.indexOf("Duration:")>0){
            let t=s.substr(s.indexOf("Duration:")+10,11);
            let a=t.split(":");
            iCur=parseInt(a[0])*3600+parseInt(a[1])*60+parseInt(a[2]);
            if (iDur.process==4){
                iCur=iDur.adPre+iDur.main+iDur.adPost;
            }else if(iDur.process==1){
                iDur.adPre=iCur;
            }else if(iDur.process==2){
                iDur.main=iCur;
            }else if(iDur.process==3){
                iDur.adPost=iCur;
            }
            console.log("Total time:"+t+"="+iCur+"s.");
        }
        if (s.substr(0, 6) == "frame=") {
            $("#outInfo").append(`${data}`);
            $("#outInfo").scrollTop($("#outInfo")[0].scrollHeight);

            let t=s.substr(s.indexOf("time=")+5,11);
            if (t.substr(0,1)!="-"){//有时时间为负的异常
                let a=t.split(":");
                let j=parseInt(a[0])*3600+parseInt(a[1])*60+parseInt(a[2]);
                let p=Math.round(j/iCur*100);
                console.log("Current time:"+t+"="+j+"s,percent:"+p+"%");
                $("#progressMiddle").html(p+"%");
                $("#progressWalk").width(p+"%");
            }
        }
    });

    fProcess.on('close', (code) => {
        console.log(`子进程退出码：${code}`);

        $("#progressMiddle").html("100%");
        $("#progressRight").html("Complete");
        $("#progressWalk").prop("width","100%");

        if (delObjFile.delMainFile){
            const fs = require('fs');
            let tmp=delObjFile.mainFile;
            delObjFile.mainFile="";
            fs.exists(tmp, function (exists) {
                if (exists) {
                    fs.unlink(tmp, (err) => {
                        if (err) {
                            console.log("An error ocurred while delete the file " + tmp);
                            console.log(err);
                        }else {
                            console.log(tmp + " has be deleted successfully.");
                        }
                    });
                }
            });
        }

        encoder(myData);
    });
}

exports.encoding = encoder;

//手动杀掉spawn,参见：https://discuss.atom.io/t/quitting-electron-app-no-process-exit-event-or-window-unload-event-on-renderer/27363
exports.killSpawn = () => {
    if (fProcess) {
        console.log('killing encoder ...');
        fProcess.kill('SIGTERM');//SIGTERM为结束信号
        fProcess = null;
    }
};
