// app/components/Layout/Layout.tsx
// Single, simplified layout system for maximum reusability and responsiveness

import React from 'react';
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { LayoutProps } from '@/types';
import { CONTAINER_STYLES } from '../../utils/styles';
import { SITE_CONFIG } from '../../utils/constants';
import { Title } from '../Title';
import { Hero } from "../Hero/Hero";
import { Author } from "../Author/Author";
import { extractSafeValue } from '../../utils/safeValueExtractor';
import { Table } from "../Table/Table";
import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { MetricsGrid } from '../MetricsCard/MetricsGrid';

const ARTICLE_COMPONENT_ORDER = ['metricsmachinesettings', 'metricsproperties', 'table', 'tags'] as const;
const SPACER_CLASSES = "h-[15vh] sm:h-[22vh] md:h-[22vh] lg:h-[32vh] xl:h-[35vh]";

// Helper: Extract material name from metadata or slug
const getMaterialName = (metadata: any, slug?: string) => {
  return extractSafeValue(metadata?.subject, 'subject', '').toLowerCase() ||
    (slug?.includes('-') ? slug.split('-')[0].toLowerCase() : slug?.toLowerCase() || '');
};

// Helper: Render article header section
const ArticleHeader = ({ title, metadata, showHero, slug }: any) => {
  const materialName = getMaterialName(metadata, slug);
  
  return (
    <div className="header-section mb-6">
      {showHero && materialName ? (
        <Hero frontmatter={metadata} theme="dark" />
      ) : (
        <div className={SPACER_CLASSES} aria-hidden="true" />
      )}

      <Title level="page" title={title || metadata?.title || 'Article'} />
      <Author 
        frontmatter={metadata}
        showAvatar showCredentials showCountry showSpecialties
        className="mt-2 mb-4"
      />

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
  
  if (type === 'table') {
    return <section key={type} aria-label="Data table"><Table content={content} config={config} frontmatterData={metadata} /></section>;
  }
  
  if (type === 'tags') {
    return <section key={type} aria-label="Tags and categories"><Tags frontmatter={metadata} /></section>;
  }
  
  return null;
};

export function Layout(props: LayoutProps) {
  const { title, components, metadata, slug, hideHeader, fullWidth, showHero = true } = props;
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
        author: typeof metadata.authorInfo === 'string' 
          ? metadata.authorInfo 
          : metadata.authorInfo?.name || SITE_CONFIG.author,
        datePublished: metadata.datePublished || new Date().toISOString().split('T')[0],
        dateModified: metadata.lastModified,
        url: `${SITE_CONFIG.url}/${slug}`,
        image: metadata.image,
        keywords: metadata.keywords
      }) : null;

    return (
      <main className={containerClass} id="main-content" role="main">
        {jsonLdData && <JsonLD data={jsonLdData} />}
        {!hideHeader && <ArticleHeader title={title} metadata={metadata} showHero={showHero} slug={slug} />}
        
        <article role="article" className="space-y-8">
          {ARTICLE_COMPONENT_ORDER.map(type => renderComponent(type, components[type], metadata))}
        </article>
      </main>
    );
  }

  // Regular page layout
  return (
    <main className={containerClass} id="main-content" role="main">
      {!showHero && !fullWidth && <div className={SPACER_CLASSES} aria-hidden="true" />}
      
      {title && !fullWidth && (
        <div className="mb-8">
          <Title level="page" title={title} />
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
