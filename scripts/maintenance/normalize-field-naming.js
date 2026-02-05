#!/usr/bin/env node
/**
 * Field Naming Normalization Script
 * 
 * Normalizes field naming across all YAML files (frontmatter and static pages)
 * to use consistent naming conventions:
 * 
 * - pageTitle (replaces: title, name)
 * - pageDescription (replaces: metaDescription, meta.description)
 * 
 * Run: node scripts/maintenance/normalize-field-naming.js [--dry-run]
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Directories to normalize
const DIRECTORIES = [
  'frontmatter/materials',
  'frontmatter/contaminants',
  'frontmatter/compounds',
  'static-pages'
];

class FieldNormalizer {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      fieldsMigrated: {
        pageTitle: 0,
        pageDescription: 0
      }
    };
  }

  /**
   * Normalize a single YAML file
   */
  async normalizeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = yaml.load(content);
      const fileName = path.basename(filePath);
      
      let modified = false;

      // Normalize pageTitle field
      if (!data.pageTitle) {
        if (data.title) {
          data.pageTitle = data.title;
          delete data.title;
          modified = true;
          this.stats.fieldsMigrated.pageTitle++;
          console.log(`  ✓ ${fileName}: title → pageTitle`);
        } else if (data.name) {
          data.pageTitle = data.name;
          // Keep name field for materials (used in other contexts)
          modified = true;
          this.stats.fieldsMigrated.pageTitle++;
          console.log(`  ✓ ${fileName}: added pageTitle from name`);
        }
      }

      // Normalize pageDescription field
      if (!data.pageDescription) {
        if (data.metaDescription) {
          data.pageDescription = data.metaDescription;
          delete data.metaDescription;
          modified = true;
          this.stats.fieldsMigrated.pageDescription++;
          console.log(`  ✓ ${fileName}: metaDescription → pageDescription`);
        } else if (data.meta?.description) {
          data.pageDescription = data.meta.description;
          // Keep meta object for other meta fields (title, path, etc)
          delete data.meta.description;
          modified = true;
          this.stats.fieldsMigrated.pageDescription++;
          console.log(`  ✓ ${fileName}: meta.description → pageDescription`);
        }
      }

      // Write back if modified
      if (modified) {
        this.stats.filesModified++;
        
        if (!this.dryRun) {
          const yamlContent = yaml.dump(data, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false
          });
          await fs.writeFile(filePath, yamlContent, 'utf8');
        }
      }

      this.stats.filesProcessed++;
      return { modified, fileName };
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return { modified: false, fileName: path.basename(filePath), error: true };
    }
  }

  /**
   * Process all files in a directory
   */
  async normalizeDirectory(directory) {
    const pattern = path.join(process.cwd(), directory, '*.yaml');
    const files = await glob(pattern);
    
    console.log(`\n📁 Processing ${directory} (${files.length} files)...`);
    
    for (const filePath of files) {
      await this.normalizeFile(filePath);
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FIELD NORMALIZATION REPORT');
    console.log('='.repeat(70) + '\n');

    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No files were actually modified\n');
    }

    console.log(`Files Processed: ${this.stats.filesProcessed}`);
    console.log(`Files Modified: ${this.stats.filesModified}`);
    console.log(`\nFields Migrated:`);
    console.log(`  • pageTitle: ${this.stats.fieldsMigrated.pageTitle}`);
    console.log(`  • pageDescription: ${this.stats.fieldsMigrated.pageDescription}`);
    
    const totalMigrated = Object.values(this.stats.fieldsMigrated).reduce((a, b) => a + b, 0);
    
    if (totalMigrated === 0) {
      console.log('\n✅ All files already use normalized field naming!\n');
    } else {
      console.log(`\n✅ Normalization ${this.dryRun ? 'would migrate' : 'completed'}: ${totalMigrated} total fields\n`);
      
      if (this.dryRun) {
        console.log('Run without --dry-run to apply changes.\n');
      }
    }
  }

  /**
   * Main runner
   */
  async run() {
    console.log('🚀 Starting field naming normalization...');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

    // Process all directories
    for (const directory of DIRECTORIES) {
      await this.normalizeDirectory(directory);
    }

    // Generate report
    this.generateReport();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run normalizer
const normalizer = new FieldNormalizer(dryRun);
normalizer.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
