import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Platform,
  ImageBackground,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeContext } from '../context/ThemeContext';
import { useWallpaperContext } from '../context/WallpaperContext';
import { useDataContext } from '../context/DataContext';
import moment from 'moment';
import { scheduleEventReminder } from '../utils/notifications';
import { THEME_BORDERS, getBlurTint } from '../utils/themeUtils';

interface EventItem {
  name: string;
  date: string;
  location: string;
  image: string | null;
}

export default function EventsScreen() {
  const { theme, themeName } = useThemeContext(); // Add themeName
  const { wallpaper } = useWallpaperContext();
  const { events, setEvents } = useDataContext();
  const [currentTime, setCurrentTime] = useState(moment().format('HH:mm:ss'));

  // Modal controls
  const [modalVisible, setModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventImage, setEventImage] = useState<string | null>(null);

  const openModal = () => setModalVisible(true);

  const closeModal = () => {
    setEventName('');
    setEventDate('');
    setEventLocation('');
    setEventImage(null);
    setModalVisible(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setEventImage(result.assets[0].uri);
    }
  };

  const addEvent = (event: EventItem) => {
    setEvents([...events, event]);
  };

  const handleAddEvent = async (event: EventItem) => {
    addEvent(event);
    try {
      await scheduleEventReminder(event.name, new Date(event.date));
    } catch (error) {
      console.error('Error scheduling event reminder:', error);
    }
  };

  const deleteEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  // Update the return section
  return (
    <ImageBackground
      source={wallpaper ? { uri: wallpaper } : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.cardBackground,
          borderBottomColor: THEME_BORDERS[themeName],
        }
      ]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Events</Text>
      </View>

      {/* Events List */}
      <ScrollView style={styles.content}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionHeader, { color: theme.text }]}>Upcoming Events</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.accent }]} 
            onPress={openModal}
          >
            <Text style={styles.addButtonText}>+ Add Event</Text>
          </TouchableOpacity>
        </View>

        {events.map((event, index) => (
          <View 
            key={index} 
            style={[
              styles.eventCard, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2,
              }
            ]}
          >
            {event.image && (
              <Image source={{ uri: event.image }} style={styles.eventImage} />
            )}
            <View style={styles.eventDetails}>
              <View style={styles.eventHeader}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>{event.name}</Text>
                <TouchableOpacity onPress={() => deleteEvent(index)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.eventInfo, { color: theme.textSecondary }]}>📅 {event.date}</Text>
              <Text style={[styles.eventInfo, { color: theme.textSecondary }]}>📍 {event.location}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer, 
            { 
              backgroundColor: getBlurTint(themeName),
              borderColor: THEME_BORDERS[themeName],
              borderWidth: 2,
            }
          ]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Event</Text>
            
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
              placeholder="Event Name"
              placeholderTextColor={theme.textSecondary}
              value={eventName}
              onChangeText={setEventName}
            />
            
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
              placeholder="Date (DD/MM/YYYY)"
              placeholderTextColor={theme.textSecondary}
              value={eventDate}
              onChangeText={setEventDate}
            />
            
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
              placeholder="Location"
              placeholderTextColor={theme.textSecondary}
              value={eventLocation}
              onChangeText={setEventLocation}
            />

            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerText}>
                {eventImage ? 'Change Image' : 'Add Image'}
              </Text>
            </TouchableOpacity>

            {eventImage && (
              <Image source={{ uri: eventImage }} style={styles.previewImage} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, !eventName && styles.disabledButton]} 
                onPress={() => handleAddEvent({ name: eventName, date: eventDate, location: eventLocation, image: eventImage })}
                disabled={!eventName}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// Update the StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0, // Remove top padding
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    borderWidth: 2, // Add border width
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventDetails: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  deleteText: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    borderWidth: 2, // Add border width
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  imagePickerButton: {
    backgroundColor: '#6a5acd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6a5acd',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

// Common styles to add to each screen's StyleSheet
const commonStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 10,
    borderBottomColor: '#9370db',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#9370db',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    marginTop: 0,
    height: Platform.OS === 'ios' ? 100 : 110,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
