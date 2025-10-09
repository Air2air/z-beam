/**
 * @component Callout
 * @purpose Highlighted content section with heading, text, and optional image
 * @dependencies @/types (CalloutProps)
 * @aiContext Use for important callouts in static pages (announcements, CTAs, highlights)
 *           Supports left/right image placement and dark/light themes
 * 
 * @usage
 * <Callout
 *   heading="Important Notice"
 *   text="This is important information for users."
 *   image={{ url: "/images/callout.jpg", alt: "Descriptive text" }}
 *   imagePosition="right"
 *   theme="navbar"
 * />
 */
import React from 'react';
import Image from 'next/image';
import type { CalloutProps } from '@/types';

export function Callout({
  heading,
  text,
  image,
  imagePosition = 'right',
  theme = 'navbar',
  variant = 'default',
}: CalloutProps) {
  // Theme-based styling matching existing site colors
  const themeClasses = {
    body: {
      // Matches main body background: bg-gray-700
      container: 'bg-gray-700',
      heading: 'text-white',
      text: 'text-gray-100',
    },
    navbar: {
      // Matches navbar background: bg-white dark:bg-gray-800
      container: 'bg-white dark:bg-gray-800',
      heading: 'text-gray-900 dark:text-white',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  const currentTheme = themeClasses[theme];
  const isImageLeft = imagePosition === 'left';
  
  // Variant-based outer spacing and styling
  const variantClasses = {
    default: {
      container: currentTheme.container,
      outer: 'p-4 md:p-6 my-6 shadow-lg rounded-lg',
      inner: '',
    },
    inline: {
      container: '', // No background color for inline variant
      outer: 'py-6 md:py-8 my-6', // Vertical padding and spacing
      inner: '', // No padding on inner
    },
  };

  return (
    <div
      className={`${variantClasses[variant].container} ${variantClasses[variant].outer}`}
    >
      <div
        className={`grid grid-cols-1 ${
          image ? 'md:grid-cols-2' : 'md:grid-cols-1'
        } gap-6 md:gap-12 items-center ${variantClasses[variant].inner}`}
      >
        {/* Image - Left Side */}
        {image && isImageLeft && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={image.url}
              alt={image.alt || heading}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Content Section */}
        <div className={image ? '' : 'text-center max-w-4xl mx-auto'}>
          <h2
            className={`text-xl md:text-2xl font-bold mb-2 ${currentTheme.heading}`}
          >
            {heading}
          </h2>
          <p className={`text-base md:text-lg leading-normal ${currentTheme.text}`}>
            {text}
          </p>
        </div>

        {/* Image - Right Side */}
        {image && !isImageLeft && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={image.url}
              alt={image.alt || heading}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}
