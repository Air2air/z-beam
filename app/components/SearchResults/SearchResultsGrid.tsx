// app/components/SearchResults/SearchResultsGrid.tsx
import { Card } from "../Card/Card";
import { getBadgeFromItem, getChemicalProperties, getDisplayName } from "../../utils/searchUtils";
import { slugToDisplayName } from "../../utils/formatting";
import { SearchResultItem, ArticleMetadata } from "@/types";
import { getGridClasses, type GridColumns, type GridGap } from "../../utils/gridConfig";

interface SearchResultsGridProps {
  items: SearchResultItem[];
  columns: GridColumns;
  gap?: GridGap;
}

export function SearchResultsGrid({
  items,
  columns,
  gap = "sm"
}: SearchResultsGridProps) {
  
  return (
    <div className={getGridClasses({ columns, gap })}>
      {items.map((item, index) => {
        // Get badge data once to avoid calling the function twice
        const badgeData = getBadgeFromItem(item);
        
        // Validate href to help debug 404 issues
        if (process.env.NODE_ENV === 'development' && (!item.href || item.href === '#')) {
          console.warn(`Item ${index} missing valid href:`, {
            slug: item.slug,
            name: item.name,
            title: item.title,
            href: item.href
          });
          
          // Try to auto-fix href if possible
          if (item.slug && !item.href) {
            item.href = `/${item.slug}`;
            console.info(`Auto-fixed href to /${item.slug}`);
          }
        }
        
        // Generate a better display name from slug if no name or title exists
        let cardName = item.name || "";
        
        if (!cardName && item.slug) {
          cardName = slugToDisplayName(item.slug);
        }
        
        return (
          <Card
            key={item.id || item.slug || `item-${index}`}
            href={item.href}
            frontmatter={{
              ...(
                item.metadata && 'title' in item.metadata && 'slug' in item.metadata
                  ? item.metadata as ArticleMetadata
                  : {
                      title: item.title || '',
                      slug: item.slug,
                      category: item.category,
                    } as ArticleMetadata
              ),
              title: item.title || cardName,
              subject: cardName,
              description: item.description,
              tags: item.tags || [],
              images: {
                hero: {
                  url: item.image,
                  alt: item.imageAlt || item.title || ""
                }
              }
            }}
            badge={badgeData || undefined} // Convert null to undefined
            className="h-full"
          />
        );
      })}
    </div>
  );
}