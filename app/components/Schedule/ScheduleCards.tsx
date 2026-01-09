/**
 * @component ScheduleCards
 * @purpose Two-card grid for homepage showing Schedule with us and Contact Us
 * @design Gradient backgrounds with SVG icon overlays
 */
import Link from 'next/link';
import Image from 'next/image';
import styles from './ScheduleCards.module.css';
import { SectionContainer } from '../SectionContainer/SectionContainer';
import { GRID_GAP_RESPONSIVE, CARD_HEADER_CLASSES } from '@/app/config/site';

export function ScheduleCards() {
  return (
    <SectionContainer>
      <div className={`grid grid-cols-2 ${GRID_GAP_RESPONSIVE}`}>
      {/* Schedule Service Card */}
      <Link
        href="/schedule"
        className="group card-base h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem] card-enhanced-hover transition-smooth card-focus"
        aria-label="Schedule a service or consultation"
      >
        <article className="absolute-inset" role="article">
          <div className={`${styles.cardContainer} ${styles.scheduleCard}`}>
            {/* Foreground Logo - Calendar Icon */}
            <div className={`${styles.logoContainer} md:-mt-4 lg:-mt-6`}>
              <Image
                src="/images/calendar-logo.svg"
                alt=""
                width={144}
                height={144}
                className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
                aria-hidden="true"
              />
            </div>

            {/* Title Bar */}
            <header className="absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2.5 z-10" role="banner" aria-label="Card title">
              <div className="flex-between">
                <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                  <h3 className={CARD_HEADER_CLASSES.title}>
                    Schedule with us
                  </h3>
                </div>
                
                {/* Navigation arrow */}
                <svg 
                  className="w-4 h-4 text-primary opacity-80 transition-smooth flex-shrink-0" 
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
          <div className={`${styles.cardContainer} ${styles.contactCard}`}>
            {/* Foreground Logo - Email/Phone Icons */}
            <div className={`${styles.logoContainer} md:-mt-4 lg:-mt-6`}>
              <Image
                src="/images/contact-logo.svg"
                alt=""
                width={144}
                height={144}
                className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
                aria-hidden="true"
              />
            </div>

            {/* Title Bar */}
            <header className="absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2.5 z-10" role="banner" aria-label="Card title">
              <div className="flex-between">
                <div className="flex-1 pr-2 min-w-0 overflow-hidden">
                  <h3 className={CARD_HEADER_CLASSES.title}>
                    Contact Us
                  </h3>
                </div>
                
                {/* Navigation arrow */}
                <svg 
                  className="w-4 h-4 text-primary opacity-80 transition-smooth flex-shrink-0" 
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
    </SectionContainer>
  );
}
