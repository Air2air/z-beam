// app/components/nav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { /* BaseImageProps, */ } from "../../../types";
import { CONTAINER_STYLES } from "../../utils/containerStyles";

// Navigation item interface
interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  target?: "_blank" | "_self";
  rel?: string;
}

// Logo component props extending BaseImageProps
// interface LogoProps extends BaseImageProps {
//   width: number;
//   height: number;
// }

// Define your navigation items
const navItems: Record<string, NavItem> = {
  "/": {
    name: "Home",
    href: "/",
  },
  "/services": {
    name: "Services", 
    href: "/services",
  },
  "/about": {
    name: "About", 
    href: "/about",
  },
  "/contact": {
    name: "Contact", 
    href: "/contact",
  },

};

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
        <div className={CONTAINER_STYLES.standard.replace('py-8', 'py-3') + ' flex justify-between items-center'}>
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label="Z-Beam home page"
              // Remove the text-2xl font-bold classes as they are for text, not image
              // You might add specific padding or margin to the Link if needed for alignment with image
            >
              {/* Replace "MyLogo" with the Image component */}
              <Image
                src="/images/Site/Logo/logo_.png" // Using the correct file name without quotes
                alt="Z-Beam Logo" // Always include descriptive alt text for accessibility
                width={120} // Set the intrinsic width of your logo image in pixels
                height={40} // Set the intrinsic height of your logo image in pixels
                // You can add Tailwind classes directly to the Image component
                className="h-auto max-h-10 w-auto" // Adjust max-h based on your desired height
                priority // Use priority for logos as they are above the fold
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
              {Object.entries(navItems).map(([path, { name }]) => {
                const isActive = pathname === path;
                const isExternal = path.startsWith("http");

                return (
                  <li key={path} role="none">
                    <Link
                      href={path}
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
                        transition-all duration-200 ease-in-out
                        focus:outline-none
                        ${
                          isActive
                            ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" // Active link style with background
                            : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700" // Inactive link style
                        }
                      `}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                    >
                      {name}
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