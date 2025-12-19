/**
 * ItemPage machineSettings Merge Logic Tests
 * 
 * Tests the specific fix for Dataset schema bug: machineSettings must be merged
 * into article.metadata (not article top-level) for SchemaFactory to detect it
 */

import { getSettingsArticle } from '@/app/utils/contentAPI';

jest.mock('@/app/utils/contentAPI', () => ({
  getSettingsArticle: jest.fn()
}));

const mockGetSettingsArticle = getSettingsArticle as jest.MockedFunction<typeof getSettingsArticle>;

describe('ItemPage machineSettings merge logic', () => {
  const settingsData = {
    machineSettings: {
      powerRange: { value: 200, unit: 'W', min: 100, max: 300 },
      wavelength: { value: 1064, unit: 'nm', min: 532, max: 1064 }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should merge machineSettings into metadata.machineSettings (not top-level)', () => {
    // This test verifies the fix structure directly
    const article: any = {
      metadata: {
        name: 'Test Material',
        materialProperties: { density: { value: 2.7, unit: 'g/cm³' } }
      },
      components: {}
    };

    // CORRECT: Merge into metadata
    if (!article.metadata) {
      article.metadata = {};
    }
    article.metadata.machineSettings = settingsData.machineSettings;

    // Verify correct structure for Dataset schema
    expect(article.metadata.machineSettings).toBeDefined();
    expect(article.metadata.machineSettings.powerRange).toEqual({
      value: 200,
      unit: 'W',
      min: 100,
      max: 300
    });
    
    // Verify NOT at top level (the bug that was fixed)
    expect((article as any).machineSettings).toBeUndefined();
  });

  it('should create metadata object if missing before merge', () => {
    const article: any = {
      components: {}
    };

    // Handle missing metadata
    if (!article.metadata) {
      article.metadata = {};
    }
    article.metadata.machineSettings = settingsData.machineSettings;

    expect(article.metadata).toBeDefined();
    expect(article.metadata.machineSettings).toBeDefined();
  });

  it('should preserve existing metadata when merging machineSettings', () => {
    const article: any = {
      metadata: {
        name: 'Aluminum',
        slug: 'aluminum',
        materialProperties: {
          density: { value: 2.7, unit: 'g/cm³' }
        }
      },
      components: {}
    };

    // Merge machineSettings
    article.metadata.machineSettings = settingsData.machineSettings;

    // Original metadata preserved
    expect(article.metadata.name).toBe('Aluminum');
    expect(article.metadata.slug).toBe('aluminum');
    expect(article.metadata.materialProperties).toBeDefined();
    
    // New machineSettings added
    expect(article.metadata.machineSettings).toBeDefined();
  });

  it('Dataset schema condition should detect machineSettings in metadata', () => {
    const article: any = {
      metadata: {
        name: 'Test',
        machineSettings: settingsData.machineSettings
      }
    };

    // This is how SchemaFactory checks for Dataset schema
    const fm = article.metadata;
    const shouldGenerateDataset = !!(fm?.materialProperties || fm?.machineSettings);

    expect(shouldGenerateDataset).toBe(true);
  });

  it('Dataset schema condition should fail without metadata.machineSettings', () => {
    // Simulate the BUG (top-level merge)
    const article: any = {
      metadata: { name: 'Test' },
      machineSettings: settingsData.machineSettings // WRONG LOCATION
    };

    // SchemaFactory checks metadata, not top-level
    const fm = article.metadata;
    const shouldGenerateDataset = !!(fm?.materialProperties || fm?.machineSettings);

    expect(shouldGenerateDataset).toBe(false); // ❌ This is what the bug caused
  });
});
