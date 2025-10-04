// app/config/navigation.ts
// Centralized navigation configuration for header nav and footer

export interface NavItem {
  name: string;
  href: string;
  external?: boolean;
  target?: "_blank" | "_self";
  rel?: string;
  description?: string; // For accessibility and SEO
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Main navigation items (appears in header)
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Services",
    href: "/services",
    description: "Explore our laser cleaning services"
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

// Footer navigation sections
export const FOOTER_NAV_SECTIONS: NavSection[] = [
  {
    title: "Company",
    items: [
      {
        name: "Home",
        href: "/",
        description: "Return to homepage"
      },
      {
        name: "About",
        href: "/about",
        description: "Learn about Z-Beam"
      },
      {
        name: "Services",
        href: "/services",
        description: "Our laser cleaning services"
      },
      {
        name: "Contact",
        href: "/contact",
        description: "Get in touch"
      },
    ]
  },
  {
    title: "Resources",
    items: [
      {
        name: "Articles",
        href: "/articles",
        description: "Browse our knowledge base"
      },
      {
        name: "Materials",
        href: "/materials",
        description: "Material-specific information"
      },
    ]
  },
];

// Quick links for footer
export const FOOTER_QUICK_LINKS: NavItem[] = [
  {
    name: "Home",
    href: "/"
  },
  {
    name: "Articles",
    href: "/articles"
  },
];

// Convert to Record format for backwards compatibility with nav.tsx
export const MAIN_NAV_ITEMS_RECORD: Record<string, NavItem> = MAIN_NAV_ITEMS.reduce(
  (acc, item) => ({
    ...acc,
    [item.href]: item
  }),
  {}
);
