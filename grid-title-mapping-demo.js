// Grid Title Mapping Demo
// Shows the new centralized grid title mapping functionality

import { getDisplayTitle, getTitleMapping, createGridConfig } from '../app/utils/gridTitleMapping';

// Test the basic title mapping
console.log('=== Basic Title Mapping ===');
console.log('fluenceThreshold:', getDisplayTitle('fluenceThreshold', 'materialProperties'));
console.log('thermalConductivity:', getDisplayTitle('thermalConductivity', 'materialProperties'));
console.log('powerRange:', getDisplayTitle('powerRange', 'machineSettings'));
console.log('scanSpeed:', getDisplayTitle('scanSpeed', 'machineSettings'));

// Test fallback for unmapped keys
console.log('\n=== Fallback Mapping ===');
console.log('customProperty:', getDisplayTitle('customProperty', 'materialProperties'));
console.log('anotherSetting:', getDisplayTitle('anotherSetting', 'machineSettings'));

// Test data source specific mappings
console.log('\n=== Data Source Specific Mappings ===');
console.log('Material Properties - thermalConductivity:', getDisplayTitle('thermalConductivity', 'materialProperties'));
console.log('Machine Settings - power:', getDisplayTitle('power', 'machineSettings'));

// Test grid configuration creation
console.log('\n=== Grid Configuration ===');
const materialConfig = createGridConfig('materialProperties', {
  customProperty: 'Custom Material Prop'
});
console.log('Material config created with custom mapping');

const machineConfig = createGridConfig('machineSettings', {
  customSetting: 'Custom Machine Setting'
});
console.log('Machine config created with custom mapping');

console.log('\n=== Complete Title Mappings ===');
const materialMappings = getTitleMapping('materialProperties');
const machineMappings = getTitleMapping('machineSettings');

console.log('Material properties count:', Object.keys(materialMappings).length);
console.log('Machine settings count:', Object.keys(machineMappings).length);

console.log('\nDemo completed successfully! ✅');