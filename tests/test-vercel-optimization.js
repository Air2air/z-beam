// Vercel Best Practices Analyzer and Auto-Optimizer
console.log('🚀 VERCEL OPTIMIZATION ANALYZER');
console.log('===============================\n');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VercelOptimizer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.optimizations = {
      applied: [],
      recommendations: [],
      score: 0,
      maxScore: 20
    };
  }

  // Analyze and optimize Next.js configuration
  async optimizeNextConfig() {
    console.log('🔍 Analyzing Next.js configuration...');
    
    const nextConfigPath = path.join(this.workspaceRoot, 'next.config.js');
    
    if (!fs.existsSync(nextConfigPath)) {
      console.log('  ⚠️  next.config.js not found - creating optimized version');
      await this.createOptimizedNextConfig();
      this.optimizations.applied.push('Created optimized next.config.js');
      this.optimizations.score += 3;
    } else {
      console.log('  ✅ next.config.js found - checking optimizations');
      await this.analyzeExistingNextConfig();
    }
  }

  async createOptimizedNextConfig() {
    const optimizedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-icons', 'lodash', 'date-fns'],
  },
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    
    return config;
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Compression
  compress: true,
  
  // PoweredBy header removal
  poweredByHeader: false,
  
  // Trailing slash configuration
  trailingSlash: false,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || '',
  },
  
  // Output configuration for Vercel
  output: 'standalone',
};

