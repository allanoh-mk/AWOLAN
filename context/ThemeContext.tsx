// context/ThemeContext.tsx
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { storage } from '../services/storage';

/** Example theme definitions with font families */
const THEME_DEFINITIONS = {
  default: {
    background: '#0d0d0d',
    text: '#fff',
    textSecondary: '#aaa',
    cardBackground: '#1f1f1f',
    accent: '#E91E63',
    borderColor: '#444',
    buttonSecondary: '#333',
    inputBackground: '#2a2a2a',
    fontFamily: 'System',
  },
  purpleNebula: {
    background: '#1b0c2e',
    text: '#fff',
    textSecondary: '#b8a3d8',
    cardBackground: '#2a1747',
    accent: '#a020f0',
    borderColor: '#6a5acd',
    buttonSecondary: '#382359',
    inputBackground: '#321c4d',
    fontFamily: 'ChocoCooky',
  },
  deepSpace: {
    background: '#050a0e',
    text: '#fff',
    textSecondary: '#a3c2d8',
    cardBackground: '#0f1a24',
    accent: '#008080',
    borderColor: '#005f5f',
    buttonSecondary: '#1a2c3d',
    inputBackground: '#152532',
    fontFamily: 'System',
  },
  cosmicRose: {
    background: '#2d0a1d',
    text: '#fff',
    textSecondary: '#d8a3b8',
    cardBackground: '#4f1431',
    accent: '#ff69b4',
    borderColor: '#c71585',
    buttonSecondary: '#591c38',
    inputBackground: '#4d1c32',
    fontFamily: 'System',
  },
  love: {
    background: '#330a0a',
    text: '#fff',
    textSecondary: '#d8a3a3',
    cardBackground: '#4f0f0f',
    accent: '#ff3b3b',
    borderColor: '#e32222',
    buttonSecondary: '#591c1c',
    inputBackground: '#4d1c1c',
    fontFamily: 'ChocoCooky',
  },
};

/** Extended theme interface with font family */
interface ThemeContextProps {
  themeName: 'default' | 'purpleNebula' | 'deepSpace' | 'cosmicRose' | 'love';
  setThemeName: (name: 'default' | 'purpleNebula' | 'deepSpace' | 'cosmicRose' | 'love') => void;
  theme: typeof THEME_DEFINITIONS.default;
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeName: 'default',
  setThemeName: () => {},
  theme: THEME_DEFINITIONS.default,
  wallpaper: 'default',
  setWallpaper: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<'default' | 'purpleNebula' | 'deepSpace' | 'cosmicRose' | 'love'>('default');
  const [wallpaper, setWallpaper] = useState<string>('default');

  const theme = useMemo(() => {
    return THEME_DEFINITIONS[themeName] || THEME_DEFINITIONS.default;
  }, [themeName]);

  useEffect(() => {
    // Load saved theme on mount
    const loadTheme = async () => {
      const savedTheme = await storage.getTheme();
      if (savedTheme && savedTheme in THEME_DEFINITIONS) {
        setThemeName(savedTheme as 'default' | 'purpleNebula' | 'deepSpace' | 'cosmicRose' | 'love');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Save theme whenever it changes
    storage.saveTheme(themeName);
  }, [themeName]);

  useEffect(() => {
    const loadWallpaper = async () => {
      const savedWallpaper = await storage.getWallpaper();
      if (savedWallpaper) {
        setWallpaper(savedWallpaper);
      }
    };
    loadWallpaper();
  }, []);

  useEffect(() => {
    storage.saveWallpaper(wallpaper);
  }, [wallpaper]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, theme, wallpaper, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
