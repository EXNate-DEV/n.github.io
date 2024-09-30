import {io} from "socket.io-client";
import {marked} from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import {Emitter} from "/js/Classes.js"

document.body.appendChild(document.createElement("live-chat"));

// # VARIABLES
window.socket = new WebSocket("wss://assets.mlxoa.com:4443")
//const streamws = new WebSocket("wss://mlxoa.com:4443/livestream-ws");
const LivechatButton = document.getElementsByClassName("lcb")[0];
const LivechatPanel = document.getElementsByClassName("livechat-panel")[0];
const LivechatInput = document.getElementById("livechat-input");
const LivechatLog = document.getElementById("livechat-log");
const LivechatUO = document.getElementById("livechat-usersonline");
const LivechatClear = document.getElementById("livechat-clear");
const LivechatStream = document.getElementById("livechat-stream");
const Toast = document.getElementById("bootstrapToast");
let AudioListings;
let hasSetName = localStorage["USR"] != null;
let hadLivechatOpen = localStorage["LivechatOpen"] == "true";
let USR = "unknown";
let panelVisible = false;
let canSend = true;
let sentPleaseWait = false;
let streaming = false;
let admin = false;
let currentAudios = []

window.oe = []
window.oa = []

window.LiveAPI = {
    registerSocketOpenEvent: function(callback) {
        oe.push(callback)
    },
    registerPeerEvent: function(event, callback) {
        oa.push([event, callback])
    },
    openStream: function(csid) {
        socket.send(JSON.stringify({
            Type: "wrtc",
            Target: csid,
            Data: {
                evType: "open",
                Sender: UID(),
                streamer: true
            }
        }))
        setTimeout(function () {
            ReceiveWebRTCC({
                evType: "open",
                Sender: csid,
                streamer: false
            })
        }, 40)
    }
}

// # GENERIC FUNCTIONS
function getScriptPath(foo) {
    return window.URL.createObjectURL(new Blob([foo.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]], {type: 'text/javascript'}));
}

