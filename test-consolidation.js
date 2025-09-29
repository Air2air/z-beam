const fs = require('fs');
const path = require('path');

// Check that wrapper components are removed
const wrapperFiles = [
  'app/components/MetricsCard/MetricsProperties.tsx',
  'app/components/MetricsCard/MetricsMachineSettings.tsx'
];

let success = true;

console.log('=== MetricsCard Consolidation Verification ===\n');

// Test 1: Verify wrapper files are removed
wrapperFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ FAIL: ${file} still exists (should be removed)`);
    success = false;
  } else {
    console.log(`✅ PASS: ${file} correctly removed`);
  }
});

// Test 2: Verify MetricsCard.tsx exists
const metricsCardFile = 'app/components/MetricsCard/MetricsCard.tsx';
if (fs.existsSync(metricsCardFile)) {
  console.log(`✅ PASS: ${metricsCardFile} exists`);
  
  // Check file size to confirm consolidation
  const stats = fs.statSync(metricsCardFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`📊 INFO: MetricsCard.tsx size: ${sizeMB}MB (${stats.size} bytes)`);
} else {
  console.log(`❌ FAIL: ${metricsCardFile} missing`);
  success = false;
}

// Test 3: Check Layout.tsx for correct imports
const layoutFile = 'app/components/Layout/Layout.tsx';
if (fs.existsSync(layoutFile)) {
  const layoutContent = fs.readFileSync(layoutFile, 'utf8');
  
  // Should NOT import wrapper components
  const badImports = ['MetricsProperties', 'MetricsMachineSettings'];
  badImports.forEach(importName => {
    if (layoutContent.includes(importName)) {
      console.log(`❌ FAIL: Layout.tsx still imports ${importName}`);
      success = false;
    } else {
      console.log(`✅ PASS: Layout.tsx no longer imports ${importName}`);
    }
  });
  
  // Should import MetricsCard
  if (layoutContent.includes('MetricsCard')) {
    console.log(`✅ PASS: Layout.tsx imports MetricsCard`);
  } else {
    console.log(`❌ FAIL: Layout.tsx missing MetricsCard import`);
    success = false;
  }
} else {
  console.log(`❌ FAIL: ${layoutFile} missing`);
  success = false;
}

console.log('\n=== CONSOLIDATION RESULT ===');
if (success) {
  console.log('🎉 SUCCESS: MetricsCard consolidation completed successfully!');
  console.log('   - Wrapper components removed');
  console.log('   - Layout updated to use MetricsCard directly');
  console.log('   - No legacy imports detected');
} else {
  console.log('❌ FAILED: Issues found with consolidation');
}

process.exit(success ? 0 : 1);
