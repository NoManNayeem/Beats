// Theme Context - Light/Dark mode support
// Based on Expo SDK 54 best practices

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { getSetting, setSetting } from '@/services/StorageService';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: typeof Colors.light | typeof Colors.dark;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await getSetting('themeMode');
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        setThemeModeState(saved);
      }
    };
    loadTheme();
  }, []);

  // Update theme based on mode and system preference
  useEffect(() => {
    if (themeMode === 'auto') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await setSetting('themeMode', mode);
  };

  const toggleTheme = async () => {
    const newMode = theme === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  };

  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        colors,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

