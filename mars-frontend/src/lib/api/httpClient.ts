import { API_BASE_URL, API_REQUEST_TIMEOUT_MS } from './config';
import { ApiError, type ApiRequestOptions } from './types';
import { getStoredUserUuid } from '../authCookie';

const buildApiUrl = (path: string) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

export const apiRequest = async <TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> => {
  const { body, headers, method = 'GET', timeoutMs = API_REQUEST_TIMEOUT_MS, ...requestOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const url = buildApiUrl(path);

  console.log('[API][Request]', {
    method,
    path,
    url,
  });

  try {
    const response = await fetch(url, {
      ...requestOptions,
      method,
      body: body === undefined ? undefined : JSON.stringify(withStoredUserUuid(path, body)),
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      signal: controller.signal,
    });

    const responseBody = await parseResponseBody(response);

    console.log(response.ok ? '[API][Response:OK]' : '[API][Response:Error]', {
      method,
      path,
      status: response.status,
      body: responseBody,
    });

    if (!response.ok) {
      throw new ApiError(response.status, responseBody, 'API 요청에 실패했습니다.');
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('[API][Request:Failed]', {
        method,
        path,
        reason: 'timeout',
        timeoutMs,
      });
      throw new Error('API 요청 시간이 초과되었습니다.', { cause: error });
    }

    if (!(error instanceof ApiError)) {
      console.error('[API][Request:Failed]', {
        method,
        path,
        reason: 'network',
        error,
      });
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const withStoredUserUuid = (path: string, body: unknown) => {
  if (!isPlainObject(body) || !shouldAttachUserUuid(path, body)) {
    return body;
  }

  const userUuid = getStoredUserUuid();

  if (!userUuid) {
    return body;
  }

  return {
    ...body,
    user_id: userUuid,
  };
};

const shouldAttachUserUuid = (path: string, body: Record<string, unknown>) => {
  if (path.startsWith('/users/')) {
    return false;
  }

  return !('user_id' in body) && !('user_uuid' in body) && !('owner_user_id' in body);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
