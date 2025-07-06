// app/components/ArticleList.tsx
// Client-side component for displaying lists of articles
'use client';

import Link from "next/link";
import { formatDate } from "app/utils/utils";
import { CardItem } from "app/components/CardItem";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import type { MaterialPost } from 'app/types';

interface ArticleListProps {
  articles: MaterialPost[];
  title?: string;
  description?: string;
  className?: string;
  showAuthor?: boolean;
  limit?: number;
}

export function ArticleList({ 
  articles,
  title,
  description,
  className = '',
  showAuthor = true,
  limit
}: ArticleListProps) {
  // Apply limit if specified
  const displayArticles = limit ? articles.slice(0, limit) : articles;

  if (!articles || articles.length === 0) {
    return (
      <div className={className}>
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
        )}
        <div className="text-center py-8">
          <p className="text-gray-600">No articles found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayArticles.map((article, index) => (
          <FadeInOnScroll
            key={article.slug}
            delay={0.1 * index}
            yOffset={20}
            amount={0.1}
          >
            <CardItem
              href={`/${article.slug}`}
              imageUrl={article.metadata.image || ''}
              imageAlt={article.metadata.imageCaption || article.metadata.title}
              title={article.metadata.title}
              description={article.metadata.description || article.metadata.summary}
              date={article.metadata.publishedAt ? formatDate(article.metadata.publishedAt) : undefined}
              tags={article.metadata.tags}
              nameShort={article.metadata.nameShort}
              atomicNumber={article.metadata.atomicNumber}
              chemicalSymbol={article.metadata.chemicalSymbol}
            />
          </FadeInOnScroll>
        ))}
      </div>
    </div>
  );
}
