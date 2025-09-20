// tests/utils/errorSystem.test.js
// Comprehensive tests for the error system

import {
  ZBeamError,
  ConfigurationError,
  ValidationError,
  SecurityError,
  GenerationError,
  ApiError,
  validateSlug,
  validateEnvironment,
  validateRequiredProperties,
  validateFilePath,
  safeOperation,
  isZBeamError,
  getErrorDetails
} from '../../app/utils/errorSystem';

describe('Error System', () => {
  describe('ZBeamError base class', () => {
    // Create a concrete implementation for testing
    class TestError extends ZBeamError {
      constructor(message, context, suggestions) {
        super(message, context, suggestions);
        this.code = 'TEST_ERROR';
        this.category = 'validation';
      }
    }

    test('should create error with message', () => {
      const error = new TestError('Test message');
      
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('TestError');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.category).toBe('validation');
    });

    test('should create error with context and suggestions', () => {
      const context = { field: 'test', value: 123 };
      const suggestions = ['Check input', 'Try again'];
      const error = new TestError('Test message', context, suggestions);
      
      expect(error.context).toEqual(context);
      expect(error.suggestions).toEqual(suggestions);
    });

    test('should provide error info', () => {
      const context = { field: 'test' };
      const suggestions = ['Fix this'];
      const error = new TestError('Test message', context, suggestions);
      
      const info = error.getErrorInfo();
      
      expect(info).toEqual({
        code: 'TEST_ERROR',
        category: 'validation',
        message: 'Test message',
        context,
        suggestions,
        stack: expect.any(String)
      });
    });

    test('should maintain proper stack trace', () => {
      const error = new TestError('Test message');
      expect(error.stack).toContain('TestError');
      expect(error.stack).toContain('Test message');
    });
  });

  describe('ConfigurationError', () => {
    test('should create configuration error', () => {
      const error = new ConfigurationError('Config missing');
      
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.category).toBe('configuration');
      expect(error.message).toBe('Config missing');
      expect(error.suggestions).toContain('Check environment variables and configuration files');
    });

    test('should include context', () => {
      const context = { missing: ['API_KEY'] };
      const error = new ConfigurationError('Missing vars', context);
      
      expect(error.context).toEqual(context);
    });
  });

  describe('ValidationError', () => {
    test('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.category).toBe('validation');
      expect(error.message).toBe('Invalid input');
      expect(error.suggestions).toContain('Validate input data format and types');
    });
  });

  describe('SecurityError', () => {
    test('should create security error', () => {
      const error = new SecurityError('Unsafe operation');
      
      expect(error.code).toBe('SECURITY_ERROR');
      expect(error.category).toBe('security');
      expect(error.message).toBe('Unsafe operation');
      expect(error.suggestions).toContain('Review input for unsafe patterns');
    });
  });

  describe('GenerationError', () => {
    test('should create generation error', () => {
      const error = new GenerationError('Generation failed');
      
      expect(error.code).toBe('GENERATION_ERROR');
      expect(error.category).toBe('generation');
      expect(error.message).toBe('Generation failed');
      expect(error.suggestions).toContain('Check content source files exist and are readable');
    });
  });

  describe('ApiError', () => {
    test('should create API error', () => {
      const error = new ApiError('API failed');
      
      expect(error.code).toBe('API_ERROR');
      expect(error.category).toBe('api');
      expect(error.message).toBe('API failed');
      expect(error.suggestions).toContain('Check API endpoint availability');
    });

    test('should include status code', () => {
      const context = { endpoint: '/api/test' };
      const error = new ApiError('API failed', 404, context);
      
      expect(error.statusCode).toBe(404);
      expect(error.context).toEqual({ ...context, statusCode: 404 });
    });
  });

  describe('validateSlug', () => {
    test('should validate correct slug', () => {
      const result = validateSlug('valid-slug_123');
      expect(result).toBe('valid-slug_123');
    });

    test('should throw ValidationError for non-string input', () => {
      expect(() => validateSlug(123)).toThrow(ValidationError);
      expect(() => validateSlug(null)).toThrow(ValidationError);
      expect(() => validateSlug(undefined)).toThrow(ValidationError);
    });

    test('should throw SecurityError for path traversal attempts', () => {
      expect(() => validateSlug('../etc/passwd')).toThrow(SecurityError);
      expect(() => validateSlug('/root')).toThrow(SecurityError);
      expect(() => validateSlug('test\\path')).toThrow(SecurityError);
    });

    test('should throw ValidationError for invalid characters', () => {
      expect(() => validateSlug('invalid@slug')).toThrow(ValidationError);
      expect(() => validateSlug('invalid slug')).toThrow(ValidationError);
      expect(() => validateSlug('invalid.slug')).toThrow(ValidationError);
    });

    test('should throw ValidationError for too long slug', () => {
      const longSlug = 'a'.repeat(101);
      expect(() => validateSlug(longSlug)).toThrow(ValidationError);
    });

    test('should include context in error', () => {
      try {
        validateSlug(123, 'test context');
      } catch (error) {
        expect(error.context.context).toBe('test context');
      }
    });
  });

  describe('validateEnvironment', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    test('should pass with required environment variables', () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
      
      expect(() => validateEnvironment()).not.toThrow();
    });

    test('should throw ConfigurationError for missing NODE_ENV', () => {
      delete process.env.NODE_ENV;
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
      
      expect(() => validateEnvironment()).toThrow(ConfigurationError);
    });

    test('should throw ConfigurationError for missing NEXT_PUBLIC_SITE_URL', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_SITE_URL;
      
      expect(() => validateEnvironment()).toThrow(ConfigurationError);
    });

    test('should throw ConfigurationError for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid';
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
      
      expect(() => validateEnvironment()).toThrow(ConfigurationError);
    });

    test('should include missing variables in error context', () => {
      delete process.env.NODE_ENV;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      
      try {
        validateEnvironment();
      } catch (error) {
        expect(error.context.missing).toContain('NODE_ENV');
        expect(error.context.missing).toContain('NEXT_PUBLIC_SITE_URL');
      }
    });
  });

  describe('validateRequiredProperties', () => {
    test('should validate object with required properties', () => {
      const obj = { name: 'test', value: 123 };
      const result = validateRequiredProperties(obj, ['name', 'value']);
      
      expect(result).toEqual(obj);
    });

    test('should throw ValidationError for non-object input', () => {
      expect(() => validateRequiredProperties('string', ['prop'])).toThrow(ValidationError);
      expect(() => validateRequiredProperties(null, ['prop'])).toThrow(ValidationError);
      expect(() => validateRequiredProperties(undefined, ['prop'])).toThrow(ValidationError);
    });

    test('should throw ValidationError for missing properties', () => {
      const obj = { name: 'test' };
      
      expect(() => validateRequiredProperties(obj, ['name', 'value'])).toThrow(ValidationError);
    });

    test('should throw ValidationError for undefined properties', () => {
      const obj = { name: 'test', value: undefined };
      
      expect(() => validateRequiredProperties(obj, ['name', 'value'])).toThrow(ValidationError);
    });

    test('should include context in error', () => {
      try {
        validateRequiredProperties({}, ['prop'], 'test context');
      } catch (error) {
        expect(error.context.context).toBe('test context');
        expect(error.context.missing).toContain('prop');
      }
    });
  });

  describe('validateFilePath', () => {
    test('should validate safe file path', () => {
      const result = validateFilePath('/safe/path/file.txt');
      expect(result).toBe('/safe/path/file.txt');
    });

    test('should throw ValidationError for non-string input', () => {
      expect(() => validateFilePath(123)).toThrow(ValidationError);
      expect(() => validateFilePath(null)).toThrow(ValidationError);
    });

    test('should throw SecurityError for path traversal attempts', () => {
      expect(() => validateFilePath('../etc/passwd')).toThrow(SecurityError);
      expect(() => validateFilePath('test\\file')).toThrow(SecurityError);
    });

    test('should normalize multiple slashes', () => {
      expect(() => validateFilePath('//test///path')).toThrow(SecurityError);
    });

    test('should validate against allowed base paths', () => {
      const allowedPaths = ['/safe/dir', '/another/safe'];
      
      expect(() => validateFilePath('/safe/dir/file.txt', allowedPaths)).not.toThrow();
      expect(() => validateFilePath('/unsafe/dir/file.txt', allowedPaths)).toThrow(SecurityError);
    });

    test('should include file path in error context', () => {
      try {
        validateFilePath('../unsafe');
      } catch (error) {
        expect(error.context.filePath).toBe('../unsafe');
      }
    });
  });

  describe('safeOperation', () => {
    test('should return successful operation result', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await safeOperation(operation, 'test context');
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should not retry validation errors', async () => {
      const operation = jest.fn().mockRejectedValue(new ValidationError('Invalid'));
      
      await expect(safeOperation(operation, 'test context', { allowRetry: true }))
        .rejects.toThrow(ValidationError);
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should not retry security errors', async () => {
      const operation = jest.fn().mockRejectedValue(new SecurityError('Unsafe'));
      
      await expect(safeOperation(operation, 'test context', { allowRetry: true }))
        .rejects.toThrow(SecurityError);
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should not retry configuration errors', async () => {
      const operation = jest.fn().mockRejectedValue(new ConfigurationError('Config'));
      
      await expect(safeOperation(operation, 'test context', { allowRetry: true }))
        .rejects.toThrow(ConfigurationError);
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on generic errors when allowed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue('success');
      
      const result = await safeOperation(operation, 'test context', { 
        allowRetry: true, 
        maxRetries: 2, 
        retryDelay: 10 
      });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('should throw GenerationError after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(safeOperation(operation, 'test context', { 
        allowRetry: true, 
        maxRetries: 2,
        retryDelay: 10
      })).rejects.toThrow(GenerationError);
      
      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('should not retry when allowRetry is false', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failure'));
      
      await expect(safeOperation(operation, 'test context', { allowRetry: false }))
        .rejects.toThrow(GenerationError);
      
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('isZBeamError', () => {
    test('should return true for ZBeam errors', () => {
      expect(isZBeamError(new ValidationError('test'))).toBe(true);
      expect(isZBeamError(new SecurityError('test'))).toBe(true);
      expect(isZBeamError(new ConfigurationError('test'))).toBe(true);
      expect(isZBeamError(new GenerationError('test'))).toBe(true);
      expect(isZBeamError(new ApiError('test'))).toBe(true);
    });

    test('should return false for non-ZBeam errors', () => {
      expect(isZBeamError(new Error('test'))).toBe(false);
      expect(isZBeamError('string')).toBe(false);
      expect(isZBeamError(null)).toBe(false);
      expect(isZBeamError(undefined)).toBe(false);
      expect(isZBeamError({})).toBe(false);
    });
  });

  describe('getErrorDetails', () => {
    test('should extract details from ZBeam errors', () => {
      const context = { field: 'test' };
      const suggestions = ['Fix this'];
      const error = new ValidationError('Test message', context, suggestions);
      
      const details = getErrorDetails(error);
      
      expect(details).toEqual({
        code: 'VALIDATION_ERROR',
        category: 'validation',
        message: 'Test message',
        context,
        suggestions: [
          'Validate input data format and types',
          'Check required fields are present',
          'Ensure data meets expected schema'
        ],
        stack: expect.any(String)
      });
    });

    test('should extract details from regular errors', () => {
      const error = new Error('Test error');
      
      const details = getErrorDetails(error);
      
      expect(details).toEqual({
        message: 'Test error',
        stack: expect.any(String)
      });
    });

    test('should handle non-error values', () => {
      expect(getErrorDetails('string error')).toEqual({
        message: 'string error'
      });
      
      expect(getErrorDetails(null)).toEqual({
        message: 'null'
      });
      
      expect(getErrorDetails(undefined)).toEqual({
        message: 'undefined'
      });
      
      expect(getErrorDetails(123)).toEqual({
        message: '123'
      });
    });
  });
});
