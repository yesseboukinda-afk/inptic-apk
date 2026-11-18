import { Image, ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useState } from 'react';

import { AppScreen, colors } from '@/components/app-screen';
import { useNavigation } from '@/lib/navigation-context';

const formations = [
  {
    title: 'Génie logiciel',
    description: 'Développement logiciel, systèmes, réseaux et sécurité.',
    image: 'https://inptic-ga.org/_next/image?url=%2Fformations%2Finformatique.webp&w=828&q=70',
  },
  {
    title: 'Télécommunications',
    description: 'Réseaux, systèmes embarqués, IoT et services.',
    image: 'https://inptic-ga.org/_next/image?url=%2Fformations%2Ftelecommunications.webp&w=828&q=70',
  },
  {
    title: 'Audiovisuel et multimédia',
    description: 'Création numérique, web, design et audiovisuel.',
    image: 'https://inptic-ga.org/_next/image?url=%2Fformations%2Faudiovisuel-1.webp&w=828&q=70',
  },
  {
    title: 'Management & TIC',
    description: 'Gestion de projet, marketing digital et entrepreneuriat.',
    image: 'https://inptic-ga.org/_next/image?url=%2Fformations%2Fmanagement-tic.webp&w=828&q=70',
  },
];

export default function HomeScreenPage() {
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const tablet = width >= 760;
  const [domainIndex, setDomainIndex] = useState(-1);
  const [levelIndex, setLevelIndex] = useState(-1);
  const domains = ['Génie informatique', 'Télécommunications', 'Audiovisuel', 'Management & TIC'];
  const levels = ['DTS', 'Licence', 'Master'];

  return (
    <AppScreen
      title="Bienvenue à l’INPTIC Gabon"
      subtitle="Rejoignez la première université du numérique au Gabon et façonnez votre avenir dans les technologies de l’information."
      hideHeading
    >
      <ImageBackground
        source={{ uri: 'https://inptic-ga.org/_next/image?url=%2Finstitut%2F1.webp&w=1920&q=75' }}
        resizeMode="cover"
        style={[styles.hero, tablet && styles.heroTablet, wide && styles.heroWide, { marginHorizontal: tablet ? -28 : -16 }]}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        <View style={[styles.heroInner, wide && styles.heroInnerWide]}>
          <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
            <Text style={styles.heroEyebrow}>INPTIC · GABON</Text>
            <Text style={[styles.heroTitle, wide && styles.heroTitleWide]}>Bienvenue à l’INPTIC Gabon</Text>
            <Text style={styles.heroBody}>
              Rejoignez la première université du numérique au Gabon et façonnez votre avenir dans les technologies de l’information.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigate('formations')}
              style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
            >
              <Text style={styles.heroButtonText}>Découvrir nos formations  →</Text>
            </Pressable>
          </View>

          <View style={[styles.searchCard, wide && styles.searchCardWide]}>
            <Text style={styles.searchTitle}>Trouver ma formation</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDomainIndex((index) => (index + 1) % domains.length)}
              style={styles.selectField}
            >
              <Text style={[styles.selectText, domainIndex >= 0 && styles.selectedText]}>
                {domainIndex >= 0 ? domains[domainIndex] : 'Domaine d’étude'}
              </Text>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setLevelIndex((index) => (index + 1) % levels.length)}
              style={styles.selectField}
            >
              <Text style={[styles.selectText, levelIndex >= 0 && styles.selectedText]}>
                {levelIndex >= 0 ? levels[levelIndex] : 'Niveau d’études'}
              </Text>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigate('formations')}
              style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
            >
              <Text style={styles.searchButtonText}>Rechercher  ⌕</Text>
            </Pressable>
            <Text style={styles.searchHint}>💡 Affinez votre recherche en sélectionnant un domaine et un niveau d’études.</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.featureStrip}>
        {[
          ['⌂', 'Formations', 'programmes de haut niveau'],
          ['◎', 'Recherche', 'et innovation'],
          ['▣', 'Insertion', 'professionnelle'],
          ['♧', 'Vie de campus', 'communauté étudiante'],
          ['⊕', 'Ouvert à', 'l’international'],
          ['☆', 'Excellence', 'académique'],
        ].map(([icon, title, caption]) => (
          <View key={title} style={[styles.feature, tablet && styles.featureTablet]}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureCaption}>{caption}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metrics}>
        <Metric value="+20" label="formations" />
        <Metric value="+3 000" label="étudiants" />
        <Metric value="+150" label="enseignants" />
        <Metric value="+95 %" label="insertion pro" />
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>PROGRAMMES DE HAUT NIVEAU</Text>
          <Text style={styles.sectionTitle}>Nos formations</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => navigate('formations')}>
          <Text style={styles.link}>Tout voir  →</Text>
        </Pressable>
      </View>
      <View style={styles.formationGrid}>
        {formations.map((formation) => (
          <Pressable
            key={formation.title}
            accessibilityRole="button"
            onPress={() => navigate('formations')}
            style={({ pressed }) => [styles.formationCard, tablet && styles.formationCardTablet, pressed && styles.pressed]}
          >
            <Image source={{ uri: formation.image }} style={styles.formationImage} />
            <View style={styles.formationBody}>
              <Text style={styles.formationTitle}>{formation.title}</Text>
              <Text style={styles.formationDescription}>{formation.description}</Text>
              <Text style={styles.formationMeta}>DTS · Licence</Text>
              <Text style={styles.link}>En savoir plus  →</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>À LA UNE</Text>
          <Text style={styles.sectionTitle}>Toute l’actualité INPTIC</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => navigate('actualites')}>
          <Text style={styles.link}>Voir tout  →</Text>
        </Pressable>
      </View>
      <View style={styles.quickLinks}>
        <QuickLink title="Candidater en ligne" caption="Déposez votre dossier et suivez votre candidature." onPress={() => navigate('admissions')} />
        <QuickLink title="Clubs & associations" caption="Rejoignez la communauté étudiante." onPress={() => navigate('clubs')} />
        <QuickLink title="Bibliothèque" caption="Explorez le catalogue de ressources." onPress={() => navigate('bibliotheque')} />
      </View>
    </AppScreen>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { justifyContent: 'center', minHeight: 600, overflow: 'hidden' },
  heroTablet: { minHeight: 540 },
  heroWide: { minHeight: 510 },
  heroImage: { position: 'absolute' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 6, 23, 0.62)' },
  heroInner: { alignSelf: 'center', gap: 24, maxWidth: 620, paddingHorizontal: 18, paddingVertical: 32, width: '100%' },
  heroInnerWide: { alignItems: 'center', flexDirection: 'row', maxWidth: 1120, paddingHorizontal: 28 },
  heroCopy: { gap: 13 },
  heroCopyWide: { flex: 1, paddingRight: 20 },
  heroEyebrow: { color: '#bfdbfe', fontSize: 10, fontWeight: '900' },
  heroTitle: { color: '#ffffff', fontSize: 31, fontWeight: '900', lineHeight: 37 },
  heroTitleWide: { fontSize: 42, lineHeight: 48 },
  heroBody: { color: '#f1f5f9', fontSize: 14, lineHeight: 22, maxWidth: 520 },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 3,
    marginTop: 2,
    paddingHorizontal: 17,
    paddingVertical: 13,
  },
  heroButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  searchCard: { backgroundColor: 'rgba(15, 23, 42, 0.94)', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, gap: 11, padding: 16, width: '100%' },
  searchCardWide: { maxWidth: 390, padding: 20 },
  searchTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800', marginBottom: 2 },
  selectField: { alignItems: 'center', backgroundColor: '#ffffff', flexDirection: 'row', height: 45, justifyContent: 'space-between', paddingHorizontal: 12 },
  selectText: { color: '#64748b', fontSize: 12 },
  selectedText: { color: colors.ink, fontWeight: '600' },
  chevron: { color: '#64748b', fontSize: 16 },
  searchButton: { alignItems: 'center', backgroundColor: colors.primary, height: 44, justifyContent: 'center' },
  searchButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  searchHint: { color: '#e2e8f0', fontSize: 10, lineHeight: 15 },
  featureStrip: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -16, paddingHorizontal: 8, paddingVertical: 18 },
  feature: { alignItems: 'center', gap: 3, paddingHorizontal: 4, paddingVertical: 8, width: '33.333%' },
  featureTablet: { width: '16.666%' },
  featureIcon: { color: colors.primary, fontSize: 20, fontWeight: '700' },
  featureTitle: { color: colors.ink, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  featureCaption: { color: colors.muted, fontSize: 9, textAlign: 'center' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    minWidth: '22%',
    padding: 10,
  },
  metricValue: { color: colors.primary, fontSize: 16, fontWeight: '900' },
  metricLabel: { color: colors.muted, fontSize: 9, marginTop: 2 },
  sectionHeading: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sectionEyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', marginBottom: 3 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  link: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  formationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  formationCard: { backgroundColor: '#ffffff', borderColor: colors.border, borderWidth: 1, width: '100%' },
  formationCardTablet: { width: '48%' },
  formationImage: { backgroundColor: '#e2e8f0', height: 150, width: '100%' },
  formationBody: { gap: 7, padding: 14 },
  formationTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  formationDescription: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  formationMeta: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  quickLinks: { gap: 10 },
  quickLink: { backgroundColor: '#f8fafc', borderLeftColor: colors.primary, borderLeftWidth: 3, gap: 5, padding: 14 },
  quickLinkTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  quickLinkCaption: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.8 },
});

function QuickLink({ title, caption, onPress }: { title: string; caption: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]}>
      <Text style={styles.quickLinkTitle}>{title}</Text>
      <Text style={styles.quickLinkCaption}>{caption}</Text>
      <Text style={styles.link}>Découvrir  →</Text>
    </Pressable>
  );
}
