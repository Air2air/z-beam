// Predeploy Vercel Optimization Checker with Auto-Fix Loop
console.log('🚀 PREDEPLOY VERCEL OPTIMIZATION');
console.log('===============================\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PredeployVercelChecker {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.maxAttempts = 3;
    this.targetScore = 16; // Out of 20 (80% minimum for deployment)
    this.perfectScore = 20;
    this.currentAttempt = 0;
    this.appliedFixes = [];
  }

  async runPredeployCheck() {
    console.log('🎯 Starting predeploy optimization check...');
    console.log(`📊 Target: ${this.targetScore}/${this.perfectScore} (${Math.round((this.targetScore/this.perfectScore)*100)}% minimum)\n`);

    for (this.currentAttempt = 1; this.currentAttempt <= this.maxAttempts; this.currentAttempt++) {
      console.log(`🔄 Optimization Attempt ${this.currentAttempt}/${this.maxAttempts}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Run Vercel optimization test
      const result = await this.runVercelOptimizationTest();
      
      if (result.score >= this.perfectScore) {
        console.log(`\n🎉 PERFECT SCORE ACHIEVED! ${result.score}/${this.perfectScore} (100%)`);
        return this.generateSuccessReport(result);
      } else if (result.score >= this.targetScore) {
        console.log(`\n✅ DEPLOYMENT READY! Score: ${result.score}/${this.perfectScore} (${Math.round((result.score/this.perfectScore)*100)}%)`);
        return this.generateSuccessReport(result);
      } else {
        console.log(`\n⚠️  Score below target: ${result.score}/${this.perfectScore} (${Math.round((result.score/this.perfectScore)*100)}%)`);
        
        if (this.currentAttempt < this.maxAttempts) {
          console.log('🔧 Applying additional optimizations...\n');
          await this.applyAdditionalOptimizations(result);
        } else {
          console.log('❌ Maximum attempts reached');
          return this.generateFailureReport(result);
        }
      }
    }
  }

  async runVercelOptimizationTest() {
    try {
      const output = execSync('node tests/test-vercel-optimization.js', {
        encoding: 'utf8',
        cwd: this.workspaceRoot,
        timeout: 60000
      });

      // Parse the output to extract score
      const scoreMatch = output.match(/Optimization Score: (\d+)\/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const maxScore = scoreMatch ? parseInt(scoreMatch[2]) : 20;

      // Extract recommendations
      const recommendations = this.extractRecommendations(output);

      return {
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
        output,
        recommendations,
        success: true
      };
    } catch (error) {
      console.log('❌ Vercel optimization test failed');
      return {
        score: 0,
        maxScore: 20,
        percentage: 0,
        error: error.message,
        success: false
      };
    }
  }

  extractRecommendations(output) {
    const recommendations = [];
    const lines = output.split('\n');
    let inRecommendations = false;

    for (const line of lines) {
      if (line.includes('💡 Recommendations:')) {
        inRecommendations = true;
        continue;
      }
      if (inRecommendations && line.trim().startsWith('•')) {
        recommendations.push(line.trim().substring(1).trim());
      }
      if (inRecommendations && line.trim() === '') {
        break;
      }
    }

    return recommendations;
  }

  async applyAdditionalOptimizations(result) {
    const fixes = [];

    // Fix 1: Ensure SWC minification is properly configured
    if (result.recommendations.some(r => r.includes('SWC Minification'))) {
      await this.ensureSWCMinification();
      fixes.push('SWC Minification configuration');
    }

    // Fix 2: Add missing analyze script
    if (result.recommendations.some(r => r.includes('analyze'))) {
      await this.addAnalyzeScript();
      fixes.push('Bundle analysis scripts');
    }

    // Fix 3: Optimize TypeScript configuration
    if (result.recommendations.some(r => r.includes('TypeScript'))) {
      await this.optimizeTypeScriptConfig();
      fixes.push('TypeScript configuration');
    }

    // Fix 4: Add performance optimization headers
    await this.addPerformanceHeaders();
    fixes.push('Performance headers');

    // Fix 5: Optimize bundle splitting
    await this.optimizeBundleSplitting();
    fixes.push('Bundle splitting optimization');

    this.appliedFixes.push(...fixes);

    if (fixes.length > 0) {
      console.log('🔧 Applied fixes:');
      fixes.forEach(fix => console.log(`   ✅ ${fix}`));
    } else {
      console.log('⚠️  No additional fixes available');
    }
  }

  async ensureSWCMinification() {
    const nextConfigPath = path.join(this.workspaceRoot, 'next.config.js');
    
    if (fs.existsSync(nextConfigPath)) {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Add swcMinify if not present (modern Next.js uses SWC by default)
      if (!content.includes('swcMinify')) {
        content = content.replace(
          'reactStrictMode: true,',
          'reactStrictMode: true,\n  swcMinify: true,'
        );
        fs.writeFileSync(nextConfigPath, content);
        console.log('    ✅ Added SWC minification to Next.js config');
      }
    }
  }

  async addAnalyzeScript() {
    const packagePath = path.join(this.workspaceRoot, 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (!packageData.scripts.analyze) {
      packageData.scripts.analyze = 'cross-env ANALYZE=true next build';
      fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
      console.log('    ✅ Added bundle analyze script');
    }
  }

  async optimizeTypeScriptConfig() {
    const tsconfigPath = path.join(this.workspaceRoot, 'tsconfig.json');
    
    if (fs.existsSync(tsconfigPath)) {
      try {
        let content = fs.readFileSync(tsconfigPath, 'utf8');
        
        // For TypeScript optimization, we'll create a production-specific config
        const prodTsConfig = {
          extends: './tsconfig.json',
          compilerOptions: {
            removeComments: true,
            sourceMap: false,
            declaration: false,
            noUnusedLocals: false, // Keep false to avoid breaking builds
            noUnusedParameters: false, // Keep false to avoid breaking builds
          },
          exclude: ['**/*.test.ts', '**/*.test.tsx', 'tests/**/*']
        };

        const prodConfigPath = path.join(this.workspaceRoot, 'tsconfig.prod.json');
        fs.writeFileSync(prodConfigPath, JSON.stringify(prodTsConfig, null, 2));
        console.log('    ✅ Created production TypeScript configuration');
      } catch (error) {
        console.log('    ⚠️  TypeScript config optimization skipped (parsing error)');
      }
    }
  }

  async addPerformanceHeaders() {
    const nextConfigPath = path.join(this.workspaceRoot, 'next.config.js');
    
    if (fs.existsSync(nextConfigPath)) {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Add additional performance headers if not present
      if (!content.includes('X-DNS-Prefetch-Control')) {
        const additionalHeaders = `
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },`;

        content = content.replace(
          "key: 'Referrer-Policy',",
          additionalHeaders + "\n          {\n            key: 'Referrer-Policy',"
        );

        fs.writeFileSync(nextConfigPath, content);
        console.log('    ✅ Added additional performance headers');
      }
    }
  }

  async optimizeBundleSplitting() {
    const nextConfigPath = path.join(this.workspaceRoot, 'next.config.js');
    
    if (fs.existsSync(nextConfigPath)) {
      let content = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Enhance webpack configuration for better splitting
      if (!content.includes('maxSize')) {
        const enhancedSplitting = `
          config.optimization.splitChunks.cacheGroups.vendor.maxSize = 244000; // 244KB
          config.optimization.splitChunks.cacheGroups.common.maxSize = 244000; // 244KB
          
          // Framework chunk optimization
          config.optimization.splitChunks.cacheGroups.framework = {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\\\/]node_modules[\\\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\\\/]/,
            priority: 40,
            enforce: true,
          };`;

        content = content.replace(
          'return config;',
          enhancedSplitting + '\n    \n    return config;'
        );

        fs.writeFileSync(nextConfigPath, content);
        console.log('    ✅ Enhanced bundle splitting configuration');
      }
    }
  }

  generateSuccessReport(result) {
    console.log('\n🎉 PREDEPLOY OPTIMIZATION SUCCESS!');
    console.log('=================================\n');

    console.log(`🏆 Final Score: ${result.score}/${result.maxScore} (${result.percentage}%)`);
    console.log(`🔄 Attempts Used: ${this.currentAttempt}/${this.maxAttempts}`);
    console.log(`🔧 Fixes Applied: ${this.appliedFixes.length}`);

    if (this.appliedFixes.length > 0) {
      console.log('\n✅ Applied Optimizations:');
      this.appliedFixes.forEach(fix => console.log(`   • ${fix}`));
    }

    console.log('\n🚀 READY FOR DEPLOYMENT!');

    // Save success report
    const report = {
      status: 'SUCCESS',
      finalScore: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      attempts: this.currentAttempt,
      fixesApplied: this.appliedFixes,
      timestamp: new Date().toISOString(),
      deploymentReady: true
    };

    fs.writeFileSync(
      path.join(__dirname, 'predeploy-success-report.json'),
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  generateFailureReport(result) {
    console.log('\n❌ PREDEPLOY OPTIMIZATION FAILED');
    console.log('================================\n');

    console.log(`💔 Final Score: ${result.score}/${result.maxScore} (${result.percentage}%)`);
    console.log(`🎯 Target Score: ${this.targetScore}/${this.perfectScore} (${Math.round((this.targetScore/this.perfectScore)*100)}%)`);
    console.log(`🔄 Attempts Used: ${this.maxAttempts}/${this.maxAttempts}`);
    console.log(`🔧 Fixes Applied: ${this.appliedFixes.length}`);

    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n📋 Remaining Issues:');
      result.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    if (this.appliedFixes.length > 0) {
      console.log('\n✅ Fixes Applied:');
      this.appliedFixes.forEach(fix => console.log(`   • ${fix}`));
    }

    console.log('\n🚫 DEPLOYMENT BLOCKED - Manual intervention required');
    console.log('💡 Review the remaining issues and apply fixes manually');

    // Save failure report
    const report = {
      status: 'FAILED',
      finalScore: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      targetScore: this.targetScore,
      attempts: this.maxAttempts,
      fixesApplied: this.appliedFixes,
      remainingIssues: result.recommendations || [],
      timestamp: new Date().toISOString(),
      deploymentReady: false
    };

    fs.writeFileSync(
      path.join(__dirname, 'predeploy-failure-report.json'),
      JSON.stringify(report, null, 2)
    );

    return report;
  }
}

// Main execution
async function main() {
  const checker = new PredeployVercelChecker();

  try {
    const result = await checker.runPredeployCheck();

    if (result.deploymentReady) {
      console.log('\n✅ Predeploy check completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Predeploy check failed - deployment blocked');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Predeploy check crashed:', error.message);
    process.exit(1);
  }
}

main();
