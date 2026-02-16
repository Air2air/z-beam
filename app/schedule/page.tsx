// app/schedule/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from "../components/JsonLD/JsonLD";
import { ContentSection } from '../components/ContentCard/ContentSection';
import { loadStaticPageContent } from "../utils/staticPageLoader";
import { SITE_CONFIG } from "@/app/config/site";
import { ScheduleContent } from "../components/Schedule/ScheduleContent";
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { generatePageSchema } from '@/lib/schema/generators';
import Link from "next/link";

export const metadata = generateStaticPageMetadata({
  title: "Schedule a Service - Z-Beam Laser Cleaning",
  description: "Schedule laser cleaning services with Z-Beam. Book equipment rental, professional cleaning, or on-site services through our online booking portal.",
  path: '/schedule',
  image: '/images/og-schedule.jpg',
  noIndex: true
});

export default function SchedulePage() {
  const pageConfig = loadStaticPageContent('schedule', false, true);

  // Schedule Service entity schema
  const scheduleEntity = {
    "@type": "Service",
    "name": "Laser Cleaning Services",
    "description": "Professional laser cleaning, equipment rental, and on-site services",
    "provider": {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.url}#organization`,
      "name": SITE_CONFIG.name
    }
  };
  
  const breadcrumbItems = [{ name: 'Home', href: '/' }, { name: 'Schedule Service', href: '/schedule' }];
  const scheduleSchema = generatePageSchema(scheduleEntity, breadcrumbItems, 'Schedule Service', '/schedule');

  return (
    <>
      <JsonLD data={scheduleSchema} />
      <Layout
        title={pageConfig.title}
        description={pageConfig.description}
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
            title: pageConfig.title,
            description: pageConfig.description,
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Contact", href: "/contact" },
              { label: "Schedule", href: "/schedule" },
            ],
            slug: "schedule",
          }
        }
        slug="schedule"
      >
        {pageConfig.contentCards?.map((card, index) => (
          <ContentSection
            key={index}
            title={card.heading}
            items={[card]}
          />
        ))}
        <ScheduleContent />
      </Layout>
    </>
  );
}
