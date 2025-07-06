// app/components/ArticleList.tsx
// This is now a wrapper around ContentList for backwards compatibility
import { ContentList } from "./ContentList";
import type { ArticlePost } from 'app/types/content';

interface ArticleListProps {
  articles?: ArticlePost[];
  title?: string;
  description?: string;
  className?: string;
  showAuthor?: boolean;
  limit?: number;
  authorId?: number;
  tag?: string;
  excludeSlug?: string;
  sortBy?: 'date' | 'name' | 'atomicNumber';
}

export function ArticleList({ 
  title,
  description,
  className = '',
  limit,
  authorId,
  tag,
  excludeSlug,
  sortBy = 'date'
}: ArticleListProps) {
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
      
      <ContentList 
        limit={limit}
        authorId={authorId}
        tag={tag}
        excludeSlug={excludeSlug}
        sortBy={sortBy}
      />
    </div>
  );
}
