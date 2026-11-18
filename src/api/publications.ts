import { callSiteApi } from '@/api/endpoints';

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  domain: string;
  abstract: string;
  doiOrUrl: string | null;
  pdfUrl: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function fetchPublications(query = ''): Promise<Publication[]> {
  const payload: unknown = await callSiteApi('publications', 'GET', {
    query: query.trim() ? { q: query.trim() } : undefined,
  });
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error('Les publications reçues du serveur n’ont pas le format attendu.');
  }

  return payload.data.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.title !== 'string') return [];
    return [{
      id: String(entry.id ?? entry.slug ?? entry.title),
      title: entry.title,
      authors: Array.isArray(entry.authors)
        ? entry.authors.filter((author): author is string => typeof author === 'string')
        : [],
      year: typeof entry.year === 'number' ? entry.year : 0,
      domain: typeof entry.domain === 'string' ? entry.domain : '',
      abstract: typeof entry.abstract === 'string' ? entry.abstract : '',
      doiOrUrl: typeof entry.doiOrUrl === 'string' ? entry.doiOrUrl : null,
      pdfUrl: typeof entry.pdfUrl === 'string' ? entry.pdfUrl : null,
    }];
  });
}
