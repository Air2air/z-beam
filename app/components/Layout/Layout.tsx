// app/components/Layout/Layout.tsx
// Single, simplified layout system for maximum reusability and responsiveness

import React, { ReactNode } from 'react';
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { ArticleMetadata, ComponentData, LayoutProps, BadgeSymbolData, BadgeVariant } from '@/types';
import { CONTAINER_STYLES } from '../../utils/containerStyles';

// Header components (previously in ArticleHeader)
import { Hero } from "../Hero/Hero";
import { Title } from "../Title/Title";
import { Author } from "../Author/Author";
import { extractSafeValue } from "../../utils/stringHelpers";

// Article content components

import { Table } from "../Table/Table";
import { Settings } from "../Settings/Settings";

import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { BadgeSymbol } from '../BadgeSymbol/BadgeSymbol';
import { MetricsGrid } from '../MetricsCard/MetricsGrid';

// Component rendering order for articles
const ARTICLE_COMPONENT_ORDER = [
  'badgesymbol', 
  'caption',
  'metricsmachinesettings',
  'metricsproperties',
  'settings',
  'table',
  'tags'
] as const;

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
        
        {/* Article header components - previously in ArticleHeader */}
        {!hideHeader && (
          <div className="header-section mb-6">
            {/* Hero component for background image */}
            {(() => {
              // Extract material name for hero image (from subject or slug)
              const materialName = extractSafeValue(metadata?.subject).toLowerCase() || 
                (slug && extractSafeValue(slug).includes('-') ? extractSafeValue(slug).split('-')[0].toLowerCase() : extractSafeValue(slug || '').toLowerCase());
              
              return materialName && (
                <Hero
                  frontmatter={metadata}
                  theme="dark"
                />
              );
            })()}

            {/* Title and Author components - simplified frontmatter-only */}
            <Title frontmatter={metadata} title={title} />
            <Author 
              frontmatter={metadata}
              showAvatar={true}
              showCredentials={true}
              showCountry={true}
              showSpecialties={true}
              className="mt-2 mb-4"
            />

            {/* Material Properties from frontmatter - positioned after Author */}
            {metadata && metadata.materialProperties && (
              <section aria-labelledby="material-properties-heading" className="my-8">
                <MetricsGrid
                  metadata={metadata}
                  dataSource="materialProperties"
                  title="Material Properties"
                  maxCards={8}
                  layout="auto"
                  showTitle={true}
                />
              </section>
            )}
            
            {/* Machine Settings from frontmatter - positioned after Author */}
            {metadata && metadata.machineSettings && (
              <section aria-labelledby="machine-settings-heading" className="my-8">
                <MetricsGrid
                  metadata={metadata}
                  dataSource="machineSettings"
                  title="Machine Settings"
                  maxCards={8}
                  layout="auto"
                  showTitle={true}
                />
              </section>
            )}
          </div>
        )}        {/* Article content */}
        <article role="article" className="space-y-8">
          {ARTICLE_COMPONENT_ORDER.map(type => {
            const component = components[type];
            
            // Special handling for metricsmachinesettings - use YAML component data
            if (type === 'metricsmachinesettings') {
              if (component?.config) {
                // Create metadata object from YAML config
                const metricsMetadata = {
                  slug: metadata?.slug || '',
                  title: component.config.title || '',
                  description: component.config.description || '',
                  machineSettings: component.config.machineSettings || {}
                };
                
                return (
                  <section key={type} aria-label="Machine settings visualization">
                    <MetricsGrid 
                      metadata={metricsMetadata as any}
                      dataSource="machineSettings"
                      title={component.config.title as string}
                      className={component.config.className as string}
                    />
                  </section>
                );
              }
              return null;
            }

            // Special handling for metricsproperties - use MD component data
            if (type === 'metricsproperties') {
              if (component?.config) {
                // Create metadata object from MD config
                const propertiesMetadata = {
                  slug: metadata?.slug || '',
                  title: component.config.title || '',
                  description: component.config.description || '',
                  materialProperties: component.config.properties || {}
                };
                
                return (
                  <section key={type} aria-label="Material properties visualization">
                    <MetricsGrid 
                      metadata={propertiesMetadata as any}
                      dataSource="materialProperties"
                      title={component.config.title as string}
                      className={component.config.className as string}
                    />
                  </section>
                );
              }
              return null;
            }
            
            if (!component) return null;
            
            const { content, config } = component;
            
            switch(type) {
              case 'badgesymbol':
                return (
                  <section key={type} aria-label="Material classification">
                    <BadgeSymbol 
                      content={content} 
                      config={
                        config && typeof config === 'object' && 'symbol' in config && typeof config.symbol === 'string'
                          ? config as BadgeSymbolData & { variant?: BadgeVariant; className?: string }
                          : undefined
                      } 
                    />
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
              case 'settings':
                return (
                  <section key={type} aria-label="Machine settings and parameters">
                    <Settings content={content} config={config} />
                  </section>
                );
              case 'table':
                return (
                  <section key={type} aria-label="Data table">
                    <Table 
                      content={content} 
                      config={config} 
                      frontmatterData={metadata}
                    />
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
