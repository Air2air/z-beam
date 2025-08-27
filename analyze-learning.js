#!/usr/bin/env node
/**
 * Adaptive Learning Analyzer
 * Analyzes and visualizes the predeploy system's learning progress
 */

const fs = require('fs');
const path = require('path');

class AdaptiveLearningAnalyzer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.learningDataPath = path.join(this.workspaceRoot, '.predeploy-learning.json');
    this.reportPath = path.join(this.workspaceRoot, 'predeploy-learning-report.md');
  }

  loadLearningData() {
    try {
      if (fs.existsSync(this.learningDataPath)) {
        return JSON.parse(fs.readFileSync(this.learningDataPath, 'utf8'));
      }
    } catch (error) {
      console.log('❌ Could not load learning data:', error.message);
    }
    return null;
  }

  analyzeProgress() {
    const data = this.loadLearningData();
    if (!data) {
      console.log('📊 No learning data found. Run the adaptive predeploy system first.');
      return null;
    }

    console.log('📊 ADAPTIVE LEARNING ANALYSIS');
    console.log('==============================');
    console.log(`📈 Total sessions: ${data.sessions.length}`);
    console.log(`🧠 Learning data version: ${data.version}`);
    
    // Analyze error pattern learning
    this.analyzeErrorPatterns(data);
    
    // Analyze fix effectiveness
    this.analyzeFixEffectiveness(data);
    
    // Analyze performance trends
    this.analyzePerformanceTrends(data);
    
    // Generate improvement recommendations
    this.generateRecommendations(data);
    
    // Generate detailed report
    this.generateDetailedReport(data);
    
    return data;
  }

  analyzeErrorPatterns(data) {
    console.log('\n🔍 ERROR PATTERN LEARNING:');
    console.log('---------------------------');
    
    let totalPatterns = 0;
    let patternsWithSuccessfulFixes = 0;
    
    for (const [errorType, patterns] of Object.entries(data.patterns.errorPatterns || {})) {
      const patternCount = Object.keys(patterns).length;
      totalPatterns += patternCount;
      
      let successfulPatterns = 0;
      for (const [patternKey, patternData] of Object.entries(patterns)) {
        if (patternData.successfulFixes && patternData.successfulFixes.length > 0) {
          successfulPatterns++;
          patternsWithSuccessfulFixes++;
        }
      }
      
      console.log(`   ${errorType}: ${patternCount} patterns (${successfulPatterns} with successful fixes)`);
    }
    
    const successRate = totalPatterns > 0 ? Math.round((patternsWithSuccessfulFixes / totalPatterns) * 100) : 0;
    console.log(`   📈 Overall pattern success rate: ${successRate}%`);
  }

  analyzeFixEffectiveness(data) {
    console.log('\n🔧 FIX EFFECTIVENESS ANALYSIS:');
    console.log('------------------------------');
    
    const fixStats = {};
    
    // Analyze all successful fixes across all patterns
    for (const [errorType, patterns] of Object.entries(data.patterns.errorPatterns || {})) {
      for (const [patternKey, patternData] of Object.entries(patterns)) {
        if (patternData.successfulFixes) {
          for (const fix of patternData.successfulFixes) {
            if (!fixStats[fix.fixType]) {
              fixStats[fix.fixType] = {
                totalAttempts: 0,
                totalSuccesses: 0,
                avgTime: 0,
                timeData: []
              };
            }
            
            fixStats[fix.fixType].totalAttempts += fix.attempts;
            fixStats[fix.fixType].totalSuccesses += fix.successes;
            fixStats[fix.fixType].timeData.push(fix.averageTime);
          }
        }
      }
    }
    
    // Calculate and display statistics
    for (const [fixType, stats] of Object.entries(fixStats)) {
      const successRate = Math.round((stats.totalSuccesses / stats.totalAttempts) * 100);
      const avgTime = Math.round(stats.timeData.reduce((a, b) => a + b, 0) / stats.timeData.length);
      
      console.log(`   ${fixType}: ${successRate}% success rate, ${avgTime}ms avg time (${stats.totalAttempts} attempts)`);
    }
  }

  analyzePerformanceTrends(data) {
    console.log('\n📈 PERFORMANCE TRENDS:');
    console.log('----------------------');
    
    if (data.sessions.length < 2) {
      console.log('   ⚠️ Need at least 2 sessions to analyze trends');
      return;
    }
    
    // Analyze session success rates over time
    const sessionSuccessRates = data.sessions.map(session => {
      const totalFixes = session.fixes ? session.fixes.length : 0;
      const successfulFixes = session.fixes ? session.fixes.filter(f => f.successful).length : 0;
      return totalFixes > 0 ? successfulFixes / totalFixes : 0;
    });
    
    const firstHalf = sessionSuccessRates.slice(0, Math.floor(sessionSuccessRates.length / 2));
    const secondHalf = sessionSuccessRates.slice(Math.floor(sessionSuccessRates.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const improvement = Math.round((secondHalfAvg - firstHalfAvg) * 100);
    
    console.log(`   📊 Early sessions success rate: ${Math.round(firstHalfAvg * 100)}%`);
    console.log(`   📊 Recent sessions success rate: ${Math.round(secondHalfAvg * 100)}%`);
    console.log(`   ${improvement > 0 ? '📈' : '📉'} Performance change: ${improvement > 0 ? '+' : ''}${improvement}%`);
  }

  generateRecommendations(data) {
    console.log('\n💡 SYSTEM RECOMMENDATIONS:');
    console.log('---------------------------');
    
    // Analyze which fixes are most/least effective
    const fixEffectiveness = this.calculateFixEffectiveness(data);
    
    const mostEffective = Object.entries(fixEffectiveness)
      .sort((a, b) => b[1].successRate - a[1].successRate)
      .slice(0, 3);
    
    const leastEffective = Object.entries(fixEffectiveness)
      .sort((a, b) => a[1].successRate - b[1].successRate)
      .slice(0, 2);
    
    console.log('   ✅ Most effective fixes:');
    mostEffective.forEach(([fixType, stats]) => {
      console.log(`      • ${fixType}: ${Math.round(stats.successRate * 100)}% success rate`);
    });
    
    console.log('   ⚠️ Least effective fixes:');
    leastEffective.forEach(([fixType, stats]) => {
      console.log(`      • ${fixType}: ${Math.round(stats.successRate * 100)}% success rate`);
    });
    
    // Strategic recommendations
    console.log('\n   🎯 Strategic recommendations:');
    if (data.sessions.length < 5) {
      console.log('      • Continue using the system to gather more learning data');
    }
    
    const totalPatterns = this.countTotalPatterns(data);
    if (totalPatterns < 10) {
      console.log('      • System is still learning error patterns - keep using it');
    } else {
      console.log('      • Rich pattern database established - system should be highly effective');
    }
  }

  calculateFixEffectiveness(data) {
    const fixStats = {};
    
    for (const [errorType, patterns] of Object.entries(data.patterns.errorPatterns || {})) {
      for (const [patternKey, patternData] of Object.entries(patterns)) {
        if (patternData.successfulFixes) {
          for (const fix of patternData.successfulFixes) {
            if (!fixStats[fix.fixType]) {
              fixStats[fix.fixType] = { attempts: 0, successes: 0 };
            }
            fixStats[fix.fixType].attempts += fix.attempts;
            fixStats[fix.fixType].successes += fix.successes;
          }
        }
      }
    }
    
    // Calculate success rates
    for (const [fixType, stats] of Object.entries(fixStats)) {
      stats.successRate = stats.successes / stats.attempts;
    }
    
    return fixStats;
  }

  countTotalPatterns(data) {
    let total = 0;
    for (const patterns of Object.values(data.patterns.errorPatterns || {})) {
      total += Object.keys(patterns).length;
    }
    return total;
  }

  generateDetailedReport(data) {
    const report = this.createMarkdownReport(data);
    fs.writeFileSync(this.reportPath, report);
    console.log(`\n📄 Detailed report saved to: ${this.reportPath}`);
  }

  createMarkdownReport(data) {
    const timestamp = new Date().toISOString();
    
    return `# Adaptive Predeploy Learning Report

Generated: ${timestamp}
Learning Data Version: ${data.version}
Total Sessions: ${data.sessions.length}

## Executive Summary

The adaptive predeploy system has processed ${data.sessions.length} deployment sessions and learned from various error patterns. This report analyzes the system's learning progress and effectiveness.

## Error Pattern Learning

${this.generateErrorPatternSection(data)}

## Fix Effectiveness Analysis

${this.generateFixEffectivenessSection(data)}

## Performance Trends

${this.generatePerformanceTrendsSection(data)}

## System Intelligence Insights

${this.generateIntelligenceInsights(data)}

## Recommendations for Optimization

${this.generateOptimizationRecommendations(data)}

## Technical Details

### Learning Data Structure
- Error Patterns: ${this.countTotalPatterns(data)} total patterns learned
- Fix Strategies: ${Object.keys(data.strategies.fixOrder || []).length} fix types available
- Performance Metrics: ${Object.keys(data.performance.averageFixTime || {}).length} tracked

### Session History
${data.sessions.map((session, index) => `
#### Session ${index + 1} (${session.timestamp})
- Session ID: ${session.sessionId}
- Errors Found: ${session.errors ? session.errors.length : 0}
- Fixes Applied: ${session.fixes ? session.fixes.length : 0}
- Overall Success: ${session.fixes && session.fixes.some(f => f.successful) ? 'Yes' : 'No'}
`).join('')}

---
*Report generated by Adaptive Predeploy Learning Analyzer*
`;
  }

  generateErrorPatternSection(data) {
    let section = '';
    
    for (const [errorType, patterns] of Object.entries(data.patterns.errorPatterns || {})) {
      const patternCount = Object.keys(patterns).length;
      section += `\n### ${errorType.charAt(0).toUpperCase() + errorType.slice(1)} Errors\n`;
      section += `- Total patterns learned: ${patternCount}\n`;
      
      if (patternCount > 0) {
        const mostFrequent = Object.values(patterns)
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 3);
        
        section += `- Most frequent patterns:\n`;
        mostFrequent.forEach(pattern => {
          section += `  - "${pattern.pattern.substring(0, 80)}..." (seen ${pattern.frequency} times)\n`;
        });
      }
    }
    
    return section;
  }

  generateFixEffectivenessSection(data) {
    const fixStats = this.calculateFixEffectiveness(data);
    let section = '';
    
    const sortedFixes = Object.entries(fixStats)
      .sort((a, b) => b[1].successRate - a[1].successRate);
    
    section += '\n| Fix Type | Success Rate | Total Attempts | Total Successes |\n';
    section += '|----------|--------------|----------------|------------------|\n';
    
    sortedFixes.forEach(([fixType, stats]) => {
      const successRate = Math.round(stats.successRate * 100);
      section += `| ${fixType} | ${successRate}% | ${stats.attempts} | ${stats.successes} |\n`;
    });
    
    return section;
  }

  generatePerformanceTrendsSection(data) {
    if (data.sessions.length < 2) {
      return '\n*Insufficient data for trend analysis (need at least 2 sessions)*';
    }
    
    return '\n*Performance trends calculated based on session success rates and fix effectiveness over time.*';
  }

  generateIntelligenceInsights(data) {
    const totalPatterns = this.countTotalPatterns(data);
    let insights = '';
    
    if (totalPatterns < 5) {
      insights += '- 🌱 **Learning Phase**: System is in early learning stage, gathering error patterns\n';
    } else if (totalPatterns < 20) {
      insights += '- 📈 **Growth Phase**: System has learned several patterns and is improving\n';
    } else {
      insights += '- 🧠 **Maturity Phase**: System has extensive pattern knowledge and high effectiveness\n';
    }
    
    const fixTypes = Object.keys(this.calculateFixEffectiveness(data));
    insights += `- 🔧 **Fix Repertoire**: ${fixTypes.length} different fix strategies learned\n`;
    
    if (data.sessions.length > 5) {
      insights += '- 📊 **Statistical Confidence**: Sufficient data for reliable performance analysis\n';
    }
    
    return insights;
  }

  generateOptimizationRecommendations(data) {
    let recommendations = '';
    
    const fixStats = this.calculateFixEffectiveness(data);
    const leastEffective = Object.entries(fixStats)
      .filter(([_, stats]) => stats.successRate < 0.5)
      .map(([fixType, _]) => fixType);
    
    if (leastEffective.length > 0) {
      recommendations += `- 🔧 **Fix Strategy Optimization**: Consider improving these low-success fixes: ${leastEffective.join(', ')}\n`;
    }
    
    if (data.sessions.length < 10) {
      recommendations += '- 📈 **Data Collection**: Continue using the system to build more comprehensive learning data\n';
    }
    
    if (this.countTotalPatterns(data) > 50) {
      recommendations += '- 🧹 **Pattern Cleanup**: Consider consolidating similar error patterns to improve performance\n';
    }
    
    return recommendations;
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new AdaptiveLearningAnalyzer();
  analyzer.analyzeProgress();
}

module.exports = AdaptiveLearningAnalyzer;
