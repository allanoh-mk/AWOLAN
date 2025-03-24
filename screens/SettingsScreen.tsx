import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SectionList, ImageBackground, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeContext } from '../context/ThemeContext';
import { MusicContext } from '../context/MusicContext';
import { useWallpaperContext } from '../context/WallpaperContext';
import { BlurView } from 'expo-blur';

type ThemeId = 'default' | 'purpleNebula' | 'deepSpace' | 'cosmicRose' | 'love';
const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'default', label: 'Classic Light' },
  { id: 'purpleNebula', label: 'Purple Nebula' },
  { id: 'deepSpace', label: 'Deep Space Dark' },
  { id: 'cosmicRose', label: 'Cosmic Rose' },
  { id: 'love', label: 'Love Theme' }
];

// Add this after the THEMES constant
const THEME_BORDERS = {
  default: '#ffffff',
  purpleNebula: '#9370db',
  deepSpace: '#4b0082',
  cosmicRose: '#ff69b4',
  love: '#ff1493'
};

const WALLPAPERS = ['default', 'purpleNebula', 'cosmicRose', 'deepSpace', 'love'];
const BORDER_COLORS = ['default', 'pink', 'aqua', 'green'];

// Update the defaultTracks array with the correct file names
const defaultTracks = [
  { id: 'default-1', title: 'Peaceful Melody', uri: require('../assets/music/peaceful_melody.mp3') },
  { id: 'default-2', title: 'Gentle Rain', uri: require('../assets/music/gentle_rain.mp3') },
  { id: 'default-3', title: 'Soft Piano', uri: require('../assets/music/soft_piano.mp3') },
  { id: 'default-4', title: 'Ocean Waves', uri: require('../assets/music/ocean_waves.mp3') },
  { id: 'default-5', title: 'Night Ambience', uri: require('../assets/music/night_ambience.mp3') }
];

const defaultWallpapers = {
  wallpaper1: require('../assets/wallpapers/wallpaper1.jpg'),
  wallpaper2: require('../assets/wallpapers/wallpaper2.jpg'),
  wallpaper3: require('../assets/wallpapers/wallpaper3.jpg'),
  wallpaper4: require('../assets/wallpapers/wallpaper4.jpg'),
  wallpaper5: require('../assets/wallpapers/wallpaper5.jpg'),
};

