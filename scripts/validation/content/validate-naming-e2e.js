#!/usr/bin/env node
/**
 * End-to-End Naming Normalization Validator
 * 
 * Validates consistent naming conventions across:
 * 1. File names (YAML, images, components)
 * 2. Slugs in content
 * 3. Image paths and references
 * 4. Author IDs and references
 * 5. Component references
 * 
 * Run: node scripts/validate-naming-e2e.js
 * In CI/CD: npm run validate:naming
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Import validation infrastructure
const ValidationCache = require('../lib/cache');
const { ValidationResult } = require('../lib/exitCodes');
const config = require('../config');

// Naming convention rules
const RULES = {
  slug: /^[a-z0-9-]+$/,
  fileName: /^[a-z0-9-]+\.(yaml|yml|ts|tsx|js|jsx|md)$/,
  imagePath: /^\/images\/[a-z0-9/-]+\.(jpg|jpeg|png|webp|svg)$/,
  imageFileName: /^[a-z0-9-]+\.(jpg|jpeg|png|webp|svg)$/,
  componentName: /^[A-Z][a-zA-Z0-9]+$/,  // PascalCase
  authorId: /^[a-z0-9-]+$/,  // Allow numbers for numeric author IDs
  categorySlug: /^[a-z-]+$/,  // Allow hyphens for multi-word categories like rare-earth
  subcategorySlug: /^[a-z-]+$/
};

// Expected patterns
const IMAGE_PATTERNS = {
  hero: /-laser-cleaning-hero\.(jpg|jpeg|png|webp)$/,
  micro: /-laser-cleaning-micro\.(jpg|jpeg|png|webp)$/,
  social: /-laser-cleaning-micro-social\.(jpg|jpeg|png|webp)$/,
  author: /^\/images\/author\/[a-z-]+\.(jpg|jpeg|png|webp)$/
};

class NamingValidator {
  constructor() {
    this.result = new ValidationResult('Naming Validation');
    this.cache = new ValidationCache('naming');
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesChecked: 0,
      imagesValidated: 0,
      slugsValidated: 0,
      namingErrors: 0,
      cached: 0
    };
  }

  // Validate slug format
  validateSlug(slug, context) {
    if (!slug) {
      this.errors.push({
        type: 'missing_slug',
        context,
        message: 'Slug is missing or empty'
      });
      return false;
    }

    if (!RULES.slug.test(slug)) {
      this.errors.push({
        type: 'invalid_slug',
        slug,
        context,
        message: `Slug "${slug}" contains invalid characters (must be lowercase letters, numbers, and hyphens only)`
      });
      this.stats.namingErrors++;
      return false;
    }

    // Check for common issues
    if (slug.startsWith('-') || slug.endsWith('-')) {
      this.errors.push({
        type: 'malformed_slug',
        slug,
        context,
        message: `Slug "${slug}" should not start or end with hyphen`
      });
      this.stats.namingErrors++;
      return false;
    }

    if (slug.includes('--')) {
      this.warnings.push({
        type: 'double_hyphen',
        slug,
        context,
        message: `Slug "${slug}" contains double hyphens`
      });
    }

    this.stats.slugsValidated++;
    return true;
  }

  // Validate file name
  validateFileName(fileName, context) {
    if (!RULES.fileName.test(fileName)) {
      this.errors.push({
        type: 'invalid_filename',
        fileName,
        context,
        message: `File name "${fileName}" doesn't follow naming convention`
      });
      this.stats.namingErrors++;
      return false;
    }

    // Check for underscores (should use hyphens)
    if (fileName.includes('_')) {
      this.errors.push({
        type: 'underscore_in_filename',
        fileName,
        context,
        message: `File name "${fileName}" contains underscores (use hyphens instead)`
      });
      this.stats.namingErrors++;
      return false;
    }

    // Check for uppercase
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
    if (nameWithoutExt !== nameWithoutExt.toLowerCase()) {
      this.errors.push({
        type: 'uppercase_in_filename',
        fileName,
        context,
        message: `File name "${fileName}" contains uppercase letters`
      });
      this.stats.namingErrors++;
      return false;
    }

    return true;
  }

  // Validate image path
  validateImagePath(imagePath, context, imageType) {
    if (!imagePath) return true; // Optional images are OK

    if (!RULES.imagePath.test(imagePath)) {
      this.errors.push({
        type: 'invalid_image_path',
        imagePath,
        context,
        message: `Image path "${imagePath}" doesn't follow naming convention`
      });
      this.stats.namingErrors++;
      return false;
    }

    // Check specific patterns for material images
    if (imageType && IMAGE_PATTERNS[imageType]) {
      if (!IMAGE_PATTERNS[imageType].test(imagePath)) {
        this.warnings.push({
          type: 'image_pattern_mismatch',
          imagePath,
          imageType,
          context,
          message: `Image path "${imagePath}" doesn't follow expected ${imageType} pattern`
        });
      }
    }

    // Check for old patterns that should be migrated
    const oldPatterns = ['cleaning-analysis', 'material-cleaning', 'surface-cleaning'];
    oldPatterns.forEach(oldPattern => {
      if (imagePath.includes(oldPattern)) {
        this.errors.push({
          type: 'legacy_image_pattern',
          imagePath,
          oldPattern,
          context,
          message: `Image path uses legacy pattern "${oldPattern}" - should use "laser-cleaning-*" pattern`
        });
        this.stats.namingErrors++;
      }
    });

    this.stats.imagesValidated++;
    return true;
  }

  // Validate author reference
  validateAuthorReference(authorRef, context) {
    if (!authorRef) return true; // Optional

    const authorId = typeof authorRef === 'string' ? authorRef : authorRef.id || authorRef.name;
    
    if (authorId && !RULES.authorId.test(authorId)) {
      this.errors.push({
        type: 'invalid_author_id',
        authorId,
        context,
        message: `Author ID "${authorId}" contains invalid characters`
      });
      this.stats.namingErrors++;
      return false;
    }

    return true;
  }

  // Validate frontmatter YAML file
  async validateFrontmatterFile(filePath) {
    try {
      const fileName = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      const data = yaml.load(content);

      this.stats.filesChecked++;

      // Validate file name
      this.validateFileName(fileName, `frontmatter/${fileName}`);

      // Extract slug from filename
      const fileSlug = fileName.replace(/\.(yaml|yml)$/, '');
      this.validateSlug(fileSlug, `frontmatter/${fileName} (filename)`);

      // Validate name field matches filename
      if (data.name && data.name !== fileSlug) {
        this.warnings.push({
          type: 'name_filename_mismatch',
          file: fileName,
          nameField: data.name,
          fileSlug,
          message: `Name field "${data.name}" doesn't match filename slug "${fileSlug}"`
        });
      }

      // Validate category/subcategory - allow TitleCase since code converts to lowercase
      if (data.category) {
        const categorySlug = data.category.toLowerCase().replace(/\s+/g, '-');
        // Validate the converted slug format is valid
        if (!RULES.categorySlug.test(categorySlug)) {
          this.errors.push({
            type: 'invalid_category',
            category: data.category,
            file: fileName,
            message: `Category "${data.category}" converts to invalid slug "${categorySlug}"`
          });
          this.stats.namingErrors++;
        }
      }

      if (data.subcategory) {
        const subcategorySlug = data.subcategory.toLowerCase().replace(/\s+/g, '-');
        // Validate the converted slug format is valid
        if (!RULES.subcategorySlug.test(subcategorySlug)) {
          this.errors.push({
            type: 'invalid_subcategory',
            subcategory: data.subcategory,
            file: fileName,
            message: `Subcategory "${data.subcategory}" converts to invalid slug "${subcategorySlug}"`
          });
          this.stats.namingErrors++;
        }
      }

      // Validate image paths
      if (data.images) {
        if (data.images.hero) {
          this.validateImagePath(data.images.hero.url, `${fileName} (hero)`, 'hero');
        }
        if (data.images.micro) {
          this.validateImagePath(data.images.micro.url, `${fileName} (micro)`, 'micro');
        }
      }

      // Validate author reference
      this.validateAuthorReference(data.author, `${fileName} (author)`);

    } catch (error) {
      this.errors.push({
        type: 'parse_error',
        file: path.basename(filePath),
        message: `Failed to parse: ${error.message}`
      });
    }
  }

  // Validate image file
  async validateImageFile(filePath) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    this.stats.filesChecked++;

    // Check file name format
    if (!RULES.imageFileName.test(fileName)) {
      this.errors.push({
        type: 'invalid_image_filename',
        file: relativePath,
        message: `Image filename "${fileName}" doesn't follow naming convention`
      });
      this.stats.namingErrors++;
      return;
    }

    // Check for underscores
    if (fileName.includes('_')) {
      this.errors.push({
        type: 'underscore_in_image',
        file: relativePath,
        message: `Image filename contains underscores (use hyphens)`
      });
      this.stats.namingErrors++;
    }

    // Check for uppercase
    const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
    if (nameWithoutExt !== nameWithoutExt.toLowerCase()) {
      this.errors.push({
        type: 'uppercase_in_image',
        file: relativePath,
        message: `Image filename contains uppercase letters`
      });
      this.stats.namingErrors++;
    }

    this.stats.imagesValidated++;
  }

  // Validate slug consistency across references
  async validateCrossReferences() {
    console.log('\n🔗 Validating cross-references...\n');

    const frontmatterFiles = await glob('frontmatter/materials/*.yaml');
    const slugs = new Set();
    const duplicates = new Set();

    for (const filePath of frontmatterFiles) {
      const fileName = path.basename(filePath, '.yaml');
      
      if (slugs.has(fileName)) {
        duplicates.add(fileName);
        this.errors.push({
          type: 'duplicate_slug',
          slug: fileName,
          message: `Duplicate slug detected: "${fileName}"`
        });
        this.stats.namingErrors++;
      }
      
      slugs.add(fileName);
    }

    console.log(`   Checked ${slugs.size} unique slugs`);
    if (duplicates.size > 0) {
      console.log(`   ⚠️  Found ${duplicates.size} duplicate slugs`);
    }
  }

  // Generate report
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📋 NAMING NORMALIZATION VALIDATION REPORT');
    console.log('='.repeat(70) + '\n');

    console.log(`Files Checked: ${this.stats.filesChecked}`);
    console.log(`Slugs Validated: ${this.stats.slugsValidated}`);
    console.log(`Images Validated: ${this.stats.imagesValidated}`);
    console.log(`Naming Errors: ${this.stats.namingErrors}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}\n`);

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      
      // Group by type
      const errorsByType = {};
      this.errors.forEach(error => {
        if (!errorsByType[error.type]) {
          errorsByType[error.type] = [];
        }
        errorsByType[error.type].push(error);
      });

      Object.entries(errorsByType).forEach(([type, errors]) => {
        console.log(`  ${type.toUpperCase()} (${errors.length}):`);
        errors.slice(0, 5).forEach(error => {
          console.log(`    • ${error.message}`);
          if (error.file) console.log(`      File: ${error.file}`);
          if (error.context) console.log(`      Context: ${error.context}`);
        });
        if (errors.length > 5) {
          console.log(`    ... and ${errors.length - 5} more`);
        }
        console.log();
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.slice(0, 10).forEach(warning => {
        console.log(`  • ${warning.message}`);
        if (warning.context) console.log(`    Context: ${warning.context}`);
      });
      if (this.warnings.length > 10) {
        console.log(`  ... and ${this.warnings.length - 10} more warnings\n`);
      }
      console.log();
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All naming validation checks passed!\n');
      console.log('🎉 Naming conventions are properly normalized across the codebase.\n');
    }

    // Summary recommendations
    if (this.errors.length > 0) {
      console.log('📌 RECOMMENDATIONS:\n');
      
      const errorTypes = Object.keys(
        this.errors.reduce((acc, e) => ({ ...acc, [e.type]: true }), {})
      );

      if (errorTypes.includes('invalid_slug') || errorTypes.includes('malformed_slug')) {
        console.log('  • Run slug normalization: node scripts/normalize-slugs.js');
      }
      if (errorTypes.includes('underscore_in_filename')) {
        console.log('  • Rename files with underscores to use hyphens');
      }
      if (errorTypes.includes('legacy_image_pattern')) {
        console.log('  • Migrate legacy image patterns to new naming convention');
      }
      if (errorTypes.includes('uppercase_in_filename')) {
        console.log('  • Convert filenames to lowercase');
      }
      console.log();
    }

    return this.errors.length === 0;
  }

  // Main validation runner
  async run() {
    console.log('🚀 Starting end-to-end naming validation...\n');

    // Validate frontmatter files
    console.log('📝 Validating frontmatter YAML files...\n');
    const frontmatterFiles = await glob('frontmatter/materials/*.yaml');
    console.log(`   Found ${frontmatterFiles.length} files\n`);
    
    for (const filePath of frontmatterFiles) {
      // Check cache first
      if (this.cache.isCached(filePath)) {
        this.stats.cached++;
        continue;
      }
      
      const isValid = await this.validateFrontmatterFile(filePath);
      this.cache.set(filePath, isValid);
    }

    // Validate image files
    console.log('🖼️  Validating image files...\n');
    const imageFiles = await glob('public/images/**/*.{jpg,jpeg,png,webp,svg}');
    console.log(`   Found ${imageFiles.length} images\n`);
    
    for (const filePath of imageFiles) {
      if (this.cache.isCached(filePath)) {
        this.stats.cached++;
        continue;
      }
      
      const isValid = await this.validateImageFile(filePath);
      this.cache.set(filePath, isValid);
    }

    // Validate cross-references
    await this.validateCrossReferences();

    // Generate report
    this.generateReport();
    
    // Add stats to result
    if (this.stats.cached > 0) {
      console.log(`\n💾 Used ${this.stats.cached} cached validations`);
    }
    
    // Use new exit handling
    if (this.errors.length === 0) {
      this.result.addPassed(`All ${this.stats.filesChecked} files validated`);
    } else {
      this.errors.forEach(error => {
        this.result.addFailure(error.message, error.context);
      });
    }
    
    this.warnings.forEach(warning => {
      this.result.addWarning(warning.message);
    });

    this.result.exit();
  }
}

// Run validation
const validator = new NamingValidator();
validator.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
