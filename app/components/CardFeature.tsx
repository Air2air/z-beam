// app/components/CardFeature.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';

interface CardFeatureProps {
  /** The URL for the card's link */
  href: string;
  /** The source URL for the image */
  imageUrl: string;
  /** Alt text for the image */
  imageAlt: string;
  /** The main title of the card */
  title: string;
  /** A short description or summary */
  description: string;
  /** Optional date string (e.g., "June 28, 2025") */
  date?: string;
  /** Optional array of tags */
  tags?: string[];
}

export function CardFeature({
  href,
  imageUrl,
  imageAlt,
  title,
  description,
  date,
  tags,
}: CardFeatureProps) {
  return (
    <Link
      href={href}
      className="group block rounded-lg shadow-md hover:shadow-xl
                 transition-all duration-300 overflow-hidden
                 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <article className="flex flex-col h-full">
        {/* Image Section - Changed to a fixed height of h-32 (128px) for significant reduction */}
        <div className="relative w-full h-32 overflow-hidden"> {/* CHANGED: aspect-[2/1] to h-32 */}
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300
                       bg-gray-200 dark:bg-gray-700"
            priority={false}
          />
        </div>

        {/* Content Section - Padding and margins remain reduced from previous step */}
        <div className="p-2 sm:p-3 flex flex-col flex-grow">
          {date && (
            <p className="uppercase text-xs text-gray-500 dark:text-gray-400 mb-1 tabular-nums">
              {date}
            </p>
          )}

          <h4
            className="font-semibold text-gray-900 dark:text-white
                       tracking-tight mb-1
                       group-hover:text-blue-600 dark:group-hover:text-blue-400
                       transition-colors"
          >
            {title}
          </h4>

          <p
            className="text-gray-700 dark:text-gray-300 text-base flex-grow
                       line-clamp-2 leading-relaxed"
          >
            {description}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-blue-100 text-blue-800
                             dark:bg-blue-900 dark:text-blue-200 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}