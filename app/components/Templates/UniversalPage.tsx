// app/components/Templates/UniversalPage.tsx
// Universal page template to replace redundant page components

import { UniversalLayout } from '../Layout/LayoutSystem';
import { loadPageData } from '../../utils/contentAPI';
import { logger } from '../../utils/logger';
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
}

/**
 * Universal page component that can handle different content loading strategies
 */
export async function UniversalPage({
  slug,
  title,
  description,
  useContentAPI = true,
  markdownPath,
  errorTitle = `Error Loading ${slug.charAt(0).toUpperCase() + slug.slice(1)} Page`,
  errorMessage = `We're sorry, but there was an error loading the ${slug} page.`,
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
        metadata: { ...data, title: title || data.title, description: description || data.description },
        components: { content: { content: htmlContent } }
      };
    } else {
      throw new Error('Either useContentAPI must be true or markdownPath must be provided');
    }
    
    return (
      <UniversalLayout
        variant="article"
        components={pageData.components}
        metadata={pageData.metadata}
        slug={slug}
        title={pageData.metadata?.title || title}
      />
    );
  } catch (error) {
    logger.error(`Error loading ${slug} page`, error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">{errorTitle}</h1>
        <p className="mt-4">{errorMessage}</p>
      </div>
    );
  }
}

/**
 * Factory function to create page components with specific configurations
 */
export function createPageComponent(config: UniversalPageProps) {
  return async function GeneratedPageComponent() {
    return <UniversalPage {...config} />;
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
  },
  contact: {
    slug: 'contact',
    title: 'Contact Z-Beam',
    description: 'Get in touch with Z-Beam\'s team of laser cleaning experts for consultations, demonstrations, or information about our industrial cleaning solutions.',
    useContentAPI: false,
    markdownPath: 'app/pages/_md/contact.md',
  },
  services: {
    slug: 'services',
    title: 'Services | Z-Beam Laser Cleaning Solutions',
    description: 'Explore Z-Beam\'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.',
    useContentAPI: false,
    markdownPath: 'app/pages/_md/services.md',
    dynamic: 'force-static' as const,
    revalidate: false,
  }
} as const;
