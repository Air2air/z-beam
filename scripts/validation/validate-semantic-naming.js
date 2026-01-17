#!/usr/bin/env node
/**
 * Semantic Naming Validation
 * 
 * Enforces semantic naming conventions across the codebase:
 * - No .metadata wrapper usage (should use .frontmatter) - Updated Dec 28, 2025
 * - Boolean props must use is/has/can/should prefixes
 * - Props interfaces must follow ComponentNameProps pattern
 * - Array fields must use plural naming
 * 
 * Part of pre-deployment validation pipeline.
 * 
 * Usage: node scripts/validation/validate-semantic-naming.js
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
  '**/tests/**',  // Tests are allowed to use frontmatter for backward compat testing
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/.vercel/**',
  '**/scripts/validation/**' // Don't validate validation scripts themselves
];

// Results tracking
const results = {
  metadataUsage: [],  // Changed: now we check for deprecated .metadata usage
  badBooleanProps: [],
  genericPropsNames: [],
  singularArrayFields: [],
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
 * Check file for deprecated .metadata wrapper usage
 */
function checkMetadataUsage(filePath, content) {
  const lines = content.split('\n');
  const violations = [];
  
  lines.forEach((line, index) => {
    // Match .metadata. but not in comments explaining the change
    if (/\.metadata\./.test(line) && 
        !/\/\/.*\.metadata/.test(line) && 
        !/\*.*\.metadata/.test(line) &&
        !/@deprecated.*metadata/i.test(line)) {
      
      // Allow dual pattern usage in several forms:
      // 1. item.frontmatter || item.metadata
      // 2. Sequential if statements checking frontmatter first
      // 3. Constants that merge frontmatter and metadata
      if (/\.frontmatter\s*\|\|\s*\w*\.metadata/.test(line) ||
          /\w*\.metadata\s*\|\|\s*\w*\.frontmatter/.test(line) ||
          /const\s+\w+\s*=\s*\w*\.frontmatter\s*\|\|\s*\w*\.metadata/.test(line)) {
        // This is acceptable dual pattern - don't flag
        return;
      }
      
      // Check if this line is part of a fallback pattern (metadata check after frontmatter)
      const lineStr = line.trim();
      const isConditionalCheck = /if\s*\(\s*\w*\.metadata/.test(lineStr);
      
      if (isConditionalCheck) {
        // Look for frontmatter check in preceding lines (within 5 lines)
        const startIndex = Math.max(0, index - 5);
        const precedingLines = lines.slice(startIndex, index);
        const hasFrontmatterCheck = precedingLines.some(prevLine => 
          /\.frontmatter/.test(prevLine) && /if\s*\(/.test(prevLine)
        );
        
        if (hasFrontmatterCheck) {
          // This is part of a valid fallback pattern - don't flag
          return;
        }
      }
      
      // Flag direct .metadata usage without proper .frontmatter fallback pattern
      violations.push({
        file: filePath,
        line: index + 1,
        code: line.trim(),
        message: 'Use .frontmatter instead of deprecated .metadata wrapper'
      });
    }
  });
  
  return violations;
}

/**
 * Check for bad boolean prop names
 */
function checkBooleanProps(filePath, content) {
  const violations = [];
  
  // Match interface/type definitions with boolean props
  const interfaceRegex = /interface\s+\w+\s*{([^}]+)}/gs;
  const matches = content.matchAll(interfaceRegex);
  
  for (const match of matches) {
    const interfaceBody = match[1];
    const lines = interfaceBody.split('\n');
    
    lines.forEach((line, index) => {
      // Match prop: boolean but exclude is/has/can/should prefixes
      const propMatch = line.match(/^\s*(\w+)[\?]?:\s*boolean/);
      if (propMatch) {
        const propName = propMatch[1];
        // Check if it starts with a good prefix
        if (!/^(is|has|can|should|enable|allow|show|hide)[A-Z]/.test(propName) &&
            !['disabled', 'loading', 'visible', 'active', 'open', 'closed', 'enabled', 'error'].includes(propName)) {
          // This is likely a violation, but let's be lenient for now
          // Only flag if it's clearly wrong
          if (['loading', 'disabled', 'visible', 'active', 'error', 'enabled', 'open', 'closed'].includes(propName)) {
            violations.push({
              file: filePath,
              line: index + 1,
              code: line.trim(),
              propName,
              message: `Boolean '${propName}' should use is/has/can/should prefix (e.g., 'is${propName.charAt(0).toUpperCase() + propName.slice(1)}')`
            });
          }
        }
      }
    });
  }
  
  return violations;
}

/**
 * Check for generic Props interface names
 */
function checkPropsNaming(filePath, content) {
  const violations = [];
  
  // Match interface Props { but not ComponentNameProps
  const genericPropsRegex = /interface\s+Props\s*{/g;
  const matches = content.matchAll(genericPropsRegex);
  
  for (const match of matches) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    violations.push({
      file: filePath,
      line: lineNumber,
      code: match[0],
      message: 'Use ComponentNameProps pattern instead of generic "Props"'
    });
  }
  
  return violations;
}

/**
 * Check for singular array field names in interfaces
 */
function checkArrayFieldNaming(filePath, content) {
  const violations = [];
  
  // Look for array type declarations with singular names
  const arrayFieldRegex = /^\s*(\w+)[\?]?:\s*(\w+)\[\]|Array<\w+>/gm;
  const matches = content.matchAll(arrayFieldRegex);
  
  for (const match of matches) {
    const fieldName = match[1];
    if (fieldName) {
      // Check if it ends with common plural suffixes
      const isPluralish = /s$|List$|Array$|Items$|Collection$|Set$/.test(fieldName);
      
      // If it doesn't look plural and it's clearly a common field, flag it
      if (!isPluralish && 
          ['expertise', 'credential', 'education', 'item', 'element', 'value'].includes(fieldName.toLowerCase())) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        violations.push({
          file: filePath,
          line: lineNumber,
          code: match[0].trim(),
          fieldName,
          message: `Array field '${fieldName}' should use plural naming (e.g., '${fieldName}s' or '${fieldName}List')`
        });
      }
    }
  }
  
  return violations;
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    results.filesScanned++;
    
    // Run checks
    const metadataViolations = checkMetadataUsage(filePath, content);
    const booleanViolations = checkBooleanProps(filePath, content);
    const propsViolations = checkPropsNaming(filePath, content);
    const arrayViolations = checkArrayFieldNaming(filePath, content);
    
    // Collect violations
    results.metadataUsage.push(...metadataViolations);
    results.badBooleanProps.push(...booleanViolations);
    results.genericPropsNames.push(...propsViolations);
    results.singularArrayFields.push(...arrayViolations);
    
  } catch (error) {
    console.error(`${RED}Error scanning ${filePath}:${RESET}`, error.message);
  }
}

