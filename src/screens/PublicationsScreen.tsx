import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { fetchPublications, type Publication } from '@/api/publications';
import { AppScreen, colors, ErrorState, LoadingState } from '@/components/app-screen';
import { useNavigation } from '@/lib/navigation-context';
import { siteUrl } from '@/lib/api';

export default function PublicationsScreen() {
  const { openUrl } = useNavigation();
  const [items, setItems] = useState<Publication[]>([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setItems(await fetchPublications(term));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les publications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(search);
  }, [load, search]);

  return (
    <AppScreen
      title="Recherche et innovation"
      subtitle="Parcourez les publications scientifiques de l’INPTIC."
      refreshing={refreshing}
      onRefresh={() => void load(search, true)}
    >
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Rechercher une publication"
          placeholder="Titre, auteur, domaine…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSearch(query.trim())}
          style={styles.searchInput}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => setSearch(query.trim())}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Chercher</Text>
        </Pressable>
      </View>
      {loading ? <LoadingState label="Chargement des publications…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && items.length === 0 ? (
        <Text style={styles.empty}>Aucune publication trouvée.</Text>
      ) : null}
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          {item.authors.length ? <Text style={styles.meta}>{item.authors.join(', ')}</Text> : null}
          <Text style={styles.meta}>{[item.domain, item.year || null].filter(Boolean).join(' · ')}</Text>
          {item.abstract ? <Text style={styles.abstract}>{item.abstract}</Text> : null}
          {item.doiOrUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                if (item.doiOrUrl) openUrl(item.doiOrUrl);
              }}
            >
              <Text style={styles.link}>Ouvrir la référence  →</Text>
            </Pressable>
          ) : null}
          {item.pdfUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                if (!item.pdfUrl) return;
                const url = /^https?:\/\//i.test(item.pdfUrl) ? item.pdfUrl : siteUrl(item.pdfUrl);
                openUrl(url);
              }}
            >
              <Text style={styles.link}>Lire le document  →</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 3,
    color: colors.ink,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchButton: { backgroundColor: colors.primary, borderRadius: 3, justifyContent: 'center', paddingHorizontal: 16 },
  searchButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  empty: { color: colors.muted, paddingVertical: 20, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    gap: 8,
    padding: 16,
  },
  title: { color: colors.ink, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  abstract: { color: colors.ink, fontSize: 14, lineHeight: 21 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700', paddingVertical: 2 },
});
