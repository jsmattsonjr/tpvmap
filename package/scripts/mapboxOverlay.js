(() => {
  const OVERLAY_SOURCE_ID = 'tp-virtual-overlay';
  const OVERLAY_LAYER_ID = 'tp-virtual-overlay-layer';

  const tpVirtualMap = {
    url: document.currentScript.dataset.overlayUrl,
    north: -1.374593,
    south: -1.482999,
    east: 149.686722,
    west: 149.578094,
  };

  /**
   * Checks if a Mapbox map instance is fully loaded and ready
   * @param {mapboxgl.Map} map - The map instance to check
   * @return {boolean} True if the map is ready to add layers
   */
  function isMapReady(map) {
    try {
      return map?.getStyle() && map.getCenter();
    } catch {
      return false;
    }
  }

  /**
   * Adds the TPVirtual overlay to a Mapbox map instance
   * @param {mapboxgl.Map} map - The map instance to add the overlay to
   */
  function addOverlayToMap(map) {
    if (!isMapReady(map)) {
      map.once('load', () => setTimeout(() => addOverlayToMap(map), 100));
      return;
    }

    map.getLayer(OVERLAY_LAYER_ID)?.remove();
    map.getSource(OVERLAY_SOURCE_ID)?.remove();

    map.addSource(OVERLAY_SOURCE_ID, {
      type: 'image',
      url: tpVirtualMap.url,
      coordinates: [
        [tpVirtualMap.west, tpVirtualMap.north],
        [tpVirtualMap.east, tpVirtualMap.north],
        [tpVirtualMap.east, tpVirtualMap.south],
        [tpVirtualMap.west, tpVirtualMap.south],
      ],
    });

    const stravaLayer = map.getStyle().layers.find((layer) =>
      layer.id.toLowerCase().includes('strava'));

    map.addLayer({
      id: OVERLAY_LAYER_ID,
      type: 'raster',
      source: OVERLAY_SOURCE_ID,
      paint: {
        'raster-opacity': 1.0,
        'raster-resampling': 'nearest',
      },
    }, stravaLayer?.id);
  }

  /**
   * Traverses a React fiber tree looking for a Mapbox map instance
   * @param {Object} fiber - The fiber node to start traversing from
   * @param {number} depth - Current traversal depth to prevent infinite
   *                         recursion
   * @return {mapboxgl.Map|null} The map instance if found, null otherwise
   */
  function traverseFiber(fiber, depth = 0) {
    if (!fiber || depth > 20) return null;

    if (fiber.memoizedProps?.map &&
        typeof fiber.memoizedProps.map === 'object') {
      return fiber.memoizedProps.map;
    }

    return (fiber.child && traverseFiber(fiber.child, depth + 1)) ||
           (fiber.sibling && traverseFiber(fiber.sibling, depth));
  }

  /**
   * Attempts to find and initialize a map instance from a container element
   * @param {HTMLElement} container - The map container element from which
   *                                  to initialize
   * @return {boolean} True if map was found and initialized
   */
  function initMapFromContainer(container) {
    const fiberKey = Object.getOwnPropertyNames(container).find((key) =>
      key.startsWith('__reactInternalInstance$') ||
      key.startsWith('__reactFiber$'));

    if (!fiberKey || !container[fiberKey]) return false;

    const mapInstance = traverseFiber(container[fiberKey]);
    if (mapInstance) {
      addOverlayToMap(mapInstance);
      return true;
    }
    return false;
  }

  // Set up observer first to avoid race condition
  const observer = new MutationObserver((mutations, observer) => {
    const mapContainer = document.querySelector('.mapboxgl-map');
    if (!mapContainer) return;

    if (initMapFromContainer(mapContainer)) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Now check for existing container - if we missed it, the observer
  // will catch it
  const existingContainer = document.querySelector('.mapboxgl-map');
  if (existingContainer) {
    initMapFromContainer(existingContainer);
  }
})();
