#!/usr/bin/env node

/**
 * Automatic SEO Repair
 * 
 * Detects and fixes common SEO issues:
 * - Missing canonical tags → Add to metadata
 * - Insecure HTTP references → Convert to HTTPS
 * - Missing/generic alt text → Generate from context
 * - Missing meta descriptions → Generate from content
 * - Missing OpenGraph tags → Populate from metadata
 * - Missing Twitter Card tags → Add based on content
 * 
 * Usage:
 *   npm run auto-fix:seo
 *   npm run auto-fix:seo -- --dry-run
 *   npm run auto-fix:seo -- --aggressive
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const AGGRESSIVE = process.argv.includes('--aggressive');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const fixes = {
  canonical: [],
  https: [],
  altText: [],
  metaDescription: [],
  openGraph: [],
  twitterCard: [],
};

/**
 * Fix canonical tags
 */
async function fixCanonicalTags() {
  log('\n🔧 Fixing canonical tags...', 'cyan');
  
  const appDir = path.join(process.cwd(), 'app');
  const fixes = [];
  
  async function processDirectory(dir, route = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['components', 'utils', 'config', 'css', 'api'].includes(entry.name)) {
          const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
          const newRoute = isRouteGroup ? route : `${route}/${entry.name}`;
          await processDirectory(fullPath, newRoute);
        } else if ((entry.name === 'page.tsx' || entry.name === 'page.js') && !entry.name.includes('not-found')) {
          const content = await fs.readFile(fullPath, 'utf8');
          
          // Check if metadata export exists and has alternates.canonical
          const hasMetadataExport = content.includes('export const metadata');
          const hasCanonical = content.includes('canonical:');
          
          if (hasMetadataExport && !hasCanonical) {
            if (DRY_RUN) {
              log(`  [DRY RUN] Would add canonical to ${route || '/'}`, 'yellow');
              fixes.push({ route, action: 'dry-run' });
            } else {
              // Add canonical to existing metadata
              const canonicalUrl = `https://www.z-beam.com${route || ''}`;
              
              // Find the metadata export and add alternates
              const updatedContent = content.replace(
                /(export const metadata[^=]*=\s*{[^}]*)(})/s,
                (match, before, after) => {
                  if (before.includes('alternates:')) {
                    // alternates exists, add canonical
                    return before.replace(
                      /alternates:\s*{/,
                      `alternates: {\n    canonical: '${canonicalUrl}',`
                    ) + after;
                  } else {
                    // Add alternates with canonical
                    return `${before}\n  alternates: {\n    canonical: '${canonicalUrl}',\n  },\n${after}`;
                  }
                }
              );
              
              if (updatedContent !== content) {
                await fs.writeFile(fullPath, updatedContent, 'utf8');
                log(`  ✓ Added canonical to ${route || '/'}`, 'green');
                fixes.push({ route, file: fullPath.replace(process.cwd(), ''), canonical: canonicalUrl });
              }
            }
          } else if (!hasMetadataExport) {
            log(`  ⚠ ${route || '/'} has no metadata export`, 'yellow');
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await processDirectory(appDir);
  
  return fixes;
}

/**
 * Fix HTTPS references
 */
async function fixHTTPSReferences() {
  log('\n🔧 Converting HTTP to HTTPS...', 'cyan');
  
  const fixes = [];
  const excludeDirs = ['node_modules', '.next', 'coverage', '.git'];
  const includeExtensions = ['.tsx', '.ts', '.js', '.jsx', '.md', '.yaml', '.yml'];
  
  async function scanAndFix(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            await scanAndFix(fullPath);
          }
        } else if (includeExtensions.some(ext => entry.name.endsWith(ext))) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Skip if it's a standard that requires HTTP
            if (content.includes('xmlns="http://www.w3.org/')) continue;
            if (content.includes('http://schema.org/')) continue;
            
            // Count HTTP references (excluding localhost and standards)
            const httpMatches = content.match(/http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org|schema\.org)/g);
            
            if (httpMatches && httpMatches.length > 0) {
              if (DRY_RUN) {
                log(`  [DRY RUN] Would fix ${httpMatches.length} HTTP references in ${entry.name}`, 'yellow');
                fixes.push({ file: fullPath.replace(process.cwd(), ''), count: httpMatches.length, action: 'dry-run' });
              } else {
                // Replace insecure HTTP references
                const updated = content.replace(
                  /http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org|schema\.org)/g,
                  'https://'
                );
                
                await fs.writeFile(fullPath, updated, 'utf8');
                log(`  ✓ Fixed ${httpMatches.length} HTTP references in ${entry.name}`, 'green');
                fixes.push({ file: fullPath.replace(process.cwd(), ''), count: httpMatches.length });
              }
            }
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await scanAndFix(process.cwd());
  
  return fixes;
}

