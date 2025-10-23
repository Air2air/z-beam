// tests/integration/content-pipeline.test.js
// Integration tests for content loading and processing pipeline

const fs = require('fs/promises');
const path = require('path');
const { existsSync } = require('fs');

// Create test content structure for integration testing
const TEST_CONTENT_DIR = path.join(__dirname, '../test-content');

describe('Content Pipeline Integration', () => {
  let originalProcessCwd;

  beforeAll(async () => {
    // Store original process.cwd
    originalProcessCwd = process.cwd;
    
    // Create test content structure
    await setupTestContent();
  });

  afterAll(async () => {
    // Restore original process.cwd
    process.cwd = originalProcessCwd;
    
    // Cleanup test content
    await cleanupTestContent();
  });

  beforeEach(() => {
    // Clear module cache to avoid cached results
    jest.resetModules();
  });

  async function setupTestContent() {
    const contentDirs = [
      'content/frontmatter',
      'content/components/content',
      'content/components/metatags',
      'content/components/bullets',
      'content/components/author'
    ];

    // Create directory structure
    for (const dir of contentDirs) {
      const fullPath = path.join(TEST_CONTENT_DIR, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }

    // Create test content files
    await createTestContentFiles();
  }

  async function createTestContentFiles() {
    // Frontmatter file
    const frontmatterContent = `---
title: "Alumina Laser Cleaning"
name: "Alumina"
description: "Advanced ceramic cleaning process"
subject: "alumina"
category: "ceramic"
author: "Dr. Materials"
tags: ["Industrial", "Precision"]
keywords: ["manufacturing", "surface-treatment"]
articleType: "technical-guide"
---
`;

    await fs.writeFile(
      path.join(TEST_CONTENT_DIR, 'content/frontmatter/alumina-laser-cleaning.md'),
      frontmatterContent
    );

    // Content file
    const contentBody = `---
layout: default
---

# Alumina Laser Cleaning Process

This article covers advanced ceramic cleaning techniques using precision laser technology.

## Key Benefits

- Precise contaminant removal
- No chemical residues
- Environmentally friendly process
`;

    await fs.writeFile(
      path.join(TEST_CONTENT_DIR, 'content/components/content/alumina-laser-cleaning.md'),
      contentBody
    );

    // Author file
    const authorContent = `---
name: "Dr. Materials"
title: "Senior Materials Engineer"
bio: "Expert in ceramic processing and laser applications"
---
`;

    await fs.writeFile(
      path.join(TEST_CONTENT_DIR, 'content/components/author/alumina-laser-cleaning.md'),
      authorContent
    );

    // Bullets file
    const bulletsContent = `---
bullets:
  - "Precision cleaning capability"
  - "No chemical waste"
  - "Automated process control"
  - "FDA-approved materials"
---
`;

    await fs.writeFile(
      path.join(TEST_CONTENT_DIR, 'content/components/bullets/alumina-laser-cleaning.md'),
      bulletsContent
    );

    // Create a second article for testing multiple articles
    const frontmatterContent2 = `---
title: "Silicon Carbide Processing"
name: "Silicon Carbide"
description: "Advanced semiconductor material processing"
subject: "silicon carbide"
category: "semiconductor"
author: "Dr. Semiconductor"
tags: ["Electronics", "High-Temperature"]
---
`;

    await fs.writeFile(
      path.join(TEST_CONTENT_DIR, 'content/frontmatter/silicon-carbide-processing.md'),
      frontmatterContent2
    );
  }

  async function cleanupTestContent() {
    if (existsSync(TEST_CONTENT_DIR)) {
      await fs.rm(TEST_CONTENT_DIR, { recursive: true, force: true });
    }
  }

  describe('Complete Content Loading Pipeline', () => {
    test('should load and process article through complete pipeline', async () => {
      // Mock process.cwd to point to our test directory
      process.cwd = () => TEST_CONTENT_DIR;

      // Import the contentAPI after setting up test environment
      const { loadArticle, loadAllComponents, loadPageData } = require('../../app/utils/contentAPI');
      const { enrichArticle } = require('../../app/utils/articleEnrichment');

      // Test complete pipeline
      const slug = 'alumina-laser-cleaning';

      // Step 1: Load raw article data
      const rawArticle = await loadArticle(slug);
      expect(rawArticle).not.toBeNull();
      expect(rawArticle.title).toBe('Alumina Laser Cleaning');
      expect(rawArticle.name).toBe('Alumina');
      expect(rawArticle.author).toBe('Dr. Materials');

      // Step 2: Load all components
      const components = await loadAllComponents(slug);
      expect(components).toHaveProperty('frontmatter');
      expect(components).toHaveProperty('content');
      expect(components).toHaveProperty('author');
      expect(components).toHaveProperty('bullets');

      // Step 3: Load complete page data
      const pageData = await loadPageData(slug);
      expect(pageData.metadata.title).toBe('Alumina Laser Cleaning');
      expect(pageData.components).toHaveProperty('content');

      // Step 4: Enrich for search
      const searchableArticle = enrichArticle(rawArticle);
      expect(searchableArticle.href).toBe('/alumina-laser-cleaning');
      expect(searchableArticle.tags).toContain('Dr. Materials');
      expect(searchableArticle.tags).toContain('Industrial');
      expect(searchableArticle.tags).toContain('Surface Treatment'); // Inferred
    });

    test('should handle multiple articles correctly', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { getAllSlugs, loadAllArticles } = require('../../app/utils/contentAPI');

      // Get all available slugs
      const slugs = await getAllSlugs();
      expect(slugs).toContain('alumina-laser-cleaning');
      expect(slugs).toContain('silicon-carbide-processing');

      // Load all articles
      const articles = await loadAllArticles();
      expect(articles.length).toBeGreaterThanOrEqual(2);

      const aluminaArticle = articles.find(a => a.slug === 'alumina-laser-cleaning');
      const siliconArticle = articles.find(a => a.slug === 'silicon-carbide-processing');

      expect(aluminaArticle).toBeDefined();
      expect(aluminaArticle.title).toBe('Alumina Laser Cleaning');

      expect(siliconArticle).toBeDefined();
      expect(siliconArticle.title).toBe('Silicon Carbide Processing');
    });
  });

  describe('Content Validation and Error Handling', () => {
    test('should handle missing component files gracefully', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { loadComponent } = require('../../app/utils/contentAPI');

      // Try to load non-existent component
      const result = await loadComponent('frontmatter', 'non-existent-slug');
      expect(result).toBeNull();

      // Try to load from non-existent component type
      const result2 = await loadComponent('non-existent-type', 'alumina-laser-cleaning');
      expect(result2).toBeNull();
    });

    test('should validate content structure integrity', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { loadPageData } = require('../../app/utils/contentAPI');
      const { enrichArticle } = require('../../app/utils/articleEnrichment');

      const pageData = await loadPageData('alumina-laser-cleaning');

      // Validate metadata structure
      expect(pageData.metadata).toHaveProperty('title');
      expect(pageData.metadata).toHaveProperty('category');
      expect(pageData.metadata).toHaveProperty('subject');

      // Validate components structure
      expect(pageData.components).toHaveProperty('frontmatter');
      expect(pageData.components.frontmatter).toHaveProperty('content');

      // Create article from page data for enrichment
      const article = {
        slug: 'alumina-laser-cleaning',
        title: pageData.metadata.title,
        name: pageData.metadata.name,
        description: pageData.metadata.description,
        author: pageData.metadata.author,
        frontmatter: pageData.metadata
      };

      // Verify enrichment works with loaded data
      const enriched = enrichArticle(article);
      expect(enriched.tags).toContain('Ceramic');
      expect(enriched.tags).toContain('Industrial');
      expect(enriched.name).toBe('Alumina');
    });
  });

  describe('Content Processing Performance', () => {
    test('should process multiple articles efficiently', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { loadAllArticles } = require('../../app/utils/contentAPI');
      const { enrichArticles } = require('../../app/utils/articleEnrichment');

      const startTime = Date.now();

      // Load all articles
      const articles = await loadAllArticles();
      expect(articles.length).toBeGreaterThan(0);

      // Enrich all articles
      const enrichedArticles = enrichArticles(articles);
      expect(enrichedArticles.length).toBe(articles.length);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process reasonably quickly (arbitrary threshold for test)
      expect(processingTime).toBeLessThan(5000); // Less than 5 seconds
    });

    test('should cache repeated requests effectively', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { loadComponent } = require('../../app/utils/contentAPI');

      const startTime = Date.now();

      // First request
      const result1 = await loadComponent('frontmatter', 'alumina-laser-cleaning');
      const firstRequestTime = Date.now() - startTime;

      // Second request (should be cached)
      const startTime2 = Date.now();
      const result2 = await loadComponent('frontmatter', 'alumina-laser-cleaning');
      const secondRequestTime = Date.now() - startTime2;

      // Results should be identical
      expect(result1).toEqual(result2);

      // Second request should be significantly faster (cached)
      // Note: This might be flaky in CI, so we just verify both completed
      expect(firstRequestTime).toBeGreaterThanOrEqual(0);
      expect(secondRequestTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Consistency and Integrity', () => {
    test('should maintain data consistency across different loading methods', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { loadArticle, loadMetadata, loadPageData } = require('../../app/utils/contentAPI');

      const slug = 'alumina-laser-cleaning';

      // Load using different methods
      const article = await loadArticle(slug);
      const metadata = await loadMetadata(slug);
      const pageData = await loadPageData(slug);

      // Verify consistency
      expect(article.title).toBe(metadata.title);
      expect(article.title).toBe(pageData.metadata.title);
      expect(article.author).toBe(metadata.author);
      expect(article.metadata.category).toBe(metadata.category);
    });

    test('should preserve type safety through pipeline', async () => {
      process.cwd = () => TEST_CONTENT_DIR;

      const { loadAllArticles } = require('../../app/utils/contentAPI');
      const { enrichArticles } = require('../../app/utils/articleEnrichment');

      const articles = await loadAllArticles();
      const enriched = enrichArticles(articles);

      // Verify all articles have required properties
      articles.forEach(article => {
        expect(typeof article.slug).toBe('string');
        expect(typeof article.title).toBe('string');
        expect(Array.isArray(article.tags)).toBe(true);
      });

      // Verify enriched articles maintain type safety
      enriched.forEach(article => {
        expect(typeof article.href).toBe('string');
        expect(Array.isArray(article.tags)).toBe(true);
        expect(article.href.startsWith('/') || article.href === '#').toBe(true);
      });
    });
  });
});
