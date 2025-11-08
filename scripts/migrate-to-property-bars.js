#!/usr/bin/env node

/**
 * Migration Script: MetricsGrid → PropertyBars
 * 
 * Automatically replaces MetricsGrid component with the new PropertyBars
 * component across the codebase.
 * 
 * Usage:
 *   node scripts/migrate-to-property-bars.js [--dry-run] [--file=path/to/file.tsx]
 * 
 * Options:
 *   --dry-run    Show changes without modifying files
 *   --file       Migrate a specific file only
 *   --help       Show this help message
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const showHelp = args.includes('--help');
const specificFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

if (showHelp) {
  console.log(`
Migration Script: MetricsGrid → PropertyBars

Automatically replaces MetricsGrid component with the new PropertyBars
component across the codebase.

Usage:
  node scripts/migrate-to-property-bars.js [options]

Options:
  --dry-run    Show changes without modifying files
  --file=PATH  Migrate a specific file only
  --help       Show this help message

Examples:
  node scripts/migrate-to-property-bars.js --dry-run
  node scripts/migrate-to-property-bars.js --file=app/materials/page.tsx
  node scripts/migrate-to-property-bars.js
`);
  process.exit(0);
}

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  instancesReplaced: 0,
  errors: []
};

/**
 * Check if file uses MetricsGrid with materialProperties dataSource
 */
