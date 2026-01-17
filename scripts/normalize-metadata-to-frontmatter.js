#!/usr/bin/env node

/**
 * Normalize .metadata to .frontmatter across codebase
 * 
 * This script performs a find-and-replace operation to convert all
 * .metadata wrapper references to .frontmatter for consistency.
 * 
 * Usage: node scripts/normalize-metadata-to-frontmatter.js
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_UPDATE = [
  'app/components/CardGrid/CardGrid.server.tsx',
  'app/components/CardGrid/CardGrid.tsx',
  'app/components/ContentPages/ItemPage.tsx',
  'app/search/page.tsx',
  'app/search/search-client.tsx',
  'app/components/Micro/useMicroParsing.ts'
];

const REPLACEMENTS = [
  // Pattern 1: Check for 'metadata' in object
  {
    from: /\('metadata' in (\w+) \? \1\.metadata : \1\)/g,
    to: '($1.frontmatter || $1)'
  },
  // Pattern 2: Direct metadata access with optional chaining
  {
    from: /(\w+)\.metadata\?\.(\w+)/g,
    to: '$1.frontmatter?.$2'
  },
  // Pattern 3: Direct metadata access without optional chaining
  {
    from: /(\w+)\.metadata\.(\w+)/g,
    to: '$1.frontmatter.$2'
  },
  // Pattern 4: Just metadata property
  {
    from: /(\w+)\.metadata(?!\w)/g,
    to: '$1.frontmatter'
  },
  // Pattern 5: as any).metadata
  {
    from: /as any\)\.metadata/g,
    to: 'as any).frontmatter'
  }
];

function normalizeFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let changeCount = 0;

  // Apply all replacements
  REPLACEMENTS.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      changeCount += matches.length;
      content = content.replace(from, to);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath} (${changeCount} changes)`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🔄 Normalizing .metadata to .frontmatter...\n');

  let totalUpdated = 0;
  FILES_TO_UPDATE.forEach(file => {
    if (normalizeFile(file)) {
      totalUpdated++;
    }
  });

  console.log(`\n✨ Complete! Updated ${totalUpdated} file(s)`);
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Check console for [DEPRECATED] warnings (should be 0)');
  console.log('   3. Test affected pages');
  console.log('   4. Run: npm test');
}

main();
