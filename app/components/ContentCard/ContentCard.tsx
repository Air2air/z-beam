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
import Link from 'next/link';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { getThemeClasses, type ThemeVariant } from '@/app/config/themeConfig';
import type { ContentCardProps } from '@/types';

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
  
  // Extract website URL from details if it exists
  const websiteUrl = useMemo(() => {
    if (!details) return null;
    const websiteDetail = details.find(d => d.match(/^Website:\s*(.+)$/i));
    if (!websiteDetail) return null;
    const match = websiteDetail.match(/^Website:\s*(.+)$/i);
    const url = match ? match[1].trim() : '';
    return url.startsWith('http') ? url : `https://${url}`;
  }, [details]);
  
  // Get theme classes and override container for navbar theme (uses card-background)
  const baseTheme = getThemeClasses(theme);
  const currentTheme = {
    ...baseTheme,
    container: theme === 'navbar' ? 'card-background' : baseTheme.container,
  };
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
      outer: 'p-6 md:p-8 mb-6 rounded-lg',
    },
    inline: {
      container: '',
      outer: 'py-6 md:py-8 mb-6',
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
      className={`${variantClasses[variant].container} ${variantClasses[variant].outer} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
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
        <header className="flex items-center gap-4 mb-6">
          {/* Order Number Badge */}
          <div 
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 bg-gray-700 dark:bg-gray-700 rounded-full"
            role="status"
            aria-label={`Step ${order}`}
          >
            <data value={order} itemProp="position">{order}</data>
          </div>
          
          {/* Title */}
          <div className="flex-1 flex items-center">
            <SectionTitle 
              title={heading}
              id={titleId}
              className="!mb-0"
            />
          </div>
        </header>
      )}
      
      {/* Optional Category Label (for benefits) */}
      {category && !hasOrder && (
        <div 
          id={categoryId}
          className="text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2"
          role="doc-subtitle"
          itemProp="category"
        >
          {category}
        </div>
      )}

      {/* Content Grid - Text and Image side by side */}
      <div
        className={`grid grid-cols-1 ${
          image ? 'md:grid-cols-3' : 'md:grid-cols-1'
        } gap-6 md:gap-12 items-start`}
      >
      {/* Image - Left Side */}
      {image && isImageLeft && (
        <figure 
          role="img" 
          aria-labelledby={titleId}
          aria-describedby={imageId}
          itemScope
          itemType="https://schema.org/ImageObject"
          className="flex items-center"
        >
          {websiteUrl ? (
            <a 
              href={websiteUrl}
              target="_blank"
              className="card-enhanced-hover block relative w-1/2 mx-auto md:w-full aspect-video rounded-lg overflow-hidden"
              aria-label={`Visit website (opens in new tab)`}
            >
              <Image
                src={image.url}
                alt={image.alt || `Visual illustration for ${heading}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                itemProp="contentUrl"
              />
            </a>
          ) : (
            <div className="relative w-1/2 mx-auto md:w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={image.url}
                alt={image.alt || `Visual illustration for ${heading}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                itemProp="contentUrl"
              />
            </div>
          )}
          <figcaption id={imageId} className="sr-only">
            Illustration for {cardType}: {heading}. {image.alt || `Visual representation of ${text.substring(0, 100)}`}
          </figcaption>
        </figure>
      )}        {/* Content Section */}
        <section 
          className={image ? 'md:col-span-2' : !hasOrder ? 'text-center max-w-4xl mx-auto' : ''}
          role="region"
          aria-labelledby={titleId}
        >
          {/* Heading - Only show here if no order number */}
          {!hasOrder && (
            <SectionTitle 
              title={heading}
              id={titleId}
              className="mb-2"
            />
          )}
          
          {/* Text/Description */}
          <p 
            className={`text-base ${hasDetails ? 'leading-relaxed mb-4' : 'leading-normal'} ${currentTheme.text}`}
            itemProp="description"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          
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
              {details!.map((detail, idx) => {
                // Check if this detail contains a link
                // Matches patterns like "Website: url", "Equipment Specifications: /path", etc.
                const linkMatch = detail.match(/^([^:]+):\s*(.+)$/);
                const hasLink = !!linkMatch;
                const linkLabel = linkMatch ? linkMatch[1].trim() : '';
                const linkUrl = linkMatch ? linkMatch[2].trim() : '';
                const isInternalLink = linkUrl.startsWith('/');
                const isExternalLink = linkUrl.match(/^https?:\/\//) || (!isInternalLink && linkUrl.includes('.'));
                
                return (
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
                      role="presentation"
                    >
                      ✓
                    </span>
                    {hasLink && (isInternalLink || isExternalLink) ? (
                      <span className="leading-relaxed" itemProp="name">
                        {linkLabel}:{' '}
                        {isInternalLink ? (
                          <Link 
                            href={linkUrl}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            aria-label={`View ${linkLabel}`}
                          >
                            {linkUrl}
                          </Link>
                        ) : (
                          <a 
                            href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                            target="_blank"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            aria-label={`Visit ${linkUrl} (opens in new tab)`}
                          >
                            {linkUrl}
                          </a>
                        )}
                      </span>
                    ) : (
                      <span className="leading-relaxed" itemProp="name">{detail}</span>
                    )}
                    <meta itemProp="position" content={String(idx + 1)} />
                  </li>
                );
              })}
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
            className="flex items-center"
          >
            {websiteUrl ? (
              <a 
                href={websiteUrl}
                target="_blank"
                className="card-enhanced-hover block relative w-1/2 mx-auto md:w-full aspect-video rounded-lg overflow-hidden"
                aria-label={`Visit website (opens in new tab)`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Visual illustration for ${heading}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  itemProp="contentUrl"
                />
              </a>
            ) : (
              <div className="relative w-1/2 mx-auto md:w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.alt || `Visual illustration for ${heading}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  itemProp="contentUrl"
                />
              </div>
            )}
            <figcaption id={imageId} className="sr-only">
              Illustration for {cardType}: {heading}. {image.alt || `Visual representation of ${text.substring(0, 100)}`}
            </figcaption>
          </figure>
        )}
      </div>
    </article>
  );
}
