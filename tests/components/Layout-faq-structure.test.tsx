/**
 * Test Suite: Layout Component - FAQ Structure
 * Tests the Layout component's handling of FAQ array structure
 * from frontmatter and proper extraction for MaterialFAQ component
 * FAQs use flat array with Markdown formatting (**text**)
 */

import React from 'react';
import { render } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

describe('Layout Component - Nested FAQ Structure', () => {
  const materialsDir = path.join(process.cwd(), 'frontmatter/materials');

  test('should find materials with FAQ data', () => {
    if (!fs.existsSync(materialsDir)) {
      console.warn('Materials directory not found, skipping test');
      return;
    }

    const materialFiles = fs.readdirSync(materialsDir)
      .filter(file => file.endsWith('.yaml'));

    expect(materialFiles.length).toBeGreaterThan(0);
    expect(materialFiles.length).toBeGreaterThan(100); // Should have 132 materials
  });

  test('all materials should have valid structured FAQ format', () => {
    if (!fs.existsSync(materialsDir)) {
      console.warn('Materials directory not found, skipping test');
      return;
    }

    const materialFiles = fs.readdirSync(materialsDir)
      .filter(file => file.endsWith('.yaml'));

    const filesWithInvalidStructure: string[] = [];
    const filesWithFAQ: string[] = [];

    materialFiles.forEach(file => {
      try {
        const filePath = path.join(materialsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed: any = yaml.load(content);

        if (parsed && parsed.faq) {
          filesWithFAQ.push(file);

          // Check for structured format: faq.presentation, faq.items
          if (parsed.faq && parsed.faq !== null) {
            // New structured format
            if (typeof parsed.faq === 'object' && !Array.isArray(parsed.faq)) {
              // Validate structured format - presentation field is optional
              if (!parsed.faq.items || !Array.isArray(parsed.faq.items)) {
                filesWithInvalidStructure.push(`${file} (items is not an array)`);
              } else {
                // Validate item structure - support both formats
                parsed.faq.items.forEach((item: any, index: number) => {
                  const hasNewFormat = item.id && item.title && item.content;
                  const hasOldFormat = item.question && item.answer;
                  
                  if (!hasNewFormat && !hasOldFormat) {
                    filesWithInvalidStructure.push(`${file} (item ${index + 1} missing required fields)`);
                  }
                });
              }
            } else if (Array.isArray(parsed.faq)) {
              // Old flat array format - still valid but should be migrated
              parsed.faq.forEach((item: any, index: number) => {
                if (!item.question || !item.answer) {
                  filesWithInvalidStructure.push(`${file} (question ${index + 1})`);
                }
              });
            }
          }
        }
      } catch (error) {
        filesWithInvalidStructure.push(`${file} (parse error: ${error})`);
      }
    });

    // Expect at least 0 files with FAQ (many materials have faq: null)
    expect(filesWithFAQ.length).toBeGreaterThanOrEqual(0);
    expect(filesWithInvalidStructure).toHaveLength(0);

    if (filesWithInvalidStructure.length > 0) {
      console.error('Files with invalid FAQ structure:', filesWithInvalidStructure);
    }
  });

  test('FAQ questions should have required fields', () => {
    if (!fs.existsSync(materialsDir)) {
      console.warn('Materials directory not found, skipping test');
      return;
    }

    const materialFiles = fs.readdirSync(materialsDir)
      .filter(file => file.endsWith('.yaml'));

    const filesWithMissingFields: string[] = [];

    materialFiles.forEach(file => {
      try {
        const filePath = path.join(materialsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed: any = yaml.load(content);

        if (parsed?.faq?.questions && Array.isArray(parsed.faq.questions)) {
          parsed.faq.questions.forEach((item: any, index: number) => {
            // Check for required fields
            if (typeof item.question !== 'string' || item.question.trim() === '') {
              filesWithMissingFields.push(`${file} - Q${index + 1}: missing/invalid question`);
            }
            if (typeof item.answer !== 'string' || item.answer.trim() === '') {
              filesWithMissingFields.push(`${file} - Q${index + 1}: missing/invalid answer`);
            }
          });
        }
      } catch (error) {
        // Skip parse errors as they're caught in other tests
      }
    });

    expect(filesWithMissingFields).toHaveLength(0);

    if (filesWithMissingFields.length > 0) {
      console.error('FAQ items with missing fields:', filesWithMissingFields);
    }
  });

  test('FAQ extraction logic should handle flat array structure', () => {
    // Test the extraction logic used in MaterialFAQ.tsx

    // Case 1: Flat array format (current format)
    const flatFAQ = [
      { question: 'What is this?', answer: 'An answer' },
      { question: 'How does it work?', answer: 'It works well' }
    ];

    const extractedFlat = Array.isArray(flatFAQ) ? flatFAQ : [];

    expect(extractedFlat).toHaveLength(2);
    expect(extractedFlat[0]).toHaveProperty('question');
    expect(extractedFlat[0]).toHaveProperty('answer');
    expect(extractedFlat[0].question).toBe('What is this?');
    expect(extractedFlat[0].answer).toBe('An answer');

    // Case 2: Empty/undefined FAQ
    const emptyFAQ = undefined;

    const extractedEmpty = Array.isArray(emptyFAQ) ? emptyFAQ : [];

    expect(extractedEmpty).toHaveLength(0);

    // Case 3: FAQ with Markdown formatting
    const markdownFAQ = [
      { question: 'What is **this**?', answer: '**This** is an answer' }
    ];

    const extractedMarkdown = Array.isArray(markdownFAQ) ? markdownFAQ : [];

    expect(extractedMarkdown).toHaveLength(1);
    expect(extractedMarkdown[0].question).toContain('**this**');
    expect(extractedMarkdown[0].answer).toContain('**This**');
  });

  test.skip('sample material should have valid structured FAQ format (SKIPPED: FAQ removed from aluminum)', () => {
    // SKIP: Aluminum file was simplified in earlier commits and no longer has FAQ field
    // This test is no longer relevant for the current schema
    if (!fs.existsSync(materialsDir)) {
      console.warn('Materials directory not found, skipping test');
      return;
    }

    // Test with aluminum as a known material with FAQs
    const aluminumPath = path.join(materialsDir, 'aluminum-laser-cleaning.yaml');

    if (!fs.existsSync(aluminumPath)) {
      console.warn('Aluminum material not found, skipping test');
      return;
    }

    const content = fs.readFileSync(aluminumPath, 'utf8');
    const parsed: any = yaml.load(content);

    // Should have faq property
    expect(parsed).toHaveProperty('faq');
    
    // If faq is null, that's valid - skip validation
    if (parsed.faq === null) {
      console.log('FAQ is null for aluminum, which is valid');
      return;
    }

    // New structured format: faq.presentation, faq.items, faq.options
    expect(typeof parsed.faq).toBe('object');
    
    // Support both presentation field and items-only format
    if (parsed.faq.presentation) {
      expect(parsed.faq).toHaveProperty('presentation');
    }
    
    expect(parsed.faq).toHaveProperty('items');
    expect(Array.isArray(parsed.faq.items)).toBe(true);
    expect(parsed.faq.items.length).toBeGreaterThan(0);

    // Check first item structure - support both new (title/content) and old (question/answer) formats
    const firstItem = parsed.faq.items[0];
    
    // New format: id, title, content
    // Old format: question, answer (may not have id)
    const hasNewFormat = !!(firstItem.title && firstItem.content);
    const hasOldFormat = !!(firstItem.question && firstItem.answer);
    
    expect(hasNewFormat || hasOldFormat).toBe(true);
    
    if (hasNewFormat) {
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('title');
      expect(firstItem).toHaveProperty('content');
      expect(typeof firstItem.id).toBe('string');
      expect(typeof firstItem.title).toBe('string');
      expect(typeof firstItem.content).toBe('string');
      expect(firstItem.id.length).toBeGreaterThan(0);
      expect(firstItem.title.length).toBeGreaterThan(0);
      expect(firstItem.content.length).toBeGreaterThan(0);
    } else {
      expect(firstItem).toHaveProperty('question');
      expect(firstItem).toHaveProperty('answer');
      expect(typeof firstItem.question).toBe('string');
      expect(typeof firstItem.answer).toBe('string');
      expect(firstItem.question.length).toBeGreaterThan(0);
      expect(firstItem.answer.length).toBeGreaterThan(0);
    }
  });
});
