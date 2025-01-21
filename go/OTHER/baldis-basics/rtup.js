createUnityInstance(document.querySelector("#MMFCanvas-baldisbasics"), {
    arguments: [],
    dataUrl: "/go/OTHER/baldis-basics/Build/bld.data",
    frameworkUrl: "/go/OTHER/baldis-basics/Build/bld.framework.js",
    codeUrl: "/go/OTHER/baldis-basics/Build/bld.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "Baldi's Basics Classic",
    productVersion: "1.4.3",
    // matchWebGLToCanvasSize: false, // Uncomment this to separately control WebGL canvas render size and DOM element size.
    // devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays.
});