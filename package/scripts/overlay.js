/**
 * Immediately invoked function expression (IIFE) that handles map overlay
 * functionality for both Leaflet and Google Maps implementations.
 * @function
 */
(() => {
  /**
   * Configuration object for the TrainingPeaks Virtual map overlay
   * @type {Object}
   * @property {string} url - URL of the overlay image
   * @property {number} north - Northern boundary latitude
   * @property {number} south - Southern boundary latitude
   * @property {number} east - Eastern boundary longitude
   * @property {number} west - Western boundary longitude
   */
  const tpVirtualMap = {
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
   * Checks if a given map instance is a Google map
   * @param {any} map - The map instance to check
   * @return {boolean} True if the map is a Google Maps instance
   */
  function isGoogleMap(map) {
    return map instanceof google.maps.Map;
  }

  /**
   * Set to track which Leaflet maps have already been overlayed
   * @type {Set<number>}
   */
  const initializedLeafletIds = /* @__PURE__ */ new Set();

  /**
   * Adds an image overlay to a Leaflet map instance if it hasn't been
   * initialized already. Creates a new image overlay within the specified
   * geographical bounds and adds it to the map.
   * @param {L.Map} map - The Leaflet map instance to overlay
   * @return {void}
   */
  function addLeafletOverlay(map) {
    const id = map._leaflet_id;
    if (initializedLeafletIds.has(id)) {
      return;
    }
    initializedLeafletIds.add(id);
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
   * Adds an image overlay to a Google Maps instance using GroundOverlay.
   * Creates the overlay within specified geographical bounds and stores the
   * boundary values and URL as properties on the overlay object.
   * @param {google.maps.Map} map - The Google Maps instance to overlay
   * @return {void}
   */
  function addGoogleOverlay(map) {
    const overlay = new google.maps.GroundOverlay(
        tpVirtualMap.url,
        {
          north: tpVirtualMap.north,
          south: tpVirtualMap.south,
          east: tpVirtualMap.east,
          west: tpVirtualMap.west,
        },
    );
    overlay.v_north = tpVirtualMap.north;
    overlay.v_south = tpVirtualMap.south;
    overlay.v_east = tpVirtualMap.east;
    overlay.v_west = tpVirtualMap.west;
    overlay.v_url = tpVirtualMap.url;
    overlay.setMap(map);
  }

  /**
   * Attempts to add overlay to existing Leaflet maps.
   * @return {void}
   */
  function initExistingMaps() {
    if (globalThis.localMap && isLeafletMap(localMap)) {
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


  /**
   * Polls for valid Google Maps instance for up to 5 seconds. Adds overlay
   * when map becomes available.
   * @return {void}
   */
  function watchForGoogleMaps() {
    const maxAttempts = 10; // 5 seconds total with 500ms intervals
    let attempts = 0;

    /**
     * Adds overlay to svMap when svMap is a valid Google Maps instance.
     * Stops after maxAttempts or successful overlay.
     * @return {void}
     */
    function checkMap() {
      if (globalThis.svMap && globalThis.google?.maps &&
          isGoogleMap(globalThis.svMap)) {
        addGoogleOverlay(globalThis.svMap);
        return;
      }

      if (++attempts < maxAttempts) {
        setTimeout(checkMap, 500);
      }
    }

    checkMap();
  }

  watchForLeaflet();

  if (globalThis.google?.maps) {
    watchForGoogleMaps();
  }
})();
