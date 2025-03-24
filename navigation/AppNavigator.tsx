import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import SavingsScreen from '../screens/SavingsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AriamScreen from '../screens/AriamScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VideoScreen from '../screens/VideoScreen';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Events':
                iconName = focused ? 'calendar' : 'calendar-outline';
                break;
              case 'Savings':
                iconName = focused ? 'wallet' : 'wallet-outline';
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
              case 'Videos':
                return <MaterialIcons name="video-library" color={color} size={size} />;
              default:
                iconName = 'alert';
            }
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#E91E63',
          tabBarInactiveTintColor: '#aaa',
          headerShown: false,
          freezeOnBlur: true,
          lazy: false,
          unmountOnBlur: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Events" component={EventsScreen} />
        <Tab.Screen name="Savings" component={SavingsScreen} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} />
        <Tab.Screen name="Ariam" component={AriamScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen
          name="Videos"
          component={VideoScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="video-library" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
