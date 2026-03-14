#!/usr/bin/env tsx
/**
 * SEO Metadata Migration Script
 *
 * Adds missing SEO blocks to YAML content files:
 * - keywords
 * - openGraph
 * - twitter
 * - jsonld (includes ImageObject and BreadcrumbList)
 *
 * Usage:
 *   npx tsx scripts/migrate-seo-metadata.ts
 *   npx tsx scripts/migrate-seo-metadata.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { glob } from 'glob';

interface BreadcrumbItem {
  label?: string;
  name?: string;
  href?: string;
}

interface YamlRecord {
  [key: string]: unknown;
  pageTitle?: string;
  title?: string;
  name?: string;
  pageDescription?: string;
  description?: string;
  canonicalUrl?: string;
  canonical?: string;
  fullPath?: string;
  slug?: string;
  headline?: string;
  author?: unknown;
  keywords?: unknown;
  openGraph?: unknown;
  twitter?: unknown;
  jsonld?: unknown;
  jsonLd?: unknown;
  breadcrumb?: BreadcrumbItem[];
  images?: {
    hero?: {
      url?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
  };
  image?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  heroImage?: string | { url?: string; alt?: string; width?: number; height?: number };
  machineSettings?: Record<string, unknown>;
  schema?: {
    offers?: {
      price?: string;
      priceCurrency?: string;
      availability?: string;
    };
  };
}

interface OfferSeed {
  price: string;
  priceCurrency: string;
  availability: string;
}

const BASE_URL = 'https://z-beam.com';

const patterns = [
  'frontmatter/materials/*.yaml',
  'frontmatter/contaminants/*.yaml',
  'frontmatter/compounds/*.yaml',
  'frontmatter/settings/*.yaml',
  'app/**/page.yaml'
];

const materialOfferSeed = loadMaterialOfferSeed();

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

function firstNonEmpty(...values: Array<unknown>): string {
  for (const value of values) {
    const cleaned = cleanText(value);
    if (cleaned) {
      return cleaned;
    }
  }
  return '';
}

function getCanonical(data: YamlRecord): string {
  const explicit = firstNonEmpty(data.canonicalUrl, data.canonical);
  if (explicit) {
    return explicit;
  }

  const fullPath = firstNonEmpty(data.fullPath);
  if (fullPath) {
    return `${BASE_URL}${fullPath.startsWith('/') ? fullPath : `/${fullPath}`}`;
  }

  const slug = firstNonEmpty(data.slug);
  if (slug) {
    return `${BASE_URL}/${slug}`;
  }

  return BASE_URL;
}

function getImage(data: YamlRecord): { url: string; alt: string; width: number; height: number } | null {
  const hero = data.images?.hero;
  const image = data.image;
  const heroImage = typeof data.heroImage === 'string' ? { url: data.heroImage } : data.heroImage;

  const url = firstNonEmpty(hero?.url, image?.url, heroImage?.url);
  if (!url) {
    return null;
  }

  const title = firstNonEmpty(data.pageTitle, data.title, data.name, data.slug, 'Z-Beam');
  const alt = firstNonEmpty(hero?.alt, image?.alt, heroImage?.alt, `${title} hero image`);

  const width = Number(hero?.width ?? image?.width ?? heroImage?.width ?? 1200);
  const height = Number(hero?.height ?? image?.height ?? heroImage?.height ?? 630);

  return {
    url,
    alt,
    width: Number.isFinite(width) ? width : 1200,
    height: Number.isFinite(height) ? height : 630
  };
}

function getKeywords(data: YamlRecord, title: string): string[] {
  const raw = data.keywords;
  if (Array.isArray(raw)) {
    const normalized = raw.map(k => cleanText(k)).filter(Boolean);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 4);

  const generated = [
    ...words,
    'laser cleaning',
    'z-beam'
  ];

  return Array.from(new Set(generated)).slice(0, 8);
}

function buildBreadcrumbJsonLdItems(breadcrumb: BreadcrumbItem[] | undefined, canonical: string) {
  const items = Array.isArray(breadcrumb) ? breadcrumb : [];

  if (items.length === 0) {
    return [
      { position: 1, name: 'Home', item: `${BASE_URL}/` },
      { position: 2, name: 'Page', item: canonical }
    ];
  }

  return items.map((crumb, index) => {
    const label = cleanText(crumb.label ?? crumb.name ?? `Step ${index + 1}`);
    const href = cleanText(crumb.href);
    const item = href
      ? `${BASE_URL}${href.startsWith('/') ? href : `/${href}`}`
      : canonical;

    return {
      position: index + 1,
      name: label,
      item
    };
  });
}