export default function SettingsScreen() {
  const { themeName, setThemeName, theme } = useThemeContext();
  const { tracks, addTrack, playTrack, pause, resume, skipToNext, currentTrack, isPlaying, volume, setVolume } =
    useContext(MusicContext);
  const { wallpaper, setWallpaper } = useWallpaperContext();
  const [selectedWallpaper, setSelectedWallpaper] = useState(wallpaper || 'default');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackUri, setNewTrackUri] = useState('');

  // Update the handleLoadBuiltIn function
  const handleLoadBuiltIn = () => {
    // Filter out tracks that already exist
    const newTracks = defaultTracks.filter(defaultTrack => 
      !tracks.some(existingTrack => existingTrack.id === defaultTrack.id)
    );

    // Add new tracks if any found
    if (newTracks.length > 0) {
      newTracks.forEach(track => addTrack(track));
      console.log(`Added ${newTracks.length} new default tracks`);
    } else {
      console.log('All default tracks already loaded');
    }
  };

  // Add useEffect to load default tracks when component mounts
  useEffect(() => {
    handleLoadBuiltIn();
  }, []);

  useEffect(() => {
    const handleTrackEnd = () => {
      if (currentTrack) {
        pause(); // Stop the current track when it ends
        console.log(`Track "${currentTrack.title}" has ended.`);
      }
    };

    // Subscribe to track end event (assuming MusicContext provides such functionality)
    if (currentTrack) {
      currentTrack.onEnd = handleTrackEnd; // Attach the handler to the track's onEnd event
    }

    return () => {
      if (currentTrack) {
        currentTrack.onEnd = null; // Clean up the event handler
      }
    };
  }, [currentTrack, pause]);

  const handlePickMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newTrack = {
          id: `custom-${Date.now()}`,
          title: asset.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          uri: asset.uri
        };

        await addTrack(newTrack);
        console.log('New track added:', newTrack.title);
      }
    } catch (error) {
      console.error('Error picking music:', error);
    }
  };

  // Update the handleAddCustomTrack function
  const handleAddCustomTrack = () => {
    if (!newTrackTitle || !newTrackUri) return;
    const newId = `custom-${Date.now()}`;
    addTrack({ id: newId, title: newTrackTitle, uri: newTrackUri });
    setNewTrackTitle('');
    setNewTrackUri('');
  };

  const renderTrackItem = ({ item }: any) => {
    const isCurrent = currentTrack?.id === item.id;
    return (
      <View style={[styles.trackItem, isCurrent && styles.currentTrack]}>
        <Text style={[styles.trackTitle, { color: theme.text }]}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => {
            if (isCurrent && isPlaying) {
              pause(); // Pause the track if it's currently playing
            } else {
              pause(); // Ensure no other track is playing
              playTrack(item.id); // Play the selected track
            }
          }}
        >
          <Text style={styles.trackActionText}>
            {isCurrent && isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleWallpaperSelect = (key: keyof typeof defaultWallpapers) => {
    setSelectedWallpaper(key);
    const wallpaperUri = Image.resolveAssetSource(defaultWallpapers[key]).uri;
    setWallpaper(wallpaperUri);
  };

  interface Section {
    title: string;
    data: Array<{
      type: string;
      content: JSX.Element;
    }>;
  }

  const getBlurTint = (themeName: ThemeId) => {
    switch (themeName) {
      case 'purpleNebula':
        return 'rgba(147, 112, 219, 0.2)'; // Purple tint
      case 'deepSpace':
        return 'rgba(25, 25, 25, 0.3)'; // Dark tint
      case 'cosmicRose':
        return 'rgba(255, 105, 180, 0.2)'; // Pink tint
      case 'love':
        return 'rgba(255, 20, 147, 0.2)'; // Deep pink tint
      default:
        return 'rgba(255, 255, 255, 0.1)'; // Default light tint
    }
  };

  const sections: Section[] = [
    {
      title: 'Appearance',
      data: [
        {
          type: 'theme',
          content: (
            <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
              <View 
                style={[
                  styles.card, 
                  { 
                    backgroundColor: getBlurTint(themeName),
                    borderColor: THEME_BORDERS[themeName],
                  }
                ]}
              >
                <Text style={[styles.cardHeader, { color: theme.text }]}>Theme</Text>
                {THEMES.map((themeOption) => (
                  <TouchableOpacity 
                    key={themeOption.id} 
                    style={[
                      styles.radioRow,
                      themeName === themeOption.id && styles.selectedTheme
                    ]} 
                    onPress={() => setThemeName(themeOption.id)}
                  >
                    <Text style={[styles.radioLabel, { color: theme.text }]}>{themeOption.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          )
        },
        {
          type: 'wallpaper',
          content: (
            <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
              <View 
                style={[
                  styles.card, 
                  { 
                    backgroundColor: getBlurTint(themeName),
                    borderColor: THEME_BORDERS[themeName],
                  }
                ]}
              >
                <Text style={[styles.cardHeader, { color: theme.text }]}>Wallpaper</Text>
                <View style={styles.wallpaperContainer}>
                  {(Object.keys(defaultWallpapers) as Array<keyof typeof defaultWallpapers>).map((key) => (
                      <TouchableOpacity key={key} onPress={() => handleWallpaperSelect(key)}>
                        <Image
                          source={defaultWallpapers[key]}
                          style={[
                            styles.wallpaperImage,
                            selectedWallpaper === key && styles.selectedWallpaper,
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            </BlurView>
          )
        }
      ]
    },
    {
      title: 'Music',
      data: [
        {
          type: 'music',
          content: (
            <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
              <View 
                style={[
                  styles.card, 
                  { 
                    backgroundColor: getBlurTint(themeName),
                    borderColor: THEME_BORDERS[themeName],
                  }
                ]}
              >
                <Text style={[styles.cardHeader, { color: theme.text }]}>Background Music</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  onValueChange={setVolume}
                  minimumTrackTintColor={theme.accent}
                  maximumTrackTintColor="#aaa"
                />
                
                {/* Built-in Tracks */}
                <Text style={[styles.builtInLabel, { color: theme.text }]}>Built-in Tracks</Text>
                <View style={styles.trackListContainer}>
                  {defaultTracks.map((track) => (
                    <View
                      key={track.id}
                      style={[
                        styles.trackItem,
                        currentTrack?.id === track.id && styles.currentTrack,
                      ]}
                    >
                      <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (currentTrack?.id === track.id && isPlaying) {
                            pause(); // Pause the track if it's currently playing
                          } else {
                            playTrack(track.id); // Play the selected track
                          }
                        }}
                        style={styles.playButton}
                      >
                        <Text style={[styles.playButtonText, { color: theme.accent }]}>
                          {currentTrack?.id === track.id && isPlaying ? '⏸️' : '▶️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Upload Section */}
                <View style={styles.uploadSection}>
                  <TouchableOpacity style={styles.uploadButton} onPress={handlePickMusic}>
                    <Text style={styles.uploadButtonText}>Upload New Track</Text>
                  </TouchableOpacity>
                </View>

                {/* Uploaded Tracks */}
                {tracks.filter(track => track.id.startsWith('custom-')).length > 0 && (
                  <View style={styles.uploadedTracksContainer}>
                    <Text style={[styles.subHeader, { color: theme.text }]}>Uploaded Tracks</Text>
                    {tracks
                      .filter(track => track.id.startsWith('custom-'))
                      .map((track) => (
                        <View key={track.id} style={[styles.trackItem, currentTrack?.id === track.id && styles.currentTrack]}>
                          <Text style={[styles.trackTitle, { color: theme.text }]} numberOfLines={1}>
                            {track.title}
                          </Text>
                          <View style={styles.trackControls}>
                            <TouchableOpacity 
                              onPress={() => {
                                if (currentTrack?.id === track.id && isPlaying) {
                                  pause();
                                } else {
                                  pause(); // Ensure no other track is playing
                                  playTrack(track.id);
                                }
                              }}
                              style={styles.playButton}
                            >
                              <Text style={[styles.playButtonText, { color: theme.accent }]}>
                                {currentTrack?.id === track.id && isPlaying ? '⏸️' : '▶️'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </BlurView>
          )
        }
      ]
    }
  ];

  return (
    <ImageBackground
      source={wallpaper ? { uri: wallpaper } : undefined}
      style={[styles.mainContainer, { backgroundColor: theme.background }]}
      resizeMode="cover"
    >
      {/* Solid colored header without blur */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.type + index}
        renderItem={({ item }) => item.content}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.text }]}>{section.title}</Text>
        )}
        contentContainerStyle={styles.sectionListContent}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionListContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for footer
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2, // Add border width
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#6a5acd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fileName: {
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  footerButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  container: { flex: 1 },
  contentContainer: { flex: 1, padding: 16 },
  playlistSection: { flex: 1, marginTop: 16 },
  trackItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bottomControls: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  controlButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  controlButtonText: { color: '#fff', fontWeight: '600' },
  loadButton: { backgroundColor: '#6a5acd', padding: 10, borderRadius: 8 },
  loadButtonText: { color: '#fff' },
  currentTrack: { 
    backgroundColor: 'rgba(147, 112, 219, 0.2)', 
    borderWidth: 1, 
    borderColor: '#9370db',
  },
  trackTitle: { fontSize: 14 },
  trackActionText: { fontSize: 14, marginLeft: 15 },
  playlistContainer: { flex: 1, marginVertical: 10 },
  playControls: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  playControlButton: { backgroundColor: '#6a5acd', padding: 10, borderRadius: 8 },
  playControlButtonText: { color: '#fff', fontWeight: 'bold' },
  uploadedTracksContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  trackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  wallpaperContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  wallpaperImage: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 8,
  },
  selectedWallpaper: {
    borderWidth: 3,
    borderColor: '#E91E63',
  },
  selectedTheme: {
    backgroundColor: 'rgba(106, 90, 205, 0.1)',
    borderRadius: 8,
  },
  trackListContainer: {
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
  },
  builtInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  builtInLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 10,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#9370db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    height: Platform.OS === 'ios' ? 100 : 110,
    justifyContent: 'flex-end', // Changed from center to flex-end
    paddingBottom: 20, // Add padding at the bottom
  },
  headerTitle: {
    fontSize: 42,
    textAlign: 'center',
    fontFamily: 'Pacifico-Regular',
    marginTop: Platform.OS === 'ios' ? 35 : 20,
    letterSpacing: 1,
    position: 'absolute',
    bottom: 15, // Position from bottom
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  playButtonText: {
    fontSize: 24,
  },
});
