# 🚨 Runaway Process Prevention - Quick Reference

## Before You Start Working

```bash
npm run dev:health
```
**Checks:** Runaway processes, stale PIDs, port 3000, disk space, dependencies

---

## During Development

### Option 1: Continuous Monitoring (Recommended for long sessions)
```bash
npm run dev:watch
```
Monitors every 30 seconds, alerts on issues, lets you take action

### Option 2: Periodic Manual Checks
```bash
npm run dev:detect
```
Run this every hour or when things feel sluggish

---

## When Things Go Wrong

### 🐌 Copilot/VS Code Feels Sluggish
```bash
npm run dev:detect      # Identify the problem
npm run dev:stop-all    # Nuclear option - stops everything
npm run dev:health      # Verify clean state
npm run dev:persistent  # Start fresh
```

### 🔴 Build Won't Start/Complete
```bash
npm run dev:stop-all    # Kill competing processes
npm run clean           # Clean build artifacts
npm run build           # Try again
```

### 💾 High Memory/CPU Alert
```bash
# Auto-kill runaway processes (safe - only kills truly stuck ones)
AUTO_KILL=true npm run dev:cleanup
```

### 🔁 Multiple Process Instances
```bash
npm run dev:detect      # See the duplicates
npm run dev:stop-all    # Kill them all
```

---

## VS Code Tasks (⇧⌘P → "Run Task")

- **Health Check** - Full environment check
- **Detect Runaway Processes** - One-time scan
- **Stop All Processes** - Emergency cleanup
- **Watch Processes (Monitor)** - Continuous monitoring

---

## Common Scenarios

### Starting a Fresh Session
```bash
npm run dev:health && npm run dev:persistent
```

### Ending a Session Cleanly
```bash
npm run dev:stop-all
```

### Troubleshooting Port 3000 In Use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev:persistent
```

### Weekly Maintenance
```bash
npm run dev:stop-all
npm run clean
npm install  # Update dependencies if needed
npm run dev:health
```

---

## Understanding the Tools

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `dev:health` | Full health check | Before starting work |
| `dev:detect` | Scan for issues | When things feel slow |
| `dev:stop-all` | Kill all processes | Emergency cleanup |
| `dev:cleanup` | Auto-kill runaways | High CPU/memory |
| `dev:watch` | Monitor continuously | Long dev sessions |

---

## Thresholds (What Gets Flagged)

### Detection (`dev:detect`)
- CPU > 80%
- Memory > 1GB
- Runtime > 2 hours

### Auto-Cleanup (`dev:cleanup` with AUTO_KILL=true)
- CPU > 95%
- Memory > 2GB
- Runtime > 4 hours

---

## Files Created (Auto-ignored by git)
- `.dev-server.pid` - Background dev server process ID
- `.dev-server.log` - Dev server logs
- `.process-alerts.log` - Alert history from monitoring

---

## Safety Features

✅ **Dry-run by default** - Auto-cleanup requires explicit `AUTO_KILL=true`
✅ **Targeted patterns** - Only kills node/npm/jest/next/tsx processes
✅ **Exit codes** - Scripts return proper codes for automation
✅ **Logging** - All issues logged for review
✅ **Interactive prompts** - Watch mode asks before taking action

---

## Pro Tips

1. **Start monitoring before long AI sessions:**
   ```bash
   npm run dev:watch &
   ```

2. **Create a daily workflow alias:**
   ```bash
   alias dev-start="npm run dev:health && npm run dev:persistent && npm run dev:watch"
   ```

3. **Check process health in your prompt** (add to .bashrc/.zshrc):
   ```bash
   # Show warning if high CPU processes detected
   check_dev_health() {
     if npm run dev:detect > /dev/null 2>&1; then
       echo "✓"
     else
       echo "⚠️ "
     fi
   }
   PS1='$(check_dev_health) '$PS1
   ```

4. **Pre-commit hook** (ensure clean state):
   ```bash
   # .git/hooks/pre-commit
   #!/bin/bash
   npm run dev:detect || {
     echo "⚠️  Runaway processes detected. Clean up before committing."
     exit 1
   }
   ```

---

## Getting Help

**View detailed docs:**
```bash
cat docs/PROCESS_MONITORING.md
```

**Check what's running right now:**
```bash
ps aux | grep -E "(node|npm|jest|next)" | grep -v grep
```

**View recent alerts:**
```bash
tail -20 .process-alerts.log
```
