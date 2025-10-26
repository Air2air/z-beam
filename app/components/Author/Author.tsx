// app/components/Author/Author.tsx
import Image from "next/image";
import Link from "next/link";
import { AuthorProps } from "@/types";
import { SITE_CONFIG } from "../../utils/constants";

export function Author({
  frontmatter,
  showAvatar = true,
  showCredentials = true,
  showCountry = true,
  showSpecialties = true,
  className = "",
}: AuthorProps) {
  // Get author data from frontmatter - check for object types first, fall back to string
  const authorInfo = frontmatter?.author && typeof frontmatter.author === 'object' ? frontmatter.author : null;
  const authorString = typeof frontmatter?.author === 'string' ? frontmatter.author : null;
  
  // Use object data if available, otherwise fall back to string or defaults
  const authorName = authorInfo?.name || authorString || SITE_CONFIG.author;
  const authorImage = authorInfo?.image || '';
  const credentials = authorInfo?.title || '';
  const country = authorInfo?.country || '';
  const field = Array.isArray(authorInfo?.expertise) 
    ? authorInfo.expertise.join(', ') 
    : authorInfo?.expertise || '';

  // Generate URL-encoded author name for search
  const encodedAuthorName = encodeURIComponent(authorName);

  return (
    <Link
      href={`/search?q=${encodedAuthorName}`}
      className={`flex items-center gap-4 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}
    >
      {showAvatar && authorImage && (
        <Image
          src={authorImage}
          alt={authorName}
          width={60}
          height={60}
          className="rounded-full flex-shrink-0"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="text-gray-900 dark:text-white">
          {authorName}
          {showCredentials && credentials && (
            <span className="ml-1 text-gray-600 dark:text-gray-400">
              {credentials}
            </span>
          )}
        </div>

        {showSpecialties && field && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {field}
          </div>
        )}

        {showCountry && country && (
          <div className="text-sm text-gray-500">
            {country}
          </div>
        )}
      </div>
    </Link>
  );
}
