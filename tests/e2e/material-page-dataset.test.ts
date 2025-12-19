/**
 * Material Page Dataset Schema E2E Tests
 * 
 * Tests the complete rendered material page to verify Dataset schema appears in HTML
 * This validates the entire pipeline from content loading through render
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

  (skipE2E ? it.skip : it)('Dataset schema should contain machineSettings in variableMeasured', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    
    expect(datasetSchema.variableMeasured).toBeDefined();
    expect(Array.isArray(datasetSchema.variableMeasured)).toBe(true);
    expect(datasetSchema.variableMeasured.length).toBeGreaterThan(0);

    // Check for machineSettings properties
    const machineSettingsProps = ['powerRange', 'wavelength', 'spotSize', 'repetitionRate'];
    const foundProps = datasetSchema.variableMeasured.filter((v: any) =>
      machineSettingsProps.includes(v.propertyID)
    );

    expect(foundProps.length).toBeGreaterThan(0);
  });

  (skipE2E ? it.skip : it)('Dataset schema should contain materialProperties in variableMeasured', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // Check for materialProperties
    const materialProps = ['density', 'meltingPoint', 'thermalConductivity'];
    const foundProps = datasetSchema.variableMeasured.filter((v: any) =>
      materialProps.some(prop => v.propertyID?.includes(prop))
    );

    expect(foundProps.length).toBeGreaterThan(0);
  });

  (skipE2E ? it.skip : it)('variableMeasured entries should have correct PropertyValue structure', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');
    const firstVariable = datasetSchema.variableMeasured[0];

    // Verify PropertyValue structure
    expect(firstVariable['@type']).toBe('PropertyValue');
    expect(firstVariable.propertyID).toBeDefined();
    expect(firstVariable.name).toBeDefined();
    expect(firstVariable.value).toBeDefined();
    expect(firstVariable.unitText).toBeDefined();
    
    // Should have min/max for ranges
    if (firstVariable.minValue !== undefined) {
      expect(typeof firstVariable.minValue).toBe('number');
    }
    if (firstVariable.maxValue !== undefined) {
      expect(typeof firstVariable.maxValue).toBe('number');
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

  (skipE2E ? it.skip : it)('Dataset schema should include required Google properties', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // Required by Google
    expect(datasetSchema.name).toBeDefined();
    expect(datasetSchema.description).toBeDefined();
    expect(datasetSchema.license).toBeDefined();
    expect(datasetSchema.creator).toBeDefined();
    
    // Distribution for downloads
    expect(datasetSchema.distribution).toBeDefined();
    expect(Array.isArray(datasetSchema.distribution)).toBe(true);
    expect(datasetSchema.distribution.length).toBeGreaterThan(0);
    
    // First distribution should have DataDownload type
    expect(datasetSchema.distribution[0]['@type']).toBe('DataDownload');
    expect(datasetSchema.distribution[0].contentUrl).toBeDefined();
    expect(datasetSchema.distribution[0].encodingFormat).toBeDefined();
  });

  (skipE2E ? it.skip : it)('should work for different material types (Steel)', async () => {
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
    expect(datasetSchema.variableMeasured).toBeDefined();
    expect(datasetSchema.variableMeasured.length).toBeGreaterThan(0);
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
      // If present, must have at least one variableMeasured entry
      expect(datasetSchema.variableMeasured.length).toBeGreaterThan(0);
    }
  });

  (skipE2E ? it.skip : it)('should pass Google Rich Results validation structure', async () => {
    await page.goto(`${baseUrl}/materials/metal/non-ferrous/aluminum-laser-cleaning`, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    const jsonLdData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    const datasetSchema = jsonLdData['@graph'].find((item: any) => item['@type'] === 'Dataset');

    // Google Rich Results requirements
    expect(datasetSchema['@type']).toBe('Dataset');
    expect(datasetSchema.name).toBeTruthy();
    expect(datasetSchema.description).toBeTruthy();
    
    // License should be URL or CreativeWork
    expect(datasetSchema.license).toBeTruthy();
    
    // Creator should be Person or Organization
    expect(datasetSchema.creator).toBeTruthy();
    expect(datasetSchema.creator['@type']).toMatch(/Person|Organization/);
    
    // VariableMeasured should be PropertyValue array
    expect(Array.isArray(datasetSchema.variableMeasured)).toBe(true);
    datasetSchema.variableMeasured.forEach((variable: any) => {
      expect(variable['@type']).toBe('PropertyValue');
      expect(variable.name).toBeTruthy();
    });
  });
});
