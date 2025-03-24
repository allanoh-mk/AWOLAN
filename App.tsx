// App.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, LogBox, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './context/ThemeContext';
import { MusicProvider } from './context/MusicContext';
import { WallpaperProvider } from './context/WallpaperContext';
import * as Font from 'expo-font';
import { DataProvider } from './context/DataContext';
import { Audio } from 'expo-av';
import { registerForPushNotificationsAsync } from './utils/notifications';
import { enableScreens } from 'react-native-screens';

// Enable native screens
enableScreens();

// Ignore non-critical warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const splashIcon = require('./assets/images/splash-icon.png');

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in animation
  const [scaleAnim] = useState(new Animated.Value(0.8)); // For scaling animation

  useEffect(() => {
    async function prepare() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          'Love': require('./assets/fonts/Love.ttf'),
          'Maria': require('./assets/fonts/Maria.ttf'),
          'Game of Squids': require('./assets/fonts/GameofSquids.ttf'),
          'Pacifico-Regular': require('./assets/fonts/Pacifico-Regular.ttf'),
        });

        // Configure audio
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Initialize notifications
        await registerForPushNotificationsAsync();

        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsAppReady(true);
        });
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = async () => {
    if (isAppReady) {
      // Hide the splash screen once the app is ready
      await SplashScreen.hideAsync();
    }
  };

  if (!isAppReady) {
    return (
      <View style={styles.splashContainer}>
        <Animated.Image
          source={splashIcon}
          style={[
            styles.splashIcon,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <View style={styles.borderLines}>
          <Animated.View style={[styles.pinkLine, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.aquaLine, { opacity: fadeAnim }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <WallpaperProvider>
          <DataProvider>
            <MusicProvider>
              <AppNavigator />
            </MusicProvider>
          </DataProvider>
        </WallpaperProvider>
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    width: 150,
    height: 150,
  },
  borderLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pinkLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#E91E63',
  },
  aquaLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#00FFFF',
  },
});
