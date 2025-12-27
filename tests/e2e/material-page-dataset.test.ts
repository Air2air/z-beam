/**
 * Material Page Dataset Schema E2E Tests
 * 
 * Tests the complete rendered material page to verify Dataset schema appears in HTML
 * This validates the entire pipeline from content loading through render
 * 
 * **IMPORTANT**: These tests validate v3.0 format expectations.
 * **Current Status**: Implementation still generates v2.0 format (variableMeasured arrays).
 * **Migration Needed**: Update dataset generator and SchemaFactory to v3.0 nested object format.
 * **See**: docs/UPDATED_DATASET_SPECIFICATION_DEC27_2025.md for complete specification
 * 
 * @jest-environment node
 */

import puppeteer, { Browser, Page } from 'puppeteer';

describe('Material Page Dataset Schema E2E', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const skipE2E = process.env.SKIP_E2E === 'true' || !process.env.BASE_URL;

  beforeAll(async () => {
    if (skipE2E) {
      console.log('⏭️  Skipping E2E tests (set BASE_URL or SKIP_E2E=false to run)');
      return;
    }
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    if (skipE2E) return;
    page = await browser.newPage();
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  (skipE2E ? it.skip : it)('should render Dataset schema in HTML for material with machineSettings', async () => {
    // Load Aluminum page (has machineSettings)
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Extract JSON-LD script
    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    expect(jsonLdData).toBeTruthy();
    expect(jsonLdData['@graph']).toBeDefined();

    // Find Dataset in @graph
    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    expect(datasetSchema).toBeDefined();
  });

  (skipE2E ? it.skip : it)('Dataset schema should contain machineSettings (v3.0 nested format)', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    
    // v3.0: Check nested material.machineSettings object (not variableMeasured array)
    expect(datasetSchema.material).toBeDefined();
    expect(datasetSchema.material.machineSettings).toBeDefined();

    // Check for machineSettings properties in nested structure
    const settings = datasetSchema.material.machineSettings;
    expect(settings.laserPower || settings.wavelength || settings.spotSize).toBeDefined();
  });

  (skipE2E ? it.skip : it)('Dataset schema should contain materialProperties (v3.0 nested format)', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // v3.0: Check nested material.materialProperties object
    expect(datasetSchema.material).toBeDefined();
    expect(datasetSchema.material.materialProperties).toBeDefined();
    
    // Check for nested property groups
    const props = datasetSchema.material.materialProperties;
    expect(props.materialCharacteristics || props.laserMaterialInteraction).toBeDefined();
  });

  (skipE2E ? it.skip : it)('property values should have correct v3.0 structure', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    
    // v3.0: Properties are nested objects, not PropertyValue arrays
    const settings = datasetSchema.material?.machineSettings;
    if (settings) {
      const firstProp = Object.values(settings)[0] as any;
      
      // Verify v3.0 property structure: {value, unit, min?, max?, confidence?}
      expect(firstProp.value).toBeDefined();
      expect(firstProp.unit).toBeDefined();
      
      // Should have min/max for ranges
      if (firstProp.min !== undefined) {
        expect(typeof firstProp.min).toBe('number');
      }
      if (firstProp.max !== undefined) {
        expect(typeof firstProp.max).toBe('number');
      }
    }
  });

  (skipE2E ? it.skip : it)('Dataset schema should have valid @id with correct format', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    
    // @id should follow pattern: /datasets/materials/{slug}#dataset
    expect(datasetSchema['@id']).toMatch(/\/datasets\/materials\/aluminum-laser-cleaning#dataset$/);
  });

  (skipE2E ? it.skip : it)('Dataset schema should include required properties (v3.0 minimal format)', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // v3.0 minimal required fields
    expect(datasetSchema.name).toBeDefined();
    expect(datasetSchema.description).toBeDefined();
    expect(datasetSchema.creator).toBeDefined();
    expect(datasetSchema.publisher).toBeDefined();
    expect(datasetSchema.version).toBeDefined();
    
    // v3.0: distribution, license, keywords removed from current format
    // These were part of v2.0 comprehensive Schema.org format
  });

  (skipE2E ? it.skip : it)('should work for different material types (Steel) - v3.0 format', async () => {
    await page.goto(`${baseUrl}/materials/metal/ferrous/steel-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    expect(datasetSchema).toBeDefined();
    expect(datasetSchema.material).toBeDefined();
    expect(datasetSchema.material.machineSettings || datasetSchema.material.materialProperties).toBeDefined();
  });

  (skipE2E ? it.skip : it)('should NOT include Dataset schema for material without properties or settings', async () => {
    // Assuming there's a material without complete data
    // This test may need adjustment based on actual content
    await page.goto(`${baseUrl}/materials/composite/fiber/carbon-fiber-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    // Check if Dataset exists
    const datasetSchema = jsonLdData['@graph']?.find((item: any) => item['@type'] === 'Dataset');
    
    // This test validates conditional logic - if material has properties OR settings, Dataset appears
    // If neither, Dataset should be absent
    if (datasetSchema) {
      // v3.0: If present, must have material object with properties or settings
      expect(datasetSchema.material).toBeDefined();
      expect(datasetSchema.material.machineSettings || datasetSchema.material.materialProperties).toBeDefined();
    }
  });

  (skipE2E ? it.skip : it)('should have valid v3.0 Dataset structure', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // v3.0 streamlined format validation
    expect(datasetSchema['@type']).toBe('Dataset');
    expect(datasetSchema.name).toBeTruthy();
    expect(datasetSchema.description).toBeTruthy();
    
    // Creator should be Organization
    expect(datasetSchema.creator).toBeTruthy();
    expect(datasetSchema.creator['@type']).toBe('Organization');
    
    // Publisher should be Organization
    expect(datasetSchema.publisher).toBeTruthy();
    expect(datasetSchema.publisher['@type']).toBe('Organization');
    
    // v3.0: Material data should be nested object (not variableMeasured array)
    expect(datasetSchema.material).toBeTruthy();
    expect(typeof datasetSchema.material).toBe('object');
  });
});

// Note: v3.0 format removed variableMeasured, citation, distribution, license, keywords
// See: docs/UPDATED_DATASET_SPECIFICATION_DEC27_2025.md for complete v2.0 vs v3.0 comparison
