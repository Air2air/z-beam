"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SECTION_HEADER_CLASSES } from '@/app/config/site';

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
  id?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  icon?: React.ReactNode;
  description?: string;
  thumbnailLink?: string;
}

export function SectionTitle({
  title,
  subtitle,
  alignment = 'left',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  className = '',
  id,
  thumbnail,
  thumbnailAlt,
  icon,
  description,
  thumbnailLink,
}: SectionTitleProps) {
  const [imageError, setImageError] = useState(false);
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const headingId = id || `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  const subtitleId = subtitle ? `${headingId}-subtitle` : undefined;
  const showFallback = !thumbnail || imageError;

  const thumbnailContent = (
    <div className={`w-24 h-14 rounded overflow-hidden shadow-md ${thumbnailLink ? 'transition-transform duration-200 group-hover:scale-105' : ''}`}>
      {!showFallback ? (
        <Image
          src={thumbnail!}
          alt={thumbnailAlt || ''}
          width={96}
          height={56}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-tertiary">
          <Image
            src="/images/logo/logo-zbeam.png"
            alt=""
            width={32}
            height={32}
            className="object-contain"
            style={{ filter: 'brightness(0) saturate(100%) invert(53%) sepia(89%) saturate(2476%) hue-rotate(1deg) brightness(103%) contrast(101%)' }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex items-center justify-between gap-4 mb-6 ${className}`}>
      <div className={`flex-1 ${alignmentClasses[alignment]}`}>
        <h2
          id={headingId}
          className={`${SECTION_HEADER_CLASSES.title} flex items-center gap-2`}
          aria-label={ariaLabel}
          aria-describedby={subtitleId || ariaDescribedby}
        >
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        
        {subtitle && (
          <p id={subtitleId} className={`text-sm text-muted mt-2 ${alignmentClasses[alignment]}`}>
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className={`text-base text-primary mt-2 ${alignmentClasses[alignment]}`}>
            {description}
          </p>
        )}
      </div>
      
      {thumbnail && (
        thumbnailLink ? (
          <Link href={thumbnailLink} className="group" aria-label={`View ${thumbnailAlt || 'material'} page`}>
            {thumbnailContent}
          </Link>
        ) : (
          <div aria-hidden="true">{thumbnailContent}</div>
        )
      )}
    </div>
  );
}

export default SectionTitle;
