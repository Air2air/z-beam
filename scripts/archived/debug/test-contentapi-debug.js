// test-contentapi-debug.js
async function testContentAPI() {
  try {
    // Import the contentAPI module
    const contentAPI = await import('./app/utils/contentAPI.ts');
    
    console.log('Testing contentAPI.loadComponent...');
    
    // Test loading the table component for copper
    const tableResult = await contentAPI.loadComponent('table', 'copper-laser-cleaning');
    console.log('Table component result:');
    console.log('- Content length:', tableResult?.content?.length || 0);
    console.log('- Config:', tableResult?.config);
    console.log('- Content preview:', tableResult?.content?.substring(0, 200));
    
    // Test loading all components for copper
    const allComponents = await contentAPI.loadAllComponents('copper-laser-cleaning');
    console.log('\nAll components for copper:');
    console.log('- Available components:', Object.keys(allComponents));
    console.log('- Table component exists:', !!allComponents.table);
    
    if (allComponents.table) {
      console.log('- Table content length:', allComponents.table.content?.length);
      console.log('- Table config:', allComponents.table.config);
    }
    
  } catch (error) {
    console.error('Error testing contentAPI:', error);
  }
}

testContentAPI();