function buildHowToSteps(data: YamlRecord): Array<{ title: string; description: string }> {
  const machineSettings = data.machineSettings;
  if (!machineSettings || typeof machineSettings !== 'object') {
    return [];
  }

  const keys = Object.keys(machineSettings);
  if (keys.length === 0) {
    return [];
  }

  const title = firstNonEmpty(data.pageTitle, data.title, data.name, 'Laser cleaning setup');

  const [first, second, third] = keys;
  const steps: Array<{ title: string; description: string }> = [];

  if (first) {
    steps.push({
      title: `Set ${first}`,
      description: `Configure ${first} according to the documented ${title} machine settings.`
    });
  }

  if (second) {
    steps.push({
      title: `Tune ${second}`,
      description: `Adjust ${second} within the specified range to balance cleaning speed and substrate safety.`
    });
  }

  if (third) {
    steps.push({
      title: `Validate ${third}`,
      description: `Verify ${third} on a test area, then proceed to full-surface cleaning.`
    });
  }

  if (steps.length < 3) {
    steps.push({
      title: 'Run verification pass',
      description: 'Perform a final verification pass to confirm process stability and cleaning quality.'
    });
  }

  return steps.slice(0, 3);
}

function appendBlock(content: string, block: string): string {
  const trimmed = content.endsWith('\n') ? content : `${content}\n`;
  return `${trimmed}\n${block}\n`;
}

function loadMaterialOfferSeed(): OfferSeed | null {
  const candidateFiles = [
    path.join(process.cwd(), 'app/services/page.yaml')
  ];

  for (const filePath of candidateFiles) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const sourceContent = fs.readFileSync(filePath, 'utf8');
    const sourceData = yaml.load(sourceContent) as YamlRecord;
    const sourceOffers = sourceData?.schema?.offers;

    const price = firstNonEmpty(sourceOffers?.price);
    const priceCurrency = firstNonEmpty(sourceOffers?.priceCurrency);
    const availability = firstNonEmpty(sourceOffers?.availability);

    if (price && priceCurrency && availability) {
      return {
        price,
        priceCurrency,
        availability
      };
    }
  }

  return null;
}

