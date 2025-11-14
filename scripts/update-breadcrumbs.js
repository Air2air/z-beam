#!/usr/bin/env node
/**
 * Update breadcrumbs in materials and settings frontmatter files
 * 
 * Materials: Add "Settings" cross-navigation link at the end
 * Settings: Restructure to "Home › Settings › Category › Subcategory › Material"
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(__dirname, '../frontmatter');
const MATERIALS_DIR = path.join(FRONTMATTER_DIR, 'materials');
const SETTINGS_DIR = path.join(FRONTMATTER_DIR, 'settings');

/**
 * Get all YAML files recursively from a directory
 */
function getYamlFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getYamlFiles(fullPath, files);
    } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Update materials file: Remove Settings cross-nav link if it exists
 */
function updateMaterialsBreadcrumb(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);
  
  if (!data.breadcrumb || !Array.isArray(data.breadcrumb)) {
    console.log(`⚠️  Skipping ${path.basename(filePath)} - no breadcrumb array`);
    return;
  }
  
  // Check if Settings link exists and remove it
  const hasSettings = data.breadcrumb.some(crumb => crumb.label === 'Settings');
  if (!hasSettings) {
    console.log(`✓ Skipping ${path.basename(filePath)} - no Settings link to remove`);
    return;
  }
  
  // Remove Settings cross-navigation link
  data.breadcrumb = data.breadcrumb.filter(crumb => crumb.label !== 'Settings');
  
  // Write back to file
  const newContent = yaml.dump(data, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log(`✓ Updated ${path.basename(filePath)} - removed Settings link`);
}

/**
 * Update settings file: Restructure breadcrumb to "Home › Settings › Category › Subcategory › Material"
 */
function updateSettingsBreadcrumb(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);
  
  if (!data.breadcrumb || !Array.isArray(data.breadcrumb)) {
    console.log(`⚠️  Skipping ${path.basename(filePath)} - no breadcrumb array`);
    return;
  }
  
  const { category, subcategory, name, slug } = data;
  if (!category || !subcategory || !name || !slug) {
    console.log(`⚠️  Skipping ${path.basename(filePath)} - missing required fields`);
    return;
  }
  
  // Check if already in new format (Materials breadcrumb, but last item points to settings)
  if (data.breadcrumb.length >= 5 && 
      data.breadcrumb[1].label === 'Materials' &&
      data.breadcrumb[1].href === '/materials' &&
      data.breadcrumb[data.breadcrumb.length - 1].href &&
      data.breadcrumb[data.breadcrumb.length - 1].href.startsWith('/settings/')) {
    console.log(`✓ Skipping ${path.basename(filePath)} - already in new format`);
    return;
  }
  
  // Capitalize first letter of category/subcategory
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const categoryLabel = capitalize(category.replace(/-/g, ' '));
  const subcategoryLabel = capitalize(subcategory.replace(/-/g, ' '));
  
  // Build new breadcrumb structure
  // Same path as materials, but final link points to settings page (current page)
  const materialSlug = slug.replace('-settings', '');
  const newBreadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'Materials', href: '/materials' },
    { label: categoryLabel, href: `/materials/${category}` },
    { label: subcategoryLabel, href: `/materials/${category}/${subcategory}` },
    { label: name, href: `/settings/${category}/${subcategory}/${materialSlug}` }
  ];
  
  data.breadcrumb = newBreadcrumb;
  
  // Write back to file
  const newContent = yaml.dump(data, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log(`✓ Updated ${path.basename(filePath)} - restructured breadcrumb`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Updating breadcrumbs in frontmatter files...\n');
  
  // Update materials files
  console.log('📁 Processing materials files...');
  const materialsFiles = getYamlFiles(MATERIALS_DIR);
  let materialsUpdated = 0;
  
  for (const file of materialsFiles) {
    try {
      updateMaterialsBreadcrumb(file);
      materialsUpdated++;
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(file)}:`, error.message);
    }
  }
  
  console.log(`\n📊 Materials: Processed ${materialsUpdated}/${materialsFiles.length} files\n`);
  
  // Update settings files
  console.log('📁 Processing settings files...');
  const settingsFiles = getYamlFiles(SETTINGS_DIR);
  let settingsUpdated = 0;
  
  for (const file of settingsFiles) {
    try {
      updateSettingsBreadcrumb(file);
      settingsUpdated++;
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(file)}:`, error.message);
    }
  }
  
  console.log(`\n📊 Settings: Processed ${settingsUpdated}/${settingsFiles.length} files\n`);
  console.log('✅ Breadcrumb update complete!');
}

main();
