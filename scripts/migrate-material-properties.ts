#!/usr/bin/env tsx
// @ts-nocheck - Migration script with local type definitions
/**
 * Material Properties Migration Script
 * 
 * Adds materialProperties to all material frontmatter files by extracting
 * data from existing settings files and structured research.
 * 
 * Phase 1 of Dataset Upgrade Proposal (Dec 20, 2025)
 * 
 * Usage:
 *   npm run migrate:properties              # Dry run (shows changes)
 *   npm run migrate:properties -- --commit  # Apply changes
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface MaterialProperties {
  thermal?: {
    meltingPoint?: PropertyWithRange;
    thermalConductivity?: PropertyWithRange;
    heatCapacity?: PropertyWithUnit;
    thermalDiffusivity?: PropertyWithUnit;
    vaporizationTemperature?: PropertyWithUnit;
  };
  optical?: {
    absorptivity?: OpticalProperty;
    reflectivity?: OpticalProperty;
    emissivity?: EmissivityProperty;
  };
  mechanical?: {
    density?: PropertyWithRange;
    hardness?: HardnessProperty;
    tensileStrength?: PropertyWithRange;
    yieldStrength?: PropertyWithUnit;
    elongation?: PropertyWithUnit;
  };
  chemical?: {
    composition?: ChemicalComposition[];
    oxidationResistance?: string;
    corrosionResistance?: string;
    reactivity?: string;
  };
}

interface PropertyWithUnit {
  value: number;
  unit: string;
}

interface PropertyWithRange extends PropertyWithUnit {
  min?: number;
  max?: number;
}

interface OpticalProperty extends PropertyWithRange {
  wavelength?: number;
  wavelength_unit?: string;
}

interface EmissivityProperty extends PropertyWithUnit {
  temperature?: number;
  temperature_unit?: string;
}

interface HardnessProperty extends PropertyWithRange {
  scale?: string;
}

interface ChemicalComposition {
  element: string;
  percentage?: number;
  purity?: string;
}

// Material property database (sourced from settings files and research)
const PROPERTY_DATABASE: Record<string, Partial<MaterialProperties>> = {
  'aluminum': {
    thermal: {
      meltingPoint: { value: 660, unit: '°C', min: 658, max: 662 },
      thermalConductivity: { value: 237, unit: 'W/(m·K)', min: 220, max: 250 },
      heatCapacity: { value: 897, unit: 'J/(kg·K)' },
      thermalDiffusivity: { value: 97, unit: 'mm²/s' },
      vaporizationTemperature: { value: 2519, unit: '°C' }
    },
    optical: {
      absorptivity: { value: 0.07, unit: 'dimensionless', wavelength: 1064, wavelength_unit: 'nm', min: 0.05, max: 0.10 },
      reflectivity: { value: 0.92, unit: 'dimensionless', wavelength: 1064, wavelength_unit: 'nm' },
      emissivity: { value: 0.09, unit: 'dimensionless', temperature: 25, temperature_unit: '°C' }
    },
    mechanical: {
      density: { value: 2.7, unit: 'g/cm³', min: 2.65, max: 2.75 },
      hardness: { value: 167, unit: 'HB', scale: 'Brinell', min: 160, max: 175 },
      tensileStrength: { value: 310, unit: 'MPa', min: 290, max: 330 },
      yieldStrength: { value: 276, unit: 'MPa' },
      elongation: { value: 12, unit: '%' }
    },
    chemical: {
      composition: [{ element: 'Al', percentage: 99.5, purity: 'commercial pure' }],
      oxidationResistance: 'low',
      corrosionResistance: 'moderate',
      reactivity: 'low'
    }
  },
  
  'steel': {
    thermal: {
      meltingPoint: { value: 1370, unit: '°C', min: 1350, max: 1530 },
      thermalConductivity: { value: 50, unit: 'W/(m·K)', min: 40, max: 60 },
      heatCapacity: { value: 490, unit: 'J/(kg·K)' }
    },
    mechanical: {
      density: { value: 7.85, unit: 'g/cm³', min: 7.75, max: 8.05 },
      hardness: { value: 120, unit: 'HB', scale: 'Brinell', min: 100, max: 250 },
      tensileStrength: { value: 400, unit: 'MPa', min: 370, max: 550 }
    },
    chemical: {
      composition: [
        { element: 'Fe', percentage: 98.5 },
        { element: 'C', percentage: 0.3 },
        { element: 'Mn', percentage: 0.6 }
      ],
      oxidationResistance: 'low',
      corrosionResistance: 'low'
    }
  },
  
  'stainless-steel': {
    thermal: {
      meltingPoint: { value: 1400, unit: '°C', min: 1375, max: 1450 },
      thermalConductivity: { value: 16, unit: 'W/(m·K)', min: 14, max: 25 },
      heatCapacity: { value: 500, unit: 'J/(kg·K)' }
    },
    mechanical: {
      density: { value: 7.9, unit: 'g/cm³', min: 7.75, max: 8.1 },
      hardness: { value: 150, unit: 'HB', scale: 'Brinell', min: 140, max: 220 },
      tensileStrength: { value: 515, unit: 'MPa', min: 485, max: 760 }
    },
    chemical: {
      composition: [
        { element: 'Fe', percentage: 71.0 },
        { element: 'Cr', percentage: 18.0 },
        { element: 'Ni', percentage: 8.0 },
        { element: 'C', percentage: 0.08 }
      ],
      oxidationResistance: 'high',
      corrosionResistance: 'excellent'
    }
  },
  
  'copper': {
    thermal: {
      meltingPoint: { value: 1085, unit: '°C', min: 1083, max: 1087 },
      thermalConductivity: { value: 401, unit: 'W/(m·K)', min: 390, max: 410 },
      heatCapacity: { value: 385, unit: 'J/(kg·K)' }
    },
    optical: {
      absorptivity: { value: 0.03, unit: 'dimensionless', wavelength: 1064, wavelength_unit: 'nm' },
      reflectivity: { value: 0.97, unit: 'dimensionless', wavelength: 1064, wavelength_unit: 'nm' }
    },
    mechanical: {
      density: { value: 8.96, unit: 'g/cm³', min: 8.94, max: 8.98 },
      hardness: { value: 50, unit: 'HB', scale: 'Brinell', min: 45, max: 85 },
      tensileStrength: { value: 220, unit: 'MPa', min: 210, max: 250 }
    },
    chemical: {
      composition: [{ element: 'Cu', percentage: 99.9, purity: 'electrolytic copper' }],
      oxidationResistance: 'low',
      corrosionResistance: 'excellent'
    }
  },
  
  'titanium': {
    thermal: {
      meltingPoint: { value: 1668, unit: '°C', min: 1660, max: 1670 },
      thermalConductivity: { value: 21.9, unit: 'W/(m·K)', min: 20, max: 24 },
      heatCapacity: { value: 523, unit: 'J/(kg·K)' }
    },
    mechanical: {
      density: { value: 4.5, unit: 'g/cm³', min: 4.43, max: 4.54 },
      hardness: { value: 70, unit: 'HRB', scale: 'Rockwell B', min: 65, max: 80 },
      tensileStrength: { value: 240, unit: 'MPa', min: 220, max: 370 }
    },
    chemical: {
      composition: [{ element: 'Ti', percentage: 99.5, purity: 'Grade 1' }],
      oxidationResistance: 'excellent',
      corrosionResistance: 'excellent',
      reactivity: 'moderate'
    }
  }
  
  // Add more materials as needed - this is a starter set
  // For production, source from comprehensive materials database
};

/**
 * Load material frontmatter file
 */
