import registryData from './staticPageRegistry.json';

export type PageArchitecture = 'content-cards' | 'dynamic-content';
export type SitemapBucket = 'homepage' | 'content-hub' | 'informational' | 'partner-page';

export interface StaticPageRegistryEntry {
  routePath: string;
  yamlPath: string;
  includeInSitemap: boolean;
  usesSharedFactory: boolean;
  pageType?: PageArchitecture;
  sitemapBucket?: SitemapBucket;
}

export type StaticPageKey = keyof typeof registryData;
export type SharedStaticPageKey = Exclude<StaticPageKey, 'home'>;

export const STATIC_PAGE_REGISTRY = registryData as Record<StaticPageKey, StaticPageRegistryEntry>;

export const STATIC_PAGE_KEYS = Object.keys(STATIC_PAGE_REGISTRY) as StaticPageKey[];
export const SHARED_STATIC_PAGE_KEYS = STATIC_PAGE_KEYS.filter(
  (pageKey): pageKey is SharedStaticPageKey => STATIC_PAGE_REGISTRY[pageKey].usesSharedFactory
);
export const SITEMAP_STATIC_PAGE_KEYS = STATIC_PAGE_KEYS.filter(
  pageKey => STATIC_PAGE_REGISTRY[pageKey].includeInSitemap
);

export function isSharedStaticPageKey(pageKey: string): pageKey is SharedStaticPageKey {
  return SHARED_STATIC_PAGE_KEYS.includes(pageKey as SharedStaticPageKey);
}

export function getStaticPageEntry(pageKey: StaticPageKey): StaticPageRegistryEntry {
  const entry = STATIC_PAGE_REGISTRY[pageKey];

  if (!entry) {
    throw new Error(`Unknown static page key: ${pageKey}`);
  }

  return entry;
}

export function getSharedStaticPageEntry(pageKey: SharedStaticPageKey): StaticPageRegistryEntry {
  const entry = getStaticPageEntry(pageKey);

  if (!entry.usesSharedFactory) {
    throw new Error(`Static page key does not use the shared factory: ${pageKey}`);
  }

  return entry;
}