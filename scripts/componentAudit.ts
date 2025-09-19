// scripts/componentAudit.ts
// GROK-Compliant Component Consolidation Audit System
// Analyzes component duplication and provides surgical optimization recommendations

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../app/utils/logger';
import { ConfigurationError } from '../app/utils/errorSystem';

interface ComponentAnalysis {
  name: string;
  path: string;
  size: number;
  exports: string[];
  imports: string[];
  dependencies: string[];
  patterns: {
    isPageComponent: boolean;
    isUtilityComponent: boolean;
    isLayoutComponent: boolean;
    hasServerSideCode: boolean;
    hasClientSideCode: boolean;
  };
  duplicateRisk: {
    score: number;
    reasons: string[];
    similarComponents: string[];
  };
}

interface ConsolidationRecommendation {
  type: 'merge' | 'extract' | 'relocate' | 'optimize';
  priority: 'high' | 'medium' | 'low';
  components: string[];
  description: string;
  benefits: string[];
  risks: string[];
  effort: 'minimal' | 'moderate' | 'significant';
}

class ComponentAuditor {
  private readonly workspaceRoot: string;
  private readonly componentDirs: string[];
  private components: ComponentAnalysis[] = [];
  private recommendations: ConsolidationRecommendation[] = [];

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.componentDirs = [
      'app/components',
      'app/pages',
      'app/[slug]',
      'app/about',
      'app/contact',
      'app/property',
      'app/search',
      'app/services',
      'app/tag',
      'app/test-range',
      'pages',
      'components' // Legacy components
    ];
  }

  // Main audit function (fail-fast approach)
  async performAudit(): Promise<{
    summary: {
      totalComponents: number;
      duplicateRisk: number;
      optimizationOpportunities: number;
      estimatedSavings: string;
    };
    components: ComponentAnalysis[];
    recommendations: ConsolidationRecommendation[];
  }> {
    const startTime = performance.now();
    
    try {
      logger.info('Starting component consolidation audit');

      // 1. Discover and analyze all components
      await this.discoverComponents();
      
      // 2. Analyze each component for patterns and duplication
      await this.analyzeComponents();
      
      // 3. Generate consolidation recommendations
      this.generateRecommendations();
      
      // 4. Calculate impact summary
      const summary = this.calculateSummary();

      const auditTime = performance.now() - startTime;
      logger.performance('Component audit completed', auditTime, {
        totalComponents: this.components.length,
        recommendations: this.recommendations.length
      });

      return {
        summary,
        components: this.components,
        recommendations: this.recommendations
      };

    } catch (error) {
      throw new ConfigurationError(
        `Component audit failed: ${error}`,
        { 
          workspaceRoot: this.workspaceRoot,
          componentDirs: this.componentDirs,
          auditTime: performance.now() - startTime
        }
      );
    }
  }

  // Discover all component files in the workspace
  private async discoverComponents(): Promise<void> {
    const componentFiles: string[] = [];

    for (const dir of this.componentDirs) {
      const fullDirPath = path.join(this.workspaceRoot, dir);
      
      if (fs.existsSync(fullDirPath)) {
        const files = await this.findComponentFiles(fullDirPath);
        componentFiles.push(...files);
      }
    }

    logger.info(`Discovered ${componentFiles.length} component files`, {
      directories: this.componentDirs.filter(dir => 
        fs.existsSync(path.join(this.workspaceRoot, dir))
      ).length
    });

    // Initialize component analysis objects
    this.components = componentFiles.map(filePath => ({
      name: this.getComponentName(filePath),
      path: path.relative(this.workspaceRoot, filePath),
      size: 0,
      exports: [],
      imports: [],
      dependencies: [],
      patterns: {
        isPageComponent: false,
        isUtilityComponent: false,
        isLayoutComponent: false,
        hasServerSideCode: false,
        hasClientSideCode: false
      },
      duplicateRisk: {
        score: 0,
        reasons: [],
        similarComponents: []
      }
    }));
  }

  // Find all component files recursively
  private async findComponentFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other build directories
          if (!['node_modules', '.next', '.git', 'coverage'].includes(entry.name)) {
            const subFiles = await this.findComponentFiles(fullPath);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          // Include TypeScript and JavaScript component files
          if (/\.(tsx?|jsx?)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to read directory: ${dirPath}`, { error });
    }
    
    return files;
  }

  // Extract component name from file path
  private getComponentName(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    
    // Handle special Next.js file names
    if (basename === 'page') return `Page_${path.basename(path.dirname(filePath))}`;
    if (basename === 'layout') return `Layout_${path.basename(path.dirname(filePath))}`;
    if (basename === 'loading') return `Loading_${path.basename(path.dirname(filePath))}`;
    if (basename === 'error') return `Error_${path.basename(path.dirname(filePath))}`;
    if (basename === 'not-found') return 'NotFound';
    
    return basename;
  }

  // Analyze each component for patterns and duplication risks
  private async analyzeComponents(): Promise<void> {
    for (const component of this.components) {
      try {
        const fullPath = path.join(this.workspaceRoot, component.path);
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Basic file analysis
        component.size = content.length;
        
        // Pattern analysis
        this.analyzeComponentPatterns(component, content);
        
        // Import/export analysis
        this.analyzeImportsExports(component, content);
        
        // Duplication risk analysis
        this.analyzeDuplicationRisk(component, content);
        
      } catch (error) {
        logger.warn(`Failed to analyze component: ${component.path}`, { error });
      }
    }
  }

  // Analyze component patterns and classification
  private analyzeComponentPatterns(component: ComponentAnalysis, content: string): void {
    const { patterns } = component;
    
    // Page component detection
    patterns.isPageComponent = /export\s+default\s+/.test(content) && 
                              (component.path.includes('/page.') || 
                               component.path.includes('/pages/'));
    
    // Layout component detection
    patterns.isLayoutComponent = /layout|header|footer|sidebar/i.test(component.name) ||
                                component.path.includes('/layout.');
    
    // Utility component detection
    patterns.isUtilityComponent = /button|input|modal|card|badge|tag/i.test(component.name) ||
                                 component.size < 1000; // Small components likely utilities
    
    // Server-side code detection
    patterns.hasServerSideCode = /getServerSideProps|getStaticProps|getStaticPaths|cookies\(\)|headers\(\)/.test(content);
    
    // Client-side code detection
    patterns.hasClientSideCode = /'use client'|useEffect|useState|useCallback|useMemo|addEventListener/.test(content);
  }

  // Analyze imports and exports
  private analyzeImportsExports(component: ComponentAnalysis, content: string): void {
    // Extract imports
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    component.imports = importMatches.map(imp => {
      const match = imp.match(/from\s+['"]([^'"]+)['"]/);
      return match ? match[1] : '';
    }).filter(Boolean);
    
    // Extract exports
    const exportMatches = content.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g) || [];
    component.exports = exportMatches.map(exp => {
      const match = exp.match(/(?:function|class|const|let|var)\s+(\w+)/);
      return match ? match[1] : '';
    }).filter(Boolean);
    
    // Track dependencies
    component.dependencies = component.imports.filter(imp => 
      imp.startsWith('./') || imp.startsWith('../') || imp.startsWith('@/')
    );
  }

  // Analyze duplication risk
  private analyzeDuplicationRisk(component: ComponentAnalysis, content: string): void {
    let score = 0;
    const reasons: string[] = [];
    
    // Check for common utility patterns that might be duplicated
    if (/interface\s+\w*Props/.test(content)) {
      score += 1;
      reasons.push('Defines prop interfaces (potential for standardization)');
    }
    
    if (/const\s+\w+\s*=\s*styled/.test(content)) {
      score += 2;
      reasons.push('Uses styled-components (potential for shared styles)');
    }
    
    if (/className.*=.*`/.test(content) || /className.*=.*".*\s.*"/.test(content)) {
      score += 1;
      reasons.push('Complex className usage (potential for CSS consolidation)');
    }
    
    if (component.imports.length > 10) {
      score += 2;
      reasons.push('High import count (potential for dependency consolidation)');
    }
    
    if (component.size > 5000) {
      score += 3;
      reasons.push('Large component size (potential for splitting)');
    }
    
    // Check for similar function names across components
    const functionMatches = content.match(/(?:function|const)\s+(\w+)/g) || [];
    const functions = functionMatches.map(match => {
      const result = match.match(/(?:function|const)\s+(\w+)/);
      return result ? result[1] : '';
    }).filter(Boolean);
    
    const commonFunctionNames = ['handleClick', 'handleSubmit', 'handleChange', 'onClick', 'onSubmit'];
    const hasCommonPatterns = functions.some(func => 
      commonFunctionNames.some(common => func.toLowerCase().includes(common.toLowerCase()))
    );
    
    if (hasCommonPatterns) {
      score += 1;
      reasons.push('Uses common function naming patterns');
    }
    
    component.duplicateRisk = { score, reasons, similarComponents: [] };
  }

  // Generate consolidation recommendations
  private generateRecommendations(): void {
    // 1. Find components with high duplication risk
    const highRiskComponents = this.components.filter(c => c.duplicateRisk.score >= 4);
    
    if (highRiskComponents.length > 0) {
      this.recommendations.push({
        type: 'extract',
        priority: 'high',
        components: highRiskComponents.map(c => c.name),
        description: 'Extract common patterns from high-risk components into shared utilities',
        benefits: [
          'Reduced code duplication',
          'Improved maintainability',
          'Consistent behavior across components'
        ],
        risks: [
          'Requires careful testing to ensure no regressions',
          'May introduce breaking changes if not done carefully'
        ],
        effort: 'moderate'
      });
    }
    
    // 2. Find utility components that could be consolidated
    const utilityComponents = this.components.filter(c => c.patterns.isUtilityComponent);
    const groupedUtilities = this.groupSimilarComponents(utilityComponents);
    
    for (const [pattern, components] of Object.entries(groupedUtilities)) {
      if (components.length > 1) {
        this.recommendations.push({
          type: 'merge',
          priority: 'medium',
          components: components.map(c => c.name),
          description: `Consolidate similar ${pattern} components into a single, configurable component`,
          benefits: [
            'Reduced bundle size',
            'Easier maintenance',
            'Consistent styling and behavior'
          ],
          risks: [
            'May require prop interface changes',
            'Testing overhead for combined functionality'
          ],
          effort: 'minimal'
        });
      }
    }
    
    // 3. Find large components that should be split
    const largeComponents = this.components.filter(c => c.size > 8000);
    
    if (largeComponents.length > 0) {
      this.recommendations.push({
        type: 'extract',
        priority: 'medium',
        components: largeComponents.map(c => c.name),
        description: 'Split large components into smaller, focused components',
        benefits: [
          'Improved code readability',
          'Better testability',
          'Enhanced reusability'
        ],
        risks: [
          'May complicate component hierarchy',
          'Requires careful state management'
        ],
        effort: 'significant'
      });
    }
    
    // 4. Find components in wrong locations
    const misplacedComponents = this.components.filter(c => 
      c.patterns.isUtilityComponent && !c.path.includes('/components/')
    );
    
    if (misplacedComponents.length > 0) {
      this.recommendations.push({
        type: 'relocate',
        priority: 'low',
        components: misplacedComponents.map(c => c.name),
        description: 'Move utility components to appropriate directories',
        benefits: [
          'Better project organization',
          'Improved discoverability',
          'Clearer component hierarchy'
        ],
        risks: [
          'Requires updating import paths',
          'May break existing imports'
        ],
        effort: 'minimal'
      });
    }
  }

  // Group similar components by pattern
  private groupSimilarComponents(components: ComponentAnalysis[]): Record<string, ComponentAnalysis[]> {
    const groups: Record<string, ComponentAnalysis[]> = {};
    
    const patterns = ['button', 'input', 'card', 'modal', 'badge', 'tag', 'form'];
    
    for (const pattern of patterns) {
      groups[pattern] = components.filter(c => 
        c.name.toLowerCase().includes(pattern) ||
        c.path.toLowerCase().includes(pattern)
      );
    }
    
    return groups;
  }

  // Calculate audit summary
  private calculateSummary(): {
    totalComponents: number;
    duplicateRisk: number;
    optimizationOpportunities: number;
    estimatedSavings: string;
  } {
    const totalComponents = this.components.length;
    const highRiskComponents = this.components.filter(c => c.duplicateRisk.score >= 3).length;
    const duplicateRisk = totalComponents > 0 ? Math.round((highRiskComponents / totalComponents) * 100) : 0;
    
    const optimizationOpportunities = this.recommendations.filter(r => 
      r.priority === 'high' || r.priority === 'medium'
    ).length;
    
    // Estimate potential bundle size savings
    const totalSize = this.components.reduce((sum, c) => sum + c.size, 0);
    const potentialSavings = Math.round(totalSize * 0.15); // Estimate 15% savings
    const estimatedSavings = `${Math.round(potentialSavings / 1024)}KB`;
    
    return {
      totalComponents,
      duplicateRisk,
      optimizationOpportunities,
      estimatedSavings
    };
  }

  // Generate detailed audit report
  generateReport(): string {
    const summary = this.calculateSummary();
    
    let report = `# Component Consolidation Audit Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Components**: ${summary.totalComponents}
- **Duplication Risk**: ${summary.duplicateRisk}%
- **Optimization Opportunities**: ${summary.optimizationOpportunities}
- **Estimated Bundle Savings**: ${summary.estimatedSavings}

## High Priority Recommendations
`;

    const highPriorityRecs = this.recommendations.filter(r => r.priority === 'high');
    for (const rec of highPriorityRecs) {
      report += `
### ${rec.type.toUpperCase()}: ${rec.description}
- **Components**: ${rec.components.join(', ')}
- **Benefits**: ${rec.benefits.join(', ')}
- **Effort**: ${rec.effort}
`;
    }

    report += `
## Component Analysis Details
`;

    const highRiskComponents = this.components
      .filter(c => c.duplicateRisk.score >= 3)
      .sort((a, b) => b.duplicateRisk.score - a.duplicateRisk.score);

    for (const component of highRiskComponents.slice(0, 10)) {
      report += `
### ${component.name}
- **Path**: ${component.path}
- **Size**: ${Math.round(component.size / 1024)}KB
- **Risk Score**: ${component.duplicateRisk.score}/10
- **Risk Factors**: ${component.duplicateRisk.reasons.join(', ')}
- **Type**: ${Object.entries(component.patterns)
  .filter(([, value]) => value)
  .map(([key]) => key)
  .join(', ') || 'Standard Component'}
`;
    }

    return report;
  }
}

// Export for use in other scripts
export { ComponentAuditor };
export type { ComponentAnalysis, ConsolidationRecommendation };

// CLI execution (when run directly)
if (require.main === module) {
  const auditor = new ComponentAuditor();
  
  auditor.performAudit()
    .then(result => {
      console.log('\n=== COMPONENT AUDIT COMPLETED ===');
      console.log(`Total Components: ${result.summary.totalComponents}`);
      console.log(`Duplication Risk: ${result.summary.duplicateRisk}%`);
      console.log(`Optimization Opportunities: ${result.summary.optimizationOpportunities}`);
      console.log(`Estimated Savings: ${result.summary.estimatedSavings}`);
      console.log(`\nRecommendations: ${result.recommendations.length}`);
      
      // Save detailed report
      fs.writeFileSync(
        path.join(process.cwd(), 'component-audit-report.md'),
        auditor.generateReport()
      );
      
      console.log('\nDetailed report saved to: component-audit-report.md');
    })
    .catch(error => {
      console.error('Component audit failed:', error);
      process.exit(1);
    });
}
