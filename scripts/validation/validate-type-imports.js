#!/usr/bin/env node
/**
 * Type Import Validation
 * 
 * Enforces centralized type system usage:
 * - All shared types must import from @/types
 * - No duplicate type definitions (IconProps, BadgeProps, etc.)
 * - Validates type consolidation compliance
 * 
 * Part of pre-deployment validation pipeline.
 * 
 * Usage: node scripts/validation/validate-type-imports.js
 * Exit codes: 0 = pass, 1 = violations found
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.vercel/**',
  '**/types/**',  // Don't check the types directory itself
  '**/*.test.ts',
  '**/*.test.tsx'
];

// Centralized types that should NEVER be redefined
const FORBIDDEN_REDEFINITIONS = [
  'IconProps',
  'BadgeProps',
  'CardProps',
  'ButtonProps',
  'Author',
  'ArticleMetadata',
  'GridItem',
  'MaterialProperties',
  'ContaminantProperties',
  'Metadata'
];

// Results tracking
const results = {
  duplicateTypes: [],
  missingImports: [],
  localTypeDefinitions: [],
  totalFiles: 0,
  filesScanned: 0
};

// Color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Check for duplicate type definitions
 */
function checkDuplicateTypes(filePath, content) {
  const violations = [];
  
  FORBIDDEN_REDEFINITIONS.forEach(typeName => {
    // Match interface/type definitions
    const interfaceRegex = new RegExp(`(?:interface|type)\\s+${typeName}\\s*[={]`, 'g');
    const matches = content.matchAll(interfaceRegex);
    
    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      violations.push({
        file: filePath,
        line: lineNumber,
        typeName,
        code: match[0],
        message: `Duplicate definition of '${typeName}' - must import from @/types instead`
      });
    }
  });
  
  return violations;
}

/**
 * Check if file uses centralized types but doesn't import them
 */
