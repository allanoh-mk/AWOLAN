import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  FlatList,
  Platform,
  ImageBackground,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment-timezone';
import { useThemeContext } from '../context/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import { storage } from '../services/storage';
import { useWallpaperContext } from '../context/WallpaperContext';
import { useMusicContext } from '../context/MusicContext';
import { BlurCard } from '../components/BlurCard';
import { scheduleVoiceNoteReminder } from '../utils/notifications';
import { Audio } from 'expo-av';
import { THEME_BORDERS, getBlurTint } from '../utils/themeUtils';
import { BlurView } from 'expo-blur';
import { useFonts as useExpoFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

interface Memory {
  id: string;
  text: string;
  image?: string;
  location?: string;
  date: string;
  fullDetails?: string;
}

interface VoiceNote {
  id: string;
  title: string;
  author: string;
  albumArt: any;
  audioFile: any;
}

const defaultVoiceNote: VoiceNote = {
  id: 'note1',
  title: 'I Love You',
  author: 'Ariam',
  albumArt: require('../assets/voicenotes/love-note-cover.png'),
  audioFile: require('../assets/voicenotes/love-note.mp3'),
};

function calculateTimeWithAriam() {
  const startDate = moment('2022-09-03');
  const now = moment();
  const duration = moment.duration(now.diff(startDate));
  return {
    years: Math.floor(duration.asYears()),
    months: Math.floor(duration.asMonths()) % 12,
    days: Math.floor(duration.asDays()) % 30,
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };
}

const FloatingEmoji = ({ startPosition, side }: { startPosition: number; side: 'bottom' | 'top' }) => {
  const [position] = useState(new Animated.Value(startPosition));
  const [opacity] = useState(new Animated.Value(0));
  // Wider distribution for emojis
  const randomHorizontal = Math.random() * 90 + 5; // Random position between 5% and 95%
  const randomDelay = Math.random() * 2000; // Random delay between 0-2s

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.delay(randomDelay),
            Animated.timing(position, {
              toValue: side === 'bottom' ? -80 : 80,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(randomDelay),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    startAnimation();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: `${randomHorizontal}%`,
        transform: [{ translateY: position }],
        opacity,
        fontSize: 14,
      }}
    >
      ❤️
    </Animated.Text>
  );
};

interface TimeWithAriam {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TimeCard = ({ timeWithAriam }: { timeWithAriam: TimeWithAriam }) => {
  const { theme, themeName } = useThemeContext();
  const [fontsLoaded] = useExpoFonts({
    'Aliqa': require('../assets/fonts/Aliqa.ttf'),
  });
  const linePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(linePosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, []);

