// app/rental/page.tsx
import { Layout } from "../components/Layout/Layout";
import { loadPageData } from "../utils/contentAPI";
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Equipment Rental | ${SITE_CONFIG.shortName}`,
  description: `Rent professional laser cleaning equipment from ${SITE_CONFIG.shortName}. Flexible rental options for your industrial cleaning needs.`,
};

export default async function RentalPage() {
  const { metadata: pageMetadata, components } = await loadPageData('rental');
  
  return (
    <Layout
      components={components}
      metadata={pageMetadata as unknown as ArticleMetadata}
      slug="rental"
      showHero={true}
    />
  );
}
