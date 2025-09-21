// tests/utils/logger.test.js
// Comprehensive tests for the logger system

import { 
  Logger, 
  logger, 
  handleAsyncError, 
  safeContentOperation 
} from '../../app/utils/logger';
import { ValidationError, SecurityError } from '../../app/utils/errorSystem';

// Mock console methods
const originalConsole = global.console;

describe('Logger System', () => {
  let mockConsole;

  beforeEach(() => {
    // Mock console methods
    mockConsole = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
    global.console = mockConsole;

    // Reset environment
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    global.console = originalConsole;
    jest.clearAllMocks();
  });

  describe('Logger class', () => {
    describe('error logging', () => {
      test('should log error message in development', () => {
        const testLogger = new Logger();
        const error = new Error('Test error');
        const context = { component: 'test' };

        testLogger.error('Test message', error, context);

        expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test message');
        expect(mockConsole.error).toHaveBeenCalledWith('Error:', error);
        expect(mockConsole.error).toHaveBeenCalledWith('Context:', context);
      });

      test('should log Z-Beam error details in development', () => {
        const testLogger = new Logger();
        const error = new ValidationError('Invalid input', { field: 'test' });

        testLogger.error('Validation failed', error);

        expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Validation failed');
        expect(mockConsole.error).toHaveBeenCalledWith('Error Details:', expect.objectContaining({
          code: 'VALIDATION_ERROR',
          category: 'validation',
          message: 'Invalid input'
        }));
      });

      test('should handle error without context', () => {
        const testLogger = new Logger();
        const error = new Error('Test error');

        testLogger.error('Test message', error);

        expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test message');
        expect(mockConsole.error).toHaveBeenCalledWith('Error:', error);
      });

      test('should handle message without error', () => {
        const testLogger = new Logger();

        testLogger.error('Test message');

        expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test message');
      });

      test('should not log stack trace in production', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();
        const error = new Error('Test error');

        // Mock sendToExternalLogger
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.error('Test message', error);

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
          error: expect.objectContaining({
            stack: undefined
          })
        }));

        sendSpy.mockRestore();
      });
    });

    describe('warn logging', () => {
      test('should log warning in development', () => {
        const testLogger = new Logger();
        const context = { component: 'test' };

        testLogger.warn('Warning message', context);

        expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warning message', context);
      });

      test('should send to external logger in production', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.warn('Warning message');

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
          level: 'warn',
          message: 'Warning message'
        }));

        sendSpy.mockRestore();
      });
    });

    describe('info logging', () => {
      test('should log info in development', () => {
        const testLogger = new Logger();
        const context = { component: 'test' };

        testLogger.info('Info message', context);

        expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Info message', context);
      });

      test('should send to external logger in production', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.info('Info message');

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
          level: 'info',
          message: 'Info message'
        }));

        sendSpy.mockRestore();
      });
    });

    describe('debug logging', () => {
      test('should log debug in development', () => {
        const testLogger = new Logger();
        const context = { component: 'test' };

        testLogger.debug('Debug message', context);

        expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Debug message', context);
      });

      test('should not log debug in production', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();

        testLogger.debug('Debug message');

        expect(mockConsole.debug).not.toHaveBeenCalled();
      });
    });

    describe('performance logging', () => {
      test('should warn about slow operations in development', () => {
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.performance('slow-operation', 1500, { details: 'test' });

        expect(mockConsole.warn).toHaveBeenCalledWith(
          '[PERF] Slow operation: slow-operation (1500ms)',
          { details: 'test' }
        );
        expect(sendSpy).toHaveBeenCalled();

        sendSpy.mockRestore();
      });

      test('should debug fast operations in development', () => {
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.performance('fast-operation', 500, { details: 'test' });

        expect(mockConsole.debug).toHaveBeenCalledWith(
          '[PERF] fast-operation (500ms)',
          { details: 'test' }
        );
        expect(sendSpy).toHaveBeenCalled();

        sendSpy.mockRestore();
      });

      test('should always send performance metrics to external logger', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.performance('operation', 800);

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
          level: 'info',
          message: 'Performance: operation completed in 800ms',
          context: expect.objectContaining({
            operation: 'operation',
            duration: 800
          })
        }));

        sendSpy.mockRestore();
      });
    });

    describe('security logging', () => {
      test('should always log security events', () => {
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.security('Unauthorized access attempt', { ip: '192.168.1.1' });

        expect(mockConsole.warn).toHaveBeenCalledWith(
          '[SECURITY] Unauthorized access attempt',
          { ip: '192.168.1.1' }
        );
        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
          level: 'warn',
          message: 'SECURITY: Unauthorized access attempt'
        }));

        sendSpy.mockRestore();
      });

      test('should log security events in production', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.security('Security event');

        expect(mockConsole.warn).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalled();

        sendSpy.mockRestore();
      });
    });

    describe('sendToExternalLogger', () => {
      test('should not call external logger in development', () => {
        const testLogger = new Logger();
        const mockSend = jest.fn();
        testLogger['sendToExternalLogger'] = mockSend;

        testLogger.warn('Test warning');

        // Should not be called in development since we console log instead
        expect(mockSend).not.toHaveBeenCalled();
      });

      test('should handle log entry structure correctly', () => {
        process.env.NODE_ENV = 'production';
        const testLogger = new Logger();
        const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

        testLogger.info('Test message', { key: 'value' });

        expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
          timestamp: expect.any(String),
          level: 'info',
          message: 'Test message',
          context: { key: 'value' },
          environment: 'production'
        }));

        sendSpy.mockRestore();
      });
    });
  });

  describe('handleAsyncError utility', () => {
    test('should return result on successful operation', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await handleAsyncError(operation, 'fallback', 'Operation failed');
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    test('should return fallback and log error on failed operation', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      // Spy on the singleton logger's error method
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      
      const result = await handleAsyncError(operation, 'fallback', 'Operation failed');
      
      expect(result).toBe('fallback');
      expect(operation).toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Operation failed', expect.any(Error));
      
      loggerErrorSpy.mockRestore();
    });

    test('should handle Z-Beam errors properly', async () => {
      const error = new SecurityError('Unsafe operation');
      const operation = jest.fn().mockRejectedValue(error);
      
      // Spy on the singleton logger's error method
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      
      const result = await handleAsyncError(operation, 'fallback', 'Security check failed');
      
      expect(result).toBe('fallback');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Security check failed', expect.any(SecurityError));
      
      loggerErrorSpy.mockRestore();
    });
  });

  describe('safeContentOperation utility', () => {
    test('should return result on successful operation', async () => {
      const operation = jest.fn().mockResolvedValue('content data');
      
      const result = await safeContentOperation(operation, 'fallback', 'loadContent', 'test-slug');
      
      expect(result).toBe('content data');
      expect(operation).toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    test('should return fallback and log error on failed operation', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Content not found'));
      
      // Spy on the singleton logger's error method
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      
      const result = await safeContentOperation(operation, 'fallback', 'loadContent', 'test-slug');
      
      expect(result).toBe('fallback');
      expect(operation).toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Content operation failed: loadContent', expect.any(Error), { slug: 'test-slug' });
      
      loggerErrorSpy.mockRestore();
    });

    test('should include slug in error context', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Content not found'));
      
      // Spy on the singleton logger's error method
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      
      await safeContentOperation(operation, 'fallback', 'loadContent', 'test-slug');
      
      expect(loggerErrorSpy).toHaveBeenCalledWith('Content operation failed: loadContent', expect.any(Error), { slug: 'test-slug' });
      
      loggerErrorSpy.mockRestore();
    });

    test('should work without slug parameter', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      // Spy on the singleton logger's error method
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      
      const result = await safeContentOperation(operation, 'fallback', 'operation');
      
      expect(result).toBe('fallback');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Content operation failed: operation', expect.any(Error), { slug: undefined });
      
      loggerErrorSpy.mockRestore();
    });
  });

  describe('singleton logger instance', () => {
    test('should provide access to singleton logger', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    test('should use singleton logger for operations', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      
      logger.error('Test error');
      
      expect(errorSpy).toHaveBeenCalledWith('Test error');
      
      errorSpy.mockRestore();
    });
  });

  describe('environment handling', () => {
    test('should handle unknown environment', () => {
      delete process.env.NODE_ENV;
      const testLogger = new Logger();
      const sendSpy = jest.spyOn(testLogger, 'sendToExternalLogger').mockImplementation(() => {});

      testLogger.info('Test message');

      expect(sendSpy).toHaveBeenCalledWith(expect.objectContaining({
        environment: 'unknown'
      }));

      sendSpy.mockRestore();
    });

    test('should correctly identify development environment', () => {
      process.env.NODE_ENV = 'development';
      const testLogger = new Logger();

      testLogger.debug('Debug message');

      expect(mockConsole.debug).toHaveBeenCalled();
    });

    test('should correctly identify production environment', () => {
      process.env.NODE_ENV = 'production';
      const testLogger = new Logger();

      testLogger.debug('Debug message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });
});
