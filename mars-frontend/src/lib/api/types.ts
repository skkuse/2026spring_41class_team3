export interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, fallbackMessage: string) {
    super(getApiErrorMessage(body, fallbackMessage));
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const getApiErrorMessage = (body: unknown, fallbackMessage: string) => {
  if (isApiErrorBody(body)) {
    return body.detail ?? body.message ?? fallbackMessage;
  }

  return fallbackMessage;
};

const isApiErrorBody = (body: unknown): body is ApiErrorBody => {
  return typeof body === 'object' && body !== null;
};