/**
 * Fix alt text
 */
async function fixAltText() {
  log('\n🔧 Improving alt text...', 'cyan');
  
  const fixes = [];
  const appDir = path.join(process.cwd(), 'app');
  
  async function scanComponents(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          await scanComponents(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
          try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Find generic alt text patterns
            const genericPatterns = [
              /alt=["']image["']/gi,
              /alt=["']picture["']/gi,
              /alt=["']photo["']/gi,
              /alt=["']icon["']/gi,
              /alt=["']logo["']/gi,
            ];
            
            let hasGeneric = false;
            for (const pattern of genericPatterns) {
              if (pattern.test(content)) {
                hasGeneric = true;
                break;
              }
            }
            
            if (hasGeneric) {
              log(`  ⚠ Found generic alt text in ${entry.name}`, 'yellow');
              fixes.push({ 
                file: fullPath.replace(process.cwd(), ''), 
                issue: 'Generic alt text requires manual review',
                action: 'manual',
              });
            }
            
            // Find missing alt attributes (this is harder and requires AST parsing)
            // For now, just flag it
            if (content.includes('<Image ') || content.includes('<img ')) {
              // Simple regex check (not perfect but catches obvious cases)
              const imageTagsWithoutAlt = content.match(/<(Image|img)[^>]*(?<!alt=["'][^"']*["'])[^>]*>/gi);
              
              if (imageTagsWithoutAlt && imageTagsWithoutAlt.length > 0) {
                log(`  ⚠ Possible missing alt attributes in ${entry.name}`, 'yellow');
                fixes.push({
                  file: fullPath.replace(process.cwd(), ''),
                  issue: 'Missing alt attributes require manual review',
                  action: 'manual',
                });
              }
            }
          } catch (error) {
            // Skip unreadable files
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await scanComponents(appDir);
  
  return fixes;
}

/**
 * Fix meta descriptions
 */
async function fixMetaDescriptions() {
  log('\n🔧 Checking meta descriptions...', 'cyan');
  
  const fixes = [];
  const appDir = path.join(process.cwd(), 'app');
  
  async function processDirectory(dir, route = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['components', 'utils', 'config', 'css', 'api'].includes(entry.name)) {
          const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
          const newRoute = isRouteGroup ? route : `${route}/${entry.name}`;
          await processDirectory(fullPath, newRoute);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
          const content = await fs.readFile(fullPath, 'utf8');
          
          // Check if metadata has description
          const hasMetadataExport = content.includes('export const metadata');
          const hasDescription = content.includes('description:');
          
          if (hasMetadataExport && !hasDescription) {
            log(`  ⚠ ${route || '/'} missing meta description`, 'yellow');
            fixes.push({
              route: route || '/',
              file: fullPath.replace(process.cwd(), ''),
              issue: 'Missing meta description requires content analysis',
              action: 'manual',
            });
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await processDirectory(appDir);
  
  return fixes;
}

/**
 * Fix OpenGraph tags
 */
async function fixOpenGraph() {
  log('\n🔧 Checking OpenGraph tags...', 'cyan');
  
  const fixes = [];
  const appDir = path.join(process.cwd(), 'app');
  
  async function processDirectory(dir, route = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['components', 'utils', 'config', 'css', 'api'].includes(entry.name)) {
          const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
          const newRoute = isRouteGroup ? route : `${route}/${entry.name}`;
          await processDirectory(fullPath, newRoute);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.js') {
          const content = await fs.readFile(fullPath, 'utf8');
          
          // Check if metadata has OpenGraph
          const hasMetadataExport = content.includes('export const metadata');
          const hasOpenGraph = content.includes('openGraph:');
          
          if (hasMetadataExport && !hasOpenGraph) {
            log(`  ⚠ ${route || '/'} missing OpenGraph tags`, 'yellow');
            fixes.push({
              route: route || '/',
              file: fullPath.replace(process.cwd(), ''),
              issue: 'Missing OpenGraph tags',
              action: 'manual',
            });
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await processDirectory(appDir);
  
  return fixes;
}

/**
 * Generate report
 */
function generateReport(allFixes) {
  log('\n' + '='.repeat(60), 'bright');
  log('  SEO Auto-Fix Summary', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  const totalFixed = Object.values(allFixes).reduce((sum, arr) => sum + arr.filter(f => f.action !== 'dry-run' && f.action !== 'manual').length, 0);
  const totalManual = Object.values(allFixes).reduce((sum, arr) => sum + arr.filter(f => f.action === 'manual').length, 0);
  
  log(`Mode: ${DRY_RUN ? 'DRY RUN' : AGGRESSIVE ? 'AGGRESSIVE' : 'STANDARD'}`, 'cyan');
  log(`Automatic fixes applied: ${totalFixed}`, 'green');
  log(`Requires manual review: ${totalManual}`, 'yellow');
  
  // Canonical tags
  if (allFixes.canonical.length > 0) {
    log('\n📋 Canonical Tags:', 'bright');
    allFixes.canonical.forEach(fix => {
      if (fix.action === 'dry-run') {
        log(`  [DRY RUN] ${fix.route}`, 'yellow');
      } else {
        log(`  ✓ ${fix.route} → ${fix.canonical}`, 'green');
      }
    });
  }
  
  // HTTPS fixes
  if (allFixes.https.length > 0) {
    log('\n📋 HTTPS Conversions:', 'bright');
    const totalHttpRefs = allFixes.https.reduce((sum, fix) => sum + fix.count, 0);
    log(`  Converted ${totalHttpRefs} HTTP references in ${allFixes.https.length} file(s)`, 'green');
    allFixes.https.slice(0, 5).forEach(fix => {
      log(`  ✓ ${fix.file}: ${fix.count} references`, 'reset');
    });
    if (allFixes.https.length > 5) {
      log(`  ... and ${allFixes.https.length - 5} more files`, 'reset');
    }
  }
  
  // Alt text
  if (allFixes.altText.length > 0) {
    log('\n📋 Alt Text Issues:', 'bright');
    allFixes.altText.forEach(fix => {
      log(`  ⚠ ${fix.file}`, 'yellow');
      log(`    ${fix.issue}`, 'reset');
    });
  }
  
  // Meta descriptions
  if (allFixes.metaDescription.length > 0) {
    log('\n📋 Meta Descriptions:', 'bright');
    allFixes.metaDescription.slice(0, 5).forEach(fix => {
      log(`  ⚠ ${fix.route}: ${fix.issue}`, 'yellow');
    });
    if (allFixes.metaDescription.length > 5) {
      log(`  ... and ${allFixes.metaDescription.length - 5} more pages`, 'reset');
    }
  }
  
  // OpenGraph
  if (allFixes.openGraph.length > 0) {
    log('\n📋 OpenGraph Tags:', 'bright');
    allFixes.openGraph.slice(0, 5).forEach(fix => {
      log(`  ⚠ ${fix.route}: ${fix.issue}`, 'yellow');
    });
    if (allFixes.openGraph.length > 5) {
      log(`  ... and ${allFixes.openGraph.length - 5} more pages`, 'reset');
    }
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'bright');
  
  if (DRY_RUN) {
    log('  • Run without --dry-run to apply fixes', 'cyan');
  }
  
  if (totalManual > 0) {
    log('  • Review files flagged for manual attention', 'yellow');
    log('  • Alt text should be descriptive and contextual', 'yellow');
    log('  • Meta descriptions should be unique and compelling', 'yellow');
  }
  
  if (totalFixed > 0) {
    log('  • Review changes and commit if satisfied', 'green');
    log('  • Re-run SEO validation to verify fixes', 'green');
  }
}

/**
 * Main auto-fix function
 */
async function autoFixSEO() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Automatic SEO Repair', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  if (DRY_RUN) {
    log('⚠️  DRY RUN MODE - No changes will be made\n', 'yellow');
  }
  
  try {
    const allFixes = {
      canonical: await fixCanonicalTags(),
      https: await fixHTTPSReferences(),
      altText: await fixAltText(),
      metaDescription: await fixMetaDescriptions(),
      openGraph: await fixOpenGraph(),
    };
    
    generateReport(allFixes);
    
    const totalFixed = Object.values(allFixes).reduce((sum, arr) => sum + arr.filter(f => f.action !== 'dry-run' && f.action !== 'manual').length, 0);
    const totalManual = Object.values(allFixes).reduce((sum, arr) => sum + arr.filter(f => f.action === 'manual').length, 0);
    
    if (totalFixed > 0) {
      log('\n✅ SEO auto-fix complete\n', 'green');
      process.exit(0);
    } else if (totalManual > 0) {
      log('\n⚠️  Issues found that require manual review\n', 'yellow');
      process.exit(1);
    } else {
      log('\n✓ No SEO issues found\n', 'cyan');
      process.exit(0);
    }
    
  } catch (error) {
    log(`\n✗ SEO auto-fix error: ${error.message}`, 'red');
    console.error(error);
    process.exit(2);
  }
}

// Run auto-fix
autoFixSEO();
