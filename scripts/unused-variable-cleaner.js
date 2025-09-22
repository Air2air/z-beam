#!/usr/bin/env node

/**
 * AUTOMATED UNUSED VARIABLE CLEANER
 * =================================
 * 
 * This script safely removes unused variables, imports, and assignments
 * that are flagged by ESLint but don't affect functionality.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UnusedVariableCleaner {
  constructor() {
    this.fixesApplied = [];
    this.safeRemovalPatterns = [
      // Safe import removals
      {
        pattern: /import\s+\{\s*(\w+)\s*\}\s+from\s+['"'][^'"]+['"];?\s*\n/g,
        description: 'Unused import removal',
        verify: (match, content) => this.isImportUnused(match[1], content)
      },
      
      // Safe variable declaration removals
      {
        pattern: /^\s*const\s+(\w+)\s*=\s*[^;]+;?\s*\n/gm,
        description: 'Unused const declaration removal',
        verify: (match, content) => this.isVariableUnused(match[1], content)
      },
      
      // Safe destructuring removals
      {
        pattern: /^\s*const\s*\{\s*(\w+)(?:\s*,\s*\w+)*\s*\}\s*=\s*[^;]+;?\s*\n/gm,
        description: 'Unused destructuring removal',
        verify: (match, content) => this.isDestructuredVariableUnused(match[1], content)
      }
    ];
  }

  isImportUnused(importName, content) {
    // Check if import is used anywhere in the file
    const usagePattern = new RegExp(`\\b${importName}\\b`, 'g');
    const matches = content.match(usagePattern) || [];
    return matches.length <= 1; // Only the import declaration itself
  }

  isVariableUnused(variableName, content) {
    // Check if variable is used anywhere after declaration
    const lines = content.split('\n');
    let declarationLineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`const ${variableName}`)) {
        declarationLineIndex = i;
        break;
      }
    }
    
    if (declarationLineIndex === -1) return false;
    
    // Check usage after declaration
    const afterDeclaration = lines.slice(declarationLineIndex + 1).join('\n');
    const usagePattern = new RegExp(`\\b${variableName}\\b`, 'g');
    return !(usagePattern.test(afterDeclaration));
  }

  isDestructuredVariableUnused(variableName, content) {
    return this.isVariableUnused(variableName, content);
  }

  async cleanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileFixesApplied = 0;

    // Apply safe removal patterns
    for (const pattern of this.safeRemovalPatterns) {
      const matches = [...content.matchAll(pattern.pattern)];
      
      for (const match of matches) {
        if (pattern.verify(match, content)) {
          content = content.replace(match[0], '');
          fileFixesApplied++;
          
          this.fixesApplied.push({
            file: filePath,
            type: pattern.description,
            removed: match[0].trim()
          });
        }
      }
    }

    // Remove specific known unused variables based on ESLint output
    const knownUnusedVars = [
      'AuthorData', 'showBio', 'showEmail', 'showLinkedIn',
      'content', 'materialType', 'isFeatured', 'error',
      'heading', 'getArticleBySlug', 'Article', 'Card',
      'tagItemCounts', 'createMetadata', 'useEffect',
      'inferTags', 'title', '_', 'matterError',
      'MaterialProperties', 'articlesWithTags'
    ];

    for (const varName of knownUnusedVars) {
      // Remove unused variable declarations
      const varPattern = new RegExp(`^\\s*const\\s+${varName}\\s*=\\s*[^;\\n]+;?\\s*\\n`, 'gm');
      if (varPattern.test(content) && this.isVariableUnused(varName, content)) {
        content = content.replace(varPattern, '');
        fileFixesApplied++;
        
        this.fixesApplied.push({
          file: filePath,
          type: 'Known unused variable removal',
          removed: varName
        });
      }

      // Remove unused destructured variables
      const destructurePattern = new RegExp(`^\\s*const\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*=\\s*[^;\\n]+;?\\s*\\n`, 'gm');
      if (destructurePattern.test(content) && this.isVariableUnused(varName, content)) {
        const match = content.match(destructurePattern);
        if (match) {
          // Only remove if it's the only variable in the destructuring
          const destructuredVars = match[0].match(/\{([^}]+)\}/)[1].split(',').map(v => v.trim());
          if (destructuredVars.length === 1 && destructuredVars[0] === varName) {
            content = content.replace(destructurePattern, '');
            fileFixesApplied++;
            
            this.fixesApplied.push({
              file: filePath,
              type: 'Unused destructured variable removal',
              removed: varName
            });
          }
        }
      }

      // Remove unused imports
      const importPattern = new RegExp(`import\\s*\\{[^}]*\\b${varName}\\b[^}]*\\}\\s*from\\s*['"'][^'"]+['"];?\\s*\\n`, 'g');
      if (importPattern.test(content) && this.isImportUnused(varName, content)) {
        content = content.replace(importPattern, '');
        fileFixesApplied++;
        
        this.fixesApplied.push({
          file: filePath,
          type: 'Unused import removal',
          removed: varName
        });
      }
    }

    // Write back only if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Cleaned ${fileFixesApplied} unused variables from ${path.basename(filePath)}`);
      return fileFixesApplied;
    } else {
      console.log(`  ℹ️  No unused variables found in ${path.basename(filePath)}`);
      return 0;
    }
  }

  async cleanAllFiles() {
    console.log('🧹 AUTOMATED UNUSED VARIABLE CLEANUP');
    console.log('====================================\n');

    const filesToClean = [
      'app/components/Author/Author.tsx',
      'app/components/BadgeSymbol/BadgeSymbol.tsx',
      'app/components/Card/Card.tsx',
      'app/components/List/List.tsx',
      'app/components/SectionCard/SectionCardList.tsx',
      'app/components/Thumbnail/Thumbnail.tsx',
      'app/components/UI/TagFilter.tsx',
      'app/contact/page.tsx',
      'app/search/search-client.tsx',
      'app/services/page.tsx',
      'app/utils/articleEnrichment.ts',
      'app/utils/badgeDataLoader.ts',
      'app/utils/badgeUtils.ts',
      'app/utils/formatting.ts',
      'app/utils/contentAPI.ts',
      'app/utils/searchUtils.ts',
      'app/utils/tagDebug.ts'
    ];

    let totalFilesProcessed = 0;
    let totalFixesApplied = 0;

    for (const file of filesToClean) {
      const filePath = path.join(process.cwd(), file);
      const fixes = await this.cleanFile(filePath);
      if (fixes > 0) {
        totalFilesProcessed++;
        totalFixesApplied += fixes;
      }
    }

    console.log(`\n📊 CLEANUP SUMMARY:`);
    console.log(`  • Files processed: ${totalFilesProcessed}`);
    console.log(`  • Total variables removed: ${totalFixesApplied}`);
    console.log(`  • Expected lint warning reduction: ~${Math.min(totalFixesApplied * 2, 30)}`);
    
    return { filesProcessed: totalFilesProcessed, fixesApplied: totalFixesApplied };
  }

  async testAfterCleanup() {
    console.log('\n🔍 Testing after cleanup...');
    
    try {
      // Test TypeScript compilation
      execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
      console.log('  ✅ TypeScript compilation: PASSED');
    } catch (error) {
      console.log('  ❌ TypeScript compilation: ISSUES DETECTED');
      return false;
    }

    try {
      // Count remaining lint warnings
      const lintOutput = execSync('npm run fix:lint 2>&1', { encoding: 'utf8' });
      const warningCount = (lintOutput.match(/Warning:/g) || []).length;
      console.log(`  📊 Remaining ESLint warnings: ${warningCount}`);
    } catch (error) {
      console.log('  ⚠️  ESLint check: Unable to count warnings');
    }

    return true;
  }
}

async function main() {
  const cleaner = new UnusedVariableCleaner();
  
  const results = await cleaner.cleanAllFiles();
  const testPassed = await cleaner.testAfterCleanup();
  
  if (testPassed) {
    console.log('\n✅ PHASE 1 COMPLETE: Unused variable cleanup successful!');
    console.log('🎯 Next steps: Run "npm run validate" to verify all systems work correctly.');
  } else {
    console.log('\n❌ PHASE 1 INCOMPLETE: Issues detected after cleanup.');
    console.log('🔄 Manual review may be required.');
  }
}

if (require.main === module) {
  main();
}
