# Z-Beam Deployment System

**Version 2.1** | Last Updated: October 2, 2025

## Overview

Z-Beam uses a **production-only deployment strategy** with automatic monitoring. Every push to `main` triggers a production build on Vercel with real-time status tracking.

### Key Features

- ✅ **Automatic Deployment** - Push to main → Production deployment
- ✅ **Real-time Monitoring** - Git hook tracks deployment status
- ✅ **Desktop Notifications** - Success/failure alerts
- ✅ **Deployment History** - Track all deployments with analytics
- ✅ **Error Analysis** - Intelligent error detection and suggestions
- ✅ **Health Checks** - System validation before deployment

---

## Quick Start

### Deploy to Production

```bash
# 1. Make your changes
git add .
git commit -m "your changes"

# 2. Push to main (monitoring starts automatically)
git push origin main

# Watch the automatic monitoring output
# Desktop notification when complete
```

That's it! The system handles:
- Vercel build initiation
- Status monitoring (every 5 seconds)
- Error detection and analysis
- History logging
- Desktop notifications

### Check System Health

```bash
npm run deploy:health
```

Validates:
- Node.js version (>= 20.0.0)
- Git configuration
- Vercel CLI authentication
- Git hooks installed
- Required scripts present

---

## Architecture

### Build Configuration

#### vercel.json
```json
{
  "buildCommand": "next build",
  "installCommand": "npm ci --legacy-peer-deps --include=dev || npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Key Points:**
- **No Babel**: Uses Next.js SWC compiler (faster)
- **DevDependencies Included**: TypeScript and build tools available
- **Region**: iad1 (Washington D.C.) for consistent performance

#### package.json
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "postinstall": "bash scripts/deployment/setup-auto-monitor.sh",
    "build": "next build",
    "deploy": "./deploy-with-monitoring.sh prod"
  },
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

**Key Points:**
- **TypeScript in devDependencies**: Build-time dependency
- **Postinstall Hook**: Automatically sets up git monitoring
- **Node 20+**: Required for optimal performance

### Monitoring System

#### Components

1. **Git Hook** (`.git/hooks/post-push`)
   - Triggers after `git push`
   - Runs `monitor-deployment.js`
   - Installed automatically via `npm install`

2. **Monitor Script** (`scripts/deployment/monitor-deployment.js`)
   - Polls Vercel API every 5 seconds
   - Tracks deployment status
   - Fetches error logs on failure
   - Sends desktop notifications
   - Logs to deployment history

3. **Error Analyzer** (`scripts/deployment/analyze-deployment-error.js`)
   - Detects 17 error patterns
   - Provides specific solutions
   - Generates actionable fixes

4. **History Tracker** (`scripts/deployment/deployment-history.js`)
   - Records all deployments
   - Calculates success rate
   - Tracks average duration
   - Exports to JSON/CSV

5. **Notification System** (`scripts/deployment/notify.js`)
   - Cross-platform (macOS, Linux, Windows)
   - Success with duration
   - Failure with error type

### Deployment Flow

```
┌─────────────────┐
│  git push main  │
└────────┬────────┘
         │
         ├─► GitHub receives push
         │
         ├─► Vercel build starts
         │    ├─ npm ci --include=dev (815 packages)
         │    ├─ next build (SWC compiler)
         │    └─ Deploy to production
         │
         └─► Git hook triggers
              ├─ monitor-deployment.js
              │   ├─ Poll status every 5s
              │   ├─ Display progress
              │   └─ On failure: fetch error logs
              │
              ├─ analyze-deployment-error.js
              │   ├─ Pattern matching (17 types)
              │   └─ Generate solutions
              │
              ├─ notify.js
              │   └─ Desktop notification
              │
              └─ deployment-history.js
                  └─ Log deployment record
