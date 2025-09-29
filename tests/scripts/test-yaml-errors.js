#!/usr/bin/env node

/**
 * YAML Error Detection and Testing Script
 * 
 * This script identifies all YAML parsing errors in the content files
 * and provides detailed analysis and fixes.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Test configuration
const CONTENT_DIRS = [
  'content',
  'pages/_md',
];

let errorResults = {
  totalFiles: 0,
  errorFiles: 0,
  errors: [],
  details: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = {
    'info': '📝',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️',
    'debug': '🔍'
  }[type] || '📝';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function findMarkdownFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function testYamlParsing(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    errorResults.totalFiles++;
    
    // Test with gray-matter
    try {
      const result = matter(content);
      return {
        success: true,
        data: result.data,
        content: result.content,
        error: null
      };
    } catch (error) {
      errorResults.errorFiles++;
      
      const errorDetail = {
        file: filePath,
        error: error.message,
        line: error.mark ? error.mark.line + 1 : 'unknown',
        column: error.mark ? error.mark.column + 1 : 'unknown',
        reason: error.reason || 'unknown',
        content: content.slice(0, 500) + (content.length > 500 ? '...' : '')
      };
      
      errorResults.errors.push(errorDetail);
      errorResults.details.push(errorDetail);
      
      return {
        success: false,
        error: errorDetail
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        file: filePath,
        error: `File read error: ${error.message}`,
        line: 'N/A',
        column: 'N/A',
        reason: 'file_access_error'
      }
    };
  }
}

function analyzeYamlError(errorDetail) {
  const { error, content, file } = errorDetail;
  
  // Common YAML error patterns
  const patterns = {
    'missed comma between flow collection entries': {
      issue: 'Missing comma in YAML array syntax',
      solution: 'Add commas between array elements in [item1, item2] format',
      example: 'meltingPoint: [>300°C] should be meltingPoint: [">300°C"]'
    },
    'bad indentation of a mapping entry': {
      issue: 'Incorrect YAML indentation or malformed key-value pairs',
      solution: 'Fix indentation (use 2 spaces) and ensure proper key: value format',
      example: 'Remove extra quotes and fix spacing'
    },
    'could not find expected': {
      issue: 'Unclosed quotes or brackets in YAML',
      solution: 'Check for matching quotes, brackets, and proper escaping',
      example: 'Ensure all quotes are properly closed'
    }
  };
  
  for (const [pattern, info] of Object.entries(patterns)) {
    if (error.includes(pattern)) {
      return info;
    }
  }
  
  return {
    issue: 'Unknown YAML syntax error',
    solution: 'Check YAML syntax manually',
    example: 'Use online YAML validator to identify specific issues'
  };
}

function generateFix(errorDetail) {
  const analysis = analyzeYamlError(errorDetail);
  const lines = errorDetail.content.split('\n');
  
  // Try to identify the problematic frontmatter
  let frontmatterStart = -1;
  let frontmatterEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (frontmatterStart === -1) {
        frontmatterStart = i;
      } else {
        frontmatterEnd = i;
        break;
      }
    }
  }
  
  if (frontmatterStart >= 0 && frontmatterEnd > frontmatterStart) {
    const frontmatter = lines.slice(frontmatterStart + 1, frontmatterEnd).join('\n');
    
    return {
      analysis,
      frontmatter,
      suggestedFix: `
1. ${analysis.solution}
2. Check lines ${frontmatterStart + 1} to ${frontmatterEnd}
3. Example: ${analysis.example}

Problematic frontmatter:
${frontmatter}
      `.trim()
    };
  }
  
  return {
    analysis,
    suggestedFix: 'Unable to isolate frontmatter for specific fix'
  };
}

async function runYamlTesting() {
  log('🔍 Starting comprehensive YAML error detection', 'info');
  console.log('='.repeat(60));
  
  // Find all markdown files
  let allFiles = [];
  for (const dir of CONTENT_DIRS) {
    const dirPath = path.join(__dirname, dir);
    const files = findMarkdownFiles(dirPath);
    allFiles = allFiles.concat(files);
    log(`Found ${files.length} files in ${dir}`, 'info');
  }
  
  log(`Total files to test: ${allFiles.length}`, 'info');
  console.log('');
  
  // Test each file
  for (const file of allFiles) {
    const relativePath = path.relative(__dirname, file);
    const result = testYamlParsing(file);
    
    if (result.success) {
      log(`✅ ${relativePath}`, 'success');
    } else {
      log(`❌ ${relativePath}: ${result.error.error}`, 'error');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  log('📊 YAML TESTING SUMMARY', 'info');
  console.log('='.repeat(60));
  
  console.log(`📈 Total Files: ${errorResults.totalFiles}`);
  console.log(`✅ Valid Files: ${errorResults.totalFiles - errorResults.errorFiles}`);
  console.log(`❌ Error Files: ${errorResults.errorFiles}`);
  
  if (errorResults.errorFiles > 0) {
    console.log('\n❌ DETAILED ERROR ANALYSIS:');
    console.log('-'.repeat(40));
    
    for (let i = 0; i < errorResults.errors.length; i++) {
      const error = errorResults.errors[i];
      const fix = generateFix(error);
      
      console.log(`\n${i + 1}. 📄 ${path.relative(__dirname, error.file)}`);
      console.log(`   🚫 Error: ${error.error}`);
      console.log(`   📍 Location: Line ${error.line}, Column ${error.column}`);
      console.log(`   🔍 Reason: ${error.reason}`);
      console.log(`   💡 Issue: ${fix.analysis.issue}`);
      console.log(`   🔧 Solution: ${fix.analysis.solution}`);
      
      if (fix.suggestedFix !== 'Unable to isolate frontmatter for specific fix') {
        console.log(`   📝 Suggested Fix:\n${fix.suggestedFix.split('\n').map(line => '      ' + line).join('\n')}`);
      }
    }
    
    // Provide specific fixes for common patterns
    console.log('\n🔧 COMMON FIXES NEEDED:');
    console.log('-'.repeat(40));
    
    const melting_point_errors = errorResults.errors.filter(e => e.error.includes('meltingPoint'));
    const indentation_errors = errorResults.errors.filter(e => e.error.includes('bad indentation'));
    
    if (melting_point_errors.length > 0) {
      console.log(`🔥 ${melting_point_errors.length} files have meltingPoint array syntax errors`);
      console.log('   Fix: Change meltingPoint: [>300°C] to meltingPoint: [">300°C"]');
    }
    
    if (indentation_errors.length > 0) {
      console.log(`📏 ${indentation_errors.length} files have YAML indentation errors`);
      console.log('   Fix: Check for proper 2-space indentation and remove extra quotes');
    }
  } else {
    log('🎉 No YAML errors found! All files are valid.', 'success');
  }
  
  // Save detailed results
  const resultsFile = path.join(__dirname, 'yaml-error-analysis.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: errorResults.totalFiles,
      validFiles: errorResults.totalFiles - errorResults.errorFiles,
      errorFiles: errorResults.errorFiles,
      errorRate: errorResults.totalFiles > 0 ? (errorResults.errorFiles / errorResults.totalFiles * 100).toFixed(1) + '%' : '0%'
    },
    errors: errorResults.details
  }, null, 2));
  
  console.log(`\n📄 Detailed analysis saved to: ${resultsFile}`);
  
  // Return exit code based on errors
  return errorResults.errorFiles === 0 ? 0 : 1;
}

// Main execution
async function main() {
  try {
    const exitCode = await runYamlTesting();
    
    if (exitCode === 0) {
      log('✅ All YAML files are valid!', 'success');
    } else {
      log(`⚠️ Found ${errorResults.errorFiles} files with YAML errors`, 'warn');
    }
    
    process.exit(exitCode);
    
  } catch (error) {
    log(`💥 YAML testing crashed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runYamlTesting };