// # WORKER
const LiveWorker = new Worker(getScriptPath(function () {
    self.addEventListener("message", function (ev) {
        if (ev !== undefined && ev.data !== undefined) {
            this.self.postMessage(JSON.parse(ev.data));
        }
    })
}));

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
    constructor(Username, Id, messageId, Content, Type) {
        this.Username = Username;
        this.Id = Id;
        this.messageId = messageId;
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
            messageId: this.messageId,
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
        return new Message(jSON.Username, jSON.Id, jSON.messageId, jSON.Content, jSON.Type);
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
 * Play a sound by the content.
 * @param {string} content
 */
function PlaySoundByContent(content) {
    if (AudioListings instanceof Object) {
        AudioListings["Listing"].forEach((obj) => {
            if (content.includes(obj.File)) {
                const mid = currentAudios.length;
                const audio = new Audio(`/assets/audio/${obj.File}`);
                audio.addEventListener("ended", function () {
                    currentAudios[mid] = null;
                })
                audio.play();
                currentAudios[mid] = audio;
            } else {
                obj.Triggers.forEach(trigger => {
                    if (content.includes(trigger)) {
                        if (obj.File == null) {
                            for (let i = 0; i < currentAudios.length; i++) {
                                const obj = currentAudios[i];
                                obj.pause();
                                currentAudios[i] = null;
                            }
                        } else {
                            const mid = currentAudios.length;
                            const audio = new Audio(`/assets/audio/${obj.File}`);
                            audio.addEventListener("ended", function () {
                                currentAudios[mid] = null;
                            })
                            audio.play();
                            currentAudios[mid] = audio;
                        }
                    }
                });
            }
        })
    }
}

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
            LivechatLog.innerHTML += `<font color="#CCCCCC"><p class="livechat-text-container">${message.Username}</font> started a stream</p> [<a class="livechat-text-container" href="/broadcast/?csid=${encodeURIComponent(message.Id)}">Watch</a>]<br /><br />`;
        } else {
            if (message.Id == "sys-reserved") {
                LivechatLog.innerHTML += `<font color="#FF7711"><p class="livechat-text-container">Livechat Server</p></font>: ${DOMPurify.sanitize(marked.parse(message.Content))}<br /><br />`;
            } else {
                PlaySoundByContent(message.Content)
                LivechatLog.innerHTML += `<font color="#CCCCCC"><p class="livechat-text-container" csid="${message.Id}" mid="${message.messageId}">${message.Username}</p></font>: ${DOMPurify.sanitize(marked.parse(message.Content))}<br /><br />`;
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

let queue = "";

/**
 * Adds a message to the queued livechat log.
 * @param {object} MSG The message being received.
 * @returns {void}
 */
function QueueMessage(MSG) {
    let message = Message.Deserialize(MSG);
    if (message.Content != null) {
        if (message.Type == 1) {
            queue += `<font color="#CCCCCC"><p class="livechat-text-container" csid="${message.Id}">${message.Username}</font> started a stream</p> [<a class="livechat-text-container" href="/broadcast/?csid=${encodeURIComponent(message.Id)}">Watch</a>]<br /><br />`;
        } else {
            if (message.Id == "sys-reserved") {
                queue += `<font color="#FF7711"><p class="livechat-text-container" csid="${message.Id}" mid="${message.messageId}">Livechat Server</p></font>: ${DOMPurify.sanitize(marked.parse(message.Content))}<br /><br />`;
            } else {
                queue += `<font color="#CCCCCC"><p class="livechat-text-container" csid="${message.Id}" mid="${message.messageId}">${message.Username}</p></font>: ${DOMPurify.sanitize(marked.parse(message.Content))}<br /><br />`;
            }
        }
    }
}

/**
 * Adds all old messages that were collected by the server.
 * @param {object} Cache The array of messages that were received.
 * @returns {void}
 */
function ReceiveCachedMessages(Cache) {
    LivechatLog.innerHTML = "";
    Cache.forEach(msg => {
        QueueMessage(msg);
    });
    requestAnimationFrame(function () {
        LivechatLog.innerHTML += queue;
        LivechatLog.scrollTo({
            top: LivechatLog.scrollHeight,
            behavior: "instant",
        });
        queue = "";
    })
}

function OnConnection() {
    if (hasSetName) {
        socket.send(JSON.stringify({
            Type: "userinfo",
            Data: UID(),
            Version: 4
        }));
    }
    oe.forEach((e) => {
        try {
            e()
        } catch (ex) {
            console.warn(ex)
        }
    })
}

let lastCode = 1000
let lastReason = ""

function OnDisconnect(ev) {
    lastCode = ev.code
}

/**
 * Crash the browser (more effective on ChromeOS)
 */
function Crash() {
    onbeforeunload = function () {
        localStorage.x = 1
    };

    setTimeout(function () {
        while (1) location.reload(1)
    }, 1)
}

function ReceiveAdminPacket(data) {
    if (data[2] == UID()) {
        switch (data[0]) {
            case "Crash":
                Crash();
                break;
            case "Disconnect":
                socket.close();
                break;
        }
    }
}

window.peerConnections = [];

async function ReceiveWebRTCD(data) {
    const sender = data.Sender;
    switch (data.evType) {
        case "open": {
            if (peerConnections[sender]) {
                return
            }
            peerConnections[sender] = new RTCPeerConnection({
                iceServers: [
                    { urls: "turn:assets.mlxoa.com:3478", username: "public", credential: "exdnpolarusage" }
                ],
                iceTransportPolicy: "all"
            });
            oa.forEach((d) => {
                peerConnections[sender].addEventListener(d[0], function (ev) {
                    d[1](data.streamer, peerConnections[sender], ev)
                })
            })
            if (data.streamer) {
                if (window.mediaStream) {
                    mediaStream.getTracks().forEach((track) => {
                        peerConnections[sender].addTrack(track, mediaStream)
                    })
                }
            }
            peerConnections[sender].onicecandidate = function(ev) {
                socket.send(JSON.stringify({
                    Type: "xrtc",
                    Target: sender,
                    Data: {
                        Sender: UID(),
                        evType: "candidate",
                        candidate: ev.candidate
                    }
                }))
            }
            peerConnections[sender].onconnectionstatechange = function () {
                if (peerConnections[sender] === undefined || peerConnections[sender].connectionState === "closed" || peerConnections[sender].connectionState === "disconnected") {
                    console.log("lost connection")
                    delete peerConnections[sender]
                }
            }
            peerConnections[sender].oniceconnectionstatechange = function () {
                if (peerConnections[sender].iceConnectionState === "failed") {
                    peerConnections[sender].restartIce();
                }
            }
            peerConnections[sender].onnegotiationneeded = function(ev) {
                peerConnections[sender].createOffer().then((offer) => peerConnections[sender].setLocalDescription(offer)).then(() => {
                    socket.send(JSON.stringify({
                        Type: "xrtc",
                        Target: sender,
                        Data: {
                            Sender: UID(),
                            evType: "offer",
                            offer: peerConnections[sender].localDescription
                        }
                    }))
                })
            }
            break;
        }
        case "offer": {
            if (!peerConnections[sender]) {
                console.warn(`Connection with UUID ${sender} hasn't been started.`);
                return;
            }
            await peerConnections[sender].setRemoteDescription(new RTCSessionDescription(data.offer));
            await peerConnections[sender].setLocalDescription(await peerConnections[sender].createAnswer());
            socket.send(JSON.stringify({
                Type: "xrtc",
                Target: sender,
                Data: {
                    Sender: UID(),
                    evType: "answer",
                    answer: peerConnections[sender].localDescription
                }
            }))
            console.log("got offer.")
            break;
        }
        case "answer": {
            await peerConnections[sender].setRemoteDescription(new RTCSessionDescription(data.answer))
            console.log("got answer.")
            break;
        }
        case "candidate": {
            if (!peerConnections[sender]) {
                console.warn(`Connection with UUID ${sender} hasn't been started.`);
                return;
            }
            console.log("got ice candidate.")
            await peerConnections[sender].addIceCandidate(data.candidate)
            break;
        }
        case "close": {
            peerConnections[sender].close();
            delete peerConnections[sender]
            break;
        }
    }
}

async function ReceiveWebRTCC(data) {
    const sender = data.Sender;
    switch (data.evType) {
        case "open": {
            if (peerConnections[sender]) {
                return
            }
            peerConnections[sender] = new RTCPeerConnection({
                iceServers: [
                    { urls: "turn:assets.mlxoa.com:3478", username: "public", credential: "exdnpolarusage" }
                ],
                iceTransportPolicy: "all"
            });
            oa.forEach((d) => {
                peerConnections[sender].addEventListener(d[0], function (ev) {
                    d[1](data.streamer, peerConnections[sender], ev)
                })
            })
            if (data.streamer) {
                if (window.mediaStream) {
                    mediaStream.getTracks().forEach((track) => {
                        peerConnections[sender].addTrack(track, mediaStream)
                    })
                }
            }
            peerConnections[sender].onicecandidate = function(ev) {
                socket.send(JSON.stringify({
                    Type: "wrtc",
                    Target: sender,
                    Data: {
                        Sender: UID(),
                        evType: "candidate",
                        candidate: ev.candidate
                    }
                }))
            }
            peerConnections[sender].onconnectionstatechange = function () {
                if (peerConnections[sender] === undefined || peerConnections[sender].connectionState === "closed" || peerConnections[sender].connectionState === "disconnected") {
                    console.log("lost connection")
                    delete peerConnections[sender]
                }
            }
            peerConnections[sender].oniceconnectionstatechange = function () {
                if (peerConnections[sender].iceConnectionState === "failed") {
                    peerConnections[sender].restartIce();
                }
            }
            peerConnections[sender].onnegotiationneeded = function(ev) {
                peerConnections[sender].createOffer().then((offer) => peerConnections[sender].setLocalDescription(offer)).then(() => {
                    socket.send(JSON.stringify({
                        Type: "wrtc",
                        Target: sender,
                        Data: {
                            Sender: UID(),
                            evType: "offer",
                            offer: peerConnections[sender].localDescription
                        }
                    }))
                })
            }
            break;
        }
        case "offer": {
            if (!peerConnections[sender]) {
                console.warn(`Connection with UUID ${sender} hasn't been started.`);
                return;
            }
            await peerConnections[sender].setRemoteDescription(new RTCSessionDescription(data.offer));
            await peerConnections[sender].setLocalDescription(await peerConnections[sender].createAnswer());
            socket.send(JSON.stringify({
                Type: "wrtc",
                Target: sender,
                Data: {
                    Sender: UID(),
                    evType: "answer",
                    answer: peerConnections[sender].localDescription
                }
            }))
            console.log("got offer.")
            break;
        }
        case "answer": {
            await peerConnections[sender].setRemoteDescription(new RTCSessionDescription(data.answer))
            console.log("got answer.")
            break;
        }
        case "candidate": {
            if (!peerConnections[sender]) {
                console.warn(`Connection with UUID ${sender} hasn't been started.`);
                return;
            }
            console.log("got ice candidate.")
            await peerConnections[sender].addIceCandidate(data.candidate)
            break;
        }
        case "close": {
            peerConnections[sender].close();
            delete peerConnections[sender]
            break;
        }
    }
}

/**
 * Parse the message from the socket
 * @param {any} ev
 */
function parseMessage(ev) {
    let obj = ev;
    switch (obj.Type) {
        case "message":
            ReceiveMessage(obj.Data);
            break;
        case "cache":
            ReceiveCachedMessages(obj.Data);
            break;
        case "isAdmin":
            admin = true;
            break;
        case "adminPacket":
            ReceiveAdminPacket(obj.Data);
            break;
        case "disconnect":
            socket.close(obj.Data[0], obj.Data[1]);
            lastCode = obj.Data[0];
            lastReason = obj.Data[1];
            break;
        case "wrtc":
            if (obj.Target === UID()) {
                ReceiveWebRTCC(obj.Data);
            }
            break;
        case "xrtc":
            if (obj.Target === UID()) {
                ReceiveWebRTCD(obj.Data)
            }
            break;
    }
}

function createSocket() {
    if (socket != null) {
        socket.close(1000, "recreating..")
    }
    socket = new WebSocket("wss://assets.mlxoa.com:4443/");

    socket.addEventListener("message", (ev) => {
        LiveWorker.postMessage(ev.data);
    });
    socket.addEventListener("open", OnConnection)
    socket.addEventListener("close", OnDisconnect)
}

LivechatLog.addEventListener("contextmenu", function (ev) {
    if (admin && ev.target.getAttribute("csid")) {
        ev.preventDefault();
        let adminWindow = window.open("about:blank", "_BLANK", "width=600,height=600,resizable=no,popup")
        adminWindow.document.body.innerHTML = `
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

                        * {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;

                            font-family: "Inter", sans-serif;
                        }

                        body {
                            background-color: #121212;
                            color: white;
                        }

                        .title {
                            margin: 2vw;
                            font-weight: 600;
                        }

                        button {
                            padding: 5px;
                            background-color: #363636;
                            color: white;
                            border: 0px solid white;
                            border-radius: 6px;
                        }

                        .actions {
                            margin: 2vw;
                            padding: 6px;
                            background-color: #242424
                        }
                    </style>
                </head>
                <body>
                    <h3 class="title">${ev.target.innerText}<br><font size=2>UID: ${ev.target.getAttribute("csid")}</font></h3>
                    <div class="actions">
                        <p style="display: inline;">User Actions - </p>
                        <button id="crashbtn">Crash</button>
                        <button id="kickbtn">Disconnect</button>
                    </div>
                    <div class="actions">
                        <p style="display: inline;">Message Actions - </p>
                        <button id="modifybtn">Modify</button>
                        <button id="deletebtn">Delete</button>
                    </div>
                </body>
        `
        adminWindow.addEventListener("blur", adminWindow.close)
        adminWindow.document.getElementById("crashbtn").addEventListener("click", function () {
            socket.send(JSON.stringify({
                Type: "adminPacket",
                Data: [
                    "Crash",
                    UID(),
                    ev.target.getAttribute("csid")
                ]
            }))
            adminWindow.close();
        })
        adminWindow.document.getElementById("kickbtn").addEventListener("click", function () {
            socket.send(JSON.stringify({
                Type: "adminPacket",
                Data: [
                    "Disconnect",
                    UID(),
                    ev.target.getAttribute("csid")
                ]
            }))
            adminWindow.close();
        })
        adminWindow.document.getElementById("modifybtn").addEventListener("click", function () {
            socket.send(JSON.stringify({
                Type: "admin-modifyMessage",
                Data: [
                    ev.target.getAttribute("mid"),
                    UID(),
                    adminWindow.prompt("Please enter the new message contents.", ev.target.innerText)
                ]
            }))
            adminWindow.close();
        })
        adminWindow.document.getElementById("deletebtn").addEventListener("click", function () {
            socket.send(JSON.stringify({
                Type: "admin-modifyMessage",
                Data: [
                    ev.target.getAttribute("mid"),
                    UID(),
                    null
                ]
            }))
            adminWindow.close();
        })
    }
})

LiveWorker.addEventListener('message', function (ev) {
    parseMessage(ev.data);
})

let db = false

LivechatStream.onclick = function () {
    if (!db) {
        db = true
        let message = new Message(USR, UID(), 0, "", 1);
        socket.send(JSON.stringify({
            Type: "message",
            Data: message.Serialize()
        }))
        setTimeout(function () {
            db = false
        }, 30000)
    }
}

// # SENDING

/**
 * Send a message.
 * @param {string} Content The message to be sent.
 */
function sendMessage(Content) {
    let message = new Message(USR, UID(), 0, Content, 0);
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
                createSocket()
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
        "Enter your name. (length 2-12)";
    LivechatLog.innerHTML += `Please make a name that you are ok with and will be recognizable to other users.<br />`;
} else {
    LivechatInput.placeholder = "Send a message.";
}

// # NAMING
hasSetName = localStorage["USR"] != null;
USR = localStorage["USR"];

// # TRUST CHECK
function runCheck() {
    const k = `hbgvfcgbjhnmihgbvfcvujhniuhbgyvfctybuiujhnbgvyijhnubgyvuhbjniugyvfbujhnihugyvbfubhjinkohugbvyfgbujhnimhbgvfctgybujhnihubgvfyrtyujhnimonhuyuijmoinhugbuyvfuijhnmooinhugbyvfyguijhnmohgbvfybyujhiniugbyvfygbujhniugbvfybuijhnugbyfvbuijhnmougbtfvuhnjioimhunybnuijmoihnugbyhnjimokihugijkoljihugijoklihugnijmoihnuijmiugbyvfbufrdcettfcvgcdsxzeardcfsxzaedrcfrsexazdcrftvrsexcftvgybtdcftcvgyuyfvgvbujhniugbvgjuhnimiohgbubhjnihbgfvtcdrgybuvyfcdvgbuvyfdcrtxtvgybuvyftdcrxtfvgybvfcdvgbyuijhngfvcdtrfguijhngbyfvtrcdgyvbuhtrf7g6tg6rf577utg6fr5dfgbyuvfcdv bgv65 yu vcybbui78t6vu ubvtc bngvygtfr7vhytgrf56gvhytgrfdefgvbhtrfde65ffgytredsw4rrtfr5e4wsfrewr65eds4rftgyut76rfgvbhnhjuhygvb njuyhtg7hnju7tugbn jygt7v bnkiou98y7jkiog7fv bjknuhgvh bjnkgfcvh bjkght7fvy bnuytgfv bnoiuj98t7ugjklu7jhuygtrf5defcvg btfrefvgbjhguytrf6ed vgvbjhiuygt fbbhn jm gtbtbnjhutt5gh uytr654etgvc bgredrxc vbgttdcxgv bjghtfrdcvg bhjngtfrdvc bnjhgtrf6ydtcv bjghtrf6ydycvh bnghytg5frdcvh bhytfcvhnbjgt5r6deffvbgjhy675rtf6gvhyt65rdfctgbv h675trfgrvbj hnytfjh`
    const usp = new URLSearchParams(location.search)

    if (usp.has("TRUSTCHK") && usp.get("TRUSTCHK") !== btoa(k)) {
        return false;
    }

    if (localStorage["trustFile"] !== btoa(k)) {
        return false;
    }

    return true;
}

if (!runCheck()) {
    alert("WARNING: you do not have a key and will be redirected to the main page, please ask the owner for a key if you were previously authenticated.")
    location.href = "/index.html"
}

// # FETCH RUNTIME FILES
async function runFetch() {
    AudioListings = await (await fetch("/assets/audio_listings.json")).json();
}

runFetch();

// # SERVER DATA
async function getServerData() {
    return (await fetch("https://assets.mlxoa.com:4443/"))
}

async function updateChat() {
    LivechatButton.innerText = "Livechat"
    const serverData = await (await getServerData()).json();
    if (serverData["usersOnline"]) {
        LivechatUO.innerText = `${serverData["usersOnline"]} ${serverData["usersOnline"] > 1 ? "users" : "user"} online`
    }
    if (socket == null || (socket.readyState == socket.CLOSED && lastCode != 3000)) {
        createSocket()
    }
    if (socket.readyState == socket.CLOSED) {
        LivechatLog.innerHTML = `<font color="#FF7711"><p class="livechat-text-container">Livechat Client</p></font>: You have been disconnected, try reloading! Reason: ${lastReason}<br /><br />`
        return
    }
}

setInterval(updateChat, 500);

setTimeout(createSocket, 1000);

document.body.onbeforeunload = (ev) => {
    peerConnections.forEach((peer, i) => {// Close each track
        peer.getTracks().forEach(track => {
            track.stop();
        });
        peer.ontrack = null;
        peer.onicecandidate = null;
        peer.oniceconnectionstatechange = null;
        peer.onsignalingstatechange = null;
        peer.close();
    })

    peerConnections = []
}