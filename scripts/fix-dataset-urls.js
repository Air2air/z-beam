#!/usr/bin/env node

/**
 * Fix localhost URLs in existing dataset files
 * 
 * This script replaces all http://localhost:3000 URLs with https://www.z-beam.com
 * in existing public/datasets/materials/*.json files
 * 
 * Usage: node scripts/fix-dataset-urls.js
 * 
 * Production URL Policy: docs/08-development/PRODUCTION_URL_POLICY.md
 */

const fs = require('fs');
const path = require('path');

const DATASETS_DIR = path.join(__dirname, '../public/datasets/materials');
const LOCALHOST_PATTERN = /http:\/\/localhost:3000/g;
const PRODUCTION_URL = 'https://www.z-beam.com';

async function fixDatasetUrls() {
  console.log('🔧 Fixing localhost URLs in dataset files...\n');
  
  // Get all JSON files
  const files = fs.readdirSync(DATASETS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');
  
  console.log(`📁 Found ${files.length} dataset JSON files\n`);
  
  let fixedCount = 0;
  let alreadyOkCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const filePath = path.join(DATASETS_DIR, file);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file contains localhost
      if (content.includes('localhost:3000')) {
        // Replace all localhost URLs
        const newContent = content.replace(LOCALHOST_PATTERN, PRODUCTION_URL);
        fs.writeFileSync(filePath, newContent);
        
        const replacementCount = (content.match(LOCALHOST_PATTERN) || []).length;
        console.log(`✅ Fixed: ${file} (${replacementCount} replacements)`);
        fixedCount++;
      } else {
        alreadyOkCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errorCount++;
    }
  }
  
  // Also fix CSV and TXT files
  const csvFiles = fs.readdirSync(DATASETS_DIR).filter(f => f.endsWith('.csv'));
  const txtFiles = fs.readdirSync(DATASETS_DIR).filter(f => f.endsWith('.txt'));
  
  let csvFixed = 0;
  let txtFixed = 0;
  
  for (const file of csvFiles) {
    const filePath = path.join(DATASETS_DIR, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('localhost:3000')) {
        fs.writeFileSync(filePath, content.replace(LOCALHOST_PATTERN, PRODUCTION_URL));
        csvFixed++;
      }
    } catch (error) {
      console.error(`❌ CSV error ${file}:`, error.message);
    }
  }
  
  for (const file of txtFiles) {
    const filePath = path.join(DATASETS_DIR, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('localhost:3000')) {
        fs.writeFileSync(filePath, content.replace(LOCALHOST_PATTERN, PRODUCTION_URL));
        txtFixed++;
      }
    } catch (error) {
      console.error(`❌ TXT error ${file}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ JSON Fixed: ${fixedCount}`);
  console.log(`   ✅ CSV Fixed: ${csvFixed}`);
  console.log(`   ✅ TXT Fixed: ${txtFixed}`);
  console.log(`   ⏭️  Already OK: ${alreadyOkCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  // Verify no localhost remains
  console.log(`\n🔍 Verification check...`);
  const remainingLocalhostFiles = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(DATASETS_DIR, file), 'utf8');
    if (content.includes('localhost')) {
      remainingLocalhostFiles.push(file);
    }
  }
  
  if (remainingLocalhostFiles.length === 0) {
    console.log(`✅ No localhost URLs remaining in JSON files`);
  } else {
    console.log(`❌ localhost still found in: ${remainingLocalhostFiles.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`\n✨ Done! All dataset URLs now use production domain.\n`);
}

fixDatasetUrls().catch(console.error);
