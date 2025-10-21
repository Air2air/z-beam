#!/usr/bin/env node

/**
 * Content Validation Test
 * Validates all content files for proper structure and consistency
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const error = (message) => log(`❌ ${message}`, 'red');
const success = (message) => log(`✅ ${message}`, 'green');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const info = (message) => log(`ℹ️  ${message}`, 'cyan');

// Validation rules
const REQUIRED_FRONTMATTER_FIELDS = [
  'title',
  'description',
  'articleType'
];

const VALID_ARTICLE_TYPES = [
  'material',
  'author',
  'region',
  'application',
  'thesaurus'
];

let totalFiles = 0;
let validFiles = 0;
let errors = [];
let warnings = [];

/**
 * Validate frontmatter structure
 */
function validateFrontmatter(frontmatter, filePath) {
  const issues = [];
  
  // Check required fields
  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!frontmatter[field]) {
      issues.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate articleType
  if (frontmatter.articleType && !VALID_ARTICLE_TYPES.includes(frontmatter.articleType)) {
    issues.push(`Invalid articleType: ${frontmatter.articleType}. Must be one of: ${VALID_ARTICLE_TYPES.join(', ')}`);
  }
  
  // Validate title length
  if (frontmatter.title && frontmatter.title.length > 100) {
    issues.push(`Title too long (${frontmatter.title.length} chars). Should be < 100 characters`);
  }
  
  // Validate description length
  if (frontmatter.description && frontmatter.description.length > 300) {
    issues.push(`Description too long (${frontmatter.description.length} chars). Should be < 300 characters`);
  }
  
  return issues;
}

/**
 * Validate content structure
 */
function validateContent(content, filePath) {
  const issues = [];
  
  // Check minimum content length
  if (content.length < 100) {
    issues.push(`Content too short (${content.length} chars). Should be at least 100 characters`);
  }
  
  // Check for broken links (basic check)
  const brokenLinkPattern = /\[.*\]\(\s*\)/g;
  const brokenLinks = content.match(brokenLinkPattern);
  if (brokenLinks) {
    issues.push(`Found ${brokenLinks.length} broken link(s): ${brokenLinks.join(', ')}`);
  }
  
  // Check for empty headings
  const emptyHeadingPattern = /^#+\s*$/gm;
  const emptyHeadings = content.match(emptyHeadingPattern);
  if (emptyHeadings) {
    issues.push(`Found ${emptyHeadings.length} empty heading(s)`);
  }
  
  return issues;
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  totalFiles++;
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    
    const frontmatterIssues = validateFrontmatter(frontmatter, filePath);
    const contentIssues = validateContent(content, filePath);
    
    const allIssues = [...frontmatterIssues, ...contentIssues];
    
    if (allIssues.length === 0) {
      validFiles++;
      return { valid: true, issues: [] };
    } else {
      return { valid: false, issues: allIssues };
    }
    
  } catch (err) {
    return { valid: false, issues: [`Failed to parse file: ${err.message}`] };
  }
}

/**
 * Scan directory for content files
 */
function scanDirectory(dirPath, extensions = ['.md', '.mdx']) {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    warning(`Directory not found: ${dirPath}`);
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      files.push(...scanDirectory(itemPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(itemPath);
    }
  }
  
  return files;
}

/**
 * Main validation function
 */
function runValidation() {
  log('🧪 CONTENT VALIDATION TEST', 'bold');
  log('================================', 'cyan');
  
  info('Starting content validation...');
  
  // Scan for content files
  const contentDir = path.join(process.cwd(), 'content');
  const contentFiles = scanDirectory(contentDir);
  
  if (contentFiles.length === 0) {
    warning('No content files found');
    return { passed: false, errors: ['No content files found'], warnings: [] };
  }
  
  info(`Found ${contentFiles.length} content files to validate`);
  
  // Validate each file
  for (const filePath of contentFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    const result = validateFile(filePath);
    
    if (result.valid) {
      // success(`✓ ${relativePath}`);
    } else {
      error(`✗ ${relativePath}`);
      for (const issue of result.issues) {
        if (issue.includes('too short') || issue.includes('too long')) {
          warnings.push(`${relativePath}: ${issue}`);
          warning(`  ${issue}`);
        } else {
          errors.push(`${relativePath}: ${issue}`);
          error(`  ${issue}`);
        }
      }
    }
  }
  
  // Summary
  log('================================', 'cyan');
  log('📊 CONTENT VALIDATION REPORT', 'bold');
  log('================================', 'cyan');
  
  const validPercent = Math.round((validFiles / totalFiles) * 100);
  
  if (validFiles === totalFiles) {
    success(`🏆 Overall Status: PASS`);
  } else {
    error(`🏆 Overall Status: FAIL`);
  }
  
  info(`📈 Files Processed: ${totalFiles}`);
  info(`✅ Valid Files: ${validFiles} (${validPercent}%)`);
  info(`❌ Files with Issues: ${totalFiles - validFiles}`);
  info(`🚨 Critical Errors: ${errors.length}`);
  info(`⚠️  Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    log('\n🚨 Critical Errors:', 'red');
    errors.slice(0, 10).forEach(err => log(`  • ${err}`, 'red'));
    if (errors.length > 10) {
      log(`  ... and ${errors.length - 10} more errors`, 'red');
    }
  }
  
  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    warnings.slice(0, 5).forEach(warn => log(`  • ${warn}`, 'yellow'));
    if (warnings.length > 5) {
      log(`  ... and ${warnings.length - 5} more warnings`, 'yellow');
    }
  }
  
  log('\n💡 Recommendations:', 'cyan');
  if (errors.length > 0) {
    log('  • Fix critical errors first (missing required fields)', 'cyan');
  }
  if (warnings.length > 0) {
    log('  • Review content length warnings', 'cyan');
  }
  log('  • Ensure all content files have proper frontmatter', 'cyan');
  log('  • Validate links and references are working', 'cyan');
  
  const passed = errors.length === 0;
  
  return {
    passed,
    errors,
    warnings,
    stats: {
      total: totalFiles,
      valid: validFiles,
      validPercent
    }
  };
}

// Run validation if called directly
if (require.main === module) {
  const result = runValidation();
  process.exit(result.passed ? 0 : 1);
}

module.exports = { runValidation };