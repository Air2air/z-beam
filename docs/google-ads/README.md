# Google Search Ads Feeds

This directory contains the automated feed generation system for Google Search Ads campaigns based on the comprehensive strategy document `GOOGLE_SEARCH_ADS_CAMPAIGN_STRATEGY.md`.

## 📁 Directory Structure

```
google-ads/
├── scripts/seo/google-ads/          # Feed generation scripts
│   └── generate-keyword-feed.js     # Main feed generator
├── public/feeds/google-ads/          # Generated CSV feeds
│   ├── keywords.csv                  # All keywords with match types
│   ├── negative-keywords.csv         # Campaign-level negative keywords
│   ├── ad-copy.csv                   # Pre-written ad variations
│   └── campaign-budgets.csv          # Budget allocation
└── docs/google-ads/                  # Documentation
    └── README.md                     # This file
```

## 🚀 Quick Start

### Generate All Feeds

```bash
node scripts/seo/google-ads/generate-keyword-feed.js
```

This will generate 4 CSV files in `public/feeds/google-ads/`:

1. **keywords.csv** - 100+ keywords across 10 ad groups
2. **negative-keywords.csv** - 30+ negative keywords for all campaigns
3. **ad-copy.csv** - Pre-written responsive search ads
4. **campaign-budgets.csv** - Budget allocation by campaign

## 📊 Generated Feeds

### 1. Keywords Feed (`keywords.csv`)

**Format:**
```csv
Campaign,Ad Group,Keyword,Match Type,Max CPC,Final URL
"Core Services - Laser Cleaning","Laser Cleaning - Broad","laser cleaning services","exact","$8.00","https://z-beam.com/services/professional-cleaning"
```

**Contents:**
- 3 campaigns
- 10 ad groups
- 100+ keywords with exact/phrase/broad match types
- Max CPC bid guidance per ad group
- Landing page URLs with UTM parameters

**Usage:**
- Import directly into Google Ads Editor
- Bulk upload to Google Ads web interface
- Review and adjust max CPCs based on competition

### 2. Negative Keywords Feed (`negative-keywords.csv`)

**Format:**
```csv
Campaign,Negative Keyword,Match Type
"Core Services - Laser Cleaning","diy","phrase"
```

**Contents:**
- 30+ negative keywords applied to all campaigns
- Prevents wasted spend on:
  - DIY/residential queries
  - Training/educational searches
  - Product purchase intent (vs. service)
  - Consumer services (jewelry, automotive, tattoo, etc.)

**Usage:**
- Import to campaign-level negative keyword lists
- Helps maintain B2B focus
- Reduces wasted ad spend

### 3. Ad Copy Feed (`ad-copy.csv`)

**Format:**
```csv
Campaign,Ad Group,Headline 1,Headline 2,Headline 3,Description 1,Description 2,Final URL
"Core Services - Laser Cleaning","Rust Removal","Laser Rust Removal Services","Remove Rust Without Damage","$390/Hr • Fast & Effective","Advanced laser rust removal...","Precision rust removal...","https://z-beam.com/services/professional-cleaning?focus=rust-removal"
```

**Contents:**
- Pre-written ad copy for each ad group
- 3 headlines per ad (minimum for responsive search ads)
- 2 descriptions per ad
- Tailored landing page URLs with query parameters

**Usage:**
- Import into Google Ads for quick campaign launch
- Customize with actual phone numbers, service areas
- Expand with additional headline/description variations (up to 15/4)

### 4. Campaign Budgets Feed (`campaign-budgets.csv`)

**Format:**
```csv
Campaign Name,Daily Budget,Monthly Budget,Budget %,Ad Groups,Status
"Core Services - Laser Cleaning","$75.00","$2250","55%","5","Active"
```

**Contents:**
- 3 campaigns with budget allocation
- Daily and monthly budget breakdowns
- Percentage of total budget
- Ad group count per campaign

