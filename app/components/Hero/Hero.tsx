// app/components/Hero/Hero.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroProps } from '@/types';
import Image from 'next/image';
import { SITE_CONFIG } from '@/app/config';
import LazyYouTube from '@/app/components/LazyYouTube/LazyYouTube';

/**
 * SIMPLIFIED Hero Component
 * 
 * Reductions from original (311 lines):
 * - Removed duplicate image preloading (Next.js Image handles this)
 * - Reduced state from 6 variables to 2 (imageLoaded, isInView)
 * - Simplified video/image source resolution
 * - Removed redundant URL encoding (modern browsers handle this)
 * - Removed complex error states (Next.js Image handles errors)
 * - Removed loading indicators (trust Next.js Image component)
 * 
 * Result: ~160 lines (48% reduction)
 */
export function Hero({ 
  frontmatter,
  children,
  theme = 'dark',
  variant = 'default',
  className: _className = '',
  customOverlay = false,
}: HeroProps) {
  // Minimal state - only what's essential
  const [_imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [_isInView, _setIsInView] = useState(true); // Hero is above-fold, always visible
  const [_videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  );
  const heroRef = useRef<HTMLDivElement>(null);

  // Detect mobile device - deferred to not block LCP
  useEffect(() => {
    // Use requestIdleCallback to defer non-critical work
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(checkMobile);
    } else {
      setTimeout(checkMobile, 1);
    }
    
    const handleResize = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(checkMobile);
      } else {
        setTimeout(checkMobile, 1);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const themeClass = `theme-${theme}`;
  
  // Remove Intersection Observer - Hero is always above fold, should load immediately
  // This reduces JavaScript execution before LCP
  
  // Get video ID from frontmatter - support both string and object formats
  const videoId = typeof frontmatter?.video === 'string' 
    ? frontmatter.video 
    : frontmatter?.video?.id;
  
  // Get image source from frontmatter - support both string and object formats
  const imageSource = typeof frontmatter?.images === 'string'
    ? frontmatter.images
    : (frontmatter?.image || frontmatter?.images?.hero?.url);
  
  // Simplified accessibility text generation - only from frontmatter
  const getAccessibleAlt = (): string => {
    return frontmatter?.images?.hero?.alt || 
           (frontmatter?.title ? `Hero image for ${frontmatter.title}` : 'Hero background image');
  };

  const getSectionAriaLabel = (): string => {
    return frontmatter?.title ? `Hero section for ${frontmatter.title}` : "Hero section";
  };

  const getVideoAriaLabel = (): string => {
    return frontmatter?.title ? `Video content for ${frontmatter.title}` : "Video content";
  };
  
  // Responsive classes with 16:9 aspect ratio - always use constrained width for consistency
  // Container classes for responsive layout
  const containerClasses = `container-hero`;
  
  // If no video and no image (or image failed to load), show shortened empty hero
  const hasContent = videoId || (imageSource && !imageError);
  const aspectRatioClasses = hasContent 
    ? "relative w-full" + (variant === 'fullwidth' ? "" : " aspect-video overflow-hidden rounded-md")
    : "relative w-full h-16"; // Shortened empty hero
  const backgroundClasses = "absolute top-0 left-0 w-full h-full bg-center bg-cover bg-no-repeat overflow-hidden";
  const videoClasses = "absolute top-0 left-0 w-full h-full object-cover z-[1]";
  const contentClasses = variant === 'fullwidth'
    ? "relative z-10 p-8 w-full h-full flex flex-col justify-center bg-black bg-opacity-30"
    : "relative z-[2] p-8 w-full h-full flex flex-col justify-center";

  return (
    <section
      ref={heroRef}
      className={`${themeClass} ${containerClasses} ${aspectRatioClasses}`}
      aria-label={getSectionAriaLabel()}
      role={variant === 'fullwidth' ? 'banner' : 'region'}
    >
      {/* Video Background - Lazy loaded with facade on mobile */}
      {videoId ? (
        <div className={`${backgroundClasses} bg-primary`}>
          <LazyYouTube
            videoId={videoId}
            title={getVideoAriaLabel()}
            posterSrc={imageSource}
            showFacade={isMobile}
            autoplay={!isMobile}
            onLoad={() => setVideoLoaded(true)}
            className="w-full h-full"
          />
        </div>
      ) : imageSource && !imageError ? (
        /* Image Background - Next.js Image handles preloading, errors, loading states */
        <div 
          className={backgroundClasses}
          itemScope
          itemType="https://schema.org/ImageObject"
        >
          <meta itemProp="contentUrl" content={imageSource} />
          <meta itemProp="url" content={imageSource} />
          <meta itemProp="description" content={getAccessibleAlt()} />
          <meta itemProp="author" content={typeof frontmatter?.author === 'string' ? frontmatter.author : (frontmatter?.author?.name || SITE_CONFIG.author)} />
          <meta itemProp="encodingFormat" content="image/jpeg" />
          {frontmatter?.datePublished && (
            <meta itemProp="uploadDate" content={typeof frontmatter.datePublished === 'string' && frontmatter.datePublished.includes('T') ? frontmatter.datePublished : `${frontmatter.datePublished}T00:00:00Z`} />
          )}
          
          <Image
            src={imageSource}
            alt={getAccessibleAlt()}
            fill
            className="object-cover"
            style={{ zIndex: 1 }}
            priority
            fetchPriority="high"
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
            itemProp="thumbnail"
          />
        </div>
      ) : null}

      {/* Custom homepage overlay - left side, 42% width, gray-700 background at 50% opacity, text at 100% */}
      {customOverlay && (
        <div 
          className="absolute left-0 top-0 h-full w-[42%] flex flex-col items-center justify-center"
          style={{ 
            zIndex: 2,
            containerType: 'inline-size'
          }}
        >
          {/* Background layer with reduced opacity */}
          <div 
            className="absolute inset-0 bg-primary"
            style={{ 
              backgroundColor: 'rgb(15, 23, 42)', // slate-900
              opacity: 0.5
            }}
            aria-hidden="true"
          />
          
          {/* Text content at full opacity */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            <p className="text-primary w-full text-center uppercase font-medium pb-2" style={{ fontSize: 'clamp(0.42rem, 9.2cqw, 10rem)', lineHeight: '0.9', letterSpacing: '-0.02em' }}>
              California is
            </p>
            <div className="text-primary w-full text-center py-2" style={{ fontSize: 'clamp(2.79rem, 27.9cqw, 37.2rem)', lineHeight: '0.7', letterSpacing: '-0.03em' }}>
              Laser
            </div>
            <div className="text-primary w-full text-center py-2" style={{ fontSize: 'clamp(2.79rem, 27.9cqw, 37.2rem)', lineHeight: '0.7', letterSpacing: '-0.03em' }}>
              clean.
            </div>
          </div>
        </div>
      )}

      {/* Content overlay */}
      {children && (
        <div className={contentClasses} style={{ zIndex: 3 }}>
          {children}
        </div>
      )}
    </section>
  );
}
