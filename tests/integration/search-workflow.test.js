// tests/integration/search-workflow.test.js
// Integration tests for search functionality end-to-end

const path = require('path');
const { enrichArticle } = require('../../app/utils/articleEnrichment');
const { getBadgeFromItem, getDisplayName } = require('../../app/utils/searchUtils');

describe('Search Workflow Integration', () => {
  describe('Article to SearchableArticle Pipeline', () => {
    test('should transform basic article through complete search pipeline', () => {
      const rawArticle = {
        slug: 'alumina-laser-cleaning',
        title: 'Alumina Laser Cleaning Process',
        description: 'Advanced ceramic cleaning using precision laser technology',
        author: 'Dr. Materials',
        frontmatter: {
          subject: 'alumina',
          category: 'ceramic',
          tags: ['Industrial', 'Precision'],
          keywords: ['manufacturing', 'surface-treatment']
        }
      };

      // Step 1: Enrich article for search
      const searchableArticle = enrichArticle(rawArticle);

      // Step 2: Generate badge for display
      const badge = getBadgeFromItem(searchableArticle);

      // Step 3: Get display name
      const displayName = getDisplayName(searchableArticle);

      // Verify complete pipeline
      expect(searchableArticle.href).toBe('/alumina-laser-cleaning');
      expect(searchableArticle.name).toBe('Alumina');
      expect(searchableArticle.tags).toContain('Surface Treatment'); // Inferred from cleaning
      expect(searchableArticle.tags).toContain('Ceramic'); // Inferred from content
      expect(searchableArticle.tags).toContain('Industrial'); // From frontmatter
      expect(searchableArticle.tags).toContain('Dr. Materials'); // Author tag

      expect(badge).toEqual({
        symbol: 'Al',
        formula: 'Al₂O₃',
        materialType: 'ceramic',
        color: 'green'
      });

      expect(displayName).toBe('Alumina');
    });

    test('should handle complex multi-word materials', () => {
      const rawArticle = {
        slug: 'silicon-carbide-semiconductor-processing',
        title: 'Silicon Carbide Semiconductor Processing',
        frontmatter: {
          subject: 'silicon carbide',
          category: 'semiconductor',
          articleType: 'technical-guide'
        }
      };

      const searchableArticle = enrichArticle(rawArticle);
      const badge = getBadgeFromItem(searchableArticle);
      const displayName = getDisplayName(searchableArticle);

      expect(searchableArticle.name).toBe('Silicon Carbide');
      expect(searchableArticle.tags).toContain('Electronics'); // Inferred from semiconductor
      expect(searchableArticle.tags).toContain('technical-guide');

      expect(badge).toEqual({
        materialType: 'semiconductor',
        color: 'red'
      });

      expect(displayName).toBe('Silicon Carbide');
    });

    test('should handle articles with minimal metadata', () => {
      const minimalArticle = {
        slug: 'basic-cleaning-process'
      };

      const searchableArticle = enrichArticle(minimalArticle);
      const badge = getBadgeFromItem(searchableArticle);
      const displayName = getDisplayName(searchableArticle);

      expect(searchableArticle.href).toBe('/basic-cleaning-process');
      expect(searchableArticle.name).toBe('Basic');
      expect(searchableArticle.tags).toContain('Surface Treatment'); // From cleaning in slug
      expect(searchableArticle.tags).toContain('cleaning');

      expect(badge).toBeNull(); // No category info available
      expect(displayName).toBe('Basic');
    });
  });

  describe('Batch Processing Pipeline', () => {
    test('should process multiple articles consistently', () => {
      const articles = [
        {
          slug: 'ceramic-laser-cleaning',
          title: 'Ceramic Cleaning',
          frontmatter: { category: 'ceramic', subject: 'alumina' }
        },
        {
          slug: 'metal-surface-treatment',
          title: 'Metal Treatment', 
          frontmatter: { category: 'metal' }
        },
        {
          slug: 'polymer-precision-manufacturing',
          title: 'Polymer Manufacturing',
          frontmatter: { category: 'polymer' }
        }
      ];

      const processed = articles.map(article => {
        const enriched = enrichArticle(article);
        const badge = getBadgeFromItem(enriched);
        return { ...enriched, badge };
      });

      // Verify all articles processed correctly
      expect(processed).toHaveLength(3);
      
      // Ceramic article
      expect(processed[0].tags).toContain('Surface Treatment');
      expect(processed[0].badge.symbol).toBe('Al');
      expect(processed[0].badge.color).toBe('green');

      // Metal article  
      expect(processed[1].tags).toContain('Surface Treatment');
      expect(processed[1].badge.materialType).toBe('alloy'); // metal -> alloy
      expect(processed[1].badge.color).toBe('blue');

      // Polymer article
      expect(processed[2].tags).toContain('precision');
      expect(processed[2].badge.materialType).toBe('polymer');
      expect(processed[2].badge.color).toBe('purple');
    });
  });

  describe('Tag Inference and Normalization', () => {
    test('should create comprehensive tag ecosystem', () => {
      const article = {
        slug: 'industrial-ceramic-laser-cleaning-precision-manufacturing',
        title: 'Industrial Ceramic Laser Cleaning for Precision Manufacturing Applications',
        description: 'Advanced contaminant removal using laser ablation for medical device surface treatment',
        author: 'Engineering Team',
        frontmatter: {
          subject: 'alumina',
          category: 'ceramic',
          tags: ['Quality Control', 'FDA-Approved'],
          keywords: ['biocompatible', 'surgical-grade', 'cleanroom'],
          articleType: 'case-study'
        }
      };

      const enriched = enrichArticle(article);

      // Verify comprehensive tag collection
      const expectedTags = [
        'Engineering Team', // Author
        'Quality Control', // Explicit tag
        'FDA-Approved', // Explicit tag
        'biocompatible', // Keyword
        'surgical-grade', // Keyword
        'cleanroom', // Keyword
        'Ceramic', // Category (deduplicated to capitalized version)
        'alumina', // Subject
        'case-study', // Article type
        'Industrial', // From slug (deduplicated to capitalized version)
        'laser', // From slug
        'cleaning', // From slug
        'precision', // From slug
        'manufacturing', // From slug
        'Surface Treatment', // Inferred from cleaning
        'Medical', // Inferred from medical content
        'Precision Cleaning', // Inferred from precision + cleaning
        'Contaminant Removal' // Inferred from contaminant removal
      ];

      expectedTags.forEach(tag => {
        expect(enriched.tags).toContain(tag);
      });

      // Verify deduplication
      const ceramicTags = enriched.tags.filter(tag => tag.toLowerCase() === 'ceramic');
      expect(ceramicTags.length).toBe(1); // Should only have one 'Ceramic'
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should handle articles with conflicting information', () => {
      const conflictedArticle = {
        name: 'Override Name',
        slug: 'different-material-name',
        frontmatter: {
          name: 'Frontmatter Name',
          title: 'Yet Another Title'
        }
      };

      const enriched = enrichArticle(conflictedArticle);
      const displayName = getDisplayName(enriched);

      // Name should be preserved (not overwritten)
      expect(enriched.name).toBe('Override Name');
      expect(displayName).toBe('Override Name');
    });

    test('should handle empty and undefined values gracefully', () => {
      const emptyArticle = {
        slug: '',
        title: null,
        description: undefined,
        frontmatter: {
          tags: [],
          keywords: null,
          category: ''
        }
      };

      const enriched = enrichArticle(emptyArticle);
      const badge = getBadgeFromItem(enriched);
      const displayName = getDisplayName(enriched);

      expect(enriched.href).toBe('#'); // Fallback for empty slug
      expect(enriched.tags).toBeDefined();
      expect(Array.isArray(enriched.tags)).toBe(true);
      expect(badge).toBeNull();
      expect(displayName).toBe('Unnamed Item');
    });

    test('should handle malformed frontmatter gracefully', () => {
      const malformedArticle = {
        slug: 'test-article',
        frontmatter: {
          tags: 'should-be-array', // Wrong type
          keywords: { invalid: 'object' }, // Wrong type
          category: ['should', 'be', 'string'] // Wrong type
        }
      };

      const enriched = enrichArticle(malformedArticle);

      expect(enriched.tags).toBeDefined();
      expect(Array.isArray(enriched.tags)).toBe(true);
      expect(enriched.href).toBe('/test-article');
    });
  });

  describe('Real-world Scenario Simulation', () => {
    test('should handle typical material science article workflow', () => {
      // Simulate a complete workflow from raw content to search-ready
      const rawMaterialArticle = {
        slug: 'zirconium-oxide-biomedical-applications',
        title: 'Zirconium Oxide in Biomedical Applications: Surface Treatment for Implant Components',
        description: 'Comprehensive analysis of ZrO₂ ceramic surface modification using laser cleaning techniques for enhanced biocompatibility in surgical implants.',
        author: 'Dr. Sarah Chen',
        frontmatter: {
          subject: 'zirconium oxide',
          category: 'ceramic',
          tags: ['Biomedical', 'FDA-Approved', 'Research'],
          keywords: ['implant', 'biocompatible', 'surgical', 'medical-grade'],
          articleType: 'research-paper',
          chemicalFormula: 'ZrO₂',
          materialType: 'ceramic'
        },
        metadata: {
          chemicalProperties: {
            symbol: 'Zr',
            formula: 'ZrO₂',
            materialType: 'ceramic',
            atomicNumber: 40
          }
        }
      };

      // Full pipeline processing
      const searchableArticle = enrichArticle(rawMaterialArticle);
      const badge = getBadgeFromItem(searchableArticle);
      const displayName = getDisplayName(searchableArticle);

      // Verify searchable article properties
      expect(searchableArticle.name).toBe('Zirconium Oxide');
      expect(searchableArticle.href).toBe('/zirconium-oxide-biomedical-applications');
      
      // Verify comprehensive tagging
      expect(searchableArticle.tags).toContain('Dr. Sarah Chen');
      expect(searchableArticle.tags).toContain('Biomedical');
      expect(searchableArticle.tags).toContain('Medical'); // Inferred
      expect(searchableArticle.tags).toContain('Surface Treatment'); // Inferred
      expect(searchableArticle.tags).toContain('research-paper');
      expect(searchableArticle.tags).toContain('biocompatible');

      // Verify badge creation
      expect(badge).toEqual({
        materialType: 'ceramic',
        color: 'green'
      });

      expect(displayName).toBe('Zirconium Oxide');

      // Verify no duplicate tags
      const uniqueTags = [...new Set(searchableArticle.tags)];
      expect(searchableArticle.tags.length).toBe(uniqueTags.length);
    });
  });
});
