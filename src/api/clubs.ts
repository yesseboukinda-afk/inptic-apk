import { callSiteApi } from '@/api/endpoints';

export type Club = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  subclubs: { slug: string; name: string; description: string }[];
  likes: number;
  liked: boolean;
  rank: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function fetchClubs(): Promise<Club[]> {
  const payload: unknown = await callSiteApi('clubLikes', 'GET');
  if (!isRecord(payload) || !Array.isArray(payload.clubs)) {
    throw new Error('La liste des clubs reçue du serveur n’a pas le format attendu.');
  }

  return payload.clubs.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.slug !== 'string' || typeof entry.name !== 'string') return [];
    const subclubs = Array.isArray(entry.subclubs)
      ? entry.subclubs.flatMap((subclub) => (
        isRecord(subclub) && typeof subclub.name === 'string'
          ? [{ slug: String(subclub.slug ?? ''), name: subclub.name, description: String(subclub.description ?? '') }]
          : []
      ))
      : [];
    return [{
      slug: entry.slug,
      name: entry.name,
      description: typeof entry.description === 'string' ? entry.description : '',
      icon: typeof entry.icon === 'string' ? entry.icon : '',
      subclubs,
      likes: typeof entry.likes === 'number' ? entry.likes : 0,
      liked: entry.liked === true,
      rank: typeof entry.rank === 'number' ? entry.rank : 0,
    }];
  });
}

export async function toggleClubLike(clubSlug: string): Promise<void> {
  await callSiteApi('clubLikes', 'POST', { body: { clubSlug } });
}
