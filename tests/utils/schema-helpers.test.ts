/**
 * Schema Helpers Tests
 * 
 * Tests for app/utils/schemas/helpers.ts functions
 * Including hasServiceData() for serviceOffering detection
 */

import {
  hasServiceData,
  hasMultipleServices,
  getMetadata,
  hasProductData,
  hasMachineSettings,
  hasMaterialProperties,
  hasAuthor,
  hasFAQData
} from '@/app/utils/schemas/helpers';

describe('Schema Helpers', () => {
  describe('getMetadata', () => {
    it('should return metadata from data.frontmatter', () => {
      const data = { frontmatter: { title: 'Test' } };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });

    it('should return frontmatter from data.frontmatter', () => {
      const data = { frontmatter: { title: 'Test' } };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });

    it('should return pageConfig from data.pageConfig', () => {
      const data = { pageConfig: { title: 'Test' } };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });

    it('should return data itself as fallback', () => {
      const data = { title: 'Test' };
      expect(getMetadata(data)).toEqual({ title: 'Test' });
    });
  });

  describe('hasServiceData', () => {
    describe('New frontmatter format (serviceOffering)', () => {
      it('should detect serviceOffering.enabled = true in metadata', () => {
        const data = {
          frontmatter: {
            serviceOffering: {
              enabled: true,
              type: 'professionalCleaning',
              materialSpecific: {
                estimatedHoursMin: 1,
                estimatedHoursTypical: 3,
                targetContaminants: ['rust', 'paint']
              }
            }
          }
        };
        expect(hasServiceData(data)).toBe(true);
      });

      it('should detect serviceOffering.enabled = true at root level', () => {
        const data = {
          serviceOffering: {
            enabled: true,
            type: 'equipmentRental',
            materialSpecific: {
              estimatedHoursMin: 1,
              estimatedHoursTypical: 2,
              targetContaminants: ['oxide']
            }
          }
        };
        expect(hasServiceData(data)).toBe(true);
      });

      it('should return false for serviceOffering.enabled = false', () => {
        const data = {
          frontmatter: {
            serviceOffering: {
              enabled: false,
              type: 'professionalCleaning'
            }
          }
        };
        expect(hasServiceData(data)).toBe(false);
      });

      it('should return false for missing serviceOffering', () => {
        const data = { frontmatter: { title: 'Test Material' } };
        expect(hasServiceData(data)).toBe(false);
      });
    });

    describe('Legacy formats', () => {
      it('should detect services array', () => {
        const data = {
          services: [{ name: 'Cleaning', description: 'Test' }]
        };
        expect(hasServiceData(data)).toBe(true);
      });

      it('should detect serviceOfferings array', () => {
        const data = {
          serviceOfferings: [{ name: 'Rental', description: 'Test' }]
        };
        expect(hasServiceData(data)).toBe(true);
      });

      it('should detect serviceOfferings in metadata', () => {
        const data = {
          frontmatter: {
            serviceOfferings: [{ name: 'Service' }]
          }
        };
        expect(hasServiceData(data)).toBe(true);
      });

      it('should detect service in title with contentCards', () => {
        const data = {
          title: 'Our Services Page',
          contentCards: [{ title: 'Card 1' }]
        };
        expect(hasServiceData(data)).toBe(true);
      });
    });
  });

  describe('hasMultipleServices', () => {
    it('should return false for single serviceOffering', () => {
      const data = {
        frontmatter: {
          serviceOffering: {
            enabled: true,
            type: 'professionalCleaning'
          }
        }
      };
      expect(hasMultipleServices(data)).toBe(false);
    });

    it('should return true for multiple services array', () => {
      const data = {
        services: [
          { name: 'Service 1' },
          { name: 'Service 2' }
        ]
      };
      expect(hasMultipleServices(data)).toBe(true);
    });

    it('should return true for multiple serviceOfferings array', () => {
      const data = {
        serviceOfferings: [
          { name: 'Offering 1' },
          { name: 'Offering 2' }
        ]
      };
      expect(hasMultipleServices(data)).toBe(true);
    });

    it('should return false for single service', () => {
      const data = {
        services: [{ name: 'Single Service' }]
      };
      expect(hasMultipleServices(data)).toBe(false);
    });
  });

  describe('hasProductData', () => {
    it('should detect needle100_150 data', () => {
      const data = { needle100_150: { power: 100 } };
      expect(hasProductData(data)).toBe(true);
    });

    it('should detect materialProperties in metadata', () => {
      const data = {
        frontmatter: {
          materialProperties: { density: { value: 7.8 } }
        }
      };
      expect(hasProductData(data)).toBe(true);
    });

    it('should detect products array', () => {
      const data = { products: [{ name: 'Product 1' }] };
      expect(hasProductData(data)).toBe(true);
    });

    it('should return false for no product data', () => {
      const data = { title: 'No Products' };
      expect(hasProductData(data)).toBe(false);
    });
  });

  describe('hasMachineSettings', () => {
    it('should detect machineSettings in metadata', () => {
      const data = {
        frontmatter: { machineSettings: { power: 200 } }
      };
      expect(hasMachineSettings(data)).toBe(true);
    });

    it('should detect steps array', () => {
      const data = { steps: [{ title: 'Step 1' }] };
      expect(hasMachineSettings(data)).toBe(true);
    });

    it('should return false for no machine settings', () => {
      const data = { title: 'Test' };
      expect(hasMachineSettings(data)).toBe(false);
    });
  });

  describe('hasMaterialProperties', () => {
    it('should detect materialProperties in metadata', () => {
      const data = {
        frontmatter: {
          materialProperties: {
            physical: { density: 2.7 }
          }
        }
      };
      expect(hasMaterialProperties(data)).toBe(true);
    });

    it('should return false for no material properties', () => {
      const data = { frontmatter: { title: 'Test' } };
      expect(hasMaterialProperties(data)).toBe(false);
    });
  });

  describe('hasAuthor', () => {
    it('should detect author in metadata', () => {
      const data = {
        frontmatter: { author: { name: 'John Doe' } }
      };
      expect(hasAuthor(data)).toBe(true);
    });

    it('should detect author at root', () => {
      const data = { author: 'Jane Smith' };
      expect(hasAuthor(data)).toBe(true);
    });

    it('should return false for no author', () => {
      const data = { title: 'Anonymous Article' };
      expect(hasAuthor(data)).toBe(false);
    });
  });

  describe('hasFAQData', () => {
    it('should detect faq array in data', () => {
      const data = { faq: [{ question: 'Q1', answer: 'A1' }] };
      expect(hasFAQData(data)).toBe(true);
    });

    it('should detect faq in metadata', () => {
      const data = {
        frontmatter: { faq: [{ question: 'Q1', answer: 'A1' }] }
      };
      expect(hasFAQData(data)).toBe(true);
    });

    it('should detect outcomeMetrics (FAQ-generating frontmatter)', () => {
      const data = {
        frontmatter: { outcomeMetrics: { cleaningRate: 95 } }
      };
      expect(hasFAQData(data)).toBe(true);
    });

    it('should detect applications (FAQ-generating frontmatter)', () => {
      const data = {
        frontmatter: { applications: ['Aerospace', 'Automotive'] }
      };
      expect(hasFAQData(data)).toBe(true);
    });

    it('should detect environmentalImpact (FAQ-generating frontmatter)', () => {
      const data = {
        frontmatter: { environmentalImpact: { co2Reduction: '50%' } }
      };
      expect(hasFAQData(data)).toBe(true);
    });
  });
});
