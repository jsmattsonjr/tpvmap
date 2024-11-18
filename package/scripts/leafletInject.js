(() => {
  const overlay = document.createElement('script');
  overlay.type = 'text/javascript';
  overlay.src = chrome.runtime.getURL('scripts/leafletOverlay.js');
  overlay.dataset.overlayUrl = chrome.runtime.getURL('assets/tpvirtual.jpg');
  document.body.appendChild(overlay);
})();
