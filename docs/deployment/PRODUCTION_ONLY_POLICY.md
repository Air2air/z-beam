# Production-Only Deployment Policy

## Overview
This project uses a **production-only deployment strategy**. All deployments to Vercel are configured as production deployments. Preview deployments are disabled.

## Configuration

### Vercel Settings (`vercel.json`)

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

### Key Settings Explained

1. **`git.deploymentEnabled.main: true`**
   - Only the `main` branch triggers deployments
   - All other branches are ignored

2. **`ignoreCommand`**
   - Uses `$VERCEL_ENV` environment variable
   - Exits with code 1 (fail) if environment is not "production"
   - Exits with code 0 (success) if environment is "production"
   - This prevents preview deployments from building

3. **`github.autoJobCancelation: false`**
   - Prevents automatic cancellation of builds
   - Ensures production deployments complete

## Deployment Methods

### 1. Automatic Deployment (Recommended)
```bash
# Push to main branch triggers production deployment
git push origin main
```

### 2. Manual Deployment
```bash
# Deploy directly using Vercel CLI
vercel deploy --prod

# Or use project deployment script
npm run deploy:prod
```

### 3. Deployment Pipeline
```bash
# Full validation and deployment
bash scripts/deployment/prod-deploy.sh
```

## Why Production-Only?

### Benefits
1. **Consistency**: All deployments go through the same production pipeline
2. **Quality Control**: Every deployment is validated and tested
3. **Resource Efficiency**: No wasted resources on preview builds
4. **Simplified Workflow**: Single deployment path reduces complexity
5. **Security**: Production-only environment variables and configuration

### Trade-offs
- No preview deployments for feature branches
- Must merge to main to see changes live
- Requires local testing before pushing

## Local Development

Always test changes locally before pushing to main:

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run sitemap validation
npm run verify:sitemap

# Run type checking
npm run type-check

# Build locally to verify
npm run build
```

## Deployment Verification

After deployment, verify:

1. **Deployment Status**
   ```bash
   vercel ls --prod | head -n 5
   ```

2. **Deployment Environment**
   - Status should be: `● Ready` or `● Building`
   - Environment must be: `Production` (never `Preview`)

3. **Live Site**
   - Check: https://z-beam.com
   - Verify: Latest changes are visible

## Monitoring

### Check Deployment Status
```bash
# List recent production deployments
vercel ls --prod

# Inspect specific deployment
vercel inspect <deployment-url>

# View deployment logs
vercel logs <deployment-url>
```

### Monitor Deployment Script
```bash
# Watch deployment in real-time
node scripts/deployment/monitor-deployment.js
```

## Troubleshooting

### Preview Deployments Appearing
If you see deployments marked as "Preview":

1. **Check vercel.json**
   ```bash
   # Verify ignoreCommand uses VERCEL_ENV
   grep "ignoreCommand" vercel.json
   ```

2. **Verify Environment Variable**
   - Deployment should set `VERCEL_ENV=production`
   - Preview deployments have `VERCEL_ENV=preview`

3. **Manual Deploy**
   ```bash
   # Force production deployment
   vercel deploy --prod
   ```

### Canceled Deployments
If deployments are being canceled:

1. Check `autoJobCancelation` is `false`
2. Verify no concurrent deployments
3. Check Vercel dashboard for errors

## Testing

### Deployment Configuration Tests
Location: `tests/deployment/deployment-config.test.ts`

Tests verify:
- `vercel.json` uses `VERCEL_ENV` check
- `autoJobCancelation` is disabled
- Only main branch enabled for deployment
- Production-only environment configuration

### Running Tests
```bash
# Run deployment configuration tests
npm run test:deployment

# Run all tests
npm test
```

## Documentation

Related documentation:
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Configuration](./VERCEL_CONFIGURATION.md)
- [GitHub Integration](./GITHUB_INTEGRATION.md)

## Best Practices

1. **Always test locally** before pushing to main
2. **Use feature branches** for development, merge to main when ready
3. **Monitor deployments** to ensure they complete successfully
4. **Verify environment** is always "Production"
5. **Check logs** if deployment fails
6. **Never disable** the `ignoreCommand` without team approval

## Environment Variables

Production-only environment variables in Vercel:
- `VERCEL_ENV=production` (automatically set)
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `SKIP_ENV_VALIDATION=1`

These variables are only available in production deployments.

## Support

If you encounter issues with production deployments:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review deployment logs
3. Verify `vercel.json` configuration
4. Check GitHub webhook integration
5. Contact DevOps team

---

**Last Updated**: October 20, 2025
**Deployment Strategy**: Production-Only
**Vercel Region**: CLE1 (Cleveland)
