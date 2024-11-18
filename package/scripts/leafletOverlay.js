/**
 * Handles TrainingPeaks Virtual map overlay functionality for Leaflet maps.
 * Uses property descriptors to detect Leaflet library initialization and
 * automatically adds overlays to both new and existing map instances.
 * Includes methods for map type detection, overlay existence checks,
 * and overlay application within specified geographical bounds.
 * @module leafletOverlay
 */
(() => {
  /**
   * Configuration for the TrainingPeaks Virtual map overlay
   * @type {Object}
   * @property {string} url - URL of the overlay image
   * @property {number} north - Northern boundary latitude
   * @property {number} south - Southern boundary latitude
   * @property {number} east - Eastern boundary longitude
   * @property {number} west - Western boundary longitude
   */
  globalThis.tpVirtualMap = {
    url: document.currentScript.dataset.overlayUrl,
    north: -1.374593,
    south: -1.482999,
    east: 149.686722,
    west: 149.578094,
  };

  /**
   * Checks if a given map instance is a Leaflet map
   * @param {any} map - The map instance to check
   * @return {boolean} True if the map is a Leaflet map instance
   */
  function isLeafletMap(map) {
    return map instanceof L.Map;
  }

  /**
   * Checks if a map already has the TPVirtual overlay by iterating through
   * its layers and checking image URLs.
   * @param {L.Map} map - The Leaflet map instance to check
   * @return {boolean} True if the map already has our overlay
   */
  function hasOverlay(map) {
    let found = false;
    map.eachLayer((layer) => {
      if (layer instanceof L.ImageOverlay &&
          layer.getElement()?.src === tpVirtualMap.url) {
        found = true;
      }
    });
    return found;
  }

  /**
   * Adds an image overlay to a Leaflet map instance if it hasn't been
   * initialized already. Creates a new image overlay within the specified
   * geographical bounds and adds it to the map.
   * @param {L.Map} map - The Leaflet map instance to overlay
   * @return {void}
   */
  function addLeafletOverlay(map) {
    const latLngBounds = [
      [tpVirtualMap.north, tpVirtualMap.west],
      [tpVirtualMap.south, tpVirtualMap.east],
    ];
    const options = {zIndex: 0.1};
    const imageOverlay = L.imageOverlay(
        tpVirtualMap.url,
        latLngBounds,
        options,
    );
    imageOverlay.addTo(map);
  }

  /**
   * Attempts to add overlay to existing Leaflet maps.
   * @return {void}
   */
  function initExistingMaps() {
    if (globalThis.localMap && isLeafletMap(localMap) &&
	!hasOverlay(localMap)) {
      addLeafletOverlay(localMap);
    } else {
      const map = globalThis.pageView?.mapContext?.().map();
      if (map) {
        addLeafletOverlay(map);
      }
    }
  }

  /**
   * Sets up a property descriptor to detect when L.Map becomes available
   * and immediately register our init hook. Also handles the case where
   * Leaflet is already loaded.
   * @return {void}
   */
  function watchForLeaflet() {
    /**
     * Registers the overlay initialization hook with Leaflet and handles any
     * existing map instances.
     * @return {void}
     */
    function initLeaflet() {
      try {
        L.Map.addInitHook(function() {
          addLeafletOverlay(this);
        });
        initExistingMaps();
      } catch (e) {
        // Maybe L.Map.addInitHook isn't available yet?
        console.error('Failed to initialize Leaflet overlay:', e);
      }
    }

    if (globalThis.L?.Map) {
      initLeaflet();
    } else {
      Object.defineProperty(globalThis, 'L', {
        configurable: true,
        enumerable: true,
        get: function() {
          return this._L;
        },
        set: function(newL) {
          this._L = newL;
          if (newL?.Map) {
            initLeaflet();
          }
        },
      });
    }
  }

  watchForLeaflet();
})();
