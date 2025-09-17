// Simple test to check YAML parsing
const fs = require('fs');
const matter = require('gray-matter');

// Read the copper YAML file directly
const filePath = './content/components/table/copper-laser-cleaning.yaml';
const content = fs.readFileSync(filePath, 'utf-8');

console.log('Raw file content (first 200 chars):');
console.log(content.substring(0, 200));

try {
  // For pure YAML files, we need to parse directly, not as front matter
  const yaml = require('yaml');
  const yamlData = yaml.parse(content);
  
  console.log('\nParsed YAML data structure:');
  console.log('Keys in data:', Object.keys(yamlData));
  
  if (yamlData.materialTables) {
    console.log('materialTables exists');
    console.log('Tables count:', yamlData.materialTables.tables?.length || 0);
    
    if (yamlData.materialTables.tables?.length > 0) {
      const firstTable = yamlData.materialTables.tables[0];
      console.log('First table header:', firstTable.header);
      console.log('First table rows count:', firstTable.rows?.length || 0);
    }
  } else {
    console.log('materialTables does NOT exist');
  }
  
  // Also test with matter to see the difference
  console.log('\n--- Testing with matter ---');
  const matterData = matter(content);
  console.log('Matter keys in data:', Object.keys(matterData.data));
  console.log('Matter content length:', matterData.content.length);
  
} catch (error) {
  console.error('Error parsing YAML:', error);
}
