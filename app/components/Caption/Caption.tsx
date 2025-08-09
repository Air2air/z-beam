// app/components/Caption/Caption.tsx
"use client";

import { MarkdownRenderer } from '../Base/MarkdownRenderer';
import Image from 'next/image';
import { useState } from 'react';
import './styles.css';

interface CaptionProps {
  content: string;
  image?: string;
  frontmatter?: any; // Frontmatter contains all image path information
  config?: {
    className?: string;
  };
}

export function Caption({ content, image, frontmatter, config }: CaptionProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
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
            alt="Detail closeup"
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
      
      <div className="caption-text p-8">
        <MarkdownRenderer 
          content={content}
        />
      </div>
    </div>
  );
}