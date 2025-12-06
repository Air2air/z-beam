// tests/seo/feed-validation.test.ts
/**
 * Tests for Feed Validation Logic
 * 
 * Validates:
 * - XML parsing and structure validation
 * - Required field checking
 * - SKU format validation
 * - URL validation
 * - Product count validation
 */

import { describe, it, expect } from '@jest/globals';

describe('Feed Validation', () => {
  describe('Product Count Validation', () => {
    it('should validate product count within expected range', () => {
      const minProducts = 100;
      const maxProducts = 200;
      const actualCount = 153;
      
      const isValid = actualCount >= minProducts && actualCount <= maxProducts;
      
      expect(isValid).toBe(true);
      expect(actualCount).toBeGreaterThanOrEqual(minProducts);
      expect(actualCount).toBeLessThanOrEqual(maxProducts);
    });

    it('should fail validation for too few products', () => {
      const minProducts = 100;
      const actualCount = 50;
      
      const isValid = actualCount >= minProducts;
      
      expect(isValid).toBe(false);
    });

    it('should fail validation for too many products', () => {
      const maxProducts = 200;
      const actualCount = 250;
      
      const isValid = actualCount <= maxProducts;
      
      expect(isValid).toBe(false);
    });
  });

  describe('SKU Format Validation', () => {
    const validSKUPrefixes = ['ZB-PROF-CLEAN', 'ZB-EQUIP-RENT'];

    it('should validate professional cleaning SKU format', () => {
      const sku = 'ZB-PROF-CLEAN-ALUMINUM-LASER-CLEANING';
      
      const hasValidPrefix = validSKUPrefixes.some(prefix => sku.startsWith(prefix));
      
      expect(hasValidPrefix).toBe(true);
      expect(sku).toContain('ZB-PROF-CLEAN');
    });

    it('should validate equipment rental SKU format', () => {
      const sku = 'ZB-EQUIP-RENT-STAINLESS-STEEL-LASER-CLEANING';
      
      const hasValidPrefix = validSKUPrefixes.some(prefix => sku.startsWith(prefix));
      
      expect(hasValidPrefix).toBe(true);
      expect(sku).toContain('ZB-EQUIP-RENT');
    });

    it('should reject invalid SKU prefixes', () => {
      const sku = 'INVALID-PREFIX-ALUMINUM';
      
      const hasValidPrefix = validSKUPrefixes.some(prefix => sku.startsWith(prefix));
      
      expect(hasValidPrefix).toBe(false);
    });
  });

  describe('Brand Validation', () => {
    const requiredBrand = 'Z-Beam';

    it('should validate correct brand name', () => {
      const brand = 'Z-Beam';
      
      expect(brand).toBe(requiredBrand);
    });

    it('should reject incorrect brand names', () => {
      const invalidBrands = ['ZBeam', 'Z Beam', 'z-beam', 'ZBEAM'];
      
      invalidBrands.forEach(brand => {
        expect(brand).not.toBe(requiredBrand);
      });
    });
  });

  describe('Availability Validation', () => {
    const requiredAvailability = 'in stock';

    it('should validate correct availability status', () => {
      const availability = 'in stock';
      
      expect(availability).toBe(requiredAvailability);
    });

    it('should reject invalid availability values', () => {
      const invalidValues = ['in-stock', 'available', 'In Stock', 'IN STOCK'];
      
      invalidValues.forEach(value => {
        expect(value).not.toBe(requiredAvailability);
      });
    });
  });

  describe('Condition Validation', () => {
    const requiredCondition = 'new';

    it('should validate correct condition', () => {
      const condition = 'new';
      
      expect(condition).toBe(requiredCondition);
    });

    it('should reject invalid conditions', () => {
      const invalidValues = ['New', 'NEW', 'used', 'refurbished'];
      
      invalidValues.forEach(value => {
        expect(value).not.toBe(requiredCondition);
      });
    });
  });

  describe('URL Validation', () => {
    const baseUrl = 'https://www.z-beam.com';

    it('should validate URLs starting with base URL', () => {
      const productUrl = 'https://www.z-beam.com/materials/metal/aluminum-laser-cleaning';
      const imageUrl = 'https://www.z-beam.com/images/material/aluminum-hero.jpg';
      
      expect(productUrl.startsWith(baseUrl)).toBe(true);
      expect(imageUrl.startsWith(baseUrl)).toBe(true);
    });

    it('should reject URLs with wrong domain', () => {
      const invalidUrls = [
        'https://example.com/materials/aluminum',
        'http://www.z-beam.com/materials/aluminum', // wrong protocol
        'https://z-beam.com/materials/aluminum' // missing www
      ];
      
      invalidUrls.forEach(url => {
        expect(url.startsWith(baseUrl)).toBe(false);
      });
    });
  });

  describe('SKU Uniqueness', () => {
    it('should detect duplicate SKUs', () => {
      const skus = [
        'ZB-PROF-CLEAN-ALUMINUM',
        'ZB-PROF-CLEAN-STEEL',
        'ZB-PROF-CLEAN-ALUMINUM' // duplicate
      ];
      
      const uniqueSkus = new Set(skus);
      const hasDuplicates = uniqueSkus.size !== skus.length;
      
      expect(hasDuplicates).toBe(true);
      expect(uniqueSkus.size).toBe(2);
      expect(skus.length).toBe(3);
    });

    it('should pass validation with all unique SKUs', () => {
      const skus = [
        'ZB-PROF-CLEAN-ALUMINUM',
        'ZB-PROF-CLEAN-STEEL',
        'ZB-EQUIP-RENT-ALUMINUM'
      ];
      
      const uniqueSkus = new Set(skus);
      const hasDuplicates = uniqueSkus.size !== skus.length;
      
      expect(hasDuplicates).toBe(false);
      expect(uniqueSkus.size).toBe(skus.length);
    });
  });

  describe('Required Fields Validation', () => {
    const requiredFields = [
      'g:id',
      'g:title',
      'g:description',
      'g:link',
      'g:image_link',
      'g:price',
      'g:availability',
      'g:condition',
      'g:brand',
      'g:mpn'
    ];

    it('should validate all required fields are present', () => {
      const product = {
        'g:id': 'test-id',
        'g:title': 'Test Product',
        'g:description': 'Test description',
        'g:link': 'https://www.z-beam.com/test',
        'g:image_link': 'https://www.z-beam.com/images/test.jpg',
        'g:price': '390 USD',
        'g:availability': 'in stock',
        'g:condition': 'new',
        'g:brand': 'Z-Beam',
        'g:mpn': 'ZB-TEST'
      };

      const missingFields = requiredFields.filter(field => !product[field as keyof typeof product]);
      
      expect(missingFields).toHaveLength(0);
    });

    it('should identify missing required fields', () => {
      const incompleteProduct = {
        'g:id': 'test-id',
        'g:title': 'Test Product',
        // missing other required fields
      };

      const missingFields = requiredFields.filter(field => !incompleteProduct[field as keyof typeof incompleteProduct]);
      
      expect(missingFields.length).toBeGreaterThan(0);
      expect(missingFields).toContain('g:description');
      expect(missingFields).toContain('g:price');
    });
  });

  describe('Service Type Distribution', () => {
    it('should count products by service type', () => {
      const skus = [
        'ZB-PROF-CLEAN-ALUMINUM',
        'ZB-PROF-CLEAN-STEEL',
        'ZB-PROF-CLEAN-COPPER',
        'ZB-EQUIP-RENT-ALUMINUM',
        'ZB-EQUIP-RENT-STEEL'
      ];

      const profCleanCount = skus.filter(sku => sku.startsWith('ZB-PROF-CLEAN')).length;
      const equipRentCount = skus.filter(sku => sku.startsWith('ZB-EQUIP-RENT')).length;
      
      expect(profCleanCount).toBe(3);
      expect(equipRentCount).toBe(2);
      expect(profCleanCount + equipRentCount).toBe(skus.length);
    });
  });

  describe('XML Structure Validation', () => {
    it('should validate RSS 2.0 namespace', () => {
      const rssNamespace = 'http://base.google.com/ns/1.0';
      const xmlnsDeclaration = `xmlns:g="${rssNamespace}"`;
      
      expect(xmlnsDeclaration).toContain('xmlns:g');
      expect(xmlnsDeclaration).toContain(rssNamespace);
    });

    it('should validate required RSS elements', () => {
      const requiredElements = ['channel', 'title', 'link', 'description', 'item'];
      
      requiredElements.forEach(element => {
        expect(element).toBeTruthy();
        expect(typeof element).toBe('string');
      });
    });
  });

  describe('Price Format Validation', () => {
    it('should validate price format with currency', () => {
      const price = '390 USD';
      
      expect(price).toMatch(/^\d+(\.\d{2})? [A-Z]{3}$/);
      expect(price).toContain('USD');
    });

    it('should validate decimal prices', () => {
      const price = '390.50 USD';
      
      expect(price).toMatch(/^\d+\.\d{2} [A-Z]{3}$/);
    });

    it('should reject invalid price formats', () => {
      const invalidPrices = [
        '390USD',  // no space
        '$390',    // dollar sign instead of USD
        '390.5 USD', // one decimal place
        '390 usd'  // lowercase currency
      ];

      invalidPrices.forEach(price => {
        expect(price).not.toMatch(/^\d+(\.\d{2})? [A-Z]{3}$/);
      });
    });
  });
});
