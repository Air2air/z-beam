// app/components/ArticleGrid/ArticleGrid.tsx
"use client";

import { Card } from "../Card/Card";
import { Article, MaterialType, BadgeData } from "@/types/core";
import { loadComponent } from "../../utils/contentAPI";

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

// Base article item interface
interface ArticleItem {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
  badge?: BadgeData | string | null;
  tags?: string[];
  featured?: boolean;
  metadata?: Record<string, unknown>;
  // Support for raw article data
  article?: Article | { metadata: Record<string, unknown>; components: Record<string, unknown> } | null;
}

interface ArticleGridProps {
  items: ArticleItem[];
  title?: string;
  heading?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  showBadgeSymbols?: boolean;
  loadBadgeSymbolData?: boolean;
  variant?: 'standard' | 'featured' | 'search';
}

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
        // Get chemical data from article metadata
        const chemicalSymbol = article?.metadata?.chemicalSymbol;
        const atomicNumber = article?.metadata?.atomicNumber;
        let chemicalFormula = article?.metadata?.chemicalFormula;

        // If not directly in metadata, try to get from properties
        if (!chemicalFormula && article?.metadata?.properties?.chemicalFormula) {
          chemicalFormula = article.metadata.properties.chemicalFormula;
        }

        // Try to load BadgeSymbol component data
        if (loadBadgeSymbolData) {
          try {
            const badgeSymbol = await loadComponent('badgesymbol', item.slug);
            if (badgeSymbol?.config) {
              const config = badgeSymbol.config as Record<string, unknown>;
              badgeSymbolData = {
                symbol: String(config.symbol || chemicalSymbol || ''),
                materialType: toMaterialType(String(config.materialType || article?.metadata?.category || '')),
                atomicNumber: Number(config.atomicNumber || atomicNumber || 0) || undefined,
                formula: String(config.formula || chemicalFormula || ''),
              };
            }
          } catch (error) {
            // Fall back to article metadata
          }
        }

        // Fallback to article metadata if no component data loaded
        if (!badgeSymbolData && (chemicalSymbol || chemicalFormula)) {
          badgeSymbolData = {
            symbol: chemicalSymbol || '',
            materialType: toMaterialType(article?.metadata?.category as string),
            atomicNumber: atomicNumber,
            formula: chemicalFormula || '',
          };
        }
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
              title={item.title}
              description={item.description}
              href={item.href}
              imageUrl={item.imageUrl}
              imageAlt={item.imageAlt}
              badge={shouldShowBadge}
              tags={item.tags}
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

  const slugParts = slug.split('-');
  
  // Common multi-word material patterns
  const multiWordMaterials = [
    {pattern: ["silicon", "carbide"], name: "Silicon Carbide"},
    {pattern: ["silicon", "nitride"], name: "Silicon Nitride"},
    {pattern: ["aluminum", "oxide"], name: "Aluminum Oxide"},
    {pattern: ["zirconium", "oxide"], name: "Zirconium Oxide"},
    {pattern: ["carbon", "fiber"], name: "Carbon Fiber"},
    {pattern: ["stainless", "steel"], name: "Stainless Steel"},
  ];
  
  // Check for known multi-word materials
  for (const material of multiWordMaterials) {
    if (
      slugParts.length >= material.pattern.length &&
      material.pattern.every((part, i) => slugParts[i] === part)
    ) {
      return material.name;
    }
  }
  
  // If the slug has "laser" or "cleaning", extract everything before that
  const laserIndex = slugParts.indexOf("laser");
  const cleaningIndex = slugParts.indexOf("cleaning");
  
  let endIndex = -1;
  if (laserIndex > 0) endIndex = laserIndex;
  else if (cleaningIndex > 0) endIndex = cleaningIndex;
  
  if (endIndex > 0) {
    // Take all parts before "laser" or "cleaning" and capitalize them
    return slugParts
      .slice(0, endIndex)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  
  // Use first part capitalized
  return slugParts[0].charAt(0).toUpperCase() + slugParts[0].slice(1);
}