function checkMissingImports(filePath, content) {
  const violations = [];
  
  // Check if file has any imports from @/types or Next.js types
  const hasTypeImport = /from\s+['"]@\/types/.test(content);
  const hasNextTypeImport = /from\s+['"]next\/types/.test(content);
  
  // Check if file imports from a local types file that re-exports from @/types
  const hasLocalTypeReexport = /from\s+['"]\.[^'"]*types['"]/.test(content);
  
  if (!hasTypeImport && !hasNextTypeImport && !hasLocalTypeReexport) {
    // Check if file uses any of the centralized types
    FORBIDDEN_REDEFINITIONS.forEach(typeName => {
      // Skip Metadata check if importing from next/types (Next.js convention)
      if (typeName === 'Metadata' && hasNextTypeImport) {
        return;
      }
      
      // Look for usage of the type (not definition)
      const usageRegex = new RegExp(`:\\s*${typeName}(?![a-zA-Z])|<${typeName}>|extends\\s+${typeName}`, 'g');
      const matches = content.matchAll(usageRegex);
      
      for (const match of matches) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        // Make sure this isn't a definition
        const line = content.split('\n')[lineNumber - 1];
        if (!/(?:interface|type)\s+\w+/.test(line)) {
          violations.push({
            file: filePath,
            line: lineNumber,
            typeName,
            code: line.trim(),
            message: `Using '${typeName}' without importing from @/types`
          });
          break; // Only report once per type per file
        }
      }
    });
  }
  
  return violations;
}

/**
 * Check for local Props definitions that could be centralized
 */
function checkLocalTypeDefinitions(filePath, content) {
  const suggestions = [];
  
  // Look for Props interfaces in component files
  if (filePath.includes('/components/') || filePath.includes('/app/')) {
    const propsRegex = /(?:interface|type)\s+(\w+Props)\s*[={]/g;
    const matches = content.matchAll(propsRegex);
    
    for (const match of matches) {
      const typeName = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      // Check if this Props type is exported
      const isExported = new RegExp(`export\\s+(?:interface|type)\\s+${typeName}`).test(content);
      
      if (isExported && !FORBIDDEN_REDEFINITIONS.includes(typeName)) {
        // This is an exported Props type that might be reusable
        suggestions.push({
          file: filePath,
          line: lineNumber,
          typeName,
          message: `Consider moving '${typeName}' to types/centralized.ts if used by multiple components`
        });
      }
    }
  }
  
  return suggestions;
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    results.filesScanned++;
    
    // Skip files with @ts-nocheck (migration scripts, etc.)
    if (/@ts-nocheck/.test(content)) {
      return;
    }
    
    // Run checks
    const duplicates = checkDuplicateTypes(filePath, content);
    const missingImports = checkMissingImports(filePath, content);
    const localTypes = checkLocalTypeDefinitions(filePath, content);
    
    // Collect violations
    results.duplicateTypes.push(...duplicates);
    results.missingImports.push(...missingImports);
    results.localTypeDefinitions.push(...localTypes);
    
  } catch (error) {
    console.error(`${RED}Error scanning ${filePath}:${RESET}`, error.message);
  }
}

/**
 * Main validation function
 */
function validateTypeImports() {
  console.log(`${BLUE}🔍 Type Import Validation${RESET}\n`);
  
  // Find all TypeScript files
  const files = glob.sync('**/*.{ts,tsx}', {
    ignore: EXCLUDE_PATTERNS,
    cwd: process.cwd(),
    absolute: true
  });
  
  results.totalFiles = files.length;
  console.log(`📂 Scanning ${files.length} TypeScript files...\n`);
  
  // Scan each file
  files.forEach(scanFile);
  
  // Report results
  console.log(`${BLUE}📊 Scan Results:${RESET}`);
  console.log(`   Files scanned: ${results.filesScanned}`);
  console.log();
  
  let hasViolations = false;
  
  // Report duplicate type violations
  if (results.duplicateTypes.length > 0) {
    hasViolations = true;
    console.log(`${RED}❌ Duplicate Type Definitions (${results.duplicateTypes.length} violations):${RESET}`);
    console.log(`   ${RED}CRITICAL: These types must ONLY exist in types/centralized.ts${RESET}\n`);
    results.duplicateTypes.forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      ${v.code}`);
      console.log(`      → ${v.message}\n`);
    });
  }
  
  // Report missing import violations
  if (results.missingImports.length > 0) {
    hasViolations = true;
    console.log(`${RED}❌ Missing Type Imports (${results.missingImports.length} violations):${RESET}`);
    results.missingImports.forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      ${v.code}`);
      console.log(`      → ${v.message}\n`);
    });
  }
  
  // Report local type suggestions (warnings only)
  if (results.localTypeDefinitions.length > 0) {
    console.log(`${YELLOW}ℹ️  Local Type Definitions (${results.localTypeDefinitions.length} suggestions):${RESET}`);
    console.log(`   Consider centralizing frequently-used types\n`);
    results.localTypeDefinitions.slice(0, 10).forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      → ${v.message}\n`);
    });
    if (results.localTypeDefinitions.length > 10) {
      console.log(`   ... and ${results.localTypeDefinitions.length - 10} more\n`);
    }
  }
  
  // Summary
  if (!hasViolations) {
    console.log(`${GREEN}✅ All type import checks passed!${RESET}\n`);
    return 0;
  } else {
    console.log(`${RED}❌ Found ${results.duplicateTypes.length + results.missingImports.length} type system violations${RESET}\n`);
    console.log(`${BLUE}📖 See docs/08-development/TYPE_CONSOLIDATION_DEC21_2025.md for guidance${RESET}\n`);
    console.log(`${BLUE}🔧 Required actions:${RESET}`);
    console.log(`   1. Remove duplicate type definitions`);
    console.log(`   2. Add: import type { ... } from '@/types';`);
    console.log(`   3. Use centralized types from types/centralized.ts\n`);
    return 1;
  }
}

// Run validation
const exitCode = validateTypeImports();
process.exit(exitCode);
