/**
 * Static page loader for Next.js App Router static export.
 *
 * Static marketing pages now load only from page.yaml frontmatter so the
 * shared Layout consumes the same metadata shape as article pages.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  SITE_CONFIG,
  createEquipmentRentalAggregateOffer,
  getEquipmentRentalDescription,
  getEquipmentRentalSocialDescription,
} from '@/app/config/site';
import { getStaticPageEntry, type StaticPageKey } from '@/app/utils/pages/staticPageRegistry';
import type { ArticleMetadata, ContentCardItem } from '@/types';
import type { HomeFeaturedSection } from '@/schemas/static-page-content';

/**
 * Enhanced interface for static page frontmatter
 */
export interface StaticPageFrontmatter extends ArticleMetadata {
  pageTitle: string;
  pageDescription: string;
  contentCards?: ContentCardItem[];
  sections?: any[];  // Dynamic sections for enhanced pages
  openGraph?: {
    description?: string;
    [key: string]: any;
  };
  twitter?: {
    description?: string;
    [key: string]: any;
  };
  jsonLd?: {
    description?: string;
    [key: string]: any;
  };
  comparisonSection?: {
    title: string;
    description: string;
  };
  schema?: {
    '@type': string;
    name?: string;
    description?: string;
    mainEntity?: any;
    [key: string]: any;
  };
  seo?: {
    robots?: {
      index: boolean;
      follow: boolean;
    };
  };
}

export interface HomePageFrontmatter extends StaticPageFrontmatter {
  title: string;
  description: string;
  metaDescription?: string;
  featuredSections?: HomeFeaturedSection[];
  featuredMaterials?: Array<Record<string, unknown>>;
  video?: {
    id?: string;
    title?: string;
    description?: string;
    duration?: string;
  };
}

/**
 * Load frontmatter YAML from the shared static-page registry.
 * 
 * @param pageKey - Registry key for the requested static page
 * @returns Parsed frontmatter data
 */
export function loadStaticPageFrontmatter<T = StaticPageFrontmatter>(pageKey: StaticPageKey): T {
  const { yamlPath } = getStaticPageEntry(pageKey);
  const yamlPathSegments = yamlPath.split('/');
  const yamlAbsolutePath = path.join(process.cwd(), ...yamlPathSegments);
  const yamlContent = fs.readFileSync(yamlAbsolutePath, 'utf8');
  const frontmatter = yaml.load(yamlContent) as StaticPageFrontmatter;

  return enrichStaticPageFrontmatter(pageKey, frontmatter) as T;
}

function enrichStaticPageFrontmatter(
  pageKey: StaticPageKey,
  frontmatter: StaticPageFrontmatter
): StaticPageFrontmatter {
  if (pageKey !== 'services') {
    return frontmatter;
  }

  const longDescription = getEquipmentRentalDescription();
  const socialDescription = getEquipmentRentalSocialDescription();
  const aggregateOffer = createEquipmentRentalAggregateOffer(`${SITE_CONFIG.url}/services`);

  return {
    ...frontmatter,
    description: longDescription,
    schema: frontmatter.schema ? {
      ...frontmatter.schema,
      description: longDescription,
      offers: {
        ...(frontmatter.schema.offers || {}),
        price: String(aggregateOffer.lowPrice),
        priceCurrency: aggregateOffer.priceCurrency,
        availability: 'InStock',
      },
    } : frontmatter.schema,
    openGraph: frontmatter.openGraph ? {
      ...frontmatter.openGraph,
      description: socialDescription,
    } : frontmatter.openGraph,
    twitter: frontmatter.twitter ? {
      ...frontmatter.twitter,
      description: socialDescription,
    } : frontmatter.twitter,
    jsonLd: frontmatter.jsonLd ? {
      ...frontmatter.jsonLd,
      description: socialDescription,
    } : frontmatter.jsonLd,
  };
}

/**
 * Type for static pages with content cards
 */
export interface StaticPageWithCards extends ArticleMetadata {
  contentCards?: any[];
}

/**
 * Type for Netalux page
 */
export interface NetaluxPageConfig extends ArticleMetadata {
  contentCards?: any[];
  needle100_150?: any;
  needle200_300?: any;
  jangoSpecs?: any;
}
