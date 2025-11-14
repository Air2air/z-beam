/**
 * Parallel Validation Runner
 * Runs multiple validations concurrently to save time
 */

const { spawn } = require('child_process');
const config = require('../config');

/**
 * Run a single command and capture result
 */
async function runCommand(name, command, timeout = 120000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const proc = spawn('bash', ['-c', command], {
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' }
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Timeout handler
    const timeoutId = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        name,
        success: false,
        duration: ((Date.now() - start) / 1000).toFixed(1),
        output: `Timeout after ${timeout / 1000}s`,
        timedOut: true
      });
    }, timeout);
    
    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      const output = code !== 0 ? (stderr || stdout).trim() : null;
      
      resolve({
        name,
        success: code === 0,
        duration,
        output,
        code,
        timedOut: false
      });
    });
    
    proc.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        name,
        success: false,
        duration: ((Date.now() - start) / 1000).toFixed(1),
        output: error.message,
        error: true
      });
    });
  });
}

/**
 * Run validations in parallel with concurrency limit
 */
async function runParallel(validations, options = {}) {
  const maxConcurrent = options.maxConcurrent || config.parallel.maxConcurrent || 5;
  const timeout = options.timeout || config.parallel.timeout || 120000;
  const showProgress = options.showProgress !== false;
  
  if (showProgress) {
    console.log(`🔄 Running ${validations.length} validations in parallel (max ${maxConcurrent} concurrent)...`);
    console.log('');
  }
  
  const results = [];
  const queue = [...validations];
  const running = new Set();
  
  // Process queue with concurrency limit
  const processNext = async () => {
    while (queue.length > 0 && running.size < maxConcurrent) {
      const validation = queue.shift();
      const promise = runCommand(validation.name, validation.command, timeout);
      running.add(promise);
      
      promise.then((result) => {
        running.delete(promise);
        results.push(result);
        
        if (showProgress) {
          const icon = result.success ? '✅' : result.timedOut ? '⏱️' : '❌';
          console.log(`${icon} ${result.name} (${result.duration}s)`);
        }
        
        // Start next validation
        processNext();
      });
    }
  };
  
  // Start initial batch
  await processNext();
  
  // Wait for all running validations to complete
  while (running.size > 0) {
    await Promise.race(running);
  }
  
  // Print summary
  if (showProgress) {
    printSummary(results);
  }
  
  return results;
}

/**
 * Print summary of parallel execution results
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 Parallel Validation Summary');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success && !r.timedOut);
  const timedOut = results.filter(r => r.timedOut);
  
  console.log(`  ✅ Passed:    ${passed.length}`);
  console.log(`  ❌ Failed:    ${failed.length}`);
  if (timedOut.length > 0) {
    console.log(`  ⏱️  Timed out: ${timedOut.length}`);
  }
  
  const totalTime = results.reduce((sum, r) => sum + parseFloat(r.duration), 0);
  const maxTime = Math.max(...results.map(r => parseFloat(r.duration)));
  console.log(`  ⏱️  Total:     ${totalTime.toFixed(1)}s (parallel: ~${maxTime.toFixed(1)}s)`);
  console.log('='.repeat(80));
  
  // Show failures
  if (failed.length > 0) {
    console.log('\n❌ FAILURES:');
    failed.forEach((f, i) => {
      console.log(`\n${i + 1}. ${f.name}`);
      if (f.output) {
        // Show last 10 lines of output
        const lines = f.output.split('\n').filter(l => l.trim());
        const preview = lines.slice(-10).join('\n');
        console.log(`   ${preview.split('\n').join('\n   ')}`);
      }
    });
  }
  
  // Show timeouts
  if (timedOut.length > 0) {
    console.log('\n⏱️  TIMEOUTS:');
    timedOut.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} - exceeded ${t.output}`);
    });
  }
  
  console.log('');
}

/**
 * Helper to create validation definitions
 */
function validation(name, command) {
  return { name, command };
}

/**
 * Exit with appropriate code based on results
 */
function exitWithResults(results) {
  const hasFailures = results.some(r => !r.success);
  process.exit(hasFailures ? 1 : 0);
}

module.exports = {
  runCommand,
  runParallel,
  printSummary,
  validation,
  exitWithResults
};
