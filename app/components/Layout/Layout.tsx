// app/components/Layout/Layout.tsx
import { Content } from "../Content/Content";
import { Table } from "../Table/Table";
import { PropertiesTable } from "../PropertiesTable";
import { Bullets } from "../Bullets/Bullets";
import { Caption } from "../Caption/Caption";
import { Tags } from "../Tags/Tags";
import { Author } from '../Author/Author';
import { JsonLD, schemas } from '../JsonLD/JsonLD';
import { Hero } from '../Hero/Hero';

// Update component order to include propertiestable and tags
const COMPONENT_ORDER = [
  'propertiestable',
  'content',
  'caption',
  'bullets',
  'table',
  'tags'  // Add tags to the component order
] as const;

interface LayoutProps {
  components: Record<string, any> | null; // Make components accept null
  metadata?: any;
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
        {!hideHeader && (
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {title || metadata?.subject || (slug ? `Article: ${slug}` : '')}
            </h1>
          </header>
        )}
        <div className="prose dark:prose-invert">
          <p>No content available for this page.</p>
        </div>
      </section>
    );
  }
  
  // Determine the title to display
  const displayTitle = title || metadata?.subject || (slug ? `Article: ${slug}` : '');
  
  // Extract material name for hero image (from subject or slug)
  const materialName = metadata?.subject?.toLowerCase() || 
    (slug?.includes('-') ? slug.split('-')[0].toLowerCase() : slug?.toLowerCase());
  
  // Generate JSON-LD if we have enough metadata
  const jsonLdData = metadata?.title && metadata?.description ? 
    schemas.technicalArticle({
      headline: metadata.title,
      description: metadata.description,
      author: metadata.author || 'Z-Beam',
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
      
      {/* Add Hero component */}
      {!hideHeader && materialName && (
        <Hero
          title={displayTitle}
          subtitle={metadata?.description}
          frontmatter={metadata}
          theme="dark"
          align="center"
        />
      )}
      
      {!hideHeader && displayTitle && !materialName && (
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {displayTitle}
          </h1>
          
          {/* Add author component if metadata has author */}
          {metadata?.author && (
            <Author 
              author={metadata.author} 
              className="mt-2"
            />
          )}
        </header>
      )}

      {/* Render components in specified order */}
      {COMPONENT_ORDER.map(type => {
        if (!components[type]) return null;
        
        const { content, config } = components[type];
        
        switch(type) {
          case 'propertiestable':
            return <PropertiesTable key={type} content={content} config={config} />;
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