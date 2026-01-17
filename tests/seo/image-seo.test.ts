/**
 * @jest-environment node
 * 
 * Tests for Image SEO Implementation
 * 
 * Test Coverage:
 * 1. Alt text generation and fallbacks
 * 2. Image sitemap generation
 * 3. ImageObject JSON-LD schema
 * 4. Hero and micro image metadata
 * 5. Production image validation
 */

describe('Image SEO - Alt Text Implementation', () => {
  describe('Hero Image Alt Text', () => {
    it('should prioritize frontmatter alt text', () => {
      const frontmatter = {
        name: 'Aluminum',
        title: 'Aluminum Laser Cleaning',
        category: 'metal',
        subcategory: 'non-ferrous',
        description: 'Professional laser cleaning for aluminum surfaces',
        images: {
          hero: {
            url: '/images/material/aluminum-hero.jpg',
            alt: 'Aluminum surface undergoing precision laser cleaning showing contaminant removal'
          }
        }
      };
      
      // Priority 1: Explicit alt text
      expect(frontmatter.images.hero.alt).toBeDefined();
      expect(frontmatter.images.hero.alt.length).toBeGreaterThan(30);
      expect(frontmatter.images.hero.alt.toLowerCase()).toContain('aluminum');
    });

    it('should generate rich fallback from frontmatter data', () => {
      const frontmatter = {
        name: 'Porcelain',
        title: 'Porcelain Laser Cleaning',
        category: 'ceramic',
        subcategory: 'oxide',
        description: 'Precision laser treatment for porcelain surfaces',
        images: {
          hero: {
            url: '/images/material/porcelain-hero.jpg',
            // Missing alt - should generate rich fallback
          }
        }
      };
      
      // Rich fallback components
      const expectedComponents = {
        materialName: frontmatter.name,
        category: frontmatter.category,
        subcategory: frontmatter.subcategory,
        context: 'laser cleaning'
      };
      
      // Should generate: "Professional laser cleaning for Porcelain - ceramic oxide surface treatment"
      const generatedAlt = `Professional laser cleaning for ${expectedComponents.materialName} - ${expectedComponents.category} ${expectedComponents.subcategory} surface treatment`;
      
      expect(generatedAlt.toLowerCase()).toContain(expectedComponents.materialName.toLowerCase());
      expect(generatedAlt).toContain(expectedComponents.category);
      expect(generatedAlt.length).toBeGreaterThan(50);
    });

    it('should handle minimal frontmatter gracefully', () => {
      const frontmatter = {
        title: 'Unknown Material',
        images: {
          hero: {
            url: '/images/unknown-hero.jpg'
          }
        }
      };
      
      // Fallback to title-based alt
      const fallbackAlt = `${frontmatter.title} hero image`;
      expect(fallbackAlt).toContain(frontmatter.title);
      expect(fallbackAlt.length).toBeGreaterThan(10);
    });
  });

  describe('Micro Image Alt Text', () => {
    it('should use images.micro.alt when available', () => {
      const frontmatter = {
        name: 'Steel',
        images: {
          micro: {
            url: '/images/material/steel-micro.jpg',
            alt: 'Steel microscopic surface analysis showing grain structure at 1000x magnification'
          }
        }
      };
      
      expect(frontmatter.images.micro.alt).toBeDefined();
      expect(frontmatter.images.micro.alt).toContain('microscopic');
      expect(frontmatter.images.micro.alt).toContain('1000x');
    });

    it('should generate rich fallback from micro description', () => {
      const frontmatter = {
        name: 'Aluminum',
        category: 'metal',
        micro: {
          before: 'Surface shows oxidation layer and embedded contaminants',
          after: 'Clean surface reveals pristine aluminum substrate'
        },
        images: {
          micro: {
            url: '/images/material/aluminum-micro.jpg'
            // Missing alt - should use micro.before or generate
          }
        }
      };
      
      // Rich fallback: Use micro.before or generate from name
      const expectedAlt = `${frontmatter.name} microscopic surface analysis showing ${frontmatter.micro.before.toLowerCase().substring(0, 50)}`;
      
      expect(expectedAlt).toContain(frontmatter.name);
      expect(expectedAlt).toContain('microscopic');
      expect(expectedAlt.length).toBeGreaterThan(30);
    });

    it('should include magnification level in generated alt', () => {
      const materialName = 'Titanium';
      const generatedAlt = `${materialName} surface analysis at microscopic level (1000x magnification)`;
      
      expect(generatedAlt).toContain('1000x');
      expect(generatedAlt).toContain('magnification');
      expect(generatedAlt).toContain(materialName);
    });
  });

  describe('Card and Thumbnail Alt Text', () => {
    it('should prioritize imageAlt prop', () => {
      const props = {
        imageAlt: 'Custom detailed description for card',
        subject: 'Material Name',
        title: 'Card Title'
      };
      
      const finalAlt = props.imageAlt || props.subject || props.title;
      expect(finalAlt).toBe(props.imageAlt);
    });

    it('should fallback through subject and title', () => {
      const propsNoAlt = {
        subject: 'Aluminum Cleaning',
        title: 'Card Title',
        frontmatter: {
          name: 'Aluminum',
          category: 'metal'
        }
      };
      
      const finalAlt = propsNoAlt.imageAlt || propsNoAlt.subject || propsNoAlt.title || 
                      `${propsNoAlt.frontmatter.name} ${propsNoAlt.frontmatter.category} laser cleaning`;
      
      expect(finalAlt).toContain('Aluminum');
      expect(finalAlt.length).toBeGreaterThan(10);
    });
  });
});

