/**
 * @component ContentCard
 * @purpose Unified content display component - replaces Callout and WorkflowSection
 * @dependencies @/types, Next.js Image
 * @aiContext Use this for all content cards - simple callouts, workflow steps, or any highlighted content
 *           Supports order numbers, detail lists, images, themes, and variants
 *           Single flexible component that handles both simple and complex content layouts
 * 
 * @usage
 * // Simple callout (replaces Callout)
 * <ContentCard
 *   heading="Important Notice"
 *   text="This is important information."
 *   image={{ url: "/images/callout.jpg", alt: "Descriptive text" }}
 *   imagePosition="right"
 *   theme="navbar"
 *   variant="default"
 * />
 * 
 * // Workflow step (replaces WorkflowSection item)
 * <ContentCard
 *   order={1}
 *   heading="Step One"
 *   text="Description of the step"
 *   details={["Detail 1", "Detail 2"]}
 *   image={{ url: "/images/step.jpg", alt: "Step image" }}
 *   theme="navbar"
 * />
 */
import React from 'react';
import Image from 'next/image';

export interface ContentCardProps {
  // Core content
  heading: string;
  text: string;
  
  // Optional workflow features
  order?: number;
  details?: string[];
  
  // Visual options
  image?: {
    url: string;
    alt?: string;
  };
  imagePosition?: 'left' | 'right';
  theme?: 'body' | 'navbar';
  variant?: 'default' | 'inline';
}

export function ContentCard({
  heading,
  text,
  order,
  details,
  image,
  imagePosition = 'right',
  theme = 'navbar',
  variant = 'default',
}: ContentCardProps) {
  // Theme-based styling with gradient backgrounds
  const themeClasses = {
    body: {
      container: 'bg-gray-700',
      heading: 'text-white',
      text: 'text-gray-100',
    },
    navbar: {
      container: 'bg-gradient-to-b from-white to-gray-700 dark:from-gray-800 dark:to-gray-700',
      heading: 'text-gray-900 dark:text-white',
      text: 'text-gray-700 dark:text-gray-300',
    },
  };

  const currentTheme = themeClasses[theme];
  const isImageLeft = imagePosition === 'left';
  const hasOrder = order !== undefined;
  const hasDetails = details && details.length > 0;
  
  // Variant-based outer spacing and styling
  const variantClasses = {
    default: {
      container: currentTheme.container,
      outer: 'p-4 md:p-6 my-6 rounded-lg',
    },
    inline: {
      container: '',
      outer: 'py-6 md:py-8 my-6',
    },
  };

  return (
    <div
      className={`${variantClasses[variant].container} ${variantClasses[variant].outer}`}
    >
      {/* Optional Header with Order Number - Spans full width */}
      {hasOrder && (
        <div className="flex items-center gap-4 mb-6">
          {/* Order Number */}
          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 bg-gray-700 dark:bg-gray-700 rounded-full">
            {order}
          </div>
          
          {/* Title */}
          <div className="flex-1">
            <h3 className={`text-xl md:text-2xl font-bold ${currentTheme.heading}`}>
              {heading}
            </h3>
          </div>
        </div>
      )}

      {/* Content Grid - Text and Image side by side */}
      <div
        className={`grid grid-cols-1 ${
          image ? 'md:grid-cols-2' : 'md:grid-cols-1'
        } gap-6 md:gap-12 ${hasDetails ? 'items-start' : 'items-center'}`}
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
        <div className={image ? '' : !hasOrder ? 'text-center max-w-4xl mx-auto' : ''}>
          {/* Heading - Only show here if no order number */}
          {!hasOrder && (
            <h2
              className={`text-xl md:text-2xl font-bold mb-2 ${currentTheme.heading}`}
            >
              {heading}
            </h2>
          )}
          
          {/* Text/Description */}
          <p className={`text-base md:text-lg ${hasDetails ? 'leading-relaxed mb-4' : 'leading-normal'} ${currentTheme.text}`}>
            {text}
          </p>
          
          {/* Optional Details List */}
          {hasDetails && (
            <ul className="space-y-2">
              {details!.map((detail, idx) => (
                <li 
                  key={idx} 
                  className={`flex items-start gap-2 ${currentTheme.text}`}
                >
                  <span className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0">
                    ✓
                  </span>
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          )}
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
