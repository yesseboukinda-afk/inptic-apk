import { callSiteApi } from '@/api/endpoints';

export type LibraryBook = {
  id: string;
  titre: string;
  auteur: string | null;
  categorie: string | null;
  langue: string | null;
  description: string | null;
  couverture_url: string | null;
  pdf_url: string | null;
  telechargements: number;
  date_ajout: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseBooks(payload: unknown): LibraryBook[] {
  if (!Array.isArray(payload)) {
    throw new Error('Le catalogue de la bibliothèque reçu du serveur n’a pas le format attendu.');
  }

  return payload.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.titre !== 'string') return [];
    return [{
      id: entry.id,
      titre: entry.titre,
      auteur: typeof entry.auteur === 'string' ? entry.auteur : null,
      categorie: typeof entry.categorie === 'string' ? entry.categorie : null,
      langue: typeof entry.langue === 'string' ? entry.langue : null,
      description: typeof entry.description === 'string' ? entry.description : null,
      couverture_url: typeof entry.couverture_url === 'string' ? entry.couverture_url : null,
      pdf_url: typeof entry.pdf_url === 'string' ? entry.pdf_url : null,
      telechargements: typeof entry.telechargements === 'number' ? entry.telechargements : 0,
      date_ajout: typeof entry.date_ajout === 'string' ? entry.date_ajout : '',
    }];
  });
}

export async function fetchLibraryBooks(query = ''): Promise<LibraryBook[]> {
  const search = query.trim();
  const payload = search
    ? await callSiteApi('mobileLibrarySearch', 'GET', { query: { q: search } })
    : await callSiteApi('mobileLibraryBooks', 'GET', { query: { limit: 50 } });
  return parseBooks(payload);
}

export async function fetchLibraryStats(): Promise<number> {
  const payload: unknown = await callSiteApi('mobileLibraryStats', 'GET');
  if (!isRecord(payload) || typeof payload.total !== 'number') {
    throw new Error('Les statistiques de la bibliothèque reçues du serveur n’ont pas le format attendu.');
  }
  return payload.total;
}
