#!/usr/bin/env node
/**
 * Fix Unknown Regulatory Standards Script
 * 
 * @deprecated This functionality is now handled automatically
 *             by app/utils/regulatoryStandardsNormalizer.ts
 * 
 * This script remains for one-time batch updates only.
 * For new materials, normalization happens at load time in contentAPI.ts
 * 
 * Resolves "Unknown" regulatory standard names by extracting
 * organization abbreviations from descriptions.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Organization mappings with common patterns found in descriptions
const ORG_MAPPINGS = {
  'EPA': {
    name: 'EPA',
    imagePattern: 'logo-org-epa.png',
    patterns: ['EPA', 'Environmental Protection Agency', 'Clean Air Act']
  },
  'ASTM': {
    name: 'ASTM',
    imagePattern: 'logo-org-astm.png',
    patterns: ['ASTM', 'ASTM International']
  },
  'USDA': {
    name: 'USDA',
    imagePattern: 'logo-org-generic.png', // No USDA logo available
    patterns: ['USDA', 'U.S. Department of Agriculture']
  },
  'FSC': {
    name: 'FSC',
    imagePattern: 'logo-org-generic.png', // No FSC logo available
    patterns: ['FSC', 'Forest Stewardship Council']
  },
  'ISO': {
    name: 'ISO',
    imagePattern: 'logo-org-iso.png',
    patterns: ['ISO ']
  },
  'ANSI': {
    name: 'ANSI',
    imagePattern: 'logo-org-ansi.png',
    patterns: ['ANSI']
  },
  'IEC': {
    name: 'IEC',
    imagePattern: 'logo-org-iec.png',
    patterns: ['IEC']
  },
  'OSHA': {
    name: 'OSHA',
    imagePattern: 'logo-org-osha.png',
    patterns: ['OSHA', 'Occupational Safety']
  },
  'FDA': {
    name: 'FDA',
    imagePattern: 'logo-org-fda.png',
    patterns: ['FDA', 'Food and Drug Administration']
  }
};

/**
 * Attempt to identify organization from description
 */
function identifyOrg(description) {
  if (!description) return null;
  
  // Check each org's patterns
  for (const [orgKey, orgData] of Object.entries(ORG_MAPPINGS)) {
    for (const pattern of orgData.patterns) {
      if (description.includes(pattern)) {
        return {
          name: orgData.name,
          imagePath: `/images/logo/${orgData.imagePattern}`
        };
      }
    }
  }
  
  return null;
}

/**
 * Process a single YAML file
 */
function processFile(filePath) {
  console.log(`Processing: ${path.basename(filePath)}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);
  
  if (!data.regulatoryStandards || !Array.isArray(data.regulatoryStandards)) {
    console.log(`  ⚠️  No regulatoryStandards array found`);
    return { updated: false };
  }
  
  let changesCount = 0;
  
  data.regulatoryStandards = data.regulatoryStandards.map(standard => {
    if (standard.name === 'Unknown' && standard.description) {
      const identified = identifyOrg(standard.description);
      
      if (identified) {
        changesCount++;
        console.log(`  ✓ Updated: "${standard.description.substring(0, 50)}..." → ${identified.name}`);
        
        return {
          ...standard,
          name: identified.name,
          image: identified.imagePath
        };
      } else {
        console.log(`  ⚠️  Could not identify org for: "${standard.description.substring(0, 50)}..."`);
      }
    }
    
    return standard;
  });
  
  if (changesCount > 0) {
    // Write back to file with proper YAML formatting
    const updatedContent = yaml.dump(data, {
      lineWidth: -1, // No line wrapping
      indent: 2,
      noRefs: true
    });
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`  ✅ Saved ${changesCount} changes\n`);
    return { updated: true, count: changesCount };
  }
  
  console.log(`  → No changes needed\n`);
  return { updated: false, count: 0 };
}

/**
 * Main execution
 */
function main() {
  const frontmatterDir = path.join(__dirname, '..', 'content', 'frontmatter');
  
  console.log('='.repeat(60));
  console.log('Fix Unknown Regulatory Standards');
  console.log('='.repeat(60));
  console.log();
  
  if (!fs.existsSync(frontmatterDir)) {
    console.error(`Error: Directory not found: ${frontmatterDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(frontmatterDir)
    .filter(f => f.endsWith('.yaml'))
    .map(f => path.join(frontmatterDir, f));
  
  console.log(`Found ${files.length} YAML files\n`);
  
  let totalUpdated = 0;
  let totalChanges = 0;
  const filesUpdated = [];
  const filesWithUnknown = [];
  
  for (const file of files) {
    const result = processFile(file);
    if (result.updated) {
      totalUpdated++;
      totalChanges += result.count;
      filesUpdated.push(path.basename(file));
    }
    
    // Check if file still has Unknown entries
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('name: Unknown')) {
      filesWithUnknown.push(path.basename(file));
    }
  }
  
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Files processed: ${files.length}`);
  console.log(`Files updated: ${totalUpdated}`);
  console.log(`Total changes: ${totalChanges}`);
  
  if (filesUpdated.length > 0) {
    console.log('\nUpdated files:');
    filesUpdated.forEach(f => console.log(`  - ${f}`));
  }
  
  if (filesWithUnknown.length > 0) {
    console.log('\n⚠️  Files still containing "Unknown":');
    filesWithUnknown.forEach(f => console.log(`  - ${f}`));
  }
  
  console.log();
}

main();
