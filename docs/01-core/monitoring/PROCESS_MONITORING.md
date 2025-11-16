# Process Management & Monitoring Tools

Comprehensive toolset to detect, monitor, and stop runaway or hanging development processes.

## Quick Reference

### Detection & Diagnosis
```bash
npm run dev:detect          # Scan for runaway/hanging processes
npm run dev:status          # Check dev server status
```

### Cleanup & Control
```bash
npm run dev:stop-all        # Emergency stop - kills ALL dev processes
npm run dev:cleanup         # Auto-cleanup (dry-run by default)
AUTO_KILL=true npm run dev:cleanup  # Auto-kill runaway processes
```

### Continuous Monitoring
```bash
npm run dev:watch           # Monitor processes every 30s
INTERVAL=60 npm run dev:watch  # Monitor every 60s
```

## Scripts Overview

### 1. `detect-runaway-processes.sh`
**Purpose:** Comprehensive scan for problematic processes

**Checks:**
- ✓ High CPU usage (>80% by default)
- ✓ High memory usage (>1GB by default)
- ✓ Long-running processes (>2 hours)
- ✓ Zombie/orphaned processes
- ✓ Duplicate process instances

**Exit Codes:**
- `0` = No issues detected
- `1` = Issues found (review output)

**Usage:**
```bash
npm run dev:detect
```

**Output Example:**
```
🔍 Scanning for runaway/hanging processes...

━━━ High CPU Usage Processes ━━━
⚠️  Found high CPU processes:
  PID 12345 - CPU: 95.2% - node --inspect next dev

━━━ High Memory Usage Processes ━━━
✓ No high memory processes found

━━━ Long-Running Processes ━━━
  PID 67890 - Running: 03:45:12 (3h) - jest --watchAll

━━━ Zombie/Orphaned Processes ━━━
✓ No zombie processes found

━━━ Duplicate Process Instances ━━━
⚠️  Multiple jest processes detected: 3
  PID 11111 - jest --watch
  PID 22222 - jest --coverage
  PID 33333 - jest tests/
```

### 2. `stop-all-processes.sh`
**Purpose:** Emergency cleanup - stops ALL development processes

**Stops:**
- Next.js dev servers (`next dev`)
- Build processes (`next build`)
- Jest test runners
- TypeScript executions (tsx)
- All npm dev/build/test commands
- Processes on port 3000

**Warning:** ⚠️ This is a nuclear option. Use `dev:restart` for gentle restarts.

**Usage:**
```bash
npm run dev:stop-all
```

### 3. `auto-cleanup-processes.sh`
**Purpose:** Automated cleanup of runaway processes

**Modes:**
- **Dry-run (default):** Shows what WOULD be killed
- **Auto-kill:** Actually terminates processes

**Thresholds (auto-kill):**
- CPU: >95%
- Memory: >2GB
- Runtime: >4 hours

**Usage:**
```bash
# Dry-run mode (safe, shows what would happen)
npm run dev:cleanup

# Actually kill runaway processes
AUTO_KILL=true npm run dev:cleanup

# Custom thresholds
CPU_KILL_THRESHOLD=90 MEMORY_KILL_THRESHOLD=3000000 AUTO_KILL=true npm run dev:cleanup
```

### 4. `watch-processes.sh`
**Purpose:** Continuous monitoring with automatic alerts

**Features:**
- Runs detection every N seconds (default: 30s)
- Logs issues to `.process-alerts.log`
- Interactive prompts when issues detected
- Can continue monitoring or stop all processes

**Usage:**
```bash
# Monitor every 30 seconds (default)
npm run dev:watch

# Monitor every 60 seconds
INTERVAL=60 npm run dev:watch

# Stop with Ctrl+C
```

**Interactive Options:**
When issues are detected, you'll see:
```
Options:
  1) Continue monitoring
  2) Stop all processes (run stop-all-processes.sh)
  3) Exit monitor
Choose (1-3, auto-continue in 10s):
```

## VS Code Tasks

All scripts are available as VS Code tasks (⇧⌘P → "Run Task"):

- **Detect Runaway Processes** - One-time scan
- **Stop All Processes** - Emergency cleanup
- **Watch Processes (Monitor)** - Continuous monitoring

## Common Scenarios

### Scenario 1: Copilot Feels Sluggish
```bash
# 1. Check what's running
npm run dev:detect

# 2. If issues found, stop everything
npm run dev:stop-all

# 3. Start fresh
npm run dev:persistent
```

### Scenario 2: Multiple Jest Processes
```bash
# Detect duplicates
npm run dev:detect

# If confirmed, kill all
npm run dev:stop-all

# Start single test run
npm test
```

