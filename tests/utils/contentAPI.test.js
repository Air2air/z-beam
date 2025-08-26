// tests/utils/contentAPI.test.js
// Note: These are unit tests that mock the file system operations

// Mock all dependencies first, before any imports
jest.mock('fs/promises');
jest.mock('fs');
jest.mock('react', () => ({
  cache: (fn) => {
    const cached = (...args) => fn(...args);
    cached.cache = new Map();
    return cached;
  }
}));
jest.mock('../../app/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  },
  safeContentOperation: jest.fn((operation, fallback) => {
    try {
      return operation();
    } catch (error) {
      return fallback;
    }
  })
}));
jest.mock('../../app/utils/yamlSanitizer', () => ({
  safeMatterParse: jest.fn()
}));
jest.mock('marked', () => ({
  marked: jest.fn((content) => `<p>${content}</p>`)
}));

const fs = require('fs/promises');
const { existsSync } = require('fs');

// Import the module after mocking
const {
  getAllSlugs,
  loadComponent,
  loadAllComponents,
  loadMetadata,
  loadPageData,
  loadArticle,
  loadAllArticles
} = require('../../app/utils/contentAPI');


// Fixed mock setup for contentAPI tests
const mockFs = {
  readFile: jest.fn(),
  readdir: jest.fn(),
  existsSync: jest.fn(),
  
  setupMocks() {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock existsSync to return true for key directories
    this.existsSync.mockImplementation((dirPath) => {
      return dirPath.includes('frontmatter') || 
             dirPath.includes('metatags') || 
             dirPath.includes('bullets');
    });
    
    // Mock fs.readdir with proper responses
    this.readdir.mockImplementation((dirPath) => {
      if (dirPath.includes('frontmatter')) {
        return Promise.resolve(['article1.md', 'article2.md', 'not-markdown.txt']);
      }
      if (dirPath.includes('metatags')) {
        return Promise.resolve(['article2.md', 'article3.md']);
      }
      if (dirPath.includes('bullets')) {
        return Promise.resolve(['article1.md', 'article4.md']);
      }
      return Promise.resolve([]);
    });
    
    // Mock fs.readFile with proper content
    this.readFile.mockImplementation((filePath) => {
      if (filePath.includes('test-slug')) {
        return Promise.resolve(`---
title: Test Title
category: test
---
Test content`);
      }
      return Promise.resolve('');
    });
    
    // Mock safeMatterParse
    const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
    safeMatterParse.mockImplementation((content) => {
      if (content.includes('Test Title')) {
        return {
          data: { title: 'Test Title', category: 'test' },
          content: 'Test content'
        };
      }
      return { data: {}, content: content };
    });
  }
};

// Use consistent mock reference
const mockExistsSync = mockFs.existsSync;

// Mock the fs modules
jest.doMock('fs/promises', () => mockFs);
jest.doMock('fs', () => ({ existsSync: mockFs.existsSync }));

