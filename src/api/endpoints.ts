import { API_BASE_URL, requestJson, type ApiMethod, type ApiRequestOptions } from '@/lib/api';

type EndpointDefinition = {
  path: string;
  methods: readonly ApiMethod[];
};

export const API_ENDPOINTS = {
  alumni: { path: '/api/alumni', methods: ['GET', 'POST', 'PUT'] },
  authAccountEmail: { path: '/api/auth/account/email', methods: ['POST'] },
  authAccountPassword: { path: '/api/auth/account/password', methods: ['POST'] },
  authLogin: { path: '/api/auth/login', methods: ['POST'] },
  authLogout: { path: '/api/auth/logout', methods: ['POST'] },
  authOAuth: { path: '/api/auth/oauth', methods: ['GET'] },
  authOAuthCallback: { path: '/api/auth/oauth/callback', methods: ['GET'] },
  authForgotPassword: { path: '/api/auth/password/forgot', methods: ['POST'] },
  authResetPassword: { path: '/api/auth/password/reset', methods: ['POST'] },
  authSession: { path: '/api/auth/session', methods: ['GET'] },
  authSignup: { path: '/api/auth/signup', methods: ['POST'] },
  authVerifyEmail: { path: '/api/auth/verify-email', methods: ['GET'] },
  candidateLogin: { path: '/api/candidat/login', methods: ['POST'] },
  candidateProfile: { path: '/api/candidat/profile', methods: ['GET', 'POST'] },
  candidateDocumentUrl: { path: '/api/candidat/profile/document-url', methods: ['GET', 'POST'] },
  chat: { path: '/api/chat', methods: ['POST'] },
  chatDocuments: { path: '/api/chat/documents', methods: ['GET'] },
  chatHistory: { path: '/api/chat/history', methods: ['GET'] },
  chatImages: { path: '/api/chat/images', methods: ['GET'] },
  chatSpeech: { path: '/api/chat/speech', methods: ['POST'] },
  chatTranscribe: { path: '/api/chat/transcribe', methods: ['POST'] },
  clubApplications: { path: '/api/clubs/applications', methods: ['POST'] },
  clubLikes: { path: '/api/clubs/likes', methods: ['GET', 'POST'] },
  clubMembers: { path: '/api/clubs/members', methods: ['GET'] },
  clubNews: { path: '/api/clubs/news', methods: ['GET'] },
  concours: { path: '/api/concours', methods: ['GET'] },
  concoursPreinscriptions: { path: '/api/concours/preinscriptions', methods: ['POST'] },
  directorMessage: { path: '/api/director-message', methods: ['GET'] },
  formations: { path: '/api/formations', methods: ['GET'] },
  homeAgenda: { path: '/api/home-agenda', methods: ['GET'] },
  libraryCover: { path: '/api/library/cover', methods: ['GET'] },
  libraryFile: { path: '/api/library/file', methods: ['GET'] },
  libraryInteractions: { path: '/api/library/interactions', methods: ['POST'] },
  mobileLibraryBooks: { path: '/api/library/mobile/books', methods: ['GET'] },
  mobileLibrarySearch: { path: '/api/library/mobile/search', methods: ['GET'] },
  mobileLibraryStats: { path: '/api/library/mobile/stats', methods: ['GET'] },
  myBooks: { path: '/api/library/my-books', methods: ['DELETE', 'GET'] },
  libraryProfile: { path: '/api/library/profile', methods: ['GET', 'POST'] },
  libraryAvatar: { path: '/api/library/profile/avatar', methods: ['GET'] },
  librarySuggestions: { path: '/api/library/suggestions', methods: ['GET'] },
  news: { path: '/api/news', methods: ['GET'] },
  newsEngagement: { path: '/api/news/engagement', methods: ['GET', 'POST'] },
  newsletter: { path: '/api/newsletter', methods: ['POST'] },
  newsletterUnsubscribe: { path: '/api/newsletter/unsubscribe', methods: ['GET', 'POST'] },
  paymentCreate: { path: '/api/payment/create', methods: ['POST'] },
  paymentStatus: { path: '/api/payment/status', methods: ['GET'] },
  publications: { path: '/api/publications', methods: ['GET'] },
  search: { path: '/api/search', methods: ['GET'] },
  siteContent: { path: '/api/site-content', methods: ['GET'] },
  siteMediaAsset: { path: '/api/site-content/media/[...asset]', methods: ['GET'] },
  storageAsset: { path: '/api/storage/[...segments]', methods: ['GET'] },
  techVeille: { path: '/api/tech-veille', methods: ['GET'] },
  translate: { path: '/api/translate', methods: ['POST'] },
  latestVideo: { path: '/api/youtube/latest-video', methods: ['GET'] },
} as const satisfies Record<string, EndpointDefinition>;

export type ApiEndpoint = keyof typeof API_ENDPOINTS;
export type ApiEndpointMethod<Endpoint extends ApiEndpoint> =
  (typeof API_ENDPOINTS)[Endpoint]['methods'][number];

export type SiteApiOptions = Omit<ApiRequestOptions, 'method'> & {
  pathParams?: Record<string, string | string[]>;
};

function resolveEndpointPath(
  template: string,
  pathParams: SiteApiOptions['pathParams'] = {},
): string {
  return template.replace(/:([a-zA-Z][\w]*)|\[\.\.\.([^\]]+)\]/g, (placeholder, key: string | undefined, restKey: string | undefined) => {
    const name = key ?? restKey;
    const value = name ? pathParams[name] : undefined;
    if (value === undefined) throw new Error(`Paramètre d’URL manquant : ${name}.`);

    const segments = Array.isArray(value)
      ? value
      : restKey
        ? value.split('/').filter(Boolean)
        : [value];
    if (segments.length === 0) throw new Error(`Paramètre d’URL vide : ${name}.`);
    return segments.map(encodeURIComponent).join('/');
  });
}

export function siteApiUrl<Endpoint extends ApiEndpoint>(
  endpoint: Endpoint,
  options: Pick<SiteApiOptions, 'pathParams' | 'query'> = {},
): string {
  const definition = API_ENDPOINTS[endpoint];
  const url = new URL(resolveEndpointPath(definition.path, options.pathParams), `${API_BASE_URL}/`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (['admin', 'manage'].includes(key.toLowerCase())) {
      throw new Error('Les options de gestion ne sont pas disponibles dans l’application publique.');
    }
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function callSiteApi<Endpoint extends ApiEndpoint, Response = unknown>(
  endpoint: Endpoint,
  method: ApiEndpointMethod<Endpoint>,
  options: SiteApiOptions = {},
): Promise<Response> {
  const definition = API_ENDPOINTS[endpoint];
  const allowedMethods: readonly string[] = definition.methods;
  if (!allowedMethods.includes(method)) {
    throw new Error(`${method} n’est pas pris en charge par l’API ${endpoint}.`);
  }

  const url = siteApiUrl(endpoint, options);
  const { pathParams: _pathParams, query: _query, ...requestOptions } = options;
  return requestJson<Response>(url, { ...requestOptions, method });
}
