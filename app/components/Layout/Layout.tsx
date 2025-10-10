// app/components/Layout/Layout.tsx
// Single, simplified layout system for maximum reusability and responsiveness

import React from 'react';
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { LayoutProps } from '@/types';
import { CONTAINER_STYLES } from '../../utils/containerStyles';
import { SITE_CONFIG } from '../../utils/constants';
import { Title } from '../Title';
import { Hero } from "../Hero/Hero";
import { Author } from "../Author/Author";
import { extractSafeValue } from '../../utils/safeValueExtractor';
import { Table } from "../Table/Table";
import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { MetricsGrid } from '../MetricsCard/MetricsGrid';

const ARTICLE_COMPONENT_ORDER = ['content', 'metricsmachinesettings', 'metricsproperties', 'table', 'tags'] as const;
const SPACER_CLASSES = "h-20 sm:h-24 md:h-28"; // Reduced from vh-based heights for better spacing

// Helper: Extract material name from metadata or slug
const getMaterialName = (metadata: any, slug?: string) => {
  return extractSafeValue(metadata?.subject, 'subject', '').toLowerCase() ||
    (slug?.includes('-') ? slug.split('-')[0].toLowerCase() : slug?.toLowerCase() || '');
};

// Helper: Render article header section
const ArticleHeader = ({ title, metadata, slug, customHeroOverlay }: any) => {
  const materialName = getMaterialName(metadata, slug);
  
  // Check if we have hero image/video from markdown or material-based hero
  // Hero renders automatically if any hero content exists
  const hasHeroContent = 
    metadata?.image || 
    metadata?.images?.hero?.url || 
    metadata?.video || 
    materialName;
  
  return (
    <div className="header-section mb-6">
      {hasHeroContent ? (
        <Hero frontmatter={metadata} theme="dark" customOverlay={customHeroOverlay} />
      ) : (
        <div className={SPACER_CLASSES} aria-hidden="true" />
      )}

      <Title level="page" title={title || metadata?.title || 'Article'} subtitle={metadata?.subtitle} />
      <Author 
        frontmatter={metadata}
        showAvatar showCredentials showCountry showSpecialties
        className="mt-2 mb-4"
      />

      {/* Article date metadata */}
      {(metadata?.datePublished || metadata?.lastModified) && (
        <div className="article-dates text-sm text-gray-600 dark:text-gray-400 mb-6 flex flex-wrap gap-2">
          {metadata?.datePublished && (
            <time 
              dateTime={metadata.datePublished}
              itemProp="datePublished"
              className="flex items-center"
            >
              <span className="sr-only">Published: </span>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(metadata.datePublished).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
          )}
          {metadata?.lastModified && metadata.lastModified !== metadata.datePublished && (
            <>
              <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">•</span>
              <time 
                dateTime={metadata.lastModified}
                itemProp="dateModified"
                className="flex items-center"
              >
                <span className="sr-only">Last updated: </span>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Updated {new Date(metadata.lastModified).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            </>
          )}
        </div>
      )}

      {metadata?.materialProperties && (
        <section aria-labelledby="material-properties-heading" className="my-8">
          <MetricsGrid metadata={metadata} dataSource="materialProperties" titleFormat="comparison" 
            maxCards={8} layout="auto" showTitle searchable />
        </section>
      )}

      {metadata?.machineSettings && (
        <section aria-labelledby="machine-settings-heading" className="my-8">
          <MetricsGrid metadata={metadata} dataSource="machineSettings" titleFormat="comparison"
            maxCards={8} layout="auto" showTitle searchable />
        </section>
      )}

      {metadata?.caption && (
        <section aria-labelledby="caption-section" className="my-8">
          <Caption frontmatter={metadata} config={{ className: "caption-section", showTechnicalDetails: true, showMetadata: true }} />
        </section>
      )}
    </div>
  );
};

// Helper: Render article component
const renderComponent = (type: string, component: any, metadata: any) => {
  if (!component) return null;

  if (type === 'metricsmachinesettings' && component.config) {
    const metricsMetadata = { slug: metadata?.slug || '', title: component.config.title || '', 
      description: component.config.description || '', machineSettings: component.config.machineSettings || {} };
    return (
      <section key={type} aria-label="Machine settings visualization">
        <MetricsGrid metadata={metricsMetadata} dataSource="machineSettings" 
          title={component.config.title} className={component.config.className} searchable />
      </section>
    );
  }

  if (type === 'metricsproperties' && component.config) {
    const propertiesMetadata = { slug: metadata?.slug || '', title: component.config.title || '',
      description: component.config.description || '', materialProperties: component.config.properties || {} };
    return (
      <section key={type} aria-label="Material properties visualization">
        <MetricsGrid metadata={propertiesMetadata} dataSource="materialProperties"
          title={component.config.title} className={component.config.className} searchable />
      </section>
    );
  }

  const { content, config } = component;
  
  if (type === 'content' && content) {
    return (
      <section key={type} aria-label="Main content" className="prose prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </section>
    );
  }
  
  if (type === 'table') {
    return <section key={type} aria-label="Data table"><Table content={content} config={config} frontmatterData={metadata} /></section>;
  }
  
  if (type === 'tags') {
    return <section key={type} aria-label="Tags and categories"><Tags frontmatter={metadata} /></section>;
  }
  
  return null;
};

export function Layout(props: LayoutProps) {
  const { title, components, metadata, slug, fullWidth, customHeroOverlay } = props;
  const containerClass = props.className || (fullWidth ? "w-full" : CONTAINER_STYLES.main);

  // Article layout with components
  if (components) {
    // Handle empty content
    if (Object.keys(components).length === 0) {
      return (
        <main className={containerClass} id="main-content" role="main">
          <div className="text-center py-12">
            <Title level="page" title={title || 'Content Not Available'} />
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
        author: typeof metadata.author === 'string' 
          ? metadata.author 
          : metadata.author?.name || SITE_CONFIG.author,
        datePublished: metadata.datePublished || new Date().toISOString().split('T')[0],
        dateModified: metadata.lastModified,
        url: `${SITE_CONFIG.url}/${slug}`,
        image: metadata.image,
        keywords: metadata.keywords
      }) : null;

    return (
      <main className={containerClass} id="main-content" role="main">
        {jsonLdData && <JsonLD data={jsonLdData} />}
        <ArticleHeader title={title} metadata={metadata} slug={slug} customHeroOverlay={customHeroOverlay} />
        
        <article role="article" className="space-y-8">
          {ARTICLE_COMPONENT_ORDER.map(type => renderComponent(type, components[type], metadata))}
        </article>
      </main>
    );
  }

  // Regular page layout
  // Check if we have hero content to render
  const hasHeroContent = 
    metadata?.image || 
    metadata?.images?.hero?.url || 
    metadata?.video;

  return (
    <main className={containerClass} id="main-content" role="main">
      {/* Hero renders if content exists, otherwise spacer maintains consistent vertical rhythm */}
      {hasHeroContent ? (
        <Hero frontmatter={metadata} theme="dark" customOverlay={customHeroOverlay} />
      ) : (
        <div className={SPACER_CLASSES} aria-hidden="true" />
      )}
      
      {/* Title renders consistently for all pages - fullWidth pages need container */}
      {title && (
        <div className={fullWidth ? CONTAINER_STYLES.contentOnly : ""}>
          <div className="w-full">
            <Title level="page" title={title} subtitle={props.subtitle} />
          </div>
        </div>
      )}
      
      <div className={fullWidth ? "space-y-0" : "space-y-6"}>
        {props.children}
      </div>
    </main>
  );
}

// Export for existing LayoutSystem usage
export const UnifiedLayout = Layout;
export const UniversalLayout = Layout;
