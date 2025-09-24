// app/components/ArticleGrid/CategoryGroupedGridSSR.tsx
// Server-side rendering version of category-grouped article display

import React from 'react';
import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData, ArticleMetadata } from "@/types";
import { getArticle, loadComponent } from "../../utils/contentAPI";
import { slugToDisplayName } from "../../utils/formatting";
import { getGridClasses, createSectionHeader, createCategoryHeader, GRID_SECTION_SPACING, type GridColumns, type GridGap } from "../../utils/gridConfig";

interface CategoryItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: BadgeData;
  tags?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  article?: Article | null;
}

interface CategoryGroupedGridSSRProps {
  slugs?: string[];
  items?: CategoryItem[];
  title?: string;
  maxItemsPerCategory?: number;
  columns?: GridColumns;
  gap?: GridGap;
  className?: string;
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
}

// Grid configuration now imported from unified system

// Default category ordering for consistent display
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

export async function CategoryGroupedGridSSR({
  slugs = [],
  items = [],
  title = "Articles by Category",
  maxItemsPerCategory = 6,
  columns = 3,
  gap = "md",
  className = "",
  showBadgeSymbols = true,
  loadBadgeSymbolData = false
}: CategoryGroupedGridSSRProps) {
  
  // Process items with article data loading (server-side)
  let processedItems: CategoryItem[] = [];

  if (items.length > 0) {
    processedItems = items;
  } else if (slugs.length > 0) {
    // Convert slugs to enriched items
    processedItems = await Promise.all(
      slugs.map(async (slug) => {
        try {
          const article = await getArticle(slug);
          
          // Determine title with fallback priority
          const itemTitle = article?.metadata?.subject || 
            article?.metadata?.title ||
            slugToDisplayName(slug);

          // Determine description
          const itemDescription = article?.metadata?.description || '';

          // Determine image URL
          const itemImageUrl = article?.metadata?.image || '';

          // Generate href
          const itemHref = `/${slug}`;

          // Extract category from article metadata
          const category = article?.metadata?.category as string ||
                          article?.metadata?.articleType as string ||
                          'Other';

          // Badge/Symbol data handling
          let badgeSymbolData: BadgeData | null = null;

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
            description: String(itemDescription),
            href: itemHref,
            imageUrl: String(itemImageUrl),
            imageAlt: String(itemTitle),
            badge: badgeSymbolData || undefined,
            tags: Array.isArray(article?.metadata?.tags) ? article.metadata.tags : [],
            category,
            metadata: article?.metadata as Record<string, unknown> || {},
            article: article ? {
              slug,
              title: String(itemTitle),
              ...article
            } as Article : undefined,
          } as CategoryItem;
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
          } as CategoryItem;
        }
      })
    );
  }

  if (!processedItems.length) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        No articles available.
      </div>
    );
  }

  // Group items by category
  const groupedItems = processedItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CategoryItem[]>);

  // Sort categories by predefined order
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = DEFAULT_CATEGORY_ORDER.indexOf(a);
    const indexB = DEFAULT_CATEGORY_ORDER.indexOf(b);
    
    // If category not in order, put at end
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });

  return (
    <div className={`category-grouped-grid-ssr ${className}`}>
      {/* Header */}
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
        </div>
      )}

      {/* Category Sections */}
      <div className="space-y-12">
        {sortedCategories.map((category) => {
          const categoryItems = groupedItems[category];
          const displayItems = categoryItems.slice(0, maxItemsPerCategory);
          const hasMore = categoryItems.length > maxItemsPerCategory;

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
                    title={item.title || slugToDisplayName(item.slug)}
                    description={item.description || ''}
                    href={item.href || `/${item.slug}`}
                    imageUrl={item.imageUrl || ''}
                    imageAlt={item.imageAlt || item.title || slugToDisplayName(item.slug)}
                    badge={item.badge}
                    tags={item.tags || []}
                    metadata={{
                      title: item.title || slugToDisplayName(item.slug),
                      slug: item.slug,
                      ...item.metadata
                    } as ArticleMetadata}
                    className="h-full hover:shadow-lg transition-shadow duration-300"
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