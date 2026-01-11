// Basic logger service unit tests

describe('Logger Service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should export a logger object with required methods', () => {
    const { logger } = require('@/shared/services/logger');
    
    expect(logger).toBeDefined();
    expect(typeof logger.tag).toBe('function');
  });

  it('should create tagged loggers with expected interface', () => {
    const { logger } = require('@/shared/services/logger');
    const taggedLogger = logger.tag('TestFeature');
    
    expect(taggedLogger).toBeDefined();
    expect(typeof taggedLogger.debug).toBe('function');
    expect(typeof taggedLogger.info).toBe('function');
    expect(typeof taggedLogger.warn).toBe('function');
    expect(typeof taggedLogger.error).toBe('function');
  });
});
