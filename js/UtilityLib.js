function Wrap(element, inside) {
    let e = document.createElement(inside);
    e.appendChild(element);
    return e;
}

export class Prompt {
    constructor(Title, Subtitle, Dangerous, Type, HideInstant) {
        this.title = Title;
        this.subtitle = Subtitle;
        this.danger = Dangerous;
        this.type = Type;
        this.hi = HideInstant;
    }

    /**
     * Shows a fullscreen prompt.
     * @returns {Promise<void>}
     */
    Show() {
        let that = this;
        return new Promise(function (res, rej) {
            let e = document.createElement("span");
            e.style = "width: 100%; height: 100%; position: fixed; top: 0; left: 0; background-color: #00000077; z-index: 4; opacity: 0%; transition: all 0.5s ease-in-out;"
            if (that.type == 1) {
                let ie = document.createElement("div");
                ie.style = "width: 50%; height: 50%; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; align-items: center; justify-content: center;"
                let t = document.createElement("h1");
                t.style = "display: block;"
                t.innerHTML = that.title;

                let st = document.createElement("p");
                st.style = "display: block;"
                st.innerHTML = that.subtitle;

                let yes = document.createElement("button");
                yes.innerText = "Yeah";
                yes.className = that.danger ? "btn btn-danger" : "btn btn-primary";
                yes.onclick = function (ev) {
                    requestAnimationFrame(function () {
                        if (that.hi) {
                            document.body.removeChild(e);
                        } else {
                            e.style.backdropFilter = "blur(0px)";
                            e.style.opacity = 0;
                            setTimeout(function () {
                                document.body.removeChild(e);
                            }, 500)
                        }
                    })
                    res();
                };

                let no = document.createElement("button");
                no.innerText = "Nope";
                no.className = "btn btn-secondary";
                no.onclick = function (ev) {
                    requestAnimationFrame(function () {
                        if (that.hi) {
                            document.body.removeChild(e);
                        } else {
                            e.style.backdropFilter = "blur(0px)";
                            e.style.opacity = 0;
                            setTimeout(function () {
                                document.body.removeChild(e);
                            }, 500)
                        }
                    })
                    rej();
                };

                let bg = Wrap(yes, "div");
                bg.appendChild(no);
                bg.className = "btn-group p-4";

                let c = Wrap(t, "div");
                c.appendChild(st);
                c.appendChild(bg);

                ie.appendChild(c);
                e.appendChild(ie);
            } else if (that.type == 2) {
                let ie = document.createElement("div");
                ie.style = "width: 50%; height: 50%; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; align-items: center; justify-content: center;"
                let t = document.createElement("h1");
                t.style = "display: block;"
                t.innerHTML = that.title;

                let st = document.createElement("p");
                st.style = "display: block;"
                st.innerHTML = that.subtitle;

                let yes = document.createElement("button");
                yes.innerText = "Continue";
                yes.className = that.danger ? "btn btn-danger" : "btn btn-primary";
                yes.onclick = function (ev) {
                    requestAnimationFrame(function () {
                        if (that.hi) {
                            document.body.removeChild(e);
                        } else {
                            e.style.backdropFilter = "blur(0px)";
                            e.style.opacity = 0;
                            setTimeout(function () {
                                document.body.removeChild(e);
                            }, 500)
                        }
                    })
                    res();
                };

                let no = document.createElement("button");
                no.innerText = "Cancel";
                no.className = "btn btn-secondary";
                no.onclick = function (ev) {
                    requestAnimationFrame(function () {
                        if (that.hi) {
                            document.body.removeChild(e);
                        } else {
                            e.style.backdropFilter = "blur(0px)";
                            e.style.opacity = 0;
                            setTimeout(function () {
                                document.body.removeChild(e);
                            }, 500)
                        }
                    })
                    rej();
                };

                let bg = Wrap(yes, "div");
                bg.appendChild(no);
                bg.className = "btn-group p-4";

                let c = Wrap(t, "div");
                c.appendChild(st);
                c.appendChild(bg);

                ie.appendChild(c);
                e.appendChild(ie);
            } else if (that.type == 3) {
                let ie = document.createElement("div");
                ie.style = "width: 50%; height: 50%; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; align-items: center; justify-content: center;"
                let t = document.createElement("h1");
                t.style = "display: block;"
                t.innerHTML = that.title;

                let st = document.createElement("p");
                st.style = "display: block;"
                st.innerHTML = that.subtitle;

                let yes = document.createElement("button");
                yes.innerText = "Ok";
                yes.className = that.danger ? "btn btn-danger" : "btn btn-primary";
                yes.onclick = function (ev) {
                    requestAnimationFrame(function () {
                        if (that.hi) {
                            document.body.removeChild(e);
                        } else {
                            e.style.backdropFilter = "blur(0px)";
                            e.style.opacity = 0;
                            setTimeout(function () {
                                document.body.removeChild(e);
                            }, 500)
                        }
                    })
                    res();
                };

                let bg = Wrap(yes, "div");
                bg.className = "btn-group p-4";

                let c = Wrap(t, "div");
                c.appendChild(st);
                c.appendChild(bg);

                ie.appendChild(c);
                e.appendChild(ie);
            }
            document.body.appendChild(e);
            requestAnimationFrame(function () {
                e.style.backdropFilter = "blur(8px)";
                e.style.opacity = 1;
            });
        })
    }
}

export class Popup {
    constructor(Title, Subtitle) {
        this.title = Title;
        this.subtitle = Subtitle;
    }

    /**
     * Shows a fullscreen popup.
     * @returns {void}
     */
    Show(Instant) {
        let e = document.createElement("span");
        e.style = "--js-opacity: 0%; width: 100%; height: 100%; position: fixed; top: 0; left: 0; background-color: #00000077; z-index: 4; opacity: var(--js-opacity); transition: all 0.5s ease-in-out;"

        if (Instant) {
            e.style.transition = "all 0s";
        }

        let ie = document.createElement("div");
        ie.style = "width: 50%; height: 50%; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; display: flex; align-items: center; justify-content: center;"
        let t = document.createElement("h1");
        t.style = "display: block;"
        t.innerHTML = this.title;

        let st = document.createElement("p");
        st.style = "display: block;"
        st.innerHTML = this.subtitle;

        let c = Wrap(t, "div");
        c.appendChild(st);

        ie.appendChild(c);
        e.appendChild(ie);

        document.body.appendChild(e);
        requestAnimationFrame(function () {
            e.style.backdropFilter = "blur(8px)";
            e.style.opacity = 1;
        });
    }
}