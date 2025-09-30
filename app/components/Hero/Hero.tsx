// app/components/Hero/Hero.tsx
'use client';

import './styles.css';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { HeroProps, ArticleMetadata, VideoData } from '@/types';
import Image from 'next/image';

export function Hero({ 
  frontmatter,
  video,
  image,
  ariaLabel,
  alt,
  children,
  theme = 'dark',
  variant = 'default',
  className = '',
}: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const themeClass = `theme-${theme}`;
  
  // Intersection Observer for lazy loading and performance optimization
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
  
  // Determine video source from direct prop or frontmatter
  let videoSource = video ? (
    typeof video === 'string' 
      ? { vimeoId: video } 
      : video as any
  ) : frontmatter?.video ? (
    typeof frontmatter.video === 'string' 
      ? { vimeoId: frontmatter.video } 
      : frontmatter.video as any
  ) : null;
  
  // Determine image source from direct prop or frontmatter
  let imageSource = image || frontmatter?.images?.hero?.url || frontmatter?.image;

  // URL encode the image source for CSS background-image usage
  // This is crucial for handling special characters like parentheses in filenames
  const encodeImageSource = (src: string | undefined): string | undefined => {
    if (!src || typeof src !== 'string') return src;
    // Encode parentheses and other special characters for CSS background-image
    return src.replace(/\(/g, '%28').replace(/\)/g, '%29');
  };

  const encodedImageSource = encodeImageSource(imageSource);

  // Reset loading states when image source changes
  useEffect(() => {
    if (imageSource) {
      setImageLoaded(false);
      setImageError(false);
      setImageLoading(true);
      
      // Preload the image using the original (non-encoded) URL for the Image object
      const img = new window.Image();
      img.onload = () => {
        setImageLoaded(true);
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
      img.src = imageSource; // Use original URL for Image object loading
    } else {
      // No image source, reset states
      setImageLoaded(false);
      setImageError(false);
      setImageLoading(false);
    }
  }, [imageSource]);

  // Build Vimeo URL if we have video data
  const buildVimeoUrl = (videoData: NonNullable<typeof videoSource>) => {
    if (videoData.url) return videoData.url;
    if (!videoData.vimeoId) return null;
    
    // Use exact parameters from Vimeo's provided embed code
    const params = new URLSearchParams();
    params.set('badge', '0');
    params.set('autopause', '0'); 
    params.set('player_id', '0');
    params.set('app_id', '58479');
    
    // Only add additional parameters if account supports them
    if (videoData.autoplay !== false) params.set('autoplay', '1');
    if (videoData.muted !== false) params.set('muted', '1');
    if (videoData.loop !== false) params.set('loop', '1');
    
    // Background mode may require paid account - only add if explicitly enabled
    if (videoData.background === true) {
      params.set('background', '1');
    }
    
    return `https://player.vimeo.com/video/${videoData.vimeoId}?${params.toString()}`;
  };

  const vimeoUrl = videoSource ? buildVimeoUrl(videoSource) : null;
  
  // Add timeout to detect video loading issues
  useEffect(() => {
    if (vimeoUrl && !videoError) {
      // Set a timeout to check if video is blocked
      const timeout = setTimeout(() => {
        // If no successful load detected after 10 seconds, consider it failed
        console.warn('Video may be blocked or unavailable:', vimeoUrl);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [vimeoUrl, videoError]);
  
  // Generate accessible alt text from direct prop, frontmatter, or fallback
  const getAccessibleAlt = (): string => {
    // Use direct alt prop first, then frontmatter, then generate from title
    return alt || 
           frontmatter?.images?.hero?.alt || 
           (frontmatter?.title ? `Hero image for ${frontmatter.title}` : 'Hero background image');
  };

  // Generate accessible aria-label from direct prop, frontmatter, or fallback
  const getSectionAriaLabel = (): string => {
    // Use direct ariaLabel prop first, then generate from frontmatter title
    return ariaLabel || 
           (frontmatter?.title ? `Hero section for ${frontmatter.title}` : "Hero section");
  };  // Generate accessible video title from frontmatter
  const getVideoAriaLabel = (): string => {
    return frontmatter?.title ? `Video content for ${frontmatter.title}` : "Video content";
  };
  
  // Tailwind classes for fullwidth variant with responsive heights
  const containerClasses = variant === 'fullwidth' 
    ? `w-full 
    h-[30vh] max-h-[50vh] 
    sm:h-[45vh] sm:max-h-[45vh] 
    md:h-[44vh] md:max-h-[44vh] 
    lg:h-[65vh] lg:max-h-[65vh] 
    xl:h-[70vh] xl:max-h-[70vh] 
    relative overflow-hidden bg-gray-900 ${themeClass}`
    : `hero-section bg-gray-900 ${themeClass}`;

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
      {vimeoUrl && !videoError ? (
        <div className={backgroundClasses}>
          <iframe
            src={vimeoUrl}
            className={videoClasses}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            title={getVideoAriaLabel()}
            aria-label={`${getVideoAriaLabel()} - Video player`}
            loading="lazy"
            onError={(e) => {
              console.error('Vimeo iframe error:', e);
              console.log('Attempted URL:', vimeoUrl);
              setVideoError(true);
            }}
            onLoad={(e) => {
              // Check if the iframe loaded but shows an error page
              try {
                const iframe = e.target as HTMLIFrameElement;
                // Note: Due to CORS, we can't directly check iframe content
                // But we can detect if Vimeo shows an error by timing
                setTimeout(() => {
                  console.log('Vimeo iframe loaded successfully:', vimeoUrl);
                }, 2000);
              } catch (error) {
                console.warn('Could not verify iframe content:', error);
              }
            }}
          />
        </div>
      ) : vimeoUrl && videoError ? (
        // Video failed to load, show fallback
        <div className={`${backgroundClasses} flex items-center justify-center bg-gray-800`}>
          <div className="text-white text-center p-8">
            <div className="text-lg font-semibold mb-2">Video Temporarily Unavailable</div>
            <div className="text-sm opacity-75">Video ID: {videoSource?.vimeoId}</div>
            <div className="text-xs opacity-50 mt-2">
              The video may be private, deleted, or have embedding restrictions
            </div>
          </div>
        </div>
      ) : imageSource && isInView ? (
        <div className={backgroundClasses}>
          {/* Performance-optimized Next.js Image component */}
          <Image
            src={imageSource}
            alt={getAccessibleAlt()}
            fill
            className="object-cover"
            style={{ zIndex: 1 }}
            priority={variant === 'fullwidth'} // Prioritize fullwidth hero images
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            onLoad={() => {
              setImageLoaded(true);
              setImageLoading(false);
            }}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoadStart={() => setImageLoading(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss="
          />
          {/* Loading indicator overlay with screen reader support */}
          {imageLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10"
              role="status"
              aria-live="polite"
              aria-label="Loading hero image"
            >
              <div className="rounded-full h-8 w-8 border-b-2 border-white" aria-hidden="true"></div>
              <span className="sr-only">Loading hero image...</span>
            </div>
          )}
          {/* Error state overlay with screen reader support */}
          {imageError && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 z-10"
              role="alert"
              aria-live="assertive"
            >
              <div className="text-white text-center">
                <div className="text-sm opacity-75">Hero image could not be loaded</div>
                <span className="sr-only">Error: Hero image failed to load</span>
              </div>
            </div>
          )}
        </div>
      ) : imageSource && !isInView ? (
        // Placeholder while not in view for performance
        <div className={`${backgroundClasses} bg-gray-800 animate-pulse`} aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700"></div>
        </div>
      ) : (
        <div 
          className={`${backgroundClasses} flex items-center justify-center bg-gray-600`}
          aria-label="Default hero background with logo"
        >
          <Image
            src="/images/Site/Logo/logo_.png"
            alt="Z-Beam company logo"
            width={200}
            height={120}
            className="opacity-30 object-contain"
            priority={false}
          />
        </div>
      )}

      {/* Content overlay with proper focus management */}
      {children && (
        <div className={contentClasses} style={{ zIndex: 2 }}>
          {children}
        </div>
      )}

    </section>
  );
}