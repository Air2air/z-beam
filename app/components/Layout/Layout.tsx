// app/components/Layout/Layout.tsx
import { Content } from "../Content/Content";
import { Table } from "../Table/Table";
import { PropertiesTable } from "../PropertiesTable";
import { Bullets } from "../Bullets/Bullets";
import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { BadgeSymbol } from '../BadgeSymbol/BadgeSymbol';
import { ArticleHeader } from './ArticleHeader';
import { AuthorInfo, ArticleMetadata, BadgeSymbolData } from '@/types';
import { ComponentData } from '../../utils/contentAPI';
import { extractSafeValue } from '../../utils/stringHelpers';

// Update component order to include propertiestable, author, and tags
const COMPONENT_ORDER = [
  'propertiestable',
  'badgesymbol',
  'content',
  'caption',
  'bullets',
  'table',
  'tags'  // Remove author from here since it's handled after title
] as const;

interface LayoutProps {
  components: Record<string, ComponentData> | null; // Keep as ComponentData for compatibility
  metadata?: ArticleMetadata; // Use centralized type
  slug?: string;
  title?: string;
  hideHeader?: boolean;
  className?: string;
}

export function Layout({ 
  components, 
  metadata, 
  slug,
  title,
  hideHeader = false,
  className = "max-w-4xl mx-auto px-4 py-8"
}: LayoutProps) {

  // Add null check before accessing components
  if (!components || Object.keys(components).length === 0) {
    // Return a basic layout or message for pages without components
    return (
      <main className={className} id="main-content" role="main">
        <div className="prose dark:prose-invert">
          <p>No content available for this page.</p>
          {!hideHeader && (
            <h1 className="text-2xl font-bold mb-4">
              {String(title || metadata?.subject || (slug ? `Article: ${slug}` : 'No Title'))}
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
      author: typeof metadata.author === 'string' 
        ? metadata.author 
        : metadata.author?.name 
          ? {
              name: metadata.author.name,
              title: metadata.author.title,
              country: metadata.author.country,
              image: metadata.author.image
            }
          : 'Z-Beam',
      datePublished: metadata.datePublished || new Date().toISOString().split('T')[0],
      dateModified: metadata.dateModified,
      url: metadata.canonical || `https://z-beam.com/${slug}`,
      image: metadata.ogImage,
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
            title={title}
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
                  <Caption content={content} frontmatter={metadata} config={config} />
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