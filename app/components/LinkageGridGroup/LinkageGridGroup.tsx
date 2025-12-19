// app/components/LinkageGridGroup/LinkageGridGroup.tsx
// Groups multiple LinkageGrid components under a common category

import React from 'react';
import { LinkageGrid } from '../LinkageGrid';

interface LinkageGridItem {
  data: any[];
  type: 'materials' | 'contaminants' | 'settings';
  title: string;
  description: string;
  sortBy?: 'frequency' | 'severity';
  variant?: 'default' | 'domain-linkage';
}

interface LinkageGridGroupProps {
  title?: string;
  description?: string;
  grids: LinkageGridItem[];
  className?: string;
}

/**
 * LinkageGridGroup - Groups related LinkageGrid sections
 * 
 * Organizes multiple linkage grids under a common category heading
 * Automatically filters out empty grids
 * 
 * Example usage:
 * ```tsx
 * <LinkageGridGroup
 *   title="Domain Relationships"
 *   description="Cross-domain connections and related content"
 *   grids={[
 *     { data: materials, type: 'materials', title: 'Materials', ... },
 *     { data: contaminants, type: 'contaminants', title: 'Contaminants', ... }
 *   ]}
 * />
 * ```
 */
export function LinkageGridGroup({
  title,
  description,
  grids,
  className = '',
}: LinkageGridGroupProps) {
  // Filter out grids with no data
  const validGrids = grids.filter(grid => grid.data && grid.data.length > 0);
  
  // Don't render if no valid grids
  if (validGrids.length === 0) return null;
  
  return (
    <div className={`mb-16 ${className}`}>
      {/* Optional group header */}
      {(title || description) && (
        <div className="container-custom px-4 mb-8">
          {title && (
            <h2 className="text-3xl font-bold text-white mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Render each grid */}
      <div className="space-y-16">
        {validGrids.map((grid, index) => (
          <LinkageGrid
            key={`${grid.type}-${index}`}
            data={grid.data}
            type={grid.type}
            title={grid.title}
            description={grid.description}
            sortBy={grid.sortBy}
            variant={grid.variant}
          />
        ))}
      </div>
    </div>
  );
}

export default LinkageGridGroup;
