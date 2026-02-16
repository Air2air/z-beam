/**
 * Comprehensive tests for createContentPage.tsx
 * 
 * Tests the content page factory that creates category, subcategory, and item pages
 * for materials, contaminants, compounds, and settings.
 */

import { describe, it, expect } from '@jest/globals';
import { 
  createCategoryPage, 
  createSubcategoryPage, 
  createItemPage 
} from '@/app/utils/pages/createContentPage';
import type { Metadata } from 'next';

describe('createContentPage Factory', () => {
  
  // ============================================================================
  // Category Page Tests
  // ============================================================================
  
  describe('createCategoryPage', () => {
    const contentTypes = ['materials', 'contaminants', 'compounds', 'settings'] as const;
    
    contentTypes.forEach(contentType => {
      describe(`${contentType} category page`, () => {
        it('should return factory object with required methods', () => {
          const factory = createCategoryPage(contentType);
          
          expect(factory).toHaveProperty('generateStaticParams');
          expect(factory).toHaveProperty('generateMetadata');
          expect(factory).toHaveProperty('default');
          expect(typeof factory.generateStaticParams).toBe('function');
          expect(typeof factory.generateMetadata).toBe('function');
          expect(typeof factory.default).toBe('function');
        });

        it('should generate static params', async () => {
          const factory = createCategoryPage(contentType);
          const params = await factory.generateStaticParams();
          
          expect(Array.isArray(params)).toBe(true);
          if (params.length > 0) {
            expect(params[0]).toHaveProperty('category');
          }
        });

        it('should generate metadata for category', async () => {
          const factory = createCategoryPage(contentType);
          const params = await factory.generateStaticParams();
          
          if (params.length > 0) {
            const metadata = await factory.generateMetadata({ 
              params: { category: params[0].category } 
            }) as Metadata;
            
            expect(metadata).toBeDefined();
            expect(metadata.title).toBeDefined();
            expect(metadata.description).toBeDefined();
          }
        });

        it('should render category page component', async () => {
          const factory = createCategoryPage(contentType);
          const params = await factory.generateStaticParams();
          
          if (params.length > 0) {
            const Page = factory.default;
            const result = await Page({ 
              params: { category: params[0].category } 
            });
            
            expect(result).toBeDefined();
            expect(result.type).toBeDefined();
          }
        });
      });
    });

    it('should handle settings type without category metadata', async () => {
      const factory = createCategoryPage('settings');
      const params = await factory.generateStaticParams();
      
      // Settings may not have categories, should handle gracefully
      expect(Array.isArray(params)).toBe(true);
    });
  });

  // ============================================================================
  // Subcategory Page Tests
  // ============================================================================
  
  describe('createSubcategoryPage', () => {
    const contentTypes = ['materials', 'contaminants', 'compounds', 'settings'] as const;
    
    contentTypes.forEach(contentType => {
      describe(`${contentType} subcategory page`, () => {
        it('should return factory object with required methods', () => {
          const factory = createSubcategoryPage(contentType);
          
          expect(factory).toHaveProperty('generateStaticParams');
          expect(factory).toHaveProperty('generateMetadata');
          expect(factory).toHaveProperty('default');
          expect(typeof factory.generateStaticParams).toBe('function');
          expect(typeof factory.generateMetadata).toBe('function');
          expect(typeof factory.default).toBe('function');
        });

        it('should generate static params', async () => {
          const factory = createSubcategoryPage(contentType);
          const params = await factory.generateStaticParams();
          
          expect(Array.isArray(params)).toBe(true);
          if (params.length > 0) {
            expect(params[0]).toHaveProperty('category');
            expect(params[0]).toHaveProperty('subcategory');
          }
        });

        it('should generate metadata for valid subcategory', async () => {
          const factory = createSubcategoryPage(contentType);
          const params = await factory.generateStaticParams();
          
          if (params.length > 0) {
            const metadata = await factory.generateMetadata({ 
              params: Promise.resolve({
                category: params[0].category,
                subcategory: params[0].subcategory
              })
            }) as Metadata;
            
            expect(metadata).toBeDefined();
            expect(metadata.title).toBeDefined();
            expect(metadata.description).toBeDefined();
          }
        });

        it('should render subcategory page component', async () => {
          const factory = createSubcategoryPage(contentType);
          const params = await factory.generateStaticParams();
          
          if (params.length > 0) {
            const Page = factory.default;
            const result = await Page({ 
              params: Promise.resolve({
                category: params[0].category,
                subcategory: params[0].subcategory
              })
            });
            
            expect(result).toBeDefined();
            expect(result.type).toBeDefined();
          }
        });
      });
    });

    it('should handle invalid subcategory gracefully', async () => {
      const factory = createSubcategoryPage('materials');
      const metadata = await factory.generateMetadata({ 
        params: Promise.resolve({
          category: 'metal',
          subcategory: 'nonexistent-subcategory'
        })
      }) as Metadata;
      
      // Should return error metadata for invalid subcategory
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });
  });

  // ============================================================================
  // Item Page Tests
  // ============================================================================
  
  describe('createItemPage', () => {
    const contentTypes = ['materials', 'contaminants', 'compounds', 'settings'] as const;
    
    contentTypes.forEach(contentType => {
      describe(`${contentType} item page`, () => {
        it('should return factory object with required methods', () => {
          const factory = createItemPage(contentType);
          
          expect(factory).toHaveProperty('generateStaticParams');
          expect(factory).toHaveProperty('generateMetadata');
          expect(factory).toHaveProperty('default');
          expect(typeof factory.generateStaticParams).toBe('function');
          expect(typeof factory.generateMetadata).toBe('function');
          expect(typeof factory.default).toBe('function');
        });

        it('should generate static params', async () => {
          const factory = createItemPage(contentType);
          const params = await factory.generateStaticParams();
          
          expect(Array.isArray(params)).toBe(true);
          if (params.length > 0) {
            expect(params[0]).toHaveProperty('category');
            expect(params[0]).toHaveProperty('subcategory');
            expect(params[0]).toHaveProperty('slug');
          }
        });

        it('should generate metadata for item', async () => {
          const factory = createItemPage(contentType);
          const params = await factory.generateStaticParams();
          
          if (params.length > 0) {
            const metadata = await factory.generateMetadata({ 
              params: Promise.resolve({
                category: params[0].category,
                subcategory: params[0].subcategory,
                slug: params[0].slug
              })
            }) as Metadata;
            
            expect(metadata).toBeDefined();
            expect(metadata.title).toBeDefined();
            expect(metadata.description).toBeDefined();
          }
        });

        it('should render item page component', async () => {
          const factory = createItemPage(contentType);
          const params = await factory.generateStaticParams();
          
          if (params.length > 0) {
            const Page = factory.default;
            const result = await Page({ 
              params: Promise.resolve({
                category: params[0].category,
                subcategory: params[0].subcategory,
                slug: params[0].slug
              })
            });
            
            expect(result).toBeDefined();
            expect(result.type).toBeDefined();
          }
        });
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  
  describe('Factory Integration', () => {
    it('should create consistent factories across all content types', () => {
      const contentTypes = ['materials', 'contaminants', 'compounds', 'settings'] as const;
      
      contentTypes.forEach(type => {
        const categoryFactory = createCategoryPage(type);
        const subcategoryFactory = createSubcategoryPage(type);
        const itemFactory = createItemPage(type);
        
        expect(categoryFactory).toHaveProperty('generateStaticParams');
        expect(subcategoryFactory).toHaveProperty('generateStaticParams');
        expect(itemFactory).toHaveProperty('generateStaticParams');
      });
    });

    it('should support full navigation hierarchy', async () => {
      const factory = createItemPage('materials');
      const params = await factory.generateStaticParams();
      
      if (params.length > 0) {
        const sample = params[0];
        
        // Verify full path structure
        expect(sample.category).toBeDefined();
        expect(sample.subcategory).toBeDefined();
        expect(sample.slug).toBeDefined();
        expect(typeof sample.category).toBe('string');
        expect(typeof sample.subcategory).toBe('string');
        expect(typeof sample.slug).toBe('string');
      }
    });
  });
});
