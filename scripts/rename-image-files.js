#!/usr/bin/env node
/**
 * Image File Renaming Script
 * 
 * Renames image files to follow naming conventions:
 * - Replace underscores with hyphens
 * - Convert to lowercase
 * - Update all references in YAML files
 * 
 * Run: node scripts/rename-image-files.js
 * Dry run: node scripts/rename-image-files.js --dry-run
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');

class ImageRenamer {
  constructor() {
    this.renames = [];
    this.references = [];
    this.errors = [];
  }

  normalizeImageFileName(fileName) {
    // Convert to lowercase
    let normalized = fileName.toLowerCase();
    
    // Replace underscores with hyphens
    normalized = normalized.replace(/_/g, '-');
    
    // Remove any other invalid characters
    normalized = normalized.replace(/[^a-z0-9.-]/g, '-');
    
    // Remove consecutive hyphens
    normalized = normalized.replace(/-+/g, '-');
    
    // Remove leading/trailing hyphens
    normalized = normalized.replace(/^-+|-+$/g, '');
    
    return normalized;
  }

  shouldRename(fileName) {
    const normalized = this.normalizeImageFileName(fileName);
    return fileName !== normalized;
  }

  async findImageReferences(oldPath, newPath) {
    const references = [];
    
    // Search in frontmatter files
    const yamlFiles = await glob('frontmatter/materials/*.yaml');
    for (const yamlFile of yamlFiles) {
      try {
        const content = await fs.readFile(yamlFile, 'utf8');
        
        // Simple string search (faster than parsing YAML)
        if (content.includes(oldPath)) {
          references.push({
            file: yamlFile,
            type: 'frontmatter'
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Search in component files
    const componentFiles = await glob('app/components/**/*.{ts,tsx,js,jsx}');
    for (const componentFile of componentFiles) {
      try {
        const content = await fs.readFile(componentFile, 'utf8');
        if (content.includes(oldPath)) {
          references.push({
            file: componentFile,
            type: 'component'
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return references;
  }

  async updateFileReferences(oldPath, newPath) {
    const references = await this.findImageReferences(oldPath, newPath);
    
    for (const ref of references) {
      try {
        let content = await fs.readFile(ref.file, 'utf8');
        const updated = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
        
        if (content !== updated && !DRY_RUN) {
          await fs.writeFile(ref.file, updated, 'utf8');
          this.references.push({
            file: path.relative(process.cwd(), ref.file),
            oldPath,
            newPath
          });
        } else if (content !== updated) {
          this.references.push({
            file: path.relative(process.cwd(), ref.file),
            oldPath,
            newPath,
            dryRun: true
          });
        }
      } catch (error) {
        this.errors.push({
          file: ref.file,
          error: `Failed to update references: ${error.message}`
        });
      }
    }
  }

  async renameImage(filePath) {
    try {
      const dir = path.dirname(filePath);
      const fileName = path.basename(filePath);
      const normalizedName = this.normalizeImageFileName(fileName);

      if (fileName === normalizedName) {
        return false; // No rename needed
      }

      const newPath = path.join(dir, normalizedName);
      
      // Check if target file already exists
      try {
        await fs.access(newPath);
        this.errors.push({
          file: filePath,
          error: `Target file already exists: ${normalizedName}`
        });
        return false;
      } catch {
        // Target doesn't exist, proceed
      }

      // Calculate relative paths for references
      const oldRelPath = '/' + path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/');
      const newRelPath = '/' + path.relative(path.join(process.cwd(), 'public'), newPath).replace(/\\/g, '/');

      // Find and update references
      await this.updateFileReferences(oldRelPath, newRelPath);

      this.renames.push({
        oldPath: path.relative(process.cwd(), filePath),
        newPath: path.relative(process.cwd(), newPath),
        oldName: fileName,
        newName: normalizedName
      });

      // Perform the rename
      if (!DRY_RUN) {
        await fs.rename(filePath, newPath);
      }

      return true;
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message
      });
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📋 IMAGE FILE RENAMING REPORT');
    console.log('='.repeat(70) + '\n');

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    console.log(`Files to rename: ${this.renames.length}`);
    console.log(`References to update: ${this.references.length}`);
    console.log(`Errors: ${this.errors.length}\n`);

    if (this.renames.length > 0) {
      console.log('📝 RENAMES:\n');
      
      // Group by directory
      const byDir = {};
      this.renames.forEach(rename => {
        const dir = path.dirname(rename.oldPath);
        if (!byDir[dir]) byDir[dir] = [];
        byDir[dir].push(rename);
      });

      Object.entries(byDir).forEach(([dir, renames]) => {
        console.log(`  ${dir}/ (${renames.length} files):`);
        renames.slice(0, 5).forEach(rename => {
          console.log(`    • ${rename.oldName} → ${rename.newName}`);
        });
        if (renames.length > 5) {
          console.log(`    ... and ${renames.length - 5} more`);
        }
        console.log();
      });
    }

    if (this.references.length > 0) {
      console.log('🔗 REFERENCES UPDATED:\n');
      
      const uniqueFiles = [...new Set(this.references.map(r => r.file))];
      console.log(`  ${uniqueFiles.length} files with updated references`);
      uniqueFiles.slice(0, 10).forEach(file => {
        console.log(`    • ${file}`);
      });
      if (uniqueFiles.length > 10) {
        console.log(`    ... and ${uniqueFiles.length - 10} more`);
      }
      console.log();
    }

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      this.errors.forEach(error => {
        console.log(`  • ${path.basename(error.file)}: ${error.error}`);
      });
      console.log();
    }

    if (this.renames.length === 0 && this.errors.length === 0) {
      console.log('✅ All image files are already normalized!\n');
    } else if (!DRY_RUN && this.renames.length > 0) {
      console.log(`✅ Successfully renamed ${this.renames.length} images and updated ${this.references.length} references!\n`);
      console.log('⚠️  IMPORTANT: Commit changes and verify image paths are working correctly\n');
    } else if (DRY_RUN && this.renames.length > 0) {
      console.log(`📊 Run without --dry-run to apply these ${this.renames.length} changes\n`);
    }
  }

  async run() {
    console.log('🚀 Starting image file renaming...\n');

    const imageFiles = await glob('public/images/**/*.{jpg,jpeg,png,webp,svg}');
    console.log(`📁 Found ${imageFiles.length} image files\n`);

    let processed = 0;
    let renamed = 0;

    // First, identify files that need renaming
    const filesToRename = [];
    for (const filePath of imageFiles) {
      const fileName = path.basename(filePath);
      if (this.shouldRename(fileName)) {
        filesToRename.push(filePath);
      }
      processed++;
    }

    console.log(`   Found ${filesToRename.length} files that need renaming\n`);

    // Process renames
    processed = 0;
    for (const filePath of filesToRename) {
      const wasRenamed = await this.renameImage(filePath);
      processed++;
      if (wasRenamed) renamed++;

      if (processed % 10 === 0 || processed === filesToRename.length) {
        process.stdout.write(`\r   Renaming: ${processed}/${filesToRename.length} (${renamed} renamed)`);
      }
    }

    if (filesToRename.length > 0) {
      console.log(`\n`);
    }

    this.generateReport();
  }
}

// Run renaming
const renamer = new ImageRenamer();
renamer.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
