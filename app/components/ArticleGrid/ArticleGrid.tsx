// app/components/ArticleGrid/ArticleGrid.tsx
"use client";

import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData } from "@/types/core";
import { ArticleGridProps, ArticleItem } from "@/types/components/articleGrid";
import { loadComponent } from "../../utils/contentAPI";
import { slugToDisplayName } from "../../utils/formatting";

// Helper function to safely cast material types
function toMaterialType(value?: string): MaterialType {
  if (!value) return 'other';
  
  const normalizedValue = value.toLowerCase();
  const validTypes: MaterialType[] = [
    'element', 'compound', 'ceramic', 'polymer', 'alloy', 'composite', 'semiconductor', 'other'
  ];
  
  // Check for exact matches first
  if (validTypes.includes(normalizedValue as MaterialType)) {
    return normalizedValue as MaterialType;
  }
  
  // Map common aliases
  const typeMap: Record<string, MaterialType> = {
    'metal': 'alloy',
    'metalloid': 'semiconductor',
    'plastic': 'polymer',
    'material': 'other'
  };
  
  return typeMap[normalizedValue] || 'other';
}

// Unified grid column configuration
const GRID_CONFIGS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
} as const;

export async function ArticleGrid({
  items,
  title,
  heading,
  columns = 3,
  className = "",
  showBadgeSymbols = true,
  loadBadgeSymbolData = false,
  variant = 'standard'
}: ArticleGridProps) {
  const displayTitle = title || heading;

  // Process items to normalize data structure
  const processedItems = await Promise.all(
    items.map(async (item) => {
      const article = item.article;
      
      // Determine title with fallback priority
      const itemTitle = item.title || 
        article?.metadata?.subject || 
        item.name || 
        generateTitleFromSlug(item.slug);

      // Determine description
      const itemDescription = item.description || 
        article?.metadata?.description || 
        '';

      // Determine image URL (normalize image vs imageUrl)
      const itemImageUrl = item.imageUrl || item.image;

      // Generate href if not provided
      const itemHref = item.href || `/${item.slug}`;

      // Badge/Symbol data handling
      let badgeSymbolData: BadgeData | null = null;

      if (showBadgeSymbols && (loadBadgeSymbolData || article)) {
        // Get chemical data from article metadata with proper type checking
        const metadata = article?.metadata;
        const chemicalSymbol = typeof metadata?.chemicalSymbol === 'string' ? metadata.chemicalSymbol : '';
        const atomicNumber = metadata?.atomicNumber;
        const chemicalFormula = typeof metadata?.chemicalFormula === 'string' ? metadata.chemicalFormula : '';

        // Try to load BadgeSymbol component data
        if (loadBadgeSymbolData) {
          try {
            const badgeSymbol = await loadComponent('badgesymbol', item.slug);
            if (badgeSymbol?.config) {
              const config = badgeSymbol.config as Record<string, unknown>;
              badgeSymbolData = {
                symbol: String(config.symbol || chemicalSymbol || ''),
                materialType: toMaterialType(String(config.materialType || metadata?.category || '')),
                atomicNumber: config.atomicNumber ? Number(config.atomicNumber) : (typeof atomicNumber === 'number' ? atomicNumber : undefined),
                formula: String(config.formula || chemicalFormula || ''),
              };
            }
          } catch (error) {
            // Fall back to article metadata
          }
        }

        // Temporarily disabled due to type issues - needs refactoring
        /*
        // Fallback to article metadata if no component data loaded
        if (!badgeSymbolData && (chemicalSymbol || chemicalFormula)) {
          badgeSymbolData = {
            symbol: chemicalSymbol,
            materialType: toMaterialType(String(metadata?.category || '')),
            atomicNumber: typeof atomicNumber === 'number' ? atomicNumber : 
                         (typeof atomicNumber === 'string' ? parseInt(atomicNumber) : undefined),
            formula: chemicalFormula,
          };
        }
        */
      }

      // Use provided badge if no symbol data generated
      let finalBadge: BadgeData | null = badgeSymbolData;
      
      if (!finalBadge && item.badge) {
        if (typeof item.badge === 'string') {
          // Convert string badge to BadgeData
          finalBadge = {
            symbol: item.badge,
            show: true,
          };
        } else {
          finalBadge = item.badge;
        }
      }

      return {
        slug: item.slug,
        title: itemTitle,
        description: itemDescription,
        href: itemHref,
        imageUrl: itemImageUrl,
        imageAlt: item.imageAlt || itemTitle,
        badge: finalBadge,
        tags: item.tags || [],
        featured: item.featured || false,
        metadata: article?.metadata || item.metadata || {
          category: article?.metadata?.category,
          articleType: article?.metadata?.articleType,
        },
        height: item.featured ? "auto" : undefined,
      };
    })
  );

  if (!processedItems?.length) return null;

  return (
    <div className={`article-grid ${className}`}>
      {displayTitle && (
        <h2 className="text-2xl font-bold mb-6">{displayTitle}</h2>
      )}

      <div className={`grid gap-4 ${GRID_CONFIGS[columns]}`}>
        {processedItems.map((item) => {
          // Special handling for featured items (hide badge symbols)
          const shouldShowBadge = variant === 'featured' ? 
            { show: false } : 
            item.badge;

          return (
            <Card
              key={item.slug}
              title={String(item.title || 'Untitled')}
              description={String(item.description || '')}
              href={String(item.href || '#')}
              imageUrl={String(item.imageUrl || '')}
              imageAlt={String(item.imageAlt || item.title || 'Untitled')}
              badge={shouldShowBadge}
              tags={Array.isArray(item.tags) ? item.tags : []}
              metadata={item.metadata}
              height={item.height}
              className={variant === 'featured' ? 'featured-item' : ''}
            />
          );
        })}
      </div>
    </div>
  );
}

// Helper function to generate title from slug
function generateTitleFromSlug(slug: string): string {
  if (!slug) return 'Untitled';
  return slugToDisplayName(slug);
}
