# Deployment Scripts

This directory contains scripts for deploying the Z-Beam application to Vercel.

## Scripts Overview

### 1. `deploy-with-validation.sh` (RECOMMENDED)
**Complete deployment pipeline with pre-deployment validations**

Runs comprehensive checks before deploying:
- ✅ TypeScript type checking
- ✅ ESLint linting
- ✅ Unit tests
- ✅ Deployment tests
- ✅ JSON-LD validation
- ✅ Metadata validation
- ✅ Production build
- ✅ Build artifact verification

**Usage:**
```bash
# Run all validations and deploy
./scripts/deployment/deploy-with-validation.sh

# Deploy with monitoring
./scripts/deployment/deploy-with-validation.sh --monitor

# Skip validation (not recommended)
./scripts/deployment/deploy-with-validation.sh --skip-validation

# Show help
./scripts/deployment/deploy-with-validation.sh --help
```

**Recommended for:**
- Production deployments
- Feature releases
- Major updates
- When you want to ensure everything is working

---

### 2. `smart-deploy.sh`
**Quick deployment without pre-validation**

Deploys directly to Vercel without running validations. Useful for hotfixes or when you've already validated locally.

**Usage:**
```bash
# Deploy to production
./scripts/deployment/smart-deploy.sh deploy

# Deploy and start monitoring
./scripts/deployment/smart-deploy.sh deploy-monitor

# Start monitoring
./scripts/deployment/smart-deploy.sh start

# Check status
./scripts/deployment/smart-deploy.sh status

# Show logs
./scripts/deployment/smart-deploy.sh logs

# Show recent deployments
./scripts/deployment/smart-deploy.sh list

# Stop monitoring
./scripts/deployment/smart-deploy.sh stop
```

**Recommended for:**
- Hotfixes
- Quick iterations during development
- When you've already run validations manually

---

### 3. `deploy-triggered-monitor.sh`
**Deployment monitoring utility**

Monitors active Vercel deployments and provides real-time status updates.

**Usage:**
```bash
# Start monitoring
./scripts/deployment/deploy-triggered-monitor.sh start

# Monitor specific URL
./scripts/deployment/deploy-triggered-monitor.sh monitor <url>

# Check status
./scripts/deployment/deploy-triggered-monitor.sh status

# Stop monitoring
./scripts/deployment/deploy-triggered-monitor.sh stop
```

---

## Deployment Workflow

### Standard Deployment (Recommended)

```bash
# 1. Make your changes
git add .
git commit -m "feat: your changes"
git push

# 2. Run deployment with validation
./scripts/deployment/deploy-with-validation.sh

# 3. Monitor in production
# The script will provide URLs to test
```

### Quick Deployment (Skip Validation)

```bash
# Only use if you've already validated manually
./scripts/deployment/smart-deploy.sh deploy
```

### Manual Pre-Deployment Validation