function shouldMigrateFile(content) {
  // Look for MetricsGrid import
  const hasMetricsGridImport = /import\s+.*MetricsGrid.*from.*MetricsCard/.test(content);
  
  // Look for MetricsGrid usage with materialProperties (must be exact match)
  const hasMaterialPropertiesUsage = /<MetricsGrid[^>]*dataSource=["']materialProperties["'][^>]*\/?>/.test(content);
  
  // Make sure it's not just machineSettings
  const onlyMachineSettings = /<MetricsGrid[^>]*dataSource=["']machineSettings["']/.test(content) && 
                               !hasMaterialPropertiesUsage;
  
  return hasMetricsGridImport && hasMaterialPropertiesUsage && !onlyMachineSettings;
}

/**
 * Transform file content to use PropertyBars
 */
function migrateFileContent(content, filePath) {
  let modified = content;
  let changeCount = 0;
  
  // Step 1: Update imports
  // Remove MetricsGrid import
  const metricsGridImportRegex = /import\s+\{[^}]*MetricsGrid[^}]*\}\s+from\s+['"][^'"]*MetricsCard[^'"]*['"];?\n?/g;
  if (metricsGridImportRegex.test(modified)) {
    modified = modified.replace(metricsGridImportRegex, '');
    changeCount++;
  }
  
  // Add PropertyBars import if not present
  if (!modified.includes('PropertyBars')) {
    const firstImportMatch = modified.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPosition = firstImportMatch.index;
      const propertyBarsImport = "import { PropertyBars, extractPropertiesFromMetadata } from '@/app/components/PropertyBars/PropertyBars';\n";
      modified = modified.slice(0, insertPosition) + propertyBarsImport + modified.slice(insertPosition);
      changeCount++;
    }
  }
  
  // Ensure SectionTitle import exists
  if (!modified.includes("from '@/app/components/SectionTitle/SectionTitle'") && 
      !modified.includes('from "../SectionTitle/SectionTitle"')) {
    const firstImportMatch = modified.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPosition = firstImportMatch.index;
      const sectionTitleImport = "import { SectionTitle } from '@/app/components/SectionTitle/SectionTitle';\n";
      modified = modified.slice(0, insertPosition) + sectionTitleImport + modified.slice(insertPosition);
      changeCount++;
    }
  }
  
  // Step 2: Replace MetricsGrid components
  // Pattern: <MetricsGrid ... dataSource="materialProperties" ... />
  const metricsGridPattern = /<MetricsGrid\s+([\s\S]*?)dataSource=["']materialProperties["']([\s\S]*?)\/>/g;
  
  modified = modified.replace(metricsGridPattern, (match, before, after) => {
    changeCount++;
    
    // Extract title if present
    const titleMatch = match.match(/title=["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : 'Material Properties';
    
    // Extract className if present
    const classNameMatch = match.match(/className=["']([^"']+)["']/);
    const className = classNameMatch ? ` className="${classNameMatch[1]}"` : '';
    
    // Build replacement
    return `{(() => {
    const properties = extractPropertiesFromMetadata(metadata);
    return (
      <>
        <SectionTitle title="${title}" />
        <PropertyBars properties={properties}${className} />
      </>
    );
  })()}`;
  });
  
  // Step 3: Handle multi-line MetricsGrid components
  const multiLinePattern = /<MetricsGrid\s+([\s\S]*?)dataSource=["']materialProperties["']([\s\S]*?)>\s*<\/MetricsGrid>/g;
  
  modified = modified.replace(multiLinePattern, (match) => {
    changeCount++;
    
    // Extract title if present
    const titleMatch = match.match(/title=["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : 'Material Properties';
    
    // Extract className if present
    const classNameMatch = match.match(/className=["']([^"']+)["']/);
    const className = classNameMatch ? ` className="${classNameMatch[1]}"` : '';
    
    // Build replacement
    return `{(() => {
    const properties = extractPropertiesFromMetadata(metadata);
    return (
      <>
        <SectionTitle title="${title}" />
        <PropertyBars properties={properties}${className} />
      </>
    );
  })()}`;
  });
  
  return { modified, changeCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file needs migration
    if (!shouldMigrateFile(content)) {
      return;
    }
    
    // Perform migration
    const { modified, changeCount } = migrateFileContent(content, filePath);
    
    if (changeCount === 0) {
      return;
    }
    
    stats.instancesReplaced += changeCount;
    stats.filesModified++;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📝 ${filePath}`);
    console.log(`   ${changeCount} change(s) detected`);
    
    if (isDryRun) {
      console.log(`   [DRY RUN] Would modify file`);
    } else {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`   ✅ File modified successfully`);
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`\n❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('\n🚀 MetricsGrid → PropertyBars Migration Script\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE: No files will be modified\n');
  }
  
  // Get files to process
  let files = [];
  
  if (specificFile) {
    files = [specificFile];
    console.log(`📂 Processing specific file: ${specificFile}\n`);
  } else {
    // Find all TSX/JSX files in app directory
    const patterns = [
      'app/**/*.tsx',
      'app/**/*.jsx',
      '!app/**/*.test.tsx',
      '!app/**/*.test.jsx',
      '!app/**/node_modules/**'
    ];
    
    patterns.forEach(pattern => {
      const isNegative = pattern.startsWith('!');
      const actualPattern = isNegative ? pattern.slice(1) : pattern;
      const foundFiles = glob.sync(actualPattern, { cwd: process.cwd() });
      
      if (isNegative) {
        files = files.filter(f => !foundFiles.includes(f));
      } else {
        files = files.concat(foundFiles);
      }
    });
    
    files = [...new Set(files)]; // Remove duplicates
    
    console.log(`📂 Scanning ${files.length} files...\n`);
  }
  
  // Process each file
  files.forEach(processFile);
  
  // Print summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('\n📊 Migration Summary\n');
  console.log(`   Files scanned:     ${stats.filesScanned}`);
  console.log(`   Files modified:    ${stats.filesModified}`);
  console.log(`   Instances replaced: ${stats.instancesReplaced}`);
  
  if (stats.errors.length > 0) {
    console.log(`   Errors:            ${stats.errors.length}\n`);
    console.log('❌ Errors encountered:\n');
    stats.errors.forEach(({ file, error }) => {
      console.log(`   ${file}: ${error}`);
    });
  } else {
    console.log(`   Errors:            0`);
  }
  
  console.log('\n');
  
  if (isDryRun && stats.filesModified > 0) {
    console.log('💡 Run without --dry-run to apply changes\n');
  } else if (stats.filesModified > 0) {
    console.log('✅ Migration complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Review the changes: git diff');
    console.log('   2. Test the application: npm run dev');
    console.log('   3. Commit if satisfied: git add . && git commit -m "Migrate to PropertyBars component"\n');
  } else {
    console.log('ℹ️  No files needed migration\n');
  }
}

// Run the script
main();
