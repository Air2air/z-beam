// app/components/Author/Author.tsx
import Image from 'next/image';

export interface AuthorData {
  author_name: string;
  credentials?: string;
  author_country?: string;
  avatar?: string;
}

export interface AuthorProps {
  author: AuthorData;
  showAvatar?: boolean;
  showCredentials?: boolean;
  showCountry?: boolean;
  className?: string;
}

export function Author({
  author,
  showAvatar = false,
  showCredentials = true,
  showCountry = true,
  className = '',
}: AuthorProps) {
  // Return null if no author information
  if (!author?.author_name) return null;
  
  return (
    <div className={`author-component flex items-center ${className}`}>
      {showAvatar && author.avatar && (
        <div className="author-avatar mr-3">
          <Image 
            src={author.avatar} 
            alt={author.author_name}
            width={40} 
            height={40} 
            className="rounded-full"
          />
        </div>
      )}
      
      <div className="author-info">
        <span className="author-name font-medium text-gray-900 dark:text-white">
          {author.author_name}
        </span>
        
        {showCredentials && author.credentials && (
          <p className="author-credentials text-sm text-gray-600 dark:text-gray-400">
            {author.credentials}
          </p>
        )}
        
        {showCountry && author.author_country && (
          <p className="author-country text-xs text-gray-500 dark:text-gray-500">
            {author.author_country}
          </p>
        )}
      </div>
    </div>
  );
}