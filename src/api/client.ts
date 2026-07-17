import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type Method,
  type RawAxiosRequestHeaders,
} from 'axios';
import type { ApiErrorBody, AuthResponse } from '../types';
import { tokenStore } from './tokenStore';

export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(Array.isArray(body.message) ? body.message.join(', ') : body.message);
  }
}

type ApiOptions = Omit<
  AxiosRequestConfig,
  'auth' | 'data' | 'url' | 'method'
> & {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
  method?: Method | string;
};

export const http = axios.create({
  baseURL: API_URL,
});

function normalizeHeaders(headers: ApiOptions['headers']) {
  return { ...(headers ?? {}) } as RawAxiosRequestHeaders;
}

function fallbackError(
  status: number,
  message = 'Request failed',
): ApiErrorBody {
  return {
    statusCode: status,
    message,
  };
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body =
      error.response?.data && typeof error.response.data === 'object'
        ? (error.response.data as ApiErrorBody)
        : fallbackError(status, error.message || 'Request failed');

    return new ApiError(status, body);
  }

  if (error instanceof Error) {
    return new ApiError(0, fallbackError(0, error.message));
  }

  return new ApiError(0, fallbackError(0));
}

async function refreshSession() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const response = await http.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    tokenStore.set(response.data);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

function clearAndNotifyUnauthorized() {
  tokenStore.clear();
  window.dispatchEvent(new Event('auth:unauthorized'));
}

export function queryString<T extends object>(values: T) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function api<T>(
  path: string,
  {
    body,
    auth = false,
    retryOnUnauthorized = true,
    headers,
    method = 'GET',
    ...config
  }: ApiOptions = {},
): Promise<T> {
  const requestHeaders = normalizeHeaders(headers);
  const token = tokenStore.getAccess();

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await http.request<T>({
      url: path,
      method,
      data: body,
      headers: requestHeaders,
      ...config,
    });

    return response.data;
  } catch (error) {
    const apiError = normalizeApiError(error);

    if (apiError.status === 401 && auth && retryOnUnauthorized) {
      const refreshed = await refreshSession();
      if (refreshed) {
        return api<T>(path, {
          body,
          auth,
          retryOnUnauthorized: false,
          headers,
          method,
          ...config,
        });
      }
    }

    if (apiError.status === 401 && auth) {
      clearAndNotifyUnauthorized();
    }

    throw apiError;
  }
}

export async function authorizedMultipart<T>(
  path: string,
  body: FormData,
  retryOnUnauthorized = true,
): Promise<T> {
  const token = tokenStore.getAccess();

  try {
    const response = await http.post<T>(path, body, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response.data;
  } catch (error) {
    const apiError = normalizeApiError(error);

    if (apiError.status === 401 && retryOnUnauthorized) {
      const refreshed = await refreshSession();
      if (refreshed) return authorizedMultipart<T>(path, body, false);
    }

    if (apiError.status === 401) {
      clearAndNotifyUnauthorized();
    }

    throw apiError;
  }
}

export function isAxiosApiError(
  error: unknown,
): error is AxiosError<ApiErrorBody> {
  return axios.isAxiosError<ApiErrorBody>(error);
}
