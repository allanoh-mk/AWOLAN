import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeContext } from '../context/ThemeContext';

interface BlurCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const BlurCard = ({ children, style }: BlurCardProps) => {
  const { themeName, theme } = useThemeContext();

  const getBlurTint = () => {
    switch (themeName) {
      case 'purpleNebula':
        return 'rgba(147, 112, 219, 0.2)';
      case 'deepSpace':
        return 'rgba(25, 25, 25, 0.3)';
      case 'cosmicRose':
        return 'rgba(255, 105, 180, 0.2)';
      case 'love':
        return 'rgba(255, 20, 147, 0.2)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <BlurView intensity={65} tint={themeName} style={[styles.blurContainer, style]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
});