// Warning Cleanup Test
console.log('🧹 WARNING CLEANUP TEST');
console.log('=======================\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class WarningCleanupTest {
  constructor() {
    this.results = {
      lintWarnings: null,
      typeWarnings: null,
      fixedWarnings: [],
      remainingWarnings: [],
      summary: {}
    };
  }

  // Run ESLint and capture warnings
  async testLintWarnings() {
    console.log('🔍 Testing ESLint warnings...');
    
    try {
      const output = execSync('npx eslint . --ext .ts,.tsx,.js,.jsx --format json', { 
        encoding: 'utf8',
        timeout: 60000
      });
      
      const results = JSON.parse(output);
      const warnings = this.extractWarnings(results);
      
      this.results.lintWarnings = {
        status: warnings.length === 0 ? 'CLEAN' : 'WARNINGS',
        count: warnings.length,
        warnings: warnings.slice(0, 20), // Top 20 warnings
        categories: this.categorizeWarnings(warnings)
      };
      
      if (warnings.length === 0) {
        console.log('  ✅ No ESLint warnings found!');
      } else {
        console.log(`  ⚠️  Found ${warnings.length} ESLint warnings`);
        this.displayTopWarnings(warnings);
      }
      
      return true;
    } catch (error) {
      // ESLint returns non-zero exit code when warnings are found
      const errorOutput = error.stdout || error.message;
      
      try {
        const results = JSON.parse(errorOutput);
        const warnings = this.extractWarnings(results);
        
        this.results.lintWarnings = {
          status: 'WARNINGS',
          count: warnings.length,
          warnings: warnings.slice(0, 20),
          categories: this.categorizeWarnings(warnings)
        };
        
        console.log(`  ⚠️  Found ${warnings.length} ESLint warnings`);
        this.displayTopWarnings(warnings);
        
        return true;
      } catch (parseError) {
        this.results.lintWarnings = {
          status: 'ERROR',
          error: parseError.message
        };
        console.log('  ❌ ESLint analysis: ERROR');
        return false;
      }
    }
  }

  extractWarnings(eslintResults) {
    const warnings = [];
    
    for (const result of eslintResults) {
      if (result.messages) {
        for (const message of result.messages) {
          if (message.severity === 1) { // Warning
            warnings.push({
              file: result.filePath.replace(process.cwd() + '/', ''),
              line: message.line,
              column: message.column,
              rule: message.ruleId,
              message: message.message,
              type: this.getWarningType(message.ruleId)
            });
          }
        }
      }
    }
    
    return warnings;
  }

  getWarningType(ruleId) {
    if (!ruleId) return 'unknown';
    
    if (ruleId.includes('no-explicit-any')) return 'any-types';
    if (ruleId.includes('no-unused-vars')) return 'unused-vars';
    if (ruleId.includes('no-unescaped-entities')) return 'jsx-entities';
    if (ruleId.includes('no-img-element')) return 'next-image';
    
    return 'other';
  }

  categorizeWarnings(warnings) {
    const categories = {};
    
    for (const warning of warnings) {
      const type = warning.type;
      if (!categories[type]) {
        categories[type] = { count: 0, examples: [] };
      }
      categories[type].count++;
      if (categories[type].examples.length < 3) {
        categories[type].examples.push({
          file: warning.file,
          rule: warning.rule,
          message: warning.message.slice(0, 80)
        });
      }
    }
    
    return categories;
  }

  displayTopWarnings(warnings) {
    const topWarnings = warnings.slice(0, 5);
    console.log('   Top warnings:');
    
    for (const warning of topWarnings) {
      console.log(`     • ${warning.file}:${warning.line} - ${warning.rule}: ${warning.message.slice(0, 60)}...`);
    }
  }

  // Test specific warning patterns
  async testTypeWarnings() {
    console.log('🔍 Testing TypeScript type warnings...');
    
    try {
      const anyTypes = await this.findAnyTypes();
      const unusedVars = await this.findUnusedVariables();
      
      this.results.typeWarnings = {
        status: anyTypes.length === 0 && unusedVars.length === 0 ? 'CLEAN' : 'WARNINGS',
        anyTypes: anyTypes.length,
        unusedVars: unusedVars.length,
        details: {
          anyTypes: anyTypes.slice(0, 10),
          unusedVars: unusedVars.slice(0, 10)
        }
      };
      
      console.log(`  📊 Found ${anyTypes.length} 'any' types and ${unusedVars.length} unused variables`);
      
      return true;
    } catch (error) {
      this.results.typeWarnings = {
        status: 'ERROR',
        error: error.message
      };
      console.log('  ❌ Type warning analysis: ERROR');
      return false;
    }
  }

  async findAnyTypes() {
    const anyTypes = [];
    const searchDirs = ['app/'];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.searchAnyTypesInDir(dir, anyTypes);
      }
    }
    
    return anyTypes;
  }

  searchAnyTypesInDir(dir, results) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.searchAnyTypesInDir(filePath, results);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const anyMatches = line.match(/:\s*any(\s|;|,|\||]|\}|\))/g);
          if (anyMatches) {
            results.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
              matches: anyMatches.length
            });
          }
        });
      }
    }
  }

  async findUnusedVariables() {
    // This would require more sophisticated parsing
    // For now, return empty array as we'll rely on ESLint
    return [];
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 WARNING CLEANUP REPORT');
    console.log('==========================\n');

    const { lintWarnings, typeWarnings } = this.results;
    
    // ESLint Warnings
    if (lintWarnings) {
      console.log(`🔍 ESLint Analysis: ${lintWarnings.status}`);
      if (lintWarnings.count > 0) {
        console.log(`   Total Warnings: ${lintWarnings.count}`);
        
        if (lintWarnings.categories) {
          console.log('   Warning Categories:');
          Object.entries(lintWarnings.categories).forEach(([type, data]) => {
            console.log(`     • ${type}: ${data.count} warnings`);
          });
        }
      }
      console.log('');
    }

    // Type Warnings
    if (typeWarnings) {
      console.log(`🔍 Type Analysis: ${typeWarnings.status}`);
      if (typeWarnings.anyTypes > 0 || typeWarnings.unusedVars > 0) {
        console.log(`   Any Types: ${typeWarnings.anyTypes}`);
        console.log(`   Unused Variables: ${typeWarnings.unusedVars}`);
      }
      console.log('');
    }

    // Overall Summary
    const hasWarnings = (lintWarnings && lintWarnings.count > 0) || 
                       (typeWarnings && (typeWarnings.anyTypes > 0 || typeWarnings.unusedVars > 0));

    this.results.summary = {
      overallStatus: hasWarnings ? 'WARNINGS_FOUND' : 'CLEAN',
      totalWarnings: (lintWarnings?.count || 0),
      anyTypes: (typeWarnings?.anyTypes || 0),
      timestamp: new Date().toISOString()
    };

    console.log(`🏆 Overall Status: ${this.results.summary.overallStatus}`);
    
    // Save results
    const reportPath = path.join(__dirname, 'warning-cleanup-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed results saved to: ${reportPath}`);

    if (hasWarnings) {
      console.log('\n💡 Consider running warning fixes to improve code quality!');
    } else {
      console.log('\n✨ Code is clean - great job!');
    }
  }
}

// Run the warning cleanup test
async function main() {
  const tester = new WarningCleanupTest();
  
  try {
    console.log('Starting warning cleanup analysis...\n');
    
    // Run all tests
    await tester.testLintWarnings();
    await tester.testTypeWarnings();
    
    tester.generateReport();
    
    if (tester.results.summary.overallStatus === 'CLEAN') {
      console.log('\n✅ Warning cleanup test passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Warnings found - consider cleanup!');
      process.exit(0); // Don't fail the build for warnings
    }
  } catch (error) {
    console.error('\n💥 Warning cleanup test crashed:', error.message);
    process.exit(1);
  }
}

main();
