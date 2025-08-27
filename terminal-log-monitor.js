#!/usr/bin/env node

/**
 * Terminal Log Monitor for Predeploy
 * Monitors all terminal outputs to detect errors and issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TerminalLogMonitor {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.logDir = path.join(this.workspaceRoot, '.terminal-logs');
    this.errors = [];
    this.warnings = [];
    this.activeTerminals = new Map();
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  async scanAllTerminalLogs() {
    console.log('🔍 SCANNING ALL TERMINAL LOGS FOR ERRORS');
    console.log('=========================================');
    
    try {
      // Get all active terminals and their logs
      await this.detectActiveTerminals();
      await this.scanLogFiles();
      await this.scanRecentCommands();
      
      this.analyzeFindings();
      return this.errors.length;
      
    } catch (error) {
      console.log('⚠️ Error scanning terminal logs:', error.message);
      return 1;
    }
  }

  async detectActiveTerminals() {
    console.log('📱 Detecting active terminals...');
    
    try {
      // Check for common terminal session info
      const terminalInfo = process.env.TERM_SESSION_ID || 
                          process.env.TERM_PROGRAM || 
                          'unknown';
      
      console.log(`   Current terminal: ${terminalInfo}`);
      
      // Check for background processes that might be logging
      const processes = this.runCommand('ps aux | grep -E "(npm|node|next|jest|vercel)" | grep -v grep', {
        ignoreErrors: true,
        silent: true
      });
      
      if (processes) {
        const processLines = processes.split('\n').filter(line => line.trim());
        console.log(`   Found ${processLines.length} related processes`);
        
        processLines.forEach((line, index) => {
          if (index < 5) { // Show first 5 processes
            const parts = line.trim().split(/\s+/);
            const pid = parts[1];
            const command = parts.slice(10).join(' ');
            console.log(`   PID ${pid}: ${command.substring(0, 60)}...`);
          }
        });
      }
      
    } catch (error) {
      console.log('⚠️ Could not detect terminals:', error.message);
    }
  }

  async scanLogFiles() {
    console.log('📄 Scanning log files for errors...');
    
    const logPatterns = [
      '.next/**/*.log',
      '.vercel/**/*.log',
      'node_modules/.cache/**/*.log',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*'
    ];
    
    for (const pattern of logPatterns) {
      try {
        const files = this.runCommand(`find . -name "${pattern}" 2>/dev/null || true`, {
          ignoreErrors: true,
          silent: true
        });
        
        if (files && files.trim()) {
          const logFiles = files.trim().split('\n');
          console.log(`   Found ${logFiles.length} log files matching ${pattern}`);
          
          for (const logFile of logFiles.slice(0, 3)) { // Limit to first 3 files
            await this.scanLogFile(logFile.trim());
          }
        }
      } catch (error) {
        // Ignore scan errors
      }
    }
  }

  async scanLogFile(logFile) {
    try {
      if (!fs.existsSync(logFile)) return;
      
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n');
      
      console.log(`   📝 Scanning ${logFile} (${lines.length} lines)`);
      
      // Look for error patterns in recent lines (last 100)
      const recentLines = lines.slice(-100);
      
      for (const line of recentLines) {
        if (this.isErrorLine(line)) {
          this.errors.push({
            source: logFile,
            line: line.trim(),
            type: 'log-file'
          });
        } else if (this.isWarningLine(line)) {
          this.warnings.push({
            source: logFile,
            line: line.trim(),
            type: 'log-file'
          });
        }
      }
      
    } catch (error) {
      console.log(`   ⚠️ Could not scan ${logFile}: ${error.message}`);
    }
  }

  async scanRecentCommands() {
    console.log('⚡ Scanning recent command outputs...');
    
    const recentCommands = [
      'npm run build',
      'npm run test',
      'npm run lint',
      'npm run predeploy',
      'npm run deploy',
      'npx next build',
      'vercel --prod'
    ];
    
    for (const command of recentCommands) {
      console.log(`   🔍 Testing: ${command}`);
      
      try {
        const output = this.runCommand(command, {
          ignoreErrors: true,
          silent: true,
          timeout: 10000 // 10 second timeout
        });
        
        this.analyzeCommandOutput(command, output);
        
      } catch (error) {
        console.log(`   ⚠️ Command '${command}' failed or timed out`);
        this.errors.push({
          source: `command: ${command}`,
          line: error.message,
          type: 'command-error'
        });
      }
    }
  }

  analyzeCommandOutput(command, output) {
    if (!output) return;
    
    const lines = output.split('\n');
    let errorCount = 0;
    let warningCount = 0;
    
    for (const line of lines) {
      if (this.isErrorLine(line)) {
        this.errors.push({
          source: `command: ${command}`,
          line: line.trim(),
          type: 'command-output'
        });
        errorCount++;
      } else if (this.isWarningLine(line)) {
        this.warnings.push({
          source: `command: ${command}`,
          line: line.trim(),
          type: 'command-output'
        });
        warningCount++;
      }
    }
    
    if (errorCount > 0 || warningCount > 0) {
      console.log(`   Found ${errorCount} errors, ${warningCount} warnings`);
    } else {
      console.log(`   ✅ No issues found`);
    }
  }

  isErrorLine(line) {
    const errorPatterns = [
      /error/i,
      /failed/i,
      /cannot find module/i,
      /module not found/i,
      /can't resolve/i,
      /build failed/i,
      /failed to compile/i,
      /syntaxerror/i,
      /referenceerror/i,
      /typeerror/i,
      /\berr\b/i,
      /exception/i,
      /fatal/i
    ];
    
    return errorPatterns.some(pattern => pattern.test(line)) &&
           !line.includes('warning') && // Exclude lines that are warnings
           !line.includes('info') &&    // Exclude info messages
           line.trim().length > 0;      // Exclude empty lines
  }

  isWarningLine(line) {
    const warningPatterns = [
      /warning/i,
      /warn/i,
      /deprecated/i,
      /outdated/i
    ];
    
    return warningPatterns.some(pattern => pattern.test(line)) &&
           !this.isErrorLine(line) &&
           line.trim().length > 0;
  }

  analyzeFindings() {
    console.log('\n📊 TERMINAL LOG ANALYSIS RESULTS');
    console.log('=================================');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ No issues found in terminal logs');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS FOUND (${this.errors.length}):`);
      
      // Group errors by source
      const errorsBySource = this.groupBySource(this.errors);
      
      for (const [source, errors] of Object.entries(errorsBySource)) {
        console.log(`\n   📁 ${source}:`);
        errors.slice(0, 3).forEach(error => {
          console.log(`      • ${error.line.substring(0, 100)}${error.line.length > 100 ? '...' : ''}`);
        });
        
        if (errors.length > 3) {
          console.log(`      ... and ${errors.length - 3} more errors`);
        }
      }
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS FOUND (${this.warnings.length}):`);
      
      const warningsBySource = this.groupBySource(this.warnings);
      
      for (const [source, warnings] of Object.entries(warningsBySource)) {
        console.log(`\n   📁 ${source}:`);
        warnings.slice(0, 2).forEach(warning => {
          console.log(`      • ${warning.line.substring(0, 80)}${warning.line.length > 80 ? '...' : ''}`);
        });
      }
    }
  }

  groupBySource(items) {
    return items.reduce((groups, item) => {
      const source = item.source;
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(item);
      return groups;
    }, {});
  }

  runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        timeout: options.timeout || 30000,
        ...options
      });
      return result;
    } catch (error) {
      if (options.ignoreErrors) {
        return error.stdout || error.stderr || error.message;
      }
      throw error;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL'
      },
      errors: this.errors,
      warnings: this.warnings
    };
    
    const reportPath = path.join(this.logDir, 'terminal-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
    return report;
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new TerminalLogMonitor();
  monitor.scanAllTerminalLogs().then(errorCount => {
    monitor.generateReport();
    process.exit(errorCount === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Terminal monitor failed:', error);
    process.exit(1);
  });
}

module.exports = TerminalLogMonitor;
