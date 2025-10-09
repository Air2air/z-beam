/**
 * @component StaticPage
 * @purpose Reusable page component for simple static content pages
 * @dependencies @/types (ArticleMetadata), Layout, marked, js-yaml
 * @aiContext Use this for any static page that loads from content/pages/*.yaml + content/components/text/*.md
 *           Automatically handles YAML config, markdown content, and hero images
 * 
 * @usage
 * // In app/[pagename]/page.tsx:
 * import { StaticPage } from "../components/StaticPage/StaticPage";
 * 
 * export default async function MyPage() {
 *   return <StaticPage slug="mypage" fallbackTitle="My Page" />;
 * }
 * 
 * @when_to_use
 * ✅ Simple pages with YAML config + markdown content (services, rental)
 * ❌ Pages with custom React components (contact form, interactive widgets)
 * ❌ Pages using loadPageData with component arrays (about, materials)
 * ❌ Dynamic routes with parameters ([slug], [category])
 */
// app/components/StaticPage/StaticPage.tsx
import { Layout } from "../Layout/Layout";
import { Callout } from "../Callout/Callout";
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import yaml from 'js-yaml';
import type { ArticleMetadata } from '@/types';

export interface StaticPageProps {
  /**
   * Slug for the page (e.g., 'services', 'rental', 'contact')
   * Used to load both YAML config and markdown content
   */
  slug: string;
  
  /**
   * Optional fallback title if YAML doesn't have one
   */
  fallbackTitle?: string;
  
  /**
   * Optional fallback description if YAML doesn't have one
   */
  fallbackDescription?: string;
}

/**
 * Reusable static page component
 * Loads configuration from content/pages/{slug}.yaml
 * Loads content from content/components/text/{slug}.md
 */
export async function StaticPage({ 
  slug, 
  fallbackTitle, 
  fallbackDescription 
}: StaticPageProps) {
  // Load YAML configuration
  const yamlPath = path.join(process.cwd(), 'content/pages', `${slug}.yaml`);
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { showHero?: boolean };
  
  // Load markdown content
  const mdPath = path.join(process.cwd(), 'content/components/text', `${slug}.md`);
  const markdownContent = await fs.readFile(mdPath, 'utf8');
  
  // Convert to HTML
  const htmlContent = marked(markdownContent);
  
  // Determine which callout configuration to use
  const calloutsToRender = pageConfig.callouts || (pageConfig.callout ? [pageConfig.callout] : []);

  return (
    <Layout
      title={pageConfig.title || fallbackTitle || slug}
      description={pageConfig.description || fallbackDescription}
      showHero={pageConfig.showHero ?? false}
      metadata={pageConfig}
    >
      {/* Optional Callout section(s) - renders before main content if configured */}
      {calloutsToRender.length > 0 && calloutsToRender.map((callout, index) => (
        <Callout
          key={`callout-${index}`}
          heading={callout.heading}
          text={callout.text}
          image={callout.image}
          imagePosition={callout.imagePosition}
          theme={callout.theme}
          variant={callout.variant}
        />
      ))}
      
      {/* Main markdown content */}
      <div className="prose prose-lg max-w-none dark:prose-invert" 
           dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </Layout>
  );
}
