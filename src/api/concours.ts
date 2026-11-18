import { callSiteApi } from '@/api/endpoints';

export type ConcoursItem = {
  id: string;
  title: string;
  slug: string;
  department: string;
  sessionYear: number;
  status: string;
  description: string;
  conditions: string[];
  examDate: string | null;
  registrationEnd: string | null;
  resultPdf: string | null;
  attachments: { name: string; url: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseConcours(payload: unknown): ConcoursItem[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error('Les concours reçus du serveur n’ont pas le format attendu.');
  }

  return payload.data.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.title !== 'string' || typeof entry.slug !== 'string') return [];
    const calendar = isRecord(entry.calendar) ? entry.calendar : {};
    const results = isRecord(entry.results) ? entry.results : {};
    const attachments = Array.isArray(entry.attachments)
      ? entry.attachments.flatMap((item) => (
        isRecord(item) && typeof item.name === 'string' && typeof item.url === 'string'
          ? [{ name: item.name, url: item.url }]
          : []
      ))
      : [];
    return [{
      id: String(entry.id ?? entry.slug),
      title: entry.title,
      slug: entry.slug,
      department: typeof entry.department === 'string' ? entry.department : '',
      sessionYear: typeof entry.sessionYear === 'number' ? entry.sessionYear : 0,
      status: typeof entry.status === 'string' ? entry.status : '',
      description: typeof entry.description === 'string' ? entry.description : '',
      conditions: Array.isArray(entry.conditions)
        ? entry.conditions.filter((condition): condition is string => typeof condition === 'string')
        : [],
      examDate: typeof calendar.examDate === 'string' ? calendar.examDate : null,
      registrationEnd: typeof calendar.registrationEnd === 'string' ? calendar.registrationEnd : null,
      resultPdf: typeof results.pdfUrl === 'string' ? results.pdfUrl : null,
      attachments,
    }];
  });
}

export async function fetchConcours(): Promise<ConcoursItem[]> {
  return parseConcours(await callSiteApi('concours', 'GET'));
}
