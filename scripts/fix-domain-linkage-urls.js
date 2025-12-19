#!/usr/bin/env node

/**
 * Fix Domain Linkages URLs
 * 
 * Corrects domain_linkages URLs to match actual file slugs:
 * - Adds -contamination suffix to contaminant URLs
 * - Adds -laser-cleaning suffix to materials URLs
 * - Lowercases materials slugs for consistency
 * 
 * Affects: 424 frontmatter files with domain_linkages
 * Expected fixes: 2,887+ URLs (1,824 contaminant + 1,063 materials)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');
const FRONTMATTER_DIR = path.join(__dirname, '..', 'frontmatter');

let filesProcessed = 0;
let urlsFixed = 0;
let contaminantUrlsFixed = 0;
let materialsUrlsFixed = 0;

/**
 * Fix contaminant URLs by adding -contamination suffix
 * /contaminants/{cat}/{subcat}/{slug} → /contaminants/{cat}/{subcat}/{slug}-contamination
 */
function fixContaminantUrl(url) {
  // Only fix if URL doesn't already have the suffix
  if (url.match(/^\/contaminants\/[^\/]+\/[^\/]+\/[^\/]+$/) && !url.endsWith('-contamination')) {
    return url + '-contamination';
  }
  return url;
}

/**
 * Fix materials URLs by adding -laser-cleaning suffix and lowercasing slug
 * /materials/{cat}/{subcat}/{Slug} → /materials/{cat}/{subcat}/{slug}-laser-cleaning
 */
function fixMaterialsUrl(url) {
  // Only fix if URL doesn't already have the suffix
  const match = url.match(/^(\/materials\/[^\/]+\/[^\/]+\/)([^\/]+)$/);
  if (match && !url.endsWith('-laser-cleaning')) {
    const [, path, slug] = match;
    return path + slug.toLowerCase() + '-laser-cleaning';
  }
  return url;
}

/**
 * Process YAML content and fix domain_linkages URLs
 */
function processFileContent(content, filePath) {
  let modified = false;
  let localContaminantFixes = 0;
  let localMaterialsFixes = 0;
  
  // Split into lines to preserve formatting
  const lines = content.split('\n');
  const outputLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a URL line in domain_linkages
    const urlMatch = line.match(/^(\s+url:\s+)(\/(?:contaminants|materials)\/[^\s]+)$/);
    
    if (urlMatch) {
      const [, prefix, originalUrl] = urlMatch;
      let fixedUrl = originalUrl;
      
      // Apply appropriate fix based on URL type
      if (originalUrl.startsWith('/contaminants/')) {
        const newUrl = fixContaminantUrl(originalUrl);
        if (newUrl !== originalUrl) {
          fixedUrl = newUrl;
          localContaminantFixes++;
          modified = true;
        }
      } else if (originalUrl.startsWith('/materials/')) {
        const newUrl = fixMaterialsUrl(originalUrl);
        if (newUrl !== originalUrl) {
          fixedUrl = newUrl;
          localMaterialsFixes++;
          modified = true;
        }
      }
      
      outputLines.push(prefix + fixedUrl);
    } else {
      outputLines.push(line);
    }
  }
  
  if (modified) {
    contaminantUrlsFixed += localContaminantFixes;
    materialsUrlsFixed += localMaterialsFixes;
    urlsFixed += (localContaminantFixes + localMaterialsFixes);
    
    if (DRY_RUN) {
      console.log(`\n📝 ${path.relative(process.cwd(), filePath)}`);
      console.log(`   Contaminant URLs fixed: ${localContaminantFixes}`);
      console.log(`   Materials URLs fixed: ${localMaterialsFixes}`);
    }
  }
  
  return { content: outputLines.join('\n'), modified };
}

/**
 * Process a single YAML file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files without domain_linkages
    if (!content.includes('domain_linkages:')) {
      return;
    }
    
    const { content: newContent, modified } = processFileContent(content, filePath);
    
    if (modified) {
      filesProcessed++;
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning for YAML files with domain_linkages...\n');
  
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  // Find all YAML files in frontmatter directory
  const yamlFiles = glob.sync(path.join(FRONTMATTER_DIR, '**/*.yaml'));
  
  console.log(`Found ${yamlFiles.length} YAML files\n`);
  console.log('🔧 Processing files...\n');
  
  yamlFiles.forEach(processFile);
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Total URLs fixed: ${urlsFixed}`);
  console.log(`  - Contaminant URLs: ${contaminantUrlsFixed}`);
  console.log(`  - Materials URLs: ${materialsUrlsFixed}`);
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ All fixes applied successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review changes: git diff frontmatter/');
    console.log('   2. Test locally: npm run dev');
    console.log('   3. Verify links work on sample pages');
    console.log('   4. Commit: git add frontmatter/ && git commit');
  }
}

// Run the script
main();
