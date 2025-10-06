// app/services/page.tsx
import { Layout } from "../components/Layout/Layout";
import { SITE_CONFIG } from "@/app/utils/constants";
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Services | ${SITE_CONFIG.name}`,
  description: `Explore ${SITE_CONFIG.shortName}'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.`
};

export default async function ServicesPage() {
  // Load markdown file
  const filePath = path.join(process.cwd(), 'content/components/text/services.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');
  
  // Convert to HTML
  const htmlContent = marked(markdownContent);
  
  return (
    <Layout
      title="Z-Beam Laser Cleaning Services"
      description={metadata.description}
      showHero={false}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </Layout>
  );
}
