// app/about/page.tsx
import { Layout } from '../components/Layout/Layout';
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';

export const metadata = {
  title: `About ${SITE_CONFIG.shortName}`,
  description: `Bay Area precision laser cleaning since 2020. 500+ aerospace, marine & heritage projects. EPA-compliant, zero-waste process. Trusted for critical applications.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: `About ${SITE_CONFIG.shortName}`,
    description: `Bay Area precision laser cleaning since 2020. 500+ aerospace, marine & heritage projects. EPA-compliant, zero-waste process.`,
    url: `${SITE_CONFIG.url}/about`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-about.jpg`,
        width: 1200,
        height: 630,
        alt: `About ${SITE_CONFIG.shortName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About ${SITE_CONFIG.shortName}`,
    description: `Precision laser cleaning since 2020. 500+ aerospace, marine & heritage projects. EPA-compliant, zero-waste.`,
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
