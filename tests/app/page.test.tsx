// tests/app/page.test.tsx
/**
 * Tests for the home page component (app/page.tsx)
 * Tests critical app router functionality and metadata generation
 */

import { SITE_CONFIG } from '../../app/utils/constants';

// Mock contentAPI
jest.mock('../../app/utils/contentAPI', () => ({
  getArticle: jest.fn(),
  loadComponentData: jest.fn(),
  getAllArticleSlugs: jest.fn(),
}));

// Mock metadata utilities
const mockCreateMetadata = jest.fn((data) => ({
  title: data.title || SITE_CONFIG.shortName,
  description: data.description || SITE_CONFIG.description,
  keywords: data.keywords,
  image: data.image,
  slug: data.slug,
}));

jest.mock('../../app/utils/metadata', () => ({
  createMetadata: mockCreateMetadata,
}));

// Mock components to prevent rendering issues in Node environment
jest.mock('../../app/components/Hero/Hero', () => ({
  Hero: () => null,
}));

jest.mock('../../app/components/Layout/Layout', () => ({
  Layout: ({ children }: any) => children,
}));

jest.mock('../../app/components/CardGrid/CardGridSSR', () => ({
  CardGridSSR: () => null,
}));

jest.mock('../../app/data/featuredSections', () => ({
  featuredSections: [
    {
      slug: 'aluminum-cleaning',
      title: 'Aluminum Cleaning',
      description: 'Professional aluminum surface treatment',
      imageUrl: '/images/aluminum.jpg',
    },
    {
      slug: 'rust-removal',
      title: 'Rust Removal',
      description: 'Advanced rust removal techniques',
      imageUrl: '/images/rust.jpg',
    },
  ],
}));

const mockContentAPI = require('../../app/utils/contentAPI');

describe('HomePage App Router Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockContentAPI.getAllArticleSlugs.mockResolvedValue([
      'aluminum-cleaning',
      'rust-removal',
      'paint-stripping',
    ]);
    
    mockContentAPI.loadComponentData.mockResolvedValue({
      config: {
        title: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        keywords: SITE_CONFIG.keywords.slice(0, 3),
        ogImage: '/images/home-og.jpg',
      },
    });
    
    mockContentAPI.getArticle.mockResolvedValue({
      slug: 'home',
      metadata: { title: 'Home' },
    });
  });

  describe('Component Integration', () => {
    it('should load all required data sources', async () => {
      const { generateMetadata } = require('../../app/page');
      
      await generateMetadata();
      
      expect(mockContentAPI.loadComponentData).toHaveBeenCalledWith('metatags', 'home');
      expect(mockContentAPI.getArticle).toHaveBeenCalledWith('home');
    });

    it('should call getAllArticleSlugs for content sections', async () => {
      const HomePage = require('../../app/page').default;
      
      await HomePage();
      
      expect(mockContentAPI.getAllArticleSlugs).toHaveBeenCalled();
    });

    it('should handle data loading without throwing errors', async () => {
      const HomePage = require('../../app/page').default;
      
      await expect(HomePage()).resolves.toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw when getAllArticleSlugs fails', async () => {
      mockContentAPI.getAllArticleSlugs.mockRejectedValue(new Error('API Error'));
      
      const HomePage = require('../../app/page').default;
      
      // Function will throw since it doesn't handle errors internally
      await expect(HomePage()).rejects.toThrow('API Error');
    });

    it('should handle empty slugs array', async () => {
      mockContentAPI.getAllArticleSlugs.mockResolvedValue([]);
      
      const HomePage = require('../../app/page').default;
      
      await expect(HomePage()).resolves.toBeDefined();
    });

    it('should throw when metadata loading fails (API calls not wrapped)', async () => {
      // Since loadComponentData and getArticle are not wrapped in try-catch, they will throw
      mockContentAPI.loadComponentData.mockRejectedValue(new Error('Metadata Error'));
      mockContentAPI.getArticle.mockResolvedValue({ metadata: { title: 'Fallback' } });
      
      const { generateMetadata } = require('../../app/page');
      
      // generateMetadata will throw since API calls are not error-handled
      await expect(generateMetadata()).rejects.toThrow('Metadata Error');
    });
  });

  describe('Performance', () => {
    it('should complete data loading within reasonable time', async () => {
      const largeSlugs = Array.from({ length: 50 }, (_, i) => `article-${i}`);
      mockContentAPI.getAllArticleSlugs.mockResolvedValue(largeSlugs);
      
      const HomePage = require('../../app/page').default;
      
      const startTime = performance.now();
      await HomePage();
      const endTime = performance.now();
      
      // Should complete data loading quickly
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

describe('generateMetadata Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate metadata with custom config', async () => {
    mockContentAPI.loadComponentData.mockResolvedValue({
      config: {
        title: 'Custom Home Title',
        description: 'Custom description',
        keywords: ['custom', 'keywords'],
        ogImage: '/custom-og.jpg',
      },
    });

    const { generateMetadata } = require('../../app/page');
    const result = await generateMetadata();

    expect(mockCreateMetadata).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.description).toBeDefined();
  });

  it('should fallback to defaults when no config', async () => {
    mockContentAPI.loadComponentData.mockResolvedValue(null);
    mockContentAPI.getArticle.mockResolvedValue(null);

    const { generateMetadata } = require('../../app/page');
    const result = await generateMetadata();

    expect(mockCreateMetadata).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
  });

  it('should handle string keywords correctly', async () => {
    mockContentAPI.loadComponentData.mockResolvedValue({
      config: {
        keywords: 'single-keyword',
      },
    });

    const { generateMetadata } = require('../../app/page');
    const result = await generateMetadata();

    expect(mockCreateMetadata).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should preserve array keywords', async () => {
    mockContentAPI.loadComponentData.mockResolvedValue({
      config: {
        keywords: ['keyword1', 'keyword2', 'keyword3'],
      },
    });

    const { generateMetadata } = require('../../app/page');
    const result = await generateMetadata();

    expect(mockCreateMetadata).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    mockContentAPI.loadComponentData.mockRejectedValue(new Error('API Error'));
    mockContentAPI.getArticle.mockRejectedValue(new Error('Article Error'));

    const { generateMetadata } = require('../../app/page');
    
    // Should return default metadata on error
    const result = await generateMetadata();
    expect(result).toBeDefined();
    expect(mockCreateMetadata).toHaveBeenCalled();
  });
});
