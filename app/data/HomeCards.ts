export interface HomeCard {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export const homeCards: HomeCard[] = [
  {
    id: 1,
    title: "Materials",
    slug: "materials",
    description: "Precision laser cleaning techniques for aircraft components and aerospace materials.",
    imageUrl: "https://res.cloudinary.com/dbzw24uge/image/upload/c_fill,w_600,h_320,q_auto,f_auto/v1752729691/Material/Material/material_stainless_steel.jpg"
  },
  {
    id: 2,
    title: "Services",
    slug: "services",
    description: "Restoring vintage and modern automotive components using non-abrasive laser technology.",
    imageUrl: "https://res.cloudinary.com/dbzw24uge/image/upload/c_fill,w_600,h_320,q_auto,f_auto/v1752729691/Material/Material/material_copper.jpg"
  },
  {
    id: 3,
    title: "Applications",
    slug: "applications",
    description: "Advanced cleaning methods for hafnium and hafnium-based alloys in high-temperature applications.",
    imageUrl: "/images/site/hafnium-laser-cleaning.jpg"
  },
  {
    id: 4,
    title: "About Z-Beam",
    slug: "about",
    description: "Preparing industrial surfaces for coating, painting, and bonding with laser cleaning.",
    imageUrl: "/images/site/about.jpg"
  }
];
