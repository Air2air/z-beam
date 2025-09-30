// Section Header Mapping Demo
// Shows the new section header mapping functionality for grid titles

import { getSectionHeaderTitle, createSectionHeaderMapping } from '../app/utils/gridTitleMapping';

console.log('=== Section Header Mapping Demo ===\n');

// Test default section headers
console.log('=== Default Headers ===');
console.log('Material Properties (default):', getSectionHeaderTitle('materialProperties', 'default'));
console.log('Machine Settings (default):', getSectionHeaderTitle('machineSettings', 'default'));

// Test comparison format (like your example)
console.log('\n=== Comparison Headers ===');
console.log('Material Properties (comparison):', getSectionHeaderTitle('materialProperties', 'comparison', 'Alumina', 'Ceramic'));
console.log('Machine Settings (comparison):', getSectionHeaderTitle('machineSettings', 'comparison', 'Alumina', 'Ceramic'));

// Test standalone format
console.log('\n=== Standalone Headers ===');
console.log('Material Properties (standalone):', getSectionHeaderTitle('materialProperties', 'standalone', 'Alumina'));
console.log('Machine Settings (standalone):', getSectionHeaderTitle('machineSettings', 'standalone', 'Alumina'));

// Test with different materials
console.log('\n=== Different Materials ===');
console.log('Silicon Nitride Properties:', getSectionHeaderTitle('materialProperties', 'comparison', 'Silicon Nitride', 'Ceramic'));
console.log('Steel Machine Settings:', getSectionHeaderTitle('machineSettings', 'comparison', 'Steel', 'Metal'));

// Test custom mapping
console.log('\n=== Custom Section Mapping ===');
const customMapping = createSectionHeaderMapping({
  materialProperties: {
    comparison: 'Material Analysis: {material} compared to other {category}s',
  },
  machineSettings: {
    comparison: 'Processing Parameters: {material} vs. other {category}s',
  }
});

console.log('Custom mapping created with specialized templates');

// Test fallback behavior
console.log('\n=== Fallback Behavior ===');
console.log('No material provided:', getSectionHeaderTitle('materialProperties', 'comparison'));
console.log('Default when format unavailable:', getSectionHeaderTitle('machineSettings', 'default'));

console.log('\n=== Generated Headers (Examples) ===');
const examples = [
  ['materialProperties', 'comparison', 'Alumina', 'Ceramic'],
  ['machineSettings', 'comparison', 'Titanium', 'Metal'], 
  ['materialProperties', 'standalone', 'Silicon Carbide'],
  ['machineSettings', 'standalone', 'Copper'],
];

examples.forEach(([dataSource, format, material, category]) => {
  const title = getSectionHeaderTitle(dataSource, format, material, category);
  console.log(`${dataSource} (${format}): "${title}"`);
});

console.log('\n✅ Section Header Mapping Demo completed!');
console.log('\nThese headers will now appear in the <h3> elements above your grids.');