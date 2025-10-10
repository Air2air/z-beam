// app/components/Hero/Hero.tsx
'use client';

import './styles.css';
import { useState, useEffect, useRef } from 'react';
import { HeroProps } from '@/types';
import Image from 'next/image';
import { SITE_CONFIG } from '@/app/utils/constants';

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
  const [isInView, setIsInView] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const themeClass = `theme-${theme}`;
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
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
  
  // Responsive classes with 16:9 aspect ratio
  const containerClasses = variant === 'fullwidth' 
    ? `w-full max-w-full aspect-[16/9] relative overflow-hidden bg-gray-900 ${themeClass}`
    : `hero-section aspect-[16/9] bg-gray-900 ${themeClass}`;

  const backgroundClasses = variant === 'fullwidth'
    ? "absolute inset-0 w-full h-full"
    : "hero-background";

  const videoClasses = variant === 'fullwidth'
    ? "w-full h-full object-cover"
    : "hero-video";

  const contentClasses = variant === 'fullwidth'
    ? "relative z-10 flex items-center justify-center h-full bg-black bg-opacity-30"
    : "hero-content";

  return (
    <section 
      ref={heroRef}
      className={containerClasses}
      aria-label={getSectionAriaLabel()}
      role={variant === 'fullwidth' ? 'banner' : 'region'}
    >
      {/* Video Background */}
      {videoUrl ? (
        <div className={`${backgroundClasses} bg-gray-800`}>
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
            loading="lazy"
          />
        </div>
      ) : imageSource && isInView ? (
        /* Image Background - Next.js Image handles preloading, errors, loading states */
        <div className={backgroundClasses}>
          <Image
            src={imageSource}
            alt={getAccessibleAlt()}
            fill
            className="object-cover"
            style={{ zIndex: 1 }}
            priority={variant === 'fullwidth'}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            onLoad={() => setImageLoaded(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
          />
        </div>
      ) : imageSource && !isInView ? (
        /* Placeholder while not in view */
        <div className={`${backgroundClasses} bg-gray-800 animate-pulse`} aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700"></div>
        </div>
      ) : (
        /* Default fallback */
        <div 
          className={`${backgroundClasses} flex items-center justify-center bg-gray-600`}
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

      {/* Custom homepage overlay - left side, 42% width, gray-900 background at 50% opacity, text at 100% */}
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
            className="absolute inset-0 bg-gray-900"
            style={{ 
              backgroundColor: 'rgb(17, 24, 39)', // gray-900
              opacity: 0.5
            }}
            aria-hidden="true"
          />
          
          {/* Text content at full opacity */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            <p className="text-white font-bold w-full text-center uppercase" style={{ fontSize: 'clamp(0.5rem, 11cqw, 12rem)' }}>
              THE BAY AREA IS
            </p>
            <div className="text-white font-light w-full text-center py-2" style={{ fontSize: 'clamp(3rem, 30cqw, 40rem)', lineHeight: '0.8' }}>
              LASER
            </div>
            <div className="text-white font-light w-full text-center py-2" style={{ fontSize: 'clamp(3rem, 30cqw, 40rem)', lineHeight: '0.8' }}>
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

    </section>
  );
}
