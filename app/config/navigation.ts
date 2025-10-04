// app/config/navigation.ts
// Single source of truth for site navigation
// Used by: header nav and footer

export interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  target?: "_blank" | "_self";
  rel?: string;
  description?: string; // For accessibility and SEO
}

// MAIN_NAV_ITEMS - Single source of truth for primary navigation
// Used by both header and footer
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Services",
    href: "/services",
    description: "Explore our laser cleaning services"
  },
  {
    name: "Rental",
    href: "/rental",
    description: "Rent professional laser cleaning equipment"
  },
  {
    name: "About",
    href: "/about",
    description: "Learn about Z-Beam and our mission"
  },
  {
    name: "Contact",
    href: "/contact",
    description: "Get in touch with our team"
  },
];
