# Deployment Monitoring Guide

## Overview

The Z-Beam project includes comprehensive deployment monitoring tools to track Vercel deployments in real-time, providing status updates, error analysis, and automated notifications.

## Quick Start

### Basic Monitoring

```bash
# Monitor latest deployment
npm run monitor-deployment

# Or use the script directly
node scripts/deployment/monitor-deployment.js
```

### Advanced Options

```bash
# Open in browser when ready
node scripts/deployment/monitor-deployment.js --open

# Quiet mode (only final result)
node scripts/deployment/monitor-deployment.js --quiet

# Monitor specific deployment
node scripts/deployment/monitor-deployment.js https://z-beam-xyz.vercel.app
```

## Features

### Real-Time Status Updates

- **Live Progress**: Updates every 5 seconds during deployment
- **Status Symbols**: Visual indicators for each deployment state
  - 🔨 Building
  - ✅ Ready  
  - ❌ Error
  - ⏳ Queued
  - 🚀 Initializing
  - 🚫 Canceled

### Error Analysis

When deployments fail, the monitor:
1. Fetches the last 100 lines of build logs
2. Categorizes error types (Module not found, TypeScript error, etc.)
3. Saves logs to `.vercel-deployment-error.log` for analysis
4. Provides actionable debugging suggestions

### Deployment States

| State | Description | Action |
|-------|-------------|--------|
| QUEUED | Waiting in deployment queue | Monitor continues |
| INITIALIZING | Setting up build environment | Monitor continues |
| BUILDING | Active build process | Monitor continues |
| READY | Deployment successful | Monitor completes |
| ERROR | Build or deployment failed | Show logs and exit |
| CANCELED | Deployment was canceled | Exit with error |

## Integration with Tasks

The monitoring system integrates with VS Code tasks:

```json
{
  "label": "Monitor Vercel Deployment",
  "type": "shell",
  "command": "node",
  "args": ["scripts/deployment/monitor-deployment.js"],
  "group": "build",
  "isBackground": false
}
```

## Configuration

### Environment Requirements

- **Vercel CLI**: Must be installed and authenticated
- **Node.js**: Version 14+ required
- **Git**: For deployment metadata

### Optional Extensions

The monitor supports optional notification and history modules:

```javascript
// Optional: notifications (requires notify.js)
let notify = require('./notify.js');

// Optional: deployment history (requires deployment-history.js)  
let history = require('./deployment-history.js');
```

## Usage Patterns

### Development Workflow

```bash
# 1. Deploy changes
git push origin main

# 2. Monitor deployment
node scripts/deployment/monitor-deployment.js --open
```

### CI/CD Integration

```bash
# Quiet monitoring for scripts
node scripts/deployment/monitor-deployment.js --quiet
echo $? # Exit code: 0 = success, 1 = failure
```

### Debugging Failed Deployments

1. **Check Error Logs**: Monitor saves logs to `.vercel-deployment-error.log`
2. **Inspect Deployment**: Use `vercel inspect <deployment-url>`
3. **Analyze Error Type**: Monitor categorizes common error patterns
4. **Share with Team**: Error logs can be shared with GitHub Copilot for analysis

## Output Examples

### Successful Deployment

```
🔍 VERCEL DEPLOYMENT MONITOR
═══════════════════════════════════════

🔨 Status: BUILDING
📍 URL: z-beam-xyz.vercel.app
🌍 Target: production
⏱️  Age: 45s
🔄 Check #9

✅ DEPLOYMENT SUCCESSFUL!
🌐 Live at: z-beam-xyz.vercel.app
⏱️  Total time: 2m 15s
```

### Failed Deployment

```
❌ DEPLOYMENT FAILED!
📍 URL: z-beam-xyz.vercel.app

📋 BUILD ERROR LOGS:
═════════════════════════════════════════════
Error: Module not found: Can't resolve './missing-component'
    at /vercel/path0/app/page.tsx:12:0
═════════════════════════════════════════════

💾 Error logs saved to: .vercel-deployment-error.log
💡 Show this file to Copilot to analyze and create fixes
💡 Inspect deployment: vercel inspect z-beam-xyz.vercel.app
```

## Best Practices

### When to Use

- **After Git Push**: Monitor production deployments
- **During Development**: Track preview deployments
- **CI/CD Pipelines**: Automated deployment validation
- **Debugging**: Investigate build failures

### Performance Tips

- **Use --quiet**: For automated scripts to reduce output
- **Monitor Latest**: Default behavior tracks most recent deployment
- **Timeout Handling**: Monitor stops after 10 minutes maximum

### Error Recovery

1. **Build Failures**: Check `.vercel-deployment-error.log`
2. **Network Issues**: Verify Vercel CLI authentication
3. **Timeout**: Check Vercel dashboard for deployment status
4. **Permission Issues**: Ensure Vercel CLI has project access

## Related Documentation

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Z-Beam Deployment Guide](./deployment-guide.md)
- [Build Configuration](../development/build-configuration.md)
- [Error Troubleshooting](../troubleshooting/deployment-errors.md)

## Support

For deployment monitoring issues:

1. **Check Logs**: Review `.vercel-deployment-error.log`
2. **Verify CLI**: Run `vercel --version` and `vercel whoami`
3. **Test Manually**: Try `vercel ls` to check connection
4. **Contact Team**: Share error logs with development team