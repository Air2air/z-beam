// app/contaminants/page.tsx
// Main contaminants listing page

import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/contaminantCategories';
import { CollectionPage } from '@/app/components/CollectionPage/CollectionPage';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false; // 1 hour ISR in production

// SEO metadata generation
export async function generateMetadata() {
  return createMetadata({
    title: `Contaminants | ${SITE_CONFIG.shortName} Laser Cleaning`,
    description: 'Comprehensive guide to contaminant types and laser cleaning solutions for industrial applications. From oxidation to coatings, explore our extensive contamination database.',
    keywords: ['contamination types', 'laser cleaning contaminants', 'rust removal', 'paint removal', 'oxidation removal', 'coating removal'],
    image: '/images/contaminants-og.jpg',
    slug: 'contaminants',
    canonical: `${SITE_CONFIG.url}/contaminants`,
  });
}

export default async function ContaminantsPage() {
  const categories = await getAllCategories();
  
  return <CollectionPage config={{
    type: 'contaminants',
    plural: 'Contaminants',
    rootPath: 'contaminants',
    pageTitle: 'Laser Cleaning Contaminants',
    pageDescription: 'Explore our comprehensive database of contaminant types and laser cleaning solutions for industrial applications.',
    categories: categories as any // CategoryInfo includes items at runtime
  }} />;
}
