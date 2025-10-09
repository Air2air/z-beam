/**
 * @component ContentCard
 * @purpose Unified content display component - replaces Callout and WorkflowSection
 * @dependencies @/types, Next.js Image
 * @accessibility WCAG 2.1 AA compliant with semantic HTML, ARIA landmarks, keyboard navigation
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
import React, { useMemo } from 'react';
import Image from 'next/image';
import { SectionTitle } from '../SectionTitle/SectionTitle';

export interface ContentCardProps {
  // Core content
  heading: string;
  text: string;
  
  // Optional features
  order?: number;        // Workflow step number
  category?: string;     // Benefit category label
  details?: string[];    // Detail list
  
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
  category,
  details,
  image,
  imagePosition = 'right',
  theme = 'navbar',
  variant = 'default',
}: ContentCardProps) {
  // Generate unique IDs for ARIA relationships
  const uniqueId = useMemo(() => `content-card-${Math.random().toString(36).substr(2, 9)}`, []);
  const titleId = `${uniqueId}-title`;
  const descId = `${uniqueId}-desc`;
  const detailsId = `${uniqueId}-details`;
  const imageId = `${uniqueId}-image`;
  const categoryId = `${uniqueId}-category`;
  
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
  
  // Determine card type for semantic context
  const cardType = hasOrder ? 'workflow step' : category ? 'benefit' : 'information callout';
  
  // Build ARIA describedby references
  const ariaDescribedBy = [descId, hasDetails ? detailsId : '', image ? imageId : '']
    .filter(Boolean)
    .join(' ');
  
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
    <article
      role="article"
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy}
      data-component="content-card"
      data-card-type={cardType}
      data-has-order={hasOrder}
      data-has-category={!!category}
      data-has-details={hasDetails}
      data-has-image={!!image}
      itemScope
      itemType="https://schema.org/Article"
      className={`${variantClasses[variant].container} ${variantClasses[variant].outer} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      tabIndex={0}
    >
      {/* Screen Reader Only - Comprehensive Description */}
      <div id={descId} className="sr-only">
        {hasOrder && `Step ${order}: `}
        {category && `${category}: `}
        {heading}. {text}
        {hasDetails && ` This ${cardType} includes ${details!.length} additional details.`}
        {image && ` Visual illustration provided.`}
      </div>
      {/* Optional Header with Order Number - Spans full width */}
      {hasOrder && (
        <header className="flex items-center gap-4 mb-6" role="banner">
          {/* Order Number Badge */}
          <div 
            className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 bg-gray-700 dark:bg-gray-700 rounded-full"
            role="status"
            aria-label={`Step ${order}`}
          >
            <data value={order} itemProp="position">{order}</data>
          </div>
          
          {/* Title */}
          <div className="flex-1">
            <SectionTitle 
              title={heading}
              id={titleId}
              className="text-xl md:text-2xl"
            />
          </div>
        </header>
      )}
      
      {/* Optional Category Label (for benefits) */}
      {category && !hasOrder && (
        <div 
          id={categoryId}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2"
          role="doc-subtitle"
          itemProp="category"
        >
          {category}
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
          <figure 
            role="img" 
            aria-labelledby={titleId}
            aria-describedby={imageId}
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={image.url}
                alt={image.alt || `Visual illustration for ${heading}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                itemProp="contentUrl"
              />
            </div>
            <figcaption id={imageId} className="sr-only">
              Illustration for {cardType}: {heading}. {image.alt || `Visual representation of ${text.substring(0, 100)}`}
            </figcaption>
          </figure>
        )}

        {/* Content Section */}
        <section 
          className={image ? '' : !hasOrder ? 'text-center max-w-4xl mx-auto' : ''}
          role="region"
          aria-labelledby={titleId}
        >
          {/* Heading - Only show here if no order number */}
          {!hasOrder && (
            <SectionTitle 
              title={heading}
              id={titleId}
              className="text-xl md:text-2xl mb-2"
            />
          )}
          
          {/* Text/Description */}
          <p 
            className={`text-base md:text-lg ${hasDetails ? 'leading-relaxed mb-4' : 'leading-normal'} ${currentTheme.text}`}
            itemProp="description"
          >
            {text}
          </p>
          
          {/* Optional Details List */}
          {hasDetails && (
            <ul 
              id={detailsId}
              className="space-y-2"
              role="list"
              aria-label={`${heading} details`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              {details!.map((detail, idx) => (
                <li 
                  key={idx} 
                  className={`flex items-start gap-2 ${currentTheme.text}`}
                  role="listitem"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <span 
                    className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0"
                    aria-hidden="true"
                    role="presentation"
                  >
                    ✓
                  </span>
                  <span className="leading-relaxed" itemProp="name">{detail}</span>
                  <meta itemProp="position" content={String(idx + 1)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Image - Right Side */}
        {image && !isImageLeft && (
          <figure 
            role="img" 
            aria-labelledby={titleId}
            aria-describedby={imageId}
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={image.url}
                alt={image.alt || `Visual illustration for ${heading}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                itemProp="contentUrl"
              />
            </div>
            <figcaption id={imageId} className="sr-only">
              Illustration for {cardType}: {heading}. {image.alt || `Visual representation of ${text.substring(0, 100)}`}
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}
