import { useState, useEffect } from 'react';

export type CustomActionType = 'navigate-dashboard' | 'navigate-rooms' | 'navigate-settings' | 'lock-session';

export interface CustomActionConfig {
  name: string;
  action: CustomActionType;
}

const DEFAULT_CONFIG: CustomActionConfig = {
  name: 'Quick Action',
  action: 'navigate-dashboard',
};

const STORAGE_KEY = 'wesaam_custom_action';

export function useCustomSidebarAction() {
  const [config, setConfig] = useState<CustomActionConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load custom action config:', error);
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save custom action config:', error);
    }
  }, [config]);

  return { config, setConfig };
}
