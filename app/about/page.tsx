// app/about/page.tsx
import { Layout } from '../components/Layout/Layout';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';

export const metadata = {
  title: 'About Z-Beam',
  description: 'Learn about Z-Beam\'s mission, team, and expertise in laser cleaning technology.'
};

// Default export - the page component using standard Layout pattern
export default async function AboutPage() {
  const { metadata: pageMetadata, components } = await loadPageData('about');
  
  return (
    <Layout
      components={components}
      metadata={pageMetadata as unknown as ArticleMetadata}
      slug="about"
      showHero={true}
    />
  );
}
