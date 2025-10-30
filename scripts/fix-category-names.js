#!/usr/bin/env node

/**
 * Fix Category Names Script
 * 
 * @deprecated This functionality is now handled automatically
 *             by app/utils/normalizers/categoryNormalizer.ts
 * 
 * This script remains for one-time batch updates only.
 * For new materials, normalization happens at load time in contentAPI.ts
 * 
 * Normalizes category names in YAML frontmatter files
 * 
 * Fixes:
 * - "Metal" → "metal"
 * - "Ceramic" → "ceramic" 
 * - "Wood" → "wood"
 * - "Polymer" → "polymer"
 * - Removes hyphens from categories
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Category normalization map
const CATEGORY_NORMALIZATIONS = {
  'Metal': 'metal',
  'metal': 'metal',
  'Ceramic': 'ceramic',
  'ceramic': 'ceramic',
  'Wood': 'wood',
  'wood': 'wood',
  'Polymer': 'polymer',
  'polymer': 'polymer',
  'Glass': 'glass',
  'glass': 'glass',
  'Stone': 'stone',
  'stone': 'stone',
  'Composite': 'composite',
  'composite': 'composite',
  'rare-earth': 'rare-earth',
  'Rare-Earth': 'rare-earth',
  'rare earth': 'rare-earth',
  'rareearth': 'rare-earth',
  'Masonry': 'masonry',
  'masonry': 'masonry'
};

class CategoryFixer {
  constructor() {
    this.filesFixed = 0;
    this.categoriesFixed = 0;
    this.errors = [];
  }

  normalizeCategory(category) {
    if (!category) return category;
    
    // Direct lookup
    if (CATEGORY_NORMALIZATIONS[category]) {
      return CATEGORY_NORMALIZATIONS[category];
    }
    
    // Remove hyphens and lowercase
    const normalized = category.toLowerCase().replace(/-/g, ' ');
    return normalized;
  }

  fixYamlFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);
      
      if (!data) return false;
      
      let modified = false;
      
      // Fix category field
      if (data.category) {
        const normalized = this.normalizeCategory(data.category);
        if (normalized !== data.category) {
          console.log(`  ${path.basename(filePath)}: "${data.category}" → "${normalized}"`);
          data.category = normalized;
          modified = true;
          this.categoriesFixed++;
        }
      }
      
      // Fix categories array
      if (Array.isArray(data.categories)) {
        const normalizedCategories = data.categories.map(cat => {
          const normalized = this.normalizeCategory(cat);
          if (normalized !== cat) {
            console.log(`  ${path.basename(filePath)}: "${cat}" → "${normalized}"`);
            this.categoriesFixed++;
            modified = true;
          }
          return normalized;
        });
        
        if (modified) {
          data.categories = normalizedCategories;
        }
      }
      
      // Write back if modified
      if (modified) {
        const yamlString = yaml.dump(data, {
          indent: 2,
          lineWidth: -1,
          noRefs: true
        });
        fs.writeFileSync(filePath, yamlString, 'utf8');
        this.filesFixed++;
        return true;
      }
      
      return false;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  async fixAll() {
    console.log('🔧 Category Name Normalization');
    console.log('==============================\n');
    
    // Find all YAML files in content directory
    const patterns = [
      'frontmatter/materials/**/*.yaml',
      'static-pages/**/*.yaml',
    ];    let allFiles = [];
    for (const pattern of patterns) {
      const files = glob.sync(pattern);
      allFiles = allFiles.concat(files);
    }
    
    console.log(`📁 Found ${allFiles.length} YAML files\n`);
    
    // Process each file
    for (const file of allFiles) {
      this.fixYamlFile(file);
    }
    
    // Report results
    console.log('\n📊 Results:');
    console.log(`  Files modified: ${this.filesFixed}`);
    console.log(`  Categories normalized: ${this.categoriesFixed}`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
    
    if (this.filesFixed > 0) {
      console.log('\n✅ Category normalization complete!');
      console.log('\n📝 Next steps:');
      console.log('  1. Review changes: git diff');
      console.log('  2. Run validation: npm run validate:naming');
      console.log('  3. Commit: git add -A && git commit -m "Normalize category names"');
    } else {
      console.log('\n✅ All categories already normalized!');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new CategoryFixer();
  fixer.fixAll().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
}

module.exports = CategoryFixer;
