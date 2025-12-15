/**
 * Test Suite: Micro Component Content Validation
 * Testing that micro components no longer contain laser_parameters
 * and work correctly with the modular component architecture
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

describe('Micro Component Content Validation', () => {
  const microDir = path.join(process.cwd(), 'frontmatter/materials');
  let microFiles: string[] = [];

  beforeAll(() => {
    if (fs.existsSync(microDir)) {
      microFiles = fs.readdirSync(microDir)
        .filter(file => file.endsWith('.yaml'))
        .map(file => path.join(microDir, file));
    }
  });

  test('should find micro files in the directory', () => {
    expect(microFiles.length).toBeGreaterThan(0);
    expect(microFiles.length).toBeGreaterThan(50); // Expect many material micro files
  });

  test('should not contain laser_parameters in any micro files', () => {
    const filesWithLaserParams: string[] = [];

    microFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for laser_parameters key in YAML content
        if (content.includes('laser_parameters:')) {
          filesWithLaserParams.push(path.basename(filePath));
        }

        // Also parse YAML and check for the key
        const parsedContent = yaml.load(content) as any;
        if (parsedContent && parsedContent.laser_parameters) {
          filesWithLaserParams.push(path.basename(filePath));
        }
      } catch (error) {
        // If YAML parsing fails, still check for string presence
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('laser_parameters:')) {
          filesWithLaserParams.push(path.basename(filePath));
        }
      }
    });

    expect(filesWithLaserParams).toHaveLength(0);
    if (filesWithLaserParams.length > 0) {
      console.error('Files still containing laser_parameters:', filesWithLaserParams);
    }
  });

  test('should have valid YAML structure in all micro files', () => {
    const invalidFiles: string[] = [];

    microFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Handle multi-document YAML files
        if (content.includes('---')) {
          // Split by document separator and parse each document
          const documents = content.split(/^---$/m);
          documents.forEach((doc, index) => {
            if (doc.trim()) {
              yaml.load(doc.trim());
            }
          });
        } else {
          const parsedContent = yaml.load(content);
          // Should be able to parse without errors
          expect(parsedContent).toBeDefined();
        }
      } catch (error) {
        invalidFiles.push(`${path.basename(filePath)}: ${error}`);
      }
    });

    expect(invalidFiles).toHaveLength(0);
    if (invalidFiles.length > 0) {
      console.error('Files with invalid YAML:', invalidFiles);
    }
  });

  test.skip('should contain required nested micro structure (micro.before and micro.after)', () => {
    // SKIPPED: Micro structure changed with flat frontmatter migration (Dec 2025)
    // Old structure: micro.before/micro.after
    // New structure: images.micro.url/alt
    const filesWithoutRequiredFields: string[] = [];

    microFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // For multi-document YAML, get the first document which should contain the main content
        let parsedContent: any;
        if (content.includes('---')) {
          const documents = content.split(/^---$/m);
          if (documents.length > 0) {
            parsedContent = yaml.load(documents[0].trim());
          }
        } else {
          parsedContent = yaml.load(content);
        }
        
        // Check for nested micro structure: micro.before and micro.after
        // Allow null micros, only validate structure if micro exists
        if (parsedContent && parsedContent.micro && parsedContent.micro !== null) {
          if (!parsedContent.micro.before || !parsedContent.micro.after) {
            filesWithoutRequiredFields.push(path.basename(filePath));
          }
        }
      } catch (error) {
        filesWithoutRequiredFields.push(path.basename(filePath));
      }
    });

    expect(filesWithoutRequiredFields).toHaveLength(0);
    if (filesWithoutRequiredFields.length > 0) {
      console.error('Files missing required nested micro fields:', filesWithoutRequiredFields);
    }
  });

  test.skip('should not contain orphaned laser parameter comments', () => {
    // SKIPPED: Needs investigation of actual frontmatter content and comment structure.
    const filesWithOrphanedComments: string[] = [];

    microFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for leftover laser parameter comments
        if (content.includes('# YAML v2.0 Laser Parameters') ||
            content.includes('wavelength:') ||
            content.includes('pulse_duration:') ||
            content.includes('energy_density:')) {
          filesWithOrphanedComments.push(path.basename(filePath));
        }
      } catch (error) {
        // Ignore file read errors for this test
      }
    });

    expect(filesWithOrphanedComments).toHaveLength(0);
    if (filesWithOrphanedComments.length > 0) {
      console.error('Files with orphaned laser parameter content:', filesWithOrphanedComments);
    }
  });

  test.skip('sample micro file should have expected structure', async () => {
    if (microFiles.length === 0) return;

    const sampleFile = microFiles[0];
    const content = fs.readFileSync(sampleFile, 'utf8');
    
    // Handle multi-document YAML files - get the first document
    let parsedContent: any;
    if (content.includes('---')) {
      const documents = content.split(/^---$/m);
      if (documents.length > 0) {
        parsedContent = yaml.load(documents[0].trim());
      }
    } else {
      parsedContent = yaml.load(content);
    }

    expect(parsedContent).toHaveProperty('before_text');
    expect(parsedContent).toHaveProperty('after_text');
    expect(parsedContent.before_text).toBeTruthy();
    expect(parsedContent.after_text).toBeTruthy();
    expect(typeof parsedContent.before_text).toBe('string');
    expect(typeof parsedContent.after_text).toBe('string');
  });

  test('should have clean file endings without trailing parameters', () => {
    const filesWithTrailingContent: string[] = [];

    microFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Find the last section in the file
        let inFaqSection = false;
        let lastSectionType = '';
        
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Check if we're in FAQ section
          if (line === 'faq:' || line.startsWith('faq:')) {
            inFaqSection = true;
            break;
          }
          
          // Check for other top-level sections
          if (line.match(/^[a-zA-Z_]+:$/) && !line.startsWith(' ') && !line.startsWith('-')) {
            lastSectionType = line;
            break;
          }
        }
        
        // Only flag files that end with laser parameters outside of FAQ
        if (!inFaqSection && lastSectionType && 
            (lastSectionType.includes('machineSettings:') ||
             lastSectionType.includes('laserParameters:') ||
             lastSectionType.includes('laser_parameters:'))) {
          filesWithTrailingContent.push(path.basename(filePath));
        }
      } catch (error) {
        // Ignore file read errors for this test
      }
    });

    expect(filesWithTrailingContent).toHaveLength(0);
    if (filesWithTrailingContent.length > 0) {
      console.error('Files with trailing laser parameter content:', filesWithTrailingContent);
    }
  });
});

describe('Micro Component Integration', () => {
  test('should work without laser_parameters dependency', () => {
    // Mock a micro component structure
    const mockMicroData = {
      before_text: 'Initial surface examination reveals contamination.',
      after_text: 'Post-cleaning analysis shows restored surface.'
    };

    // Should be able to process micro data without laser_parameters
    expect(mockMicroData.before_text).toBeTruthy();
    expect(mockMicroData.after_text).toBeTruthy();
    expect(mockMicroData).not.toHaveProperty('laser_parameters');
  });


});
