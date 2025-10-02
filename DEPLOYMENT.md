# Deployment Configuration

## Production-Only Deployment Strategy

This project is configured to **only deploy to production** from the `main` branch. Preview deployments are disabled.

### Configuration

**vercel.json** is configured with:
```json
"git": {
  "deploymentEnabled": {
    "main": true
  }
}
```

This means:
- ✅ **Pushes to `main` branch** → Automatic production deployment
- ❌ **All other branches** → No deployment
- ❌ **Pull requests** → No preview deployments
- ❌ **Commits to other branches** → Ignored by Vercel

### Why Production-Only?

1. **Simplified workflow** - No need to manage multiple environments
2. **Cost efficiency** - Reduced build minutes and bandwidth usage
3. **Clearer intent** - Every merge to main is a production release
4. **Resource conservation** - No unnecessary preview builds

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

The `production-predeploy.js` script runs before every build:
- ✅ Validates Node.js version (>= 20.0.0)
- ✅ Checks critical directories exist (`app`, `types`, `content`)
- ✅ Verifies configuration files
- ✅ Runs TypeScript type checking (optional)
- ✅ Logs environment information

### Deployment Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| **Region** | iad1 (Washington, D.C.) | Consistent deployment location |
| **Function Memory** | 1024MB | Better API performance |
| **Function Timeout** | 30s | Adequate time for complex operations |
| **Build Command** | `node scripts/deployment/production-predeploy.js && next build` | Pre-checks + build |
| **Install Command** | `npm ci --legacy-peer-deps \|\| npm install` | Fallback install strategy |

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

```bash
# Follow deployment logs
vercel logs --follow

# Check recent deployments
vercel ls

# View specific deployment details
vercel inspect <deployment-url>
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
