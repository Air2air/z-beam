// app/services/page.tsx
import { Layout } from '../components/Layout/Layout';
import { ContentSection } from '../components/ContentCard';
import { ClickableCard } from '../components/ClickableCard';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { SITE_CONFIG } from '@/app/config/site';
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

// Service cards data
const SERVICES: ClickableCardProps[] = [
  {
    href: '/rental',
    heading: 'Equipment Rental',
    text: 'Professional laser cleaning equipment delivered to your location in California. Starting at $390/hr with 2-hour minimum.',
    image: {
      url: '/images/laser-cleaning-equipment.jpg',
      alt: 'Professional laser cleaning equipment'
    }
  },
  {
    href: '/equipment',
    heading: 'Laser Equipment',
    text: 'Compare different laser cleaning systems and find the right equipment for your specific industrial needs.',
    image: {
      url: '/images/laser-equipment.jpg',
      alt: 'Laser cleaning equipment options'
    }
  },
  {
    href: '/operations',
    heading: 'Operations & Training',
    text: 'Complete training and compliance support to ensure safe, effective laser cleaning operations that meet all requirements.',
    image: {
      url: '/images/operations-training.jpg',
      alt: 'Operations and training services'
    }
  }
];

const pageConfig = loadStaticPageContent('services');

export default function ServicesPage() {
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
        {SERVICES.map((service, index) => (
          <ClickableCard key={index} {...service} />
        ))}
      </div>
    </Layout>
  );
}
