// ==UserScript==
// @name         masterfap-downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  masterfap.net profile downloader
// @author       Alf <naihe2010@126.com>
// @match        https://www.masterfap.net/profile/*/photos/*/
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // debugger;

    let imageList = $("#showimg2");
    if(imageList.length === 0){
        console.log("没有找到可下载媒体");
        return;
    }
    console.log("找到可下载媒体："+ imageList[0].src);

    let img = $(imageList[0]);

    let url = img.attr("src");
    let words = url.split("/");
    let ext = words.pop().split("?")[0].split(".").pop();
    let filename = words[4] + "_" + words[5] + "_" + words[6] + "." + ext;

    window.URL.revokeObjectURL(url);
    let a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();

    let nextbtn = $(":contains(Next)");
    if (nextbtn.length === 0) {
        console.log("没有下一个媒体");
        return;
    }
    let btn = $(nextbtn[8]);
    url = btn.attr("href");
    a = document.createElement('a');
    a.href = url;
    a.click();
})();