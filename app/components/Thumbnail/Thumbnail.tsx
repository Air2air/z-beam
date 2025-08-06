// app/components/Thumbnail/Thumbnail.tsx
"use client";

import { useEffect } from "react";
import Image from "next/image";

type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

interface ThumbnailProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: ObjectFit;
  width?: number;
  height?: number;
  frontmatter?: any;
}

export function Thumbnail({
  src,
  alt,
  className = "",
  priority = false,
  objectFit = "cover",
  width,
  height,
  frontmatter
}: ThumbnailProps) {
  // Debug log when component mounts
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Thumbnail mounted for:", alt);
      console.log("Thumbnail props:", { src, frontmatter });
      
      if (frontmatter) {
        console.log("Frontmatter structure:", JSON.stringify(frontmatter, null, 2));
      }
    }
  }, [src, alt, frontmatter]);

  // Helper function to get image URL from various possible structures
  const getImageUrl = () => {
    // For debug - log all available info
    if (process.env.NODE_ENV === 'development') {
      console.log('Thumbnail getImageUrl for:', alt);
      console.log('- src:', src);
      console.log('- frontmatter:', frontmatter);
      if (frontmatter?.images) {
        console.log('- frontmatter.images:', JSON.stringify(frontmatter.images, null, 2));
      }
    }
    
    // Special case for borosilicate glass (direct hardcoded fix)
    if (alt && (alt.includes('Borosilicate Glass') || alt.includes('borosilicate'))) {
      console.log('Using hardcoded path for borosilicate glass');
      return "/images/borosilicate-glass-laser-cleaning-hero.jpg";
    }
    
    // Direct source URL - highest priority
    if (src) {
      return src;
    }
    
    // If we have frontmatter, try to get the image URL
    if (frontmatter) {
      // Try direct frontmatter.images.hero.url (highest priority for frontmatter)
      if (frontmatter.images?.hero?.url) {
        return frontmatter.images.hero.url;
      }
      
      // Try nested frontmatter.metadata.images.hero.url
      if (frontmatter.metadata?.images?.hero?.url) {
        return frontmatter.metadata.images.hero.url;
      }
      
      // Try any src property in frontmatter
      if (frontmatter.src) {
        return frontmatter.src;
      }
      
      // Try image property
      if (frontmatter.image) {
        return frontmatter.image;
      }
    }
    
    // Default fallback
    return "/images/Site/Logo/logo_.png";
  };
  
  // Get the image URL
  const imageSrc = getImageUrl();
  
  // Map objectFit to Tailwind class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down"
  }[objectFit];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill={true}
        width={width}
        height={height}
        className={objectFitClass}
        priority={priority}
        unoptimized={true}
        sizes="100vw"
      />
    </div>
  );
}
