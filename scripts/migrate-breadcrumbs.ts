#!/usr/bin/env tsx
/**
 * Breadcrumb Migration Script
 * 
 * Adds explicit breadcrumb arrays to all YAML files that don't have them.
 * 
 * For static pages:
 *   Home -> Page
 * 
 * For materials:
 *   Home -> Materials -> Category -> Subcategory -> Material
 * 
 * Usage:
 *   npm run migrate:breadcrumbs
 *   npm run migrate:breadcrumbs -- --dry-run  # Preview changes without writing
 */

import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const STATIC_PAGES_DIR = 'static-pages';
const MATERIALS_DIR = 'frontmatter/materials';

/**
 * Generate breadcrumbs for a material
 */
function generateMaterialBreadcrumbs(
  name: string,
  category: string,
  subcategory: string,
  slug?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Materials', href: '/materials' }
  ];
  
  // Capitalize category for display
  const categoryLabel = category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  breadcrumbs.push({
    label: categoryLabel,
    href: `/materials/${categorySlug}`
  });
  
  // Add subcategory if present
  if (subcategory) {
    const subcategoryLabel = subcategory
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    const subcategorySlug = subcategory.toLowerCase().replace(/\s+/g, '-');
    breadcrumbs.push({
      label: subcategoryLabel,
      href: `/materials/${categorySlug}/${subcategorySlug}`
    });
  }
  
  // Add material itself
  const materialSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
  breadcrumbs.push({
    label: name,
    href: subcategory
      ? `/materials/${categorySlug}/${subcategory.toLowerCase().replace(/\s+/g, '-')}/${materialSlug}`
      : `/materials/${categorySlug}/${materialSlug}`
  });
  
  return breadcrumbs;
}

/**
 * Generate breadcrumbs for a static page
 */
function generateStaticPageBreadcrumbs(
  title: string,
  slug: string
): BreadcrumbItem[] {
  // Home page gets no breadcrumb (it IS the breadcrumb root)
  if (slug === 'home' || slug === '/') {
    return [];
  }
  
  return [
    { label: 'Home', href: '/' },
    { label: title, href: `/${slug}` }
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
  isMaterial: boolean,
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
    
    if (isMaterial) {
      // Material file
      const { name, category, subcategory, slug } = data;
      
      if (!name || !category) {
        return {
          processed: false,
          added: false,
          error: 'Missing required fields (name, category)'
        };
      }
      
      breadcrumbs = generateMaterialBreadcrumbs(name, category, subcategory, slug);
    } else {
      // Static page
      const title = data.title || data.name;
      const slug = data.slug || path.basename(filePath, '.yaml');
      
      if (!title) {
        return {
          processed: false,
          added: false,
          error: 'Missing title field'
        };
      }
      
      breadcrumbs = generateStaticPageBreadcrumbs(title, slug);
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
  isMaterial: boolean,
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
    const result = processFile(filePath, isMaterial, dryRun);
    
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
  
  // Process static pages
  console.log('Processing static pages...');
  const staticResults = processDirectory(STATIC_PAGES_DIR, false, dryRun);
  
  console.log('\nProcessing materials...');
  const materialResults = processDirectory(MATERIALS_DIR, true, dryRun);
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('Migration Summary');
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`Static Pages:`);
  console.log(`  Total: ${staticResults.total}`);
  console.log(`  Added breadcrumbs: ${staticResults.added}`);
  console.log(`  Errors: ${staticResults.errors.length}`);
  
  console.log(`\nMaterials:`);
  console.log(`  Total: ${materialResults.total}`);
  console.log(`  Added breadcrumbs: ${materialResults.added}`);
  console.log(`  Errors: ${materialResults.errors.length}`);
  
  const totalAdded = staticResults.added + materialResults.added;
  const totalErrors = staticResults.errors.length + materialResults.errors.length;
  
  console.log(`\nOverall:`);
  console.log(`  Total files processed: ${staticResults.total + materialResults.total}`);
  console.log(`  Breadcrumbs added: ${totalAdded}`);
  console.log(`  Errors: ${totalErrors}`);
  
  if (totalErrors > 0) {
    console.log(`\n❌ Errors encountered:`);
    [...staticResults.errors, ...materialResults.errors].forEach(e => console.log(`  - ${e}`));
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
