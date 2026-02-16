import { loadStaticPageFrontmatter } from '../../app/utils/staticPageLoader';
import { ContentCardItem } from '@/types';

describe('staticPageLoader', () => {
  describe('loadStaticPageFrontmatter', () => {
    it('should load basic page YAML frontmatter with standard structure', () => {
      const result = loadStaticPageFrontmatter('contact');
      
      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('pageDescription');
      expect(typeof result.pageTitle).toBe('string');
      expect(typeof result.pageDescription).toBe('string');
    });



    it('should include metadata fields from YAML', () => {
      const result = loadStaticPageFrontmatter('contact');
      
      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('pageDescription');
    });

    it('should handle pages with or without content cards', () => {
      const result = loadStaticPageFrontmatter('contact');
      
      // ContentCards are optional in new YAML structure
      if (result.contentCards) {
        expect(Array.isArray(result.contentCards)).toBe(true);
      }
    });

    it('should handle all static page directories consistently', () => {
      const pageDirectories = [
        'contact', 'rental', 'partners', 'equipment', 
        'operations', 'schedule', 'services', 'safety', 
        'about', 'netalux'
      ];

      pageDirectories.forEach(directory => {
        const result = loadStaticPageFrontmatter(directory);
        expect(result).toHaveProperty('pageTitle');
        expect(result).toHaveProperty('pageDescription');
        expect(typeof result.pageTitle).toBe('string');
        expect(typeof result.pageDescription).toBe('string');
      });
    });



    it('should maintain consistent return type structure', () => {
      const result = loadStaticPageFrontmatter('contact');

      // Should have standard YAML frontmatter structure
      expect(result).toHaveProperty('pageTitle');
      expect(result).toHaveProperty('pageDescription');
      expect(typeof result.pageTitle).toBe('string');
      expect(typeof result.pageDescription).toBe('string');
    });
  });
});