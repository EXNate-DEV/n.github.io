window.RuntimeIdentifier = "FNAF4"
window.GameName = "fnaf 4"

if (!window[`${RuntimeIdentifier}Runtime`]) {
    window[`${RuntimeIdentifier}Page`] = PagesAPI.currentPage();
    window[`${RuntimeIdentifier}Runtime`] = new Runtime(`MMFCanvas-${RuntimeIdentifier}`, `/go/FNAF/${RuntimeIdentifier}/resources/${GameName}.cch`);
    setTimeout(() => {
        window[`${RuntimeIdentifier}RuntimeStep`] = window[`${RuntimeIdentifier}Runtime`].Pc.Uh.step;
        window[`${RuntimeIdentifier}Runtime`].Pc.Uh.step = function () {
            if (PagesAPI.currentPage() === window[`${RuntimeIdentifier}Page`]) {
                return window[`${RuntimeIdentifier}RuntimeStep`].apply(window[`${RuntimeIdentifier}Runtime`].Pc.Uh, arguments);
            }
        }
    }, 500)
} else {
    window[`${RuntimeIdentifier}Runtime`].Pc.oc.resume();
    window[`${RuntimeIdentifier}Runtime`].Pc.dd = (new Date()).getTime();
    window[`${RuntimeIdentifier}Runtime`].Pc.G.Wk = (new Date()).getTime();
    window[`${RuntimeIdentifier}Runtime`].Pc.G.di = 0;
    window[`${RuntimeIdentifier}Runtime`].Pc.G.Gz = 0;
    window[`${RuntimeIdentifier}Runtime`].Pc.Uh.step();
}
PagesAPI.beforeUnload(function() {
    // Pause the sounds
    window[`${RuntimeIdentifier}Runtime`].Pc.oc.pause();
});

function restartGame() {
    window[`${RuntimeIdentifier}Runtime`].Pc.G.Lw = 4
}