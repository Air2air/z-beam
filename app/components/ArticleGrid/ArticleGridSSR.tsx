// app/components/ArticleGrid/ArticleGridSSR.tsx
// Server-side version of the unified ArticleGrid component

import React from 'react';
import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData, ArticleMetadata } from "@/types";
import { getArticle, loadComponent } from "../../utils/contentAPI";
import { slugToDisplayName } from "../../utils/formatting";
import { getGridClasses, type GridColumns, type GridGap } from "../../utils/gridConfig";

// Unified item interface for SSR
interface GridItemSSR {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  image?: string;
  badge?: BadgeData;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  article?: Article | null;
}

// SSR-specific props interface
interface ArticleGridSSRProps {
  // Data sources (use one)
  items?: GridItemSSR[];
  slugs?: string[];
  
  // Display configuration
  title?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Layout modes
  mode?: 'simple' | 'category-grouped';
  variant?: 'default' | 'compact' | 'featured';
  
  // Category grouping options (for mode: 'category-grouped')
  maxItemsPerCategory?: number;
  categoryOrder?: string[];
  
  // Filtering
  filterBy?: string;
  
  // Badge handling
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  
  // Styling
  className?: string;
}

// Default category ordering
const DEFAULT_CATEGORY_ORDER = [
  'Industrial Cleaning',
  'Metal Treatment',
  'Surface Preparation', 
  'Heritage Restoration',
  'Precision Applications',
  'Specialized Materials',
  'Advanced Techniques',
  'General',
  'Other'
];

// Helper function to safely cast material types
function toMaterialType(value?: string): MaterialType {
  if (!value) return 'other';
  
  const normalizedValue = value.toLowerCase();
  const validTypes: MaterialType[] = [
    'element', 'compound', 'ceramic', 'polymer', 'alloy', 'composite', 'semiconductor', 'other'
  ];
  
  if (validTypes.includes(normalizedValue as MaterialType)) {
    return normalizedValue as MaterialType;
  }
  
  const typeMap: Record<string, MaterialType> = {
    'metal': 'alloy',
    'metalloid': 'semiconductor',
    'plastic': 'polymer', 
    'material': 'other'
  };
  
  return typeMap[normalizedValue] || 'other';
}

