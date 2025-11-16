# Deployment System Troubleshooting Guide

## Quick Diagnostics

```bash
# Run the health check first
node scripts/deployment/health-check.js

# Check deployment system status
npm run deploy:check  # If script exists
```

---

## Recently Resolved Issues (October 2, 2025)

### ✅ Build Failing: "Module not found" errors
**Fixed**: This was caused by devDependencies not being installed. Solution implemented in `vercel.json`:
```json
"installCommand": "npm ci --legacy-peer-deps --include=dev || npm install"
```

### ✅ Build Failing: TypeScript not found
**Fixed**: TypeScript moved to `devDependencies` and install command updated to include dev packages.

### ✅ Build Failing: Resend API initialization error
**Fixed**: API routes now use conditional initialization:
```typescript
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
```

### ✅ Babel disabling SWC compiler
**Fixed**: Removed `.babelrc.js` to enable Next.js built-in SWC compiler (faster, better compatibility).

See [DEPLOYMENT_FIXES_SUMMARY.md](../DEPLOYMENT_FIXES_SUMMARY.md) for full details.

---

## Common Issues and Solutions

### 1. Git Hook Not Running

**Symptoms:**
- Pushed to main but no monitoring started
- No deployment status messages after `git push`

**Diagnosis:**
```bash
# Check if hook exists and is executable
ls -la .git/hooks/post-push
cat .git/hooks/post-push | head -20
```

**Solutions:**

1. **Hook doesn't exist:**
   ```bash
   # Run setup script
   npm run setup:hooks
   # Or manually
   bash scripts/deployment/setup-auto-monitor.sh
   ```

2. **Hook not executable:**
   ```bash
   chmod +x .git/hooks/post-push
   ```

3. **Hook doesn't call monitor:**
   ```bash
   # Reinstall
   rm .git/hooks/post-push
   bash scripts/deployment/setup-auto-monitor.sh
   ```

4. **Using wrong git workflow:**
   ```bash
   # ❌ Wrong: Direct Vercel deploy (bypasses hooks)
   vercel --prod
   
   # ✅ Correct: Git push (triggers hooks)
   git push origin main
   ```

---

### 2. Vercel CLI Not Found

**Symptoms:**
- `vercel: command not found`
- Monitoring script fails immediately

**Diagnosis:**
```bash
which vercel
vercel --version
```

**Solutions:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Update to latest version:**
   ```bash
   npm update -g vercel
   ```

3. **Check PATH:**
   ```bash
   echo $PATH
   # Ensure npm global bin directory is in PATH
   ```

---

### 3. Not Authenticated with Vercel

**Symptoms:**
- `Error: Not authenticated`
- Monitoring can't fetch deployment list

**Diagnosis:**
```bash
vercel whoami
```

**Solutions:**

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Check auth token:**
   ```bash
   # Check if token exists
   ls ~/.vercel
   cat ~/.vercel/auth.json
   ```

3. **Re-authenticate:**
   ```bash
   vercel logout
   vercel login
   ```

---

### 4. No Deployments Found

**Symptoms:**
- "No deployments found. Waiting..."
- Monitor loops without finding deployment

**Diagnosis:**
```bash
# Check deployments manually
vercel ls
vercel ls --scope <team-name>
```

**Solutions:**

1. **Project not linked:**
   ```bash
   vercel link
   ```

2. **Wrong team/scope:**
   ```bash
   # Check current team
   vercel teams ls
   
   # Switch team
   vercel switch <team-name>
   ```

3. **Deployment still queued:**
   - GitHub may not have triggered deployment yet
   - Check Vercel dashboard: https://vercel.com/dashboard
   - Check GitHub Actions if using custom workflows

4. **Deployment already finished:**
   - Monitor looks for recent deployments only
   - Check manually: `vercel ls`

---

### 5. Monitor Times Out

**Symptoms:**
- "TIMEOUT: Deployment is taking longer than expected"
- Monitor stops after 10 minutes

**Diagnosis:**
```bash
# Check deployment status manually
vercel ls
vercel inspect <deployment-url>
```

**Solutions:**

1. **Still building (normal):**
   - Large builds can take time
   - Monitor again: `node scripts/deployment/monitor-deployment.js`

