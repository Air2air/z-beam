/**
 * @component MicroSkeleton
 * @purpose Loading skeleton for Micro component to prevent layout shift
 * @usage Used by dynamic import in Layout.tsx as fallback while Micro loads
 * @accessibility Includes role="status" and aria-label for screen readers
 * @performance Reserves exact space needed by Micro using DIMENSION_CLASSES to maintain CLS: 0.0
 */

import { GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { DIMENSION_CLASSES } from '@/app/config/dimensions';

export default function MicroSkeleton() {
  return (
    <div 
      className="animate-pulse"
      role="status" 
      aria-label="Loading micro content"
    >
      {/* Image skeleton - matches Micro's aspect-[16/9] with rounded-md */}
      <div className="relative aspect-[16/9] bg-secondary rounded-md overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-tertiary to-secondary animate-pulse" />
      </div>
      
      {/* Before/After text skeleton - matches Micro's grid layout with exact gap */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${GRID_GAP_RESPONSIVE}`}>
        {/* Before section - matches actual padding */}
        <div className="p-6 md:p-8 bg-primary rounded-md space-y-3">
          <div className="h-6 bg-secondary rounded w-1/3" />
          <div className="h-4 bg-primary-hover rounded w-full" />
          <div className="h-4 bg-primary-hover rounded w-5/6" />
          <div className="h-4 bg-primary-hover rounded w-4/6" />
        </div>
        
        {/* After section - matches actual padding */}
        <div className="p-6 md:p-8 bg-primary rounded-md space-y-3">
          <div className="h-6 bg-secondary rounded w-1/3" />
          <div className="h-4 bg-primary-hover rounded w-full" />
          <div className="h-4 bg-primary-hover rounded w-5/6" />
          <div className="h-4 bg-primary-hover rounded w-4/6" />
        </div>
      </div>
      
      {/* Screen reader announcement */}
      <span className="sr-only">Loading micro content...</span>
    </div>
  );
}