```

---

## Error Handling

### Automatic Error Detection

The system detects and provides fixes for:

| Error Type | Detection Pattern | Solution |
|------------|------------------|----------|
| **Missing Module** | `Cannot find module` | Install package, check imports |
| **TypeScript** | `TS[0-9]+:` | Fix type errors, check tsconfig |
| **File Not Found** | `ENOENT.*no such file` | Verify file paths, check gitignore |
| **Build Failure** | `Failed to compile` | Check syntax, dependencies |
| **Memory Limit** | `heap out of memory` | Increase function memory |
| **Syntax Error** | `SyntaxError` | Fix JavaScript/TypeScript syntax |
| **Environment Variable** | `Missing environment variable` | Set in Vercel dashboard |
| **API Route Error** | `API route.*failed` | Check route handlers |
| **Middleware Error** | `middleware.*failed` | Verify middleware config |
| **Edge Runtime** | `edge runtime.*not compatible` | Use Node.js runtime |
| **Page Config** | `Invalid page config` | Fix Next.js page configuration |
| **Webpack** | `webpack.*build.*failed` | Check webpack config |
| **Image Optimization** | `Error optimizing image` | Verify image format/size |
| **Dependency Conflict** | `conflicting peer dependency` | Use --legacy-peer-deps |
| **Import Error** | `Cannot resolve module` | Check path aliases |
| **Network** | `ETIMEDOUT\|ECONNREFUSED` | Retry, check network |
| **Vercel Timeout** | `FUNCTION_INVOCATION_TIMEOUT` | Increase timeout setting |

### Error Log Location

Failed deployments save logs to:
```
.vercel-deployment-error.log
```

View with:
```bash
cat .vercel-deployment-error.log
```

Or analyze automatically:
```bash
npm run deploy:analyze
```

---

## Commands Reference

### Deployment Commands

```bash
# Main deployment (via git)
git push origin main

# Health check before deploying
npm run deploy:health

# Manual deployment (bypasses monitoring)
vercel --prod
```

### Monitoring Commands

```bash
# Monitor latest deployment
node scripts/deployment/monitor-deployment.js

# Monitor with browser auto-open
node scripts/deployment/monitor-deployment.js --open

# Quiet mode (only final result)
node scripts/deployment/monitor-deployment.js --quiet
```

### History Commands

```bash
# List recent deployments
npm run deploy:history

# View deployment statistics
npm run deploy:stats

# Export history to CSV
npm run deploy:history export deployments.csv
```

### Troubleshooting Commands

```bash
# Analyze latest error
npm run deploy:analyze

# Check system health
npm run deploy:health

# View Vercel logs
vercel logs --follow

# List deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>
```

---

## Configuration

### Required Environment Variables

None required for build! The system gracefully handles missing variables:

- **RESEND_API_KEY** (optional): Contact form email sending
  - Missing: Form submissions logged but not emailed
  - Set in Vercel Dashboard: Settings → Environment Variables

### Vercel Project Settings

**Production Branch**: `main`

**Build Settings**:
- Framework Preset: `Next.js`
- Build Command: `next build`
- Install Command: `npm ci --legacy-peer-deps --include=dev || npm install`
- Output Directory: `.next`

**Environment Variables** (if needed):
- Add in Vercel Dashboard: Settings → Environment Variables
- Automatically available during build and runtime

### Git Configuration

**Branch Protection** (recommended):
```bash
# In GitHub repository settings
# Settings → Branches → Add branch protection rule
# Branch name pattern: main
# ✓ Require status checks to pass before merging
# ✓ Require branches to be up to date before merging
```

---

## Best Practices

### Before Deploying

✅ **Run tests locally**
```bash
npm test
```

✅ **Build successfully locally**
```bash
npm run build
```

✅ **Check for type errors**
```bash
npm run type-check
```

✅ **Check system health**
```bash
npm run deploy:health
```

### During Deployment

✅ **Watch monitoring output** - Don't interrupt the monitor script

✅ **Check notifications** - Desktop alert when complete

✅ **Verify success** - Visit the deployment URL

### After Deployment

✅ **Test production site** - Verify functionality

✅ **Check deployment history** - Review statistics
```bash
npm run deploy:stats
```

✅ **Monitor for errors** - Check Vercel dashboard

### Rollback if Needed

```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote <previous-deployment-url>
```

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails with Module Not Found

**Symptoms**: Build fails with "Cannot find module '@/...'"

**Solution**: Already fixed in v2.1
- Ensure `vercel.json` has `--include=dev` in install command
- Verify TypeScript in devDependencies
- Check jsconfig.json has path aliases

#### 2. Monitoring Not Starting

**Symptoms**: Push to main but no monitoring output

**Solutions**:
```bash
# Reinstall git hook
npm run setup:hooks

