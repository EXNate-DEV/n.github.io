//document.addEventListener('contextmenu', event => event.preventDefault());
window.onbeforeunload = function(e) {
    // Cancel the event
    e.preventDefault();

    // Chrome requires returnValue to be set
    e.returnValue = 'Really want to quit the game?';
};

//Prevent Ctrl+S (and Ctrl+W for old browsers and Edge)
document.onkeydown = function(e) {
    e = e || window.event; //Get event

    if (!e.ctrlKey) return;

    var code = e.which || e.keyCode; //Get key code

    switch (code) {
        case 83: //Block Ctrl+S
        case 87: //Block Ctrl+W -- Not work in Chrome and new Firefox
            e.preventDefault();
            e.stopPropagation();
            break;
    }
};
var a = new Audio('/go/CLASSIC/hl1/music.mp3');
var pashalka_count = 0;

function play_sound() {
    if (pashalka_count == 40) a.play();
    if (pashalka_count < 100) pashalka_count += 1;
}
window.addEventListener('click', play_sound);
window.addEventListener('keydown', play_sound);

zipMods = [
    ['halva_en.zip', 'Half-Life EN (MENU LAGS) (214M)', 214283501, 21, 10485760],
    ['opposing_force_en.zip', 'Opposing Force EN (BUGGED (old ver) + MENU LAGS) (221M)', 221191140, 22, 10485760],
    ['halva_rus.zip', 'Half-Life RUS (304M)', 303881453, 29, 10485760, 10485760],
    ['opposing_force_rus.zip', 'Opposing Force RUS (BUGGED (old ver)) (224M)', 223479923, 22, 10485760]
];

pkgMods = [
];

var show_again = true;
var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var asyncDialog = document.getElementById('asyncDialog');
var myerrorbuf = ''
var myerrordate = new Date();
var mounted = false;
var gamedir = 'valve';
var moduleCount = 0;
//var mem = 150;
var mfs;
var zipSize;


// make BrowserFS to work on ES5 browsers
if (!ArrayBuffer['isView']) {
    ArrayBuffer.isView = function(a) {
        return a !== null && typeof(a) === "object" && a['buffer'] instanceof ArrayBuffer;
    };

}

showElement('optionsTitle', false);

function prepareSelects() {
    var len = zipMods.length;
    var select = document.getElementById('selectZip');
    if (len) {
        showElement('zipHider', true);

        if (len > 1) {
            var links = '';
            for (var i = 0; i < len; i++) {
                select.options[i] = new Option(zipMods[i][1], zipMods[i][0]);
                links += '<br><a class="glow" onclick=location.href="' + zipMods[i][0] + '">' + zipMods[i][1] + '</a>';
            }
            select.style.display = 'block';
            document.getElementById('linksPlaceholder').innerHTML += links;
            //showElement('linksPlaceholder', true);
        }
    } else
        document.getElementById('rZip').checked = false;
    len = pkgMods.length;
    select = document.getElementById('selectPkg');
    if (len) {
        showElement('pkgHider', true);

        if (len > 1) {
            for (var i = 0; i < len; i++)
                select.options[i] = new Option(pkgMods[i][1], pkgMods[i][0]);
            //select.style.display = 'block';
        }
    } else
        document.getElementById('rPackage').checked = false;

    if (!zipMods.length && !len) {
        document.getElementById('rLocalZip').checked = true;
        showElement('rLocalZip', false);
    }
}

try {
    mem = 512; // give the goldsrc vm 512mb
} catch (e) {};

