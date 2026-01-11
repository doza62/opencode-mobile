// Jest setup file
// This file runs before all tests

// Increase timeout for async tests
jest.setTimeout(10000);

// Suppress console logs during tests unless debugging
if (process.env.DEBUG !== 'true') {
  global.console = {
    ...global.console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}
