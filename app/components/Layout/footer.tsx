// app/components/footer.tsx

import Image from "next/image";
import Link from "next/link";
import { FooterNavItem, SocialLink } from "@/types";
import { CONTAINER_STYLES } from "../../utils/containerStyles";

// Navigation items for the footer
const footerNav: FooterNavItem[] = [
  { name: "Home", href: "/" },
  { name: "Articles", href: "/articles" },
  { 
    name: "Deploy", 
    href: "https://vercel.com/templates/next.js/portfolio-starter-kit", 
    external: true,
    target: "_blank",
    rel: "noopener noreferrer"
  },
];

// Social links (replace with your actual URLs/icons as needed)
const socialLinks: SocialLink[] = [
  {
    name: "Twitter",
    href: "https://twitter.com/",
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.09 9.09 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.12 0c-2.5 0-4.52 2.02-4.52 4.51 0 .35.04.7.11 1.03C7.69 5.4 4.08 3.67 1.64 1.15c-.38.65-.6 1.41-.6 2.22 0 1.53.78 2.88 1.97 3.67A4.48 4.48 0 0 1 .96 6.1v.06c0 2.14 1.52 3.92 3.54 4.32-.37.1-.76.16-1.16.16-.28 0-.55-.03-.82-.08.55 1.72 2.16 2.97 4.07 3a9.05 9.05 0 0 1-5.61 1.93c-.36 0-.72-.02-1.07-.06A12.8 12.8 0 0 0 7.29 21c8.29 0 12.83-6.87 12.83-12.83 0-.2 0-.39-.01-.58A9.18 9.18 0 0 0 23 3z"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/",
    target: "_blank",
    rel: "noopener noreferrer",
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.42-1.305.763-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.814 1.102.814 2.222v3.293c0 .321.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer 
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className={CONTAINER_STYLES.standard.replace('py-8', 'py-10') + ' flex flex-col md:flex-row md:items-center md:justify-between gap-8'}>
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link 
            href="/" 
            className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            aria-label="Z-Beam home page"
          >
            <Image
              src="/images/Site/Logo/logo_.png"
              alt="Z-Beam Logo"
              width={120}
              height={40}
              className="h-auto max-h-10 w-auto"
              priority
            />
          </Link>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Z-Beam. All rights reserved.
          </span>
        </div>

        {/* Navigation */}
        <nav 
          className="flex flex-col items-center gap-4 md:flex-row md:gap-4"
          role="navigation"
          aria-label="Footer navigation"
        >
          {footerNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              target={item.external ? "_blank" : "_self"}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
            >
              {item.name}
              {item.external && (
                <span className="sr-only"> (opens in new window)</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Social Icons */}
        <div 
          className="flex items-center justify-center gap-4"
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
              className="text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
