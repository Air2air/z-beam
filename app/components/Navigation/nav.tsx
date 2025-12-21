// app/components/nav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/app/config/site";
import { MAIN_NAV_ITEMS } from "../../config/navigation";
import { Button } from "../Button";

// Use centralized navigation config
const navItems = MAIN_NAV_ITEMS;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  const handleMouseEnter = (itemName: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(itemName);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
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
      const target = event.target as Node;
      
      // Allow button clicks (dropdown toggles) to work
      if (target instanceof Element && target.closest('button[aria-expanded]')) {
        return;
      }
      
      // Check if click is on a navigation link - allow navigation to happen
      if (target instanceof Element && target.closest('a[href]')) {
        return;
      }
      
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !menuButtonRef.current?.contains(target)
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 px-4 py-2 z-[100] rounded-md m-2 focus-visible:outline-none"
        onFocus={(e) => e.target.scrollIntoView()}
      >
        Skip to main content
      </a>
      
      {/* The main container for the entire header/navbar, spans full width */}
      <header className="w-full shadow-md z-50 relative md:h-20" style={{ backgroundColor: '#2d3441' }} role="banner">{/* Role for better screen reader support */}
        {/* Van image superimposed over nav bar - clickable link to contact */}
        <Link 
          href="/contact" 
          className="absolute left-1/2 -translate-x-1/2 top-3 z-10 transition-transform duration-300 ease-in-out hover:scale-[1.03] w-[90px] md:w-[130px]"
          aria-label="Contact us"
        >
          <Image
            src="/images/van/van.png"
            alt={`${SITE_CONFIG.shortName} service van`}
            width={130}
            height={80}
            style={{ width: '100%', height: 'auto' }}
            priority
          />
        </Link>
        
        <div className="container-full px-4 md:px-6 flex justify-between items-center md:items-end h-full">
          {/* Logo on the left */}
          <div className="flex-shrink-0 md:self-center">
            <Link
              href="/"
              aria-label={`${SITE_CONFIG.name} home page`}
              className="block transition-transform duration-300 ease-in-out hover:scale-[1.03]"
            >
              <Image
                src="/images/logo/logo-zbeam.png"
                alt={`${SITE_CONFIG.shortName} Logo`}
                width={150}
                height={50}
                className="nav-logo"
                priority
              />
            </Link>
          </div>

          {/* Desktop: Nav menu in center */}
          <nav
            ref={menuRef}
            className="hidden md:flex md:flex-row md:space-x-8 flex-1 justify-end items-end mr-4 self-end"
            id="main-navigation"
            role="navigation"
            aria-label="Main navigation"
          >
            <ul className="flex flex-row space-x-8 items-end" role="menubar">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href || (item.dropdown && item.dropdown.some(d => d.href === pathname));
                const isExternal = item.href.startsWith("http");
                const hasDropdown = item.dropdown && item.dropdown.length > 0;
                const isLastItem = index === navItems.length - 1;

                return (
                  <li key={item.href} role="none" className="relative">
                    {hasDropdown ? (
                      <div
                        className="relative flex items-end"
                        onMouseEnter={() => handleMouseEnter(item.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setOpenDropdown(openDropdown === item.name ? null : item.name);
                            } else if (e.key === 'Escape') {
                              setOpenDropdown(null);
                            }
                          }}
                          className={`
                            inline-flex items-center px-3 pb-1 text-[15px] font-medium min-h-[44px]
                            focus-visible:outline-none transition-colors duration-200
                            ${
                              isActive
                                ? "text-blue-600400 bg-blue-900/20"
                                : "text-secondary hover:bg-gray-100:bg-primary hover:text-blue-600:text-blue-400"
                            }
                          `}
                          role="menuitem"
                          aria-haspopup="true"
                          aria-expanded={openDropdown === item.name}
                        >
                          {item.name}
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openDropdown === item.name && item.dropdown && (
                          <div 
                            className={`absolute ${isLastItem ? 'right-0' : 'left-0'} rounded-b-md shadow-lg py-1 z-50`}
                            style={{ top: 'calc(100% + 1px)', backgroundColor: '#2d3441' }}
                            onMouseEnter={() => handleMouseEnter(item.name)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {item.dropdown.map((dropdownItem) => {
                              const isDropdownActive = pathname === dropdownItem.href;
                              return (
                                <Link
                                  key={dropdownItem.href}
                                  href={dropdownItem.href}
                                  className={`
                                    block px-4 py-2 text-[15px]
                                    ${
                                      isDropdownActive
                                        ? "text-blue-400 bg-blue-900/20"
                                        : "text-secondary hover:bg-gray-700"
                                    }
                                  `}
                                >
                                  {dropdownItem.name}
                                </Link>
                              );
                            })}
                            <div className="px-4 py-2 whitespace-nowrap">
                              <Button variant="primary" size="md" href="/contact" showIcon={true}>Let's talk</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        role="menuitem"
                        className={`
                          flex items-end px-3 pb-1 text-[15px] font-medium min-h-[44px]
                          focus-visible:outline-none transition-colors duration-200
                          ${
                            isActive
                              ? "text-blue-600400 bg-blue-900/20"
                              : "text-secondary hover:bg-gray-100:bg-primary hover:text-blue-600:text-blue-400"
                          }
                        `}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.name}
                        {isExternal && (
                          <span className="sr-only"> (opens in new window)</span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile: Hamburger on the right */}
          <button
            ref={menuButtonRef}
            className="md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md p-2 min-w-[44px] min-h-[44px]"
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMenu();
              }
            }}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="true"
          >
            <svg
              className="w-8 h-8"
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
        </div>

        {/* Mobile dropdown menu */}
        <nav
          className={`
            ${isOpen ? "flex" : "hidden"}
            md:hidden
            flex-col
            absolute top-full left-0 w-full
            shadow
            py-4 px-4
            items-center justify-center
          `}
          style={{ backgroundColor: '#2d3441' }}
          id="mobile-navigation"
          role="navigation"
          aria-label="Mobile navigation"
          onKeyDown={handleKeyDown}
        >
          <ul className="flex flex-col space-y-4 w-full" role="menubar">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.dropdown && item.dropdown.some(d => d.href === pathname));
              const isExternal = item.href.startsWith("http");
              const hasDropdown = item.dropdown && item.dropdown.length > 0;
              const isDropdownOpen = openDropdown === item.name;

              return (
                <li key={item.href} role="none">
                  {hasDropdown ? (
                    <div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDropdown(item.name);
                        }}
                        className={`
                          w-full text-left flex justify-between items-center py-2 px-3 rounded-md text-[15px]
                          focus-visible:outline-none transition-colors duration-200
                          ${
                            isActive
                              ? "text-blue-600400 bg-blue-900/20"
                              : "text-secondary hover:bg-gray-100:bg-primary hover:text-blue-600:text-blue-400"
                          }
                        `}
                        role="menuitem"
                        aria-expanded={isDropdownOpen}
                        aria-label={`Toggle ${item.name} submenu`}
                      >
                        {item.name}
                        <svg 
                          className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isDropdownOpen && item.dropdown && (
                        <div className="mt-2 ml-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {item.dropdown.map((dropdownItem) => {
                            const isDropdownActive = pathname === dropdownItem.href;
                            return (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                onClick={closeMenu}
                                className={`
                                    block px-4 py-2 text-sm
                                  ${
                                    isDropdownActive
                                      ? "text-blue-400 bg-blue-900/20"
                                      : "text-secondary hover:bg-gray-700"
                                  }
                                `}
                              >
                                {dropdownItem.name}
                              </Link>
                            );
                          })}
                          <div className="py-2 px-3">
                            <Button variant="primary" size="md" href="/contact" showIcon={true}>Let's talk</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={closeMenu}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          closeMenu();
                        }
                      }}
                      className={`
                        block py-2 px-3 rounded-md text-[15px]
                        focus-visible:outline-none transition-colors duration-200
                        ${
                          isActive
                            ? "text-blue-600400 bg-blue-900/20"
                            : "text-secondary hover:bg-gray-100:bg-primary hover:text-blue-600:text-blue-400"
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
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
    </>
  );
}