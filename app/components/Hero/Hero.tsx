// app/components/Hero/Hero.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroProps } from '@/types';
import Image from 'next/image';
import { SITE_CONFIG } from '@/app/config';

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
  className = '',
  customOverlay = false,
}: HeroProps) {
  // Minimal state - only what's essential
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(true); // Hero is above-fold, always visible
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
  
  // Get video ID from frontmatter
  const videoId = frontmatter?.video;
  
  // Get image source from frontmatter
  const imageSource = frontmatter?.images?.hero?.url || frontmatter?.image;

  // Build YouTube URL with maximum branding removal
  const buildYouTubeUrl = (id: string) => {
    const params = new URLSearchParams({
      ...SITE_CONFIG.media.youtube.defaultParams,
      playlist: id, // Required for looping
    });
    return `${SITE_CONFIG.media.youtube.baseUrl}${id}?${params.toString()}`;
  };

  const videoUrl = videoId ? buildYouTubeUrl(videoId) : null;
  
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
  const containerClasses = `mx-auto max-w-5xl px-4 sm:px-6`;
  const aspectRatioClasses = "relative w-full" + (variant === 'fullwidth' ? "" : " aspect-video overflow-hidden rounded-lg");
  const backgroundClasses = "absolute top-0 left-0 w-full h-full bg-center bg-cover bg-no-repeat overflow-hidden";
  const videoClasses = "absolute top-0 left-0 w-full h-full min-w-full min-h-full object-cover z-[1]";
  const contentClasses = variant === 'fullwidth'
    ? "relative z-10 p-8 w-full h-full flex flex-col justify-center bg-black bg-opacity-30"
    : "relative z-[2] p-8 w-full h-full flex flex-col justify-center";

  return (
    <section 
      className={containerClasses}
      aria-label={getSectionAriaLabel()}
      role={variant === 'fullwidth' ? 'banner' : 'region'}
    >
      <div ref={heroRef} className={aspectRatioClasses}>
      {/* Video Background - Facade pattern on mobile only */}
      {videoUrl ? (
        <>
          {isMobile && !videoLoaded ? (
            /* YouTube Facade - Poster image with play button */
            <div 
              className={`${backgroundClasses} bg-gray-700 cursor-pointer group`}
              onClick={() => setVideoLoaded(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setVideoLoaded(true)}
              aria-label="Load and play video"
            >
              {/* YouTube thumbnail as poster */}
              <Image
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={getAccessibleAlt()}
                fill
                className="object-cover"
                priority
                fetchPriority="high"
                quality={85}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              {/* Dark overlay - lower z-index */}
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-opacity z-10" />
              {/* Play button - higher z-index to appear on top */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* "Click to play" text */}
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm md:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to play video
              </div>
            </div>
          ) : (
            /* Actual YouTube iframe - only loads after user clicks */
            <div className={`${backgroundClasses} bg-gray-700`}>
              <iframe
                src={videoUrl}
                className={videoClasses}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share; accelerometer; gyroscope"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={getVideoAriaLabel()}
                aria-label={`${getVideoAriaLabel()} - Video player`}
              />
            </div>
          )}
        </>
      ) : imageSource ? (
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
            <meta itemProp="uploadDate" content={frontmatter.datePublished} />
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
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
            itemProp="thumbnail"
          />
        </div>
      ) : (
        /* Default fallback */
        <div 
          className={`${backgroundClasses} flex items-center justify-center bg-gray-700`}
          aria-label="Default hero background with logo"
        >
          <Image
            src={SITE_CONFIG.media.logo.default}
            alt={`${SITE_CONFIG.shortName} company logo`}
            width={SITE_CONFIG.media.logo.width}
            height={SITE_CONFIG.media.logo.height}
            className="opacity-30 object-contain"
            priority={false}
          />
        </div>
      )}

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
            className="absolute inset-0 bg-gray-700"
            style={{ 
              backgroundColor: 'rgb(15, 23, 42)', // slate-900
              opacity: 0.5
            }}
            aria-hidden="true"
          />
          
          {/* Text content at full opacity */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center font-sans">
            <p className="text-white w-full text-center uppercase font-sans" style={{ fontSize: 'clamp(0.5rem, 11cqw, 12rem)' }}>
              <strong>THE BAY AREA IS</strong>
            </p>
            <div className="text-white w-full text-center py-2 font-sans" style={{ fontSize: 'clamp(3rem, 30cqw, 40rem)', lineHeight: '0.8' }}>
              LASER
            </div>
            <div className="text-white w-full text-center py-2 font-sans" style={{ fontSize: 'clamp(3rem, 30cqw, 40rem)', lineHeight: '0.8' }}>
              CLEAN
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

      </div> {/* Close aspect ratio wrapper */}
    </section>
  );
}
