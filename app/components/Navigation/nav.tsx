// app/components/nav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CONTAINER_STYLES } from "../../utils/containerStyles";
import { SITE_CONFIG } from "../../utils/constants";
import { MAIN_NAV_ITEMS } from "../../config/navigation";

// Use centralized navigation config
const navItems = MAIN_NAV_ITEMS;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Handle keyboard events for menu interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      closeMenu();
      menuButtonRef.current?.focus();
    }
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white px-4 py-2 z-[100] rounded-md m-2 focus:outline-none"
        onFocus={(e) => e.target.scrollIntoView()}
      >
        Skip to main content
      </a>
      
      {/* The main container for the entire header/navbar, spans full width */}
      <header className="w-full bg-white dark:bg-gray-800 shadow-md z-50 relative" role="banner">{/* Role for better screen reader support */}
        {/* Van image superimposed over nav bar - clickable link to contact */}
        <Link 
          href="/contact" 
          className="absolute left-1/2 -translate-x-1/2 top-3 z-10 hover:scale-105 transition-transform duration-300 ease-in-out w-[120px] md:w-[130px]"
          aria-label="Contact us"
        >
          <Image
            src="/images/van/van.png"
            alt={`${SITE_CONFIG.shortName} service van`}
            width={130}
            height={80}
            className="w-full h-auto"
            priority
          />
        </Link>
        
        <div className={CONTAINER_STYLES.standard.replace('py-8', 'py-3') + ' flex justify-between items-center'}>
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label={`${SITE_CONFIG.name} home page`}
            >
              <Image
                src={SITE_CONFIG.media.logo.default}
                alt={`${SITE_CONFIG.shortName} Logo`}
                width={120}
                height={40}
                className="h-auto max-h-6 sm:max-h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            ref={menuButtonRef}
            className="md:hidden text-gray-800 dark:text-gray-200 focus:outline-none rounded-md p-1"
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
              }
            }}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="main-navigation"
            aria-haspopup="true"
          >
            <svg
              className="w-8 h-8" // Increased size for better tap target
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Navigation Links - Desktop and Mobile */}
          <nav
            ref={menuRef}
            className={`
              flex-col md:flex-row md:space-x-8 // Desktop horizontal, Mobile vertical
              md:static md:w-auto md:h-auto md:opacity-100 md:shadow-none md:p-0
              ${isOpen ? "flex" : "hidden"} md:flex
              absolute top-full left-0 w-full // Mobile menu full width, drops down
              bg-white dark:bg-gray-800 shadow-lg // Mobile menu background and shadow
              py-4 px-4 md:py-0 md:px-0 // Padding for mobile menu
              items-center justify-center // Center items in mobile menu
            `}
            id="main-navigation"
            role="navigation"
            aria-label="Main navigation"
            onKeyDown={handleKeyDown}
          >
            <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8" role="menubar">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isExternal = item.href.startsWith("http");

                return (
                  <li key={item.href} role="none">
                    <Link
                      href={item.href}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={closeMenu} // Close menu on link click
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          closeMenu();
                        }
                      }}
                      className={`
                        block py-2 px-3 rounded-md text-lg md:text-base // Styling for links
                        focus:outline-none transition-colors duration-200
                        ${
                          isActive
                            ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" // Active link style with background
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400" // Inactive link style with hover
                        }
                      `}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.name}
                      {isExternal && (
                        <span className="sr-only"> (opens in new window)</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}