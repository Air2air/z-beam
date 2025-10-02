/**
 * Jest Configuration for Deployment Tests
 * Runs in Node environment (no DOM)
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/deployment/**/*.test.js'],
  collectCoverageFrom: [
    'scripts/deployment/**/*.js',
    '!scripts/deployment/setup-auto-monitor.sh'
  ],
  coverageDirectory: 'coverage/deployment',
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 50,
      lines: 50
    }
  },
  // Don't load the main setup file (which includes DOM mocks)
  setupFilesAfterEnv: [],
  verbose: true
};
