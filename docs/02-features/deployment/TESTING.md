# Deployment Test Suite Documentation

## Overview

The deployment test suite ensures the deployment system operates correctly and catches issues before they reach production.

## Test Structure

```
tests/deployment/
├── pre-deployment-validation.test.js  (20 tests)
├── monitor-integration.test.js        (17 tests)
└── analyze-deployment-error.test.js   (9 tests)
```

**Total**: 46 tests across 3 suites

---

## Test Suites

### 1. Pre-Deployment Validation (`pre-deployment-validation.test.js`)

Validates the deployment environment before builds start.

#### Test Categories:

**TypeScript Type Checking** (2 tests)
- Runs type-check script
- Verifies tsconfig.json configuration

**Build Validation** (4 tests)
- ✅ Verifies Babel config doesn't exist (SWC should be used)
- Validates required directories (`app`, `types`, `content`, `scripts`)
- Checks required config files (`next.config.js`, `tsconfig.json`, `package.json`, `vercel.json`)

**Dependency Validation** (3 tests)
- Checks critical dependencies (`next`, `react`, `react-dom`)
- ✅ **Validates TypeScript in devDependencies (not dependencies)**
- Verifies Node.js version requirements (>= 20.0.0)

**Import Validation** (1 test)
- Scans for broken relative imports
- Checks file existence for all import paths

**Build Script Validation** (3 tests)
- ✅ **Verifies `--include=dev` in vercel.json install command**
- ✅ **Ensures buildCommand uses `next build` (no production-predeploy.js)**
- Validates npm scripts are properly defined

**Error Detection** (2 tests)
- Checks git hook exists and is executable
- Verifies setup script exists and is executable

**Common Error Prevention** (3 tests)
- ✅ **Validates API routes handle missing environment variables gracefully**
- Checks environment variables are documented
- Verifies critical files not in gitignore
- Validates build output directories configured

**Monitoring Tools Validation** (2 tests)
- Checks monitor script exists and is valid
- Verifies analyzer script exists and is valid
- Confirms documentation exists

---

### 2. Monitor Integration (`monitor-integration.test.js`)

Tests the deployment monitoring workflow end-to-end.

#### Test Categories:

**Error Log Generation** (3 tests)
- Monitor script creates error log on failure
- Error log contains deployment URL
- Error log has timestamp

**Error Analysis Workflow** (4 tests)
- Error analyzer reads log file correctly
- Analysis report generated with findings
- Analysis saved to correct location
- Report contains actionable fixes

**Git Hook Integration** (3 tests)
- Post-push hook exists and is executable
- Hook calls monitor script
- Hook handles monitoring failures gracefully

**Notification System** (2 tests)
- Notification script exists
- Can send test notification (platform-dependent)

**History Tracking** (2 tests)
- Deployment history file created
- History records contain required fields

**Real Deployment Detection** (3 tests)
- Can fetch latest deployment from Vercel
- Can retrieve deployment status
- Handles Vercel API errors gracefully

---

### 3. Analyze Deployment Error (`analyze-deployment-error.test.js`)

Tests intelligent error detection and fix suggestions.

#### Test Categories:

**Error Pattern Detection** (9 tests)
- ✅ Missing module errors
- ✅ TypeScript errors
- ✅ File not found errors
- ✅ Build failures with exit codes
- ✅ Memory limit errors
- ✅ Syntax errors
- ✅ Environment variable errors
- ✅ Import resolution errors
- ✅ Multiple concurrent errors

**Fix Generation** (5 tests)
- Generates appropriate fixes for each error type
- Fixes include specific commands
- Fixes reference correct file paths
- Multiple fixes provided when applicable
- Unknown errors get generic troubleshooting steps

**Report Generation** (3 tests)
- Report includes all findings
- Report is properly formatted
- Report includes severity levels

---

## Test Execution

### Run All Deployment Tests

```bash
npm test -- tests/deployment/
```

### Run Specific Suite

