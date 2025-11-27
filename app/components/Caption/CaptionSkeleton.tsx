/**
 * @component CaptionSkeleton
 * @purpose Loading skeleton for Caption component to prevent layout shift
 * @usage Used by dynamic import in Layout.tsx as fallback while Caption loads
 * @accessibility Includes role="status" and aria-label for screen readers
 * @performance Reserves exact space needed by Caption (min-h-[500px]) to maintain CLS: 0.0
 */

export default function CaptionSkeleton() {
  return (
    <div 
      className="min-h-[500px] space-y-6 animate-pulse" 
      role="status" 
      aria-label="Loading caption content"
    >
      {/* Image skeleton - matches Caption's aspect-[16/9] */}
      <div className="relative aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      </div>
      
      {/* Before/After text skeleton - matches Caption's grid layout */}
      <div className="grid-2col-md gap-6">
        {/* Before section */}
        <div className="p-6 md:p-8 bg-gray-100 rounded-lg space-y-3">
          <div className="h-6 bg-gray-300 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        
        {/* After section */}
        <div className="p-6 md:p-8 bg-gray-100 rounded-lg space-y-3">
          <div className="h-6 bg-gray-300 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
      
      {/* Screen reader announcement */}
      <span className="sr-only">Loading caption content...</span>
    </div>
  );
}
