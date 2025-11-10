import { createContext, ReactNode, PropsWithChildren } from 'react';
import { App } from 'obsidian';

/**
 * AppContext provides access to the Obsidian App instance throughout the React component tree.
 * This avoids prop drilling the app instance through every component.
 */
export const AppContext = createContext<App | undefined>(undefined);

/**
 * AppProvider wraps the React component tree and provides the Obsidian App instance.
 * 
 * @param props - Component props with children and app instance
 * @returns React element with context provider
 */
export interface AppProviderProps extends PropsWithChildren {
  app: App;
}

export const AppProvider = ({ children, app }: AppProviderProps): React.ReactElement => {
  return <AppContext.Provider value={app}>{children}</AppContext.Provider>;
};
