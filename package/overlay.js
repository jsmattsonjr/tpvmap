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
    const latLngBounds = [[tpVirtualMap.north, tpVirtualMap.west], [tpVirtualMap.south, tpVirtualMap.east]];
    const options = {zIndex: 0.1};
    const imageOverlay = L.imageOverlay(tpVirtualMap.url,
                                        latLngBounds, options);
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
  
  function isLeafletMap(map) {
    return map instanceof L.Map;
  }

  function isGoogleMap(map) {
    return map instanceof google.maps.Map;
  }

  // Leaflet maps
  if (globalThis.L?.Map) {

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

  // Google maps
  if (globalThis.google?.maps) {
    if (globalThis?.svMap && isGoogleMap(svMap)) {
      addGoogleOverlay(svMap);
    }
  }

})();
