const search = new URLSearchParams(location.search);
const text = document.getElementById("text");
text.hidden = true
if (!search.get("csid")) {
    location.pathname = "/"
}
LiveAPI.registerPeerEvent("track", (streamer, peer, ev) => {
    if (!streamer) {
        document.getElementById("i").srcObject = ev.streams[0];
        document.getElementById("i").play()
    }
})
LiveAPI.registerRTCEvent("icefailed", (info) => {
    text.hidden = false
    text.innerText = "ICE Failed, are they online and playing a game?"
})
LiveAPI.registerPeerEvent("connectionstatechange", (streamer, peer, ev) => {
    if (peer.connectionState === "disconnected") {
        text.hidden = false
        text.innerText = "Disconnected, please reload the tab to reconnect."
    }
    if (peer.connectionState === "failed") {
        text.hidden = false
        text.innerText = "Connection failed, are they playing a supported game?"
    }
    if (peer === null || peer.connectionState === "closed") {
        text.hidden = false
        text.innerText = "Connection closed, they probably exited the game."
    }
})

LiveAPI.registerSocketOpenEvent(() => {
    console.log("opened")
    LiveAPI.openStream(decodeURIComponent(search.get("csid")))
})
