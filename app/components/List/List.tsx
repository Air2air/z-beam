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
  }>;
  title?: string;
  heading?: string; // Add heading as an alias for title
  columns?: 1 | 2 | 3 | 4;
  filterBy?: string;
  className?: string;
}

// First, add these interfaces at the top of your file
interface ArticleMetadata {
  subject?: string;
  description?: string;
  category?: string;
  articleType?: string;
  image?: string;
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
  
  // Fetch articles
  const articles = await Promise.all(
    processedItems.map(async (item) => {
      const article = await getArticle(item.slug) as Article | null;
      
      // Create badge object with proper structure
      const badgeText = item.badge || article?.metadata?.category;
      const badgeObject = badgeText ? { 
        text: badgeText,
        color: getCategoryColor(article?.metadata?.category)
      } : undefined;
      
      return {
        slug: item.slug,
        title: article?.metadata?.subject || item.title || item.slug,
        description: article?.metadata?.description || item.description || '',
        badge: badgeObject,
        imageUrl: item.image, // Use imageUrl to match Card component prop
        category: article?.metadata?.category || '',
        articleType: article?.metadata?.articleType || '',
      };
    })
  );

  // Filter articles
  const filteredItems = filterBy === "all" 
    ? articles 
    : articles.filter((a) => a.articleType === filterBy);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (!filteredItems?.length) return null;
  
  return (
    <div className={`list-section ${className}`}>
      {displayTitle && <h2 className="list-title">{displayTitle}</h2>}
      
      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {filteredItems.map((item) => (
          <Card
            key={item.slug}
            title={item.title}
            description={item.description}
            href={`/${item.slug}`}
            badge={item.badge}
            showBadge={!!item.badge}
            imageUrl={item.imageUrl}
            imageAlt={item.title}
          />
        ))}
      </div>
    </div>
  );
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