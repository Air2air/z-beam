#!/usr/bin/env node
/**
 * Check Dataset Synchronization Status
 * 
 * Detects changes in frontmatter files and reports which datasets need regeneration
 */

import {
  getDatasetSyncStatus,
  formatSyncStatus,
  needsRegeneration,
  getDatasetsToRegenerate
} from '../../app/datasets';

async function main() {
  console.log('🔍 Checking dataset synchronization...\n');
  
  const status = getDatasetSyncStatus();
  console.log(formatSyncStatus(status));
  
  if (needsRegeneration()) {
    const outdated = getDatasetsToRegenerate();
    
    console.log('\n📋 Datasets to regenerate:');
    outdated.slice(0, 20).forEach((slug, i) => {
      console.log(`   ${i + 1}. ${slug}`);
    });
    
    if (outdated.length > 20) {
      console.log(`   ... and ${outdated.length - 20} more`);
    }
    
    console.log('\n💡 Quick fix:');
    console.log('   npm run generate:datasets');
    
    process.exit(1);
  } else {
    console.log('\n✅ All datasets are synchronized!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Error checking sync status:', error);
  process.exit(1);
});
