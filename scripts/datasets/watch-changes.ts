#!/usr/bin/env node
/**
 * Watch Frontmatter Changes
 * 
 * Monitors frontmatter directories and triggers dataset regeneration on changes
 */

import {
  watchFrontmatterChanges,
  getDatasetsToRegenerate
} from '../../app/datasets';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let regenerating = false;

async function regenerateDatasets(slugs: string[]) {
  if (regenerating) {
    console.log('⏳ Regeneration already in progress...');
    return;
  }
  
  regenerating = true;
  console.log(`\n🔄 Regenerating ${slugs.length} dataset(s)...`);
  
  try {
    // Run dataset generation
    const { stdout, stderr } = await execAsync('npm run generate:datasets');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('✅ Dataset regeneration complete!\n');
  } catch (error) {
    console.error('❌ Error regenerating datasets:', error);
  } finally {
    regenerating = false;
  }
}

function main() {
  console.log('👀 Watching frontmatter directories for changes...');
  console.log('📁 Monitoring:');
  console.log('   - frontmatter/materials/');
  console.log('   - frontmatter/settings/');
  console.log('\nPress Ctrl+C to stop\n');
  
  watchFrontmatterChanges((changes) => {
    console.log(`\n📝 Detected ${changes.length} change(s):`);
    changes.forEach(change => {
      const icon = change.type === 'added' ? '➕' : 
                   change.type === 'deleted' ? '➖' : '✏️';
      console.log(`   ${icon} ${change.file}`);
    });
    
    const outdated = getDatasetsToRegenerate();
    if (outdated.length > 0) {
      regenerateDatasets(outdated);
    }
  });
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping file watcher...');
    process.exit(0);
  });
}

main();
