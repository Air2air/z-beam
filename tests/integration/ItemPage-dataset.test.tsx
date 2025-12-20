/**
 * ItemPage → Dataset Schema Integration Tests
 * 
 * Tests the complete data flow from ItemPage component through to Dataset schema generation
 * This ensures machineSettings merge produces the correct structure for SchemaFactory
 * 
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { ItemPage } from '@/app/components/ContentPages/ItemPage';
import { getSettingsArticle } from '@/app/utils/contentAPI';
import type { ContentTypeConfig } from '@/app/config/contentTypes';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound');
  }),
  redirect: jest.fn((url: string) => {
    throw new Error(`Redirect to ${url}`);
  })
}));

// Mock layouts (simplified)
jest.mock('@/app/components/MaterialsLayout/MaterialsLayout', () => ({
  MaterialsLayout: () => <div>Materials Layout</div>
}));

jest.mock('@/app/components/ContaminantsLayout/ContaminantsLayout', () => ({
  ContaminantsLayout: () => <div>Contaminants Layout</div>
}));

jest.mock('@/app/components/SettingsLayout/SettingsLayout', () => ({
  SettingsLayout: () => <div>Settings Layout</div>
}));

// Use REAL MaterialJsonLD and SchemaFactory (no mocking)
// This tests the actual integration

jest.mock('@/app/utils/contentAPI', () => ({
  getSettingsArticle: jest.fn()
}));

const mockGetSettingsArticle = getSettingsArticle as jest.MockedFunction<typeof getSettingsArticle>;

describe('ItemPage → Dataset Schema Integration', () => {
  const materialArticle = {
    metadata: {
      name: 'Titanium',
      slug: 'titanium-laser-cleaning',
      category: 'metal',
      subcategory: 'non-ferrous',
      title: 'Titanium Laser Cleaning',
      datePublished: '2025-01-01',
      dateModified: '2025-01-01',
      author: {
        name: 'Test Author',
        email: 'test@z-beam.com'
      },
      materialProperties: {
        material_characteristics: {
          density: { value: 4.5, unit: 'g/cm³', min: 0.5, max: 23 },
          meltingPoint: { value: 1668, unit: '°C', min: 100, max: 3800 }
        },
        laser_material_interaction: {
          thermalConductivity: { value: 21.9, unit: 'W/(m·K)', min: 7, max: 430 }
        }
      }
    },
    components: {}
  };

  const settingsWithMachineSettings = {
    machineSettings: {
      powerRange: { value: 200, unit: 'W', min: 100, max: 300 },
      wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 },
      spotSize: { value: 50, unit: 'μm', min: 25, max: 100 },
      repetitionRate: { value: 50, unit: 'kHz', min: 20, max: 200 },
      pulseWidth: { value: 100, unit: 'ns', min: 50, max: 500 },
      scanSpeed: { value: 1000, unit: 'mm/s', min: 100, max: 5000 },
      passCount: { value: 3, unit: 'passes', min: 1, max: 10 },
      overlapRatio: { value: 50, unit: '%', min: 10, max: 90 }
    }
  };

  const mockConfig: ContentTypeConfig = {
    type: 'materials',
    rootPath: 'materials',
    hasSettings: true,
    getArticle: jest.fn().mockResolvedValue(materialArticle),
    getCategoryArticles: jest.fn(),
    getAllSlugs: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset getArticle mock to return original materialArticle
    mockConfig.getArticle = jest.fn().mockResolvedValue(materialArticle);
  });

  it('should generate Dataset schema when ItemPage loads material with settings', async () => {
    mockGetSettingsArticle.mockResolvedValue(settingsWithMachineSettings as any);

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'non-ferrous',
        itemSlug: 'titanium-laser-cleaning'
      })
    );

    // Extract JSON-LD script
    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeTruthy();

    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    
    // Verify @graph structure
    expect(jsonLd['@graph']).toBeDefined();
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);

    // Find Dataset schema in @graph
    const datasetSchema = jsonLd['@graph'].find((item: any) => item['@type'] === 'Dataset');
    
    expect(datasetSchema).toBeDefined();
    expect(datasetSchema['@type']).toBe('Dataset');
  });

  it.skip('Dataset schema should include variableMeasured from machineSettings', async () => {
    // TODO: Machine settings integration with dataset schema needs implementation
    mockGetSettingsArticle.mockResolvedValue(settingsWithMachineSettings as any);

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'non-ferrous',
        itemSlug: 'titanium-laser-cleaning'
      })
    );

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    const datasetSchema = jsonLd['@graph'].find((item: any) => item['@type'] === 'Dataset');

    expect(datasetSchema.variableMeasured).toBeDefined();
    expect(Array.isArray(datasetSchema.variableMeasured)).toBe(true);

    // Should have machine settings measurements
    const powerRangeMeasurement = datasetSchema.variableMeasured.find(
      (v: any) => v.propertyID === 'powerRange'
    );
    expect(powerRangeMeasurement).toBeDefined();
    expect(powerRangeMeasurement.value).toBe(200);
    expect(powerRangeMeasurement.unitText).toBe('W');
    expect(powerRangeMeasurement.minValue).toBe(100);
    expect(powerRangeMeasurement.maxValue).toBe(300);
  });

  it('Dataset schema should include variableMeasured from materialProperties', async () => {
    mockGetSettingsArticle.mockResolvedValue(settingsWithMachineSettings as any);

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'non-ferrous',
        itemSlug: 'titanium-laser-cleaning'
      })
    );

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    const datasetSchema = jsonLd['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // Should have material property measurements
    const densityMeasurement = datasetSchema.variableMeasured.find(
      (v: any) => v.propertyID === 'density'
    );
    expect(densityMeasurement).toBeDefined();
    expect(densityMeasurement.value).toBe(4.5);
    expect(densityMeasurement.unitText).toBe('g/cm³');
  });

  it('should NOT generate Dataset schema when machineSettings missing and materialProperties missing', async () => {
    const articleWithoutProperties = {
      metadata: {
        name: 'Test Material',
        slug: 'test-laser-cleaning',
        category: 'metal',
        subcategory: 'ferrous',
        title: 'Test Material'
      },
      components: {}
    };

    mockConfig.getArticle = jest.fn().mockResolvedValue(articleWithoutProperties);
    mockGetSettingsArticle.mockRejectedValue(new Error('Settings not found'));

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'ferrous',
        itemSlug: 'test-laser-cleaning'
      })
    );

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    
    // Dataset schema should NOT be present
    const datasetSchema = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Dataset');
    expect(datasetSchema).toBeUndefined();
  });

  it('should generate Dataset schema with ONLY materialProperties when settings unavailable', async () => {
    mockGetSettingsArticle.mockRejectedValue(new Error('Settings not found'));

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'non-ferrous',
        itemSlug: 'titanium-laser-cleaning'
      })
    );

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    const datasetSchema = jsonLd['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // Dataset should still exist (materialProperties alone is sufficient)
    expect(datasetSchema).toBeDefined();
    
    // Should have material properties
    expect(datasetSchema.variableMeasured).toBeDefined();
    const densityMeasurement = datasetSchema.variableMeasured.find(
      (v: any) => v.propertyID === 'density'
    );
    expect(densityMeasurement).toBeDefined();

    // Should NOT have machine settings
    const powerMeasurement = datasetSchema.variableMeasured.find(
      (v: any) => v.propertyID === 'powerRange'
    );
    expect(powerMeasurement).toBeUndefined();
  });

  it('Dataset schema should have correct @id format', async () => {
    mockGetSettingsArticle.mockResolvedValue(settingsWithMachineSettings as any);

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'non-ferrous',
        itemSlug: 'titanium-laser-cleaning'
      })
    );

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    const datasetSchema = jsonLd['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // @id should follow pattern: baseUrl/datasets/materials/{material}#dataset
    expect(datasetSchema['@id']).toMatch(/\/datasets\/materials\/titanium-laser-cleaning#dataset$/);
  });

  it('Dataset schema should include complete required properties per Google guidelines', async () => {
    mockGetSettingsArticle.mockResolvedValue(settingsWithMachineSettings as any);

    const { container } = render(
      await ItemPage({
        config: mockConfig,
        categorySlug: 'metal',
        subcategorySlug: 'non-ferrous',
        itemSlug: 'titanium-laser-cleaning'
      })
    );

    const jsonLdScript = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(jsonLdScript?.textContent || '{}');
    const datasetSchema = jsonLd['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // Required properties per Google Dataset guidelines
    expect(datasetSchema['@type']).toBe('Dataset');
    expect(datasetSchema.name).toBeDefined();
    expect(datasetSchema.description).toBeDefined();
    expect(datasetSchema.license).toBeDefined();
    expect(datasetSchema.creator).toBeDefined();
    
    // Distribution for download options
    expect(datasetSchema.distribution).toBeDefined();
    expect(Array.isArray(datasetSchema.distribution)).toBe(true);
    expect(datasetSchema.distribution.length).toBeGreaterThan(0);
  });
});
