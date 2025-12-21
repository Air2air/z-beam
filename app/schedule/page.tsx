// app/schedule/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from "../components/JsonLD/JsonLD";
import { loadPageData } from "../utils/contentAPI";
import { ArticleMetadata } from "@/types";
import { SITE_CONFIG } from "@/app/config/site";
import { ScheduleContent } from "../components/Schedule/ScheduleContent";
import Link from "next/link";

export const metadata = {
  title: "Schedule a Service - Z-Beam Laser Cleaning",
  description:
    "Schedule laser cleaning services with Z-Beam. Book equipment rental, professional cleaning, or on-site services through our online booking portal.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/schedule`,
  },
  openGraph: {
    title: "Schedule a Service - Z-Beam Laser Cleaning",
    description:
      "Schedule laser cleaning services with Z-Beam. Book equipment rental, professional cleaning, or on-site services.",
    url: `${SITE_CONFIG.url}/schedule`,
    siteName: SITE_CONFIG.name,
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-schedule.jpg`,
        width: 1200,
        height: 630,
        alt: "Schedule a Service with Z-Beam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Schedule a Service - Z-Beam Laser Cleaning",
    description: "Schedule laser cleaning services with Z-Beam.",
  },
};

export default async function SchedulePage() {
  const { metadata: pageMetadata } = await loadPageData("schedule");

  // Generate schema for schedule page
  const scheduleSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Schedule a Service",
    description: "Schedule laser cleaning services with Z-Beam",
    url: `${SITE_CONFIG.url}/schedule`,
    mainEntity: {
      "@type": "Service",
      name: "Laser Cleaning Services",
      description:
        "Professional laser cleaning, equipment rental, and on-site services",
      provider: {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
      },
      serviceType: "Laser Cleaning",
      areaServed: "United States",
    },
  };

  return (
    <>
      <JsonLD data={scheduleSchema} />
      <Layout
        title="Schedule Your Service"
        description=""
        rightContent={
          <Link
            href="/contact"
            className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-brand-orange hover:bg-brand-orange-dark focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03] px-2.5 py-1 text-base min-h-[40px]"
            style={{ color: '#2d3441' }}
          >
            Contact us
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
              { label: "Contact", href: "/contact" },
              { label: "Schedule", href: "/schedule" },
            ],
          } as any
        }
        slug="schedule"
      >
        <ScheduleContent />
      </Layout>
    </>
  );
}
