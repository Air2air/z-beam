// app/components/List/List.tsx - With data fetching
import React from 'react';
import { Card } from '../Card/Card';
import { getEnhancedArticle } from '@/app/utils/contentIntegrator';

export interface ListProps {
  slugs: string[];
  heading?: string;
  description?: string;
  columns?: 1 | 2 | 3 | 4;
  filterBy?: string; // "material" | "application" | "all"
  className?: string;
}

export async function List({ 
  slugs,
  heading, 
  description, 
  columns = 3,
  filterBy = "all",
  className = ''
}: ListProps) {
  // Move the articles fetching here
  const articles = await Promise.all(
    slugs.map(async (slug) => {
      const article = await getEnhancedArticle(slug);
      return {
        slug,
        title: article?.metadata?.subject || slug,
        description: article?.metadata?.description || `Learn about ${slug} laser cleaning technology.`,
        imageUrl: article?.metadata?.image,
        category: article?.metadata?.category,
        articleType: article?.metadata?.articleType,
        metadata: {
          category: article?.metadata?.category,
          articleType: article?.metadata?.articleType,
          author: article?.metadata?.author,
          date: new Date().toLocaleDateString(),
        },
      };
    })
  );

  // Filter based on prop
  const filteredArticles = filterBy === "all" 
    ? articles 
    : articles.filter((a) => a.articleType === filterBy);

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (filteredArticles.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        {heading && <h2 className="text-3xl font-bold text-white mb-4">{heading}</h2>}
        <p className="text-gray-400">No items found.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {(heading || description) && (
        <div className="text-center mb-8">
          {heading && <h2 className="text-3xl font-bold text-white mb-4">{heading}</h2>}
          {description && <p className="text-gray-400 max-w-2xl mx-auto">{description}</p>}
        </div>
      )}

      {/* Items Grid */}
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {filteredArticles.map((item) => (
          <Card
            key={item.slug}
            href={`/${item.slug}`}
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
            imageAlt={item.title}
            variant="default"
            layout="vertical"
            showBadge={!!item.category}
            badge={item.category ? {
              text: item.category,
              color: 'blue'
            } : undefined}
            metadata={item.metadata}
          />
        ))}
      </div>
    </div>
  );
}

export default List;