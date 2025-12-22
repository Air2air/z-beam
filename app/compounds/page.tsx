// app/compounds/page.tsx
// Main compounds listing page

import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getContentConfig } from '@/app/config/contentTypes';
import { CollectionPage } from '@/app/components/CollectionPage/CollectionPage';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('compounds');

// SEO metadata generation
export async function generateMetadata() {
  return createMetadata({
    title: `Hazardous Compounds | ${SITE_CONFIG.shortName} Laser Cleaning`,
    description: 'Comprehensive database of hazardous compounds produced during laser cleaning operations, including toxicity data, exposure limits, and safety guidelines.',
    keywords: ['hazardous compounds', 'laser safety', 'toxic gases', 'exposure limits', 'industrial safety'],
    image: '/images/compounds-og.jpg',
    slug: 'compounds',
    canonical: `${SITE_CONFIG.url}/compounds`,
  });
}

export default async function CompoundsPage() {
  const categories = await config.getAllCategories();
  
  return <CollectionPage config={{
    type: 'compounds',
    plural: 'Compounds',
    rootPath: 'compounds',
    pageTitle: 'Hazardous Compounds Database',
    pageDescription: 'Comprehensive safety information for compounds produced during laser cleaning operations.',
    categories
  }} />;
}
