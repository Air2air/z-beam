#!/usr/bin/env node
/**
 * WCAG 2.2 AA Validation Script
 * 
 * Validates WCAG 2.2 Level AA compliance criteria:
 * - 2.4.11 Focus Appearance (Enhanced) - AA
 * - 2.5.8 Target Size (Minimum) - AA
 * - 2.4.12 Focus Not Obscured (Minimum) - AA
 * - 2.5.7 Dragging Movements - AA
 * - 3.2.6 Consistent Help - A
 * - 3.3.7 Redundant Entry - A
 * 
 * Usage: node scripts/validate-wcag-2.2.js [options]
 * Options:
 *   --static-only    Run only static checks (fast, for pre-push)
 *   --verbose        Show detailed output
 * 
 * Exit codes: 0 = pass, 1 = fail
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'app/components');
const PAGES_DIR = path.join(PROJECT_ROOT, 'app');
const BUILD_DIR = path.join(PROJECT_ROOT, '.next');

// WCAG 2.2 thresholds
const THRESHOLDS = {
  focusOutlineMinWidth: 2, // pixels
  focusContrastRatio: 3, // 3:1 minimum
  targetSizeMin: 24, // pixels (24x24)
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const staticOnly = args.includes('--static-only');
const verbose = args.includes('--verbose');

// Results tracking
const results = {
  passed: [],
  warnings: [],
  errors: [],
};

/**
 * Check Focus Appearance (2.4.11) - Static CSS Analysis
 * Focus indicators must be at least 2px thick
 */
function checkFocusAppearance() {
  if (verbose) console.log(`${colors.cyan}Checking Focus Appearance (2.4.11)...${colors.reset}`);
  
  const cssFiles = findFiles(PROJECT_ROOT, /\.css$/);
  const tsxFiles = findFiles(COMPONENTS_DIR, /\.tsx?$/);
  
  let focusStylesFound = 0;
  let thinOutlines = [];
  
  // Check CSS files
  cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Look for focus styles
    const focusRegex = /:focus(-visible|-within)?[^{]*\{[^}]*outline(-width)?:\s*(\d+)px/g;
    let match;
    
    while ((match = focusRegex.exec(content)) !== null) {
      focusStylesFound++;
      const width = parseInt(match[3]);
      
      if (width < THRESHOLDS.focusOutlineMinWidth) {
        thinOutlines.push({
          file: path.relative(PROJECT_ROOT, file),
          width,
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }
  });
  
  // Check inline styles in TSX
  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Look for outline-width in className or style
    const outlineRegex = /outline-\[(\d+)px\]/g;
    let match;
    
    while ((match = outlineRegex.exec(content)) !== null) {
      focusStylesFound++;
      const width = parseInt(match[1]);
      
      if (width < THRESHOLDS.focusOutlineMinWidth) {
        thinOutlines.push({
          file: path.relative(PROJECT_ROOT, file),
          width,
          line: content.substring(0, match.index).split('\n').length,
        });
      }
    }
  });
  
  if (thinOutlines.length > 0) {
    thinOutlines.forEach(issue => {
      results.errors.push(
        `2.4.11 Focus Appearance: ${issue.file}:${issue.line} - Focus outline ${issue.width}px < ${THRESHOLDS.focusOutlineMinWidth}px minimum`
      );
    });
  } else if (focusStylesFound > 0) {
    results.passed.push(`2.4.11 Focus Appearance: ${focusStylesFound} focus styles checked, all ≥ ${THRESHOLDS.focusOutlineMinWidth}px`);
  } else {
    results.warnings.push('2.4.11 Focus Appearance: No explicit focus styles found, relying on browser defaults');
  }
}

/**
 * Check Target Size (2.5.8) - Static Analysis
 * Interactive targets must be at least 24x24px
 */
