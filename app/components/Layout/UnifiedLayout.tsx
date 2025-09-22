// app/components/Layout/UnifiedLayout.tsx
// Single, simplified layout system for maximum reusability and responsiveness

import React, { ReactNode } from 'react';
import { ArticleHeader } from './ArticleHeader';
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { ArticleMetadata, ComponentData } from '@/types';
import { CONTAINER_STYLES } from '../../utils/containerStyles';

// Article content components
import { Content } from "../Content/Content";
import { Table } from "../Table/Table";
import { PropertiesTable } from "../PropertiesTable";

import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { BadgeSymbol } from '../BadgeSymbol/BadgeSymbol';

// Component rendering order for articles
const ARTICLE_COMPONENT_ORDER = [
  'propertiestable',
  'badgesymbol', 
  'content',
  'caption',
  'table',
  'tags'
] as const;

interface LayoutProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  // Layout behavior options
  fullWidth?: boolean; // For pages that need full-width sections (like home)
  // Article-specific props (optional for backward compatibility)
  components?: Record<string, ComponentData> | null;
  metadata?: ArticleMetadata;
  slug?: string;
  hideHeader?: boolean;
}

/**
 * Layout System - Single component for all layout needs
 * 
 * Simplified to use article layout by default with support for both
 * article content (with components) and regular page content (with children)
 */
export function Layout(props: LayoutProps) {
  const { title, description, components, metadata, slug, hideHeader, fullWidth } = props;

  // Use full-width or contained layout based on prop
  const containerClass = props.className || (fullWidth ? "w-full" : CONTAINER_STYLES.standard);

  // If components are provided, render as article layout
  if (components) {
    
    // Handle empty content
    if (!components || Object.keys(components).length === 0) {
      return (
        <main className={containerClass} id="main-content" role="main">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {title || 'Content Not Available'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This page is currently being prepared. Please check back later.
            </p>
          </div>
        </main>
      );
    }

    // Generate JSON-LD structured data
    const jsonLdData = metadata?.title && metadata?.description ? 
      schemas.technicalArticle({
        headline: metadata.title,
        description: metadata.description,
        author: typeof metadata.authorInfo === 'string' 
          ? metadata.authorInfo 
          : metadata.authorInfo?.name || 'Z-Beam',
        datePublished: metadata.datePublished || new Date().toISOString().split('T')[0],
        dateModified: metadata.lastModified,
        url: `https://z-beam.com/${slug}`,
        image: metadata.image,
        keywords: metadata.keywords
      }) : null;

    return (
      <main className={containerClass} id="main-content" role="main">
        {/* Structured data */}
        {jsonLdData && <JsonLD data={jsonLdData} />}
        
        {/* Article header */}
        {!hideHeader && (
          <ArticleHeader 
            metadata={metadata}
            slug={slug}
            title={title}
          />
        )}

        {/* Article content */}
        <article role="article" className="space-y-8">
          {ARTICLE_COMPONENT_ORDER.map(type => {
            const component = components[type];
            if (!component) return null;
            
            const { content, config } = component;
            
            switch(type) {
              case 'propertiestable':
                return (
                  <section key={type} aria-labelledby="properties-heading">
                    <PropertiesTable content={content} config={config} />
                  </section>
                );
              case 'badgesymbol':
                return (
                  <section key={type} aria-label="Material classification">
                    <BadgeSymbol content={content} config={config} />
                  </section>
                );
              case 'content':
                return (
                  <section key={type} aria-label="Main content">
                    <Content content={content} config={config} />
                  </section>
                );
              case 'caption':
                return (
                  <section key={type} aria-label="Caption and metadata">
                    <Caption 
                      content={content} 
                      frontmatter={metadata as any} 
                      config={config} 
                    />
                  </section>
                );
              case 'table':
                return (
                  <section key={type} aria-label="Data table">
                    <Table content={content} config={config} />
                  </section>
                );
              case 'tags':
                return (
                  <section key={type} aria-label="Tags and categories">
                    <Tags content={content} config={config} />
                  </section>
                );
              default:
                return null;
            }
          })}
        </article>
      </main>
    );
  }

  // Default layout for regular page content
  return (
    <main className={containerClass} id="main-content" role="main">
      {/* Page header - only show in contained layouts */}
      {title && !fullWidth && (
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </header>
      )}
      
      {/* Page content */}
      <div className={fullWidth ? "space-y-0" : "space-y-6"}>
        {props.children}
      </div>
    </main>
  );
}

// Export for existing LayoutSystem usage
export const UnifiedLayout = Layout;
export const UniversalLayout = Layout;
