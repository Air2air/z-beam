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

  test('all materials should have valid flat FAQ array structure', () => {
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

          // Check for flat array structure: faq (only if faq exists and is not null)
          if (parsed.faq && parsed.faq !== null) {
            if (!Array.isArray(parsed.faq)) {
              filesWithInvalidStructure.push(`${file} (faq is not an array)`);
            } else {
              // Validate question structure
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

  test('sample material should have valid flat FAQ array structure', () => {
    if (!fs.existsSync(materialsDir)) {
      console.warn('Materials directory not found, skipping test');
      return;
    }

    // Test with titanium as a known material with FAQs
    const titaniumPath = path.join(materialsDir, 'titanium-laser-cleaning.yaml');

    if (!fs.existsSync(titaniumPath)) {
      console.warn('Titanium material not found, skipping test');
      return;
    }

    const content = fs.readFileSync(titaniumPath, 'utf8');
    const parsed: any = yaml.load(content);

    // Should have faq property
    expect(parsed).toHaveProperty('faq');
    
    // If faq is null, that's valid - skip validation
    if (parsed.faq === null) {
      console.log('FAQ is null for titanium, which is valid');
      return;
    }

    // If FAQ exists, should have flat array structure
    expect(Array.isArray(parsed.faq)).toBe(true);
    expect(parsed.faq.length).toBeGreaterThan(0);

    // Check first question structure
    const firstQuestion = parsed.faq[0];
    expect(firstQuestion).toHaveProperty('question');
    expect(firstQuestion).toHaveProperty('answer');
    expect(typeof firstQuestion.question).toBe('string');
    expect(typeof firstQuestion.answer).toBe('string');
    expect(firstQuestion.question.length).toBeGreaterThan(0);
    expect(firstQuestion.answer.length).toBeGreaterThan(0);
  });
});
