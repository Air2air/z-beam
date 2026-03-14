// app/sitemap.xml/route.ts
// Custom Route Handler for /sitemap.xml
// Generates properly formatted, indented XML instead of Next.js compact output.

import { SITE_CONFIG } from '@/app/config/site';
import fs from 'fs';
import path from 'path';
import { buildCategoryUrl, buildSubcategoryUrl, buildUrlFromMetadata } from '../utils/urlBuilder';
import { toCategorySlug } from '../utils/formatting';

export const dynamic = 'force-static';

// ─── Constants ───────────────────────────────────────────────────────────────

const SITEMAP_PRIORITIES = {
  HOMEPAGE: 1.0,
  MONEY_PAGES: 0.95,
  CONTENT_HUBS: 0.9,
  CATEGORY_PAGES: 0.85,
  PARTNER_PAGES: 0.8,
  ITEM_PAGES: 0.8,
  SUBCATEGORY_PAGES: 0.75,
  INFORMATIONAL: 0.7,
  TECHNICAL_REF: 0.6,
  SEARCH: 0.5,
} as const;

const CHANGE_FREQUENCY = {
  REAL_TIME: 'daily',
  HIGH_VALUE: 'weekly',
  MODERATE: 'monthly',
} as const;

// 16 locales for international SEO coverage
const HREFLANG_LOCALES = [
  'en-US', 'en-GB', 'en-CA', 'en-AU',
  'es-MX', 'es-ES',
  'fr-CA',
  'de-DE',
  'zh-CN',
  'pt-BR',
  'ja-JP',
  'ko-KR',
  'it-IT',
  'pl-PL',
  'nl-NL',
  'x-default',
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: string;
  priority?: number;
}

// ─── XML helpers ─────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(d?: Date | string): string {
  if (!d) return new Date().toISOString();
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function entryToXml(entry: SitemapEntry): string {
  const loc = escapeXml(entry.url);
  const hreflangLines = HREFLANG_LOCALES.map(
    (lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}" />`
  ).join('\n');

  const lastmod = `    <lastmod>${formatDate(entry.lastModified)}</lastmod>`;
  const changefreq = entry.changeFrequency
    ? `    <changefreq>${entry.changeFrequency}</changefreq>`
    : '';
  const priority = entry.priority !== undefined
    ? `    <priority>${entry.priority}</priority>`
    : '';

  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    hreflangLines,
    lastmod,
    changefreq,
    priority,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urlBlocks = entries.map(entryToXml).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlBlocks,
    '</urlset>',
  ].join('\n');
}

// ─── Data collection ─────────────────────────────────────────────────────────

/**
 * Shared handler for the 3 standard 4-level domains: materials, contaminants, compounds.
 * Each YAML file contributes category + subcategory nav pages and one item page.
 * @param requireSubcategoryForItem - When true, item pages are only added when a subcategory exists (materials behaviour).
 */
