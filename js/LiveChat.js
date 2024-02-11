import { io } from "socket.io-client";

const socket = io("wss://lci-TheDevNate.replit.app/");
const LivechatButton = document.getElementsByClassName("lcb")[0];
const LivechatPanel = document.getElementsByClassName("lcc")[0];
const LivechatInput = document.getElementById("lcin");
const LivechatLog = document.getElementById("chatlog");
const LivechatNotify = document.getElementById("lcnotify");
const LivechatClear = document.getElementById("clearchat");
const Toast = document.getElementById("bootstrapToast");
let hasSetName = localStorage["userName"] != null;
let userName = "unknown";
let panelVisible = false;
let canSend = true;
let sentPleaseWait = false;

function setVisible(visible) {
    if (visible) {
        LivechatPanel.style.setProperty("--visibility", "100%");
        LivechatPanel.style.setProperty("--chat-width", "300px");
        LivechatButton.style.setProperty("--chat-width", "300px");
    } else {
        LivechatPanel.style.setProperty("--visibility", "0%");
        LivechatPanel.style.setProperty("--chat-width", "0px");
        LivechatButton.style.setProperty("--chat-width", "100px");
    }
}

function sendMessage(message) {
    if (message.length < 1 || message.trim().length < 1) {
        return;
    }
    if (!canSend) {
        if (!sentPleaseWait) {
            LivechatLog.innerText += "Please wait 1s before sending another message.\n";
            LivechatLog.scrollTo({
                top: LivechatLog.scrollHeight,
                behavior: "instant",
            });
        }
        sentPleaseWait = true;
        return;
    }
    LivechatInput.value = "";
    socket.emit("message", btoa(btoa(message.trim())), atob(userName));
    canSend = false;
    setTimeout(() => {
        canSend = true;
        sentPleaseWait = false;
    }, 1000);
}

function receiveMessage(msg, userName) {
    if (LivechatPanel == null && Toast != null) {
        if (localStorage["chatText"] == null) {
            localStorage["chatText"] = "";
        }
        localStorage["chatText"] += `${userName}: ${atob(atob(msg))}\n`;
        let newToast = Toast.cloneNode(true);
        newToast.id = Math.round(Math.random() * 100000);
        document.body.appendChild(newToast);
        newToast.lastChild.textContent = `${userName}: ${atob(atob(msg))}\n`;
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
        // Make sure the localStorage key "chatText" exists and is a string
        if (localStorage["chatText"] == null) {
            localStorage["chatText"] = "";
        }
        // Check if scrolled to bottom
        let autoScroll =
            Math.abs(
                LivechatLog.scrollHeight -
                    LivechatLog.clientHeight -
                    LivechatLog.scrollTop
            ) <= 1;
        // Add message
        LivechatLog.innerText += `${userName}: ${atob(atob(msg))}\n`;
        localStorage["chatText"] = LivechatLog.innerText;
        // Scroll down to new bottom if previously at bottom
        if (autoScroll) {
            LivechatLog.scrollTo({
                top: LivechatLog.scrollHeight,
                behavior: "instant",
            });
        }
    }
}

if (LivechatButton != null) {
    LivechatButton.onclick = function () {
        panelVisible = !panelVisible;
        setVisible(panelVisible);
    };
}

if (LivechatClear != null) {
    LivechatClear.onclick = function () {
        localStorage["chatText"] = "";
        LivechatLog.innerText = "";
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
                    LivechatLog.innerText = "";
                    hasSetName = true;
                    userName = btoa(LivechatInput.value);
                    localStorage["userName"] = btoa(userName);
                    // Clear value and set placeholder
                    LivechatInput.value = "";
                    LivechatInput.placeholder = "Send a message.";
                }
            } else {
                sendMessage(LivechatInput.value);
            }
        }
    });
    if (!hasSetName) {
        LivechatInput.placeholder =
            "Enter your name. (unchangable, length 2-12)";
        LivechatLog.innerText += `Please make a name that you are ok with and will be recognizable to other users.\n`;
    } else {
        LivechatInput.placeholder = "Send a message.";
    }
}

if (LivechatNotify != null) {
    LivechatNotify.addEventListener("click", function (ev) {
        localStorage["notify"] = `${LivechatNotify.checked}`;
    });
}

socket.on("connect", function () {
    console.log("Connected to Livechat Server.");
    if (hasSetName) {
        userName = atob(localStorage["userName"]);
        // Fill chat with previously received text if possible
        if (localStorage["chatText"] != null && LivechatLog != null) {
            LivechatLog.innerText = localStorage["chatText"];
            setTimeout(() => {
                setVisible(true);
                LivechatLog.scrollTo({
                    top: LivechatLog.scrollHeight,
                    behavior: "instant",
                });
                setVisible(false);
            }, 10);
        }
    }
});

socket.on("message", receiveMessage);

if (LivechatNotify != null) {
    LivechatNotify.checked = localStorage["notify"] == "true";
}