describe('Content API Utils', () => {
  beforeEach(() => {
    mockFs.setupMocks();
  });

  describe('getAllSlugs', () => {
    test('should return unique slugs from all component directories', async () => {
      mockExistsSync
        .mockReturnValueOnce(true)  // frontmatter dir
        .mockReturnValueOnce(true)  // metatags dir
        .mockReturnValueOnce(false) // content dir (doesn't exist)
        .mockReturnValueOnce(true); // bullets dir

      fs.readdir
        .mockResolvedValueOnce(['article1.md', 'article2.md', 'not-markdown.txt'])
        .mockResolvedValueOnce(['article2.md', 'article3.md'])
        .mockResolvedValueOnce(['article1.md', 'article4.md']);

      const { getAllSlugs } = require('../../app/utils/contentAPI');
      const result = await getAllSlugs();

      expect(result).toEqual(expect.arrayContaining(['article1', 'article2', 'article3', 'article4']));
      expect(result).toHaveLength(4); // Unique slugs only
      expect(result).not.toContain('not-markdown'); // Should filter out non-md files
    });

    test('should handle empty directories', async () => {
      mockExistsSync.mockReturnValue(true);
      fs.readdir.mockResolvedValue([]);

      const { getAllSlugs } = require('../../app/utils/contentAPI');
      const result = await getAllSlugs();

      expect(result).toEqual([]);
    });

    test('should handle directory read errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      fs.readdir.mockRejectedValue(new Error('Permission denied'));

      const { getAllSlugs } = require('../../app/utils/contentAPI');
      const result = await getAllSlugs();

      expect(result).toEqual([]);
    });
  });

  describe('loadComponent', () => {
    beforeEach(() => {
      // Mock yamlSanitizer
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      safeMatterParse.mockReturnValue({
        data: { title: 'Test Title', category: 'test' },
        content: 'Test content'
      });
    });

    test('should load component with markdown conversion', async () => {
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('---\ntitle: Test\n---\n# Content');

      const result = await loadComponent('frontmatter', 'test-slug');

      expect(result).toEqual({
        content: expect.stringContaining('Test content'), // Processed by marked
        config: { title: 'Test Title', category: 'test' }
      });
    });

    test('should load component without markdown conversion', async () => {
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('---\ntitle: Test\n---\nRaw content');

      const result = await loadComponent('frontmatter', 'test-slug', { convertMarkdown: false });

      expect(result).toEqual({
        content: 'Test content',
        config: { title: 'Test Title', category: 'test' }
      });
    });

    test('should return null for non-existent files', async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await loadComponent('frontmatter', 'non-existent');

      expect(result).toBeNull();
    });

    test('should return null for unknown component types', async () => {
      const result = await loadComponent('unknown-type', 'test-slug');

      expect(result).toBeNull();
    });

    test('should handle file read errors', async () => {
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockRejectedValue(new Error('File read error'));

      const result = await loadComponent('frontmatter', 'test-slug');

      expect(result).toBeNull();
    });

    test('should handle empty frontmatter', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      safeMatterParse.mockReturnValue({
        data: {},
        content: 'Content only'
      });

      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('Content only');

      const result = await loadComponent('content', 'test-slug');

      expect(result).toEqual({
        content: 'Content only',
        config: undefined
      });
    });
  });

  describe('loadAllComponents', () => {
    test('should load all available components for a slug', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      // Mock different responses for different component types
      mockExistsSync
        .mockReturnValueOnce(true)  // frontmatter exists
        .mockReturnValueOnce(false) // metatags doesn't exist
        .mockReturnValueOnce(true); // content exists

      mockFs.readFile
        .mockResolvedValueOnce('frontmatter content')
        .mockResolvedValueOnce('main content');

      safeMatterParse
        .mockReturnValueOnce({
          data: { title: 'Test Title' },
          content: 'Frontmatter content'
        })
        .mockReturnValueOnce({
          data: {},
          content: 'Main content'
        });

      // Note: This test will need to be adjusted based on actual component types
      // For now, testing the pattern
      const result = await loadAllComponents('test-slug');

      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    test('should return empty object when no components exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await loadAllComponents('non-existent-slug');

      expect(result).toEqual({});
    });
  });

  describe('loadMetadata', () => {
    test('should prioritize frontmatter over metatags', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('test file content');
      
      safeMatterParse.mockReturnValue({
        data: { title: 'Frontmatter Title', category: 'test' },
        content: 'content'
      });

      const result = await loadMetadata('test-slug');

      expect(result).toEqual({
        title: 'Frontmatter Title',
        category: 'test'
      });
    });

    test('should fallback to metatags when frontmatter has no config', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('test file content');
      
      // First call (frontmatter) returns no config, second call (metatags) has config
      safeMatterParse
        .mockReturnValueOnce({
          data: {},
          content: 'content'
        })
        .mockReturnValueOnce({
          data: { title: 'Metatags Title' },
          content: 'content'
        });

      const result = await loadMetadata('test-slug');

      expect(result).toEqual({
        title: 'Metatags Title'
      });
    });

    test('should return empty object when no metadata found', async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await loadMetadata('non-existent');

      expect(result).toEqual({});
    });
  });

  describe('loadPageData', () => {
    test('should combine metadata and components', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('test content');
      
      safeMatterParse.mockReturnValue({
        data: { title: 'Test Page' },
        content: 'content'
      });

      const result = await loadPageData('test-slug');

      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('components');
      expect(result.metadata).toEqual({ title: 'Test Page' });
    });

    test('should handle errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockRejectedValue(new Error('Read error'));

      const result = await loadPageData('error-slug');

      expect(result).toEqual({
        metadata: {},
        components: {}
      });
    });
  });

  describe('loadArticle', () => {
    test('should create article from metadata', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('test content');
      
      safeMatterParse.mockReturnValue({
        data: {
          title: 'Test Article',
          name: 'Test Name',
          description: 'Test description',
          author: 'Test Author',
          tags: ['tag1', 'tag2']
        },
        content: 'content'
      });

      const result = await loadArticle('test-slug');

      expect(result).toEqual({
        slug: 'test-slug',
        title: 'Test Article',
        name: 'Test Name',
        headline: '',
        description: 'Test description',
        image: '',
        imageAlt: '',
        tags: ['tag1', 'tag2'],
        website: '',
        author: 'Test Author',
        metadata: {
          title: 'Test Article',
          name: 'Test Name',
          description: 'Test description',
          author: 'Test Author',
          tags: ['tag1', 'tag2']
        }
      });
    });

    test('should return null when no title in metadata', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('test content');
      
      safeMatterParse.mockReturnValue({
        data: { description: 'No title' },
        content: 'content'
      });

      const result = await loadArticle('no-title-slug');

      expect(result).toBeNull();
    });
  });

  describe('loadAllArticles', () => {
    test('should load all articles with valid titles', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      // Mock getAllSlugs to return test slugs
      mockExistsSync.mockReturnValue(true);
      mockFs.readdir.mockResolvedValue(['article1.md', 'article2.md']);
      
      // Mock file reads for articles
      mockFs.readFile.mockResolvedValue('test content');
      
      safeMatterParse
        .mockReturnValueOnce({
          data: { title: 'Article 1' },
          content: 'content1'
        })
        .mockReturnValueOnce({
          data: { title: 'Article 2' },
          content: 'content2'
        });

      const result = await loadAllArticles();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Article 1');
      expect(result[1].title).toBe('Article 2');
    });

    test('should filter out articles without titles', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readdir.mockResolvedValue(['article1.md', 'article2.md']);
      mockFs.readFile.mockResolvedValue('test content');
      
      safeMatterParse
        .mockReturnValueOnce({
          data: { title: 'Valid Article' },
          content: 'content1'
        })
        .mockReturnValueOnce({
          data: { description: 'No title' },
          content: 'content2'
        });

      const result = await loadAllArticles();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Valid Article');
    });
  });

  describe('error handling', () => {
    test('should handle filesystem errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockRejectedValue(new Error('Filesystem error'));

      const result = await loadComponent('frontmatter', 'error-slug');

      expect(result).toBeNull();
    });

    test('should handle YAML parsing errors gracefully', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('invalid yaml content');
      
      safeMatterParse.mockImplementation(() => {
        throw new Error('YAML parse error');
      });

      const result = await loadComponent('frontmatter', 'yaml-error-slug');

      expect(result).toBeNull();
    });
  });

  describe('caching behavior', () => {
    test('should use cache for repeated calls', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('test content');
      safeMatterParse.mockReturnValue({
        data: { title: 'Cached' },
        content: 'content'
      });

      // First call
      await loadComponent('frontmatter', 'cached-slug');
      
      // Second call should use cache (won't call fs.readFile again)
      const result = await loadComponent('frontmatter', 'cached-slug');

      expect(result).toEqual({
        content: expect.any(String),
        config: { title: 'Cached' }
      });
      
      // File should only be read once due to caching
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });
  });
});
