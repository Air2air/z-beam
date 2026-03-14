#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://www.z-beam.com';
const MAX_URLS = Number(process.env.MAX_URLS || 800);
const OUTPUT_FILE = path.join(process.cwd(), 'reports', 'seo', 'canonical-graph-report.json');
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

function normalize(url) {
  const parsed = new URL(url, SITE_URL);
  parsed.hash = '';
  if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

function extractCanonical(html) {
  const tag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
  if (!tag) return null;
  const href = tag[0].match(/\bhref=["']([^"']+)["']/i);
  return href ? normalize(href[1]) : null;
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => normalize(match[1].trim()));
}

function findCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const inStack = new Set();

  function dfs(node, pathStack) {
    if (inStack.has(node)) {
      const start = pathStack.indexOf(node);
      if (start >= 0) cycles.push(pathStack.slice(start));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    inStack.add(node);
    const next = graph.get(node);
    if (next && graph.has(next) && next !== node) {
      dfs(next, [...pathStack, next]);
    }
    inStack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node, [node]);
  }
  return cycles;
}

async function main() {
  const sitemap = await fetchText(`${SITE_URL}/sitemap.xml`);
  if (sitemap.status !== 200) {
    throw new Error(`Cannot fetch sitemap.xml (HTTP ${sitemap.status})`);
  }

  const urls = extractSitemapUrls(sitemap.data).slice(0, MAX_URLS);
  const graph = new Map();
  const missingCanonical = [];
  const offDomainCanonical = [];
  const mismatches = [];

  for (const url of urls) {
    try {
      const response = await fetchText(url, 20000);
      if (response.status < 200 || response.status >= 400) continue;
      const canonical = extractCanonical(response.data);

      if (!canonical) {
        missingCanonical.push(url);
        continue;
      }

      if (!canonical.startsWith(SITE_URL)) {
        offDomainCanonical.push({ url, canonical });
      }

      graph.set(url, canonical);
      if (canonical !== url) {
        mismatches.push({ url, canonical });
      }
    } catch {
    }
  }

  const cycles = findCycles(graph);
  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    urlsChecked: urls.length,
    missingCanonical,
    offDomainCanonical,
    mismatchCount: mismatches.length,
    cycles,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log('📊 Canonical graph report');
  console.log(`   URLs checked: ${report.urlsChecked}`);
  console.log(`   Missing canonical: ${missingCanonical.length}`);
  console.log(`   Off-domain canonical: ${offDomainCanonical.length}`);
  console.log(`   Canonical mismatches: ${mismatches.length}`);
  console.log(`   Canonical cycles: ${cycles.length}`);
  console.log(`   Report: ${OUTPUT_FILE}`);

  if (missingCanonical.length > 0 || offDomainCanonical.length > 0 || cycles.length > 0) {
    if (!STRICT_MODE) {
      console.log('⚠️ Canonical graph findings detected (advisory mode). Re-run with --strict to enforce blocking.');
      return;
    }

    process.exit(1);
  }

  console.log('✅ Canonical graph check passed');
}

main().catch((error) => {
  console.error(`❌ Canonical graph check failed: ${error.message}`);
  process.exit(1);
});
