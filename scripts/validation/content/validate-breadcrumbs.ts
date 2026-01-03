#!/usr/bin/env tsx
/**
 * Breadcrumb Validation Script
 * 
 * Validates that all YAML files have explicit breadcrumb arrays.
 * Reports missing or invalid breadcrumbs.
 * 
 * Usage:
 *   npm run validate:breadcrumbs
 *   npm run validate:breadcrumbs -- --fix  # Auto-fix with migration
 */

import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface ValidationResult {
  filePath: string;
  hasExplicitBreadcrumb: boolean;
  breadcrumbCount: number;
  errors: string[];
  category?: string;
  subcategory?: string;
  name?: string;
}

const STATIC_PAGES_DIR = 'static-pages';
const MATERIALS_DIR = 'frontmatter/materials';

/**
 * Validate a single breadcrumb array
 */
function validateBreadcrumb(breadcrumb: any, filePath: string): string[] {
  const errors: string[] = [];
  
  if (!breadcrumb) {
    errors.push('Missing breadcrumb field');
    return errors;
  }
  
  if (!Array.isArray(breadcrumb)) {
    errors.push('Breadcrumb must be an array');
    return errors;
  }
  
  if (breadcrumb.length < 2) {
    errors.push('Breadcrumb must have at least 2 items (Home + current page)');
  }
  
  // First item must be Home
  if (breadcrumb[0]?.label !== 'Home' || breadcrumb[0]?.href !== '/') {
    errors.push('First breadcrumb item must be {label: "Home", href: "/"}');
  }
  
  // Validate each item
  breadcrumb.forEach((item: any, index: number) => {
    if (!item.label || typeof item.label !== 'string') {
      errors.push(`Item ${index}: Missing or invalid label`);
    }
    
    // Last item (current page) can have empty href
    const isLastItem = index === breadcrumb.length - 1;
    
    if (!isLastItem) {
      // Non-final items must have valid href
      if (!item.href || typeof item.href !== 'string') {
        errors.push(`Item ${index}: Missing or invalid href`);
      }
      // href should not end with / except for Home
      if (index > 0 && item.href && item.href.endsWith('/')) {
        errors.push(`Item ${index}: href should not end with / (except Home)`);
      }
      // href should start with /
      if (item.href && !item.href.startsWith('/')) {
        errors.push(`Item ${index}: href must start with /`);
      }
    } else {
      // Last item: href can be empty (current page) or valid path
      if (item.href && typeof item.href === 'string' && item.href !== '') {
        // If present and non-empty, validate it
        if (!item.href.startsWith('/')) {
          errors.push(`Item ${index}: href must start with /`);
        }
        if (item.href.endsWith('/')) {
          errors.push(`Item ${index}: href should not end with /`);
        }
      }
    }
  });
  
  return errors;
}

/**
 * Validate YAML files in a directory
 */
async function validateDirectory(directory: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  if (!fs.existsSync(directory)) {
    console.error(`Directory not found: ${directory}`);
    return results;
  }
  
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    if (!file.endsWith('.yaml')) continue;
    
    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    let data: any;
    try {
      data = yaml.load(content) as any;
    } catch (e) {
      results.push({
        filePath: file,
        hasExplicitBreadcrumb: false,
        breadcrumbCount: 0,
        errors: [`YAML parse error: ${e}`]
      });
      continue;
    }
    
    const result: ValidationResult = {
      filePath: file,
      hasExplicitBreadcrumb: !!data.breadcrumb,
      breadcrumbCount: data.breadcrumb?.length || 0,
      errors: [],
      category: data.category,
      subcategory: data.subcategory,
      name: data.name || data.title
    };
    
    if (data.breadcrumb) {
      result.errors = validateBreadcrumb(data.breadcrumb, file);
    } else {
      result.errors = ['Missing breadcrumb field'];
    }
    
    results.push(result);
  }
  
  return results;
}

/**
 * Print results with color coding
 */
function printResults(title: string, results: ValidationResult[]) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const withBreadcrumbs = results.filter(r => r.hasExplicitBreadcrumb);
  const withoutBreadcrumbs = results.filter(r => !r.hasExplicitBreadcrumb);
  const withErrors = results.filter(r => r.errors.length > 0 && r.hasExplicitBreadcrumb);
  
  console.log(`📊 Summary:`);
  console.log(`   Total files: ${results.length}`);
  console.log(`   ✅ With breadcrumbs: ${withBreadcrumbs.length}`);
  console.log(`   ❌ Without breadcrumbs: ${withoutBreadcrumbs.length}`);
  console.log(`   ⚠️  With errors: ${withErrors.length}`);
  
  // Show files without breadcrumbs
  if (withoutBreadcrumbs.length > 0) {
    console.log(`\n❌ Files Missing Breadcrumbs (${withoutBreadcrumbs.length}):`);
    withoutBreadcrumbs.forEach(r => {
      const extra = r.category ? ` [${r.category}${r.subcategory ? `/${r.subcategory}` : ''}]` : '';
      console.log(`   - ${r.filePath}${extra}`);
    });
  }
  
  // Show files with errors
  if (withErrors.length > 0) {
    console.log(`\n⚠️  Files With Invalid Breadcrumbs (${withErrors.length}):`);
    withErrors.forEach(r => {
      console.log(`\n   ${r.filePath}:`);
      r.errors.forEach(e => console.log(`     - ${e}`));
    });
  }
  
  // Success message
  if (withoutBreadcrumbs.length === 0 && withErrors.length === 0) {
    console.log(`\n✅ All files have valid breadcrumbs!`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Breadcrumb Validation Report');
  console.log(`Generated: ${new Date().toISOString()}\n`);
  
  // Validate static pages
  console.log('Validating static pages...');
  const staticResults = await validateDirectory(STATIC_PAGES_DIR);
  printResults('Static Pages', staticResults);
  
  // Validate materials
  console.log('\nValidating materials...');
  const materialResults = await validateDirectory(MATERIALS_DIR);
  printResults('Material Pages', materialResults);
  
  // Overall summary
  const allResults = [...staticResults, ...materialResults];
  const totalMissing = allResults.filter(r => !r.hasExplicitBreadcrumb).length;
  const totalErrors = allResults.filter(r => r.errors.length > 0).length;
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Overall Summary`);
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Total files checked: ${allResults.length}`);
  console.log(`Files missing breadcrumbs: ${totalMissing}`);
  console.log(`Files with invalid breadcrumbs: ${totalErrors}`);
  
  if (totalMissing > 0 || totalErrors > 0) {
    console.log(`\n❌ Validation FAILED`);
    console.log(`\nTo fix missing breadcrumbs, run:`);
    console.log(`   npm run migrate:breadcrumbs`);
    process.exit(1);
  } else {
    console.log(`\n✅ Validation PASSED - All files have valid breadcrumbs!`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
