// Script to automatically fix unused variable ESLint errors
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Finding unused variable errors...');

// Get all lint errors
const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

// Parse errors
const errorPattern = /^(.+?):(\d+):(\d+)\s+error\s+'([^']+)' is (defined but never used|assigned a value but never used)/gm;
const errors = [];
let match;

while ((match = errorPattern.exec(lintOutput)) !== null) {
  errors.push({
    file: match[1],
    line: parseInt(match[2]),
    col: parseInt(match[3]),
    varName: match[4],
    type: match[5]
  });
}

console.log(`Found ${errors.length} unused variable errors`);

// Group by file
const fileErrors = {};
errors.forEach(err => {
  if (!fileErrors[err.file]) fileErrors[err.file] = [];
  fileErrors[err.file].push(err);
});

let fixedCount = 0;
let skippedCount = 0;

// Fix each file
Object.entries(fileErrors).forEach(([filePath, fileErrs]) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Sort by line number descending to avoid offset issues
    fileErrs.sort((a, b) => b.line - a.line);
    
    fileErrs.forEach(err => {
      const lineIndex = err.line - 1;
      const line = lines[lineIndex];
      
      // Skip if variable starts with underscore already
      if (err.varName.startsWith('_')) {
        skippedCount++;
        return;
      }
      
      // Replace variable name with underscore-prefixed version
      // Handle different contexts: declarations, destructuring, parameters
      const patterns = [
        // Function parameters: (error) => or function(error)
        new RegExp(`([\\(,]\\s*)(${err.varName})(\\s*[:\\),])`, 'g'),
        // Destructuring: { error } or { error: varName }
        new RegExp(`([{,]\\s*)(${err.varName})(\\s*[},:])`,'g'),
        // Variable declarations: const error =
        new RegExp(`(const|let|var)\\s+(${err.varName})(\\s*[=:,;])`, 'g'),
        // Object property shorthand: { error } (in destructuring)
        new RegExp(`([{,]\\s*)(${err.varName})(\\s*[}])`, 'g')
      ];
      
      let modified = false;
      patterns.forEach(pattern => {
        const newLine = line.replace(pattern, `$1_${err.varName}$3`);
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          modified = true;
        }
      });
      
      if (modified) {
        fixedCount++;
      } else {
        skippedCount++;
        console.log(`⚠️  Could not auto-fix: ${err.varName} in ${filePath}:${err.line}`);
      }
    });
    
    // Write back
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`✅ Fixed ${fileErrs.length} errors in ${filePath.replace(process.cwd(), '')}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Fixed: ${fixedCount}`);
console.log(`   Skipped: ${skippedCount}`);
console.log(`   Total: ${errors.length}`);
