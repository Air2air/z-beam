// app/components/AuthorCard.tsx
import Link from 'next/link';
import { SmartTagList } from './SmartTagList';
import type { AuthorMetadata } from 'app/types';

interface AuthorCardProps {
  author: AuthorMetadata & { articleCount?: number };
  variant?: 'default' | 'compact';
  showArticleCount?: boolean;
  showSpecialties?: boolean;
  maxSpecialties?: number;
}

export function AuthorCard({ 
  author, 
  variant = 'default', 
  showArticleCount = false, 
  showSpecialties = false,
  maxSpecialties = 3 
}: AuthorCardProps) {
  
  // Compact variant for lists, default for featured display
  const isCompact = variant === 'compact';
  
  return (
    <Link 
      href={`/authors/${author.slug}`} 
      className={`block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 ${
        isCompact ? 'p-6' : 'overflow-hidden'
      }`}
    >
      {isCompact ? (
        // Compact layout (horizontal)
        <div className="flex items-start space-x-4">
          {author.image && (
            <img
              src={author.image}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-blue-600 transition-colors">
              {author.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{author.title}</p>
            {showArticleCount && author.articleCount !== undefined && (
              <p className="text-sm text-blue-600 font-medium">
                {author.articleCount} article{author.articleCount !== 1 ? 's' : ''}
              </p>
            )}
            {showSpecialties && author.specialties && author.specialties.length > 0 && (
              <div className="mt-3">
                <SmartTagList 
                  tags={author.specialties} 
                  maxTags={maxSpecialties}
                  linkable={false}
                  className="text-xs"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Default layout (vertical, centered)
        <div className="p-6">
          {/* Author Image */}
          {author.image && (
            <div className="flex justify-center mb-4">
              <img
                src={author.image}
                alt={author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
              />
            </div>
          )}
          
          {/* Author Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {author.name}
            </h2>
            <p className="text-blue-600 font-medium mb-3">
              {author.title}
            </p>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
              {author.bio}
            </p>
            {showArticleCount && author.articleCount !== undefined && (
              <p className="text-sm text-blue-600 font-medium mt-3">
                {author.articleCount} article{author.articleCount !== 1 ? 's' : ''}
              </p>
            )}
            {showSpecialties && author.specialties && author.specialties.length > 0 && (
              <div className="mt-3">
                <SmartTagList 
                  tags={author.specialties} 
                  maxTags={maxSpecialties}
                  linkable={false}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
}
