/**
 * Integration tests for createStaticPage.tsx
 * 
 * These tests exercise the ACTUAL code (no mocks) to get real coverage.
 * We test the createStaticPage factory function with real dependencies.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

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
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for contact page', async () => {
      const { generateMetadata } = createStaticPage('contact');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.openGraph?.images?.[0]?.url).toContain('/images/og-contact.jpg');
    });

    it('should generate metadata for comparison page', async () => {
      const { generateMetadata } = createStaticPage('comparison');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for partners page', async () => {
      const { generateMetadata } = createStaticPage('partners');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for equipment page', async () => {
      const { generateMetadata } = createStaticPage('equipment');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.openGraph?.images?.[0]?.url).toContain('/images/pages/rental.png');
    });

    it('should generate metadata for compliance page', async () => {
      const { generateMetadata } = createStaticPage('compliance');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for safety page', async () => {
      const { generateMetadata } = createStaticPage('safety');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for schedule page (dynamic)', async () => {
      const { generateMetadata } = createStaticPage('schedule');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it('should generate metadata for services page', async () => {
      const { generateMetadata } = createStaticPage('services');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.openGraph?.images?.[0]?.url).toContain('/images/pages/rental.png');
    });

    it('should generate metadata for netalux page (dynamic)', async () => {
      const { generateMetadata } = createStaticPage('netalux');
      const metadata = await generateMetadata();
      
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
      expect(result.props.hideAuthor).toBe(true);
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

    it('should render compliance page component', async () => {
      const { default: Page } = createStaticPage('compliance');
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
      expect(result.props.hideAuthor).toBe(true);
    });

    it('should render services page component', async () => {
      const { default: Page } = createStaticPage('services');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.props.hideAuthor).toBe(true);
    });

    it('should render netalux page component (dynamic)', async () => {
      const { default: Page } = createStaticPage('netalux');
      const result = await Page();
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('Page Type Support', () => {
    const contentCardPages = ['about', 'contact', 'partners', 'equipment', 'compliance', 'safety', 'comparison', 'services'];
    const dynamicPages = ['schedule', 'netalux'];

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
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });

    it('should generate valid metadata for contact page', async () => {
      const { generateMetadata } = createStaticPage('contact');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });

    it('should generate valid metadata for comparison page', async () => {
      const { generateMetadata } = createStaticPage('comparison');
      const metadata = await generateMetadata();
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
    });
  });
});
