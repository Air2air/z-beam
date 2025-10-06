// app/services/page.tsx
import { Layout } from "../components/Layout/Layout";
import { loadPageData } from "../utils/contentAPI";
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from "@/app/utils/constants";

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: `Services | ${SITE_CONFIG.name}`,
  description: `Explore ${SITE_CONFIG.shortName}'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.`
};

export default async function ServicesPage() {
  const { metadata: pageMetadata, components } = await loadPageData('services');
  
  return (
    <Layout
      components={components}
      metadata={pageMetadata as unknown as ArticleMetadata}
      slug="services"
      showHero={true}
    />
  );
}
