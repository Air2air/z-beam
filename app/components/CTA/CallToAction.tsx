// app/components/CTA/CallToAction.tsx
// Full-width Call-to-Action component with contact button, phone number, and van image

import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/app/utils/constants';

export default function CallToAction() {
  return (
    <section 
      className="w-full py-3 md:py-0.5 overflow-visible relative mb-0 mt-8 bg-brand-orange" 
      aria-label="Contact call-to-action"
      role="region"
    >
      <div className="w-full px-4 md:px-6">
        <div className="grid grid-cols-3 gap-4 w-full">
          
          {/* Left column: Phone number */}
          <div className="flex items-center justify-center">
            <a
              href={SITE_CONFIG.contact.general.phoneHref}
              className="text-xs sm:text-base md:text-xl lg:text-2xl font-bold text-white hover:text-gray-100 active:text-gray-200 transition-colors duration-200 inline-block touch-manipulation
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-orange rounded-md px-2 py-1"
              aria-label={`Call us at ${SITE_CONFIG.contact.general.phone} for immediate assistance`}
            >
              {SITE_CONFIG.contact.general.phone}
            </a>
          </div>

          {/* Center column: Van image - overflowing */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 -my-8 sm:-my-10 md:-my-12 lg:-my-16">
              <Image
                src="/images/van/van.png"
                alt={`${SITE_CONFIG.shortName} service van`}
                fill
                className="object-contain drop-shadow-2xl"
                priority={false}
              />
            </div>
          </div>

          {/* Right column: Contact button */}
          <div className="flex items-center justify-center w-full">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 lg:px-8 lg:py-3 text-xs sm:text-sm md:text-base lg:text-lg font-semibold bg-white text-brand-orange rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-orange
                         min-h-[44px]"
              aria-label="Go to contact form page"
            >
              Contact Us
              <svg
                aria-hidden="true"
                role="presentation"
                focusable="false"
                className="hidden sm:block ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
