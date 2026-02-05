#!/usr/bin/env node
/**
 * Migration Script: Frontmatter v5.0.0 → v6.0.0
 * 
 * Converts all frontmatter files to the unified normalized schema:
 * - Eliminates redundant fields
 * - Flattens deep nesting
 * - Converts to reference-based relationships
 * - Maintains consistent field order across all domains
 * 
 * Usage:
 *   node scripts/migration/migrate-to-v6-schema.js [--dry-run] [--domain=<domain>]
 * 
 * Options:
 *   --dry-run     Show changes without writing files
 *   --domain      Process only one domain (materials|contaminants|compounds|settings)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DOMAINS = ['materials', 'contaminants', 'compounds', 'settings'];
const FRONTMATTER_DIR = path.join(__dirname, '../../frontmatter');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const domainFilter = args.find(arg => arg.startsWith('--domain='))?.split('=')[1];

console.log('🚀 Frontmatter Schema Migration v5.0.0 → v6.0.0');
console.log('================================================\n');

if (dryRun) console.log('📝 DRY RUN MODE - No files will be modified\n');
if (domainFilter) console.log(`🎯 Processing domain: ${domainFilter}\n`);

/**
 * Universal field order for all domains
 */
function getFieldOrder() {
  return [
    // Section 1: Core Identity
    'id',
    'contentType',
    'schemaVersion',
    
    // Section 2: Basic Info
    'name',
    'category',
    'subcategory',
    'datePublished',
    'dateModified',
    
    // Section 3: Content
    'description',
    
    // Section 4: SEO
    'meta',
    
    // Section 5: Images
    'images',
    
    // Section 6: Author
    'authorId',
    
    // Section 7: Domain-specific
    'properties',
    'composition', // contaminants only
    'laser',
    'safety',
    'appearance',
    'machine',
    'application',
    'physical',
    
    // Section 8: Relationships
    'relationships'
  ];
}

/**
 * Convert v5 to v6 structure
 */
function migrateDocument(doc, contentType) {
  const migrated = {};
  
  // Section 1: Core Identity
  migrated.id = doc.id;
  migrated.contentType = contentType;
  migrated.schemaVersion = '6.0.0';
  
  // Section 2: Basic Info
  migrated.name = doc.name || doc.displayName;
  migrated.category = doc.category;
  migrated.subcategory = doc.subcategory;
  
  // Convert dates
  migrated.datePublished = doc.datePublished?.split('T')[0] || doc.datePublished;
  migrated.dateModified = doc.dateModified;
  
  // Section 3: Content
  migrated.description = doc.pageDescription || doc.description;
  
  // Section 4: SEO (consolidate)
  migrated.meta = {
    title: doc.pageTitle || doc.name,
    description: doc.metaDescription,
    path: doc.fullPath
  };
  
  // Section 5: Images (filenames only)
  migrated.images = {
    hero: doc.images?.hero?.url?.split('/').pop() || `${doc.id}-hero.jpg`,
    micro: doc.images?.micro?.url?.split('/').pop() || `${doc.id}-micro.jpg`
  };
  
  // Section 6: Author (reference only)
  migrated.authorId = doc.author?.id || 1;
  
  // Section 7 & 8: Domain-specific
  switch (contentType) {
    case 'material':
      migrateMaterial(doc, migrated);
      break;
    case 'contaminant':
      migrateContaminant(doc, migrated);
      break;
    case 'compound':
      migrateCompound(doc, migrated);
      break;
    case 'setting':
      migrateSetting(doc, migrated);
      break;
  }
  
  // Sort fields by standard order
  return sortByFieldOrder(migrated);
}

/**
 * Migrate material-specific fields
 */
function migrateMaterial(doc, migrated) {
  // Extract properties from various locations
  if (doc.properties || doc.thermal || doc.mechanical) {
    migrated.properties = {
      physical: {},
      optical: {}
    };
    
    // Consolidate physical properties
    if (doc.properties?.density) migrated.properties.physical.density = doc.properties.density;
    if (doc.properties?.hardness) migrated.properties.physical.hardness = doc.properties.hardness;
    if (doc.thermal?.meltingPoint) migrated.properties.physical.meltingPoint = doc.thermal.meltingPoint;
    if (doc.thermal?.conductivity) migrated.properties.physical.thermalConductivity = doc.thermal.conductivity;
    
    // Optical properties
    if (doc.optical) {
      migrated.properties.optical = {
        reflectivity1064: doc.optical.reflectivity?.wavelength1064Nm,
        absorptivity1064: doc.optical.absorptivity?.wavelength1064Nm,
        transmissivity1064: doc.optical.transmissivity?.wavelength1064Nm
      };
    }
  }
  
  // Simplify relationships
  migrated.relationships = {
    contaminants: {
      common: extractIds(doc.relationships?.interactions?.contaminatedBy),
      rare: []
    },
    settings: {
      recommended: null
    }
  };
}

