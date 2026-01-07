/**
 * Static page loader for Next.js App Router static export
 * 
 * This utility loads YAML files at build time for static pages,
 * avoiding runtime fs operations that break static export.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

/**
 * Load a static page YAML configuration at build time
 * Uses synchronous fs for compatibility with static export
 */
export function loadStaticPage<T = ArticleMetadata>(filename: string): T {
  const yamlPath = path.join(process.cwd(), 'static-pages', filename);
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(yamlContent) as T;
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
