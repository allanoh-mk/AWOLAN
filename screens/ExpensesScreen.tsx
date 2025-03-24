import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ImageBackground,
  SafeAreaView,
  Platform,  // Add this import
} from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useWallpaperContext } from '../context/WallpaperContext';
import { useMusicContext } from '../context/MusicContext';
import { THEME_BORDERS, getBlurTint } from '../utils/themeUtils';

interface ExpenseItem {
  name: string;
  amount: string;
  category: string;
  place: string;
}

export default function ExpensesScreen() {
  const { theme, themeName } = useThemeContext(); // Add themeName
  const { wallpaper } = useWallpaperContext();
  const { playTrack, currentTrack, isPlaying } = useMusicContext();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // Modal controls
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expensePlace, setExpensePlace] = useState('');

  const openModal = () => setModalVisible(true);

  const closeModal = () => {
    setExpenseName('');
    setExpenseAmount('');
    setExpenseCategory('');
    setExpensePlace('');
    setModalVisible(false);
  };

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      name: expenseName,
      amount: expenseAmount,
      category: expenseCategory,
      place: expensePlace,
    };
    setExpenses([...expenses, newExpense]);
    closeModal();
  };

  const deleteExpense = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

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
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with new Love font */}
        <View style={[
          styles.header, 
          { 
            backgroundColor: theme.cardBackground,
            borderBottomColor: THEME_BORDERS[themeName]
          }
        ]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Expenses</Text>
        </View>

        {/* Status text with Maria font */}
        <Text style={[styles.status, { color: theme.textSecondary }]}>
          Track your daily spending
        </Text>

        <ScrollView style={styles.content}>
          {/* Section Header */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionHeader, { color: theme.text }]}>Recent</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.accent }]} 
              onPress={openModal}
            >
              <Text style={[styles.addButtonText, { color: theme.text }]}>+ Add Expense</Text>
            </TouchableOpacity>
          </View>

          {expenses.map((exp, index) => (
            <View 
              key={index} 
              style={[
                styles.expenseCard, 
                { 
                  backgroundColor: getBlurTint(themeName),
                  borderColor: THEME_BORDERS[themeName],
                  borderWidth: 2
                }
              ]}
            >
              <View style={styles.expenseCardHeader}>
                <Text style={[styles.expenseTitle, { color: theme.text }]}>{exp.name}</Text>
                <TouchableOpacity onPress={() => deleteExpense(index)}>
                  <Text style={styles.deleteText}>🗑</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.expenseSubText, { color: theme.textSecondary }]}>
                {exp.category} • {exp.place} • KES {exp.amount}
              </Text>
            </View>
          ))}

          {/* Add Expense Modal */}
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
                <Text style={[styles.modalHeader, { color: theme.text }]}>Add Expense</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  placeholder="Expense Name"
                  placeholderTextColor={theme.textSecondary}
                  value={expenseName}
                  onChangeText={setExpenseName}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  placeholder="Expense Amount"
                  placeholderTextColor={theme.textSecondary}
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  placeholder="Expense Category"
                  placeholderTextColor={theme.textSecondary}
                  value={expenseCategory}
                  onChangeText={setExpenseCategory}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  placeholder="Expense Place"
                  placeholderTextColor={theme.textSecondary}
                  value={expensePlace}
                  onChangeText={setExpensePlace}
                />
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.accent }]} onPress={addExpense}>
                  <Text style={styles.modalButtonText}>Save Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.buttonSecondary }]} onPress={closeModal}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    flex: 1,
    padding: 16,
    paddingTop: 16, // Increased top padding
  },
  headerContainer: {
    paddingVertical: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerText: { fontSize: 32, fontWeight: 'bold', fontStyle: 'italic' },
  subHeader: { fontSize: 16, marginTop: 8 },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: { fontSize: 24, fontWeight: '600' },
  addButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { fontSize: 16 },
  expenseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2, // Add border width
  },
  expenseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseTitle: { fontSize: 20, fontWeight: '600' },
  expenseSubText: { fontSize: 14 },
  deleteText: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
  modalContainer: { 
    marginHorizontal: 20, 
    borderRadius: 16, 
    padding: 24,
    borderWidth: 2, // Add border width
  },
  modalHeader: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 12 },
  modalButton: { borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  modalButtonText: { fontSize: 16 },
  footer: { padding: 20, alignItems: 'center' },
  time: { fontSize: 18, fontWeight: '600' },
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
    fontFamily: 'Pacifico-Regular',
    marginTop: Platform.OS === 'ios' ? 35 : 20,
    letterSpacing: 1,
    position: 'absolute',
    bottom: 15, // Position from bottom
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Maria', // Using Maria font
    paddingVertical: 12,
    marginTop: 8,
  },
});
