#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://www.z-beam.com';
const MAX_URLS = Number(process.env.MAX_URLS || 250);
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

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);

  const entities = [];
  const parseErrors = [];

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block);
      if (Array.isArray(parsed)) {
        entities.push(...parsed);
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        entities.push(...parsed['@graph']);
      } else {
        entities.push(parsed);
      }
    } catch (error) {
      parseErrors.push(String(error.message || error));
    }
  }

  return { entities, parseErrors };
}

function normalizeTypes(typeValue) {
  if (!typeValue) return [];
  return Array.isArray(typeValue) ? typeValue.slice().sort() : [String(typeValue)];
}

function countBlockingFindings({ parseErrors = [], invalidIds = [], invalidSameAs = [], conflictingIds = [] }) {
  return parseErrors.length + invalidIds.length + invalidSameAs.length + conflictingIds.length;
}

function getOutcome({ strictMode, blockingFindingCount }) {
  if (strictMode && blockingFindingCount > 0) {
    return {
      shouldFail: true,
      message: '❌ Strict mode enabled: entity graph findings are blocking',
    };
  }

  if (blockingFindingCount > 0) {
    return {
      shouldFail: false,
      message: '⚠️ Findings detected (advisory mode). Re-run with --strict to enforce blocking.',
    };
  }

  return {
    shouldFail: false,
    message: '✅ Entity graph consistency check passed',
  };
}

async function main() {
  const sitemap = await fetchText(`${SITE_URL}/sitemap.xml`);
  if (sitemap.status !== 200) {
    throw new Error(`Cannot fetch sitemap.xml (HTTP ${sitemap.status})`);
  }

  const urls = extractSitemapUrls(sitemap.data).slice(0, MAX_URLS);
  const idMap = new Map();
  const parseErrors = [];
  const invalidIds = [];
  const invalidSameAs = [];

  for (const url of urls) {
    try {
      const page = await fetchText(url);
      if (page.status < 200 || page.status >= 400) continue;
      const { entities, parseErrors: pageParseErrors } = extractJsonLd(page.data);
      parseErrors.push(...pageParseErrors.map((err) => ({ url, error: err })));

      for (const entity of entities) {
        if (!entity || typeof entity !== 'object') continue;

        const entityId = entity['@id'];
        const types = normalizeTypes(entity['@type']);

        if (entityId) {
          if (typeof entityId !== 'string' || (!entityId.startsWith('http') && !entityId.startsWith('#'))) {
            invalidIds.push({ url, id: entityId });
          } else {
            if (!idMap.has(entityId)) {
              idMap.set(entityId, { pages: new Set(), typeSignatures: new Set() });
            }
            const entry = idMap.get(entityId);
            entry.pages.add(url);
            entry.typeSignatures.add(types.join('|'));
          }
        }

        const sameAs = entity.sameAs;
        if (Array.isArray(sameAs)) {
          for (const ref of sameAs) {
            if (typeof ref !== 'string' || !ref.startsWith('https://')) {
              invalidSameAs.push({ url, sameAs: ref });
            }
          }
        }
      }
    } catch {
    }
  }

  const conflictingIds = [];
  for (const [id, entry] of idMap.entries()) {
    if (entry.typeSignatures.size > 1) {
      conflictingIds.push({
        id,
        typeSignatures: Array.from(entry.typeSignatures),
        pages: Array.from(entry.pages),
      });
    }
  }

  console.log('🧠 Entity graph consistency');
  console.log(`   URLs checked: ${urls.length}`);
  console.log(`   JSON-LD parse errors: ${parseErrors.length}`);
  console.log(`   Invalid @id entries: ${invalidIds.length}`);
  console.log(`   Invalid sameAs entries: ${invalidSameAs.length}`);
  console.log(`   Conflicting @id type signatures: ${conflictingIds.length}`);

  const reportDir = path.join(process.cwd(), 'reports', 'seo');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'entity-graph-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    siteUrl: SITE_URL,
    strictMode: STRICT_MODE,
    urlsChecked: urls.length,
    parseErrors,
    invalidIds,
    invalidSameAs,
    conflictingIds,
  }, null, 2));
  console.log(`   Report: ${reportPath}`);

  const blockingFindingCount = countBlockingFindings({
    parseErrors,
    invalidIds,
    invalidSameAs,
    conflictingIds,
  });
  const outcome = getOutcome({ strictMode: STRICT_MODE, blockingFindingCount });

  if (outcome.shouldFail) {
    console.log(outcome.message);
    process.exit(1);
  }

  console.log(outcome.message);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`❌ Entity graph check failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  countBlockingFindings,
  getOutcome,
};
