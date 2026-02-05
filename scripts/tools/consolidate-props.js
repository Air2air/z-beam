#!/usr/bin/env node
/**
 * Phase 1: Consolidate 72 local Props interfaces to types/centralized.ts
 * Extracts Props interfaces from components and centralizes them
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const CENTRALIZED_FILE = './types/centralized.ts';
const COMPONENTS_DIR = './app/components';

// Find all component files with Props interfaces
const componentFiles = glob.sync(`${COMPONENTS_DIR}/**/*.tsx`);

const propsToConsolidate = new Map(); // name -> { file, definition }

// Extract Props interfaces from component files
componentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Find interface definitions that end with Props
    const interfaceMatches = content.matchAll(/^export\s+interface\s+(\w+Props)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gm);
    
    for (const match of interfaceMatches) {
      const name = match[1];
      const body = match[2];
      
      if (!propsToConsolidate.has(name)) {
        propsToConsolidate.set(name, {
          file,
          definition: `export interface ${name} {${body}}`
        });
      }
    }
  } catch (err) {
    // Silently skip files we can't read
  }
});

console.log(`Found ${propsToConsolidate.size} Props interfaces to consolidate:`);
console.log('');

// Show what we're consolidating
let count = 0;
for (const [name, data] of propsToConsolidate) {
  count++;
  if (count <= 20) {
    console.log(`  ${count}. ${name} (from ${path.relative(COMPONENTS_DIR, data.file)})`);
  }
}

if (propsToConsolidate.size > 20) {
  console.log(`  ... and ${propsToConsolidate.size - 20} more`);
}

console.log('');
console.log('Next steps:');
console.log('1. Manually review each interface definition');
console.log('2. Update component imports: import type { XProps } from "@/types"');
console.log('3. Remove local interface definitions from components');
console.log('4. Run: npm run type-check');
console.log('5. Run: npm run build');
