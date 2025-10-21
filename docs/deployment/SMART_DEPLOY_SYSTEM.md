# Smart Deploy & Monitor System Documentation

## Overview

The Z-Beam project uses a unified deployment and monitoring system built around `smart-deploy.sh`, which combines deployment capabilities with real-time monitoring.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Git Push      │───▶│  GitHub Actions │───▶│   Production    │
│   (main branch) │    │   Workflow      │    │   Deployment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Deployment    │
                       │   Monitoring    │
                       └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Manual Deploy  │───▶│ smart-deploy.sh │───▶│   Production    │
│  ./smart-deploy │    │    Script       │    │   Deployment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Optional      │
                       │   Monitoring    │
                       └─────────────────┘
```

## Deployment Methods

### 1. Automatic Deployment (Recommended)
```bash
git push origin main
```
- Triggers GitHub Actions workflow
- Deploys directly to production using `vercel --prod --force --yes`
- Posts status comments on commits
- No manual intervention required

### 2. Manual Deployment
```bash
# Deploy immediately
./smart-deploy.sh deploy

# Deploy with monitoring
./smart-deploy.sh deploy-monitor

# Traditional method (still works)
vercel --prod --force --yes
```

## Monitoring Commands

### Real-time Monitoring
```bash
# Monitor latest deployment
./smart-deploy.sh monitor

# Start monitoring for active deployments
./smart-deploy.sh start

# Monitor specific deployment
./smart-deploy.sh monitor https://deployment-url.vercel.app
```

### Status and Logs
```bash
# Check monitoring status
./smart-deploy.sh status

# Show live deployment logs
./smart-deploy.sh logs

# List recent deployments
./smart-deploy.sh list

# Stop monitoring
./smart-deploy.sh stop
```

### Help and Information
```bash
# Show all available commands
./smart-deploy.sh help
```

## Configuration Files

### vercel.json
```json
{
  "git": {
    "deploymentEnabled": { "main": true },
    "productionBranch": "main"
  },
  "github": {
    "enabled": true,
    "autoAlias": false,
    "autoJobCancelation": false
  },
  "buildCommand": "next build"
}
```

### GitHub Actions Workflow
Located at: `.github/workflows/smart-production-deploy.yml`

Key features:
- Triggers on push to main branch
- Uses `vercel --prod --force --yes` for direct production deployment
- Posts status comments on commits
- 10-minute timeout for reliability

### VS Code Tasks
Located at: `.vscode/tasks.json`

Available tasks:
- **Deploy to Production** - Runs `./smart-deploy.sh deploy`

## Package.json Scripts

```json
{
  "scripts": {
    "deploy": "./smart-deploy.sh deploy",
    "deploy:prod": "./smart-deploy.sh deploy",
    "deploy:monitor": "./smart-deploy.sh deploy-monitor",
    "monitor": "./smart-deploy.sh monitor"
  }
}
```

## Environment Variables

### Required Secrets (GitHub Actions)
- `VERCEL_TOKEN` - Vercel authentication token

### Optional Secrets
- `VERCEL_ORG_ID` - Organization ID (auto-detected if not provided)
- `VERCEL_PROJECT_ID` - Project ID (auto-detected if not provided)

## Testing

### Deployment Configuration Tests
Located at: `tests/deployment/deployment-config.test.ts`

Tests verify:
- ✅ `smart-deploy.sh` exists and is executable
- ✅ Script contains required deployment functions
- ✅ VS Code tasks reference correct script
- ✅ vercel.json has proper Git configuration
- ✅ GitHub integration settings are correct

### Running Tests
```bash
# Run deployment tests
npm test tests/deployment/

# Run all tests
npm test
```

## Troubleshooting

### Common Issues

**1. GitHub Actions failing**
- Check if `VERCEL_TOKEN` secret is set in repository settings
- Verify token has correct permissions for the project

**2. smart-deploy.sh permission denied**
```bash
chmod +x smart-deploy.sh
```

**3. Deployment hanging**
- Check for uncommitted changes: `git status`
- Ensure you're on main branch: `git branch`
- Kill any hanging Vercel processes: `pkill -f vercel`

**4. Monitoring not working**
- Verify Vercel CLI is installed: `vercel --version`
- Check if deployment exists: `vercel ls`
- Restart monitoring: `./smart-deploy.sh stop && ./smart-deploy.sh start`

### Debug Commands
```bash
# Check script permissions
ls -la smart-deploy.sh

# Test deployment without deploying
./smart-deploy.sh help

# View recent deployments
vercel ls | head -10

# Check GitHub Actions logs
gh run list --limit 5
```

## Migration Notes

### Removed Components
- ❌ `scripts/deployment/` directory (cleaned up 20+ scripts)
- ❌ `deploy-production.sh` (merged into smart-deploy.sh)
- ❌ Complex monitoring workflows
- ❌ Deprecated environment configurations

### New Components
- ✅ Unified `smart-deploy.sh` script
- ✅ Simplified GitHub Actions workflow
- ✅ Updated VS Code tasks
- ✅ Streamlined package.json scripts

## Performance

### Deployment Speed
- **Direct production deployment**: ~2 minutes
- **No preview builds**: Saves ~30-60 seconds per deployment
- **Simplified workflow**: Reduces complexity and failure points

### Monitoring Efficiency
- **Real-time updates**: 5-second intervals
- **Auto-stop functionality**: Exits when deployment completes
- **Minimal resource usage**: Lightweight monitoring process

## Security

### Access Control
- Production deployments require main branch
- GitHub Actions use repository secrets
- No preview deployments reduce attack surface

### Token Management
- VERCEL_TOKEN stored as GitHub secret
- Automatic token rotation supported
- Scoped to specific project and organization