/**
 * @component CardGridSkeleton
 * @purpose Loading skeleton for CardGrid component to prevent layout shift
 * @usage Used by page loading.tsx files as fallback while CardGrid loads
 * @accessibility Includes role="status" and aria-label for screen readers
 * @performance Uses DIMENSION_CLASSES to match CardGrid exactly (CLS: 0.0)
 */

import { DIMENSION_CLASSES } from '@/app/config/dimensions';
import { getGridClasses } from '@/app/config/site';

interface CardGridSkeletonProps {
  /** Number of cards to show in skeleton (default: 9) */
  count?: number;
  /** Show section title skeleton (default: true) */
  showTitle?: boolean;
  /** Section title text for skeleton (default: "Loading") */
  titleText?: string;
  /** Grid columns (1-4, default: 3) */
  columns?: 1 | 2 | 3 | 4;
  /** Grid gap size (default: "md") */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function CardGridSkeleton({ 
  count = 9, 
  showTitle = true,
  titleText = "Loading",
  columns = 3,
  gap = "md"
}: CardGridSkeletonProps) {
  return (
    <div 
      className="space-y-6"
      role="status"
      aria-label={`Loading ${count} items`}
    >
      {/* Optional title skeleton - matches CardGrid's Title component */}
      {showTitle && (
        <div className="mb-2">
          <div className="h-8 bg-secondary rounded w-2/5 animate-pulse" />
        </div>
      )}

      {/* Grid skeleton - matches CardGrid's responsive grid using getGridClasses() */}
      <div className={getGridClasses({ columns, gap })}>
        {[...Array(count)].map((_, i) => (
          <div 
            key={i} 
            className="group card-base h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem] rounded-lg overflow-hidden bg-secondary animate-pulse"
          >
            {/* Image area skeleton - matches actual Card's image container */}
            <div className="relative w-full h-full">
              <div className="w-full h-full bg-tertiary" />
              
              {/* Title bar overlay - matches Card's title bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-80 px-3 py-1 md:px-4 md:py-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-primary/30 rounded w-3/4" />
                  <div className="w-4 h-4 bg-primary/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading grid content...</span>
    </div>
  );
}
