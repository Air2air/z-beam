// app/data/featuredMaterialCategories.ts
// Featured material category data for homepage - showcases different material types

export interface FeaturedMaterialCategory {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  materialType: string;
  representativeMaterial: string;
}

export const featuredMaterialCategories: FeaturedMaterialCategory[] = [
  {
    slug: "materials/metal",
    title: "Metal",
    description: "Precision laser cleaning for aluminum, steel, titanium, and precious metals in aerospace and automotive applications.",
    imageUrl: "/images/material/aluminum-laser-cleaning-hero.jpg",
    materialType: "alloy",
    representativeMaterial: "aluminum-laser-cleaning",
  },
  {
    slug: "materials/ceramic",
    title: "Ceramic",
    description: "Advanced ceramic materials like alumina and silicon nitride for high-temperature and semiconductor applications.",
    imageUrl: "/images/material/alumina-laser-cleaning-hero.jpg",
    materialType: "ceramic",
    representativeMaterial: "alumina-laser-cleaning",
  },
  {
    slug: "materials/composite",
    title: "Composite",
    description: "High-performance polymer composites and fiber-reinforced materials for aerospace and marine industries.",
    imageUrl: "/images/material/kevlar-reinforced-polymer-laser-cleaning-hero.jpg",
    materialType: "composite",
    representativeMaterial: "kevlar-reinforced-polymer-laser-cleaning",
  },
  {
    slug: "materials/semiconductor",
    title: "Semiconductor",
    description: "Ultra-precision cleaning of semiconductor materials for microelectronics and photovoltaic applications.",
    imageUrl: "/images/material/silicon-carbide-laser-cleaning-hero.jpg",
    materialType: "semiconductor",
    representativeMaterial: "silicon-carbide-laser-cleaning",
  },
  {
    slug: "materials/glass",
    title: "Glass",
    description: "Optical and technical glass materials requiring precision cleaning for laboratory and industrial use.",
    imageUrl: "/images/material/borosilicate-glass-laser-cleaning-hero.jpg",
    materialType: "other",
    representativeMaterial: "borosilicate-glass-laser-cleaning",
  },
  {
    slug: "materials/stone",
    title: "Stone",
    description: "Natural stone materials including granite, marble, and slate for architectural and heritage restoration.",
    imageUrl: "/images/material/granite-laser-cleaning-hero.jpg",
    materialType: "other",
    representativeMaterial: "granite-laser-cleaning",
  },
  {
    slug: "materials/wood",
    title: "Wood",
    description: "Delicate laser cleaning of hardwoods and softwoods for furniture restoration and heritage conservation.",
    imageUrl: "/images/material/oak-laser-cleaning-hero.jpg",
    materialType: "other",
    representativeMaterial: "oak-laser-cleaning",
  },
  {
    slug: "materials/masonry",
    title: "Masonry",
    description: "Restoration of brick, cement, and masonry structures using gentle laser cleaning techniques.",
    imageUrl: "/images/material/brick-laser-cleaning-hero.jpg",
    materialType: "other",
    representativeMaterial: "brick-laser-cleaning",
  },
  {
    slug: "materials/plastic",
    title: "Plastic",
    description: "Specialized cleaning of thermoplastics and polymer materials for industrial and consumer applications.",
    imageUrl: "/images/material/polyethyline-laser-cleaning-hero.jpg",
    materialType: "polymer",
    representativeMaterial: "polyethylene-laser-cleaning",
  },
];