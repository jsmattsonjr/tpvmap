/**
 * Immediately invoked function expression (IIFE) that injects the overlay
 * script into the page.
 * @function
 */
(() => {
  /**
   * Creates and injects a script element into the document body.
   * @type {HTMLScriptElement}
   */
  const s = document.createElement("script");
  s.type = "text/javascript";
  s.src = chrome.runtime.getURL("package/overlay.js");
  document.body.appendChild(s);
})();
