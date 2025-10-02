#!/usr/bin/env node

/**
 * VERCEL ERROR ANALYZER FOR COPILOT
 * ==================================
 * Analyzes Vercel deployment errors and suggests fixes
 * Run this after a failed deployment to get actionable insights
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Common error patterns and their fixes
const errorPatterns = [
  {
    pattern: /Module not found: Can't resolve ['"]([^'"]+)['"]/i,
    category: 'Missing Module',
    getSuggestion: (match) => ({
      problem: `Module not found: ${match[1]}`,
      likelyCause: 'Missing dependency or incorrect import path',
      fixes: [
        `Check if the file exists: ${match[1]}`,
        `Verify the import path is correct (case-sensitive)`,
        `If it's a dependency, run: npm install ${match[1].split('/')[0]}`,
        `Check package.json dependencies`,
      ]
    })
  },
  {
    pattern: /Cannot find module ['"]([^'"]+)['"]/i,
    category: 'Missing Module',
    getSuggestion: (match) => ({
      problem: `Cannot find module: ${match[1]}`,
      likelyCause: 'Missing file or dependency',
      fixes: [
        `Install the package: npm install ${match[1]}`,
        `Verify the file exists in your project`,
        `Check import statement syntax`,
      ]
    })
  },
  {
    pattern: /Type error: (.+)/i,
    category: 'TypeScript Error',
    getSuggestion: (match) => ({
      problem: `TypeScript error: ${match[1]}`,
      likelyCause: 'Type mismatch or missing type definitions',
      fixes: [
        `Run type check locally: npm run type-check`,
        `Fix the type error in your code`,
        `Add @types packages if needed`,
        `Check tsconfig.json configuration`,
      ]
    })
  },
  {
    pattern: /error TS\d+: (.+)/i,
    category: 'TypeScript Compiler Error',
    getSuggestion: (match) => ({
      problem: `TypeScript compilation error: ${match[1]}`,
      likelyCause: 'Type checking failed during build',
      fixes: [
        `Run: npm run type-check`,
        `Fix type errors in the code`,
        `Update TypeScript definitions`,
      ]
    })
  },
  {
    pattern: /ENOENT: no such file or directory, open ['"]([^'"]+)['"]/i,
    category: 'File Not Found',
    getSuggestion: (match) => ({
      problem: `File not found: ${match[1]}`,
      likelyCause: 'Missing file in repository',
      fixes: [
        `Verify the file exists: ${match[1]}`,
        `Check if file was committed to git`,
        `Verify .gitignore isn't excluding the file`,
        `Check if path is correct (case-sensitive on Linux)`,
      ]
    })
  },
  {
    pattern: /Build failed with exit code: (\d+)/i,
    category: 'Build Failure',
    getSuggestion: (match) => ({
      problem: `Build process failed with exit code ${match[1]}`,
      likelyCause: 'Build script encountered an error',
      fixes: [
        `Run build locally: npm run build`,
        `Check build logs for specific errors`,
        `Verify all dependencies are installed`,
        `Check Node.js version compatibility`,
      ]
    })
  },
  {
    pattern: /Out of memory/i,
    category: 'Memory Error',
    getSuggestion: () => ({
      problem: 'Build ran out of memory',
      likelyCause: 'Build process consuming too much memory',
      fixes: [
        `Increase function memory in vercel.json`,
        `Optimize build process`,
        `Split large builds into smaller chunks`,
        `Check for memory leaks in build scripts`,
      ]
    })
  },
  {
    pattern: /ELIFECYCLE/i,
    category: 'NPM Script Error',
    getSuggestion: () => ({
      problem: 'NPM script failed during execution',
      likelyCause: 'Build or install script returned non-zero exit code',
      fixes: [
        `Check package.json scripts`,
        `Run the failing script locally`,
        `Verify all dependencies are correct`,
        `Check for syntax errors in scripts`,
      ]
    })
  },
  {
    pattern: /Unexpected token/i,
    category: 'Syntax Error',
    getSuggestion: (match) => ({
      problem: 'JavaScript/TypeScript syntax error',
      likelyCause: 'Invalid syntax in source code',
      fixes: [
        `Run linter: npm run lint`,
        `Check for syntax errors in recent changes`,
        `Verify Babel/TypeScript configuration`,
        `Test build locally: npm run build`,
      ]
    })
  },
  {
    pattern: /Missing environment variable[s]?: ['"]?([^'"]+)['"]?/i,
    category: 'Environment Variable',
    getSuggestion: (match) => ({
      problem: `Missing environment variable: ${match[1]}`,
      likelyCause: 'Required environment variable not set in Vercel',
      fixes: [
        `Add variable in Vercel dashboard: Settings > Environment Variables`,
        `Or use Vercel CLI: vercel env add ${match[1]}`,
        `Check .env.example for required variables`,
        `Verify variable name spelling`,
      ]
    })
  },
  {
    pattern: /process\.env\.(\w+) is undefined/i,
    category: 'Environment Variable',
    getSuggestion: (match) => ({
      problem: `Undefined environment variable: ${match[1]}`,
      likelyCause: 'Environment variable not configured',
      fixes: [
        `Add ${match[1]} to Vercel environment variables`,
        `Check if variable is needed for build vs runtime`,
        `Add NEXT_PUBLIC_ prefix if needed in client code`,
        `Verify .env.local is not in .gitignore`,
      ]
    })
  },
  {
    pattern: /API route \/api\/([^\s]+) (failed|error)/i,
    category: 'API Route Error',
    getSuggestion: (match) => ({
      problem: `API route error: /api/${match[1]}`,
      likelyCause: 'API route handler has an error',
      fixes: [
        `Check app/api/${match[1]}/route.ts for errors`,
        `Verify API route exports correct HTTP methods`,
        `Check for async/await issues`,
        `Test API route locally: npm run dev`,
      ]
    })
  },
  {
    pattern: /Middleware error/i,
    category: 'Middleware Error',
    getSuggestion: () => ({
      problem: 'Error in Next.js middleware',
      likelyCause: 'middleware.ts has an error or invalid matcher',
      fixes: [
        `Check middleware.ts syntax`,
        `Verify matcher patterns are valid`,
        `Test middleware logic locally`,
        `Check for async/await issues in middleware`,
      ]
    })
  },
  {
    pattern: /Edge Runtime/i,
    category: 'Edge Runtime Error',
    getSuggestion: () => ({
      problem: 'Edge Runtime compatibility issue',
      likelyCause: 'Using Node.js APIs not available in Edge Runtime',
      fixes: [
        `Remove Node.js-specific APIs (fs, path, etc.)`,
        `Use edge-compatible alternatives`,
        `Add "export const runtime = 'nodejs'" if needed`,
        `Check Vercel Edge Runtime documentation`,
      ]
    })
  },
  {
    pattern: /Invalid page config/i,
    category: 'Page Configuration',
    getSuggestion: () => ({
      problem: 'Invalid page configuration',
      likelyCause: 'Incorrect export in page file',
      fixes: [
        `Check page config exports`,
        `Verify runtime config syntax`,
        `Remove unsupported config options`,
        `Test page locally: npm run dev`,
      ]
    })
  },
  {
    pattern: /webpack|Webpack/,
    category: 'Webpack Build Error',
    getSuggestion: () => ({
      problem: 'Webpack build error',
      likelyCause: 'Issue with webpack configuration or module bundling',
      fixes: [
        `Check next.config.js webpack customizations`,
        `Verify all imports are correct`,
        `Clear .next folder and rebuild`,
        `Check for circular dependencies`,
      ]
    })
  },
  {
    pattern: /Image optimization error/i,
    category: 'Image Optimization',
    getSuggestion: () => ({
      problem: 'Next.js Image optimization failed',
      likelyCause: 'Issue with next/image or image source',
      fixes: [
        `Verify image sources are accessible`,
        `Check next.config.js images configuration`,
        `Ensure remote image domains are allowed`,
        `Test image loading locally`,
      ]
    })
  },
];

function analyzeErrorLog(logContent) {
  log('\n🔍 ANALYZING DEPLOYMENT ERRORS', colors.bright + colors.cyan);
  log('═══════════════════════════════════════════════════\n', colors.cyan);
  
  const findings = [];
  const lines = logContent.split('\n');
  
  // Track error context
  let errorContext = [];
  let inErrorBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect error blocks
    if (line.match(/error|failed|fatal/i)) {
      inErrorBlock = true;
      errorContext = [line];
    } else if (inErrorBlock) {
      errorContext.push(line);
      if (errorContext.length > 10) {
        inErrorBlock = false;
      }
    }
    
    // Check each error pattern
    for (const errorPattern of errorPatterns) {
      const match = line.match(errorPattern.pattern);
      if (match) {
        const suggestion = errorPattern.getSuggestion(match);
        findings.push({
          category: errorPattern.category,
          line: i + 1,
          context: errorContext.join('\n'),
          ...suggestion
        });
        inErrorBlock = false;
        errorContext = [];
      }
    }
  }
  
  return findings;
}

function generateFixReport(findings) {
  if (findings.length === 0) {
    log('✅ No common error patterns detected', colors.green);
    log('\n💡 Review the full logs in .vercel-deployment-error.log', colors.cyan);
    return;
  }
  
  log(`Found ${findings.length} issue(s):\n`, colors.yellow);
  
  findings.forEach((finding, index) => {
    log(`\n┌─ Issue #${index + 1}: ${finding.category}`, colors.red + colors.bright);
    log(`├─ Line: ${finding.line}`, colors.reset);
    log(`├─ Problem: ${finding.problem}`, colors.red);
    log(`├─ Likely Cause: ${finding.likelyCause}`, colors.yellow);
    log(`└─ Suggested Fixes:`, colors.green);
    
    finding.fixes.forEach((fix, fixIndex) => {
      log(`   ${fixIndex + 1}. ${fix}`, colors.cyan);
    });
  });
  
  // Generate Copilot-friendly summary
  log('\n\n📋 COPILOT FIX PROMPT', colors.bright + colors.blue);
  log('═══════════════════════════════════════════════════', colors.blue);
  log('\nCopy this to Copilot:\n', colors.cyan);
  
  const copilotPrompt = `The deployment failed with the following errors:

${findings.map((f, i) => `${i + 1}. ${f.category}: ${f.problem}
   Cause: ${f.likelyCause}
   Suggested fixes:
${f.fixes.map((fix, j) => `   - ${fix}`).join('\n')}`).join('\n\n')}

Please analyze these errors and create the necessary fixes.`;
  
  console.log(copilotPrompt);
  log('\n═══════════════════════════════════════════════════', colors.blue);
  
  // Save Copilot prompt to file
  fs.writeFileSync('.vercel-error-analysis.txt', copilotPrompt);
  log('\n💾 Analysis saved to: .vercel-error-analysis.txt', colors.green);
  log('💡 You can open this file and ask Copilot to fix the issues\n', colors.cyan);
}

function main() {
  const errorLogPath = '.vercel-deployment-error.log';
  
  log('\n🔧 VERCEL ERROR ANALYZER', colors.bright + colors.cyan);
  log('═══════════════════════════════════════════════════\n', colors.cyan);
  
  // Check if error log exists
  if (!fs.existsSync(errorLogPath)) {
    log('❌ No error log found at .vercel-deployment-error.log', colors.red);
    log('\n💡 This file is created automatically when a deployment fails', colors.cyan);
    log('💡 Try pushing to main again to trigger monitoring\n', colors.cyan);
    process.exit(1);
  }
  
  // Read error log
  log('📖 Reading error log...', colors.blue);
  const logContent = fs.readFileSync(errorLogPath, 'utf-8');
  
  if (!logContent.trim()) {
    log('⚠️  Error log is empty', colors.yellow);
    log('💡 Try fetching logs manually: vercel logs\n', colors.cyan);
    process.exit(1);
  }
  
  // Analyze errors
  const findings = analyzeErrorLog(logContent);
  
  // Generate report
  generateFixReport(findings);
  
  log('\n✅ Analysis complete!\n', colors.green);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    log(`\n❌ Error during analysis: ${error.message}`, colors.red);
    process.exit(1);
  }
}

module.exports = { analyzeErrorLog, generateFixReport };
