#!/usr/bin/env node
/**
 * Author ID Conversion Script
 * 
 * Converts numeric author IDs to slug-based IDs in frontmatter YAML files
 * Maps: 1 → todd-dunning, 2 → alessandro-moretti, etc.
 * 
 * Run: node scripts/convert-author-ids.js
 * Dry run: node scripts/convert-author-ids.js --dry-run
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

const DRY_RUN = process.argv.includes('--dry-run');

// Author ID mapping (from numeric to slug)
const AUTHOR_ID_MAP = {
  1: 'todd-dunning',
  2: 'alessandro-moretti',
  3: 'hiroshi-tanaka',
  4: 'ikmanda-roswati',
  '1': 'todd-dunning',
  '2': 'alessandro-moretti',
  '3': 'hiroshi-tanaka',
  '4': 'ikmanda-roswati'
};

// Author name to slug mapping (fallback)
const AUTHOR_NAME_MAP = {
  'Todd Dunning': 'todd-dunning',
  'Alessandro Moretti': 'alessandro-moretti',
  'Hiroshi Tanaka': 'hiroshi-tanaka',
  'Ikmanda Roswati': 'ikmanda-roswati'
};

class AuthorIdConverter {
  constructor() {
    this.changes = [];
    this.errors = [];
    this.warnings = [];
  }

  normalizeAuthorId(authorId, authorName) {
    // If it's already a valid slug, keep it
    if (typeof authorId === 'string' && /^[a-z-]+$/.test(authorId) && !authorId.match(/^\d+$/)) {
      return authorId;
    }

    // Convert numeric ID
    if (AUTHOR_ID_MAP[authorId]) {
      return AUTHOR_ID_MAP[authorId];
    }

    // Try to convert from author name
    if (authorName && AUTHOR_NAME_MAP[authorName]) {
      return AUTHOR_NAME_MAP[authorName];
    }

    // If we can't convert, return null to trigger warning
    return null;
  }

  async convertFile(filePath) {
    try {
      const fileName = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      const data = yaml.load(content);
      let modified = false;

      if (data.author) {
        const authorObj = typeof data.author === 'object' ? data.author : { id: data.author };
        const oldId = authorObj.id;
        const authorName = authorObj.name;

        if (oldId) {
          const newId = this.normalizeAuthorId(oldId, authorName);

          if (newId && newId !== oldId) {
            this.changes.push({
              file: fileName,
              oldId: oldId,
              newId: newId,
              authorName: authorName || 'Unknown'
            });

            // Update the author object
            if (typeof data.author === 'object') {
              data.author.id = newId;
            } else {
              data.author = newId;
            }

            modified = true;
          } else if (!newId) {
            this.warnings.push({
              file: fileName,
              authorId: oldId,
              authorName: authorName || 'Unknown',
              message: 'Unable to convert author ID automatically'
            });
          }
        }
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
    console.log('📋 AUTHOR ID CONVERSION REPORT');
    console.log('='.repeat(70) + '\n');

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    console.log(`Changes to apply: ${this.changes.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Errors: ${this.errors.length}\n`);

    if (this.changes.length > 0) {
      console.log('📝 CONVERSIONS:\n');
      
      // Group by new ID
      const byNewId = {};
      this.changes.forEach(change => {
        if (!byNewId[change.newId]) byNewId[change.newId] = [];
        byNewId[change.newId].push(change);
      });

      Object.entries(byNewId).forEach(([newId, changes]) => {
        console.log(`  → ${newId} (${changes.length} files):`);
        changes.slice(0, 5).forEach(change => {
          console.log(`    • ${change.file}: ${change.oldId} → ${change.newId} (${change.authorName})`);
        });
        if (changes.length > 5) {
          console.log(`    ... and ${changes.length - 5} more`);
        }
        console.log();
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.slice(0, 10).forEach(warning => {
        console.log(`  • ${warning.file}: ${warning.message}`);
        console.log(`    Author ID: ${warning.authorId}, Name: ${warning.authorName}`);
      });
      if (this.warnings.length > 10) {
        console.log(`  ... and ${this.warnings.length - 10} more warnings`);
      }
      console.log();
    }

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
      this.errors.forEach(error => {
        console.log(`  • ${error.file}: ${error.error}`);
      });
      console.log();
    }

    if (this.changes.length === 0 && this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ All author IDs are already normalized!\n');
    } else if (!DRY_RUN && this.changes.length > 0) {
      console.log(`✅ Successfully converted ${this.changes.length} author IDs!\n`);
    } else if (DRY_RUN && this.changes.length > 0) {
      console.log(`📊 Run without --dry-run to apply these ${this.changes.length} changes\n`);
    }

    if (this.warnings.length > 0) {
      console.log('💡 TIP: Review warnings and update AUTHOR_ID_MAP if needed\n');
    }
  }

  async run() {
    console.log('🚀 Starting author ID conversion...\n');

    const yamlFiles = await glob('content/frontmatter/*.yaml');
    console.log(`📁 Found ${yamlFiles.length} frontmatter files\n`);

    let processed = 0;
    let modified = 0;

    for (const filePath of yamlFiles) {
      const wasModified = await this.convertFile(filePath);
      processed++;
      if (wasModified) modified++;

      if (processed % 20 === 0) {
        process.stdout.write(`\r   Processing: ${processed}/${yamlFiles.length} (${modified} converted)`);
      }
    }

    console.log(`\r   Processing: ${processed}/${yamlFiles.length} (${modified} converted)\n`);

    this.generateReport();
  }
}

// Run conversion
const converter = new AuthorIdConverter();
converter.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