module.exports = nextConfig;`;

    fs.writeFileSync(path.join(this.workspaceRoot, 'next.config.js'), optimizedConfig);
    console.log('    📁 Created optimized next.config.js');
  }

  async analyzeExistingNextConfig() {
    const configPath = path.join(this.workspaceRoot, 'next.config.js');
    const content = fs.readFileSync(configPath, 'utf8');
    
    const checks = [
      { key: 'reactStrictMode', points: 2, name: 'React Strict Mode' },
      { key: 'swcMinify', points: 2, name: 'SWC Minification' },
      { key: 'images', points: 3, name: 'Image Optimization' },
      { key: 'compress', points: 1, name: 'Compression' },
      { key: 'poweredByHeader: false', points: 1, name: 'Security Headers' },
      { key: 'experimental', points: 2, name: 'Experimental Features' }
    ];
    
    for (const check of checks) {
      if (content.includes(check.key)) {
        this.optimizations.score += check.points;
        console.log(`    ✅ ${check.name} configured`);
      } else {
        this.optimizations.recommendations.push(`Add ${check.name} configuration`);
        console.log(`    ⚠️  Missing: ${check.name}`);
      }
    }
  }

  // Optimize package.json for Vercel deployment
  async optimizePackageJson() {
    console.log('🔍 Optimizing package.json for Vercel...');
    
    const packagePath = path.join(this.workspaceRoot, 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    let modified = false;
    
    // Ensure required scripts
    const requiredScripts = {
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint'
    };
    
    for (const [script, command] of Object.entries(requiredScripts)) {
      if (!packageData.scripts[script]) {
        packageData.scripts[script] = command;
        modified = true;
        console.log(`    ✅ Added script: ${script}`);
      }
    }
    
    // Add Vercel-specific engines
    if (!packageData.engines) {
      packageData.engines = {};
      modified = true;
    }
    
    if (!packageData.engines.node) {
      packageData.engines.node = '>=18.0.0';
      modified = true;
      console.log('    ✅ Added Node.js engine requirement');
    }
    
    // Add performance-focused scripts
    const performanceScripts = {
      'analyze': 'cross-env ANALYZE=true next build',
      'build:analyze': 'npm run analyze',
      'build:production': 'NODE_ENV=production next build'
    };
    
    for (const [script, command] of Object.entries(performanceScripts)) {
      if (!packageData.scripts[script]) {
        packageData.scripts[script] = command;
        this.optimizations.recommendations.push(`Consider adding '${script}' script for analysis`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
      this.optimizations.applied.push('Optimized package.json for Vercel');
      this.optimizations.score += 2;
    }
  }

  // Create or optimize Vercel configuration
  async optimizeVercelConfig() {
    console.log('🔍 Creating Vercel configuration...');
    
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next'
        }
      ],
      routes: [
        {
          src: '/images/(.*)',
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        },
        {
          src: '/(.*)',
          dest: '/$1'
        }
      ],
      env: {
        NODE_ENV: 'production'
      },
      build: {
        env: {
          NODE_ENV: 'production'
        }
      },
      functions: {
        'app/api/**': {
          maxDuration: 30
        }
      }
    };
    
    const vercelPath = path.join(this.workspaceRoot, 'vercel.json');
    
    if (!fs.existsSync(vercelPath)) {
      fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
      console.log('    📁 Created vercel.json configuration');
      this.optimizations.applied.push('Created Vercel configuration');
      this.optimizations.score += 3;
    } else {
      console.log('    ✅ vercel.json already exists');
      this.optimizations.score += 1;
    }
  }

  // Analyze and optimize TypeScript configuration
  async optimizeTsConfig() {
    console.log('🔍 Optimizing TypeScript configuration...');
    
    const tsconfigPath = path.join(this.workspaceRoot, 'tsconfig.json');
    
    if (!fs.existsSync(tsconfigPath)) {
      console.log('    ⚠️  tsconfig.json not found');
      return;
    }
    
    try {
      // For TypeScript configuration, we'll validate it exists and is properly structured
      let content = fs.readFileSync(tsconfigPath, 'utf8');
      
      // Check for key production optimizations without parsing JSON with comments
      const hasIncremental = content.includes('"incremental": true');
      const hasSkipLibCheck = content.includes('"skipLibCheck": true');
      const hasStrict = content.includes('"strict"') || content.includes('"strictNullChecks": true');
      
      let score = 0;
      if (hasIncremental) {
        console.log('    ✅ Incremental compilation enabled');
        score += 1;
      }
      if (hasSkipLibCheck) {
        console.log('    ✅ Skip lib check enabled');
        score += 1;
      }
      if (hasStrict) {
        console.log('    ✅ Strict mode enabled');
        score += 1;
      }
      
      console.log(`    ✅ TypeScript configuration analyzed (${score}/3 optimizations found)`);
      this.optimizations.score += Math.min(score, 3); // Max 3 points for TypeScript
      
    } catch (error) {
      console.log(`    ❌ Failed to analyze tsconfig.json: ${error.message}`);
      this.optimizations.recommendations.push('Review TypeScript configuration manually');
    }
  }

  // Performance and security checks
  async runSecurityChecks() {
    console.log('🔍 Running security and performance checks...');
    
    const checks = [];
    
    // Check for security dependencies
    try {
      const packageData = JSON.parse(fs.readFileSync(path.join(this.workspaceRoot, 'package.json'), 'utf8'));
      
      // Check for security-related packages
      const securityPackages = ['helmet', '@vercel/analytics', '@vercel/speed-insights'];
      const hasSecurityPackages = securityPackages.some(pkg => 
        packageData.dependencies?.[pkg] || packageData.devDependencies?.[pkg]
      );
      
      if (hasSecurityPackages) {
        checks.push('✅ Security packages detected');
        this.optimizations.score += 1;
      } else {
        checks.push('⚠️  Consider adding security packages (@vercel/analytics, @vercel/speed-insights)');
        this.optimizations.recommendations.push('Add Vercel analytics and security packages');
      }
      
      // Check for performance monitoring
      if (packageData.dependencies?.['@vercel/speed-insights']) {
        checks.push('✅ Speed Insights configured');
        this.optimizations.score += 1;
      }
      
    } catch (error) {
      checks.push('❌ Could not analyze package.json');
    }
    
    // Check for environment variables
    const envExample = path.join(this.workspaceRoot, '.env.example');
    const envLocal = path.join(this.workspaceRoot, '.env.local');
    
    if (fs.existsSync(envExample)) {
      checks.push('✅ Environment variables template found');
      this.optimizations.score += 1;
    } else {
      checks.push('⚠️  Consider adding .env.example for environment documentation');
      this.optimizations.recommendations.push('Add .env.example file');
    }
    
    checks.forEach(check => console.log(`    ${check}`));
  }

  // Bundle analysis
  async analyzeBundleSize() {
    console.log('🔍 Analyzing bundle size optimization...');
    
    try {
      // Check if build exists
      const nextDir = path.join(this.workspaceRoot, '.next');
      if (!fs.existsSync(nextDir)) {
        console.log('    ⚠️  No build found - run npm run build first');
        return;
      }
      
      // Analyze static folder
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        const chunks = this.getAllFilesRecursive(staticDir)
          .filter(file => file.endsWith('.js'))
          .map(file => {
            const stat = fs.statSync(file);
            return {
              file: path.basename(file),
              size: stat.size
            };
          });
        
        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
        const totalSizeKB = Math.round(totalSize / 1024);
        
        console.log(`    📊 Total bundle size: ${totalSizeKB}KB`);
        console.log(`    📊 Chunk count: ${chunks.length}`);
        
        // Score based on bundle size
        if (totalSizeKB < 500) {
          this.optimizations.score += 3;
          console.log('    ✅ Excellent bundle size');
        } else if (totalSizeKB < 1000) {
          this.optimizations.score += 2;
          console.log('    ✅ Good bundle size');
        } else {
          this.optimizations.score += 1;
          console.log('    ⚠️  Large bundle size - consider optimization');
          this.optimizations.recommendations.push('Optimize bundle size with code splitting');
        }
      }
    } catch (error) {
      console.log('    ❌ Bundle analysis failed');
    }
  }

  // Helper method
  getAllFilesRecursive(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Main optimization runner
  async runOptimizations() {
    console.log('🚀 Running Vercel optimization suite...\n');
    
    await this.optimizeNextConfig();
    await this.optimizePackageJson();
    await this.optimizeVercelConfig();
    await this.optimizeTsConfig();
    await this.runSecurityChecks();
    await this.analyzeBundleSize();
    
    return this.generateOptimizationReport();
  }

  generateOptimizationReport() {
    console.log('\n📊 VERCEL OPTIMIZATION REPORT');
    console.log('=============================\n');
    
    // Calculate percentage score
    const percentage = Math.round((this.optimizations.score / this.optimizations.maxScore) * 100);
    
    console.log(`🏆 Optimization Score: ${this.optimizations.score}/${this.optimizations.maxScore} (${percentage}%)`);
    console.log('');
    
    // Applied optimizations
    if (this.optimizations.applied.length > 0) {
      console.log('✅ Applied Optimizations:');
      this.optimizations.applied.forEach(opt => {
        console.log(`   • ${opt}`);
      });
      console.log('');
    }
    
    // Recommendations
    if (this.optimizations.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.optimizations.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
      console.log('');
    }
    
    // Grade assignment
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    
    console.log(`📈 Vercel Readiness Grade: ${grade}`);
    
    // Save report
    const report = {
      score: this.optimizations.score,
      maxScore: this.optimizations.maxScore,
      percentage,
      grade,
      applied: this.optimizations.applied,
      recommendations: this.optimizations.recommendations,
      timestamp: new Date().toISOString()
    };
    
    const reportPath = path.join(__dirname, 'vercel-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run Vercel optimization
async function main() {
  const optimizer = new VercelOptimizer();
  
  try {
    const report = await optimizer.runOptimizations();
    
    if (report.percentage >= 70) {
      console.log('\n✅ Vercel optimization completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Vercel optimization completed with recommendations');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Vercel optimization failed:', error.message);
    process.exit(1);
  }
}

main();
