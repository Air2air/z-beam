/**
 * @file scripts/dev/validate-frontmatter-on-startup.ts
 * @purpose Run frontmatter validation during dev server startup
 * @created December 24, 2025
 * 
 * This script runs automatically in development to catch structural issues early.
 * It validates all frontmatter files for proper relationship structure.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { 
  validateMultipleFrontmatter, 
  logValidationSummary,
  logValidationResult 
} from '../../app/utils/frontmatterValidation';

const FRONTMATTER_DIRS = [
  'frontmatter/materials',
  'frontmatter/contaminants',
  'frontmatter/compounds',
  'frontmatter/settings'
];

/**
 * Load all frontmatter files from specified directories
 */
function loadAllFrontmatterFiles(): Record<string, any> {
  const files: Record<string, any> = {};
  const rootDir = process.cwd();

  for (const dir of FRONTMATTER_DIRS) {
    const fullPath = path.join(rootDir, dir);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      continue;
    }

    const yamlFiles = fs.readdirSync(fullPath)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    for (const file of yamlFiles) {
      const filePath = path.join(fullPath, file);
      const relativeKey = `${dir}/${file}`;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(content);
        files[relativeKey] = data;
      } catch (error) {
        console.error(`❌ Failed to parse ${relativeKey}:`, error.message);
      }
    }
  }

  return files;
}

/**
 * Main validation function
 */
export function runStartupValidation(verbose: boolean = false): void {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 FRONTMATTER VALIDATION - DEV SERVER STARTUP');
  console.log('='.repeat(60));

  const startTime = Date.now();
  const files = loadAllFrontmatterFiles();
  const fileCount = Object.keys(files).length;

  console.log(`📂 Loaded ${fileCount} frontmatter files`);
  console.log('⏳ Validating relationship structures...\n');

  const results = validateMultipleFrontmatter(files);

  // Log individual results if verbose or if errors exist
  if (verbose) {
    results.forEach(logValidationResult);
  } else {
    // Only log files with errors (not warnings) in non-verbose mode
    results
      .filter(r => !r.valid)
      .forEach(logValidationResult);
  }

  logValidationSummary(results);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱️  Validation completed in ${elapsed}s\n`);
}

// Run if executed directly
if (require.main === module) {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  runStartupValidation(verbose);
}
