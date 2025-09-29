#!/usr/bin/env node
// Enhanced TypeScript "any" type auto-fixer
// This script intelligently replaces 'any' types with more specific TypeScript types

const fs = require('fs');
const path = require('path');

console.log('🔧 TYPESCRIPT "ANY" TYPE AUTO-FIXER');
console.log('==================================\n');

class TypeScriptAnyFixer {
  constructor() {
    this.fixesApplied = [];
    this.errors = [];
    this.workspaceRoot = process.cwd();
  }

  // Define intelligent type replacements based on context
  getIntelligentTypeReplacements() {
    return [
      // Metadata and data objects
      {
        pattern: /metadata\?\s*:\s*any/g,
        replacement: 'metadata?: Record<string, unknown>',
        context: 'metadata objects'
      },
      {
        pattern: /config\?\s*:\s*any/g,
        replacement: 'config?: Record<string, unknown>',
        context: 'config objects'
      },
      {
        pattern: /frontmatter\?\s*:\s*any/g,
        replacement: 'frontmatter?: Record<string, unknown>',
        context: 'frontmatter objects'
      },
      
      // Function parameters
      {
        pattern: /function\s+\w+\([^)]*item:\s*any/g,
        replacement: (match) => match.replace(': any', ': Record<string, unknown>'),
        context: 'function parameters (item)'
      },
      {
        pattern: /function\s+\w+\([^)]*article:\s*any/g,
        replacement: (match) => match.replace(': any', ': Record<string, unknown>'),
        context: 'function parameters (article)'
      },
      {
        pattern: /function\s+\w+\([^)]*params:\s*any/g,
        replacement: (match) => match.replace(': any', ': Record<string, unknown>'),
        context: 'function parameters (params)'
      },
      
      // Array types
      {
        pattern: /:\s*any\[\]/g,
        replacement: ': unknown[]',
        context: 'array types'
      },
      
      // Object index signatures
      {
        pattern: /\[key:\s*string\]:\s*any/g,
        replacement: '[key: string]: unknown',
        context: 'object index signatures'
      },
      
      // Function return types
      {
        pattern: /\)\s*:\s*any\s*\{/g,
        replacement: '): unknown {',
        context: 'function return types'
      },
      
      // Generic type parameters
      {
        pattern: /<any>/g,
        replacement: '<unknown>',
        context: 'generic type parameters'
      },
      
      // Variable declarations
      {
        pattern: /const\s+\w+:\s*any\s*=/g,
        replacement: (match) => match.replace(': any', ': unknown'),
        context: 'const variable declarations'
      },
      {
        pattern: /let\s+\w+:\s*any\s*=/g,
        replacement: (match) => match.replace(': any', ': unknown'),
        context: 'let variable declarations'
      },
      
      // Interface and type properties
      {
        pattern: /^\s*\w+\?\s*:\s*any;?$/gm,
        replacement: (match) => match.replace(': any', ': unknown'),
        context: 'interface properties'
      }
    ];
  }

  // Get context-specific replacements for different file types
  getContextSpecificReplacements(filePath, content) {
    const contextReplacements = [];
    
    // React component specific types
    if (filePath.includes('components/') && filePath.endsWith('.tsx')) {
      contextReplacements.push(
        {
          pattern: /items:\s*any\[\]/g,
          replacement: 'items: React.ComponentProps<typeof Card>[]',
          context: 'React component props'
        }
      );
    }
    
    // Search/filter specific types
    if (filePath.includes('Search') || filePath.includes('Filter')) {
      contextReplacements.push(
        {
          pattern: /function\s+itemMatchesTag\(item:\s*any/g,
          replacement: 'function itemMatchesTag(item: { tags?: string[]; [key: string]: unknown }',
          context: 'search item matching'
        }
      );
    }
    
    // Utility function specific types
    if (filePath.includes('utils/')) {
      contextReplacements.push(
        {
          pattern: /export\s+function\s+\w+\([^)]*:\s*any/g,
          replacement: (match) => {
            if (match.includes('article:')) {
              return match.replace(': any', ': { metadata?: Record<string, unknown>; [key: string]: unknown }');
            } else if (match.includes('item:')) {
              return match.replace(': any', ': Record<string, unknown>');
            }
            return match.replace(': any', ': unknown');
          },
          context: 'utility function parameters'
        }
      );
    }
    
    // Metadata generation specific types
    if (filePath.includes('generateMetadata')) {
      contextReplacements.push(
        {
          pattern: /params:\s*any/g,
          replacement: 'params: { [key: string]: string | string[] }',
          context: 'Next.js metadata params'
        }
      );
    }
    
    return contextReplacements;
  }

  // Apply intelligent type fixes to a file
  async fixFileTypes(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesInFile = 0;
      
      // Get standard replacements
      const standardReplacements = this.getIntelligentTypeReplacements();
      
      // Get context-specific replacements
      const contextReplacements = this.getContextSpecificReplacements(filePath, content);
      
      // Combine all replacements
      const allReplacements = [...contextReplacements, ...standardReplacements];
      
      // Apply each replacement
      for (const replacement of allReplacements) {
        let newContent;
        
        if (typeof replacement.replacement === 'function') {
          newContent = content.replace(replacement.pattern, replacement.replacement);
        } else {
          newContent = content.replace(replacement.pattern, replacement.replacement);
        }
        
        if (newContent !== content) {
          const matches = content.match(replacement.pattern);
          if (matches) {
            fixesInFile += matches.length;
            console.log(`    🔧 Fixed ${matches.length} "${replacement.context}" in ${path.basename(filePath)}`);
          }
          content = newContent;
        }
      }
      
      // Apply additional intelligent fixes based on file analysis
      content = this.applyIntelligentFixes(filePath, content);
      
      // Write back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixesApplied.push({
          file: filePath,
          fixes: fixesInFile,
          timestamp: new Date().toISOString()
        });
        