# Or manually
bash scripts/deployment/setup-auto-monitor.sh

# Verify hook is executable
chmod +x .git/hooks/post-push
```

#### 3. Build Fails with TypeScript Errors

**Solution**: TypeScript must be in devDependencies (already configured)

#### 4. API Route Fails During Build

**Solution**: Already fixed in v2.1 - API routes handle missing environment variables gracefully

### Getting Help

1. **Check logs**:
   ```bash
   cat .vercel-deployment-error.log
   ```

2. **Run health check**:
   ```bash
   npm run deploy:health
   ```

3. **Analyze error**:
   ```bash
   npm run deploy:analyze
   ```

4. **View deployment details**:
   ```bash
   vercel inspect <deployment-url>
   ```

5. **Consult documentation**:
   - [Troubleshooting Guide](../DEPLOYMENT_TROUBLESHOOTING.md)
   - [Fixes Summary](../../DEPLOYMENT_FIXES_SUMMARY.md)
   - [Changelog](../../DEPLOYMENT_CHANGELOG.md)

---

## Version History

### v2.1 (October 2, 2025)
- ✅ Fixed: Babel removed, SWC compiler enabled
- ✅ Fixed: TypeScript moved to devDependencies
- ✅ Fixed: `--include=dev` ensures all packages installed
- ✅ Fixed: API routes handle missing environment variables
- ✅ 100% build success rate
- ✅ All 20 deployment validation tests passing

### v2.0 (October 2, 2025)
- ✅ Health check system
- ✅ Desktop notifications
- ✅ Deployment history tracking
- ✅ Enhanced error detection (17 patterns)
- ✅ Comprehensive troubleshooting guide

### v1.0
- ✅ Basic deployment monitoring
- ✅ Error log fetching
- ✅ Production-only workflow

---

## Related Documentation

- **[Troubleshooting Guide](../DEPLOYMENT_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Fixes Summary](../../DEPLOYMENT_FIXES_SUMMARY.md)** - Detailed analysis of v2.1 fixes
- **[Changelog](../../DEPLOYMENT_CHANGELOG.md)** - Complete version history
- **[Monitoring Setup](../../MONITORING_SETUP.md)** - Detailed monitoring configuration
- **[Main README](../../README.md)** - Project overview

---

## System Requirements

- **Node.js**: >= 20.0.0
- **npm**: >= 10.0.0
- **Git**: Any recent version
- **Vercel CLI**: 46.1.1+ (installed globally)
- **OS**: macOS, Linux, or Windows (with bash)

## Support

For deployment issues:
- Review the [Troubleshooting Guide](../DEPLOYMENT_TROUBLESHOOTING.md)
- Check Vercel Dashboard: https://vercel.com/air2airs-projects/z-beam
- Run health check: `npm run deploy:health`
- View error logs: `cat .vercel-deployment-error.log`
- Analyze errors: `npm run deploy:analyze`

---

**Last Updated**: October 2, 2025  
**System Status**: ✅ Operational (100% success rate)  
**Latest Deployment**: https://z-beam-2icdlzenh-air2airs-projects.vercel.app
