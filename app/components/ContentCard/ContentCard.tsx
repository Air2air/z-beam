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
 * />
 */
import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Title } from '../Title/Title';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import type { ContentCardProps } from '@/types';

export function ContentCard({
  heading,
  text,
  order,
  category,
  details,
  image,
  imagePosition = 'right',
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
    const websiteDetail = details.find(d => typeof d === 'string' && d.match(/^Website:\s*(.+)$/i));
    if (!websiteDetail) return null;
    const match = websiteDetail.match(/^Website:\s*(.+)$/i);
    const url = match ? match[1].trim() : '';
    return url.startsWith('http') ? url : `https://${url}`;
  }, [details]);
  
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
      container: 'card-background',
      outer: 'p-6 md:p-8 mb-6 rounded-md',
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
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl font-bold text-gray-100 bg-gray-800 rounded-full shadow-lg"
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
          className="text-sm text-primary uppercase tracking-wide mb-2"
          role="doc-subtitle"
          itemProp="category"
        >
          {category}
        </div>
      )}

      {/* Content Grid - Text and Image side by side */}
      <div
        className={`flex flex-col ${
          image ? 'md:grid md:grid-cols-3' : ''
        } gap-6 md:gap-12 items-start`}
      >
      {/* Image - Left Side (but always first on mobile) */}
      {image && isImageLeft && (
        <figure 
          role="img" 
          aria-labelledby={titleId}
          aria-describedby={imageId}
          itemScope
          itemType="https://schema.org/ImageObject"
          className="w-full flex items-center order-1 md:order-none"
        >
          {websiteUrl ? (
            <a 
              href={websiteUrl}
              target="_blank"
              className="card-enhanced-hover block relative w-full aspect-video rounded-md overflow-hidden"
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
            <div className="relative w-full aspect-video rounded-md overflow-hidden">
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

        {/* Content Area */}
        <div 
          className={`${image ? 'md:col-span-2 order-2 md:order-none' : !hasOrder ? 'text-center max-w-4xl mx-auto' : ''}`}
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
            className={`text-base ${hasDetails ? 'mb-4' : ''}`}
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
                // Skip non-string items
                if (typeof detail !== 'string') return null;
                
                // Convert markdown bold (**text**) to HTML <strong>
                const processedDetail = detail.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                
                // Check if this detail contains a link
                // Matches patterns like "Website: url", "Equipment Specifications: /path", etc.
                const linkMatch = detail.match(/^([^:]+):\s*(.+)$/);
                const hasLink = !!linkMatch;
                const linkLabel = linkMatch ? linkMatch[1].trim() : '';
                const linkUrl = linkMatch ? linkMatch[2].trim() : '';
                const isInternalLink = linkUrl.startsWith('/');
                const isExternalLink = linkUrl.match(/^https?:\/\//) || (!isInternalLink && linkUrl.includes('.'));
                
                // Process link label for bold syntax too
                const processedLinkLabel = linkLabel.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                
                return (
                  <li 
                    key={idx} 
                    className="flex items-start gap-2"
                    role="listitem"
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                  >
                    <img 
                      src="/images/logo/bullet.svg"
                      alt=""
                      className="w-4 h-4 mt-1 flex-shrink-0 object-contain"
                      role="presentation"
                      aria-hidden="true"
                    />
                    {hasLink && (isInternalLink || isExternalLink) ? (
                      <span itemProp="name" className="text-base">
                        <span dangerouslySetInnerHTML={{ __html: processedLinkLabel }} />:{' '}
                        {isInternalLink ? (
                          <Link 
                            href={linkUrl}
                            className="text-primary hover:underline"
                            aria-label={`View ${linkLabel}`}
                          >
                            {linkUrl}
                          </Link>
                        ) : (
                          <a 
                            href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                            target="_blank"
                            className="text-primary hover:underline"
                            aria-label={`Visit ${linkUrl} (opens in new tab)`}
                          >
                            {linkUrl}
                          </a>
                        )}
                      </span>
                    ) : (
                      <span 
                        itemProp="name"
                        className="text-base"
                        dangerouslySetInnerHTML={{ __html: processedDetail }}
                      />
                    )}
                    <meta itemProp="position" content={String(idx + 1)} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Image - Right Side (but always first on mobile) */}
        {image && !isImageLeft && (
          <figure 
            role="img" 
            aria-labelledby={titleId}
            aria-describedby={imageId}
            itemScope
            itemType="https://schema.org/ImageObject"
            className="w-full flex items-center order-1 md:order-none"
          >
            {websiteUrl ? (
              <a 
                href={websiteUrl}
                target="_blank"
                className="card-enhanced-hover block relative w-full aspect-video rounded-md overflow-hidden"
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
              <div className="relative w-full aspect-video rounded-md overflow-hidden">
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
