document.addEventListener("keydown", async function(ev) {
    if (ev.ctrlKey && ev.key == "s") {
        ev.preventDefault();
        ev.stopPropagation();
    }
})