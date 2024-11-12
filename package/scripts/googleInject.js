/**
 * Injects the TPVirtual map overlay scripts for Google Maps.
 * Configures the overlay URL and loads dependencies in the correct order.
 * @module googleInject
 */
(() => {
  const config = document.createElement('script');
  config.type = 'text/javascript';
  config.dataset.overlayUrl = chrome.runtime.getURL(
      'assets/tpvirtual.jpg',
  );
  config.src = chrome.runtime.getURL('scripts/config.js');

  const overlay = document.createElement('script');
  overlay.type = 'text/javascript';
  overlay.src = chrome.runtime.getURL('scripts/googleOverlay.js');

  config.onload = () => document.body.appendChild(overlay);
  document.body.appendChild(config);
})();
