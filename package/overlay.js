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
    north: -1.410449,
    south: -1.447183,
    east: 149.674004,
    west: 149.590976,
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
   * Sets up a property descriptor to detect when svMap becomes available
   * and immediately add the Google Maps overlay. Falls back to checking
   * for existing svMap if the property is not configurable.
   * @return {void}
   */
  function watchForGoogleMaps() {
    /**
     * Adds Google Maps overlay if the map is ready and valid
     * @param {any} map - The map instance to check and overlay
     * @return {void}
     */
    function initGoogleMaps(map) {
      if (map && globalThis.google?.maps && isGoogleMap(map)) {
        addGoogleOverlay(map);
      }
    }

    try {
      Object.defineProperty(globalThis, 'svMap', {
        configurable: true,
        enumerable: true,
        get: function() {
          return this._svMap;
        },
        set: function(newMap) {
          this._svMap = newMap;
          initGoogleMaps(newMap);
        },
      });
    } catch (e) {
      // svMap may already be defined and not configurable
      initGoogleMaps(globalThis.svMap);
    }
  }

  watchForLeaflet();
  watchForGoogleMaps();
})();
