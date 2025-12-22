/**
 * @component SectionTitle
 * @purpose WCAG 2.1 AAA compliant section title component (h2 level)
 * @dependencies React, Next.js Image, Next.js Link
 * @aiContext Standardized section title component for consistent h2 heading styling
 *           Provides responsive sizing, optional subtitle, thumbnail with fallback,
 *           clickable thumbnail linking to material pages, and accessibility features
 * 
 * @usage
 * <SectionTitle title="Our Services" />
 * <SectionTitle title="Featured Materials" subtitle="Explore our material categories" />
 * <SectionTitle title="Aluminum Settings" thumbnail="/images/materials/aluminum-hero.webp" />
 * <SectionTitle title="FAQs" icon={<HelpCircleIcon />} />
 * <SectionTitle title="Safety" description="Important safety considerations for laser cleaning" />
 * <SectionTitle 
 *   title="Machine Settings" 
 *   thumbnail="/images/material/aluminum-hero.jpg"
 *   thumbnailLink="/materials/metal/aluminum-laser-cleaning"
 * />
 * 
 * @props
 * - title: string (required) - Main section title text
 * - subtitle?: string - Displayed below title in smaller text
 * - description?: string - Displayed below subtitle in body text color (text-primary)
 * - icon?: React.ReactNode - Icon displayed before title
 * - thumbnail?: string - Image URL for thumbnail (shows fallback logo if not provided)
 * - thumbnailAlt?: string - Alt text for thumbnail image
 * - thumbnailLink?: string - URL to navigate when thumbnail clicked (e.g., material page)
 * - alignment?: 'left' | 'center' | 'right' - Text alignment (default: left)
 * - className?: string - Additional CSS classes
 * - id?: string - Custom ID for anchor linking (auto-generated from title if not provided)
 * 
 * @accessibility
 * - Semantic HTML: Uses h2 element for section headings
 * - ARIA: Optional aria-label support for enhanced descriptions
 * - Screen readers: Subtitle rendered with role="doc-subtitle"
 * - Keyboard: Focusable thumbnail link with keyboard navigation support
 * - Visual: High contrast colors meeting WCAG AAA standards
 * - Images: Decorative thumbnails marked with aria-hidden when not linked
 * - Links: Thumbnail links have descriptive aria-label for screen readers
 * 
 * @styling
 * - Responsive: text-2xl (mobile) to text-3xl (desktop)
 * - Theme-aware: Adapts to dark/light mode
 * - Consistent spacing: mb-6 for section spacing
 * - Thumbnail: 96x56px rounded image on right side with shadow
 * - Fallback: Shows Z-Beam logo at 50% opacity when thumbnail unavailable
 * - Hover: Thumbnail scales up on hover when linked
 * - Description: Uses text-primary (body text color) for readability
 */
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface SectionTitleProps {
  /** The main section title text (required) */
  title: string;
  
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  
  /** Text alignment (default: left) */
  alignment?: 'left' | 'center' | 'right';
  
  /** Optional ARIA label for enhanced accessibility */
  'aria-label'?: string;
  
  /** Optional ARIA described-by reference */
  'aria-describedby'?: string;
  
  /** Optional CSS class name for additional styling */
  className?: string;
  
  /** Optional ID for anchor linking */
  id?: string;
  
  /** Optional thumbnail image URL (typically hero image) */
  thumbnail?: string;
  
  /** Optional alt text for thumbnail (defaults to decorative) */
  thumbnailAlt?: string;
  
  /** Optional icon to display before the title */
  icon?: React.ReactNode;
  
  /** Optional description text displayed below title/subtitle */
  description?: string;
  
  /** Optional link URL for thumbnail (links to material page) */
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
  
  // Alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Generate ID from title if not provided
  const headingId = id || `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  const subtitleId = subtitle ? `${headingId}-subtitle` : undefined;
  
  // Show fallback logo if no thumbnail or image failed to load
  const showFallback = !thumbnail || imageError;

  // Thumbnail content - always render, with fallback
  const thumbnailContent = (
    <div 
      className={`flex-shrink-0 w-24 h-14 rounded overflow-hidden shadow-md transition-transform duration-200 ${thumbnailLink ? 'cursor-pointer group-hover:scale-105' : ''}`}
    >
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
            className="object-contain text-orange-500"
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
          className="mb-0 flex items-center gap-2"
          aria-label={ariaLabel}
          aria-describedby={subtitleId || ariaDescribedby}
        >
          {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        
        {subtitle && (
          <p
            id={subtitleId}
            role="doc-subtitle"
            className={`text-sm text-muted mt-2 ${alignmentClasses[alignment]}`}
          >
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className={`text-base text-primary mt-2 ${alignmentClasses[alignment]}`}>
            {description}
          </p>
        )}
      </div>
      
      {thumbnailLink ? (
        <Link 
          href={thumbnailLink} 
          className="group flex-shrink-0"
          aria-label={`View ${thumbnailAlt || 'material'} page`}
        >
          {thumbnailContent}
        </Link>
      ) : (
        <div aria-hidden="true">
          {thumbnailContent}
        </div>
      )}
    </div>
  );
}

export default SectionTitle;
