import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Image,
  ImageBackground,
  FlatList,
} from 'react-native';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { THEME_BORDERS, getBlurTint } from '../utils/themeUtils';
import { useThemeContext } from '../context/ThemeContext';
import { useWallpaperContext } from '../context/WallpaperContext';
import { useFonts } from 'expo-font';

interface VideoItem {
  id: string;
  uri: string;
  thumbnail: string | null;
  details: string;
  location: string;
  date: string;
}

export default React.memo(function VideoScreen() {
  // Context hooks first
  const { theme, themeName } = useThemeContext();
  const { wallpaper } = useWallpaperContext();

  // Font loading
  const [fontsLoaded] = useFonts({
    GameofSquids: require('../assets/fonts/GameofSquids.ttf'),
  });

  // State hooks
  const [memories, setMemories] = useState<VideoItem[]>([]);
  const [goals, setGoals] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState<'memory' | 'goal' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<VideoItem>>({
    uri: '',
    thumbnail: null,
    details: '',
    location: '',
    date: moment().format('YYYY-MM-DD'),
  });

  // Callback hooks
  const handleUploadVideo = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        try {
          const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, {
            time: 1000,
            quality: 0.5, // Add quality parameter to ensure better performance
          });

          setNewVideo({
            ...newVideo,
            uri: videoUri,
            thumbnail: thumbnail.uri,
          });
          setIsUploadModalVisible(true);
        } catch (thumbnailError) {
          console.warn('Error generating thumbnail:', thumbnailError);
          // Still allow upload even if thumbnail generation fails
          setNewVideo({
            ...newVideo,
            uri: videoUri,
            thumbnail: null,
          });
          setIsUploadModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  }, [newVideo]);

  const saveUploadedVideo = useCallback(() => {
    const videoToSave: VideoItem = {
      id: Date.now().toString(),
      uri: newVideo.uri || '',
      thumbnail: newVideo.thumbnail || null,
      details: newVideo.details || '',
      location: newVideo.location || '',
      date: newVideo.date || moment().format('YYYY-MM-DD'),
    };

    if (uploadType === 'memory') {
      setMemories([...memories, videoToSave]);
    } else if (uploadType === 'goal') {
      setGoals([...goals, videoToSave]);
    }

    // Reset state and close modal
    setNewVideo({ uri: '', details: '', location: '', date: '' });
    setUploadType(null);
    setIsUploadModalVisible(false);
  }, [newVideo, uploadType, memories, goals]);

  const deleteVideo = useCallback((type: 'memory' | 'goal', id: string) => {
    if (type === 'memory') {
      setMemories(prev => prev.filter((video) => video.id !== id));
    } else {
      setGoals(prev => prev.filter((video) => video.id !== id));
    }
  }, []);

  const handleConfirmDate = useCallback((date: Date) => {
    setNewVideo({
      ...newVideo,
      date: moment(date).format('YYYY-MM-DD'),
    });
    setShowDatePicker(false);
  }, [newVideo]);

  const handleCancelDate = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const onDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewVideo({
        ...newVideo,
        date: moment(selectedDate).format('YYYY-MM-DD'),
      });
    }
  }, [newVideo]);

  const renderVideoCard = useCallback((item: VideoItem, type: 'memory' | 'goal') => (
    <BlurView intensity={65} tint={getBlurTint(themeName)} style={styles.blurContainer}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: getBlurTint(themeName),
            borderColor: THEME_BORDERS[themeName],
            borderWidth: 2,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setSelectedVideo(item);
            setIsModalVisible(true);
          }}
        >
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
          ) : (
            <Video
              source={{ uri: item.uri }}
              style={styles.video}
              resizeMode="cover"
              isMuted
            />
          )}
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={[styles.details, { color: theme.text }]}>
            {item.details || 'No details provided'}
          </Text>
          <Text style={[styles.location, { color: theme.text }]}>
            {item.location || 'No location provided'}
          </Text>
          {type === 'memory' && (
            <Text style={[styles.date, { color: theme.text }]}>
              {item.date || 'No date provided'}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.accent }]}
            onPress={() => deleteVideo(type, item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  ), [theme, themeName]);

  // Memoized values
  const memoizedMemories = useMemo(() => memories, [memories]);
  const memoizedGoals = useMemo(() => goals, [goals]);

  // Loading state
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={wallpaper ? { uri: wallpaper } : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
      resizeMode="cover"
    >
      <View style={styles.contentContainer}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Videos</Text>
        </View>
        <FlatList
          data={memoizedMemories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderVideoCard(item, 'memory')}
          ListHeaderComponent={() => (
            <>
              <Text style={[styles.sectionHeader, { color: theme.text }]}>Memories</Text>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  setUploadType('memory');
                  handleUploadVideo();
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Memory Video</Text>
              </TouchableOpacity>
            </>
          )}
        />
        <FlatList
          data={memoizedGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderVideoCard(item, 'goal')}
          ListHeaderComponent={() => (
            <>
              <Text style={[styles.sectionHeader, { color: theme.text }]}>Goals</Text>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  setUploadType('goal');
                  handleUploadVideo();
                }}
              >
                <Text style={styles.uploadButtonText}>Upload Goal Video</Text>
              </TouchableOpacity>
            </>
          )}
        />

        {/* Video Playback Modal */}
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {selectedVideo && (
                <Video
                  source={{ uri: selectedVideo.uri }}
                  style={styles.modalVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay // Ensure the video starts playing
                />
              )}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.accent }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Upload Details Modal */}
        <Modal visible={isUploadModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Upload Video Details
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter details..."
                placeholderTextColor="#aaa"
                value={newVideo.details}
                onChangeText={(text) => setNewVideo({ ...newVideo, details: text })}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter location..."
                placeholderTextColor="#aaa"
                value={newVideo.location}
                onChangeText={(text) => setNewVideo({ ...newVideo, location: text })}
              />
              <TouchableOpacity
                style={[styles.input, { color: theme.text }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.inputText, { color: theme.text }]}>
                  {newVideo.date ? moment(newVideo.date).format('MMMM D, YYYY') : 'Select Date'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={moment(newVideo.date || new Date()).toDate()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  style={{ backgroundColor: theme.background }}
                />
              )}

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.accent }]}
                onPress={saveUploadedVideo}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 10,
    elevation: 8,
    shadowColor: '#9370db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontFamily: 'Maria',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: 'GameofSquids',
    marginVertical: 16,
    textAlign: 'center',
  },
  blurContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  video: {
    width: '100%',
    height: 200,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  details: {
    fontSize: 16,
    fontFamily: 'Maria',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Maria',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Maria',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Maria',
    color: '#fff',
  },
  uploadButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Maria',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#000',
  },
  modalVideo: {
    width: '100%',
    height: 300,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Maria',
    color: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Maria',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Maria',
    color: '#fff',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Maria',
    color: '#fff',
    padding: 8,
  },
  contentContainer: {
    flex: 1,
  },
});