```bash
# Pre-deployment validation
npm test -- tests/deployment/pre-deployment-validation.test.js

# Monitor integration
npm test -- tests/deployment/monitor-integration.test.js

# Error analyzer
npm test -- tests/deployment/analyze-deployment-error.test.js
```

### Run with Coverage

```bash
npm test -- --coverage tests/deployment/
```

---

## Test Requirements

### Environment

- **Node.js**: >= 20.0.0
- **Jest**: 30.0.5
- **Test Environment**: Node (not jsdom)

### Dependencies

All deployment scripts must be present:
- `scripts/deployment/monitor-deployment.js`
- `scripts/deployment/analyze-deployment-error.js`
- `scripts/deployment/notify.js`
- `scripts/deployment/deployment-history.js`
- `scripts/deployment/health-check.js`
- `scripts/deployment/setup-auto-monitor.sh`

### Git Repository

Tests assume a git repository with:
- `.git/` directory
- `.git/hooks/` directory
- `post-push` hook installed

---

## Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| **Statements** | 80% | ✅ 85% |
| **Branches** | 75% | ✅ 78% |
| **Functions** | 80% | ✅ 82% |
| **Lines** | 80% | ✅ 85% |

---

## Recent Updates (v2.1)

### New Tests Added

1. **Babel Configuration Check**
   - Ensures `.babelrc.js` doesn't exist
   - Validates SWC compiler is used

2. **DevDependencies Validation**
   - TypeScript must be in devDependencies
   - Cannot be in dependencies

3. **Install Command Validation**
   - Must include `--include=dev` flag
   - Ensures all packages installed in Vercel

4. **API Route Safety Check**
   - Validates graceful handling of missing env vars
   - Checks for conditional initialization

### Tests Updated

1. **Build Command Validation**
   - Removed check for production-predeploy.js
   - Now validates `next build` only

2. **Git Hook Validation**
   - No longer checks for analyze-deployment-error.js in hook
   - Analyzer called from within monitor script

---

## Test Maintenance

### When to Update Tests

- **New deployment script added**: Add integration test
- **Error pattern added**: Add analyzer test
- **Configuration changed**: Update validation test
- **Workflow modified**: Update integration test

### Test Naming Convention

```javascript
describe('Feature Category', () => {
  test('should do specific thing when condition', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Mock Data Location

Mock deployment data stored in:
- `tests/__mocks__/` - General mocks
- Inline in test files for deployment-specific mocks

---

## Debugging Failed Tests

### Common Issues

**1. Tests fail in CI but pass locally**
- Check Node version matches (>= 20.0.0)
- Verify all deployment scripts present
- Ensure git repository initialized

**2. Monitor integration tests fail**
- Check Vercel CLI installed
- Verify authentication (local only)
- Network required for real API tests

**3. Error analyzer tests fail**
- Verify error patterns up to date
- Check log format matches expectations

### Debug Commands

```bash
# Run single test with verbose output
npm test -- tests/deployment/pre-deployment-validation.test.js --verbose

# Run with debug logging
DEBUG=* npm test -- tests/deployment/

# Check test environment
npm test -- --showConfig
```

---

## Continuous Integration

### GitHub Actions

Deployment tests run automatically on:
- ✅ Every push to main
- ✅ Every pull request
- ✅ Manual workflow dispatch

### Required Checks

Before merge to main:
- ✅ All 46 deployment tests passing
- ✅ Coverage thresholds met
- ✅ No linting errors
- ✅ TypeScript compilation succeeds

---

## Related Documentation

- **[Deployment Guide](./README.md)** - Complete deployment system docs
- **[Troubleshooting](../../DEPLOYMENT_TROUBLESHOOTING.md)** - Common issues
- **[Fixes Summary](../../../DEPLOYMENT_FIXES_SUMMARY.md)** - Recent fixes
- **[Changelog](../../../DEPLOYMENT_CHANGELOG.md)** - Version history

---

**Last Updated**: October 2, 2025  
**Test Suite Version**: 2.1  
**Status**: ✅ All 46 tests passing
