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
import { Title } from '../Title/Title';
import { BadgeSymbol } from '../BadgeSymbol/BadgeSymbol';
import { ArticleMetadata, BadgeSymbolData } from '../../../types/core';
import { AuthorInfo } from '../../../types/components/author';
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
            <Title>
              {title || metadata?.subject || (slug ? `Article: ${slug}` : '')}
            </Title>
          )}
        </div>
      </section>
    );
  }
  
  // Determine the title to display with improved hierarchy
  const displayTitle = title || metadata?.title || metadata?.headline || metadata?.subject || (slug ? `Article: ${slug}` : '');
  
  // Determine the subtitle to display
  const displaySubtitle = metadata?.title ? metadata?.headline : metadata?.description;
  
  // Extract material name for hero image (from subject or slug)
  const materialName = extractSafeValue(metadata?.subject).toLowerCase() || 
    (slug && extractSafeValue(slug).includes('-') ? extractSafeValue(slug).split('-')[0].toLowerCase() : extractSafeValue(slug || '').toLowerCase());
  
  // Generate JSON-LD if we have enough metadata
  const jsonLdData = metadata?.title && metadata?.description ? 
    schemas.technicalArticle({
      headline: metadata.title,
      description: metadata.description,
      author: typeof metadata.author === 'string' 
        ? metadata.author 
        : metadata.author?.author_name 
          ? { name: metadata.author.author_name, ...metadata.author }
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
      
      {/* Add Hero component (now just for background image) */}
      {!hideHeader && materialName && (
        <Hero
          frontmatter={metadata}
          theme="dark"
          align="center"
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
                {/* Add discrete Title component after PropertiesTable */}
                {!hideHeader && displayTitle && (
                  <Title subtitle={displaySubtitle}>
                    {displayTitle}
                  </Title>
                )}
                {/* Add Author component after Title - using YAML data only */}
                                {/* Add Author component after Title - using YAML authorInfo data only */}
                {!hideHeader && metadata?.authorInfo && (
                  (() => {
                    const authorInfo = metadata.authorInfo as AuthorInfo;
                    return (
                      <Author 
                        author={{
                          author_name: authorInfo.name || 'Unknown Author',
                          credentials: authorInfo.title,
                          specialties: authorInfo.expertise ? [authorInfo.expertise] : authorInfo.profile?.expertiseAreas,
                          author_country: authorInfo.country,
                          avatar: authorInfo.image,
                          bio: authorInfo.profile?.description,
                          title: authorInfo.title
                        }}
                        showAvatar={true}
                        showCredentials={true}
                        showCountry={true}
                        showSpecialties={true}
                        className="mt-2 mb-4"
                      />
                    );
                  })()
                )}
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