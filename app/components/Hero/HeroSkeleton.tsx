/**
 * @component HeroSkeleton
 * @purpose Loading skeleton for Hero component to prevent layout shift
 * @usage Used by page loading.tsx files as fallback while Hero loads
 * @accessibility Includes role="status" and aria-label for screen readers
 * @performance Uses aspect-video to match Hero component exactly (CLS: 0.0)
 */

export default function HeroSkeleton() {
  return (
    <div 
      className="relative w-full aspect-video overflow-hidden rounded-md bg-secondary animate-pulse"
      role="status"
      aria-label="Loading hero section"
    >
      {/* Gradient overlay - matches Hero component */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
      
      {/* Content container - matches Hero's centered layout */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Title skeleton */}
            <div className="h-12 md:h-16 bg-tertiary/30 rounded-lg w-3/4 mx-auto" />
            
            {/* Subtitle skeleton */}
            <div className="h-6 bg-tertiary/20 rounded w-1/2 mx-auto" />
            
            {/* Description skeleton (2 lines) */}
            <div className="space-y-3 pt-4">
              <div className="h-4 bg-tertiary/20 rounded w-5/6 mx-auto" />
              <div className="h-4 bg-tertiary/20 rounded w-4/6 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Loading hero content...</span>
    </div>
  );
}
