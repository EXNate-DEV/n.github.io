import { Prompt, Popup } from "./UtilityLib.js"

let Games = {
    Bitlife: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains inappropriate content, are you sure you want to play this game?", true, 2).Show().then(function() {
            PagesAPI.changePage('/go/OTHER/bitlife/index.html')
        })
    },
    DOOM_1993: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains gore, are you sure you want to play this game?", true, 2).Show().then(function() {
            PagesAPI.changePage('/go/CLASSIC/doom1993/index.html')
        })
    },
    DOOM_II: () => {
        new Prompt("<font color='#FF7777'>Game Warning</font>", "This game contains gore, are you sure you want to play this game?", true, 2).Show().then(function() {
            PagesAPI.changePage('/go/CLASSIC/doom2/index.html')
        })
    },
    WIN95: () => {
        new Prompt("<font color='#FF7777'>Notice</font>", "This software doesn't run properly.", false, 3).Show()
    },
    HL1: () => {
        PagesAPI.changePage('/go/CLASSIC/hl1/index.html')
    },
    Minecraft: () => {
        PagesAPI.changePage('/go/OTHER/minecraft/index.html', {newTab: true})
    }
}

window.Games = Games;