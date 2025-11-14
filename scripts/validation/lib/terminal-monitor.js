#!/usr/bin/env node
/**
 * Terminal Monitoring System
 * 
 * Monitors terminal output during validation and deployment
 * Provides real-time feedback and alerts for issues
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TerminalMonitor {
  constructor(options = {}) {
    this.logDir = options.logDir || '.terminal-logs';
    this.maxLogSize = options.maxLogSize || 10 * 1024 * 1024; // 10MB
    this.alertPatterns = options.alertPatterns || [
      /error/i,
      /failed/i,
      /fatal/i,
      /exception/i,
      /cannot find/i,
      /undefined/i,
      /null is not/i
    ];
    this.warningPatterns = options.warningPatterns || [
      /warning/i,
      /deprecated/i,
      /skipped/i
    ];
    
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getLogPath(scriptName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(this.logDir, `${scriptName}-${timestamp}.log`);
  }

  createLogStream(scriptName) {
    const logPath = this.getLogPath(scriptName);
    return fs.createWriteStream(logPath, { flags: 'a' });
  }

  monitorCommand(command, scriptName, options = {}) {
    return new Promise((resolve, reject) => {
      const logStream = this.createLogStream(scriptName);
      const startTime = Date.now();
      
      console.log(`\n🔍 Monitoring: ${scriptName}`);
      console.log(`📝 Logging to: ${logStream.path}\n`);

      const child = spawn(command, {
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe'],
        ...options
      });

      let stdout = '';
      let stderr = '';
      let errors = [];
      let warnings = [];

      // Monitor stdout
      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        
        // Write to log
        logStream.write(`[STDOUT] ${text}`);
        
        // Display in real-time
        process.stdout.write(text);
        
        // Check for alerts
        this.checkForIssues(text, errors, warnings);
      });

      // Monitor stderr
      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        
        // Write to log
        logStream.write(`[STDERR] ${text}`);
        
        // Display in real-time with color
        process.stderr.write(`\x1b[31m${text}\x1b[0m`);
        
        // Check for alerts
        this.checkForIssues(text, errors, warnings);
      });

      // Handle completion
      child.on('close', (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        // Write summary to log
        logStream.write(`\n\n=== EXECUTION SUMMARY ===\n`);
        logStream.write(`Exit Code: ${code}\n`);
        logStream.write(`Duration: ${duration}s\n`);
        logStream.write(`Errors: ${errors.length}\n`);
        logStream.write(`Warnings: ${warnings.length}\n`);
        
        logStream.end();

        // Display summary
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 ${scriptName} Summary`);
        console.log(`${'='.repeat(60)}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`${code === 0 ? '✅' : '❌'} Exit Code: ${code}`);
        
        if (errors.length > 0) {
          console.log(`❌ Errors: ${errors.length}`);
          errors.slice(0, 5).forEach((err, i) => {
            console.log(`   ${i + 1}. ${err.substring(0, 80)}...`);
          });
          if (errors.length > 5) {
            console.log(`   ... and ${errors.length - 5} more`);
          }
        }
        
        if (warnings.length > 0) {
          console.log(`⚠️  Warnings: ${warnings.length}`);
          warnings.slice(0, 3).forEach((warn, i) => {
            console.log(`   ${i + 1}. ${warn.substring(0, 80)}...`);
          });
          if (warnings.length > 3) {
            console.log(`   ... and ${warnings.length - 3} more`);
          }
        }
        
        console.log(`📝 Full log: ${logStream.path}`);
        console.log(`${'='.repeat(60)}\n`);

        const result = {
          code,
          duration,
          errors,
          warnings,
          stdout,
          stderr,
          logPath: logStream.path
        };

        if (code === 0) {
          resolve(result);
        } else {
          reject(result);
        }
      });

      child.on('error', (error) => {
        logStream.write(`\n[ERROR] ${error.message}\n`);
        logStream.end();
        
        console.error(`\n❌ Failed to execute: ${error.message}`);
        reject({
          code: 1,
          error: error.message,
          logPath: logStream.path
        });
      });
    });
  }

  checkForIssues(text, errors, warnings) {
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Check for errors
      for (const pattern of this.alertPatterns) {
        if (pattern.test(line)) {
          errors.push(line.trim());
          // Visual alert
          if (!line.includes('error')) { // Don't double-print
            console.log(`\x1b[41m\x1b[37m 🚨 ERROR DETECTED 🚨 \x1b[0m`);
          }
          break;
        }
      }
      
      // Check for warnings
      for (const pattern of this.warningPatterns) {
        if (pattern.test(line)) {
          warnings.push(line.trim());
          break;
        }
      }
    });
  }

  async monitorMultiple(commands) {
    const results = [];
    
    for (const { command, name } of commands) {
      try {
        const result = await this.monitorCommand(command, name);
        results.push({ name, success: true, result });
      } catch (error) {
        results.push({ name, success: false, error });
      }
    }
    
    return results;
  }

  cleanOldLogs(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const now = Date.now();
    const files = fs.readdirSync(this.logDir);
    
    let cleaned = 0;
    
    files.forEach(file => {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} old log files`);
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node terminal-monitor.js <command> [name]');
    console.log('Example: node terminal-monitor.js "npm run build" "Build"');
    process.exit(1);
  }
  
  const command = args[0];
  const name = args[1] || 'command';
  
  const monitor = new TerminalMonitor();
  
  // Clean old logs
  monitor.cleanOldLogs();
  
  monitor.monitorCommand(command, name)
    .then(result => {
      console.log(`\n✅ ${name} completed successfully`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`\n❌ ${name} failed`);
      process.exit(error.code || 1);
    });
}

module.exports = { TerminalMonitor };
