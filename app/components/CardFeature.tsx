// app/components/CardFeature.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { SmartTagList } from './SmartTagList';
import type { BaseCardProps } from 'app/types';

export function CardFeature({
  href,
  imageUrl,
  imageAlt,
  title,
  description,
  date,
  tags,
}: BaseCardProps) {
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
            <SmartTagList 
              tags={tags}
              className="mt-2"
              linkable={false}
              maxTags={3}
            />
          )}
        </div>
      </article>
    </Link>
  );
}