module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.js'],
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};
