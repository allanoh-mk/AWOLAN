import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { useWallpaperContext } from '../context/WallpaperContext';
import { BlurCard } from '../components/BlurCard';
import { useDataContext } from '../context/DataContext';
import { THEME_BORDERS, getBlurTint } from '../utils/themeUtils';
import { Audio } from 'expo-av';

// Add this with other imports at the top
const LOVE_NOTE = require('../assets/voicenotes/love-note.mp3');
const LOVE_NOTE_COVER = require('../assets/voicenotes/love-note-cover.png');

interface EventItem {
  name: string;
  date: string;
  location: string;
  image?: string | null;
}

interface SavingItem {
  purpose: string;
  amount: string;
  maturityDate: string;
  pinned?: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, themeName } = useThemeContext(); // Add themeName
  const { wallpaper } = useWallpaperContext();
  const { events, savings, voiceNote, setVoiceNote } = useDataContext();
  const [currentTime, setCurrentTime] = useState('');
  const [timeWithAriam, setTimeWithAriam] = useState<{
    formatted: string;
    simple: string;
  }>({ formatted: '', simple: '' });
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to update the current time
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

  // Function to calculate the duration since a fixed date
  useEffect(() => {
    const updateTimeWithAriam = () => {
      const startDate = moment('2023-01-01', 'YYYY-MM-DD');
      const now = moment();
      const duration = moment.duration(now.diff(startDate));

      setTimeWithAriam({
        formatted: `${duration.years()}:${duration.months()}:${duration.days()}:${duration.hours()}:${duration.minutes()}:${duration.seconds()}`,
        simple: `${duration.years()}:${duration.months()}:${duration.days()}`
      });
    };

    updateTimeWithAriam();
    const interval = setInterval(updateTimeWithAriam, 1000);
    return () => clearInterval(interval);
  }, []);

  // Replace recording function with file picker
  const handleVoiceNoteUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setVoiceNote(result.assets[0].uri);
      }
    } catch (error) {
      console.log('File picking cancelled or error:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (sound && isPlaying) {
        // Pause the sound
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        if (!sound) {
          // Load the sound if not already loaded
          const { sound: newSound } = await Audio.Sound.createAsync(
            require('../assets/voicenotes/love-note.mp3')
          );
          setSound(newSound);

          // Play the sound
          await newSound.playAsync();
          setIsPlaying(true);

          // Set up a listener to reset state when playback finishes
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        } else {
          // Resume the sound
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error handling play/pause:', error);
    }
  };

  // Cleanup the sound when the component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Get upcoming events (earliest two)
  const getUpcomingEvents = () => {
    const now = moment();
    return [...events]
      .filter(event => moment(event.date).isAfter(now))
      .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
      .slice(0, 2);
  };

  // Get pinned saving
  const getPinnedSaving = () => {
    return savings.find((s) => s.pinned === true) || null;
  };

  return (
    <ImageBackground
      source={wallpaper ? { uri: wallpaper } : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
      resizeMode="cover"
    >
      {/* Regular View instead of BlurCard for header */}
      <View style={[
        styles.headerBackground, 
        { 
          backgroundColor: theme.cardBackground,
          borderBottomColor: THEME_BORDERS[themeName]
        }
      ]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          <Text style={styles.greeting}>Hey</Text> 🖐
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* BlurView wrapped cards */}
        <BlurCard intensity={65} style={styles.cardContainer}>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}
          >
            <Text style={[styles.cardHeader, { color: theme.text }]}>Current Time</Text>
            <Text style={[styles.timeValue, { color: theme.accent }]}>
              {currentTime}
            </Text>
          </View>
        </BlurCard>

        <BlurCard>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}
          >
            <Text style={[styles.cardHeader, { color: theme.text }]}>Time with Ariam</Text>
            <Text style={[styles.timeSubtitle, { color: theme.textSecondary }]}>Every moment counts</Text>
            
            <View style={styles.timeLabelsContainer}>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>YY</Text>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>MM</Text>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>DD</Text>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>HRS</Text>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>MIN</Text>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>SEC</Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={[styles.timeValue, { color: theme.accent }]}>{timeWithAriam.formatted}</Text>
            </View>
          </View>
        </BlurCard>

        <BlurCard>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}
          >
            <Text style={[styles.cardHeader, { color: theme.text }]}>Voice Note</Text>
            <View style={styles.voiceNoteContainer}>
              <Image 
                source={require('../assets/voicenotes/love-note-cover.png')}
                style={styles.voiceNoteAlbumArt}
              />
              <View style={styles.voiceNoteInfo}>
                <Text style={[styles.voiceNoteTitle, { color: theme.text }]}>
                  I Love you💕
                </Text>
                <Text style={[styles.voiceNoteAuthor, { color: theme.textSecondary }]}>
                  Ariam
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: theme.accent }]}
                onPress={handlePlayPause}
              >
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸️' : '▶️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurCard>

        <BlurCard>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}
          >
            <Text style={[styles.cardHeader, { color: theme.text }]}>Upcoming Events</Text>
            {getUpcomingEvents().length > 0 ? (
              getUpcomingEvents().map((evt, index) => (
                <View key={index} style={styles.eventItem}>
                  {evt.image && <Image source={{ uri: evt.image }} style={styles.eventImage} />}
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { color: theme.text }]}>{evt.name}</Text>
                    <Text style={[styles.eventDetails, { color: theme.textSecondary }]}>{evt.location}</Text>
                    <Text style={[styles.eventDate, { color: theme.textSecondary }]}>
                      {moment(evt.date).format('MMM DD, YYYY')}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                No upcoming events. Add events to see them here!
              </Text>
            )}
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: theme.buttonSecondary }]}
              onPress={() => navigation.navigate('Events' as never)}
            >
              <Text style={[styles.viewAllButtonText, { color: theme.text }]}>View all events ➡</Text>
            </TouchableOpacity>
          </View>
        </BlurCard>

        <BlurCard>
          <View 
            style={[
              styles.card, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}
          >
            <Text style={[styles.cardHeader, { color: theme.text }]}>Savings Overview</Text>
            {getPinnedSaving() ? (
              <View style={styles.savingItem}>
                <Text style={[styles.savingPurpose, { color: theme.text }]}>{getPinnedSaving()?.purpose}</Text>
                <Text style={[styles.savingAmount, { color: theme.accent }]}>KES {getPinnedSaving()?.amount}</Text>
                <Text style={[styles.savingMaturity, { color: theme.textSecondary }]}>
                  Maturity: {getPinnedSaving()?.maturityDate}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                No pinned saving. Pin a saving to display it here!
              </Text>
            )}
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: theme.buttonSecondary }]}
              onPress={() => navigation.navigate('Savings' as never)}
            >
              <Text style={[styles.viewAllButtonText, { color: theme.text }]}>View all savings ➡</Text>
            </TouchableOpacity>
          </View>
        </BlurCard>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 120 : 100,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomWidth: 10,
    borderBottomColor: '#9370db',
    elevation: 8,
    shadowColor: '#9370db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  container: {
    flex: 1,
    padding: 0, // Remove padding to allow cards to be wider
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 120 : 100, // Match header height
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    padding: 8, // Reduced from 16
    paddingTop: Platform.OS === 'ios' ? 130 : 110,
    width: '100%', // Ensure container takes full width
  },
  headerContent: { 
    marginBottom: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 20, // Reduced padding to show header
    paddingHorizontal: 20, // Added padding
  },
  greeting: { fontStyle: 'italic' },
  time: { 
    fontSize: 18, 
    fontWeight: '600',
    fontFamily: 'Game of Squids', // Updated font family
  },
  cardContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: { 
    padding: 24,
    borderRadius: 12, // Reduced from 16
    marginBottom: 16, // Reduced from 20
    marginHorizontal: 8, // Reduced from 16
    width: '95%', // Increased from 90%
    alignSelf: 'center', // Center the card
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2, // Add border width
  },
  cardHeader: { 
    fontSize: 24, // Increased from 22
    fontWeight: 'bold',
    marginBottom: 12, // Increased from 8
    textAlign: 'center', // Add this to center the header text
  },
  timeSubtitle: { 
    fontSize: 15, 
    marginBottom: 12,
    fontFamily: 'Game of Squids', // Updated font family
  },
  timeValue: { 
    fontSize: 32, // Increased from 28
    fontWeight: '600',
    marginTop: 12,
    fontFamily: 'Game of Squids', // Updated font family
    textAlign: 'center', // Add this to center the time text
    letterSpacing: 2, // Add spacing between characters
  },
  detailsButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 5 },
  detailsButtonText: { fontSize: 14 },
  eventItem: { flexDirection: 'row', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  eventImage: { width: 90, height: 90 },
  eventInfo: { flex: 1, padding: 16 },
  eventTitle: { fontSize: 16, fontWeight: '600' },
  eventDetails: { fontSize: 14, marginBottom: 2 },
  eventDate: { 
    fontSize: 12,
    fontFamily: 'Game of Squids', // Updated font family
  },
  placeholderText: { fontSize: 14, marginBottom: 10 },
  viewAllButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
  viewAllButtonText: { fontSize: 14 },
  savingItem: { borderRadius: 12, padding: 16, marginBottom: 16 },
  savingPurpose: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  savingAmount: { fontSize: 14, marginBottom: 4 },
  savingMaturity: { 
    fontSize: 12,
    fontFamily: 'Game of Squids', // Updated font family
  },
  uploadButton: {
    backgroundColor: '#6a5acd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  voiceNoteText: {
    fontSize: 14,
    marginTop: 10,
  },
  simpleTimeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignSelf: 'center',
  },
  simpleTimeValue: {
    fontFamily: 'Game of Squids',
    fontSize: 28,
    textAlign: 'center',
  },
  timeLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'Game of Squids',
    textAlign: 'center',
    flex: 1,
  },
  timeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  timeValue: { 
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Game of Squids',
    textAlign: 'center',
    letterSpacing: 2,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginTop: 8,
  },
  voiceNoteAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  voiceNoteInfo: {
    flex: 1,
  },
  voiceNoteTitle: {
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Aliqa',
  },
  voiceNoteAuthor: {
    fontSize: 20,
    marginTop: 8,
    fontFamily: 'Aliqa',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonText: {
    fontSize: 24,
    color: '#fff',
  },
});
