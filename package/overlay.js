(() => {
  const BASE_URL = document.currentScript.src.match("^[a-z-]+://.*/") ?? "";

  function getURL(path) {
    return BASE_URL + path;
  }

  const tpVirtualMap = {
    url: getURL('../assets/tpvirtual.jpg'),
    north: -1.410449,
    south: -1.447183,
    east: 149.674004,
    west: 149.590976
  };

  var initializedLeafletIds = /* @__PURE__ */ new Set();
  function addLeafletOverlay(map) {
    const id = map._leaflet_id;
    if (initializedLeafletIds.has(id)) {
      return;
    }
    initializedLeafletIds.add(id);
    const latLngBounds = [[tpVirtualMap.north, tpVirtualMap.west], [tpVirtualMap.south, tpVirtualMap.east]]
    const imageOverlay = L.imageOverlay(tpVirtualMap.url, latLngBounds);
    imageOverlay.addTo(map);
  }

  function addGoogleOverlay(map) {
    const overlay = new google.maps.GroundOverlay(tpVirtualMap.url, {
      north: tpVirtualMap.north,
      south: tpVirtualMap.south,
      east: tpVirtualMap.east,
      west: tpVirtualMap.west
    });
    overlay.v_north = tpVirtualMap.north;
    overlay.v_south = tpVirtualMap.south;
    overlay.v_east = tpVirtualMap.east;
    overlay.v_west = tpVirtualMap.west;
    overlay.v_url = tpVirtualMap.url;
    overlay.setMap(map);
  }
  
  if (globalThis.L?.Map?.addInitHook) {
    L.Map.addInitHook(function() {
      addLeafletOverlay(this);
    });
  }

  if (typeof localMap === 'object') {
    addLeafletOverlay(localMap);
  } else if (typeof svMap === 'object') {
    addGoogleOverlay(svMap);
  } else {
    const map = globalThis.pageView?.mapContext?.().map();
    if (map) {
      addLeafletOverlay(map);
    }
  }

})();
