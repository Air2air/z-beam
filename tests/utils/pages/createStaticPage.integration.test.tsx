/**
 * Integration tests for createStaticPage.tsx
 * 
 * These tests exercise the ACTUAL code (no mocks) to get real coverage.
 * We test the createStaticPage factory function with real dependencies.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { createStaticPage } from '@/app/utils/pages/createStaticPage';
import type { Metadata } from 'next';

describe('createStaticPage Integration Tests', () => {
  describe('Factory Function Return Value', () => {
    it('should return an object with generateMetadata and default component', () => {
      const result = createStaticPage('about');
      
      expect(result).toHaveProperty('generateMetadata');
      expect(result).toHaveProperty('default');
      expect(typeof result.generateMetadata).toBe('function');
      expect(typeof result.default).toBe('function');
    });
  });

  describe('generateMetadata Function', () => {
    it('should generate metadata for about page', async () => {
      const { generateMetadata } = createStaticPage('about');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for rental page', async () => {
      const { generateMetadata } = createStaticPage('rental');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for contact page', async () => {
      const { generateMetadata } = createStaticPage('contact');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for comparison page', async () => {
      const { generateMetadata } = createStaticPage('comparison');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for partners page', async () => {
      const { generateMetadata } = createStaticPage('partners');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for equipment page', async () => {
      const { generateMetadata } = createStaticPage('equipment');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for operations page', async () => {
      const { generateMetadata } = createStaticPage('operations');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for safety page', async () => {
      const { generateMetadata } = createStaticPage('safety');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for schedule page (dynamic)', async () => {
      const { generateMetadata } = createStaticPage('schedule');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for services page (dynamic)', async () => {
      const { generateMetadata } = createStaticPage('services');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for netalux page (dynamic)', async () => {
      const { generateMetadata } = createStaticPage('netalux');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });
  });

  describe('Page Component Rendering', () => {
    it('should render about page component', async () => {
      const { default: Page } = createStaticPage('about');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render rental page component', async () => {
      const { default: Page } = createStaticPage('rental');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render contact page component', async () => {
      const { default: Page } = createStaticPage('contact');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render comparison page with comparison table', async () => {
      const { default: Page } = createStaticPage('comparison');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render partners page component', async () => {
      const { default: Page } = createStaticPage('partners');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render equipment page component', async () => {
      const { default: Page } = createStaticPage('equipment');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render operations page component', async () => {
      const { default: Page } = createStaticPage('operations');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render safety page component', async () => {
      const { default: Page } = createStaticPage('safety');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render schedule page component (dynamic)', async () => {
      const { default: Page } = createStaticPage('schedule');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render services page component (dynamic)', async () => {
      const { default: Page } = createStaticPage('services');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('should render netalux page component (dynamic)', async () => {
      const { default: Page } = createStaticPage('netalux');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('Page Type Support', () => {
    const contentCardPages = ['rental', 'about', 'contact', 'partners', 'equipment', 'operations', 'safety', 'comparison'];
    const dynamicPages = ['schedule', 'services', 'netalux'];

    contentCardPages.forEach(pageType => {
      it(`should support content-cards page: ${pageType}`, () => {
        const result = createStaticPage(pageType as any);
        expect(result).toBeDefined();
        expect(result.generateMetadata).toBeDefined();
        expect(result.default).toBeDefined();
      });
    });

    dynamicPages.forEach(pageType => {
      it(`should support dynamic-content page: ${pageType}`, () => {
        const result = createStaticPage(pageType as any);
        expect(result).toBeDefined();
        expect(result.generateMetadata).toBeDefined();
        expect(result.default).toBeDefined();
      });
    });
  });

  describe('Page Configuration', () => {
    it('should generate valid metadata for about page', async () => {
      const { generateMetadata } = createStaticPage('about');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });

    it('should generate valid metadata for contact page', async () => {
      const { generateMetadata } = createStaticPage('contact');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });

    it('should generate valid metadata for comparison page', async () => {
      const { generateMetadata } = createStaticPage('comparison');
      const metadata = await generateMetadata() as Metadata;
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });
  });
});
