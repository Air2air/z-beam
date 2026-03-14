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
import { SectionTitle } from '../SectionTitle/SectionTitle';
import type { ContentCardProps } from '@/types';

export function ContentCard({
  heading,
  text,
  href,
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
  const hasHref = typeof href === 'string' && href.trim().length > 0;
  const normalizedHref = hasHref ? href.trim() : undefined;
  const canNavigateCard = !!normalizedHref;
  const destinationUrl = normalizedHref || websiteUrl || undefined;
  const isInternalDestination = !!destinationUrl && destinationUrl.startsWith('/');
  const isLogoImage = !!image?.url && image.url.includes('/images/logo/');
  const interactiveCardClasses = hasHref ? 'card-enhanced-hover transition-smooth cursor-pointer' : '';
  
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
      outer: 'p-4 md:p-5 mb-4 rounded-md',
      header: 'mb-4',
      gridGap: 'gap-4 md:gap-6',
      text: 'text-base',
      details: 'space-y-2',
      imageFrame: 'aspect-video md:aspect-[16/7]',
      logoFrame: 'aspect-video md:aspect-[16/7]',
      imageWrapper: 'w-[88%] md:w-[84%] mx-auto',
      logoWrapper: 'w-[88%] md:w-[84%] mx-auto',
    },
    inline: {
      container: '',
      outer: 'py-4 md:py-5 mb-4',
      header: 'mb-4',
      gridGap: 'gap-4 md:gap-6',
      text: 'text-base',
      details: 'space-y-2',
      imageFrame: 'aspect-video md:aspect-[16/7]',
      logoFrame: 'aspect-video md:aspect-[16/7]',
      imageWrapper: 'w-[88%] md:w-[84%] mx-auto',
      logoWrapper: 'w-[88%] md:w-[84%] mx-auto',
    },
    compact: {
      container: 'card-background',
      outer: 'p-3 md:p-4 mb-3 rounded-md',
      header: 'mb-3',
      gridGap: 'gap-3 md:gap-4',
      text: 'text-base',
      details: 'space-y-1',
      imageFrame: 'aspect-video md:aspect-[16/7]',
      logoFrame: 'aspect-video md:aspect-[16/7]',
      imageWrapper: 'w-[88%] md:w-[84%] mx-auto',
      logoWrapper: 'w-[88%] md:w-[84%] mx-auto',
    },
  };
  const imageObjectClass = isLogoImage ? 'object-contain object-center p-3' : 'object-cover';
  const activeImageFrameClass = isLogoImage ? variantClasses[variant].logoFrame : variantClasses[variant].imageFrame;
  const imageFigureClass = `${isLogoImage ? variantClasses[variant].logoWrapper : variantClasses[variant].imageWrapper} flex items-center self-center order-1 md:order-none md:col-span-2`;

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
      className={`${variantClasses[variant].container} ${variantClasses[variant].outer} relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${interactiveCardClasses}`}
      tabIndex={0}
    >
      {canNavigateCard && normalizedHref && (
        isInternalDestination ? (
          <Link
            href={normalizedHref}
            aria-label={`View ${heading}`}
            className="absolute inset-0 z-30 rounded-md"
          />
        ) : (
          <a
            href={normalizedHref.startsWith('http') ? normalizedHref : `https://${normalizedHref}`}
            aria-label={`View ${heading}`}
            className="absolute inset-0 z-30 rounded-md"
          />
        )
      )}

      <div>
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
        <header className={`flex items-center gap-4 ${variantClasses[variant].header}`}>
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
          image ? 'md:grid md:grid-cols-5' : ''
        } ${variantClasses[variant].gridGap} ${isLogoImage ? 'items-center' : 'items-start'}`}
      >
      {/* Image - Left Side (but always first on mobile) */}
      {image && isImageLeft && (
        <figure 
          role="img" 
          aria-labelledby={titleId}
          aria-describedby={imageId}
          itemScope
          itemType="https://schema.org/ImageObject"
          className={imageFigureClass}
        >
          {destinationUrl && !canNavigateCard ? (
            isInternalDestination ? (
              <Link
                href={destinationUrl}
                className={`block relative w-full ${activeImageFrameClass} rounded-md overflow-hidden`}
                aria-label={`View ${heading}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Visual illustration for ${heading}`}
                  fill
                  className={imageObjectClass}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  itemProp="contentUrl"
                />
              </Link>
            ) : (
              <a
                href={destinationUrl.startsWith('http') ? destinationUrl : `https://${destinationUrl}`}
                target="_blank"
                className={`${hasHref ? '' : 'card-enhanced-hover '}block relative w-full ${activeImageFrameClass} rounded-md overflow-hidden`}
                aria-label={`Visit website (opens in new tab)`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Visual illustration for ${heading}`}
                  fill
                  className={imageObjectClass}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  itemProp="contentUrl"
                />
              </a>
            )
          ) : (
            <div className={`relative w-full ${activeImageFrameClass} rounded-md overflow-hidden`}>
              <Image
                src={image.url}
                alt={image.alt || `Visual illustration for ${heading}`}
                fill
                className={imageObjectClass}
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
          className={`${image ? 'md:col-span-3 order-2 md:order-none' : !hasOrder ? 'text-center max-w-4xl mx-auto' : ''}`}
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
            className={`${variantClasses[variant].text} ${hasDetails ? 'mb-4' : ''}`}
            itemProp="description"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          
          {/* Optional Details List */}
          {hasDetails && (
            <ul 
              id={detailsId}
              className={variantClasses[variant].details}
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
                const isExternalLink = /^https?:\/\//i.test(linkUrl)
                  || /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/:?#].*)?$/i.test(linkUrl);
                
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
                    <Image 
                      src="/images/logo/bullet.svg"
                      alt=""
                      width={16}
                      height={16}
                      sizes="16px"
                      className="mt-1 flex-shrink-0 object-contain"
                      role="presentation"
                      aria-hidden="true"
                    />
                    {hasLink && (isInternalLink || isExternalLink) ? (
                      <span itemProp="name" className="text-base">
                        <span dangerouslySetInnerHTML={{ __html: processedLinkLabel }} />:{' '}
                        {isInternalLink ? (
                          <Link 
                            href={linkUrl}
                            className="relative z-40 text-primary hover:underline"
                            aria-label={`View ${linkLabel}`}
                          >
                            {linkUrl}
                          </Link>
                        ) : (
                          <a 
                            href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                            target="_blank"
                            className="relative z-40 text-primary hover:underline"
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
            className={imageFigureClass}
          >
            {destinationUrl && !canNavigateCard ? (
              isInternalDestination ? (
                <Link
                  href={destinationUrl}
                  className={`block relative w-full ${activeImageFrameClass} rounded-md overflow-hidden`}
                  aria-label={`View ${heading}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Visual illustration for ${heading}`}
                    fill
                    className={imageObjectClass}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    itemProp="contentUrl"
                  />
                </Link>
              ) : (
                <a 
                  href={destinationUrl.startsWith('http') ? destinationUrl : `https://${destinationUrl}`}
                  target="_blank"
                  className={`${hasHref ? '' : 'card-enhanced-hover '}block relative w-full ${activeImageFrameClass} rounded-md overflow-hidden`}
                  aria-label={`Visit website (opens in new tab)`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Visual illustration for ${heading}`}
                    fill
                    className={imageObjectClass}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    itemProp="contentUrl"
                  />
                </a>
              )
            ) : (
              <div className={`relative w-full ${activeImageFrameClass} rounded-md overflow-hidden`}>
                <Image
                  src={image.url}
                  alt={image.alt || `Visual illustration for ${heading}`}
                  fill
                  className={imageObjectClass}
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
      </div>
    </article>
  );
}
