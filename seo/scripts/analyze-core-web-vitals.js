#!/usr/bin/env node

/**
 * Core Web Vitals Analyzer
 * Advanced monitoring and optimization recommendations
 */

const fs = require('fs');
const path = require('path');

class CoreWebVitalsAnalyzer {
  constructor() {
    this.recommendations = [];
    this.issues = [];
    this.metrics = {
      lcp: { threshold: 2500, current: null },
      fid: { threshold: 100, current: null },
      cls: { threshold: 0.1, current: null },
      fcp: { threshold: 1800, current: null },
      ttfb: { threshold: 600, current: null }
    };
  }
  
  /**
   * Analyze Next.js config for CWV optimizations
   */
  analyzeNextConfig() {
    console.log('🔍 Analyzing Next.js configuration...\n');
    
    try {
      const configPath = './next.config.js';
      const config = fs.readFileSync(configPath, 'utf-8');
      
      // Check for image optimization
      if (!config.includes('images:') || !config.includes('loader:')) {
        this.issues.push({
          severity: 'medium',
          category: 'LCP',
          issue: 'Image optimization not fully configured',
          recommendation: 'Configure Next.js image loader and sizes'
        });
      }
      
      // Check for SWC minification
      if (!config.includes('swcMinify')) {
        this.recommendations.push({
          priority: 'high',
          category: 'FCP/LCP',
          recommendation: 'Enable SWC minification',
          code: "swcMinify: true"
        });
      }
      
      // Check for compression
      if (!config.includes('compress')) {
        this.recommendations.push({
          priority: 'high',
          category: 'TTFB',
          recommendation: 'Enable gzip/brotli compression',
          code: "compress: true"
        });
      }
      
      console.log('✅ Next.js config analyzed\n');
    } catch (e) {
      console.error('Error analyzing next.config.js:', e.message);
    }
  }
  
  /**
   * Analyze layout for performance optimizations
   */
  analyzeLayout() {
    console.log('🔍 Analyzing app layout...\n');
    
    try {
      const layoutPath = './app/layout.tsx';
      if (!fs.existsSync(layoutPath)) return;
      
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      
      // Check for preconnect hints
      if (!layout.includes('rel="preconnect"')) {
        this.recommendations.push({
          priority: 'high',
          category: 'TTFB/FCP',
          recommendation: 'Add preconnect hints for external domains',
          code: '<link rel="preconnect" href="https://fonts.googleapis.com" />'
        });
      }
      
      // Check for dns-prefetch
      if (!layout.includes('rel="dns-prefetch"')) {
        this.recommendations.push({
          priority: 'medium',
          category: 'TTFB',
          recommendation: 'Add DNS prefetch for external domains',
          code: '<link rel="dns-prefetch" href="https://fonts.gstatic.com" />'
        });
      }
      
      // Check for font optimization
      if (layout.includes('fonts.googleapis.com') && !layout.includes('&display=swap')) {
        this.issues.push({
          severity: 'medium',
          category: 'CLS',
          issue: 'Font loading not optimized',
          recommendation: 'Add font-display: swap or use next/font'
        });
      }
      
      // Check for critical CSS
      if (!layout.includes('<style') && !layout.includes('Critical CSS')) {
        this.recommendations.push({
          priority: 'high',
          category: 'FCP',
          recommendation: 'Inline critical CSS in <head>',
          details: 'Extract above-the-fold styles and inline them'
        });
      }
      
      console.log('✅ Layout analyzed\n');
    } catch (e) {
      console.error('Error analyzing layout:', e.message);
    }
  }
  
  /**
   * Analyze images for LCP optimization
   */
  analyzeImages() {
    console.log('🔍 Analyzing image usage...\n');
    
    const findings = {
      totalImages: 0,
      withPriority: 0,
      withSizes: 0,
      withAlt: 0
    };
    
    // Search for Image components
    this.searchFiles('./app', '.tsx', (content, file) => {
      const imageMatches = content.match(/<Image[^>]*>/g) || [];
      findings.totalImages += imageMatches.length;
      
      imageMatches.forEach(img => {
        if (img.includes('priority')) findings.withPriority++;
        if (img.includes('sizes=')) findings.withSizes++;
        if (img.includes('alt=')) findings.withAlt++;
      });
    });
    
    const priorityPercent = Math.round((findings.withPriority / findings.totalImages) * 100) || 0;
    const sizesPercent = Math.round((findings.withSizes / findings.totalImages) * 100) || 0;
    
    console.log(`   Total images: ${findings.totalImages}`);
    console.log(`   With priority: ${findings.withPriority} (${priorityPercent}%)`);
    console.log(`   With sizes: ${findings.withSizes} (${sizesPercent}%)`);
    
    if (priorityPercent < 50) {
      this.issues.push({
        severity: 'high',
        category: 'LCP',
        issue: 'Most images missing priority attribute',
        recommendation: 'Add priority attribute to above-fold images'
      });
    }
    
    if (sizesPercent < 70) {
      this.issues.push({
        severity: 'medium',
        category: 'LCP/CLS',
        issue: 'Most images missing sizes attribute',
        recommendation: 'Add sizes attribute for responsive images'
      });
    }
    
    console.log('✅ Images analyzed\n');
  }
  
