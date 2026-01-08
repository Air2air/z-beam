#!/usr/bin/env node
/**
 * Google Merchant Feed Validation
 * Validates feed accessibility, structure, and content after deployment
 */

const https = require('https');
const { parseStringPromise } = require('xml2js');
const { BASE_URL } = require('../../../config/urls');

// BASE_URL imported from config/urls.js
// Provides environment-aware URL resolution
const REQUIRED_FIELDS = [
  'g:id',
  'g:title',
  'g:description',
  'g:link',
  'g:image_link',
  'g:price',
  'g:availability',
  'g:condition',
  'g:brand',
  'g:mpn'
];

const VALIDATION_RULES = {
  minProducts: 100, // Expect at least 100 products
  maxProducts: 200, // Should not exceed 200
  requiredSKUPrefix: ['Z-BEAM-CLEAN', 'ZB-EQUIP-RENT'],
  requiredBrand: 'Z-Beam',
  requiredAvailability: 'in stock',
  requiredCondition: 'new'
};

/**
 * Fetch URL content with timeout
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout fetching ${url}`));
    }, 10000);

    https.get(url, { headers: { 'User-Agent': 'Z-Beam Feed Validator' } }, (res) => {
      clearTimeout(timeout);
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Validate XML feed structure and content
 */
async function validateXmlFeed(url) {
  console.log(`\n🔍 Validating XML feed: ${url}`);
  
  const errors = [];
  const warnings = [];
  
  try {
    // Fetch feed
    const xml = await fetchUrl(url);
    console.log(`✅ Feed accessible (${(xml.length / 1024).toFixed(2)} KB)`);
    
    // Parse XML
    const feed = await parseStringPromise(xml);
    
    if (!feed.rss || !feed.rss.channel || !feed.rss.channel[0]) {
      errors.push('Invalid RSS structure');
      return { errors, warnings };
    }
    
    const channel = feed.rss.channel[0];
    const items = channel.item || [];
    
    console.log(`📦 Products found: ${items.length}`);
    
    // Validate product count
    if (items.length < VALIDATION_RULES.minProducts) {
      errors.push(`Too few products: ${items.length} (expected at least ${VALIDATION_RULES.minProducts})`);
    } else if (items.length > VALIDATION_RULES.maxProducts) {
      warnings.push(`Unusually high product count: ${items.length}`);
    } else {
      console.log(`✅ Product count within expected range`);
    }
    
    // Validate sample products
    const sampleSize = Math.min(5, items.length);
    console.log(`\n🔬 Validating ${sampleSize} sample products...`);
    
    for (let i = 0; i < sampleSize; i++) {
      const item = items[i];
      const productId = item['g:id'] ? item['g:id'][0] : 'unknown';
      
      // Check required fields
      const missingFields = REQUIRED_FIELDS.filter(field => !item[field]);
      if (missingFields.length > 0) {
        errors.push(`Product ${productId}: Missing fields: ${missingFields.join(', ')}`);
        continue;
      }
      
      // Validate SKU format
      const mpn = item['g:mpn'][0];
      const hasSKUPrefix = VALIDATION_RULES.requiredSKUPrefix.some(prefix => mpn.startsWith(prefix));
      if (!hasSKUPrefix) {
        warnings.push(`Product ${productId}: Unexpected SKU format: ${mpn}`);
      }
      
      // Validate brand
      const brand = item['g:brand'][0];
      if (brand !== VALIDATION_RULES.requiredBrand) {
        errors.push(`Product ${productId}: Wrong brand: ${brand}`);
      }
      
      // Validate availability
      const availability = item['g:availability'][0];
      if (availability !== VALIDATION_RULES.requiredAvailability) {
        warnings.push(`Product ${productId}: Unexpected availability: ${availability}`);
      }
      
      // Validate condition
      const condition = item['g:condition'][0];
      if (condition !== VALIDATION_RULES.requiredCondition) {
        errors.push(`Product ${productId}: Wrong condition: ${condition}`);
      }
      
      // Validate URLs
      const link = item['g:link'][0];
      if (!link.startsWith(BASE_URL)) {
        errors.push(`Product ${productId}: Invalid link: ${link}`);
      }
      
      const imageLink = item['g:image_link'][0];
      if (!imageLink.startsWith(BASE_URL)) {
        errors.push(`Product ${productId}: Invalid image link: ${imageLink}`);
      }
      
      console.log(`  ✓ ${productId}: ${item['g:title'][0]}`);
    }
    
    // Validate all SKUs are unique
    const skus = items.map(item => item['g:id'] ? item['g:id'][0] : null).filter(Boolean);
    const uniqueSkus = new Set(skus);
    if (skus.length !== uniqueSkus.size) {
      errors.push(`Duplicate SKUs detected (${skus.length - uniqueSkus.size} duplicates)`);
    } else {
      console.log(`✅ All SKUs are unique`);
    }
    
    // Check for service types distribution
    const skuCounts = {};
    VALIDATION_RULES.requiredSKUPrefix.forEach(prefix => {
      skuCounts[prefix] = items.filter(item => {
        const mpn = item['g:mpn'] ? item['g:mpn'][0] : '';
        return mpn.startsWith(prefix);
      }).length;
    });
    
    console.log(`\n📊 Service type distribution:`);
    Object.entries(skuCounts).forEach(([prefix, count]) => {
      console.log(`  • ${prefix}: ${count} products`);
    });
    
  } catch (error) {
    errors.push(`Feed validation error: ${error.message}`);
  }
  
  return { errors, warnings };
}

