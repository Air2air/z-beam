/**
 * @file logger.test.ts
 * @purpose Tests for logger utility
 */

import { Logger, logger } from '@/app/utils/logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: string | undefined;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    if (originalEnv !== undefined) {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      (process.env as any).NODE_ENV = 'development';
      const testLogger = new Logger();
      
      testLogger.debug('Test debug message');
      
      expect(consoleDebugSpy).toHaveBeenCalled();
      const loggedMessage = consoleDebugSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('DEBUG');
      expect(loggedMessage).toContain('Test debug message');
    });

    it('should not log debug messages in production', () => {
      (process.env as any).NODE_ENV = 'production';
      const testLogger = new Logger();
      
      testLogger.debug('Test debug message');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should include context in debug logs', () => {
      (process.env as any).NODE_ENV = 'development';
      const testLogger = new Logger();
      
      testLogger.debug('Debug with context', { userId: 123, action: 'test' });
      
      const loggedMessage = consoleDebugSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('userId');
      expect(loggedMessage).toContain('123');
      expect(loggedMessage).toContain('action');
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('INFO');
      expect(loggedMessage).toContain('Test info message');
    });

    it('should include context in info logs', () => {
      logger.info('Info with context', { status: 'success', count: 42 });
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('status');
      expect(loggedMessage).toContain('success');
      expect(loggedMessage).toContain('42');
    });

    it('should include timestamp in info logs', () => {
      logger.info('Test message');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('WARN');
      expect(loggedMessage).toContain('Test warning message');
    });

    it('should include context in warning logs', () => {
      logger.warn('Warning with context', { resource: 'file.txt', reason: 'not found' });
      
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('resource');
      expect(loggedMessage).toContain('file.txt');
      expect(loggedMessage).toContain('not found');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERROR');
      expect(loggedMessage).toContain('Test error message');
    });

    it('should include context in error logs', () => {
      logger.error('Error with context', { code: 'ERR_404', path: '/test' });
      
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('ERR_404');
      expect(loggedMessage).toContain('/test');
    });

    it('should handle complex error context', () => {
      const errorContext = {
        stack: 'Error: test\n  at file.ts:10',
        message: 'Something went wrong',
        nested: { detail: 'More info' },
      };
      
      logger.error('Complex error', errorContext);
      
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('stack');
      expect(loggedMessage).toContain('nested');
    });
  });

  describe('performance', () => {
    it('should log performance with fast emoji', () => {
      logger.performance('Fast operation', 500);
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('⚡');
      expect(loggedMessage).toContain('PERFORMANCE');
      expect(loggedMessage).toContain('Fast operation');
      expect(loggedMessage).toContain('500');
    });

    it('should log performance with slow emoji', () => {
      logger.performance('Slow operation', 1500);
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('🐌');
      expect(loggedMessage).toContain('Slow operation');
      expect(loggedMessage).toContain('1500');
    });

    it('should include durationMs in context', () => {
      logger.performance('Operation', 750);
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('durationMs');
      expect(loggedMessage).toContain('750');
    });

    it('should merge custom context with duration', () => {
      logger.performance('Database query', 200, { query: 'SELECT *', rows: 100 });
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('durationMs');
      expect(loggedMessage).toContain('200');
      expect(loggedMessage).toContain('query');
      expect(loggedMessage).toContain('SELECT *');
      expect(loggedMessage).toContain('rows');
    });

    it('should use slow emoji at exactly 1000ms threshold', () => {
      logger.performance('Threshold test', 1000);
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('⚡'); // Should be fast (<= 1000)
    });

    it('should use slow emoji just above threshold', () => {
      logger.performance('Threshold test', 1001);
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('🐌');
    });
  });

  describe('message formatting', () => {
    it('should format messages without context', () => {
      logger.info('Simple message');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T.*\] INFO: Simple message$/);
    });

    it('should format messages with context', () => {
      logger.info('Message with context', { key: 'value' });
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('INFO: Message with context');
      expect(loggedMessage).toContain('{"key":"value"}');
    });

    it('should handle empty context object', () => {
      logger.info('Message', {});
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('{}');
    });

    it('should handle null values in context', () => {
      logger.info('Message', { value: null });
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('null');
    });

    it('should handle undefined values in context', () => {
      logger.info('Message', { value: undefined });
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).not.toContain('undefined'); // JSON.stringify omits undefined
    });
  });

  describe('singleton logger', () => {
    it('should export a singleton instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should have all log methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.performance).toBe('function');
    });
  });

  describe('environment detection', () => {
    it('should detect production environment', () => {
      (process.env as any).NODE_ENV = 'production';
      const prodLogger = new Logger();
      
      prodLogger.debug('Should not log');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      
      prodLogger.info('Should log');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should detect development environment', () => {
      (process.env as any).NODE_ENV = 'development';
      const devLogger = new Logger();
      
      devLogger.debug('Should log');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should detect test environment', () => {
      (process.env as any).NODE_ENV = 'test';
      const testLogger = new Logger();
      
      testLogger.debug('Should log in test');
      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });
});
