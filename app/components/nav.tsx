// app/components/nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Image component
import { usePathname } from "next/navigation";

// Define your navigation items
const navItems = {
  "/": {
    name: "Home",
  },
  "/articles": {
    name: "Articles",
  },
  "https://vercel.com/templates/next.js/portfolio-starter-kit": {
    name: "Deploy",
  },
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    // The main container for the entire header/navbar, spans full width
    <header className="w-full bg-white dark:bg-gray-800 shadow-md z-50 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center md:px-6 lg:px-8">
        {/* Logo on the left */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            // Remove the text-2xl font-bold classes as they are for text, not image
            // You might add specific padding or margin to the Link if needed for alignment with image
          >
            {/* Replace "MyLogo" with the Image component */}
            <Image
              src="/images/Site/Logo/logo_.png" // Make sure to use the full relative path to your image
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
          className="md:hidden text-gray-800 dark:text-gray-200 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="w-8 h-8" // Increased size for better tap target
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
          className={`
            flex-col md:flex-row md:space-x-8 // Desktop horizontal, Mobile vertical
            md:static md:w-auto md:h-auto md:opacity-100 md:shadow-none md:p-0
+            ${isOpen ? "flex" : "hidden"} md:flex
            absolute top-full left-0 w-full // Mobile menu full width, drops down
            bg-white dark:bg-gray-800 shadow-lg // Mobile menu background and shadow
            py-4 px-4 md:py-0 md:px-0 // Padding for mobile menu
            items-center justify-center // Center items in mobile menu
          `}
          id="nav"
        >
          <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            {Object.entries(navItems).map(([path, { name }]) => {
              const isActive = pathname === path;
              const isExternal = path.startsWith("http");

              return (
                <li key={path}>
                  <Link
                    href={path}
                    target={isExternal ? "_blank" : "_self"}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)} // Close menu on link click
                    className={`
                      block py-2 px-3 rounded-md text-lg md:text-base // Styling for links
                      transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? "font-bold text-blue-600 dark:text-blue-400" // Active link style
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" // Inactive link style
                      }
                    `}
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}