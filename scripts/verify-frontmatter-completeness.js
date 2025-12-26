// Script to verify which frontmatter files pass isYamlComplete() validation
// This helps identify which materials will be included in static generation

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const frontmatterDir = path.join(__dirname, '..', 'frontmatter', 'materials');

function isYamlComplete(data) {
  const requiredFields = ['name', 'title', 'description', 'category', 'images', 'author'];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], data);
    if (!value) {
      return { valid: false, missing: field };
    }
  }
  
  // Additional validation for nested fields
  if (!data.author?.name || !data.author?.expertise || !data.author?.country) {
    return { valid: false, missing: 'author fields (name/expertise/country)' };
  }
  
  if (!data.images?.hero?.url || !data.images?.micro?.url) {
    return { valid: false, missing: 'images.hero.url or images.micro.url' };
  }
  
  return { valid: true };
}

async function checkAllFrontmatter() {
  const files = fs.readdirSync(frontmatterDir).filter(f => f.endsWith('.yaml'));
  
  const results = {
    complete: [],
    incomplete: [],
    errors: []
  };
  
  console.log(`\n🔍 Checking ${files.length} frontmatter files...\n`);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(frontmatterDir, file), 'utf8');
      const parsed = yaml.load(content);
      
      const validation = isYamlComplete(parsed);
      
      if (validation.valid) {
        results.complete.push(file);
      } else {
        results.incomplete.push({ file, reason: validation.missing });
      }
    } catch (error) {
      results.errors.push({ file, error: error.message });
    }
  }
  
  // Print summary
  console.log(`✅ Complete (will generate pages): ${results.complete.length}`);
  console.log(`❌ Incomplete (will be skipped): ${results.incomplete.length}`);
  console.log(`⚠️  Parse errors: ${results.errors.length}\n`);
  
  // Show incomplete files
  if (results.incomplete.length > 0) {
    console.log('❌ INCOMPLETE FILES (these pages will return 404):');
    results.incomplete.forEach(({ file, reason }) => {
      console.log(`   - ${file}: Missing ${reason}`);
    });
    console.log('');
  }
  
  // Show errors
  if (results.errors.length > 0) {
    console.log('⚠️  PARSE ERRORS:');
    results.errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
    console.log('');
  }
  
  // Check specific files mentioned in conversation
  const testFiles = ['aluminum-laser-cleaning.yaml', 'carbon-steel-laser-cleaning.yaml', 'steel-laser-cleaning.yaml'];
  console.log('🔍 Test files from conversation:');
  testFiles.forEach(file => {
    if (results.complete.includes(file)) {
      console.log(`   ✅ ${file} - COMPLETE`);
    } else if (results.incomplete.find(i => i.file === file)) {
      const item = results.incomplete.find(i => i.file === file);
      console.log(`   ❌ ${file} - INCOMPLETE: ${item.reason}`);
    } else if (results.errors.find(e => e.file === file)) {
      console.log(`   ⚠️  ${file} - PARSE ERROR`);
    } else {
      console.log(`   ❓ ${file} - FILE NOT FOUND`);
    }
  });
  
  return results;
}

checkAllFrontmatter().catch(console.error);
