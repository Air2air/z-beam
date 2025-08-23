// Dead File Cleanup Test Suite
console.log('🧹 DEAD FILE CLEANUP ANALYSIS');
console.log('============================\n');

const fs = require('fs');
const path = require('path');

// Configuration for cleanup analysis
const CLEANUP_CONFIG = {
  // File patterns to analyze
  patterns: {
    scripts: ['*.js', '*.ts', '*.tsx'],
    docs: ['*.md'],
    configs: ['*.json'],
    python: ['*.py'],
    shell: ['*.sh']
  },
  
  // Directories to exclude from analysis
  excludeDirs: [
    'node_modules',
    '.next',
    '.git',
    'archive',
    'css' // Generated CSS
  ],
  
  // Files that should be preserved (core functionality)
  protectedFiles: [
    'package.json',
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    'README.md'
  ],
  
  // Patterns for likely dead files
  deadFilePatterns: [
    /^debug-/,
    /-old\./,
    /-backup\./,
    /temp-/,
    /\.bak$/,
    /^test-author-.*\.js$/,  // Specific consolidated test files
    /^test-pattern\.js$/,
    /^test-comprehensive-evaluation\.js$/
  ],
  
  // Essential files that should NEVER be flagged
  essentialFiles: [
    'cleanup/test-suite-comprehensive.js',
    'cleanup/test-dead-file-cleanup.js',
    'cleanup/cleanup-dead-files.sh',
    'tests/test-layout-structure.js',
    'tests/test-sanitizer.js',
    'tests/test-yaml-errors.js'
  ]
};

class DeadFileAnalyzer {
  constructor() {
    this.allFiles = [];
    this.deadFiles = [];
    this.testFiles = [];
    this.debugFiles = [];
    this.documentationFiles = [];
    this.coreFiles = [];
  }

