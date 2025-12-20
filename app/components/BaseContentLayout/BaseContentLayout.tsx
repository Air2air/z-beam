// app/components/BaseContentLayout/BaseContentLayout.tsx
// Unified base layout for all content types (materials, contaminants, settings)
// Handles common patterns and delegates domain-specific rendering to section configs

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '../Layout/Layout';
import type { LayoutProps, SectionConfig, BaseContentLayoutProps } from '@/types';

const Micro = dynamic(() => import('../Micro/Micro').then(mod => ({ default: mod.Micro })), {
  ssr: true
});

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
  category = '',
  subcategory = '',
  contentType,
  sections = [],
  showMicro = true,
  enrichedMetadata,
  title,
  ...layoutProps
}: BaseContentLayoutProps) {
  const effectiveMetadata = enrichedMetadata || metadata;
  const itemName = title || (metadata?.title as string) || metadata?.name || slug;
  
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
      
      {/* Micro - Common across all content types */}
      {showMicro && metadata?.images?.micro?.url && (
        <Micro 
          frontmatter={metadata as any}
          config={{}}
        />
      )}
    </Layout>
  );
}

export default BaseContentLayout;
