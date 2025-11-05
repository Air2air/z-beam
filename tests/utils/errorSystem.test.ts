/**
 * Tests for app/utils/errorSystem.ts
 * Comprehensive tests for error classes, validation utilities, and safe operation wrappers
 */

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
} from '@/app/utils/errorSystem';

// =============================================================================
// ERROR CLASS TESTS
// =============================================================================

describe('ZBeamError Base Class', () => {
  // Create concrete implementation for testing
  class TestError extends ZBeamError {
    readonly code = 'TEST_ERROR';
    readonly category = 'validation' as const;
  }

  test('should create error with message', () => {
    const error = new TestError('Test message');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('TestError');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.category).toBe('validation');
  });

  test('should create error with context', () => {
    const context = { userId: '123', action: 'test' };
    const error = new TestError('Test message', context);
    expect(error.context).toEqual(context);
  });

  test('should create error with suggestions', () => {
    const suggestions = ['Check config', 'Try again'];
    const error = new TestError('Test message', undefined, suggestions);
    expect(error.suggestions).toEqual(suggestions);
  });

  test('should create error with all parameters', () => {
    const context = { field: 'test' };
    const suggestions = ['Fix it'];
    const error = new TestError('Test message', context, suggestions);
    expect(error.message).toBe('Test message');
    expect(error.context).toEqual(context);
    expect(error.suggestions).toEqual(suggestions);
  });

  test('should have proper stack trace', () => {
    const error = new TestError('Test message');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('TestError');
  });

  test('getErrorInfo should return all error details', () => {
    const context = { key: 'value' };
    const suggestions = ['suggestion 1', 'suggestion 2'];
    const error = new TestError('Test message', context, suggestions);
    
    const info = error.getErrorInfo();
    expect(info).toEqual({
      code: 'TEST_ERROR',
      category: 'validation',
      message: 'Test message',
      context: { key: 'value' },
      suggestions: ['suggestion 1', 'suggestion 2'],
      stack: expect.any(String)
    });
  });
});

describe('ConfigurationError', () => {
  test('should create configuration error', () => {
    const error = new ConfigurationError('Config missing');
    expect(error.code).toBe('CONFIG_ERROR');
    expect(error.category).toBe('configuration');
    expect(error.message).toBe('Config missing');
  });

  test('should have configuration-specific suggestions', () => {
    const error = new ConfigurationError('Config missing');
    expect(error.suggestions).toContain('Check environment variables and configuration files');
    expect(error.suggestions).toContain('Verify all required dependencies are installed');
  });

  test('should accept context', () => {
    const context = { missing: ['API_KEY', 'SECRET'] };
    const error = new ConfigurationError('Missing keys', context);
    expect(error.context).toEqual(context);
  });
});

