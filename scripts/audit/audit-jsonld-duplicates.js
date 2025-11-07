#!/usr/bin/env node

/**
 * JSON-LD Duplicate Detection and Structure Audit
 * 
 * Detects:
 * 1. Duplicate Article schemas (e.g., one in Graph, one standalone)
 * 2. Multiple JSON-LD renderers in same page
 * 3. Schema consistency issues
 * 4. Missing required fields
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 JSON-LD Duplicate Detection Audit\n');
console.log('=' .repeat(70));

// Check 1: Find all places where JSON-LD is rendered
console.log('\n📋 JSON-LD Rendering Locations:\n');

const jsonLdLocations = [];

function findJsonLDRenderers(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        findJsonLDRenderers(fullPath, relativePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Check for MaterialJsonLD usage
      if (content.includes('MaterialJsonLD') && content.includes('import')) {
        jsonLdLocations.push({
          file: relativePath,
          type: 'MaterialJsonLD',
          line: content.split('\n').findIndex(l => l.includes('<MaterialJsonLD')) + 1
        });
      }
      
      // Check for JsonLD component usage
      if (content.includes('<JsonLD ') && content.includes('data=')) {
        jsonLdLocations.push({
          file: relativePath,
          type: 'JsonLD',
          line: content.split('\n').findIndex(l => l.includes('<JsonLD')) + 1
        });
      }
      
      // Check for schemas.technicalArticle usage
      if (content.includes('schemas.technicalArticle')) {
        jsonLdLocations.push({
          file: relativePath,
          type: 'schemas.technicalArticle',
          line: content.split('\n').findIndex(l => l.includes('schemas.technicalArticle')) + 1
        });
      }
      
      // Check for direct script tag JSON-LD
      if (content.includes('application/ld+json')) {
        jsonLdLocations.push({
          file: relativePath,
          type: 'direct script tag',
          line: content.split('\n').findIndex(l => l.includes('application/ld+json')) + 1
        });
      }
    }
  }
}

findJsonLDRenderers(path.join(process.cwd(), 'app'));

// Group by file to find duplicates
const fileGroups = {};
jsonLdLocations.forEach(loc => {
  if (!fileGroups[loc.file]) {
    fileGroups[loc.file] = [];
  }
  fileGroups[loc.file].push(loc);
});

let duplicateCount = 0;
Object.entries(fileGroups).forEach(([file, locations]) => {
  console.log(`   ${file}:`);
  locations.forEach(loc => {
    console.log(`      ├─ ${loc.type} (line ${loc.line})`);
  });
  
  if (locations.length > 1) {
    console.log(`      ⚠️  WARNING: Multiple JSON-LD renderers in same file!`);
    duplicateCount++;
  }
});

console.log(`\n   Total files with JSON-LD: ${Object.keys(fileGroups).length}`);
console.log(`   Files with multiple renderers: ${duplicateCount}`);

// Check 2: Verify Article schema generation doesn't create duplicates
console.log('\n📋 Article Schema Generation Analysis:\n');

const layoutPath = path.join(process.cwd(), 'app/components/Layout/Layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

const hasSchemasTechnicalArticle = layoutContent.includes('schemas.technicalArticle');
const hasJsonLDComponent = layoutContent.includes('<JsonLD');

console.log(`   Layout.tsx uses schemas.technicalArticle: ${hasSchemasTechnicalArticle ? '✅' : '❌'}`);
console.log(`   Layout.tsx renders <JsonLD>: ${hasJsonLDComponent ? '✅' : '❌'}`);

if (hasSchemasTechnicalArticle && hasJsonLDComponent) {
  console.log(`   ⚠️  WARNING: Layout creates standalone Article schema`);
  console.log(`   This may duplicate Article in MaterialJsonLD's Graph!`);
}

// Check 3: Verify image field is included
console.log('\n📋 Image Field Verification:\n');

const jsonLdHelperPath = path.join(process.cwd(), 'app/components/JsonLD/JsonLD.tsx');
const jsonLdHelperContent = fs.readFileSync(jsonLdHelperPath, 'utf-8');

const hasImageSpread = jsonLdHelperContent.includes('...(data.image && { image: data.image })') ||
                       jsonLdHelperContent.includes('image: data.image');

console.log(`   schemas.technicalArticle includes image field: ${hasImageSpread ? '✅' : '❌'}`);

const hasLayoutImageExtraction = layoutContent.includes('metadata.images?.hero?.url') ||
                                 layoutContent.includes('(metadata as any).images?.hero?.url');

console.log(`   Layout.tsx extracts image from metadata.images.hero: ${hasLayoutImageExtraction ? '✅' : '❌'}`);

// Check 4: Find potential duplicate Article schemas in production build
console.log('\n📋 Recommendations:\n');

console.log(`   1. Material pages should use MaterialJsonLD (Graph with Article)`);
console.log(`   2. Layout should NOT create separate Article schema`);
console.log(`   3. Remove duplicate Article generation from Layout.tsx`);
console.log(`   4. OR ensure Layout's Article has different @id to avoid conflicts`);

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 Audit Summary:\n');

if (duplicateCount > 0) {
  console.log(`   ⚠️  ${duplicateCount} file(s) with multiple JSON-LD renderers`);
  console.log(`   ⚠️  Risk of duplicate schemas in production`);
} else {
  console.log(`   ✅ No files with multiple JSON-LD renderers detected`);
}

if (hasSchemasTechnicalArticle && hasJsonLDComponent) {
  console.log(`   ⚠️  Layout.tsx creates standalone Article (may duplicate MaterialJsonLD)`);
  console.log(`   📝 Solution: Remove standalone Article from Layout, rely on MaterialJsonLD`);
}

console.log('\n' + '='.repeat(70));
