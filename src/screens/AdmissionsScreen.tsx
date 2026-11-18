import { AppScreen, ContentCard } from '@/components/app-screen';
import { siteUrl } from '@/lib/api';
import { useNavigation } from '@/lib/navigation-context';

const steps = [
  {
    title: '1. Préparer votre dossier',
    description: 'Consultez le guide et vérifiez les pièces à fournir avant de commencer.',
    path: '/admissions/guide',
    action: 'Ouvrir le guide',
  },
  {
    title: '2. Choisir une session',
    description: 'Consultez les concours et les sessions actuellement ouvertes.',
    path: '/concours',
    action: 'Voir les concours',
  },
  {
    title: '3. Déposer votre candidature',
    description: 'Créez ou retrouvez votre compte candidat et déposez les pièces demandées.',
    path: '/admissions/depot',
    action: 'Accéder au dépôt',
  },
  {
    title: '4. Suivre votre dossier',
    description: 'Consultez l’avancement de votre candidature et les éventuelles demandes de correction.',
    path: '/admissions/suivi',
    action: 'Suivre mon dossier',
  },
];

export default function AdmissionsScreenPage() {
  const { navigate, openUrl } = useNavigation();

  return (
    <AppScreen
      title="Admissions"
      subtitle="Les démarches détaillées restent assurées par le portail sécurisé de l’INPTIC."
    >
      {steps.map((step) => (
        <ContentCard
          key={step.path}
          title={step.title}
          description={step.description}
          action={step.action}
          onPress={() => {
            if (step.path === '/concours') navigate('concours');
            else openUrl(siteUrl(step.path));
          }}
        />
      ))}
    </AppScreen>
  );
}
