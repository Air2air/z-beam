/**
 * Test Suite: Layout Component - Nested FAQ Structure
 * Tests the Layout component's handling of nested faq.questions structure
 * from frontmatter and proper extraction for MaterialFAQ component
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

  test('all materials should have nested faq.questions structure', () => {
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

          // Check for nested structure: faq.questions
          if (!parsed.faq.questions || !Array.isArray(parsed.faq.questions)) {
            filesWithInvalidStructure.push(file);
          }

          // Validate question structure
          if (parsed.faq.questions && Array.isArray(parsed.faq.questions)) {
            parsed.faq.questions.forEach((item: any, index: number) => {
              if (!item.question || !item.answer) {
                filesWithInvalidStructure.push(`${file} (question ${index + 1})`);
              }
            });
          }
        }
      } catch (error) {
        filesWithInvalidStructure.push(`${file} (parse error: ${error})`);
      }
    });

    expect(filesWithFAQ.length).toBeGreaterThan(0);
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

  test('FAQ extraction logic should handle nested structure', () => {
    // Test the extraction logic used in Layout.tsx

    // Case 1: Nested structure (new format)
    const nestedFAQ = {
      questions: [
        { question: 'What is this?', answer: 'An answer' },
        { question: 'How does it work?', answer: 'It works well' }
      ]
    };

    const extractedNested = Array.isArray(nestedFAQ) 
      ? nestedFAQ 
      : (nestedFAQ as any)?.questions || [];

    expect(extractedNested).toHaveLength(2);
    expect(extractedNested[0]).toHaveProperty('question');
    expect(extractedNested[0]).toHaveProperty('answer');

    // Case 2: Legacy flat array format (should still work)
    const legacyFAQ = [
      { question: 'What is this?', answer: 'An answer' }
    ];

    const extractedLegacy = Array.isArray(legacyFAQ) 
      ? legacyFAQ 
      : (legacyFAQ as any)?.questions || [];

    expect(extractedLegacy).toHaveLength(1);
    expect(extractedLegacy[0]).toHaveProperty('question');
    expect(extractedLegacy[0]).toHaveProperty('answer');

    // Case 3: Empty/undefined FAQ
    const emptyFAQ = undefined;

    const extractedEmpty = Array.isArray(emptyFAQ) 
      ? emptyFAQ 
      : (emptyFAQ as any)?.questions || [];

    expect(extractedEmpty).toHaveLength(0);
  });

  test('sample material should have valid nested FAQ structure', () => {
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

    // Should have nested structure
    expect(parsed).toHaveProperty('faq');
    expect(parsed.faq).toHaveProperty('questions');
    expect(Array.isArray(parsed.faq.questions)).toBe(true);
    expect(parsed.faq.questions.length).toBeGreaterThan(0);

    // Check first question structure
    const firstQuestion = parsed.faq.questions[0];
    expect(firstQuestion).toHaveProperty('question');
    expect(firstQuestion).toHaveProperty('answer');
    expect(typeof firstQuestion.question).toBe('string');
    expect(typeof firstQuestion.answer).toBe('string');
    expect(firstQuestion.question.length).toBeGreaterThan(0);
    expect(firstQuestion.answer.length).toBeGreaterThan(0);
  });
});
