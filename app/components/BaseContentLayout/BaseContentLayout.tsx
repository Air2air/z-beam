// app/components/BaseContentLayout/BaseContentLayout.tsx
// Unified base layout for all content types (materials, contaminants, settings)
// Handles common patterns and delegates domain-specific rendering to section configs

import React from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '../Layout/Layout';
import type { LayoutProps } from '@/types';

const Micro = dynamic(() => import('../Micro/Micro').then(mod => ({ default: mod.Micro })), {
  ssr: true
});

export interface SectionConfig {
  component: React.ComponentType<any>;
  condition?: boolean | (() => boolean);
  props?: Record<string, any>;
}

export interface BaseContentLayoutProps extends LayoutProps {
  slug?: string;
  category?: string;
  subcategory?: string;
  contentType: 'materials' | 'contaminants' | 'settings';
  sections?: SectionConfig[];
  showMicro?: boolean;
  enrichedMetadata?: any;
}

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
  ...layoutProps
}: BaseContentLayoutProps) {
  const effectiveMetadata = enrichedMetadata || metadata;
  const itemName = (metadata?.title as string) || metadata?.name || slug;
  
  return (
    <Layout 
      {...layoutProps}
      metadata={effectiveMetadata}
      slug={slug}
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
          <div key={index} className="mb-16">
            <Component {...props} />
          </div>
        );
      })}
      
      {/* Micro - Common across all content types */}
      {showMicro && metadata?.images?.micro?.url && (
        <div className="mb-16">
          <Micro 
            frontmatter={metadata}
            config={{}}
          />
        </div>
      )}
    </Layout>
  );
}

export default BaseContentLayout;
