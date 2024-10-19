/*

Polar ICC (Interactive computer connectivity).

Web <--ICC-Server--> AI-ready Computer

*/

const socket = io("https://stuff.mlxoa.com", {
    reconnectionDelay: 10,
    reconnection: true,
    autoConnect: false
})

let currentTask = ""
let serverState = "default"
let currentCallback

socket.on("connect", () => {
    socket.emit("identify", "web")
})

socket.on("chunk", (id, data) => {
    if (id != currentTask) { return }
    currentCallback("chunk", data)
})

socket.on("taskDone", (id, data) => {
    if (id != currentTask) { return; }
    currentTask = ""
    currentCallback("done", data)
})

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

window.AIClient = {
    respond: function (history, callback) {
        if (currentTask == "") {
            currentTask = uuidv4()
            currentCallback = callback
            socket.emit("task", currentTask, history)
        } else {
            throw new Error("current task is NOT DONE.")
        }
    }
}

socket.connect()