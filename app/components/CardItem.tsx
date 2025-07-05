// app/components/CardItem.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeSymbol } from "./BadgeSymbol";
import type { MaterialCardProps } from 'app/types';

export function CardItem({
  href,
  imageUrl,
  imageAlt,
  title, // Keep title destructured, it's used elsewhere
  description,
  date,
  tags,
  nameShort,
  // --- DESTRUCTURE NEW PROPS ---
  atomicNumber,
  chemicalSymbol,
  materialType,
  metalClass,
  crystalStructure,
  primaryApplication,
}: // --- END DESTRUCTURING ---
MaterialCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-lg shadow-md hover:shadow-xl
                 transition-all duration-300 overflow-hidden
                 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <article className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative w-full h-32 overflow-hidden">
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

        {/* Content Section */}
        <div className="p-2 sm:p-3 flex flex-col flex-grow">
          {(nameShort || chemicalSymbol) && ( // Only show this div if either exists
            <div className="flex justify-between items-center mb-0.5">
              {nameShort && (
                <h3 className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-tight">
                  {nameShort}
                </h3>
              )}
              {chemicalSymbol && <BadgeSymbol text={`${chemicalSymbol}`} />}
            </div>
          )}

          <p
            className="text-gray-700 dark:text-gray-300 text-base flex-grow
                       line-clamp-2 leading-relaxed"
          >
            {description}
          </p>

          {/* {(chemicalSymbol || atomicNumber) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {chemicalSymbol && `Symbol: ${chemicalSymbol}`}
              {chemicalSymbol && atomicNumber && ` • `}
              {atomicNumber && `Atomic No.: ${atomicNumber}`}
            </p>
          )} */}

          {/* Example: Displaying material type and metal class */}
          {/* {(materialType || metalClass) && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {materialType && `Type: ${materialType}`}
              {materialType && metalClass && ` • `}
              {metalClass && `Class: ${metalClass}`}
            </p>
          )} */}

          {/* {tags && tags.length > 0 && (
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
          )} */}
        </div>
      </article>
    </Link>
  );
}
