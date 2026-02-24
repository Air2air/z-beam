import { Card } from '../Card/Card';
import { GridItem, ArticleMetadata, CardGridSSRProps } from '@/types/centralized';
import { getArticle, getContaminantArticle, getCompoundArticle, getSettingsArticle, getApplicationArticle } from '@/app/utils/contentAPI';
import { getGridClasses } from '@/app/utils/gridConfig';

/**
 * Server-side CardGrid component for async data loading
 * Used in server components like RelatedMaterials
 * For client-side grids with state/filtering, use CardGrid.tsx
 */
export async function CardGrid({
  items: providedItems,
  slugs = [],
  contentType = 'materials',
  groupByCategory = false,
  columns = 3,
  gap = 'md',
  variant = 'default',
  className = '',
}: CardGridSSRProps) {
  // Select the appropriate article fetcher based on content type
  const getArticleForType = 
    contentType === 'contaminants' ? getContaminantArticle :
    contentType === 'compounds' ? getCompoundArticle :
    contentType === 'settings' ? getSettingsArticle :
    contentType === 'applications' ? getApplicationArticle :
    getArticle; // default to materials
  
  // Load items from slugs if not provided
  let items = providedItems || [];
  
  if (!providedItems && slugs.length > 0) {
    const loadedItems = await Promise.all(
      slugs.map(async (slug) => {
        const article = await getArticleForType(slug);
        if (!article) return null;
        
        // Handle different return types: SettingsMetadata vs standard article
        const frontmatter = ('frontmatter' in article ? article.frontmatter : article) as unknown as ArticleMetadata;
        const imageUrl = frontmatter?.images?.hero?.url || '';
        const imageAlt = frontmatter?.images?.hero?.alt || frontmatter?.title || '';
        
        // Use fullPath if available, otherwise construct from content type and slug
        // Ensure we prioritize fullPath to maintain correct URL structure
        let itemPath = (frontmatter as any)?.fullPath;
        
        if (!itemPath) {
          const category = (frontmatter as any)?.category || '';
          const subcategory = (frontmatter as any)?.subcategory || '';
          
          // Only include path segments that exist
          if (category && subcategory) {
            itemPath = `/${contentType}/${category}/${subcategory}/${slug}`;
          } else if (category) {
            itemPath = `/${contentType}/${category}/${slug}`;
          } else {
            itemPath = `/${contentType}/${slug}`;
          }
        }
        
        return {
          title: frontmatter?.title || frontmatter?.name || 'Untitled',
          slug: frontmatter?.slug || slug,
          href: itemPath,
          url: itemPath,
          imageUrl,
          imageAlt,
          frontmatter: {
            ...frontmatter,
            title: frontmatter?.title || frontmatter?.name || 'Untitled',
            slug: frontmatter?.slug || slug,
            images: imageUrl ? {
              hero: {
                url: imageUrl,
                alt: imageAlt,
              }
            } : undefined
          },
          category: frontmatter?.category,
          subcategory: frontmatter?.subcategory,
        } as GridItem;
      })
    );
    
    items = loadedItems.filter((item): item is GridItem => item !== null);
  }

  if (items.length === 0) {
    return null;
  }

  // Group by category if requested
  if (groupByCategory) {
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, GridItem[]>);

    return (
      <div className="space-y-12">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="text-2xl font-bold mb-4">{category}</h3>
            <div className={`${getGridClasses({ columns, gap })} ${className}`}>
              {categoryItems.map((item) => (
                <Card
                  key={item.href || item.url || item.slug}
                  href={item.href || item.url || `/${item.slug}`}
                  imageUrl={item.imageUrl}
                  imageAlt={item.imageAlt}
                  variant={variant}
                  frontmatter={{
                    title: item.title || 'Untitled',
                    slug: item.slug,
                    ...item.frontmatter,
                    images: item.imageUrl ? {
                      hero: {
                        url: item.imageUrl,
                        alt: item.imageAlt || item.title,
                      }
                    } : undefined
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Simple grid
  return (
    <div className={`${getGridClasses({ columns, gap })} ${className}`}>
      {items.map((item) => (
        <Card
          key={item.href || item.url || item.slug}
          href={item.href || item.url || `/${item.slug}`}
          imageUrl={item.imageUrl}
          imageAlt={item.imageAlt}
          variant={variant}
          frontmatter={{
            title: item.title || 'Untitled',
            slug: item.slug,
            ...item.frontmatter,
            images: item.imageUrl ? {
              hero: {
                url: item.imageUrl,
                alt: item.imageAlt || item.title,
              }
            } : undefined
          }}
        />
      ))}
    </div>
  );
}
