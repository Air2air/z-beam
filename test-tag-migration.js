const { validateTagMigration } = require('./app/utils/tags/migrateToNewTags');
async function runValidation() { console.log('Starting validation...'); try { const result = await validateTagMigration(true); console.log('Results:', result); } catch (error) { console.error('Error:', error); } }
runValidation();
