import { Prompt, Popup } from "./UtilityLib.js"

let Games = {
    Bitlife: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains inappropriate content, are you sure you want to play this game?", true, 2).Show().then(function() {
            location.href = "/go/OTHER/bitlife"
        })
    },
    DOOM_1993: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains gore, are you sure you want to play this game?", true, 2).Show().then(function() {
            location.href = "/go/CLASSIC/doom.1993"
        })
    },
    WIN95: () => {
        new Prompt("<font color='#FF7777'>Notice</font>", "This software doesn't run properly.", false, 3).Show()
    },
    Minecraft: () => {
        new Prompt("<font color='#FF7777'>Notice</font>", "This game is legally owned by Mojang, and this game and possibly other<br />games could be taken down.", false, 3).Show().then(function() {
            location.href = "/go/OTHER/minecraft"
        })
    }
}

window.Games = Games;