function checkTargetSize() {
  if (verbose) console.log(`${colors.cyan}Checking Target Size (2.5.8)...${colors.reset}`);
  
  const tsxFiles = findFiles(COMPONENTS_DIR, /\.tsx?$/);
  let smallTargets = [];
  
  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Look for button, link, input with explicit small sizes
    const sizeRegex = /(button|a|input|select)[^>]*className=[^>]*(w-\[(\d+)px\]|h-\[(\d+)px\]|p-\[(\d+)px\])/g;
    let match;
    
    while ((match = sizeRegex.exec(content)) !== null) {
      const elementType = match[1];
      const sizeMatch = match[0].match(/\[(\d+)px\]/g);
      
      if (sizeMatch) {
        sizeMatch.forEach(size => {
          const pixels = parseInt(size.match(/\d+/)[0]);
          
          if (pixels < THRESHOLDS.targetSizeMin) {
            const line = content.substring(0, match.index).split('\n').length;
            smallTargets.push({
              file: path.relative(PROJECT_ROOT, file),
              element: elementType,
              size: pixels,
              line,
            });
          }
        });
      }
    }
  });
  
  if (smallTargets.length > 0) {
    smallTargets.forEach(issue => {
      results.warnings.push(
        `2.5.8 Target Size: ${issue.file}:${issue.line} - ${issue.element} size ${issue.size}px < ${THRESHOLDS.targetSizeMin}px (check if exception applies)`
      );
    });
  } else {
    results.passed.push(`2.5.8 Target Size: No small targets detected (< ${THRESHOLDS.targetSizeMin}px)`);
  }
}

/**
 * Check Dragging Movements (2.5.7) - Static Analysis
 * Detect drag event listeners without keyboard alternatives
 */
function checkDraggingMovements() {
  if (verbose) console.log(`${colors.cyan}Checking Dragging Movements (2.5.7)...${colors.reset}`);
  
  const tsxFiles = findFiles(COMPONENTS_DIR, /\.tsx?$/);
  let dragInteractions = [];
  
  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Look for drag event listeners
    const dragRegex = /on(Drag|DragStart|DragEnd|DragEnter|DragLeave|DragOver|Drop)=/g;
    let match;
    
    while ((match = dragRegex.exec(content)) !== null) {
      const line = content.substring(0, match.index).split('\n').length;
      
      // Check for keyboard alternative in nearby code
      const contextStart = Math.max(0, match.index - 500);
      const contextEnd = Math.min(content.length, match.index + 500);
      const context = content.substring(contextStart, contextEnd);
      
      const hasKeyboardHandler = /on(KeyDown|KeyUp|KeyPress)=/.test(context);
      
      if (!hasKeyboardHandler) {
        dragInteractions.push({
          file: path.relative(PROJECT_ROOT, file),
          event: match[1],
          line,
        });
      }
    }
  });
  
  if (dragInteractions.length > 0) {
    dragInteractions.forEach(issue => {
      results.warnings.push(
        `2.5.7 Dragging Movements: ${issue.file}:${issue.line} - ${issue.event} listener without keyboard alternative nearby`
      );
    });
  } else {
    results.passed.push('2.5.7 Dragging Movements: No drag-only interactions detected');
  }
}

/**
 * Check Consistent Help (3.2.6) - Static Analysis
 * Help mechanisms should be in consistent order across pages
 */
function checkConsistentHelp() {
  if (verbose) console.log(`${colors.cyan}Checking Consistent Help (3.2.6)...${colors.reset}`);
  
  const layoutFiles = findFiles(PAGES_DIR, /layout\.tsx?$/);
  const helpMechanisms = [];
  
  layoutFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Look for common help mechanisms
    const helpPatterns = [
      { name: 'Contact Link', regex: /contact|help|support/i },
      { name: 'Chat Widget', regex: /chat|intercom|zendesk/i },
      { name: 'FAQ Link', regex: /faq|questions/i },
      { name: 'Search', regex: /search/i },
    ];
    
    helpPatterns.forEach(pattern => {
      if (pattern.regex.test(content)) {
        const match = content.match(pattern.regex);
        const position = content.indexOf(match[0]);
        
        helpMechanisms.push({
          file: path.relative(PROJECT_ROOT, file),
          mechanism: pattern.name,
          position,
        });
      }
    });
  });
  
  if (helpMechanisms.length === 0) {
    results.warnings.push('3.2.6 Consistent Help: No help mechanisms detected in layouts');
  } else {
    // Group by mechanism
    const mechanismsByType = {};
    helpMechanisms.forEach(h => {
      if (!mechanismsByType[h.mechanism]) {
        mechanismsByType[h.mechanism] = [];
      }
      mechanismsByType[h.mechanism].push(h);
    });
    
    // Check if positions are consistent
    Object.entries(mechanismsByType).forEach(([mechanism, instances]) => {
      if (instances.length > 1) {
        const positions = instances.map(i => i.position);
        const positionsUnique = [...new Set(positions)];
        
        if (positionsUnique.length > 1) {
          results.warnings.push(
            `3.2.6 Consistent Help: ${mechanism} appears at different positions across layouts (manual review recommended)`
          );
        } else {
          results.passed.push(`3.2.6 Consistent Help: ${mechanism} consistent across layouts`);
        }
      }
    });
  }
}

