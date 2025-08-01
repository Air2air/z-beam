// app/components/Author/Author.tsx
import Image from 'next/image';
import Link from 'next/link';

export interface AuthorProps {
  // Support both string and complex object formats
  author: string | {
    author_id?: number;
    author_name: string;
    author_country?: string;
    credentials?: string;
    avatar?: string;
    bio?: string;
    slug?: string;
  };
  showAvatar?: boolean;
  showCredentials?: boolean;
  showCountry?: boolean;
  showBio?: boolean;
  className?: string;
  linkToProfile?: boolean;
}

export function Author({
  author,
  showAvatar = false,
  showCredentials = true,
  showCountry = true,
  showBio = false,
  className = '',
  linkToProfile = false,
}: AuthorProps) {
  // Handle both string and object formats
  const authorName = typeof author === 'string' ? author : author.author_name;
  const authorCredentials = typeof author === 'string' ? '' : author.credentials;
  const authorCountry = typeof author === 'string' ? '' : author.author_country;
  const authorAvatar = typeof author === 'string' ? null : author.avatar;
  const authorBio = typeof author === 'string' ? '' : author.bio;
  const authorSlug = typeof author === 'string' ? null : author.slug;
  
  // Return null if no author information
  if (!authorName) return null;
  
  // Create wrapper component - either Link or div
  const Wrapper = (linkToProfile && authorSlug) ? 
    ({ children }: { children: React.ReactNode }) => 
      <Link href={`/author/${authorSlug}`} className="hover:underline">{children}</Link> : 
    ({ children }: { children: React.ReactNode }) => 
      <div>{children}</div>;
  
  return (
    <div className={`author-component flex items-center ${className}`}>
      {showAvatar && authorAvatar && (
        <div className="author-avatar mr-3">
          <Image 
            src={authorAvatar} 
            alt={authorName}
            width={40} 
            height={40} 
            className="rounded-full"
          />
        </div>
      )}
      
      <div className="author-info">
        <Wrapper>
          <span className="author-name font-medium text-gray-900 dark:text-white">
            {authorName}
          </span>
        </Wrapper>
        
        {showCredentials && authorCredentials && (
          <p className="author-credentials text-sm text-gray-600 dark:text-gray-400">
            {authorCredentials}
          </p>
        )}
        
        {showCountry && authorCountry && (
          <p className="author-country text-xs text-gray-500 dark:text-gray-500">
            {authorCountry}
          </p>
        )}
        
        {showBio && authorBio && (
          <p className="author-bio mt-2 text-sm text-gray-700 dark:text-gray-300">
            {authorBio}
          </p>
        )}
      </div>
    </div>
  );
}