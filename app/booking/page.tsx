// app/booking/page.tsx
import { Layout } from "../components/Layout/Layout";
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';
import { SectionContainer } from '../components/SectionContainer';
import dynamic from 'next/dynamic';

const BookingCalendar = dynamic(() => import('../components/Booking/BookingCalendar').then(mod => ({ default: mod.BookingCalendar })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
  ssr: false,
});

export const metadata = {
  title: 'Book a Consultation - Z-Beam Laser Cleaning',
  description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts. Get personalized advice on laser cleaning solutions for your industrial applications.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/booking`,
  },
  openGraph: {
    title: 'Book a Consultation - Z-Beam Laser Cleaning',
    description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts. Get personalized advice on laser cleaning solutions for your industrial applications.',
    url: `${SITE_CONFIG.url}/booking`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-booking.jpg`,
        width: 1200,
        height: 630,
        alt: 'Book a Consultation with Z-Beam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Consultation - Z-Beam Laser Cleaning',
    description: 'Schedule a free consultation with Z-Beam\'s laser cleaning experts.',
  },
};

export default async function BookingPage() {
  const { metadata: pageMetadata } = await loadPageData('contact');
  
  return (
    <>
      <MaterialJsonLD article={{ metadata: pageMetadata }} slug="booking" />
      <Layout
        title="Book Your Consultation"
        description="Schedule a free 30-minute session with our laser cleaning experts"
        rightContent={null}
        metadata={pageMetadata as unknown as ArticleMetadata}
        slug="booking"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-2">
            <SectionContainer
              title="Select a Time"
              bgColor="body"
              radius={true}
              horizPadding={true}
            >
              <BookingCalendar />
            </SectionContainer>
          </div>
          
          {/* Right Column - Info */}
          <div className="space-y-6">
            <SectionContainer
              title="What to Expect"
              bgColor="transparent"
              radius={true}
              horizPadding={true}
            >
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Free 30-minute consultation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Discuss your specific cleaning needs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Review material compatibility</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Get equipment recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Q&A with our experts</span>
                </li>
              </ul>
            </SectionContainer>

            <SectionContainer
              title="Meeting Format"
              bgColor="transparent"
              radius={true}
              horizPadding={true}
            >
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p className="text-sm">
                  <strong className="text-gray-900 dark:text-gray-100">Video Call:</strong><br />
                  We'll send you a Google Meet link via email
                </p>
                <p className="text-sm">
                  <strong className="text-gray-900 dark:text-gray-100">Duration:</strong><br />
                  30 minutes (can extend if needed)
                </p>
                <p className="text-sm">
                  <strong className="text-gray-900 dark:text-gray-100">Preparation:</strong><br />
                  No preparation needed, but photos of materials help
                </p>
              </div>
            </SectionContainer>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Can't find a suitable time?</strong><br />
                Contact us directly and we'll arrange a custom slot.
              </p>
              <a 
                href="/contact" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
              >
                Contact Us →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-12">
          <SectionContainer
            title="Frequently Asked Questions"
            bgColor="transparent"
            radius={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">
                  Do I need to prepare anything?
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  No preparation required. However, having photos of the materials you want to clean and any specific requirements will help us provide better recommendations.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  What if I need to reschedule?
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  You can reschedule or cancel anytime using the link in your confirmation email. We recommend giving at least 24 hours notice.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  Is this really free?
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes, absolutely! This is a no-obligation consultation to help you understand if laser cleaning is right for your application.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">
                  Will I get a quote during the call?
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  We can provide rough estimates during the call. For detailed quotes, we'll need to assess your specific requirements and may schedule an on-site visit.
                </p>
              </div>
            </div>
          </SectionContainer>
        </div>
      </Layout>
    </>
  );
}