/**
 * Migrate contaminant-specific fields
 */
function migrateContaminant(doc, migrated) {
  // Composition
  migrated.composition = doc.composition || [];
  migrated.properties = {
    validMaterials: doc.validMaterials || [],
    prohibitedMaterials: doc.prohibitedMaterials || []
  };
  
  // Laser parameters
  const laserProps = doc.relationships?.operational?.laserProperties?.items?.[0];
  if (laserProps) {
    migrated.laser = {
      wavelength: laserProps.laserParameters?.wavelengthPreference || [1064],
      fluence: {
        min: laserProps.laserParameters?.fluenceRange?.minJCm2,
        max: laserProps.laserParameters?.fluenceRange?.maxJCm2,
        optimal: laserProps.laserParameters?.fluenceRange?.recommendedJCm2
      },
      pulseWidth: {
        min: laserProps.laserParameters?.pulseDurationRange?.minNs,
        max: laserProps.laserParameters?.pulseDurationRange?.maxNs,
        optimal: laserProps.laserParameters?.pulseDurationRange?.recommendedNs
      },
      scanSpeed: {
        min: laserProps.laserParameters?.scanSpeedMmS?.min,
        max: laserProps.laserParameters?.scanSpeedMmS?.max,
        optimal: laserProps.laserParameters?.scanSpeedMmS?.recommended
      },
      passes: {
        optimal: laserProps.removalCharacteristics?.removalEfficiency?.optimalPasses,
        maxEffective: laserProps.removalCharacteristics?.removalEfficiency?.diminishingReturnsAfter,
        efficiency: laserProps.removalCharacteristics?.removalEfficiency?.singlePass
      },
      thermal: {
        ablationThreshold: laserProps.thermalProperties?.ablationThreshold?.wavelength1064Nm,
        decomposition: laserProps.thermalProperties?.decompositionTemperature,
        vaporization: laserProps.thermalProperties?.vaporizationTemperature
      }
    };
    
    // Safety
    migrated.safety = {
      fireRisk: laserProps.safetyData?.fireExplosionRisk?.severity || 'low',
      toxicGas: laserProps.safetyData?.toxicGasRisk?.severity || 'low',
      ppe: {
        respiratory: laserProps.safetyData?.ppeRequirements?.respiratory,
        eye: laserProps.safetyData?.ppeRequirements?.eyeProtection,
        skin: laserProps.safetyData?.ppeRequirements?.skinProtection
      },
      compounds: (laserProps.safetyData?.fumesGenerated || []).map(f => ({
        id: f.compound?.toLowerCase().replace(/\s+/g, '-') + '-compound',
        phase: 'gas',
        hazard: f.hazardClass,
        concentration: f.concentrationMgM3,
        limit: f.exposureLimitMgM3
      })),
      ventilation: {
        airChanges: laserProps.safetyData?.ventilationRequirements?.minimumAirChangesPerHour,
        velocity: laserProps.safetyData?.ventilationRequirements?.exhaustVelocityMS,
        filter: laserProps.safetyData?.ventilationRequirements?.filtrationType
      }
    };
  }
  
  // Appearance (convert from verbose structure)
  const appearanceData = doc.relationships?.visual?.appearanceOnCategories?.items?.[0]?.appearanceOnCategories;
  if (appearanceData) {
    migrated.appearance = {};
    for (const [category, data] of Object.entries(appearanceData)) {
      migrated.appearance[category] = {
        color: extractColorKeywords(data.appearance),
        texture: extractTextureKeywords(data.appearance),
        pattern: extractPatternKeywords(data.pattern),
        coverage: extractCoverageKeywords(data.coverage)
      };
    }
  }
  
  // Relationships
  migrated.relationships = {
    materials: {
      common: (doc.relationships?.interactions?.affectsMaterials?.items || []).map(m => ({
        id: m.id,
        frequency: m.frequency || 'moderate',
        difficulty: m.difficulty || 'moderate'
      })),
      prohibited: doc.prohibitedMaterials || []
    },
    compounds: {
      produces: (doc.relationships?.interactions?.producesCompounds?.items || []).map(c => ({
        id: c.id,
        phase: c.phase || 'unknown',
        hazard: c.hazardLevel || 'unknown'
      }))
    },
    settings: {
      recommended: []
    }
  };
}

