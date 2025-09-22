// app/components/List/List.tsx
import "./styles.scss";
import React from "react";
import { Card } from "../Card/Card";
import { /* cn */ } from "../../utils/helpers";
import { getArticle, loadComponent } from "../../utils/contentAPI"; // Updated to use contentAPI
import { MaterialType, ListProps, ProcessedListItem } from "@/types/centralized";
import { safeMatch, extractSafeValue } from "../../utils/stringHelpers";
import { ArticleMetadata, Article } from "@/types";

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

export async function List({
  slugs,
  items,
  title,
  heading,
  columns = 3,
  filterBy = "all",
  className = "",
}: ListProps) {
  // Use heading for title
  const displayTitle = title || heading;

  // Process items from either slugs or items prop
  const processedItems = items || [];

  // If slugs are provided but not items, create items from slugs
  if (slugs && !items) {
    const slugItems = slugs.map((slug) => ({ slug }));
    processedItems.push(...slugItems);
  }

  // Fetch articles - Update the return object structure
  const articles: ProcessedListItem[] = await Promise.all(
    processedItems.map(async (item) => {
      const article = (await getArticle(item.slug)) as Article | null;

      // Create badge object with proper structure
      const badgeText = item.badge || article?.metadata?.category;
      const categoryColor = article?.metadata && 'category' in article.metadata && typeof article.metadata.category === 'string' 
        ? article.metadata.category 
        : undefined;
      const badgeObject = badgeText
        ? {
            text: badgeText,
            color: getCategoryColor(categoryColor),
          }
        : undefined;

      // Determine image with fallbacks
      const imageUrl = getArticleImage(item, article);

      // Extract chemical data from article with proper type guards
      const safeMetadata = article?.metadata && typeof article.metadata === 'object' ? article.metadata : {};
      
      let chemicalSymbol = 'chemicalSymbol' in safeMetadata && typeof safeMetadata.chemicalSymbol === 'string' 
        ? safeMetadata.chemicalSymbol 
        : undefined;
      const atomicNumber = 'atomicNumber' in safeMetadata && typeof safeMetadata.atomicNumber === 'number'
        ? safeMetadata.atomicNumber
        : undefined;
      const chemicalFormula = 'chemicalFormula' in safeMetadata && typeof safeMetadata.chemicalFormula === 'string'
        ? safeMetadata.chemicalFormula
        : undefined;

      // If we have a formula but no symbol, extract symbol from formula or name
      if (chemicalFormula && !chemicalSymbol) {
        // Extract first element from formula (e.g., "Al" from "Al₂O₃")
        const match = safeMatch(chemicalFormula, /([A-Z][a-z]?)/);
        chemicalSymbol = match
          ? match[0]
          : extractSafeValue(article?.metadata?.title).substring(0, 2) || "";
      }

      // Load BadgeSymbol data from content/components/badgesymbol/
      let badgeSymbolData: {
        symbol: string;
        materialType?: MaterialType;
        atomicNumber?: number;
        formula?: string;
      } | null = null;
      try {
        const badgeSymbol = await loadComponent('badgesymbol', item.slug);
        if (badgeSymbol?.config) {
          const config = badgeSymbol.config as Record<string, unknown>; // More specific type
          const symbolValue = config.symbol || chemicalSymbol;
          if (symbolValue) {
            badgeSymbolData = {
              symbol: String(symbolValue),
              materialType: config.materialType ? toMaterialType(String(config.materialType)) : toMaterialType(article?.metadata?.category as string),
              atomicNumber: config.atomicNumber ? Number(config.atomicNumber) : atomicNumber,
              formula: config.formula ? String(config.formula) : chemicalFormula,
            };
          }
        }
      } catch (error) {
        // If no BadgeSymbol content file exists, fall back to article metadata
        if (chemicalSymbol) {
          badgeSymbolData = {
            symbol: chemicalSymbol,
            materialType: toMaterialType(article?.metadata?.category as string),
            atomicNumber: atomicNumber,
            formula: chemicalFormula,
          };
        }
      }

      // Extract values with type safety
      const safeTitle = article?.metadata && 'title' in article.metadata && typeof article.metadata.title === 'string'
        ? article.metadata.title
        : item.title || item.slug;
      const safeDescription = article?.metadata && 'description' in article.metadata && typeof article.metadata.description === 'string'
        ? article.metadata.description
        : item.description || "";
      const safeCategory = article?.metadata && 'category' in article.metadata && typeof article.metadata.category === 'string'
        ? article.metadata.category
        : "";
      const safeArticleType = article?.metadata && 'articleType' in article.metadata && typeof article.metadata.articleType === 'string'
        ? article.metadata.articleType
        : "";

      return {
        slug: item.slug,
        title: safeTitle,
        description: safeDescription,
        badge: badgeObject,
        imageUrl: imageUrl,
        category: safeCategory,
        articleType: safeArticleType,
        // Add these properties directly to the item
        chemicalSymbol,
        atomicNumber,
        chemicalFormula,
        // Pass the featured flag
        featured: item.featured,
        // Pass the full article for other needs
        materialData: article,
        // Pass the loaded BadgeSymbol data
        badgeSymbolData,
      };
    })
  );

  // Filter articles
  const filteredItems =
    filterBy === "all"
      ? articles
      : articles.filter((a) => a.articleType === filterBy);

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2 md:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (!filteredItems?.length) return null;

  return (
    <div className={`list-section ${className}`}>
      {displayTitle && <h2 className="list-title">{displayTitle}</h2>}

      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {filteredItems.map((item) => {
          // We'll still hide the BadgeSymbol for featured items
          const isFeatured = item.featured;

          return (
            <Card
              key={item.slug}
              title={item.title}
              description={item.description}
              href={`/${item.slug}`}
              badge={item.badgeSymbolData || {
                symbol: item.chemicalSymbol,
                formula: item.chemicalFormula,
                atomicNumber: item.atomicNumber,
                materialType: toMaterialType(item.category),
              }}
              imageUrl={item.imageUrl}
              imageAlt={item.title}
              metadata={
                item.materialData?.metadata && 'title' in item.materialData.metadata 
                  ? item.materialData.metadata as ArticleMetadata
                  : {
                      title: item.title || '',
                      slug: item.slug,
                      category: item.category,
                      articleType: item.articleType,
                    } as ArticleMetadata
              }
              height={isFeatured ? "auto" : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get article image with fallbacks
function getArticleImage(
  item: { slug: string; image?: string },
  article: Article | null
): string | undefined {
  // First, try to use the directly provided image
  if (item.image) return item.image;

  // Then, try to get the image from the article metadata
  const metadataImage = article?.metadata && 'image' in article.metadata && typeof article.metadata.image === 'string'
    ? article.metadata.image
    : undefined;
  if (metadataImage) return metadataImage;

  // Try to get OpenGraph image from metadata if available
  const ogImage =
    article?.metadata?.["ogImage"] ||
    (article?.metadata as Record<string, unknown>)?.["openGraph"]?.["images"]?.[0]?.["url"];
  if (ogImage) return ogImage;
  
  // Return undefined to let the Thumbnail component handle all fallbacks
  return undefined;
}

// Helper function to map categories to colors
function getCategoryColor(
  category?: string
): "blue" | "green" | "purple" | "orange" | undefined {
  if (!category) return undefined;

  const categoryColors: Record<string, "blue" | "green" | "purple" | "orange"> =
    {
      material: "blue",
      application: "green",
      technique: "purple",
      industry: "orange",
      // Add more mappings as needed
    };

  return categoryColors[category.toLowerCase()] || "blue"; // Default to blue
}
