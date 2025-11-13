#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

const settingsDir = path.join(process.cwd(), 'frontmatter', 'settings');
const files = glob.sync('*.yaml', { cwd: settingsDir });

console.log(`Found ${files.length} settings files to update\n`);

let updated = 0;
let skipped = 0;
let errors = 0;

files.forEach(file => {
  const filePath = path.join(settingsDir, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    if (!data.name || !data.category || !data.subcategory || !data.slug) {
      console.log(`⚠️  Skipping ${file}: Missing required fields`);
      skipped++;
      return;
    }
    
    // Create new breadcrumb structure
    const materialName = data.name;
    const materialUrl = `/materials/${data.category}/${data.subcategory}/${data.slug}-laser-cleaning`;
    const settingsUrl = `/settings/${data.category}/${data.subcategory}/${data.slug}`;
    
    const newBreadcrumb = [
      { label: 'Home', href: '/' },
      { label: materialName, href: materialUrl },
      { label: 'Settings', href: settingsUrl }
    ];
    
    // Update the breadcrumb in the data
    data.breadcrumb = newBreadcrumb;
    
    // Convert back to YAML, preserving structure
    const newYaml = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    
    // Write back to file
    fs.writeFileSync(filePath, newYaml, 'utf8');
    
    console.log(`✅ Updated ${file}`);
    console.log(`   Breadcrumb: Home > ${materialName} > Settings`);
    console.log(`   Material: ${materialUrl}\n`);
    updated++;
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errors++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Summary:`);
console.log(`  ✅ Updated: ${updated}`);
console.log(`  ⚠️  Skipped: ${skipped}`);
console.log(`  ❌ Errors: ${errors}`);
console.log('='.repeat(60));
