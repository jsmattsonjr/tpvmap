/**
 * Handles adding a TrainingPeaks Virtual map overlay to Google Maps instances.
 * Uses polling to wait for map availability and adds overlay within specified
 * geographical bounds.
 * @module googleOverlay
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
   * Checks if a given map instance is a Google map
   * @param {any} map - The map instance to check
   * @return {boolean} True if the map is a Google Maps instance
   */
  function isGoogleMap(map) {
    return map instanceof google.maps.Map;
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

  watchForGoogleMaps();
})();
