import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { AppScreen, ContentCard, ErrorState, LoadingState } from '@/components/app-screen';
import { fetchFormations, type Formation } from '@/api/formations';

export default function FormationsScreenPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function load(refresh = false) {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setFormations(await fetchFormations());
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Le catalogue est indisponible.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <AppScreen
      title="Nos formations"
      subtitle="Parcourez les programmes de l’INPTIC et trouvez votre filière."
      refreshing={refreshing}
      onRefresh={() => void load(true)}
    >
      {loading ? <LoadingState label="Chargement du catalogue…" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && formations.length === 0 ? (
        <Text style={{ color: '#64748b', lineHeight: 22 }}>
          Aucune formation n’est publiée pour le moment.
        </Text>
      ) : null}
      {formations.map((formation) => (
        <ContentCard
          key={formation.id}
          title={formation.title}
          description={formation.description}
        />
      ))}
    </AppScreen>
  );
}
