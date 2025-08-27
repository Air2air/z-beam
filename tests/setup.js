
// Enhanced test setup for Next.js with component testing
require('@testing-library/jest-dom');

// Mock the marked library to handle ESM import issues
jest.mock('marked', () => ({
  __esModule: true,
  marked: jest.fn((markdown) => `<p>${markdown}</p>`),
  default: jest.fn((markdown) => `<p>${markdown}</p>`),
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const React = require('react');
    return React.createElement('img', props);
  },
}));

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Enhanced React cache mock for Jest testing
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    cache: jest.fn((fn) => {
      fn.displayName = 'CachedFunction';
      return fn;
    })
  };
});

// Mock Next.js cache
jest.mock('next/cache', () => ({
  cache: (fn) => {
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

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_VERCEL_URL = 'localhost:3000';

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});