2. **Stuck in queue:**
   - Check Vercel status: https://vercel-status.com
   - May need to cancel and redeploy

3. **Increase timeout:**
   ```javascript
   // In monitor-deployment.js
   const MAX_WAIT_TIME = 1200000; // 20 minutes
   ```

---

### 6. Can't Fetch Error Logs

**Symptoms:**
- "Could not fetch logs"
- Error logs file is empty

**Diagnosis:**
```bash
# Try fetching logs manually
vercel logs <deployment-url>
vercel logs <deployment-url> --output raw
```

**Solutions:**

1. **Deployment too old:**
   - Logs expire after some time
   - Check Vercel dashboard for logs

2. **Permission issue:**
   ```bash
   # Check if you have access
   vercel inspect <deployment-url>
   ```

3. **Network/timeout:**
   ```bash
   # Increase timeout in monitor script
   # Or fetch manually and save
   vercel logs <url> --output raw > .vercel-deployment-error.log
   ```

---

### 7. Error Analyzer Finds Nothing

**Symptoms:**
- "No common error patterns detected"
- But build clearly failed

**Diagnosis:**
```bash
# Check error log content
cat .vercel-deployment-error.log | head -50
```

**Solutions:**

1. **Logs are truncated:**
   ```bash
   # Fetch more logs
   vercel logs <url> --output raw > full-logs.txt
   node scripts/deployment/analyze-deployment-error.js full-logs.txt
   ```

2. **New error pattern:**
   - Error pattern not in analyzer database
   - Review logs manually
   - Consider adding pattern to `analyze-deployment-error.js`

3. **Error is runtime, not build:**
   - Analyzer focuses on build errors
   - Check runtime logs: `vercel logs <url>`

---

### 8. Notifications Not Working

**Symptoms:**
- No desktop notifications on success/failure
- Only terminal output shown

**Diagnosis:**
```bash
# Test notification system
node scripts/deployment/notify.js success "test-site.vercel.app" "5m"
```

**Solutions:**

1. **macOS:**
   ```bash
   # Check if osascript works
   osascript -e 'display notification "Test" with title "Test"'
   
   # Enable notifications for Terminal
   # System Preferences > Notifications > Terminal
   ```

2. **Linux:**
   ```bash
   # Install notify-send
   sudo apt-get install libnotify-bin  # Ubuntu/Debian
   sudo yum install libnotify           # CentOS/RHEL
   
   # Test
   notify-send "Test" "Test message"
   ```

3. **Disable notifications:**
   ```bash
   # Add --no-notify flag
   node scripts/deployment/monitor-deployment.js --no-notify
   ```

---

### 9. Build Succeeds Locally, Fails on Vercel

**Common Causes:**

1. **Environment variables missing:**
   ```bash
   # Check required variables
   cat .env.example
   
   # Add to Vercel
   vercel env add VARIABLE_NAME
   # Or use dashboard
   ```

2. **Different Node.js version:**
   ```bash
   # Check local version
   node --version
   
   # Specify in package.json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **Dependencies missing:**
   ```bash
   # Verify all deps in package.json
   npm install --package-lock-only
   
   # Check for missing peer deps
   npm ls
   ```

4. **File case sensitivity:**
   ```bash
   # Vercel uses Linux (case-sensitive)
   # Check import paths match exact file names
   # Wrong:  import Component from './component'
   # Right:  import Component from './Component'
   ```

5. **Build output directory:**
   ```bash
   # Check next.config.js
   # Ensure distDir matches Vercel config
   ```

---

### 10. TypeScript Errors Only on Vercel

**Symptoms:**
- `tsc` passes locally
- Build fails with "Type error" on Vercel

**Solutions:**

1. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "strict": true,  // Vercel may use stricter settings
       "skipLibCheck": true,
       "noEmit": true
     }
   }
   ```

2. **Different TypeScript version:**
   ```bash
   # Lock TypeScript version
   npm install --save-dev typescript@5.3.3
   ```

3. **Missing type definitions:**
   ```bash
   # Install missing @types packages
   npm install --save-dev @types/node @types/react
   ```