```bash
# Run validation steps individually
npm run type-check                      # TypeScript
npm run lint                            # ESLint
npm run test:unit                       # Unit tests
npm run test:deployment                 # Deployment tests
npm run build                           # Production build
node scripts/validate-jsonld-rendering.js  # JSON-LD
node scripts/validate-metadata-sync.js     # Metadata

# Then deploy
./scripts/deployment/smart-deploy.sh deploy
```

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass (`npm run test:deployment`)
- [ ] Build completes successfully (`npm run build`)
- [ ] TypeScript has no errors (`npm run type-check`)
- [ ] JSON-LD schemas are valid
- [ ] No uncommitted changes (or intentionally deploying uncommitted work)
- [ ] On main branch (or know which branch you're deploying)
- [ ] Reviewed recent changes

The `deploy-with-validation.sh` script automates this entire checklist!

---

## Validation Pipeline Details

The automated validation pipeline runs **23 comprehensive checks** in order:

### Foundation Checks (5 steps)

#### 1. Git Status Check
- Shows current branch and commit info
- Lists uncommitted changes  
- Displays commit message
- **Non-critical** - informational only

#### 2. File Naming Conventions
- Runs `npm run validate:naming`
- Ensures consistent file naming across project
- **Critical** - deployment aborts if failed

#### 3. Metadata Synchronization
- Runs `npm run validate:metadata`
- Validates frontmatter metadata consistency
- **Critical** - deployment aborts if failed

#### 4. TypeScript Type Checking
- Runs `npm run type-check`
- Ensures no type errors
- **Critical** - deployment aborts if failed

#### 5. Code Quality (ESLint)
- Runs `npm run lint`
- Checks code quality and standards
- **Non-critical** - warnings only

### Content & Structure Validation (6 steps)

#### 6. Sitemap Verification
- Runs `bash scripts/sitemap/verify-sitemap.sh`
- Validates sitemap structure and completeness
- Checks all required routes present
- Verifies material categories
- **Critical** - deployment aborts if failed

#### 7. Content Validation
- Runs `npm run validate:content` and `npm run validate:startup`
- Validates all content integrity
- Checks for broken references
- **Non-critical** - warnings only

#### 8-11. JSON-LD Schema Validation (4 sub-checks)
- **Architecture**: `npm run validate:jsonld` - Validates schema patterns
- **Rendering**: `node scripts/validate-jsonld-rendering.js` - Ensures schemas render in HTML
- **Syntax**: `node scripts/validate-jsonld-syntax.js` - Validates JSON-LD syntax
- **URLs**: `node scripts/validate-jsonld-urls.js` - Checks all schema URLs
- **Critical** (architecture, rendering, syntax) - deployment aborts if failed
- **Non-critical** (URLs) - warnings only

### Architecture & Routing (3 steps)

#### 12. Component Architecture Audit
- Runs `npm run audit:components`
- Validates component structure and patterns
- **Non-critical** - warnings only

#### 13. Grok Validation
- Runs `npm run validate:grok`
- Validates build configuration
- **Non-critical** - warnings only

#### 14. Redirects & Routing
- Runs `npm run validate:redirects`
- Validates redirect rules
- **Non-critical** - warnings only

### Test Suites (5 steps)

#### 15. Unit Tests
- Runs `npm run test:unit`
- Validates core utility functions
- **Critical** - deployment aborts if failed

#### 16. Integration Tests
- Runs `npm run test:integration`
- Tests component integration
- **Non-critical** - warnings only

#### 17. Component Tests
- Runs `npm run test:components`
- Tests React components
- **Non-critical** - warnings only

#### 18. Sitemap Tests
- Runs `npm run test:sitemap`
- Validates sitemap generation
- **Critical** - deployment aborts if failed

#### 19. Deployment Tests
- Runs `npm run test:deployment`
- Tests production-specific scenarios
- **Critical** - deployment aborts if failed

### Build & Artifacts (4 steps)

#### 20. Production Build
- Runs `npm run build:fast`
- Builds optimized production bundle
- Includes dataset generation
- **Critical** - deployment aborts if failed

#### 21. Build Artifact Verification
- Verifies `.next` directory exists
- Checks for BUILD_ID, server, and static directories
- Reports build size
- **Critical** - deployment aborts if missing

#### 22. Post-Build URL Validation
- Runs `npm run validate:urls`
- Validates all generated URLs
- **Critical** - deployment aborts if failed

#### 23. Dataset Generation Check
- Verifies `public/datasets` directory
- Counts generated dataset files
- **Non-critical** - informational only

---

## Environment Variables

Deployment scripts use these environment variables:

- `VERCEL_TOKEN` - Vercel authentication token (if using CI/CD)
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

For local deployments, these are read from `.vercel/project.json`.

---

## Troubleshooting

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Build failed"
Check the error output and fix the issues. Common problems:
- TypeScript errors
- Missing dependencies
- Invalid configuration

### "Tests failed"
Run tests locally to see detailed output:
```bash
npm run test:deployment -- --verbose
```

### "JSON-LD validation failed"
Run validation script to see specific issues:
```bash
node scripts/validate-jsonld-rendering.js
```

### Skip Validation (Use with Caution)
If you need to deploy urgently despite validation failures:
```bash
./scripts/deployment/deploy-with-validation.sh --skip-validation
```

⚠️ **Warning:** Skipping validation may deploy broken code to production!

---

## CI/CD Integration

To use these scripts in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Deploy to Production
  run: ./scripts/deployment/deploy-with-validation.sh --skip-validation
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

Note: Use `--skip-validation` in CI if you're already running checks as separate CI steps.

---

## Best Practices

1. **Always use `deploy-with-validation.sh` for production deployments**
2. **Review validation output carefully**
3. **Don't skip validation unless absolutely necessary**
4. **Test in preview deployments before production**
5. **Monitor deployments after deploying**
6. **Keep validation scripts up to date**

---

## Quick Reference

```bash
# Recommended: Full validation + deployment
./scripts/deployment/deploy-with-validation.sh

# Quick deployment (no validation)
./scripts/deployment/smart-deploy.sh deploy

# Deploy with monitoring
./scripts/deployment/deploy-with-validation.sh --monitor

# Manual validation only
npm run validate:deployment

# Monitor active deployment
./scripts/deployment/smart-deploy.sh monitor
```

---

## Questions?

See the main project documentation or run:
```bash
./scripts/deployment/deploy-with-validation.sh --help
./scripts/deployment/smart-deploy.sh help
```
