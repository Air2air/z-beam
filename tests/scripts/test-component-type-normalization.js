// Comprehensive test for component type normalization and centralization
const fs = require('fs');
const path = require('path');

function testComponentTypeNormalization() {
  console.log('🧪 Testing Component Type Normalization...\n');
  
  // 1. Check actual folders in content/components
  const contentComponentsDir = path.join(__dirname, '..', 'content', 'components');
  const actualFolders = fs.readdirSync(contentComponentsDir)
    .filter(item => {
      const itemPath = path.join(contentComponentsDir, item);
      return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
    })
    .sort();
  
  console.log('📁 Actual component folders:');
  actualFolders.forEach(folder => console.log(`    - ${folder}`));
  
  // 2. Check TypeScript ComponentType definition
  const typesFile = path.join(__dirname, '..', 'types', 'centralized.ts');
  const typesContent = fs.readFileSync(typesFile, 'utf8');
  const componentTypeMatch = typesContent.match(/export type ComponentType = '([^']+)'(?:\s*\|\s*'([^']+)')*;/);
  
  let definedTypes = [];
  if (componentTypeMatch) {
    const typesString = componentTypeMatch[0];
    definedTypes = [...typesString.matchAll(/'([^']+)'/g)].map(match => match[1]).sort();
  }
  
  console.log('\n📝 TypeScript ComponentType definition:');
  definedTypes.forEach(type => console.log(`    - ${type}`));
  
  // 3. Check contentAPI CONTENT_DIRS
  const contentAPIFile = path.join(__dirname, '..', 'app', 'utils', 'contentAPI.ts');
  const contentAPIContent = fs.readFileSync(contentAPIFile, 'utf8');
  const contentDirsMatch = contentAPIContent.match(/components: \{([^}]+)\}/s);
  
  let apiTypes = [];
  if (contentDirsMatch) {
    const dirsString = contentDirsMatch[1];
    apiTypes = [...dirsString.matchAll(/(\w+):\s*path\.join/g)].map(match => match[1]).sort();
  }
  
  console.log('\n🔧 ContentAPI CONTENT_DIRS:');
  apiTypes.forEach(type => console.log(`    - ${type}`));
  
  // 4. Check Layout ARTICLE_COMPONENT_ORDER
  const layoutFile = path.join(__dirname, '..', 'app', 'components', 'Layout', 'Layout.tsx');
  const layoutContent = fs.readFileSync(layoutFile, 'utf8');
  const orderMatch = layoutContent.match(/ARTICLE_COMPONENT_ORDER = \[([^\]]+)\]/s);
  
  let orderTypes = [];
  if (orderMatch) {
    const orderString = orderMatch[1];
    orderTypes = [...orderString.matchAll(/'([^']+)'/g)].map(match => match[1]);
  }
  
  console.log('\n📋 Layout ARTICLE_COMPONENT_ORDER:');
  orderTypes.forEach(type => console.log(`    - ${type}`));
  
  // 5. Analysis and validation
  console.log('\n🔍 NORMALIZATION ANALYSIS:');
  
  // Check if all folders are in TypeScript types
  const missingFromTypes = actualFolders.filter(folder => !definedTypes.includes(folder));
  const extraInTypes = definedTypes.filter(type => !actualFolders.includes(type) && type !== 'content');
  
  console.log('\n📊 Folder vs TypeScript ComponentType:');
  if (missingFromTypes.length === 0) {
    console.log('    ✅ All folders are represented in ComponentType');
  } else {
    console.log('    ❌ Missing from ComponentType:', missingFromTypes.join(', '));
  }
  
  if (extraInTypes.length === 0) {
    console.log('    ✅ No extra types in ComponentType');
  } else {
    console.log('    ⚠️  Extra in ComponentType (may be virtual):', extraInTypes.join(', '));
  }
  
  // Check if all folders are in contentAPI
  const missingFromAPI = actualFolders.filter(folder => !apiTypes.includes(folder));
  const extraInAPI = apiTypes.filter(type => !actualFolders.includes(type));
  
  console.log('\n📊 Folder vs ContentAPI:');
  if (missingFromAPI.length === 0) {
    console.log('    ✅ All folders are represented in ContentAPI');
  } else {
    console.log('    ❌ Missing from ContentAPI:', missingFromAPI.join(', '));
  }
  
  if (extraInAPI.length === 0) {
    console.log('    ✅ No extra types in ContentAPI');
  } else {
    console.log('    ⚠️  Extra in ContentAPI:', extraInAPI.join(', '));
  }
  
  // Check component order consistency
  const orderNotInTypes = orderTypes.filter(type => !definedTypes.includes(type));
  const typesNotInOrder = definedTypes.filter(type => !orderTypes.includes(type) && !['author', 'frontmatter', 'jsonld', 'metatags', 'text'].includes(type));
  
  console.log('\n📊 Layout Order vs ComponentType:');
  if (orderNotInTypes.length === 0) {
    console.log('    ✅ All order types are in ComponentType');
  } else {
    console.log('    ❌ Order types not in ComponentType:', orderNotInTypes.join(', '));
  }
  
  if (typesNotInOrder.length === 0) {
    console.log('    ✅ Rendering types are properly ordered');
  } else {
    console.log(`    ℹ️  ComponentTypes not in render order (infrastructure): ${typesNotInOrder.join(', ')}`);
  }
  
  // Summary
  console.log('\n📋 SUMMARY:');
  const isFullyNormalized = missingFromTypes.length === 0 && missingFromAPI.length === 0 && orderNotInTypes.length === 0;
  
  if (isFullyNormalized) {
    console.log('    ✅ FULLY NORMALIZED - All component types are properly centralized');
  } else {
    console.log('    ❌ NORMALIZATION NEEDED - Some inconsistencies found');
  }
  
  console.log(`\n    Total component types: ${actualFolders.length}`);
  console.log(`    TypeScript types: ${definedTypes.length}`);
  console.log(`    ContentAPI types: ${apiTypes.length}`);
  console.log(`    Render order types: ${orderTypes.length}`);
  
  console.log('\n✅ Component type normalization test completed!');
}

testComponentTypeNormalization();