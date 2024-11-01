/**
 * Immediately invoked function expression (IIFE) that injects the overlay
 * script into the page and provides it with necessary extension resources.
 * @function
 */
(() => {
  /**
   * Creates and injects a script element into the document body. The script
   * element is configured with the overlay URL as a data attribute and the
   * source set to the extension's overlay script.
   * @type {HTMLScriptElement}
   */
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.dataset.overlayUrl = chrome.runtime.getURL(
      'assets/tpvirtual.jpg',
  );
  s.src = chrome.runtime.getURL('package/overlay.js');
  document.body.appendChild(s);
})();
