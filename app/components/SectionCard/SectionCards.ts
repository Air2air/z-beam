export interface SectionCard {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  featured?: boolean; // Add featured property
}

export const sectionCards: SectionCard[] = [
  {
    id: 1,
    title: "Materials",
    slug: "materials",
    description:
      "Precision laser cleaning techniques for aircraft components and aerospace materials.",
    imageUrl: "/images/Site/Netalux/photo_pro.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "Services",
    slug: "services",
    description:
      "Restoring vintage and modern automotive components using non-abrasive laser technology.",
    imageUrl: "/images/Site/Netalux/photo_pro.jpg",
    featured: true,
  },
  {
    id: 3,
    title: "Applications",
    slug: "applications",
    description:
      "Advanced cleaning methods for hafnium and hafnium-based alloys in high-temperature applications.",
    imageUrl: "/images/Site/Netalux/photo_pro.jpg",
    featured: true,
  },
  {
    id: 4,
    title: "About Z-Beam",
    slug: "about",
    description:
      "Preparing industrial surfaces for coating, painting, and bonding with laser cleaning.",
    imageUrl: "/images/Site/Netalux/photo_pro.jpg",
    featured: true,
  },
];
