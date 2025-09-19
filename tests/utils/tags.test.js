// tests/utils/tags.test.js
import { 
  parseTagsFromContent,
  articleMatchesTag,
  getArticleTagsFromTagsDir,
  getAllTags,
  getTagCounts,
  filterArticlesByTag,
  invalidateTagCache
} from '../../app/utils/tags';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Mock the file system operations
jest.mock('fs/promises');
jest.mock('fs');
jest.mock('../../app/utils/contentAPI');
jest.mock('../../app/utils/logger');

const mockFs = fs;
const mockExistsSync = existsSync;

describe('Tags Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    invalidateTagCache();
  });

  describe('parseTagsFromContent', () => {
    it('should parse comma-separated tags from string content', async () => {
      const content = 'aluminum, cleaning, laser, aerospace';
      const result = await parseTagsFromContent(content);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser', 'aerospace']);
    });

    it('should trim whitespace from tags', async () => {
      const content = '  aluminum  ,  cleaning  ,  laser  ';
      const result = await parseTagsFromContent(content);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser']);
    });

    it('should filter out empty tags', async () => {
      const content = 'aluminum, , cleaning, , laser';
      const result = await parseTagsFromContent(content);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser']);
    });

    it('should handle empty content', async () => {
      const result = await parseTagsFromContent('');
      expect(result).toEqual([]);
    });

    it('should remove HTML comments', async () => {
      const content = 'aluminum, cleaning<!-- comment -->, laser';
      const result = await parseTagsFromContent(content);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser']);
    });

    it('should handle multiline comments', async () => {
      const content = `aluminum, cleaning
      <!-- 
        This is a multiline comment
        It should be removed
      -->
      , laser, aerospace`;
      const result = await parseTagsFromContent(content);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser', 'aerospace']);
    });
  });

  describe('articleMatchesTag', () => {
    it('should match tags case-insensitively', async () => {
      const article = { tags: ['Aluminum', 'Cleaning', 'Laser'] };
      
      expect(await articleMatchesTag(article, 'aluminum')).toBe(true);
      expect(await articleMatchesTag(article, 'CLEANING')).toBe(true);
      expect(await articleMatchesTag(article, 'laser')).toBe(true);
    });

    it('should return false for non-matching tags', async () => {
      const article = { tags: ['aluminum', 'cleaning', 'laser'] };
      
      expect(await articleMatchesTag(article, 'copper')).toBe(false);
      expect(await articleMatchesTag(article, 'welding')).toBe(false);
    });

    it('should handle articles without tags', async () => {
      const article = {};
      expect(await articleMatchesTag(article, 'aluminum')).toBe(false);
      
      const articleWithEmptyTags = { tags: [] };
      expect(await articleMatchesTag(articleWithEmptyTags, 'aluminum')).toBe(false);
    });

    it('should handle compound tag matching', async () => {
      const article = { tags: ['Precision Cleaning', 'Laser Processing'] };
      
      // Should match part of compound tag
      expect(await articleMatchesTag(article, 'Cleaning')).toBe(true);
      expect(await articleMatchesTag(article, 'Precision')).toBe(true);
      expect(await articleMatchesTag(article, 'Laser')).toBe(true);
      expect(await articleMatchesTag(article, 'Processing')).toBe(true);
    });

    it('should return true for empty tag (match all)', async () => {
      const article = { tags: ['aluminum', 'cleaning'] };
      expect(await articleMatchesTag(article, '')).toBe(true);
    });

    it('should handle null/undefined tags gracefully', async () => {
      const article = { tags: [null, undefined, 'aluminum', ''] };
      expect(await articleMatchesTag(article, 'aluminum')).toBe(true);
      expect(await articleMatchesTag(article, 'cleaning')).toBe(false);
    });
  });

  describe('getArticleTagsFromTagsDir', () => {
    it('should read and parse tags from file', async () => {
      const slug = 'aluminum-laser-cleaning';
      const tagContent = 'aluminum, cleaning, laser, aerospace';
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue(tagContent);
      
      const result = await getArticleTagsFromTagsDir(slug);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser', 'aerospace']);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('aluminum-laser-cleaning.md'),
        'utf8'
      );
    });

    it('should return empty array when file does not exist', async () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = await getArticleTagsFromTagsDir('non-existent-slug');
      
      expect(result).toEqual([]);
      expect(mockFs.readFile).not.toHaveBeenCalled();
    });

    it('should handle file read errors gracefully', async () => {
      const slug = 'aluminum-laser-cleaning';
      
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockRejectedValue(new Error('File read error'));
      
      // Mock console.error to prevent test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await getArticleTagsFromTagsDir(slug);
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error loading tags for aluminum-laser-cleaning'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('YAML v2.0 Format Integration', () => {
    it('should handle YAML data in parseTagsFromContent with new format detection', async () => {
      // Test that the function can handle structured YAML content
      // This would be called by the Tags component with parsed YAML data
      const yamlString = `tags:
  - electronics
  - aerospace
  - manufacturing
count: 8
categories:
  industry:
    - electronics
    - aerospace
  process:
    - passivation
    - polishing
metadata:
  format: "yaml"
  version: "2.0"`;
      
      // The parseTagsFromContent function expects string content
      // but the Tags component would pass parsed YAML data directly
      const result = await parseTagsFromContent(yamlString);
      
      // Should extract what looks like tags from the YAML string
      expect(result).toContain('electronics');
      expect(result).toContain('aerospace');
      expect(result).toContain('manufacturing');
    });

    it('should handle mixed content with YAML frontmatter', async () => {
      const content = `tags:
  - aluminum
  - cleaning
count: 4
---
aluminum, laser, cleaning, aerospace`;
      
      const result = await parseTagsFromContent(content);
      
      // Should include both YAML-style and comma-separated tags
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('aluminum');
    });
  });

  describe('Tag System Integration', () => {
    beforeEach(() => {
      // Mock the loadAllArticles function
      const { loadAllArticles } = require('../../app/utils/contentAPI');
      loadAllArticles.mockResolvedValue([
        {
          slug: 'aluminum-cleaning',
          title: 'Aluminum Cleaning',
          author: 'John Doe',
          tags: ['aluminum', 'cleaning']
        },
        {
          slug: 'copper-processing',
          title: 'Copper Processing',
          author: 'Jane Smith',
          tags: ['copper', 'processing']
        }
      ]);
    });

    it('should get all unique tags across articles', async () => {
      // Mock file system for tag files
      mockFs.readdir.mockResolvedValue(['aluminum-cleaning.md', 'copper-processing.md']);
      mockExistsSync.mockReturnValue(true);
      
      // Mock tag file contents
      mockFs.readFile
        .mockResolvedValueOnce('aluminum, cleaning, precision')
        .mockResolvedValueOnce('copper, processing, industrial');
      
      const allTags = await getAllTags();
      
      expect(allTags).toContain('aluminum');
      expect(allTags).toContain('cleaning');
      expect(allTags).toContain('copper');
      expect(allTags).toContain('processing');
      expect(allTags).toContain('John Doe'); // Author tags
      expect(allTags).toContain('Jane Smith'); // Author tags
    });

    it('should calculate tag counts correctly', async () => {
      mockFs.readdir.mockResolvedValue(['aluminum-cleaning.md']);
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue('aluminum, cleaning');
      
      const tagCounts = await getTagCounts();
      
      expect(tagCounts['aluminum']).toBe(1);
      expect(tagCounts['cleaning']).toBe(1);
      expect(tagCounts['John Doe']).toBe(1); // Author appears once
    });

    it('should filter articles by tag', async () => {
      const articles = [
        { slug: 'article1', tags: ['aluminum', 'cleaning'] },
        { slug: 'article2', tags: ['copper', 'processing'] },
        { slug: 'article3', tags: ['aluminum', 'welding'] }
      ];
      
      const filtered = await filterArticlesByTag(articles, 'aluminum');
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].slug).toBe('article1');
      expect(filtered[1].slug).toBe('article3');
    });

    it('should return all articles when tag is "all"', async () => {
      const articles = [
        { slug: 'article1', tags: ['aluminum'] },
        { slug: 'article2', tags: ['copper'] }
      ];
      
      const filtered = await filterArticlesByTag(articles, 'all');
      
      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(articles);
    });
  });

  describe('Performance and Caching', () => {
    it('should cache results and not recompute on subsequent calls', async () => {
      mockFs.readdir.mockResolvedValue([]);
      
      // First call
      const tags1 = await getAllTags();
      
      // Second call should use cache
      const tags2 = await getAllTags();
      
      expect(mockFs.readdir).toHaveBeenCalledTimes(1); // Only called once due to caching
      expect(tags1).toEqual(tags2);
    });

    it('should invalidate cache when requested', async () => {
      mockFs.readdir.mockResolvedValue([]);
      
      // First call
      await getAllTags();
      
      // Invalidate cache
      await invalidateTagCache();
      
      // Second call should recompute
      await getAllTags();
      
      expect(mockFs.readdir).toHaveBeenCalledTimes(2); // Called twice after cache invalidation
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Mock loadAllArticles to return empty array when file system fails
      const { loadAllArticles } = require('../../app/utils/contentAPI');
      loadAllArticles.mockResolvedValue([]);
      
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const tags = await getAllTags();
      
      expect(tags).toEqual([]);
      
      consoleSpy.mockRestore();
    });

    it('should handle corrupted tag files', async () => {
      mockExistsSync.mockReturnValue(true);
      mockFs.readFile.mockResolvedValue(''); // Empty file
      
      const result = await getArticleTagsFromTagsDir('test-slug');
      
      expect(result).toEqual([]);
    });

    it('should handle invalid article data in matching', async () => {
      const invalidArticle = null;
      
      expect(await articleMatchesTag(invalidArticle, 'test')).toBe(false);
    });
  });
});
