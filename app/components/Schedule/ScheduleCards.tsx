/**
 * @component ScheduleCards
 * @purpose Two-card grid for homepage showing Schedule Consultation and Contact Us
 * @design Normalized to match standard Card component structure
 */
import Link from 'next/link';
import Image from 'next/image';

export function ScheduleCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 lg:gap-6 max-w-4xl mx-auto">
      {/* Schedule Consultation Card */}
      <Link
        href="/schedule"
        className="group card-base h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem] card-enhanced-hover transition-smooth card-focus"
        aria-label="Schedule a consultation"
      >
        <article className="absolute-inset" role="article">
          <div className="relative w-full h-full bg-secondary">
            {/* Image */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/images/schedule-card.svg"
                alt="Schedule consultation"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>

            {/* Title Bar */}
            <header className="absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm px-3 py-3 md:px-4 md:py-2.5 z-10" role="banner" aria-label="Card title">
              <div className="flex-between">
                <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                  <h3 className="card-title text-lg truncate text-primary font-medium text-truncate">
                    Schedule Consultation
                  </h3>
                </div>
                
                {/* Navigation arrow */}
                <svg 
                  className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-smooth flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  role="presentation"
                  focusable="false"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </header>
          </div>
        </article>
      </Link>

      {/* Contact Us Card */}
      <Link
        href="/contact"
        className="group card-base h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem] card-enhanced-hover transition-smooth card-focus"
        aria-label="Contact us"
      >
        <article className="absolute-inset" role="article">
          <div className="relative w-full h-full bg-secondary">
            {/* Image */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/images/contact-card.svg"
                alt="Contact us"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>

            {/* Title Bar */}
            <header className="absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm px-3 py-3 md:px-4 md:py-2.5 z-10" role="banner" aria-label="Card title">
              <div className="flex-between">
                <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                  <h3 className="card-title text-lg truncate text-primary font-medium text-truncate">
                    Contact Us
                  </h3>
                </div>
                
                {/* Navigation arrow */}
                <svg 
                  className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-smooth flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  role="presentation"
                  focusable="false"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </header>
          </div>
        </article>
      </Link>
    </div>
  );
}
