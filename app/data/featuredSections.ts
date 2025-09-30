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
    imageUrl: "/images/Site/Netalux/photo_pro.jpg",
  },
  {
    slug: "about",
    title: "About Z-Beam",
    description: "Preparing industrial surfaces for coating, painting, and bonding with laser cleaning.",
    imageUrl: "/images/Site/Netalux/photo_pro.jpg",
  },
];