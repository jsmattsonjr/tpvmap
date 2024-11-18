/**
 * Injects the TPVirtual map overlay scripts for Google Maps.
 * Configures the overlay URL and loads dependencies in the correct order.
 * @module googleInject
 */
(() => {
  const overlay = document.createElement('script');
  overlay.type = 'text/javascript';
  overlay.src = chrome.runtime.getURL('scripts/googleOverlay.js');
  overlay.dataset.overlayUrl = chrome.runtime.getURL(
      'assets/tpvirtual.jpg',
  );

  document.body.appendChild(overlay);
})();
