const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add path aliases for cleaner imports
config.resolver.alias = {
  '@': './src',
  '@services': './src/services',
  '@features': './src/features',
  '@shared': './src/shared',
  '@components': './src/components',
  '@screens': './src/screens',
  '@hooks': './src/hooks'
};

module.exports = config;