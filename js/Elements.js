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
    <div class="livechat-options d-flex mb-3">
        <button class="btn btn-secondary align-self-center" id="livechat-stream" title="Send the link in chat to watch your stream.">Send Stream Link</button>
        <div class="float-end align-self-center ms-auto" id="livechat-usersonline">N/A users online.</div>
    </div>
</div>
<div class="modal" tabindex="-1" id="configmodal">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Start Streaming</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>There is currently no configuration options.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-success">Start</button>
      </div>
    </div>
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
customElements.define("rce-container", RCEContainer);