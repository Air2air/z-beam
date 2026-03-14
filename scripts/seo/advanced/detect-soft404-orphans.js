#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://www.z-beam.com';
const MAX_URLS = Number(process.env.MAX_URLS || 400);
const OUTPUT_FILE = path.join(process.cwd(), 'reports', 'seo', 'soft404-orphan-report.json');
const STRICT_MODE = process.argv.includes('--strict') || process.env.STRICT_MODE === '1';

function fetchText(url, timeout = 25000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode || 0, data }));
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => req.destroy(new Error(`Timeout: ${url}`)));
  });
}

function normalize(url) {
  const parsed = new URL(url, SITE_URL);
  parsed.hash = '';
  if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => normalize(match[1].trim()));
}

function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1].trim().toLowerCase() : '';
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractInternalLinks(html) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1].trim())
    .filter((href) => href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
    .map((href) => normalize(href));
}

async function main() {
  const sitemap = await fetchText(`${SITE_URL}/sitemap.xml`);
  if (sitemap.status !== 200) {
    throw new Error(`Failed to fetch sitemap.xml (HTTP ${sitemap.status})`);
  }

  const urls = extractSitemapUrls(sitemap.data).slice(0, MAX_URLS);
  const inDegree = new Map(urls.map((url) => [url, 0]));
  const soft404 = [];

  for (const url of urls) {
    try {
      const response = await fetchText(url);
      if (response.status >= 400) continue;
      const html = response.data;
      const title = extractTitle(html);
      const text = stripHtml(html);
      const links = extractInternalLinks(html);

      for (const target of links) {
        if (inDegree.has(target)) {
          inDegree.set(target, (inDegree.get(target) || 0) + 1);
        }
      }

      const maybeSoft404Title = /404|not found|page not found|error/.test(title);
      const maybeThin = text.split(' ').length < 120;
      if (response.status === 200 && maybeSoft404Title && maybeThin) {
        soft404.push(url);
      }
    } catch {
    }
  }

  const orphanExempt = new Set([
    normalize(SITE_URL),
    normalize(`${SITE_URL}/search`),
    normalize(`${SITE_URL}/confirmation`),
    normalize(`${SITE_URL}/confirm-scheduling`),
  ]);

  const orphans = Array.from(inDegree.entries())
    .filter(([url, count]) => count === 0 && !orphanExempt.has(url))
    .map(([url]) => url);

  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    urlsChecked: urls.length,
    soft404,
    orphans,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log('📊 Soft-404 / orphan report');
  console.log(`   URLs checked: ${urls.length}`);
  console.log(`   Soft-404 candidates: ${soft404.length}`);
  console.log(`   Orphan URLs: ${orphans.length}`);
  console.log(`   Report: ${OUTPUT_FILE}`);

  if (soft404.length > 0) {
    if (!STRICT_MODE) {
      console.log('⚠️ Soft-404 candidates detected (advisory mode). Re-run with --strict to enforce blocking.');
      return;
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`❌ Soft-404/orphan check failed: ${error.message}`);
  process.exit(1);
});
