// app/materials/metadata.ts
// SEO metadata configuration for material category pages
import { SITE_CONFIG } from '../utils/constants';

export interface CategoryMetadata {
  title: string;
  subtitle?: string; // Optional subtitle for page display
  description: string;
  keywords: string[];
  ogImage: string;
  schema: {
    "@type": string;
    name: string;
    description: string;
    category: string;
  };
}

export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  metal: {
    title: `Metal Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Precision cleaning for aluminum, steel, titanium, and precious metals",
    description: "Professional laser cleaning for aluminum, steel, titanium, and precious metals. Aerospace and automotive applications with precision cleaning technology.",
    keywords: ["metal laser cleaning", "aluminum cleaning", "steel restoration", "titanium surface treatment", "aerospace metals"],
    ogImage: "/images/material/aluminum-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Metal Laser Cleaning Services",
      description: "Professional laser cleaning solutions for metal materials including aluminum, steel, and titanium.",
      category: "Industrial Cleaning Services"
    }
  },
  ceramic: {
    title: `Ceramic Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Precision cleaning for alumina, silicon nitride, and technical ceramics",
    description: "Precision laser cleaning for alumina, silicon nitride, and technical ceramics. Semiconductor and industrial applications.",
    keywords: ["ceramic laser cleaning", "alumina cleaning", "silicon nitride", "technical ceramics", "semiconductor cleaning"],
    ogImage: "/images/material/alumina-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Ceramic Laser Cleaning Services",
      description: "Specialized laser cleaning for ceramic materials and technical ceramics.",
      category: "Industrial Cleaning Services"
    }
  },
  composite: {
    title: `Composite Material Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Advanced cleaning for carbon fiber, GFRP, and polymer composites",
    description: "Advanced laser cleaning for carbon fiber, GFRP, and polymer composites. Aerospace and marine industry applications.",
    keywords: ["composite laser cleaning", "carbon fiber cleaning", "GFRP cleaning", "polymer composites", "aerospace composites"],
    ogImage: "/images/material/kevlar-reinforced-polymer-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product", 
      name: "Composite Material Laser Cleaning",
      description: "Specialized cleaning solutions for composite materials and reinforced polymers.",
      category: "Industrial Cleaning Services"
    }
  },
  semiconductor: {
    title: `Semiconductor Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Ultra-precision cleaning for silicon, gallium arsenide, and semiconductor materials",
    description: "Ultra-precision laser cleaning for silicon, gallium arsenide, and semiconductor materials. Microelectronics applications.",
    keywords: ["semiconductor cleaning", "silicon cleaning", "wafer cleaning", "microelectronics", "precision cleaning"],
    ogImage: "/images/material/silicon-carbide-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Semiconductor Laser Cleaning Services", 
      description: "Ultra-precision cleaning for semiconductor materials and microelectronics.",
      category: "Industrial Cleaning Services"
    }
  },
  glass: {
    title: `Glass Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Precision cleaning for optical glass, borosilicate, and technical glass materials",
    description: "Precision laser cleaning for optical glass, borosilicate, and technical glass materials. Laboratory and industrial applications.",
    keywords: ["glass laser cleaning", "optical glass", "borosilicate cleaning", "laboratory glass", "technical glass"],
    ogImage: "/images/material/borosilicate-glass-laser-cleaning-hero.jpg", 
    schema: {
      "@type": "Product",
      name: "Glass Laser Cleaning Services",
      description: "Professional cleaning solutions for optical and technical glass materials.",
      category: "Industrial Cleaning Services"
    }
  },
  stone: {
    title: `Stone Laser Cleaning & Restoration | ${SITE_CONFIG.shortName}`,
    subtitle: "Heritage restoration of granite, marble, limestone, and natural stone",
    description: "Heritage restoration and cleaning of granite, marble, limestone, and natural stone. Architectural and conservation applications.",
    keywords: ["stone laser cleaning", "granite restoration", "marble cleaning", "heritage conservation", "stone restoration"],
    ogImage: "/images/material/granite-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product", 
      name: "Stone Laser Cleaning & Restoration",
      description: "Professional stone cleaning and heritage restoration services using laser technology.",
      category: "Heritage Conservation Services"
    }
  },
  wood: {
    title: `Wood Laser Cleaning & Restoration | ${SITE_CONFIG.shortName}`,
    subtitle: "Gentle cleaning for hardwood and softwood restoration and furniture conservation",
    description: "Gentle laser cleaning for hardwood and softwood restoration. Furniture conservation and heritage wood preservation.",
    keywords: ["wood laser cleaning", "furniture restoration", "heritage wood", "wood conservation", "antique restoration"],
    ogImage: "/images/material/oak-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Wood Laser Cleaning & Restoration", 
      description: "Specialized wood cleaning and restoration services for furniture and heritage applications.",
      category: "Heritage Conservation Services"
    }
  },
  masonry: {
    title: `Masonry Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Professional brick, cement, and masonry restoration with gentle laser techniques",
    description: "Professional brick, cement, and masonry restoration using gentle laser cleaning techniques. Building conservation.",
    keywords: ["masonry cleaning", "brick restoration", "cement cleaning", "building conservation", "architectural restoration"],
    ogImage: "/images/material/brick-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Masonry Laser Cleaning Services",
      description: "Professional masonry and brick restoration using advanced laser cleaning technology.",
      category: "Building Conservation Services"
    }
  },
  plastic: {
    title: `Plastic Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Specialized cleaning of thermoplastics and polymer materials",
    description: "Specialized cleaning of thermoplastics and polymer materials for industrial and consumer applications.",
    keywords: ["plastic laser cleaning", "polymer cleaning", "thermoplastic restoration", "plastic surface treatment"],
    ogImage: "/images/material/polyethyline-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Plastic Laser Cleaning Services",
      description: "Specialized cleaning solutions for plastic and polymer materials.",
      category: "Industrial Cleaning Services"
    }
  }
};

export const VALID_CATEGORIES = Object.keys(CATEGORY_METADATA);