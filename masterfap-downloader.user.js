// ==UserScript==
// @name         masterfap-downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  masterfap.net profile downloader
// @author       Alf <naihe2010@126.com>
// @match        https://www.masterfap.net/profile/*/
// @match        https://www.masterfap.net/profile/*/photos/*/
// @require      http://libs.baidu.com/jquery/2.0.0/jquery.min.js
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        window.close
// ==/UserScript==

(function() {
    'use strict';

    debugger;

    // main page
    let content = $("#content");
    if (content.length > 0) {
        let urltokens = window.location.href.split("/", 5);
        let start_url = "masterfap_start_" + urltokens[4];
        if (GM_getValue(start_url, false) == true) {
            start_download();
        }

        $(content).before("<input type=button value='Download All' id='download_all' />");
        $("#download_all").click(start_download);

        function start_download() {
            GM_setValue(start_url, true);
            let alist = content.find("a");
            let tabs = [];
            for (let index = 0; index < alist.length; ++ index) {
                let tab = GM_openInTab(alist[index].href);
                tabs.push(tab);
            }

            let quit = false;
            let nextbtns = $("a.bg-white:nth-child(2)");
            if (nextbtns.length > 0) {
                GM_notification({
                    text: "find next page, abort ?",
                    title: "abort",
                    timeout: 10 * 1000,
                    onclick: () => {
                        console.log("next page abort by user");
                        GM_setValue(start_url, null);
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
                            let nexta = $("#next_page").find("a");
                            nexta[0].click();
                        }
                    }
                }, 1000);
            }
        }

        return;
    }


    // Single page
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

    GM_download({url: url,
                 name: filename,
                 onerror: (error) => {
                     debugger;
                     if (error.error === "not_whitelisted") {
                         let a = document.createElement('a');
                         a.download = filename;
                         a.href = url;
                         a.click();
                         return;
                     }

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
                 }});
})();