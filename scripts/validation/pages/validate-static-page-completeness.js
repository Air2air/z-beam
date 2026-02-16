#!/usr/bin/env node

/**
 * Static Page Completeness Validator
 * 
 * Ensures that all static pages using createStaticPage have complete configuration
 * across all required locations:
 * 
 * 1. PAGE_CONFIGS in createStaticPage.tsx
 * 2. generatePageSpecificSchema switch cases
 * 3. staticPageLoader.test.ts pageDirectories array
 * 4. Actual page directory exists in app/
 * 5. page.yaml exists with required frontmatter
 * 
 * This prevents gaps like:
 * - Missing test coverage
 * - Missing structured data schemas
 * - Missing SEO configuration
 * - Incomplete documentation
 * 
 * Usage:
 *   npm run validate:static-pages
 *   node scripts/validation/pages/validate-static-page-completeness.js
 *   node scripts/validation/pages/validate-static-page-completeness.js --verbose
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Critical issues found (missing configs, tests, schemas)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const VERBOSE = process.argv.includes('--verbose');

// File paths
const ROOT_DIR = path.resolve(__dirname, '../../..');
const CREATE_STATIC_PAGE_PATH = path.join(ROOT_DIR, 'app/utils/pages/createStaticPage.tsx');
const TEST_PATH = path.join(ROOT_DIR, 'tests/utils/staticPageLoader.test.ts');
const APP_DIR = path.join(ROOT_DIR, 'app');

/**
 * Log with color and optional verbose mode
 */
