/**
 * Dataset Schema Tests
 * Tests for Dataset schema generation with quality validation
 */

import {
  generateDatasetSchema,
  generateDatasetDistributions
} from '@/app/utils/schemas/datasetSchema';

// Mock the validation module
jest.mock('@/app/utils/datasetValidation', () => ({
  validateDatasetForSchema: jest.fn()
}));

import { validateDatasetForSchema } from '@/app/utils/datasetValidation';

const mockValidate = validateDatasetForSchema as jest.MockedFunction<typeof validateDatasetForSchema>;

describe('Dataset Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to valid
    mockValidate.mockReturnValue({ valid: true, reason: '', warnings: [] });
  });

  describe('generateDatasetSchema', () => {
    it('generates valid Dataset schema when validation passes', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/materials/aluminum',
        name: 'Aluminum Dataset',
        description: 'Material properties dataset',
        materialName: 'Aluminum',
        machineSettings: { wavelength: { value: 1064 } },
        materialProperties: { thermal: {} }
      });
      
      expect(schema).not.toBeNull();
      expect(schema!['@type']).toBe('Dataset');
      expect(schema!.name).toBe('Aluminum Dataset');
    });

    it('returns null when validation fails', () => {
      mockValidate.mockReturnValue({ 
        valid: false, 
        reason: 'Missing required data',
        warnings: [] 
      });
      
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/materials/test',
        name: 'Test',
        description: 'Test dataset',
        materialName: 'Test'
      });
      
      expect(schema).toBeNull();
    });

    it('includes @id with dataset fragment', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/materials/steel',
        name: 'Steel Dataset',
        description: 'Steel properties',
        materialName: 'Steel'
      });
      
      expect(schema!['@id']).toBe('https://z-beam.com/materials/steel#dataset');
    });

    it('uses url as identifier when not provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/materials/copper',
        name: 'Copper Dataset',
        description: 'Copper properties',
        materialName: 'Copper'
      });
      
      expect(schema!.identifier).toBe('https://z-beam.com/materials/copper');
    });

    it('uses provided identifier', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/materials/copper',
        name: 'Copper Dataset',
        description: 'Copper properties',
        identifier: 'dataset-copper-001',
        materialName: 'Copper'
      });
      
      expect(schema!.identifier).toBe('dataset-copper-001');
    });

    it('includes default license', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        materialName: 'Test'
      });
      
      expect(schema!.license).toBe('https://creativecommons.org/licenses/by/4.0/');
    });

    it('uses provided license', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        license: 'https://example.com/license',
        materialName: 'Test'
      });
      
      expect(schema!.license).toBe('https://example.com/license');
    });

    it('includes default creator organization', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        materialName: 'Test'
      });
      
      expect(schema!.creator['@type']).toBe('Organization');
      expect(schema!.creator['@id']).toContain('#organization');
    });

    it('uses provided creator', () => {
      const customCreator = {
        '@type': 'Person',
        name: 'John Doe'
      };
      
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        creator: customCreator,
        materialName: 'Test'
      });
      
      expect(schema!.creator.name).toBe('John Doe');
    });

    it('includes keywords as empty array by default', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        materialName: 'Test'
      });
      
      expect(schema!.keywords).toEqual([]);
    });

    it('includes provided keywords', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        keywords: ['laser', 'cleaning', 'metal'],
        materialName: 'Test'
      });
      
      expect(schema!.keywords).toEqual(['laser', 'cleaning', 'metal']);
    });

    it('includes datePublished when provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        datePublished: '2024-01-15',
        materialName: 'Test'
      });
      
      expect(schema!.datePublished).toBe('2024-01-15');
    });

    it('includes dateModified when provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        dateModified: '2024-06-01',
        materialName: 'Test'
      });
      
      expect(schema!.dateModified).toBe('2024-06-01');
    });

    it('includes distribution when provided', () => {
      const distribution = [
        { contentUrl: 'https://example.com/data.json', encodingFormat: 'application/json', name: 'JSON' }
      ];
      
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        distribution,
        materialName: 'Test'
      });
      
      expect(schema!.distribution).toHaveLength(1);
      expect(schema!.distribution[0].encodingFormat).toBe('application/json');
    });

    it('includes spatialCoverage when provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        spatialCoverage: 'Global',
        materialName: 'Test'
      });
      
      expect(schema!.spatialCoverage).toBe('Global');
    });

    it('includes temporalCoverage when provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        temporalCoverage: '2020-2024',
        materialName: 'Test'
      });
      
      expect(schema!.temporalCoverage).toBe('2020-2024');
    });

    it('includes measurementTechnique when provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        measurementTechnique: ['Spectroscopy', 'Calorimetry'],
        materialName: 'Test'
      });
      
      expect(schema!.measurementTechnique).toContain('Spectroscopy');
    });

    it('includes variableMeasured when provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        variableMeasured: ['Temperature', 'Power'],
        materialName: 'Test'
      });
      
      expect(schema!.variableMeasured).toContain('Temperature');
    });

    it('includes isBasedOn when provided with items', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        isBasedOn: [{ '@type': 'Dataset', name: 'Source Dataset' }],
        materialName: 'Test'
      });
      
      expect(schema!.isBasedOn).toHaveLength(1);
    });

    it('omits isBasedOn when empty array', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        isBasedOn: [],
        materialName: 'Test'
      });
      
      expect(schema!.isBasedOn).toBeUndefined();
    });

    it('omits optional fields when not provided', () => {
      const schema = generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        materialName: 'Test'
      });
      
      expect(schema!.datePublished).toBeUndefined();
      expect(schema!.dateModified).toBeUndefined();
      expect(schema!.distribution).toBeUndefined();
      expect(schema!.spatialCoverage).toBeUndefined();
    });

    it('calls validateDatasetForSchema with correct params', () => {
      generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test Dataset',
        description: 'Test',
        materialName: 'Aluminum',
        machineSettings: { wavelength: { value: 1064 } },
        materialProperties: { thermal: {} }
      });
      
      expect(mockValidate).toHaveBeenCalledWith({
        machineSettings: { wavelength: { value: 1064 } },
        materialProperties: { thermal: {} },
        materialName: 'Aluminum'
      });
    });

    it('uses name for materialName when materialName not provided', () => {
      generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Steel Properties',
        description: 'Test'
      });
      
      expect(mockValidate).toHaveBeenCalledWith(
        expect.objectContaining({
          materialName: 'Steel Properties'
        })
      );
    });

    it('logs warnings from validation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockValidate.mockReturnValue({ 
        valid: true, 
        reason: '',
        warnings: ['Low Tier 2 completeness: 45%'] 
      });
      
      generateDatasetSchema({
        url: 'https://z-beam.com/test',
        name: 'Test',
        description: 'Test',
        materialName: 'Test'
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Dataset quality')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('generateDatasetDistributions', () => {
    it('generates three distribution formats', () => {
      const distributions = generateDatasetDistributions({
        baseUrl: 'https://z-beam.com',
        slug: 'aluminum',
        name: 'Aluminum Data'
      });
      
      expect(distributions).toHaveLength(3);
    });

    it('includes JSON format', () => {
      const distributions = generateDatasetDistributions({
        baseUrl: 'https://z-beam.com',
        slug: 'steel',
        name: 'Steel Data'
      });
      
      const json = distributions.find(d => d.encodingFormat === 'application/json');
      expect(json).toBeDefined();
      expect(json!['@type']).toBe('DataDownload');
      expect(json!.contentUrl).toBe('https://z-beam.com/datasets/steel.json');
      expect(json!.name).toBe('Steel Data - JSON Format');
    });

    it('includes CSV format', () => {
      const distributions = generateDatasetDistributions({
        baseUrl: 'https://z-beam.com',
        slug: 'copper',
        name: 'Copper Data'
      });
      
      const csv = distributions.find(d => d.encodingFormat === 'text/csv');
      expect(csv).toBeDefined();
      expect(csv!.contentUrl).toBe('https://z-beam.com/datasets/copper.csv');
      expect(csv!.name).toBe('Copper Data - CSV Format');
    });

    it('includes Text format', () => {
      const distributions = generateDatasetDistributions({
        baseUrl: 'https://z-beam.com',
        slug: 'bronze',
        name: 'Bronze Data'
      });
      
      const text = distributions.find(d => d.encodingFormat === 'text/plain');
      expect(text).toBeDefined();
      expect(text!.contentUrl).toBe('https://z-beam.com/datasets/bronze.txt');
      expect(text!.name).toBe('Bronze Data - Text Format');
    });

    it('handles complex slugs', () => {
      const distributions = generateDatasetDistributions({
        baseUrl: 'https://z-beam.com',
        slug: 'metal/ferrous/carbon-steel',
        name: 'Carbon Steel'
      });
      
      expect(distributions[0].contentUrl).toBe(
        'https://z-beam.com/datasets/metal/ferrous/carbon-steel.json'
      );
    });
  });
});
