/**
 * Person Schema Tests
 * Tests for person schema generation and author attribution
 */

import { generatePersonSchema, createAuthorReference } from '@/app/utils/schemas/generators/person';
import { 
  TECHNICAL_TEAM_SCHEMA,
  generateCategoryAuthorSchema,
  generateSubcategoryAuthorSchema
} from '@/app/utils/schemas/personSchemas';
import { createContext } from '@/app/utils/schemas/generators';

const testContext = createContext('test-page', 'https://z-beam.com');

describe('Person Schema Generator', () => {
  describe('generatePersonSchema', () => {
    it('generates valid Person schema', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: {
          name: 'Dr. Sarah Chen',
          title: 'Ph.D. Materials Science'
        }
      });
      
      expect(person['@type']).toBe('Person');
      expect(person.name).toBe('Dr. Sarah Chen');
      expect(person.jobTitle).toBe('Ph.D. Materials Science');
    });

    it('includes @id for reference linking', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: { name: 'Test Author' },
        id: 'author-123'
      });
      
      expect(person['@id']).toContain('#author-author-123');
    });

    it('uses author.id when id not provided', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: { name: 'Test', id: 'custom-id' }
      });
      
      expect(person['@id']).toContain('#author-custom-id');
    });

    it('defaults to expert id when no id provided', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: { name: 'Test' }
      });
      
      expect(person['@id']).toContain('#author-expert');
    });

    it('includes worksFor organization', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: { name: 'Test' }
      });
      
      expect(person.worksFor).toBeDefined();
      expect(person.worksFor['@type']).toBe('Organization');
    });

    it('includes expertise as knowsAbout array', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: {
          name: 'Test',
          expertise: ['Laser cleaning', 'Material science']
        }
      });
      
      expect(person.knowsAbout).toContain('Laser cleaning');
      expect(person.knowsAbout).toContain('Material science');
    });

    it('converts single expertise string to array', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: {
          name: 'Test',
          expertise: 'Laser cleaning'
        }
      });
      
      expect(Array.isArray(person.knowsAbout)).toBe(true);
      expect(person.knowsAbout).toContain('Laser cleaning');
    });

    it('includes nationality when country provided', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: {
          name: 'Test',
          country: 'Germany'
        }
      });
      
      expect(person.nationality).toBe('Germany');
    });

    it('uses default values for missing author fields', () => {
      const person = generatePersonSchema({
        context: testContext,
        author: {}
      });
      
      expect(person.name).toBe('Z-Beam Technical Team');
      expect(person.jobTitle).toBe('Ph.D. Materials Science');
      expect(person.email).toBe('info@z-beam.com');
    });
  });

  describe('createAuthorReference', () => {
    it('creates reference with @id', () => {
      const ref = createAuthorReference('https://z-beam.com', 'author-123');
      
      expect(ref['@id']).toBe('https://z-beam.com#author-author-123');
    });

    it('uses default expert id', () => {
      const ref = createAuthorReference('https://z-beam.com');
      
      expect(ref['@id']).toBe('https://z-beam.com#author-expert');
    });
  });
});