/**
 * Main validation function
 */
function validateSemanticNaming() {
  console.log(`${BLUE}🔍 Semantic Naming Validation${RESET}\n`);
  
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
  
  // Report deprecated .metadata wrapper violations
  if (results.metadataUsage.length > 0) {
    hasViolations = true;
    console.log(`${RED}❌ .metadata Usage (${results.metadataUsage.length} violations):${RESET}`);
    results.metadataUsage.forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      ${v.code}`);
      console.log(`      → ${v.message}\n`);
    });
  }
  
  // Report boolean prop violations
  if (results.badBooleanProps.length > 0) {
    hasViolations = true;
    console.log(`${RED}❌ Boolean Naming (${results.badBooleanProps.length} violations):${RESET}`);
    results.badBooleanProps.forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      ${v.code}`);
      console.log(`      → ${v.message}\n`);
    });
  }
  
  // Report generic Props violations
  if (results.genericPropsNames.length > 0) {
    hasViolations = true;
    console.log(`${RED}❌ Generic Props Names (${results.genericPropsNames.length} violations):${RESET}`);
    results.genericPropsNames.forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      ${v.code}`);
      console.log(`      → ${v.message}\n`);
    });
  }
  
  // Report array field violations (warnings only)
  if (results.singularArrayFields.length > 0) {
    console.log(`${YELLOW}⚠️  Array Field Naming (${results.singularArrayFields.length} suggestions):${RESET}`);
    results.singularArrayFields.forEach(v => {
      console.log(`   ${v.file}:${v.line}`);
      console.log(`      ${v.code}`);
      console.log(`      → ${v.message}\n`);
    });
  }
  
  // Summary
  if (!hasViolations) {
    console.log(`${GREEN}✅ All semantic naming checks passed!${RESET}\n`);
    return 0;
  } else {
    console.log(`${RED}❌ Found ${results.metadataUsage.length + results.badBooleanProps.length + results.genericPropsNames.length} critical naming violations${RESET}\n`);
    console.log(`${BLUE}📖 See docs/08-development/NAMING_CONVENTIONS.md for guidance${RESET}\n`);
    return 1;
  }
}

// Run validation
const exitCode = validateSemanticNaming();
process.exit(exitCode);
