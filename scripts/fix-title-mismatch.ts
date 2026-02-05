#!/usr/bin/env ts-node
/**
 * Fix Title Mismatch: Align displayName with pageTitle
 * 
 * PROBLEM: Browser tab titles (displayName) don't match page H1 titles (pageTitle)
 * - Browser tab uses: displayName + " | Z-Beam" (from layout template)
 * - Page H1 uses: pageTitle
 * 
 * SOLUTION: Update displayName to match pageTitle for consistency
 * 
 * AFFECTED CONTENT TYPES:
 * - Contaminants: displayName missing suffix (e.g., "Rust" vs "Rust Contaminants")
 * - Compounds: displayName different format (e.g., "Iron Oxide (Fe₂O₃)" vs "Iron Oxide Fume Compound")
 * - Settings: displayName has extra context (e.g., "Aluminum Laser Cleaning Settings" vs "Aluminum Settings")
 * - Materials: Already matching ✅
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface FrontmatterData {
  displayName?: string;
  pageTitle?: string;
  [key: string]: any;
}

const FRONTMATTER_BASE = '/Users/todddunning/Desktop/Z-Beam/z-beam/frontmatter';

const CONTENT_TYPES = [
  { dir: 'contaminants', name: 'Contaminants' },
  { dir: 'compounds', name: 'Compounds' },
  { dir: 'settings', name: 'Settings' },
  { dir: 'materials', name: 'Materials' }
];

let totalUpdated = 0;
let totalSkipped = 0;
let totalErrors = 0;

function updateFrontmatterFile(filePath: string, contentType: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content) as FrontmatterData;

    if (!data.pageTitle) {
      console.log(`⚠️  SKIP: ${path.basename(filePath)} - No pageTitle found`);
      totalSkipped++;
      return;
    }

    // Check if displayName already matches pageTitle
    if (data.displayName === data.pageTitle) {
      console.log(`✅ OK: ${path.basename(filePath)} - Already matching`);
      totalSkipped++;
      return;
    }

    const oldDisplayName = data.displayName || '(not set)';
    
    // Update displayName to match pageTitle
    data.displayName = data.pageTitle;

    // Write back to file
    const updatedYaml = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });

    fs.writeFileSync(filePath, updatedYaml, 'utf8');
    
    console.log(`🔧 UPDATED: ${path.basename(filePath)}`);
    console.log(`   OLD: "${oldDisplayName}"`);
    console.log(`   NEW: "${data.pageTitle}"`);
    totalUpdated++;

  } catch (error) {
    console.error(`❌ ERROR: ${path.basename(filePath)} - ${error}`);
    totalErrors++;
  }
}

function processContentType(contentType: { dir: string; name: string }): void {
  const dirPath = path.join(FRONTMATTER_BASE, contentType.dir);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📁 Processing ${contentType.name} (${contentType.dir})`);
  console.log('='.repeat(80));

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
    .sort();

  console.log(`Found ${files.length} files\n`);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    updateFrontmatterFile(filePath, contentType.name);
  });
}

function main(): void {
  console.log('🔍 Fix Title Mismatch: Align displayName with pageTitle');
  console.log('=' .repeat(80));
  console.log(`Base directory: ${FRONTMATTER_BASE}\n`);

  CONTENT_TYPES.forEach(processContentType);

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Updated: ${totalUpdated} files`);
  console.log(`⏭️  Skipped: ${totalSkipped} files (already matching or no pageTitle)`);
  console.log(`❌ Errors: ${totalErrors} files`);
  console.log('='.repeat(80));

  if (totalUpdated > 0) {
    console.log('\n✨ Title alignment complete!');
    console.log('\nNow browser tab titles (displayName + "| Z-Beam") will match page H1 titles (pageTitle)');
  } else {
    console.log('\n✅ All titles already aligned!');
  }
}

main();
