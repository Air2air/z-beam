// app/components/AuthorByline.tsx
import Link from 'next/link';
import { formatDate } from 'app/utils/utils';
import type { AuthorMetadata } from 'app/types';

interface AuthorBylineProps {
  publishedAt?: string | null;
  author?: AuthorMetadata | null;
  articleSlug?: string;
  className?: string;
}

export function AuthorByline({ 
  publishedAt, 
  author, 
  articleSlug,
  className = "flex items-center gap-4 mb-6"
}: AuthorBylineProps) {
  return (
    <div className={className}>
      <p className="uppercase text-xs text-gray-500 dark:text-gray-400 tabular-nums">
        {publishedAt ? formatDate(publishedAt) : 'Date not available'}
      </p>
      {author && (
        <>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2">
            {author.image && (
              <img
                src={author.image}
                alt={author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <Link
              href={`/authors/${author.slug}${articleSlug ? `?from=${articleSlug}` : ''}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              By {author.name}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
