// app/components/Author/Author.tsx
import Image from "next/image";
import Link from "next/link";
import { AuthorProps } from "@/types";
import { SITE_CONFIG } from "@/app/config/site";
import { DatePanel } from "../DatePanel/DatePanel";

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
  const expertise = (authorInfo as any)?.expertise || (authorInfo as any)?.expertiseAreas;
  const field = Array.isArray(expertise) 
    ? expertise.join(', ') 
    : expertise || '';

  // Generate URL-encoded author name for search (null-safe)
  const encodedAuthorName = authorInfo ? encodeURIComponent(authorName) : '';

  return (
    <Link
      href={`/search?q=${encodedAuthorName}`}
      className={`block rounded-md px-4 py-3 bg-primary hover:bg-primary-hover transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0 text-muted transition-colors">
          {showAvatar && authorImage && (
            <Image
              src={authorImage}
              alt={authorName}
              width={60}
              height={60}
              sizes="60px"
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
                <span className="text-secondary">
                  {country}
                </span>
              )}
            </div>

            {showSpecialties && field && (
              <i className="text-sm text-secondary mt-1">
                {field}
              </i>
            )}
          </div>
        </div>

        <DatePanel datePublished={frontmatter?.datePublished} />
      </div>
    </Link>
  );
}
