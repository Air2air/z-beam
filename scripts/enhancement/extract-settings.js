#!/usr/bin/env node

/**
 * Extract Machine Settings from Caption Components
 * Creates separate settings components from caption laser_parameters sections
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CAPTION_DIR = './content/components/caption';
const SETTINGS_DIR = './content/components/settings';

// Ensure settings directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

function extractSettings(captionFilePath) {
  try {
    let content = fs.readFileSync(captionFilePath, 'utf8');
    
    // Handle potential multiple document separators by taking the first document
    if (content.includes('---')) {
      const parts = content.split('---');
      // Find the first non-empty section that contains actual YAML data
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (part && !part.startsWith('#') && part.includes(':')) {
          content = part;
          break;
        }
      }
    }
    
    const data = yaml.load(content);
    
    if (!data || !data.laser_parameters) {
      console.log(`⚠️  No laser_parameters found in ${captionFilePath}`);
      return null;
    }

    const material = data.material || path.basename(captionFilePath, '.yaml').replace('-laser-cleaning', '');
    
    // Create settings structure that matches contentAPI expectations
    const settings = {
      laser_parameters: data.laser_parameters,
      material_settings: {
        material: material.charAt(0).toUpperCase() + material.slice(1),
        substrate_type: getMaterialType(material),
        recommended_wavelength: extractMainWavelength(data.laser_parameters.wavelength),
        optimal_power_range: data.laser_parameters.power,
        processing_atmosphere: 'ambient air',
        cooling_requirements: getPowerLevel(data.laser_parameters.power) > 100 ? 'active cooling recommended' : 'passive cooling sufficient'
      },
      technical_specs: {
        beam_delivery: 'fiber optic',
        focus_diameter: data.laser_parameters.spot_size || 'variable',
        beam_quality: 'M² < 1.3',
        polarization: 'linear',
        stability: '±2% power stability'
      },
      safety_parameters: {
        max_energy_density: data.laser_parameters.energy_density,
        safety_margin: '20% below damage threshold',
        protective_equipment: 'Class 4 laser safety',
        ventilation_required: true,
        eye_protection: 'OD 7+ at primary wavelength'
      },
      process_settings: {
        multiple_passes: getMaterialType(material) === 'metal' ? '1-2 passes typically sufficient' : '2-3 passes for delicate materials',
        overlap_percentage: '10-30%',
        dwell_time: 'calculated based on scanning speed',
        surface_preparation: 'clean, dry surface recommended',
        post_processing: 'compressed air cleaning'
      },
      quality_control: {
        monitoring_method: 'real-time optical feedback',
        success_criteria: 'complete contamination removal without substrate damage',
        inspection_interval: 'every 10 cm² of processed area',
        documentation: 'before/after surface analysis'
      }
    };

    return settings;
  } catch (error) {
    console.error(`❌ Error processing ${captionFilePath}:`, error.message);
    return null;
  }
}

function extractMainWavelength(wavelengthString) {
  if (!wavelengthString) return '1064nm';
  const match = wavelengthString.match(/(\d+nm)/);
  return match ? match[1] : '1064nm';
}

function getMaterialType(material) {
  const metals = ['aluminum', 'steel', 'copper', 'brass', 'bronze', 'titanium', 'nickel', 'iron', 'gold', 'silver', 'platinum'];
  const stones = ['alabaster', 'marble', 'granite', 'limestone', 'sandstone', 'slate'];
  const woods = ['oak', 'pine', 'cedar', 'maple', 'cherry', 'birch', 'mahogany'];
  const ceramics = ['porcelain', 'alumina', 'zirconia'];
  
  if (metals.includes(material.toLowerCase())) return 'metal';
  if (stones.includes(material.toLowerCase())) return 'stone';
  if (woods.includes(material.toLowerCase())) return 'wood';
  if (ceramics.includes(material.toLowerCase())) return 'ceramic';
  return 'composite';
}

function getPowerLevel(powerString) {
  if (!powerString) return 50;
  const match = powerString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 50;
}

function processAllCaptions() {
  console.log('🔧 Extracting machine settings from caption components...\n');
  
  const captionFiles = fs.readdirSync(CAPTION_DIR)
    .filter(file => file.endsWith('.yaml'))
    .sort();

  let processed = 0;
  let created = 0;

  for (const file of captionFiles) {
    const captionPath = path.join(CAPTION_DIR, file);
    const settingsPath = path.join(SETTINGS_DIR, file);
    
    console.log(`📝 Processing: ${file}`);
    
    const settings = extractSettings(captionPath);
    if (settings) {
      // Convert to YAML string with proper formatting
      const yamlContent = yaml.dump(settings, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false
      });
      
      fs.writeFileSync(settingsPath, yamlContent);
      created++;
      console.log(`   ✅ Created: ${settingsPath}`);
    }
    processed++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   📁 Caption files processed: ${processed}`);
  console.log(`   ⚙️  Settings components created: ${created}`);
  console.log(`   📂 Settings directory: ${SETTINGS_DIR}`);
  
  if (created > 0) {
    console.log(`\n🎉 Successfully extracted machine settings from caption components!`);
    console.log(`   Settings components are now available as separate, reusable modules.`);
  }
}

// Run the extraction
processAllCaptions();
