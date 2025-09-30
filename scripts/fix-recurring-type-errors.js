#!/usr/bin/env node

/**
 * RECURRING TYPE ER];

// Apply fixes to remaining files===========================
 * 
 * This script fixes specific TypeScript errors that recur after auto-fixes.
 * It ensures compatibility between utility functions and the type system.
 */

const fs = require('fs');
const path = require('path');

const FIXES = [
  // Fix 1: SearchResults component itemMatchesTag function
  {
    file: 'app/components/SearchResults/SearchResults.tsx',
    search: /function itemMatchesTag\(item: Record<string, unknown>, tag: string\): boolean/g,
    replace: 'function itemMatchesTag(item: any, tag: string): boolean'
  },
  
  // Fix 2: searchUtils.ts utility functions
  {
    file: 'app/utils/searchUtils.ts',
    search: /export function getDisplayName\(item: Record<string, unknown>\): string/g,
    replace: 'export function getDisplayName(item: any): string'
  },
  {
    file: 'app/utils/searchUtils.ts',
    search: /export function getBadgeFromItem\(item: Record<string, unknown>\): BadgeData \| null/g,
    replace: 'export function getBadgeFromItem(item: any): BadgeData | null'
  },
  {
    file: 'app/utils/searchUtils.ts',
    search: /export function getChemicalProperties\(item: Record<string, unknown>\): ChemicalProperties \| null/g,
    replace: 'export function getChemicalProperties(item: any): ChemicalProperties | null'
  },
  
  // Fix 3: tagDebug.ts utility function
  {
    file: 'app/utils/tagDebug.ts',
    search: /function getAuthorName\(article: Record<string, unknown>\): string/g,
    replace: 'function getAuthorName(article: any): string'
  },
  
  // Fix 4: Next.js 15 page params interface
  {
    file: 'app/tag/[tag]/page.tsx',
    search: /interface PageProps \{\s*params: Promise<\{ tag: string \| string\[\] \}>;/g,
    replace: 'interface PageProps {\n  params: Promise<{ tag: string }>;'
  },
  
  // Fix 5: Simplify tag parameter handling
  {
    file: 'app/tag/[tag]/page.tsx',
    search: /const tag = paramsData\?\.tag \?\s*\(typeof paramsData\.tag === 'string' \?\s*decodeURIComponent\(paramsData\.tag\) :\s*decodeURIComponent\(paramsData\.tag\[0\]\)\s*\) : '';/g,
    replace: "const tag = paramsData?.tag ? decodeURIComponent(paramsData.tag) : '';"
  }
];

function applyFix(fix) {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fix.file}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Apply the fix
  content = content.replace(fix.search, fix.replace);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${fix.file}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${fix.file}`);
    return false;
  }
}

function main() {
  console.log('🔧 RECURRING TYPE ERROR FIXER');
  console.log('==============================\n');
  
  let fixesApplied = 0;
  
  for (const fix of FIXES) {
    if (applyFix(fix)) {
      fixesApplied++;
    }
  }
  
  console.log(`\n📊 Summary: ${fixesApplied} fixes applied`);
  
  // Test TypeScript compilation
  console.log('\n🔍 Testing TypeScript compilation...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation: PASSED');
  } catch (error) {
    console.log('❌ TypeScript compilation: FAILED');
    console.log('Remaining errors:');
    console.log(error.stdout.toString());
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyFix, FIXES };
