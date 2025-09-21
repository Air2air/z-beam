import React from 'react';
import { PropertiesTable } from '../PropertiesTable/PropertiesTable';
import { BadgeSymbol } from '../BadgeSymbol/BadgeSymbol';
import { Content } from '../Content/Content';
import { Caption } from '../Caption/Caption';
import { Bullets } from '../Bullets/Bullets';
import { Table } from '../Table/Table';
import { Tags } from '../Tags/Tags';
import { ArticleHeader } from '../Article/ArticleHeader';
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { CONTAINER_STYLES } from '../../utils/containerStyles';
import type { 
  ComponentData, 
  ComponentType, 
  MarkdownMetadata,
  BadgeSymbolData 
} from '@/types';

// Component rendering order
const COMPONENT_ORDER: ComponentType[] = [
  'propertiestable',
  'badgesymbol',
  'content',
  'caption',
  'bullets',
  'table',
  'tags'
];

export interface LayoutProps {
  components?: Partial<Record<ComponentType, ComponentData>>;
  metadata?: MarkdownMetadata;
  slug?: string;
  title?: string | null;
  hideHeader?: boolean;
  className?: string;
}

export default function Layout({
  components = {},
  metadata,
  slug,
  title,
  hideHeader = false,
  className = CONTAINER_STYLES.standard
}: LayoutProps) {
  // If no content provided, render a simple title-only layout
  if (!components || Object.keys(components).length === 0) {
    return (
      <main className={className} id="main-content" role="main">
        <div className="container-content">
          {title && (
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
              {title}
            </h1>
          )}
        </div>
      </main>
    );
  }
  
  // Generate JSON-LD if we have enough metadata
  const jsonLdData = metadata?.title && metadata?.description ? 
    schemas.technicalArticle({
      headline: metadata.title,
      description: metadata.description,
      author: typeof metadata.authorInfo === 'string' 
        ? metadata.authorInfo 
        : metadata.authorInfo?.name 
          ? {
              name: metadata.authorInfo.name,
              title: metadata.authorInfo.title,
              country: metadata.authorInfo.country,
              image: metadata.authorInfo.image
            }
          : 'Z-Beam',
      datePublished: metadata.datePublished || new Date().toISOString().split('T')[0],
      dateModified: metadata.lastModified,
      url: `https://z-beam.com/${slug}`,
      image: metadata.image,
      keywords: metadata.keywords
    }) : null;
  
  return (
    <main className={className} id="main-content" role="main">
      {/* Only include JSON-LD here, not other meta tags */}
      {jsonLdData && <JsonLD data={jsonLdData} />}
      
      {/* Article header section */}
      {!hideHeader && (
        <header role="banner">
          <ArticleHeader 
            metadata={metadata}
            slug={slug}
            title={title || ''}
          />
        </header>
      )}

      {/* Main article content */}
      <article role="article">
        {/* Render components in specified order */}
        {COMPONENT_ORDER.map(type => {
          if (!components[type]) return null;
          
          const { content, config } = components[type];
          
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
                  <BadgeSymbol content={content} config={config as unknown as BadgeSymbolData} />
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
            case 'bullets':
              return (
                <section key={type} aria-label="Key points">
                  <Bullets content={content} config={config} />
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
