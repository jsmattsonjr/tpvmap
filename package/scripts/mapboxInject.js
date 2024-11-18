/**
 * Injects the TPVirtual map overlay scripts for Mapbox Maps.
 * Configures the overlay URL and loads dependencies in the correct order.
 * @module mapboxinject
 */
(() => {
  const overlay = document.createElement('script');
  overlay.type = 'text/javascript';
  overlay.src = chrome.runtime.getURL('scripts/mapboxOverlay.js');
  overlay.dataset.overlayUrl = chrome.runtime.getURL(
      'assets/tpvirtual.jpg',
  );
  console.log("injecting mapbox overlay");
  document.body.appendChild(overlay);
})();
