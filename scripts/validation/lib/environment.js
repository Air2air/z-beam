/**
 * Environment Detection Utilities
 * Helps validation scripts adapt to different execution contexts
 */

const isCI = !!(
  process.env.CI ||
  process.env.VERCEL ||
  process.env.GITHUB_ACTIONS ||
  process.env.GITLAB_CI ||
  process.env.CIRCLECI
);

const isBuild = !!process.env.BUILD;
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

/**
 * Check if localhost server is available
 */
async function hasLocalhost(port = 3000, timeout = 1000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`http://localhost:${port}`, {
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status < 500;
  } catch (error) {
    return false;
  }
}

/**
 * Exit gracefully if server is required but not available
 */
async function requiresServer(scriptName, port = 3000) {
  if (isCI) {
    console.log(`⏭️  Skipping ${scriptName} (requires dev server, not available in CI)`);
    process.exit(0); // Success, intentionally skipped
  }
  
  const serverAvailable = await hasLocalhost(port);
  if (!serverAvailable) {
    console.log(`⚠️  Warning: ${scriptName} requires dev server`);
    console.log(`   Start server: npm run dev`);
    console.log(`   Skipping validation...`);
    process.exit(0); // Non-critical, skip gracefully
  }
}

/**
 * Check if script should skip in current environment
 */
function shouldSkip(scriptName, config = {}) {
  if (config.requiresServer && isCI) {
    return { skip: true, reason: 'Requires dev server (not available in CI)' };
  }
  
  if (config.requiresBuild && !isBuild) {
    return { skip: true, reason: 'Requires production build' };
  }
  
  if (config.localOnly && isCI) {
    return { skip: true, reason: 'Local development only' };
  }
  
  return { skip: false };
}

module.exports = {
  isCI,
  isBuild,
  isProduction,
  isTest,
  hasLocalhost,
  requiresServer,
  shouldSkip,
  
  // Environment info for logging
  getEnvironmentInfo() {
    return {
      isCI,
      isBuild,
      isProduction,
      isTest,
      nodeVersion: process.version,
      platform: process.platform
    };
  }
};
