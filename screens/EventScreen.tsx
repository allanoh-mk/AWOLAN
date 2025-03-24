import React, { useEffect, useState } from 'react';
import { ImageBackground, View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useWallpaperContext } from '../context/WallpaperContext';
import { useMusicContext } from '../context/MusicContext';

export default function EventScreen() {
  const { theme } = useThemeContext();
  const { wallpaper } = useWallpaperContext();
  const { playTrack, currentTrack, isPlaying } = useMusicContext();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentTrack && !isPlaying) {
      playTrack(currentTrack.id);
    }
  }, [currentTrack, isPlaying, playTrack]);

  return (
    <ImageBackground
      source={wallpaper ? { uri: wallpaper } : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Events</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.time, { color: theme.text }]}>Current Time: {currentTime}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 10,
    borderBottomColor: '#9370db', // Purple border
    marginBottom: 16,
    elevation: 8, // Android shadow
    shadowColor: '#9370db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Pacifico', // Make sure you have this font installed
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
  },
});