/**
 * Migrate compound-specific fields
 */
function migrateCompound(doc, migrated) {
  migrated.properties = {
    formula: doc.chemicalFormula || null,
    casNumber: doc.casNumber || null,
    molecularWeight: doc.molecularWeight || null,
    phase: doc.phase || 'unknown',
    hazardClass: doc.hazardClass || 'unknown'
  };
  
  migrated.safety = {
    exposureLimit: doc.exposureLimit || null,
    unit: doc.exposureLimitUnit || 'ppm',
    hazardLevel: doc.hazardLevel || 'unknown',
    symptoms: doc.symptoms || [],
    firstAid: doc.firstAid || []
  };
  
  migrated.physical = {
    boilingPoint: doc.boilingPoint || null,
    meltingPoint: doc.meltingPoint || null,
    density: doc.density || null,
    solubility: doc.solubility || null
  };
  
  migrated.relationships = {
    contaminants: {
      producedBy: extractIds(doc.relationships?.interactions?.producedBy)
    },
    materials: {
      affectsCorrosion: [],
      affectsHealth: []
    }
  };
}

/**
 * Migrate setting-specific fields
 */
function migrateSetting(doc, migrated) {
  migrated.machine = {
    power: {
      min: doc.machineSettings?.powerRange?.min || null,
      max: doc.machineSettings?.powerRange?.max || null,
      optimal: doc.machineSettings?.powerRange?.optimal || null,
      unit: doc.machineSettings?.powerUnit || 'W'
    },
    pulseEnergy: {
      min: doc.machineSettings?.pulseEnergy?.min || null,
      max: doc.machineSettings?.pulseEnergy?.max || null,
      optimal: doc.machineSettings?.pulseEnergy?.optimal || null
    },
    frequency: {
      min: doc.machineSettings?.frequency?.min || null,
      max: doc.machineSettings?.frequency?.max || null,
      optimal: doc.machineSettings?.frequency?.optimal || null
    },
    scanSpeed: {
      min: doc.machineSettings?.scanSpeed?.min || null,
      max: doc.machineSettings?.scanSpeed?.max || null,
      optimal: doc.machineSettings?.scanSpeed?.optimal || null
    }
  };
  
  migrated.application = {
    thickness: {
      min: doc.applicationData?.thickness?.min || null,
      max: doc.applicationData?.thickness?.max || null
    },
    passes: {
      typical: doc.applicationData?.passes?.typical || null,
      max: doc.applicationData?.passes?.max || null
    },
    cooling: {
      required: doc.applicationData?.coolingRequired || false,
      method: doc.applicationData?.coolingMethod || null
    }
  };
  
  migrated.relationships = {
    materials: {
      optimizedFor: extractIds(doc.relationships?.interactions?.optimizedFor)
    },
    contaminants: {
      effective: (doc.relationships?.interactions?.removesContaminants?.items || []).map(c => ({
        id: c.id,
        effectiveness: c.effectiveness || 'moderate'
      }))
    },
    regulatory: {
      standards: extractIds(doc.relationships?.safety?.regulatoryStandards)
    }
  };
}

// Helper functions
function extractIds(relationshipObj) {
  if (!relationshipObj?.items) return [];
  return relationshipObj.items.map(item => item.id).filter(Boolean);
}

function extractColorKeywords(text) {
  if (!text) return 'unknown';
  const colors = text.match(/\b(black|gray|grey|dark|white|brown|red|blue|green|yellow)\b/gi);
  return colors ? colors.slice(0, 3).join('-').toLowerCase() : 'unknown';
}

function extractTextureKeywords(text) {
  if (!text) return 'unknown';
  const textures = text.match(/\b(powdery|flaky|sooty|sticky|smooth|rough|adhered|embedded)\b/gi);
  return textures ? textures.slice(0, 2).join('-').toLowerCase() : 'unknown';
}

function extractPatternKeywords(text) {
  if (!text) return 'unknown';
  const patterns = text.match(/\b(patches|streaks|uniform|irregular|localized|spots)\b/gi);
  return patterns ? patterns.slice(0, 2).join('-').toLowerCase() : 'unknown';
}

function extractCoverageKeywords(text) {
  if (!text) return 'unknown';
  const coverage = text.match(/\b(partial|full|uneven|localized|extensive|minimal|light|heavy)\b/gi);
  return coverage ? coverage.slice(0, 2).join('-').toLowerCase() : 'unknown';
}