function migrateFile(filePath: string, dryRun: boolean) {
  const original = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(original) as YamlRecord;

  if (!data || typeof data !== 'object') {
    return { changed: false, reason: 'not-a-yaml-object' };
  }

  const title = firstNonEmpty(data.pageTitle, data.title, data.name, data.slug, path.basename(filePath, '.yaml'));
  const description = firstNonEmpty(data.pageDescription, data.description, `${title} page`);
  const canonical = getCanonical(data);
  const image = getImage(data);
  const keywords = getKeywords(data, title);

  let updated = original;
  let changed = false;

  if (!/\ncanonicalUrl:\s*/m.test(updated) && !/\ncanonical:\s*/m.test(updated)) {
    const canonicalBlock = `canonicalUrl: ${quote(canonical)}`;
    updated = appendBlock(updated, canonicalBlock);
    changed = true;
  }

  if (filePath.includes('frontmatter/settings/') && !/\nsteps:\s*/m.test(updated) && !/\nstep:\s*/m.test(updated)) {
    const steps = buildHowToSteps(data);
    if (steps.length > 0) {
      const stepsBlock = [
        'steps:',
        ...steps.flatMap(step => [
          `  - title: ${quote(step.title)}`,
          `    description: ${quote(step.description)}`
        ])
      ].join('\n');

      updated = appendBlock(updated, stepsBlock);
      changed = true;
    }
  }

  if (
    filePath.includes('frontmatter/materials/') &&
    materialOfferSeed &&
    !/\noffers:\s*/m.test(updated)
  ) {
    const offersBlock = [
      'offers:',
      `  price: ${quote(materialOfferSeed.price)}`,
      `  priceCurrency: ${materialOfferSeed.priceCurrency}`,
      `  availability: ${materialOfferSeed.availability}`
    ].join('\n');

    updated = appendBlock(updated, offersBlock);
    changed = true;
  }

  if (!/\nkeywords:\s*/m.test(updated) && keywords.length > 0) {
    const keywordBlock = [
      'keywords:',
      ...keywords.map(k => `  - ${quote(k)}`)
    ].join('\n');
    updated = appendBlock(updated, keywordBlock);
    changed = true;
  }

  if (!/\nopenGraph:\s*/m.test(updated)) {
    const ogLines = [
      'openGraph:',
      `  title: ${quote(title)}`,
      `  description: ${quote(description.slice(0, 160))}`,
      `  type: ${filePath.includes('/app/') ? 'website' : 'article'}`,
      `  url: ${quote(canonical)}`
    ];

    if (image) {
      ogLines.push('  image:');
      ogLines.push(`    url: ${image.url}`);
      ogLines.push(`    alt: ${quote(image.alt)}`);
      ogLines.push(`    width: ${image.width}`);
      ogLines.push(`    height: ${image.height}`);
    }

    updated = appendBlock(updated, ogLines.join('\n'));
    changed = true;
  }

  if (!/\ntwitter:\s*/m.test(updated)) {
    const twLines = [
      'twitter:',
      '  card: summary_large_image',
      `  title: ${quote(title)}`,
      `  description: ${quote(description.slice(0, 160))}`
    ];

    if (image) {
      twLines.push('  image:');
      twLines.push(`    url: ${image.url}`);
      twLines.push(`    alt: ${quote(image.alt)}`);
    }

    updated = appendBlock(updated, twLines.join('\n'));
    changed = true;
  }

  if (!/\njsonld:\s*/m.test(updated) && !/\njsonLd:\s*/m.test(updated)) {
    const breadcrumbItems = buildBreadcrumbJsonLdItems(data.breadcrumb, canonical);

    const jsonldLines = [
      'jsonld:',
      `  '@context': 'https://schema.org'`,
      `  '@type': ${quote(filePath.includes('/app/') ? 'WebPage' : 'Article')}`,
      `  '@id': ${quote(`${canonical}#webpage`)}`,
      `  name: ${quote(title)}`,
      `  headline: ${quote(firstNonEmpty(data.headline, title))}`,
      `  description: ${quote(description.slice(0, 160))}`,
      `  url: ${quote(canonical)}`
    ];

    if (image) {
      jsonldLines.push('  image:');
      jsonldLines.push(`    '@type': ImageObject`);
      jsonldLines.push(`    url: ${image.url}`);
      jsonldLines.push(`    width: ${image.width}`);
      jsonldLines.push(`    height: ${image.height}`);
      jsonldLines.push(`    caption: ${quote(image.alt)}`);
    }

    jsonldLines.push('  breadcrumb:');
    jsonldLines.push(`    '@type': BreadcrumbList`);
    jsonldLines.push('    itemListElement:');

    for (const item of breadcrumbItems) {
      jsonldLines.push(`      - '@type': ListItem`);
      jsonldLines.push(`        position: ${item.position}`);
      jsonldLines.push(`        name: ${quote(item.name)}`);
      jsonldLines.push(`        item: ${quote(item.item)}`);
    }

    updated = appendBlock(updated, jsonldLines.join('\n'));
    changed = true;
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }

  return { changed, reason: changed ? 'updated' : 'already-complete' };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const files = (
    await Promise.all(patterns.map(p => glob(p)))
  ).flat();

  let changedCount = 0;
  let skippedCount = 0;

  console.log(`\n🔍 Processing ${files.length} YAML files${dryRun ? ' (dry-run)' : ''}...\n`);

  for (const file of files) {
    const result = migrateFile(file, dryRun);
    if (result.changed) {
      changedCount += 1;
      console.log(`✅ ${path.relative(process.cwd(), file)}`);
    } else {
      skippedCount += 1;
    }
  }

  console.log('\n────────────────────────────────────────────────────────');
  console.log(`Updated: ${changedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Mode: ${dryRun ? 'dry-run' : 'write'}`);
  console.log('────────────────────────────────────────────────────────\n');
}

main().catch(error => {
  console.error('❌ SEO metadata migration failed:', error);
  process.exit(1);
});
