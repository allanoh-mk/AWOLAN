// context/WallpaperContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface WallpaperContextProps {
  wallpaper: string | null;
  setWallpaper: (uri: string | null) => void;
}

export const WallpaperContext = createContext<WallpaperContextProps | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  return (
    <WallpaperContext.Provider value={{ wallpaper, setWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaperContext = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaperContext must be used within a WallpaperProvider');
  }
  return context;
};
