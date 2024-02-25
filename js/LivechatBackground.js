import { io } from "socket.io-client"; // Import socket.io for communication with the livechat server

const socketbackground = io("wss://mlxoa.com:4443/"); // Create socket instance
const hasSetName = localStorage["userName"] != null; // Check if the user has set their name
const isStreaming = localStorage["wasStreaming"] == "true";

function processMessage(message, userName) {
    return;

    if (!hasSetName) {return;} // Don't receive messages if the user hasn't set their name

    // Make sure the "chatText" key in localStorage exists
    if (localStorage["chatText"] == null) {
        localStorage["chatText"] = "";
    }

    // Add the message to the "chatText" key in localStorage to be read by the foreground version of livechat
    let newText = localStorage["chatText"] + `${userName}: ${atob(atob(message))}\n`;
    localStorage["chatText"] = newText;
    console.log(newText);

    return true;
}

socketbackground.on("connect", function() {
    console.log("Connected to Livechat Server.");

    setInterval(() => {
        if (isStreaming && socketbackground.connected) {
            socketbackground.emit("mpak", {
                type: "livestreamData",
                data: window.gameCanvas.toDataURL("image/jpeg", 0.2),
                csid: localStorage["csid"],
                errormsg: ""
            });
        }
    }, 1000 / 15);
});

socketbackground.on("message", processMessage)