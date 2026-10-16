/*
 * Web agent bubble. A website adds it with:
 *   <script src="https://<app>/web-agent.js" data-agent="<workspaceId>/<linkId>" async></script>
 * It puts a round button in the bottom corner that opens the chat in a frame.
 * The bubble only appears once the chat has loaded, so a switched-off agent
 * leaves nothing on the page. Every word shown comes from the chat itself,
 * in the visitor's language.
 */
(function () {
  var script = document.currentScript;
  if (!script || window.__webAgentLoaded) return;
  var agent = script.getAttribute("data-agent");
  if (!agent || !/^[\w-]+\/[\w-]+$/.test(agent)) return;
  window.__webAgentLoaded = true;
  var origin = new URL(script.src).origin;

  var CHAT_ICON =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  // Ready-made icons the agent's owner can pick (the same set as the editor's).
  var ICON_PATHS = {
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    headset: '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  };
  function svg(inner) {
    return '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }
  var CLOSE_ICON =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  function mount() {
    var root = document.createElement("div");
    root.setAttribute("data-web-agent", "");
    root.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483000;";

    var frame = document.createElement("iframe");
    // The page and language let the team's emailed replies lead back here, in the visitor's words.
    frame.src =
      origin +
      "/agent/" +
      agent +
      "?embed=1&page=" +
      encodeURIComponent(location.href.slice(0, 2000)) +
      "&lang=" +
      encodeURIComponent(navigator.language || "");
    frame.setAttribute("allow", "clipboard-write");
    frame.style.cssText =
      "position:absolute;right:0;bottom:72px;width:380px;height:600px;max-height:calc(100vh - 110px);" +
      "max-width:calc(100vw - 40px);border:0;border-radius:16px;background:#fff;" +
      "box-shadow:0 12px 40px rgba(0,0,0,.18);display:none;";

    var button = document.createElement("button");
    button.type = "button";
    button.innerHTML = CHAT_ICON;
    button.style.cssText =
      "width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;color:#fff;display:none;" +
      "align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.2);transition:transform .15s;";
    button.onmouseenter = function () { button.style.transform = "scale(1.06)"; };
    button.onmouseleave = function () { button.style.transform = ""; };

    var labels = { open: "", close: "" };
    var openIcon = CHAT_ICON;
    var open = false;
    function show(next) {
      open = next;
      frame.style.display = open ? "block" : "none";
      button.innerHTML = open ? CLOSE_ICON : openIcon;
      button.setAttribute("aria-label", open ? labels.close : labels.open);
      button.setAttribute("aria-expanded", String(open));
    }
    button.onclick = function () { show(!open); };

    window.addEventListener("message", function (event) {
      if (event.source !== frame.contentWindow || event.origin !== origin) return;
      var data = event.data || {};
      if (data.source !== "web-agent") return;
      if (data.type === "ready") {
        labels.open = String(data.openLabel || "");
        labels.close = String(data.closeLabel || "");
        if (/^#[0-9a-fA-F]{6}$/.test(data.color)) button.style.background = data.color;
        if (typeof data.iconUrl === "string" && /^https?:\/\//i.test(data.iconUrl)) {
          var picture = document.createElement("img");
          picture.src = data.iconUrl;
          picture.alt = "";
          picture.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover;pointer-events:none;";
          openIcon = picture.outerHTML;
        } else if (typeof data.icon === "string" && Object.prototype.hasOwnProperty.call(ICON_PATHS, data.icon)) {
          openIcon = svg(ICON_PATHS[data.icon]);
        }
        button.style.display = "flex";
        show(open);
      } else if (data.type === "close") {
        show(false);
        button.focus();
      }
    });

    root.appendChild(frame);
    root.appendChild(button);
    document.body.appendChild(root);
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