function generateStandardDomainEntries(
  domain: string,
  entries: SitemapEntry[],
  requireSubcategoryForItem = false,
): void {
  try {
    const dir = path.join(process.cwd(), `frontmatter/${domain}`);
    const categorySet = new Set<string>();
    const subcategorySet = new Set<string>();

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.yaml'))) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const categoryMatch = fileContent.match(/^category:\s*(.+)$/m);
      const subcategoryMatch = fileContent.match(/^subcategory:\s*(.+)$/m);
      if (!categoryMatch) continue;

      const category = toCategorySlug(categoryMatch[1].trim()).replace(/'/g, '');
      const subcategory = subcategoryMatch ? toCategorySlug(subcategoryMatch[1].trim()).replace(/'/g, '') : '';
      const slug = file.replace('.yaml', '');

      if (!category) continue;

      if (!categorySet.has(category)) {
        categorySet.add(category);
        entries.push({ url: buildCategoryUrl(domain, category, true), lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CATEGORY_PAGES });
      }
      if (subcategory && !subcategorySet.has(`${category}/${subcategory}`)) {
        subcategorySet.add(`${category}/${subcategory}`);
        entries.push({ url: buildSubcategoryUrl(domain, category, subcategory, true), lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.SUBCATEGORY_PAGES });
      }
      if (!requireSubcategoryForItem || subcategory) {
        entries.push({ url: buildUrlFromMetadata({ rootPath: domain, category, subcategory, slug }, true), lastModified: stats.mtime, changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.ITEM_PAGES });
      }
    }
  } catch (error) {
    console.error(`Error generating ${domain} routes:`, error);
  }
}

function collectEntries(baseUrl: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  // ── Static routes ──────────────────────────────────────────────────────────
  entries.push(
    { url: baseUrl, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.REAL_TIME, priority: SITEMAP_PRIORITIES.HOMEPAGE },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.MODERATE, priority: SITEMAP_PRIORITIES.INFORMATIONAL },
    { url: `${baseUrl}/rental`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.MONEY_PAGES },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.MONEY_PAGES },
    { url: `${baseUrl}/partners`, lastModified: new Date('2025-10-17'), changeFrequency: CHANGE_FREQUENCY.MODERATE, priority: SITEMAP_PRIORITIES.PARTNER_PAGES },
    { url: `${baseUrl}/netalux`, lastModified: new Date('2025-10-25'), changeFrequency: CHANGE_FREQUENCY.MODERATE, priority: SITEMAP_PRIORITIES.PARTNER_PAGES },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.MODERATE, priority: SITEMAP_PRIORITIES.INFORMATIONAL },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.REAL_TIME, priority: SITEMAP_PRIORITIES.SEARCH },
    { url: `${baseUrl}/materials`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CONTENT_HUBS },
    { url: `${baseUrl}/contaminants`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CONTENT_HUBS },
    { url: `${baseUrl}/compounds`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CONTENT_HUBS },
    { url: `${baseUrl}/settings`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CONTENT_HUBS },
    { url: `${baseUrl}/applications`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CONTENT_HUBS },
  );

  // ── Materials ──────────────────────────────────────────────────────────────
  generateStandardDomainEntries('materials', entries, /* requireSubcategoryForItem */ true);

  // ── Settings ───────────────────────────────────────────────────────────────
  try {
    const dir = path.join(process.cwd(), 'frontmatter/settings');
    const categorySet = new Set<string>();
    const subcategorySet = new Set<string>();

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'))) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      const fullPathMatch = content.match(/^fullPath:\s*(.+)$/m);
      const catMatch = content.match(/^category:\s*(.+)$/m);
      const subMatch = content.match(/^subcategory:\s*(.+)$/m);

      if (catMatch) {
        const category = toCategorySlug(catMatch[1].trim()).replace(/'/g, '');
        const subcategory = subMatch ? toCategorySlug(subMatch[1].trim()).replace(/'/g, '') : '';

        if (category && !categorySet.has(category)) {
          categorySet.add(category);
          entries.push({ url: buildCategoryUrl('settings', category, true), lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CATEGORY_PAGES });
        }
        if (subcategory && !subcategorySet.has(`${category}/${subcategory}`)) {
          subcategorySet.add(`${category}/${subcategory}`);
          entries.push({ url: buildSubcategoryUrl('settings', category, subcategory, true), lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.SUBCATEGORY_PAGES });
        }
      }
      if (fullPathMatch) {
        const fullPath = fullPathMatch[1].trim();
        entries.push({ url: `${baseUrl}${fullPath}`, lastModified: stats.mtime, changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.TECHNICAL_REF });
      }
    }
  } catch (error) {
    console.error('Error generating settings routes:', error);
  }

  // ── Contaminants ───────────────────────────────────────────────────────────
  generateStandardDomainEntries('contaminants', entries);

  // ── Compounds ──────────────────────────────────────────────────────────────
  generateStandardDomainEntries('compounds', entries);

  // ── Applications ───────────────────────────────────────────────────────────
  try {
    const dir = path.join(process.cwd(), 'frontmatter/applications');
    const subcategorySet = new Set<string>();

    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.yaml'))) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Virtual subcategory listing pages (e.g. /applications/aerospace)
      const subcategoryMatch = fileContent.match(/^subcategory:\s*(.+)$/m);
      if (subcategoryMatch) {
        const subcategory = subcategoryMatch[1].trim().replace(/'/g, '');
        if (subcategory && !subcategorySet.has(subcategory)) {
          subcategorySet.add(subcategory);
          entries.push({ url: `${baseUrl}/applications/${subcategory}`, lastModified: new Date(), changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.CATEGORY_PAGES });
        }
      }

      // Individual application item pages
      const fullPathMatch = fileContent.match(/^fullPath:\s*(.+)$/m);
      if (!fullPathMatch) continue;
      const fullPath = fullPathMatch[1].trim().replace(/'/g, '');
      entries.push({ url: `${baseUrl}${fullPath}`, lastModified: stats.mtime, changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE, priority: SITEMAP_PRIORITIES.ITEM_PAGES });
    }
  } catch (error) {
    console.error('Error generating application routes:', error);
  }

  return entries;
}

// ─── Public helper for scripts (replaces old `sitemap()` default export) ─────

export function getSitemapEntries(): SitemapEntry[] {
  return collectEntries(SITE_CONFIG.url);
}

// ─── Default export for tests and Next.js sitemap consumers ─────────────────

export default function sitemap(): SitemapEntry[] {
  return collectEntries(SITE_CONFIG.url);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export function GET(): Response {
  const baseUrl = SITE_CONFIG.url;
  const entries = collectEntries(baseUrl);
  const xml = buildSitemapXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
