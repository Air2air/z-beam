// Contact page with custom form integration
import { loadStaticPageFrontmatter, StaticPageFrontmatter } from '../utils/staticPageLoader';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { SITE_CONFIG, GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { Layout } from '../components/Layout/Layout';
import { JsonLD } from '../components/JsonLD/JsonLD';
import Link from 'next/link';
import type { ArticleMetadata } from '@/types';
import { ContactInfo } from '../components/Contact/ContactInfo';

// Load frontmatter data
const frontmatter = loadStaticPageFrontmatter('contact') as StaticPageFrontmatter;

export const metadata = generateStaticPageMetadata({
  title: frontmatter.pageTitle,
  description: frontmatter.pageDescription,
  path: '/contact',
  image: frontmatter.images?.hero?.url || `${SITE_CONFIG.url}/images/pages/contact.jpg`,
  keywords: frontmatter.keywords || []
});

// Default export - the page component
export default function ContactPage() {

  // Generate ContactPage schema
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Z-Beam Laser Cleaning",
    description:
      "Get a free quote for precision laser cleaning services in the Bay Area",
    url: `${SITE_CONFIG.url}/contact`,
    mainEntity: {
      "@type": "LocalBusiness",
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      description:
        "Precision laser cleaning services for industrial and heritage applications",
      url: SITE_CONFIG.url,
      telephone: "+1-650-590-5040",
      email: "info@z-beam.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bay Area",
        addressRegion: "CA",
        addressCountry: "US",
      },
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        geoRadius: "100",
      },
      serviceType: [
        "Laser Cleaning",
        "Industrial Cleaning",
        "Heritage Conservation",
        "Surface Preparation",
      ],
    },
  };

  return (
    <>
      <JsonLD data={contactSchema} />
      <Layout
        title={frontmatter.pageTitle}
        description={frontmatter.pageDescription}
        rightContent={
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-brand-orange hover:bg-brand-orange-dark focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03] px-2.5 py-1 text-base min-h-[40px]"
            style={{ color: '#2d3441' }}
          >
            Schedule with us
            <span className="inline-flex items-center w-5 h-5 ml-1.5">
              <svg
                aria-hidden="true"
                role="presentation"
                focusable="false"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        }
        metadata={
          {
            breadcrumb: frontmatter.breadcrumb || [],
            images: frontmatter.images
          } as unknown as ArticleMetadata
        }
        slug="contact"
      >
        {/* <RentalPackagesBanner /> */}
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${GRID_GAP_RESPONSIVE} mt-8 items-start`}>
          {/* Workiz Service Request Form */}
          <div className="bg-gray-800 p-6 mb-6 rounded-md shadow-md">
            <iframe
              src='https://st.sendajob.com/MY/servicerequest/bc0bbe1e44d7eda5aed87bb3ababd7c52a171de4_f.html' 
              width='100%' 
              height='650' 
              scrolling='auto' 
              style={{border:'none', display:'block', borderRadius:'0.375rem'}}
              title="Contact Form"
            />
          </div>

          <ContactInfo />
        </div>
      </Layout>
    </>
  );
}
