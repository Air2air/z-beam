// app/components/Author/Author.tsx
import Image from "next/image";
import Link from "next/link";
import { AuthorProps } from "@/types";
import { SITE_CONFIG } from "../../utils/constants";
import { Calendar, Clock } from "lucide-react";
import { formatDate, getRelativeTime } from "../../utils/dateFormatting";

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
    ? (authorInfo?.expertise || []).join(', ') 
    : authorInfo?.expertise || '';

  // Generate URL-encoded author name for search (null-safe)
  const encodedAuthorName = authorInfo ? encodeURIComponent(authorName) : '';
  
  // Check if we have date information to display
  // Support both lastModified (type definition) and dateModified (YAML field)
  const modifiedDate = (frontmatter as any)?.dateModified || frontmatter?.lastModified;
  const hasDateInfo = frontmatter?.datePublished || modifiedDate;

  return (
    <Link
      href={`/search?q=${encodedAuthorName}`}
      className={`block rounded-lg px-4 py-3 bg-primary hover:bg-primary-hover transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0 text-muted group-hover:text-blue-400 transition-colors">
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-primary">
                <b>{authorName}</b>
                {showCredentials && credentials && (
                  <span className="ml-1 text-secondary">
                    {credentials}
                  </span>
                )}
              </span>
              {showCountry && country && (
                <span className="text-tertiary">
                  {country}
                </span>
              )}
            </div>

            {showSpecialties && field && (
              <div className="text-sm text-tertiary mt-1">
                {field}
              </div>
            )}
          </div>
        </div>

        {/* Date panel on right */}
        {hasDateInfo && (
          <div className="flex flex-col gap-2 text-xs text-muted bg-primary rounded px-3 py-2 flex-shrink-0">
            {frontmatter?.datePublished && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5" />
                <div>
                  <div className="text-muted text-[10px] uppercase tracking-wide">Published</div>
                  <div className="font-medium">{formatDate(frontmatter.datePublished)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
