// app/components/List/ListSimplified.tsx
import { ArticleGrid } from "../ArticleGrid/ArticleGrid";
import { getArticle } from "../../utils/contentAPI";

interface ListSimplifiedProps {
  slugs?: string[];
  items?: Array<{
    slug: string;
    title?: string;
    description?: string;
    image?: string;
    badge?: string;
    featured?: boolean;
  }>;
  title?: string;
  heading?: string;
  columns?: 1 | 2 | 3 | 4;
  filterBy?: string;
  className?: string;
  loadBadgeSymbolData?: boolean;
}

export async function ListSimplified({
  slugs,
  items,
  title,
  heading,
  columns = 3,
  filterBy = "all",
  className = "",
  loadBadgeSymbolData = true,
}: ListSimplifiedProps) {
  // Process items from either slugs or items prop
  const processedItems = items || [];

  // If slugs are provided but not items, create items from slugs
  if (slugs && !items) {
    const slugItems = slugs.map((slug) => ({ slug }));
    processedItems.push(...slugItems);
  }

  // Fetch articles for each item
  const articlesWithData = await Promise.all(
    processedItems.map(async (item) => {
      const article = await getArticle(item.slug);
      return {
        ...item,
        article,
      };
    })
  );

  // Filter articles based on filterBy
  const filteredItems = filterBy === "all" 
    ? articlesWithData
    : articlesWithData.filter((item) => 
        item.article?.metadata?.articleType === filterBy
      );

  return (
    <ArticleGrid
      items={filteredItems}
      title={title}
      heading={heading}
      columns={columns}
      className={className}
      loadBadgeSymbolData={loadBadgeSymbolData}
      variant="standard"
    />
  );
}
