import { createContext, useContext } from 'react';

export type NativeScreen =
  | 'home'
  | 'formations'
  | 'actualites'
  | 'annonces'
  | 'admissions'
  | 'services'
  | 'bibliotheque'
  | 'clubs'
  | 'concours'
  | 'publications'
  | 'webview';

type NativeNavigation = {
  navigate: (screen: NativeScreen) => void;
  openUrl: (url: string) => void;
};

export const NavigationContext = createContext<NativeNavigation | null>(null);

export function useNavigation(): NativeNavigation {
  const navigation = useContext(NavigationContext);
  if (!navigation) throw new Error('La navigation INPTIC doit être fournie à cet écran.');
  return navigation;
}
