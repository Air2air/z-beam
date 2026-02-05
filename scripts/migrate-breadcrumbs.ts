#!/usr/bin/env tsx
/**
 * Breadcrumb Migration Script
 * 
 * Adds explicit breadcrumb arrays to all YAML files that don't have them.
 * The final breadcrumb item is ALWAYS the pageTitle.
 * 
 * For static pages:
 *   Home -> Page Title
 * 
 * For materials:
 *   Home -> Materials -> Category -> Subcategory -> Page Title
 * 
 * For contaminants:
 *   Home -> Contaminants -> Category -> Subcategory -> Page Title
 * 
 * For compounds:
 *   Home -> Compounds -> Category -> Subcategory -> Page Title
 * 
 * For settings:
 *   Home -> Settings -> Category -> Subcategory -> Page Title
 * 
 * Usage:
 *   npm run migrate:breadcrumbs
 *   npm run migrate:breadcrumbs -- --dry-run  # Preview changes without writing
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { normalizeForUrl } from '../app/utils/urlBuilder';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const STATIC_PAGES_DIR = 'static-pages';
const MATERIALS_DIR = 'frontmatter/materials';
const CONTAMINANTS_DIR = 'frontmatter/contaminants';
const COMPOUNDS_DIR = 'frontmatter/compounds';
const SETTINGS_DIR = 'frontmatter/settings';

/**
 * Generate breadcrumbs for any domain using fullPath and pageTitle
 */
function generateDomainBreadcrumbs(
  pageTitle: string,
  fullPath?: string,
  domain?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  if (fullPath) {
    const pathParts = fullPath.split('/').filter(Boolean);
    
    // Build breadcrumbs from path segments
    for (let i = 0; i < pathParts.length; i++) {
      const segment = pathParts[i];
      const label = segmentToLabel(segment);
      const href = '/' + pathParts.slice(0, i + 1).map(s => normalizeForUrl(s)).join('/');
      
      breadcrumbs.push({ label, href });
    }
    
    // Ensure last breadcrumb has pageTitle
    if (breadcrumbs.length > 1) {
      breadcrumbs[breadcrumbs.length - 1].label = pageTitle;
    }
  } else if (domain) {
    // Fallback for domain-only
    const domainLabel = segmentToLabel(domain);
    breadcrumbs.push({ label: domainLabel, href: `/${normalizeForUrl(domain)}` });
    breadcrumbs.push({ label: pageTitle, href: '' });
  } else {
    // Minimal fallback
    breadcrumbs.push({ label: pageTitle, href: '' });
  }
  
  return breadcrumbs;
}

/**
 * Convert URL segment to display label
 */
function segmentToLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate breadcrumbs for a static page using pageTitle
 */
function generateStaticPageBreadcrumbs(
  pageTitle: string,
  slug: string
): BreadcrumbItem[] {
  if (slug === 'home' || slug === '/') {
    return []; // Home page gets no breadcrumb
  }
  
  return [
    { label: 'Home', href: '/' },
    { label: pageTitle, href: `/${normalizeForUrl(slug)}` }
  ];
}

/**
 * Insert breadcrumb into YAML content after core fields
 */
function insertBreadcrumbIntoYaml(
  content: string,
  breadcrumbs: BreadcrumbItem[]
): string {
  if (breadcrumbs.length === 0) {
    return content; // No breadcrumb for home page
  }
  
  const lines = content.split('\n');
  
  // Find position to insert - after core metadata fields
  // Look for: name, title, slug, category, subcategory, description, subtitle, datePublished, dateModified
  let insertIndex = 0;
  const coreFields = ['name:', 'title:', 'slug:', 'category:', 'subcategory:', 
                      'description:', 'subtitle:', 'datePublished:', 'dateModified:'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (coreFields.some(field => line.startsWith(field))) {
      insertIndex = i + 1;
    }
    // Stop at first non-core field or blank line after core fields
    if (insertIndex > 0 && line && !coreFields.some(field => line.startsWith(field))) {
      break;
    }
  }
  
  // If no core fields found, insert at top
  if (insertIndex === 0) {
    insertIndex = 0;
  }
  
  // Generate breadcrumb YAML
  const breadcrumbYaml = [
    '',
    '# Breadcrumb navigation',
    'breadcrumb:',
    ...breadcrumbs.map(b => `  - label: "${b.label}"\n    href: ${b.href}`)
  ].join('\n');
  
  // Insert breadcrumb
  lines.splice(insertIndex, 0, breadcrumbYaml);
  
  return lines.join('\n');
}

/**
 * Process a single YAML file
 */
