export const THEME_BORDERS = {
  default: '#ffffff',
  purpleNebula: '#9370db',
  deepSpace: '#4b0082',
  cosmicRose: '#ff69b4',
  love: '#ff1493'
};

export const getBlurTint = (themeName: string) => {
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