// app/utils/formatting.ts
// Text and date formatting utilities

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function kebabToTitle(kebabStr: string): string {
  return kebabStr
    .split('-')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

// Additional utility functions

/**
 * Formats a relative date (e.g., "2 days ago", "3 months ago")
 */
export function formatRelativeDate(date: string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Removes HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Converts text to sentence case
 */
export function toSentenceCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Strip parentheses from slugs for clean URLs
 * Converts "material-(acronym)-process" to "material-acronym-process"
 */
export function stripParenthesesFromSlug(slug: string): string {
  if (!slug) return slug;
  return slug.replace(/[()]/g, '');
}

/**
 * Strip parentheses from image URLs for web compatibility
 * Converts "/images/material-(acronym)-hero.jpg" to "/images/material-acronym-hero.jpg"
 */
export function stripParenthesesFromImageUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  return imageUrl.replace(/[()]/g, '');
}

/**
 * URL encode parentheses for CSS background-image compatibility
 * Converts "(" to "%28" and ")" to "%29"
 */
export function urlEncodeParentheses(url: string): string {
  if (!url) return url;
  return url.replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/**
 * Capitalizes first letter of each word (Title Case)
 * Handles both space-separated and dash-separated words
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Creates a display name from a slug
 * Handles multi-word material names like "silicon-carbide" -> "Silicon Carbide"
 */
export function slugToDisplayName(slug: string): string {
  if (!slug) return '';
  
  // Handle multi-word material names in slugs like "silicon-carbide-laser-cleaning"
  const slugParts = slug.split('-');
  
  // Common multi-word material patterns
  const multiWordMaterials = [
    {pattern: ['silicon', 'carbide'], name: 'Silicon Carbide'},
    {pattern: ['silicon', 'nitride'], name: 'Silicon Nitride'},
    {pattern: ['aluminum', 'oxide'], name: 'Aluminum Oxide'},
    {pattern: ['zirconium', 'oxide'], name: 'Zirconium Oxide'},
    {pattern: ['carbon', 'fiber'], name: 'Carbon Fiber'},
    {pattern: ['stainless', 'steel'], name: 'Stainless Steel'},
  ];
  
  // Check for known multi-word materials
  for (const material of multiWordMaterials) {
    if (
      slugParts.length >= material.pattern.length &&
      material.pattern.every((part, i) => slugParts[i] === part)
    ) {
      return material.name;
    }
  }
  
  // If the slug has "laser" or "cleaning", extract everything before that
  const laserIndex = slugParts.indexOf('laser');
  const cleaningIndex = slugParts.indexOf('cleaning');
  
  let endIndex = -1;
  if (laserIndex > 0) endIndex = laserIndex;
  else if (cleaningIndex > 0) endIndex = cleaningIndex;
  
  if (endIndex > 0) {
    // Take all parts before "laser" or "cleaning" and capitalize them
    return slugParts
      .slice(0, endIndex)
      .map(part => capitalizeFirst(part))
      .join(' ');
  }
  
  // Use capitalizeWords for general case
  return capitalizeWords(slug.replace(/-/g, ' '));
}
