import { useContext } from 'react';
import { App } from 'obsidian';
import { AppContext } from '../context/AppContext';

/**
 * useApp hook provides access to the Obsidian App instance in React components.
 * 
 * @returns The Obsidian App instance from context
 * @throws Error if used outside of AppContext.Provider
 */
export const useApp = (): App => {
  const app = useContext(AppContext);

  if (app === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return app;
};