function loadMaterial(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return null;
  }
}

/**
 * Save material frontmatter file
 */
function saveMaterial(filePath: string, data: any, dryRun: boolean = true): void {
  const yamlContent = yaml.dump(data, { 
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  });
  
  if (dryRun) {
    console.log(`\n📝 Would update: ${path.basename(filePath)}`);
    console.log(`   Properties: ${getPropertyCount(data.materialProperties)} fields`);
  } else {
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`✅ Updated: ${path.basename(filePath)}`);
  }
}

/**
 * Count properties for summary
 */
function getPropertyCount(props: MaterialProperties | undefined): number {
  if (!props) return 0;
  
  let count = 0;
  if (props.thermal) count += Object.keys(props.thermal).length;
  if (props.optical) count += Object.keys(props.optical).length;
  if (props.mechanical) count += Object.keys(props.mechanical).length;
  if (props.chemical) count += Object.keys(props.chemical).length;
  
  return count;
}

/**
 * Extract material name from ID/filename
 */
function extractMaterialName(id: string): string {
  return id
    .replace(/-laser-cleaning$/, '')
    .replace(/-settings$/, '')
    .toLowerCase();
}

/**
 * Get material properties from database
 */
function getMaterialProperties(materialId: string): Partial<MaterialProperties> | null {
  const materialName = extractMaterialName(materialId);
  
  // Direct match
  if (PROPERTY_DATABASE[materialName]) {
    return PROPERTY_DATABASE[materialName];
  }
  
  // Fuzzy match for alloys/variants
  for (const [key, props] of Object.entries(PROPERTY_DATABASE)) {
    if (materialName.includes(key) || key.includes(materialName)) {
      console.log(`   ℹ️  Using ${key} properties for ${materialName}`);
      return props;
    }
  }
  
  return null;
}

