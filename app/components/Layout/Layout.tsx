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
import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { MetricsGrid } from '../MetricsCard/MetricsGrid';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { EnvironmentalImpact } from '../EnvironmentalImpact';
import { MaterialFAQ } from '../FAQ/MaterialFAQ';
import { Breadcrumbs } from '../Navigation/breadcrumbs';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';

const ARTICLE_COMPONENT_ORDER = ['content', 'metricsmachinesettings', 'metricsproperties', 'tags'] as const;
const SPACER_CLASSES = "h-8 sm:h-12 md:h-16"; // Reduced spacer height for tighter layout

// Helper: Extract material name from metadata or slug
const getMaterialName = (metadata: any, slug?: string) => {
  return extractSafeValue(metadata?.subject, 'subject', '').toLowerCase() ||
    (slug?.includes('-') ? slug.split('-')[0].toLowerCase() : slug?.toLowerCase() || '');
};

// Helper: Render article header section
const ArticleHeader = ({ title, metadata, slug, customHeroOverlay }: any) => {
  const materialName = getMaterialName(metadata, slug);
  
  // Generate breadcrumbs from frontmatter or category/subcategory
  const pathname = slug ? `/${slug}` : '/';
  const breadcrumbData = generateBreadcrumbs(metadata, pathname);
  
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

      <Breadcrumbs breadcrumbData={breadcrumbData} />

      <Title 
        level="page" 
        title={title || metadata?.title || 'Article'} 
        subtitle={metadata?.subtitle}
      />
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
          <MetricsGrid 
            metadata={metadata} 
            dataSource="materialProperties" 
            titleFormat="comparison" 
            layout="auto" 
            showTitle 
            searchable
            defaultExpandedCategories={['thermal', 'mechanical', 'optical_laser']}
          />
        </section>
      )}

      {metadata?.machineSettings && (
        <section aria-labelledby="machine-settings-heading" className="my-8">
          <MetricsGrid metadata={metadata} dataSource="machineSettings" titleFormat="comparison"
            layout="auto" showTitle searchable />
        </section>
      )}

      {metadata?.caption && (
        <section aria-labelledby="caption-section" className="mb-2">
          <Caption frontmatter={metadata} config={{ showTechnicalDetails: true, showMetadata: true }} />
        </section>
      )}

      {metadata?.environmentalImpact && Object.keys(metadata.environmentalImpact).length > 0 && (
        <section aria-labelledby="environmental-impact-section" className="my-8">
          <EnvironmentalImpact environmentalImpact={metadata.environmentalImpact} />
        </section>
      )}

      {/* Material-specific FAQ section - from frontmatter */}
      {metadata?.name && metadata?.faq && metadata.faq.length > 0 && (
        <section aria-labelledby="faq-section" className="my-8">
          <MaterialFAQ
            materialName={metadata.name}
            faq={metadata.faq}
          />
        </section>
      )}

      {metadata?.regulatoryStandards && metadata.regulatoryStandards.length > 0 && (
        <section aria-labelledby="regulatory-standards-section" className="my-8">
          <RegulatoryStandards standards={metadata.regulatoryStandards} />
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
    // NEW: Support both component.config.properties AND metadata.properties (from frontmatter)
    const properties = component.config.properties || metadata?.properties || {};
    const propertiesMetadata = { 
      slug: metadata?.slug || '', 
      title: component.config.title || metadata?.title || '',
      description: component.config.description || '', 
      materialProperties: component.config.materialProperties,  // Legacy categorized structure
      properties: properties  // NEW flat structure from frontmatter
    };
    return (
      <section key={type} aria-label="Material properties visualization">
        <MetricsGrid 
          metadata={propertiesMetadata} 
          dataSource="materialProperties"
          title={component.config.title} 
          className={component.config.className} 
          searchable
          defaultExpandedCategories={['thermal', 'mechanical', 'optical_laser']}
        />
      </section>
    );
  }

  const { content, config } = component;
  
  if (type === 'content' && content) {
    return (
      <section key={type} aria-label="Main content" className="max-w-none">
        <MarkdownRenderer content={content} convertMarkdown={false} />
      </section>
    );
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
  
  // Generate breadcrumbs for regular pages
  const pathname = slug ? `/${slug}` : '/';
  const breadcrumbData = generateBreadcrumbs(metadata || null, pathname);
  const isHomePage = !slug || slug === '' || pathname === '/';

  return (
    <main className={containerClass} id="main-content" role="main">
      {/* Hero renders if content exists, otherwise spacer maintains consistent vertical rhythm */}
      {hasHeroContent ? (
        <Hero frontmatter={metadata} theme="dark" customOverlay={customHeroOverlay} />
      ) : (
        <div className={SPACER_CLASSES} aria-hidden="true" />
      )}
      
      {/* Breadcrumbs - hide on homepage */}
      {!isHomePage && (
        <div className={fullWidth ? CONTAINER_STYLES.contentOnly : ""}>
          <Breadcrumbs breadcrumbData={breadcrumbData} />
        </div>
      )}
      
      {/* Title renders consistently for all pages - fullWidth pages need container */}
      {title && (
        <div className={fullWidth ? CONTAINER_STYLES.contentOnly : ""}>
          <div className="w-full">
            <Title 
              level="page" 
              title={title} 
              subtitle={props.subtitle} 
              rightContent={props.rightContent}
            />
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
