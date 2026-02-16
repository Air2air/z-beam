// app/services/page.tsx
import { Layout } from '../components/Layout/Layout';
import { ContentSection } from '../components/ContentCard';
import { ClickableCard } from '../components/ClickableCard';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { loadStaticPageContent } from '../utils/staticPageLoader';
import type { ClickableCardProps } from '../components/ClickableCard';
import type { ContentCardItem } from '@/types';

// Viewport configuration for mobile optimization
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata = generateStaticPageMetadata({
  title: 'Services | Laser Cleaning Solutions',
  description: 'Professional laser cleaning services including equipment rental, operations training, and surface cleaning solutions for industrial applications.',
  path: '/services',
  keywords: ['laser cleaning services', 'equipment rental', 'training', 'operations', 'surface cleaning'],
  serviceSchema: {
    name: 'Laser Cleaning Services',
    description: 'Professional laser cleaning services including equipment rental, operations training, and surface cleaning solutions for industrial applications.',
    serviceType: 'Industrial Cleaning Services',
    provider: {
      name: 'Z-Beam Laser Cleaning',
      url: 'https://www.z-beam.com'
    },
    areaServed: ['California', 'Nevada', 'Oregon'],
    availableChannel: {
      url: 'https://www.z-beam.com/services',
      name: 'Z-Beam Services Portal'
    },
    offers: {
      price: '390',
      priceCurrency: 'USD',
      availability: 'InStock'
    }
  }
});

const pageConfig = loadStaticPageContent('services', false, true);

export default function ServicesPage() {
  if (!pageConfig.clickableCards) {
    throw new Error('Services page requires clickableCards in app/services/page.yaml');
  }

  return (
    <Layout
      title={pageConfig.title}
      pageDescription={pageConfig.description}
      metadata={{
        ...pageConfig,
        breadcrumb: [
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' }
        ],
        slug: 'services'
      }}
      slug="services"
    >
      {/* Content sections from markdown */}
      {pageConfig.contentCards?.map((card: ContentCardItem) => (
        <ContentSection
          key={card.order}
          title={card.heading}
          items={[card]}
        />
      ))}

      <div className="space-y-6 mt-8">
        {pageConfig.clickableCards.map((service: ClickableCardProps, index: number) => (
          <ClickableCard key={index} {...service} />
        ))}
      </div>
    </Layout>
  );
}
