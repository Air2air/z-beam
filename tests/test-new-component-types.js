// Test for new component types - validates that metricsmachinesettings and metricsproperties work correctly
const path = require('path');
const { getArticle } = require(path.join(__dirname, '..', 'app', 'utils', 'contentAPI'));

async function testNewComponentTypes() {
  console.log('🧪 Testing new component types...\n');
  
  try {
    // Test aluminum article which should have both component types
    const article = await getArticle('aluminum-laser-cleaning');
    
    if (!article) {
      console.log('❌ Could not load aluminum article');
      return;
    }

    const components = article.components || {};
    const componentTypes = Object.keys(components);
    
    console.log('📋 Available component types:', componentTypes);
    
    // Check for new component types
    const hasMetricsMachineSettings = 'metricsmachinesettings' in components;
    const hasMetricsProperties = 'metricsproperties' in components;
    
    console.log('\n🔍 Component Type Validation:');
    console.log(`  metricsmachinesettings: ${hasMetricsMachineSettings ? '✅ Found' : '❌ Missing'}`);
    console.log(`  metricsproperties: ${hasMetricsProperties ? '✅ Found' : '❌ Missing'}`);
    
    // Check component data structure
    if (hasMetricsMachineSettings) {
      const machineSettingsComponent = components.metricsmachinesettings;
      console.log(`\n📊 MetricsMachineSettings structure:`);
      console.log(`  - Has config: ${machineSettingsComponent.config ? '✅' : '❌'}`);
      if (machineSettingsComponent.config) {
        console.log(`  - Config keys: ${Object.keys(machineSettingsComponent.config).join(', ')}`);
      }
    }
    
    if (hasMetricsProperties) {
      const propertiesComponent = components.metricsproperties;
      console.log(`\n📊 MetricsProperties structure:`);
      console.log(`  - Has config: ${propertiesComponent.config ? '✅' : '❌'}`);
      if (propertiesComponent.config) {
        console.log(`  - Config keys: ${Object.keys(propertiesComponent.config).join(', ')}`);
      }
    }
    
    // Check if old component types are still present (they shouldn't be)
    const hasOldMetricscard = 'metricscard' in components;
    const hasOldProperties = 'properties' in components;
    
    console.log('\n🗂️  Legacy Component Check:');
    console.log(`  metricscard (old): ${hasOldMetricscard ? '⚠️  Present (should be removed)' : '✅ Absent'}`);
    console.log(`  properties (old): ${hasOldProperties ? '⚠️  Present (should be removed)' : '✅ Absent'}`);
    
    console.log('\n✅ Component type test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewComponentTypes();