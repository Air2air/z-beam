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
      className="block rounded-lg px-2 py-0.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      <div className={`author-component mt-2 mb-4 ${className}`}>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-20 pr-4 align-middle">
                {showAvatar && authorImage && (
                  <div className="author-avatar">
                    <Image
                      src={authorImage}
                      alt={authorName}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>
                )}
              </td>
              <td className="align-top">
                <div className="author-info">
                  <div className="author-name font-medium text-gray-900 dark:text-white block">
                    {authorName}
                    {showCredentials && credentials && (
                      <span className="ml-1 author-appellation font-medium text-gray-600 dark:text-gray-400">
                        {credentials}
                      </span>
                    )}
                  </div>

                  {showSpecialties && field && (
                    <div className="author-field text-md text-gray-600 dark:text-gray-400">
                      {field}
                    </div>
                  )}

                  {showCountry && country && (
                    <div className="author-country text-sm text-gray-500 dark:text-gray-500">
                      {country}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Link>
  );
}
