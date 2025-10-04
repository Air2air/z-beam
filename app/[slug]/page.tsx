import { notFound } from "next/navigation";
import { getArticle } from "../utils/contentAPI"; // Updated to use contentAPI
import { Layout } from "../components/Layout/Layout";
import { createMetadata, ArticleMetadata } from "../utils/metadata";
import { getTagsContentWithMatchCounts } from "../utils/tags";
import { getAllArticleSlugs } from "../utils/contentAPI";
import { createJsonLdForArticle } from "../utils/jsonld-helper";
import { PageProps } from "../../types";
import { SITE_CONFIG } from "../utils/constants";

// Force static generation for all article pages
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

// Generate static params for all article slugs
export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs();
    
    // Filter out any invalid slugs
    const validSlugs = slugs.filter(slug => 
      slug && 
      slug !== '#' && 
      slug !== 'undefined' && 
      slug !== 'null' &&
      slug.length > 0
    );
    
    return validSlugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  if (!slug) {
    return {
      title: `Page Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested page could not be found.'
    };
  }
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      return {
        title: `Page Not Found | ${SITE_CONFIG.shortName}`,
        description: 'The requested page could not be found.'
      };
    }
    
    // Use createMetadata with the existing metadata from the markdown file
    return createMetadata({
      ...article.metadata,
      canonical: (article.metadata.canonical as string) || `${SITE_CONFIG.url}/${slug}`
    } as unknown as ArticleMetadata);
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error);
    return {
      title: SITE_CONFIG.shortName,
      description: 'Technical information about industrial lasers.'
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (!slug) {
    return notFound();
  }
  
  // Validate slug - prevent meaningless values from even trying
  if (!slug || slug === '#' || slug === 'undefined' || slug === 'null') {
    console.error(`Invalid slug detected: "${slug}"`);
    notFound();
  }
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      notFound();
    }
    
    // Load tags content with match counts for this article
    const { content: tagsContent, counts: tagCounts } = await getTagsContentWithMatchCounts(slug);
    
    // Create JSON-LD schemas for this article
    const jsonLdSchema = createJsonLdForArticle(article, slug);
    
    // Prepare the components object with tags content and counts
    const components = article.components || {};
    
    // Only add tags component if we have tags content
    if (tagsContent && components.tags) {
      components.tags = {
        ...components.tags,
        content: tagsContent, // Set the actual tags content from YAML file
        config: {
          ...(components.tags.config || {}),
          articleMatchCount: tagCounts
        }
      };
    }
    
    // Return the article layout with JSON-LD schema
    return (
      <>
        {/* Comprehensive JSON-LD Structured Data */}
        {jsonLdSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLdSchema, null, 2)
            }}
          />
        )}
        
        <Layout components={components} metadata={article.metadata as unknown as ArticleMetadata} slug={slug} />
      </>
    );
  } catch (error) {
    console.error(`Error rendering page for ${slug}:`, error);
    notFound();
  }
}
