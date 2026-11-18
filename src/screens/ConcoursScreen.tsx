import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { fetchConcours, type ConcoursItem } from '@/api/concours';
import { AppScreen, colors, ErrorState, LoadingState } from '@/components/app-screen';
import { useNavigation } from '@/lib/navigation-context';
import { siteUrl } from '@/lib/api';

export default function ConcoursScreen() {
  const { openUrl } = useNavigation();
  const [items, setItems] = useState<ConcoursItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'upcoming' | 'closed'>('all');
  const { width } = useWindowDimensions();
  const isTablet = width >= 760;

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setItems(await fetchConcours());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les concours.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const visibleItems = items.filter((item) => {
    const matchesFilter = filter === 'all'
      || (filter === 'open' && item.status === 'en_cours')
      || (filter === 'upcoming' && item.status === 'a_venir')
      || (filter === 'closed' && item.status === 'termine');
    const matchesQuery = `${item.title} ${item.department} ${item.sessionYear}`.toLocaleLowerCase('fr').includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });

  return (
    <AppScreen
      title="Concours & admissions"
      subtitle="Consultez les sessions, les conditions et les documents officiels."
      hideHeading
      refreshing={refreshing}
      onRefresh={() => void load(true)}
    >
      <View style={styles.hero}>
        <View pointerEvents="none" style={styles.heroAccent} />
        <Text style={styles.heroEyebrow}>INPTIC · CANDIDATURES</Text>
        <Text style={styles.heroTitle}>Concours &amp; admissions</Text>
        <Text style={styles.heroDescription}>Retrouvez les sessions ouvertes, les calendriers et les résultats officiels.</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          {([
            ['all', 'Tous'],
            ['open', 'En cours'],
            ['upcoming', 'À venir'],
            ['closed', 'Terminés'],
          ] as const).map(([value, label]) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === value }}
              onPress={() => setFilter(value)}
              style={[styles.filterButton, filter === value && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          accessibilityLabel="Rechercher un concours"
          placeholder="Rechercher une session…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      {loading ? <LoadingState label="Chargement des sessions…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && visibleItems.length === 0 ? (
        <Text style={styles.empty}>Aucun concours n’est actuellement publié.</Text>
      ) : null}
      <Text style={styles.resultCount}>{visibleItems.length} session{visibleItems.length === 1 ? '' : 's'} publiée{visibleItems.length === 1 ? '' : 's'}</Text>
      <View style={styles.grid}>
        {visibleItems.map((item) => (
          <View key={item.id} style={[styles.card, isTablet && styles.cardTablet]}>
            <View style={styles.cardTopline}>
              <Text style={styles.status}>{statusLabel(item.status)}</Text>
              <Text style={styles.year}>SESSION {item.sessionYear}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.department ? <Text style={styles.meta}>{item.department}</Text> : null}
            {item.description ? <Text style={styles.body}>{item.description}</Text> : null}
            <View style={styles.schedule}>
              {item.examDate ? <Text style={styles.meta}>Épreuves · {formatDate(item.examDate)}</Text> : null}
              {item.registrationEnd ? <Text style={styles.meta}>Clôture · {formatDate(item.registrationEnd)}</Text> : null}
            </View>
            {item.conditions.map((condition, index) => (
              <Text key={`${item.id}-condition-${index}`} style={styles.condition}>• {condition}</Text>
            ))}
            {[...item.attachments, ...(item.resultPdf ? [{ name: 'Résultats', url: item.resultPdf }] : [])].map((attachment) => (
              <Pressable
                accessibilityRole="link"
                key={`${item.id}-${attachment.url}`}
                onPress={() => openUrl(siteUrl(attachment.url))}
                style={styles.attachment}
              >
                <Text style={styles.attachmentText}>Télécharger · {attachment.name}  ↓</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

function statusLabel(status: string): string {
  if (status === 'en_cours') return 'Inscriptions en cours';
  if (status === 'a_venir') return 'À venir';
  if (status === 'termine') return 'Terminé';
  return 'Session';
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#0f172a', justifyContent: 'center', minHeight: 200, overflow: 'hidden', padding: 22 },
  heroAccent: { backgroundColor: '#155e75', bottom: 0, opacity: 0.9, position: 'absolute', right: 0, top: 0, width: '38%' },
  heroEyebrow: { color: '#bfdbfe', fontSize: 10, fontWeight: '900' },
  heroTitle: { color: '#ffffff', fontSize: 30, fontWeight: '900', lineHeight: 36, marginTop: 10 },
  heroDescription: { color: '#e2e8f0', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 520 },
  filters: { gap: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  filterButton: { borderColor: colors.border, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#ffffff' },
  searchInput: { backgroundColor: '#ffffff', borderColor: colors.border, borderWidth: 1, color: colors.ink, fontSize: 12, height: 40, paddingHorizontal: 12 },
  empty: { color: colors.muted, paddingVertical: 20, textAlign: 'center' },
  resultCount: { color: colors.muted, fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    gap: 9,
    padding: 16,
    width: '100%',
  },
  cardTablet: { width: '48%' },
  cardTopline: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  status: { backgroundColor: '#eff6ff', color: colors.primary, fontSize: 9, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textTransform: 'uppercase' },
  year: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  title: { color: '#172554', fontFamily: 'serif', fontSize: 17, fontWeight: '800', lineHeight: 23 },
  meta: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  body: { color: colors.ink, fontSize: 14, lineHeight: 21 },
  schedule: { backgroundColor: '#f8fafc', gap: 5, padding: 10 },
  condition: { color: colors.ink, fontSize: 12, lineHeight: 18, paddingLeft: 4 },
  attachment: { alignSelf: 'flex-start', borderBottomColor: colors.border, borderBottomWidth: 1, marginTop: 2, paddingBottom: 5 },
  attachmentText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
});
