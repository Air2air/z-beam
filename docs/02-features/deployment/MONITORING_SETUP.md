# Monitoring Setup Guide

## Overview

This document provides setup instructions for monitoring Z-Beam deployments, performance, and system health. The monitoring system provides real-time insights into deployment status, application performance, and error tracking.

## Quick Setup

### 1. Install Dependencies

```bash
# Core monitoring dependencies (already in package.json)
npm install

# Optional: Install Vercel CLI globally for manual operations
npm install -g vercel
```

### 2. Authentication Setup

```bash
# Authenticate with Vercel (if not already done)
vercel login

# Verify authentication
vercel whoami
```

### 3. Environment Configuration

Create environment variables for enhanced monitoring (optional):

```bash
# .env.local (for local development)
VERCEL_TOKEN=your_vercel_token_here
SLACK_WEBHOOK_URL=your_slack_webhook_url
NOTIFICATION_ENABLED=true
MONITOR_TIMEOUT=600000
```

## Monitoring Components

### 1. Deployment Monitor

**Location**: `scripts/deployment/monitor-deployment.js`

**Purpose**: Real-time deployment status tracking and error analysis

**Setup**:
```bash
# Test the monitor
node scripts/deployment/monitor-deployment.js --help

# Monitor latest deployment
node scripts/deployment/monitor-deployment.js
```

**Features**:
- Real-time status updates every 5 seconds
- Automatic error log fetching and analysis
- Terminal state detection (success/failure/timeout)
- Integration with VS Code tasks

### 2. Error Analysis System

**Purpose**: Automated error categorization and debugging assistance

**Features**:
- Automatic log collection on deployment failures
- Error pattern recognition and categorization
- Suggested fixes for common error types
- Error log preservation for debugging

**Output**: Errors are saved to `.vercel-deployment-error.log` for analysis

### 3. Performance Monitoring

**Integration**: Built into the deployment monitor

**Metrics Tracked**:
- Deployment duration
- Build time analysis
- Bundle size monitoring
- First response latency

## VS Code Integration

### Task Configuration

The monitoring system integrates with VS Code tasks (already configured):

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

### Usage in VS Code

1. **Command Palette**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Monitor Vercel Deployment"
2. **Keyboard Shortcut**: Configure custom shortcut for deployment monitoring
3. **Terminal Integration**: Run directly in VS Code terminal

## Monitoring Workflows

### Development Workflow

1. **Make Changes**: Develop features in feature branches
2. **Local Testing**: Test builds locally with `npm run build`
3. **Push Changes**: Push to repository (triggers automatic deployment)
4. **Monitor Deployment**: Use VS Code task or run monitor directly
5. **Verify Success**: Check deployment status and performance

### Production Deployment Workflow

```bash
# 1. Ensure main branch is ready
git checkout main
git pull origin main

# 2. Deploy to production
git push origin main

# 3. Monitor deployment
npm run monitor-deployment
# OR use VS Code task: "Monitor Vercel Deployment"

# 4. Verify deployment health
# Monitor will show success/failure status and performance metrics
```

### Error Response Workflow

When deployments fail:

1. **Automatic Analysis**: Monitor fetches and analyzes error logs
2. **Error Categorization**: System identifies error type (TypeScript, Module Not Found, etc.)
3. **Log Preservation**: Error details saved to `.vercel-deployment-error.log`
4. **Suggested Actions**: System provides debugging recommendations
5. **Manual Investigation**: Use `vercel inspect [deployment-url]` for detailed analysis

## Advanced Configuration

### Notification Setup (Optional)

For team notifications, configure webhook URLs:

```javascript
// Optional: Create scripts/deployment/notify.js
module.exports = {
  notifySuccess: (url, duration) => {
    // Slack/Discord/Teams notification logic
  },
  notifyFailure: (url, errorType) => {
    // Error notification logic
  }
};
```

### History Tracking (Optional)

For deployment history analysis:

```javascript
// Optional: Create scripts/deployment/deployment-history.js
module.exports = {
  addDeployment: (deploymentData) => {
    // Store deployment data for trend analysis
  }
};
```

## Monitoring Best Practices

### During Development

1. **Monitor All Production Pushes**: Always monitor `main` branch deployments
2. **Use Quiet Mode for Automation**: Use `--quiet` flag in CI/CD scripts
3. **Review Error Logs**: Always check `.vercel-deployment-error.log` after failures
4. **Test Locally First**: Run `npm run build` before pushing to catch issues early

### For Team Collaboration

1. **Shared Monitoring**: Use team notifications for deployment awareness
2. **Error Sharing**: Share error logs with team members for collaborative debugging
3. **Status Communication**: Keep team informed of deployment status during releases
4. **Historical Analysis**: Review deployment trends for process improvement

### Performance Optimization

1. **Build Time Monitoring**: Track deployment duration trends
2. **Bundle Analysis**: Monitor bundle size increases
3. **Error Pattern Analysis**: Identify recurring deployment issues
4. **Success Rate Tracking**: Maintain high deployment success rates

## Troubleshooting

### Common Setup Issues

1. **Vercel CLI Not Authenticated**
   ```bash
   vercel login
   vercel whoami
   ```

2. **Permission Errors**
   ```bash
   chmod +x scripts/deployment/*.js
   ```

3. **Node.js Version Issues**
   ```bash
   node --version  # Should be 18.x or higher
   npm --version
   ```

### Monitor Not Working

1. **Check Vercel CLI**
   ```bash
   vercel --version
   vercel ls  # Should show deployments
   ```

2. **Test Manual Commands**
   ```bash
   vercel ls 2>&1  # Check for errors
   ```

3. **Verify Project Access**
   ```bash
   vercel projects ls
   ```

### Performance Issues

1. **Timeout Errors**: Increase `MONITOR_TIMEOUT` environment variable
2. **Network Issues**: Check internet connectivity and Vercel status
3. **API Rate Limits**: Reduce monitoring frequency if needed

## Integration Examples

### GitHub Actions

```yaml
name: Deploy and Monitor
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: git push origin main
      - run: node scripts/deployment/monitor-deployment.js --quiet
        timeout-minutes: 10
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-push": "npm run build && echo 'Build successful, push will trigger monitored deployment'"
    }
  }
}
```

## Support and Resources

### Documentation

- [Deployment Guide](../../DEPLOYMENT.md)
- [Deployment Scripts README](../deployment/README.md)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

### Troubleshooting Resources

- [Vercel Status Page](https://status.vercel.com)
- [Vercel Community](https://vercel.com/community)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

### Team Support

For monitoring setup issues:

1. **Check Documentation**: Review this guide and related docs
2. **Test Commands**: Verify all commands work locally
3. **Share Error Logs**: Include complete error messages when asking for help
4. **Environment Details**: Share Node.js version, OS, and Vercel CLI version

## Quick Reference

### Essential Commands

```bash
# Monitor latest deployment
node scripts/deployment/monitor-deployment.js

# Monitor with browser opening
node scripts/deployment/monitor-deployment.js --open

# Quiet monitoring (for scripts)
node scripts/deployment/monitor-deployment.js --quiet

# Check deployment manually
vercel ls

# Inspect specific deployment
vercel inspect [url]

# View deployment logs
vercel logs [url]
```

### VS Code Tasks

- **Monitor Vercel Deployment**: Real-time deployment monitoring
- **Deploy and Monitor**: Combined deployment and monitoring
- **Start Dev Server**: Local development server with hot reload

Use `Ctrl+Shift+P` → "Tasks: Run Task" to access these tasks.