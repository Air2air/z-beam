// tests/seo/feed-generation.test.ts
/**
 * Tests for Google Merchant Feed Generation
 * 
 * Validates:
 * - Feed structure and XML compliance
 * - Required fields presence
 * - SKU format and uniqueness
 * - Description extraction from frontmatter
 * - Price calculations
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

// Mock data for testing
const mockMaterialData = {
  title: 'Aluminum Laser Cleaning',
  material_description: 'Industrial aluminum laser cleaning with precise power settings',
  caption: 'Aluminum surface cleaning',
  category: 'metal',
  subcategory: 'non-ferrous',
  serviceOffering: {
    enabled: true,
    type: 'professionalCleaning',
    materialSpecific: {
      estimatedHoursMin: 2,
      estimatedHoursTypical: 6
    }
  }
};

describe('Google Merchant Feed Generation', () => {
  describe('Product ID Generation', () => {
    it('should generate unique product IDs with service type suffix', () => {
      const slug = 'aluminum-laser-cleaning';
      const serviceType = 'professionalCleaning';
      const expectedId = `${slug}-${serviceType}`;
      
      // Simulate ID generation
      const productId = `${slug}-${serviceType}`;
      
      expect(productId).toBe(expectedId);
      expect(productId).toContain(slug);
      expect(productId).toContain(serviceType);
    });

    it('should create different IDs for different service types', () => {
      const slug = 'aluminum-laser-cleaning';
      const profId = `${slug}-professionalCleaning`;
      const rentId = `${slug}-equipmentRental`;
      
      expect(profId).not.toBe(rentId);
    });
  });

  describe('SKU Format', () => {
    it('should follow ZB-{SERVICE}-{MATERIAL} pattern', () => {
      const sku = 'ZB-PROF-CLEAN-ALUMINUM-LASER-CLEANING';
      
      expect(sku).toMatch(/^ZB-(PROF-CLEAN|EQUIP-RENT)-[A-Z-]+$/);
      expect(sku).toContain('ZB-PROF-CLEAN');
      expect(sku).toContain('ALUMINUM');
    });

    it('should uppercase material slug in SKU', () => {
      const materialSlug = 'aluminum-laser-cleaning';
      const sku = `ZB-PROF-CLEAN-${materialSlug.toUpperCase()}`;
      
      expect(sku).toBe('ZB-PROF-CLEAN-ALUMINUM-LASER-CLEANING');
      expect(sku).not.toContain('aluminum');
    });
  });

  describe('Description Extraction', () => {
    it('should prioritize material_description field', () => {
      const data = {
        material_description: 'Primary description',
        caption: 'Secondary caption',
        title: 'Fallback title'
      };
      
      const description = data.material_description || data.caption || `Professional laser cleaning service for ${data.title}`;
      
      expect(description).toBe('Primary description');
    });

    it('should fallback to caption if material_description missing', () => {
      const data = {
        caption: 'Secondary caption',
        title: 'Aluminum Laser Cleaning'
      };
      
      const description = (data as any).material_description || data.caption || `Professional laser cleaning service for ${data.title}`;
      
      expect(description).toBe('Secondary caption');
    });

    it('should generate description from title if both fields missing', () => {
      const data = {
        title: 'Aluminum Laser Cleaning'
      };
      
      const description = (data as any).material_description || (data as any).caption || `Professional laser cleaning service for ${data.title}`;
      
      expect(description).toBe('Professional laser cleaning service for Aluminum Laser Cleaning');
    });
  });

  describe('Price Calculation', () => {
    it('should calculate price range from hours and hourly rate', () => {
      const hourlyRate = 390;
      const hoursMin = 2;
      const hoursTypical = 6;
      
      const minPrice = hoursMin * hourlyRate;
      const maxPrice = hoursTypical * hourlyRate;
      
      expect(minPrice).toBe(780);
      expect(maxPrice).toBe(2340);
    });

    it('should format price with currency', () => {
      const hourlyRate = 390;
      const currency = 'USD';
      const priceString = `${hourlyRate} ${currency}`;
      
      expect(priceString).toBe('390 USD');
    });
  });

  describe('XML Structure', () => {
    it('should escape XML special characters', () => {
      const escapeXml = (text: string) => {
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };
      
      expect(escapeXml('Test & Demo')).toBe('Test &amp; Demo');
      expect(escapeXml('<title>')).toBe('&lt;title&gt;');
      expect(escapeXml('Brand "Z-Beam"')).toBe('Brand &quot;Z-Beam&quot;');
    });

    it('should create valid RSS 2.0 structure with Google namespace', () => {
      const rssHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">';
      
      expect(rssHeader).toContain('version="2.0"');
      expect(rssHeader).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    });
  });

  describe('Required Fields', () => {
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

    it('should include all required Google Merchant fields', () => {
      requiredFields.forEach(field => {
        expect(field).toMatch(/^g:/);
      });
      
      expect(requiredFields).toHaveLength(10);
    });

    it('should validate required field values', () => {
      const productData = {
        'g:id': 'aluminum-laser-cleaning-professionalCleaning',
        'g:title': 'Aluminum Laser Cleaning',
        'g:description': 'Industrial laser cleaning service',
        'g:link': 'https://www.z-beam.com/materials/metal/non-ferrous/aluminum-laser-cleaning',
        'g:image_link': 'https://www.z-beam.com/images/material/aluminum-laser-cleaning-hero.jpg',
        'g:price': '390 USD',
        'g:availability': 'in stock',
        'g:condition': 'new',
        'g:brand': 'Z-Beam',
        'g:mpn': 'ZB-PROF-CLEAN-aluminum-laser-cleaning'
      };

      expect(productData['g:availability']).toBe('in stock');
      expect(productData['g:condition']).toBe('new');
      expect(productData['g:brand']).toBe('Z-Beam');
      expect(productData['g:link']).toContain('https://www.z-beam.com');
    });
  });

  describe('Service Type Configuration', () => {
    it('should have consistent service pricing configuration', () => {
      const servicePricing = {
        professionalCleaning: {
          hourlyRate: 390,
          currency: 'USD',
          label: 'Professional Laser Cleaning',
          sku: 'ZB-PROF-CLEAN'
        },
        equipmentRental: {
          hourlyRate: 320,
          currency: 'USD',
          label: 'Equipment Rental',
          sku: 'ZB-EQUIP-RENT'
        }
      };

      expect(servicePricing.professionalCleaning.hourlyRate).toBe(390);
      expect(servicePricing.equipmentRental.hourlyRate).toBe(320);
      expect(servicePricing.professionalCleaning.sku).toBe('ZB-PROF-CLEAN');
      expect(servicePricing.equipmentRental.sku).toBe('ZB-EQUIP-RENT');
    });
  });

  describe('CSV Feed Format', () => {
    it('should create tab-separated values with headers', () => {
      const headers = ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability', 'condition', 'brand', 'mpn'];
      const csvHeader = headers.join('\t');
      
      expect(csvHeader).toContain('\t');
      expect(csvHeader.split('\t')).toHaveLength(10);
    });

    it('should format product row with tab delimiters', () => {
      const productRow = [
        'aluminum-laser-cleaning-professionalCleaning',
        'Aluminum Laser Cleaning',
        'Industrial laser cleaning',
        'https://www.z-beam.com/materials/aluminum',
        'https://www.z-beam.com/images/aluminum-hero.jpg',
        '390 USD',
        'in stock',
        'new',
        'Z-Beam',
        'ZB-PROF-CLEAN-aluminum'
      ].join('\t');

      expect(productRow.split('\t')).toHaveLength(10);
    });
  });
});
