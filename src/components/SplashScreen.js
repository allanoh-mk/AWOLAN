import React from 'react';
import { Image } from 'react-native';

export const SplashScreen = () => {
  return (
    <Image 
      source={require('../../assets/images/splash-icon.png')}
      style={styles.splashImage}
    />
  );
};