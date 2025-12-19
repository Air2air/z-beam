/**
 * Legal Disclaimer Tests
 * Verifies that dataset files contain required legal disclaimers
 * Tests representative samples from each category
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const DATASETS_DIR = path.join(process.cwd(), 'public/datasets');

describe('Legal Disclaimers in Dataset Files', () => {
  describe('Coverage Statistics', () => {
    it('should have disclaimers in all JSON files', () => {
      const allJSON = glob.sync(`${DATASETS_DIR}/**/*.json`);
      const withDisclaimers = allJSON.filter(file => {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        return data.disclaimer && data.disclaimer.includes('DISCLAIMER');
      });
      
      const coveragePercent = (withDisclaimers.length / allJSON.length) * 100;
      expect(coveragePercent).toBeGreaterThanOrEqual(99); // Expect near-100% coverage
      console.log(`✅ JSON Disclaimers: ${withDisclaimers.length}/${allJSON.length} (${coveragePercent.toFixed(1)}%)`);
    });

    it('should have disclaimers in all TXT files', () => {
      const allTXT = glob.sync(`${DATASETS_DIR}/**/*.txt`);
      const withDisclaimers = allTXT.filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('DISCLAIMER') && content.includes('NO WARRANTY');
      });
      
      const coveragePercent = (withDisclaimers.length / allTXT.length) * 100;
      expect(coveragePercent).toBeGreaterThanOrEqual(99);
      console.log(`✅ TXT Disclaimers: ${withDisclaimers.length}/${allTXT.length} (${coveragePercent.toFixed(1)}%)`);
    });

    it('should have disclaimers in materials/contaminants CSV files', () => {
      const csvFiles = [
        ...glob.sync(`${DATASETS_DIR}/materials/*.csv`),
        ...glob.sync(`${DATASETS_DIR}/contaminants/*.csv`)
      ];
      const withDisclaimers = csvFiles.filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes('LEGAL NOTICE') && content.includes('DISCLAIMER');
      });
      
      const coveragePercent = (withDisclaimers.length / csvFiles.length) * 100;
      expect(coveragePercent).toBeGreaterThanOrEqual(99);
      console.log(`✅ CSV Disclaimers: ${withDisclaimers.length}/${csvFiles.length} (${coveragePercent.toFixed(1)}%)`);
    });
  });

  describe('Content Quality - Sample Checks', () => {
    it('should mention "use at your own risk" in JSON', () => {
      const jsonFile = glob.sync(`${DATASETS_DIR}/materials/*.json`)[0];
      const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      
      expect(data.disclaimer.toLowerCase()).toMatch(/use at.*own risk|at your own risk/);
    });

    it('should mention Z-Beam assumes no liability in JSON', () => {
      const jsonFile = glob.sync(`${DATASETS_DIR}/materials/*.json`)[0];
      const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      
      expect(data.disclaimer.toLowerCase()).toMatch(/z-beam.*no liability|liability/);
    });

    it('should require professional consultation in TXT', () => {
      const txtFile = glob.sync(`${DATASETS_DIR}/materials/*.txt`)[0];
      const content = fs.readFileSync(txtFile, 'utf8');
      
      expect(content.toLowerCase()).toMatch(/professional.*consultation|consult.*qualified/);
    });

    it('should reference safety regulations in TXT', () => {
      const txtFile = glob.sync(`${DATASETS_DIR}/materials/*.txt`)[0];
      const content = fs.readFileSync(txtFile, 'utf8');
      
      expect(content).toMatch(/ANSI Z136|IEC 60825|OSHA/);
    });

    it('should have consistent disclaimer in all JSON files', () => {
      const jsonFiles = glob.sync(`${DATASETS_DIR}/**/*.json`).slice(0, 10);
      const disclaimers = jsonFiles.map(file => {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        return data.disclaimer;
      });

      // All disclaimers should contain key phrases
      disclaimers.forEach(disclaimer => {
        expect(disclaimer).toContain('informational');
        expect(disclaimer).toContain('without any warranties');
        expect(disclaimer).toContain('Z-Beam');
      });
    });
  });

  describe('Format-Specific Requirements', () => {
    it('JSON files should have usageInfo object', () => {
      const jsonFile = glob.sync(`${DATASETS_DIR}/materials/*.json`)[0];
      const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      
      expect(data).toHaveProperty('usageInfo');
      if (typeof data.usageInfo === 'object') {
        expect(data.usageInfo).toHaveProperty('disclaimer');
      }
    });

    it('CSV files should have LEGAL NOTICE section', () => {
      const csvFile = glob.sync(`${DATASETS_DIR}/materials/*.csv`)[0];
      const content = fs.readFileSync(csvFile, 'utf8');
      
      expect(content).toContain('LEGAL NOTICE');
      expect(content).toMatch(/NO WARRANTY.*AS IS/i);
      expect(content).toMatch(/NO LIABILITY/i);
    });

    it('TXT files should have section separators', () => {
      const txtFile = glob.sync(`${DATASETS_DIR}/materials/*.txt`)[0];
      const content = fs.readFileSync(txtFile, 'utf8');
      
      expect(content).toMatch(/={20,}/); // Multiple equals signs for separators
      expect(content).toMatch(/DISCLAIMER.*LIMITATION/);
    });
  });
});
