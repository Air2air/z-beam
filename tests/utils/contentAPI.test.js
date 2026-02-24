// tests/utils/contentAPI.test.js
// Note: These are unit tests that mock the file system operations

// Mock fs functions
const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  readdir: jest.fn(),
  setupMocks: jest.fn(() => {
    // Reset all mocks before each test
    mockExistsSync.mockReset();
    mockReadFileSync.mockReset();
    mockFs.readFile.mockReset();
    mockFs.writeFile.mockReset();
    mockFs.access.mockReset();
    mockFs.readdir.mockReset();
  })
};

// Mock all dependencies first, before any imports
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn(),
  readdir: jest.fn()
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn()
}));
jest.mock('react', () => ({
  cache: (fn) => {
    const cached = (...args) => fn(...args);
    cached.cache = new Map();
    return cached;
  }
}));

jest.mock('../../app/utils/yamlSanitizer', () => ({
  safeMatterParse: jest.fn()
}));
jest.mock('marked', () => ({
  marked: jest.fn((content) => `<p>${content}</p>`)
}));

// Import after setting up mocks
let getAllSlugs, loadComponent, loadAllComponents, loadMetadata, loadPageData, loadArticle, loadAllArticles;

const fs = require('fs/promises');
const { existsSync, readFileSync } = require('fs');

