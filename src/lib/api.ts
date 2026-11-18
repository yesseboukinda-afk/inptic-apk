const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || 'https://inptic-ga.org').replace(/\/+$/, '');

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiQuery = Record<string, string | number | boolean | null | undefined>;

export type ApiRequestOptions = {
  method?: ApiMethod;
  query?: ApiQuery;
  body?: unknown;
  signal?: AbortSignal;
};

export async function requestJson<T>(
  path: string,
  { method = 'GET', query, body, signal }: ApiRequestOptions = {},
): Promise<T> {
  const url = new URL(path, `${API_BASE_URL}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  const response = await fetch(url, {
    method,
    credentials: 'include',
    cache: 'no-store',
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal,
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Le serveur a répondu avec le statut ${response.status}.`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  if (payload === null) {
    throw new Error('Le serveur a renvoyé une réponse JSON vide.');
  }

  return payload as T;
}

export function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(path, { signal });
}

export function siteUrl(path: string): string {
  return new URL(path, `${API_BASE_URL}/`).toString();
}
