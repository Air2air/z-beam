#!/usr/bin/env node

/**
 * CONSERVATIVE UNUSED VARIABLE CLEANER
 * ====================================
 * 
 * This script safely removes only assignment-style unused variables
 * without touching imports, types, or function parameters.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConservativeUnusedCleaner {
  constructor() {
    this.fixesApplied = [];
    this.safePatterns = [
      // Only remove simple unused assignments that ESLint specifically flags
      { file: 'app/components/Author/Author.tsx', patterns: [
        { search: /\s*const\s+showBio\s*=\s*[^;]+;\s*\n/g, name: 'showBio' },
        { search: /\s*const\s+showEmail\s*=\s*[^;]+;\s*\n/g, name: 'showEmail' },
        { search: /\s*const\s+showLinkedIn\s*=\s*[^;]+;\s*\n/g, name: 'showLinkedIn' }
      ]},
      { file: 'app/components/BadgeSymbol/BadgeSymbol.tsx', patterns: [
        { search: /\s*const\s+materialType\s*=\s*[^;]+;\s*\n/g, name: 'materialType' }
      ]},
      { file: 'app/components/Card/Card.tsx', patterns: [
        { search: /\s*const\s+isFeatured\s*=\s*[^;]+;\s*\n/g, name: 'isFeatured' }
      ]},
      { file: 'app/components/List/List.tsx', patterns: [
        { search: /\s*const\s+error\s*=\s*[^;]+;\s*\n/g, name: 'error' }
      ]},
      { file: 'app/components/SectionCard/SectionCardList.tsx', patterns: [
        { search: /\s*const\s+heading\s*=\s*[^;]+;\s*\n/g, name: 'heading' }
      ]},
      { file: 'app/components/UI/TagFilter.tsx', patterns: [
        { search: /\s*const\s+tagItemCounts\s*=\s*[^;]+;\s*\n/g, name: 'tagItemCounts' }
      ]},
      { file: 'app/utils/badgeUtils.ts', patterns: [
        { search: /\s*const\s+title\s*=\s*[^;]+;\s*\n/g, name: 'title' }
      ]},
      { file: 'app/utils/formatting.ts', patterns: [
        { search: /\s*const\s+_\s*=\s*[^;]+;\s*\n/g, name: '_' }
      ]},
      { file: 'app/utils/frontmatterLoader.ts', patterns: [
        { search: /\s*const\s+matterError\s*=\s*[^;]+;\s*\n/g, name: 'matterError' }
      ]},
      { file: 'app/utils/tagDebug.ts', patterns: [
        { search: /\s*const\s+articlesWithTags\s*=\s*[^;]+;\s*\n/g, name: 'articlesWithTags' }
      ]}
    ];
  }

  async cleanFile(fileConfig) {
    const filePath = path.join(process.cwd(), fileConfig.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${fileConfig.file}`);
      return 0;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let cleanedCount = 0;

    for (const pattern of fileConfig.patterns) {
      const matches = content.match(pattern.search);
      if (matches) {
        // Verify the variable is truly unused (not referenced after assignment)
        const lines = content.split('\n');
        let isUnused = true;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes(`const ${pattern.name} =`)) {
            // Check if variable is used in subsequent lines
            const afterAssignment = lines.slice(i + 1).join('\n');
            const usageRegex = new RegExp(`\\b${pattern.name}\\b`, 'g');
            if (usageRegex.test(afterAssignment)) {
              isUnused = false;
              break;
            }
          }
        }
        
        if (isUnused) {
          content = content.replace(pattern.search, '');
          cleanedCount++;
          this.fixesApplied.push({
            file: fileConfig.file,
            variable: pattern.name
          });
        }
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Removed ${cleanedCount} unused variables from ${path.basename(filePath)}`);
    } else {
      console.log(`  ℹ️  No changes needed in ${path.basename(filePath)}`);
    }

    return cleanedCount;
  }

  async cleanAllFiles() {
    console.log('🧹 CONSERVATIVE UNUSED VARIABLE CLEANUP');
    console.log('=======================================\n');

    let totalCleaned = 0;

    for (const fileConfig of this.safePatterns) {
      const cleaned = await this.cleanFile(fileConfig);
      totalCleaned += cleaned;
    }

    console.log(`\n📊 CLEANUP SUMMARY:`);
    console.log(`  • Variables removed: ${totalCleaned}`);
    console.log(`  • Files modified: ${this.fixesApplied.length > 0 ? new Set(this.fixesApplied.map(f => f.file)).size : 0}`);
    
    return totalCleaned;
  }

  async verifyChanges() {
    console.log('\n🔍 Verifying changes...');
    
    try {
      // Test TypeScript compilation
      execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
      console.log('  ✅ TypeScript compilation: PASSED');
      
      // Test lint improvements
      const lintOutput = execSync('npm run fix:lint 2>&1', { encoding: 'utf8' });
      const warningCount = (lintOutput.match(/Warning:/g) || []).length;
      console.log(`  📊 Remaining ESLint warnings: ${warningCount}`);
      
      return true;
    } catch (error) {
      console.log('  ❌ Verification failed');
      console.log('  🔄 Changes may need to be reverted');
      return false;
    }
  }
}

async function main() {
  const cleaner = new ConservativeUnusedCleaner();
  
  const totalCleaned = await cleaner.cleanAllFiles();
  const verified = await cleaner.verifyChanges();
  
  if (verified && totalCleaned > 0) {
    console.log('\n✅ CONSERVATIVE CLEANUP SUCCESSFUL!');
    console.log(`🎯 Removed ${totalCleaned} unused variables safely.`);
    console.log('🔧 Run "npm run validate" to see the full impact.');
  } else if (totalCleaned === 0) {
    console.log('\n✅ NO UNUSED VARIABLES FOUND');
    console.log('🎯 All variables are already being used appropriately.');
  } else {
    console.log('\n❌ CLEANUP FAILED VERIFICATION');
    console.log('🔄 Consider manual review of changes.');
  }
}

if (require.main === module) {
  main();
}
