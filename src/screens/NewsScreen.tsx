import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import {
  AppScreen,
  colors,
  ErrorState,
  LoadingState,
} from '@/components/app-screen';
import { fetchNews, fetchPublicNews, type NewsItem, type PublicNewsItem } from '@/api/news';
import { useNavigation } from '@/lib/navigation-context';

export default function NewsScreenPage() {
  const { openUrl } = useNavigation();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'news' | 'watch'>('all');
  const { width } = useWindowDimensions();
  const isTablet = width >= 760;

  async function load(refresh = false) {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const results = await Promise.allSettled([fetchPublicNews(), fetchNews()]);
      const [articlesResult, veilleResult] = results;
      const errors: string[] = [];
      if (articlesResult.status === 'fulfilled') setArticles(articlesResult.value);
      else errors.push(`Actualités : ${articlesResult.reason instanceof Error ? articlesResult.reason.message : 'indisponibles.'}`);
      if (veilleResult.status === 'fulfilled') setItems(veilleResult.value);
      else errors.push(`Veille : ${veilleResult.reason instanceof Error ? veilleResult.reason.message : 'indisponible.'}`);
      setError(errors.join('\n'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Les actualités sont indisponibles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const visibleArticles = articles.filter((item) => (
    filter !== 'watch' && `${item.title} ${item.category} ${item.summary}`.toLocaleLowerCase('fr').includes(normalizedQuery)
  ));
  const visibleItems = items.filter((item) => (
    filter !== 'news' && `${item.title} ${item.source} ${item.summary}`.toLocaleLowerCase('fr').includes(normalizedQuery)
  ));
  const resultCount = visibleArticles.length + visibleItems.length;

  return (
    <AppScreen
      title="Actualités"
      subtitle="Les nouvelles de l’institut et la veille technologique."
      hideHeading
      refreshing={refreshing}
      onRefresh={() => void load(true)}
    >
      <View style={styles.hero}>
        <View pointerEvents="none" style={styles.heroAccent} />
        <Text style={styles.heroEyebrow}>INPTIC · GABON</Text>
        <Text style={styles.heroTitle}>Actualités de l’INPTIC</Text>
        <Text style={styles.heroDescription}>
          Suivez la vie de l’institut, ses événements et les dernières informations sur les technologies numériques.
        </Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.segmentedControl}>
          {([
            ['all', 'Toutes'],
            ['news', 'Actualités'],
            ['watch', 'Veille'],
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
            placeholder="Rechercher une actualité…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {loading ? <LoadingState label="Chargement des actualités…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      <Text style={styles.resultCount}>{resultCount} publication{resultCount === 1 ? '' : 's'} affichée{resultCount === 1 ? '' : 's'}</Text>
      {!loading && !error && resultCount === 0 ? (
        <Text style={styles.empty}>Aucune actualité ne correspond à cette recherche.</Text>
      ) : null}
      <View style={styles.articleGrid}>
        {visibleArticles.map((item) => (
          <Pressable
            accessibilityRole="link"
            key={`article-${item.id}`}
            onPress={() => openUrl(item.url)}
            style={({ pressed }) => [styles.articleCard, isTablet && styles.articleCardTablet, pressed && styles.pressed]}
          >
            <View style={styles.articleTopline}>
              <Text style={styles.category}>{item.category || 'Annonce'}</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text numberOfLines={4} style={styles.summary}>{item.summary || 'Consultez la publication complète sur le site de l’INPTIC.'}</Text>
              <Text style={styles.articleAction}>Lire l’actualité complète  →</Text>
          </Pressable>
        ))}
        {visibleItems.map((item) => (
          <Pressable
            accessibilityRole="link"
            key={item.id}
            onPress={() => openUrl(item.url)}
            style={({ pressed }) => [styles.articleCard, isTablet && styles.articleCardTablet, pressed && styles.pressed]}
          >
            <View style={styles.articleTopline}>
              <Text style={styles.category}>Veille technologique</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text numberOfLines={4} style={styles.summary}>{item.summary || `Source : ${item.source}`}</Text>
            <Text style={styles.articleAction}>Lire l’article  →</Text>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#0f172a', justifyContent: 'center', minHeight: 220, overflow: 'hidden', padding: 22 },
  heroAccent: { backgroundColor: '#155e75', bottom: 0, opacity: 0.9, position: 'absolute', right: 0, top: 0, width: '38%' },
  heroEyebrow: { color: '#bfdbfe', fontSize: 10, fontWeight: '900' },
  heroTitle: { color: '#ffffff', fontSize: 31, fontWeight: '900', lineHeight: 36, maxWidth: 480, marginTop: 10 },
  heroDescription: { color: '#e2e8f0', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 550 },
  filters: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  segmentedControl: { flexDirection: 'row', gap: 5 },
  filterButton: { borderColor: colors.border, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: '#ffffff' },
  searchInput: { backgroundColor: '#ffffff', borderColor: colors.border, borderWidth: 1, color: colors.ink, flexGrow: 1, fontSize: 12, height: 38, minWidth: 160, paddingHorizontal: 12 },
  resultCount: { color: colors.muted, fontSize: 11 },
  empty: { color: colors.muted, lineHeight: 22, paddingVertical: 18 },
  articleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  articleCard: { backgroundColor: '#ffffff', borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: 11, padding: 15, width: '100%' },
  articleCardTablet: { width: '48%' },
  articleTopline: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  category: { backgroundColor: '#eff6ff', color: colors.primary, fontSize: 9, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, textTransform: 'uppercase' },
  date: { color: colors.muted, fontSize: 10 },
  articleTitle: { color: '#172554', fontFamily: 'serif', fontSize: 17, fontWeight: '800', lineHeight: 22 },
  summary: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  articleAction: { color: colors.primary, fontSize: 11, fontWeight: '800', marginTop: 2 },
  pressed: { opacity: 0.82 },
});
