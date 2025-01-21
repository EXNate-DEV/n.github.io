const activity = PagesAPI.createActivity()
let stopbutton

function stopStream() {
    window.mediaStream = null;
    gameCanvas.srcObject.getTracks().forEach(track => {track.stop()})
    gameCanvas.srcObject = null;
    stopbutton.remove();
}

window.changeSource = async function() {
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        if (gameCanvas.srcObject) {
            gameCanvas.srcObject.getTracks().forEach(track => {track.stop()})
        }
        if (stopbutton) {
            stopbutton.remove();
        }
        gameCanvas.srcObject = stream;
        stopbutton = activity.createButton("Stop Screenshare", stopStream)
    }).catch(error => {
        if (error.name === "NotAllowedError") {
            if (gameCanvas.srcObject) {
                // The user is currently streaming.
                return;
            }
            activity.createError("User canceled operation, reload required.")
        } else {
            activity.createError("Unexpected error, reload required.");
        }
        // Make sure the user has to reload the page.
        window.changeSource = function() {

        };
    })
}

const gameCanvas = document.getElementById("MMFCanvas")
changeSource();
window.mediaStream = gameCanvas.captureStream(60);