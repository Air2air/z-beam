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
      className="group block rounded-lg shadow-sm hover:shadow-md
                 transition-all duration-300 overflow-hidden
                 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <article className="flex flex-col h-full">
        {/* Image Section - REDUCED HEIGHT from h-32 to h-24 */}
        <div className="relative w-full h-24 overflow-hidden">
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

        {/* Content Section - REDUCED PADDING from p-2 sm:p-3 to p-1.5 sm:p-2 */}
        <div className="p-1.5 sm:p-2 flex flex-col flex-grow">
          {(nameShort || chemicalSymbol) && (
            <div className="flex justify-between items-center mb-0.5">
              {nameShort && (
                // REDUCED TEXT SIZE from text-lg to text-base
                <h3 className="text-base text-gray-600 dark:text-gray-300 font-medium leading-tight">
                  {nameShort}
                </h3>
              )}
              {chemicalSymbol && <BadgeSymbol text={`${chemicalSymbol}`}  />}
            </div>
          )}

          {/* REDUCED TEXT SIZE from text-base to text-sm and line-clamp from 2 to 1 */}
          <p
            className="text-sm text-gray-700 dark:text-gray-300 flex-grow
                       line-clamp-1 leading-tight"
          >
            {description}
          </p>
        </div>
      </article>
    </Link>
  );
}