/**
 * Validate CSV feed accessibility
 */
async function validateCsvFeed(url) {
  console.log(`\n🔍 Validating CSV feed: ${url}`);
  
  const errors = [];
  const warnings = [];
  
  try {
    const csv = await fetchUrl(url);
    console.log(`✅ Feed accessible (${(csv.length / 1024).toFixed(2)} KB)`);
    
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split('\t');
    const dataLines = lines.slice(1);
    
    console.log(`📦 Products found: ${dataLines.length}`);
    console.log(`📋 Columns: ${headers.length}`);
    
    // Validate header columns
    const missingFields = REQUIRED_FIELDS.map(field => field.replace('g:', '')).filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      errors.push(`CSV missing required columns: ${missingFields.join(', ')}`);
    }
    
    // Validate product count matches XML
    if (dataLines.length < VALIDATION_RULES.minProducts) {
      errors.push(`Too few products in CSV: ${dataLines.length}`);
    }
    
  } catch (error) {
    errors.push(`CSV validation error: ${error.message}`);
  }
  
  return { errors, warnings };
}

/**
 * Validate feed URLs are in sitemap
 */
async function validateFeedInSitemap() {
  console.log(`\n🔍 Checking if feeds are in sitemap...`);
  
  const errors = [];
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  
  try {
    const sitemap = await fetchUrl(sitemapUrl);
    
    const feedUrls = [
      `${BASE_URL}/feeds/google-merchant-feed.xml`,
      `${BASE_URL}/feeds/google-merchant-feed.csv`
    ];
    
    feedUrls.forEach(feedUrl => {
      if (sitemap.includes(feedUrl)) {
        console.log(`  ✅ Found in sitemap: ${feedUrl}`);
      } else {
        // This is informational, not an error
        console.log(`  ℹ️  Not in sitemap: ${feedUrl} (feeds typically not in sitemap)`);
      }
    });
    
  } catch (error) {
    errors.push(`Sitemap check error: ${error.message}`);
  }
  
  return { errors };
}

/**
 * Main validation
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║        Google Merchant Feed Validation                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n🌐 Base URL: ${BASE_URL}`);
  
  const allErrors = [];
  const allWarnings = [];
  
  // Validate XML feed
  const xmlUrl = `${BASE_URL}/feeds/google-merchant-feed.xml`;
  const xmlResults = await validateXmlFeed(xmlUrl);
  allErrors.push(...xmlResults.errors);
  allWarnings.push(...xmlResults.warnings);
  
  // Validate CSV feed
  const csvUrl = `${BASE_URL}/feeds/google-merchant-feed.csv`;
  const csvResults = await validateCsvFeed(csvUrl);
  allErrors.push(...csvResults.errors);
  allWarnings.push(...csvResults.warnings);
  
  // Check sitemap
  const sitemapResults = await validateFeedInSitemap();
  allErrors.push(...sitemapResults.errors);
  
  // Summary
  console.log('\n' + '═'.repeat(66));
  console.log('📊 VALIDATION SUMMARY');
  console.log('═'.repeat(66));
  
  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log('\n✅ All feed validations passed!');
    console.log('\n🎯 Ready for Google Merchant Center submission');
    process.exit(0);
  }
  
  if (allWarnings.length > 0) {
    console.log(`\n⚠️  Warnings (${allWarnings.length}):`);
    allWarnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  if (allErrors.length > 0) {
    console.log(`\n❌ Errors (${allErrors.length}):`);
    allErrors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    console.log('\n❌ Feed validation failed!');
    process.exit(1);
  }
  
  console.log('\n⚠️  Feeds accessible but have warnings');
  process.exit(0);
}

// Run validation
main().catch(error => {
  console.error('\n💥 Validation crashed:', error.message);
  process.exit(1);
});
