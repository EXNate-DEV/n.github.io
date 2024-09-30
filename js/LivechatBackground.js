let hasSetName = localStorage["USR"] != null;

function getScriptPath(foo) {
    return window.URL.createObjectURL(new Blob([foo.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]], {type: 'text/javascript'}));
}

const LiveWorker = new Worker(getScriptPath(function () {
    self.addEventListener("message", function (ev) {
        if (ev !== undefined && ev.data !== undefined) {
            this.self.postMessage(JSON.parse(ev.data));
        }
    })
}));

window.socket = new WebSocket("wss://assets.mlxoa.com:4443")
window.peerConnections = [];

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
 * Parse the message from the socket
 * @param {any} ev
 */
function parseMessage(ev) {
    let obj = JSON.parse(ev.data);
    switch (obj.Type) {
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

let lastCode = 1000
let lastReason = ""

function OnDisconnect(ev) {
    lastCode = ev.code
}

function OnConnection() {
    if (hasSetName) {
        socket.send(JSON.stringify({
            Type: "userinfo",
            Data: UID(),
            Version: 4
        }));
    }
}

function createSocket() {
    if (socket != null) {
        socket.close(1000, "recreating..")
    }
    socket = new WebSocket("wss://assets.mlxoa.com:4443/");

    socket.addEventListener("message", parseMessage);
    socket.addEventListener("open", OnConnection)
    socket.addEventListener("close", OnDisconnect)
}

setTimeout(createSocket, 500)