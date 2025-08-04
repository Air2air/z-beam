// scripts/validateTagSystem.js
// A simple script to validate the new tag system against the old one

const { validateTagMigration } = require('../app/utils/tags/migrateToNewTags');

async function runValidation() {
  console.log('🔍 Validating tag system migration...');
  
  try {
    const result = await validateTagMigration(true);
    
    console.log('\n✅ Validation Results:');
    console.log('------------------------');
    console.log(`Overall Success: ${result.success ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`Tag Count Match: ${result.tagCountMatch ? 'PASSED ✓' : 'FAILED ✗'}`);
    console.log(`Random Tag Test: ${result.randomTagResults ? 'PASSED ✓' : 'FAILED ✗'}`);
    
    console.log('\n📊 Details:');
    console.log('------------------------');
    console.log(`Old Tag Count: ${result.details.oldTagCount}`);
    console.log(`New Tag Count: ${result.details.newTagCount}`);
    console.log(`Test Tag: "${result.details.randomTag}"`);
    console.log(`Old Match Count: ${result.details.oldMatchCount}`);
    console.log(`New Match Count: ${result.details.newMatchCount}`);
    
    if (result.success) {
      console.log('\n🎉 Migration validation successful! The new tag system matches the old one.');
    } else {
      console.log('\n⚠️ Migration validation failed. See details above for discrepancies.');
    }
  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

// Run the validation
runValidation();