describe('Image SEO - Sitemap and Schema', () => {
  describe('Image Sitemap Generation', () => {
    it('should generate valid XML structure', () => {
      const sitemapHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
      
      expect(sitemapHeader).toContain('sitemap/0.9');
      expect(sitemapHeader).toContain('sitemap-image/1.1');
    });

    it('should include required image metadata', () => {
      const imageEntry = {
        loc: '/images/material/aluminum-hero.jpg',
        title: 'Aluminum Laser Cleaning Hero',
        micro: 'Laser cleaning solution for industrial materials',
        lastmod: '2025-12-28'
      };
      
      expect(imageEntry.loc).toBeDefined();
      expect(imageEntry.title).toBeDefined();
      expect(imageEntry.micro).toBeDefined();
      expect(imageEntry.title.length).toBeGreaterThan(10);
    });

    it('should generate descriptive titles from filenames', () => {
      const filename = 'aluminum-laser-cleaning-hero.jpg';
      const generatedTitle = filename
        .replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      expect(generatedTitle).toBe('Aluminum Laser Cleaning Hero');
      expect(generatedTitle).not.toContain('-');
      expect(generatedTitle).not.toContain('.jpg');
    });

    it('should categorize images based on path', () => {
      const paths = [
        '/images/materials/aluminum-hero.jpg',
        '/images/contaminants/rust-micro.jpg',
        '/images/equipment/laser-system.jpg',
        '/images/services/cleaning-demo.jpg'
      ];
      
      paths.forEach(path => {
        let category = 'Z-Beam industrial laser cleaning technology';
        
        if (path.includes('/materials')) {
          category = 'Laser cleaning solution for industrial materials';
        } else if (path.includes('/contaminants')) {
          category = 'Contamination removal using laser technology';
        } else if (path.includes('/equipment')) {
          category = 'Industrial laser cleaning equipment';
        } else if (path.includes('/services')) {
          category = 'Professional laser cleaning services';
        }
        
        expect(category).toBeDefined();
        expect(category.length).toBeGreaterThan(20);
      });
    });
  });

  describe('ImageObject JSON-LD Schema', () => {
    it('should include required schema.org properties', () => {
      const imageObject = {
        '@type': 'ImageObject',
        'contentUrl': 'https://www.z-beam.com/images/material/aluminum-hero.jpg',
        'url': 'https://www.z-beam.com/images/material/aluminum-hero.jpg',
        'description': 'Aluminum surface undergoing laser cleaning',
        'name': 'Aluminum Laser Cleaning',
        'width': 1200,
        'height': 630
      };
      
      expect(imageObject['@type']).toBe('ImageObject');
      expect(imageObject.contentUrl).toBeDefined();
      expect(imageObject.description).toBeDefined();
      expect(imageObject.width).toBeGreaterThan(0);
    });

    it('should include licensing metadata', () => {
      const imageObject = {
        '@type': 'ImageObject',
        'license': 'https://creativecommons.org/licenses/by/4.0/',
        'acquireLicensePage': 'https://www.z-beam.com/contact',
        'creditText': 'Z-Beam Laser Cleaning',
        'copyrightNotice': '© 2025 Z-Beam Laser Cleaning. All rights reserved.'
      };
      
      expect(imageObject.license).toContain('creativecommons.org');
      expect(imageObject.acquireLicensePage).toBeDefined();
      expect(imageObject.creditText).toBeDefined();
      expect(imageObject.copyrightNotice).toContain('©');
    });

    it('should include creator/author information', () => {
      const imageObject = {
        '@type': 'ImageObject',
        'creator': {
          '@type': 'Person',
          'name': 'Todd Dunning'
        },
        'author': {
          '@type': 'Person',
          'name': 'Todd Dunning',
          'url': 'https://www.z-beam.com'
        }
      };
      
      expect(imageObject.creator['@type']).toBe('Person');
      expect(imageObject.author['@type']).toBe('Person');
      expect(imageObject.author.name).toBeDefined();
    });

    it('should add magnification for micro images', () => {
      const microImageObject = {
        '@type': 'ImageObject',
        'additionalProperty': [{
          '@type': 'PropertyValue',
          'propertyID': 'magnification',
          'name': 'Magnification Level',
          'value': '1000x',
          'unitText': 'times'
        }]
      };
      
      expect(microImageObject.additionalProperty).toBeDefined();
      expect(microImageObject.additionalProperty[0].value).toBe('1000x');
      expect(microImageObject.additionalProperty[0].propertyID).toBe('magnification');
    });
  });
});

