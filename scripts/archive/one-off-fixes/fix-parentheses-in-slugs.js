#!/usr/bin/env node
/**
 * Fix Parentheses in Slugs
 * Removes parentheses from slug fields in frontmatter YAML files
 * 
 * Examples:
 * - acrylic-(pmma) → acrylic-pmma
 * - silicon-carbide-(sic) → silicon-carbide-sic
 * - titanium-alloy-(ti-6al-4v) → titanium-alloy-ti-6al-4v
 */

const fs = require('fs').promises;
const yaml = require('js-yaml');
const { glob } = require('glob');

async function fixSlugsInFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const data = yaml.load(content);
  
  if (!data.slug) return { changed: false };
  
  const originalSlug = data.slug;
  const newSlug = originalSlug.replace(/[()]/g, '');
  
  if (originalSlug === newSlug) {
    return { changed: false };
  }
  
  // Update slug and id fields
  data.slug = newSlug;
  if (data.id && data.id.includes('(')) {
    data.id = data.id.replace(/[()]/g, '');
  }
  
  // Write back to file
  const newContent = yaml.dump(data, { lineWidth: -1, quotingType: "'" });
  await fs.writeFile(filePath, newContent, 'utf8');
  
  return {
    changed: true,
    file: filePath,
    oldSlug: originalSlug,
    newSlug: newSlug
  };
}

async function main() {
  console.log('🔍 Finding files with parentheses in slugs...\n');
  
  const files = await glob('frontmatter/**/*.yaml');
  const changes = [];
  
  for (const file of files) {
    const result = await fixSlugsInFile(file);
    if (result.changed) {
      changes.push(result);
      console.log(`✅ ${file}`);
      console.log(`   ${result.oldSlug} → ${result.newSlug}\n`);
    }
  }
  
  if (changes.length === 0) {
    console.log('✨ No files need updating - all slugs are clean!');
  } else {
    console.log(`\n✅ Fixed ${changes.length} file(s)`);
  }
}

main().catch(console.error);
