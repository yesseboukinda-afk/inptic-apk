import { AppScreen, ContentCard } from '@/components/app-screen';
import { siteUrl } from '@/lib/api';
import { useNavigation } from '@/lib/navigation-context';

const services: {
  title: string;
  description: string;
  path?: string;
}[] = [
  { title: 'Espace alumni', description: 'Retrouver le réseau des diplômés de l’INPTIC.', path: '/alumni' },
  { title: 'Contact', description: 'Contacter l’équipe de l’institut.', path: '/contact' },
];

export default function ServicesScreenPage() {
  const { openUrl } = useNavigation();

  return (
    <AppScreen
      title="Services"
      subtitle="Accédez aux autres services de l’INPTIC."
    >
      {services.map(({ title, description, path }) => (
        <ContentCard
          key={path}
          title={title}
          description={description}
          action="Ouvrir le service"
          onPress={() => {
            if (path) openUrl(siteUrl(path));
          }}
        />
      ))}
    </AppScreen>
  );
}
