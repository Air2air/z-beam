// app/contact/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from "../components/JsonLD/JsonLD";
import { loadPageData } from "../utils/contentAPI";
import { ArticleMetadata } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";

import { SITE_CONFIG } from "@/app/config/site";

const ContactForm = dynamic(
  () =>
    import("../components/Contact/ContactForm").then((mod) => ({
      default: mod.ContactForm,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: false,
  }
);
import { ContactInfo } from "../components/Contact/ContactInfo";

export const metadata = {
  title: "Get a Free Quote | Bay Area Laser Cleaning | Z-Beam",
  description:
    "Precision laser cleaning quotes for aerospace, marine, automotive & heritage projects. No chemicals, no substrate damage. Same-day response. Bay Area mobile service.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
  openGraph: {
    title: "Get a Free Quote | Bay Area Laser Cleaning | Z-Beam",
    description:
      "Precision laser cleaning quotes for aerospace, marine, automotive & heritage. No chemicals, no substrate damage. Same-day response.",
    url: `${SITE_CONFIG.url}/contact`,
    siteName: SITE_CONFIG.name,
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-contact.jpg`,
        width: 1200,
        height: 630,
        alt: "Contact Z-Beam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get a Free Quote | Bay Area Laser Cleaning | Z-Beam",
    description:
      "Precision laser cleaning for aerospace, marine, automotive & heritage. No chemicals, no damage. Same-day response.",
  },
};

// Default export - the page component
export default async function ContactPage() {
  const { metadata: pageMetadata } = await loadPageData("contact");

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
      telephone: "+1-415-555-0123",
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
        title="Send us a Z-mail"
        description=""
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
            ...pageMetadata,
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Schedule", href: "/schedule" },
              { label: "Contact", href: "/contact" },
            ],
          } as unknown as ArticleMetadata
        }
        slug="contact"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-8">
          <div>
            <ContactForm />
          </div>

          <div>
            <ContactInfo />
          </div>
        </div>
      </Layout>
    </>
  );
}
