import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/components/app-screen';
import AdmissionsScreen from '@/screens/AdmissionsScreen';
import NewsScreen from '@/screens/NewsScreen';
import FormationsScreen from '@/screens/FormationsScreen';
import HomeScreen from '@/screens/HomeScreen';
import ServicesScreen from '@/screens/ServicesScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import ClubsScreen from '@/screens/ClubsScreen';
import ConcoursScreen from '@/screens/ConcoursScreen';
import PublicationsScreen from '@/screens/PublicationsScreen';
import AnnouncementsScreen from '@/screens/AnnouncementsScreen';
import InAppBrowserScreen from '@/screens/InAppBrowserScreen';
import { NavigationContext, type NativeScreen } from '@/lib/navigation-context';

const screens: { name: NativeScreen; label: string; icon: string }[] = [
  { name: 'home', label: 'Accueil', icon: '⌂' },
  { name: 'formations', label: 'Formations', icon: '▤' },
  { name: 'actualites', label: 'Actualités', icon: '◷' },
  { name: 'annonces', label: 'Annonces', icon: '▣' },
  { name: 'admissions', label: 'Admissions', icon: '✓' },
  { name: 'concours', label: 'Concours', icon: '▦' },
  { name: 'bibliotheque', label: 'Bibliothèque', icon: '▥' },
  { name: 'clubs', label: 'Clubs', icon: '♧' },
  { name: 'publications', label: 'Publications', icon: '▤' },
  { name: 'services', label: 'Services', icon: '⋯' },
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NativeScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<NativeScreen>('home');
  const [webViewUrl, setWebViewUrl] = useState('https://inptic-ga.org');
  const [webViewTitle, setWebViewTitle] = useState('INPTIC');
  const { width } = useWindowDimensions();
  const isTablet = width >= 760;

  function openUrl(url: string) {
    if (!/^https?:\/\//i.test(url)) return;
    setPreviousScreen(activeScreen === 'webview' ? previousScreen : activeScreen);
    setWebViewUrl(url);
    setWebViewTitle('INPTIC');
    setActiveScreen('webview');
  }

  function closeWebView() {
    setActiveScreen(previousScreen === 'webview' ? 'home' : previousScreen);
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeScreen === 'webview') return false;
      if (activeScreen === 'home') return false;
      setActiveScreen('home');
      return true;
    });
    return () => subscription.remove();
  }, [activeScreen]);

  const screen = {
    home: <HomeScreen />,
    formations: <FormationsScreen />,
    actualites: <NewsScreen />,
    annonces: <AnnouncementsScreen />,
    admissions: <AdmissionsScreen />,
    services: <ServicesScreen />,
    bibliotheque: <LibraryScreen />,
    clubs: <ClubsScreen />,
    concours: <ConcoursScreen />,
    publications: <PublicationsScreen />,
    webview: (
      <InAppBrowserScreen
        url={webViewUrl}
        title={webViewTitle}
        onClose={closeWebView}
        onTitleChange={setWebViewTitle}
      />
    ),
  }[activeScreen];
  const tabScreen = activeScreen === 'webview' ? previousScreen : activeScreen;
  const selectedTab = tabScreen;

  return (
    <SafeAreaProvider>
      <NavigationContext.Provider value={{ navigate: setActiveScreen, openUrl }}>
        <View style={styles.app}>
          <View style={styles.screen}>{screen}</View>
          {!isTablet && activeScreen !== 'webview' ? (
            <SafeAreaView edges={['bottom']} style={styles.tabBar}>
              {screens.map((item) => {
                const isSelected = item.name === selectedTab;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.label}
                    key={item.name}
                    onPress={() => setActiveScreen(item.name)}
                    style={styles.tab}
                  >
                    <Text style={[styles.tabIcon, isSelected && styles.selectedTabText]}>
                      {item.icon}
                    </Text>
                    <Text style={[styles.tabLabel, isSelected && styles.selectedTabText]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </SafeAreaView>
          ) : null}
        </View>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  tabBar: {
    backgroundColor: '#111827',
    borderTopColor: '#1f2937',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 104,
    paddingHorizontal: 4,
    paddingTop: 5,
  },
  tab: { alignItems: 'center', height: 46, justifyContent: 'center', gap: 1, width: '20%' },
  tabIcon: { color: '#cbd5e1', fontSize: 16, lineHeight: 20 },
  tabLabel: { color: '#cbd5e1', fontSize: 8, fontWeight: '600', textAlign: 'center' },
  selectedTabText: { color: '#facc15' },
});
