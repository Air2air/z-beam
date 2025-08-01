// app/components/Card/Card.tsx
"use client";

import './styles.scss';
import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { OptimizedImage } from "../UI/OptimizedImage";
import { BadgeSymbol } from "../BadgeSymbol/BadgeSymbol";
import { Tags } from "../Tags/Tags";

export interface CardProps {
  href: string;
  title: string;
  description?: string;
  image?: string;
  imageUrl?: string; // Support both image and imageUrl
  imageAlt?: string;
  variant?: 'default' | 'featured' | 'compact'; // Reduced variants
  tags?: string[];
  badge?: {
    text: string;
    color?: string;
  };
  showBadge?: boolean;
  metadata?: {
    category?: string;
    articleType?: string;
    date?: string;
    chemicalSymbol?: string;
    atomicNumber?: number;
    tags?: string[];
  };
  className?: string;
}

export function Card({
  href,
  title,
  description,
  image,
  imageUrl, // Support both image and imageUrl
  imageAlt,
  variant = 'default',
  tags = [],
  badge,
  showBadge = false,
  metadata,
  className = ''
}: CardProps) {
  // Use either image or imageUrl
  const [imgSrc, setImgSrc] = useState<string | undefined>(image || imageUrl);
  const [imgError, setImgError] = useState(false);

  // Handle image error
  const handleImageError = () => {
    console.log("Image failed to load, using fallback");
    setImgSrc("/images/Site/Logo/logo_.png");
    setImgError(true);
  };

  // Simplified variant configuration
  const config = {
    default: {
      imageHeight: 'h-48',
      padding: 'p-4',
      titleClass: 'text-lg font-semibold',
      descClass: 'line-clamp-2'
    },
    featured: {
      imageHeight: 'h-64',
      padding: 'p-6',
      titleClass: 'text-xl font-bold',
      descClass: 'line-clamp-3'
    },
    compact: {
      imageHeight: 'h-32',
      padding: 'p-3',
      titleClass: 'text-base font-medium',
      descClass: 'line-clamp-1'
    }
  }[variant];

  // Combine all tags including badge if showBadge is true
  const allTags = [
    ...(tags || []),
    ...(metadata?.tags || []),
    ...(showBadge && badge?.text ? [badge.text] : [])
  ];
  
  // Format tags for the Tags component
  const tagsContent = allTags.length > 0 
    ? `<ul>${allTags.map(tag => `<li>${tag}</li>`).join('')}</ul>` 
    : '';
  
  return (
    <Link 
      href={href} 
      className={`group block bg-white rounded-lg shadow-md hover:shadow-xl 
        transition-all duration-300 overflow-hidden border border-gray-100 
        dark:bg-gray-800 dark:border-gray-700 ${className}`}
    >
      <article className="flex flex-col h-full">
        <div className={`relative w-full ${config.imageHeight} overflow-hidden`}>
          {/* Handle image rendering directly instead of using Thumbnail */}
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={imageAlt || title}
              width={800}
              height={450}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              unoptimized={imgError}
            />
          ) : (
            <Image
              src="/images/Site/Logo/logo_.png"
              alt={imageAlt || title}
              width={800}
              height={450}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          )}
          
          {/* Chemical Symbol Badge (if applicable) */}
          {metadata?.chemicalSymbol && (
            <BadgeSymbol 
              chemicalSymbol={metadata.chemicalSymbol}
              atomicNumber={metadata.atomicNumber}
              variant="card"
            />
          )}
        </div>
        
        <div className={`${config.padding} flex-grow flex flex-col`}>
          {/* Tags at top */}
          {tagsContent && (
            <div className="mb-2">
              <Tags 
                content={tagsContent}
                config={{ 
                  className: "my-0"
                }}
              />
            </div>
          )}
          
          {/* Category & article type */}
          {(metadata?.category || metadata?.articleType) && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              {metadata.category && <span className="mr-2">{metadata.category}</span>}
              {metadata.articleType && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {metadata.articleType}
                </span>
              )}
            </div>
          )}
          
          {/* Title */}
          <h3 className={`${config.titleClass} text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors`}>
            {title}
          </h3>
          
          {/* Description */}
          {description && (
            <p className={`${config.descClass} text-gray-600 dark:text-gray-300 text-sm flex-grow`}>
              {description}
            </p>
          )}
          
          {/* Date at bottom */}
          {metadata?.date && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
              <span className="text-xs text-gray-500">{metadata.date}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
