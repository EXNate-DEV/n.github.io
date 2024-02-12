// Create a class for livechat
class Livechat extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
<!-- Livechat -->
<div class="livechat-panel">
    <p id="livechat-log"></p>
    <input type="text" class="form-control" id="livechat-input" autocomplete="off" />
    <div class="livechat-options">
        <button class="btn btn-danger" id="livechat-clear" title="Clear the chat."><i class="bi bi-trash"></i></button>
    </div>
</div>
        `;
    }
}

// Create a class for rce
class RCEContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
<!-- Livechat -->
<div class="rce-panel">
    <pre><code class="language-javascript"><textarea class="form-control" id="rce-jse" autocomplete="off"></textarea></code></pre>
</div>
        `;
    }
}

customElements.define("live-chat", Livechat);
customElements.define("rce-container", RCEContainer)
