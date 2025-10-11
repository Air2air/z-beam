// app/components/CTA/CallToAction.tsx
// Full-width Call-to-Action component with contact button, phone number, and van image

import Image from 'next/image';
import { SITE_CONFIG } from '@/app/config';
import { ContactButton } from '../ContactButton';

export default function CallToAction() {
  return (
    <section 
      className="w-full py-3 md:py-0.5 overflow-visible relative mb-0 mt-10 bg-brand-orange" 
      aria-label="Contact call-to-action"
      role="region"
    >
      <div className="w-full px-4 md:px-6">
        <div className="grid grid-cols-3 gap-4 w-full">
          
          {/* Left column: Phone number */}
          <div className="flex items-center justify-center">
            <a
              href={SITE_CONFIG.contact.general.phoneHref}
              className="text-xs sm:text-base md:text-xl lg:text-2xl text-white hover:text-gray-100 active:text-gray-200 transition-colors duration-200 inline-block touch-manipulation
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-orange rounded-md px-2 py-1"
              aria-label={`Call us at ${SITE_CONFIG.contact.general.phone} for immediate assistance`}
            >
              <strong>{SITE_CONFIG.contact.general.phone}</strong>
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
            <ContactButton 
              variant="primary" 
              size="lg"
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
