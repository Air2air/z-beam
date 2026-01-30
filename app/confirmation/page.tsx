// app/confirmation/page.tsx
import { Layout } from "../components/Layout/Layout";
import { JsonLD } from "../components/JsonLD/JsonLD";
import { loadStaticPage } from '@/app/utils/staticPageLoader';
import { ArticleMetadata } from "@/types";
import Link from "next/link";
import { SITE_CONFIG } from "@/app/config/site";

export const metadata = {
  title: "Thank You for Your Inquiry | Z-Beam",
  description: "Your request has been received. We'll contact you shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmationPage() {
  const pageMetadata = {
    title: "Thank You!",
    description: "Your request has been received.",
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
      { label: "Confirmation", href: "/confirmation" },
    ],
  } as unknown as ArticleMetadata;

  return (
    <Layout
      title="Thank You!"
      description=""
      metadata={pageMetadata}
      slug="confirmation"
    >
      <div className="bg-gray-800 rounded-md shadow-md p-8 max-w-2xl mx-auto mt-8">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Confirmation Message */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Your Request Has Been Received
            </h2>
            <p className="text-muted text-lg mb-4">
              Thank you for contacting Z-Beam! We've received your inquiry and will respond as soon as possible.
            </p>
            <p className="text-muted">
              Our team typically responds within 24 hours during business hours.
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <p className="text-muted mb-2">
              Need immediate assistance?
            </p>
            <div className="space-y-2">
              <p className="text-white">
                <strong>Phone:</strong>{' '}
                <a 
                  href={SITE_CONFIG.contact.general.phoneHref}
                  className="text-blue-400 hover:underline"
                >
                  {SITE_CONFIG.contact.general.phone}
                </a>
              </p>
              <p className="text-white">
                <strong>Email:</strong>{' '}
                <a 
                  href={`mailto:${SITE_CONFIG.contact.general.email}`}
                  className="text-blue-400 hover:underline"
                >
                  {SITE_CONFIG.contact.general.email}
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-brand-orange hover:bg-brand-orange-dark focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03] px-6 py-3 text-base"
              style={{ color: '#2d3441' }}
            >
              Return to Home
            </Link>
            <Link
              href="/rental"
              className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-gray-700 hover:bg-gray-600 focus-visible:ring-gray-500 focus-visible:ring-offset-gray-900 text-white px-6 py-3 text-base"
            >
              Learn More About Equipment Rental
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