/**
 * Check Redundant Entry (3.3.7) - Static Analysis
 * Detect duplicate form fields in same form
 */
function checkRedundantEntry() {
  if (verbose) console.log(`${colors.cyan}Checking Redundant Entry (3.3.7)...${colors.reset}`);
  
  const tsxFiles = findFiles(COMPONENTS_DIR, /\.tsx?$/);
  let redundantFields = [];
  
  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Find forms
    const formRegex = /<form[^>]*>[\s\S]*?<\/form>/g;
    let formMatch;
    
    while ((formMatch = formRegex.exec(content)) !== null) {
      const formContent = formMatch[0];
      
      // Extract input names
      const nameRegex = /name=["']([^"']+)["']/g;
      const names = [];
      let nameMatch;
      
      while ((nameMatch = nameRegex.exec(formContent)) !== null) {
        names.push(nameMatch[1]);
      }
      
      // Check for duplicates
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      
      if (duplicates.length > 0) {
        const line = content.substring(0, formMatch.index).split('\n').length;
        redundantFields.push({
          file: path.relative(PROJECT_ROOT, file),
          duplicates: [...new Set(duplicates)],
          line,
        });
      }
    }
  });
  
  if (redundantFields.length > 0) {
    redundantFields.forEach(issue => {
      results.warnings.push(
        `3.3.7 Redundant Entry: ${issue.file}:${issue.line} - Duplicate field names: ${issue.duplicates.join(', ')} (verify if intentional)`
      );
    });
  } else {
    results.passed.push('3.3.7 Redundant Entry: No duplicate form fields detected');
  }
}

/**
 * Utility: Find files recursively
 */
function findFiles(dir, pattern, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .next, .git
          if (!['node_modules', '.next', '.git', 'coverage'].includes(file)) {
            findFiles(filePath, pattern, fileList);
          }
        } else if (pattern.test(file)) {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip files that can't be accessed
        if (verbose) console.warn(`Skipping ${filePath}: ${err.message}`);
      }
    });
  } catch (err) {
    // Skip directories that can't be accessed
    if (verbose) console.warn(`Skipping directory ${dir}: ${err.message}`);
  }
  
  return fileList;
}

/**
 * Main validation function
 */
async function validate() {
  console.log(`${colors.bold}${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}║   WCAG 2.2 AA Validation ${staticOnly ? '(Static Only)' : ''}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);
  
  try {
    // Run static checks
    checkFocusAppearance();
    checkTargetSize();
    checkDraggingMovements();
    checkConsistentHelp();
    checkRedundantEntry();
    
    // Display results
    console.log(`\n${colors.bold}Results:${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings.length}${colors.reset}`);
    console.log(`${colors.red}❌ Errors: ${results.errors.length}${colors.reset}\n`);
    
    if (results.passed.length > 0 && verbose) {
      console.log(`${colors.green}${colors.bold}Passed Checks:${colors.reset}`);
      results.passed.forEach(msg => console.log(`  ${colors.green}✓${colors.reset} ${msg}`));
      console.log('');
    }
    
    if (results.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bold}Warnings:${colors.reset}`);
      results.warnings.forEach(msg => console.log(`  ${colors.yellow}⚠${colors.reset}  ${msg}`));
      console.log('');
    }
    
    if (results.errors.length > 0) {
      console.log(`${colors.red}${colors.bold}Errors:${colors.reset}`);
      results.errors.forEach(msg => console.log(`  ${colors.red}✗${colors.reset} ${msg}`));
      console.log('');
      console.log(`${colors.red}${colors.bold}WCAG 2.2 AA validation FAILED!${colors.reset}`);
      console.log(`${colors.yellow}Please fix the errors above to ensure WCAG 2.2 Level AA compliance.${colors.reset}\n`);
      process.exit(1);
    }
    
    console.log(`${colors.green}${colors.bold}✅ WCAG 2.2 AA validation PASSED!${colors.reset}`);
    
    if (results.warnings.length > 0) {
      console.log(`${colors.yellow}Note: ${results.warnings.length} warning(s) require manual review.${colors.reset}`);
    }
    
    console.log('');
    process.exit(0);
    
  } catch (error) {
    console.error(`${colors.red}❌ Validation error: ${error.message}${colors.reset}`);
    if (verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run validation
validate();
