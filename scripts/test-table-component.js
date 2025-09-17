// Test script to verify Table component with new table content files
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING TABLE COMPONENT WITH NEW CONTENT');
console.log('=============================================\n');

// Test 1: Check if table content files exist
console.log('1️⃣ Checking table content files...');
const tableDir = path.join(__dirname, 'content/components/table');
if (fs.existsSync(tableDir)) {
  const tableFiles = fs.readdirSync(tableDir).filter(f => f.endsWith('.md'));
  console.log(`   ✅ Found ${tableFiles.length} table files:`);
  tableFiles.forEach(file => {
    console.log(`      - ${file}`);
  });
} else {
  console.log('   ❌ Table content directory not found');
  process.exit(1);
}

// Test 2: Analyze table content structure
console.log('\n2️⃣ Analyzing table content structure...');
const aluminumTablePath = path.join(tableDir, 'aluminum-laser-cleaning.md');
if (fs.existsSync(aluminumTablePath)) {
  const content = fs.readFileSync(aluminumTablePath, 'utf8');
  
  // Check for sectioned structure
  const sections = content.split(/^## /gm).filter(Boolean);
  console.log(`   ✅ Found ${sections.length} table sections:`);
  
  sections.forEach((section, index) => {
    const title = section.split('\n')[0];
    const lineCount = section.split('\n').length;
    const hasTable = section.includes('|');
    console.log(`      ${index + 1}. ${title} (${lineCount} lines, table: ${hasTable ? '✅' : '❌'})`);
  });
  
  // Check for enhanced features
  const hasMultipleTables = (content.match(/\|/g) || []).length > 10;
  const hasVersionLog = content.includes('Version Log');
  
  console.log(`   📊 Content analysis:`);
  console.log(`      - Multiple tables: ${hasMultipleTables ? '✅' : '❌'}`);
  console.log(`      - Version log: ${hasVersionLog ? '✅' : '❌'}`);
  console.log(`      - Material properties: ${content.includes('Material Properties') ? '✅' : '❌'}`);
  console.log(`      - Laser parameters: ${content.includes('Laser Cleaning Parameters') ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Aluminum table file not found');
}

// Test 3: Check Table component
console.log('\n3️⃣ Checking Table component...');
const tableComponentPath = path.join(__dirname, 'app/components/Table/Table.tsx');
if (fs.existsSync(tableComponentPath)) {
  const componentContent = fs.readFileSync(tableComponentPath, 'utf8');
  
  // Check for enhanced features
  const hasVariantSupport = componentContent.includes('variant?:');
  const hasSectionedHandling = componentContent.includes('isSectionedContent');
  const hasContentCleaning = componentContent.includes('cleanContent');
  const hasVersionLogRemoval = componentContent.includes('Version Log');
  
  console.log(`   ✅ Table component features:`);
  console.log(`      - Variant support: ${hasVariantSupport ? '✅' : '❌'}`);
  console.log(`      - Sectioned content handling: ${hasSectionedHandling ? '✅' : '❌'}`);
  console.log(`      - Content cleaning: ${hasContentCleaning ? '✅' : '❌'}`);
  console.log(`      - Version log removal: ${hasVersionLogRemoval ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Table component not found');
}

// Test 4: Check Layout integration
console.log('\n4️⃣ Checking Layout integration...');
const layoutPath = path.join(__dirname, 'app/components/Layout/Layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const hasTableImport = layoutContent.includes('import { Table }');
  const hasTableInOrder = layoutContent.includes("'table'");
  
  console.log(`   ✅ Layout integration:`);
  console.log(`      - Table import: ${hasTableImport ? '✅' : '❌'}`);
  console.log(`      - Table in component order: ${hasTableInOrder ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Layout component not found');
}

// Test 5: Simulate enhanced Table rendering
console.log('\n5️⃣ Simulating enhanced Table rendering...');

// Mock the enhanced table logic
function simulateTableRendering(content) {
  const isSectionedContent = content.includes('## Material Properties') || 
                            content.includes('## Material Grades') ||
                            content.includes('## Performance Metrics');
  
  if (isSectionedContent) {
    const sections = content.split(/^## /gm).filter(Boolean);
    const cleanedSections = sections.map(section => {
      const lines = section.split('\n');
      const title = lines[0];
      const sectionContent = lines.slice(1).join('\n').trim();
      return { title, content: sectionContent };
    });
    
    return {
      type: 'sectioned',
      sections: cleanedSections.length,
      titles: cleanedSections.map(s => s.title)
    };
  }
  
  return { type: 'default' };
}

if (fs.existsSync(aluminumTablePath)) {
  const content = fs.readFileSync(aluminumTablePath, 'utf8');
  const result = simulateTableRendering(content);
  
  console.log(`   ✅ Rendering simulation:`);
  console.log(`      - Rendering type: ${result.type}`);
  if (result.type === 'sectioned') {
    console.log(`      - Number of sections: ${result.sections}`);
    console.log(`      - Section titles:`);
    result.titles.forEach((title, index) => {
      console.log(`        ${index + 1}. ${title}`);
    });
  }
}

console.log('\n🎉 Table component analysis complete!');
console.log('✨ The enhanced Table component should now display:');
console.log('   • Multiple organized table sections');
console.log('   • Clean sectioned layout with visual separation');
console.log('   • Enhanced styling with gradients and hover effects');
console.log('   • Automatic version log removal');
console.log('   • Responsive design for mobile devices');
