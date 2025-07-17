// app/components/CardLarge.tsx
"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BaseCardProps } from "app/types";

export const CardLarge = React.memo(function CardLarge({
  href,
  imageUrl,
  imageAlt,
  title,
  description,
}: BaseCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Link
      href={href}
      className="group block rounded-lg shadow-md hover:shadow-xl
                 transition-all duration-300 overflow-hidden
                 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <article className="flex flex-col h-full">
        {/* 
h-28    // 7rem    (112px)
h-30    // 7.5rem  (120px) - not in default Tailwind
h-32    // 8rem    (128px) - current value
h-36    // 9rem    (144px)
h-40    // 10rem   (160px) 
h-44    // 11rem   (176px)
h-48    // 12rem   (192px)
h-52    // 13rem   (208px)
h-56    // 14rem   (224px)
h-60    // 15rem   (240px
// */}
        <div className="relative w-full h-56 overflow-hidden">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt || title || "Image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300
                         bg-gray-200 dark:bg-gray-700"
              priority={false}
              onError={handleImageError}
              // Skip Next.js image optimization for Cloudinary URLs
              loading="lazy"
              unoptimized={imageUrl.startsWith("https://res.cloudinary.com")}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <svg
                className="w-12 h-12 text-gray-400"
                width="48"
                height="48"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M8.5 7a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5.5 5a.5.5 0 01-.5.5h-7a.5.5 0 01-.43-.75l1.5-2.5a.5.5 0 01.86 0l.93 1.55.94-1.57a.5.5 0 01.86 0l2.34 3.9a.5.5 0 01-.43.75z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-2 sm:p-3 flex flex-col flex-grow">
          {title && (
            <h4
              className="font-semibold text-gray-900 dark:text-white
                         tracking-tight mb-1
                         group-hover:text-blue-600 dark:group-hover:text-blue-400
                         transition-colors"
            >
              {title}
            </h4>
          )}

          {description && (
            <p
              className="text-gray-700 dark:text-gray-300 text-base flex-grow
                         line-clamp-2 leading-relaxed"
            >
              {description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
});
