/**
 * @component GridSection
 * @purpose Normalized wrapper for all grid components
 * @usage Provides consistent spacing, title, description across all grids
 * 
 * This component standardizes the layout of all grid-based content sections:
 * - Consistent spacing (mb-16)
 * - Standard container padding (container-custom)
 * - Unified title/description styling (SectionTitle)
 * - Optional description text below title for context
 * - Variant support for different visual themes
 * 
 * @note Now uses BaseSection internally for consistency
 * 
 * @example
 * ```tsx
 * <GridSection 
 *   title="Compatible Materials" 
 *   description="Materials frequently contaminated by this substance">
 *   <DataGrid data={materials} mapper={materialMapper} />
 * </GridSection>
 * ```
 */
import React from 'react';
import { BaseSection } from '../BaseSection/BaseSection';

interface GridSectionProps {
  title: string;
  description?: string;  // Optional descriptive text below title
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark';
  alignment?: 'left' | 'center' | 'right';
}

export function GridSection({
  title,
  description,
  children,
  className = '',
  variant = 'default',
  alignment = 'left',
}: GridSectionProps) {
  return (
    <BaseSection
      title={title}
      description={description}
      variant={variant}
      alignment={alignment}
      spacing="loose"
      className={className}
    >
      {children}
    </BaseSection>
  );
}
