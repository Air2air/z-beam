#!/usr/bin/env node
/**
 * Convert prohibited_materials from simple strings to material card format
 * 
 * From:
 *   prohibited_materials:
 *     items:
 *       - Aluminum
 *       - Copper
 * 
 * To:
 *   prohibited_materials:
 *     presentation: card
 *     items:
 *       - id: aluminum-laser-cleaning
 *       - id: copper-laser-cleaning
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(process.cwd(), 'frontmatter/contaminants');

// Material name to slug mapping
const materialSlugMap = {
  'Aluminum': 'aluminum-laser-cleaning',
  'Copper': 'copper-laser-cleaning',
  'Stainless Steel': 'stainless-steel-laser-cleaning',
  'Steel': 'steel-laser-cleaning',
  'Iron': 'iron-laser-cleaning',
  'Brass': 'brass-laser-cleaning',
  'Bronze': 'bronze-laser-cleaning',
  'Titanium': 'titanium-laser-cleaning',
  'Nickel': 'nickel-laser-cleaning',
  'Zinc': 'zinc-laser-cleaning',
  'Lead': 'lead-laser-cleaning',
  'Magnesium': 'magnesium-laser-cleaning',
  'Carbon Steel': 'carbon-steel-laser-cleaning',
  'Cast Iron': 'cast-iron-laser-cleaning',
  'Tool Steel': 'tool-steel-laser-cleaning',
  'Chrome': 'chrome-laser-cleaning',
  'Cadmium': 'cadmium-laser-cleaning',
  'Silver': 'silver-laser-cleaning',
  'Gold': 'gold-laser-cleaning',
  'Platinum': 'platinum-laser-cleaning',
  'Glass': 'glass-laser-cleaning',
  'Concrete': 'concrete-laser-cleaning',
  'Wood': 'wood-laser-cleaning',
  'Plastic': 'plastic-laser-cleaning',
  'Rubber': 'rubber-laser-cleaning',
  'Ceramic': 'ceramic-laser-cleaning',
  'Stone': 'stone-laser-cleaning',
  'Composite': 'composite-laser-cleaning',
  'Fabric': 'fabric-laser-cleaning',
};

function convertToMaterialId(materialName) {
  if (typeof materialName !== 'string') return null;
  
  // Try exact match first
  if (materialSlugMap[materialName]) {
    return materialSlugMap[materialName];
  }
  
  // Try case-insensitive match
  const normalized = materialName.trim();
  for (const [key, value] of Object.entries(materialSlugMap)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return value;
    }
  }
  
  // Fallback: convert to slug format
  return normalized
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-laser-cleaning';
}

function updateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Check if file has prohibited_materials
    if (!data.relationships?.prohibited_materials) {
      return { updated: false, reason: 'no prohibited_materials' };
    }
    
    const prohibited = data.relationships.prohibited_materials;
    
    // Check if items exist and are strings (need conversion)
    if (!prohibited.items || !Array.isArray(prohibited.items)) {
      return { updated: false, reason: 'no items array' };
    }
    
    // Check if already converted (items are objects with 'id' field)
    if (prohibited.items.length > 0 && typeof prohibited.items[0] === 'object' && prohibited.items[0].id) {
      return { updated: false, reason: 'already converted' };
    }
    
    // Check if items are strings (need conversion)
    const hasStringItems = prohibited.items.some(item => typeof item === 'string');
    if (!hasStringItems) {
      return { updated: false, reason: 'no string items to convert' };
    }
    
    // Convert string items to material objects
    const newItems = prohibited.items
      .filter(item => typeof item === 'string')
      .map(materialName => ({
        id: convertToMaterialId(materialName)
      }));
    
    if (newItems.length === 0) {
      return { updated: false, reason: 'no valid materials found' };
    }
    
    // Update the data
    prohibited.items = newItems;
    prohibited.presentation = 'card';
    
    // Write back to file
    const newContent = yaml.dump(data, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    return { updated: true, count: newItems.length };
  } catch (error) {
    return { updated: false, reason: error.message };
  }
}

function main() {
  console.log('🔄 Converting prohibited_materials to card format...\n');
  
  const files = fs.readdirSync(FRONTMATTER_DIR)
    .filter(f => f.endsWith('.yaml'));
  
  let updated = 0;
  let skipped = 0;
  let totalMaterials = 0;
  const reasons = {};
  
  for (const file of files) {
    const filePath = path.join(FRONTMATTER_DIR, file);
    const result = updateFile(filePath);
    
    if (result.updated) {
      updated++;
      totalMaterials += result.count;
      console.log(`✅ ${file} (${result.count} materials)`);
    } else {
      skipped++;
      reasons[result.reason] = (reasons[result.reason] || 0) + 1;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${files.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Total materials converted: ${totalMaterials}`);
  console.log(`Skipped: ${skipped}`);
  
  if (Object.keys(reasons).length > 0) {
    console.log('\nSkip reasons:');
    for (const [reason, count] of Object.entries(reasons)) {
      console.log(`  - ${reason}: ${count}`);
    }
  }
  
  console.log('='.repeat(60));
  console.log(updated > 0 ? '✅ Conversion complete!' : '⚠️  No files updated');
}

main();
