import { callSiteApi } from '@/api/endpoints';

export type Formation = {
  id: string;
  title: string;
  description: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readText(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function parseFormations(payload: unknown): Formation[] {
  const entries = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.data)
      ? payload.data
      : null;

  if (!entries) throw new Error('Le catalogue reçu du serveur n’a pas le format attendu.');

  return entries.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const fields = isRecord(entry.attributes) ? { ...entry, ...entry.attributes } : entry;
    const title = readText(fields, 'title', 'titre', 'name', 'nom');
    if (!title) return [];

    return [{
      id: String(fields.documentId ?? fields.id ?? title ?? index),
      title,
      description:
        readText(fields, 'description', 'excerpt', 'resume', 'summary') ||
        'Découvrez le programme et les modalités de cette formation.',
    }];
  });
}

export async function fetchFormations(): Promise<Formation[]> {
  return parseFormations(await callSiteApi('formations', 'GET'));
}