  if (!fontsLoaded) {
    return (
      <BlurView intensity={65} tint={getBlurTint(themeName)} style={styles.blurContainer}>
        <View
          style={[
            styles.cardContent,
            {
              backgroundColor: getBlurTint(themeName),
              borderColor: THEME_BORDERS[themeName],
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>Loading...</Text>
        </View>
      </BlurView>
    );
  }

  return (
    <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
      <View
        style={[
          styles.cardContent,
          {
            backgroundColor: getBlurTint(themeName),
            borderColor: THEME_BORDERS[themeName],
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Aliqa' }]}>
          Time with Ariam
        </Text>
        <Text style={[styles.timeFormat, { color: theme.accent }]}>
          <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
            YY:MM:DD:HRS:MIN:SEC
          </Text>
        </Text>
        <View style={[styles.timeCardInner, { shadowColor: theme.accent }]}>
          {[...Array(10)].map((_, index) => ( // Reduced from 20 to 10
            <FloatingEmoji
              key={`bottom-${index}`}
              startPosition={100 + index * 10}
              side="bottom"
            />
          ))}
          <Text style={styles.timeText}>
            {`${timeWithAriam.years.toString().padStart(2, '0')}:${
              timeWithAriam.months.toString().padStart(2, '0')}:${
              timeWithAriam.days.toString().padStart(2, '0')}:${
              timeWithAriam.hours.toString().padStart(2, '0')}:${
              timeWithAriam.minutes.toString().padStart(2, '0')}:${
              timeWithAriam.seconds.toString().padStart(2, '0')}`}
          </Text>
          {[...Array(10)].map((_, index) => ( // Reduced from 20 to 10
            <FloatingEmoji
              key={`top-${index}`}
              startPosition={-100 - index * 10}
              side="top"
            />
          ))}
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              transform: [{
                translateX: linePosition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -200]
                })
              }]
            }}
          >
            <LinearGradient
              colors={[theme.accent, theme.text, theme.accent]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: '100%',
                width: '200%',
              }}
            />
          </Animated.View>
        </View>
      </View>
    </BlurView>
  );
};

export default function AriamScreen() {
  const { theme, themeName } = useThemeContext();
  const { wallpaper } = useWallpaperContext();
  const { playTrack, currentTrack, isPlaying: isMusicPlaying } = useMusicContext();
  const [currentTime, setCurrentTime] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [timeWithAriam, setTimeWithAriam] = useState(calculateTimeWithAriam());

  const [modalVisible, setModalVisible] = useState(false);
  const [memoryText, setMemoryText] = useState('');
  const [memoryImage, setMemoryImage] = useState<string | null>(null);
  const [memoryLocation, setMemoryLocation] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [memoryFullDetails, setMemoryFullDetails] = useState('');

  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const [voiceNoteListened, setVoiceNoteListened] = useState(false);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isVoiceNotePlaying, setIsVoiceNotePlaying] = useState(false);
  const [lastPlayedDate, setLastPlayedDate] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWithAriam(calculateTimeWithAriam());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadMemories = async () => {
      const savedMemories = await storage.getMemories();
      if (savedMemories.length > 0) {
        setMemories(savedMemories);
      }
    };
    loadMemories();
  }, []);

  useEffect(() => {
    const saveMemories = async () => {
      await storage.saveMemories(memories);
    };
    saveMemories();
  }, [memories]);

  useEffect(() => {
    const loadDescription = async () => {
      try {
        const savedDescription = await storage.getDescription();
        if (savedDescription) {
          setDescription(savedDescription);
        }
      } catch (error) {
        console.error('Error loading description:', error);
      }
    };
    loadDescription();
  }, []);

  const handleProfilePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const pickMemoryImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setMemoryImage(result.assets[0].uri);
    }
  };

  const addMemory = async (newMemory: Memory) => {
    const updatedMemories = [...memories, newMemory];
    setMemories(updatedMemories);
  };

  const deleteMemory = async (id: string) => {
    const updatedMemories = memories.filter(memory => memory.id !== id);
    setMemories(updatedMemories);
  };

  const handleVoiceNoteUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false,
      });

      if (!result.canceled) {
        setVoiceNote(result.assets[0].uri);
        await scheduleVoiceNoteReminder("Voice Note Reminder");
      }
    } catch (error) {
      console.error('Error picking voice note:', error);
    }
  };

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
    if (currentTrack && !isMusicPlaying) {
      playTrack(currentTrack.id);
    }
  }, [currentTrack, isMusicPlaying, playTrack]);

  const handlePlayVoiceNote = async () => {
    try {
      if (sound) {
        if (isVoiceNotePlaying) {
          await sound.pauseAsync();
          setIsVoiceNotePlaying(false);
        } else {
          await sound.playAsync();
          setIsVoiceNotePlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          defaultVoiceNote.audioFile,
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsVoiceNotePlaying(true);
        setLastPlayedDate(new Date().toISOString().split('T')[0]);

        newSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            setIsVoiceNotePlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing voice note:', error);
    }
  };

  useEffect(() => {
    const checkVoiceNotePlay = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (lastPlayedDate !== today) {
        await scheduleVoiceNoteReminder("Your wife will kill you if you don't listen to her voice note!");
      }
    };

    const interval = setInterval(checkVoiceNotePlay, 3600000);
    return () => clearInterval(interval);
  }, [lastPlayedDate]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const renderMemoryCard = ({ item }: { item: Memory }) => (
    <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
      <View
        style={[
          styles.memoryCard,
          {
            backgroundColor: getBlurTint(themeName),
            borderColor: THEME_BORDERS[themeName],
            borderWidth: 2,
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.memoryCard, { backgroundColor: theme.cardBackground }]}
          onPress={() => {
            setSelectedMemory(item);
            setDetailModalVisible(true);
          }}
        >
          <View style={styles.memoryContent}>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.memoryThumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.memoryDetails}>
              <View style={styles.memoryCardHeader}>
                <Text style={[styles.memoryTitle, { color: theme.text }]}>
                  {item.text || 'Untitled Memory'}
                </Text>
                <TouchableOpacity onPress={() => deleteMemory(item.id)}>
                  <Text style={styles.deleteText}>🗑</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.memoryMeta, { color: theme.textSecondary }]}>
                {item.date}
              </Text>
              {item.location && (
                <Text style={[styles.memoryMeta, { color: theme.textSecondary }]}>
                  📍 {item.location}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  const handleEditDescription = useCallback(() => {
    setIsEditingDescription(true);
  }, []);

  const handleSaveDescription = async () => {
    try {
      await storage.saveDescription(description);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Error', 'Failed to save description. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={wallpaper ? { uri: wallpaper } : undefined}
      style={[styles.mainContainer, { backgroundColor: theme.background }]}
      resizeMode="cover"
    >
      <View style={styles.contentContainer}>
        <FlatList
          data={memories}
          ListHeaderComponent={() => (
            <>
              {/* Header */}
              <View style={[styles.header, {
                backgroundColor: theme.cardBackground,
                borderBottomColor: THEME_BORDERS[themeName],
              }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Ariam
                </Text>
              </View>

              {/* Profile Card */}
              <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
                <View style={[styles.cardContent, {
                  backgroundColor: getBlurTint(themeName),
                  borderColor: THEME_BORDERS[themeName],
                  borderWidth: 2,
                }]}>
                  <TouchableOpacity
                    style={styles.profilePicContainer}
                    onPress={handleProfilePicture}
                  >
                    {profilePicture ? (
                      <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                    ) : (
                      <View style={styles.placeholderPic} />
                    )}
                  </TouchableOpacity>
                  {isEditingDescription ? (
                    <>
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="About..."
                        placeholderTextColor="#666"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                      />
                      <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.accent }]}
                        onPress={handleSaveDescription}
                      >
                        <Text style={styles.saveButtonText}>Save Details</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.descriptionContainer}>
                      <Text style={[styles.descriptionText, { color: theme.text }]}>
                        {description || 'No description'}
                      </Text>
                      <TouchableOpacity onPress={handleEditDescription}>
                        <Text style={styles.editIcon}>✏️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </BlurView>

              {/* Voice Note Card */}
              <BlurView intensity={65} tint={themeName} style={styles.blurContainer}>
                <View style={[styles.cardContent, {
                  backgroundColor: getBlurTint(themeName),
                  borderColor: THEME_BORDERS[themeName],
                  borderWidth: 2,
                }]}>
                  <Text style={[styles.cardTitle, { color: theme.text, fontFamily: 'Aliqa' }]}>
                    Voice Note
                  </Text>
                  <View style={styles.voiceNoteContainer}>
                    <Image
                      source={defaultVoiceNote.albumArt}
                      style={styles.voiceNoteAlbumArt}
                    />
                    <View style={styles.voiceNoteInfo}>
                      <View style={styles.voiceNoteTitleContainer}>
                        <Text 
                          style={[
                            styles.voiceNoteTitle, 
                            { 
                              color: theme.text,
                              fontFamily: 'Aliqa'
                            }
                          ]}
                        >
                          {defaultVoiceNote.title}
                        </Text>
                        <Text 
                          style={[
                            styles.voiceNoteAuthor, 
                            { 
                              color: theme.textSecondary,
                              fontFamily: 'Aliqa'
                            }
                          ]}
                        >
                          {defaultVoiceNote.author}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.playButton, { backgroundColor: theme.accent }]}
                      onPress={handlePlayVoiceNote}
                    >
                      <Text style={styles.playButtonText}>
                        {isVoiceNotePlaying ? '⏸' : '▶️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>

              {/* Time Card */}
              <TimeCard timeWithAriam={timeWithAriam} />

              {/* Memories Header */}
              <View style={styles.memoriesHeader}>
                <Text style={[styles.sectionHeader, { color: theme.text }]}>
                  Memories
                </Text>
                <TouchableOpacity
                  style={[styles.addMemoryButton, { backgroundColor: theme.accent }]}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addMemoryButtonText}>+ Add Memory</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          keyExtractor={(item) => item.id}
          renderItem={renderMemoryCard}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Memory Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.modalHeader, { color: theme.text }]}>Add New Memory</Text>
              
              <TextInput
                style={[styles.input, { color: theme.text, minHeight: 80 }]}
                placeholder="Memory details..."
                placeholderTextColor="#666"
                value={memoryText}
                onChangeText={setMemoryText}
                multiline
              />

              <TextInput
                style={[styles.input, { color: theme.text, minHeight: 120 }]}
                placeholder="Full details (optional)..."
                placeholderTextColor="#666"
                value={memoryFullDetails}
                onChangeText={setMemoryFullDetails}
                multiline
              />
              
              <TextInput
                style={[styles.input, { color: theme.text, minHeight: 50 }]}
                placeholder="Location..."
                placeholderTextColor="#666"
                value={memoryLocation}
                onChangeText={setMemoryLocation}
              />

              <TextInput
                style={[styles.input, { color: theme.text, minHeight: 50 }]}
                placeholder="Date (YYYY-MM-DD)..."
                placeholderTextColor="#666"
                value={memoryDate}
                onChangeText={setMemoryDate}
              />
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.accent }]}
                onPress={pickMemoryImage}
              >
                <Text style={styles.uploadButtonText}>Choose Image</Text>
              </TouchableOpacity>

              {memoryImage && (
                <Image 
                  source={{ uri: memoryImage }} 
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.accent }]}
                  onPress={() => {
                    if (!memoryText) {
                      Alert.alert('Error', 'Please enter memory details');
                      return;
                    }
                    addMemory({
                      id: Date.now().toString(),
                      text: memoryText,
                      fullDetails: memoryFullDetails,
                      image: memoryImage,
                      location: memoryLocation,
                      date: memoryDate || new Date().toISOString().split('T')[0],
                    });
                    setModalVisible(false);
                    setMemoryText('');
                    setMemoryFullDetails('');
                    setMemoryImage(null);
                    setMemoryLocation('');
                    setMemoryDate('');
                  }}
                >
                  <Text style={styles.uploadButtonText}>Save Memory</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.error }]}
                  onPress={() => {
                    setModalVisible(false);
                    setMemoryImage(null);
                    setMemoryLocation('');
                    setMemoryDate('');
                  }}
                >
                  <Text style={styles.uploadButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 0, // Remove top padding
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 10,
    borderBottomColor: '#9370db', // Purple border
    elevation: 8, // Android shadow
    shadowColor: '#9370db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    height: Platform.OS === 'ios' ? 100 : 110,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 42,
    textAlign: 'center',
    fontFamily: 'Aliqa',
    marginTop: Platform.OS === 'ios' ? 35 : 20,
    letterSpacing: 1,
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Aliqa',
  },
  profilePicContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  placeholderPic: {
    width: '100%',
    height: '100%',
    backgroundColor: '#444',
  },
  input: {
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: '#fff',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4b8a4b',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 16,
    flex: 1,
  },
  editIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    justifyContent: 'center',
  },
  voiceNoteTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  voiceNoteTitle: {
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Aliqa',
    textAlign: 'left',
  },
  voiceNoteAuthor: {
    fontSize: 20,
    marginTop: 8,
    fontFamily: 'Aliqa',
    textAlign: 'left',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  timeCardInner: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 80,
  },
  timeText: {
    fontSize: 20,
    fontFamily: 'Maria',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  memoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addMemoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  addMemoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#1f1f1f',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
  },
  modalButton: {
    flex: 0.48,
    backgroundColor: '#6a5acd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  memoryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  memoryContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  memoryThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  memoryDetails: {
    flex: 1,
  },
  memoryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 16,
  },
  memoryMeta: {
    fontSize: 12,
  },
});