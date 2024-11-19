/**
 * Handles TPVirtual map overlay for Mapbox by detecting map availability and
 * adding overlay within geographical bounds.
 */
(() => {
  const OVERLAY_SOURCE_ID = 'tp-virtual-overlay';
  const OVERLAY_LAYER_ID = 'tp-virtual-overlay-layer';

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
   * Checks if a Mapbox map instance is ready for layer operations
   * @param {mapboxgl.Map} map - Map instance to check
   * @return {boolean} True if map is ready for layer operations
   */
  function isMapReady(map) {
    try {
      return map?.getStyle() && map.getCenter();
    } catch {
      return false;
    }
  }

  /**
   * Adds TPVirtual overlay to a Mapbox map instance
   * @param {mapboxgl.Map} map - Target Mapbox map instance
   * @return {void}
   */
  function addOverlayToMap(map) {
    if (!isMapReady(map)) {
      map.once('load', () => setTimeout(() => addOverlayToMap(map), 100));
      return;
    }

    // Remove existing overlay if present
    map.getLayer(OVERLAY_LAYER_ID)?.remove();
    map.getSource(OVERLAY_SOURCE_ID)?.remove();

    const coordinates = [
      [tpVirtualMap.west, tpVirtualMap.north],
      [tpVirtualMap.east, tpVirtualMap.north],
      [tpVirtualMap.east, tpVirtualMap.south],
      [tpVirtualMap.west, tpVirtualMap.south],
    ];

    map.addSource(OVERLAY_SOURCE_ID, {
      type: 'image',
      url: tpVirtualMap.url,
      coordinates,
    });

    const stravaLayer = map.getStyle().layers
      .find(layer => layer.id.toLowerCase().includes('strava'));

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
   * Traverses React fiber tree searching for Mapbox map instance
   * @param {Object} fiber - Starting fiber node
   * @param {number} depth - Current traversal depth
   * @return {mapboxgl.Map|null} Map instance if found, null otherwise
   */
  function traverseFiber(fiber, depth = 0) {
    if (!fiber || depth > 20) return null;

    if (fiber.memoizedProps?.map &&
        typeof fiber.memoizedProps.map === 'object') {
      return fiber.memoizedProps.map;
    }

    return traverseFiber(fiber.child, depth + 1) ||
           traverseFiber(fiber.sibling, depth);
  }

  /**
   * Attempts to find and initialize map instance from container element
   * @param {HTMLElement} container - Map container element
   * @return {boolean} True if map was found and initialized
   */
  function initMapFromContainer(container) {
    const fiberKey = Object.keys(container)
      .find(key => key.startsWith('__reactInternalInstance$') ||
                   key.startsWith('__reactFiber$'));

    if (!fiberKey || !container[fiberKey]) return false;

    const mapInstance = traverseFiber(container[fiberKey]);
    if (mapInstance) {
      addOverlayToMap(mapInstance);
      return true;
    }
    return false;
  }

  // Set up observer to detect map container
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

  // Check for existing container
  const existingContainer = document.querySelector('.mapboxgl-map');
  if (existingContainer) {
    initMapFromContainer(existingContainer);
  }
})();