var Module = {
    TOTAL_MEMORY: mem * 1024 * 1024,
    preRun: [],
    postRun: [],
    print: (function() {
        var element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function(text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            //console.log(text);
            if (text) {
                myerrorbuf += text + '\n';
                console.log(text);
                if (text == "exit(0)")
                {
                    document.getElementById('canvas').style.display = "none";
                    setTimeout(function(){
                        location.reload();
                    }, 1000);
                }
                else if (text == "shader success") {
                    pashalka_count = 100;
                    a.pause();
                    document.getElementById('canvas').style.display = "block";
                } else {
                }
            }
            if (element) {
                if (element.value.length > 65536)
                    element.value = element.value.substring(512) + myerrorbuf;
                else
                    element.value += myerrorbuf;
                element.scrollTop = element.scrollHeight; // focus on bottom
            }
            myerrorbuf = ''
        };
    })(),
    printErr: function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        if (0) { // XXX disabled for safety typeof dump == 'function') {
            dump(text + '\n'); // fast, straight to the real console
        } else {
            if (myerrorbuf.length > 2048)
                myerrorbuf = 'some lines skipped\n' + myerrorbuf.substring(512);
            myerrorbuf += text + '\n';
            if (new Date() - myerrordate > 3000) {
                myerrordate = new Date();
                Module.print();
            }
        }
    },
    canvas: (function() {
        var canvas = document.getElementById('canvas');

        // As a default initial behavior, pop up an alert when webgl context is lost. To make your
        // application robust, you may want to override this behavior before shipping!
        // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
        canvas.addEventListener("webglcontextlost", function(e) {
            alert('WebGL context lost. You will need to reload the page.');
            e.preventDefault();
        }, false);

        return canvas;
    })(),
    setStatus: function(text) {
        if (!Module.setStatus.last) Module.setStatus.last = {
            time: Date.now(),
            text: ''
        };
        if (text === Module.setStatus.text) return;
        if (new Date() - myerrordate > 3000) {
            myerrordate = new Date();
            Module.print();
        }

        statusElement.innerHTML = text;
        if (progressElement) {
            var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);

            if (m) {
                var progress = Math.round(parseInt(m[2]) * 100 / parseInt(m[4]));
                progressElement.style.color = progress > 5 ? '#303030' : '#aaa000';
                progressElement.style.width = progressElement.innerHTML = '' + progress + '%';
            }
            showElement('progress1', !!m);
        }

    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        if (left)
            Module.setStatus('Preparing... (' + (this.totalDependencies - left) + '/' + this.totalDependencies + ')');
    }
};
window.onerror = function(event) {
    if (mounted)
        FS.syncfs(false, function(err) {
            Module.print('Saving IDBFS: ' + err);
        });
    if (('' + event).indexOf('SimulateInfiniteLoop') > 0)
        return;
    var text = 'Exception thrown: ' + event;
    text = text.replace(/&/g, "&amp;");
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace('\n', '<br>', 'g');
    Module.setStatus(text);
    Module.print('Exception thrown: ' + event);
};

function haltRun() {}

var savedRun;

function radioChecked(id) {
    var r = document.getElementById('r' + id);
    if (r) return r.checked;
    return false;
}

function showElement(id, show) {
    var e = document.getElementById(id);
    if (!e) return;
    e.style.display = show ? 'block' : 'none';
}

document.getElementById("exdn-status").innerText = "Downloading Scripts.."




function startXash() {
    document.getElementById("exdn-status").innerText = "Downloading Half-Life.."
    showElement('loader1', false);
    showElement('optionsTitle', false);
    showElement('fSettings', false);
    setupFS();
    Module.arguments = document.getElementById('iArgs').value.split(' ');
    Module.run = run = savedRun;
    const zipper = document.getElementById('selectZip');
    if (zipMods.length > 1) {
        var mod_parts = [zipMods[0][3], zipMods[0][4], zipMods[0][2]];
        for (var i = 0; i < zipMods.length; i++) {
            if (zipMods[i][0] == zipper.value) {
                mod_parts = [zipMods[i][3], zipMods[i][4], zipMods[i][2]];
                break;
            }
        }
        fetchZIP(zipper.value, savedRun, mod_parts[0], mod_parts[1], mod_parts[2]);
    } else {
        fetchZIP(zipMods[0][0], savedRun, zipMods[0][3]);
    }
    //showElement('canvas', true);

    window.addEventListener("beforeunload", function(e) {
        var confirmationMessage = 'Leave the game?';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });
}

function mountZIP(data) {
    document.getElementById("exdn-status").innerText = "Downloaded, mounting.."
    var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
    mfs.mount('/zip', new BrowserFS.FileSystem.ZipFS(Buffer.from(data)));
    FS.mount(new BrowserFS.EmscriptenFS(), {
        root: '/zip'
    }, '/rodir');
    document.getElementById("exdn-status").innerText = "Mounted, starting.."
}

