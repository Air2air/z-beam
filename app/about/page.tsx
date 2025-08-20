// app/about/page.tsx
import { Layout } from '../components/Layout/Layout';
import { loadPageData } from '../utils/contentAPI';
import { logger } from '../utils/logger';

export const metadata = {
  title: 'About Z-Beam',
  description: 'Learn about Z-Beam&apos;s mission, team, and expertise in laser cleaning technology.'
};

// Default export - the page component
export default async function AboutPage() {
  try {
    // Load page data using the new consolidated API
    const { metadata, components } = await loadPageData('about');
    
    return (
      <Layout 
        components={components}
        metadata={metadata}
        slug="about"
      />
    );
  } catch (error) {
    logger.error('Error loading about page', error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Error Loading About Page</h1>
        <p className="mt-4">We&apos;re sorry, but there was an error loading the about page.</p>
      </div>
    );
  }
}
