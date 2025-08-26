// app/components/Author/Author.tsx
import Image from "next/image";
import Link from "next/link";
import { AuthorData, AuthorProps } from "@/types/components/author";

export function Author({
  author,
  showAvatar = true,
  showCredentials = true,
  showCountry = true,
  showBio = false,
  showEmail = false,
  showLinkedIn = false,
  showSpecialties = true,
  className = "",
}: AuthorProps) {
  // Helper function to strip HTML tags
  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  // Get author name from either field
  const authorName = stripHtml(author.author_name || author.name || "");

  // Get avatar from either field and strip HTML
  const authorImage = stripHtml(author.avatar || author.image || "");

  // Get other fields and strip HTML
  const credentials = author.credentials ? stripHtml(author.credentials) : "";
  const country = author.author_country ? stripHtml(author.author_country) : "";
  const field = author.specialties?.[0] ? stripHtml(author.specialties[0]) : "";

  // Generate URL-encoded author name for tag search
  const encodedAuthorName = encodeURIComponent(authorName || "");

  // Return null if no author information
  if (!authorName) return null;

  return (
    <Link
      href={`/tag/${encodedAuthorName}`}
      className="block hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-4 py-1 transition-colors duration-200 cursor-pointer"
    >
      <div className={`author-component ${className}`}>
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
                        <span className="ml-1 author-credentials font-medium text-gray-600 dark:text-gray-400">
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
