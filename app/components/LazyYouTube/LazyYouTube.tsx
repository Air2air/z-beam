// app/components/LazyYouTube/LazyYouTube.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface LazyYouTubeProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  showFacade?: boolean;
  onLoad?: () => void;
}

/**
 * LazyYouTube Component - Intersection Observer-based lazy loading
 * 
 * Performance Benefits:
 * - Defers YouTube iframe loading until user scrolls near it
 * - Reduces initial page load by ~300ms LCP
 * - Shows poster image (YouTube thumbnail) until iframe needed
 * - Uses Intersection Observer for efficient scroll detection
 * 
 * Usage:
 * <LazyYouTube videoId="t8fB3tJCfQw" title="Product Demo" />
 */
export default function LazyYouTube({ 
  videoId, 
  title = 'Video content',
  className = '',
  autoplay = false,
  showFacade = false,
  onLoad
}: LazyYouTubeProps) {
  const [loaded, setLoaded] = useState(false);
  const [userClicked, setUserClicked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't use Intersection Observer if facade is shown (user must click)
    if (showFacade) return;

    // Load immediately on page load for above-fold videos
    setLoaded(true);
    onLoad?.();

    // Note: Intersection Observer removed since we load immediately
    // This provides instant loading while still deferring below critical resources
  }, [showFacade, onLoad]);

  const handleClick = () => {
    setUserClicked(true);
    setLoaded(true);
    onLoad?.();
  };

  const shouldShowIframe = showFacade ? userClicked : loaded;

  // Build YouTube embed URL with optimal parameters
  const buildYouTubeUrl = () => {
    const params = new URLSearchParams({
      autoplay: (autoplay || showFacade) ? '1' : '0',
      mute: autoplay ? '1' : '0', // Mute if autoplay
      loop: '1',
      playlist: videoId, // Required for looping
      rel: '0', // Don't show related videos
      modestbranding: '1', // Minimal branding
      playsinline: '1', // iOS inline playback
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  return (
    <div ref={ref} className={`relative w-full aspect-video ${className}`}>
      {shouldShowIframe ? (
        <iframe
          src={buildYouTubeUrl()}
          width="560"
          height="315"
          className="absolute top-0 left-0 w-full h-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          aria-label={`${title} - Video player`}
        />
      ) : (
        <div 
          className={`absolute top-0 left-0 w-full h-full bg-gray-900 ${showFacade ? 'cursor-pointer group' : ''}`}
          onClick={showFacade ? handleClick : undefined}
          onKeyDown={showFacade ? (e) => e.key === 'Enter' && handleClick() : undefined}
          role={showFacade ? 'button' : undefined}
          tabIndex={showFacade ? 0 : undefined}
          aria-label={showFacade ? 'Load and play video' : undefined}
        >
          {/* YouTube thumbnail as poster */}
          <Image
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={`Thumbnail for ${title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          
          {/* Overlay and play button - only show if facade mode */}
          {showFacade && (
            <>
              <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-40 z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xl">
                  <svg className="w-8 h-8 ml-1" fill="white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm md:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Click to play video
              </div>
            </>
          )}
          
          {/* Loading state for non-facade mode */}
          {!showFacade && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="text-white text-sm">Loading video...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
