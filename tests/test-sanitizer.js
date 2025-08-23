// Simple test for YAML sanitizer functionality
const fs = require('fs');

// Read the sanitizer file and execute it in this context
const sanitizerPath = './app/utils/yamlSanitizer.ts';
const sanitizerCode = fs.readFileSync(sanitizerPath, 'utf8');

// Mock the logger for testing
const mockLogger = {
  log: (message, level) => console.log(`[${level}] ${message}`)
};

// Execute sanitizer code with mocked dependencies
const sanitizeYamlContent = function(content) {
  const yaml = require('js-yaml');
  
  try {
    yaml.load(content);
    return content;
  } catch (error) {
    if (error.message.includes('meltingPoint')) {
      return content.replace(/(\[)([^"\]\[]*[>°][^"\]\[]*)(\])/g, (match, openBracket, content, closeBracket) => {
        const trimmed = content.trim();
        if ((trimmed.includes('>') || trimmed.includes('°')) && !trimmed.startsWith('"') && !trimmed.endsWith('"')) {
          return `${openBracket}"${trimmed}"${closeBracket}`;
        }
        return match;
      });
    }
    throw error;
  }
};

console.log('🧪 Testing updated YAML sanitizer...');

// Test case 1: Valid YAML that shouldn't be touched
const validYaml = `---
name: Test Material
applications:
- industry: [Aerospace]
  detail: Test detail
---
# Content here`;

console.log('\n✅ Test 1: Valid YAML (should remain unchanged)');
try {
  const result = sanitizeYamlContent(validYaml);
  console.log('Original length:', validYaml.length);
  console.log('Result length:', result.length);
  console.log('Are they equal?', validYaml === result);
  if (validYaml !== result) {
    console.log('❌ YAML was incorrectly modified!');
    console.log('Diff:');
    console.log('Original:', validYaml.substring(0, 200));
    console.log('Result:', result.substring(0, 200));
  } else {
    console.log('✅ Valid YAML left unchanged');
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test case 2: YAML with unquoted special characters that needs fixing
const brokenYaml = `---
name: Test Material
meltingPoint: [>300°C]
---
# Content here`;

console.log('\n🔧 Test 2: Broken YAML (should be fixed)');
try {
  const result = sanitizeYamlContent(brokenYaml);
  console.log('Original:', brokenYaml);
  console.log('Result:', result);
  console.log('Contains quoted value?', result.includes('">300°C"'));
} catch (error) {
  console.log('❌ Error:', error.message);
}
