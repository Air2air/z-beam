/**
 * Test Suite: Organization Schema Implementation
 * Tests for global business Schema.org markup in layout
 */

import { generateOrganizationSchema } from '../../app/utils/business-config';

describe('Organization Schema Implementation', () => {
  let schema: any;

  beforeAll(() => {
    schema = generateOrganizationSchema();
  });

  describe('Schema Structure and Context', () => {
    test('should have valid Schema.org context', () => {
      expect(schema['@context']).toBe('https://schema.org');
    });

    test('should have Organization type', () => {
      expect(schema['@type']).toBe('Organization');
    });

    test('should have unique identifier', () => {
      expect(schema['@id']).toBeDefined();
      expect(schema['@id']).toMatch(/#organization$/);
    });
  });

  describe('Basic Organization Information', () => {
    test('should have organization name', () => {
      expect(schema.name).toBeDefined();
      expect(typeof schema.name).toBe('string');
      expect(schema.name.length).toBeGreaterThan(0);
    });

    test('should have legal name', () => {
      expect(schema.legalName).toBeDefined();
      expect(typeof schema.legalName).toBe('string');
      expect(schema.legalName.length).toBeGreaterThan(0);
    });

    test('should have website URL', () => {
      expect(schema.url).toBeDefined();
      expect(typeof schema.url).toBe('string');
      expect(schema.url).toMatch(/^https?:\/\//);
    });

    test('should have description', () => {
      expect(schema.description).toBeDefined();
      expect(typeof schema.description).toBe('string');
      expect(schema.description.length).toBeGreaterThan(20);
      expect(schema.description.length).toBeLessThanOrEqual(300);
    });
  });

  describe('Logo and Image Properties', () => {
    test('should have logo schema', () => {
      expect(schema.logo).toBeDefined();
      expect(schema.logo['@type']).toBe('ImageObject');
      expect(schema.logo.url).toBeDefined();
      expect(schema.logo.url).toMatch(/^https?:\/\//);
    });

    test('should have logo dimensions', () => {
      expect(schema.logo.width).toBeDefined();
      expect(schema.logo.height).toBeDefined();
      expect(typeof schema.logo.width).toBe('number');
      expect(typeof schema.logo.height).toBe('number');
      expect(schema.logo.width).toBeGreaterThan(0);
      expect(schema.logo.height).toBeGreaterThan(0);
    });

    test('should have organization image', () => {
      expect(schema.image).toBeDefined();
      expect(typeof schema.image).toBe('string');
      expect(schema.image).toMatch(/^https?:\/\//);
    });
  });

  describe('Contact Information', () => {
    test('should have postal address', () => {
      expect(schema.address).toBeDefined();
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.address.streetAddress).toBeDefined();
      expect(schema.address.addressLocality).toBeDefined();
      expect(schema.address.addressRegion).toBeDefined();
      expect(schema.address.postalCode).toBeDefined();
      expect(schema.address.addressCountry).toBeDefined();
    });

    test('should have contact points array', () => {
      expect(schema.contactPoint).toBeDefined();
      expect(Array.isArray(schema.contactPoint)).toBe(true);
      expect(schema.contactPoint.length).toBeGreaterThan(0);
    });

    test('should have valid contact point structure', () => {
      schema.contactPoint.forEach((contact: any) => {
        expect(contact['@type']).toBe('ContactPoint');
        expect(contact.telephone).toBeDefined();
        expect(contact.contactType).toBeDefined();
        expect(contact.email).toBeDefined();
        expect(contact.availableLanguage).toBeDefined();
        
        // Validate contact types
        expect(['customer service', 'sales', 'support', 'technical support']).toContain(contact.contactType);
        
        // Validate phone format
        expect(contact.telephone).toMatch(/^\+?\d/);
        
        // Validate email format
        expect(contact.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('Social Media Integration', () => {
    test('should have social media profiles', () => {
      expect(schema.sameAs).toBeDefined();
      expect(Array.isArray(schema.sameAs)).toBe(true);
    });

    test('should have valid social media URLs', () => {
      schema.sameAs.forEach((url: string) => {
        expect(url).toMatch(/^https?:\/\//);
        // Should be from known social platforms (including X.com for Twitter)
        expect(url).toMatch(/linkedin|instagram|facebook|twitter|youtube|x\.com/i);
      });
    });

    test('should filter out empty social media URLs', () => {
      schema.sameAs.forEach((url: string) => {
        expect(url).toBeTruthy();
        expect(url.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Business Information', () => {
    test('should have founding date', () => {
      expect(schema.foundingDate).toBeDefined();
      expect(typeof schema.foundingDate).toBe('string');
      expect(schema.foundingDate).toMatch(/^\d{4}$/); // Year format
    });

    test('should have employee count', () => {
      expect(schema.numberOfEmployees).toBeDefined();
      expect(typeof schema.numberOfEmployees).toBe('string');
    });

    test('should have industry classification', () => {
      expect(schema.industry).toBeDefined();
      expect(typeof schema.industry).toBe('string');
      expect(schema.industry.length).toBeGreaterThan(0);
    });

    test('should have NAICS code', () => {
      expect(schema.naics).toBeDefined();
      expect(typeof schema.naics).toBe('string');
      expect(schema.naics).toMatch(/^\d+$/); // Should be numeric
    });
  });

  describe('Service Catalog', () => {
    test('should have offer catalog', () => {
      expect(schema.hasOfferCatalog).toBeDefined();
      expect(schema.hasOfferCatalog['@type']).toBe('OfferCatalog');
      expect(schema.hasOfferCatalog.name).toBeDefined();
      expect(schema.hasOfferCatalog.itemListElement).toBeDefined();
    });

    test('should have service offers', () => {
      expect(Array.isArray(schema.hasOfferCatalog.itemListElement)).toBe(true);
      expect(schema.hasOfferCatalog.itemListElement.length).toBeGreaterThan(0);
      
      schema.hasOfferCatalog.itemListElement.forEach((offer: any) => {
        expect(offer['@type']).toBe('Offer');
        expect(offer.itemOffered).toBeDefined();
        expect(offer.itemOffered['@type']).toBe('Service');
        expect(offer.itemOffered.name).toBeDefined();
        expect(offer.itemOffered.description).toBeDefined();
      });
    });

    test('should have descriptive service names and descriptions', () => {
      schema.hasOfferCatalog.itemListElement.forEach((offer: any) => {
        const service = offer.itemOffered;
        expect(service.name.length).toBeGreaterThan(5);
        expect(service.description.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Geographic and Operational Information', () => {
    test('should have service area', () => {
      expect(schema.areaServed).toBeDefined();
      expect(Array.isArray(schema.areaServed)).toBe(true);
      expect(schema.areaServed.length).toBeGreaterThan(0);
    });

    test('should have valid geographic areas', () => {
      schema.areaServed.forEach((area: any) => {
        expect(area['@type']).toBeDefined();
        expect(['State', 'City', 'Country', 'AdministrativeArea', 'MetropolitanArea']).toContain(area['@type']);
        expect(area.name).toBeDefined();
        expect(typeof area.name).toBe('string');
        expect(area.name.length).toBeGreaterThan(0);
      });
    });

    test('should have opening hours', () => {
      expect(schema.openingHoursSpecification).toBeDefined();
      expect(Array.isArray(schema.openingHoursSpecification)).toBe(true);
      
      schema.openingHoursSpecification.forEach((hours: any) => {
        expect(hours['@type']).toBe('OpeningHoursSpecification');
        expect(hours.dayOfWeek).toBeDefined();
        expect(hours.opens).toBeDefined();
        expect(hours.closes).toBeDefined();
        
        // Validate time format
        expect(hours.opens).toMatch(/^\d{2}:\d{2}$/);
        expect(hours.closes).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });

  describe('Payment and Pricing Information', () => {
    test('should have currency information', () => {
      expect(schema.currenciesAccepted).toBeDefined();
      expect(typeof schema.currenciesAccepted).toBe('string');
      expect(schema.currenciesAccepted).toMatch(/^[A-Z]{3}$/); // ISO currency code
    });

    test('should have payment methods', () => {
      expect(schema.paymentAccepted).toBeDefined();
      expect(Array.isArray(schema.paymentAccepted)).toBe(true);
      expect(schema.paymentAccepted.length).toBeGreaterThan(0);
      
      const validPaymentMethods = [
        'Cash', 'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer',
        'Check', 'Money Order', 'Cryptocurrency', 'Invoice'
      ];
      
      schema.paymentAccepted.forEach((method: string) => {
        expect(validPaymentMethods).toContain(method);
      });
    });

    test('should have price range indicator', () => {
      expect(schema.priceRange).toBeDefined();
      expect(typeof schema.priceRange).toBe('string');
      expect(['$', '$$', '$$$', '$$$$']).toContain(schema.priceRange);
    });
  });

  describe('Professional Credentials', () => {
    test('should handle credentials array', () => {
      if (schema.hasCredential) {
        expect(Array.isArray(schema.hasCredential)).toBe(true);
        
        schema.hasCredential.forEach((credential: any) => {
          expect(credential['@type']).toBe('EducationalOccupationalCredential');
          expect(credential.name).toBeDefined();
          expect(credential.credentialCategory).toBeDefined();
        });
      }
    });

    test('should have proper credential structure when present', () => {
      if (schema.hasCredential && schema.hasCredential.length > 0) {
        schema.hasCredential.forEach((credential: any) => {
          expect(typeof credential.name).toBe('string');
          expect(credential.name.length).toBeGreaterThan(5);
          expect(typeof credential.credentialCategory).toBe('string');
        });
      }
    });
  });

  describe('SEO and Rich Snippet Optimization', () => {
    test('should have appropriate length limits for rich snippets', () => {
      // Organization name should be concise for rich snippets
      expect(schema.name.length).toBeLessThanOrEqual(60);
      
      // Description should be appropriate for snippets
      expect(schema.description.length).toBeLessThanOrEqual(300);
      expect(schema.description.length).toBeGreaterThan(50);
    });

    test('should have consistent branding', () => {
      // Logo URL should match domain
      const domainMatch = schema.url.match(/https?:\/\/([^\/]+)/);
      if (domainMatch) {
        const domain = domainMatch[1];
        expect(schema.logo.url).toContain(domain);
      }
    });

    test('should have complete contact information for local SEO', () => {
      // Essential for local business SEO
      expect(schema.address.streetAddress).toBeTruthy();
      expect(schema.address.addressLocality).toBeTruthy();
      expect(schema.address.postalCode).toBeTruthy();
      
      // Should have at least one phone contact
      const hasPhoneContact = schema.contactPoint.some((contact: any) => 
        contact.telephone && contact.telephone.length > 5
      );
      expect(hasPhoneContact).toBe(true);
    });
  });

  describe('Schema Validation and Structure', () => {
    test('should be serializable to JSON-LD', () => {
      expect(() => {
        JSON.stringify(schema);
      }).not.toThrow();
    });

    test('should have consistent object structure', () => {
      // All required properties should be defined
      const requiredProps = [
        '@context', '@type', '@id', 'name', 'url', 'description',
        'address', 'contactPoint', 'foundingDate'
      ];
      
      requiredProps.forEach(prop => {
        expect(schema[prop]).toBeDefined();
      });
    });

    test('should not have circular references', () => {
      const visited = new Set();
      
      function checkCircular(obj: any, path: string[] = []): boolean {
        if (obj === null || typeof obj !== 'object') return true;
        
        const objId = obj['@id'] || JSON.stringify(obj);
        if (visited.has(objId)) return false;
        
        visited.add(objId);
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (!checkCircular(obj[key], [...path, key])) {
              return false;
            }
          }
        }
        
        visited.delete(objId);
        return true;
      }
      
      expect(checkCircular(schema)).toBe(true);
    });
  });
});
