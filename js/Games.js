import { Prompt, Popup } from "./UtilityLib.js"

let Games = {
    Bitlife: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains inappropriate content, are you sure you want to play this game?", true, 2).Show().then(function() {
            location.href = "/go/OTHER/bitlife"
        })
    },
    DOOM_1993: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains intense gore, are you sure you want to play this game?", true, 2).Show().then(function() {
            location.href = "/go/CLASSIC/doom.1993"
        })
    },
    WIN95: () => {
        new Prompt("<font color='#FF7777'>Notice</font>", "This software doesn't run properly.", false, 3).Show()
    }
}

window.Games = Games;