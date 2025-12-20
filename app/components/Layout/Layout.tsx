// app/components/Layout/Layout.tsx
// Single, simplified layout system for maximum reusability and responsiveness

import React from 'react';
import dynamic from 'next/dynamic';
import { LayoutProps } from '@/types';
import { CONTAINER_STYLES } from '../../utils/containerStyles';
import { Title } from '../Title';
import { Hero } from "../Hero/Hero";
import { Author } from "../Author/Author";
import MicroSkeleton from '../Micro/MicroSkeleton';
import { PropertyBars } from '../PropertyBars/PropertyBars';
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { Settings } from 'lucide-react';
import { EnvironmentalImpact } from '../EnvironmentalImpact';
import { ExpertAnswers } from '../ExpertAnswers/ExpertAnswers';
import { Breadcrumbs } from '../Navigation/breadcrumbs';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';
import { SectionContainer } from '../SectionContainer/SectionContainer';

// Dynamic import Micro component for code-splitting (reduces initial bundle by ~15-20 KB)
// Below-fold content, no SEO impact from ssr: false
const _Micro = dynamic(
  () => import('../Micro/Micro').then(mod => mod.Micro),
  {
    loading: () => <MicroSkeleton />,
    ssr: false,
  }
);

const ARTICLE_COMPONENT_ORDER = ['content', 'metricsmachinesettings', 'metricsproperties'] as const;
const SPACER_CLASSES = "spacer"; // Responsive spacer height from responsive.css

// Helper: Check if hero content exists
const hasHeroContent = (metadata: any) => {
  return metadata?.images?.hero?.url || metadata?.video?.id;
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
      <SectionContainer 
        key={type}
        title={component.config.title || 'Machine Settings'}
        className="mb-8"
      >
        <PropertyBars 
          metadata={metricsMetadata} 
          dataSource="machineSettings" 
          className={component.config.className || ''}
        />
      </SectionContainer>
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
      <SectionContainer 
        key={type}
        title={component.config.title || 'Material Properties'}
        className="mb-8"
      >
        <PropertyBars 
          metadata={propertiesMetadata} 
          dataSource="materialProperties"
          className={component.config.className || ''}
        />
      </SectionContainer>
    );
  }

  const { content, config: _config } = component;
  
  if (type === 'content' && content) {
    return (
      <MarkdownRenderer key={type} content={content} convertMarkdown={false} />
    );
  }
  
  return null;
};

export function Layout(props: LayoutProps) {
  const { title, components, metadata, slug, customHeroOverlay } = props;
  const containerClass = props.className || CONTAINER_STYLES.main;
  
  // Common page setup
  const pathname = slug ? `/${slug}` : '/';
  const breadcrumbData = generateBreadcrumbs(metadata || null, pathname);
  const isHomePage = !slug || pathname === '/';
  const showHero = hasHeroContent(metadata);

  // Handle empty article content
  if (components && Object.keys(components).length === 0) {
    return (
      <main className={containerClass} id="main-content" role="main">
        <div className="text-center py-12">
          <Title level="page" title={title || 'Content Not Available'} />
          <p className="text-muted">
            This page is currently being prepared. Please check back later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={containerClass} id="main-content" role="main">
      {/* Hero Section - common to both layouts */}
      {showHero ? (
        <Hero frontmatter={metadata} theme="dark" customOverlay={customHeroOverlay} />
      ) : (
        <div className={SPACER_CLASSES} aria-hidden="true" />
      )}

      {/* Breadcrumbs - skip on homepage */}
      {!isHomePage && <Breadcrumbs breadcrumbData={breadcrumbData} />}

      {/* Article Header - only for pages with components */}
      {components ? (
        <header className="header-section mb-6">
          <Author 
            frontmatter={metadata}
            showAvatar showCredentials showCountry showSpecialties
            className="mb-4"
          />
          <Title 
            level="page" 
            title={title || metadata?.title || 'Article'} 
            description={(() => {
              const desc = metadata?.description || metadata?.contamination_description;
              if (typeof desc === 'object' && desc !== null && 'before' in desc) {
                return (desc as { before?: string }).before;
              }
              return typeof desc === 'string' ? desc : undefined;
            })()}
          />

          {metadata?.machineSettings && !metadata?.materialProperties && (
            <SectionContainer 
              title={metadata.title && metadata.title.toLowerCase().includes('settings') 
                ? metadata.title 
                : metadata.title 
                  ? `${metadata.title} Machine Settings` 
                  : 'Machine Settings'}
              icon={<Settings className="w-5 h-5 text-muted" />}
              actionText="Materials"
              actionUrl={metadata?.category && metadata?.subcategory && metadata?.slug
                ? `/materials/${metadata.category}/${metadata.subcategory}/${metadata.slug.replace('-settings', '-laser-cleaning')}`
                : undefined
              }
              className="mb-8"
            >
              <PropertyBars 
                metadata={metadata} 
                dataSource="machineSettings" 
              />
            </SectionContainer>
          )}

          {metadata?.environmental_impact && Object.keys(metadata.environmental_impact).length > 0 && (
            <EnvironmentalImpact environmentalImpact={metadata.environmental_impact} />
          )}

          {metadata?.name && metadata?.expertAnswers && (
            <ExpertAnswers
              materialName={metadata.name}
              answers={metadata.expertAnswers}
              defaultExpert={metadata.author ? {
                name: metadata.author.name,
                title: metadata.author.title,
                credentials: metadata.author.credentials,
                expertise: Array.isArray(metadata.author.expertise) 
                  ? metadata.author.expertise 
                  : metadata.author.expertise ? [metadata.author.expertise] : undefined,
                affiliation: typeof metadata.author.affiliation === 'string' 
                  ? metadata.author.affiliation 
                  : (metadata.author.affiliation && typeof metadata.author.affiliation === 'object' && 'name' in metadata.author.affiliation) 
                    ? (metadata.author.affiliation as { name: string }).name 
                    : undefined,
                image: metadata.author.image,
                email: metadata.author.email
              } : undefined}
            />
          )}
        </header>
      ) : (
        /* Regular page title */
        title && (
          <Title 
            level="page" 
            title={title} 
            description={props.description} 
            rightContent={props.rightContent}
          />
        )
      )}

      {/* Article Content - render components */}
      {components && (
        <article role="article" className="space-y-8">
          {ARTICLE_COMPONENT_ORDER.map(type => renderComponent(type, components[type], metadata))}
        </article>
      )}

      {/* Children - additional sections or page content */}
      {props.children && (
        <div className={components ? "mt-8 space-y-8" : "space-y-6"}>
          {props.children}
        </div>
      )}
      
      {/* Safety Warning - disabled temporarily */}
      {/* <SafetyWarning className="mt-12" /> */}
    </main>
  );
}

// Simplified exports - one Layout component
export default Layout;