function log(message, color = 'reset', forceShow = true) {
  if (forceShow || VERBOSE) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

/**
 * Extract PAGE_CONFIGS keys from createStaticPage.tsx
 */
function extractPageConfigsKeys() {
  try {
    const content = fs.readFileSync(CREATE_STATIC_PAGE_PATH, 'utf8');
    
    // Find PAGE_CONFIGS object and extract keys
    const pageConfigsMatch = content.match(/const PAGE_CONFIGS = \{([\s\S]*?)\n\};/);
    if (!pageConfigsMatch) {
      throw new Error('Could not find PAGE_CONFIGS object');
    }
    
    const configContent = pageConfigsMatch[1];
    const keyMatches = configContent.matchAll(/^\s*(\w+):\s*\{/gm);
    const keys = Array.from(keyMatches, match => match[1]);
    
    log(`Found ${keys.length} pages in PAGE_CONFIGS`, 'cyan');
    if (VERBOSE) {
      keys.forEach(key => log(`  - ${key}`, 'reset'));
    }
    
    return keys;
  } catch (error) {
    log(`❌ Error extracting PAGE_CONFIGS: ${error.message}`, 'red', true);
    return [];
  }
}

/**
 * Extract schema cases from generatePageSpecificSchema function
 */
function extractSchemaCases() {
  try {
    const content = fs.readFileSync(CREATE_STATIC_PAGE_PATH, 'utf8');
    
    // Find generatePageSpecificSchema function and extract switch cases
    const schemaFunctionMatch = content.match(/function generatePageSpecificSchema[\s\S]*?switch \(pageType\) \{([\s\S]*?)\n\s*\}/);
    if (!schemaFunctionMatch) {
      throw new Error('Could not find generatePageSpecificSchema switch statement');
    }
    
    const switchContent = schemaFunctionMatch[1];
    const caseMatches = switchContent.matchAll(/case '(\w+)':/g);
    const cases = Array.from(caseMatches, match => match[1]);
    
    log(`Found ${cases.length} schema cases in generatePageSpecificSchema`, 'cyan');
    if (VERBOSE) {
      cases.forEach(caseKey => log(`  - ${caseKey}`, 'reset'));
    }
    
    return cases;
  } catch (error) {
    log(`❌ Error extracting schema cases: ${error.message}`, 'red', true);
    return [];
  }
}

/**
 * Extract page directories from staticPageLoader.test.ts
 */
function extractTestPageDirectories() {
  try {
    const content = fs.readFileSync(TEST_PATH, 'utf8');
    
    // Find pageDirectories array
    const arrayMatch = content.match(/const pageDirectories(?::\s*string\[\])?\s*=\s*\[([\s\S]*?)\];/);
    if (!arrayMatch) {
      throw new Error('Could not find pageDirectories array');
    }
    
    const arrayContent = arrayMatch[1];
    const dirMatches = arrayContent.matchAll(/'(\w+)'/g);
    const directories = Array.from(dirMatches, match => match[1]);
    
    log(`Found ${directories.length} pages in test pageDirectories`, 'cyan');
    if (VERBOSE) {
      directories.forEach(dir => log(`  - ${dir}`, 'reset'));
    }
    
    return directories;
  } catch (error) {
    log(`❌ Error extracting test directories: ${error.message}`, 'red', true);
    return [];
  }
}

/**
 * Find actual page directories in app/ that use createStaticPage
 */
function findActualPageDirectories() {
  try {
    const directories = fs.readdirSync(APP_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => {
        // Exclude system directories
        if (['components', 'utils', 'config', 'api', 'data', 'css', 'favicon'].includes(name)) {
          return false;
        }
        
        // Check if directory has page.tsx that uses createStaticPage
        const pagePath = path.join(APP_DIR, name, 'page.tsx');
        if (!fs.existsSync(pagePath)) {
          return false;
        }
        
        const pageContent = fs.readFileSync(pagePath, 'utf8');
        return pageContent.includes('createStaticPage');
      });
    
    log(`Found ${directories.length} actual page directories using createStaticPage`, 'cyan');
    if (VERBOSE) {
      directories.forEach(dir => log(`  - ${dir}`, 'reset'));
    }
    
    return directories;
  } catch (error) {
    log(`❌ Error finding actual directories: ${error.message}`, 'red', true);
    return [];
  }
}

/**
 * Check if page directory has page.yaml
 */
function checkPageYamlExists(pageDir) {
  const yamlPath = path.join(APP_DIR, pageDir, 'page.yaml');
  return fs.existsSync(yamlPath);
}

/**
 * Main validation logic
 */
function validateStaticPageCompleteness() {
  log('\n' + '='.repeat(80), 'bold', true);
  log('STATIC PAGE COMPLETENESS VALIDATION', 'bold', true);
  log('='.repeat(80) + '\n', 'bold', true);
  
  // Step 1: Extract all page identifiers from different sources
  log('📋 Step 1: Extracting page configurations...\n', 'blue', true);
  
  const configKeys = extractPageConfigsKeys();
  const schemaCases = extractSchemaCases();
  const testDirectories = extractTestPageDirectories();
  const actualDirectories = findActualPageDirectories();
  
  // Step 2: Build unified page list (union of all sources)
  const allPages = new Set([
    ...configKeys,
    ...actualDirectories
  ]);
  
  log(`\n📊 Summary: Found ${allPages.size} unique pages\n`, 'cyan', true);
  
  // Step 3: Validate each page for completeness
  log('🔍 Step 2: Validating completeness for each page...\n', 'blue', true);
  
  const issues = [];
  const warnings = [];
  
  allPages.forEach(page => {
    const pageIssues = [];
    
    // Check 1: PAGE_CONFIGS entry
    if (!configKeys.includes(page)) {
      pageIssues.push(`❌ Missing PAGE_CONFIGS entry in createStaticPage.tsx`);
    }
    
    // Check 2: Schema case
    if (!schemaCases.includes(page)) {
      pageIssues.push(`⚠️  Missing schema case in generatePageSpecificSchema`);
      warnings.push(`${page}: No structured data schema defined`);
    }
    
    // Check 3: Test coverage
    if (!testDirectories.includes(page)) {
      pageIssues.push(`❌ Missing from staticPageLoader.test.ts pageDirectories`);
    }
    
    // Check 4: Directory exists
    if (!actualDirectories.includes(page)) {
      pageIssues.push(`❌ Directory app/${page}/ does not exist`);
    }
    
    // Check 5: page.yaml exists
    if (actualDirectories.includes(page) && !checkPageYamlExists(page)) {
      pageIssues.push(`❌ Missing page.yaml configuration file`);
    }
    
    // Report page status
    if (pageIssues.length > 0) {
      log(`\n/${page}`, 'yellow', true);
      pageIssues.forEach(issue => {
        log(`  ${issue}`, 'reset', true);
        if (issue.startsWith('❌')) {
          issues.push(`${page}: ${issue.substring(2)}`);
        }
      });
    } else {
      log(`✅ /${page} - All checks passed`, 'green');
    }
  });
  
  // Step 4: Report summary
  log('\n' + '='.repeat(80), 'bold', true);
  log('VALIDATION SUMMARY', 'bold', true);
  log('='.repeat(80) + '\n', 'bold', true);
  
  log(`Total pages validated: ${allPages.size}`, 'cyan', true);
  log(`Critical issues: ${issues.length}`, issues.length > 0 ? 'red' : 'green', true);
  log(`Warnings: ${warnings.length}`, warnings.length > 0 ? 'yellow' : 'green', true);
  
  if (issues.length > 0) {
    log('\n⚠️  CRITICAL ISSUES FOUND:', 'red', true);
    issues.forEach(issue => log(`  • ${issue}`, 'red', true));
  }
  
  if (warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow', true);
    warnings.forEach(warning => log(`  • ${warning}`, 'yellow', true));
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    log('\n✅ All static pages have complete configuration!', 'green', true);
    log('   - PAGE_CONFIGS entries', 'green', true);
    log('   - Schema cases (where applicable)', 'green', true);
    log('   - Test coverage', 'green', true);
    log('   - Directory structure', 'green', true);
    log('   - YAML configuration', 'green', true);
  }
  
  log('\n' + '='.repeat(80) + '\n', 'bold', true);
  
  // Return exit code
  return issues.length > 0 ? 1 : 0;
}

/**
 * Provide guidance for fixing issues
 */
function printFixingGuidance() {
  log('\n📖 HOW TO FIX ISSUES:\n', 'cyan', true);
  
  log('1. Missing PAGE_CONFIGS entry:', 'yellow', true);
  log('   → Add configuration to PAGE_CONFIGS in app/utils/pages/createStaticPage.tsx', 'reset', true);
  log('   → Example:', 'reset', true);
  log('     mypage: {', 'reset', true);
  log('       pageType: \'content-cards\' as PageArchitecture,', 'reset', true);
  log('       robotsIndex: true', 'reset', true);
  log('     }', 'reset', true);
  
  log('\n2. Missing schema case:', 'yellow', true);
  log('   → Add case to generatePageSpecificSchema switch in createStaticPage.tsx', 'reset', true);
  log('   → Example:', 'reset', true);
  log('     case \'mypage\':', 'reset', true);
  log('       return {', 'reset', true);
  log('         \'@context\': \'https://schema.org\',', 'reset', true);
  log('         \'@type\': \'WebPage\',', 'reset', true);
  log('         name: frontmatter.pageTitle', 'reset', true);
  log('       };', 'reset', true);
  
  log('\n3. Missing test coverage:', 'yellow', true);
  log('   → Add page to pageDirectories array in tests/utils/staticPageLoader.test.ts', 'reset', true);
  log('   → Example: const pageDirectories = [..., \'mypage\'];', 'reset', true);
  
  log('\n4. Missing directory or page.yaml:', 'yellow', true);
  log('   → Create app/mypage/ directory', 'reset', true);
  log('   → Create page.tsx with: export const { generateMetadata, default: Page } = createStaticPage(\'mypage\');', 'reset', true);
  log('   → Create page.yaml with pageTitle, pageDescription, breadcrumbs, sections', 'reset', true);
  
  log('\n📚 See also:', 'cyan', true);
  log('   → docs/08-development/ADDING_NEW_STATIC_PAGES.md (to be created)', 'reset', true);
  log('   → COMPARISON_PAGE_YAML_MIGRATION_FEB14_2026.md (example migration)', 'reset', true);
  log('\n', 'reset', true);
}

// Run validation
try {
  const exitCode = validateStaticPageCompleteness();
  
  if (exitCode !== 0) {
    printFixingGuidance();
  }
  
  process.exit(exitCode);
} catch (error) {
  log(`\n❌ Fatal error: ${error.message}`, 'red', true);
  log(error.stack, 'red', true);
  process.exit(1);
}
