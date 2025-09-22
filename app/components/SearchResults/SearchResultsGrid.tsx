// app/components/SearchResults/SearchResultsGrid.tsx
import { Card } from "../Card/Card";
import { getBadgeFromItem, getChemicalProperties, getDisplayName } from "../../utils/searchUtils";
import { slugToDisplayName } from "../../utils/formatting";
import { SearchResultItem, ArticleMetadata } from "@/types";

interface SearchResultsGridProps {
  items: SearchResultItem[];
  columns: 1 | 2 | 3 | 4;
}

export function SearchResultsGrid({
  items,
  columns
}: SearchResultsGridProps) {
  // Enhanced grid column classes with better responsive breakpoints
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };
  
  return (
    <div className={`grid gap-4 ${gridCols[columns]} auto-rows-fr`}>
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
            title={item.title || ""}
            name={cardName}
            description={item.description}
            image={item.image}
            imageAlt={item.imageAlt || item.title || ""}
            tags={item.tags || []}
            badge={badgeData || undefined} // Convert null to undefined
            metadata={
              item.metadata && 'title' in item.metadata && 'slug' in item.metadata
                ? item.metadata as ArticleMetadata
                : {
                    title: item.title || '',
                    slug: item.slug,
                    category: item.category,
                  } as ArticleMetadata
            }
            className="h-full"
          />
        );
      })}
    </div>
  );
}