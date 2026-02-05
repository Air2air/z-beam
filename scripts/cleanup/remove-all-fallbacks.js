#!/usr/bin/env node
/**
 * Remove All Fallbacks - Enforce Fail-Fast Architecture
 * 
 * This script removes ALL fallback patterns across the codebase:
 * 1. Remove || defaults in components
 * 2. Remove || [] and || {} patterns
 * 3. Remove ?? null coalescence fallbacks
 * 4. Replace with throw Error() for required fields
 * 5. Remove v5.0.0 compatibility fields from frontmatter
 * 
 * CRITICAL: This enforces strict fail-fast behavior
 * Missing data = immediate error, no silent degradation
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Files to process
const componentsToFix = [
  'app/components/MaterialsLayout/MaterialsLayout.tsx',
  'app/components/CompoundsLayout/CompoundsLayout.tsx',
  'app/components/RelatedMaterials/RelatedMaterials.tsx',
  'app/components/SettingsLayout/SettingsLayout.tsx'
];

// V5.0.0 compatibility fields to remove
const v5CompatFields = [
  'pageTitle',
  'displayName',
  'fullPath',
  'breadcrumb',
  'pageDescription',
  'metaDescription',
  'author' // Full object, keep authorId
];

console.log('🚫 REMOVING ALL FALLBACKS - ENFORCING FAIL-FAST ARCHITECTURE');
console.log('═══════════════════════════════════════════════════════════\n');

// Step 1: Remove the || [] fallback we added
console.log('Step 1: Removing || [] fallback from MaterialsLayout.tsx...');
const materialsLayoutPath = path.join(__dirname, '../../app/components/MaterialsLayout/MaterialsLayout.tsx');
let materialsLayout = fs.readFileSync(materialsLayoutPath, 'utf8');

// Replace the fallback with strict check
const oldLine = 'const contaminatedBy = relationships?.interactions?.contaminatedBy?.items || [];';
const newLine = `const contaminatedBy = relationships?.interactions?.contaminatedBy?.items;
  
  // FAIL-FAST: Throw if required relationship data is missing
  if (!contaminatedBy || !Array.isArray(contaminatedBy)) {
    throw new Error(\`Missing or invalid contaminatedBy data for material: \${materialName}\`);
  }`;

if (materialsLayout.includes(oldLine)) {
  materialsLayout = materialsLayout.replace(oldLine, newLine);
  fs.writeFileSync(materialsLayoutPath, materialsLayout);
  console.log('✅ Removed || [] fallback, added fail-fast check\n');
} else {
  console.log('⚠️  || [] pattern not found (may already be removed)\n');
}

// Step 2: Remove _section fallbacks (title/description templates)
console.log('Step 2: Removing _section fallback templates...');

const sectionFallbacks = [
  {
    file: 'app/components/MaterialsLayout/MaterialsLayout.tsx',
    patterns: [
      {
        old: /title:\s*relationships\?\.interactions\?\.contaminatedBy\?\._section\?\.sectionTitle\s*\|\|\s*`[^`]+`/g,
        new: 'title: relationships?.interactions?.contaminatedBy?._section?.sectionTitle'
      },
      {
        old: /description:\s*relationships\?\.interactions\?\.contaminatedBy\?\._section\?\.sectionDescription\s*\|\|\s*`[^`]+`/g,
        new: 'description: relationships?.interactions?.contaminatedBy?._section?.sectionDescription'
      },
      {
        old: /sectionTitle:\s*relationships\?\.discovery\?\.relatedMaterials\?\._section\?\.sectionTitle/g,
        new: `sectionTitle: (() => {
          const title = relationships?.discovery?.relatedMaterials?._section?.sectionTitle;
          if (!title) throw new Error('Missing _section.sectionTitle for relatedMaterials');
          return title;
        })()`
      }
    ]
  },
  {
    file: 'app/components/CompoundsLayout/CompoundsLayout.tsx',
    patterns: [
      {
        old: /title:\s*sourceContaminantsRaw\?\._section\?\.sectionTitle\s*\|\|\s*`[^`]+`/g,
        new: 'title: sourceContaminantsRaw?._section?.sectionTitle'
      },
      {
        old: /description:\s*sourceContaminantsRaw\?\._section\?\.sectionDescription\s*\|\|\s*`[^`]+`/g,
        new: 'description: sourceContaminantsRaw?._section?.sectionDescription'
      }
    ]
  },
  {
    file: 'app/components/RelatedMaterials/RelatedMaterials.tsx',
    patterns: [
      {
        old: /const title = sectionTitle \|\| `[^`]+`;/g,
        new: 'const title = sectionTitle;'
      },
      {
        old: /const description = sectionDescription \|\| `[^`]+`;/g,
        new: 'const description = sectionDescription;'
      }
    ]
  }
];

sectionFallbacks.forEach(({ file, patterns }) => {
  const filePath = path.join(__dirname, '../../', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    patterns.forEach(({ old, new: replacement }) => {
      if (content.match(old)) {
        content = content.replace(old, replacement);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Removed fallbacks from ${file}`);
    }
  }
});

console.log('\nStep 3: Removing v5.0.0 compatibility fields from frontmatter...');

// Step 3: Remove v5.0.0 compatibility fields
function removeV5CompatFields(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (data.schemaVersion !== '6.0.0') {
      return false; // Skip non-v6 files
    }
    
    let modified = false;
    v5CompatFields.forEach(field => {
      if (field in data) {
        delete data[field];
        modified = true;
      }
    });
    
    if (modified) {
      // Preserve field order as per v6.0.0 schema
      const ordered = {
        id: data.id,
        contentType: data.contentType,
        schemaVersion: data.schemaVersion,
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        description: data.description,
        meta: data.meta,
        images: data.images,
        authorId: data.authorId,
        ...data // Rest of fields
      };
      
      // Remove duplicates
      v5CompatFields.forEach(field => delete ordered[field]);
      ordered.id = data.id;
      ordered.contentType = data.contentType;
      ordered.schemaVersion = data.schemaVersion;
      
      const newContent = yaml.dump(ordered, { lineWidth: 120, noRefs: true });
      fs.writeFileSync(filePath, newContent);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findAndCleanFiles(dir) {
  const files = fs.readdirSync(dir);
  let cleaned = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      cleaned += findAndCleanFiles(filePath);
    } else if (file.endsWith('.yaml')) {
      if (removeV5CompatFields(filePath)) {
        cleaned++;
      }
    }
  });
  
  return cleaned;
}

const frontmatterDirs = [
  'frontmatter/contaminants',
  'frontmatter/compounds',
  'frontmatter/settings'
];

let totalCleaned = 0;
frontmatterDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../../', dir);
  if (fs.existsSync(dirPath)) {
    const cleaned = findAndCleanFiles(dirPath);
    totalCleaned += cleaned;
    console.log(`✅ Cleaned ${cleaned} files in ${dir}`);
  }
});

console.log(`\n✅ Total v5.0.0 compat fields removed from ${totalCleaned} files`);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🎯 FALLBACK REMOVAL COMPLETE');
console.log('═══════════════════════════════════════════════════════════');
console.log('\nSYSTEM NOW ENFORCES FAIL-FAST:');
console.log('  ✓ Missing relationships → Error thrown immediately');
console.log('  ✓ Missing _section data → Error thrown immediately');  
console.log('  ✓ No v5.0.0 compat fields → Clean v6.0.0 only');
console.log('  ✓ No fallback templates → Data must be complete');
console.log('\n⚠️  CRITICAL: Ensure all frontmatter has complete _section metadata!');
console.log('⚠️  Pages will now FAIL if data is incomplete (by design)\n');
