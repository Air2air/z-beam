// app/components/CTA/CallToAction.tsx
// Full-width Call-to-Action component with contact button, phone number, and van image

import Image from 'next/image';
import { SITE_CONFIG } from '@/app/config';
import { Button } from '../Button';
import { GRID_GAP_RESPONSIVE } from '@/app/config/site';

export default function CallToAction() {
  return (
    <section 
      className="cta w-full min-h-[80px] md:min-h-[80px] overflow-visible bg-brand-orange fixed-mobile z-40 md:mt-10" 
      aria-label="Contact call-to-action"
      role="region"
    >
      <div className="w-full h-full flex items-center">
        <div className={`grid grid-cols-3 ${GRID_GAP_RESPONSIVE} w-full`}>
          
          {/* Left column: Phone number */}
          <div className="flex items-center justify-center h-[80px]">
            <a
              href={SITE_CONFIG.contact.general.phoneHref}
              className="cta-text text-white hover:text-primary active:text-primary transition-colors duration-200 inline-block touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange rounded-md px-2 py-1"
              aria-label={`Call us at ${SITE_CONFIG.contact.general.phone} for immediate assistance`}
            >
              <strong>{SITE_CONFIG.contact.general.phone}</strong>
            </a>
          </div>

          {/* Center column: Van image - overflowing */}
          <div className="flex items-center justify-center relative h-[80px]">
            <div className="cta-icon">
              <Image
                src="/images/van/van.png"
                alt={`${SITE_CONFIG.shortName} service van`}
                fill
                style={{ objectFit: 'contain' }}
                className="drop-shadow-2xl"
                priority={false}
              />
            </div>
          </div>

          {/* Right column: Contact button */}
          <div className="flex items-center justify-center w-full h-[80px]">
            <Button 
              variant="secondary" 
              size="md"
              href="/contact"
              className="mx-auto"
              showIcon={true}
            >
              Let's talk
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
