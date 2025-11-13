#!/usr/bin/env node
/**
 * @script update-frontmatter-dates.js
 * @purpose Update datePublished and dateModified in frontmatter YAML files based on Git history
 * @usage node scripts/update-frontmatter-dates.js [--dry-run] [--file=path/to/file.yaml]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const fileArg = args.find(arg => arg.startsWith('--file='));
const targetFile = fileArg ? fileArg.split('=')[1] : null;

/**
 * Get Git dates for a file
 * @param {string} filePath - Path to file relative to repo root
 * @returns {{created: string, modified: string}} ISO date strings
 */
function getGitDates(filePath) {
  try {
    // Get first commit date (file creation)
    const firstCommit = execSync(
      `git log --follow --format=%aI --reverse "${filePath}" | head -1`,
      { encoding: 'utf-8' }
    ).trim();

    // Get last commit date (file modification)
    const lastCommit = execSync(
      `git log --follow --format=%aI -1 "${filePath}"`,
      { encoding: 'utf-8' }
    ).trim();

    return {
      created: firstCommit || new Date().toISOString(),
      modified: lastCommit || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error getting Git dates for ${filePath}:`, error.message);
    // Fallback to current date if Git history not available
    const now = new Date().toISOString();
    return { created: now, modified: now };
  }
}

/**
 * Update dates in YAML frontmatter file
 * @param {string} filePath - Full path to YAML file
 */
function updateFrontmatterDates(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  console.log(`\nProcessing: ${relativePath}`);
  
  try {
    // Read YAML file
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(content);
    
    // Get Git dates
    const dates = getGitDates(relativePath);
    
    // Check current values
    const currentPublished = data.datePublished;
    const currentModified = data.dateModified;
    
    console.log(`  Current datePublished: ${currentPublished || 'MISSING'}`);
    console.log(`  Current dateModified:  ${currentModified || 'MISSING'}`);
    console.log(`  Git created date:      ${dates.created}`);
    console.log(`  Git modified date:     ${dates.modified}`);
    
    // Update dates
    const originalData = { ...data };
    data.datePublished = dates.created;
    data.dateModified = dates.modified;
    
    // Check if anything changed
    const hasChanges = 
      originalData.datePublished !== data.datePublished ||
      originalData.dateModified !== data.dateModified;
    
    if (!hasChanges) {
      console.log(`  ✓ No changes needed`);
      return { updated: false, file: relativePath };
    }
    
    console.log(`  → New datePublished:   ${dates.created}`);
    console.log(`  → New dateModified:    ${dates.modified}`);
    
    if (isDryRun) {
      console.log(`  [DRY RUN] Would update file`);
      return { updated: true, file: relativePath, dryRun: true };
    }
    
    // Write back to file
    const newContent = yaml.dump(data, {
      lineWidth: -1, // Don't wrap lines
      noRefs: true,  // Don't use anchors/aliases
    });
    
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`  ✅ Updated successfully`);
    
    return { updated: true, file: relativePath };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { updated: false, file: relativePath, error: error.message };
  }
}

/**
 * Find all frontmatter YAML files
 */
function findFrontmatterFiles() {
  const frontmatterDir = path.join(process.cwd(), 'frontmatter');
  const files = [];
  
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
        files.push(fullPath);
      }
    }
  }
  
  scan(frontmatterDir);
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(70));
  console.log('📅 Frontmatter Date Updater - Using Git Commit History');
  console.log('='.repeat(70));
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  let files;
  
  if (targetFile) {
    // Single file mode
    const fullPath = path.resolve(process.cwd(), targetFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${targetFile}`);
      process.exit(1);
    }
    files = [fullPath];
    console.log(`Target: Single file - ${targetFile}\n`);
  } else {
    // All files mode
    files = findFrontmatterFiles();
    console.log(`Target: All frontmatter files (${files.length} found)\n`);
  }
  
  const results = {
    total: files.length,
    updated: 0,
    unchanged: 0,
    errors: 0,
  };
  
  // Process each file
  for (const file of files) {
    const result = updateFrontmatterDates(file);
    
    if (result.error) {
      results.errors++;
    } else if (result.updated) {
      results.updated++;
    } else {
      results.unchanged++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary');
  console.log('='.repeat(70));
  console.log(`Total files processed: ${results.total}`);
  console.log(`✅ Updated:            ${results.updated}`);
  console.log(`⏭️  Unchanged:          ${results.unchanged}`);
  console.log(`❌ Errors:             ${results.errors}`);
  
  if (isDryRun && results.updated > 0) {
    console.log(`\n💡 This was a dry run. Run without --dry-run to apply changes.`);
  }
  
  console.log('='.repeat(70));
}

// Run the script
main();