/**
 * Migrate single material file
 */
function migrateMaterial(filePath: string, dryRun: boolean = true): boolean {
  const material = loadMaterial(filePath);
  if (!material) return false;
  
  // Skip if already has materialProperties
  if (material.materialProperties && Object.keys(material.materialProperties).length > 0) {
    console.log(`⏭️  Skipped: ${material.name} (already has properties)`);
    return false;
  }
  
  // Get properties from database
  const properties = getMaterialProperties(material.id || material.name);
  if (!properties) {
    console.log(`⚠️  Skipped: ${material.name} (no properties in database)`);
    return false;
  }
  
  // Add materialProperties
  material.materialProperties = properties;
  
  // Update dateModified
  material.dateModified = new Date().toISOString();
  
  // Save
  saveMaterial(filePath, material, dryRun);
  
  return true;
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--commit');
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📦 Material Properties Migration Script');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
    console.log('   Run with --commit flag to apply changes\n');
  } else {
    console.log('✍️  COMMIT MODE - Files will be updated\n');
  }
  
  const materialsDir = path.join(process.cwd(), 'frontmatter', 'materials');
  const files = fs.readdirSync(materialsDir).filter(f => f.endsWith('.yaml'));
  
  console.log(`📁 Found ${files.length} material files\n`);
  
  let migrated = 0;
  let skipped = 0;
  let alreadyHas = 0;
  let noData = 0;
  
  for (const file of files) {
    const filePath = path.join(materialsDir, file);
    
    try {
      const material = loadMaterial(filePath);
      if (!material) {
        skipped++;
        continue;
      }
      
      if (material.materialProperties && Object.keys(material.materialProperties).length > 0) {
        alreadyHas++;
        continue;
      }
      
      const properties = getMaterialProperties(material.id || material.name);
      if (!properties) {
        noData++;
        continue;
      }
      
      material.materialProperties = properties;
      material.dateModified = new Date().toISOString();
      saveMaterial(filePath, material, dryRun);
      migrated++;
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      skipped++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 Migration Summary');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Total files: ${files.length}`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ✓  Already has properties: ${alreadyHas}`);
  console.log(`   ⚠️  No data in database: ${noData}`);
  console.log(`   ❌ Skipped (errors): ${skipped}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (dryRun && migrated > 0) {
    console.log('💡 Run with --commit flag to apply these changes\n');
  }
  
  if (noData > 0) {
    console.log(`⚠️  ${noData} materials missing from property database`);
    console.log('   Consider expanding PROPERTY_DATABASE in this script\n');
  }
}

main().catch(console.error);
