// test-table-debug.js
const fs = require('fs');
const path = require('path');

// Check if table files exist
const tableDir = path.join(process.cwd(), 'content', 'components', 'table');
const copperYamlPath = path.join(tableDir, 'copper-laser-cleaning.yaml');
const copperMdPath = path.join(tableDir, 'copper-laser-cleaning.md');

console.log('Table directory exists:', fs.existsSync(tableDir));
console.log('Copper YAML exists:', fs.existsSync(copperYamlPath));
console.log('Copper MD exists:', fs.existsSync(copperMdPath));

if (fs.existsSync(tableDir)) {
  const files = fs.readdirSync(tableDir);
  const copperFiles = files.filter(f => f.includes('copper'));
  console.log('Copper table files:', copperFiles);
}

// Test if we can read the YAML file
if (fs.existsSync(copperYamlPath)) {
  try {
    const content = fs.readFileSync(copperYamlPath, 'utf-8');
    console.log('YAML file size:', content.length);
    console.log('YAML starts with:', content.substring(0, 100));
  } catch (err) {
    console.error('Error reading YAML:', err);
  }
}
