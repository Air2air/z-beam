// app/components/BaseContentLayout/BaseContentLayout.tsx
// Unified base layout for all content types (materials, contaminants, settings)
// Handles common patterns and delegates domain-specific rendering to section configs

import React from 'react';
import { Layout } from '../Layout/Layout';
import type { SectionConfig, BaseContentLayoutProps } from '@/types';

// Re-export types for convenience
export type { SectionConfig, BaseContentLayoutProps };

/**
 * BaseContentLayout - Unified layout component
 * 
 * Accepts configuration for domain-specific sections, handles:
 * - Common Layout wrapper
 * - Dynamic Micro component loading
 * - Section rendering with conditional display
 * - Proper spacing between sections
 */
export function BaseContentLayout({
  metadata,
  children,
  slug = '',
  category: _category = '',
  subcategory: _subcategory = '',
  contentType: _contentType,
  sections = [],
  showMicro: _showMicro = true,
  enrichedMetadata,
  title,
  ...layoutProps
}: BaseContentLayoutProps) {
  const effectiveMetadata = enrichedMetadata || metadata;
  const itemName = title || (metadata as any)?.pageTitle || (metadata as any)?.displayName || (metadata?.title as string) || metadata?.name || slug;
  
  return (
    <Layout 
      {...layoutProps}
      metadata={effectiveMetadata}
      slug={slug}
      title={itemName}
    >
      {/* Page-specific content passed from route page */}
      {children}
      
      {/* Render configured sections */}
      {sections.map((section, index) => {
        const { component: Component, condition = true, props = {} } = section;
        
        // Evaluate condition
        const shouldRender = typeof condition === 'function' ? condition() : condition;
        
        if (!shouldRender) return null;
        
        return (
          <Component key={index} {...props} />
        );
      })}
    </Layout>
  );
}

export default BaseContentLayout;