  /**
   * Analyze JavaScript bundle size
   */
  analyzeBundleSize() {
    console.log('🔍 Analyzing bundle size...\n');
    
    const nextDir = './.next';
    if (!fs.existsSync(nextDir)) {
      console.log('⚠️  No .next directory found. Run npm run build first.\n');
      return;
    }
    
    // Check for large client bundles
    try {
      const staticDir = path.join(nextDir, 'static/chunks');
      if (fs.existsSync(staticDir)) {
        const files = fs.readdirSync(staticDir);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        let totalSize = 0;
        let largeFiles = [];
        
        jsFiles.forEach(file => {
          const filePath = path.join(staticDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          totalSize += sizeKB;
          
          if (sizeKB > 200) {
            largeFiles.push({ file, sizeKB });
          }
        });
        
        console.log(`   Total JS bundle: ${totalSize} KB`);
        console.log(`   Number of chunks: ${jsFiles.length}`);
        
        if (largeFiles.length > 0) {
          console.log(`\n   ⚠️  Large chunks found:`);
          largeFiles.forEach(({ file, sizeKB }) => {
            console.log(`      - ${file}: ${sizeKB} KB`);
          });
          
          this.issues.push({
            severity: 'high',
            category: 'FCP/TTI',
            issue: `${largeFiles.length} large JavaScript chunks (>200KB)`,
            recommendation: 'Consider code splitting and dynamic imports'
          });
        }
      }
    } catch (e) {
      console.error('Error analyzing bundle:', e.message);
    }
    
    console.log('✅ Bundle size analyzed\n');
  }
  
  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    console.log('📋 Generating recommendations...\n');
    
    // Resource hints
    this.recommendations.push({
      priority: 'critical',
      category: 'LCP',
      recommendation: 'Add preload hints for critical resources',
      code: `
// In app/layout.tsx
<link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
<link rel="preload" href="/images/hero.webp" as="image" />
      `.trim()
    });
    
    // Critical CSS
    this.recommendations.push({
      priority: 'critical',
      category: 'FCP',
      recommendation: 'Inline critical CSS',
      code: `
// Extract critical CSS and inline in <head>
<style dangerouslySetInnerHTML={{
  __html: \`
    /* Critical above-fold styles */
    body { margin: 0; font-family: system-ui; }
    .header { /* ... */ }
  \`
}} />
      `.trim()
    });
    
    // Image optimization
    this.recommendations.push({
      priority: 'high',
      category: 'LCP/CLS',
      recommendation: 'Optimize hero images',
      code: `
// Add to hero images
<Image 
  src="/hero.webp"
  alt="Hero image"
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
  width={1200}
  height={600}
/>
      `.trim()
    });
    
    // Layout shift prevention
    this.recommendations.push({
      priority: 'high',
      category: 'CLS',
      recommendation: 'Reserve space for dynamic content',
      code: `
// Add min-height to prevent layout shift
<div style={{ minHeight: '300px' }}>
  {/* Dynamic content */}
</div>
      `.trim()
    });
    
    // Lazy loading
    this.recommendations.push({
      priority: 'medium',
      category: 'FCP/TTI',
      recommendation: 'Lazy load below-fold components',
      code: `
// Use dynamic imports
const BelowFoldComponent = dynamic(() => import('./BelowFoldComponent'), {
  loading: () => <div>Loading...</div>
});
      `.trim()
    });
  }
  
  /**
   * Search files recursively
   */
  searchFiles(dir, extension, callback) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.searchFiles(filePath, extension, callback);
      } else if (file.endsWith(extension)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        callback(content, filePath);
      }
    });
  }
  
  /**
   * Print comprehensive report
   */
  printReport() {
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 Core Web Vitals Analysis Report\n');
    console.log('═'.repeat(70));
    
    // Issues
    if (this.issues.length > 0) {
      console.log('\n🚨 Issues Found:\n');
      this.issues.forEach((issue, i) => {
        const icon = issue.severity === 'high' ? '🔴' : '🟡';
        console.log(`${icon} ${i + 1}. [${issue.category}] ${issue.issue}`);
        console.log(`   💡 ${issue.recommendation}\n`);
      });
    }
    
    // Recommendations
    if (this.recommendations.length > 0) {
      console.log('\n✨ Optimization Recommendations:\n');
      
      const critical = this.recommendations.filter(r => r.priority === 'critical');
      const high = this.recommendations.filter(r => r.priority === 'high');
      const medium = this.recommendations.filter(r => r.priority === 'medium');
      
      if (critical.length > 0) {
        console.log('🔥 CRITICAL:');
        critical.forEach(rec => this.printRecommendation(rec));
      }
      
      if (high.length > 0) {
        console.log('\n⚠️  HIGH PRIORITY:');
        high.forEach(rec => this.printRecommendation(rec));
      }
      
      if (medium.length > 0) {
        console.log('\n📌 MEDIUM PRIORITY:');
        medium.forEach(rec => this.printRecommendation(rec));
      }
    }
    
    console.log('\n' + '═'.repeat(70) + '\n');
  }
  
  /**
   * Print single recommendation
   */
  printRecommendation(rec) {
    console.log(`\n   [${rec.category}] ${rec.recommendation}`);
    if (rec.code) {
      console.log(`   \`\`\`\n${rec.code}\n   \`\`\``);
    }
    if (rec.details) {
      console.log(`   ${rec.details}`);
    }
  }
  
  /**
   * Save report to file
   */
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      recommendations: this.recommendations,
      summary: {
        totalIssues: this.issues.length,
        highSeverity: this.issues.filter(i => i.severity === 'high').length,
        mediumSeverity: this.issues.filter(i => i.severity === 'medium').length,
        totalRecommendations: this.recommendations.length
      }
    };
    
    const outputPath = './seo/analysis/core-web-vitals-report.json';
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log(`📁 Report saved to: ${outputPath}\n`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n⚡ Core Web Vitals Analyzer\n');
  
  const analyzer = new CoreWebVitalsAnalyzer();
  
  analyzer.analyzeNextConfig();
  analyzer.analyzeLayout();
  analyzer.analyzeImages();
  analyzer.analyzeBundleSize();
  analyzer.generateRecommendations();
  
  analyzer.printReport();
  analyzer.saveReport();
}

main().catch(console.error);
