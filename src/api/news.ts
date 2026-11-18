import { callSiteApi } from '@/api/endpoints';
import { siteUrl } from '@/lib/api';

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  date: string;
};

export type PublicNewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  category: string;
  date: string;
  attachments: { name: string; url: string; type: string }[];
};

function parseNews(payload: unknown): NewsItem[] {
  if (!payload || typeof payload !== 'object' || !('items' in payload) ||
      !Array.isArray(payload.items)) {
    throw new Error('Le flux d’actualités reçu du serveur n’a pas le format attendu.');
  }

  return payload.items.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>;
    if (typeof value.title !== 'string' || typeof value.url !== 'string') return [];
    return [{
      id: String(value.id ?? value.url ?? index),
      title: value.title,
      summary: typeof value.summary === 'string' ? value.summary : '',
      url: value.url,
      source: typeof value.source === 'string' ? value.source : 'INPTIC',
      date: typeof value.date === 'string' ? value.date : '',
    }];
  });
}

export async function fetchNews(): Promise<NewsItem[]> {
  return parseNews(await callSiteApi('techVeille', 'GET'));
}

export async function fetchPublicNews(target: 'actualites' | 'annonces' = 'actualites'): Promise<PublicNewsItem[]> {
  const payload: unknown = await callSiteApi('news', 'GET', { query: { target } });
  if (!payload || typeof payload !== 'object' || !('data' in payload) || !Array.isArray(payload.data)) {
    throw new Error('Les actualités de l’institut reçues du serveur n’ont pas le format attendu.');
  }

  return payload.data.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') return [];
    const raw = entry as Record<string, unknown>;
    const fields = raw.attributes && typeof raw.attributes === 'object'
      ? { ...raw, ...raw.attributes as Record<string, unknown> }
      : raw;
    if (typeof fields.title !== 'string') return [];
    const slug = typeof fields.slug === 'string' ? fields.slug : '';
    const attachments = Array.isArray(fields.attachments)
      ? fields.attachments.flatMap((attachment) => {
        if (!attachment || typeof attachment !== 'object') return [];
        const file = attachment as Record<string, unknown>;
        if (typeof file.url !== 'string') return [];
        return [{
          name: typeof file.name === 'string' ? file.name : 'Document',
          url: siteUrl(file.url),
          type: typeof file.type === 'string' ? file.type : '',
        }];
      })
      : [];
    return [{
      id: String(fields.id ?? fields.documentId ?? slug ?? index),
      title: fields.title,
      summary: typeof fields.excerpt === 'string' ? fields.excerpt : '',
      url: siteUrl(slug
        ? target === 'annonces'
          ? `/annonces#${encodeURIComponent(slug)}`
          : `/actualites/${encodeURIComponent(slug)}`
        : target === 'annonces' ? '/annonces' : '/actualites'),
      category: typeof fields.category === 'string' ? fields.category : 'INPTIC',
      date: typeof fields.publishedAt === 'string'
        ? fields.publishedAt
        : typeof fields.published_at === 'string'
          ? fields.published_at
          : '',
      attachments,
    }];
  });
}
