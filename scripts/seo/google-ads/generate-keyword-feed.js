#!/usr/bin/env node

/**
 * Google Ads Keyword Feed Generator
 * 
 * Generates CSV feeds for Google Ads campaigns including:
 * - Keywords with match types
 * - Negative keywords
 * - Ad copy variations
 * - Campaign/ad group structure
 * 
 * Based on GOOGLE_SEARCH_ADS_CAMPAIGN_STRATEGY.md
 */

const fs = require('fs');
const path = require('path');

// Campaign structure from strategy document
const campaigns = {
  coreServices: {
    name: "Core Services - Laser Cleaning",
    budget: 2250,
    budgetPercent: 55,
    adGroups: [
      {
        name: "Laser Cleaning - Broad",
        keywords: [
          { text: "laser cleaning services", matchType: "exact" },
          { text: "laser cleaning services", matchType: "phrase" },
          { text: "industrial laser cleaning", matchType: "exact" },
          { text: "industrial laser cleaning", matchType: "phrase" },
          { text: "laser surface cleaning", matchType: "phrase" },
          { text: "professional laser cleaning", matchType: "phrase" },
          { text: "commercial laser cleaning", matchType: "phrase" },
          { text: "laser ablation cleaning", matchType: "phrase" },
          { text: "laser cleaning company", matchType: "phrase" },
          { text: "laser cleaning near me", matchType: "phrase" },
        ],
        maxCPC: 8.00
      },
      {
        name: "Rust Removal",
        keywords: [
          { text: "laser rust removal", matchType: "exact" },
          { text: "laser rust removal", matchType: "phrase" },
          { text: "industrial rust removal", matchType: "phrase" },
          { text: "rust removal services", matchType: "phrase" },
          { text: "laser rust cleaning", matchType: "phrase" },
          { text: "metal rust removal", matchType: "phrase" },
          { text: "laser oxide removal", matchType: "phrase" },
          { text: "laser corrosion removal", matchType: "phrase" },
          { text: "remove rust from metal", matchType: "phrase" },
          { text: "professional rust removal", matchType: "phrase" },
        ],
        maxCPC: 9.00
      },
      {
        name: "Paint Stripping",
        keywords: [
          { text: "laser paint removal", matchType: "exact" },
          { text: "laser paint removal", matchType: "phrase" },
          { text: "laser paint stripping", matchType: "phrase" },
          { text: "industrial paint removal", matchType: "phrase" },
          { text: "coating removal services", matchType: "phrase" },
          { text: "laser coating removal", matchType: "phrase" },
          { text: "remove paint from metal", matchType: "phrase" },
          { text: "selective paint removal", matchType: "phrase" },
          { text: "powder coating removal", matchType: "phrase" },
          { text: "industrial paint stripping", matchType: "phrase" },
        ],
        maxCPC: 8.50
      },
      {
        name: "Industrial Cleaning",
        keywords: [
          { text: "industrial surface cleaning", matchType: "phrase" },
          { text: "manufacturing cleaning services", matchType: "phrase" },
          { text: "pre-weld surface cleaning", matchType: "phrase" },
          { text: "surface preparation services", matchType: "phrase" },
          { text: "industrial surface prep", matchType: "phrase" },
          { text: "metal surface preparation", matchType: "phrase" },
          { text: "weld prep cleaning", matchType: "phrase" },
          { text: "metal fabrication cleaning", matchType: "phrase" },
          { text: "precision surface cleaning", matchType: "phrase" },
          { text: "non-abrasive cleaning", matchType: "phrase" },
        ],
        maxCPC: 7.00
      },
      {
        name: "Equipment Rental",
        keywords: [
          { text: "laser cleaning equipment rental", matchType: "exact" },
          { text: "laser cleaning equipment rental", matchType: "phrase" },
          { text: "rent laser cleaning equipment", matchType: "phrase" },
          { text: "laser cleaner rental", matchType: "phrase" },
          { text: "industrial laser rental", matchType: "phrase" },
          { text: "laser cleaning machine rental", matchType: "phrase" },
          { text: "portable laser cleaner rental", matchType: "phrase" },
          { text: "laser ablation equipment rental", matchType: "phrase" },
        ],
        maxCPC: 7.50
      }
    ]
  },
  materialSpecific: {
    name: "Material-Specific Cleaning",
    budget: 1200,
    budgetPercent: 30,
    adGroups: [
      {
        name: "Metal Cleaning",
        keywords: [
          { text: "laser metal cleaning", matchType: "phrase" },
          { text: "steel cleaning services", matchType: "phrase" },
          { text: "aluminum cleaning services", matchType: "phrase" },
          { text: "stainless steel cleaning", matchType: "phrase" },
          { text: "titanium cleaning services", matchType: "phrase" },
          { text: "laser clean steel", matchType: "phrase" },
          { text: "laser clean aluminum", matchType: "phrase" },
          { text: "exotic alloy cleaning", matchType: "phrase" },
          { text: "metal surface restoration", matchType: "phrase" },
        ],
        maxCPC: 7.00
      },
      {
        name: "Stone & Concrete",
        keywords: [
          { text: "laser stone cleaning", matchType: "phrase" },
          { text: "laser concrete cleaning", matchType: "phrase" },
          { text: "marble cleaning services", matchType: "phrase" },
          { text: "granite cleaning services", matchType: "phrase" },
          { text: "monument cleaning services", matchType: "phrase" },
          { text: "building facade cleaning", matchType: "phrase" },
          { text: "historic stone restoration", matchType: "phrase" },
          { text: "laser masonry cleaning", matchType: "phrase" },
        ],
        maxCPC: 6.50
      },
      {
        name: "Wood & Composite",
        keywords: [
          { text: "laser wood cleaning", matchType: "phrase" },
          { text: "composite material cleaning", matchType: "phrase" },
          { text: "carbon fiber cleaning", matchType: "phrase" },
          { text: "fiberglass cleaning services", matchType: "phrase" },
          { text: "wood restoration services", matchType: "phrase" },
          { text: "laser timber cleaning", matchType: "phrase" },
        ],
        maxCPC: 6.00
      }
    ]
  },
  competitorHighIntent: {
    name: "Competitor & High-Intent",
    budget: 750,
    budgetPercent: 15,
    adGroups: [
      {
        name: "Alternative Methods",
        keywords: [
          { text: "better than sandblasting", matchType: "phrase" },
          { text: "alternative to sandblasting", matchType: "phrase" },
          { text: "vs chemical stripping", matchType: "phrase" },
          { text: "eco-friendly rust removal", matchType: "phrase" },
          { text: "chemical-free cleaning", matchType: "phrase" },
          { text: "non-abrasive surface cleaning", matchType: "phrase" },
          { text: "environmentally friendly cleaning", matchType: "phrase" },
          { text: "safer than sandblasting", matchType: "phrase" },
        ],
        maxCPC: 9.00
      },
      {
        name: "Local Services",
        keywords: [
          { text: "laser cleaning near me", matchType: "phrase" },
          { text: "laser cleaning services near me", matchType: "phrase" },
          { text: "local laser cleaning", matchType: "phrase" },
          { text: "mobile laser cleaning", matchType: "phrase" },
          { text: "on-site laser cleaning", matchType: "phrase" },
          { text: "laser cleaning in [LOCATION]", matchType: "phrase" },
        ],
        maxCPC: 10.00
      }
    ]
  }
};

