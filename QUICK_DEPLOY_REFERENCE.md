# 🚀 Quick Deployment Reference

## Deployment with Automatic Monitoring

```bash
# That's it! Push to main and monitoring happens automatically
git push origin main
```

### What Happens Automatically:

1. **Git Push** → Commits sent to GitHub
2. **Vercel Build** → Automatic production build starts
3. **Monitor Activates** → Git hook runs monitor script
4. **Status Updates** → Real-time progress every 5 seconds
5. **Completion** → Notifies when live or if errors occur

---

## Monitoring Output Example

```
🚀 Push to main detected - Starting automatic deployment monitor...

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

---

## Setup Status

✅ **Git Hook:** Installed at `.git/hooks/post-push`  
✅ **NPM Postinstall:** Configured in `package.json`  
✅ **Monitor Script:** `scripts/deployment/monitor-deployment.js`  
✅ **Setup Script:** `scripts/deployment/setup-auto-monitor.sh`

---

## For New Team Members

1. Clone repo
2. Run `npm install`
3. Hook installs automatically
4. Start pushing to main!

---

## Troubleshooting

### Hook not running?
```bash
# Reinstall the hook
./scripts/deployment/setup-auto-monitor.sh
```

### Monitor script error?
```bash
# Check Vercel CLI is installed
vercel --version

# If not, install it
npm install -g vercel@latest
vercel login
```

### Want to disable automatic monitoring?
```bash
# Remove the hook
rm .git/hooks/post-push

# Or rename it
mv .git/hooks/post-push .git/hooks/post-push.disabled
```

### Want to re-enable?
```bash
# Reinstall
./scripts/deployment/setup-auto-monitor.sh
```

---

## Manual Monitoring (if needed)

```bash
# Monitor current deployment
node scripts/deployment/monitor-deployment.js

# Monitor and open browser when ready
node scripts/deployment/monitor-deployment.js --open

# Quiet mode (CI/CD)
node scripts/deployment/monitor-deployment.js --quiet

# VS Code Task
Cmd+Shift+P → Tasks: Run Task → Monitor Vercel Deployment
```

---

## Pre-Deployment Checklist

Before pushing to main:

- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Types check: `npm run type-check`
- [ ] Lint clean: `npm run lint`

Then:
```bash
git add .
git commit -m "Your message"
git push origin main
# Monitoring happens automatically!
```

---

## Emergency Commands

```bash
# List recent deployments
vercel ls

# View logs
vercel logs --follow

# Rollback to previous deployment
vercel promote <previous-deployment-url>

# Check deployment status
vercel inspect <deployment-url>
```

---

## GitHub Actions Monitoring

Optional: Set up GitHub Actions for team-wide monitoring

1. Get token: https://vercel.com/account/tokens
2. Add to GitHub Secrets as `VERCEL_TOKEN`
3. Workflow runs automatically (`.github/workflows/monitor-vercel-deployment.yml`)

---

## Support

- **Monitoring Documentation:** `scripts/deployment/README.md`
- **Full Deployment Guide:** `DEPLOYMENT.md`
- **Setup Details:** `MONITORING_SETUP.md`
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Remember:** Just push to main - monitoring is automatic! 🎉
