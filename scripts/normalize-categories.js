#!/usr/bin/env node
/**
 * Category Normalization Script
 * 
 * @deprecated This functionality is now handled automatically
 *             by app/utils/normalizers/categoryNormalizer.ts
 * 
 * This script remains for one-time batch updates only.
 * For new materials, normalization happens at load time in contentAPI.ts
 * 
 * Normalizes category fields in frontmatter YAML files to lowercase
 * Categories should be single lowercase words (metal, ceramic, composite)
 * 
 * Run: node scripts/normalize-categories.js
 * Dry run: node scripts/normalize-categories.js --dry-run
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');

// Valid category mappings
const CATEGORY_MAP = {
  'Metal': 'metal',
  'Ceramic': 'ceramic',
  'Composite': 'composite',
  'Polymer': 'polymer',
  'Wood': 'wood',
  'Stone': 'stone',
  'Glass': 'glass',
  'Rare-Earth': 'rareearth',  // Remove hyphen for single word
  'Natural': 'natural'
};

class CategoryNormalizer {
  constructor() {
    this.changes = [];
    this.errors = [];
  }

  async normalizeFile(filePath) {
    try {
      const fileName = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      const data = yaml.load(content);
      let modified = false;

      // Normalize category
      if (data.category && CATEGORY_MAP[data.category]) {
        const oldCategory = data.category;
        const newCategory = CATEGORY_MAP[data.category];
        
        if (oldCategory !== newCategory) {
          this.changes.push({
            file: fileName,
            field: 'category',
            old: oldCategory,
            new: newCategory
          });
          
          data.category = newCategory;
          modified = true;
        }
      } else if (data.category && data.category !== data.category.toLowerCase()) {
        // Handle unmapped categories
        const oldCategory = data.category;
        const newCategory = data.category.toLowerCase();
        
        this.changes.push({
          file: fileName,
          field: 'category',
          old: oldCategory,
          new: newCategory
        });
        
        data.category = newCategory;
        modified = true;
      }

      // Normalize subcategory (ensure lowercase with hyphens)
      if (data.subcategory && data.subcategory !== data.subcategory.toLowerCase()) {
        const oldSubcategory = data.subcategory;
        const newSubcategory = data.subcategory.toLowerCase();
        
        this.changes.push({
          file: fileName,
          field: 'subcategory',
          old: oldSubcategory,
          new: newSubcategory
        });
        
        data.subcategory = newSubcategory;
        modified = true;
      }

      // Write changes if not dry run
      if (modified && !DRY_RUN) {
        const newContent = yaml.dump(data, {
          lineWidth: -1,
          noRefs: true,
          sortKeys: false
        });
        await fs.writeFile(filePath, newContent, 'utf8');
      }

      return modified;
    } catch (error) {
      this.errors.push({
        file: path.basename(filePath),
        error: error.message
      });
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📋 CATEGORY NORMALIZATION REPORT');
    console.log('='.repeat(70) + '\n');

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    console.log(`Changes to apply: ${this.changes.length}`);
    console.log(`Errors encountered: ${this.errors.length}\n`);

    if (this.changes.length > 0) {
      console.log('📝 CHANGES:\n');
      
      // Group by field
      const byField = {};
      this.changes.forEach(change => {
        if (!byField[change.field]) byField[change.field] = [];
        byField[change.field].push(change);
      });

      Object.entries(byField).forEach(([field, changes]) => {
        console.log(`  ${field.toUpperCase()} (${changes.length} files):`);
        changes.slice(0, 10).forEach(change => {
          console.log(`    • ${change.file}: "${change.old}" → "${change.new}"`);
        });
        if (changes.length > 10) {
          console.log(`    ... and ${changes.length - 10} more`);
        }
        console.log();
      });
    }

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      this.errors.forEach(error => {
        console.log(`  • ${error.file}: ${error.error}`);
      });
      console.log();
    }

    if (this.changes.length === 0 && this.errors.length === 0) {
      console.log('✅ All categories are already normalized!\n');
    } else if (!DRY_RUN && this.changes.length > 0) {
      console.log(`✅ Successfully normalized ${this.changes.length} categories!\n`);
    } else if (DRY_RUN && this.changes.length > 0) {
      console.log(`📊 Run without --dry-run to apply these ${this.changes.length} changes\n`);
    }
  }

  async run() {
    console.log('🚀 Starting category normalization...\n');

    const yamlFiles = await glob('content/frontmatter/*.yaml');
    console.log(`📁 Found ${yamlFiles.length} frontmatter files\n`);

    let processed = 0;
    let modified = 0;

    for (const filePath of yamlFiles) {
      const wasModified = await this.normalizeFile(filePath);
      processed++;
      if (wasModified) modified++;

      if (processed % 20 === 0) {
        process.stdout.write(`\r   Processing: ${processed}/${yamlFiles.length} (${modified} modified)`);
      }
    }

    console.log(`\r   Processing: ${processed}/${yamlFiles.length} (${modified} modified)\n`);

    this.generateReport();
  }
}

// Run normalization
const normalizer = new CategoryNormalizer();
normalizer.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
