(() => {
  const BASE_URL = document.currentScript.src.match("^[a-z-]+://.*/") ?? "";

  function getURL(path) {
    return BASE_URL + path;
  }

  const indieVeloMap = {
    url: getURL('../assets/indievelo.jpg'),
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
    const latLngBounds = [[indieVeloMap.north, indieVeloMap.west], [indieVeloMap.south, indieVeloMap.east]]
    const imageOverlay = L.imageOverlay(indieVeloMap.url, latLngBounds);
    imageOverlay.addTo(map);
  }

  function addGoogleOverlay(map) {
    const overlay = new google.maps.GroundOverlay(indieVeloMap.url, {
      north: indieVeloMap.north,
      south: indieVeloMap.south,
      east: indieVeloMap.east,
      west: indieVeloMap.west
    });
    overlay.v_north = indieVeloMap.north;
    overlay.v_south = indieVeloMap.south;
    overlay.v_east = indieVeloMap.east;
    overlay.v_west = indieVeloMap.west;
    overlay.v_url = indieVeloMap.url;
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
