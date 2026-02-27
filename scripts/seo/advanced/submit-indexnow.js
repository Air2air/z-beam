#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = process.env.INDEXNOW_HOST || 'www.z-beam.com';
const KEY = process.env.INDEXNOW_KEY || '';
const KEY_LOCATION = process.env.INDEXNOW_KEY_LOCATION || `https://${HOST}/${KEY}.txt`;
const DRY_RUN = process.argv.includes('--dry-run');

function extractUrlsFromDeltaSitemap(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const xml = fs.readFileSync(filePath, 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const explicitUrls = process.argv.filter((arg) => arg.startsWith('http'));
  const deltaPath = path.join(process.cwd(), 'public', 'sitemaps', 'sitemap-delta.xml');
  const deltaUrls = explicitUrls.length > 0 ? [] : extractUrlsFromDeltaSitemap(deltaPath);
  const urlList = [...new Set([...explicitUrls, ...deltaUrls])];

  if (urlList.length === 0) {
    console.log('ℹ️ No URLs to submit. Provide explicit URLs or generate `public/sitemaps/sitemap-delta.xml`.');
    return;
  }

  if (!KEY) {
    throw new Error('INDEXNOW_KEY is required to submit URLs to IndexNow.');
  }

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  if (DRY_RUN) {
    console.log('🧪 Dry run payload:');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await postJson(INDEXNOW_ENDPOINT, payload);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`IndexNow submission failed (HTTP ${response.status}): ${response.body || 'no body'}`);
  }

  console.log(`✅ IndexNow submitted ${urlList.length} URL(s)`);
  console.log(`   Response: HTTP ${response.status}`);
}

main().catch((error) => {
  console.error(`❌ IndexNow submission error: ${error.message}`);
  process.exit(1);
});
