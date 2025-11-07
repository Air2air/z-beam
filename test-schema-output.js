/**
 * Test script to verify schema output includes proper author references
 * Run: node test-schema-output.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Import SchemaFactory (would need to transpile TypeScript first)
// For now, let's just verify the logic by checking the frontmatter structure

const frontmatterPath = path.join(__dirname, 'frontmatter/materials/steel-laser-cleaning.yaml');
const content = fs.readFileSync(frontmatterPath, 'utf8');
const data = yaml.parse(content);

console.log('=== FRONTMATTER AUTHOR CHECK ===');
console.log('Has author field:', !!data.author);
console.log('Author name:', data.author?.name);
console.log('Author affiliation:', data.author?.affiliation?.name);
console.log('Author jobTitle:', data.author?.jobTitle);
console.log('Author expertise:', data.author?.expertise);

console.log('\n=== EXPECTED SCHEMA OUTPUT ===');
console.log('Article schema should have:');
console.log('  author: { "@id": "https://z-beam.com/materials/metal/ferrous/steel-laser-cleaning#person-author" }');
console.log('\nPerson schema should have:');
console.log('  "@type": "Person"');
console.log('  "@id": "https://z-beam.com/materials/metal/ferrous/steel-laser-cleaning#person-author"');
console.log('  "name":', data.author?.name);
console.log('  "jobTitle":', data.author?.jobTitle);
console.log('  "worksFor": { "@type": "Organization", "name":', data.author?.affiliation?.name, '}');
