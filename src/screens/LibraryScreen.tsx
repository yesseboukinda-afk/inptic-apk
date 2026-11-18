import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { callSiteApi, siteApiUrl } from '@/api/endpoints';
import { fetchLibraryBooks, fetchLibraryStats, type LibraryBook } from '@/api/library';
import { AppScreen, colors, ErrorState, LoadingState } from '@/components/app-screen';
import { useNavigation } from '@/lib/navigation-context';

export default function LibraryScreen() {
  const { openUrl } = useNavigation();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [total, setTotal] = useState<number | null>(null);
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
      const [nextBooks, nextTotal] = await Promise.all([
        fetchLibraryBooks(term),
        fetchLibraryStats(),
      ]);
      setBooks(nextBooks);
      setTotal(nextTotal);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger la bibliothèque.');
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
      title="Bibliothèque"
      subtitle={total === null ? 'Explorez les ouvrages disponibles.' : `${total} ouvrages au catalogue.`}
      refreshing={refreshing}
      onRefresh={() => void load(search, true)}
    >
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Rechercher un ouvrage"
          placeholder="Titre, auteur, sujet…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSearch(query.trim())}
          style={styles.searchInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lancer la recherche"
          onPress={() => setSearch(query.trim())}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Chercher</Text>
        </Pressable>
      </View>

      {loading ? <LoadingState label="Chargement du catalogue…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && books.length === 0 ? (
        <Text style={styles.empty}>Aucun ouvrage ne correspond à cette recherche.</Text>
      ) : null}

      {books.map((book) => (
        <View key={book.id} style={styles.book}>
          {book.couverture_url ? (
            <Image
              accessibilityLabel={`Couverture de ${book.titre}`}
              source={{ uri: siteApiUrl('libraryCover', { query: { id: book.id } }) }}
              style={styles.cover}
            />
          ) : null}
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{book.titre}</Text>
            {book.auteur ? <Text style={styles.bookAuthor}>{book.auteur}</Text> : null}
            {book.categorie ? <Text style={styles.bookMeta}>{book.categorie}{book.langue ? ` · ${book.langue}` : ''}</Text> : null}
            {book.description ? <Text style={styles.bookDescription}>{book.description}</Text> : null}
            <Text style={styles.bookMeta}>{book.telechargements} téléchargements</Text>
            {book.pdf_url ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => openUrl(siteApiUrl('libraryFile', { query: { id: book.id } }))}
                style={styles.action}
              >
                <Text style={styles.actionText}>Ouvrir l’ouvrage  →</Text>
              </Pressable>
            ) : null}
          </View>
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
  book: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  cover: { width: 76, height: 108, borderRadius: 2, backgroundColor: colors.background },
  bookDetails: { flex: 1, gap: 6 },
  bookTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  bookAuthor: { color: colors.muted, fontSize: 14 },
  bookMeta: { color: colors.muted, fontSize: 12 },
  bookDescription: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  action: { alignSelf: 'flex-start', marginTop: 4 },
  actionText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
