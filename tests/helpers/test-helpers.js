
// tests/helpers/test-helpers.js
/**
 * Reusable test helper functions
 */

export const createMockComponent = (props = {}) => ({
  type: 'MockComponent',
  props: {
    children: 'Mock content',
    ...props
  }
});

export const createMockMetadata = (overrides = {}) => ({
  title: 'Mock Title',
  description: 'Mock Description',
  slug: 'mock-slug',
  ...overrides
});

export const createMockContentAPI = () => ({
  getArticle: jest.fn(),
  getAllArticles: jest.fn(),
  loadComponent: jest.fn(),
  loadPageData: jest.fn()
});

export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const mockConsole = () => {
  const originalConsole = console;
  const mockConsole = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  };
  
  global.console = mockConsole;
  
  return {
    restore: () => { global.console = originalConsole; },
    mocks: mockConsole
  };
};