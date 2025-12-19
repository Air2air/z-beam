// app/components/footer.tsx
'use client';

import Image from "next/image";
import Link from "next/link";
import { FooterNavItem, SocialLink } from "@/types";
import { CONTAINER_STYLES } from "../../utils/containerStyles";
import { SITE_CONFIG } from "../../utils/constants";
import { MAIN_NAV_ITEMS } from "../../config/navigation";
import { openCookieSettings } from "../CookieConsent";

// Use centralized navigation config - convert NavItem[] to FooterNavItem[]
const footerNav: FooterNavItem[] = MAIN_NAV_ITEMS.map(item => ({
  name: item.name,
  href: item.href
}));

// Social links - using SITE_CONFIG
const socialLinks: SocialLink[] = [
  {
    name: "Twitter",
    href: SITE_CONFIG.social.twitterUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" role="presentation" focusable="false">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.12 0c-2.5 0-4.52 2.02-4.52 4.51 0 .35.04.7.11 1.03C7.69 5.4 4.08 3.67 1.64 1.15c-.38.65-.6 1.41-.6 2.22 0 1.53.78 2.88 1.97 3.67A4.48 4.48 0 0 1 .96 6.1v.06c0 2.14 1.52 3.92 3.54 4.32-.37.1-.76.16-1.16.16-.28 0-.55-.03-.82-.08.55 1.72 2.16 2.97 4.07 3a9.05 9.05 0 0 1-5.61 1.93c-.36 0-.72-.02-1.07-.06A12.8 12.8 0 0 0 7.29 21c8.29 0 12.83-6.87 12.83-12.83 0-.2 0-.39-.01-.58A9.18 9.18 0 0 0 23 3z"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: SITE_CONFIG.social.facebookUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" role="presentation" focusable="false">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: SITE_CONFIG.social.linkedinUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" role="presentation" focusable="false">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: SITE_CONFIG.social.youtubeUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" role="presentation" focusable="false">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer 
      className="bg-secondary mt-0"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className={CONTAINER_STYLES.standard.replace('section-padding', 'footer-padding') + ' flex flex-col gap-6-responsive'}>
        {/* Top row: Logo, Navigation, Social */}
        <div className="flex-stack-row-md-center gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center md:flex-1">
            <Link 
              href="/" 
              className="block focus-visible:outline-none rounded-md"
              aria-label={`${SITE_CONFIG.name} home page`}
            >
              <Image
                src="/images/logo/logo-zbeam.png"
                alt={`${SITE_CONFIG.shortName} Logo`}
                width={150}
                height={50}
                className="footer-logo"
                priority
              />
            </Link>
          </div>

        {/* Navigation */}
        <nav 
          className="flex flex-row items-center justify-center gap-6 flex-wrap md:flex-1"
          role="navigation"
          aria-label="Footer navigation"
        >
          {footerNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target={item.external ? "_blank" : "_self"}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="text-secondary hover:text-primary 
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                         rounded-md px-2 py-1 transition-colors"
            >
              {item.name}
              {item.external && (
                <span className="sr-only"> (opens in new window)</span>
              )}
            </Link>
          ))}
          <button
            onClick={openCookieSettings}
            className="text-secondary hover:text-primary 
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                       rounded-md px-2 py-1 transition-colors"
            aria-label="Manage cookie preferences"
          >
            Cookie Settings
          </button>
        </nav>

        {/* Social Icons */}
        <div 
          className="flex items-center justify-center gap-6 md:flex-1"
          role="navigation"
          aria-label="Social media links"
        >
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${social.name} (opens in new window)`}
              className="text-secondary hover:text-primary 
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                         rounded-md p-2 min-w-[44px] min-h-[44px] 
                         inline-flex items-center justify-center
                         transition-colors duration-200"
            >
              <span className="sr-only">{social.name}</span>
              {social.icon}
            </a>
          ))}
        </div>
        </div>

        {/* Bottom row: Copyright - centered */}
        <div className="flex justify-center">
          <span className="text-secondary text-sm">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.address.company}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
