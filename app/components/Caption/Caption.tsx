// app/components/Caption/Caption.tsx
"use client";

import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import './styles.css';

interface FrontmatterType {
  images?: {
    closeup?: {
      url?: string;
      alt?: string;
    };
  };
  title?: string;
  [key: string]: unknown;
}

interface CaptionProps {
  content: string;
  image?: string;
  frontmatter?: FrontmatterType; // Frontmatter contains all image path information
  config?: {
    className?: string;
  };
}

export function Caption({ content, image, frontmatter, config }: CaptionProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const captionTextRef = useRef<HTMLDivElement>(null);
  
  // Transform p tags to div tags after component mounts
  useEffect(() => {
    const transformParagraphs = () => {
      if (captionTextRef.current) {
        // First, make the MarkdownRenderer's wrapper div a flex container
        const markdownDiv = captionTextRef.current.querySelector('div');
        if (markdownDiv) {
          markdownDiv.classList.add('flex', 'gap-8');
        }

        // Then transform p tags to div tags
        const paragraphs = captionTextRef.current.querySelectorAll('p');
        if (paragraphs.length > 0) {
          paragraphs.forEach(p => {
            const div = document.createElement('div');
            div.innerHTML = p.innerHTML;
            div.classList.add('flex-1'); // Make divs equal width
            // Copy any attributes if needed
            Array.from(p.attributes).forEach(attr => {
              div.setAttribute(attr.name, attr.value);
            });
            p.parentNode?.replaceChild(div, p);
          });
        }
      }
    };

    // Use MutationObserver to watch for when content is added
    if (captionTextRef.current) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            setTimeout(transformParagraphs, 0);
          }
        });
      });

      observer.observe(captionTextRef.current, {
        childList: true,
        subtree: true
      });

      // Also try immediately and with a timeout
      transformParagraphs();
      const timeoutId = setTimeout(transformParagraphs, 10);

      return () => {
        observer.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [content]);
  
  if (!content) return null;
  
  const { className = '' } = config || {};
  
  // Determine image source, prioritizing frontmatter
  let imageSource = image;
  
  if (!imageSource && frontmatter?.images?.closeup?.url) {
    // Use the closeup image URL from frontmatter
    imageSource = frontmatter.images.closeup.url;
  }
  
  return (
    <div className={`caption-container ${className}`}>
      {imageSource ? (
        <div className="caption-image-wrapper relative">
          {(imageLoading || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-600 z-10">
              <Image
                src="/images/Site/Logo/logo_.png"
                alt={imageError ? "Image not available" : "Loading..."}
                width={60}
                height={60}
                className="object-contain opacity-50"
                unoptimized={true}
              />
            </div>
          )}
          <Image
            src={imageSource}
            alt={frontmatter?.images?.closeup?.alt || frontmatter?.title || "Material detail closeup image"}
            width={800}
            height={450}
            className="caption-image"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        </div>
      ) : (
        <div className="caption-image-wrapper">
          <div className="flex items-center justify-center bg-gray-600 h-[450px]">
            <Image
              src="/images/Site/Logo/logo_.png"
              alt="No image available"
              width={60}
              height={60}
              className="object-contain opacity-50"
              unoptimized={true}
            />
          </div>
        </div>
      )}
      
      <div className="caption-text p-8" ref={captionTextRef}>
        <MarkdownRenderer 
          content={content}
        />
      </div>
    </div>
  );
}