// Negative keywords
const negativeKeywords = [
  "diy", "home", "residential", "cheap", "free", "course", "training",
  "how to", "youtube", "video", "tutorial", "learn", "school", "class",
  "for sale", "buy", "purchase", "price", "cost", "amazon", "ebay",
  "handheld", "portable", "small", "mini", "hobby", "personal",
  "car", "automotive", "bike", "motorcycle", "jewelry", "dental",
  "tattoo", "removal", "hair", "skin", "medical"
];

// Generate keyword CSV
function generateKeywordFeed() {
  const rows = [
    ['Campaign', 'Ad Group', 'Keyword', 'Match Type', 'Max CPC', 'Final URL']
  ];

  Object.values(campaigns).forEach(campaign => {
    campaign.adGroups.forEach(adGroup => {
      adGroup.keywords.forEach(keyword => {
        const finalUrl = getFinalUrl(adGroup.name, keyword.text);
        rows.push([
          campaign.name,
          adGroup.name,
          keyword.text,
          keyword.matchType,
          `$${adGroup.maxCPC.toFixed(2)}`,
          finalUrl
        ]);
      });
    });
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Generate negative keyword CSV
function generateNegativeKeywordFeed() {
  const rows = [
    ['Campaign', 'Negative Keyword', 'Match Type']
  ];

  Object.values(campaigns).forEach(campaign => {
    negativeKeywords.forEach(keyword => {
      rows.push([
        campaign.name,
        keyword,
        'phrase'
      ]);
    });
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Generate ad copy CSV
function generateAdCopyFeed() {
  const rows = [
    ['Campaign', 'Ad Group', 'Headline 1', 'Headline 2', 'Headline 3', 'Description 1', 'Description 2', 'Final URL']
  ];

  const adCopyMap = {
    "Laser Cleaning - Broad": {
      headlines: [
        "Professional Laser Cleaning",
        "Industrial Cleaning Services",
        "$390/Hour • Mobile Service"
      ],
      descriptions: [
        "Eco-friendly laser cleaning for rust, paint, coatings. No chemicals, no waste. Free quote.",
        "Serving manufacturers nationwide. Mobile service available. Same-day response."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning"
    },
    "Rust Removal": {
      headlines: [
        "Laser Rust Removal Services",
        "Remove Rust Without Damage",
        "$390/Hr • Fast & Effective"
      ],
      descriptions: [
        "Advanced laser rust removal for steel, iron, metal surfaces. No abrasives. No chemicals.",
        "Precision rust removal without substrate damage. Mobile service nationwide. Free estimate."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?focus=rust-removal"
    },
    "Paint Stripping": {
      headlines: [
        "Laser Paint Removal Services",
        "Strip Paint & Coatings Fast",
        "$390/Hr • Chemical-Free"
      ],
      descriptions: [
        "Selective laser paint stripping for industrial applications. Remove coatings without chemicals.",
        "Precision paint removal from metal, concrete, more. Mobile service available. Free quote."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?focus=paint-removal"
    },
    "Industrial Cleaning": {
      headlines: [
        "Industrial Surface Cleaning",
        "Pre-Weld Cleaning Services",
        "$390/Hr • Manufacturer-Trusted"
      ],
      descriptions: [
        "Professional surface prep for welding, bonding, coating. No damage to substrate.",
        "Trusted by manufacturers for precision cleaning. Mobile service. Same-day availability."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?focus=industrial"
    },
    "Equipment Rental": {
      headlines: [
        "Laser Cleaning Equipment Rental",
        "Rent Industrial Laser Cleaners",
        "$320/Hour • Flexible Terms"
      ],
      descriptions: [
        "Rent professional laser cleaning equipment. Training included. Daily, weekly, monthly rates.",
        "High-power laser cleaners for rent. Operator training provided. Nationwide delivery."
      ],
      finalUrl: "https://z-beam.com/rental"
    },
    "Metal Cleaning": {
      headlines: [
        "Laser Metal Cleaning Services",
        "Steel • Aluminum • Titanium",
        "$390/Hr • Precision Cleaning"
      ],
      descriptions: [
        "Specialized laser cleaning for all metals. No surface damage. Remove rust, paint, oxides.",
        "Clean steel, aluminum, stainless, exotic alloys. Mobile service nationwide. Free estimate."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?material=metal"
    },
    "Stone & Concrete": {
      headlines: [
        "Laser Stone Cleaning Services",
        "Monument & Facade Restoration",
        "$390/Hr • Historic Preservation"
      ],
      descriptions: [
        "Gentle laser cleaning for stone, marble, granite, concrete. Preserve historic surfaces.",
        "Professional stone restoration services. No damage to original surface. Free consultation."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?material=stone"
    },
    "Wood & Composite": {
      headlines: [
        "Laser Wood Cleaning Services",
        "Composite Material Restoration",
        "$390/Hr • Gentle & Precise"
      ],
      descriptions: [
        "Specialized laser cleaning for wood, composites, carbon fiber. No heat damage.",
        "Professional restoration for wood and composite materials. Mobile service available."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?material=wood"
    },
    "Alternative Methods": {
      headlines: [
        "Better Than Sandblasting",
        "Eco-Friendly Laser Cleaning",
        "$390/Hr • No Chemicals"
      ],
      descriptions: [
        "Laser cleaning eliminates abrasives, chemicals, waste. Safer, faster, more precise.",
        "Replace sandblasting and chemical stripping with laser technology. Free demonstration."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?focus=eco-friendly"
    },
    "Local Services": {
      headlines: [
        "Mobile Laser Cleaning Service",
        "Local Industrial Cleaning",
        "$390/Hr • Same-Day Response"
      ],
      descriptions: [
        "Professional laser cleaning at your location. Serving [LOCATION] and surrounding areas.",
        "Mobile industrial cleaning services. On-site demonstrations available. Free quote."
      ],
      finalUrl: "https://z-beam.com/services/professional-cleaning?mobile=true"
    }
  };

  Object.values(campaigns).forEach(campaign => {
    campaign.adGroups.forEach(adGroup => {
      const adCopy = adCopyMap[adGroup.name];
      if (adCopy) {
        rows.push([
          campaign.name,
          adGroup.name,
          adCopy.headlines[0],
          adCopy.headlines[1],
          adCopy.headlines[2],
          adCopy.descriptions[0],
          adCopy.descriptions[1],
          adCopy.finalUrl
        ]);
      }
    });
  });

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Generate campaign budget CSV
function generateBudgetFeed() {
  const rows = [
    ['Campaign Name', 'Daily Budget', 'Monthly Budget', 'Budget %', 'Ad Groups', 'Status']
  ];

  Object.values(campaigns).forEach(campaign => {
    const dailyBudget = (campaign.budget / 30).toFixed(2);
    rows.push([
      campaign.name,
      `$${dailyBudget}`,
      `$${campaign.budget}`,
      `${campaign.budgetPercent}%`,
      campaign.adGroups.length,
      'Active'
    ]);
  });

  // Total row
  const totalMonthly = Object.values(campaigns).reduce((sum, c) => sum + c.budget, 0);
  const totalDaily = (totalMonthly / 30).toFixed(2);
  rows.push([
    'TOTAL',
    `$${totalDaily}`,
    `$${totalMonthly}`,
    '100%',
    Object.values(campaigns).reduce((sum, c) => sum + c.adGroups.length, 0),
    '-'
  ]);

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Helper function to determine final URL based on ad group and keyword
function getFinalUrl(adGroupName, keyword) {
  const baseUrl = 'https://z-beam.com';
  
  if (adGroupName.includes('Rental')) {
    return `${baseUrl}/rental`;
  }
  
  if (adGroupName.includes('Metal')) {
    return `${baseUrl}/services/professional-cleaning?material=metal`;
  }
  
  if (adGroupName.includes('Stone') || adGroupName.includes('Concrete')) {
    return `${baseUrl}/services/professional-cleaning?material=stone`;
  }
  
  if (adGroupName.includes('Wood') || adGroupName.includes('Composite')) {
    return `${baseUrl}/services/professional-cleaning?material=wood`;
  }
  
  if (keyword.includes('rust')) {
    return `${baseUrl}/services/professional-cleaning?focus=rust-removal`;
  }
  
  if (keyword.includes('paint')) {
    return `${baseUrl}/services/professional-cleaning?focus=paint-removal`;
  }
  
  return `${baseUrl}/services/professional-cleaning`;
}

// Main execution
function main() {
  const outputDir = path.join(__dirname, '../../../public/feeds/google-ads');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate all feeds
  const feeds = {
    'keywords.csv': generateKeywordFeed(),
    'negative-keywords.csv': generateNegativeKeywordFeed(),
    'ad-copy.csv': generateAdCopyFeed(),
    'campaign-budgets.csv': generateBudgetFeed()
  };

  // Write feeds to files
  Object.entries(feeds).forEach(([filename, content]) => {
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Generated: ${filepath}`);
    console.log(`   Lines: ${content.split('\n').length - 1} (excluding header)`);
  });

  console.log('\n📊 Feed Generation Summary:');
  console.log(`   Total Campaigns: ${Object.keys(campaigns).length}`);
  console.log(`   Total Ad Groups: ${Object.values(campaigns).reduce((sum, c) => sum + c.adGroups.length, 0)}`);
  console.log(`   Total Keywords: ${Object.values(campaigns).reduce((sum, c) => 
    sum + c.adGroups.reduce((agSum, ag) => agSum + ag.keywords.length, 0), 0)}`);
  console.log(`   Total Negative Keywords: ${negativeKeywords.length}`);
  console.log(`   Total Monthly Budget: $${Object.values(campaigns).reduce((sum, c) => sum + c.budget, 0)}`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateKeywordFeed, generateNegativeKeywordFeed, generateAdCopyFeed, generateBudgetFeed };