function sortByFieldOrder(obj) {
  const order = getFieldOrder();
  const sorted = {};
  
  order.forEach(key => {
    if (obj.hasOwnProperty(key)) {
      sorted[key] = obj[key];
    }
  });
  
  // Add any remaining fields not in the order
  Object.keys(obj).forEach(key => {
    if (!sorted.hasOwnProperty(key)) {
      sorted[key] = obj[key];
    }
  });
  
  return sorted;
}

/**
 * Process a single file
 */
function processFile(filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const doc = yaml.load(content);
    
    if (doc.schemaVersion === '6.0.0') {
      console.log(`  ⏭️  ${path.basename(filePath)} - Already v6.0.0`);
      return { skipped: true };
    }
    
    const migrated = migrateDocument(doc, contentType);
    const newContent = yaml.dump(migrated, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    });
    
    const oldSize = content.length;
    const newSize = newContent.length;
    const reduction = ((oldSize - newSize) / oldSize * 100).toFixed(1);
    
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    
    console.log(`  ✅ ${path.basename(filePath)} - ${oldSize} → ${newSize} bytes (-${reduction}%)`);
    
    return {
      oldSize,
      newSize,
      reduction: parseFloat(reduction)
    };
    
  } catch (error) {
    console.error(`  ❌ ${path.basename(filePath)} - Error: ${error.message}`);
    return { error: true };
  }
}

/**
 * Process all files in a domain
 */
function processDomain(domain) {
  const domainPath = path.join(FRONTMATTER_DIR, domain);
  
  if (!fs.existsSync(domainPath)) {
    console.log(`⚠️  Domain not found: ${domain}`);
    return;
  }
  
  const files = fs.readdirSync(domainPath)
    .filter(f => f.endsWith('.yaml'))
    .map(f => path.join(domainPath, f));
  
  console.log(`\n📁 Processing ${domain} (${files.length} files)`);
  console.log('─'.repeat(60));
  
  const stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalOldSize: 0,
    totalNewSize: 0
  };
  
  // Determine content type from domain
  const contentType = domain === 'settings' ? 'setting' : domain.slice(0, -1);
  
  files.forEach(file => {
    const result = processFile(file, contentType);
    
    if (result.error) {
      stats.errors++;
    } else if (result.skipped) {
      stats.skipped++;
    } else {
      stats.processed++;
      stats.totalOldSize += result.oldSize;
      stats.totalNewSize += result.newSize;
    }
  });
  
  // Print domain summary
  console.log('─'.repeat(60));
  const avgReduction = stats.processed > 0
    ? ((stats.totalOldSize - stats.totalNewSize) / stats.totalOldSize * 100).toFixed(1)
    : 0;
  
  console.log(`\n📊 ${domain.toUpperCase()} Summary:`);
  console.log(`   Processed: ${stats.processed}`);
  console.log(`   Skipped:   ${stats.skipped}`);
  console.log(`   Errors:    ${stats.errors}`);
  console.log(`   Size reduction: ${avgReduction}%`);
  
  return stats;
}

/**
 * Main execution
 */
function main() {
  const domainsToProcess = domainFilter 
    ? [domainFilter]
    : DOMAINS;
  
  const allStats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalOldSize: 0,
    totalNewSize: 0
  };
  
  domainsToProcess.forEach(domain => {
    const stats = processDomain(domain);
    if (stats) {
      allStats.processed += stats.processed;
      allStats.skipped += stats.skipped;
      allStats.errors += stats.errors;
      allStats.totalOldSize += stats.totalOldSize;
      allStats.totalNewSize += stats.totalNewSize;
    }
  });
  
  // Print overall summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OVERALL MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${allStats.processed}`);
  console.log(`Total files skipped:   ${allStats.skipped}`);
  console.log(`Total errors:          ${allStats.errors}`);
  
  const overallReduction = allStats.processed > 0
    ? ((allStats.totalOldSize - allStats.totalNewSize) / allStats.totalOldSize * 100).toFixed(1)
    : 0;
  
  console.log(`\nStorage reduction: ${overallReduction}%`);
  console.log(`  Before: ${(allStats.totalOldSize / 1024).toFixed(1)} KB`);
  console.log(`  After:  ${(allStats.totalNewSize / 1024).toFixed(1)} KB`);
  console.log(`  Saved:  ${((allStats.totalOldSize - allStats.totalNewSize) / 1024).toFixed(1)} KB`);
  
  if (dryRun) {
    console.log('\n📝 DRY RUN - No files were modified');
  } else {
    console.log('\n✅ Migration complete!');
  }
}

main();
