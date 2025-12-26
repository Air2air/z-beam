'use client';

import { Card } from '@/app/components/Card/Card';
import { Button } from '@/app/components/Button';
import { triggerDownload } from '@/app/utils/downloadUtils';
import type { DatasetCardProps } from '@/types/centralized';

export function DatasetCard({
  frontmatter,
  href,
  badge,
  className = '',
  variant = 'default', // Changed from 'standard' to 'default' to match Card component
  formats = [],
  dataPoints,
  category,
  subcategory,
  onQuickDownload,
}: DatasetCardProps) {
  const handleFormatClick = (e: React.MouseEvent, format: string, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onQuickDownload) {
      onQuickDownload(format, url);
    } else {
      triggerDownload(url, url.split('/').pop() || `dataset.${format.toLowerCase()}`);
    }
  };

  return (
    <div className={`relative group h-full ${className}`}>
      <Card
        frontmatter={frontmatter}
        href={href}
        badge={badge}
        variant={variant}
        className="h-full"
      />
      
      <div className="absolute inset-0 pointer-events-none">
        {formats.length > 0 && (
          <div className="absolute top-2 left-2 flex gap-1 pointer-events-auto z-20">
            {formats.map((format, index) => (
              <div key={`${format.format}-${index}`} onClick={(e) => handleFormatClick(e, format.format, format.url)}>
                <Button
                  variant="primary"
                  size="md"
                  className="px-2 py-1 text-xs font-semibold min-h-0"
                  aria-label={`Download ${format.format}${format.size ? ` (${format.size})` : ''}`}
                >
                  {format.format}
                </Button>
              </div>
            ))}
          </div>
        )}
        {dataPoints !== undefined && dataPoints > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="
                px-2 py-1 text-xs font-medium rounded
                bg-secondary/90
                text-muted
                backdrop-blur-sm
                shadow-sm
              "
              aria-label={`${dataPoints.toLocaleString()} data points`}
            >
              <span className="inline-flex items-center gap-1">
                <svg 
                  className="w-3 h-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
                <span>{formatDataPointCount(dataPoints)}</span>
              </span>
            </div>
          </div>
        )}
        
        {/* Category Badge - Bottom Right */}
        {(category || subcategory) && (
          <div className="absolute bottom-2 right-2 z-10">
            <div 
              className="
                px-2 py-1 text-xs font-medium rounded
                bg-secondary/90
                text-muted
                backdrop-blur-sm
                shadow-sm
                text-right
              "
              aria-label={`Category: ${category}${subcategory ? ` - ${subcategory}` : ''}`}
            >
              {subcategory || category}
            </div>
          </div>
        )}
      </div>
      
      {/* Hover State Enhancement */}
      <div 
        className="
          absolute inset-0 rounded-md
          border-2 border-transparent
          border-blue-500
          transition-all duration-200
          pointer-events-none
          z-30
        "
        aria-hidden="true"
      />
    </div>
  );
}

export default DatasetCard;