**Usage:**
- Reference for budget setup in Google Ads
- Total monthly budget: $4,200
- Adjust percentages based on performance

## 📈 Campaign Structure

### Campaign 1: Core Services - Laser Cleaning
**Budget:** $2,250/month (55%)  
**Ad Groups:**
1. Laser Cleaning - Broad (general keywords)
2. Rust Removal (rust-specific keywords)
3. Paint Stripping (paint/coating removal)
4. Industrial Cleaning (manufacturing, pre-weld)
5. Equipment Rental ($320/hour rental focus)

### Campaign 2: Material-Specific Cleaning
**Budget:** $1,200/month (30%)  
**Ad Groups:**
1. Metal Cleaning (steel, aluminum, stainless, titanium)
2. Stone & Concrete (marble, granite, monuments)
3. Wood & Composite (specialized materials)

### Campaign 3: Competitor & High-Intent
**Budget:** $750/month (15%)  
**Ad Groups:**
1. Alternative Methods ("better than sandblasting", eco-friendly)
2. Local Services (location-based, mobile service)

## 🎯 Match Types Explained

- **Exact Match** - `[keyword]` - Matches exact keyword or close variants
- **Phrase Match** - `"keyword"` - Matches phrase in any order with additional words
- **Broad Match Modifier** - `+keyword` - Each word must appear in search query

**Example:**
```csv
"laser cleaning services","exact"     → [laser cleaning services]
"laser cleaning services","phrase"    → "laser cleaning services"
"industrial laser cleaning","phrase"  → "industrial laser cleaning"
```

## 🔧 Customization

### Update Keywords

Edit `scripts/seo/google-ads/generate-keyword-feed.js`:

```javascript
const campaigns = {
  coreServices: {
    adGroups: [
      {
        name: "Your Ad Group Name",
        keywords: [
          { text: "your keyword", matchType: "exact" },
          { text: "your keyword", matchType: "phrase" }
        ],
        maxCPC: 8.00
      }
    ]
  }
};
```

### Add Negative Keywords

```javascript
const negativeKeywords = [
  "diy", "home", "cheap", // existing
  "your", "negative", "keywords" // add new ones
];
```

### Update Ad Copy

```javascript
const adCopyMap = {
  "Your Ad Group Name": {
    headlines: [
      "Headline 1 (max 30 chars)",
      "Headline 2 (max 30 chars)",
      "Headline 3 (max 30 chars)"
    ],
    descriptions: [
      "Description 1 (max 90 chars)",
      "Description 2 (max 90 chars)"
    ],
    finalUrl: "https://z-beam.com/your-landing-page"
  }
};
```

### Regenerate Feeds

After making changes:

```bash
node scripts/seo/google-ads/generate-keyword-feed.js
```

## 📥 Import to Google Ads

### Method 1: Google Ads Editor (Recommended)

