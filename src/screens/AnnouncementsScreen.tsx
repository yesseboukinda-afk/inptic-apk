import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { fetchPublicNews, type PublicNewsItem } from '@/api/news';
import { AppScreen, colors, ErrorState, LoadingState } from '@/components/app-screen';
import { useNavigation } from '@/lib/navigation-context';

export default function AnnouncementsScreen() {
  const { openUrl } = useNavigation();
  const [items, setItems] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'annonce'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 760;

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setItems(await fetchPublicNews('annonces'));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les annonces.');
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
    const matchesType = filter === 'all' || item.category.toLocaleLowerCase('fr').includes('annonce');
    const matchesQuery = `${item.title} ${item.category} ${item.summary}`.toLocaleLowerCase('fr').includes(normalizedQuery);
    return matchesType && matchesQuery;
  });

  return (
    <AppScreen
      title="Annonces & Communiqués"
      subtitle="Annonces officielles, dates de concours, résultats et informations de la vie étudiante."
      hideHeading
      refreshing={refreshing}
      onRefresh={() => void load(true)}
    >
      <View style={styles.hero}>
        <View pointerEvents="none" style={styles.heroAccent} />
        <Text style={styles.heroEyebrow}>INPTIC · GABON</Text>
        <Text style={styles.heroTitle}>Annonces &amp; Communiqués</Text>
        <Text style={styles.heroDescription}>
          Retrouvez les annonces officielles, dates de concours, résultats, événements et informations de la vie étudiante de l’INPTIC.
        </Text>
        <View style={styles.filters}>
          <View style={styles.filterRow}>
            {([
              ['all', 'Toutes'],
              ['annonce', 'Annonce'],
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
            accessibilityLabel="Rechercher une annonce"
            placeholder="Rechercher une annonce…"
            placeholderTextColor="#cbd5e1"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {loading ? <LoadingState label="Chargement des annonces…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      <Text style={styles.resultCount}>{visibleItems.length} annonce{visibleItems.length === 1 ? '' : 's'} publiée{visibleItems.length === 1 ? '' : 's'}</Text>
      {!loading && !error && visibleItems.length === 0 ? (
        <Text style={styles.empty}>Aucune annonce ne correspond à cette recherche.</Text>
      ) : null}

      <View style={styles.grid}>
        {visibleItems.map((item) => {
          const cover = item.attachments.find((attachment) => attachment.type.startsWith('image/'));
          const isExpanded = expandedId === item.id;

          return (
            <View key={item.id} style={[styles.card, isTablet && styles.cardTablet]}>
              <View style={styles.cardTopline}>
                <Text style={styles.category}>{item.category || 'Annonce'}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.attachments.length} document{item.attachments.length === 1 ? '' : 's'} à télécharger</Text>
              {cover ? (
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Ouvrir l’image de ${item.title}`}
                  onPress={() => openUrl(cover.url)}
                >
                  <Image source={{ uri: cover.url }} style={styles.cover} />
                </Pressable>
              ) : null}
              <Text numberOfLines={5} style={styles.summary}>{item.summary}</Text>
              <Pressable accessibilityRole="link" onPress={() => openUrl(item.url)}>
                <Text style={styles.action}>Lire l’annonce complète  →</Text>
              </Pressable>
              {item.attachments.length > 0 ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                    style={styles.documentsButton}
                  >
                    <Text style={styles.documentsText}>
                      Documents à télécharger ({item.attachments.length})
                    </Text>
                    <Text style={styles.documentsChevron}>{isExpanded ? '⌃' : '⌄'}</Text>
                  </Pressable>
                  {isExpanded ? (
                    <View style={styles.documentsList}>
                      {item.attachments.map((attachment) => (
                        <Pressable
                          accessibilityRole="link"
                          key={attachment.url}
                          onPress={() => openUrl(attachment.url)}
                          style={styles.documentLink}
                        >
                          <Text numberOfLines={1} style={styles.documentName}>{attachment.name}</Text>
                          <Text style={styles.downloadGlyph}>↓</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          );
        })}
      </View>
    </AppScreen>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#0f172a', gap: 10, justifyContent: 'center', minHeight: 250, overflow: 'hidden', padding: 22 },
  heroAccent: { backgroundColor: '#155e75', bottom: 0, opacity: 0.9, position: 'absolute', right: 0, top: 0, width: '38%' },
  heroEyebrow: { color: '#bfdbfe', fontSize: 10, fontWeight: '900' },
  heroTitle: { color: '#ffffff', fontSize: 30, fontWeight: '900', lineHeight: 36, maxWidth: 480 },
  heroDescription: { color: '#e2e8f0', fontSize: 12, lineHeight: 18, maxWidth: 560 },
  filters: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginTop: 3 },
  filterRow: { flexDirection: 'row', gap: 5 },
  filterButton: { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#ffffff' },
  searchInput: { borderColor: '#cbd5e1', borderWidth: 1, color: '#ffffff', flexGrow: 1, fontSize: 11, height: 36, minWidth: 150, paddingHorizontal: 10 },
  resultCount: { color: colors.muted, fontSize: 11 },
  empty: { color: colors.muted, lineHeight: 22, paddingVertical: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: '#ffffff', borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: 9, padding: 13, width: '100%' },
  cardTablet: { width: '48%' },
  cardTopline: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  category: { backgroundColor: '#eff6ff', color: colors.primary, fontSize: 9, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textTransform: 'uppercase' },
  date: { color: colors.muted, fontSize: 9 },
  cardTitle: { color: '#172554', fontFamily: 'serif', fontSize: 17, fontWeight: '800', lineHeight: 22 },
  meta: { color: colors.muted, fontSize: 10 },
  cover: { aspectRatio: 1.75, backgroundColor: '#e2e8f0', width: '100%' },
  summary: { color: colors.ink, fontSize: 11, lineHeight: 17 },
  action: { color: colors.primary, fontSize: 10, fontWeight: '800', paddingVertical: 3 },
  documentsButton: { alignItems: 'center', backgroundColor: '#eff6ff', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 11, paddingVertical: 9 },
  documentsText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  documentsChevron: { color: colors.primary, fontSize: 15 },
  documentsList: { gap: 6, paddingTop: 2 },
  documentLink: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, justifyContent: 'space-between', paddingVertical: 6 },
  documentName: { color: colors.ink, flex: 1, fontSize: 10 },
  downloadGlyph: { color: colors.primary, fontSize: 16, fontWeight: '800' },
});