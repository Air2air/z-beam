/**
 * Collection and Additional Schema Tests
 * Tests for CollectionPage, ItemList, and other supporting schemas
 */

import {
  generateCollectionPageSchema,
  generateWebPageSchema,
  generateItemListSchema
} from '@/app/utils/schemas/collectionPageSchema';
import { generateDatasetSchema } from '@/app/utils/schemas/generators/dataset';
import { createContext } from '@/app/utils/schemas/generators';

const testContext = createContext('materials/metal', 'https://z-beam.com');

describe('CollectionPage Schema', () => {
  it('generates valid CollectionPage schema', () => {
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Laser Cleaning Materials',
      description: 'Complete guide to laser-cleanable materials',
      numberOfItems: 50
    });
    
    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.name).toBe('Laser Cleaning Materials');
    expect(schema.numberOfItems).toBe(50);
  });

  it('includes @id for reference', () => {
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Test',
      description: 'Test',
      numberOfItems: 10
    });
    
    expect(schema['@id']).toContain('#collection');
  });

  it('includes isPartOf WebSite reference', () => {
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Test',
      description: 'Test',
      numberOfItems: 10
    });
    
    expect(schema.isPartOf['@type']).toBe('WebSite');
    expect(schema.isPartOf['@id']).toContain('#website');
  });

  it('includes itemListElement when provided', () => {
    const items = [
      { '@type': 'ListItem', position: 1, item: { name: 'Aluminum' } },
      { '@type': 'ListItem', position: 2, item: { name: 'Steel' } }
    ];
    
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Test',
      description: 'Test',
      numberOfItems: 2,
      itemListElement: items
    });
    
    expect(schema.mainEntity).toBeDefined();
    expect(schema.mainEntity['@type']).toBe('ItemList');
    expect(schema.mainEntity.itemListElement).toHaveLength(2);
  });

  it('omits mainEntity when no itemListElement', () => {
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Test',
      description: 'Test',
      numberOfItems: 10
    });
    
    expect(schema.mainEntity).toBeUndefined();
  });
});

describe('WebPage Schema (collectionPageSchema module)', () => {
  it('generates valid WebPage schema', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'About Z-Beam',
      description: 'Learn about our laser cleaning technology'
    });
    
    expect(schema['@type']).toBe('WebPage');
    expect(schema.name).toBe('About Z-Beam');
    expect(schema.inLanguage).toBe('en-US');
  });

  it('includes dates when provided', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'Test',
      description: 'Test',
      datePublished: '2024-01-01',
      dateModified: '2024-06-15'
    });
    
    expect(schema.datePublished).toBe('2024-01-01');
    expect(schema.dateModified).toBe('2024-06-15');
  });

  it('includes breadcrumb reference when provided', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'Test',
      description: 'Test',
      breadcrumbId: '#breadcrumb'
    });
    
    expect(schema.breadcrumb['@id']).toBe('#breadcrumb');
  });

  it('includes author reference when provided', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'Test',
      description: 'Test',
      author: '#author-expert'
    });
    
    expect(schema.author['@id']).toBe('#author-expert');
  });

  it('omits optional fields when not provided', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'Test',
      description: 'Test'
    });
    
    expect(schema.datePublished).toBeUndefined();
    expect(schema.dateModified).toBeUndefined();
    expect(schema.breadcrumb).toBeUndefined();
    expect(schema.author).toBeUndefined();
  });
});

describe('ItemList Schema', () => {
  it('generates valid ItemList schema', () => {
    const schema = generateItemListSchema({
      url: 'https://z-beam.com/materials/metal',
      name: 'Metal Materials',
      description: 'All metal materials for laser cleaning',
      items: [
        { name: 'Aluminum' },
        { name: 'Steel' },
        { name: 'Copper' }
      ]
    });
    
    expect(schema['@type']).toBe('ItemList');
    expect(schema.name).toBe('Metal Materials');
    expect(schema.itemListElement).toHaveLength(3);
  });

  it('assigns correct positions to items', () => {
    const schema = generateItemListSchema({
      url: 'https://z-beam.com/test',
      name: 'Test',
      description: 'Test',
      items: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }]
    });
    
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[2].position).toBe(3);
  });

  it('includes item descriptions when provided', () => {
    const schema = generateItemListSchema({
      url: 'https://z-beam.com/test',
      name: 'Test',
      description: 'Test',
      items: [
        { name: 'Aluminum', description: 'Non-ferrous metal' },
        { name: 'Steel', description: 'Ferrous alloy' }
      ]
    });
    
    expect(schema.itemListElement[0].item.description).toBe('Non-ferrous metal');
    expect(schema.itemListElement[1].item.description).toBe('Ferrous alloy');
  });

  it('handles empty items array', () => {
    const schema = generateItemListSchema({
      url: 'https://z-beam.com/test',
      name: 'Test',
      description: 'Test',
      items: []
    });
    
    expect(schema.itemListElement).toHaveLength(0);
  });
});

