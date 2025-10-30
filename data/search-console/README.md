# Search Console Data Export Setup

This directory contains automated exports from Google Search Console for AI-powered analysis.

## Quick Start

### 1. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Google Search Console API"
3. Create a Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Name it "Search Console Export"
   - Grant "Service Account User" role
4. Create and download JSON key

### 2. Add Service Account to Search Console

1. Go to [Search Console](https://search.google.com/search-console)
2. Select your property (www.z-beam.com)
3. Settings → Users and permissions
4. Add the service account email (looks like: `xxx@xxx.iam.gserviceaccount.com`)
5. Give it **Owner** permissions

### 3. Configure GitHub Actions

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add new secret: `GSC_SERVICE_ACCOUNT_KEY`
3. Paste the entire JSON key file content

### 4. Run Locally (Optional)

```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Run export
node scripts/search-console-export.js
```

## What Gets Exported

Daily exports include:

- **Top 100 Queries** - Search terms driving traffic
- **Top 100 Pages** - Best performing pages
- **Device Breakdown** - Desktop vs Mobile vs Tablet
- **Top 50 Countries** - Geographic traffic
- **Summary Report** - Key metrics overview

## File Structure

```
data/search-console/
├── latest.json              # Most recent summary (easy access)
├── summary-2025-10-29.json  # Daily summary
├── queries-2025-10-29.json  # Top queries
├── pages-2025-10-29.json    # Top pages
├── devices-2025-10-29.json  # Device breakdown
└── countries-2025-10-29.json # Country breakdown
```

## Using with AI

### GitHub Copilot Chat

Ask questions like:
- "Analyze the latest Search Console data in data/search-console/latest.json"
- "What queries have high impressions but low CTR?"
- "Which pages dropped in performance this week?"
- "Suggest content improvements based on search queries"

### ChatGPT / Claude

1. Copy content from `data/search-console/latest.json`
2. Paste and ask: "Analyze this Search Console data and identify opportunities"

## Automated Schedule

The GitHub Action runs daily at 2 AM UTC and:
1. Fetches last 7 days of data (with 2-day delay for accuracy)
2. Saves to `data/search-console/`
3. Commits and pushes to main branch
4. Triggers `[skip ci]` to avoid rebuild

## Manual Trigger

You can manually trigger the export:
1. Go to Actions tab in GitHub
2. Select "Daily Search Console Export"
3. Click "Run workflow"

## Troubleshooting

### Error: 401/403 Authentication

- Verify service account is added to Search Console as Owner
- Check that API is enabled in Google Cloud Console
- Ensure JSON key is valid and complete in GitHub Secrets

### No Data Returned

- Search Console data has 2-3 day delay
- Verify site URL matches: `sc-domain:z-beam.com` or `https://www.z-beam.com/`
- Check that site is verified in Search Console

### Rate Limits

- API allows 1200 queries per minute
- Script uses ~4 queries per run
- Daily schedule is well within limits

## Data Retention

Keep last 30 days of data for trend analysis. Older files can be archived or deleted.

## Privacy & Security

- Service account key is stored as encrypted GitHub Secret
- Data is stored in private GitHub repo
- No personally identifiable user data is collected
