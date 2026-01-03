#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const settingsDir = path.join(__dirname, '../frontmatter/settings');

// Function to extract category and subcategory from full_path
function extractCategoryInfo(fullPath) {
  // Example: /settings/metal/non-ferrous/aluminum-settings
  // Should extract: category='metal', subcategory='non-ferrous'
  const match = fullPath.match(/^\/settings\/([^/]+)\/([^/]+)\//);
  if (match) {
    return {
      category: match[1],
      subcategory: match[2]
    };
  }
  return null;
}

// Get all yaml files
const files = fs.readdirSync(settingsDir).filter(f => f.endsWith('.yaml'));

console.log(`Found ${files.length} settings files`);

let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(settingsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);
  
  // Skip if already has category
  if (data.category) {
    console.log(`  [SKIP] ${file} - already has category`);
    skipped++;
    continue;
  }
  
  // Extract from full_path
  if (!data.full_path) {
    console.log(`  [WARN] ${file} - no full_path field`);
    continue;
  }
  
  const catInfo = extractCategoryInfo(data.full_path);
  if (!catInfo) {
    console.log(`  [WARN] ${file} - could not parse full_path: ${data.full_path}`);
    continue;
  }
  
  // Add category and subcategory after page_title
  const lines = content.split('\n');
  const titleIndex = lines.findIndex(line => line.startsWith('page_title:'));
  
  if (titleIndex !== -1) {
    // Insert after page_title
    lines.splice(titleIndex + 1, 0, `category: ${catInfo.category}`);
    lines.splice(titleIndex + 2, 0, `subcategory: ${catInfo.subcategory}`);
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`  [UPDATE] ${file} - added category=${catInfo.category}, subcategory=${catInfo.subcategory}`);
    updated++;
  } else {
    console.log(`  [WARN] ${file} - could not find page_title line`);
  }
}

console.log(`\nSummary:`);
console.log(`  Updated: ${updated}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Total: ${files.length}`);