  // Recursively find all files
  findAllFiles(dir = '.', level = 0) {
    if (level > 5) return; // Prevent deep recursion
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative('.', fullPath);
        
        // Skip excluded directories
        if (CLEANUP_CONFIG.excludeDirs.some(excl => relativePath.includes(excl))) {
          return;
        }
        
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.findAllFiles(fullPath, level + 1);
        } else if (stat.isFile()) {
          this.allFiles.push(relativePath);
        }
      });
    } catch (error) {
      console.log(`⚠️  Could not read directory: ${dir}`);
    }
  }

  // Categorize files by type and usage
  categorizeFiles() {
    this.allFiles.forEach(file => {
      const fileName = path.basename(file);
      const ext = path.extname(file);
      
      // Check if it's a protected core file
      if (CLEANUP_CONFIG.protectedFiles.includes(fileName)) {
        this.coreFiles.push(file);
        return;
      }
      
      // Check for dead file patterns (but exclude essential files)
      const isEssential = CLEANUP_CONFIG.essentialFiles.includes(file) || 
                         CLEANUP_CONFIG.essentialFiles.includes(fileName);
      
      const isDead = !isEssential && CLEANUP_CONFIG.deadFilePatterns.some(pattern => 
        pattern.test(fileName)
      );
      
      if (isDead) {
        this.deadFiles.push(file);
      }
      
      // Categorize by type
      if (fileName.startsWith('test-') && ext === '.js') {
        this.testFiles.push(file);
      } else if (fileName.startsWith('debug-')) {
        this.debugFiles.push(file);
      } else if (ext === '.md' && !this.coreFiles.includes(file)) {
        this.documentationFiles.push(file);
      }
    });
  }

  // Analyze file dependencies (basic check)
  analyzeDependencies() {
    const dependencies = new Map();
    
    this.allFiles
      .filter(file => file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))
      .forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const imports = content.match(/(?:import|require)\s*\(?['"`]([^'"`]+)['"`]\)?/g) || [];
          dependencies.set(file, imports.length);
        } catch (error) {
          dependencies.set(file, 0);
        }
      });
    
    return dependencies;
  }

  // Generate cleanup recommendations
  generateRecommendations() {
    const recommendations = {
      safe: [],      // Files that are definitely safe to remove
      review: [],    // Files that need manual review
      keep: []       // Files that should be kept
    };

    // Safe to remove: clear dead file patterns (with additional safety check)
    this.deadFiles.forEach(file => {
      const fileName = path.basename(file);
      const isEssential = CLEANUP_CONFIG.essentialFiles.includes(file) || 
                         CLEANUP_CONFIG.essentialFiles.includes(fileName);
      
      if (!isEssential) {
        const size = this.getFileSize(file);
        recommendations.safe.push({
          file,
          reason: 'Matches dead file pattern',
          size
        });
      }
    });

    // Review: Test files (may want to consolidate) - but exclude essential ones
    this.testFiles.forEach(file => {
      const fileName = path.basename(file);
      const isEssential = CLEANUP_CONFIG.essentialFiles.includes(file) || 
                         CLEANUP_CONFIG.essentialFiles.includes(fileName);
      
      if (!isEssential) {
        const size = this.getFileSize(file);
        if (size === 0) {
          recommendations.safe.push({
            file,
            reason: 'Empty test file',
            size
          });
        } else {
          recommendations.review.push({
            file,
            reason: 'Test file - consider consolidation',
            size
          });
        }
      }
    });

    // Review: Debug files
    this.debugFiles.forEach(file => {
      const size = this.getFileSize(file);
      recommendations.review.push({
        file,
        reason: 'Debug file - may be temporary',
        size
      });
    });

    return recommendations;
  }

  // Get file size
  getFileSize(file) {
    try {
      return fs.statSync(file).size;
    } catch {
      return 0;
    }
  }

  // Run complete analysis
  runAnalysis() {
    console.log('🔍 Scanning for files...');
    this.findAllFiles();
    
    console.log('📊 Categorizing files...');
    this.categorizeFiles();
    
    console.log('🔗 Analyzing dependencies...');
    const dependencies = this.analyzeDependencies();
    
    console.log('💡 Generating recommendations...\n');
    const recommendations = this.generateRecommendations();
    
    return {
      stats: {
        total: this.allFiles.length,
        dead: this.deadFiles.length,
        test: this.testFiles.length,
        debug: this.debugFiles.length,
        docs: this.documentationFiles.length,
        core: this.coreFiles.length
      },
      recommendations,
      dependencies
    };
  }
}

// Execute analysis
const analyzer = new DeadFileAnalyzer();
const results = analyzer.runAnalysis();

// Display results
console.log('📈 FILE ANALYSIS RESULTS:');
console.log('========================');
console.log(`📁 Total files found: ${results.stats.total}`);
console.log(`💀 Dead files: ${results.stats.dead}`);
console.log(`🧪 Test files: ${results.stats.test}`);
console.log(`🐛 Debug files: ${results.stats.debug}`);
console.log(`📚 Documentation: ${results.stats.docs}`);
console.log(`⚡ Core files: ${results.stats.core}`);

console.log('\n🚨 SAFE TO REMOVE:');
console.log('==================');
if (results.recommendations.safe.length === 0) {
  console.log('✅ No files identified as safe to remove');
} else {
  results.recommendations.safe.forEach(item => {
    console.log(`🗑️  ${item.file} - ${item.reason} (${item.size} bytes)`);
  });
}

console.log('\n⚠️  REVIEW RECOMMENDED:');
console.log('======================');
if (results.recommendations.review.length === 0) {
  console.log('✅ No files need review');
} else {
  results.recommendations.review.forEach(item => {
    console.log(`👀 ${item.file} - ${item.reason} (${item.size} bytes)`);
  });
}

console.log('\n🎯 CLEANUP RECOMMENDATIONS:');
console.log('===========================');

// Calculate potential space savings
const safeBytes = results.recommendations.safe.reduce((sum, item) => sum + item.size, 0);
const reviewBytes = results.recommendations.review.reduce((sum, item) => sum + item.size, 0);

console.log(`💾 Safe removal would free: ${(safeBytes / 1024).toFixed(2)} KB`);
console.log(`🤔 Review items total: ${(reviewBytes / 1024).toFixed(2)} KB`);

console.log('\n📋 SUGGESTED ACTIONS:');
console.log('=====================');
console.log('1. Remove files marked as "safe to remove"');
console.log('2. Consolidate test files into organized test suites');
console.log('3. Archive or remove debug files no longer needed');
console.log('4. Update documentation to reflect current state');

console.log('\n✅ Dead file analysis complete!');

// Export results for potential automation
const outputFile = path.join(__dirname, 'cleanup-analysis.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log(`📄 Detailed results saved to: ${outputFile}`);
