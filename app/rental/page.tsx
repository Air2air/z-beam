// app/rental/page.tsx
import { Layout } from "../components/Layout/Layout";
import { SITE_CONFIG } from "@/app/utils/constants";
import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Equipment Rental | ${SITE_CONFIG.shortName}`,
  description: `Rent professional laser cleaning equipment from ${SITE_CONFIG.shortName}. Flexible rental options for your industrial cleaning needs.`,
};

export default async function RentalPage() {
  // Load markdown file
  const filePath = path.join(process.cwd(), 'content/components/text/rental.md');
  const markdownContent = await fs.readFile(filePath, 'utf8');
  
  // Convert to HTML
  const htmlContent = marked(markdownContent);
  
  return (
    <Layout
      title="Equipment Rental"
      description={metadata.description}
      showHero={false}
    >
      <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </Layout>
  );
}