describe('Reusable Person Schemas', () => {
  describe('TECHNICAL_TEAM_SCHEMA', () => {
    it('has correct structure', () => {
      expect(TECHNICAL_TEAM_SCHEMA['@type']).toBe('Person');
      expect(TECHNICAL_TEAM_SCHEMA.name).toBe('Z-Beam Technical Team');
      expect(TECHNICAL_TEAM_SCHEMA.jobTitle).toBe('Laser Cleaning Specialists');
    });

    it('includes knowsAbout array', () => {
      expect(Array.isArray(TECHNICAL_TEAM_SCHEMA.knowsAbout)).toBe(true);
      expect(TECHNICAL_TEAM_SCHEMA.knowsAbout).toContain('Laser cleaning technology');
    });

    it('includes worksFor organization', () => {
      expect(TECHNICAL_TEAM_SCHEMA.worksFor).toBeDefined();
      expect(TECHNICAL_TEAM_SCHEMA.worksFor['@type']).toBe('Organization');
    });

    it('includes credentials', () => {
      expect(Array.isArray(TECHNICAL_TEAM_SCHEMA.hasCredential)).toBe(true);
      expect(TECHNICAL_TEAM_SCHEMA.hasCredential.length).toBeGreaterThan(0);
      
      const laserCert = TECHNICAL_TEAM_SCHEMA.hasCredential.find(
        c => c.name === 'Laser Safety Certification'
      );
      expect(laserCert).toBeDefined();
      expect(laserCert?.['@type']).toBe('EducationalOccupationalCredential');
    });
  });

  describe('generateCategoryAuthorSchema', () => {
    it('generates schema with category-specific expertise', () => {
      const schema = generateCategoryAuthorSchema('metal', 'Metal');
      
      expect(schema.name).toBe('Z-Beam Technical Team');
      expect(schema.knowsAbout).toContain('Metal laser cleaning');
      expect(schema.knowsAbout).toContain('Metal materials science');
    });

    it('includes description with category', () => {
      const schema = generateCategoryAuthorSchema('plastic', 'Plastic');
      
      expect(schema.description).toContain('plastic');
    });

    it('accepts additional expertise', () => {
      const schema = generateCategoryAuthorSchema('metal', 'Metal', ['Custom expertise']);
      
      expect(schema.knowsAbout).toContain('Custom expertise');
    });

    it('preserves base schema properties', () => {
      const schema = generateCategoryAuthorSchema('metal', 'Metal');
      
      expect(schema.jobTitle).toBe('Laser Cleaning Specialists');
      expect(schema.hasCredential).toBeDefined();
    });
  });

  describe('generateSubcategoryAuthorSchema', () => {
    it('generates schema with subcategory-specific expertise', () => {
      const schema = generateSubcategoryAuthorSchema('metal', 'Metal', 'aluminum', 'Aluminum');
      
      expect(schema.knowsAbout).toContain('Aluminum Metal laser cleaning');
      expect(schema.knowsAbout).toContain('Aluminum material properties');
    });

    it('includes description with subcategory', () => {
      const schema = generateSubcategoryAuthorSchema('metal', 'Metal', 'steel', 'Steel');
      
      expect(schema.description).toContain('steel');
      expect(schema.description).toContain('metal');
    });

    it('preserves base schema properties', () => {
      const schema = generateSubcategoryAuthorSchema('metal', 'Metal', 'aluminum', 'Aluminum');
      
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('Z-Beam Technical Team');
    });
  });
});

describe('E-E-A-T Compliance', () => {
  it('Person schema supports Experience signals', () => {
    const person = generatePersonSchema({
      context: testContext,
      author: {
        name: 'Expert',
        expertise: ['10 years laser cleaning experience']
      }
    });
    
    expect(person.knowsAbout).toBeDefined();
  });

  it('Person schema supports Expertise signals', () => {
    const person = generatePersonSchema({
      context: testContext,
      author: {
        name: 'Dr. Expert',
        title: 'Ph.D. Materials Science',
        expertise: ['Material science', 'Laser physics']
      }
    });
    
    expect(person.jobTitle).toContain('Ph.D');
    expect(person.knowsAbout.length).toBeGreaterThan(0);
  });

  it('Person schema supports Authoritativeness signals', () => {
    expect(TECHNICAL_TEAM_SCHEMA.hasCredential).toBeDefined();
    expect(TECHNICAL_TEAM_SCHEMA.worksFor).toBeDefined();
  });

  it('Person schema supports Trustworthiness signals', () => {
    const person = generatePersonSchema({
      context: testContext,
      author: { name: 'Test', email: 'expert@z-beam.com' }
    });
    
    expect(person.email).toBeDefined();
    expect(person.worksFor.url).toBeDefined();
  });
});
