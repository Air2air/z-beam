// app/components/SearchResults/SearchResultsGrid.tsx
import { Card } from "../Card/Card";
import { getBadgeFromItem, getChemicalProperties } from "../../utils/searchUtils";
import { SearchResultItem } from "@/types/core";

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
          // Handle multi-word material names in slugs like "silicon-carbide-laser-cleaning"
          // or "silicon-nitride-laser-cleaning"
          const slugParts = item.slug.split('-');
          
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
          let foundMultiWord = false;
          for (const material of multiWordMaterials) {
            if (
              slugParts.length >= material.pattern.length &&
              material.pattern.every((part, i) => slugParts[i] === part)
            ) {
              cardName = material.name;
              foundMultiWord = true;
              break;
            }
          }
          
          // If no known multi-word pattern, use smart extraction
          if (!foundMultiWord) {
            // If the slug has "laser" or "cleaning", extract everything before that
            const laserIndex = slugParts.indexOf("laser");
            const cleaningIndex = slugParts.indexOf("cleaning");
            
            let endIndex = -1;
            if (laserIndex > 0) endIndex = laserIndex;
            else if (cleaningIndex > 0) endIndex = cleaningIndex;
            
            if (endIndex > 0) {
              // Take all parts before "laser" or "cleaning" and capitalize them
              cardName = slugParts
                .slice(0, endIndex)
                .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
            } else {
              // Use first part capitalized
              cardName = slugParts[0].charAt(0).toUpperCase() + slugParts[0].slice(1);
            }
          }
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
            metadata={item.metadata || {
              category: item.category,
              articleType: item.articleType,
              chemicalProperties: getChemicalProperties(item)
            }}
            className="h-full"
          />
        );
      })}
    </div>
  );
}