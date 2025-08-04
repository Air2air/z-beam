// app/components/List/List.tsx
import './styles.scss';
import { Card } from '../Card/Card';
import { getArticle } from '@/app/utils/contentIntegrator';

interface ListProps {
  // Add slugs as a prop alternative to items
  slugs?: string[];
  items?: Array<{
    slug: string;
    title?: string;
    description?: string;
    image?: string;
    badge?: string;
    featured?: boolean; // Add featured property
  }>;
  title?: string;
  heading?: string; // Add heading as an alias for title
  columns?: 1 | 2 | 3 | 4;
  filterBy?: string;
  className?: string;
}

// Update your existing ArticleMetadata interface at the top of the file
interface ArticleMetadata {
  subject?: string;
  description?: string;
  category?: string;
  articleType?: string;
  image?: string;
  chemicalSymbol?: string;
  atomicNumber?: number;
  chemicalFormula?: string;
  // Add the properties field
  properties?: {
    chemicalFormula?: string;
    density?: string;
    meltingPoint?: string;
    thermalConductivity?: string;
    laserType?: string;
    wavelength?: string;
    fluenceRange?: string;
  };
  // Add composition field
  composition?: Array<{
    component: string;
    percentage: string;
    type: string;
    formula?: string;
  }>;
  // Optional: Add this for flexibility with other fields
  [key: string]: any;
}

interface Article {
  metadata: ArticleMetadata;
  components: Record<string, any> | null;
}

export async function List({ 
  slugs,
  items,
  title,
  heading,
  columns = 3,
  filterBy = "all",
  className = ""
}: ListProps) {
  // Use heading as fallback for title
  const displayTitle = title || heading;
  
  // Process items from either slugs or items prop
  const processedItems = items || [];
  
  // If slugs are provided but not items, create items from slugs
  if (slugs && !items) {
    const slugItems = slugs.map(slug => ({ slug }));
    processedItems.push(...slugItems);
  }
  
  // Fetch articles - Update the return object structure
  const articles = await Promise.all(
    processedItems.map(async (item) => {
      const article = await getArticle(item.slug) as Article | null;
      
      // Create badge object with proper structure
      const badgeText = item.badge || article?.metadata?.category;
      const badgeObject = badgeText ? { 
        text: badgeText,
        color: getCategoryColor(article?.metadata?.category)
      } : undefined;
      
      // Determine image with fallbacks
      const imageUrl = getArticleImage(item, article);
      
      // Extract chemical data from article
      let chemicalSymbol = article?.metadata?.chemicalSymbol;
      let atomicNumber = article?.metadata?.atomicNumber;
      let chemicalFormula = article?.metadata?.chemicalFormula;
      
      // If not directly in metadata, try to get from properties
      if (!chemicalFormula && article?.metadata?.properties?.chemicalFormula) {
        chemicalFormula = article.metadata.properties.chemicalFormula;
      }
      
      // If we have a formula but no symbol, extract symbol from formula or name
      if (chemicalFormula && !chemicalSymbol) {
        // Extract first element from formula (e.g., "Al" from "Al₂O₃")
        const match = chemicalFormula.match(/([A-Z][a-z]?)/);
        chemicalSymbol = match ? match[0] : article?.metadata?.subject?.substring(0, 2) || '';
      }
      
      return {
        slug: item.slug,
        title: article?.metadata?.subject || item.title || item.slug,
        description: article?.metadata?.description || item.description || '',
        badge: badgeObject,
        imageUrl: imageUrl,
        category: article?.metadata?.category || '',
        articleType: article?.metadata?.articleType || '',
        // Add these properties directly to the item
        chemicalSymbol,
        atomicNumber,
        chemicalFormula,
        // Pass the featured flag
        featured: item.featured,
        // Pass the full article for other needs
        materialData: article
      };
    })
  );

  // Filter articles
  const filteredItems = filterBy === "all" 
    ? articles 
    : articles.filter((a) => a.articleType === filterBy);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (!filteredItems?.length) return null;
  
  return (
    <div className={`list-section ${className}`}>
      {displayTitle && <h2 className="list-title">{displayTitle}</h2>}
      
      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {filteredItems.map((item) => {
          // We'll still hide the BadgeSymbol for featured items
          const isFeatured = item.featured;
          
          return (
            <Card
              key={item.slug}
              title={item.title}
              description={item.description}
              href={`/${item.slug}`}
              badge={item.badge || {
                symbol: item.chemicalSymbol,
                formula: item.chemicalFormula, 
                atomicNumber: item.atomicNumber,
                materialType: item.category
              }}
              imageUrl={item.imageUrl}
              imageAlt={item.title}
              metadata={{
                category: item.category,
                articleType: item.articleType
              }}
              className={isFeatured ? 'featured-item' : ''}
              height={isFeatured ? 'auto' : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get article image with fallbacks
function getArticleImage(
  item: { slug: string; image?: string; },
  article: Article | null
): string {
  // First, try to use the directly provided image
  if (item.image) return item.image;
  
  // Then, try to get the image from the article metadata
  const metadataImage = article?.metadata?.image;
  if (metadataImage) return metadataImage;
  
  // Try to get OpenGraph image from metadata if available
  const ogImage = article?.metadata?.['ogImage'] || article?.metadata?.['openGraph']?.['images']?.[0]?.['url'];
  if (ogImage) return ogImage;
  
  // Use a category-specific fallback
  const category = article?.metadata?.category?.toLowerCase();
  if (category) {
    const categoryFallbacks: Record<string, string> = {
      'ceramic': '/images/Site/Logo/logo_.png',
      'metal': '/images/fallbacks/metal-fallback.jpg',
      'polymer': '/images/fallbacks/polymer-fallback.jpg',
      'material': '/images/fallbacks/material-fallback.jpg',
      'application': '/images/fallbacks/application-fallback.jpg',
      'technique': '/images/fallbacks/technique-fallback.jpg',
      'industry': '/images/fallbacks/industry-fallback.jpg'
    };
    
    if (categoryFallbacks[category]) {
      return categoryFallbacks[category];
    }
  }
  
  // Fallback based on slug pattern (for specific content types)
  if (item.slug.includes('laser-')) {
    return '/images/Site/Logo/logo_.png"';
  }
  
  // Final default fallback
  return '/images/fallbacks/default-fallback.jpg';
}

// Helper function to map categories to colors
function getCategoryColor(category?: string): "blue" | "green" | "purple" | "orange" | undefined {
  if (!category) return undefined;
  
  const categoryColors: Record<string, "blue" | "green" | "purple" | "orange"> = {
    "material": "blue",
    "application": "green",
    "technique": "purple",
    "industry": "orange",
    // Add more mappings as needed
  };
  
  return categoryColors[category.toLowerCase()] || "blue"; // Default to blue
}