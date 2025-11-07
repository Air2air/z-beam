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
import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { MetricsGrid } from '../MetricsCard/MetricsGrid';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { RegulatoryStandards } from '../RegulatoryStandards';
import { EnvironmentalImpact } from '../EnvironmentalImpact';
import { MaterialFAQ } from '../FAQ/MaterialFAQ';
import { Breadcrumbs } from '../Navigation/breadcrumbs';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';
import { DateMetadata } from '../DateMetadata/DateMetadata';

const ARTICLE_COMPONENT_ORDER = ['content', 'metricsmachinesettings', 'metricsproperties', 'tags'] as const;
const SPACER_CLASSES = "h-8 sm:h-12 md:h-16"; // Reduced spacer height for tighter layout

// Helper: Extract material name from metadata or slug
const getMaterialName = (metadata: any, slug?: string): string => {
  const subject = (metadata?.subject || '') as string;
  if (subject) return subject.toLowerCase();
  if (!slug) return '';
  return slug.includes('-') ? slug.split('-')[0].toLowerCase() : slug.toLowerCase();
};

// Helper: Check if hero content exists
const hasHeroContent = (metadata: any, materialName?: string) => {
  return metadata?.image || 
    metadata?.images?.hero?.url || 
    metadata?.video || 
    materialName;
};

// Helper: Render article header section
const ArticleHeader = ({ title, metadata, slug, customHeroOverlay }: any) => {
  const materialName = getMaterialName(metadata, slug);
  
  // Generate breadcrumbs from frontmatter or category/subcategory
  const pathname = slug ? `/${slug}` : '/';
  const breadcrumbData = generateBreadcrumbs(metadata, pathname);
  
  // Check if we have hero image/video from markdown or material-based hero
  const showHero = hasHeroContent(metadata, materialName);
  
  return (
    <header className="header-section mb-6">
      {showHero ? (
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

      <DateMetadata 
        datePublished={metadata?.datePublished}
        lastModified={metadata?.lastModified}
      />

      {metadata?.materialProperties && (
        <MetricsGrid 
          metadata={metadata} 
          dataSource="materialProperties" 
          titleFormat="comparison" 
          layout="auto" 
          showTitle 
          searchable
          defaultExpandedCategories={['thermal', 'mechanical', 'optical_laser']}
        />
      )}

      {metadata?.machineSettings && (
        <MetricsGrid 
          metadata={metadata} 
          dataSource="machineSettings" 
          titleFormat="comparison"
          layout="auto" 
          showTitle 
          searchable 
        />
      )}

      {metadata?.caption && (
        <Caption frontmatter={metadata} config={{ showTechnicalDetails: true, showMetadata: true }} />
      )}

      {metadata?.environmentalImpact && Object.keys(metadata.environmentalImpact).length > 0 && (
        <EnvironmentalImpact environmentalImpact={metadata.environmentalImpact} />
      )}

      {/* Material-specific FAQ section - from frontmatter */}
      {metadata?.name && metadata?.faq && (
        <MaterialFAQ
          materialName={metadata.name}
          faq={Array.isArray(metadata.faq) ? metadata.faq : (metadata.faq as any)?.questions || []}
        />
      )}
    </header>
  );
};

// Helper: Render article component
const renderComponent = (type: string, component: any, metadata: any) => {
  if (!component) return null;

  if (type === 'metricsmachinesettings' && component.config) {
    const metricsMetadata = { 
      slug: metadata?.slug || '', 
      title: component.config.title || '', 
      description: component.config.description || '', 
      machineSettings: component.config.machineSettings || {} 
    };
    return (
      <div key={type} className="mb-16">
        <MetricsGrid 
          metadata={metricsMetadata} 
          dataSource="machineSettings" 
          title={component.config.title} 
          className={component.config.className} 
          searchable 
        />
      </div>
    );
  }

  if (type === 'metricsproperties' && component.config) {
    // Support both component.config.properties AND metadata.properties (from frontmatter)
    const properties = component.config.properties || metadata?.properties || {};
    const propertiesMetadata = { 
      slug: metadata?.slug || '', 
      title: component.config.title || metadata?.title || '',
      description: component.config.description || '', 
      materialProperties: component.config.materialProperties,
      properties: properties
    };
    return (
      <div key={type} className="mb-16">
        <MetricsGrid 
          metadata={propertiesMetadata} 
          dataSource="materialProperties"
          title={component.config.title} 
          className={component.config.className} 
          searchable
          defaultExpandedCategories={['thermal', 'mechanical', 'optical_laser']}
        />
      </div>
    );
  }

  const { content, config } = component;
  
  if (type === 'content' && content) {
    return (
      <MarkdownRenderer key={type} content={content} convertMarkdown={false} />
    );
  }
  
  if (type === 'tags') {
    return <Tags key={type} frontmatter={metadata} />;
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

    // NOTE: Material pages use MaterialJsonLD component which includes Article schema in @graph
    // No need to generate duplicate Article schema here - MaterialJsonLD handles it

    return (
      <main className={containerClass} id="main-content" role="main">
        <ArticleHeader title={title} metadata={metadata} slug={slug} customHeroOverlay={customHeroOverlay} />
        
        <article role="article" className="space-y-8">
          {ARTICLE_COMPONENT_ORDER.map(type => renderComponent(type, components[type], metadata))}
        </article>
        
        {/* Additional sections like RelatedMaterials, RegulatoryStandards, Dataset */}
        {props.children && (
          <div className="mt-8 space-y-8">
            {props.children}
          </div>
        )}
      </main>
    );
  }

  // Regular page layout
  // Check if we have hero content to render
  const showHero = hasHeroContent(metadata);
  
  // Generate breadcrumbs for regular pages
  const pathname = slug ? `/${slug}` : '/';
  const breadcrumbData = generateBreadcrumbs(metadata || null, pathname);
  const isHomePage = !slug || pathname === '/';

  return (
    <main className={containerClass} id="main-content" role="main">
      {/* Hero renders if content exists, otherwise spacer maintains consistent vertical rhythm */}
      {showHero ? (
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
          <Title 
            level="page" 
            title={title} 
            subtitle={props.subtitle} 
            rightContent={props.rightContent}
          />
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
