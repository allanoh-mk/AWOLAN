import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface DataContextType {
  events: EventItem[];
  setEvents: (events: EventItem[]) => void;
  savings: SavingItem[];
  setSavings: (savings: SavingItem[]) => void;
  voiceNote: string | null;
  setVoiceNote: (note: string | null) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEventsState] = useState<EventItem[]>([]);
  const [savings, setSavingsState] = useState<SavingItem[]>([]);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  // Load stored data on initial mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData('events', events);
  }, [events]);

  useEffect(() => {
    saveData('savings', savings);
  }, [savings]);

  const loadStoredData = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('events');
      const storedSavings = await AsyncStorage.getItem('savings');
      if (storedEvents) setEventsState(JSON.parse(storedEvents));
      if (storedSavings) setSavingsState(JSON.parse(storedSavings));
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const setEvents = (newEvents: EventItem[]) => {
    setEventsState(newEvents);
  };

  const setSavings = (newSavings: SavingItem[]) => {
    setSavingsState(newSavings);
  };

  return (
    <DataContext.Provider value={{ 
      events, 
      setEvents, 
      savings, 
      setSavings,
      voiceNote,
      setVoiceNote
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};