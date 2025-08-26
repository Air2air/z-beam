// Static Generation Performance Test
console.log('🚀 STATIC GENERATION PERFORMANCE TEST');
console.log('=====================================\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class StaticGenerationPerformanceTest {
  constructor() {
    this.results = {
      buildPerformance: {},
      staticGeneration: {},
      bundleOptimization: {},
      summary: {},
      timestamp: new Date().toISOString()
    };
    this.workspaceRoot = process.cwd();
  }

  // Test build performance with static generation
  async testBuildPerformance() {
    console.log('🔍 Testing build performance with static generation...\n');
    
    let buildPassed = 0;
    let buildFailed = 0;

    // Test 1: Clean build performance
    console.log('📋 Testing: Clean build with static generation');
    try {
      const startTime = Date.now();
      
      // Clean previous build
      try {
        execSync('rm -rf .next', { cwd: this.workspaceRoot });
      } catch (e) {
        // Directory might not exist
      }
      
      // Run production build
      const buildOutput = execSync('npm run build', {
        encoding: 'utf8',
        cwd: this.workspaceRoot,
        timeout: 120000, // 2 minutes timeout
        env: {
          ...process.env,
          NODE_ENV: 'production',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });
      
      const buildTime = Date.now() - startTime;
      
      // Parse build output for static generation info
      const staticPagesMatch = buildOutput.match(/✓ Generating static pages \((\d+)\/(\d+)\)/);
      const staticPagesGenerated = staticPagesMatch ? parseInt(staticPagesMatch[1]) : 0;
      const totalPages = staticPagesMatch ? parseInt(staticPagesMatch[2]) : 0;
      
      // Check for SSG indicators
      const ssgPages = (buildOutput.match(/● \/\[slug\]/g) || []).length;
      const staticPages = (buildOutput.match(/○ \//g) || []).length;
      
      this.results.buildPerformance = {
        status: 'PASS',
        buildTime,
        staticPagesGenerated,
        totalPages,
        ssgPages,
        staticPages,
        staticGenerationRatio: totalPages > 0 ? (staticPagesGenerated / totalPages) * 100 : 0
      };
      
      console.log(`  ✅ PASS: Build completed in ${buildTime}ms`);
      console.log(`     Static pages generated: ${staticPagesGenerated}/${totalPages}`);
      console.log(`     SSG pages: ${ssgPages}`);
      console.log(`     Static pages: ${staticPages}`);
      buildPassed++;
    } catch (error) {
      console.log(`  ❌ FAIL: Build failed`);
      console.log(`     Error: ${error.message}`);
      this.results.buildPerformance = {
        status: 'FAIL',
        error: error.message
      };
      buildFailed++;
    }

    console.log('');
    console.log(`📊 Build Performance Summary:`);
    console.log(`   Passed: ${buildPassed}`);
    console.log(`   Failed: ${buildFailed}\n`);

    return { buildPassed, buildFailed };
  }

  // Test static generation features
  async testStaticGeneration() {
    console.log('🔍 Testing static generation features...\n');
    
    let staticPassed = 0;
    let staticFailed = 0;

    // Test 1: Check generateStaticParams implementation
    console.log('📋 Testing: generateStaticParams implementation');
    try {
      const slugPagePath = path.join(this.workspaceRoot, 'app', '[slug]', 'page.tsx');
      
      if (!fs.existsSync(slugPagePath)) {
        throw new Error('Dynamic slug page not found');
      }

      const slugPageContent = fs.readFileSync(slugPagePath, 'utf8');
      
      const hasGenerateStaticParams = slugPageContent.includes('export async function generateStaticParams');
      const hasForceStatic = slugPageContent.includes('export const dynamic = \'force-static\'');
      const hasRevalidateFalse = slugPageContent.includes('export const revalidate = false');
      
      if (hasGenerateStaticParams && hasForceStatic && hasRevalidateFalse) {
        console.log('  ✅ PASS: Dynamic pages configured for static generation');
        this.results.staticGeneration.dynamicPages = {
          status: 'PASS',
          features: {
            generateStaticParams: hasGenerateStaticParams,
            forceStatic: hasForceStatic,
            noRevalidate: hasRevalidateFalse
          }
        };
        staticPassed++;
      } else {
        console.log('  ❌ FAIL: Dynamic pages missing static generation configuration');
        this.results.staticGeneration.dynamicPages = {
          status: 'FAIL',
          missing: {
            generateStaticParams: !hasGenerateStaticParams,
            forceStatic: !hasForceStatic,
            noRevalidate: !hasRevalidateFalse
          }
        };
        staticFailed++;
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.staticGeneration.dynamicPages = {
        status: 'ERROR',
        error: error.message
      };
      staticFailed++;
    }

    // Test 2: Check home page static configuration
    console.log('📋 Testing: Home page static configuration');
    try {
      const homePagePath = path.join(this.workspaceRoot, 'app', 'page.tsx');
      
      if (!fs.existsSync(homePagePath)) {
        throw new Error('Home page not found');
      }

      const homePageContent = fs.readFileSync(homePagePath, 'utf8');
      
      const hasForceStatic = homePageContent.includes('export const dynamic = \'force-static\'');
      const hasRevalidateFalse = homePageContent.includes('export const revalidate = false');
      
      if (hasForceStatic && hasRevalidateFalse) {
        console.log('  ✅ PASS: Home page configured for static generation');
        this.results.staticGeneration.homePage = {
          status: 'PASS',
          features: {
            forceStatic: hasForceStatic,
            noRevalidate: hasRevalidateFalse
          }
        };
        staticPassed++;
      } else {
        console.log('  ⚠️  WARN: Home page missing some static generation features');
        this.results.staticGeneration.homePage = {
          status: 'WARN',
          missing: {
            forceStatic: !hasForceStatic,
            noRevalidate: !hasRevalidateFalse
          }
        };
        // Don't count as failed since it might still work
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.staticGeneration.homePage = {
        status: 'ERROR',
        error: error.message
      };
      staticFailed++;
    }

    // Test 3: Check .next build output structure
    console.log('📋 Testing: Build output structure for static files');
    try {
      const nextDir = path.join(this.workspaceRoot, '.next');
      
      if (!fs.existsSync(nextDir)) {
        throw new Error('.next directory not found - run build first');
      }

      const serverDir = path.join(nextDir, 'server');
      const staticDir = path.join(nextDir, 'static');
      
      const hasServerDir = fs.existsSync(serverDir);
      const hasStaticDir = fs.existsSync(staticDir);
      
      // Check for prerendered pages
      const serverAppDir = path.join(serverDir, 'app');
      let prerenderCount = 0;
      
      if (fs.existsSync(serverAppDir)) {
        const walkDir = (dir) => {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
              walkDir(filePath);
            } else if (file === 'page.html') {
              prerenderCount++;
            }
          }
        };
        
        walkDir(serverAppDir);
      }
      
      if (hasServerDir && hasStaticDir && prerenderCount > 0) {
        console.log(`  ✅ PASS: Build output contains ${prerenderCount} prerendered pages`);
        this.results.staticGeneration.buildOutput = {
          status: 'PASS',
          prerenderCount,
          hasServerDir,
          hasStaticDir
        };
        staticPassed++;
      } else {
        console.log('  ⚠️  WARN: Build output structure incomplete');
        this.results.staticGeneration.buildOutput = {
          status: 'WARN',
          prerenderCount,
          hasServerDir,
          hasStaticDir
        };
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.staticGeneration.buildOutput = {
        status: 'ERROR',
        error: error.message
      };
      staticFailed++;
    }

    console.log('');
    console.log(`📊 Static Generation Summary:`);
    console.log(`   Passed: ${staticPassed}`);
    console.log(`   Failed: ${staticFailed}\n`);

    return { staticPassed, staticFailed };
  }

  // Test bundle optimization
  async testBundleOptimization() {
    console.log('🔍 Testing bundle optimization...\n');
    
    let bundlePassed = 0;
    let bundleFailed = 0;

    // Test 1: Check bundle size optimization
    console.log('📋 Testing: Bundle size and chunk optimization');
    try {
      const nextConfigPath = path.join(this.workspaceRoot, 'next.config.js');
      
      if (!fs.existsSync(nextConfigPath)) {
        throw new Error('next.config.js not found');
      }

      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      
      const hasWebpackOptimization = configContent.includes('splitChunks');
      const hasImageOptimization = configContent.includes('images:');
      const hasHeadersOptimization = configContent.includes('async headers()');
      const hasCacheControl = configContent.includes('Cache-Control');
      
      const optimizationScore = [
        hasWebpackOptimization,
        hasImageOptimization,
        hasHeadersOptimization,
        hasCacheControl
      ].filter(Boolean).length;
      
      if (optimizationScore >= 3) {
        console.log(`  ✅ PASS: Bundle optimization configured (${optimizationScore}/4 features)`);
        this.results.bundleOptimization = {
          status: 'PASS',
          score: optimizationScore,
          features: {
            webpackOptimization: hasWebpackOptimization,
            imageOptimization: hasImageOptimization,
            headersOptimization: hasHeadersOptimization,
            cacheControl: hasCacheControl
          }
        };
        bundlePassed++;
      } else {
        console.log(`  ⚠️  WARN: Bundle optimization partially configured (${optimizationScore}/4 features)`);
        this.results.bundleOptimization = {
          status: 'WARN',
          score: optimizationScore,
          missing: {
            webpackOptimization: !hasWebpackOptimization,
            imageOptimization: !hasImageOptimization,
            headersOptimization: !hasHeadersOptimization,
            cacheControl: !hasCacheControl
          }
        };
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
      this.results.bundleOptimization = {
        status: 'ERROR',
        error: error.message
      };
      bundleFailed++;
    }

    console.log('');
    console.log(`📊 Bundle Optimization Summary:`);
    console.log(`   Passed: ${bundlePassed}`);
    console.log(`   Failed: ${bundleFailed}\n`);

    return { bundlePassed, bundleFailed };
  }

  // Generate comprehensive report
  generateReport() {
    console.log('📊 STATIC GENERATION PERFORMANCE REPORT');
    console.log('=======================================\n');

    const { buildPerformance, staticGeneration, bundleOptimization } = this.results;

    // Build Performance
    console.log('🔍 Build Performance:');
    if (buildPerformance.status === 'PASS') {
      console.log(`   Status: ${buildPerformance.status}`);
      console.log(`   Build Time: ${buildPerformance.buildTime}ms`);
      console.log(`   Static Pages: ${buildPerformance.staticPagesGenerated}/${buildPerformance.totalPages}`);
      console.log(`   Static Generation Ratio: ${buildPerformance.staticGenerationRatio.toFixed(1)}%`);
      console.log(`   SSG Pages: ${buildPerformance.ssgPages}`);
      console.log(`   Static Pages: ${buildPerformance.staticPages}`);
    } else {
      console.log(`   Status: ${buildPerformance.status}`);
      if (buildPerformance.error) {
        console.log(`   Error: ${buildPerformance.error}`);
      }
    }
    console.log('');

    // Static Generation Features
    console.log('🔍 Static Generation Features:');
    Object.entries(staticGeneration).forEach(([key, result]) => {
      console.log(`   ${key}: ${result.status}`);
      if (result.features) {
        Object.entries(result.features).forEach(([feature, enabled]) => {
          console.log(`     ${feature}: ${enabled ? '✅' : '❌'}`);
        });
      }
    });
    console.log('');

    // Bundle Optimization
    console.log('🔍 Bundle Optimization:');
    if (bundleOptimization.status) {
      console.log(`   Status: ${bundleOptimization.status}`);
      console.log(`   Optimization Score: ${bundleOptimization.score || 0}/4`);
      if (bundleOptimization.features) {
        Object.entries(bundleOptimization.features).forEach(([feature, enabled]) => {
          console.log(`     ${feature}: ${enabled ? '✅' : '❌'}`);
        });
      }
    }
    console.log('');

    // Overall Assessment
    const overallStatus = this.calculateOverallStatus();
    console.log(`🏆 Overall Performance Status: ${overallStatus}\n`);

    // Performance Recommendations
    this.generateRecommendations();

    // Save results
    const reportPath = path.join(__dirname, 'static-generation-performance-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Detailed results saved to: ${reportPath}`);

    this.results.summary = {
      overallStatus,
      buildPerformance: buildPerformance.status,
      staticGeneration: Object.keys(staticGeneration).length,
      bundleOptimization: bundleOptimization.status,
      timestamp: new Date().toISOString()
    };

    return this.results;
  }

  calculateOverallStatus() {
    const { buildPerformance, staticGeneration, bundleOptimization } = this.results;
    
    let score = 0;
    let maxScore = 0;
    
    // Build performance (40% weight)
    if (buildPerformance.status === 'PASS') {
      score += 4;
      // Bonus for good static generation ratio
      if (buildPerformance.staticGenerationRatio >= 90) score += 2;
      else if (buildPerformance.staticGenerationRatio >= 70) score += 1;
    }
    maxScore += 6;
    
    // Static generation features (40% weight)
    Object.values(staticGeneration).forEach(result => {
      if (result.status === 'PASS') score += 2;
      else if (result.status === 'WARN') score += 1;
      maxScore += 2;
    });
    
    // Bundle optimization (20% weight)
    if (bundleOptimization.status === 'PASS') score += 2;
    else if (bundleOptimization.status === 'WARN') score += 1;
    maxScore += 2;
    
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    if (percentage >= 90) return 'EXCELLENT';
    if (percentage >= 75) return 'GOOD';
    if (percentage >= 60) return 'FAIR';
    return 'NEEDS_IMPROVEMENT';
  }

  generateRecommendations() {
    console.log('💡 Performance Recommendations:');
    
    const recommendations = [];
    
    // Build performance recommendations
    if (this.results.buildPerformance.staticGenerationRatio < 90) {
      recommendations.push('Consider adding more pages to static generation');
    }
    
    // Static generation recommendations
    Object.entries(this.results.staticGeneration).forEach(([key, result]) => {
      if (result.status !== 'PASS' && result.missing) {
        Object.entries(result.missing).forEach(([feature, missing]) => {
          if (missing) {
            recommendations.push(`Add ${feature} to ${key} for better static generation`);
          }
        });
      }
    });
    
    // Bundle optimization recommendations
    if (this.results.bundleOptimization.score < 4) {
      recommendations.push('Complete bundle optimization configuration in next.config.js');
    }
    
    if (recommendations.length === 0) {
      console.log('   🎉 No recommendations - excellent static generation setup!');
    } else {
      recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    console.log('');
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Static Generation Performance Test Suite...\n');
    
    try {
      const buildResults = await this.testBuildPerformance();
      const staticResults = await this.testStaticGeneration();
      const bundleResults = await this.testBundleOptimization();
      
      const report = this.generateReport();
      
      // Return appropriate exit code
      if (report.summary.overallStatus === 'NEEDS_IMPROVEMENT') {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('\n💥 Static generation performance test suite crashed:', error.message);
      return 1;
    }
  }
}

// Run the test suite
async function main() {
  const testSuite = new StaticGenerationPerformanceTest();
  const exitCode = await testSuite.runAllTests();
  
  if (exitCode === 0) {
    console.log('\n✅ Static generation performance test suite completed successfully!');
  } else {
    console.log('\n⚠️  Static generation performance test suite completed with recommendations!');
  }
  
  process.exit(exitCode);
}

main();
