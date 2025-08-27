// Simple working tests for contentAPI
describe('Content API Utils - Simple Tests', () => {
  test('modules can be imported without errors', () => {
    expect(() => {
      require('../../app/utils/contentAPI');
    }).not.toThrow();
  });

  test('basic functionality exists', () => {
    const contentAPI = require('../../app/utils/contentAPI');
    
    expect(typeof contentAPI.getAllSlugs).toBe('function');
    expect(typeof contentAPI.loadComponent).toBe('function');
    expect(typeof contentAPI.loadAllComponents).toBe('function');
  });

  test('error handling functions exist', () => {
    const contentAPI = require('../../app/utils/contentAPI');
    
    expect(typeof contentAPI.loadMetadata).toBe('function');
    expect(typeof contentAPI.loadPageData).toBe('function');
    expect(typeof contentAPI.loadArticle).toBe('function');
    expect(typeof contentAPI.loadAllArticles).toBe('function');
  });
});
