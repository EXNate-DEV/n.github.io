document.addEventListener("keydown", async function(ev) {
    if (ev.ctrlKey && ev.key == "s") {
        ev.preventDefault();
        ev.stopPropagation();
    }
})

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/js/service-worker.js").catch(function(err) {
        console.error('ServiceWorker Registry Error: ', err);
    })
}