describe('Dataset Schema', () => {
  it('generates valid Dataset schema with material properties', () => {
    const dataset = generateDatasetSchema({
      context: testContext,
      name: 'Aluminum Properties',
      materialProperties: {
        thermal: {
          meltingPoint: { value: 660, unit: '°C' },
          conductivity: { value: 237, unit: 'W/m·K' }
        }
      }
    });
    
    expect(dataset).not.toBeNull();
    expect(dataset!['@type']).toBe('Dataset');
    expect(dataset!.name).toContain('Aluminum Properties');
  });

  it('includes distribution information', () => {
    const dataset = generateDatasetSchema({
      context: testContext,
      name: 'Test Dataset',
      materialProperties: {
        test: { testProp: { value: 100, unit: 'units' } }
      }
    });
    
    expect(dataset?.distribution).toBeDefined();
  });

  it('includes license information', () => {
    const dataset = generateDatasetSchema({
      context: testContext,
      name: 'Test Dataset',
      materialProperties: {
        test: { testProp: { value: 100, unit: 'units' } }
      }
    });
    
    expect(dataset?.license).toBeDefined();
  });

  it('includes variable measurements', () => {
    const dataset = generateDatasetSchema({
      context: testContext,
      name: 'Test Dataset',
      materialProperties: {
        thermal: {
          meltingPoint: { value: 660, unit: '°C' }
        }
      }
    });
    
    expect(dataset?.variableMeasured).toBeDefined();
  });

  it('handles machine settings for settings pages', () => {
    const dataset = generateDatasetSchema({
      context: createContext('settings/aluminum', 'https://z-beam.com'),
      name: 'Aluminum Settings',
      machineSettings: {
        wavelength: { value: 1064, unit: 'nm' },
        power: { value: 100, unit: 'W' }
      }
    });
    
    expect(dataset).not.toBeNull();
    expect(dataset!['@type']).toBe('Dataset');
  });

  it('returns null without properties or settings', () => {
    const dataset = generateDatasetSchema({
      context: testContext,
      name: 'Empty Dataset'
    });
    
    expect(dataset).toBeNull();
  });
});

describe('Schema @id References', () => {
  it('CollectionPage has unique @id', () => {
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Test',
      description: 'Test',
      numberOfItems: 10
    });
    
    expect(schema['@id']).toBe('https://z-beam.com/materials#collection');
  });

  it('WebPage has unique @id', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'Test',
      description: 'Test'
    });
    
    expect(schema['@id']).toBe('https://z-beam.com/about#webpage');
  });

  it('ItemList has unique @id', () => {
    const schema = generateItemListSchema({
      url: 'https://z-beam.com/materials/metal',
      name: 'Test',
      description: 'Test',
      items: []
    });
    
    expect(schema['@id']).toBe('https://z-beam.com/materials/metal#itemlist');
  });
});

describe('Schema Language Settings', () => {
  it('CollectionPage uses en-US', () => {
    const schema = generateCollectionPageSchema({
      url: 'https://z-beam.com/materials',
      name: 'Test',
      description: 'Test',
      numberOfItems: 10
    });
    
    expect(schema.inLanguage).toBe('en-US');
  });

  it('WebPage uses en-US', () => {
    const schema = generateWebPageSchema({
      url: 'https://z-beam.com/about',
      name: 'Test',
      description: 'Test'
    });
    
    expect(schema.inLanguage).toBe('en-US');
  });
});
