#!/usr/bin/env node
/**
 * Generate Dataset Quality Report
 * 
 * Analyzes all materials and generates comprehensive quality metrics
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  getDatasetQualityMetrics,
  formatQualityReport,
  formatQualityJSON,
  generateQualityDashboard,
  createQualitySummary
} from '../../app/datasets';

interface Material {
  name: string;
  machineSettings?: any;
  materialProperties?: any;
}

function loadAllMaterials(): Material[] {
  const materials: Material[] = [];
  const materialsDir = path.join(process.cwd(), 'frontmatter', 'materials');
  const settingsDir = path.join(process.cwd(), 'frontmatter', 'settings');
  
  if (!fs.existsSync(materialsDir)) {
    console.error('❌ Materials directory not found');
    return [];
  }
  
  const materialFiles = fs.readdirSync(materialsDir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  materialFiles.forEach(file => {
    try {
      const materialPath = path.join(materialsDir, file);
      const materialContent = fs.readFileSync(materialPath, 'utf8');
      const materialData = yaml.load(materialContent) as any;
      
      // Load corresponding settings
      const slug = file.replace(/\.(yaml|yml)$/, '').replace('-laser-cleaning', '');
      const settingsFile = `${slug}-settings.yaml`;
      const settingsPath = path.join(settingsDir, settingsFile);
      
      let machineSettings = null;
      if (fs.existsSync(settingsPath)) {
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        const settingsData = yaml.load(settingsContent) as any;
        machineSettings = settingsData.machineSettings;
      }
      
      materials.push({
        name: materialData.name || slug,
        machineSettings,
        materialProperties: materialData.materialProperties
      });
    } catch (error) {
      console.warn(`⚠️  Failed to load ${file}:`, error);
    }
  });
  
  return materials;
}

async function main() {
  const args = process.argv.slice(2);
  const format = args.includes('--format') 
    ? args[args.indexOf('--format') + 1] 
    : 'console';
  const outputFile = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : null;
  
  console.log('📊 Analyzing dataset quality...\n');
  
  const materials = loadAllMaterials();
  console.log(`✅ Loaded ${materials.length} materials\n`);
  
  const metrics = getDatasetQualityMetrics(materials);
  
  let output: string;
  
  switch (format) {
    case 'json':
      output = formatQualityJSON(metrics);
      break;
    
    case 'html':
      output = generateQualityDashboard(metrics);
      break;
    
    case 'summary':
      output = createQualitySummary(metrics);
      break;
    
    case 'console':
    default:
      output = formatQualityReport(metrics);
      break;
  }
  
  if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf8');
    console.log(`💾 Report saved to ${outputFile}`);
  } else {
    console.log(output);
  }
  
  // Exit with error code if completion rate is below 90%
  if (metrics.completionRate < 90) {
    console.log('\n⚠️  Dataset quality below threshold (90%)');
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error generating quality report:', error);
  process.exit(1);
});