### Scenario 3: High CPU Usage
```bash
# Identify the culprit
npm run dev:detect

# Auto-kill if it's stuck
AUTO_KILL=true npm run dev:cleanup
```

### Scenario 4: Proactive Monitoring
```bash
# Start monitoring in background
npm run dev:watch

# In another terminal, continue working
npm run dev:persistent
```

### Scenario 5: Build Won't Complete
```bash
# Check if old build is still running
npm run dev:detect

# Kill long-running processes
AUTO_KILL=true npm run dev:cleanup

# Clean and rebuild
npm run clean
npm run build
```

## Configuration

### Environment Variables

**detect-runaway-processes.sh:**
- `CPU_THRESHOLD=80` - CPU usage alert threshold (%)
- `MEMORY_THRESHOLD=1000000` - Memory alert threshold (KB)
- `MAX_RUNTIME_HOURS=2` - Long-running process threshold

**auto-cleanup-processes.sh:**
- `AUTO_KILL=false` - Enable/disable automatic killing
- `CPU_KILL_THRESHOLD=95` - CPU kill threshold (%)
- `MEMORY_KILL_THRESHOLD=2000000` - Memory kill threshold (KB)
- `MAX_RUNTIME_KILL_HOURS=4` - Runtime kill threshold

**watch-processes.sh:**
- `INTERVAL=30` - Check interval in seconds

### Example: Custom Thresholds
```bash
# More aggressive detection
CPU_THRESHOLD=60 MEMORY_THRESHOLD=500000 npm run dev:detect

# Less aggressive auto-kill
CPU_KILL_THRESHOLD=98 MAX_RUNTIME_KILL_HOURS=8 AUTO_KILL=true npm run dev:cleanup
```

## Best Practices

### 1. Regular Health Checks
Run detection before long sessions:
```bash
npm run dev:detect && npm run dev:persistent
```

### 2. Automated Monitoring
For extended development sessions:
```bash
# Terminal 1: Monitoring
npm run dev:watch

# Terminal 2: Development
npm run dev:persistent
```

### 3. Pre-Build Cleanup
Ensure clean state before builds:
```bash
npm run dev:detect && npm run build
```

### 4. Scheduled Cleanup (optional)
Add to cron for automatic cleanup:
```bash
# Every hour, check and clean (dry-run)
0 * * * * cd /path/to/z-beam && npm run dev:detect

# Every 4 hours, auto-kill runaway processes
0 */4 * * * cd /path/to/z-beam && AUTO_KILL=true npm run dev:cleanup
```

## Troubleshooting

### "No processes found to stop"
Good! Nothing is running. You can safely start dev server.

### Detection shows issues but auto-cleanup doesn't kill
Check if `AUTO_KILL=true` is set. Default is dry-run mode.

### Monitor exits immediately
Check script has execute permissions:
```bash
chmod +x scripts/dev/*.sh
```

### Port 3000 still in use after cleanup
Manually free the port:
```bash
lsof -ti:3000 | xargs kill -9
```

### Stale PID file
Clean up manually:
```bash
rm -f .dev-server.pid
```

## Safety Features

1. **Dry-run by default:** Auto-cleanup requires explicit `AUTO_KILL=true`
2. **Targeted patterns:** Only kills node/npm/jest/next/tsx processes
3. **Exit codes:** Scripts return proper codes for automation
4. **Logging:** Issues logged to `.process-alerts.log`
5. **Interactive prompts:** Watch script asks before taking action

## Integration with Existing Tools

These tools complement the existing dev server scripts:

- `npm run dev` - Standard foreground dev server
- `npm run dev:persistent` - Background dev server (new)
- `npm run dev:status` - Check dev server status (new)
- `npm run dev:restart` - Restart dev server (new)
- **`npm run dev:detect`** - Scan for issues (NEW)
- **`npm run dev:stop-all`** - Emergency stop (NEW)
- **`npm run dev:cleanup`** - Auto-cleanup (NEW)
- **`npm run dev:watch`** - Continuous monitor (NEW)

## Alert Log

Issues are logged to `.process-alerts.log` for review:
```bash
# View recent alerts
tail -20 .process-alerts.log

# Clear alert log
rm .process-alerts.log
```

## Performance Impact

- **detect-runaway-processes.sh:** Lightweight, runs in <1s
- **watch-processes.sh:** Minimal overhead, checks every 30s by default
- **auto-cleanup-processes.sh:** Very lightweight, safe for cron

All scripts use efficient `ps` commands and avoid heavy operations.
