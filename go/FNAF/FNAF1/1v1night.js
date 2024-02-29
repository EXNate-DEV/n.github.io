// 1v1 (or PvP) night for FNAF 1

const streamws = new WebSocket("wss://mlxoa.com:4443/livestream-ws");

let csid = localStorage["csid"];
let opponent_csid = "";

let gameState = {
    player1: {
        ready: false,
        score: 0
    },
    player2: {
        ready: false,
        score: 0
    }
}

streamws.addEventListener("message", function (ev) {
    let obj = JSON.parse(ev.data);
    if (obj.type == "1v1.ready") {
        if (obj.csid == ) {

        }
    }
    if (obj.type == "1v1.tryjoin") {
        if (opponent_csid == "") {
            streamws.send(JSON.stringify({
                type: "1v1.tryjoin_response",
                csid: csid,
                target_csid: obj.csid,
                data: true
            }))
        }
    }
})

function ProcessResponse() {

}

window.PvPNight = {
    TryJoin: function (t_csid) {
        streamws.send(JSON.stringify({
            type: "1v1.tryjoin",
            csid: csid,
            target_csid: t_csid,
            data: null
        }))

        streamws.addEventListener()
        streamws.removeEventListener()
    }
}

// object listing
let l = runtime.application.frame.layers;
for (let i = 0; i < l.length; i++) {
    console.log(`Layer ${i}`);
    let array = runtime.application.frame.layers[i].planeSprites.children;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        console.log(`   [${index}, ${element.hoType == 7}]: ${element.hoOiList.oilName} == ${element.rsValue}`)
    }
}