// app/components/Author/Author.tsx
import Image from "next/image";
import Link from "next/link";
import { AuthorProps } from "@/types";
import { SITE_CONFIG } from "../../utils/constants";
import { Calendar, Clock } from "lucide-react";

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function getRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

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
  
  // Check if we have date information to display
  // Support both lastModified (type definition) and dateModified (YAML field)
  const modifiedDate = (frontmatter as any)?.dateModified || frontmatter?.lastModified;
  const hasDateInfo = frontmatter?.datePublished || modifiedDate;

  return (
    <div className={`rounded-lg px-4 py-3 bg-gray-800/30 dark:bg-gray-800/50 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
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
            <Link
              href={`/search?q=${encodedAuthorName}`}
              className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {authorName}
              {showCredentials && credentials && (
                <span className="ml-1 text-gray-600 dark:text-gray-400">
                  {credentials}
                </span>
              )}
            </Link>

            {showSpecialties && field && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {field}
              </div>
            )}

            {showCountry && country && (
              <div className="text-sm text-gray-500 mt-0.5">
                {country}
              </div>
            )}
          </div>
        </div>

        {/* Date panel on right */}
        {hasDateInfo && (
          <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded px-3 py-2 flex-shrink-0">
            {frontmatter?.datePublished && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5" />
                <div>
                  <div className="text-gray-500 dark:text-gray-500 text-[10px] uppercase tracking-wide">Published</div>
                  <div className="font-medium">{formatDate(frontmatter.datePublished)}</div>
                </div>
              </div>
            )}
            {modifiedDate && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" />
                <div>
                  <div className="text-gray-500 dark:text-gray-500 text-[10px] uppercase tracking-wide">Updated</div>
                  <div className="font-medium">{getRelativeTime(modifiedDate)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
