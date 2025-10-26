#!/usr/bin/env node

/**
 * Fix Unicode Encoding in Frontmatter Files
 * 
 * @deprecated This functionality is now handled automatically
 *             by app/utils/normalizers/unicodeNormalizer.ts
 * 
 * This script remains for one-time batch updates only.
 * For new materials, normalization happens at load time in contentAPI.ts
 * 
 * Replaces unicode escape sequences with actual unicode characters
 */

const fs = require('fs');
const path = require('path');

const FRONTMATTER_DIR = path.join(process.cwd(), 'content', 'frontmatter');

// Unicode escape mapping - these are literal strings in YAML files
const unicodeMap = {
  '\\xB3': '³',  // superscript 3
  '\\xB2': '²',  // superscript 2
  '\\xB9': '¹',  // superscript 1
  '\\xB0': '°',  // degree symbol
  '\\xB5': 'µ',  // micro (mu) - alternative encoding
  '\\xB7': '·',  // middle dot
  '\\xD7': '×',  // multiplication sign
  '\\u03BC': 'μ', // micro (mu)
  '\\u03A9': 'Ω', // Omega (ohm)
  '\\u0394': 'Δ', // Delta
  '\\u221A': '√', // square root
  '\\u207B': '⁻', // superscript minus
  '\\u2070': '⁰', // superscript 0
  '\\u00B9': '¹', // superscript 1 (alternative)
  '\\u00B2': '²', // superscript 2 (alternative)
  '\\u00B3': '³', // superscript 3 (alternative)
  '\\u2074': '⁴', // superscript 4
  '\\u2075': '⁵', // superscript 5
  '\\u2076': '⁶', // superscript 6
  '\\u2077': '⁷', // superscript 7
  '\\u2078': '⁸', // superscript 8
  '\\u2079': '⁹', // superscript 9
};

// Escape the backslashes for regex matching
function escapeForRegex(str) {
  return str.replace(/\\/g, '\\\\');
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function fixUnicodeInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let replacementCount = 0;

  // Replace each unicode escape sequence
  Object.entries(unicodeMap).forEach(([escape, char]) => {
    // The escape sequences are literal strings like "\xB3" in the file
    // We need to match them as-is
    const matches = content.match(new RegExp(escapeForRegex(escape), 'g'));
    if (matches) {
      content = content.split(escape).join(char);
      replacementCount += matches.length;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return replacementCount;
  }

  return 0;
}

function main() {
  console.log(`${colors.bold}${colors.blue}Fixing Unicode Encoding in Frontmatter Files${colors.reset}\n`);

  const files = fs.readdirSync(FRONTMATTER_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => path.join(FRONTMATTER_DIR, f));

  let totalFiles = 0;
  let totalReplacements = 0;

  files.forEach((filePath) => {
    const count = fixUnicodeInFile(filePath);
    if (count > 0) {
      totalFiles++;
      totalReplacements += count;
      const filename = path.basename(filePath);
      console.log(`${colors.green}✓${colors.reset} ${filename}: ${count} replacements`);
    }
  });

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Files modified: ${totalFiles}`);
  console.log(`  Total replacements: ${totalReplacements}`);
  console.log(`${colors.green}\n✓ Unicode encoding fixed!${colors.reset}\n`);
}

main();
