// app/components/Hero/Hero.tsx
'use client';

import './styles.css';
import { ReactNode, useState, useEffect } from 'react';

interface HeroProps {
  image?: string;
  video?: {
    vimeoId?: string;
    url?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    background?: boolean;
  };
  align?: 'left' | 'center' | 'right';
  theme?: 'dark' | 'light';
  variant?: 'default' | 'fullwidth';
  children?: ReactNode;
  frontmatter?: {
    images?: {
      hero?: {
        url?: string;
      };
    };
    video?: {
      vimeoId?: string;
      url?: string;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      background?: boolean;
    };
    [key: string]: unknown;
  }; // Frontmatter contains all image path information
  cta?: {
    text: string;
    href: string;
  };
}

export function Hero({ 
  image, 
  video,
  children,
  // align = 'center', - unused
  theme = 'dark',
  variant = 'default',
  frontmatter,

}: HeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const themeClass = `theme-${theme}`;
  
  // Determine video source, prioritizing frontmatter
  let videoSource = video;
  if (!videoSource && frontmatter?.video) {
    videoSource = frontmatter.video;
  }
  
  // Determine image source, prioritizing frontmatter
  let imageSource = image;
  
  // Use the hero image URL from frontmatter if no direct image provided
  // Handle both structured (images.hero.url) and flat (url) frontmatter formats
  if (!imageSource && frontmatter?.images?.hero?.url) {
    imageSource = frontmatter.images.hero.url;
  } else if (!imageSource && frontmatter?.url) {
    // Fallback for flat frontmatter structure
    imageSource = frontmatter.url as string;
  }

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
    
    const params = new URLSearchParams();
    if (videoData.autoplay !== false) params.set('autoplay', '1');
    if (videoData.loop !== false) params.set('loop', '1');
    if (videoData.background !== false) params.set('background', '1');
    if (videoData.muted !== false) params.set('muted', '1');
    
    return `https://player.vimeo.com/video/${videoData.vimeoId}?${params.toString()}`;
  };

  const vimeoUrl = videoSource ? buildVimeoUrl(videoSource) : null;
  
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
    <div className={containerClasses}>
      {vimeoUrl ? (
        <div className={backgroundClasses}>
          <iframe
            src={vimeoUrl}
            className={videoClasses}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : imageSource ? (
        <div 
          className={backgroundClasses}
          style={{ backgroundImage: `url(${encodedImageSource})` }}
        >
          {/* Loading indicator overlay */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          {/* Error state overlay */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 z-10">
              <div className="text-white text-center">
                <div className="text-sm opacity-75">Image unavailable</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`${backgroundClasses} flex items-center justify-center bg-gray-600`}
          style={{ 
            backgroundImage: `url(/images/Site/Logo/logo_.png)`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: '0.3'
          }}
        />
      )}

      {/* Content overlay */}
      {children && (
        <div className={contentClasses}>
          {children}
        </div>
      )}

    </div>
  );
}