/*
 * Puts a booking page, form or portal inside a website. A website adds it
 * where the page should appear:
 *   <script src="https://<app>/embed.js" data-page="forms/<workspaceId>/<linkId>" async></script>
 * The page grows and shrinks with its content, so visitors never scroll
 * inside a box. Several can sit on one website page.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var page = script.getAttribute("data-page") || "";
  // Only the pages made to be embedded, so the line can't show anything else.
  var match = /^(book|forms|portal)\/([\w-]+)\/([\w-]+)(\?[^#]*)?$/.exec(page);
  if (!match) return;
  var origin = new URL(script.src).origin;
  var url = new URL(origin + "/" + match[1] + "/" + match[2] + "/" + match[3] + (match[4] || ""));
  url.searchParams.set("embed", "1");

  var frame = document.createElement("iframe");
  frame.src = url.toString();
  frame.title = script.getAttribute("data-title") || document.title || "";
  frame.loading = "lazy";
  frame.setAttribute("allow", "clipboard-write");
  frame.style.cssText = "display:block;width:100%;height:600px;border:0;background:transparent;";
  script.parentNode.insertBefore(frame, script.nextSibling);

  function sendViewport() {
    if (!frame.contentWindow) return;
    frame.contentWindow.postMessage({ type: "public-embed:host-viewport", height: window.innerHeight }, origin);
  }

  window.addEventListener("resize", sendViewport);
  window.addEventListener("message", function (event) {
    if (event.source !== frame.contentWindow || event.origin !== origin) return;
    var data = event.data || {};
    if (data.type === "public-embed:ready") sendViewport();
    if (data.type !== "public-embed:resize") return;
    var height = Number(data.height);
    if (isFinite(height) && height > 0) frame.style.height = Math.ceil(height) + "px";
  });
})();
