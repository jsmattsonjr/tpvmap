/**
 * Handles overlay functionality for Leaflet maps by detecting library init and
 * adding overlays to both new and existing map instances.
 */
(() => {
  /**
   * Config for TPVirtual map overlay bounds and image URL
   * @type {{
   *   url: string,
   *   north: number,
   *   south: number,
   *   east: number,
   *   west: number
   * }}
   */
  const tpVirtualMap = {
    url: document.currentScript.dataset.overlayUrl,
    north: -1.374593,
    south: -1.482999,
    east: 149.686722,
    west: 149.578094,
  };

  /**
   * Adds image overlay to a Leaflet map instance
   * @param {L.Map} map - Target Leaflet map instance
   * @return {void}
   */
  function addLeafletOverlay(map) {
    const bounds = [
      [tpVirtualMap.north, tpVirtualMap.west],
      [tpVirtualMap.south, tpVirtualMap.east],
    ];
    const overlay = L.imageOverlay(tpVirtualMap.url, bounds, {zIndex: 0.1});
    overlay.addTo(map);
  }

  /**
   * Attempts to add overlay to any existing map instance
   * @return {void}
   */
  function initExistingMaps() {
    const mapCandidates = [
      globalThis.pageView?.mapContext?.().map(),
      globalThis.L?.mapbox?.feedback?._events?.change[0]?.ctx,
      globalThis.localMap,
    ];

    const existingMap = mapCandidates.find(map => map);
    if (existingMap) {
      addLeafletOverlay(existingMap);
    }
  }

  /**
   * Sets up detection for Leaflet library initialization
   * @return {void}
   */
  function watchForLeaflet() {
    /**
     * Registers overlay init hook with Leaflet and handles existing maps
     * @return {void}
     */
    function initLeaflet() {
      try {
        L.Map.addInitHook(function() {
          addLeafletOverlay(this);
        });
        initExistingMaps();
      } catch (err) {
        console.error('Failed to initialize Leaflet overlay:', err);
      }
    }

    if (globalThis.L?.Map) {
      initLeaflet();
      return;
    }

    Object.defineProperty(globalThis, 'L', {
      configurable: true,
      enumerable: true,
      get() {
        return this._L;
      },
      set(newL) {
        this._L = newL;
        if (newL?.Map) {
          initLeaflet();
        }
      },
    });
  }

  watchForLeaflet();
})();
