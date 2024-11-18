/**
 * Injects the TPVirtual map overlay scripts for Leaflet-based maps.
 * Configures the overlay URL and loads dependencies in the correct order.
 * @module leafletInject
 */
(() => {
  const overlay = document.createElement('script');
  overlay.type = 'text/javascript';
  overlay.src = chrome.runtime.getURL('scripts/leafletOverlay.js');
  overlay.dataset.overlayUrl = chrome.runtime.getURL(
      'assets/tpvirtual.jpg',
  );

  document.body.appendChild(overlay);
})();
