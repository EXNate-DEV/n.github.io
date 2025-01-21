window.nes = cfxnes({rom:"/go/CLASSIC/pacman/pacman.nes", video: {
        scale: 3
    }, fullscreen: {
        type: "normalized"
    }})

PagesAPI.beforeUnload(function() {
    nes.stop()
})