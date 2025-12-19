// app/compounds/page.tsx
// Compounds landing page - lists all compound categories

import { getContentConfig } from '@/app/config/contentTypes';
import { LandingPage } from '@/app/components/ContentPages/LandingPage';
import { COMPOUND_CATEGORY_METADATA } from '@/app/compoundMetadata';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('compounds');

export const metadata = {
  title: 'Hazardous Compounds from Laser Cleaning | Z-Beam',
  description: 'Comprehensive database of hazardous compounds produced during laser cleaning operations, including toxicity data, exposure limits, and safety guidelines.',
};

export default async function CompoundsPage() {
  return (
    <LandingPage 
      config={config}
      categoryMetadata={COMPOUND_CATEGORY_METADATA}
      heroTitle="Hazardous Compounds"
      heroDescription="Comprehensive safety information for compounds produced during laser cleaning operations"
    />
  );
}