        return fixesInFile;
      }
      
      return 0;
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.log(`    ❌ Error fixing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  // Apply intelligent context-aware fixes
  applyIntelligentFixes(filePath, content) {
    let fixedContent = content;
    
    // Fix React component prop types
    if (filePath.endsWith('.tsx') && content.includes('interface') && content.includes('Props')) {
      // Look for any types in Props interfaces and replace with more specific types
      fixedContent = fixedContent.replace(
        /(interface\s+\w*Props[^{]*{[^}]*)\bany\b/g,
        '$1Record<string, unknown>'
      );
    }
    
    // Fix debug page types with more specific interfaces
    if (filePath.includes('debug/page.tsx')) {
      fixedContent = fixedContent.replace(
        /thumbnails:\s*unknown\[\]/g,
        'thumbnails: Array<{ url: string; alt: string; slug: string }>'
      );
      fixedContent = fixedContent.replace(
        /images:\s*unknown\[\]/g,
        'images: Array<{ src: string; width: number; height: number }>'
      );
      fixedContent = fixedContent.replace(
        /materials:\s*unknown\[\]/g,
        'materials: Array<{ name: string; type: string; status: string; fallback?: string }>'
      );
      fixedContent = fixedContent.replace(
        /cards:\s*unknown\[\]/g,
        'cards: Array<{ title: string; type: string; status: string }>'
      );
      fixedContent = fixedContent.replace(
        /frontmatter:\s*unknown\[\]/g,
        'frontmatter: Array<Record<string, unknown>>'
      );
    }
    
    // Fix SearchResultsGrid component
    if (filePath.includes('SearchResultsGrid.tsx')) {
      fixedContent = fixedContent.replace(
        /items:\s*React\.ComponentProps<typeof Card>\[\]/g,
        'items: Array<{ slug: string; name?: string; title?: string; description?: string; image?: string; tags?: string[]; category?: string; articleType?: string; href: string; metadata?: Record<string, unknown> }>'
      );
    }
    
    // Fix utility function types with domain-specific interfaces
    if (filePath.includes('utils/searchUtils.ts')) {
      fixedContent = fixedContent.replace(
        /function\s+getDisplayName\(item:\s*\{[^}]+\}\)/g,
        'function getDisplayName(item: { name?: string; title?: string; slug: string; frontmatter?: Record<string, unknown> })'
      );
      fixedContent = fixedContent.replace(
        /function\s+getBadgeFromItem\(item:\s*\{[^}]+\}\)/g,
        'function getBadgeFromItem(item: { badge?: BadgeData; metadata?: Record<string, unknown>; slug?: string; frontmatter?: Record<string, unknown>; category?: string })'
      );
      fixedContent = fixedContent.replace(
        /function\s+getChemicalProperties\(item:\s*\{[^}]+\}\)/g,
        'function getChemicalProperties(item: { metadata?: Record<string, unknown>; frontmatter?: Record<string, unknown> })'
      );
    }
    
    // Fix badge utils with proper types
    if (filePath.includes('utils/badgeUtils.ts')) {
      fixedContent = fixedContent.replace(
        /function\s+getBadgeData\(item:\s*Record<string, unknown>/g,
        'function getBadgeData(item: { badge?: BadgeData; metadata?: Record<string, unknown>; frontmatter?: Record<string, unknown>; slug?: string; category?: string }'
      );
    }
    
    // Fix content utils with proper article types but keep flexibility
    if (filePath.includes('utils/contentAPI.ts')) {
      // Keep [key: string]: unknown for metadata flexibility but add specific known properties
      fixedContent = fixedContent.replace(
        /\[key: string\]: unknown; \/\/ Flexible metadata structure/g,
        '[key: string]: unknown'
      );
    }
    
    // Fix frontmatter loader with proper typing
    if (filePath.includes('utils/contentAPI.ts')) {
      fixedContent = fixedContent.replace(
        /const result:\s*unknown\s*=/g,
        'const result: Record<string, unknown> ='
      );
    }
    
    // Fix metadata utils
    if (filePath.includes('utils/metadata.ts')) {
      fixedContent = fixedContent.replace(
        /actualTitle:\s*unknown/g,
        'actualTitle: string'
      );
    }
    
    // Fix yaml sanitizer
    if (filePath.includes('utils/yamlSanitizer.ts')) {
      fixedContent = fixedContent.replace(
        /options\?\s*:\s*unknown/g,
        'options?: Record<string, unknown>'
      );
    }
    
    // Fix logger utility
    if (filePath.includes('utils/logger.ts')) {
      fixedContent = fixedContent.replace(
        /error\?\s*:\s*unknown/g,
        'error?: Error | string | unknown'
      );
    }
    
    return fixedContent;
  }

  // Get all TypeScript files that need fixing
  getAllTypeScriptFiles() {
    const files = [];
    const appDir = path.join(this.workspaceRoot, 'app');
    
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(appDir);
    return files;
  }

  // Run the complete fix process
  async runFixes() {
    console.log('🔍 Scanning for TypeScript files with "any" types...\n');
    
    const files = this.getAllTypeScriptFiles();
    const filesToFix = [];
    
    // First, find files that actually contain 'any' types
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(': any') || content.includes('<any>') || content.includes('any[]')) {
          filesToFix.push(file);
        }
      } catch (error) {
        console.log(`⚠️  Couldn't read ${file}: ${error.message}`);
      }
    }
    
    if (filesToFix.length === 0) {
      console.log('✅ No files with "any" types found!');
      return { totalFixes: 0, filesFixed: 0 };
    }
    
    console.log(`📁 Found ${filesToFix.length} files with "any" types to fix:`);
    filesToFix.forEach(file => {
      console.log(`   • ${path.relative(this.workspaceRoot, file)}`);
    });
    console.log('');
    
    // Apply fixes to each file
    let totalFixes = 0;
    let filesFixed = 0;
    
    for (const file of filesToFix) {
      console.log(`🔧 Fixing ${path.relative(this.workspaceRoot, file)}...`);
      const fixesInFile = await this.fixFileTypes(file);
      
      if (fixesInFile > 0) {
        totalFixes += fixesInFile;
        filesFixed++;
        console.log(`   ✅ Applied ${fixesInFile} fixes`);
      } else {
        console.log(`   ℹ️  No changes needed`);
      }
    }
    
    return { totalFixes, filesFixed, totalFiles: filesToFix.length };
  }

  // Generate a summary report
  generateReport(results) {
    console.log('\n📊 AUTO-FIX SUMMARY REPORT');
    console.log('==========================\n');
    
    console.log(`📁 Files processed: ${results.totalFiles}`);
    console.log(`🔧 Files modified: ${results.filesFixed}`);
    console.log(`✨ Total fixes applied: ${results.totalFixes}`);
    
    if (this.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => {
        console.log(`   • ${path.relative(this.workspaceRoot, error.file)}: ${error.error}`);
      });
    }
    
    if (this.fixesApplied.length > 0) {
      console.log('\n📋 Files successfully modified:');
      this.fixesApplied.forEach(fix => {
        console.log(`   • ${path.relative(this.workspaceRoot, fix.file)} (${fix.fixes} fixes)`);
      });
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: results,
      fixesApplied: this.fixesApplied,
      errors: this.errors
    };
    
    const reportPath = path.join(__dirname, 'any-type-fixes-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    if (results.totalFixes > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Review the changes to ensure they\'re correct');
      console.log('   2. Run TypeScript compilation to verify no errors');
      console.log('   3. Test your application to ensure functionality');
      console.log('   4. Commit the changes if everything looks good');
    }
    
    return report;
  }
}

// Main execution
async function main() {
  const fixer = new TypeScriptAnyFixer();
  
  try {
    console.log('🚀 Starting TypeScript "any" type auto-fixer...\n');
    
    const results = await fixer.runFixes();
    const report = fixer.generateReport(results);
    
    if (results.totalFixes > 0) {
      console.log('\n✅ Auto-fix completed successfully!');
      console.log('🔍 Run TypeScript compilation to verify the fixes.');
    } else {
      console.log('\n✨ No "any" types needed fixing!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Auto-fixer crashed:', error.message);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { TypeScriptAnyFixer };
