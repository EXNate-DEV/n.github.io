// fastpages v1 (Pages.js -- clientside)

import {Popup} from "./UtilityLib.js";
import init, {file_decode} from "./Security/PolarSecurity.js";

let currentDynamicScripts = []

const pageKeeps = {}
const variableData = {}
const app = document.getElementById("app");

let beforeUnload = []
let currentPage = ""

window.PagesAPI = {
    changePage: changePage,
    loadScript: dynamic_loadScript,
    unloadScripts: function () {
        for (let scriptName in currentDynamicScripts) {
            if (typeof scriptName === HTMLScriptElement && "remove" in scriptName) {
                scriptName.remove()
            }
        }
        currentDynamicScripts = []
    },
    createActivity: createActivity,
    set: function (id, value) {
        variableData[id] = value;
    },
    get: function (id) {
        return variableData[id];
    },
    beforeUnload: function (callback) {
        if (typeof callback !== "function") {
            throw new Error("Attempted to register beforeUnload with non-function argument.");
        }
        beforeUnload.push(callback);
    },
    currentPage: function () {
        return currentPage;
    }
}

// Paging

function dynamic_loadScript(scriptSRC, type) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.onload = () => {
            resolve(script);
        };
        document.getElementById("app").appendChild(script);
        script.type = type;
        script.src = scriptSRC;
        currentDynamicScripts.push(script);
    })
}

async function changePage(url, options = null) {
    if (options) {
        if ("newTab" in options && options.newTab) {
            LiveAPI.SetMessageEnabled("disconnect", false);
            const w2 = window.open("/app.html?" + url, "_blank");
            let changed = false;
            w2.window.onload = function() {
                changed = false
                // seems like a very normal variable name
                const cp = w2.window.PagesAPI.changePage
                w2.window.PagesAPI.changePage = function (url, options) {
                    if (!changed) {
                        changed = true;
                        cp(url, options);
                        return;
                    }
                    w2.close();
                    changePage(url, options);
                }
                w2.document.getElementsByClassName("lcb")[0].addEventListener("click", function() {
                    document.getElementsByClassName("lcb")[0].click()
                });
            }
            w2.window.onclose = function() {
                LiveAPI.SetMessageEnabled("disconnect", true);
            }
            window.addEventListener("beforeunload", function() {
                if (w2) {
                    w2.close()
                }
            });
            window.addEventListener("focus", function() {
                if (w2) {
                    w2.close()
                }
            })
            return;
        }
    }
    beforeUnload.forEach((cb) => {
        cb();
    });
    beforeUnload = [];
    PagesAPI.unloadScripts();
    const page = await fetch(url);
    app.setHTMLUnsafe(new TextDecoder().decode(file_decode(new Uint8Array(await page.arrayBuffer()))));

    const pageButtons = document.getElementById("page-buttons");
    const appButtons = document.getElementById("app-buttons");
    if (pageButtons) {
        appButtons.innerHTML = pageButtons.innerHTML;
        pageButtons.remove();
    } else {
        appButtons.innerHTML = "";
    }
    for (let key in pageKeeps) {
        pageKeeps[key].hidden = key !== url;
    }
    const pageKeep = document.getElementById("page-keep");
    if (pageKeep) {
        if (!pageKeeps[url]) {
            const clone = pageKeep.cloneNode(true);
            clone.removeAttribute("id");
            if (clone.getAttribute("data-location") === "before") {
                document.body.insertBefore(clone, app);
            } else {
                document.body.appendChild(clone);
            }
            pageKeeps[url] = clone;
        }
        pageKeep.remove();
    }
    history.pushState(null, "", "/app.html?" + url);
    console.log(location.search.substring(1))
    currentPage = url
    const pageScripts = document.getElementsByClassName("page-script")
    for (let key1 in pageScripts) {
        const scr = pageScripts[key1];
        if (typeof scr === "number") {return}
        await dynamic_loadScript(scr.innerText, scr.getAttribute("data-type"));
    }
}

// Activities
function createActivity() {
    let activity = {
        buttons: []
    }
    activity.createButton = function (text, callback) {
        const button = document.createElement('button');
        button.className = "btn btn-outline-secondary"
        button.innerText = text;
        button.onclick = callback
        document.getElementById("live-activity").appendChild(button);
        return button;
    }
    activity.createLabel = function (text) {
        const label = document.createElement("p");
        label.innerHTML = text;
        label.style.padding = "6px"
        document.getElementById("live-activity").appendChild(label);
        return label;
    }
    activity.createError = function (text, temporary = false) {
        const error = activity.createLabel("<i class=\"bi bi-exclamation-octagon-fill\" style='color: #FF7777;'></i>&ensp;" + text);
        if (temporary) {
            error.style.transition = "opacity 0.5s ease-in-out";
            error.style.opacity = "0%";
            setTimeout(function () {
                error.style.opacity = "100%"
            }, 10)
            setTimeout(function () {
                error.style.opacity = "0%";
                setTimeout(function () {
                    error.remove()
                }, 500);
            }, 10010);
        }
    }
    activity.createFatalError = function (title, text) {
        const fatalerror = new Popup(title, text);
        fatalerror.Show(false);
    }
    return activity;
}

init("/js/Security/PolarSecurity_bg.wasm").then(function() {
    if (location.search) {
        PagesAPI.changePage(location.search.substring(1));
        return;
    }
    PagesAPI.changePage("/home.html");
})