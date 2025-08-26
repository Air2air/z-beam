
// Enhanced React cache mock for Jest testing
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    cache: jest.fn((fn) => {
      // Return the function itself for testing environment
      fn.displayName = 'CachedFunction';
      return fn;
    })
  };
});

// tests/setup.js
// Jest setup file for global test configuration

// Mock Next.js modules that aren't available in test environment
jest.mock('next/cache', () => ({
  cache: (fn) => {
    // Simple cache implementation for tests
    const cache = new Map();
    const cachedFn = (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
    cachedFn.cache = cache;
    return cachedFn;
  }
}));

// Mock marked for tests
jest.mock('marked', () => ({
  marked: jest.fn((content) => `<p>${content}</p>`)
}));

// Global test setup
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup fetch mock if needed for integration tests
global.fetch = jest.fn();

// Mock process.env for tests
process.env.NODE_ENV = 'test';
