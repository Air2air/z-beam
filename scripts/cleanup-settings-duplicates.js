#!/usr/bin/env node

/**
 * Cleanup duplicate settings_description entries in settings files
 */

const fs = require('fs');
const path = require('path');

const SETTINGS_DIR = path.join(__dirname, '../frontmatter/settings');

let filesFixed = 0;
let duplicatesRemoved = 0;

const settingsFiles = fs.readdirSync(SETTINGS_DIR)
  .filter(f => f.endsWith('.yaml'))
  .map(f => path.join(SETTINGS_DIR, f));

settingsFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let firstSettingsDescription = null;
  let settingsDescriptionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('settings_description:')) {
      settingsDescriptionCount++;
      if (settingsDescriptionCount === 1) {
        // Keep the first one
        firstSettingsDescription = line;
        newLines.push(line);
      } else {
        // Skip duplicates
        duplicatesRemoved++;
      }
    } else {
      newLines.push(line);
    }
  }
  
  if (settingsDescriptionCount > 1) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    filesFixed++;
    console.log(`Fixed ${path.basename(filePath)}: removed ${settingsDescriptionCount - 1} duplicates`);
  }
});

console.log(`\n✅ Cleaned up ${duplicatesRemoved} duplicate settings_description entries in ${filesFixed} files`);