export async function ArticleGridSSR({
  items = [],
  slugs = [],
  title,
  heading,
  columns = 3,
  gap = "md",
  mode = 'simple',
  variant = 'default',
  maxItemsPerCategory,
  categoryOrder = DEFAULT_CATEGORY_ORDER,
  filterBy = 'all',
  showBadgeSymbols = true,
  loadBadgeSymbolData = false,
  className = ""
}: ArticleGridSSRProps) {
  
  // Process input data into unified format
  let processedItems: GridItemSSR[] = [];

  if (items.length > 0) {
    processedItems = items;
  } else if (slugs.length > 0) {
    // Convert slugs to enriched items
    processedItems = await Promise.all(
      slugs.map(async (slug) => {
        try {
          const article = await getArticle(slug);
          
          const itemName = article?.metadata?.name as string || '';
          const itemTitle = article?.metadata?.subject || 
            article?.metadata?.title ||
            slugToDisplayName(slug);

          const itemDescription = article?.metadata?.description || '';
          const itemImageUrl = article?.metadata?.image || '';
          const itemHref = `/${slug}`;

          // Extract category from article metadata
          const category = article?.metadata?.category as string ||
                          article?.metadata?.articleType as string ||
                          'Other';

          // Badge/Symbol data handling
          let badgeSymbolData: BadgeData | undefined = undefined;

          if (showBadgeSymbols && loadBadgeSymbolData) {
            try {
              const badgeSymbol = await loadComponent('badgesymbol', slug);
              if (badgeSymbol?.config) {
                const config = badgeSymbol.config as Record<string, unknown>;
                const metadata = article?.metadata;
                const chemicalSymbol = typeof metadata?.chemicalSymbol === 'string' ? metadata.chemicalSymbol : '';
                const atomicNumber = metadata?.atomicNumber;
                const chemicalFormula = typeof metadata?.chemicalFormula === 'string' ? metadata.chemicalFormula : '';

                badgeSymbolData = {
                  symbol: String(config.symbol || chemicalSymbol || ''),
                  materialType: toMaterialType(String(config.materialType || metadata?.category || '')),
                  atomicNumber: config.atomicNumber ? Number(config.atomicNumber) : (typeof atomicNumber === 'number' ? atomicNumber : undefined),
                  formula: String(config.formula || chemicalFormula || ''),
                };
              }
            } catch (error) {
              // Fall back to no badge data
            }
          }

          return {
            slug,
            title: String(itemTitle),
            name: String(itemName),
            description: String(itemDescription),
            href: itemHref,
            imageUrl: String(itemImageUrl),
            imageAlt: String(itemTitle),
            badge: badgeSymbolData,
            tags: Array.isArray(article?.metadata?.tags) ? article.metadata.tags : [],
            category,
            metadata: article?.metadata as Record<string, unknown> || {},
            article: article ? {
              slug,
              title: String(itemTitle),
              ...article
            } as Article : undefined,
          } as GridItemSSR;
        } catch (error) {
          console.warn(`Failed to enrich item ${slug}:`, error);
          return {
            slug,
            title: slugToDisplayName(slug),
            description: '',
            href: `/${slug}`,
            imageUrl: '',
            imageAlt: slugToDisplayName(slug),
            tags: [],
            category: 'Other',
            metadata: {},
            article: undefined,
          } as GridItemSSR;
        }
      })
    );
  }

  // Apply filtering
  const filteredItems = filterBy === "all" 
    ? processedItems
    : processedItems.filter((item) => 
        item.category === filterBy ||
        item.metadata?.articleType === filterBy ||
        item.metadata?.category === filterBy
      );

  if (!filteredItems.length) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        No articles available.
      </div>
    );
  }

  const displayTitle = title || heading;

  // Category-grouped mode
  if (mode === 'category-grouped') {
    // Group items by category
    const groupedItems = filteredItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, GridItemSSR[]>);

    // Sort categories by predefined order
    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });

    return (
      <div className={`article-grid article-grid--category-grouped-ssr ${className}`}>
        {/* Header */}
        {displayTitle && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {displayTitle}
            </h2>
            <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
          </div>
        )}

        {/* Category Sections */}
        <div className="space-y-12">
          {sortedCategories.map((category) => {
            const categoryItems = groupedItems[category];
            const displayItems = maxItemsPerCategory 
              ? categoryItems.slice(0, maxItemsPerCategory)
              : categoryItems; // Show all items if no limit specified
            const hasMore = maxItemsPerCategory 
              ? categoryItems.length > maxItemsPerCategory 
              : false;

            return (
              <section key={category} className="category-section">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {category}
                    </h3>
                    <div className="w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {categoryItems.length} {categoryItems.length === 1 ? 'article' : 'articles'}
                    </p>
                  </div>
                  
                  {hasMore && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {displayItems.length} of {categoryItems.length}
                    </div>
                  )}
                </div>

                {/* Category Items Grid */}
                <div className={getGridClasses({ columns, gap })}>
                  {displayItems.map((item, index) => (
                    <Card
                      key={`${category}-${item.slug}-${index}`}
                      href={item.href || `/${item.slug}`}
                      frontmatter={{
                        title: item.title || slugToDisplayName(item.slug),
                        subject: item.name || item.title || slugToDisplayName(item.slug),
                        description: item.description || '',
                        slug: item.slug,
                        images: item.imageUrl ? {
                          hero: {
                            url: item.imageUrl,
                            alt: item.imageAlt || item.title || slugToDisplayName(item.slug)
                          }
                        } : undefined,
                        ...item.metadata
                      } as ArticleMetadata}
                      badge={showBadgeSymbols ? item.badge : undefined}
                      className="h-full"
                    />
                  ))}
                </div>

                {/* View More Link */}
                {hasMore && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 
                                    border border-blue-600 dark:border-blue-400 rounded-lg">
                      <span>View All {category} Articles ({categoryItems.length})</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  // Simple grid mode (default)
  return (
    <div className={`article-grid article-grid--simple-ssr ${className}`}>
      {/* Header */}
      {displayTitle && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {displayTitle}
          </h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
        </div>
      )}

      {/* Simple Grid */}
      <div className={getGridClasses({ columns, gap })}>
        {filteredItems.map((item, index) => (
          <Card
            key={`${item.slug}-${index}`}
            href={item.href || `/${item.slug}`}
            frontmatter={{
              title: item.title || slugToDisplayName(item.slug),
              subject: item.name || item.title || slugToDisplayName(item.slug),
              description: item.description || '',
              slug: item.slug,
              images: item.imageUrl ? {
                hero: {
                  url: item.imageUrl,
                  alt: item.imageAlt || item.title || slugToDisplayName(item.slug)
                }
              } : undefined,
              ...item.metadata
            } as ArticleMetadata}
            badge={showBadgeSymbols ? item.badge : undefined}
            className={`h-full ${
              variant === 'compact' ? 'compact' : variant === 'featured' ? 'featured' : ''
            }`}
            height={variant === 'compact' ? 'h-48' : variant === 'featured' ? 'auto' : undefined}
          />
        ))}
      </div>
    </div>
  );
}