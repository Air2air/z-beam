/**
 * @component StaticPage
 * @purpose Reusable page component for simple static content pages
 * @dependencies @/types (ArticleMetadata), Layout, marked, js-yaml
 * @aiContext Use this for any static page that loads from content/pages/*.yaml with embedded markdown
 *           Automatically handles YAML config, markdown content (in content field), hero images, 
 *           and structured sections (workflow, benefits, equipment)
 * 
 * @usage
 * // In app/[pagename]/page.tsx:
 * import { StaticPage } from "../components/StaticPage/StaticPage";
 * 
 * export default async function MyPage() {
 *   return <StaticPage slug="mypage" fallbackTitle="My Page" />;
 * }
 * 
 * // In content/pages/mypage.yaml:
 * title: "My Page"
 * content: |
 *   # Markdown content here
 *   This is the page content.
 * workflow:
 *   - stage: "Step 1"
 *     order: 1
 *     name: "First Step"
 *     description: "Description"
 *     details: ["Detail 1", "Detail 2"]
 * 
 * @when_to_use
 * ✅ Simple pages with YAML config + embedded markdown content (services, rental)
 * ✅ Pages with structured sections (workflow, benefits, equipment)
 * ✅ Pages with callouts and hero images
 * ❌ Pages with custom React components (contact form, interactive widgets)
 * ❌ Pages using loadPageData with component arrays (about, materials)
 * ❌ Dynamic routes with parameters ([slug], [category])
 */
// app/components/StaticPage/StaticPage.tsx
import { Layout } from "../Layout/Layout";
import { ContentCard, ContentSection } from "../ContentCard";
import { BenefitsSection } from "../BenefitsSection/BenefitsSection";
import { EquipmentSection } from "../EquipmentSection/EquipmentSection";
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
 * Loads all configuration and content from content/pages/{slug}.yaml
 * Markdown content is embedded in the 'content' field of the YAML file
 * Automatically renders structured sections (workflow, benefits, equipment) when present
 */
export async function StaticPage({ 
  slug, 
  fallbackTitle, 
  fallbackDescription 
}: StaticPageProps) {
  // Load YAML configuration
  const yamlPath = path.join(process.cwd(), 'content/pages', `${slug}.yaml`);
  const yamlContent = await fs.readFile(yamlPath, 'utf8');
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { showHero?: boolean; content?: string };
  
  // Convert markdown content from YAML to HTML
  const htmlContent = pageConfig.content ? marked(pageConfig.content) : '';
  
  // Determine which content cards to render (unified or legacy)
  let contentCardsToRender: any[] = [];
  
  if (pageConfig.contentCards) {
    // Use unified contentCards field
    contentCardsToRender = pageConfig.contentCards;
  } else {
    // Fallback to legacy fields for backward compatibility
    const legacyCallouts = pageConfig.callouts || (pageConfig.callout ? [pageConfig.callout] : []);
    const legacyWorkflow = pageConfig.workflow || [];
    const legacyBenefits = pageConfig.benefits || [];
    contentCardsToRender = [...legacyCallouts, ...legacyWorkflow, ...legacyBenefits];
  }

  return (
    <Layout
      title={pageConfig.title || fallbackTitle || slug}
      description={pageConfig.description || fallbackDescription}
      showHero={pageConfig.showHero ?? false}
      metadata={pageConfig}
    >
      {/* Unified content cards - renders all callouts, workflow items, and benefits */}
      {contentCardsToRender.length > 0 && <ContentSection items={contentCardsToRender} />}
      
      {/* Main markdown content */}
      <div className="prose prose-lg max-w-none dark:prose-invert" 
           dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
      
      {/* Other structured content sections - automatically render based on YAML data */}
      {/* Benefits are now handled via contentCards, but keep for backward compatibility */}
      {!pageConfig.contentCards && pageConfig.benefits && <BenefitsSection benefits={pageConfig.benefits} />}
      {pageConfig.equipment && <EquipmentSection equipment={pageConfig.equipment} />}
    </Layout>
  );
}
