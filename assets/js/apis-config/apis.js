export async function fetchNominatim(endpoint, params) {
  let config = await fetch('http://localhost:3000/env').then((response) =>
    response.json(),
  );

  config = JSON.parse(config);

  const url = new URL(`${config.nominatimApi}${endpoint}`);
  url.search = new URLSearchParams({
    ...params,
    countrycodes: 'br',
    addressdetails: 1,
    format: 'json',
  });
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro Nominatim');
  return await response.json();
}

export async function fetchRoute(start, end) {
  let config = await fetch('http://localhost:3000/env').then((response) =>
    response.json(),
  );

  config = JSON.parse(config);

  console.log(typeof config);
  const response = await fetch(config.orsApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.orsKey,
    },
    body: JSON.stringify({
      coordinates: [
        [start.lon, start.lat],
        [end.lon, end.lat],
      ],
    }),
  });
  console.log(config);
  console.log(response);
  if (!response.ok) throw new Error('Erro OpenRouteService');
  return await response.json();
}
