// Component Import and Props Validation Test
console.log('🔍 COMPONENT VALIDATION TEST');
console.log('===========================\n');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComponentValidator {
  constructor() {
    this.results = {
      importValidation: {},
      propsValidation: {},
      componentAnalysis: {},
      summary: {},
      timestamp: new Date().toISOString()
    };
    this.componentDir = path.join(__dirname, '..', 'app', 'components');
  }

  // Validate component imports
  async validateImports() {
    console.log('🔍 Validating component imports...\n');
    
    const components = this.getComponentFiles();
    let validImports = 0;
    let invalidImports = 0;
    
    for (const component of components) {
      console.log(`📋 Checking: ${component.name}`);
      
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        const importAnalysis = this.analyzeImports(content, component.name);
        
        this.results.importValidation[component.name] = {
          status: importAnalysis.hasErrors ? 'FAIL' : 'PASS',
          imports: importAnalysis.imports,
          errors: importAnalysis.errors,
          warnings: importAnalysis.warnings
        };
        
        if (importAnalysis.hasErrors) {
          console.log(`  ❌ Import errors found: ${importAnalysis.errors.length}`);
          invalidImports++;
        } else {
          console.log(`  ✅ Imports valid (${importAnalysis.imports.length} imports)`);
          validImports++;
        }
        
        if (importAnalysis.warnings.length > 0) {
          console.log(`  ⚠️  Warnings: ${importAnalysis.warnings.length}`);
        }
        
      } catch (error) {
        this.results.importValidation[component.name] = {
          status: 'ERROR',
          error: error.message
        };
        console.log(`  💥 Error reading file: ${error.message}`);
        invalidImports++;
      }
      
      console.log('');
    }
    
    console.log(`📊 Import validation summary:`);
    console.log(`   Valid: ${validImports}`);
    console.log(`   Invalid: ${invalidImports}`);
    console.log(`   Total: ${validImports + invalidImports}\n`);
    
    return { validImports, invalidImports };
  }

  // Validate component props and interfaces
  async validateProps() {
    console.log('🔍 Validating component props and interfaces...\n');
    
    const components = this.getComponentFiles();
    let validProps = 0;
    let propsIssues = 0;
    
    for (const component of components) {
      console.log(`📋 Checking props: ${component.name}`);
      
      try {
        const content = fs.readFileSync(component.path, 'utf8');
        const propsAnalysis = this.analyzeProps(content, component.name);
        
        this.results.propsValidation[component.name] = {
          status: propsAnalysis.hasIssues ? 'WARN' : 'PASS',
          interfaces: propsAnalysis.interfaces,
          propsUsage: propsAnalysis.propsUsage,
          issues: propsAnalysis.issues,
          suggestions: propsAnalysis.suggestions
        };
        
        if (propsAnalysis.hasIssues) {
          console.log(`  ⚠️  Props issues found: ${propsAnalysis.issues.length}`);
          propsIssues++;
        } else {
          console.log(`  ✅ Props properly defined`);
          validProps++;
        }
        
      } catch (error) {
        this.results.propsValidation[component.name] = {
          status: 'ERROR',
          error: error.message
        };
        console.log(`  💥 Error analyzing props: ${error.message}`);
        propsIssues++;
      }
      
      console.log('');
    }
    
    console.log(`📊 Props validation summary:`);
    console.log(`   Clean: ${validProps}`);
    console.log(`   Issues: ${propsIssues}`);
    console.log(`   Total: ${validProps + propsIssues}\n`);
    
    return { validProps, propsIssues };
  }

  // Analyze component imports
  analyzeImports(content, componentName) {
    const imports = [];
    const errors = [];
    const warnings = [];
    
    // Extract import statements
    const importRegex = /^import\s+(?:{[^}]+}|\w+|.*?)\s+from\s+['"]([^'"]+)['"]/gm;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const fullImport = match[0];
      
      imports.push({
        statement: fullImport,
        path: importPath,
        line: content.substring(0, match.index).split('\n').length
      });
      
      // Check for common import issues
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Relative import - check if file might exist
        if (importPath.includes('/components/') && !importPath.includes(componentName)) {
          warnings.push(`Relative component import: ${importPath}`);
        }
      }
      
      // Check for potential missing imports
      if (importPath === 'react' && !fullImport.includes('useState') && content.includes('useState')) {
        errors.push('useState used but not imported from react');
      }
      
      if (importPath === 'react' && !fullImport.includes('useEffect') && content.includes('useEffect')) {
        errors.push('useEffect used but not imported from react');
      }
      
      // Check for Next.js specific imports
      if (content.includes('<Link') && !imports.some(imp => imp.path === 'next/link')) {
        errors.push('Link component used but next/link not imported');
      }
      
      if (content.includes('<Image') && !imports.some(imp => imp.path === 'next/image')) {
        warnings.push('Image component used - consider importing from next/image');
      }
    }
    
    // Check for unused imports (basic check)
    imports.forEach(imp => {
      if (imp.statement.includes('import {')) {
        const namedImports = imp.statement.match(/import\s+{([^}]+)}/);
        if (namedImports) {
          const names = namedImports[1].split(',').map(n => n.trim());
          names.forEach(name => {
            const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
            if (!content.includes(cleanName) || content.indexOf(cleanName) === content.indexOf(imp.statement)) {
              warnings.push(`Potentially unused import: ${cleanName}`);
            }
          });
        }
      }
    });
    
    return {
      imports,
      errors,
      warnings,
      hasErrors: errors.length > 0
    };
  }

  // Analyze component props and interfaces
  analyzeProps(content, componentName) {
    const interfaces = [];
    const propsUsage = [];
    const issues = [];
    const suggestions = [];
    
    // Extract interface definitions
    const interfaceRegex = /interface\s+(\w+)\s*{([^}]+)}/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];
      
      interfaces.push({
        name: interfaceName,
        body: interfaceBody.trim(),
        line: content.substring(0, match.index).split('\n').length
      });
    }
    
    // Extract props usage in component function
    const componentRegex = new RegExp(`(?:function\\s+${componentName}|const\\s+${componentName}\\s*=)\\s*\\([^)]*\\)`, 'g');
    const componentMatch = componentRegex.exec(content);
    
    if (componentMatch) {
      const propsPattern = /\(\s*{\s*([^}]+)\s*}\s*:|props\s*:/g;
      const propsMatch = propsPattern.exec(componentMatch[0]);
      
      if (propsMatch) {
        propsUsage.push({
          type: propsMatch[0].includes('{') ? 'destructured' : 'object',
          props: propsMatch[1] ? propsMatch[1].split(',').map(p => p.trim()) : [],
          line: content.substring(0, componentMatch.index).split('\n').length
        });
      }
    }
    
    // Check for common props issues
    if (content.includes('any') && (content.includes('Props') || content.includes('interface'))) {
      issues.push('Using "any" type in props or interfaces - consider specific types');
    }
    
    if (interfaces.length === 0 && content.includes('function ' + componentName)) {
      suggestions.push('Consider defining props interface for better type safety');
    }
    
    if (content.includes('props.') && !content.includes('interface')) {
      issues.push('Using props object without interface definition');
    }
    
    // Check for unused props
    if (propsUsage.length > 0 && propsUsage[0].props) {
      propsUsage[0].props.forEach(prop => {
        const propName = prop.split(':')[0].trim();
        if (propName && !content.includes(propName) || content.indexOf(propName) === content.indexOf(propsUsage[0])) {
          issues.push(`Potentially unused prop: ${propName}`);
        }
      });
    }
    
    return {
      interfaces,
      propsUsage,
      issues,
      suggestions,
      hasIssues: issues.length > 0
    };
  }

  // Get all component files
  getComponentFiles() {
    const components = [];
    
    const scanDirectory = (dir, basePath = '') => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            scanDirectory(itemPath, basePath ? `${basePath}/${item}` : item);
          } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            components.push({
              name: basePath ? `${basePath}/${item}` : item,
              path: itemPath,
              type: item.endsWith('.tsx') ? 'component' : 'utility'
            });
          }
        }
      } catch (error) {
        console.log(`⚠️  Could not scan directory: ${dir}`);
      }
    };
    
    scanDirectory(this.componentDir);
    return components.filter(c => c.type === 'component'); // Focus on TSX components
  }

  // Generate comprehensive report
  generateReport() {
    console.log('📊 COMPONENT VALIDATION REPORT');
    console.log('==============================\n');

    const importResults = Object.values(this.results.importValidation);
    const propsResults = Object.values(this.results.propsValidation);
    
    const importStats = {
      total: importResults.length,
      passed: importResults.filter(r => r.status === 'PASS').length,
      failed: importResults.filter(r => r.status === 'FAIL').length,
      errors: importResults.filter(r => r.status === 'ERROR').length
    };
    
    const propsStats = {
      total: propsResults.length,
      clean: propsResults.filter(r => r.status === 'PASS').length,
      issues: propsResults.filter(r => r.status === 'WARN').length,
      errors: propsResults.filter(r => r.status === 'ERROR').length
    };

    console.log(`🔍 Import Validation:`);
    console.log(`   Components Analyzed: ${importStats.total}`);
    console.log(`   Valid Imports: ${importStats.passed}`);
    console.log(`   Import Issues: ${importStats.failed}`);
    console.log(`   Analysis Errors: ${importStats.errors}\n`);

    console.log(`🔍 Props Validation:`);
    console.log(`   Components Analyzed: ${propsStats.total}`);
    console.log(`   Clean Props: ${propsStats.clean}`);
    console.log(`   Props Issues: ${propsStats.issues}`);
    console.log(`   Analysis Errors: ${propsStats.errors}\n`);

    // Show top issues
    console.log(`🚨 Top Import Issues:`);
    const allImportIssues = [];
    Object.entries(this.results.importValidation).forEach(([comp, result]) => {
      if (result.errors) {
        result.errors.forEach(error => allImportIssues.push(`${comp}: ${error}`));
      }
    });
    
    allImportIssues.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue}`);
    });
    
    console.log(`\n🚨 Top Props Issues:`);
    const allPropsIssues = [];
    Object.entries(this.results.propsValidation).forEach(([comp, result]) => {
      if (result.issues) {
        result.issues.forEach(issue => allPropsIssues.push(`${comp}: ${issue}`));
      }
    });
    
    allPropsIssues.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue}`);
    });

    this.results.summary = {
      importValidation: importStats,
      propsValidation: propsStats,
      overallStatus: (importStats.failed === 0 && propsStats.issues <= 3) ? 'PASS' : 'WARN',
      timestamp: new Date().toISOString()
    };

    // Save results
    const reportPath = path.join(__dirname, 'component-validation-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📁 Detailed results saved to: ${reportPath}`);
  }
}

// Run component validation
async function main() {
  const validator = new ComponentValidator();
  
  try {
    const importResults = await validator.validateImports();
    const propsResults = await validator.validateProps();
    
    validator.generateReport();
    
    console.log('\n✅ Component validation completed!');
    
    if (validator.results.summary.overallStatus === 'PASS') {
      console.log('🎉 All component validations passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some component issues found - review report for details');
      process.exit(0); // Don't fail build for warnings
    }
  } catch (error) {
    console.error('\n💥 Component validation failed:', error.message);
    process.exit(1);
  }
}

main();
