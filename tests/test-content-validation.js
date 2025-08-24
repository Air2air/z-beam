// Content Validation Test - BadgeSymbol and PropertiesTable
console.log('📋 CONTENT VALIDATION TEST');
console.log('===========================\n');

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class ContentValidator {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.results = {
      badgeSymbol: { valid: 0, invalid: 0, errors: [] },
      propertiesTable: { valid: 0, invalid: 0, errors: [] },
      overall: { status: 'UNKNOWN', score: 0 }
    };
  }

  async runContentValidation() {
    console.log('🔍 Starting content validation...\n');

    // Test BadgeSymbol content files
    await this.validateBadgeSymbolContent();
    
    // Test PropertiesTable content files  
    await this.validatePropertiesTableContent();
    
    // Test contentAPI integration
    await this.validateContentAPIIntegration();
    
    // Generate final report
    this.generateReport();
    
    return this.results;
  }

  async validateBadgeSymbolContent() {
    console.log('🧪 Validating BadgeSymbol content files...');
    
    const badgeSymbolDir = path.join(this.workspaceRoot, 'content/components/badgesymbol');
    
    if (!fs.existsSync(badgeSymbolDir)) {
      this.results.badgeSymbol.errors.push('BadgeSymbol content directory does not exist');
      console.log('  ❌ BadgeSymbol directory not found');
      return;
    }

    const files = fs.readdirSync(badgeSymbolDir).filter(f => f.endsWith('.md'));
    console.log(`  📂 Found ${files.length} BadgeSymbol files`);

    for (const file of files) {
      const filePath = path.join(badgeSymbolDir, file);
      const isValid = this.validateBadgeSymbolFile(filePath, file);
      
      if (isValid) {
        this.results.badgeSymbol.valid++;
        console.log(`    ✅ ${file}`);
      } else {
        this.results.badgeSymbol.invalid++;
        console.log(`    ❌ ${file}`);
      }
    }

    const validationRate = Math.round((this.results.badgeSymbol.valid / files.length) * 100);
    console.log(`  📊 BadgeSymbol validation: ${validationRate}% (${this.results.badgeSymbol.valid}/${files.length})\n`);
  }

  validateBadgeSymbolFile(filePath, fileName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(content);
      
      // Required fields for BadgeSymbol
      const requiredFields = ['symbol', 'materialType'];
      const missingFields = requiredFields.filter(field => !parsed.data[field]);
      
      if (missingFields.length > 0) {
        this.results.badgeSymbol.errors.push(`${fileName}: Missing required fields: ${missingFields.join(', ')}`);
        return false;
      }

      // Validate field types and values
      if (typeof parsed.data.symbol !== 'string' || parsed.data.symbol.trim() === '') {
        this.results.badgeSymbol.errors.push(`${fileName}: Invalid symbol field`);
        return false;
      }

      const validMaterialTypes = ['metal', 'ceramic', 'composite', 'polymer', 'glass', 'element'];
      if (!validMaterialTypes.includes(parsed.data.materialType)) {
        this.results.badgeSymbol.errors.push(`${fileName}: Invalid materialType: ${parsed.data.materialType}`);
        return false;
      }

      return true;
    } catch (error) {
      this.results.badgeSymbol.errors.push(`${fileName}: Parse error - ${error.message}`);
      return false;
    }
  }

  async validatePropertiesTableContent() {
    console.log('📊 Validating PropertiesTable content files...');
    
    const propertiesTableDir = path.join(this.workspaceRoot, 'content/components/propertiestable');
    
    if (!fs.existsSync(propertiesTableDir)) {
      this.results.propertiesTable.errors.push('PropertiesTable content directory does not exist');
      console.log('  ❌ PropertiesTable directory not found');
      return;
    }

    const files = fs.readdirSync(propertiesTableDir).filter(f => f.endsWith('.md'));
    console.log(`  📂 Found ${files.length} PropertiesTable files`);

    for (const file of files) {
      const filePath = path.join(propertiesTableDir, file);
      const isValid = this.validatePropertiesTableFile(filePath, file);
      
      if (isValid) {
        this.results.propertiesTable.valid++;
        console.log(`    ✅ ${file}`);
      } else {
        this.results.propertiesTable.invalid++;
        console.log(`    ❌ ${file}`);
      }
    }

    const validationRate = Math.round((this.results.propertiesTable.valid / files.length) * 100);
    console.log(`  📊 PropertiesTable validation: ${validationRate}% (${this.results.propertiesTable.valid}/${files.length})\n`);
  }

  validatePropertiesTableFile(filePath, fileName) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // PropertiesTable files should contain markdown tables
      const tablePattern = /\|[^|]+\|/;
      if (!tablePattern.test(content)) {
        this.results.propertiesTable.errors.push(`${fileName}: No valid markdown table found`);
        return false;
      }

      // Count table rows (should have at least header + 1 data row)
      const tableRows = content.split('\n').filter(line => line.includes('|'));
      if (tableRows.length < 3) { // Header, separator, at least 1 data row
        this.results.propertiesTable.errors.push(`${fileName}: Insufficient table content`);
        return false;
      }

      return true;
    } catch (error) {
      this.results.propertiesTable.errors.push(`${fileName}: Parse error - ${error.message}`);
      return false;
    }
  }

  async validateContentAPIIntegration() {
    console.log('🔗 Validating contentAPI integration...');
    
    const contentAPIPath = path.join(this.workspaceRoot, 'app/utils/contentAPI.ts');
    
    if (!fs.existsSync(contentAPIPath)) {
      this.results.overall.errors = this.results.overall.errors || [];
      this.results.overall.errors.push('contentAPI.ts not found');
      console.log('  ❌ contentAPI.ts not found');
      return;
    }

    const contentAPI = fs.readFileSync(contentAPIPath, 'utf8');
    
    // Check if badgesymbol and propertiestable are configured
    const hasBadgeSymbol = contentAPI.includes('badgesymbol');
    const hasPropertiesTable = contentAPI.includes('propertiestable');
    
    console.log(`  ${hasBadgeSymbol ? '✅' : '❌'} BadgeSymbol configured in contentAPI`);
    console.log(`  ${hasPropertiesTable ? '✅' : '❌'} PropertiesTable configured in contentAPI`);
    
    if (!hasBadgeSymbol) {
      this.results.overall.errors = this.results.overall.errors || [];
      this.results.overall.errors.push('BadgeSymbol not configured in contentAPI');
    }
    
    if (!hasPropertiesTable) {
      this.results.overall.errors = this.results.overall.errors || [];
      this.results.overall.errors.push('PropertiesTable not configured in contentAPI');
    }

    console.log();
  }

  generateReport() {
    const totalFiles = this.results.badgeSymbol.valid + this.results.badgeSymbol.invalid + 
                      this.results.propertiesTable.valid + this.results.propertiesTable.invalid;
    const totalValid = this.results.badgeSymbol.valid + this.results.propertiesTable.valid;
    const overallScore = totalFiles > 0 ? Math.round((totalValid / totalFiles) * 100) : 0;
    
    this.results.overall.score = overallScore;
    this.results.overall.status = overallScore >= 90 ? 'EXCELLENT' : 
                                 overallScore >= 80 ? 'GOOD' : 
                                 overallScore >= 70 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT';

    console.log('📊 CONTENT VALIDATION REPORT');
    console.log('=============================\n');

    console.log(`🏆 Overall Status: ${this.results.overall.status}`);
    console.log(`📈 Overall Score: ${overallScore}% (${totalValid}/${totalFiles})\n`);

    console.log('📋 BadgeSymbol Content:');
    console.log(`   Valid: ${this.results.badgeSymbol.valid}`);
    console.log(`   Invalid: ${this.results.badgeSymbol.invalid}`);
    if (this.results.badgeSymbol.errors.length > 0) {
      console.log('   Errors:');
      this.results.badgeSymbol.errors.forEach(error => console.log(`     • ${error}`));
    }

    console.log('\n📋 PropertiesTable Content:');
    console.log(`   Valid: ${this.results.propertiesTable.valid}`);
    console.log(`   Invalid: ${this.results.propertiesTable.invalid}`);
    if (this.results.propertiesTable.errors.length > 0) {
      console.log('   Errors:');
      this.results.propertiesTable.errors.forEach(error => console.log(`     • ${error}`));
    }

    // Save detailed results
    const reportPath = path.join(__dirname, 'content-validation-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${reportPath}`);

    if (this.results.overall.status === 'EXCELLENT' || this.results.overall.status === 'GOOD') {
      console.log('✅ Content validation completed successfully!');
      return true;
    } else {
      console.log('⚠️  Content validation found issues - review report for details');
      return false;
    }
  }
}

// Main execution
async function main() {
  const validator = new ContentValidator();

  try {
    const results = await validator.runContentValidation();
    
    if (results.overall.status === 'EXCELLENT' || results.overall.status === 'GOOD') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Content validation crashed:', error.message);
    process.exit(1);
  }
}

main();
