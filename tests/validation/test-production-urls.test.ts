/**
 * Production URL Policy Validation Tests
 * 
 * Ensures no localhost URLs appear in production datasets
 * Policy: docs/08-development/PRODUCTION_URL_POLICY.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const DATASETS_DIR = path.join(process.cwd(), 'public/datasets/materials');
const LOCALHOST_PATTERN = /localhost:3000/;
const PRODUCTION_DOMAIN = 'https://www.z-beam.com';

describe('Production URL Policy', () => {
  describe('Dataset JSON files', () => {
    const jsonFiles = glob.sync(`${DATASETS_DIR}/*.json`);
    
    it('should have dataset JSON files', () => {
      expect(jsonFiles.length).toBeGreaterThan(0);
    });
    
    it('should NOT contain localhost URLs', () => {
      const filesWithLocalhost: string[] = [];
      
      for (const filePath of jsonFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (LOCALHOST_PATTERN.test(content)) {
          filesWithLocalhost.push(path.basename(filePath));
        }
      }
      
      expect(filesWithLocalhost).toEqual([]);
    });
    
    it('should contain production domain URLs', () => {
      // Sample check on first few files
      const sampleFiles = jsonFiles.slice(0, 5);
      
      for (const filePath of sampleFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain(PRODUCTION_DOMAIN);
      }
    });
  });
  
  describe('Dataset CSV files', () => {
    const csvFiles = glob.sync(`${DATASETS_DIR}/*.csv`);
    
    it('should NOT contain localhost URLs in CSV files', () => {
      const filesWithLocalhost: string[] = [];
      
      for (const filePath of csvFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (LOCALHOST_PATTERN.test(content)) {
          filesWithLocalhost.push(path.basename(filePath));
        }
      }
      
      expect(filesWithLocalhost).toEqual([]);
    });
  });
  
  describe('Dataset TXT files', () => {
    const txtFiles = glob.sync(`${DATASETS_DIR}/*.txt`);
    
    it('should NOT contain localhost URLs in TXT files', () => {
      const filesWithLocalhost: string[] = [];
      
      for (const filePath of txtFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (LOCALHOST_PATTERN.test(content)) {
          filesWithLocalhost.push(path.basename(filePath));
        }
      }
      
      expect(filesWithLocalhost).toEqual([]);
    });
  });
  
  describe('JSON-LD Schema URLs', () => {
    it('should have production domain in @id fields', () => {
      const jsonFiles = glob.sync(`${DATASETS_DIR}/*.json`);
      const sampleFile = jsonFiles[0];
      
      if (sampleFile) {
        const content = JSON.parse(fs.readFileSync(sampleFile, 'utf8'));
        expect(content['@id']).toContain(PRODUCTION_DOMAIN);
        expect(content['@id']).not.toContain('localhost');
      }
    });
    
    it('should have production domain in distribution URLs', () => {
      const jsonFiles = glob.sync(`${DATASETS_DIR}/*.json`);
      const sampleFile = jsonFiles[0];
      
      if (sampleFile) {
        const content = JSON.parse(fs.readFileSync(sampleFile, 'utf8'));
        if (content.distribution && Array.isArray(content.distribution)) {
          for (const dist of content.distribution) {
            expect(dist.contentUrl).toContain(PRODUCTION_DOMAIN);
            expect(dist.contentUrl).not.toContain('localhost');
          }
        }
      }
    });
  });
});
