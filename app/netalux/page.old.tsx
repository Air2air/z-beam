// app/netalux/page.tsx
import { Layout } from "../components/Layout/Layout";
import { ContentSection } from "../components/ContentCard";
import { JsonLD } from "../components/JsonLD/JsonLD";
import { SITE_CONFIG } from "@/app/config/site";
import { loadStaticPageContent } from '@/app/utils/staticPageLoader';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { generatePageSchema } from '@/lib/schema/generators';
import type { ContentCardItem } from '@/types';

export const metadata = generateStaticPageMetadata({
  title: 'Netalux Needle & Jango Laser Systems | Belgian Tech | Z-Beam',
  description: 'Netalux Needle® (100-300W precision) & Jango® (7500W industrial) laser cleaning systems. Belgian engineering, award-winning technology. Bay Area dealer.',
  path: '/netalux',
  image: '/images/partners/partner-netalux.webp',
  keywords: [
    'Netalux laser cleaning',
    'Needle laser system',
    'Jango laser system',
    'industrial laser cleaning equipment',
    'precision laser cleaning',
    'Top-Hat beam laser',
    'Gaussian beam laser',
    'laser cleaning specifications'
  ]
});

export default function NetaluxPage() {
  // Load netalux page configuration from markdown
  const pageConfig = loadStaticPageContent('netalux');
  
  // Split content cards for specific sections
  const contentCards = pageConfig.contentCards || [];
  const needleCard = contentCards.find(card => card.heading?.includes('Needle'));
  const jangoCard = contentCards.find(card => card.heading?.includes('Jango'));
  const otherCards = contentCards.filter(card => 
    !card.heading?.includes('Needle') && !card.heading?.includes('Jango')
  );
  
  // Netalux Product entity schema
  const netaluxEntity = {
    '@type': 'Product',
    '@id': `${SITE_CONFIG.url}/netalux#product`,
    'name': 'Netalux Laser Cleaning Systems',
    'description': 'Netalux Needle® and Jango® laser cleaning systems featuring Belgian engineering and award-winning technology.',
    'brand': {
      '@type': 'Brand',
      'name': 'Netalux'
    },
    'category': 'Industrial Laser Equipment'
  };
  
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Netalux Systems', href: '/netalux' }
  ];
  const netaluxSchema = generatePageSchema(netaluxEntity, breadcrumbItems, 'Netalux Systems', '/netalux');
  
  return (
    <>
      <JsonLD data={netaluxSchema} />
      <Layout
        title={pageConfig.title || "Netalux Laser Cleaning Equipment"}
        pageDescription={pageConfig.description}
        metadata={pageConfig}
        slug="netalux"
      >
        {/* Needle® Section */}
        {needleCard && <ContentSection items={[needleCard as ContentCardItem]} />}
        
        {/* Jango® Section */}
        {jangoCard && <ContentSection items={[jangoCard as ContentCardItem]} />}
        
        {/* Other content cards */}
        {otherCards.length > 0 && <ContentSection items={otherCards as ContentCardItem[]} />}
      </Layout>
    </>
  );
}
