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
      <section className={className}>
        <div className="prose dark:prose-invert">
          <p>No content available for this page.</p>
          {!hideHeader && (
            <h1 className="text-2xl font-bold mb-4">
              {String(title || metadata?.subject || (slug ? `Article: ${slug}` : 'No Title'))}
            </h1>
          )}
        </div>
      </section>
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
    <section className={className}>
      {/* Only include JSON-LD here, not other meta tags */}
      {jsonLdData && <JsonLD data={jsonLdData} />}
      
      {/* Simplified header with extracted component */}
      {!hideHeader && (
        <ArticleHeader 
          metadata={metadata}
          slug={slug}
          title={title}
        />
      )}

      {/* Render components in specified order */}
      {COMPONENT_ORDER.map(type => {
        if (!components[type]) return null;
        
        const { content, config } = components[type];
        
        switch(type) {
          case 'propertiestable':
            return (
              <div key={type}>
                <PropertiesTable content={content} config={config} />
              </div>
            );
          case 'badgesymbol':
            return <BadgeSymbol key={type} content={content} config={config as unknown as BadgeSymbolData} />;
          case 'content':
            return <Content key={type} content={content} config={config} />;
          case 'caption':
            return <Caption key={type} content={content} frontmatter={metadata} config={config} />;
          case 'bullets':
            return <Bullets key={type} content={content} config={config} />;
          case 'table':
            return <Table key={type} content={content} config={config} />;
          case 'tags':
            return <Tags key={type} content={content} config={config} />;
          default:
            return null;
        }
      })}
    </section>
  );
}