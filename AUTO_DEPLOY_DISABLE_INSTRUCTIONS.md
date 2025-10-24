# Auto-Deploy Disable Instructions

## Current Status

**vercel.json configuration:**
```json
{
  "git": {
    "deploymentEnabled": {
      "main": false
    },
    "productionBranch": "main"
  },
  "github": {
    "enabled": false,
    "autoAlias": false,
    "autoJobCancelation": false
  }
}
```

## Problem

**Vercel is still auto-deploying** despite `vercel.json` having `deploymentEnabled.main: false` and `github.enabled: false`.

## Root Cause

**Vercel Dashboard settings override vercel.json**

The Git integration settings in the Vercel project dashboard take precedence over `vercel.json` configuration. This is by design - Vercel allows project-level UI settings to override file-based configuration for security and control.

## Solution

To fully disable auto-deployment, you must **manually disable Git integration in the Vercel dashboard**:

### Steps to Disable Auto-Deploy in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/air2airs-projects/z-beam

2. **Settings → Git**
   - Click on "Settings" tab
   - Navigate to "Git" section

3. **Disconnect Git Integration** (Option 1 - Complete)
   - Click "Disconnect" next to the GitHub repository
   - This completely stops all automatic deployments
   - You can still deploy manually via CLI: `vercel --prod`

4. **Disable Auto-Deploy** (Option 2 - Partial)
   - Scroll to "Production Branch"
   - Uncheck "Automatically deploy changes from production branch"
   - This keeps Git connected but disables auto-deploy

## Recommended Approach

**Option 1 (Disconnect)** is recommended because:
- Ensures no accidental deployments
- Forces manual review before each deployment
- `vercel.json` settings are already configured correctly
- Can easily reconnect later if needed

## Manual Deployment After Disabling

Once auto-deploy is disabled, use these commands for manual deployment:

```bash
# Deploy to production
vercel --prod

# Or use the helper script
./smart-deploy.sh
```

## Verification

After disabling in the dashboard:

1. Make a commit and push to `main`
2. Check Vercel dashboard - no automatic deployment should start
3. Test manual deployment: `vercel --prod`

## Notes

- The `vercel.json` changes are already committed and pushed
- Tests have been updated to expect auto-deploy disabled
- This is a **dashboard-only** configuration change
- No code changes needed - just UI settings adjustment
