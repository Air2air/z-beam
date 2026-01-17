
// tests/helpers/data-generators.js
/**
 * Test data generators for consistent test data
 */

export const generateMockArticle = (overrides = {}) => ({
  slug: 'test-article',
  frontmatter: {
    title: 'Test Article',
    description: 'Test description',
    author: 'Test Author',
    date: '2025-01-01',
    tags: ['test', 'mock'],
    ...overrides.metadata
  },
  components: {
    hero: { type: 'hero', data: { title: 'Test Hero' } },
    content: { type: 'content', data: { body: 'Test content' } },
    ...overrides.components
  },
  ...overrides
});

export const generateMockComponentData = (type, overrides = {}) => {
  const baseComponents = {
    hero: { type: 'hero', data: { title: 'Hero Title', description: 'Hero Description' } },
    content: { type: 'content', data: { body: 'Content body' } },
    tags: { type: 'tags', data: { tags: ['tag1', 'tag2'] } },
    author: { type: 'author', data: { name: 'Author Name' } }
  };

  return {
    ...baseComponents[type],
    ...overrides
  };
};

export const generateMockError = (message = 'Test error', code = 'TEST_ERROR') => {
  const error = new Error(message);
  error.code = code;
  return error;
};

export const generateMockRequest = (overrides = {}) => ({
  method: 'GET',
  url: '/test',
  headers: { 'content-type': 'application/json' },
  body: null,
  ...overrides
});