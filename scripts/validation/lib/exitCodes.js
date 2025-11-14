/**
 * Standard Exit Codes for Validation Scripts
 * Provides consistent behavior across all validation scripts
 */

const EXIT_CODES = {
  SUCCESS: 0,           // All checks passed
  WARNINGS: 0,          // Non-critical issues (still allow deployment)
  CRITICAL_FAILURE: 1,  // Block deployment
  SKIPPED: 0,           // Intentionally skipped (CI environment)
  USAGE_ERROR: 2        // Script misconfigured or wrong arguments
};

/**
 * Validation Result Tracker
 * Standardizes how we collect and report validation results
 */
class ValidationResult {
  constructor(scriptName = 'Validation') {
    this.scriptName = scriptName;
    this.passed = 0;
    this.warnings = [];
    this.failures = [];
    this.skipped = [];
    this.startTime = Date.now();
  }
  
  addPassed(message) {
    this.passed++;
    if (message) {
      console.log(`✅ ${message}`);
    }
  }
  
  addWarning(message, context = null) {
    this.warnings.push({ message, context });
    console.log(`⚠️  ${message}`);
    if (context && process.env.VERBOSE) {
      console.log(`   ${context}`);
    }
  }
  
  addFailure(message, context = null, fix = null) {
    this.failures.push({ message, context, fix });
    console.error(`❌ ${message}`);
    if (context) {
      console.error(`   Context: ${context}`);
    }
    if (fix) {
      console.error(`   Fix: ${fix}`);
    }
  }
  
  addSkipped(message, reason = null) {
    this.skipped.push({ message, reason });
    console.log(`⏭️  ${message}`);
    if (reason) {
      console.log(`   Reason: ${reason}`);
    }
  }
  
  hasFailures() {
    return this.failures.length > 0;
  }
  
  hasWarnings() {
    return this.warnings.length > 0;
  }
  
  getTotal() {
    return this.passed + this.warnings.length + this.failures.length;
  }
  
  getDuration() {
    return ((Date.now() - this.startTime) / 1000).toFixed(2);
  }
  
  summary() {
    console.log('\n' + '='.repeat(80));
    console.log(`📊 ${this.scriptName} Summary`);
    console.log('='.repeat(80));
    console.log(`  ✅ Passed:   ${this.passed}`);
    console.log(`  ⚠️  Warnings: ${this.warnings.length}`);
    console.log(`  ❌ Failures: ${this.failures.length}`);
    
    if (this.skipped.length > 0) {
      console.log(`  ⏭️  Skipped:  ${this.skipped.length}`);
    }
    
    console.log(`  ⏱️  Duration: ${this.getDuration()}s`);
    console.log('='.repeat(80));
    
    if (this.failures.length > 0) {
      console.log('\n❌ FAILURES:');
      this.failures.forEach((f, i) => {
        console.log(`\n${i + 1}. ${f.message}`);
        if (f.context) console.log(`   ${f.context}`);
        if (f.fix) console.log(`   💡 ${f.fix}`);
      });
    }
    
    if (this.warnings.length > 0 && process.env.VERBOSE) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.slice(0, 10).forEach((w, i) => {
        console.log(`${i + 1}. ${w.message}`);
      });
      if (this.warnings.length > 10) {
        console.log(`... and ${this.warnings.length - 10} more warnings`);
      }
    }
    
    console.log('');
  }
  
  exit() {
    this.summary();
    
    if (this.failures.length > 0) {
      process.exit(EXIT_CODES.CRITICAL_FAILURE);
    }
    
    process.exit(EXIT_CODES.SUCCESS);
  }
}

/**
 * Validation Error Class
 * Provides structured error information with actionable fixes
 */
class ValidationError extends Error {
  constructor(message, file = null, fix = null) {
    super(message);
    this.name = 'ValidationError';
    this.file = file;
    this.fix = fix;
  }
  
  print() {
    console.error(`\n❌ ${this.message}`);
    if (this.file) {
      console.error(`   File: ${this.file}`);
    }
    if (this.fix) {
      console.error(`   💡 Fix: ${this.fix}`);
    }
    console.error('');
  }
}

module.exports = {
  EXIT_CODES,
  ValidationResult,
  ValidationError
};
