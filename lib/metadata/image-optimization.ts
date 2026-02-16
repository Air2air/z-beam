/**
 * Image Optimization Metadata Utilities
 * Provides utilities for adding width/height metadata to improve Core Web Vitals
 */

import { SITE_CONFIG } from '@/app/config/site';

export interface ImageMetadata {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

/**
 * Standard image dimensions for consistent layout
 */
export const IMAGE_DIMENSIONS = {
  og: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 630 },
  hero: { width: 800, height: 400 },
  thumbnail: { width: 400, height: 300 },
  icon: { width: 512, height: 512 }
} as const;

/**
 * Generate optimized image metadata with dimensions
 * @param src - Image source path or URL
 * @param alt - Alt text for accessibility
 * @param dimensions - Override default dimensions
 * @returns ImageMetadata object with optimization data
 */
export function generateImageMetadata(
  src: string,
  alt: string,
  dimensions: { width: number; height: number } = IMAGE_DIMENSIONS.og
): ImageMetadata {
  const url = src.startsWith('http') ? src : `${SITE_CONFIG.url}${src}`;
  
  return {
    url,
    width: dimensions.width,
    height: dimensions.height,
    alt,
    type: 'image/png' // Default to PNG, can be overridden
  };
}

/**
 * Generate OpenGraph image metadata with proper dimensions
 * @param src - Image source path
 * @param alt - Alt text
 * @returns OpenGraph compatible image metadata
 */
export function generateOGImageMetadata(src: string, alt: string) {
  return generateImageMetadata(src, alt, IMAGE_DIMENSIONS.og);
}

/**
 * Generate Twitter image metadata with proper dimensions
 * @param src - Image source path
 * @param alt - Alt text
 * @returns Twitter Card compatible image metadata
 */
export function generateTwitterImageMetadata(src: string, alt: string) {
  return generateImageMetadata(src, alt, IMAGE_DIMENSIONS.twitter);
}

/**
 * Convert ImageMetadata to Next.js Metadata format
 * @param imageData - ImageMetadata object
 * @returns Object compatible with Next.js metadata
 */
export function toNextjsImageFormat(imageData: ImageMetadata) {
  return {
    url: imageData.url,
    width: imageData.width,
    height: imageData.height,
    alt: imageData.alt,
    type: imageData.type
  };
}

/**
 * Generate comprehensive image metadata for both OpenGraph and Twitter
 * @param src - Image source path
 * @param alt - Alt text
 * @returns Complete image metadata for social sharing
 */
export function generateSocialImageMetadata(src: string, alt: string) {
  const baseImage = generateImageMetadata(src, alt);
  
  return {
    openGraph: toNextjsImageFormat(baseImage),
    twitter: toNextjsImageFormat(baseImage)
  };
}

/**
 * Default images for different page types
 */
export const DEFAULT_IMAGES = {
  home: generateSocialImageMetadata('/images/og-home.png', 'Z-Beam - Advanced Laser Cleaning Solutions'),
  materials: generateSocialImageMetadata('/images/og-materials.png', 'Laser Cleaning Materials Guide'),
  contaminants: generateSocialImageMetadata('/images/og-contaminants.png', 'Contamination Removal Solutions'),
  settings: generateSocialImageMetadata('/images/og-settings.png', 'Laser Settings and Configurations'),
  compounds: generateSocialImageMetadata('/images/og-compounds.png', 'Chemical Compound Cleaning Guide'),
  about: generateSocialImageMetadata('/images/og-about.png', 'About Z-Beam Laser Cleaning'),
  contact: generateSocialImageMetadata('/images/og-contact.png', 'Contact Z-Beam for Laser Solutions')
} as const;