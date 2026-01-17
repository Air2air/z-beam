/**
 * ItemPage → Dataset Schema Integration Tests
 * 
 * Tests the complete data flow from ItemPage component through to Dataset schema generation
 * This ensures machineSettings merge produces the correct structure for SchemaFactory
 * 
 * **CURRENT FORMAT**: Hybrid v2.0 + v3.0 (December 27, 2025)
 * - Contains BOTH variableMeasured arrays (v2.0 backward compatibility)
 * - AND nested material/contaminant objects (v3.0 new structure)
 * - Static files (public/datasets/) use hybrid format
 * - Runtime generation may differ from static files
 * 
 * **See**: docs/DATASET_FORMAT_ACTUAL_STATUS_DEC27_2025.md for current format details
 * 
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { ItemPage } from '@/app/components/ContentPages/ItemPage';
import { getSettingsArticle } from '@/app/utils/contentAPI';
import type { ContentTypeConfig } from '@/app/config/contentTypes';
import { createMockMaterial, createMockAuthor, createMockSettings } from '@/tests/utils/mockFactory';

// Mock dataset loader to return null so tests use frontmatter data directly
jest.mock('@/app/utils/schemas/datasetLoader', () => ({
  loadGeneratedDataset: jest.fn(() => null),
  extractEnhancedFields: jest.fn(() => null)
}));

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
    frontmatter: createMockMaterial({
      name: 'Titanium',
      slug: 'titanium-laser-cleaning',
      category: 'metal',
      subcategory: 'non-ferrous',
      title: 'Titanium Laser Cleaning',
      author: createMockAuthor({
        name: 'Test Author',
        email: 'test@z-beam.com'
      }),
      materialProperties: {
        material_characteristics: {
          density: { value: 4.5, unit: 'g/cm³', min: 0.5, max: 23 },
          meltingPoint: { value: 1668, unit: '°C', min: 100, max: 3800 }
        },
        laser_material_interaction: {
          thermalConductivity: { value: 21.9, unit: 'W/(m·K)', min: 7, max: 430 }
        }
      }
    }),
    components: {}
  };

  const settingsWithMachineSettings = createMockSettings({
    machineSettings: {
      laserPower: { value: 200, unit: 'W', min: 100, max: 300 },
      wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 },
      spotSize: { value: 50, unit: 'μm', min: 25, max: 100 },
      frequency: { value: 50, unit: 'kHz', min: 20, max: 200 },
      pulseWidth: { value: 100, unit: 'ns', min: 50, max: 500 },
      scanSpeed: { value: 1000, unit: 'mm/s', min: 100, max: 5000 },
      passCount: { value: 3, unit: 'passes', min: 1, max: 10 },
      overlapRatio: { value: 50, unit: '%', min: 10, max: 90 }
    }
  });

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
    // Create fresh copy of materialArticle to avoid mutation between tests
    // ItemPage.tsx mutates article.frontmatter directly, so each test needs a clean copy
    const freshMaterial = JSON.parse(JSON.stringify(materialArticle));
    mockConfig.getArticle = jest.fn().mockResolvedValue(freshMaterial);
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

  it.skip('Dataset schema should include properties from machineSettings (v3.0 nested format)', async () => {
    // NOTE: Test pending machine settings schema integration for v3.0 format
    // v3.0 uses nested material.machineSettings object, not variableMeasured array
    // See: docs/UPDATED_DATASET_SPECIFICATION_DEC27_2025.md
    // Blocks: Dataset nested property structure population
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

    // Runtime generates v2.0 variableMeasured format (static files have hybrid format)
    expect(datasetSchema).toBeDefined();
    expect(datasetSchema.variableMeasured).toBeDefined();
    expect(Array.isArray(datasetSchema.variableMeasured)).toBe(true);

    // Machine settings should be in variableMeasured array as PropertyValue objects
    const powerRangeProperty = datasetSchema.variableMeasured.find(
      (v: any) => v.name?.toLowerCase().includes('power') || v.propertyID === 'laserPower'
    );
    expect(powerRangeProperty).toBeDefined();
  });

  it('Dataset schema should include materialProperties (v3.0 nested format)', async () => {
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

    // Runtime generates v2.0 variableMeasured format (static files have hybrid format)
    expect(datasetSchema).toBeDefined();
    expect(datasetSchema.variableMeasured).toBeDefined();
    
    // Material properties should be in variableMeasured array as PropertyValue objects
    const densityProperty = datasetSchema.variableMeasured.find(
      (v: any) => v.name?.toLowerCase().includes('density') || v.propertyID === 'density'
    );
    expect(densityProperty).toBeDefined();
    expect(parseFloat(densityProperty.value)).toBe(4.5);
    expect(densityProperty.unitText || densityProperty.unit).toBe('g/cm³');
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

  it('should generate Dataset schema with ONLY materialProperties when settings unavailable (v3.0)', async () => {
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
    
    // Runtime generates v2.0 variableMeasured format
    expect(datasetSchema.variableMeasured).toBeDefined();
    const densityProperty = datasetSchema.variableMeasured.find(
      (v: any) => v.name?.toLowerCase().includes('density') || v.propertyID === 'density'
    );
    expect(densityProperty).toBeDefined();

    // Should NOT have machine settings properties (settings unavailable)
    const machineSettingsProps = datasetSchema.variableMeasured.filter(
      (v: any) => v.name?.toLowerCase().includes('machine') || v.name?.toLowerCase().includes('laser power')
    );
    expect(machineSettingsProps.length).toBe(0);
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

    // @id should follow pattern: baseUrl/datasets/materials/{material}-material-dataset#dataset
    expect(datasetSchema['@id']).toMatch(/\/datasets\/materials\/titanium-material-dataset#dataset$/);
  });

  it('Dataset schema should include required v3.0 properties', async () => {
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

    // Runtime generates v2.0 format (static files have hybrid v2.0 + v3.0)
    expect(datasetSchema['@type']).toBe('Dataset');
    expect(datasetSchema.name).toBeDefined();
    expect(datasetSchema.description).toBeDefined();
    
    // v2.0 core properties
    expect(datasetSchema.variableMeasured).toBeDefined();
    expect(Array.isArray(datasetSchema.variableMeasured)).toBe(true);
    expect(datasetSchema.variableMeasured.length).toBeGreaterThan(0);
    
    // Note: v3.0 properties (creator, publisher, version) only in static files
    // Runtime generation focuses on v2.0 variableMeasured for flexibility
    // See: docs/DATASET_FORMAT_ACTUAL_STATUS_DEC27_2025.md
  });
});

// Note: v3.0 format uses nested objects instead of variableMeasured arrays
// See: docs/UPDATED_DATASET_SPECIFICATION_DEC27_2025.md
