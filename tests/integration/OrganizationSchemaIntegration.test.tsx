/**
 * Integration Test Suite: Organization Schema in Layout
 * Tests the actual implementation of organization schema in the root layout
 */

import { generateOrganizationSchema } from '../../app/utils/business-config';
import { BUSINESS_CONFIG } from '../../app/utils/business-config';

describe('Organization Schema Integration', () => {
  let schema: any;

  beforeAll(() => {
    schema = generateOrganizationSchema();
  });

  describe('Schema Integration with Business Config', () => {
    test('should use business config data correctly', () => {
      // Verify schema uses the business config data
      expect(schema.name).toBe('Z-Beam Laser Cleaning');
      expect(schema.legalName).toBe(BUSINESS_CONFIG.legal.name);
      expect(schema.url).toBe(BUSINESS_CONFIG.contact.website);
      
      // Verify address mapping
      expect(schema.address.streetAddress).toBe(BUSINESS_CONFIG.contact.address.street);
      expect(schema.address.addressLocality).toBe(BUSINESS_CONFIG.contact.address.city);
      expect(schema.address.addressRegion).toBe(BUSINESS_CONFIG.contact.address.state);
      expect(schema.address.postalCode).toBe(BUSINESS_CONFIG.contact.address.zipCode);
    });

    test('should map contact points correctly', () => {
      expect(schema.contactPoint).toHaveLength(2);
      
      // Customer service contact
      const customerService = schema.contactPoint.find((cp: any) => cp.contactType === 'customer service');
      expect(customerService).toBeDefined();
      expect(customerService.telephone).toBe(BUSINESS_CONFIG.contact.phone.main);
      expect(customerService.email).toBe(BUSINESS_CONFIG.contact.email.main);
      
      // Sales contact
      const sales = schema.contactPoint.find((cp: any) => cp.contactType === 'sales');
      expect(sales).toBeDefined();
      expect(sales.telephone).toBe(BUSINESS_CONFIG.contact.phone.sales);
      expect(sales.email).toBe(BUSINESS_CONFIG.contact.email.sales);
    });

    test('should map service areas correctly', () => {
      expect(schema.areaServed).toHaveLength(BUSINESS_CONFIG.serviceArea.length);
      
      // Verify states
      const states = schema.areaServed.filter((area: any) => area['@type'] === 'State');
      const configStates = BUSINESS_CONFIG.serviceArea.filter(area => area.type === 'State');
      expect(states).toHaveLength(configStates.length);
      
      // Verify metropolitan areas
      const metros = schema.areaServed.filter((area: any) => area['@type'] === 'Place');
      const configMetros = BUSINESS_CONFIG.serviceArea.filter(area => area.type === 'Place');
      expect(metros).toHaveLength(configMetros.length);
    });

    test('should map services correctly', () => {
      expect(schema.hasOfferCatalog.itemListElement).toHaveLength(BUSINESS_CONFIG.services.length);
      
      BUSINESS_CONFIG.services.forEach((service, index) => {
        const schemaService = schema.hasOfferCatalog.itemListElement[index];
        expect(schemaService.itemOffered.name).toBe(service.name);
        expect(schemaService.itemOffered.description).toBe(service.description);
      });
    });

    test('should handle logo URL correctly', () => {
      expect(schema.logo.url).toBe(BUSINESS_CONFIG.assets.logo.primary);
      expect(schema.logo.width).toBe(BUSINESS_CONFIG.assets.logo.width);
      expect(schema.logo.height).toBe(BUSINESS_CONFIG.assets.logo.height);
    });
  });

  describe('Schema Validation for SEO', () => {
    test('should have all required Schema.org properties', () => {
      const requiredProps = [
        'name', 'legalName', 'url', 'logo', 'description', 'address',
        'contactPoint', 'areaServed', 'hasOfferCatalog', 'sameAs',
        'foundingDate', 'numberOfEmployees', 'naics'
      ];      requiredProps.forEach(prop => {
        expect(schema).toHaveProperty(prop);
        expect(schema[prop]).toBeDefined();
      });
    });

    test('should have valid structured data for rich snippets', () => {
      // Test for Google Business Profile compatibility
      expect(schema.name).toBeTruthy();
      expect(schema.address).toBeDefined();
      expect(schema.contactPoint.length).toBeGreaterThan(0);
      expect(schema.url).toMatch(/^https?:\/\//);
      
      // Test for local SEO
      expect(schema.address.streetAddress).toBeDefined(); // Street address may be empty for privacy
      expect(schema.address.addressLocality).toBeTruthy();
      expect(schema.address.addressRegion).toBeTruthy();
      expect(schema.address.postalCode).toBeTruthy();
    });

    test('should be serializable for JSON-LD', () => {
      expect(() => JSON.stringify(schema)).not.toThrow();
      
      const serialized = JSON.stringify(schema);
      const parsed = JSON.parse(serialized);
      
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('Organization');
    });
  });

  describe('Business Focus Validation', () => {
    test('should reflect laser cleaning business', () => {
      expect(schema.description).toContain('laser cleaning');
      // Using NAICS code instead of industry property
      expect(schema.naics).toBe('561790');
      
      // Verify service names contain laser cleaning terms
      const serviceNames = schema.hasOfferCatalog.itemListElement
        .map((item: any) => item.itemOffered.name)
        .join(' ').toLowerCase();
      
      expect(serviceNames).toContain('laser');
      expect(serviceNames).toContain('cleaning');
      expect(serviceNames).toContain('industrial');
    });

    test('should have correct contact information', () => {
      // Verify phone number consistency
      schema.contactPoint.forEach((contact: any) => {
        expect(contact.telephone).toBe('+1-650-241-8510');
      });
      
      // Verify business address
      expect(schema.address.streetAddress).toBe(''); // Street address private
      expect(schema.address.addressLocality).toBe('Belmont');
      expect(schema.address.addressRegion).toBe('CA');
      expect(schema.address.postalCode).toBe('94002');
    });
  });

  describe('Social Media Integration', () => {
    test('should handle Twitter/X.com correctly', () => {
      const socialUrls = schema.sameAs;
      
      // Should include Twitter/X.com URL
      const twitterUrl = socialUrls.find((url: string) => 
        url.includes('twitter.com') || url.includes('x.com')
      );
      
      expect(twitterUrl).toBeDefined();
      expect(twitterUrl).toMatch(/^https?:\/\//);
    });

    test('should filter out empty social media URLs', () => {
      schema.sameAs.forEach((url: string) => {
        expect(url).toBeTruthy();
        expect(url.length).toBeGreaterThan(10);
        expect(url).toMatch(/^https?:\/\//);
      });
    });
  });
});
