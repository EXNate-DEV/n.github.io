emulators.pathPrefix = "/js/EMULATOR/DOS/";
window.runtime = Dos(document.getElementById("canvas"), {
    noSideBar: true,
    style: "none",
    noSocialLinks: true
})
runtime.run(`/go/CLASSIC/doom2/bundle.jsdos`)

PagesAPI.beforeUnload(function() {
    runtime.stop()
})