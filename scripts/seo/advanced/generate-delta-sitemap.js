#!/usr/bin/env node

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const yaml = require('js-yaml');

const SITE_URL = process.env.SITE_URL || 'https://www.z-beam.com';
const DELTA_DAYS = Number(process.env.DELTA_DAYS || 7);
const FRONTMATTER_DIR = path.join(process.cwd(), 'frontmatter');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'sitemaps', 'sitemap-delta.xml');

function toIsoDate(date) {
  return new Date(date).toISOString();
}

async function walkYamlFiles(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkYamlFiles(fullPath)));
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
      files.push(fullPath);
    }
  }
  return files;
}

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  if (!fs.existsSync(FRONTMATTER_DIR)) {
    throw new Error(`Frontmatter directory not found: ${FRONTMATTER_DIR}`);
  }

  const cutoff = Date.now() - (DELTA_DAYS * 24 * 60 * 60 * 1000);
  const yamlFiles = await walkYamlFiles(FRONTMATTER_DIR);
  const urls = [];

  for (const filePath of yamlFiles) {
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const doc = yaml.load(raw);
      if (!doc || typeof doc !== 'object') continue;

      const fullPath = typeof doc.fullPath === 'string' ? doc.fullPath : null;
      const dateModified = typeof doc.dateModified === 'string' ? Date.parse(doc.dateModified) : NaN;
      if (!fullPath || Number.isNaN(dateModified)) continue;
      if (dateModified < cutoff) continue;

      const absoluteUrl = `${SITE_URL}${fullPath.startsWith('/') ? fullPath : `/${fullPath}`}`;
      urls.push({
        loc: absoluteUrl,
        lastmod: toIsoDate(dateModified),
      });
    } catch {
    }
  }

  const deduped = Array.from(new Map(urls.map((u) => [u.loc, u])).values())
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...deduped.map((url) => [
      '  <url>',
      `    <loc>${xmlEscape(url.loc)}</loc>`,
      `    <lastmod>${xmlEscape(url.lastmod)}</lastmod>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
    '',
  ].join('\n');

  await fsp.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fsp.writeFile(OUTPUT_FILE, xml, 'utf8');

  console.log(`✅ Delta sitemap written: ${OUTPUT_FILE}`);
  console.log(`   URLs included: ${deduped.length}`);
  console.log(`   Window: last ${DELTA_DAYS} day(s)`);
}

main().catch((error) => {
  console.error(`❌ Failed to generate delta sitemap: ${error.message}`);
  process.exit(1);
});
