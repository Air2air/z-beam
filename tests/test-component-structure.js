// Simple validation test for new component types
const fs = require('fs');
const path = require('path');

function testNewComponentTypes() {
  console.log('🧪 Testing new component types structure...\n');
  
  const contentComponentsDir = path.join(__dirname, '..', 'content', 'components');
  
  // Check if new directories exist
  const metricsMachineSettingsDir = path.join(contentComponentsDir, 'metricsmachinesettings');
  const metricsPropertiesDir = path.join(contentComponentsDir, 'metricsproperties');
  
  // Check if old directories no longer exist
  const oldMetricsCardDir = path.join(contentComponentsDir, 'metricscard');
  const oldPropertiesDir = path.join(contentComponentsDir, 'properties');
  
  console.log('📁 Directory Structure Check:');
  
  console.log(`  metricsmachinesettings/: ${fs.existsSync(metricsMachineSettingsDir) ? '✅ Exists' : '❌ Missing'}`);
  console.log(`  metricsproperties/: ${fs.existsSync(metricsPropertiesDir) ? '✅ Exists' : '❌ Missing'}`);
  
  console.log(`  metricscard/ (old): ${fs.existsSync(oldMetricsCardDir) ? '⚠️  Still exists' : '✅ Removed'}`);
  console.log(`  properties/ (old): ${fs.existsSync(oldPropertiesDir) ? '⚠️  Still exists' : '✅ Removed'}`);
  
  // Check for YAML files in new directories
  if (fs.existsSync(metricsMachineSettingsDir)) {
    const machineSettingsFiles = fs.readdirSync(metricsMachineSettingsDir).filter(f => f.endsWith('.yaml'));
    console.log(`\n📊 MetricsMachineSettings YAML files (${machineSettingsFiles.length}):`);
    machineSettingsFiles.forEach(file => console.log(`    - ${file}`));
  }
  
  if (fs.existsSync(metricsPropertiesDir)) {
    const propertiesFiles = fs.readdirSync(metricsPropertiesDir).filter(f => f.endsWith('.md'));
    console.log(`\n📊 MetricsProperties MD files (${propertiesFiles.length}):`);
    propertiesFiles.forEach(file => console.log(`    - ${file}`));
  }
  
  // Test reading YAML and MD files to verify structure
  const testYamlFile = path.join(metricsMachineSettingsDir, 'aluminum-laser-cleaning.yaml');
  if (fs.existsSync(testYamlFile)) {
    console.log(`\n🔍 Testing YAML structure (aluminum-laser-cleaning.yaml):`);
    try {
      const yamlContent = fs.readFileSync(testYamlFile, 'utf8');
      const hasMetricsCardConfig = yamlContent.includes('MetricsCard Configuration');
      const hasMachineSettings = yamlContent.includes('machineSettings:');
      console.log(`    - Contains MetricsCard config: ${hasMetricsCardConfig ? '✅' : '❌'}`);
      console.log(`    - Contains machineSettings data: ${hasMachineSettings ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    - ❌ Error reading YAML: ${error.message}`);
    }
  }

  // Test reading MD file for metricsproperties
  const testMdFile = path.join(metricsPropertiesDir, 'aluminum-laser-cleaning.md');
  if (fs.existsSync(testMdFile)) {
    console.log(`\n🔍 Testing MD structure (aluminum-laser-cleaning.md):`);
    try {
      const mdContent = fs.readFileSync(testMdFile, 'utf8');
      const hasProperties = mdContent.includes('properties:');
      const hasDensity = mdContent.includes('density:');
      const hasThermalConductivity = mdContent.includes('thermalConductivity:');
      console.log(`    - Contains properties object: ${hasProperties ? '✅' : '❌'}`);
      console.log(`    - Contains material properties: ${(hasDensity && hasThermalConductivity) ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    - ❌ Error reading MD: ${error.message}`);
    }
  }
  
  console.log('\n✅ Directory structure test completed!');
}

testNewComponentTypes();