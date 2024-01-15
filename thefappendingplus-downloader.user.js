// ==UserScript==
// @name         thefappendingplus-downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  thefappendingplus downloader
// @author       Alf <naihe2010@126.com>
// @match        https://thefappening.plus/*/
// @match        https://thefappening.plus/*/*/
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_notification
// @grant        window.close
// ==/UserScript==

(function() {
    'use strict';

    debugger;

    let urltokens = window.location.href.split('/');

    // main page
    let content = $(".gallery");
    if (urltokens.length === 5 && content.length > 0) {
        let alist = content.find("a");
        let tabs = [];
        for (let index = 0; index < alist.length - 1; ++ index) {
            let tab = GM_openInTab(alist[index].href);
            tabs.push(tab);
        }

        let quit = false;
        let nextbuts = $(".fusion-meta-info-wrapper :contains(Next)");
        if (nextbuts.length > 0) {
            GM_notification({
                text: "find next page, abort ?",
                title: "abort",
                timeout: 10 * 1000,
                onclick: () => {
                    console.log("next page abort by user");
                    quit = true;
                }
            });

            let checkInterval = setInterval(function() {
                let opened = false;
                for (let index = 0; index < tabs.length; ++ index) {
                    let tab = tabs[index];
                    if (tab.closed === false) {
                        opened = true;
                        break;
                    }
                }

                if (opened === false)
                {
                    clearInterval(checkInterval);
                    if (quit === false) {
                        nextbuts[0].click();
                    }
                }
            }, 1000);
        }

        return;
    }

    // single page
    let img = $(".post-content > p:nth-child(1) > a:nth-child(1)");
    if(img.length === 0){
        console.log("没有找到可下载媒体");
        return;
    }

    img = img[0];
    console.log("找到可下载媒体："+ img.href);

    let url = img.href;
    let words = url.split("/");
    let filename = words[2] + "_" + words[3] + "_" + words[6] + "_" + words[7] + "_" + words[8];

    GM_download({url: url,
                 name: filename,
                 onerror: (error) => {
                     let quit = false;
                     GM_notification({
                         text: "download error: " + error.error + ", quit ?",
                         title: "error",
                         timeout: 30 * 1000,
                         onclick: () => {
                             console.log("download abort by user");
                             quit = true;
                         }
                     });

                     setTimeout(function () {
                         if (quit === false) {
                             window.location.reload();
                         }
                     }, 30 * 1000);

                 },
                 onprogress: (pro) => {
                     console.log("download " + filename + ": " + pro.loaded + "/" + pro.totalSize);
                 },
                 onload: () => {
                     window.close();
                     /* let nextbtn = $(".fusion-meta-info-wrapper").find("a");
                     if (nextbtn.length > 0 && nextbtn[0].innerHTML == "Prev") {
                         let btn = $(nextbtn[0]);
                         btn.click();
                     }
                     if (nextbtn.length > 1 && nextbtn[1].innerHTML == "Prev") {
                         let btn = $(nextbtn[1]);
                         btn.click();
                     } */
                 }});
})();