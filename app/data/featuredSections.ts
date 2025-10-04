// app/data/featuredSections.ts
// Featured section data for homepage - replaces SectionCard structure

export interface FeaturedSection {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const featuredSections: FeaturedSection[] = [
  {
    slug: "services", 
    title: "Services",
    description: "Restoring vintage and modern automotive components using non-abrasive laser technology.",
    imageUrl: "/images/site/Netalux/photo_pro.jpg",
  },
  {
    slug: "rental",
    title: "Equipment Rental",
    description: "Preparing industrial surfaces for coating, painting, and bonding with laser cleaning.",
    imageUrl: "/images/site/Netalux/netalux_group.png",
  },
];