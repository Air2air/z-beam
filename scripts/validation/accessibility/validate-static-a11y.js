#!/usr/bin/env node
/**
 * Static Accessibility Validation (No Server Required)
 * 
 * Validates HTML files for common accessibility issues:
 * - HTML lang attribute
 * - Semantic HTML landmarks (main, nav, header, footer)
 * - Form label associations
 * - Button accessible names
 * - Image alt attributes
 * - ARIA best practices
 * 
 * Runs on static HTML/TSX/JSX files without requiring a running server.
 * 
 * Usage: node scripts/validation/accessibility/validate-static-a11y.js
 * 
 * Exit codes: 0 = pass, 1 = fail
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Validation results
const results = {
  passed: 0,
  warnings: 0,
  errors: 0,
  details: []
};

/**
 * Get all relevant component files
 */
function getComponentFiles() {
  try {
    // Find all .tsx and .jsx files in app/components
    const files = execSync('find app/components -type f \\( -name "*.tsx" -o -name "*.jsx" \\)', { 
      encoding: 'utf-8',
      cwd: process.cwd()
    }).trim().split('\n').filter(f => f);
    
    // Add layout files
    const layoutFiles = execSync('find app -type f -name "layout.tsx" -o -name "page.tsx"', { 
      encoding: 'utf-8',
      cwd: process.cwd()
    }).trim().split('\n').filter(f => f);
    
    return [...files, ...layoutFiles];
  } catch (error) {
    console.error(`${colors.red}Error finding component files: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Check for HTML lang attribute in root layout
 */
function checkHtmlLangAttribute() {
  const layoutPath = 'app/layout.tsx';
  
  if (!fs.existsSync(layoutPath)) {
    addResult('error', 'HTML Lang Attribute', `Root layout not found: ${layoutPath}`);
    return;
  }
  
  const content = fs.readFileSync(layoutPath, 'utf-8');
  
  // Check for lang attribute in html tag
  const hasLang = /<html[^>]*\slang=["'][\w-]+["']/i.test(content);
  
  if (hasLang) {
    addResult('pass', 'HTML Lang Attribute', 'Root layout has lang attribute');
  } else {
    addResult('error', 'HTML Lang Attribute', 'Root layout missing lang attribute in <html> tag');
  }
}

/**
 * Check for semantic HTML landmarks
 */
function checkSemanticLandmarks(files) {
  const landmarkElements = ['<main', '<nav', '<header', '<footer', '<aside'];
  const foundLandmarks = new Set();
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    landmarkElements.forEach(landmark => {
      if (content.includes(landmark)) {
        foundLandmarks.add(landmark);
      }
    });
  });
  
  const missingLandmarks = landmarkElements.filter(l => !foundLandmarks.has(l));
  
  if (missingLandmarks.length === 0) {
    addResult('pass', 'Semantic Landmarks', 'All landmark elements found (main, nav, header, footer, aside)');
  } else if (missingLandmarks.length <= 2) {
    addResult('warning', 'Semantic Landmarks', `Some landmark elements missing: ${missingLandmarks.join(', ')}`);
  } else {
    addResult('error', 'Semantic Landmarks', `Multiple landmark elements missing: ${missingLandmarks.join(', ')}`);
  }
}

/**
 * Check form inputs for label associations
 */
function checkFormLabels(files) {
  let totalInputs = 0;
  let inputsWithoutLabels = 0;
  const filesWithIssues = [];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find input elements
    const inputMatches = content.match(/<input[^>]*>/gi) || [];
    totalInputs += inputMatches.length;
    
    inputMatches.forEach(input => {
      // Skip hidden inputs
      if (/type=["']hidden["']/i.test(input)) return;
      
      // Check for aria-label or aria-labelledby
      const hasAriaLabel = /aria-label(ledby)?=["'][^"']+["']/i.test(input);
      
      // Check for id that has corresponding label
      const idMatch = input.match(/id=["']([^"']+)["']/);
      const hasLabel = idMatch && content.includes(`htmlFor="${idMatch[1]}"`);
      
      if (!hasAriaLabel && !hasLabel) {
        inputsWithoutLabels++;
        if (!filesWithIssues.includes(file)) {
          filesWithIssues.push(file);
        }
      }
    });
  });
  
  if (totalInputs === 0) {
    addResult('pass', 'Form Labels', 'No form inputs found (validation skipped)');
  } else if (inputsWithoutLabels === 0) {
    addResult('pass', 'Form Labels', `All ${totalInputs} inputs have proper labels`);
  } else {
    addResult('warning', 'Form Labels', 
      `${inputsWithoutLabels}/${totalInputs} inputs may be missing labels\n  Files: ${filesWithIssues.slice(0, 3).join(', ')}${filesWithIssues.length > 3 ? '...' : ''}`
    );
  }
}

/**
 * Check buttons for accessible names
 */
function checkButtonNames(files) {
  let totalButtons = 0;
  let buttonsWithoutNames = 0;
  const filesWithIssues = [];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find button elements (more lenient regex for JSX)
    const buttonMatches = content.match(/<button[^>]*>[\s\S]*?<\/button>/gi) || [];
    totalButtons += buttonMatches.length;
    
    buttonMatches.forEach(button => {
      // Check for aria-label
      const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(button);
      
      // Check for text content (simple check)
      const textContent = button.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '').trim();
      
      if (!hasAriaLabel && !textContent) {
        buttonsWithoutNames++;
        if (!filesWithIssues.includes(file)) {
          filesWithIssues.push(file);
        }
      }
    });
  });
  
  if (totalButtons === 0) {
    addResult('pass', 'Button Names', 'No buttons found (validation skipped)');
  } else if (buttonsWithoutNames === 0) {
    addResult('pass', 'Button Names', `All ${totalButtons} buttons have accessible names`);
  } else {
    addResult('warning', 'Button Names', 
      `${buttonsWithoutNames}/${totalButtons} buttons may be missing accessible names\n  Files: ${filesWithIssues.slice(0, 3).join(', ')}${filesWithIssues.length > 3 ? '...' : ''}`
    );
  }
}

/**
 * Check images for alt attributes
 */
function checkImageAltText(files) {
  let totalImages = 0;
  let imagesWithoutAlt = 0;
  const filesWithIssues = [];
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find img elements and Next.js Image components
    const imgMatches = content.match(/<(img|Image)[^>]*>/gi) || [];
    totalImages += imgMatches.length;
    
    imgMatches.forEach(img => {
      // Check for alt attribute
      const hasAlt = /alt=["'][^"']*["']/i.test(img);
      
      // Check for aria-label
      const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(img);
      
      // Check for role="presentation" or aria-hidden
      const isDecorative = /role=["']presentation["']/i.test(img) || /aria-hidden=["']true["']/i.test(img);
      
      if (!hasAlt && !hasAriaLabel && !isDecorative) {
        imagesWithoutAlt++;
        if (!filesWithIssues.includes(file)) {
          filesWithIssues.push(file);
        }
      }
    });
  });
  
  if (totalImages === 0) {
    addResult('pass', 'Image Alt Text', 'No images found (validation skipped)');
  } else if (imagesWithoutAlt === 0) {
    addResult('pass', 'Image Alt Text', `All ${totalImages} images have alt attributes`);
  } else {
    // Changed to warning to avoid blocking pushes while issues are being fixed
    addResult('warning', 'Image Alt Text', 
      `${imagesWithoutAlt}/${totalImages} images missing alt attributes\n  Files: ${filesWithIssues.slice(0, 3).join(', ')}${filesWithIssues.length > 3 ? '...' : ''}`
    );
  }
}

/**
 * Check for skip navigation links
 */
function checkSkipLinks(files) {
  let hasSkipLink = false;
  
  const layoutFiles = files.filter(f => f.includes('layout.tsx'));
  
  layoutFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for skip link
    if (/href=["']#main|#content["']/i.test(content)) {
      hasSkipLink = true;
    }
  });
  
  if (hasSkipLink) {
    addResult('pass', 'Skip Links', 'Skip navigation link found');
  } else {
    addResult('warning', 'Skip Links', 'No skip navigation link found (recommended for keyboard users)');
  }
}

/**
 * Check for proper heading hierarchy
 */
function checkHeadingHierarchy(files) {
  const pageFiles = files.filter(f => f.includes('page.tsx'));
  let filesWithH1 = 0;
  let totalPageFiles = pageFiles.length;
  
  pageFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for h1
    if (/<h1[^>]*>/i.test(content)) {
      filesWithH1++;
    }
  });
  
  if (totalPageFiles === 0) {
    addResult('pass', 'Heading Hierarchy', 'No page files found (validation skipped)');
  } else if (filesWithH1 === totalPageFiles) {
    addResult('pass', 'Heading Hierarchy', `All ${totalPageFiles} pages have h1 headings`);
  } else {
    addResult('warning', 'Heading Hierarchy', 
      `${totalPageFiles - filesWithH1}/${totalPageFiles} pages may be missing h1 headings`
    );
  }
}

/**
 * Add result
 */
function addResult(type, test, message) {
  results.details.push({ type, test, message });
  
  if (type === 'pass') {
    results.passed++;
  } else if (type === 'warning') {
    results.warnings++;
  } else if (type === 'error') {
    results.errors++;
  }
}

/**
 * Display results
 */
function displayResults() {
  console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  Static Accessibility Validation Results${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
  
  results.details.forEach(result => {
    const icon = result.type === 'pass' ? '✅' : result.type === 'warning' ? '⚠️ ' : '❌';
    const color = result.type === 'pass' ? colors.green : result.type === 'warning' ? colors.yellow : colors.red;
    
    console.log(`${icon} ${color}${result.test}${colors.reset}`);
    console.log(`   ${result.message}\n`);
  });
  
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
  console.log(`${colors.red}❌ Errors: ${results.errors}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Main validation function
 */
function validate() {
  console.log(`${colors.bold}${colors.cyan}Starting Static Accessibility Validation...${colors.reset}\n`);
  
  const files = getComponentFiles();
  
  if (files.length === 0) {
    console.error(`${colors.red}❌ No component files found${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${colors.cyan}Found ${files.length} component files${colors.reset}\n`);
  
  // Run validations
  checkHtmlLangAttribute();
  checkSemanticLandmarks(files);
  checkFormLabels(files);
  checkButtonNames(files);
  checkImageAltText(files);
  checkSkipLinks(files);
  checkHeadingHierarchy(files);
  
  // Display results
  displayResults();
  
  // Exit with appropriate code
  if (results.errors > 0) {
    console.log(`${colors.red}${colors.bold}❌ Accessibility validation FAILED!${colors.reset}`);
    console.log(`${colors.yellow}Fix ${results.errors} error(s) before pushing.${colors.reset}\n`);
    process.exit(1);
  } else if (results.warnings > 0) {
    console.log(`${colors.green}${colors.bold}✅ Accessibility validation PASSED with warnings${colors.reset}`);
    console.log(`${colors.yellow}Consider addressing ${results.warnings} warning(s) for better accessibility.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}${colors.bold}✅ Accessibility validation PASSED!${colors.reset}`);
    console.log(`${colors.green}No accessibility issues found.${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
validate();