function fetchZIP(packageName, cb, parts = 0, size_of_parts = 0, total_size = 0) {
    if (parts == 0) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "/go/CLASSIC/hl1/" + packageName, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = function(event) {
            var url = packageName;
            var size;
            if (event.total) size = event.total;
            else size = zipMods[0][2];
            if (event.loaded) {
                var total = size;
                var loaded = event.loaded;
                var num = 0;
                if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
            } else if (!Module.dataFileDownloads) {
                if (Module['setStatus']) Module['setStatus']('Downloading data...');
            }
        };
        xhr.onerror = function(event) {
            throw new Error("NetworkError");
        }
        xhr.onload = function(event) {
            console.log("loaded main archive")
            if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
                mountZIP(xhr.response);
                cb();
            } else {
                throw new Error(xhr.statusText + " : " + xhr.responseURL);
            }
        };
        xhr.send(null);
    } else {
        var buffers = new Uint8Array(total_size);
        var finished = 0;
        for (var i = 0; i < parts; i++) {
            const cur = i;
            const no_ext = packageName.slice(0, -4);
            const url1 = "/go/CLASSIC/hl1/" + no_ext + '_out/' + no_ext + '-' + cur + '.zip';
            console.log(url1);
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url1, true);
            xhr.responseType = 'arraybuffer';

            xhr.onprogress = function(event) {
                if (event.loaded) {
                    var loaded = event.loaded;
                    if (Module['setStatus']) Module['setStatus']('Downloading data... (' + ((finished * size_of_parts) + loaded) + '/' + total_size + ')');
                } else if (!Module.dataFileDownloads) {
                    if (Module['setStatus']) Module['setStatus']('Downloading data...');
                }
            };
            xhr.onerror = function(event) {
                throw new Error("NetworkError");
            }
            xhr.onload = function(event) {
                if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
                    finished++;
                    buffers.set(new Uint8Array(xhr.response), cur * size_of_parts);
                    if (finished == parts) {
                        mountZIP(buffers);
                        cb();
                    }
                } else {
                    throw new Error(xhr.statusText + " : " + xhr.responseURL);
                }
            };
            xhr.send(null);
        }
    }
}

function setupFS() {
    FS.mkdir('/rodir');
    FS.mkdir('/xash');
    try {
        mfs = new BrowserFS.FileSystem.MountableFileSystem();
        BrowserFS.initialize(mfs);
    } catch (e) {
        mfs = undefined;
        Module.print('Failed to initialize BrowserFS: ' + e);
    }

    mfs.mount('/ls', new BrowserFS.FileSystem.LocalStorage());
    FS.mount(new BrowserFS.EmscriptenFS(), {
        root: '/ls'
    }, '/xash');
    Module.print('LocalStorage mounted');

    FS.chdir('/xash/');
}

function skipRun() {
    savedRun = run;
    Module.run = haltRun;
    run = haltRun;

    Module.setStatus("Xash3D downloaded!");
    showElement('loader1', false);
    showElement('optionsTitle', true);

    if (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB)
        showElement('idbHider', true);
    prepareSelects();
    showElement('fSettings', true);

    ENV.XASH3D_GAMEDIR = gamedir;
    ENV.XASH3D_RODIR = '/rodir'

    function loadModule(name) {
        var script = document.createElement('script');
        script.onload = function() {
            moduleCount++;
            if (moduleCount == 3) {

                document.getElementById("exdn-status").innerText = "Click anywhere on the page to start the game."
            }
        };
        document.body.appendChild(script);
        script.src = "/go/CLASSIC/hl1/" + name + ".js";
    }

    loadModule("server");
    loadModule("client");
    loadModule("menu");
};

Module.preInit = [skipRun];
Module.websocket = [];
//Module.websocket.url = 'wsproxy://the-swank.pp.ua:3000/'
Module.websocket.url = 'wsproxy://4.tcp.ngrok.io:10657/';
ENV = [];

    (function() {
    var memoryInitializer = '/xash.html.mem';
    if (typeof Module['locateFile'] === 'function') {
    memoryInitializer = Module['locateFile'](memoryInitializer);
} else if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
}
    var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
    xhr.open('GET', memoryInitializer, true);
    xhr.responseType = 'arraybuffer';
    xhr.send(null);
})();

    document.getElementById('show_console_log').addEventListener('change', function() {
    if (document.getElementById('show_console_log').checked) document.getElementById('output').style.display = "block";
    else document.getElementById('output').style.display = "none";
});
    document.getElementById('label_show_console_log').style.display = "inline-block";
    /*(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-68666752-4', 'auto');
    ga('send', 'pageview');*/

    let db = false

    document.addEventListener("click", function () {
    if (!db) {
    db = true
    document.getElementById("launcher").click()
}
})