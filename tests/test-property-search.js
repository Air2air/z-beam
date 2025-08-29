// tests/test-property-search.js
const fs = require('fs');
const path = require('path');

class PropertySearchTest {
  constructor() {
    this.results = {
      propertyFiles: { status: 'PENDING', count: 0, issues: [] },
      propertyParsing: { status: 'PENDING', issues: [] },
      propertyRoutes: { status: 'PENDING', issues: [] },
      clickableCards: { status: 'PENDING', issues: [] }
    };
  }

  async runTests() {
    console.log('🔍 PROPERTY SEARCH FUNCTIONALITY TEST');
    console.log('=====================================\n');

    await this.testPropertyFiles();
    await this.testPropertyParsing();
    await this.testPropertyRoutes();
    await this.testClickableCards();

    console.log('📊 PROPERTY SEARCH TEST REPORT');
    console.log('===============================\n');

    const totalIssues = Object.values(this.results).reduce((sum, result) => sum + result.issues.length, 0);
    const allPassed = Object.values(this.results).every(result => result.status === 'PASS');

    console.log(`🏆 Overall Status: ${allPassed ? 'PASS' : 'WARN'}`);
    console.log(`📈 Issues Found: ${totalIssues}\n`);

    Object.entries(this.results).forEach(([test, result]) => {
      console.log(`   ${test}: ${result.status}`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`     ⚠️  ${issue}`));
      }
    });

    if (allPassed) {
      console.log('\n🎉 All property search tests passed!');
    }

    return this.results;
  }

  async testPropertyFiles() {
    console.log('📂 Testing property files...');
    
    try {
      const propertiesDir = path.join(process.cwd(), 'content', 'components', 'propertiestable');
      
      if (!fs.existsSync(propertiesDir)) {
        this.results.propertyFiles.issues.push('Properties directory not found');
        this.results.propertyFiles.status = 'FAIL';
        return;
      }

      const files = fs.readdirSync(propertiesDir).filter(file => file.endsWith('.md'));
      this.results.propertyFiles.count = files.length;

      if (files.length === 0) {
        this.results.propertyFiles.issues.push('No property files found');
        this.results.propertyFiles.status = 'WARN';
      } else {
        console.log(`  ✅ Found ${files.length} property files`);
        this.results.propertyFiles.status = 'PASS';
      }

    } catch (error) {
      this.results.propertyFiles.issues.push(`Error testing property files: ${error.message}`);
      this.results.propertyFiles.status = 'FAIL';
    }
  }

  async testPropertyParsing() {
    console.log('🔧 Testing property parsing...');
    
    try {
      // Test parsing a sample property file
      const propertiesDir = path.join(process.cwd(), 'content', 'components', 'propertiestable');
      const files = fs.readdirSync(propertiesDir).filter(file => file.endsWith('.md'));
      
      if (files.length > 0) {
        const sampleFile = path.join(propertiesDir, files[0]);
        const content = fs.readFileSync(sampleFile, 'utf8');
        
        // Check for table structure
        if (!content.includes('|')) {
          this.results.propertyParsing.issues.push('Property file does not contain table structure');
        }
        
        // Check for Property/Value headers
        if (!content.toLowerCase().includes('property') || !content.toLowerCase().includes('value')) {
          this.results.propertyParsing.issues.push('Property file missing Property/Value headers');
        }
        
        console.log(`  ✅ Property file structure validated`);
      }

      this.results.propertyParsing.status = 
        this.results.propertyParsing.issues.length === 0 ? 'PASS' : 'WARN';

    } catch (error) {
      this.results.propertyParsing.issues.push(`Error testing property parsing: ${error.message}`);
      this.results.propertyParsing.status = 'FAIL';
    }
  }

  async testPropertyRoutes() {
    console.log('🛣️ Testing property routes...');
    
    try {
      // Check if property route files exist
      const propertyPagePath = path.join(process.cwd(), 'app', 'property', 'page.tsx');
      const propertySearchPath = path.join(process.cwd(), 'app', 'property', '[property]', '[value]', 'page.tsx');
      const propertyUtilsPath = path.join(process.cwd(), 'app', 'utils', 'propertySearch.ts');
      const propertyApiPath = path.join(process.cwd(), 'app', 'api', 'properties', 'route.ts');

      if (!fs.existsSync(propertyPagePath)) {
        this.results.propertyRoutes.issues.push('Property main page not found');
      }

      if (!fs.existsSync(propertySearchPath)) {
        this.results.propertyRoutes.issues.push('Property search page not found');
      }

      if (!fs.existsSync(propertyUtilsPath)) {
        this.results.propertyRoutes.issues.push('Property search utilities not found');
      }

      if (!fs.existsSync(propertyApiPath)) {
        this.results.propertyRoutes.issues.push('Property API route not found');
      }

      console.log(`  ✅ Property routes validated`);
      this.results.propertyRoutes.status = 
        this.results.propertyRoutes.issues.length === 0 ? 'PASS' : 'WARN';

    } catch (error) {
      this.results.propertyRoutes.issues.push(`Error testing property routes: ${error.message}`);
      this.results.propertyRoutes.status = 'FAIL';
    }
  }

  async testClickableCards() {
    console.log('🎨 Testing clickable property cards...');
    
    try {
      // Check PropertiesTable component for clickable links
      const propertiesTablePath = path.join(process.cwd(), 'app', 'components', 'PropertiesTable', 'PropertiesTable.tsx');
      
      if (!fs.existsSync(propertiesTablePath)) {
        this.results.clickableCards.issues.push('PropertiesTable component not found');
        this.results.clickableCards.status = 'FAIL';
        return;
      }

      const content = fs.readFileSync(propertiesTablePath, 'utf8');
      
      // Check for property links
      if (!content.includes('property-link')) {
        this.results.clickableCards.issues.push('Property links not found in PropertiesTable');
      }

      if (!content.includes('/property/')) {
        this.results.clickableCards.issues.push('Property URL structure not found');
      }

      // Check CSS file
      const stylesPath = path.join(process.cwd(), 'app', 'components', 'PropertiesTable', 'styles.css');
      if (fs.existsSync(stylesPath)) {
        const stylesContent = fs.readFileSync(stylesPath, 'utf8');
        if (!stylesContent.includes('property-link')) {
          this.results.clickableCards.issues.push('Property link styles not found');
        }
      }

      console.log(`  ✅ Clickable property cards validated`);
      this.results.clickableCards.status = 
        this.results.clickableCards.issues.length === 0 ? 'PASS' : 'WARN';

    } catch (error) {
      this.results.clickableCards.issues.push(`Error testing clickable cards: ${error.message}`);
      this.results.clickableCards.status = 'FAIL';
    }
  }
}

// Run the test
const test = new PropertySearchTest();
test.runTests().then(results => {
  console.log('\n📄 Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
