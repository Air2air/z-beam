/**
 * SEO Infrastructure - Metadata Formatter Tests
 * 
 * Tests for the SEO Infrastructure metadata optimization utility that generates
 * optimized title tags and meta descriptions for search engine results pages.
 * 
 * Validates:
 * - Title length optimization (50-60 chars)
 * - Description length optimization (155-160 chars)
 * - Professional voice (no sales-y language)
 * - Technical data inclusion
 * - Mobile-first approach
 * 
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 */

import {
  formatMaterialTitle,
  formatMaterialDescription,
  formatSettingsTitle,
  formatSettingsDescription
} from '@/app/utils/seoMetadataFormatter';

describe('SEO Infrastructure - Metadata Formatter', () => {
  describe('Material Title Formatting', () => {
    it('should format title with wavelength and power within 60 chars', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toContain('Aluminum');
      expect(result).toContain('1064nm');
      expect(result).toContain('100W');
      expect(result).toContain('Parameters');
    });
    
    it('should format title with wavelength only', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Steel',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toContain('Steel');
      expect(result).toContain('1064nm');
    });
    
    it('should use category context for fallback', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Copper',
        category: 'metal'
      });
      
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toContain('Copper');
      expect(result).toContain('Laser Cleaning');
    });
    
    it('should avoid sales-y language', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Gold',
        machineSettings: {
          wavelength: { value: 355, unit: 'nm' }
        }
      });
      
      const salesWords = ['best', 'top', 'leading', '#1', 'revolutionary', 'ultimate', 'amazing'];
      salesWords.forEach(word => {
        expect(result.toLowerCase()).not.toContain(word);
      });
    });
    
    it('should respect custom title override', () => {
      const customTitle = 'Custom Title Override';
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Test',
        customTitle
      });
      
      expect(result).toBe(customTitle);
    });
  });

  describe('Material Description Formatting', () => {
    it('should format description within 155-160 char limit', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        materialDescription: 'Aluminum features exceptional reflectivity that bounces most energy away',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' }
        },
        materialProperties: {
          material_characteristics: {
            density: { value: 2.7, unit: 'g/cm³' }
          }
        },
        category: 'metal',
        subcategory: 'non-ferrous'
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
      expect(result.length).toBeGreaterThanOrEqual(100); // Not too short
      // Should mention page features
      expect(result.toLowerCase()).toMatch(/properties|parameters|challenges/);
    });
    
    it('should include density in description', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Steel',
        materialProperties: {
          material_characteristics: {
            density: { value: 7.85, unit: 'g/cm³' }
          }
        },
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result).toContain('7.85g/cm³');
    });
    
    it('should extract key property from description', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Copper',
        materialDescription: 'Copper exhibits exceptional electrical conductivity that enables efficient energy transfer',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result).toContain('conductivity');
    });
    
    it('should include technical specifications', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Titanium',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 150, unit: 'W' }
        }
      });
      
      // Should mention what's on the page
      expect(result.toLowerCase()).toMatch(/properties|parameters/);
    });
    
    it('should include industry context when space permits', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        category: 'metal',
        subcategory: 'non-ferrous',
        materialDescription: 'High reflectivity',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result.toLowerCase()).toMatch(/aerospace/i);
    });
    
    it('should truncate gracefully at word boundary', () => {
      const longDesc = 'A'.repeat(200);
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'TestMaterial',
        materialDescription: longDesc
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
      if (result.includes('...')) {
        // Should end with ... if truncated
        expect(result).toMatch(/\.\.\.$|[a-zA-Z]$/);
      }
    });
    
    it('should respect custom description override', () => {
      const customDesc = 'Custom description override';
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Test',
        customDescription: customDesc
      });
      
      expect(result).toBe(customDesc);
    });
  });

  describe('Settings Title Formatting', () => {
    it('should format title with passes, power, and wavelength', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Aluminum',
        machineSettings: {
          passCount: { value: 3, unit: 'passes' },
          powerRange: { value: 100, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toContain('Aluminum');
      expect(result).toContain('3-Pass');
      expect(result).toContain('100W');
      expect(result).toContain('1064nm');
    });
    
    it('should format title with power and wavelength only', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Steel',
        machineSettings: {
          powerRange: { value: 100, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toContain('Steel');
      expect(result).toContain('100W');
      expect(result).toContain('1064nm');
      expect(result).toContain('Specifications');
    });
    
    it('should use fallback for minimal data', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Glass'
      });
      
      expect(result.length).toBeLessThanOrEqual(60);
      expect(result).toContain('Glass');
      expect(result).toContain('Settings');
    });
  });

  describe('Settings Description Formatting', () => {
    it('should format description with machine specs', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Aluminum',
        machineSettings: {
          powerRange: { value: 100, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' },
          scanSpeed: { value: 500, unit: 'mm/s' },
          passCount: { value: 3, unit: 'passes' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
      expect(result).toContain('100W');
      expect(result).toContain('1064nm');
      // Should mention page features
      expect(result.toLowerCase()).toMatch(/settings|speed|spot|passes|challenges/);
    });
    
    it('should extract key consideration from settings description', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Steel',
        settingsDescription: 'Start by selecting moderate power to counter high reflectivity. Gradual removal prevents warping.',
        machineSettings: {
          powerRange: { value: 100, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      // Should mention what's on the page
      expect(result.toLowerCase()).toMatch(/settings|speed|challenges/);
    });
    
    it('should include pass count when available', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Copper',
        machineSettings: {
          powerRange: { value: 80, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' },
          passCount: { value: 2, unit: 'passes' }
        }
      });
      
      expect(result).toMatch(/2 passes/i);
    });
    
    it('should be within mobile-friendly limit', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Titanium',
        settingsDescription: 'Titanium requires careful power control to prevent overheating and maintain structural integrity throughout the cleaning process',
        machineSettings: {
          powerRange: { value: 150, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' },
          scanSpeed: { value: 300, unit: 'mm/s' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
      expect(result.length).toBeGreaterThan(0); // Should have content
    });
  });

  describe('Voice Compliance', () => {
    it('should maintain professional voice in all outputs', () => {
      const materialTitle = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Test',
        machineSettings: { wavelength: { value: 1064, unit: 'nm' } }
      });
      
      const settingsTitle = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Test',
        machineSettings: { wavelength: { value: 1064, unit: 'nm' } }
      });
      
      const materialDesc = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Test',
        materialDescription: 'High strength material'
      });
      
      const settingsDesc = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Test',
        settingsDescription: 'Controlled power prevents damage'
      });
      
      const outputs = [materialTitle, settingsTitle, materialDesc, settingsDesc];
      
      // Check all outputs for sales-y language
      const forbiddenWords = [
        'best', 'top', 'leading', '#1', 'number one',
        'revolutionary', 'groundbreaking', 'game-changing',
        'ultimate', 'amazing', 'incredible', 'perfect',
        'guaranteed', 'proven', 'industry-leading'
      ];
      
      outputs.forEach(output => {
        forbiddenWords.forEach(word => {
          expect(output.toLowerCase()).not.toContain(word);
        });
      });
    });
    
    it('should not include site name in title (layout template adds it)', () => {
      // Layout template adds " | Z-Beam" suffix, so formatter should NOT include it
      const materialTitle = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum',
        machineSettings: { wavelength: { value: 1064, unit: 'nm' } }
      });
      
      const settingsTitle = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Aluminum',
        machineSettings: { wavelength: { value: 1064, unit: 'nm' } }
      });
      
      // Should NOT contain site name - layout template adds it
      expect(materialTitle).not.toContain('Z-Beam');
      expect(materialTitle).not.toContain('| Z-Beam');
      expect(settingsTitle).not.toContain('Z-Beam');
      expect(settingsTitle).not.toContain('| Z-Beam');
    });
    
    it('should include technical terminology', () => {
      const desc = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' }
        },
        materialProperties: {
          material_characteristics: {
            density: { value: 2.7, unit: 'g/cm³' }
          }
        }
      });
      
      // Should include technical terms
      expect(desc).toMatch(/nm|W|g\/cm³/);
    });
  });
});
