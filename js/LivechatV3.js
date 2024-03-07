import { io } from "socket.io-client";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { Emitter } from "/js/Classes.js"

document.body.appendChild(document.createElement("live-chat"));

// # VARIABLES
const socket = new WebSocket("wss://mlxoa.com:4443/");
//const streamws = new WebSocket("wss://mlxoa.com:4443/livestream-ws");
const LivechatButton = document.getElementsByClassName("lcb")[0];
const LivechatPanel = document.getElementsByClassName("livechat-panel")[0];
const LivechatInput = document.getElementById("livechat-input");
const LivechatLog = document.getElementById("livechat-log");
const LivechatClear = document.getElementById("livechat-clear");
const LivechatStream = document.getElementById("livechat-stream");
const Toast = document.getElementById("bootstrapToast");
let hasSetName = localStorage["USR"] != null;
let hadLivechatOpen = localStorage["LivechatOpen"] == "true";
let USR = "unknown";
let panelVisible = false;
let canSend = true;
let sentPleaseWait = false;
let streaming = false;

// # PANEL

/**
 * Set if the panel is visible, optionally removing the animation.
 * @param {boolean} visible
 * @param {boolean} instant
 */
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

LivechatButton.addEventListener("click", function () {
    setVisible(!panelVisible, false);
})

setVisible(hadLivechatOpen, true);

// # CLASSES

/**
 * Class for sending/receiving messages.
 */
class Message {
    /**
     * The constructor for creating messages.
     * @param {string} Username The username of the sender.
     * @param {string} Id The Id of the sender.
     * @param {string} Content The content being sent/received.
     * @param {number} Type The type of message.
     */
    constructor(Username, Id, Content, Type) {
        this.Username = Username;
        this.Id = Id;
        this.Content = Content;
        this.Type = Type;
    }

    /**
     * Creates a JSON table from this instance.
     * @returns {object} The serialized message object.
     */
    Serialize() {
        return {
            Username: this.Username,
            Id: this.Id,
            Content: this.Content,
            Type: this.Type
        };
    }

    /**
     * Creates a new instance of this class from a JSON table.
     * @param {object} jSON The JSON table that was previously serialized.
     * @returns {Message} The deserialized message object.
     */
    static Deserialize(jSON) {
        return new Message(jSON.Username, jSON.Id, jSON.Content, jSON.Type);
    }
}

// # MAIN

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

window.generateUUID = generateUUID;

/**
 * Get a random user-id for use in livechat.
 * @returns {string} The user-id that was made/retreived
 */
function UID() {
    if (localStorage["UID"] == "undefined") {
        delete localStorage["UID"]
    }
    if (localStorage["UID"]) {
        return localStorage["UID"];
    } else {
        localStorage["UID"] = generateUUID();
        if (localStorage["UID"] == "undefined") {
            delete localStorage["UID"];
            return UID();
        } else {
            return localStorage["UID"];
        }
    }
}

window.genUID = UID;

/**
 * Adds a message to the livechat log.
 * @param {object} MSG The message being received.
 * @returns {void}
 */
function ReceiveMessage(MSG) {
    // AUTOSCROLL
    let autoScroll =
        Math.abs(
            LivechatLog.scrollHeight -
            LivechatLog.clientHeight -
            LivechatLog.scrollTop
        ) <= 10;

    // ADDING MESSAGE
    let message = Message.Deserialize(MSG);
    if (message.Content != null) {
        if (message.Type == 1) {
            LivechatLog.innerHTML += `<font color="#CCCCCC"><p class="livechat-text-container">${message.Username}</font> started a stream</p> [<a class="livechat-text-container" href="/broadcast.html?csid=${encodeURIComponent(csid)}">Watch</a>]<br /><br />`;
        } else {
            if (message.Id == "sys-reserved") {
                LivechatLog.innerHTML += `<font color="#FF7711"><p class="livechat-text-container">Livechat Server</p></font>: ${DOMPurify.sanitize(marked.parse(message.Content))}<br /><br />`;
            } else {
                LivechatLog.innerHTML += `<font color="#CCCCCC"><p class="livechat-text-container">${message.Username}</p></font>: ${DOMPurify.sanitize(marked.parse(message.Content))}<br /><br />`;
            }
        }
    }

    if (autoScroll) {
        LivechatLog.scrollTo({
            top: LivechatLog.scrollHeight,
            behavior: "instant",
        });
    }
}

/**
 * Adds all old messages that were collected by the server.
 * @param {object} Cache The array of messages that were received.
 * @returns {void}
 */
function ReceiveCachedMessages(Cache) {
    console.log(Cache.length)

    LivechatLog.innerHTML = "";
    Cache.forEach(msg => {
        ReceiveMessage(msg);
    });
}

function OnConnection() {
    if (hasSetName) {
        socket.send(JSON.stringify({
            Type: "userinfo",
            Data: UID()
        }));
    }
}

/**
 * Crash the browser (more effective on ChromeOS)
 */
function Crash() {
    onbeforeunload = function () { localStorage.x = 1 };

    setTimeout(function () {
        while (1) location.reload(1)
    }, 1)
}

/**
 * Parse the message from the socket
 * @param {MessageEvent} ev
 */
function parseMessage(ev) {
    let obj = JSON.parse(ev.data);
    switch (obj.Type) {
        case "message":
            ReceiveMessage(obj.Data);
            break;
        case "cache":
            console.log(obj);
            ReceiveCachedMessages(obj.Data);
            break;
        case "crash":
            Crash();
            break;
    }
}

socket.addEventListener("message", parseMessage);
socket.addEventListener("open", OnConnection)

// # SENDING

/**
 * Send a message.
 * @param {string} Content The message to be sent.
 */
function sendMessage(Content) {
    let message = new Message(USR, UID(), Content, 0);
    socket.send(JSON.stringify({
        Type: "message",
        Data: message.Serialize()
    }))
}

// # INPUT
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
                USR = LivechatInput.value;
                localStorage["USR"] = USR;
                // Clear value and set placeholder
                LivechatInput.value = "";
                LivechatInput.placeholder = "Send a message.";
                LivechatClear.className = "btn btn-danger disabled";
                // Connect to the socket
                socket.connect();
            }
        } else {
            if (canSend) {
                sendMessage(LivechatInput.value);
                LivechatInput.value = "";
                canSend = false;

                setTimeout(() => {
                    canSend = true;
                    sentPleaseWait = false;
                }, 1000);
            } else {
                if (!sentPleaseWait) {
                    LivechatLog.innerHTML += `<font color="#FF7711"><p class="livechat-text-container">Livechat Client</p></font>: Please wait 1s before sending another message.<br />`;
                    LivechatLog.scrollTo({
                        top: LivechatLog.scrollHeight,
                        behavior: "instant",
                    });
                    sentPleaseWait = true;
                }
            }
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

// # NAMING
hasSetName = localStorage["USR"] != null;
USR = localStorage["USR"];