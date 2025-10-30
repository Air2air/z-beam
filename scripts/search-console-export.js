#!/usr/bin/env node
/**
 * Daily Search Console Data Export
 * 
 * Fetches key metrics from Google Search Console and saves them locally
 * for AI analysis and tracking.
 * 
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Enable "Google Search Console API"
 * 3. Create a Service Account
 * 4. Download the JSON key file
 * 5. Add the service account email to Search Console (as Owner)
 * 6. Set environment variable: GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 * 
 * Or for GitHub Actions:
 * 1. Add the JSON content as GitHub Secret: GSC_SERVICE_ACCOUNT_KEY
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { GoogleAuth } = require('google-auth-library');

const SITE_URL = 'sc-domain:z-beam.com'; // or 'https://www.z-beam.com/'
const DATA_DIR = path.join(__dirname, '../data/search-console');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Get dates for the query (last 7 days)
 */
function getDates() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2); // 2 days ago (data delay)
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

/**
 * Make authenticated request to Search Console API
 */
async function querySearchConsole(auth, requestBody) {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API Error: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Export top queries
 */
async function exportTopQueries(auth, dates) {
  console.log('📊 Fetching top queries...');
  
  const data = await querySearchConsole(auth, {
    startDate: dates.startDate,
    endDate: dates.endDate,
    dimensions: ['query'],
    rowLimit: 100,
  });
  
  const filename = path.join(DATA_DIR, `queries-${dates.endDate}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  
  console.log(`✅ Saved ${data.rows?.length || 0} queries to ${filename}`);
  return data;
}

/**
 * Export top pages
 */
async function exportTopPages(auth, dates) {
  console.log('📄 Fetching top pages...');
  
  const data = await querySearchConsole(auth, {
    startDate: dates.startDate,
    endDate: dates.endDate,
    dimensions: ['page'],
    rowLimit: 100,
  });
  
  const filename = path.join(DATA_DIR, `pages-${dates.endDate}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  
  console.log(`✅ Saved ${data.rows?.length || 0} pages to ${filename}`);
  return data;
}

/**
 * Export device breakdown
 */
async function exportDeviceBreakdown(auth, dates) {
  console.log('📱 Fetching device breakdown...');
  
  const data = await querySearchConsole(auth, {
    startDate: dates.startDate,
    endDate: dates.endDate,
    dimensions: ['device'],
  });
  
  const filename = path.join(DATA_DIR, `devices-${dates.endDate}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  
  console.log(`✅ Saved device data to ${filename}`);
  return data;
}

/**
 * Export country breakdown
 */
async function exportCountryBreakdown(auth, dates) {
  console.log('🌍 Fetching country breakdown...');
  
  const data = await querySearchConsole(auth, {
    startDate: dates.startDate,
    endDate: dates.endDate,
    dimensions: ['country'],
    rowLimit: 50,
  });
  
  const filename = path.join(DATA_DIR, `countries-${dates.endDate}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  
  console.log(`✅ Saved ${data.rows?.length || 0} countries to ${filename}`);
  return data;
}

/**
 * Generate summary report
 */
function generateSummary(queries, pages, devices, countries, dates) {
  const totalClicks = queries.rows?.reduce((sum, row) => sum + row.clicks, 0) || 0;
  const totalImpressions = queries.rows?.reduce((sum, row) => sum + row.impressions, 0) || 0;
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = queries.rows?.length > 0
    ? queries.rows.reduce((sum, row) => sum + row.position, 0) / queries.rows.length
    : 0;
  
  const summary = {
    date: dates.endDate,
    period: `${dates.startDate} to ${dates.endDate}`,
    metrics: {
      totalClicks,
      totalImpressions,
      avgCtr: avgCtr.toFixed(2),
      avgPosition: avgPosition.toFixed(1),
    },
    topQueries: queries.rows?.slice(0, 10).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: (row.ctr * 100).toFixed(2) + '%',
      position: row.position.toFixed(1),
    })) || [],
    topPages: pages.rows?.slice(0, 10).map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
    })) || [],
    devices: devices.rows?.map(row => ({
      device: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
    })) || [],
    topCountries: countries.rows?.slice(0, 10).map(row => ({
      country: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
    })) || [],
  };
  
  const filename = path.join(DATA_DIR, `summary-${dates.endDate}.json`);
  fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
  
  // Also create a latest.json for easy access
  const latestFilename = path.join(DATA_DIR, 'latest.json');
  fs.writeFileSync(latestFilename, JSON.stringify(summary, null, 2));
  
  console.log(`\n📋 Summary for ${dates.endDate}:`);
  console.log(`   Total Clicks: ${totalClicks.toLocaleString()}`);
  console.log(`   Total Impressions: ${totalImpressions.toLocaleString()}`);
  console.log(`   Average CTR: ${avgCtr.toFixed(2)}%`);
  console.log(`   Average Position: ${avgPosition.toFixed(1)}`);
  console.log(`\n✅ Saved summary to ${filename}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting Search Console data export...\n');
    
    // Initialize Google Auth
    let auth;
    
    if (process.env.GSC_SERVICE_ACCOUNT_KEY) {
      // GitHub Actions: Use secret
      console.log('🔑 Using GSC_SERVICE_ACCOUNT_KEY from environment');
      const credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_KEY);
      auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Local: Use credentials file
      console.log('🔑 Using GOOGLE_APPLICATION_CREDENTIALS file');
      auth = new GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });
    } else {
      throw new Error('No credentials found. Set GSC_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS');
    }
    
    const dates = getDates();
    console.log(`📅 Fetching data from ${dates.startDate} to ${dates.endDate}\n`);
    
    // Fetch all data
    const queries = await exportTopQueries(auth, dates);
    const pages = await exportTopPages(auth, dates);
    const devices = await exportDeviceBreakdown(auth, dates);
    const countries = await exportCountryBreakdown(auth, dates);
    
    // Generate summary
    generateSummary(queries, pages, devices, countries, dates);
    
    console.log('\n✨ Export complete!\n');
    console.log('💡 Next steps:');
    console.log('   1. Review the data in data/search-console/');
    console.log('   2. Ask GitHub Copilot: "Analyze the latest Search Console data and suggest improvements"');
    console.log('   3. Check data/search-console/latest.json for quick overview\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n🔧 Authentication issue. Make sure:');
      console.error('   1. The service account is added to Search Console');
      console.error('   2. The credentials are valid');
      console.error('   3. The Search Console API is enabled');
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
