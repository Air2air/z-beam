#!/usr/bin/env node

/**
 * DEPLOYMENT SYSTEM HEALTH CHECK
 * ===============================
 * Validates that the deployment monitoring system is properly configured
 * and all dependencies are working correctly.
 * 
 * Run this to diagnose issues before deploying.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function execCommand(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: output?.trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout?.toString() || error.stderr?.toString() 
    };
  }
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`  ✅ ${description}`, colors.green);
    return true;
  } else {
    log(`  ❌ ${description}`, colors.red);
    log(`     Missing: ${filePath}`, colors.yellow);
    return false;
  }
}

function checkExecutable(filePath, description) {
  if (!fs.existsSync(filePath)) {
    log(`  ❌ ${description}`, colors.red);
    log(`     Missing: ${filePath}`, colors.yellow);
    return false;
  }
  
  try {
    const stats = fs.statSync(filePath);
    const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
    
    if (isExecutable) {
      log(`  ✅ ${description}`, colors.green);
      return true;
    } else {
      log(`  ⚠️  ${description} (not executable)`, colors.yellow);
      log(`     Fix: chmod +x ${filePath}`, colors.cyan);
      return false;
    }
  } catch (error) {
    log(`  ❌ ${description}`, colors.red);
    log(`     Error: ${error.message}`, colors.yellow);
    return false;
  }
}

function checkCommand(command, description, versionFlag = '--version') {
  const result = execCommand(`${command} ${versionFlag} 2>&1`, true);
  
  if (result.success) {
    const version = result.output.split('\n')[0].substring(0, 60);
    log(`  ✅ ${description}`, colors.green);
    log(`     ${version}`, colors.cyan);
    return true;
  } else {
    log(`  ❌ ${description}`, colors.red);
    log(`     Not found or not working`, colors.yellow);
    return false;
  }
}

function checkGitHook(hookName) {
  const hookPath = path.join(process.cwd(), '.git', 'hooks', hookName);
  
  if (!fs.existsSync(hookPath)) {
    log(`  ❌ ${hookName} hook`, colors.red);
    log(`     Missing: ${hookPath}`, colors.yellow);
    log(`     Fix: npm run setup:hooks`, colors.cyan);
    return false;
  }
  
  const stats = fs.statSync(hookPath);
  const isExecutable = !!(stats.mode & fs.constants.S_IXUSR);
  
  if (!isExecutable) {
    log(`  ⚠️  ${hookName} hook (not executable)`, colors.yellow);
    log(`     Fix: chmod +x ${hookPath}`, colors.cyan);
    return false;
  }
  
  // Check hook content
  const content = fs.readFileSync(hookPath, 'utf-8');
  const hasMonitor = content.includes('monitor-deployment');
  
  if (!hasMonitor) {
    log(`  ⚠️  ${hookName} hook (no monitor call)`, colors.yellow);
    log(`     Hook exists but doesn't call monitor script`, colors.yellow);
    return false;
  }
  
  log(`  ✅ ${hookName} hook`, colors.green);
  return true;
}

function checkVercelAuth() {
  const result = execCommand('vercel whoami 2>&1', true);
  
  if (result.success && result.output && !result.output.includes('Error')) {
    log(`  ✅ Vercel authentication`, colors.green);
    log(`     Logged in as: ${result.output}`, colors.cyan);
    return true;
  } else {
    log(`  ❌ Vercel authentication`, colors.red);
    log(`     Not logged in`, colors.yellow);
    log(`     Fix: vercel login`, colors.cyan);
    return false;
  }
}

function checkVercelProject() {
  const result = execCommand('vercel project ls 2>&1', true);
  
  if (result.success) {
    log(`  ✅ Vercel project linked`, colors.green);
    return true;
  } else {
    log(`  ⚠️  Vercel project`, colors.yellow);
    log(`     Project may not be linked`, colors.yellow);
    log(`     Fix: vercel link`, colors.cyan);
    return false;
  }
}

function checkNodeVersion() {
  const result = execCommand('node --version', true);
  
  if (result.success) {
    const version = result.output.replace('v', '');
    const major = parseInt(version.split('.')[0]);
    
    if (major >= 18) {
      log(`  ✅ Node.js version`, colors.green);
      log(`     ${result.output}`, colors.cyan);
      return true;
    } else {
      log(`  ⚠️  Node.js version`, colors.yellow);
      log(`     ${result.output} (recommend >= 18)`, colors.yellow);
      return false;
    }
  } else {
    log(`  ❌ Node.js version`, colors.red);
    return false;
  }
}

function checkGitRemote() {
  const result = execCommand('git remote -v 2>&1', true);
  
  if (result.success && result.output) {
    const hasOrigin = result.output.includes('origin');
    const hasGithub = result.output.includes('github.com');
    
    if (hasOrigin && hasGithub) {
      log(`  ✅ Git remote configured`, colors.green);
      return true;
    } else if (hasOrigin) {
      log(`  ⚠️  Git remote configured (not GitHub)`, colors.yellow);
      log(`     Auto-monitoring works best with GitHub`, colors.yellow);
      return false;
    }
  }
  
  log(`  ❌ Git remote not configured`, colors.red);
  log(`     Fix: git remote add origin <url>`, colors.cyan);
  return false;
}

function runHealthCheck() {
  log('\n🏥 DEPLOYMENT SYSTEM HEALTH CHECK', colors.bright + colors.cyan);
  log('═══════════════════════════════════════════════════\n', colors.cyan);
  
  const checks = {
    critical: [],
    recommended: [],
    optional: []
  };
  
  // Critical checks
  log('🔴 Critical Requirements:', colors.bright + colors.red);
  checks.critical.push(checkNodeVersion());
  checks.critical.push(checkCommand('git', 'Git'));
  checks.critical.push(checkCommand('vercel', 'Vercel CLI', '--version'));
  checks.critical.push(checkVercelAuth());
  
  // Deployment scripts
  log('\n🔵 Deployment Scripts:', colors.bright + colors.blue);
  const scriptsDir = path.join(process.cwd(), 'scripts', 'deployment');
  checks.critical.push(checkFile(
    path.join(scriptsDir, 'monitor-deployment.js'),
    'Monitor script'
  ));
  checks.critical.push(checkFile(
    path.join(scriptsDir, 'analyze-deployment-error.js'),
    'Error analyzer script'
  ));
  checks.recommended.push(checkExecutable(
    path.join(scriptsDir, 'monitor-deployment.js'),
    'Monitor executable'
  ));
  checks.recommended.push(checkExecutable(
    path.join(scriptsDir, 'analyze-deployment-error.js'),
    'Analyzer executable'
  ));
  
  // Git hooks
  log('\n🟡 Git Hooks:', colors.bright + colors.yellow);
  checks.recommended.push(checkGitHook('post-push'));
  
  // Git configuration
  log('\n🟢 Git Configuration:', colors.bright + colors.green);
  checks.recommended.push(checkGitRemote());
  checks.optional.push(checkVercelProject());
  
  // Package.json scripts
  log('\n🟣 Package Scripts:', colors.bright);
  const packageJson = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const hasDeployScript = !!pkg.scripts?.['deploy:monitor'];
    const hasSetupHooks = !!pkg.scripts?.['setup:hooks'];
    
    if (hasDeployScript) {
      log(`  ✅ deploy:monitor script`, colors.green);
      checks.optional.push(true);
    } else {
      log(`  ⚠️  deploy:monitor script missing`, colors.yellow);
      checks.optional.push(false);
    }
    
    if (hasSetupHooks) {
      log(`  ✅ setup:hooks script`, colors.green);
      checks.optional.push(true);
    } else {
      log(`  ⚠️  setup:hooks script missing`, colors.yellow);
      checks.optional.push(false);
    }
  }
  
  // Documentation
  log('\n📚 Documentation:', colors.bright);
  const docs = [
    'DEPLOYMENT_ERROR_SYSTEM_COMPLETE.md',
    'scripts/deployment/README.md'
  ];
  docs.forEach(doc => {
    checks.optional.push(checkFile(
      path.join(process.cwd(), doc),
      path.basename(doc)
    ));
  });
  
  // Summary
  log('\n═══════════════════════════════════════════════════', colors.cyan);
  log('📊 HEALTH CHECK SUMMARY', colors.bright + colors.cyan);
  log('═══════════════════════════════════════════════════\n', colors.cyan);
  
  const criticalPass = checks.critical.filter(Boolean).length;
  const criticalTotal = checks.critical.length;
  const recommendedPass = checks.recommended.filter(Boolean).length;
  const recommendedTotal = checks.recommended.length;
  const optionalPass = checks.optional.filter(Boolean).length;
  const optionalTotal = checks.optional.length;
  
  log(`🔴 Critical:     ${criticalPass}/${criticalTotal} passing`, 
    criticalPass === criticalTotal ? colors.green : colors.red);
  log(`🟡 Recommended:  ${recommendedPass}/${recommendedTotal} passing`,
    recommendedPass === recommendedTotal ? colors.green : colors.yellow);
  log(`🟢 Optional:     ${optionalPass}/${optionalTotal} passing`, colors.cyan);
  
  const overallHealth = (
    (criticalPass / criticalTotal) * 60 +
    (recommendedPass / recommendedTotal) * 30 +
    (optionalPass / optionalTotal) * 10
  );
  
  log(`\n🏥 Overall Health: ${Math.round(overallHealth)}%`, 
    overallHealth >= 90 ? colors.green :
    overallHealth >= 70 ? colors.yellow : colors.red);
  
  if (criticalPass === criticalTotal && recommendedPass === recommendedTotal) {
    log('\n✅ System is ready for deployment!', colors.bright + colors.green);
    log('💡 Run: git push origin main', colors.cyan);
    log('   Monitoring will start automatically\n', colors.cyan);
    return 0;
  } else if (criticalPass === criticalTotal) {
    log('\n⚠️  System is functional but not optimal', colors.yellow);
    log('💡 Fix recommended issues for best experience\n', colors.cyan);
    return 0;
  } else {
    log('\n❌ System has critical issues', colors.red);
    log('💡 Fix critical issues before deploying\n', colors.cyan);
    return 1;
  }
}

// Main execution
if (require.main === module) {
  const exitCode = runHealthCheck();
  process.exit(exitCode);
}

module.exports = { runHealthCheck };
