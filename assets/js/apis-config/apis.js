// Dotenv initialization
import dotenv from "dotenv";
dotenv.config()

// TODO: Add default values if dotenv variables is null
// Example: foo: process.env.FOO || null

// Namespace
const config = {
  nominatim_api: process.env.NOMINATIM_API,
  ors_api: process.env.ORS_API,
  ors_key: process.env.ORS_KEY,
  country: process.env.COUNTRY,
};

export async function fetchNominatim(endpoint, params) {
  const url = new URL(`${config.nominatim_api}${endpoint}`);
  url.search = new URLSearchParams({
    ...params,
    countrycodes: "br",
    addressdetails: 1,
    format: 'json',
    
  });
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro Nominatim');
  return await response.json();
}

export async function fetchRoute(start, end) {
  const response = await fetch(config.ors_api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.ors_key,
    },
    body: JSON.stringify({
      coordinates: [
        [start.lon, start.lat],
        [end.lon, end.lat],
      ],
    }),
  });
  if (!response.ok) throw new Error('Erro OpenRouteService');
  return await response.json();
}
