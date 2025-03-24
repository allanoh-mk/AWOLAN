import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Track {
  id: string;
  title: string;
  uri: string;
}

interface MusicContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playTrack: (id: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setVolume: (value: number) => void;
  addTrack: (track: Track) => Promise<void>;
  uploadedTracks: Track[];
}

export const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Move defaultTracks to the top
const defaultTracks: Track[] = [
  { id: 'default-1', title: 'Peaceful Melody', uri: require('../assets/music/peaceful_melody.mp3') },
  { id: 'default-2', title: 'Gentle Rain', uri: require('../assets/music/gentle_rain.mp3') },
  { id: 'default-3', title: 'Soft Piano', uri: require('../assets/music/soft_piano.mp3') },
  { id: 'default-4', title: 'Ocean Waves', uri: require('../assets/music/ocean_waves.mp3') },
  { id: 'default-5', title: 'Night Ambience', uri: require('../assets/music/night_ambience.mp3') }
];

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks); // Initialize with defaultTracks
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);

  const createSound = async (track: Track): Promise<Audio.Sound | null> => {
    try {
      const source = track.id.startsWith('default-') ? track.uri : { uri: track.uri };
      const { sound: newSound } = await Audio.Sound.createAsync(
        source,
        { 
          volume,
          shouldPlay: false,
          progressUpdateIntervalMillis: 100,
        }
      );
      return newSound;
    } catch (error) {
      console.error('Error creating sound:', error);
      return null;
    }
  };

  const playTrack = async (id: string) => {
    try {
      const trackToPlay = tracks.find(t => t.id === id);
      if (!trackToPlay) {
        console.warn('Track not found:', id);
        return;
      }

      // Stop current track if playing
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.warn('Error stopping previous track:', error);
        }
        setSound(null);
      }

      // Create and load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        trackToPlay.id.startsWith('default-') ? trackToPlay.uri : { uri: trackToPlay.uri },
        { 
          shouldPlay: false, // Don't auto-play until fully loaded
          volume: volume,
          isLooping: false,
        },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              handleTrackFinished();
            }
          }
        }
      );

      // Set volume and play
      await newSound.setVolumeAsync(volume);
      await newSound.playAsync();
      
      setSound(newSound);
      setCurrentTrack(trackToPlay);
      setIsPlaying(true);

      // Set up a listener to reset state when playback finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      });

    } catch (error) {
      console.error('Error playing track:', error);
      setIsPlaying(false);
      setSound(null);
    }
  };

  const handleTrackFinished = async () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    // Small delay before playing next track
    setTimeout(() => {
      playTrack(tracks[nextIndex].id);
    }, 500);
  };

  const pause = async () => {
    try {
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const resume = async () => {
    try {
      if (!sound) return;
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming:', error);
    }
  };

  // Initialize audio and load tracks
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Initialize audio
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Load saved tracks and merge with defaults
        await loadSavedTracks();
        
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Separate effect for autoplay after initialization
  useEffect(() => {
    if (isInitialized && tracks.length > 0) {
      playTrack(tracks[0].id);
    }
  }, [isInitialized]);

  const loadSavedTracks = async () => {
    try {
      const savedTracks = await AsyncStorage.getItem('uploadedTracks');
      if (savedTracks) {
        const parsedTracks = JSON.parse(savedTracks);
        setUploadedTracks(parsedTracks);
        setTracks(prevTracks => [...defaultTracks, ...parsedTracks]);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const saveTracks = async () => {
    try {
      await AsyncStorage.setItem('customTracks', JSON.stringify(tracks));
    } catch (error) {
      console.error('Error saving tracks:', error);
    }
  };

  const loadAndPlayTrack = async (track: Track) => {
    try {
      // Create new sound instance
      const { sound: newSound } = await Audio.Sound.createAsync(
        track.id.startsWith('default-') ? track.uri : { uri: track.uri },
        { 
          shouldPlay: false, // Don't play until fully loaded
          volume: volume,
          isLooping: false,
        },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            // Auto-play next track when current one ends
            if (status.didJustFinish) {
              const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
              const nextIndex = (currentIndex + 1) % tracks.length;
              playTrack(tracks[nextIndex].id);
            }
          }
        }
      );

      return newSound;
    } catch (error) {
      console.error('Error loading sound:', error);
      return null;
    }
  };

  const updateVolume = async (value: number) => {
    try {
      setVolume(value);
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setVolumeAsync(value);
        }
      }
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  };

  const addTrack = async (track: Track) => {
    try {
      const newTrack = {
        ...track,
        id: `custom-${Date.now()}` // Ensure unique ID
      };

      // Update uploadedTracks
      const newUploadedTracks = [...uploadedTracks, newTrack];
      setUploadedTracks(newUploadedTracks);
      
      // Update all tracks
      setTracks(prev => [...defaultTracks, ...newUploadedTracks]);
      
      // Save to storage
      await AsyncStorage.setItem('uploadedTracks', JSON.stringify(newUploadedTracks));
      
      console.log('Track added successfully:', newTrack.title);
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  // Preload next track
  useEffect(() => {
    if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      
      // Preload next track
      Audio.Sound.createAsync(
        nextTrack.id.startsWith('default-') ? nextTrack.uri : { uri: nextTrack.uri },
        { shouldPlay: false },
      );
    }
  }, [currentTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <MusicContext.Provider value={{
      tracks,
      uploadedTracks,
      currentTrack,
      isPlaying,
      volume,
      playTrack,
      pause,
      resume,
      setVolume: updateVolume,
      addTrack
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};