function processFile(
  filePath: string,
  domainType: 'materials' | 'contaminants' | 'compounds' | 'settings' | 'static',
  dryRun: boolean
): { processed: boolean; added: boolean; error?: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as any;
    
    // Skip if already has breadcrumb
    if (data.breadcrumb) {
      return { processed: false, added: false };
    }
    
    let breadcrumbs: BreadcrumbItem[] = [];
    
    if (domainType === 'static') {
      // Static page
      const pageTitle = data.pageTitle || data.title || data.name;
      const slug = data.slug || path.basename(filePath, '.yaml');
      
      if (!pageTitle) {
        return {
          processed: false,
          added: false,
          error: 'Missing pageTitle/title field'
        };
      }
      
      breadcrumbs = generateStaticPageBreadcrumbs(pageTitle, slug);
    } else {
      // Domain pages (materials, contaminants, compounds, settings)
      const pageTitle = data.pageTitle;
      const fullPath = data.fullPath;
      
      if (!pageTitle) {
        return {
          processed: false,
          added: false,
          error: 'Missing pageTitle field'
        };
      }
      
      breadcrumbs = generateDomainBreadcrumbs(pageTitle, fullPath, domainType);
    }
    
    // Insert breadcrumb into YAML content
    const updatedContent = insertBreadcrumbIntoYaml(content, breadcrumbs);
    
    if (!dryRun) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
    
    return { processed: true, added: true };
  } catch (error) {
    return {
      processed: false,
      added: false,
      error: String(error)
    };
  }
}

/**
 * Process all files in a directory
 */
function processDirectory(
  directory: string,
  domainType: 'materials' | 'contaminants' | 'compounds' | 'settings' | 'static',
  dryRun: boolean
): { total: number; added: number; errors: string[] } {
  const results = { total: 0, added: 0, errors: [] as string[] };
  
  if (!fs.existsSync(directory)) {
    results.errors.push(`Directory not found: ${directory}`);
    return results;
  }
  
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.yaml'));
  results.total = files.length;
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const result = processFile(filePath, domainType, dryRun);
    
    if (result.added) {
      results.added++;
      console.log(`  ✅ ${file}`);
    } else if (result.error) {
      results.errors.push(`${file}: ${result.error}`);
      console.log(`  ❌ ${file} - ${result.error}`);
    } else {
      console.log(`  ⏭️  ${file} - Already has breadcrumb`);
    }
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('🔧 Breadcrumb Migration Script');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be updated)'}\n`);
  
  const allResults = {
    static: { total: 0, added: 0, errors: [] as string[] },
    materials: { total: 0, added: 0, errors: [] as string[] },
    contaminants: { total: 0, added: 0, errors: [] as string[] },
    compounds: { total: 0, added: 0, errors: [] as string[] },
    settings: { total: 0, added: 0, errors: [] as string[] }
  };
  
  // Process static pages
  console.log('Processing static pages...');
  allResults.static = processDirectory(STATIC_PAGES_DIR, 'static', dryRun);
  
  // Process materials
  console.log('\nProcessing materials...');
  allResults.materials = processDirectory(MATERIALS_DIR, 'materials', dryRun);
  
  // Process contaminants
  console.log('\nProcessing contaminants...');
  allResults.contaminants = processDirectory(CONTAMINANTS_DIR, 'contaminants', dryRun);
  
  // Process compounds
  console.log('\nProcessing compounds...');
  allResults.compounds = processDirectory(COMPOUNDS_DIR, 'compounds', dryRun);
  
  // Process settings
  console.log('\nProcessing settings...');
  allResults.settings = processDirectory(SETTINGS_DIR, 'settings', dryRun);
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('Migration Summary');
  console.log(`${'='.repeat(80)}\n`);
  
  const domains = ['static', 'materials', 'contaminants', 'compounds', 'settings'] as const;
  
  for (const domain of domains) {
    const results = allResults[domain];
    const domainName = domain === 'static' ? 'Static Pages' : domain.charAt(0).toUpperCase() + domain.slice(1);
    
    console.log(`${domainName}:`);
    console.log(`  Total: ${results.total}`);
    console.log(`  Added breadcrumbs: ${results.added}`);
    console.log(`  Errors: ${results.errors.length}`);
    console.log();
  }
  
  const totalFiles = domains.reduce((sum, domain) => sum + allResults[domain].total, 0);
  const totalAdded = domains.reduce((sum, domain) => sum + allResults[domain].added, 0);
  const totalErrors = domains.reduce((sum, domain) => sum + allResults[domain].errors.length, 0);
  
  console.log(`Overall:`);
  console.log(`  Total files processed: ${totalFiles}`);
  console.log(`  Breadcrumbs added: ${totalAdded}`);
  console.log(`  Errors: ${totalErrors}`);
  
  if (totalErrors > 0) {
    console.log(`\n❌ Errors encountered:`);
    domains.forEach(domain => {
      allResults[domain].errors.forEach(e => console.log(`  - ${domain}: ${e}`));
    });
  }
  
  if (dryRun && totalAdded > 0) {
    console.log(`\n⚠️  This was a DRY RUN. To apply changes, run:`);
    console.log(`   npm run migrate:breadcrumbs`);
  } else if (totalAdded > 0) {
    console.log(`\n✅ Migration complete! ${totalAdded} files updated.`);
    console.log(`\nNext steps:`);
    console.log(`  1. Run: npm run validate:breadcrumbs`);
    console.log(`  2. Review changes: git diff`);
    console.log(`  3. Rebuild: npm run build`);
  } else {
    console.log(`\n✅ All files already have breadcrumbs!`);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
