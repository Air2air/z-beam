#!/usr/bin/env node

/**
 * Frontmatter Normalization Analysis
 * Analyzes the new frontmatter structure for consistency and normalization
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(process.cwd(), 'content', 'frontmatter');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}=== ${msg} ===${colors.reset}\n`),
};

function analyzeStructure() {
  log.section('Frontmatter Normalization Analysis');

  const files = fs.readdirSync(FRONTMATTER_DIR).filter(f => f.endsWith('.yaml'));
  
  log.info(`Found ${files.length} frontmatter files\n`);

  const analysis = {
    totalFiles: files.length,
    topLevelFields: {},
    propertiesStats: {
      withProperties: 0,
      emptyProperties: 0,
      propertyNames: new Set(),
      propertyStructure: {},
    },
    categoryInfo: {
      present: 0,
      missing: 0,
      categoriesFound: new Set(),
    },
    dataCompleteness: {},
    generatedDates: new Set(),
    unicodeIssues: [],
    structuralIssues: [],
  };

  // Analyze each file
  files.forEach((file) => {
    const filePath = path.join(FRONTMATTER_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for unicode escape sequences
    const unicodeEscapes = content.match(/\\x[A-F0-9]{2}|\\u[A-F0-9]{4}/g);
    if (unicodeEscapes && unicodeEscapes.length > 0) {
      analysis.unicodeIssues.push({
        file,
        count: unicodeEscapes.length,
        examples: [...new Set(unicodeEscapes)].slice(0, 5),
      });
    }

    let data;
    try {
      data = yaml.load(content);
    } catch (err) {
      analysis.structuralIssues.push({ file, error: err.message });
      return;
    }

    // Top-level fields
    Object.keys(data).forEach((key) => {
      analysis.topLevelFields[key] = (analysis.topLevelFields[key] || 0) + 1;
    });

    // Properties analysis
    if (data.properties && typeof data.properties === 'object') {
      const propKeys = Object.keys(data.properties);
      if (propKeys.length === 0) {
        analysis.propertiesStats.emptyProperties++;
      } else {
        analysis.propertiesStats.withProperties++;
        propKeys.forEach((propName) => {
          analysis.propertiesStats.propertyNames.add(propName);
          
          // Check property structure
          const prop = data.properties[propName];
          const propStructure = Object.keys(prop).sort().join(',');
          analysis.propertiesStats.propertyStructure[propStructure] = 
            (analysis.propertiesStats.propertyStructure[propStructure] || 0) + 1;
        });
      }
    }

    // Category info
    if (data.category_info) {
      analysis.categoryInfo.present++;
      if (data.category) {
        analysis.categoryInfo.categoriesFound.add(data.category);
      }
    } else {
      analysis.categoryInfo.missing++;
    }

    // Data completeness
    if (data.data_completeness) {
      analysis.dataCompleteness[data.data_completeness] = 
        (analysis.dataCompleteness[data.data_completeness] || 0) + 1;
    }

    // Generated dates
    if (data.generated_date) {
      analysis.generatedDates.add(data.generated_date.split('T')[0]); // Just the date part
    }
  });

  // Print results
  printTopLevelFieldsAnalysis(analysis);
  printPropertiesAnalysis(analysis);
  printCategoryInfoAnalysis(analysis);
  printDataQualityAnalysis(analysis);
  printUnicodeIssuesAnalysis(analysis);
  printNormalizationSummary(analysis);
}

function printTopLevelFieldsAnalysis(analysis) {
  log.section('Top-Level Fields Consistency');
  
  const expectedFields = ['name', 'material', 'title', 'category', 'generated_date', 
                          'data_completeness', 'source', 'properties', 'category_info'];
  
  expectedFields.forEach((field) => {
    const count = analysis.topLevelFields[field] || 0;
    const percentage = ((count / analysis.totalFiles) * 100).toFixed(1);
    
    if (count === analysis.totalFiles) {
      log.success(`${field}: ${count}/${analysis.totalFiles} (100%)`);
    } else if (count > 0) {
      log.warning(`${field}: ${count}/${analysis.totalFiles} (${percentage}%)`);
    } else {
      log.error(`${field}: MISSING from all files`);
    }
  });

  // Unexpected fields
  const unexpectedFields = Object.keys(analysis.topLevelFields)
    .filter(f => !expectedFields.includes(f));
  
  if (unexpectedFields.length > 0) {
    log.warning(`\nUnexpected fields found: ${unexpectedFields.join(', ')}`);
  }
}

function printPropertiesAnalysis(analysis) {
  log.section('Properties Analysis');
  
  log.info(`Files with populated properties: ${analysis.propertiesStats.withProperties}`);
  log.info(`Files with empty properties: ${analysis.propertiesStats.emptyProperties}`);
  log.info(`Unique property names: ${analysis.propertiesStats.propertyNames.size}\n`);

  console.log('Property names found:');
  [...analysis.propertiesStats.propertyNames].sort().forEach((name) => {
    console.log(`  - ${name}`);
  });

  console.log('\nProperty field structures:');
  Object.entries(analysis.propertiesStats.propertyStructure)
    .sort((a, b) => b[1] - a[1])
    .forEach(([structure, count]) => {
      const isNormalized = structure === 'confidence,description,source,unit,value';
      const icon = isNormalized ? colors.green + '✓' : colors.yellow + '⚠';
      console.log(`  ${icon}${colors.reset} ${structure}: ${count} occurrences`);
    });
}

function printCategoryInfoAnalysis(analysis) {
  log.section('Category Info Analysis');
  
  log.info(`Files with category_info: ${analysis.categoryInfo.present}`);
  log.info(`Files missing category_info: ${analysis.categoryInfo.missing}`);
  log.info(`Categories found: ${analysis.categoryInfo.categoriesFound.size}\n`);

  console.log('Categories:');
  [...analysis.categoryInfo.categoriesFound].sort().forEach((cat) => {
    console.log(`  - ${cat}`);
  });
}

function printDataQualityAnalysis(analysis) {
  log.section('Data Quality Metrics');
  
  console.log('Data completeness distribution:');
  Object.entries(analysis.dataCompleteness)
    .sort((a, b) => b[1] - a[1])
    .forEach(([completeness, count]) => {
      console.log(`  ${completeness}: ${count} files`);
    });

  console.log('\nGenerated dates:');
  [...analysis.generatedDates].sort().forEach((date) => {
    console.log(`  - ${date}`);
  });
}

function printUnicodeIssuesAnalysis(analysis) {
  log.section('Unicode Encoding Issues');
  
  if (analysis.unicodeIssues.length === 0) {
    log.success('No unicode encoding issues found!');
    return;
  }

  log.warning(`Found unicode escape sequences in ${analysis.unicodeIssues.length} files\n`);
  
  const totalIssues = analysis.unicodeIssues.reduce((sum, item) => sum + item.count, 0);
  log.warning(`Total unicode escapes: ${totalIssues}\n`);

  // Show worst offenders
  const worstOffenders = analysis.unicodeIssues
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  console.log('Top 5 files with most issues:');
  worstOffenders.forEach(({ file, count, examples }) => {
    console.log(`  ${file}: ${count} issues`);
    console.log(`    Examples: ${examples.join(', ')}`);
  });

  console.log('\nCommon unicode escapes:');
  const allEscapes = {};
  analysis.unicodeIssues.forEach(({ examples }) => {
    examples.forEach((esc) => {
      allEscapes[esc] = (allEscapes[esc] || 0) + 1;
    });
  });

  const mapping = {
    '\\xB3': '³ (superscript 3)',
    '\\xB0': '° (degree symbol)',
    '\\u207B': '⁻ (superscript minus)',
    '\\xD7': '× (multiplication)',
    '\\u03BC': 'μ (micro)',
    '\\xB7': '· (middle dot)',
  };

  Object.entries(allEscapes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([escape, count]) => {
      const meaning = mapping[escape] || 'unknown';
      console.log(`  ${escape} → ${meaning}: ${count} occurrences`);
    });
}

function printNormalizationSummary(analysis) {
  log.section('Normalization Summary');

  const checks = [];

  // Check 1: All files have required fields
  const requiredFields = ['name', 'material', 'title', 'category', 'properties', 'category_info'];
  const allHaveRequired = requiredFields.every(
    field => analysis.topLevelFields[field] === analysis.totalFiles
  );
  checks.push({
    name: 'All files have required top-level fields',
    passed: allHaveRequired,
  });

  // Check 2: Property structure consistency
  const propertyStructures = Object.keys(analysis.propertiesStats.propertyStructure);
  const singleStructure = propertyStructures.length <= 1;
  checks.push({
    name: 'Properties have consistent structure',
    passed: singleStructure,
    details: singleStructure ? null : `Found ${propertyStructures.length} different structures`,
  });

  // Check 3: No unicode escape sequences
  const noUnicodeIssues = analysis.unicodeIssues.length === 0;
  checks.push({
    name: 'No unicode encoding issues',
    passed: noUnicodeIssues,
    details: noUnicodeIssues ? null : `${analysis.unicodeIssues.length} files affected`,
  });

  // Check 4: All files have 100% data completeness
  const allComplete = Object.keys(analysis.dataCompleteness).length === 1 && 
                      analysis.dataCompleteness['100%'] === analysis.totalFiles;
  checks.push({
    name: 'All files report 100% data completeness',
    passed: allComplete,
  });

  // Check 5: Generated dates are recent and consistent
  const recentDates = [...analysis.generatedDates].every(
    date => date >= '2025-10-22'
  );
  checks.push({
    name: 'All files recently generated',
    passed: recentDates,
    details: `Dates: ${[...analysis.generatedDates].join(', ')}`,
  });

  // Print checks
  checks.forEach(({ name, passed, details }) => {
    if (passed) {
      log.success(name);
    } else {
      log.warning(name);
      if (details) {
        console.log(`  ${details}`);
      }
    }
  });

  // Overall assessment
  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;
  const percentage = ((passedChecks / totalChecks) * 100).toFixed(0);

  console.log(`\n${colors.bold}Overall Normalization Score: ${passedChecks}/${totalChecks} (${percentage}%)${colors.reset}\n`);

  // Recommendations
  if (passedChecks < totalChecks) {
    log.section('Recommendations');
    
    if (analysis.unicodeIssues.length > 0) {
      log.warning('Fix unicode encoding: Replace escape sequences with actual unicode characters');
      console.log('  Suggested: Create script to decode \\xB3 → ³, \\xB0 → °, etc.\n');
    }

    if (!singleStructure) {
      log.warning('Standardize property structure: Ensure all properties have value, unit, confidence, source, description');
      console.log('  Current structures found:');
      Object.keys(analysis.propertiesStats.propertyStructure).forEach(s => {
        console.log(`    - ${s}`);
      });
      console.log();
    }
  } else {
    log.success('Frontmatter structure is well normalized!');
    log.info('Only remaining issue: Unicode encoding (cosmetic issue, does not affect functionality)');
  }
}

// Run analysis
try {
  analyzeStructure();
} catch (err) {
  log.error(`Analysis failed: ${err.message}`);
  console.error(err);
  process.exit(1);
}
