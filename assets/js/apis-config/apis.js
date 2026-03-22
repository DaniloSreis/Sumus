import { apiRequest } from './http-client.js';

let envConfigPromise = null;

const DEFAULT_NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const DEFAULT_ENV_CONFIG = {
  nominatimApi: DEFAULT_NOMINATIM_API,
  orsApi: '',
  orsKey: '',
};

function normalizeBaseUrl(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmedValue = value.trim();
  if (!trimmedValue) return fallback;
  return trimmedValue.replace(/\/+$/, '');
}

async function getEnvConfig() {
  if (!envConfigPromise) {
    envConfigPromise = apiRequest('http://localhost:3000/env', {
      expectEnvelope: false,
    })
      .then(({ data }) => {
        let parsedConfig = data;
        if (typeof data === 'string') {
          try {
            parsedConfig = JSON.parse(data);
          } catch (error) {
            console.warn(
              '[getEnvConfig] /env retornou string inválida. Usando fallback.',
              error
            );
            parsedConfig = {};
          }
        }

        if (!parsedConfig || typeof parsedConfig !== 'object') {
          console.warn(
            '[getEnvConfig] /env inválido (não é objeto). Usando fallback.'
          );
          parsedConfig = {};
        }

        return {
          ...DEFAULT_ENV_CONFIG,
          ...parsedConfig,
          nominatimApi: normalizeBaseUrl(
            parsedConfig.nominatimApi,
            DEFAULT_NOMINATIM_API
          ),
        };
      })
      .catch((error) => {
        console.error('[getEnvConfig] Falha ao carregar /env. Usando fallback.', error);
        envConfigPromise = null;
        return { ...DEFAULT_ENV_CONFIG };
      });
  }

  try {
    const config = await envConfigPromise;
    return config && typeof config === 'object'
      ? config
      : { ...DEFAULT_ENV_CONFIG };
  } catch (error) {
    console.error('[getEnvConfig] Erro inesperado. Usando fallback.', error);
    envConfigPromise = null;
    return { ...DEFAULT_ENV_CONFIG };
  }
}

export async function fetchNominatim(endpoint, params) {
  try {
    const safeEndpoint = typeof endpoint === 'string' ? endpoint.trim() : '';
    if (!safeEndpoint) {
      console.error('[fetchNominatim] endpoint ausente ou inválido.', { endpoint });
      return [];
    }

    const config = await getEnvConfig();
    const baseUrl = normalizeBaseUrl(config?.nominatimApi, DEFAULT_NOMINATIM_API);
    const endpointPath = safeEndpoint.startsWith('/')
      ? safeEndpoint
      : `/${safeEndpoint}`;

    let url;
    try {
      url = new URL(endpointPath, `${baseUrl}/`);
    } catch (error) {
      console.error('[fetchNominatim] URL inválida. Usando fallback padrão.', {
        baseUrl,
        endpoint: endpointPath,
        error,
      });
      url = new URL(endpointPath, `${DEFAULT_NOMINATIM_API}/`);
    }

    url.search = new URLSearchParams({
      ...(params || {}),
      countrycodes: 'br',
      addressdetails: 1,
      format: 'json',
    });

    const { data } = await apiRequest(url.toString(), {
      expectEnvelope: false,
    });

    return data ?? [];
  } catch (error) {
    console.error('[fetchNominatim] Falha ao buscar dados no Nominatim.', {
      endpoint,
      params,
      error,
    });
    return [];
  }
}

export async function fetchRoute(start, end) {
  try {
    const config = await getEnvConfig();
    if (!config?.orsApi) {
      console.error('[fetchRoute] orsApi ausente no /env.');
      return null;
    }

    const { data } = await apiRequest(config.orsApi, {
      method: 'POST',
      headers: {
        Authorization: config.orsKey,
      },
      data: {
        coordinates: [
          [start.lon, start.lat],
          [end.lon, end.lat],
        ],
      },
      expectEnvelope: false,
    });

    return data ?? null;
  } catch (error) {
    console.error('[fetchRoute] Falha ao buscar rota.', { start, end, error });
    return null;
  }
}
