/**
 * Handles TPVirtual map overlay for Google Maps by detecting map availability
 * and adding overlay within geographical bounds.
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
   * Checks if a given map instance is a Google map
   * @param {any} map - Map instance to check
   * @return {boolean} True if map is a Google Maps instance
   */
  function isGoogleMap(map) {
    return map instanceof google.maps.Map;
  }

  /**
   * Adds image overlay to a Google Maps instance
   * @param {google.maps.Map} map - Target Google Maps instance
   * @return {void}
   */
  function addGoogleOverlay(map) {
    const bounds = {
      north: tpVirtualMap.north,
      south: tpVirtualMap.south,
      east: tpVirtualMap.east,
      west: tpVirtualMap.west,
    };

    const overlay = new google.maps.GroundOverlay(tpVirtualMap.url, bounds);

    // Store bounds for potential future reference
    Object.assign(overlay, {
      v_north: bounds.north,
      v_south: bounds.south,
      v_east: bounds.east,
      v_west: bounds.west,
      v_url: tpVirtualMap.url,
    });

    overlay.setMap(map);
  }

  /**
   * Polls for Google Maps instance availability
   * @return {void}
   */
  function watchForGoogleMaps() {
    const POLL_INTERVAL = 500;
    const MAX_ATTEMPTS = 10;
    let attempts = 0;

    /**
     * Attempts to add overlay to svMap when available
     * @return {void}
     */
    function checkMap() {
      if (globalThis.svMap &&
          globalThis.google?.maps &&
          isGoogleMap(globalThis.svMap)) {
        addGoogleOverlay(globalThis.svMap);
        return;
      }

      if (++attempts < MAX_ATTEMPTS) {
        setTimeout(checkMap, POLL_INTERVAL);
      }
    }

    checkMap();
  }

  watchForGoogleMaps();
})();
