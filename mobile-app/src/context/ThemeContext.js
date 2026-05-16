import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT, DARK, LIGHT_GRAD, DARK_GRAD, shadow, shadowSm, neonShadow } from '../theme';

const STORAGE_KEY = '@careeragent_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => { if (val === 'dark') setIsDark(true); })
      .finally(() => setReady(true));
  }, []);

  const toggleTheme = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const colors   = isDark ? DARK  : LIGHT;
  const gradient = isDark ? DARK_GRAD : LIGHT_GRAD;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, gradient, shadow, shadowSm, neonShadow, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