describe('ValidationError', () => {
  test('should create validation error', () => {
    const error = new ValidationError('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.category).toBe('validation');
    expect(error.message).toBe('Invalid input');
  });

  test('should have validation-specific suggestions', () => {
    const error = new ValidationError('Invalid input');
    expect(error.suggestions).toContain('Validate input data format and types');
    expect(error.suggestions).toContain('Check required fields are present');
  });
});

describe('SecurityError', () => {
  test('should create security error', () => {
    const error = new SecurityError('Unsafe operation');
    expect(error.code).toBe('SECURITY_ERROR');
    expect(error.category).toBe('security');
    expect(error.message).toBe('Unsafe operation');
  });

  test('should have security-specific suggestions', () => {
    const error = new SecurityError('Unsafe operation');
    expect(error.suggestions).toContain('Review input for unsafe patterns');
    expect(error.suggestions).toContain('Check path traversal and injection attempts');
  });
});

describe('GenerationError', () => {
  test('should create generation error', () => {
    const error = new GenerationError('Content failed');
    expect(error.code).toBe('GENERATION_ERROR');
    expect(error.category).toBe('generation');
    expect(error.message).toBe('Content failed');
  });

  test('should have generation-specific suggestions', () => {
    const error = new GenerationError('Content failed');
    expect(error.suggestions).toContain('Check content source files exist and are readable');
    expect(error.suggestions).toContain('Verify YAML frontmatter is valid');
  });
});

describe('ApiError', () => {
  test('should create API error', () => {
    const error = new ApiError('Request failed');
    expect(error.code).toBe('API_ERROR');
    expect(error.category).toBe('api');
    expect(error.message).toBe('Request failed');
  });

  test('should accept status code', () => {
    const error = new ApiError('Not found', 404);
    expect(error.statusCode).toBe(404);
  });

  test('should include status code in context', () => {
    const error = new ApiError('Server error', 500, { endpoint: '/api/test' });
    expect(error.context).toEqual({ endpoint: '/api/test', statusCode: 500 });
  });

  test('should have API-specific suggestions', () => {
    const error = new ApiError('Request failed');
    expect(error.suggestions).toContain('Check API endpoint availability');
    expect(error.suggestions).toContain('Verify authentication credentials');
  });
});

// =============================================================================
// VALIDATION UTILITY TESTS
// =============================================================================

describe('validateSlug', () => {
  test('should accept valid slug', () => {
    expect(validateSlug('valid-slug-123')).toBe('valid-slug-123');
  });

  test('should accept slug with underscores', () => {
    expect(validateSlug('valid_slug_123')).toBe('valid_slug_123');
  });

  test('should accept alphanumeric slug', () => {
    expect(validateSlug('ValidSlug123')).toBe('ValidSlug123');
  });

  test('should throw ValidationError for null', () => {
    expect(() => validateSlug(null)).toThrow(ValidationError);
    expect(() => validateSlug(null)).toThrow('Invalid slug type');
  });

  test('should throw ValidationError for undefined', () => {
    expect(() => validateSlug(undefined)).toThrow(ValidationError);
  });

  test('should throw ValidationError for number', () => {
    expect(() => validateSlug(123)).toThrow(ValidationError);
    expect(() => validateSlug(123)).toThrow('expected string, got number');
  });

  test('should throw SecurityError for path traversal (..) ', () => {
    expect(() => validateSlug('../etc/passwd')).toThrow(SecurityError);
    expect(() => validateSlug('../etc/passwd')).toThrow('Unsafe slug pattern');
  });

  test('should throw SecurityError for absolute path', () => {
    expect(() => validateSlug('/etc/passwd')).toThrow(SecurityError);
  });

  test('should throw SecurityError for backslash', () => {
    expect(() => validateSlug('path\\to\\file')).toThrow(SecurityError);
  });

  test('should throw ValidationError for special characters', () => {
    expect(() => validateSlug('slug@with#special')).toThrow(ValidationError);
    expect(() => validateSlug('slug@with#special')).toThrow('Only alphanumeric, hyphens, and underscores allowed');
  });

  test('should throw ValidationError for spaces', () => {
    expect(() => validateSlug('slug with spaces')).toThrow(ValidationError);
  });

  test('should throw ValidationError for too long slug', () => {
    const longSlug = 'a'.repeat(101);
    expect(() => validateSlug(longSlug)).toThrow(ValidationError);
    expect(() => validateSlug(longSlug)).toThrow('Slug too long');
  });

  test('should accept custom context in errors', () => {
    try {
      validateSlug(null, 'custom context');
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).context).toEqual({
        slug: null,
        context: 'custom context'
      });
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

  test('should pass with valid environment', () => {
    (process.env as any).NODE_ENV = 'development';
    (process.env as any).NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(() => validateEnvironment()).not.toThrow();
  });

  test('should accept production NODE_ENV', () => {
    (process.env as any).NODE_ENV = 'production';
    (process.env as any).NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(() => validateEnvironment()).not.toThrow();
  });

  test('should accept test NODE_ENV', () => {
    (process.env as any).NODE_ENV = 'test';
    (process.env as any).NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(() => validateEnvironment()).not.toThrow();
  });

  test('should throw ConfigurationError for missing NODE_ENV', () => {
    delete (process.env as any).NODE_ENV;
    (process.env as any).NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(() => validateEnvironment()).toThrow(ConfigurationError);
    expect(() => validateEnvironment()).toThrow('Missing required environment variables');
  });

  test('should throw ConfigurationError for missing NEXT_PUBLIC_SITE_URL', () => {
    (process.env as any).NODE_ENV = 'development';
    delete (process.env as any).NEXT_PUBLIC_SITE_URL;
    expect(() => validateEnvironment()).toThrow(ConfigurationError);
  });

  test('should throw ConfigurationError for invalid NODE_ENV', () => {
    (process.env as any).NODE_ENV = 'invalid';
    (process.env as any).NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(() => validateEnvironment()).toThrow(ConfigurationError);
    expect(() => validateEnvironment()).toThrow('Invalid NODE_ENV');
  });

  test('should list missing variables in error', () => {
    delete (process.env as any).NODE_ENV;
    delete (process.env as any).NEXT_PUBLIC_SITE_URL;
    try {
      validateEnvironment();
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect((error as ConfigurationError).message).toContain('NODE_ENV');
      expect((error as ConfigurationError).message).toContain('NEXT_PUBLIC_SITE_URL');
    }
  });
});

describe('validateRequiredProperties', () => {
  test('should pass with all required properties', () => {
    const obj = { name: 'test', value: 123 };
    const result = validateRequiredProperties(obj, ['name', 'value']);
    expect(result).toEqual(obj);
  });

  test('should pass with extra properties', () => {
    const obj = { name: 'test', value: 123, extra: 'data' };
    const result = validateRequiredProperties(obj, ['name', 'value']);
    expect(result).toEqual(obj);
  });

  test('should throw ValidationError for missing property', () => {
    const obj = { name: 'test' };
    expect(() => validateRequiredProperties(obj, ['name', 'value'])).toThrow(ValidationError);
    expect(() => validateRequiredProperties(obj, ['name', 'value'])).toThrow('Missing required properties');
  });

  test('should throw ValidationError for undefined property', () => {
    const obj = { name: 'test', value: undefined };
    expect(() => validateRequiredProperties(obj, ['name', 'value'])).toThrow(ValidationError);
  });

  test('should throw ValidationError for null input', () => {
    expect(() => validateRequiredProperties(null, ['name'])).toThrow(ValidationError);
    expect(() => validateRequiredProperties(null, ['name'])).toThrow('Expected object, got object');
  });

  test('should throw ValidationError for non-object', () => {
    expect(() => validateRequiredProperties('string', ['name'])).toThrow(ValidationError);
  });

  test('should accept custom context', () => {
    try {
      validateRequiredProperties({ name: 'test' }, ['name', 'value'], 'user validation');
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).context?.context).toBe('user validation');
    }
  });

  test('should list missing properties in error context', () => {
    const obj = { name: 'test' };
    try {
      validateRequiredProperties(obj, ['name', 'value', 'id']);
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const context = (error as ValidationError).context;
      expect(context?.missing).toEqual(['value', 'id']);
      expect(context?.available).toEqual(['name']);
    }
  });
});

