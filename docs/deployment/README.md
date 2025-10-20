# Deployment Documentation

Complete guide to deploying and managing the Z-Beam application on Vercel.

## 📚 Quick Links

### Getting Started
- [Quick Test Guide](QUICK_TEST_GUIDE.md) - Fast deployment testing
- [Environment Setup](VERCEL_ENV_SETUP.md) - Environment variables configuration
- [Email Configuration](EMAIL_SETUP_GUIDE.md) - Setting up email for z-beam.com

### Operations
- [Monitoring Setup](MONITORING_SETUP.md) - Deployment monitoring and alerts
- [Troubleshooting](troubleshooting/) - Common issues and solutions

### Archives
- [Historical Deployment Docs](../archived/deployment/) - Past deployment guides and completion reports

---

## Production-Only Deployment Strategy

⚠️ **CRITICAL**: This project is configured to **only deploy to production**. All deployments must be marked as Production, never Preview.

### Policy Documentation

See [Production-Only Policy](PRODUCTION_ONLY_POLICY.md) for complete details on:
- Why deployments must be production-only
- Configuration requirements
- Testing and verification
- Troubleshooting preview deployments

### Configuration

**vercel.json** is configured with:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "bash -c 'if [ \"$VERCEL_ENV\" != \"production\" ]; then exit 1; else exit 0; fi'",
  "github": {
    "enabled": true,
    "autoAlias": false,
    "autoJobCancelation": false
  }
}
```

This configuration ensures:
- ✅ **Main branch only** → Only `main` branch triggers deployments
- ✅ **Production environment** → `VERCEL_ENV=production` required
- ✅ **No preview builds** → `ignoreCommand` blocks non-production deployments
- ✅ **No auto-cancellation** → Builds complete without interruption
- ❌ **All other branches** → Completely ignored
- ❌ **Pull requests** → No preview deployments created
- ❌ **Preview environment** → Blocked by ignoreCommand

### Why Production-Only?

1. **Deployment Consistency** - All deployments go through the same production pipeline
2. **Quality Control** - Every deployment is validated and tested
3. **Resource Efficiency** - No wasted resources on preview builds
4. **Simplified Workflow** - Single deployment path reduces complexity
5. **Security** - Production-only environment variables and configuration
6. **Cost Efficiency** - Reduced build minutes and bandwidth usage

### Deployment Process

#### Automatic Deployment
```bash
# Merge to main triggers automatic production deployment
git checkout main
git merge feature-branch
git push origin main
```

#### Manual Deployment
```bash
# Deploy current state to production
vercel --prod

# Check deployment status
vercel ls
```

### Pre-deployment Checks

Automated checks ensure successful builds:
- ✅ TypeScript in devDependencies (required for build)
- ✅ All packages installed via `npm ci --include=dev` (815+ packages)
- ✅ Next.js SWC compiler enabled (no Babel config)
- ✅ API routes handle missing environment variables gracefully
- ✅ Node.js version >= 20.0.0
- ✅ All critical directories exist (`app`, `types`, `content`)

**Note**: The `production-predeploy.js` script has been removed to ensure builds succeed in Vercel environment. Pre-deployment validation is now handled by the test suite and CI/CD pipeline.

### Deployment Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| **Region** | iad1 (Washington, D.C.) | Consistent deployment location |
| **Function Memory** | 1024MB | Better API performance |
| **Function Timeout** | 30s | Adequate time for complex operations |
| **Build Command** | `next build` | Next.js SWC compiler (fast, optimized) |
| **Install Command** | `npm ci --legacy-peer-deps --include=dev \|\| npm install` | Ensures devDependencies installed |
| **Compiler** | Next.js SWC | Native compiler (Babel disabled) |

### Excluded from Deployment

Via `.vercelignore`:
- Test files and coverage reports
- Development documentation
- Editor configuration
- Debug scripts
- Archive folders
- YAML processor tools

### Emergency Rollback

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>

# Or rollback via Vercel dashboard
# https://vercel.com/air2airs-projects/z-beam
```

### Monitoring

#### 🎯 Automatic Monitoring (Default)

**Monitoring happens automatically!** Every push to main triggers automatic deployment monitoring via git hook.

Just push and watch:
```bash
git push origin main
# Monitoring starts automatically!
```

The git post-push hook:
- ✅ Activates automatically after every push to main
- ✅ Shows real-time deployment status
- ✅ Updates every 5 seconds
- ✅ Auto-exits when deployment completes
- ✅ Works for all developers (installed via npm postinstall)

**No manual steps required!**

#### Additional Monitoring Options

**1. VS Code Task (Alternative method)**
```
Terminal → Run Task → Monitor Vercel Deployment
```
This runs the automated monitor script that:
- Checks deployment status every 5 seconds
- Shows real-time progress with colored output
- Reports success/failure automatically
- Exits with appropriate status code

**2. Combined Deploy and Monitor Task**
```
Terminal → Run Task → Deploy and Monitor
```
This task:
- Pushes to main branch
- Automatically starts monitoring
- Reports when deployment is live

**3. Standalone Monitor Script**
```bash
# Monitor with full output
node scripts/deployment/monitor-deployment.js

# Monitor and open in browser when ready
node scripts/deployment/monitor-deployment.js --open

# Quiet mode (only shows final result)
node scripts/deployment/monitor-deployment.js --quiet
```

**4. GitHub Actions (Automatic)**

Every push to main triggers a GitHub Actions workflow that:
- Monitors the Vercel deployment automatically
- Posts status updates to the commit
- Fails the workflow if deployment fails
- Provides links to deployment logs

To set up (requires one-time configuration):
1. Get Vercel token: https://vercel.com/account/tokens
2. Add to GitHub Secrets as `VERCEL_TOKEN`
3. Workflow runs automatically on every push to main

#### Manual Monitoring

```bash
# Follow deployment logs
vercel logs --follow

# Check recent deployments
vercel ls

# View specific deployment details
vercel inspect <deployment-url>

# Monitor with JSON output
vercel ls --json | jq '.deployments[0]'
```

### Best Practices

1. ✅ **Always test locally** before pushing to main
2. ✅ **Run full test suite** (`npm test`) before deployment
3. ✅ **Verify build succeeds** locally (`npm run build`)
4. ✅ **Check deployment logs** after pushing to main
5. ✅ **Monitor production** site after deployment completes

### Support

For deployment issues:
- Check build logs at: https://vercel.com/air2airs-projects/z-beam
- Review `production-predeploy.js` script output
- Verify environment variables are set correctly
- Ensure all dependencies are in `package.json`
