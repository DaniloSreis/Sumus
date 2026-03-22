function hasApiEnvelope(payload) {
  return (
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'success') &&
    Object.prototype.hasOwnProperty.call(payload, 'data') &&
    Object.prototype.hasOwnProperty.call(payload, 'message')
  );
}

function normalizeApiEnvelope(payload, fallbackSuccess, fallbackMessage) {
  if (hasApiEnvelope(payload)) {
    return {
      success: Boolean(payload.success),
      data: payload.data,
      message: typeof payload.message === 'string' ? payload.message : '',
    };
  }

  return {
    success: fallbackSuccess,
    data: payload,
    message: fallbackMessage || '',
  };
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export class ApiRequestError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = details.status || 0;
    this.response = details.response || null;
  }
}

export async function apiRequest(url, options = {}) {
  const {
    method = 'GET',
    data,
    headers = {},
    isUpload = false,
    expectEnvelope = true,
  } = options;

  const requestHeaders = { ...headers };
  const requestConfig = {
    method,
    headers: requestHeaders,
  };

  if (data !== undefined) {
    if (isUpload) {
      requestConfig.body = data;
    } else {
      requestHeaders['Content-Type'] = 'application/json';
      requestConfig.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, requestConfig);
    const parsedBody = await parseResponseBody(response);
    const fallbackMessage = response.ok
      ? ''
      : `Erro HTTP ${response.status} ${response.statusText}`.trim();

    const normalized = expectEnvelope
      ? normalizeApiEnvelope(parsedBody, response.ok, fallbackMessage)
      : {
          success: response.ok,
          data: parsedBody,
          message: fallbackMessage,
        };

    if (!response.ok || !normalized.success) {
      throw new ApiRequestError(
        normalized.message || 'Falha na requisição da API',
        {
          status: response.status,
          response: normalized,
        },
      );
    }

    return normalized;
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw new ApiRequestError('Erro de conexão com a API');
  }
}
