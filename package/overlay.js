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
   * Initializes Leaflet overlay functionality once Leaflet is loaded.
   * Sets up the init hook and attempts to add overlay to existing maps.
   * @return {void}
   */
  function initializeLeaflet() {
    L.Map.addInitHook(function() {
      addLeafletOverlay(this);
    });

    if (globalThis?.localMap && isLeafletMap(localMap)) {
      addLeafletOverlay(localMap);
    } else {
      const map = globalThis.pageView?.mapContext?.().map();
      if (map) {
        addLeafletOverlay(map);
      }
    }
  }

  /**
   * Polls for the availability of Leaflet with exponential backoff.
   * Once Leaflet is available, initializes the overlay functionality.
   *
   * @param {number} [retries=20] - Remaining polling attempts
   * @param {number} [delay=300] - Delay between polling attempts,
   * in milliseconds; increases by 50% with each retry
   * @return {void}
   */
  function pollForLeaflet(retries = 20, delay = 300) {
    if (globalThis.L?.Map) {
      initializeLeaflet();
      return;
    }
    if (retries > 0) {
      setTimeout(() => {
        pollForLeaflet(retries - 1, delay * 1.5);
      }, delay);
    }
  }

  /**
   * Polls for the availability of the global svMap instance with
   * exponential backoff. Once the map is available and confirmed
   * to be a Google Maps instance, adds the overlay.
   *
   * @param {number} [retries=10] - Remaining polling attempts
   * @param {number} [delay=100] - Delay between polling attempts,
   * in milliseconds; increases by 50% with each retry
   * @return {void}
   */
  function pollForSVMap(retries = 10, delay = 100) {
    if (globalThis?.svMap && isGoogleMap(svMap)) {
      addGoogleOverlay(svMap);
      return;
    }
    if (retries > 0) {
      setTimeout(() => {
        pollForSVMap(retries - 1, delay * 1.5);
      }, delay);
    }
  }

  // Start polling for both map types
  pollForLeaflet();
  if (globalThis.google?.maps) {
    pollForSVMap();
  }
})();
