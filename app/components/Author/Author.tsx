// app/components/Author/Author.tsx
import Image from "next/image";
import Link from "next/link";
import { ArticleMetadata, AuthorProps } from "@/types";

export function Author({
  frontmatter,
  showAvatar = true,
  showCredentials = true,
  showCountry = true,
  showBio = false,
  showEmail = false,
  showLinkedIn = false,
  showSpecialties = true,
  className = "",
}: AuthorProps) {
  // Get author data from frontmatter only
  const author = frontmatter?.authorInfo;
  
  // Return null if no author data provided
  if (!author || !frontmatter) return null;
  
  // Simplified field access - no more dual compatibility
  const authorName = author.name || "";
  const authorImage = author.image || "";
  const credentials = author.title || "";
  const country = author.country || "";
  const field = author.expertise || "";

  // Generate URL-encoded author name for tag search
  const encodedAuthorName = encodeURIComponent(authorName || "");

  // Return null if no author information
  if (!authorName) return null;

  return (
    <Link
      href={`/tag/${encodedAuthorName}`}
      className="block rounded-lg px-4 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
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
                      alt={authorName || "Author"}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>
                )}
              </td>
              <td className="align-top">
                <div className="author-info">
                  {authorName && (
                    <div className="author-name font-medium text-gray-900 dark:text-white block">
                      {authorName}
                      {showCredentials && credentials && (
                        <span className="ml-1 author-appellation font-medium text-gray-600 dark:text-gray-400">
                          {credentials}
                        </span>
                      )}
                    </div>
                  )}

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
