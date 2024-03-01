let k = `hbgvfcgbjhnmihgbvfcvujhniuhbgyvfctybuiujhnbgvyijhnubgyvuhbjniugyvfbujhnihugyvbfubhjinkohugbvyfgbujhnimhbgvfctgybujhnihubgvfyrtyujhnimonhuyuijmoinhugbuyvfuijhnmooinhugbyvfyguijhnmohgbvfybyujhiniugbyvfygbujhniugbvfybuijhnugbyfvbuijhnmougbtfvuhnjioimhunybnuijmoihnugbyhnjimokihugijkoljihugijoklihugnijmoihnuijmiugbyvfbufrdcettfcvgcdsxzeardcfsxzaedrcfrsexazdcrftvrsexcftvgybtdcftcvgyuyfvgvbujhniugbvgjuhnimiohgbubhjnihbgfvtcdrgybuvyfcdvgbuvyfdcrtxtvgybuvyftdcrxtfvgybvfcdvgbyuijhngfvcdtrfguijhngbyfvtrcdgyvbuhtrf7g6tg6rf577utg6fr5dfgbyuvfcdv bgv65 yu vcybbui78t6vu ubvtc bngvygtfr7vhytgrf56gvhytgrfdefgvbhtrfde65ffgytredsw4rrtfr5e4wsfrewr65eds4rftgyut76rfgvbhnhjuhygvb njuyhtg7hnju7tugbn jygt7v bnkiou98y7jkiog7fv bjknuhgvh bjnkgfcvh bjkght7fvy bnuytgfv bnoiuj98t7ugjklu7jhuygtrf5defcvg btfrefvgbjhguytrf6ed vgvbjhiuygt fbbhn jm gtbtbnjhutt5gh uytr654etgvc bgredrxc vbgttdcxgv bjghtfrdcvg bhjngtfrdvc bnjhgtrf6ydtcv bjghtrf6ydycvh bnghytg5frdcvh bhytfcvhnbjgt5r6deffvbgjhy675rtf6gvhyt65rdfctgbv h675trfgrvbj hnytfjh`

document.body.addEventListener("keydown", function (ev) {
    if (ev.key == 'o' && ev.ctrlKey && ev.altKey) {
        window.showOpenFilePicker({
            id: "securityKey"
        }).then(async function (res) {
            if (res[0] != null) {
                let fr = new FileReader();
                fr.addEventListener("load", function () {
                    if (fr.result == k) {
                        location.href = "/home.html";
                        localStorage["trustFile"] = btoa(fr.result);
                    }
                })
                fr.readAsText(await res[0].getFile());
            }
        })
    }
})

if (new URLSearchParams(location.search).get("a") == "true") {
    // this will basically do the same thing as chrome://gpuhang on chromebooks lol
    alert("you tried to bypass the lock, now you pay the price. press OK to continue.");
    onbeforeunload = function () { localStorage.x = 1 };

    setTimeout(function () {
        while (1) location.reload(1)
    }, 1000)
}

if (localStorage["trustFile"] == btoa(k)) {
    location.href = "/home.html";
}