// app/data/featuredSections.ts
// Featured section data for homepage - replaces SectionCard structure

import { FeaturedSection } from '@/types';

export const featuredSections: FeaturedSection[] = [
  {
    slug: "services", 
    title: "Services",
    description: "Restoring vintage and modern automotive components using non-abrasive laser technology.",
    imageUrl: "/images/netalux/photo-pro.jpg",
  },
  {
    slug: "rental",
    title: "Equipment Rental",
    description: "Preparing industrial surfaces for coating, painting, and bonding with laser cleaning.",
    imageUrl: "/images/netalux/netalux-group.png",
  },
];