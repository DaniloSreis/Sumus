import { fetchNominatim, fetchRoute } from '../apis-config/apis.js';

function debounce(fun, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => fun(), delay);
  };
}

export async function initMap() {
  let mainMap = null;
  let markerStart = null;
  let markerEnd = null;
  let routeLayer = null;
  let userAddress = null;

  const DEFAULT_LOCATION = {
    lat: -23.55052,
    lon: -46.633308,
    label: 'São Paulo, SP',
  };

  const inputLocation = document.getElementById('location');
  const inputDestination = document.getElementById('destination');
  const requestRideBtn = document.getElementById('request-btn');
  const errorMessage = document.getElementById('error-message');

  function normalizeAddress(text) {
    return text.trim().toLowerCase();
  }

  function getCoords() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        (err) => reject(err)
      );
    });
  }

  function renderMap(lat, lon) {
    mainMap = L.map('map').setView([lat, lon], 16);
    mainMap.zoomControl.setPosition('bottomright');

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(mainMap);

    updateMarkers({ lat, lon }, null);
  }

  function updateMarkers(start, end) {
    if (markerStart) {
      markerStart.setLatLng([start.lat, start.lon]);
    } else {
      markerStart = L.marker([start.lat, start.lon]).addTo(mainMap);
    }

    if (!end) return;

    if (markerEnd) {
      markerEnd.setLatLng([end.lat, end.lon]);
    } else {
      markerEnd = L.marker([end.lat, end.lon]).addTo(mainMap);
    }
  }

  async function getStartCoords(locQuery) {
    if (normalizeAddress(locQuery) === normalizeAddress(userAddress || '')) {
      try {
        return await getCoords();
      } catch (error) {
        console.warn('Geolocalização negada ou indisponível. Usando São Paulo como padrão.');
        return {
          lat: DEFAULT_LOCATION.lat,
          lon: DEFAULT_LOCATION.lon,
        };
      }
    }

    const resStart = await fetchNominatim('/search', {
      q: locQuery,
      limit: 1,
    });

    if (!resStart.length) return null;

    return {
      lat: parseFloat(resStart[0].lat),
      lon: parseFloat(resStart[0].lon),
    };
  }

  async function searchRoute() {
    const destQuery = inputDestination.value.trim();
    const locQuery = inputLocation.value.trim();

    if (!destQuery || !locQuery) return;

    try {
      const start = await getStartCoords(locQuery);
      if (!start) return;

      const resDest = await fetchNominatim('/search', {
        q: destQuery,
        limit: 1,
      });

      if (!resDest.length) return;

      const end = {
        lat: parseFloat(resDest[0].lat),
        lon: parseFloat(resDest[0].lon),
      };

      updateMarkers(start, end);

      const routeData = await fetchRoute(start, end);
      drawRoute(routeData);
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
    }
  }

  function drawRoute(geoJsonData) {
    if (routeLayer) {
      mainMap.removeLayer(routeLayer);
    }

    routeLayer = L.geoJSON(geoJsonData, {
      style: { color: '#3b82f6', weight: 6, opacity: 0.8 },
    }).addTo(mainMap);

    mainMap.fitBounds(routeLayer.getBounds());
  }

  function requestRide(e) {
    e.preventDefault();

    const selectedCar = document.querySelector(
      "input[name='car-type']:checked"
    );

    if (!selectedCar) {
      errorMessage.textContent =
        'Por favor, selecione um veículo antes de continuar';
      errorMessage.style.display = 'block';
      return;
    }

    errorMessage.style.display = 'none';
    console.log('Corrida solicitada com sucesso');
  }

  try {
    const coords = await getCoords();
    renderMap(coords.lat, coords.lon);

    const data = await fetchNominatim('/reverse', {
      lat: coords.lat,
      lon: coords.lon,
    });

    const address = data.address || {};
    const road = address.road || address.pedestrian || address.residential || '';
    const houseNumber = address.house_number || '';
    const suburb =
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      '';

    userAddress = [road, houseNumber].filter(Boolean).join(', ');
    if (suburb) {
      userAddress += ` - ${suburb}`;
    }

    inputLocation.value = userAddress || DEFAULT_LOCATION.label;
  } catch (error) {
    console.warn('Erro ao obter localização do usuário. Iniciando mapa em São Paulo.', error);

    renderMap(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    userAddress = DEFAULT_LOCATION.label;
    inputLocation.value = DEFAULT_LOCATION.label;
  }

  const debounceSearch = debounce(searchRoute, 1000);
  inputDestination.addEventListener('input', debounceSearch);
  inputLocation.addEventListener('input', debounceSearch);
  requestRideBtn.addEventListener('click', requestRide);
}