4. **Ignore type errors (emergency only):**
   ```javascript
   // next.config.js
   module.exports = {
     typescript: {
       ignoreBuildErrors: true  // ⚠️ Not recommended
     }
   }
   ```

---

## Diagnostic Commands

### Check System Health
```bash
# Full health check
node scripts/deployment/health-check.js

# Check specific components
vercel --version          # CLI version
vercel whoami             # Authentication
vercel ls                 # Recent deployments
git remote -v             # Git remote
node --version            # Node version
```

### Manual Deployment Check
```bash
# List deployments
vercel ls

# Get deployment details
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
vercel logs <deployment-url> --output raw --follow

# Open in browser
open https://<deployment-url>
```

### Test Monitoring System
```bash
# Test monitor script
node scripts/deployment/monitor-deployment.js --help

# Test error analyzer
node scripts/deployment/analyze-deployment-error.js

# Test notifications
node scripts/deployment/notify.js success "test.vercel.app" "1m"
```

### Git Hook Debugging
```bash
# Check hook exists
ls -la .git/hooks/post-push

# View hook content
cat .git/hooks/post-push

# Test hook manually (from git root)
./.git/hooks/post-push

# Check git config
git config --list | grep hook
```

---

## Getting Help

### 1. Check Documentation
- `DEPLOYMENT_ERROR_SYSTEM_COMPLETE.md` - System overview
- `scripts/deployment/README.md` - Technical details
- `QUICK_DEPLOY_REFERENCE.md` - Quick reference

### 2. Check Vercel Status
- https://vercel-status.com
- Check for platform issues

### 3. Enable Verbose Logging
```bash
# Add DEBUG environment variable
DEBUG=1 node scripts/deployment/monitor-deployment.js
```

### 4. Review Recent Changes
```bash
# Check what changed
git log --oneline -10
git diff HEAD~1

# Check if deployment config changed
git diff HEAD~1 vercel.json
git diff HEAD~1 next.config.js
```

### 5. Ask Copilot
```
Show Copilot:
1. The error logs: .vercel-deployment-error.log
2. The analysis: .vercel-error-analysis.txt
3. This troubleshooting guide

Example prompt:
"My deployment failed with the error in .vercel-deployment-error.log.
The analysis is in .vercel-error-analysis.txt. Can you help fix it?"
```

---

## Prevention Tips

### Before Every Deploy

1. **Run tests locally:**
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

2. **Build locally:**
   ```bash
   npm run build
   ```

3. **Check environment variables:**
   ```bash
   cat .env.example
   vercel env ls
   ```

4. **Run health check:**
   ```bash
   node scripts/deployment/health-check.js
   ```

### Set Up Properly

1. **Install git hooks:**
   ```bash
   npm run setup:hooks  # Run after clone
   ```

2. **Link Vercel project:**
   ```bash
   vercel link
   ```

3. **Configure GitHub integration:**
   - Enable in Vercel dashboard
   - Set production branch to `main`

### Monitor Regularly

1. **Check deployment logs:**
   ```bash
   # After each push
   vercel ls
   vercel inspect <latest-url>
   ```

2. **Keep CLI updated:**
   ```bash
   npm update -g vercel
   ```

3. **Review error patterns:**
   - Check `.vercel-error-analysis.txt` when failures occur
   - Learn from patterns to prevent future issues

---

## Emergency Procedures

### Build is Broken, Need to Deploy Fix Fast

1. **Fix the code**
2. **Test locally:**
   ```bash
   npm run build
   ```
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: Critical build error"
   git push origin main
   ```
4. **Monitor closely:**
   ```bash
   node scripts/deployment/monitor-deployment.js --open
   ```

### Need to Rollback

1. **Find last good deployment:**
   ```bash
   vercel ls
   ```

2. **Promote to production:**
   ```bash
   vercel promote <good-deployment-url>
   ```

3. **Or revert commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

### Vercel is Down

1. **Check status:** https://vercel-status.com
2. **Wait for recovery** (monitoring will still work when back)
3. **Use preview deployments** for testing in the meantime

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [GitHub Actions for Vercel](https://vercel.com/docs/git/vercel-for-github)
