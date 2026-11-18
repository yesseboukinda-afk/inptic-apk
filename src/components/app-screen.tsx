import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { useNavigation } from '@/lib/navigation-context';

type AppScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  hideHeading?: boolean;
};

export function AppScreen({
  title,
  subtitle,
  children,
  refreshing = false,
  onRefresh,
  hideHeading = false,
}: AppScreenProps) {
  const { width } = useWindowDimensions();
  const { navigate } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isTablet = width >= 760;
  const navItems = [
    { name: 'home' as const, label: 'Accueil' },
    { name: 'formations' as const, label: 'Formations' },
    { name: 'actualites' as const, label: 'Actualités' },
    { name: 'annonces' as const, label: 'Annonces' },
    { name: 'admissions' as const, label: 'Admissions' },
    { name: 'concours' as const, label: 'Concours' },
    { name: 'bibliotheque' as const, label: 'Bibliothèque' },
    { name: 'clubs' as const, label: 'Clubs' },
    { name: 'publications' as const, label: 'Publications' },
    { name: 'services' as const, label: 'Services' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.siteHeader, isTablet && styles.tabletHeader]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Accueil INPTIC"
          onPress={() => navigate('home')}
          style={styles.brandLockup}
        >
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
          <Text style={styles.headerBrand}>INPTIC</Text>
        </Pressable>
        {isTablet ? (
          <View style={styles.desktopNav}>
            {navItems.map((item) => (
              <Pressable key={item.name} onPress={() => navigate(item.name)} style={styles.desktopNavItem}>
                <Text style={styles.desktopNavText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigate('admissions')} style={styles.loginButton}>
            <Text style={styles.loginText}>Connexion</Text>
          </Pressable>
          <View style={styles.languageButton}><Text style={styles.languageText}>FR</Text></View>
          {!isTablet ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onPress={() => setMenuOpen((open) => !open)}
              style={styles.menuButton}
            >
              <Text style={styles.menuGlyph}>{menuOpen ? '×' : '☰'}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {!isTablet && menuOpen ? (
        <View style={styles.mobileMenu}>
          {navItems.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => { navigate(item.name); setMenuOpen(false); }}
              style={styles.mobileMenuItem}
            >
              <Text style={styles.mobileMenuText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable onPress={() => navigate('annonces')} style={styles.announcement}>
        <Text style={styles.announcementTag}>COMMUNIQUÉ OFFICIEL</Text>
        <Text numberOfLines={1} style={styles.announcementText}>L’INPTIC AU GABON DIGITAL WEEK 2026</Text>
        <Text style={styles.announcementArrow}>›</Text>
      </Pressable>
      <ScrollView
        contentContainerStyle={[styles.content, isTablet && styles.tabletContent]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0f766e"
              colors={['#0f766e']}
            />
          ) : undefined
        }
      >
        {!hideHeading ? (
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>INPTIC · GABON</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color="#0f766e" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorTitle}>Contenu indisponible</Text>
      <Text style={styles.errorMessage}>{message}</Text>
    </View>
  );
}

export function ContentCard({
  title,
  description,
  onPress,
  action,
}: {
  title: string;
  description: string;
  onPress?: () => void;
  action?: string;
}) {
  const content = (
    <>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {action ? <Text style={styles.action}>{action}  →</Text> : null}
    </>
  );

  if (!onPress) return <View style={styles.card}>{content}</View>;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

export const colors = {
  background: '#ffffff',
  surface: '#ffffff',
  ink: '#0f172a',
  muted: '#64748b',
  primary: '#2563eb',
  border: '#dbe3ee',
  accent: '#facc15',
  night: '#111827',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  siteHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  tabletHeader: { height: 92, paddingHorizontal: 14 },
  brandLockup: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  logo: { height: 36, width: 36 },
  headerBrand: { color: colors.primary, fontSize: 14, fontWeight: '900' },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  loginButton: { backgroundColor: colors.primary, borderRadius: 3, paddingHorizontal: 12, paddingVertical: 8 },
  loginText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  languageButton: { alignItems: 'center', borderColor: colors.border, borderWidth: 1, height: 32, justifyContent: 'center', width: 32 },
  languageText: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  menuButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 32 },
  menuGlyph: { color: colors.ink, fontSize: 21 },
  desktopNav: { alignContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  desktopNavItem: { alignItems: 'center', paddingHorizontal: 2, paddingVertical: 7, width: '20%' },
  desktopNavText: { color: colors.ink, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  mobileMenu: { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingVertical: 6 },
  mobileMenuItem: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 8, paddingVertical: 12, width: '50%' },
  mobileMenuText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  announcement: { alignItems: 'center', backgroundColor: '#eff6ff', flexDirection: 'row', gap: 8, minHeight: 42, paddingHorizontal: 14 },
  announcementTag: { color: colors.primary, fontSize: 9, fontWeight: '900' },
  announcementText: { color: colors.ink, flex: 1, fontSize: 10, fontWeight: '700' },
  announcementArrow: { color: colors.primary, fontSize: 22, lineHeight: 24 },
  content: { alignSelf: 'center', gap: 16, maxWidth: 1120, paddingBottom: 36, paddingHorizontal: 16, paddingTop: 16, width: '100%' },
  tabletContent: { paddingHorizontal: 28, paddingTop: 24 },
  heading: { paddingBottom: 2, paddingTop: 6, gap: 6 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  title: { color: colors.ink, fontSize: 26, fontWeight: '800', lineHeight: 32 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  cardTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  cardDescription: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  action: { color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: 4 },
  state: { alignItems: 'center', padding: 24, gap: 10 },
  muted: { color: colors.muted, fontSize: 14 },
  error: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 6,
  },
  errorTitle: { color: '#991b1b', fontWeight: '700' },
  errorMessage: { color: '#7f1d1d', fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.75 },
});
