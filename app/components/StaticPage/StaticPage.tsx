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
import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import { Table } from '../Table/Table';
import { ComparisonTable } from '../ComparisonTable/ComparisonTable';
import { JsonLD } from '../JsonLD/JsonLD';
import { SchemaFactory } from '@/app/utils/schemas/SchemaFactory';
import { loadComponent } from '@/app/utils/contentAPI';
import { SITE_CONFIG } from '@/app/config';
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
  const pageConfig = yaml.load(yamlContent) as ArticleMetadata & { 
    content?: string;
    needle100_150?: any;
    needle200_300?: any;
    jangoSpecs?: any;
  };
  
  // Convert markdown content from YAML to HTML
  const htmlContent = pageConfig.content ? await marked(pageConfig.content) : '';
  
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
  
  // Split content cards into sections for Netalux page structure
  const needleCard = contentCardsToRender.find(card => card.heading?.includes('Needle'));
  const jangoCard = contentCardsToRender.find(card => card.heading?.includes('Jango'));
  const otherCards = contentCardsToRender.filter(card => 
    !card.heading?.includes('Needle') && !card.heading?.includes('Jango')
  );
  
  // Generate JSON-LD structured data using SchemaFactory
  const generateJsonLd = () => {
    // Prepare data for SchemaFactory
    const schemaData = {
      ...pageConfig,
      title: pageConfig.title || fallbackTitle || slug,
      description: pageConfig.description || fallbackDescription,
      pageConfig,
      contentCards: contentCardsToRender,
      // Pass through all equipment data
      ...(pageConfig.needle100_150 && { needle100_150: pageConfig.needle100_150 }),
      ...(pageConfig.needle200_300 && { needle200_300: pageConfig.needle200_300 }),
      ...(pageConfig.jangoSpecs && { jangoSpecs: pageConfig.jangoSpecs })
    };

    // Use SchemaFactory for automatic schema generation
    const factory = new SchemaFactory(schemaData, slug);
    return factory.generate();
  };

  const jsonLdData = generateJsonLd();
  
  return (
    <Layout
      title={pageConfig.title || fallbackTitle || slug}
      subtitle={pageConfig.subtitle}
      description={pageConfig.description || fallbackDescription}
      metadata={pageConfig}
    >
      {/* JSON-LD Structured Data */}
      <JsonLD data={jsonLdData} />
      {/* Needle® Section: Card followed by comparison table */}
      {needleCard && (
        <>
          <ContentSection items={[needleCard]} />
          {pageConfig.needle100_150 && pageConfig.needle200_300 && (
            <div className="my-12">
              <ComparisonTable
                title="Needle® Model Comparison"
                model1Data={pageConfig.needle100_150}
                model2Data={pageConfig.needle200_300}
                model1Name="Needle® 100/150"
                model2Name="Needle® 200/300"
                variant="compact"
              />
            </div>
          )}
        </>
      )}
      
      {/* Jango® Section: Card followed by specs table */}
      {jangoCard && (
        <>
          <ContentSection items={[jangoCard]} />
          {pageConfig.jangoSpecs && (
            <div className="my-12">
              <Table content="" frontmatterData={pageConfig.jangoSpecs} config={{}} />
            </div>
          )}
        </>
      )}
      
      {/* Other content cards */}
      {otherCards.length > 0 && <ContentSection items={otherCards} />}
      
      {/* Main markdown content - optional */}
      {htmlContent && (
        <div className="my-12">
          <div 
            className="prose prose-lg max-w-none dark:prose-invert prose-table:border-collapse prose-table:w-full prose-th:bg-gray-100 prose-th:dark:bg-gray-800 prose-th:p-3 prose-th:text-left prose-td:p-3 prose-td:border prose-td:border-gray-200 prose-td:dark:border-gray-700" 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      )}
      
      {/* Other structured content sections - automatically render based on YAML data */}
      {/* Benefits are now handled via contentCards, but keep for backward compatibility */}
      {!pageConfig.contentCards && pageConfig.benefits && <BenefitsSection benefits={pageConfig.benefits} />}
      {pageConfig.equipment && <EquipmentSection equipment={pageConfig.equipment} />}
    </Layout>
  );
}
