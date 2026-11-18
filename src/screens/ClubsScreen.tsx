import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fetchClubs, toggleClubLike, type Club } from '@/api/clubs';
import { AppScreen, colors, ErrorState, LoadingState } from '@/components/app-screen';

export default function ClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liking, setLiking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setClubs(await fetchClubs());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les clubs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onToggleLike = async (club: Club) => {
    setLiking(club.slug);
    setError(null);
    try {
      await toggleClubLike(club.slug);
      await load(true);
    } catch (likeError) {
      setError(likeError instanceof Error ? likeError.message : 'Impossible de mettre à jour le vote.');
    } finally {
      setLiking(null);
    }
  };

  return (
    <AppScreen
      title="Clubs étudiants"
      subtitle="Découvrez les activités du campus et soutenez vos clubs."
      refreshing={refreshing}
      onRefresh={() => void load(true)}
    >
      {loading ? <LoadingState label="Chargement des clubs…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {clubs.map((club) => (
        <View key={club.slug} style={styles.card}>
          <Text style={styles.title}>{club.name}</Text>
          <Text style={styles.description}>{club.description}</Text>
          <Text style={styles.subclubs}>
            {club.subclubs.map((subclub) => subclub.name).join(' · ')}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.votes}>{club.likes} appréciations</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: liking !== null }}
              disabled={liking !== null}
              onPress={() => void onToggleLike(club)}
              style={({ pressed }) => [styles.voteButton, pressed && styles.pressed]}
            >
              <Text style={styles.voteButtonText}>
                {liking === club.slug ? 'Mise à jour…' : club.liked ? 'Retirer mon soutien' : 'Soutenir'}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    gap: 9,
    padding: 16,
  },
  title: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  subclubs: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  votes: { color: colors.muted, fontSize: 13 },
  voteButton: { backgroundColor: colors.primary, borderRadius: 3, paddingHorizontal: 14, paddingVertical: 10 },
  voteButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
