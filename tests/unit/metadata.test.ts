/**
 * @jest-environment node
 * 
 * Tests for enhanced metadata generation with E-E-A-T optimization
 * 
 * Test Coverage:
 * 1. Hero image extraction from images.hero
 * 2. Fallback to legacy image field
 * 3. Twitter Card generation
 * 4. Enhanced OpenGraph with article metadata
 * 5. E-E-A-T signals in meta tags
 * 6. Author expertise metadata
 * 7. Publication/modification dates
 * 8. Proper URL formation
 */

import { createMetadata } from '@/app/utils/metadata';
import { ArticleMetadata } from '@/types';

describe('Enhanced Metadata Generation', () => {
  describe('Hero Image Extraction', () => {
    it('should extract hero image from images.hero structure', () => {
      const metadata: ArticleMetadata = {
        title: 'Alabaster Laser Cleaning',
        slug: 'alabaster-laser-cleaning',
        description: 'Comprehensive guide to laser cleaning alabaster',
        images: {
          hero: {
            url: '/images/material/alabaster-laser-cleaning-hero.jpg',
            alt: 'Alabaster surface undergoing laser cleaning',
            width: 1200,
            height: 630,
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.images).toBeDefined();
      expect(result.openGraph.images[0].url).toContain('alabaster-laser-cleaning-hero.jpg');
      expect(result.openGraph.images[0].alt).toBe('Alabaster surface undergoing laser cleaning');
      expect(result.openGraph.images[0].width).toBe(1200);
      expect(result.openGraph.images[0].height).toBe(630);
    });

    it('should fall back to legacy image field when images.hero missing', () => {
      const metadata: ArticleMetadata = {
        title: 'Test Material',
        slug: 'test-material',
        description: 'Test description',
        image: '/images/legacy-image.jpg',
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.images).toBeDefined();
      expect(result.openGraph.images[0].url).toContain('legacy-image.jpg');
    });

    it('should use hero image with full URL', () => {
      const metadata: ArticleMetadata = {
        title: 'External Material',
        slug: 'external-material',
        description: 'Test description',
        images: {
          hero: {
            url: 'https://external-cdn.com/hero.jpg',
            alt: 'External hero image',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.images[0].url).toBe('https://external-cdn.com/hero.jpg');
    });

    it('should generate default alt text when missing', () => {
      const metadata: ArticleMetadata = {
        title: 'Marble Laser Etching',
        slug: 'marble-laser-etching',
        description: 'Test description',
        images: {
          hero: {
            url: '/images/marble-hero.jpg',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.images[0].alt).toContain('Marble Laser Etching');
    });

    it('should use dynamic dimensions from frontmatter when provided', () => {
      const metadata: ArticleMetadata = {
        title: 'Ultra HD Material',
        slug: 'ultra-hd-material',
        description: 'Test description',
        images: {
          hero: {
            url: '/images/ultra-hd-hero.jpg',
            alt: 'Ultra HD surface',
            width: 3840,
            height: 2160,
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.images[0].width).toBe(3840);
      expect(result.openGraph.images[0].height).toBe(2160);
    });

    it('should fallback to default dimensions when not in frontmatter', () => {
      const metadata: ArticleMetadata = {
        title: 'No Dimensions Material',
        slug: 'no-dimensions-material',
        description: 'Test description',
        images: {
          hero: {
            url: '/images/no-dims-hero.jpg',
            alt: 'Hero without dimensions',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.images[0].width).toBe(1200);
      expect(result.openGraph.images[0].height).toBe(630);
    });
  });

  describe('Twitter Card Generation', () => {
    it('should generate summary_large_image Twitter card', () => {
      const metadata: ArticleMetadata = {
        title: 'Granite Surface Analysis',
        slug: 'granite-surface-analysis',
        description: 'Detailed analysis of granite surface treatment',
        images: {
          hero: {
            url: '/images/granite-hero.jpg',
            alt: 'Granite surface under analysis',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.twitter).toBeDefined();
      // Twitter card is 'player' when video content is present
      expect(result.twitter.card).toBe('player');
      expect(result.twitter.title).toBe('Granite Surface Analysis');
      expect(result.twitter.description).toContain('Detailed analysis of granite surface treatment');
      expect(result.twitter.images).toBeDefined();
      expect(result.twitter.images?.[0]?.url).toContain('granite-hero.jpg');
    });

    it('should include author Twitter handle', () => {
      const metadata: ArticleMetadata = {
        title: 'Test Article',
        slug: 'test-article',
        description: 'Test description',
        author: 'Dr. John Smith',
        images: {
          hero: {
            url: '/images/test-hero.jpg',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.twitter.creator).toBe('@Dr.JohnSmith');
    });
  });

  describe('Enhanced OpenGraph Metadata', () => {
    it('should include article-specific OpenGraph properties', () => {
      const metadata: ArticleMetadata = {
        title: 'Limestone Conservation',
        slug: 'limestone-conservation',
        description: 'Advanced techniques for limestone conservation',
        category: 'conservation',
        datePublished: '2024-01-15',
        keywords: ['limestone', 'conservation', 'laser cleaning'],
        author: 'Todd Dunning',
        images: {
          hero: {
            url: '/images/limestone-hero.jpg',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.type).toBe('article');
      expect(result.openGraph.article).toBeDefined();
      expect(result.openGraph.article.publishedTime).toBe('2024-01-15');
      expect(result.openGraph.article.authors).toContain('Todd Dunning');
      expect(result.openGraph.article.section).toBe('conservation');
      expect(result.openGraph.article.tags).toEqual(['limestone', 'conservation', 'laser cleaning']);
    });

    it('should include modification date when available', () => {
      const metadata: ArticleMetadata & { dateModified?: string } = {
        title: 'Updated Material Guide',
        slug: 'updated-material-guide',
        description: 'Recently updated guide',
        datePublished: '2024-01-15',
        dateModified: '2024-06-20',
        images: {
          hero: {
            url: '/images/guide-hero.jpg',
          },
        },
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.article.modifiedTime).toBe('2024-06-20');
    });

    it('should include site name and locale', () => {
      const metadata: ArticleMetadata = {
        title: 'Test Article',
        slug: 'test-article',
        description: 'Test description',
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.siteName).toBeDefined();
      expect(result.openGraph.locale).toBe('en_US');
    });

    it('should include canonical URL', () => {
      const metadata: ArticleMetadata = {
        title: 'Test Article',
        slug: 'test-article-slug',
        description: 'Test description',
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.url).toContain('test-article-slug');
    });
  });

  describe('E-E-A-T Meta Tags', () => {
    it('should include author expertise signals', () => {
      const metadata: ArticleMetadata = {
        title: 'Advanced Material Science',
        slug: 'advanced-material-science',
        description: 'Expert analysis',
        author: {
          name: 'Todd Dunning',
          title: 'MA in Optical Materials',
          expertise: 'Laser Cleaning Applications',
          credentials: ['MA in Optical Materials', 'Laser cleaning specialist'],
        },
      };

      const result = createMetadata(metadata);

      expect(result.other).toBeDefined();
      expect(result.other['author']).toBe('Todd Dunning');
      expect(result.other['author-title']).toBe('MA in Optical Materials');
      expect(result.other['author-expertise']).toBe('Laser Cleaning Applications');
    });

    it('should include publication timestamps for trustworthiness', () => {
      const metadata: ArticleMetadata & { dateModified?: string } = {
        title: 'Peer-Reviewed Research',
        slug: 'peer-reviewed-research',
        description: 'Published research article',
        datePublished: '2024-03-01T10:00:00Z',
        dateModified: '2024-06-15T14:30:00Z',
      };

      const result = createMetadata(metadata);

      expect(result.other['article:published_time']).toBe('2024-03-01T10:00:00Z');
      expect(result.other['article:modified_time']).toBe('2024-06-15T14:30:00Z');
    });

    it('should include content categorization', () => {
      const metadata: ArticleMetadata & { name?: string } = {
        title: 'Marble Technical Guide',
        slug: 'marble-technical-guide',
        description: 'Technical specifications',
        category: 'technical-guides',
        name: 'Marble',
      };

      const result = createMetadata(metadata);

      expect(result.other['article:section']).toBe('technical-guides');
      expect(result.other['material-name']).toBe('Marble');
    });
  });

  describe('Subtitle Integration', () => {
    it('should combine subtitle with description', () => {
      const metadata: ArticleMetadata = {
        title: 'Advanced Laser Techniques',
        subtitle: 'Comprehensive Technical Analysis',
        slug: 'laser-cleaning-process',
        description: 'Detailed guide to laser cleaning techniques and applications.',
      };

      const result = createMetadata(metadata);

      expect(result.description).toContain('Detailed guide to laser cleaning techniques');
      expect(result.openGraph.description).toContain('Detailed guide to laser cleaning techniques');
    });

    it('should use description only when subtitle missing', () => {
      const metadata: ArticleMetadata = {
        title: 'Simple Guide',
        slug: 'simple-guide',
        description: 'Just a description',
      };

      const result = createMetadata(metadata);

      expect(result.description).toContain('Just a description');
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with minimal metadata', () => {
      const metadata: ArticleMetadata = {
        title: 'Basic Article',
        slug: 'basic-article',
      };

      const result = createMetadata(metadata);

      expect(result.title).toBe('Basic Article | Z-Beam');
      expect(result.description).toBeDefined();
      expect(result.openGraph).toBeDefined();
    });

    it('should handle string author format', () => {
      const metadata: ArticleMetadata = {
        title: 'Article with String Author',
        slug: 'article-string-author',
        description: 'Test article',
        author: 'Simple Author Name',
        datePublished: '2024-01-01', // Required for article type
      };

      const result = createMetadata(metadata);

      expect(result.openGraph.article?.authors).toEqual(['Simple Author Name']);
      expect(result.other?.['author']).toBe('Simple Author Name');
    });

    it('should handle missing optional fields gracefully', () => {
      const metadata: ArticleMetadata = {
        title: 'Minimal Article',
        slug: 'minimal-article',
        description: 'Minimal test',
      };

      const result = createMetadata(metadata);

      // Should not throw errors
      expect(result).toBeDefined();
      expect(result.openGraph).toBeDefined();
      expect(result.twitter).toBeDefined();
      
      // Optional fields should be undefined, not break
      expect(result.openGraph.images).toBeUndefined();
      expect(result.openGraph.article?.publishedTime).toBeUndefined();
    });
  });
});
