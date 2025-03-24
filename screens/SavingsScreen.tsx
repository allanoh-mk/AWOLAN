import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  ImageBackground,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { useThemeContext } from '../context/ThemeContext';
import { useWallpaperContext } from '../context/WallpaperContext';
import { useMusicContext } from '../context/MusicContext';
import { useDataContext } from '../context/DataContext';
import { scheduleSavingsReminder } from '../utils/notifications';
import { THEME_BORDERS, getBlurTint } from '../utils/themeUtils';

interface SavingItem {
  amount: string;
  purpose: string;
  maturityDate: string;
  progress?: number;
  pinned?: boolean;
  goalAmount?: string;
}

export default function SavingsScreen() {
  const { theme, themeName } = useThemeContext(); // Add themeName
  const { wallpaper } = useWallpaperContext();
  const { playTrack, currentTrack, isPlaying } = useMusicContext();
  const { savings, setSavings } = useDataContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [pinNew, setPinNew] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setAmount('');
    setPurpose('');
    setMaturityDate('');
    setGoalAmount('');
    setPinNew(false);
    setModalVisible(false);
  };

  const handleAddSaving = async (saving: SavingItem) => {
    // ...existing add saving code...
    
    try {
      await scheduleSavingsReminder(saving.purpose, new Date(saving.maturityDate));
    } catch (error) {
      console.error('Error scheduling savings reminder:', error);
    }
  };

  const addSaving = () => {
    if (!amount || !purpose || !maturityDate || !goalAmount) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    const newSaving: SavingItem = {
      amount,
      purpose,
      maturityDate,
      progress: parseFloat(amount) / parseFloat(goalAmount) || 0,
      pinned: pinNew,
      goalAmount,
    };
    setSavings([...savings, newSaving]);
    closeModal();
    handleAddSaving(newSaving);
  };

  const deleteSaving = (index: number) => {
    setSavings(savings.filter((_, i) => i !== index));
  };

  const togglePin = (index: number) => {
    const updated = savings.map((saving, i) =>
      i === index ? { ...saving, pinned: !saving.pinned } : saving
    );
    setSavings(updated);
  };

  const sortedSavings = [...savings].sort((a, b) =>
    a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : 0
  );

  useEffect(() => {
    if (currentTrack && !isPlaying) {
      playTrack(currentTrack.id);
    }
  }, [currentTrack, isPlaying, playTrack]);

  const handlePinSaving = (index: number) => {
    const newSavings = savings.map((saving, i) => ({
      ...saving,
      pinned: i === index ? !saving.pinned : false
    }));
    setSavings(newSavings);
  };

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
          borderBottomColor: THEME_BORDERS[themeName]
        }
      ]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Savings
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={[styles.subHeader, { color: theme.textSecondary }]}>Plan your financial goals</Text>
        </View>

        <View style={styles.sectionHeaderContainer}>
          <Text style={[styles.sectionHeader, { color: theme.text }]}>Your Savings</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.accent }]} onPress={openModal}>
            <Text style={styles.addButtonText}>+ Add Savings</Text>
          </TouchableOpacity>
        </View>

        {sortedSavings.map((sv, index) => (
          <View 
            key={index} 
            style={[
              styles.savingCard, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}
          >
            <View style={styles.savingCardHeader}>
              <Text style={[styles.savingTitle, { color: theme.text }]}>{sv.purpose}</Text>
              <View style={styles.savingActions}>
                <TouchableOpacity onPress={() => togglePin(index)}>
                  <Text style={[styles.pinText, sv.pinned ? styles.pinned : { color: theme.textSecondary }]}>
                    {sv.pinned ? '📌' : '📍'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteSaving(index)}>
                  <Text style={styles.deleteText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.savingSubText, { color: theme.textSecondary }]}>
              Amount: KES {sv.amount} / {sv.goalAmount} • Maturity: {sv.maturityDate}
            </Text>
            <Progress.Bar progress={sv.progress} width={null} color={theme.accent} unfilledColor={theme.buttonSecondary} borderWidth={0} style={styles.progressBar} />
          </View>
        ))}

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer, 
              { 
                backgroundColor: getBlurTint(themeName),
                borderColor: THEME_BORDERS[themeName],
                borderWidth: 2
              }
            ]}>
              <Text style={[styles.modalHeader, { color: theme.text }]}>Add Savings</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Amount"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Purpose"
                placeholderTextColor={theme.textSecondary}
                value={purpose}
                onChangeText={setPurpose}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Maturity Date (YYYY-MM-DD)"
                placeholderTextColor={theme.textSecondary}
                value={maturityDate}
                onChangeText={setMaturityDate}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Goal Amount"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={goalAmount}
                onChangeText={setGoalAmount}
              />
              <View style={styles.pinContainer}>
                <Text style={[styles.pinLabel, { color: theme.text }]}>Pin this saving?</Text>
                <TouchableOpacity onPress={() => setPinNew(!pinNew)}>
                  <Text style={[styles.pinToggle, pinNew ? { color: theme.accent } : { color: theme.textSecondary }]}>
                    {pinNew ? '📌' : '📍'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.accent }]} onPress={addSaving}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.buttonSecondary }]} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 25,
  },
  subHeader: {
    fontSize: 14,
    fontFamily: 'Maria', // Added Maria font
    textAlign: 'center',
    marginTop: 8,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  savingCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2, // Add border width
  },
  savingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 20,
    marginLeft: 10,
  },
  savingSubText: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    borderWidth: 2, // Add border width
  },
  modalHeader: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
  },
  pinLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  pinToggle: {
    fontSize: 20,
  },
  pinText: {
    fontSize: 20,
  },
  pinned: {
    color: '#FFD700',  // Gold color for pinned items
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
