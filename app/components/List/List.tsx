// app/components/List/List.tsx - Minimal version
import React from 'react';
import { Card } from '../Card/Card';
import { getArticle } from '@/app/utils/contentIntegrator';

export interface ListProps {
  slugs: string[];
  heading?: string;
  columns?: 1 | 2 | 3 | 4;
  filterBy?: string;
}

export async function List({ 
  slugs,
  heading,
  columns = 3,
  filterBy = "all"
}: ListProps) {
  // Fetch articles
  const articles = await Promise.all(
    slugs.map(async (slug) => {
      const article = await getArticle(slug);
      return {
        slug,
        title: article?.metadata?.subject || slug,
        description: article?.metadata?.description || '',
        category: article?.metadata?.category,
        articleType: article?.metadata?.articleType,
      };
    })
  );

  // Filter articles
  const items = filterBy === "all" 
    ? articles 
    : articles.filter((a) => a.articleType === filterBy);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div>
      {heading && <h2 className="text-3xl font-bold text-white mb-8 text-center">{heading}</h2>}
      
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {items.map((item) => (
          <Card
            key={item.slug}
            href={`/${item.slug}`}
            title={item.title}
            description={item.description}
            variant="default"
            layout="vertical"
            showBadge={!!item.category}
            badge={item.category ? { text: item.category, color: 'blue' } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default List;