describe('validateFilePath', () => {
  test('should accept valid file path', () => {
    expect(validateFilePath('content/blog/post.md')).toBe('content/blog/post.md');
  });

  test('should accept absolute path', () => {
    expect(validateFilePath('/var/www/content/post.md')).toBe('/var/www/content/post.md');
  });

  test('should throw ValidationError for null', () => {
    expect(() => validateFilePath(null)).toThrow(ValidationError);
  });

  test('should throw ValidationError for undefined', () => {
    expect(() => validateFilePath(undefined)).toThrow(ValidationError);
  });

  test('should throw ValidationError for number', () => {
    expect(() => validateFilePath(123)).toThrow(ValidationError);
  });

  test('should throw SecurityError for path traversal (..)', () => {
    expect(() => validateFilePath('../etc/passwd')).toThrow(SecurityError);
    expect(() => validateFilePath('../etc/passwd')).toThrow('Unsafe file path pattern');
  });

  test('should throw SecurityError for backslash', () => {
    expect(() => validateFilePath('path\\to\\file')).toThrow(SecurityError);
  });

  test('should normalize multiple slashes', () => {
    expect(() => validateFilePath('path//to///file')).toThrow(SecurityError);
    expect(() => validateFilePath('path//to///file')).toThrow('Path traversal attempt');
  });

  test('should enforce allowed base paths', () => {
    const allowedPaths = ['content/', 'public/'];
    expect(validateFilePath('content/blog/post.md', allowedPaths)).toBe('content/blog/post.md');
    expect(validateFilePath('public/images/logo.png', allowedPaths)).toBe('public/images/logo.png');
  });

  test('should throw SecurityError for path outside allowed directories', () => {
    const allowedPaths = ['content/', 'public/'];
    expect(() => validateFilePath('etc/passwd', allowedPaths)).toThrow(SecurityError);
    expect(() => validateFilePath('etc/passwd', allowedPaths)).toThrow('File path outside allowed directories');
  });
});

// =============================================================================
// SAFE OPERATION TESTS
// =============================================================================

