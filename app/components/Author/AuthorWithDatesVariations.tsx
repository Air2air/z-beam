/**
 * @component AuthorWithDatesVariations
 * @purpose Demo component showing 3 design variations for integrating dates into author info
 * @usage Temporary component for design review - displays all 3 variations
 */
import Image from "next/image";
import Link from "next/link";
import { AuthorProps } from "@/types";
import { SITE_CONFIG } from "../../utils/constants";
import { Calendar, Clock, User } from "lucide-react";
import { formatDate, getRelativeTime } from "../../utils/dateFormatting";

interface DateInfo {
  datePublished?: string;
  lastModified?: string;
}

/**
 * VARIATION 1: Compact Inline Dates
 * - Dates on the same line as author name
 * - Minimal, space-efficient
 * - Uses subtle icons and separators
 */
function AuthorVariation1({ 
  frontmatter,
  showAvatar = true,
  showCredentials = true,
  showCountry = true,
  showSpecialties = true,
}: AuthorProps & DateInfo) {
  const authorInfo = frontmatter?.author && typeof frontmatter.author === 'object' ? frontmatter.author : null;
  const authorString = typeof frontmatter?.author === 'string' ? frontmatter.author : null;
  const authorName = authorInfo?.name || authorString || SITE_CONFIG.author;
  const authorImage = authorInfo?.image || '';
  const credentials = authorInfo?.title || '';
  const country = authorInfo?.country || '';
  const field = Array.isArray(authorInfo?.expertise) 
    ? authorInfo.expertise.join(', ') 
    : authorInfo?.expertise || '';
  const encodedAuthorName = encodeURIComponent(authorName);

  return (
    <div className="rounded-lg px-4 py-3 bg-gray-800/30 dark:bg-gray-800/50">
      <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-3 flex-wrap">
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
            
            {/* Dates inline */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {frontmatter?.datePublished && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(frontmatter.datePublished)}
                  </span>
                </>
              )}
              {frontmatter?.lastModified && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(frontmatter.lastModified)}
                  </span>
                </>
              )}
            </div>
          </div>

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
    </div>
  );
}

/**
 * VARIATION 2: Right-Aligned Date Panel
 * - Author info on left, dates in a panel on right
 * - Clear visual separation
 * - Works well on wider screens
 */
function AuthorVariation2({ 
  frontmatter,
  showAvatar = true,
  showCredentials = true,
  showCountry = true,
  showSpecialties = true,
}: AuthorProps & DateInfo) {
  const authorInfo = frontmatter?.author && typeof frontmatter.author === 'object' ? frontmatter.author : null;
  const authorString = typeof frontmatter?.author === 'string' ? frontmatter.author : null;
  const authorName = authorInfo?.name || authorString || SITE_CONFIG.author;
  const authorImage = authorInfo?.image || '';
  const credentials = authorInfo?.title || '';
  const country = authorInfo?.country || '';
  const field = Array.isArray(authorInfo?.expertise) 
    ? authorInfo.expertise.join(', ') 
    : authorInfo?.expertise || '';
  const encodedAuthorName = encodeURIComponent(authorName);

  return (
    <div className="rounded-lg px-4 py-3 bg-gray-800/30 dark:bg-gray-800/50">
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
          {frontmatter?.lastModified && (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5" />
              <div>
                <div className="text-gray-500 dark:text-gray-500 text-[10px] uppercase tracking-wide">Updated</div>
                <div className="font-medium">{getRelativeTime(frontmatter.lastModified)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * VARIATION 3: Stacked with Bottom Date Bar
 * - Author info on top
 * - Dates in a horizontal bar below
 * - Clean separation with border
 * - Good for narrow viewports
 */
function AuthorVariation3({ 
  frontmatter,
  showAvatar = true,
  showCredentials = true,
  showCountry = true,
  showSpecialties = true,
}: AuthorProps & DateInfo) {
  const authorInfo = frontmatter?.author && typeof frontmatter.author === 'object' ? frontmatter.author : null;
  const authorString = typeof frontmatter?.author === 'string' ? frontmatter.author : null;
  const authorName = authorInfo?.name || authorString || SITE_CONFIG.author;
  const authorImage = authorInfo?.image || '';
  const credentials = authorInfo?.title || '';
  const country = authorInfo?.country || '';
  const field = Array.isArray(authorInfo?.expertise) 
    ? authorInfo.expertise.join(', ') 
    : authorInfo?.expertise || '';
  const encodedAuthorName = encodeURIComponent(authorName);

  return (
    <div className="rounded-lg overflow-hidden bg-gray-800/30 dark:bg-gray-800/50">
      {/* Author section */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
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
      </div>

      {/* Date bar at bottom */}
      {(frontmatter?.datePublished || frontmatter?.lastModified) && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 px-4 py-2">
          <div className="flex items-center justify-between gap-4 text-xs text-gray-600 dark:text-gray-400">
            {frontmatter?.datePublished && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-gray-500 dark:text-gray-500">Published:</span>
                <span className="font-medium">{formatDate(frontmatter.datePublished)}</span>
              </div>
            )}
            {frontmatter?.lastModified && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-gray-500 dark:text-gray-500">Updated:</span>
                <span className="font-medium">{getRelativeTime(frontmatter.lastModified)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main component that renders all 3 variations for comparison
 */
export function AuthorWithDatesVariations(props: AuthorProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Variation 1: Compact Inline
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Dates appear inline with author name. Most compact, works well on all screen sizes.
        </p>
        <AuthorVariation1 {...props} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Variation 2: Right-Aligned Panel
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Dates in a dedicated panel on the right. Clear visual hierarchy, best on wider screens.
        </p>
        <AuthorVariation2 {...props} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Variation 3: Bottom Date Bar
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Author info on top, dates in a separate bar below. Clean separation, mobile-friendly.
        </p>
        <AuthorVariation3 {...props} />
      </div>
    </div>
  );
}
