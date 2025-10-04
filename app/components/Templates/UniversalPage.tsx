// app/components/Templates/UniversalPage.tsx
// Universal page template to replace redundant page components

import { UniversalLayout } from '../Layout/Layout';
import { loadPageData } from '../../utils/contentAPI';
import { CONTAINER_STYLES } from '../../utils/containerStyles';
import { Layout } from '../Layout/Layout';
import { Caption } from '../Caption/Caption';
import { Title } from '../Title';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

interface UniversalPageProps {
  slug: string;
  title?: string;
  description?: string;
  useContentAPI?: boolean;
  markdownPath?: string;
  errorTitle?: string;
  errorMessage?: string;
  dynamic?: 'force-static' | 'force-dynamic' | 'auto';
  revalidate?: number | false;
  showHero?: boolean; // Add Hero toggle control
}

/**
 * Universal page component that can handle different content loading strategies
 * This is a Server Component that loads data asynchronously
 */
async function UniversalPageComponent({
  slug,
  title,
  description,
  useContentAPI = true,
  markdownPath,
  errorTitle = `Error Loading ${slug.charAt(0).toUpperCase() + slug.slice(1)} Page`,
  errorMessage = `We're sorry, but there was an error loading the ${slug} page.`,
  showHero = true, // Default to showing Hero
}: UniversalPageProps) {
  try {
    let pageData;
    
    if (useContentAPI) {
      // Use the consolidated contentAPI (for pages like 'about')
      const { metadata, components } = await loadPageData(slug);
      pageData = { metadata, components };
    } else if (markdownPath) {
      // Load from specific markdown file (for pages like 'contact', 'services')
      const filePath = path.join(process.cwd(), markdownPath);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      const htmlContent = await marked(content);
      
      pageData = {
        metadata: { 
          ...data, 
          title: title || data.title, 
          description: description || data.description,
          // Pass hero fields from frontmatter
          image: data.heroImage || data.image,
          video: data.heroVideo || data.video,
          images: data.heroImage ? {
            hero: {
              url: data.heroImage,
              alt: data.heroAlt || `Hero image for ${data.title || title}`
            }
          } : data.images
        },
        components: { content: { content: htmlContent } }
      };
    } else {
      throw new Error('Either useContentAPI must be true or markdownPath must be provided');
    }
    
    return (
      <UniversalLayout
        components={pageData.components}
        metadata={pageData.metadata}
        slug={slug}
        title={title || pageData.metadata?.title}
        showHero={showHero}
      />
    );
  } catch (error) {
    console.error(`Error loading ${slug} page`, error);
    
    return (
      <div className={CONTAINER_STYLES.standard}>
        <Title level="page" title={errorTitle} />
        <p className="mt-4">{errorMessage}</p>
      </div>
    );
  }
}

// Default export for Next.js usage
export default UniversalPageComponent;

/**
 * Factory function to create page components with specific configurations
 */
export function createPageComponent(config: UniversalPageProps) {
  // Return an async function that uses the config to call UniversalPageComponent
  return async function GeneratedPageComponent() {
    return await UniversalPageComponent(config);
  };
}

/**
 * Predefined page configurations for common page types
 */
export const pageConfigs = {
  about: {
    slug: 'about',
    title: 'About Z-Beam',
    description: 'Learn about Z-Beam\'s mission, team, and expertise in laser cleaning technology.',
    useContentAPI: true,
    showHero: true, // Show Hero for about page
  },
  contact: {
    slug: 'contact',
    title: 'Contact Z-Beam',
    description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.',
    useContentAPI: false,
    markdownPath: 'app/pages/contact.md',
    showHero: false, // Hide Hero for contact page
  },
  services: {
    slug: 'services',
    title: 'Services | Z-Beam Laser Cleaning Solutions',
    description: 'Explore Z-Beam\'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.',
    useContentAPI: false,
    markdownPath: 'app/pages/services.md',
    dynamic: 'force-static' as const,
    revalidate: false,
    showHero: false, // Hide Hero for services page
  },
  rental: {
    slug: 'rental',
    title: 'Equipment Rental | Z-Beam',
    description: 'Rent professional laser cleaning equipment from Z-Beam. Flexible rental options for your industrial cleaning needs.',
    useContentAPI: false,
    markdownPath: 'app/pages/rental.md',
    dynamic: 'force-static' as const,
    revalidate: false,
    showHero: true, // Show Hero for rental page
  }
} as const;

// Named export for test compatibility - alias the default component
export const UniversalPage = UniversalPageComponent;