1. Download and install [Google Ads Editor](https://ads.google.com/home/tools/ads-editor/)
2. Open your account in the editor
3. Go to **Tools → Import → From File**
4. Select CSV file (keywords.csv, negative-keywords.csv, or ad-copy.csv)
5. Map columns to Google Ads fields
6. Review and post changes

### Method 2: Google Ads Web Interface

1. Log in to [ads.google.com](https://ads.google.com)
2. Navigate to **Tools & Settings → Bulk Actions → Uploads**
3. Click **Upload** and select CSV file
4. Map columns and preview
5. Apply changes

### Method 3: Google Ads API (Advanced)

Use the [Google Ads API](https://developers.google.com/google-ads/api/docs/start) for programmatic campaign creation and management.

## 🎨 Ad Extensions Setup

The feeds don't include ad extensions. Set these up manually in Google Ads:

### Sitelinks
- Services Overview
- Request Quote
- Equipment Rental
- Safety Information

### Callouts
- $390/Hour Professional Service
- Mobile Service Available
- Same-Day Response
- No Chemicals or Abrasives
- Eco-Friendly Process
- Manufacturer-Trusted

### Structured Snippets
- **Services:** Rust Removal, Paint Stripping, Surface Prep, Equipment Rental
- **Materials:** Metal, Stone, Concrete, Wood, Composites
- **Industries:** Manufacturing, Automotive, Aerospace, Marine, Construction

### Call Extensions
- Add your business phone number
- Enable call reporting for tracking

### Location Extensions
- Link Google Business Profile
- Show service area

### Price Extensions
- Professional Cleaning: $390/hour
- Equipment Rental: $320/hour
- Free Quote: $0
- Site Assessment: $0

## 🔍 Conversion Tracking

Set up these conversion actions in Google Ads:

1. **Quote Form Submission** (Primary)
   - Goal: Lead generation
   - Value: $150 (average quote value)
   - Count: One per click

2. **Phone Call** (Primary)
   - Goal: Lead generation
   - Value: $150
   - Minimum call duration: 60 seconds

3. **Equipment Rental Form** (Secondary)
   - Goal: Lead generation
   - Value: $200 (higher value for rental leads)

4. **Contact Form Submission** (Micro)
   - Goal: Engagement
   - Value: $50

5. **Service Page Views** (Micro)
   - Goal: Engagement
   - Value: $10
   - Pages: 3+ views per session

## 📊 Performance Expectations

Based on strategy document projections:

- **Click-Through Rate (CTR):** 3-5%
- **Cost Per Click (CPC):** $5-12
- **Conversion Rate:** 8-12%
- **Cost Per Lead (CPL):** $80-150
- **Monthly Leads:** 20-30
- **Monthly Budget:** $3,000-4,200

## 🚀 Launch Checklist

- [ ] Generate all feeds using the script
- [ ] Review and customize ad copy
- [ ] Set up Google Ads account (if not already done)
- [ ] Import keywords.csv to Google Ads Editor
- [ ] Import negative-keywords.csv to campaign settings
- [ ] Import ad-copy.csv or manually create responsive search ads
- [ ] Set up conversion tracking (quote forms, phone calls)
- [ ] Configure ad extensions (sitelinks, callouts, etc.)
- [ ] Add actual phone numbers to ads
- [ ] Customize location targeting
- [ ] Set campaign budgets per campaign-budgets.csv
- [ ] Enable location extensions (link Google Business Profile)
- [ ] Set up automated rules for budget management
- [ ] Create custom landing pages if needed (rust removal, paint stripping)
- [ ] Test all landing page URLs
- [ ] Enable auto-bidding (Target CPA or Maximize Conversions)
- [ ] Launch Campaign 1 first at 50% budget for testing
- [ ] Monitor for 2-4 weeks
- [ ] Expand to full budget and additional campaigns

## 📝 Ongoing Optimization

### Weekly Tasks
- Review search term reports
- Add negative keywords based on irrelevant searches
- Adjust bids for top-performing keywords
- Pause low-performing ads

### Monthly Tasks
- Analyze conversion data by campaign/ad group
- Test new ad copy variations
- Adjust budget allocation based on performance
- Review and update landing pages
- Add new keyword opportunities from search terms

### Quarterly Tasks
- Full campaign performance audit
- Competitive analysis and bid adjustments
- Update ad copy for seasonality/promotions
- Review and optimize landing pages
- Test new ad extensions and formats

## 🔗 Related Documentation

- [GOOGLE_SEARCH_ADS_CAMPAIGN_STRATEGY.md](../../GOOGLE_SEARCH_ADS_CAMPAIGN_STRATEGY.md) - Full campaign strategy
- [GOOGLE_MERCHANT_CATEGORY_RESEARCH.md](../../GOOGLE_MERCHANT_CATEGORY_RESEARCH.md) - Product category research

## 📞 Support

For questions about the feed generation system or Google Ads setup:
- Review the comprehensive strategy document
- Check Google Ads Help Center
- Contact Google Ads support for account-specific issues
