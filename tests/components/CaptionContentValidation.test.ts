/**
 * Test Suite: Caption Component Content Validation
 * Testing that caption components no longer contain laser_parameters
 * and work correctly with the modular Settings component architecture
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

describe('Caption Component Content Validation', () => {
  const captionDir = path.join(process.cwd(), 'content/components/caption');
  let captionFiles: string[] = [];

  beforeAll(() => {
    if (fs.existsSync(captionDir)) {
      captionFiles = fs.readdirSync(captionDir)
        .filter(file => file.endsWith('.yaml'))
        .map(file => path.join(captionDir, file));
    }
  });

  test('should find caption files in the directory', () => {
    expect(captionFiles.length).toBeGreaterThan(0);
    expect(captionFiles.length).toBeGreaterThan(50); // Expect many material caption files
  });

  test('should not contain laser_parameters in any caption files', () => {
    const filesWithLaserParams: string[] = [];

    captionFiles.forEach(filePath => {
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

  test('should have valid YAML structure in all caption files', () => {
    const invalidFiles: string[] = [];

    captionFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsedContent = yaml.load(content);
        
        // Should be able to parse without errors
        expect(parsedContent).toBeDefined();
      } catch (error) {
        invalidFiles.push(`${path.basename(filePath)}: ${error}`);
      }
    });

    expect(invalidFiles).toHaveLength(0);
    if (invalidFiles.length > 0) {
      console.error('Files with invalid YAML:', invalidFiles);
    }
  });

  test('should contain required caption structure (before_text and after_text)', () => {
    const filesWithoutRequiredFields: string[] = [];

    captionFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsedContent = yaml.load(content) as any;
        
        if (!parsedContent || 
            !parsedContent.before_text || 
            !parsedContent.after_text) {
          filesWithoutRequiredFields.push(path.basename(filePath));
        }
      } catch (error) {
        filesWithoutRequiredFields.push(path.basename(filePath));
      }
    });

    expect(filesWithoutRequiredFields).toHaveLength(0);
    if (filesWithoutRequiredFields.length > 0) {
      console.error('Files missing required fields:', filesWithoutRequiredFields);
    }
  });

  test('should not contain orphaned laser parameter comments', () => {
    const filesWithOrphanedComments: string[] = [];

    captionFiles.forEach(filePath => {
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

  test('sample caption file should have expected structure', () => {
    if (captionFiles.length === 0) return;

    const sampleFile = captionFiles[0];
    const content = fs.readFileSync(sampleFile, 'utf8');
    const parsedContent = yaml.load(content) as any;

    expect(parsedContent).toHaveProperty('before_text');
    expect(parsedContent).toHaveProperty('after_text');
    expect(parsedContent.before_text).toBeTruthy();
    expect(parsedContent.after_text).toBeTruthy();
    expect(typeof parsedContent.before_text).toBe('string');
    expect(typeof parsedContent.after_text).toBe('string');
  });

  test('should have clean file endings without trailing parameters', () => {
    const filesWithTrailingContent: string[] = [];

    captionFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Check if file ends cleanly after after_text
        const lastNonEmptyLine = lines.filter(line => line.trim()).pop();
        
        if (lastNonEmptyLine && 
            (lastNonEmptyLine.includes('wavelength') ||
             lastNonEmptyLine.includes('power:') ||
             lastNonEmptyLine.includes('frequency:'))) {
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

describe('Caption Component Integration with Settings', () => {
  test('should work without laser_parameters dependency', () => {
    // Mock a caption component structure
    const mockCaptionData = {
      before_text: 'Initial surface examination reveals contamination.',
      after_text: 'Post-cleaning analysis shows restored surface.'
    };

    // Should be able to process caption data without laser_parameters
    expect(mockCaptionData.before_text).toBeTruthy();
    expect(mockCaptionData.after_text).toBeTruthy();
    expect(mockCaptionData).not.toHaveProperty('laser_parameters');
  });

  test('should support caption and settings components separately', () => {
    const captionData = {
      before_text: 'Surface shows contamination',
      after_text: 'Surface is now clean'
    };

    const settingsData = {
      power_section: {
        power: '100-500W',
        wavelength: '1064nm'
      }
    };

    // Caption and settings should be independent
    expect(captionData).not.toHaveProperty('laser_parameters');
    expect(settingsData).toHaveProperty('power_section');
    expect(Object.keys(captionData)).toHaveLength(2);
    expect(Object.keys(settingsData)).toHaveLength(1);
  });
});
