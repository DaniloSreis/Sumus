import { fetchNominatim, fetchRoute } from '../apis-config/apis.js';

function debounce(fun, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => fun(), delay);
  };
}

export async function initMap() {


  // Namespace
    let mainMap = null
    let markerStart = null
    let markerEnd = null
    let routeLayer = null
    let userAddress = null

  // Namespace
    let inputLocation = document.getElementById('location')
    let inputDestination = document.getElementById('destination')
    let requestRideBtn = document.getElementById('request-btn')
    let errorMessage = document.getElementById('error-message')

  // Pega as coordernadas
  function getCoords() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
      );
    });
  }

  // Renderiza o mapa
  function renderMap(lat, lon) {
    ((lat = -23.6863278), (lon = -46.617006));
    mainMap = L.map('map').setView([lat, lon], 16);
    mainMap.zoomControl.setPosition('bottomright');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(mainMap);

    updateMarkers({ lat, lon }, null);
  }

  // Atualizar os pontos de localização
  function updateMarkers(start, end) {
    if (markerStart) {
      markerStart.setLatLng([start.lat, start.lon]);
    } else {
      markerStart = L.marker([start.lat, start.lon]).addTo(
        mainMap,
      );
    }
    if (!end) return;
    if (markerEnd) {
      markerEnd.setLatLng([end.lat, end.lon]);
    } else {
      markerEnd = L.marker([end.lat, end.lon]).addTo(mainMap);
    }
  }

  // Procura por uma rota
  async function searchRoute() {
    const destQuery = inputDestination.value;
    const locQuery = inputLocation.value;
    // ao fazer essa verificação evitamos que getCoords() gaste a bateria do usuário e o
    // fetchApi gaste os dados de internet e as cotas na API quando o input de destino
    // estiver vazio e o usuário clicar no botão de solicitar corrida
    if (!destQuery || !locQuery) return;

    let start, end;
    console.log(locQuery, userAddress)
    if (locQuery !== userAddress) {
      const res = await fetchNominatim('/search', { q: locQuery, limit: 1 });
      if (!res.length) return;
      start = { lat: -23.6863278, lon: -46.617006 };
    } else {
      start = await getCoords();
    }
    start = { lat: -23.6863278, lon: -46.617006 };

    const resDest = await fetchNominatim('/search', { q: destQuery, limit: 1 });
    if (!resDest.length) return;
    end = { lat: parseFloat(resDest[0].lat), lon: parseFloat(resDest[0].lon) };

    updateMarkers(start, end);
    drawRoute(await fetchRoute(start, end));
  }

  // Desenha a rota
  function drawRoute(geoJsonData) {

    if (routeLayer) mainMap.removeLayer(routeLayer);

    routeLayer = L.geoJSON(geoJsonData, {
      style: { color: '#3b82f6', weight: 6, opacity: 0.8 },
    }).addTo(mainMap);
    // getBounds() pega os limites geográficos de norte a sul da rota e retorna
    // um objeto com a latitude e longitude do ponto de partida e destino.
    // fitBounds() defini uma visualização os limites geográficos passados
    mainMap.fitBounds(routeLayer.getBounds());
  }

  // Solicita uma corrida
  function requestRide(e) {
    e.preventDefault();
    const selectedCar = document.querySelector(
      "input[name='car-type']:checked",
    );
    console.log(selectedCar);
    if (!selectedCar) {
      errorMessage.textContent =
        'Por favor, selecione um veículo antes de continuar';
      errorMessage.style.display = 'block';
      return;
    }
    console.log('oi');
    errorMessage.style.display = 'none';
  }

  // Inicializa o código
  try {
    const coords = await getCoords();
    renderMap(coords.lat, coords.lon);

    const data = await fetchNominatim('/reverse', {
      lat: -23.6863278,
      lon: -46.617006,
    });

    console.log(data)

    const { road, house_number, suburb } = data.address;
    userAddress = `${road}, ${house_number} - ${suburb}`;
    inputLocation.value = userAddress;
  } catch (error) {
    console.error('Erro ao obter a localização:', error);
  }

  const debounceSearch = debounce(searchRoute, 1000);
  inputDestination.addEventListener('input', debounceSearch);
  inputLocation.addEventListener('input', debounceSearch);
  requestRideBtn.addEventListener('click', requestRide);
}
