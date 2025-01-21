var gameInstance = UnityLoader.instantiate("canvas", "/go/OTHER/rope-police/spider.json", {onProgress: UnityProgress,  Module:  {onRuntimeInitialized: function  () {UnityProgress(gameInstance, "complete")}}});

PagesAPI.beforeUnload(function() {
    if (gameInstance.Module) {
        gameInstance.Module.noExitRuntime = false;
        gameInstance.Module.exit(1, true);
    }
})