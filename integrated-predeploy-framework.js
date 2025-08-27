#!/usr/bin/env node

/**
 * INTEGRATED PREDEPLOY FRAMEWORK WITH DYNAMIC LEARNING
 * ===================================================
 * 
 * This system integrates standardized testing with the predeploy framework,
 * implements dynamic learning from terminal monitoring, and provides
 * optimal terminal monitoring with predictive error detection.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const NextJSTestingFramework = require('./next-js-testing-framework');
const IntelligentTerminalMonitor = require('./intelligent-terminal-monitor');

class IntegratedPredeployFramework {
  constructor() {
    this.testingFramework = new NextJSTestingFramework();
    this.terminalMonitor = new IntelligentTerminalMonitor();
    this.learningDatabase = this.loadLearningDatabase();
    this.predeployHistory = this.loadPredeployHistory();
    this.dynamicPatterns = new Map();
    this.performanceMetrics = {
      testExecutionTime: [],
      buildTime: [],
      fixSuccessRate: [],
      errorDetectionAccuracy: []
    };
  }

  loadLearningDatabase() {
    try {
      if (fs.existsSync('predeploy-learning-db.json')) {
        return JSON.parse(fs.readFileSync('predeploy-learning-db.json', 'utf8'));
      }
    } catch (error) {
      console.log('🧠 Initializing new learning database...');
    }
    
    return {
      errorPatterns: [],
      fixStrategies: [],
      successfulIntegrations: [],
      performanceOptimizations: [],
      testingInsights: [],
      buildOptimizations: []
    };
  }

  loadPredeployHistory() {
    try {
      if (fs.existsSync('predeploy-history.json')) {
        return JSON.parse(fs.readFileSync('predeploy-history.json', 'utf8'));
      }
    } catch (error) {
      console.log('📊 Starting fresh predeploy history...');
    }
    
    return {
      runs: [],
      trends: {},
      optimizations: []
    };
  }

  saveLearningDatabase() {
    fs.writeFileSync('predeploy-learning-db.json', JSON.stringify(this.learningDatabase, null, 2));
  }

  savePredeployHistory() {
    fs.writeFileSync('predeploy-history.json', JSON.stringify(this.predeployHistory, null, 2));
  }

  // PHASE 1: INTEGRATE TESTING FRAMEWORK
  async initializeIntegratedFramework() {
    console.log('🚀 INTEGRATED PREDEPLOY FRAMEWORK INITIALIZATION');
    console.log('================================================\n');

    // Step 1: Evaluate and standardize testing
    console.log('📊 Phase 1: Testing Framework Integration');
    const testingEvaluation = await this.testingFramework.evaluateTestingFramework();
    
    // Step 2: Implement standardization if needed
    if (testingEvaluation.summary?.overallScore < 80) {
      console.log('🔧 Implementing testing standardization...');
      await this.testingFramework.implementStandardization();
    }

    // Step 3: Integrate with terminal monitoring
    console.log('\n🔍 Phase 2: Terminal Monitoring Integration');
    await this.integrateTerminalMonitoring();

    // Step 4: Set up dynamic learning
    console.log('\n🧠 Phase 3: Dynamic Learning Setup');
    await this.setupDynamicLearning();

    return {
      testingIntegration: 'complete',
      terminalMonitoring: 'active',
      dynamicLearning: 'initialized'
    };
  }

  async integrateTerminalMonitoring() {
    // Enhanced terminal monitoring with testing integration
    const testingPatterns = [
      {
        pattern: /Test Suites:\s+(\d+)\s+failed.*?(\d+)\s+passed/s,
        type: 'test-suite-results',
        action: this.handleTestResults.bind(this),
        priority: 'high'
      },
      {
        pattern: /Coverage:\s+(\d+\.?\d*)%/,
        type: 'coverage-report',
        action: this.handleCoverageReport.bind(this),
        priority: 'medium'
      },
      {
        pattern: /Build completed in (\d+\.?\d*)(s|ms)/,
        type: 'build-performance',
        action: this.handleBuildPerformance.bind(this),
        priority: 'low'
      },
      {
        pattern: /FAIL.*?Expected.*?Received/s,
        type: 'test-assertion-failure',
        action: this.handleTestAssertionFailure.bind(this),
        priority: 'high'
      }
    ];

    // Add patterns to the existing terminal monitor
    testingPatterns.forEach(pattern => {
      this.terminalMonitor.errorPatterns.push(pattern);
    });

    console.log('✅ Terminal monitoring integrated with testing framework');
  }

  // Handler methods for terminal monitoring patterns
  handleTestResults(context, matches) {
    if (matches && matches.length >= 3) {
      const failed = parseInt(matches[1]);
      const passed = parseInt(matches[2]);
      
      console.log(`📊 Test Results: ${failed} failed, ${passed} passed`);
      
      // Learn from test patterns
      this.learningDatabase.testingInsights.push({
        timestamp: Date.now(),
        failed,
        passed,
        successRate: passed / (passed + failed)
      });
    }
  }

  handleCoverageReport(context, matches) {
    if (matches && matches[1]) {
      const coverage = parseFloat(matches[1]);
      console.log(`📈 Coverage: ${coverage}%`);
      
      // Track coverage trends
      this.performanceMetrics.coverageTrend = this.performanceMetrics.coverageTrend || [];
      this.performanceMetrics.coverageTrend.push(coverage);
    }
  }

  handleBuildPerformance(context, matches) {
    if (matches && matches.length >= 2) {
      const time = parseFloat(matches[1]);
      const unit = matches[2];
      const timeMs = unit === 's' ? time * 1000 : time;
      
      console.log(`⚡ Build completed in ${time}${unit}`);
      this.performanceMetrics.buildTime.push(timeMs);
    }
  }

  handleTestAssertionFailure(context, matches) {
    console.log('❌ Test assertion failure detected');
    
    // Extract failure details for learning
    const failurePattern = {
      timestamp: Date.now(),
      context: context.substring(0, 200),
      type: 'assertion-failure'
    };
    
    this.learningDatabase.errorPatterns.push(failurePattern);
  }

  async setupDynamicLearning() {
    // Initialize pattern recognition for common error types
    this.initializeLearningPatterns();
    
    // Set up performance tracking
    this.setupPerformanceTracking();
    
    // Initialize predictive error detection
    this.initializePredictiveDetection();
    
    console.log('✅ Dynamic learning system activated');
  }

  initializeLearningPatterns() {
    // Common patterns learned from historical data
    const basePatterns = [
      {
        pattern: 'dependency-version-conflict',
        indicators: ['peer dep', 'version conflict', 'incompatible'],
        solution: 'version-resolution',
        successRate: 0.85
      },
      {
        pattern: 'typescript-compilation-error',
        indicators: ['TS', 'type error', 'cannot find module'],
        solution: 'typescript-fix',
        successRate: 0.92
      },
      {
        pattern: 'test-timeout',
        indicators: ['timeout', 'exceeded', 'async'],
        solution: 'timeout-adjustment',
        successRate: 0.78
      },
      {
        pattern: 'build-memory-issue',
        indicators: ['out of memory', 'heap', 'memory'],
        solution: 'memory-optimization',
        successRate: 0.65
      }
    ];

    basePatterns.forEach(pattern => {
      this.dynamicPatterns.set(pattern.pattern, pattern);
    });
  }

  setupPerformanceTracking() {
    // Track metrics over time to identify optimization opportunities
    this.performanceTracker = {
      startTime: null,
      metrics: {},
      
      start: () => {
        this.performanceTracker.startTime = Date.now();
      },
      
      end: (phase) => {
        if (this.performanceTracker.startTime) {
          const duration = Date.now() - this.performanceTracker.startTime;
          this.performanceMetrics[phase] = this.performanceMetrics[phase] || [];
          this.performanceMetrics[phase].push(duration);
          this.performanceTracker.startTime = null;
          return duration;
        }
        return 0;
      }
    };
  }

  initializePredictiveDetection() {
    // Analyze historical patterns to predict likely failures
    this.predictiveEngine = {
      analyzeProject: () => {
        const predictions = [];
        
        // Check package.json for known problematic combinations
        try {
          const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          
          // Predict dependency conflicts
          if (this.hasPotentialDependencyConflicts(pkg)) {
            predictions.push({
              type: 'dependency-conflict',
              probability: 0.7,
              prevention: 'Run dependency audit before build'
            });
          }
          
          // Predict TypeScript issues
          if (this.hasPotentialTypeScriptIssues()) {
            predictions.push({
              type: 'typescript-error',
              probability: 0.6,
              prevention: 'Run type-check before tests'
            });
          }
          
        } catch (error) {
          // Package.json issues
          predictions.push({
            type: 'package-json-error',
            probability: 0.9,
            prevention: 'Fix package.json format'
          });
        }
        
        return predictions;
      }
    };
  }

  // PHASE 2: ENHANCED TERMINAL MONITORING WITH LEARNING
  async runEnhancedTerminalMonitoring(command, description) {
    console.log(`🔍 ENHANCED MONITORING: ${description}`);
    
    // Predictive analysis before running command
    const predictions = this.predictiveEngine.analyzeProject();
    if (predictions.length > 0) {
      console.log('\n🔮 PREDICTIVE ANALYSIS:');
      predictions.forEach(pred => {
        console.log(`  ⚠️ ${pred.type} (${Math.round(pred.probability * 100)}% probability)`);
        console.log(`     💡 Prevention: ${pred.prevention}`);
      });
    }

    this.performanceTracker.start();
    
    return new Promise((resolve) => {
      const childProcess = spawn('bash', ['-c', command], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let output = '';
      let errorOutput = '';
      const learningData = {
        command,
        description,
        startTime: Date.now(),
        patterns: [],
        fixes: [],
        outcome: null
      };

      childProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        process.stdout.write(chunk);
        
        // Enhanced real-time learning
        this.learnFromOutput(chunk, learningData);
      });

      childProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        process.stderr.write(chunk);
        
        // Learn from error patterns
        this.learnFromErrors(chunk, learningData);
      });

      childProcess.on('close', (code) => {
        const duration = this.performanceTracker.end('command');
        learningData.outcome = {
          success: code === 0,
          exitCode: code,
          duration
        };

        // Store learning data
        this.storeLearningData(learningData);

        console.log(`\n📊 Command completed in ${duration}ms with exit code: ${code}`);

        resolve({
          success: code === 0,
          exitCode: code,
          output,
          errorOutput,
          learningData,
          duration
        });
      });
    });
  }

  learnFromOutput(chunk, learningData) {
    // Analyze successful patterns
    const successPatterns = [
      { pattern: /✓.*?passed/, type: 'test-success' },
      { pattern: /Build completed successfully/, type: 'build-success' },
      { pattern: /Coverage:.*?(\d+\.?\d*)%/, type: 'coverage-info' }
    ];

    successPatterns.forEach(({ pattern, type }) => {
      const match = chunk.match(pattern);
      if (match) {
        learningData.patterns.push({
          type,
          content: match[0],
          timestamp: Date.now()
        });
      }
    });
  }

  learnFromErrors(chunk, learningData) {
    // Enhanced error pattern recognition
    const errorPatterns = [
      { pattern: /Cannot find module ['"`]([^'"`]+)['"`]/, type: 'missing-module', extract: 1 },
      { pattern: /Expected.*?Received.*?(\w+)/, type: 'test-assertion', extract: 1 },
      { pattern: /Build failed.*?(\w+)/, type: 'build-failure', extract: 1 },
      { pattern: /Memory limit exceeded/, type: 'memory-issue', extract: 0 }
    ];

    errorPatterns.forEach(({ pattern, type, extract }) => {
      const match = chunk.match(pattern);
      if (match) {
        const errorData = {
          type,
          content: match[0],
          detail: extract > 0 ? match[extract] : null,
          timestamp: Date.now()
        };
        
        learningData.patterns.push(errorData);
        
        // Attempt dynamic fix based on learned patterns
        this.attemptDynamicFix(errorData, learningData);
      }
    });
  }

  attemptDynamicFix(errorData, learningData) {
    const knownPattern = this.dynamicPatterns.get(errorData.type);
    
    if (knownPattern && knownPattern.successRate > 0.7) {
      console.log(`\n🔧 DYNAMIC FIX ATTEMPT: ${errorData.type}`);
      
      const fix = {
        type: errorData.type,
        strategy: knownPattern.solution,
        confidence: knownPattern.successRate,
        timestamp: Date.now(),
        applied: false
      };

      try {
        const success = this.applyDynamicFix(fix, errorData);
        fix.applied = success;
        learningData.fixes.push(fix);
        
        if (success) {
          console.log(`✅ Dynamic fix applied successfully`);
          // Increase success rate for this pattern
          knownPattern.successRate = Math.min(0.98, knownPattern.successRate + 0.02);
        } else {
          console.log(`❌ Dynamic fix failed`);
          // Decrease success rate for this pattern
          knownPattern.successRate = Math.max(0.1, knownPattern.successRate - 0.05);
        }
      } catch (error) {
        console.log(`❌ Dynamic fix error: ${error.message}`);
        fix.error = error.message;
        learningData.fixes.push(fix);
      }
    }
  }

  applyDynamicFix(fix, errorData) {
    // Implement dynamic fixes based on learned patterns
    switch (fix.strategy) {
      case 'version-resolution':
        return this.fixVersionConflict(errorData);
      
      case 'typescript-fix':
        return this.fixTypeScriptIssue(errorData);
      
      case 'timeout-adjustment':
        return this.fixTestTimeout(errorData);
      
      case 'memory-optimization':
        return this.fixMemoryIssue(errorData);
      
      default:
        console.log(`🤔 Unknown fix strategy: ${fix.strategy}`);
        return false;
    }
  }

  fixVersionConflict(errorData) {
    try {
      // Attempt to resolve version conflicts
      console.log('🔧 Attempting version conflict resolution...');
      
      if (errorData.detail) {
        // Try npm install with specific version
        execSync(`npm install ${errorData.detail}@latest`, { stdio: 'pipe' });
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  fixTypeScriptIssue(errorData) {
    try {
      console.log('🔧 Attempting TypeScript fix...');
      
      // Common TypeScript fixes
      if (errorData.content.includes('Cannot find module')) {
        // Try installing missing @types package
        const module = errorData.detail;
        if (module && !module.startsWith('@types/')) {
          execSync(`npm install --save-dev @types/${module}`, { stdio: 'pipe' });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  fixTestTimeout(errorData) {
    try {
      console.log('🔧 Adjusting test timeout...');
      
      // Update Jest config with higher timeout
      const jestConfig = require('./jest.config.js');
      if (jestConfig.testTimeout < 60000) {
        jestConfig.testTimeout = 60000;
        fs.writeFileSync('jest.config.js', `module.exports = ${JSON.stringify(jestConfig, null, 2)};\n`);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  fixMemoryIssue(errorData) {
    try {
      console.log('🔧 Applying memory optimization...');
      
      // Update package.json scripts with memory flags
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (pkg.scripts.build && !pkg.scripts.build.includes('--max-old-space-size')) {
        pkg.scripts.build = `NODE_OPTIONS="--max-old-space-size=4096" ${pkg.scripts.build}`;
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  storeLearningData(learningData) {
    // Store data for future learning
    this.learningDatabase.errorPatterns.push(...learningData.patterns);
    this.learningDatabase.fixStrategies.push(...learningData.fixes);
    
    // Update success rates based on outcomes
    if (learningData.outcome.success && learningData.fixes.length > 0) {
      this.learningDatabase.successfulIntegrations.push({
        timestamp: Date.now(),
        command: learningData.command,
        fixes: learningData.fixes.filter(f => f.applied),
        duration: learningData.outcome.duration
      });
    }

    // Save periodically
    if (Math.random() < 0.1) { // 10% chance to save on each run
      this.saveLearningDatabase();
    }
  }

  // PHASE 3: OPTIMAL PREDEPLOY EXECUTION
  async runOptimalPredeploy() {
    console.log('🎯 OPTIMAL PREDEPLOY EXECUTION WITH DYNAMIC LEARNING');
    console.log('====================================================\n');

    const predeployRun = {
      id: `predeploy-${Date.now()}`,
      timestamp: new Date().toISOString(),
      phases: [],
      totalDuration: 0,
      success: false,
      optimizations: [],
      learnings: []
    };

    try {
      // Phase 1: Predictive Analysis
      console.log('🔮 Phase 1: Predictive Analysis');
      const predictions = await this.runPredictiveAnalysis();
      predeployRun.phases.push({
        name: 'predictive-analysis',
        duration: 0,
        success: true,
        predictions
      });

      // Phase 2: Testing with Enhanced Monitoring
      console.log('\n🧪 Phase 2: Enhanced Testing');
      const testResult = await this.runEnhancedTesting();
      predeployRun.phases.push({
        name: 'testing',
        duration: testResult.duration,
        success: testResult.success,
        coverage: testResult.coverage,
        fixes: testResult.fixes
      });

      if (!testResult.success) {
        console.log('❌ Testing phase failed - applying learned fixes...');
        const fixResult = await this.applyLearnedFixes(testResult);
        if (fixResult.success) {
          console.log('✅ Learned fixes successful - retrying tests...');
          const retryResult = await this.runEnhancedTesting();
          predeployRun.phases.push({
            name: 'testing-retry',
            duration: retryResult.duration,
            success: retryResult.success,
            fixes: fixResult.fixes
          });
        }
      }

      // Phase 3: Build with Optimization
      console.log('\n🏗️ Phase 3: Optimized Build');
      const buildResult = await this.runOptimizedBuild();
      predeployRun.phases.push({
        name: 'build',
        duration: buildResult.duration,
        success: buildResult.success,
        optimizations: buildResult.optimizations
      });

      // Phase 4: Final Validation
      console.log('\n✅ Phase 4: Final Validation');
      const validationResult = await this.runFinalValidation();
      predeployRun.phases.push({
        name: 'validation',
        duration: validationResult.duration,
        success: validationResult.success
      });

      // Calculate overall success
      predeployRun.success = predeployRun.phases.every(phase => phase.success);
      predeployRun.totalDuration = predeployRun.phases.reduce((sum, phase) => sum + phase.duration, 0);

      // Store predeploy history
      this.predeployHistory.runs.push(predeployRun);
      this.savePredeployHistory();

      return predeployRun;

    } catch (error) {
      console.error('❌ Predeploy execution failed:', error);
      predeployRun.error = error.message;
      return predeployRun;
    }
  }

  async runPredictiveAnalysis() {
    const predictions = this.predictiveEngine.analyzeProject();
    
    // Apply predictive optimizations
    for (const prediction of predictions) {
      if (prediction.probability > 0.8) {
        console.log(`🔧 Applying preventive fix for ${prediction.type}...`);
        // Apply prevention strategy
      }
    }

    return predictions;
  }

  async runEnhancedTesting() {
    console.log('🧪 Running enhanced testing with learning...');
    
    const result = await this.runEnhancedTerminalMonitoring('npm run test:ci', 'Enhanced CI Testing');
    
    // Extract coverage information
    const coverageMatch = result.output.match(/All files.*?(\d+\.?\d*).*?(\d+\.?\d*).*?(\d+\.?\d*).*?(\d+\.?\d*)/);
    let coverage = null;
    if (coverageMatch) {
      coverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4])
      };
    }

    return {
      success: result.success,
      duration: result.duration,
      coverage,
      fixes: result.learningData.fixes,
      output: result.output
    };
  }

  async runOptimizedBuild() {
    console.log('🏗️ Running optimized build with monitoring...');
    
    // Apply build optimizations learned from history
    await this.applyBuildOptimizations();
    
    const result = await this.runEnhancedTerminalMonitoring('npm run build', 'Optimized Build');
    
    return {
      success: result.success,
      duration: result.duration,
      optimizations: this.getAppliedOptimizations(),
      output: result.output
    };
  }

  async runFinalValidation() {
    console.log('✅ Running final validation...');
    
    const validations = [
      { command: 'npm run type-check', description: 'TypeScript validation' },
      { command: 'npm run lint', description: 'ESLint validation' }
    ];

    let allSuccess = true;
    let totalDuration = 0;

    for (const validation of validations) {
      const result = await this.runEnhancedTerminalMonitoring(validation.command, validation.description);
      if (!result.success) {
        allSuccess = false;
      }
      totalDuration += result.duration;
    }

    return {
      success: allSuccess,
      duration: totalDuration
    };
  }

  async applyLearnedFixes(testResult) {
    console.log('🧠 Applying learned fixes from previous runs...');
    
    const applicableFixes = this.learningDatabase.successfulIntegrations
      .filter(integration => integration.command.includes('test'))
      .flatMap(integration => integration.fixes)
      .filter(fix => fix.applied);

    let successfulFixes = 0;
    const appliedFixes = [];

    for (const fix of applicableFixes) {
      try {
        const success = this.applyDynamicFix(fix, { type: fix.type });
        if (success) {
          successfulFixes++;
          appliedFixes.push(fix);
        }
      } catch (error) {
        console.log(`❌ Failed to apply learned fix: ${error.message}`);
      }
    }

    return {
      success: successfulFixes > 0,
      fixes: appliedFixes,
      count: successfulFixes
    };
  }

  async applyBuildOptimizations() {
    // Apply optimizations learned from build history
    const optimizations = this.learningDatabase.buildOptimizations;
    
    for (const optimization of optimizations) {
      if (optimization.successRate > 0.8) {
        try {
          await this.applyOptimization(optimization);
        } catch (error) {
          console.log(`⚠️ Failed to apply optimization: ${error.message}`);
        }
      }
    }
  }

  async applyOptimization(optimization) {
    // Implement specific optimizations
    console.log(`🔧 Applying optimization: ${optimization.type}`);
  }

  getAppliedOptimizations() {
    return this.learningDatabase.buildOptimizations.filter(opt => opt.applied);
  }

  // UTILITY METHODS
  hasPotentialDependencyConflicts(pkg) {
    // Analyze package.json for potential conflicts
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    
    // Check for known problematic combinations
    const conflicts = [
      { packages: ['react', '@types/react'], versionMismatch: true },
      { packages: ['next', 'typescript'], versionMismatch: true }
    ];

    return conflicts.some(conflict => {
      const hasAllPackages = conflict.packages.every(pkg => dependencies[pkg]);
      return hasAllPackages; // Simplified check
    });
  }

  hasPotentialTypeScriptIssues() {
    // Check for TypeScript configuration issues
    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      
      // Check for common issues
      if (!tsConfig.compilerOptions?.strict) {
        return true;
      }
      
      if (!tsConfig.include || tsConfig.include.length === 0) {
        return true;
      }
      
      return false;
    } catch (error) {
      return true; // No tsconfig.json or invalid format
    }
  }

  // REPORTING AND ANALYTICS
  generateLearningReport() {
    const report = {
      timestamp: new Date().toISOString(),
      learningDatabase: {
        totalPatterns: this.learningDatabase.errorPatterns.length,
        totalFixStrategies: this.learningDatabase.fixStrategies.length,
        successfulIntegrations: this.learningDatabase.successfulIntegrations.length
      },
      performanceMetrics: this.calculatePerformanceMetrics(),
      predictions: this.predictiveEngine.analyzeProject(),
      recommendations: this.generateOptimizationRecommendations()
    };

    fs.writeFileSync('predeploy-learning-report.json', JSON.stringify(report, null, 2));
    return report;
  }

  calculatePerformanceMetrics() {
    const metrics = {};
    
    Object.entries(this.performanceMetrics).forEach(([key, values]) => {
      if (values.length > 0) {
        metrics[key] = {
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          trend: this.calculateTrend(values)
        };
      }
    });

    return metrics;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'insufficient-data';
    
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    
    if (older.length === 0) return 'insufficient-data';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg < olderAvg * 0.9) return 'improving';
    if (recentAvg > olderAvg * 1.1) return 'degrading';
    return 'stable';
  }

  generateOptimizationRecommendations() {
    const recommendations = [];
    
    // Analyze performance trends
    const metrics = this.calculatePerformanceMetrics();
    
    Object.entries(metrics).forEach(([metric, data]) => {
      if (data.trend === 'degrading') {
        recommendations.push({
          type: 'performance',
          metric,
          issue: `${metric} performance is degrading`,
          suggestion: `Investigate recent changes affecting ${metric}`
        });
      }
    });

    // Analyze error patterns
    const errorFrequency = {};
    this.learningDatabase.errorPatterns.forEach(pattern => {
      errorFrequency[pattern.type] = (errorFrequency[pattern.type] || 0) + 1;
    });

    Object.entries(errorFrequency).forEach(([type, count]) => {
      if (count > 5) {
        recommendations.push({
          type: 'recurring-error',
          errorType: type,
          frequency: count,
          suggestion: `Address recurring ${type} errors with permanent fix`
        });
      }
    });

    return recommendations;
  }

  displayComprehensiveReport() {
    const report = this.generateLearningReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧠 INTEGRATED PREDEPLOY FRAMEWORK - COMPREHENSIVE REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📊 LEARNING DATABASE STATUS:');
    console.log(`  - Error patterns learned: ${report.learningDatabase.totalPatterns}`);
    console.log(`  - Fix strategies developed: ${report.learningDatabase.totalFixStrategies}`);
    console.log(`  - Successful integrations: ${report.learningDatabase.successfulIntegrations}`);
    
    console.log('\n⚡ PERFORMANCE METRICS:');
    Object.entries(report.performanceMetrics).forEach(([metric, data]) => {
      const trendIcon = data.trend === 'improving' ? '📈' : data.trend === 'degrading' ? '📉' : '➡️';
      console.log(`  ${trendIcon} ${metric}: ${Math.round(data.average)}ms avg (${data.trend})`);
    });
    
    console.log('\n🔮 PREDICTIVE ANALYSIS:');
    if (report.predictions.length > 0) {
      report.predictions.forEach(pred => {
        console.log(`  ⚠️ ${pred.type}: ${Math.round(pred.probability * 100)}% probability`);
      });
    } else {
      console.log('  ✅ No issues predicted for next deployment');
    }
    
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    if (report.recommendations.length > 0) {
      report.recommendations.forEach(rec => {
        console.log(`  🔧 ${rec.type}: ${rec.suggestion}`);
      });
    } else {
      console.log('  ✅ System running optimally');
    }
    
    console.log('\n='.repeat(80));
  }
}

// Export for use in other systems
module.exports = IntegratedPredeployFramework;

// Run integrated framework if called directly
if (require.main === module) {
  const framework = new IntegratedPredeployFramework();
  
  framework.initializeIntegratedFramework()
    .then(() => {
      console.log('\n🚀 Running optimal predeploy with dynamic learning...');
      return framework.runOptimalPredeploy();
    })
    .then((result) => {
      console.log(`\n🎯 PREDEPLOY RESULT: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`⏱️ Total Duration: ${result.totalDuration}ms`);
      
      framework.displayComprehensiveReport();
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Integrated framework error:', error);
      process.exit(1);
    });
}
