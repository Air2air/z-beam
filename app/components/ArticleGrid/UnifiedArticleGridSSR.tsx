// app/components/ArticleGrid/UnifiedArticleGridSSR.tsx
// Server-side rendering version of the unified grid (no React hooks)

import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData, SearchResultItem, ArticleMetadata } from "@/types";
import { getArticle, loadComponent } from "../../utils/contentAPI";
import { slugToDisplayName } from "../../utils/formatting";
import { getBadgeFromItem, getChemicalProperties, getDisplayName } from "../../utils/searchUtils";
import { getGridClasses, createSectionHeader, type GridColumns, type GridGap } from "../../utils/gridConfig";

// Grid configuration now imported from unified system

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

// Unified input types - supports all existing data sources
interface ArticleItem {
  slug: string;
  title?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  image?: string;
  badge?: any;
  tags?: string[];
  featured?: boolean;
  metadata?: Record<string, unknown>;
  height?: string;
  name?: string;
  article?: Article | null;
}

interface UnifiedArticleGridSSRProps {
  // Data input - flexible sources
  items?: ArticleItem[];
  slugs?: string[];
  searchResults?: SearchResultItem[]; // For search results
  
  // Display configuration
  title?: string;
  heading?: string;
  columns?: GridColumns;
  gap?: GridGap;
  
  // Processing options
  filterBy?: string;
  variant?: 'standard' | 'featured' | 'search';
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  
  // Styling
  className?: string;
}

export async function UnifiedArticleGridSSR({
  items = [],
  slugs = [],
  searchResults = [],
  title,
  heading,
  columns = 3,
  gap = "md",
  filterBy = "all",
  variant = 'standard',
  showBadgeSymbols = true,
  loadBadgeSymbolData = false,
  className = "",
}: UnifiedArticleGridSSRProps) {
  const displayTitle = title || heading;

  // Handle different data sources
  let processedItems: ArticleItem[] = [];

  if (searchResults.length > 0) {
    // Convert SearchResultItem to ArticleItem format
    processedItems = searchResults.map((item, index) => ({
      slug: item.slug || `item-${index}`,
      title: item.title || "",
      description: item.description,
      href: item.href,
      imageUrl: item.image,
      imageAlt: item.imageAlt || item.title || "",
      badge: getBadgeFromItem(item),
      tags: item.tags || [],
      metadata: {
        category: item.category,
        chemicalProperties: getChemicalProperties(item as unknown as Parameters<typeof getChemicalProperties>[0])
      } as Record<string, unknown>,
      name: item.name || getDisplayName(item as unknown as Parameters<typeof getDisplayName>[0])
    }));
  } else if (items.length > 0) {
    processedItems = items;
  } else if (slugs.length > 0) {
    // Convert slugs to items
    processedItems = slugs.map(slug => ({ slug }));
  }

  // Process items with article data loading (server-side)
  const enrichedItems = await Promise.all(
    processedItems.map(async (item) => {
      // Skip processing if item already has article data
      if (item.article !== undefined || searchResults.length > 0) {
        return item;
      }

      try {
        const article = await getArticle(item.slug);
        
        // Determine title with fallback priority
        const itemTitle = item.title || 
          article?.metadata?.subject || 
          item.name || 
          slugToDisplayName(item.slug);

        // Determine description
        const itemDescription = item.description || 
          article?.metadata?.description || 
          '';

        // Determine image URL
        const itemImageUrl = item.imageUrl || item.image || article?.metadata?.image;

        // Generate href if not provided
        const itemHref = item.href || `/${item.slug}`;

        // Badge/Symbol data handling
        let badgeSymbolData: BadgeData | null = null;

        if (showBadgeSymbols && loadBadgeSymbolData) {
          try {
            const badgeSymbol = await loadComponent('badgesymbol', item.slug);
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
            // Fall back to article metadata or provided badge
          }
        }

        // Use provided badge if no symbol data generated
        let finalBadge: BadgeData | null = badgeSymbolData;
        
        if (!finalBadge && item.badge) {
          if (typeof item.badge === 'string') {
            finalBadge = {
              symbol: item.badge,
              show: true,
            };
          } else {
            finalBadge = item.badge;
          }
        }

        return {
          ...item,
          title: String(itemTitle),
          description: String(itemDescription),
          href: itemHref,
          imageUrl: String(itemImageUrl || ''),
          imageAlt: item.imageAlt || String(itemTitle),
          badge: finalBadge,
          tags: item.tags || [],
          featured: item.featured || false,
          metadata: (article?.metadata as Record<string, unknown>) || item.metadata || {},
          height: item.featured ? "auto" : undefined,
          article,
        };
      } catch (error) {
        console.warn(`Failed to enrich item ${item.slug}:`, error);
        return item;
      }
    })
  );

  // Filter items based on filterBy
  const filteredItems = filterBy === "all" 
    ? enrichedItems
    : enrichedItems.filter((item) => 
        item.article?.metadata?.articleType === filterBy ||
        item.metadata?.articleType === filterBy
      );

  if (!filteredItems?.length) return null;

  return (
    <div className={`unified-article-grid ${className}`}>
      {displayTitle && (
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{displayTitle}</h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-400 rounded"></div>
        </div>
      )}

      <div className={getGridClasses({ columns, gap, className: "" })}>
        {filteredItems.map((item, index) => {
          // Special handling for featured items (hide badge symbols)
          const shouldShowBadge = variant === 'featured' ? 
            { show: false } : 
            item.badge;

          return (
            <Card
              key={item.slug || `item-${index}`}
              title={String(item.title || 'Untitled')}
              name={item.name || ""}
              description={String(item.description || '')}
              href={String(item.href || '#')}
              imageUrl={String(item.imageUrl || '')}
              imageAlt={String(item.imageAlt || item.title || 'Untitled')}
              badge={shouldShowBadge}
              tags={Array.isArray(item.tags) ? item.tags : []}
              metadata={item.metadata as unknown as ArticleMetadata}
              height={item.height}
              className={`h-full ${variant === 'featured' ? 'featured-item' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// Re-export for backward compatibility during transition
export { UnifiedArticleGridSSR as ArticleGrid };
export { UnifiedArticleGridSSR as List };