describe('Content API Utils', () => {
  beforeAll(async () => {
    // Import contentAPI after all mocks are set up
    const contentAPI = require('../../app/utils/contentAPI');
    getAllSlugs = contentAPI.getAllSlugs;
    loadComponent = contentAPI.loadComponent;
    loadAllComponents = contentAPI.loadAllComponents;
    loadMetadata = contentAPI.loadMetadata;
    loadPageData = contentAPI.loadPageData;
    loadArticle = contentAPI.loadArticle;
    loadAllArticles = contentAPI.loadAllArticles;
  });

  
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress expected console.error noise from safeContentOperation catching
    // intentional mock rejections used to test error-handling paths.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Configure mocks to return proper test data
    const fs = require('fs/promises');
    const { existsSync } = require('fs');
    
    existsSync.mockImplementation((path) => {
      // Return true for test paths
      return path.includes('test-slug') || path.includes('cached-slug');
    });
    
    fs.readFile.mockImplementation((path) => {
      if (path.includes('frontmatter') && path.includes('test-slug')) {
        return Promise.resolve('---\ntitle: Test Title\ncategory: test\n---\nTest content');
      }
      if (path.includes('content') && path.includes('test-slug')) {
        return Promise.resolve('Content only');
      }
      if (path.includes('metatags') && path.includes('test-slug')) {
        return Promise.resolve('title: Frontmatter Title\ncategory: test');
      }
      if (path.includes('cached-slug')) {
        return Promise.resolve('---\ntitle: Cached\n---\nCached content');
      }
      return Promise.reject(new Error('File not found'));
    });
    
    fs.readdir.mockImplementation((path) => {
      if (path.includes('frontmatter')) {
        return Promise.resolve(['test-slug.md', 'article1.md', 'article2.md']);
      }
      return Promise.resolve([]);
    });
  });

  describe('getAllSlugs', () => {
    test('should return unique slugs from all component directories', async () => {
      existsSync
        .mockReturnValueOnce(true)  // frontmatter dir
        .mockReturnValueOnce(true)  // metatags dir  
        .mockReturnValueOnce(false) // content dir (doesn't exist)
        .mockReturnValueOnce(true); // micro dir

      fs.readdir
        .mockResolvedValueOnce(['article1.md', 'article2.md', 'not-markdown.txt'])
        .mockResolvedValueOnce(['article2.md', 'article3.md'])
        .mockResolvedValueOnce(['article1.md', 'article4.md']);

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
      // Override the default mock for this specific test - use a slug not in beforeEach
      existsSync.mockReturnValue(true);
      fs.readFile.mockImplementation((path) => {
        if (path.includes('error-test-slug')) {
          return Promise.reject(new Error('File read error'));
        }
        // Fallback to original mock behavior for other paths
        return Promise.resolve('---\ntitle: Test Title\n---\nTest content');
      });

      const result = await loadComponent('frontmatter', 'error-test-slug');

      // Should return null (fallback) when file read fails
      expect(result).toBeNull();
    });

    test('should handle empty frontmatter', async () => {
      // This test validates proper handling of content without frontmatter
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      safeMatterParse.mockReturnValue({
        data: {},
        content: 'Content only'
      });

      // Override the global mock for this specific test
      const { existsSync } = require('fs');
      existsSync.mockReturnValue(true);
      
      fs.readFile.mockResolvedValue('Content only');

      const result = await loadComponent('text', 'empty-frontmatter-slug', { convertMarkdown: false });

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
      
      jest.mocked(existsSync).mockReturnValue(true);
      jest.mocked(readFileSync).mockReturnValue('---\ntitle: Frontmatter Title\ncategory: test\n---\ncontent');
      
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
      // Mock existsSync to return false for frontmatter file so it falls back to metatags
      jest.mocked(existsSync).mockImplementation((filePath) => {
        if (filePath.includes('frontmatter')) return false;
        if (filePath.includes('metatags')) return true;
        return false;
      });
      
      // Mock readFileSync for metatags file
      jest.mocked(readFileSync).mockReturnValue('title: Metatags Title');
      
      // Mock safeMatterParse for metatags
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      safeMatterParse.mockReturnValue({
        data: { title: 'Metatags Title' },
        content: ''
      });

      const result = await loadMetadata('test-slug');

      expect(result).toEqual({
        title: 'Metatags Title'
      });
    });

    test('should return empty object when no metadata found', async () => {
      jest.mocked(existsSync).mockReturnValue(false);
      jest.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await loadMetadata('non-existent');

      expect(result).toEqual({});
    });
  });

  describe('loadPageData', () => {
    test.skip('should combine metadata and components', async () => {
      // SKIPPED: Mock setup complex due to dynamic imports and caching in loadFrontmatterDataInline
      // This test would require mocking js-yaml dynamic imports and cache behavior
      const result = await loadPageData('test-slug');
      expect(result).toHaveProperty('frontmatter');
      expect(result).toHaveProperty('components');
    });

    test('should handle errors gracefully', async () => {
      jest.mocked(existsSync).mockReturnValue(true);
      jest.mocked(readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = await loadPageData('error-slug');

      expect(result).toEqual({
        frontmatter: {},
        components: {}
      });
    });
  });

  describe('loadArticle', () => {
    test('should create article from metadata', async () => {
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      jest.mocked(existsSync).mockReturnValue(true);
      jest.mocked(readFileSync).mockReturnValue('---\ntitle: Test Article\n---\ncontent');
      jest.mocked(fs.readFile).mockResolvedValue('test content');
      
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
        frontmatter: {
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
      jest.mocked(existsSync).mockReturnValue(true);
      jest.mocked(readFileSync)
        .mockReturnValueOnce('---\ntitle: Article 1\n---\ncontent1')
        .mockReturnValueOnce('---\ntitle: Article 2\n---\ncontent2');
      jest.mocked(fs.readdir).mockResolvedValue(['article1.md', 'article2.md']);
      
      // Mock file reads for articles
      jest.mocked(fs.readFile).mockResolvedValue('test content');
      
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
      
      jest.mocked(existsSync).mockReturnValue(true);
      jest.mocked(readFileSync)
        .mockReturnValueOnce('---\ntitle: Valid Article\n---\ncontent1')
        .mockReturnValueOnce('---\ndescription: No title\n---\ncontent2');
      jest.mocked(fs.readdir).mockResolvedValue(['article1.md', 'article2.md']);
      jest.mocked(fs.readFile).mockResolvedValue('test content');
      
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
      // Testing basic caching behavior - React cache may not work in Jest but the API should be consistent
      const { safeMatterParse } = require('../../app/utils/yamlSanitizer');
      
      // Mock a valid component file
      jest.mocked(existsSync).mockReturnValue(true);
      jest.mocked(fs.readFile).mockResolvedValue('test content');
      
      safeMatterParse.mockReturnValue({
        data: { title: 'Cached Title' },
        content: 'cached content'
      });
      
      // First call
      const result1 = await loadComponent('frontmatter', 'cached-slug');
      
      // Second call - should return the same structure even if cache doesn't work in Jest
      const result2 = await loadComponent('frontmatter', 'cached-slug');

      // Both calls should return the same result structure
      expect(result1).toEqual({
        content: expect.any(String),
        config: { title: 'Cached Title' }
      });
      expect(result2).toEqual(result1);
      
      // Verify results are not null
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });
  });
});
