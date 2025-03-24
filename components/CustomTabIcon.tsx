import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import SavingsScreen from '../screens/SavingsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AriamScreen from '../screens/AriamScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        // Common styling for the tab bar
        screenOptions={({ route }) => ({
          headerShown: false, // Hide top header if you prefer
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Events':
                iconName = focused ? 'notifications' : 'notifications-outline';
                break;
              case 'Savings':
                iconName = focused ? 'tv' : 'tv-outline';
                break;
              case 'Expenses':
                iconName = focused ? 'cash' : 'cash-outline';
                break;
              case 'Ariam':
                iconName = focused ? 'heart' : 'heart-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#E91E63',
          tabBarInactiveTintColor: '#aaa',
          // Optional: further styling of the tab bar itself
          tabBarStyle: {
            backgroundColor: '#000', // or any color
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Savings" component={SavingsScreen} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} />
        <Tab.Screen name="Ariam" component={AriamScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
