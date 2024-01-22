// ==UserScript==
// @name         fapello-downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  fapello downloader
// @author       Alf <naihe2010@126.com>
// @match        https://fapello.su/*/
// @match        https://fapello.su/*/*/
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

    // debugger;

    // main page
    let content = $("#content");
    if (content.length > 0) {
        debugger;
        let urltokens = window.location.href.split("/", 4);
        let urlstart = urltokens.join("/");
        let start_url = "fapello_start_" + urlstart;
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
            let nextbtns = $(".bg-white");
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

    // single page
    let img = $(".uk-align-center > img:nth-child(1)");
    if(img.length === 0){
        console.log("没有找到可下载媒体");
        return;
    }

    let image = img[0];
    console.log("找到可下载媒体："+ image.src);

    let name = $(".block");

    let url = image.src;
    let words = url.split("/");
    let filename = words[2] + "_" + words.pop();
    if (name.length !== 0) {
        filename = name[0].innerHTML.replace(" ", ".") + "_" + filename;
    }

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
                     /*
                     let nextbtn = $("div.flex:nth-child(5)").find("a");
                     if (nextbtn.length > 0 && nextbtn[0].innerHTML == "Previous") {
                         nextbtn[0].click();
                     }
                     if (nextbtn.length > 1 && nextbtn[1].innerHTML == "Previous") {
                         nextbtn[1].click();
                     }*/
                 }});
})();