describe('safeOperation', () => {
  test('should return result on success', async () => {
    const operation = async () => 'success';
    const result = await safeOperation(operation, 'test');
    expect(result).toBe('success');
  });

  test('should throw ValidationError immediately without retry', async () => {
    const operation = async () => {
      throw new ValidationError('Invalid input');
    };
    await expect(safeOperation(operation, 'test', { allowRetry: true })).rejects.toThrow(ValidationError);
  });

  test('should throw SecurityError immediately without retry', async () => {
    const operation = async () => {
      throw new SecurityError('Unsafe');
    };
    await expect(safeOperation(operation, 'test', { allowRetry: true })).rejects.toThrow(SecurityError);
  });

  test('should throw ConfigurationError immediately without retry', async () => {
    const operation = async () => {
      throw new ConfigurationError('Bad config');
    };
    await expect(safeOperation(operation, 'test', { allowRetry: true })).rejects.toThrow(ConfigurationError);
  });

  test('should throw on first failure when retry disabled', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      throw new Error('Failed');
    };
    await expect(safeOperation(operation, 'test')).rejects.toThrow(GenerationError);
    expect(attempts).toBe(1);
  });

  test('should retry on generic errors when allowed', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) throw new Error('Failed');
      return 'success';
    };
    const result = await safeOperation(operation, 'test', { allowRetry: true, maxRetries: 3, retryDelay: 10 });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  test('should throw GenerationError after max retries', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      throw new Error('Always fails');
    };
    await expect(
      safeOperation(operation, 'test', { allowRetry: true, maxRetries: 3, retryDelay: 10 })
    ).rejects.toThrow(GenerationError);
    expect(attempts).toBe(3);
  });

  test('should include attempt count in GenerationError', async () => {
    const operation = async () => {
      throw new Error('Failed');
    };
    try {
      await safeOperation(operation, 'test context', { allowRetry: true, maxRetries: 2, retryDelay: 10 });
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(GenerationError);
      expect((error as GenerationError).message).toContain('after 2 attempts');
      expect((error as GenerationError).context?.context).toBe('test context');
    }
  });
});

// =============================================================================
// UTILITY FUNCTION TESTS
// =============================================================================

describe('isZBeamError', () => {
  test('should return true for ZBeam errors', () => {
    expect(isZBeamError(new ValidationError('test'))).toBe(true);
    expect(isZBeamError(new SecurityError('test'))).toBe(true);
    expect(isZBeamError(new ConfigurationError('test'))).toBe(true);
    expect(isZBeamError(new GenerationError('test'))).toBe(true);
    expect(isZBeamError(new ApiError('test'))).toBe(true);
  });

  test('should return false for standard errors', () => {
    expect(isZBeamError(new Error('test'))).toBe(false);
  });

  test('should return false for non-errors', () => {
    expect(isZBeamError('string')).toBe(false);
    expect(isZBeamError(123)).toBe(false);
    expect(isZBeamError(null)).toBe(false);
    expect(isZBeamError(undefined)).toBe(false);
  });
});

describe('getErrorDetails', () => {
  test('should extract full details from ZBeam error', () => {
    const error = new ValidationError('Test error', { field: 'name' });
    const details = getErrorDetails(error);
    
    expect(details).toEqual({
      code: 'VALIDATION_ERROR',
      category: 'validation',
      message: 'Test error',
      context: { field: 'name' },
      suggestions: expect.any(Array),
      stack: expect.any(String)
    });
  });

  test('should extract basic details from standard Error', () => {
    const error = new Error('Standard error');
    const details = getErrorDetails(error);
    
    expect(details).toEqual({
      message: 'Standard error',
      stack: expect.any(String)
    });
  });

  test('should handle string errors', () => {
    const details = getErrorDetails('String error');
    expect(details).toEqual({
      message: 'String error'
    });
  });

  test('should handle null', () => {
    const details = getErrorDetails(null);
    expect(details).toEqual({
      message: 'null'
    });
  });

  test('should handle undefined', () => {
    const details = getErrorDetails(undefined);
    expect(details).toEqual({
      message: 'undefined'
    });
  });

  test('should handle numbers', () => {
    const details = getErrorDetails(123);
    expect(details).toEqual({
      message: '123'
    });
  });

  test('should handle objects', () => {
    const details = getErrorDetails({ error: 'custom' });
    expect(details.message).toBe('[object Object]');
  });
});
