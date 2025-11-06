// app/about/page.tsx
import { Layout } from '../components/Layout/Layout';
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';

export const metadata = {
  title: `About ${SITE_CONFIG.shortName}`,
  description: `Learn about ${SITE_CONFIG.shortName}'s mission, team, and expertise in laser cleaning technology.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
};

// Default export - the page component using standard Layout pattern
export default async function AboutPage() {
  const { metadata: pageMetadata, components } = await loadPageData('about');
  
  return (
    <>
      <MaterialJsonLD article={{ metadata: pageMetadata }} slug="about" />
      <Layout
        components={components}
        metadata={pageMetadata as unknown as ArticleMetadata}
        slug="about"
      />
    </>
  );
}
