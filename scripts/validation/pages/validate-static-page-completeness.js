#!/usr/bin/env node

/**
 * Static Page Completeness Validator
 * 
 * Ensures that all static pages using createStaticPage have complete configuration
 * across all required locations:
 * 
 * 1. Shared static-page registry entries
 * 2. generatePageSpecificSchema switch cases
 * 3. staticPageLoader.test.ts uses the shared registry keys
 * 4. Actual page route exists in app/
 * 5. page.yaml exists at the registry-defined path
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
const STATIC_PAGE_POLICY_PATH = path.join(ROOT_DIR, 'app/utils/pages/staticPagePolicy.tsx');
const STATIC_PAGE_REGISTRY_PATH = path.join(ROOT_DIR, 'app/utils/pages/staticPageRegistry.json');
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
 * Load shared static-page registry entries
 */
function loadStaticPageRegistry() {
  try {
    const registry = JSON.parse(fs.readFileSync(STATIC_PAGE_REGISTRY_PATH, 'utf8'));
    const keys = Object.keys(registry);

    log(`Found ${keys.length} pages in the shared static-page registry`, 'cyan');
    if (VERBOSE) {
      keys.forEach(key => log(`  - ${key}`, 'reset'));
    }

    return registry;
  } catch (error) {
    log(`❌ Error loading static-page registry: ${error.message}`, 'red', true);
    return {};
  }
}

/**
 * Extract schema cases from generatePageSpecificSchema function
 */
function extractSchemaCases() {
  try {
    const content = fs.readFileSync(STATIC_PAGE_POLICY_PATH, 'utf8');

    const caseMatches = content.matchAll(/case '([\w-]+)':/g);
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
 * Confirm the loader test derives its inventory from the shared registry
 */
function loaderTestUsesSharedRegistry() {
  try {
    const content = fs.readFileSync(TEST_PATH, 'utf8');

    return content.includes('STATIC_PAGE_KEYS');
  } catch (error) {
    log(`❌ Error checking loader test registry usage: ${error.message}`, 'red', true);
    return false;
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
  
  const registry = loadStaticPageRegistry();
  const registryKeys = Object.keys(registry);
  const sharedFactoryKeys = registryKeys.filter(page => registry[page]?.usesSharedFactory);
  const schemaCases = extractSchemaCases();
  const testUsesRegistry = loaderTestUsesSharedRegistry();
  const actualDirectories = findActualPageDirectories();
  
  // Step 2: Build unified page list (union of all sources)
  const allPages = new Set([
    ...registryKeys,
    ...actualDirectories,
  ]);
  
  log(`\n📊 Summary: Found ${allPages.size} unique pages\n`, 'cyan', true);
  
  // Step 3: Validate each page for completeness
  log('🔍 Step 2: Validating completeness for each page...\n', 'blue', true);
  
  const issues = [];
  const warnings = [];
  
  allPages.forEach(page => {
    const pageIssues = [];
    
    const registryEntry = registry[page];

    // Check 1: Registry entry
    if (!registryEntry) {
      pageIssues.push(`❌ Missing shared static-page registry entry`);
    }
    
    // Check 2: Schema case
    if (sharedFactoryKeys.includes(page) && !schemaCases.includes(page)) {
      pageIssues.push(`⚠️  Missing schema case in generatePageSpecificSchema`);
      warnings.push(`${page}: No structured data schema defined`);
    }
    
    // Check 3: Test coverage
    if (!testUsesRegistry) {
      pageIssues.push(`❌ staticPageLoader.test.ts is not deriving page coverage from STATIC_PAGE_KEYS`);
    }
    
    // Check 4: Route exists
    if (page === 'home') {
      const homePagePath = path.join(APP_DIR, 'page.tsx');
      if (!fs.existsSync(homePagePath)) {
        pageIssues.push(`❌ Root app/page.tsx does not exist`);
      }
    } else if (sharedFactoryKeys.includes(page) && !actualDirectories.includes(page)) {
      pageIssues.push(`❌ Directory app/${page}/ does not exist`);
    }
    
    // Check 5: page.yaml exists
    if (registryEntry?.yamlPath && !fs.existsSync(path.join(ROOT_DIR, registryEntry.yamlPath))) {
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
    log('   - Shared registry entries', 'green', true);
    log('   - Schema cases (where applicable)', 'green', true);
    log('   - Loader test coverage from shared registry', 'green', true);
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
  
  log('1. Missing shared registry entry:', 'yellow', true);
  log('   → Add configuration to app/utils/pages/staticPageRegistry.json', 'reset', true);
  log('   → Example:', 'reset', true);
  log('     "mypage": {', 'reset', true);
  log('       "routePath": "/mypage",', 'reset', true);
  log('       "yamlPath": "app/mypage/page.yaml",', 'reset', true);
  log('       "includeInSitemap": true,', 'reset', true);
  log('       "usesSharedFactory": true,', 'reset', true);
  log('       "pageType": "content-cards"', 'reset', true);
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
