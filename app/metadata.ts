// app/metadata.ts
// SEO metadata configuration for material category pages
import { SITE_CONFIG } from '@/config/site';
import { CategoryMetadata } from '@/types';

export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  metal: {
    title: `Metal Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Metals require selective ablation that removes oxidation, rust, and coatings while preserving substrate integrity—critical for aerospace aluminum, high-strength steel, and titanium alloys.",
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
  "rare-earth": {
    title: `Rare-Earth Elements Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Rare-earth elements require ultra-precise cleaning protocols that preserve their unique magnetic, optical, and catalytic properties—essential for electronics, renewable energy, and advanced manufacturing applications.",
    description: "Professional laser cleaning for rare-earth elements including cerium, neodymium, yttrium, and other lanthanides. High-tech applications with precision cleaning technology.",
    keywords: ["rare earth laser cleaning", "cerium cleaning", "neodymium surface treatment", "lanthanide restoration", "high-tech materials"],
    ogImage: "/images/material/neodymium-laser-cleaning-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Rare-Earth Elements Laser Cleaning Services",
      description: "Professional laser cleaning solutions for rare-earth materials including cerium, neodymium, and other lanthanides.",
      category: "Industrial Cleaning Services"
    }
  },
  ceramic: {
    title: `Ceramic Laser Cleaning Solutions | ${SITE_CONFIG.shortName}`,
    subtitle: "Ceramics demand controlled energy delivery to prevent thermal shock and micro-fractures in brittle alumina, silicon nitride, and technical ceramics used in semiconductor and high-temperature applications.",
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
    subtitle: "Composites require precise depth control for selective layer removal without damaging carbon fibers or causing delamination—essential for aerospace repair and composite recycling.",
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
    subtitle: "Semiconductors need sub-micron precision and particle-free processing that maintains Class 10 cleanroom standards—critical for wafer preparation in advanced node manufacturing.",
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
    subtitle: "Glass demands non-contact cleaning that preserves optical clarity, surface finish, and refractive properties—essential for laboratory equipment, precision optics, and technical glazing.",
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
    subtitle: "Stone requires variable pulse control adapted to different porosities—gently removing biological growth and pollution while preserving original tool marks and patina for heritage conservation.",
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
    title: `Wood Laser Treatment & Restoration | ${SITE_CONFIG.shortName}`,
    subtitle: "Wood demands fine-tuned energy delivery that removes paint, varnish, and char without damaging grain structure—essential for furniture restoration, timber repair, and architectural salvage projects.",
    description: "Wood cleaning, restoration, and treatment. Paint stripping, fire damage repair, and historic preservation for woodworking, furniture, and architectural applications.",
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
    title: `Masonry Laser Cleaning & Restoration | ${SITE_CONFIG.shortName}`,
    subtitle: "Masonry needs differential absorption cleaning that targets soiling and graffiti while protecting fragile mortar joints—critical for architectural restoration and monument conservation.",
    description: "Masonry restoration and cleaning for brick, concrete, mortar, and architectural restoration. Building conservation and historic preservation applications.",
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
    title: `Plastic Laser Cleaning & Processing | ${SITE_CONFIG.shortName}`,
    subtitle: "Plastics require temperature-controlled cleaning that removes contaminants without thermal deformation—essential for mold cleaning, part preparation, and recycling in automotive and medical device manufacturing.",
    description: "Plastic cleaning, processing, and preparation for polymers, composites, and engineering plastics. Automotive, medical, and industrial manufacturing applications.",
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