#!/usr/bin/env node

// Test script to verify BadgeSymbol and PropertiesTable content loading
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING BADGESYMBOL AND PROPERTIESTABLE CONTENT LOADING');
console.log('==============================================================\n');

// Test function to check content structure
function testContentStructure(componentType, expectedFormat = 'frontmatter') {
  console.log(`📂 Testing ${componentType} content structure...`);
  
  const contentDir = path.join(process.cwd(), 'content', 'components', componentType);
  
  if (!fs.existsSync(contentDir)) {
    console.log(`❌ Directory not found: ${contentDir}`);
    return false;
  }
  
  const files = fs.readdirSync(contentDir);
  console.log(`   Found ${files.length} files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
  
  // Test a sample file
  if (files.length > 0) {
    const sampleFile = path.join(contentDir, files[0]);
    const content = fs.readFileSync(sampleFile, 'utf-8');
    
    if (expectedFormat === 'frontmatter') {
      // Check for frontmatter (BadgeSymbol pattern)
      if (content.startsWith('---')) {
        console.log(`   ✅ Sample file has frontmatter: ${files[0]}`);
        
        // Extract frontmatter
        const frontmatterEnd = content.indexOf('---', 3);
        if (frontmatterEnd > 0) {
          const frontmatter = content.slice(4, frontmatterEnd);
          console.log(`   📋 Sample frontmatter keys: ${frontmatter.split('\n').filter(line => line.includes(':')).map(line => line.split(':')[0]).join(', ')}`);
        }
      } else {
        console.log(`   ⚠️  Sample file missing frontmatter: ${files[0]}`);
      }
    } else if (expectedFormat === 'table') {
      // Check for table format (PropertiesTable pattern)
      if (content.includes('|') && content.includes('Property') && content.includes('Value')) {
        console.log(`   ✅ Sample file has table format: ${files[0]}`);
        const rows = content.split('\n').filter(line => line.includes('|') && !line.includes('---'));
        console.log(`   📊 Table has ${rows.length} rows`);
      } else {
        console.log(`   ⚠️  Sample file not in expected table format: ${files[0]}`);
      }
    }
  }
  
  console.log('');
  return true;
}

// Test component integration
function testComponentIntegration() {
  console.log('🔧 Testing component integration...');
  
  // Check if BadgeSymbol component exists and has correct interface
  const badgeSymbolPath = path.join(process.cwd(), 'app', 'components', 'BadgeSymbol', 'BadgeSymbol.tsx');
  if (fs.existsSync(badgeSymbolPath)) {
    const badgeContent = fs.readFileSync(badgeSymbolPath, 'utf-8');
    
    const hasContentConfig = badgeContent.includes('content') && badgeContent.includes('config');
    const hasOldSlugProp = badgeContent.includes('slug:') || badgeContent.includes('slug?:');
    
    console.log(`   BadgeSymbol interface: ${hasContentConfig ? '✅' : '❌'} content/config pattern`);
    console.log(`   BadgeSymbol cleanup: ${!hasOldSlugProp ? '✅' : '⚠️'} ${hasOldSlugProp ? 'still has slug props' : 'slug props removed'}`);
  } else {
    console.log(`   ❌ BadgeSymbol component not found`);
  }
  
  // Check Layout component integration
  const layoutPath = path.join(process.cwd(), 'app', 'components', 'Layout', 'Layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
    
    const hasBadgeSymbolImport = layoutContent.includes("import { BadgeSymbol }");
    const hasBadgeSymbolCase = layoutContent.includes("case 'badgesymbol':");
    const hasPropertiesTableCase = layoutContent.includes("case 'propertiestable':");
    
    console.log(`   Layout BadgeSymbol: ${hasBadgeSymbolImport && hasBadgeSymbolCase ? '✅' : '❌'} properly integrated`);
    console.log(`   Layout PropertiesTable: ${hasPropertiesTableCase ? '✅' : '❌'} properly integrated`);
  } else {
    console.log(`   ❌ Layout component not found`);
  }
  
  console.log('');
}

// Test contentAPI integration
function testContentAPI() {
  console.log('📡 Testing contentAPI integration...');
  
  const contentAPIPath = path.join(process.cwd(), 'app', 'utils', 'contentAPI.ts');
  if (fs.existsSync(contentAPIPath)) {
    const apiContent = fs.readFileSync(contentAPIPath, 'utf-8');
    
    const hasBadgeSymbolDir = apiContent.includes('badgesymbol:');
    const hasPropertiesTableDir = apiContent.includes('propertiestable:');
    
    console.log(`   ContentAPI BadgeSymbol: ${hasBadgeSymbolDir ? '✅' : '❌'} directory configured`);
    console.log(`   ContentAPI PropertiesTable: ${hasPropertiesTableDir ? '✅' : '❌'} directory configured`);
  } else {
    console.log(`   ❌ ContentAPI not found`);
  }
  
  console.log('');
}

// Check for old API routes that should be removed
function testAPICleanup() {
  console.log('🧹 Testing API cleanup...');
  
  const badgeSymbolAPIPath = path.join(process.cwd(), 'app', 'api', 'badgesymbol');
  const badgeSymbolLoaderPath = path.join(process.cwd(), 'app', 'utils', 'badgeSymbolLoader.ts');
  
  console.log(`   BadgeSymbol API route: ${!fs.existsSync(badgeSymbolAPIPath) ? '✅' : '❌'} ${fs.existsSync(badgeSymbolAPIPath) ? 'still exists (should be removed)' : 'properly removed'}`);
  console.log(`   BadgeSymbol loader: ${!fs.existsSync(badgeSymbolLoaderPath) ? '✅' : '❌'} ${fs.existsSync(badgeSymbolLoaderPath) ? 'still exists (should be removed)' : 'properly removed'}`);
  
  console.log('');
}

// Run all tests
console.log('🚀 Starting content loading tests...\n');

testContentStructure('badgesymbol', 'frontmatter');
testContentStructure('propertiestable', 'table'); 
testComponentIntegration();
testContentAPI();
testAPICleanup();

console.log('✅ Content loading test completed!');
