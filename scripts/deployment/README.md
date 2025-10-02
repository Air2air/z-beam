# Vercel Deployment Monitoring

This directory contains tools for automated Vercel deployment monitoring.

## Quick Start

### Option 1: VS Code Task (Easiest)

1. Push your changes:
   ```bash
   git push origin main
   ```

2. In VS Code:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Tasks: Run Task"
   - Select "Monitor Vercel Deployment"

### Option 2: Combined Push + Monitor

In VS Code:
- `Cmd+Shift+P` → "Tasks: Run Task" → "Deploy and Monitor"

This automatically pushes and monitors in one step!

### Option 3: Command Line

```bash
# Monitor current deployment
node scripts/deployment/monitor-deployment.js

# Monitor and open browser when ready
node scripts/deployment/monitor-deployment.js --open

# Quiet mode (CI/CD friendly)
node scripts/deployment/monitor-deployment.js --quiet
```

## Features

### Real-time Status Updates
- 🔨 Building
- ✅ Ready (Success)
- ❌ Error (Failed)
- ⏳ Queued
- 🚀 Initializing

### Automatic Detection
- Monitors latest deployment automatically
- Shows deployment URL, target environment, and age
- Color-coded output for easy scanning
- Auto-exits on completion or failure

### Smart Timeouts
- Default: 10 minute maximum wait
- Checks every 5 seconds
- Prevents hanging on stuck deployments

### Exit Codes
- `0` = Success (deployment ready)
- `1` = Failure (deployment error/timeout)

## Integration Options

### 1. GitHub Actions (Recommended for Teams)

The `.github/workflows/monitor-vercel-deployment.yml` workflow:
- Runs automatically on every push to main
- Monitors deployment without manual intervention
- Posts status comments to commits
- Fails CI if deployment fails

**Setup:**
1. Get Vercel token: https://vercel.com/account/tokens
2. Add to repo secrets: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
3. Name: `VERCEL_TOKEN`
4. Value: Your token
5. Done! Future pushes auto-monitor

### 2. NPM Script

Add to `package.json`:
```json
{
  "scripts": {
    "deploy:watch": "node scripts/deployment/monitor-deployment.js",
    "deploy:prod": "git push origin main && npm run deploy:watch"
  }
}
```

Then use:
```bash
npm run deploy:prod
```

### 3. Git Hook (Advanced)

Add to `.git/hooks/post-push`:
```bash
#!/bin/bash
if [[ $(git rev-parse --abbrev-ref HEAD) == "main" ]]; then
  echo "Monitoring deployment..."
  node scripts/deployment/monitor-deployment.js
fi
```

Make executable:
```bash
chmod +x .git/hooks/post-push
```

### 4. Pre-commit Hook with Deployment Check

Add to `.git/hooks/pre-push`:
```bash
#!/bin/bash

# Ask if user wants to monitor deployment
read -p "Monitor deployment after push? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Set flag to monitor after push
  export MONITOR_AFTER_PUSH=1
fi
```

## Configuration

Edit `monitor-deployment.js` to customize:

```javascript
const CHECK_INTERVAL = 5000; // How often to check (ms)
const MAX_WAIT_TIME = 600000; // Maximum wait time (ms)
```

## Troubleshooting

### "No deployments found"
- Wait 10-15 seconds after pushing
- Verify your push succeeded: `git log origin/main -1`
- Check Vercel dashboard: https://vercel.com/dashboard

### "Command not found: vercel"
```bash
npm install -g vercel@latest
```

### "Unauthorized" or API errors
```bash
vercel login
```

### Monitor never completes
- Check Vercel dashboard for build errors
- View logs: `vercel logs`
- Inspect deployment: `vercel inspect <url>`

## For Copilot Integration

To ensure Copilot monitors deployments:

1. **Add to agent instructions** (in `.github/copilot-instructions.md`):
   ```markdown
   When user asks to deploy or pushes to main:
   1. Confirm push succeeded
   2. Run: node scripts/deployment/monitor-deployment.js
   3. Report final status to user
   ```

2. **Use with run_in_terminal**:
   ```javascript
   {
     command: "node scripts/deployment/monitor-deployment.js",
     isBackground: false,
     explanation: "Monitoring Vercel deployment status"
   }
   ```

3. **Check exit code**:
   - Exit code 0 = Success, inform user deployment is live
   - Exit code 1 = Failure, show logs and suggest fixes

## Example Output

```
🔍 VERCEL DEPLOYMENT MONITOR
═══════════════════════════════════════

🔨 Status: BUILDING
📍 URL: z-beam-xyz123.vercel.app
🌍 Target: production
⏱️  Age: 45s
🔄 Check #9

✅ DEPLOYMENT SUCCESSFUL!
🌐 Live at: z-beam-xyz123.vercel.app
⏱️  Total time: 2m 15s
```

## Best Practices

1. ✅ Always monitor production deployments
2. ✅ Use `--quiet` flag in CI/CD pipelines
3. ✅ Set up GitHub Actions for team visibility
4. ✅ Keep terminal visible during deployments
5. ✅ Review logs if deployment fails

## Support

Issues with monitoring:
- Check Vercel CLI is installed: `vercel --version`
- Ensure you're logged in: `vercel whoami`
- Verify internet connection
- Check Vercel status: https://www.vercel-status.com/
