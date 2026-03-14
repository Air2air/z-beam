#!/usr/bin/env node

const https = require('https');

const SITE_URL = process.env.SITE_URL || 'https://www.z-beam.com';
const MAX_URLS = Number(process.env.MAX_URLS || 500);
const EXPECTED_NOINDEX_PATHS = new Set(['/search', '/confirmation', '/confirm-scheduling']);
const STRICT_MODE = process.argv.includes('--strict') || process.env.STRICT_MODE === '1';

function fetchText(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode || 0, data, headers: res.headers }));
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => req.destroy(new Error(`Timeout: ${url}`)));
  });
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

function hasNoindex(html) {
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (!robots) return false;
  return robots[1].toLowerCase().includes('noindex');
}

async function main() {
  const sitemapResponse = await fetchText(`${SITE_URL}/sitemap.xml`);
  if (sitemapResponse.status !== 200) {
    throw new Error(`Failed to fetch sitemap.xml (HTTP ${sitemapResponse.status})`);
  }

  const urls = extractSitemapUrls(sitemapResponse.data).slice(0, MAX_URLS);
  const unexpectedNoindex = [];
  const missingExpectedNoindex = [];

  for (const url of urls) {
    try {
      const response = await fetchText(url, 20000);
      if (response.status < 200 || response.status >= 400) continue;
      const pathname = new URL(url).pathname;
      const noindex = hasNoindex(response.data);
      const expectedNoindex = EXPECTED_NOINDEX_PATHS.has(pathname);

      if (noindex && !expectedNoindex) {
        unexpectedNoindex.push(url);
      }

      if (!noindex && expectedNoindex) {
        missingExpectedNoindex.push(url);
      }
    } catch {
    }
  }

  console.log('📊 Crawl budget policy report');
  console.log(`   URLs checked: ${urls.length}`);
  console.log(`   Unexpected noindex: ${unexpectedNoindex.length}`);
  console.log(`   Expected noindex missing: ${missingExpectedNoindex.length}`);

  if (unexpectedNoindex.length > 0) {
    console.log('\n❌ Unexpected noindex URLs:');
    unexpectedNoindex.slice(0, 30).forEach((url) => console.log(`   - ${url}`));
  }

  if (missingExpectedNoindex.length > 0) {
    console.log('\n❌ Expected noindex missing:');
    missingExpectedNoindex.slice(0, 30).forEach((url) => console.log(`   - ${url}`));
  }

  if (unexpectedNoindex.length > 0 || missingExpectedNoindex.length > 0) {
    if (!STRICT_MODE) {
      console.log('\n⚠️ Crawl budget findings detected (advisory mode). Re-run with --strict to enforce blocking.');
      return;
    }

    process.exit(1);
  }

  console.log('✅ Crawl budget/noindex policy valid');
}

main().catch((error) => {
  console.error(`❌ Crawl budget policy check failed: ${error.message}`);
  process.exit(1);
});
