window.RuntimeIdentifier = "FNAF1"
window.GameName = "FNAF1"

if (!window[`${RuntimeIdentifier}Runtime`]) {
    window[`${RuntimeIdentifier}Page`] = PagesAPI.currentPage();
    window[`${RuntimeIdentifier}Runtime`] = new Runtime(`MMFCanvas-${RuntimeIdentifier}`, `/go/FNAF/${RuntimeIdentifier}/resources/${GameName}.cch`);
    window[`${RuntimeIdentifier}RuntimeStep`] = window[`${RuntimeIdentifier}Runtime`].application.stepApplication;
    window[`${RuntimeIdentifier}Runtime`].application.stepApplication = function () {
        if (PagesAPI.currentPage() === window[`${RuntimeIdentifier}Page`]) {
            return window[`${RuntimeIdentifier}RuntimeStep`].apply(window[`${RuntimeIdentifier}Runtime`].application, arguments);
        }
    }
} else {
    window[`${RuntimeIdentifier}Runtime`].application.soundPlayer.resume();
    window[`${RuntimeIdentifier}Runtime`].application.timer = (new Date()).getTime();
    window[`${RuntimeIdentifier}Runtime`].application.run.rhTimerOld = (new Date()).getTime();
    window[`${RuntimeIdentifier}Runtime`].application.run.rhTimer = 0;
    window[`${RuntimeIdentifier}Runtime`].application.run.rhTimerDelta = 0;
    window[`${RuntimeIdentifier}Runtime`].application.stepApplication();
}
PagesAPI.beforeUnload(function() {
    // Pause the sounds
    window[`${RuntimeIdentifier}Runtime`].application.soundPlayer.pause();
});

function restartGame() {
    window[`${RuntimeIdentifier}Runtime`].application.run.rhQuit = 4
}