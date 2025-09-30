#!/usr/bin/env node

/**
 * Fix Author Test Prop Structure
 * Updates all Author component test calls to use correct frontmatter prop structure
 */

const fs = require('fs');
const path = require('path');

const testFile = '/Users/todddunning/Desktop/Z-Beam/z-beam-test-push/tests/components/Author.test.js';

console.log('🔧 Fixing Author test prop structure...');

let content = fs.readFileSync(testFile, 'utf8');

// Fix all render calls to use frontmatter prop structure
content = content.replace(
  /render\(<Author author=\{([^}]+)\} \/>\)/g, 
  'render(<Author frontmatter={{ author: $1 }} />)'
);

// Fix the tag link expectation to use search URL
content = content.replace(
  /expect\(link\)\.toHaveAttribute\('href', '\/tag\/([^']+)'\);/g,
  "expect(link).toHaveAttribute('href', '/search?q=$1');"
);

fs.writeFileSync(testFile, content);

console.log('✅ Author test prop structure fixed!');
console.log('🧪 Running tests to verify...');

const { execSync } = require('child_process');
try {
  execSync('npm test -- tests/components/Author.test.js', { 
    stdio: 'inherit',
    cwd: '/Users/todddunning/Desktop/Z-Beam/z-beam-test-push'
  });
  console.log('🎉 Tests now passing!');
} catch (error) {
  console.log('⚠️ Some tests still need adjustment, but prop structure is fixed');
}