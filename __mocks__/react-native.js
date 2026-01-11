// Mock react-native module for Jest testing
module.exports = {
  __DEV__: false,
  Platform: {
    OS: 'ios',
    select: () => 'ios',
  },
  StyleSheet: {
    create: () => ({}),
  },
  Animated: {
    timing: () => ({
      start: jest.fn(),
    }),
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
  },
  Easing: {
    bezier: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    addEventListener: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  NetInfo: {
    fetch: jest.fn(),
    addEventListener: jest.fn(),
  },
};
