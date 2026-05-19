import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from './config';
import { ApiError, type ApiRequestOptions } from './types';

const buildApiUrl = (path: string) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

export const apiRequest = async <TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> => {
  const { body, headers, timeoutMs = API_REQUEST_TIMEOUT_MS, ...requestOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const url = buildApiUrl(path);

  try {
    const response = await fetch(url, {
      ...requestOptions,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      signal: controller.signal,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(response.status, responseBody, 'API 요청에 실패했습니다.');
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('API 요청 시간이 초과되었습니다.', { cause: error });
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const parseResponseBody = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
