import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interfaces for different data types
interface Track {
  id: string;
  title: string;
  uri: string;
  cover?: string;
  author?: string;
}

interface Memory {
  id: string;
  text: string;
  image?: string;
  date: string;
  location?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  image?: string;
}

// Storage keys
const STORAGE_KEYS = {
  TRACKS: '@awolan_tracks',
  MEMORIES: '@awolan_memories',
  EVENTS: '@awolan_events',
  THEME: '@awolan_theme',
  PROFILE: '@awolan_profile',
  SETTINGS: '@awolan_settings',
  WALLPAPER: '@awolan_wallpaper',
  SELECTED_TRACK: '@awolan_selected_track',
  DESCRIPTION: '@description',
};

// Storage service
export const storage = {
  // Tracks
  async getTracks(): Promise<Track[]> {
    try {
      const tracks = await AsyncStorage.getItem(STORAGE_KEYS.TRACKS);
      return tracks ? JSON.parse(tracks) : [];
    } catch (error) {
      console.error('Error getting tracks:', error);
      return [];
    }
  },

  async saveTracks(tracks: Track[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    } catch (error) {
      console.error('Error saving tracks:', error);
    }
  },

  // Memories
  async getMemories(): Promise<Memory[]> {
    try {
      const memories = await AsyncStorage.getItem(STORAGE_KEYS.MEMORIES);
      return memories ? JSON.parse(memories) : [];
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  },

  async saveMemories(memories: Memory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  },

  // Theme
  async getTheme(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    } catch (error) {
      console.error('Error getting theme:', error);
      return null;
    }
  },

  async saveTheme(theme: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  // Wallpaper
  async getWallpaper(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.WALLPAPER);
    } catch (error) {
      console.error('Error getting wallpaper:', error);
      return null;
    }
  },

  async saveWallpaper(wallpaper: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WALLPAPER, wallpaper);
    } catch (error) {
      console.error('Error saving wallpaper:', error);
    }
  },

  // Selected Track
  async getSelectedTrack(): Promise<Track | null> {
    try {
      const track = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TRACK);
      return track ? JSON.parse(track) : null;
    } catch (error) {
      console.error('Error getting selected track:', error);
      return null;
    }
  },

  async saveSelectedTrack(track: Track): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TRACK, JSON.stringify(track));
    } catch (error) {
      console.error('Error saving selected track:', error);
    }
  },

  // Description
  async saveDescription(description: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DESCRIPTION, description);
    } catch (error) {
      console.error('Error saving description:', error);
      throw error;
    }
  },

  async getDescription(): Promise<string> {
    try {
      const description = await AsyncStorage.getItem(STORAGE_KEYS.DESCRIPTION);
      return description || '';
    } catch (error) {
      console.error('Error getting description:', error);
      return '';
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

export type { Track, Memory, Event };