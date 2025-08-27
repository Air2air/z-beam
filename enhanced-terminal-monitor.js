#!/usr/bin/env node
/**
 * Enhanced Terminal Log Monitor with Complete Message Capture
 * 
 * Features:
 * - 100% Terminal Message Capture
 * - Real-time Error Detection
 * - Automated Error Resolution
 * - Vercel Integration
 * - Legacy System Integration
 * - Comprehensive Logging
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class EnhancedTerminalLogMonitor extends EventEmitter {
  constructor() {
    super();
    this.workspaceRoot = process.cwd();
    this.sessionId = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Monitoring state
    this.activeTerminals = new Map();
    this.processMonitors = new Map();
    this.messageBuffer = [];
    this.errorBuffer = [];
    this.warningBuffer = [];
    
    // Configuration
    this.config = {
      bufferSize: 10000,
      logRotationSize: 50 * 1024 * 1024, // 50MB
      realTimeProcessing: true,
      autoFix: true,
      vercelIntegration: true,
      legacyIntegration: true
    };
    
    // Log paths
    this.logsDir = path.join(this.workspaceRoot, '.terminal-monitoring');
    this.sessionLogPath = path.join(this.logsDir, `session_${this.sessionId}.log`);
    this.errorLogPath = path.join(this.logsDir, `errors_${this.sessionId}.log`);
    this.vercelLogPath = path.join(this.logsDir, `vercel_${this.sessionId}.log`);
    
    // Initialize
    this.ensureDirectories();
    this.initializeLogging();
    
    console.log('📱 Enhanced Terminal Log Monitor v2.0 Initialized');
    console.log(`🆔 Session: ${this.sessionId}`);
    console.log(`📁 Logs: ${this.logsDir}`);
  }

  ensureDirectories() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  initializeLogging() {
    // Create log files with headers
    const timestamp = new Date().toISOString();
    
    fs.writeFileSync(this.sessionLogPath, `# Terminal Monitor Session Log\n# Session: ${this.sessionId}\n# Started: ${timestamp}\n\n`);
    fs.writeFileSync(this.errorLogPath, `# Error Log\n# Session: ${this.sessionId}\n# Started: ${timestamp}\n\n`);
    fs.writeFileSync(this.vercelLogPath, `# Vercel Integration Log\n# Session: ${this.sessionId}\n# Started: ${timestamp}\n\n`);
  }

  // =========================================
  // COMPLETE MESSAGE CAPTURE SYSTEM
  // =========================================

  startCompleteMessageCapture() {
    console.log('🔍 Starting 100% message capture...');
    
    // Intercept all console methods
    this.interceptConsoleOutput();
    
    // Monitor process creation
    this.interceptProcessCreation();
    
    // Monitor file system for log files
    this.monitorLogFiles();
    
    // Monitor shell history
    this.monitorShellHistory();
    
    // Start periodic scanning
    this.startPeriodicScanning();
    
    console.log('✅ Complete message capture initialized');
  }

  interceptConsoleOutput() {
    const originalMethods = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
      trace: console.trace
    };

    // Override each console method
    Object.keys(originalMethods).forEach(method => {
      console[method] = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' ');
        
        this.captureMessage({
          type: 'console',
          level: method,
          content: message,
          timestamp: Date.now(),
          source: 'console'
        });
        
        // Call original method
        originalMethods[method].apply(console, args);
      };
    });

    console.log('   📝 Console output interception active');
  }

  interceptProcessCreation() {
    const originalSpawn = require('child_process').spawn;
    const originalExec = require('child_process').exec;
    const originalExecSync = require('child_process').execSync;

    // Override spawn
    require('child_process').spawn = (command, args = [], options = {}) => {
      const child = originalSpawn(command, args, options);
      this.monitorChildProcess(child, command, args);
      return child;
    };

    // Override exec
    require('child_process').exec = (command, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      
      const wrappedCallback = (error, stdout, stderr) => {
        if (stdout) this.captureMessage({
          type: 'exec',
          level: 'stdout',
          content: stdout,
          command,
          timestamp: Date.now(),
          source: 'exec'
        });
        
        if (stderr) this.captureMessage({
          type: 'exec',
          level: 'stderr',
          content: stderr,
          command,
          timestamp: Date.now(),
          source: 'exec'
        });
        
        if (callback) callback(error, stdout, stderr);
      };
      
      return originalExec(command, options, wrappedCallback);
    };

    // Override execSync
    require('child_process').execSync = (command, options = {}) => {
      try {
        const result = originalExecSync(command, {
          ...options,
          encoding: 'utf8'
        });
        
        this.captureMessage({
          type: 'execSync',
          level: 'stdout',
          content: result,
          command,
          timestamp: Date.now(),
          source: 'execSync'
        });
        
        return result;
      } catch (error) {
        this.captureMessage({
          type: 'execSync',
          level: 'error',
          content: error.stderr || error.stdout || error.message,
          command,
          error: true,
          timestamp: Date.now(),
          source: 'execSync'
        });
        
        throw error;
      }
    };

    console.log('   🔧 Process creation interception active');
  }

  monitorChildProcess(child, command, args) {
    const processId = `pid_${child.pid}`;
    const fullCommand = `${command} ${args.join(' ')}`;
    
    console.log(`   👀 Monitoring process: ${fullCommand}`);
    
    const processInfo = {
      pid: child.pid,
      command: fullCommand,
      startTime: Date.now(),
      messages: []
    };
    
    this.processMonitors.set(processId, processInfo);

    // Monitor stdout
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        const content = data.toString();
        this.captureMessage({
          type: 'process',
          level: 'stdout',
          content,
          processId,
          command: fullCommand,
          timestamp: Date.now(),
          source: 'stdout'
        });
        processInfo.messages.push({ type: 'stdout', content, timestamp: Date.now() });
      });
    }

    // Monitor stderr
    if (child.stderr) {
      child.stderr.on('data', (data) => {
        const content = data.toString();
        this.captureMessage({
          type: 'process',
          level: 'stderr',
          content,
          processId,
          command: fullCommand,
          error: true,
          timestamp: Date.now(),
          source: 'stderr'
        });
        processInfo.messages.push({ type: 'stderr', content, timestamp: Date.now() });
      });
    }

    // Handle process exit
    child.on('exit', (code, signal) => {
      const exitMessage = `Process ${child.pid} exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`;
      
      this.captureMessage({
        type: 'process',
        level: 'info',
        content: exitMessage,
        processId,
        command: fullCommand,
        exitCode: code,
        signal,
        timestamp: Date.now(),
        source: 'exit'
      });
      
      processInfo.endTime = Date.now();
      processInfo.duration = processInfo.endTime - processInfo.startTime;
      processInfo.exitCode = code;
      processInfo.signal = signal;
      
      // Analyze process results
      this.analyzeProcessResults(processInfo);
      
      console.log(`   ✅ Process monitoring completed: ${fullCommand} (${processInfo.duration}ms)`);
    });

    // Handle errors
    child.on('error', (error) => {
      this.captureMessage({
        type: 'process',
        level: 'error',
        content: `Process error: ${error.message}`,
        processId,
        command: fullCommand,
        error: true,
        timestamp: Date.now(),
        source: 'error'
      });
    });
  }

  monitorLogFiles() {
    console.log('   📂 Monitoring log files...');
    
    const logPatterns = [
      path.join(this.workspaceRoot, '.next/**/*.log'),
      path.join(this.workspaceRoot, 'node_modules/.cache/**/*.log'),
      path.join(this.workspaceRoot, '.vercel/**/*.log'),
      '/tmp/vercel*.log'
    ];
    
    // Use file watching to monitor log creation and changes
    try {
      fs.watch(this.workspaceRoot, { recursive: true }, (eventType, filename) => {
        if (filename && filename.includes('.log')) {
          this.processLogFile(path.join(this.workspaceRoot, filename));
        }
      });
    } catch (error) {
      console.log('   ⚠️ File watching not available:', error.message);
    }
  }

  processLogFile(logPath) {
    try {
      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, 'utf8');
        
        this.captureMessage({
          type: 'logfile',
          level: 'info',
          content,
          filepath: logPath,
          timestamp: Date.now(),
          source: 'logfile'
        });
      }
    } catch (error) {
      // Continue monitoring even if individual log files fail
    }
  }

  monitorShellHistory() {
    console.log('   🐚 Monitoring shell history...');
    
    // Monitor bash history
    const historyFile = path.join(require('os').homedir(), '.bash_history');
    if (fs.existsSync(historyFile)) {
      try {
        fs.watchFile(historyFile, () => {
          this.processShellHistory(historyFile);
        });
      } catch (error) {
        // Continue if history monitoring fails
      }
    }
  }

  processShellHistory(historyFile) {
    try {
      const content = fs.readFileSync(historyFile, 'utf8');
      const lines = content.split('\n');
      const recentCommands = lines.slice(-10); // Last 10 commands
      
      for (const command of recentCommands) {
        if (command.trim() && this.isRelevantCommand(command)) {
          this.captureMessage({
            type: 'shell',
            level: 'info',
            content: `Shell command: ${command}`,
            command,
            timestamp: Date.now(),
            source: 'shell_history'
          });
        }
      }
    } catch (error) {
      // Continue if history processing fails
    }
  }

  isRelevantCommand(command) {
    const relevantCommands = ['npm', 'node', 'next', 'vercel', 'jest', 'tsc', 'eslint', 'git'];
    return relevantCommands.some(cmd => command.includes(cmd));
  }

  startPeriodicScanning() {
    console.log('   ⏰ Starting periodic scanning...');
    
    // Scan every 5 seconds for new activity
    this.scanInterval = setInterval(() => {
      this.performPeriodicScan();
    }, 5000);
  }

  performPeriodicScan() {
    // Scan for new processes
    this.scanForNewProcesses();
    
    // Check system logs
    this.checkSystemLogs();
    
    // Monitor resource usage
    this.monitorResourceUsage();
    
    // Flush message buffer if needed
    this.flushMessageBuffer();
  }

  scanForNewProcesses() {
    try {
      const processes = execSync('ps aux | grep -E "(npm|node|next|vercel|jest|tsc|eslint)" | grep -v grep', {
        encoding: 'utf8',
        timeout: 5000
      });
      
      const processLines = processes.split('\n').filter(line => line.trim());
      
      for (const processLine of processLines) {
        const parts = processLine.trim().split(/\s+/);
        const pid = parts[1];
        const processId = `pid_${pid}`;
        
        if (!this.processMonitors.has(processId)) {
          const command = parts.slice(10).join(' ');
          
          this.captureMessage({
            type: 'scan',
            level: 'info',
            content: `New process detected: ${command}`,
            pid,
            command,
            timestamp: Date.now(),
            source: 'periodic_scan'
          });
        }
      }
    } catch (error) {
      // Continue scanning even if this fails
    }
  }

  checkSystemLogs() {
    // Check system logs for relevant entries
    try {
      const logs = execSync('tail -n 20 /var/log/system.log 2>/dev/null || echo "No system log access"', {
        encoding: 'utf8',
        timeout: 3000
      });
      
      if (logs && !logs.includes('No system log access')) {
        const relevantLines = logs.split('\n').filter(line => 
          line.includes('node') || line.includes('npm') || line.includes('vercel')
        );
        
        for (const line of relevantLines) {
          this.captureMessage({
            type: 'system',
            level: 'info',
            content: line,
            timestamp: Date.now(),
            source: 'system_log'
          });
        }
      }
    } catch (error) {
      // Continue if system log access fails
    }
  }

  monitorResourceUsage() {
    try {
      const usage = execSync('ps -eo pid,pcpu,pmem,comm | grep -E "(node|npm|next)" | head -10', {
        encoding: 'utf8',
        timeout: 3000
      });
      
      if (usage.trim()) {
        this.captureMessage({
          type: 'resource',
          level: 'info',
          content: `Resource usage:\n${usage}`,
          timestamp: Date.now(),
          source: 'resource_monitor'
        });
      }
    } catch (error) {
      // Continue if resource monitoring fails
    }
  }

  // =========================================
  // MESSAGE PROCESSING AND ANALYSIS
  // =========================================

  captureMessage(messageData) {
    // Add to buffer
    this.messageBuffer.push(messageData);
    
    // Maintain buffer size
    if (this.messageBuffer.length > this.config.bufferSize) {
      this.messageBuffer.shift();
    }
    
    // Real-time processing
    if (this.config.realTimeProcessing) {
      this.processMessageRealTime(messageData);
    }
    
    // Log to file
    this.logMessageToFile(messageData);
    
    // Emit event for listeners
    this.emit('message', messageData);
  }

  processMessageRealTime(messageData) {
    // Check for errors
    if (this.isErrorMessage(messageData)) {
      this.handleError(messageData);
    }
    
    // Check for warnings
    if (this.isWarningMessage(messageData)) {
      this.handleWarning(messageData);
    }
    
    // Check for Vercel-specific messages
    if (this.isVercelMessage(messageData)) {
      this.handleVercelMessage(messageData);
    }
    
    // Check for build-related messages
    if (this.isBuildMessage(messageData)) {
      this.handleBuildMessage(messageData);
    }
    
    // Check for test-related messages
    if (this.isTestMessage(messageData)) {
      this.handleTestMessage(messageData);
    }
  }

  isErrorMessage(messageData) {
    const content = messageData.content.toLowerCase();
    const errorPatterns = [
      'error:', 'failed', 'exception', 'fatal',
      'cannot find module', 'module not found',
      'build failed', 'compilation error',
      'typescript error', 'type error',
      'test failed', 'assertion failed',
      'enoent', 'econnrefused', 'timeout'
    ];
    
    return errorPatterns.some(pattern => content.includes(pattern)) ||
           messageData.level === 'error' ||
           messageData.level === 'stderr' ||
           messageData.error === true;
  }

  isWarningMessage(messageData) {
    const content = messageData.content.toLowerCase();
    const warningPatterns = [
      'warning:', 'warn:', 'deprecated',
      'outdated', 'vulnerable', 'security',
      'performance'
    ];
    
    return warningPatterns.some(pattern => content.includes(pattern)) ||
           messageData.level === 'warn';
  }

  isVercelMessage(messageData) {
    const content = messageData.content.toLowerCase();
    return content.includes('vercel') || 
           content.includes('deployment') ||
           messageData.command?.includes('vercel');
  }

  isBuildMessage(messageData) {
    const content = messageData.content.toLowerCase();
    return content.includes('build') ||
           content.includes('compile') ||
           content.includes('webpack') ||
           messageData.command?.includes('build');
  }

  isTestMessage(messageData) {
    const content = messageData.content.toLowerCase();
    return content.includes('test') ||
           content.includes('jest') ||
           content.includes('spec') ||
           content.includes('coverage') ||
           messageData.command?.includes('test');
  }

  handleError(messageData) {
    console.log(`❌ ERROR DETECTED: ${messageData.content.substring(0, 100)}...`);
    
    this.errorBuffer.push(messageData);
    
    // Log to error file
    const errorLogEntry = `[${new Date(messageData.timestamp).toISOString()}] ERROR: ${messageData.content}\n`;
    fs.appendFileSync(this.errorLogPath, errorLogEntry);
    
    // Emit error event
    this.emit('error', messageData);
    
    // Auto-fix if enabled
    if (this.config.autoFix) {
      this.attemptAutoFix(messageData);
    }
  }

  handleWarning(messageData) {
    console.log(`⚠️ WARNING DETECTED: ${messageData.content.substring(0, 100)}...`);
    
    this.warningBuffer.push(messageData);
    
    // Emit warning event
    this.emit('warning', messageData);
  }

  handleVercelMessage(messageData) {
    console.log(`🚀 VERCEL: ${messageData.content.substring(0, 100)}...`);
    
    // Log to Vercel file
    const vercelLogEntry = `[${new Date(messageData.timestamp).toISOString()}] ${messageData.content}\n`;
    fs.appendFileSync(this.vercelLogPath, vercelLogEntry);
    
    // Emit Vercel event
    this.emit('vercel', messageData);
    
    // Check for Vercel errors
    if (this.isErrorMessage(messageData)) {
      this.handleVercelError(messageData);
    }
  }

  handleVercelError(messageData) {
    console.log(`🚨 VERCEL ERROR: ${messageData.content.substring(0, 100)}...`);
    
    // Emit Vercel error event
    this.emit('vercelError', messageData);
    
    // Attempt to fix Vercel error
    if (this.config.autoFix) {
      this.attemptVercelFix(messageData);
    }
  }

  handleBuildMessage(messageData) {
    // Emit build event
    this.emit('build', messageData);
  }

  handleTestMessage(messageData) {
    // Emit test event
    this.emit('test', messageData);
  }

  attemptAutoFix(messageData) {
    console.log('🔧 Attempting auto-fix...');
    
    // Basic auto-fix strategies
    const content = messageData.content.toLowerCase();
    
    if (content.includes('module not found') || content.includes('cannot find module')) {
      this.fixMissingModule(messageData);
    } else if (content.includes('eslint')) {
      this.fixESLintError(messageData);
    } else if (content.includes('typescript') || content.includes('type error')) {
      this.fixTypeScriptError(messageData);
    } else if (content.includes('test')) {
      this.fixTestError(messageData);
    }
  }

  fixMissingModule(messageData) {
    // Extract module name and attempt to install
    const moduleMatch = messageData.content.match(/module '([^']+)'/i) ||
                       messageData.content.match(/Cannot find module '([^']+)'/i);
    
    if (moduleMatch) {
      const moduleName = moduleMatch[1];
      console.log(`🔧 Attempting to install missing module: ${moduleName}`);
      
      try {
        execSync(`npm install ${moduleName}`, { cwd: this.workspaceRoot, timeout: 30000 });
        console.log(`✅ Successfully installed: ${moduleName}`);
      } catch (error) {
        console.log(`❌ Failed to install: ${moduleName}`);
      }
    }
  }

  fixESLintError(messageData) {
    console.log('🔧 Attempting ESLint auto-fix...');
    
    try {
      execSync('npx eslint app/ --ext .ts,.tsx --fix', { 
        cwd: this.workspaceRoot,
        timeout: 30000
      });
      console.log('✅ ESLint auto-fix completed');
    } catch (error) {
      console.log('❌ ESLint auto-fix failed');
    }
  }

  fixTypeScriptError(messageData) {
    console.log('🔧 Attempting TypeScript fix...');
    
    // Basic TypeScript fixes could be implemented here
    console.log('⚠️ TypeScript auto-fix not implemented yet');
  }

  fixTestError(messageData) {
    console.log('🔧 Attempting test fix...');
    
    // Basic test fixes could be implemented here
    console.log('⚠️ Test auto-fix not implemented yet');
  }

  attemptVercelFix(messageData) {
    console.log('🔧 Attempting Vercel fix...');
    
    const content = messageData.content.toLowerCase();
    
    if (content.includes('build failed')) {
      this.fixVercelBuildFailure(messageData);
    } else if (content.includes('function timeout')) {
      this.fixVercelTimeout(messageData);
    } else if (content.includes('env')) {
      this.fixVercelEnvIssue(messageData);
    }
  }

  fixVercelBuildFailure(messageData) {
    console.log('🔧 Fixing Vercel build failure...');
    
    try {
      // Clear build cache and retry
      execSync('rm -rf .next .vercel', { cwd: this.workspaceRoot });
      console.log('✅ Cleared build cache');
    } catch (error) {
      console.log('❌ Failed to clear build cache');
    }
  }

  fixVercelTimeout(messageData) {
    console.log('🔧 Fixing Vercel timeout...');
    console.log('⚠️ Vercel timeout fix not implemented yet');
  }

  fixVercelEnvIssue(messageData) {
    console.log('🔧 Fixing Vercel environment issue...');
    console.log('⚠️ Vercel env fix not implemented yet');
  }

  // =========================================
  // LOGGING AND PERSISTENCE
  // =========================================

  logMessageToFile(messageData) {
    const logEntry = this.formatLogEntry(messageData);
    
    try {
      fs.appendFileSync(this.sessionLogPath, logEntry);
      
      // Rotate log if too large
      this.rotateLogIfNeeded();
    } catch (error) {
      // Continue even if logging fails
    }
  }

  formatLogEntry(messageData) {
    const timestamp = new Date(messageData.timestamp).toISOString();
    const type = messageData.type || 'unknown';
    const level = messageData.level || 'info';
    const source = messageData.source || 'unknown';
    const content = messageData.content.replace(/\n/g, '\\n');
    
    return `[${timestamp}] ${type.toUpperCase()}:${level.toUpperCase()}:${source} ${content}\n`;
  }

  rotateLogIfNeeded() {
    try {
      const stats = fs.statSync(this.sessionLogPath);
      
      if (stats.size > this.config.logRotationSize) {
        const rotatedPath = `${this.sessionLogPath}.${Date.now()}`;
        fs.renameSync(this.sessionLogPath, rotatedPath);
        
        // Create new log file
        this.initializeLogging();
        
        console.log(`📁 Log rotated: ${rotatedPath}`);
      }
    } catch (error) {
      // Continue if rotation fails
    }
  }

  flushMessageBuffer() {
    // This could be used to batch process messages or send to external systems
    if (this.messageBuffer.length > this.config.bufferSize * 0.8) {
      console.log(`📊 Message buffer: ${this.messageBuffer.length} messages`);
    }
  }

  analyzeProcessResults(processInfo) {
    console.log(`📊 Process Analysis: ${processInfo.command}`);
    console.log(`   Duration: ${processInfo.duration}ms`);
    console.log(`   Messages: ${processInfo.messages.length}`);
    console.log(`   Exit Code: ${processInfo.exitCode}`);
    
    // Analyze for patterns
    const errorMessages = processInfo.messages.filter(msg => msg.type === 'stderr');
    if (errorMessages.length > 0) {
      console.log(`   Errors: ${errorMessages.length}`);
    }
  }

  // =========================================
  // PUBLIC API
  // =========================================

  start() {
    console.log('🚀 Starting Enhanced Terminal Log Monitor...');
    
    this.startCompleteMessageCapture();
    
    console.log('✅ Terminal monitoring active');
    console.log(`📱 Session ID: ${this.sessionId}`);
    console.log(`📁 Logs Directory: ${this.logsDir}`);
    
    return this.sessionId;
  }

  stop() {
    console.log('🛑 Stopping Terminal Log Monitor...');
    
    // Clear intervals
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    // Final log
    const summary = this.generateSummary();
    fs.appendFileSync(this.sessionLogPath, `\n# Session Summary\n${JSON.stringify(summary, null, 2)}\n`);
    
    console.log('✅ Terminal monitoring stopped');
    
    return summary;
  }

  generateSummary() {
    return {
      sessionId: this.sessionId,
      endTime: new Date().toISOString(),
      totalMessages: this.messageBuffer.length,
      totalErrors: this.errorBuffer.length,
      totalWarnings: this.warningBuffer.length,
      processesMonitored: this.processMonitors.size,
      activeTerminals: this.activeTerminals.size
    };
  }

  getStats() {
    return {
      sessionId: this.sessionId,
      messageCount: this.messageBuffer.length,
      errorCount: this.errorBuffer.length,
      warningCount: this.warningBuffer.length,
      processCount: this.processMonitors.size,
      uptime: Date.now() - (this.messageBuffer[0]?.timestamp || Date.now())
    };
  }

  getRecentMessages(count = 50) {
    return this.messageBuffer.slice(-count);
  }

  getRecentErrors(count = 20) {
    return this.errorBuffer.slice(-count);
  }

  getRecentWarnings(count = 20) {
    return this.warningBuffer.slice(-count);
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new EnhancedTerminalLogMonitor();
  
  // Start monitoring
  monitor.start();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  // Keep process alive
  console.log('📱 Terminal monitor running... Press Ctrl+C to stop');
  
  // Display stats every 30 seconds
  setInterval(() => {
    const stats = monitor.getStats();
    console.log(`📊 Stats: ${stats.messageCount} messages, ${stats.errorCount} errors, ${stats.warningCount} warnings`);
  }, 30000);
}

module.exports = EnhancedTerminalLogMonitor;
