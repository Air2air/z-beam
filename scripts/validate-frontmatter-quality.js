#!/usr/bin/env node
/**
 * Frontmatter Quality Validation Script
 * 
 * Validates frontmatter fields against naming conventions and quality standards.
 * Run this before committing new/regenerated frontmatter files.
 * 
 * Usage: node scripts/validate-frontmatter-quality.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

// Naming convention rules
const REQUIRED_CAMELCASE_FIELDS = [
  'fullPath',
  'metaDescription',
  'pageTitle',
  'pageDescription',
  'contentType',
  'schemaVersion',
  'datePublished',
  'dateModified',
  'displayName' // compounds only
];

const FORBIDDEN_SNAKE_CASE_FIELDS = [
  'full_path',
  'meta_description',
  'page_title',
  'page_description',
  'content_type',
  'schema_version',
  'display_name' // compounds only
];

// Quality standards
const META_DESCRIPTION_MIN = 120;
const META_DESCRIPTION_MAX = 155;
const PAGE_TITLE_MIN = 50;
const PAGE_TITLE_MAX = 60;

// AI patterns to avoid in micro content
const AI_PATTERNS = [
  /presents? (?:a )?(?:unique|significant|primary|critical) (?:challenge|opportunity|pitfall)/i,
  /(?:is |are )essential for/i,
  /this (?:property|balance|approach) (?:is |are )(?:critical|essential|vital)/i,
  /it (?:forms?|becomes?|creates?) (?:irregularly )?because/i
];

const results = {
  errors: [],
  warnings: [],
  filesChecked: 0,
  filesWithIssues: 0
};

function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    const relativePath = path.relative(process.cwd(), filePath);
    let hasIssues = false;

    // Check for forbidden snake_case fields
    FORBIDDEN_SNAKE_CASE_FIELDS.forEach(field => {
      if (data[field] !== undefined) {
        results.errors.push(`${relativePath}: Uses forbidden snake_case field "${field}"`);
        hasIssues = true;
      }
    });

    // Check for underscore URLs in breadcrumbs
    if (data.breadcrumb && Array.isArray(data.breadcrumb)) {
      data.breadcrumb.forEach((item, index) => {
        if (item.href && item.href.includes('_')) {
          results.errors.push(`${relativePath}: Breadcrumb[${index}] href contains underscore: ${item.href}`);
          hasIssues = true;
        }
      });
    }

    // Validate metaDescription quality
    if (data.metaDescription) {
      const length = data.metaDescription.length;
      
      if (length < META_DESCRIPTION_MIN) {
        results.warnings.push(`${relativePath}: metaDescription too short (${length} chars, min: ${META_DESCRIPTION_MIN})`);
        hasIssues = true;
      }
      
      if (length > META_DESCRIPTION_MAX) {
        results.warnings.push(`${relativePath}: metaDescription too long (${length} chars, max: ${META_DESCRIPTION_MAX})`);
        hasIssues = true;
      }

      // Check for grammar issues
      if (data.metaDescription.includes('removes oxide removal') || 
          data.metaDescription.includes('removes contamination removal')) {
        results.errors.push(`${relativePath}: metaDescription has grammar error (double "removal")`);
        hasIssues = true;
      }

      // Check for line breaks
      if (data.metaDescription.includes('\n')) {
        results.errors.push(`${relativePath}: metaDescription contains line breaks`);
        hasIssues = true;
      }
    }

    // Validate pageTitle length
    if (data.pageTitle) {
      const length = data.pageTitle.length;
      
      if (length < PAGE_TITLE_MIN) {
        results.warnings.push(`${relativePath}: pageTitle too short (${length} chars, min: ${PAGE_TITLE_MIN})`);
        hasIssues = true;
      }
      
      if (length > PAGE_TITLE_MAX) {
        results.warnings.push(`${relativePath}: pageTitle too long (${length} chars, max: ${PAGE_TITLE_MAX})`);
        hasIssues = true;
      }
    }

    // Check micro content for AI patterns
    if (data.micro) {
      ['before', 'after'].forEach(key => {
        if (data.micro[key]) {
          AI_PATTERNS.forEach((pattern, index) => {
            if (pattern.test(data.micro[key])) {
              results.warnings.push(`${relativePath}: micro.${key} contains AI pattern #${index + 1}`);
              hasIssues = true;
            }
          });
        }
      });
    }

    results.filesChecked++;
    if (hasIssues) {
      results.filesWithIssues++;
    }

  } catch (error) {
    results.errors.push(`${filePath}: Parse error - ${error.message}`);
    results.filesWithIssues++;
  }
}

function main() {
  console.log('🔍 Validating frontmatter quality...\n');

  // Find all YAML files
  const yamlFiles = glob.sync('frontmatter/**/*.yaml', { cwd: process.cwd() });
  const staticPages = glob.sync('static-pages/*.yaml', { cwd: process.cwd() });
  const allFiles = [...yamlFiles, ...staticPages];

  console.log(`Found ${allFiles.length} files to validate\n`);

  allFiles.forEach(validateFile);

  // Print results
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Validation Results');
  console.log('═══════════════════════════════════════════════════════\n');

  if (results.errors.length > 0) {
    console.log('❌ ERRORS:');
    results.errors.forEach(error => console.log(`   ${error}`));
    console.log();
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`   ${warning}`));
    console.log();
  }

  console.log(`Files checked: ${results.filesChecked}`);
  console.log(`Files with issues: ${results.filesWithIssues}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log();

  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('✅ All checks passed!');
    process.exit(0);
  } else if (results.errors.length === 0) {
    console.log('✅ No errors, but warnings present');
    process.exit(0);
  } else {
    console.log('❌ Validation FAILED');
    process.exit(1);
  }
}

main();
