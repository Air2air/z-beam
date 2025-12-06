/**
 * SEO Metadata Formatter Tests
 * Tests for title and description formatting utilities
 */

import {
  formatMaterialTitle,
  formatMaterialDescription,
  formatSettingsTitle,
  formatSettingsDescription
} from '@/app/utils/seoMetadataFormatter';

describe('SEO Metadata Formatter', () => {
  describe('formatMaterialTitle', () => {
    it('returns custom title when provided', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum',
        customTitle: 'My Custom Title'
      });
      
      expect(result).toBe('My Custom Title');
    });

    it('formats title with wavelength and power', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Aluminum',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' }
        }
      });
      
      expect(result).toContain('Aluminum');
      expect(result).toContain('1064nm');
      expect(result).toContain('100W');
    });

    it('formats title with wavelength only', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Steel',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result).toContain('Steel');
      expect(result).toContain('1064nm');
    });

    it('formats title with power only', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Copper',
        machineSettings: {
          powerRange: { value: 200, unit: 'W' }
        }
      });
      
      expect(result).toContain('Copper');
      expect(result).toContain('200W');
    });

    it('uses category fallback when no specs', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Bronze',
        category: 'metal'
      });
      
      expect(result).toContain('Bronze');
      expect(result).toContain('Laser Cleaning');
    });

    it('truncates long titles to 70 characters or less', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Very Long Material Name That Exceeds Normal Length',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(70);
    });
  });

  describe('formatSettingsTitle', () => {
    it('returns custom title when provided', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Aluminum',
        customTitle: 'Custom Settings Title'
      });
      
      expect(result).toBe('Custom Settings Title');
    });

    it('formats title with passes, power, and wavelength', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Aluminum',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' },
          passCount: { value: 3, unit: 'passes' }
        }
      });
      
      expect(result).toContain('Aluminum');
      expect(result).toContain('Settings');
      expect(result).toContain('3-Pass');
    });

    it('formats title with power and wavelength only', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Steel',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 150, unit: 'W' }
        }
      });
      
      expect(result).toContain('Steel');
      expect(result).toContain('Settings');
      expect(result).toContain('150W');
      expect(result).toContain('1064nm');
    });

    it('formats title with wavelength only', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Copper',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' }
        }
      });
      
      expect(result).toContain('Copper');
      expect(result).toContain('1064nm');
    });

    it('uses fallback when no specs', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Bronze'
      });
      
      expect(result).toContain('Bronze');
      expect(result).toContain('Settings');
      expect(result).toContain('Industrial');
    });

    it('truncates long settings titles', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Extremely Long Material Name For Testing Purposes',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' },
          passCount: { value: 5, unit: 'passes' }
        }
      });
      
      expect(result.length).toBeLessThanOrEqual(70);
    });
  });

  describe('formatMaterialDescription', () => {
    it('returns custom description when provided', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        customDescription: 'My custom description for this material'
      });
      
      expect(result).toBe('My custom description for this material');
    });

    it('uses authored materialDescription when available', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        materialDescription: 'Aluminum is a lightweight metal with excellent thermal conductivity.'
      });
      
      expect(result).toContain('Aluminum is a lightweight metal');
    });

    it('adds density to short descriptions', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        materialDescription: 'A lightweight metal.',
        materialProperties: {
          material_characteristics: {
            density: { value: 2.7, unit: 'g/cm³' }
          }
        }
      });
      
      expect(result).toContain('2.7g/cm³');
    });

    it('generates fallback description when no authored content', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Copper'
      });
      
      expect(result).toContain('Copper');
      expect(result).toContain('Material properties');
      expect(result).toContain('laser parameters');
    });

    it('includes laser specs in fallback', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Steel',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 150, unit: 'W' }
        }
      });
      
      expect(result).toContain('1064nm');
      expect(result).toContain('150W');
    });

    it('includes density in fallback when available', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Gold',
        materialProperties: {
          material_characteristics: {
            density: { value: 19.3, unit: 'g/cm³' }
          }
        }
      });
      
      expect(result).toContain('19.3g/cm³');
    });

    it('truncates descriptions to 160 characters', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Aluminum',
        materialDescription: 'This is a very long description that goes on and on about the material properties and characteristics and cleaning processes and applications in various industries including automotive and aerospace and marine and many more applications that require precise cleaning.'
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
    });

    it('adds industry context for categories', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Steel',
        category: 'metal',
        subcategory: 'ferrous'
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
    });
  });

  describe('formatSettingsDescription', () => {
    it('returns custom description when provided', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Aluminum',
        customDescription: 'Custom settings description here'
      });
      
      expect(result).toBe('Custom settings description here');
    });

    it('uses authored settingsDescription when available', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Aluminum',
        settingsDescription: 'Optimal laser settings for aluminum cleaning.'
      });
      
      expect(result).toContain('Optimal laser settings');
    });

    it('adds page features to short authored descriptions', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Steel',
        settingsDescription: 'Steel cleaning parameters.'
      });
      
      expect(result).toContain('Settings');
    });

    it('generates fallback description with machine settings', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Copper',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 100, unit: 'W' }
        }
      });
      
      expect(result).toContain('Copper');
      expect(result).toContain('100W');
      expect(result).toContain('1064nm');
    });

    it('includes pass count when available', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Bronze',
        machineSettings: {
          wavelength: { value: 1064, unit: 'nm' },
          powerRange: { value: 80, unit: 'W' },
          passCount: { value: 4, unit: 'passes' }
        }
      });
      
      expect(result).toContain('4 passes');
    });

    it('generates generic fallback without machine settings', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Unknown Material'
      });
      
      expect(result).toContain('Unknown Material');
      expect(result).toContain('settings');
      expect(result).toContain('power');
      expect(result).toContain('wavelength');
    });

    it('truncates descriptions to 160 characters', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Aluminum',
        settingsDescription: 'This is an extremely long settings description that covers all aspects of laser cleaning parameters including power levels, wavelengths, scan speeds, pulse frequencies, and thermal management considerations for optimal cleaning results.'
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
    });

    it('includes industry context', () => {
      const result = formatSettingsDescription({
        pageType: 'settings',
        materialName: 'Steel',
        category: 'metal',
        subcategory: 'ferrous'
      });
      
      expect(result.length).toBeLessThanOrEqual(160);
    });
  });

  describe('Title Length Constraints', () => {
    const materials = ['Aluminum', 'Steel', 'Copper', 'Bronze', 'Titanium', 'Stainless Steel'];
    
    materials.forEach(material => {
      it(`generates valid length title for ${material}`, () => {
        const result = formatMaterialTitle({
          pageType: 'material',
          materialName: material,
          machineSettings: {
            wavelength: { value: 1064, unit: 'nm' },
            powerRange: { value: 150, unit: 'W' }
          }
        });
        
        expect(result.length).toBeLessThanOrEqual(70);
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Description Length Constraints', () => {
    const materials = ['Aluminum', 'Steel', 'Copper'];
    
    materials.forEach(material => {
      it(`generates valid length description for ${material}`, () => {
        const result = formatMaterialDescription({
          pageType: 'material',
          materialName: material,
          materialDescription: `${material} is a common material used in industrial applications.`,
          machineSettings: {
            wavelength: { value: 1064, unit: 'nm' },
            powerRange: { value: 100, unit: 'W' }
          },
          materialProperties: {
            material_characteristics: {
              density: { value: 7.8, unit: 'g/cm³' }
            }
          }
        });
        
        expect(result.length).toBeLessThanOrEqual(160);
        expect(result.length).toBeGreaterThan(50);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty material name', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: ''
      });
      
      expect(result).toBeDefined();
    });

    it('handles undefined machine settings', () => {
      const result = formatMaterialTitle({
        pageType: 'material',
        materialName: 'Test',
        machineSettings: undefined
      });
      
      expect(result).toContain('Test');
    });

    it('handles partial machine settings', () => {
      const result = formatSettingsTitle({
        pageType: 'settings',
        materialName: 'Test',
        machineSettings: {
          wavelength: undefined,
          powerRange: { value: 100, unit: 'W' }
        }
      });
      
      expect(result).toContain('Test');
    });

    it('handles empty authored description', () => {
      const result = formatMaterialDescription({
        pageType: 'material',
        materialName: 'Test',
        materialDescription: '   '
      });
      
      // Should use fallback for whitespace-only description
      expect(result).toContain('Test');
    });
  });
});