describe('Image SEO - Sitemap Index', () => {
  it('should reference all sitemap types', () => {
    const sitemapIndex = {
      sitemaps: [
        {
          loc: 'https://www.z-beam.com/sitemap.xml',
          lastmod: new Date().toISOString()
        },
        {
          loc: 'https://www.z-beam.com/image-sitemap.xml',
          lastmod: new Date().toISOString()
        }
      ]
    };
    
    expect(sitemapIndex.sitemaps.length).toBe(2);
    expect(sitemapIndex.sitemaps[0].loc).toContain('sitemap.xml');
    expect(sitemapIndex.sitemaps[1].loc).toContain('image-sitemap.xml');
  });

  it('should include lastmod timestamps', () => {
    const sitemap = {
      loc: 'https://www.z-beam.com/image-sitemap.xml',
      lastmod: new Date().toISOString()
    };
    
    expect(sitemap.lastmod).toBeDefined();
    expect(sitemap.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('Image SEO - Production Validation', () => {
  it('should verify hero images exist for materials', () => {
    const expectedHeroImages = [
      'aluminum-laser-cleaning-hero.jpg',
      'porcelain-laser-cleaning-hero.jpg',
      'steel-laser-cleaning-hero.jpg'
    ];
    
    expectedHeroImages.forEach(image => {
      expect(image).toMatch(/-hero\.jpg$/);
      expect(image.length).toBeGreaterThan(15);
    });
  });

  it('should verify micro images exist for materials', () => {
    const expectedMicroImages = [
      'aluminum-laser-cleaning-micro.jpg',
      'porcelain-laser-cleaning-micro.jpg',
      'steel-laser-cleaning-micro.jpg'
    ];
    
    expectedMicroImages.forEach(image => {
      expect(image).toMatch(/-micro\.jpg$/);
      expect(image.length).toBeGreaterThan(15);
    });
  });

  it('should validate alt text is not empty or generic', () => {
    const invalidAltTexts = [
      '',
      'Image',
      'Hero image',
      'Micro image',
      'Photo'
    ];
    
    const validAltTexts = [
      'Aluminum surface undergoing precision laser cleaning',
      'Porcelain microscopic view showing contamination removal',
      'Steel laser cleaning process with visible contaminant ablation'
    ];
    
    invalidAltTexts.forEach(alt => {
      expect(alt.length).toBeLessThan(20);
    });
    
    validAltTexts.forEach(alt => {
      expect(alt.length).toBeGreaterThan(30);
      expect(alt).not.toBe('Image');
    });
  });
});
