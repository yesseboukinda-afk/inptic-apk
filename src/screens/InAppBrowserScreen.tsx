import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { colors } from '@/components/app-screen';

type InAppBrowserScreenProps = {
  url: string;
  title: string;
  onClose: () => void;
  onTitleChange: (title: string) => void;
};

export default function InAppBrowserScreen({ url, title, onClose, onTitleChange }: InAppBrowserScreenProps) {
  const webViewRef = useRef<WebView<{}>>(null);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack, onClose]);

  function handleNavigation(state: WebViewNavigation) {
    setCanGoBack(state.canGoBack);
    const pageTitle = state.title?.trim();
    if (pageTitle && pageTitle !== 'about:blank') onTitleChange(pageTitle);
  }

  function reload() {
    setLoadError(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.toolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour à l’application" onPress={onClose} style={styles.backButton}>
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} style={styles.title}>{title || 'INPTIC'}</Text>
          <Text numberOfLines={1} style={styles.url}>{currentUrl.replace(/^https?:\/\//, '')}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Actualiser la page" onPress={reload} style={styles.reloadButton}>
          <Text style={styles.reloadGlyph}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.webContent}>
        <WebView<{}>
          key={`${currentUrl}-${reloadKey}`}
          ref={webViewRef}
          source={{ uri: currentUrl }}
          originWhitelist={['*']}
          javaScriptEnabled
          sharedCookiesEnabled
          allowsBackForwardNavigationGestures
          onShouldStartLoadWithRequest={(request) => /^https?:\/\//i.test(request.url)}
          onOpenWindow={({ nativeEvent }) => {
            if (/^https?:\/\//i.test(nativeEvent.targetUrl)) setCurrentUrl(nativeEvent.targetUrl);
          }}
          onNavigationStateChange={handleNavigation}
          onLoadStart={() => { setLoading(true); setLoadError(false); }}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setLoadError(true); }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 500) setLoadError(true);
          }}
          style={styles.webView}
        />
        {loading && !loadError ? (
          <View pointerEvents="none" style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}
        {loadError ? (
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Page momentanément indisponible</Text>
            <Text style={styles.errorMessage}>Vérifiez votre connexion, puis réessayez.</Text>
            <Pressable accessibilityRole="button" onPress={reload} style={styles.retryButton}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#ffffff', flex: 1 },
  toolbar: { alignItems: 'center', backgroundColor: '#ffffff', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 58, paddingHorizontal: 12 },
  backButton: { alignItems: 'center', backgroundColor: '#eff6ff', height: 38, justifyContent: 'center', width: 38 },
  backGlyph: { color: colors.primary, fontSize: 28, lineHeight: 32 },
  titleContainer: { flex: 1, gap: 2 },
  title: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  url: { color: colors.muted, fontSize: 9 },
  reloadButton: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  reloadGlyph: { color: colors.primary, fontSize: 23 },
  webContent: { flex: 1 },
  webView: { flex: 1 },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', backgroundColor: '#ffffff', justifyContent: 'center' },
  errorState: { ...StyleSheet.absoluteFill, alignItems: 'center', backgroundColor: '#ffffff', justifyContent: 'center', padding: 24 },
  errorTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  errorMessage: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
  retryButton: { backgroundColor: colors.primary, marginTop: 18, paddingHorizontal: 18, paddingVertical: 11 },
  retryText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
});