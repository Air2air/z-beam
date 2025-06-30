// /app/components/HeroImage.tsx
"use client";

import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const IMAGE_FADE_IN_DURATION = 0.6;
const MIN_LOADING_TIME_MS = 300;

interface HeroImageProps {
  src: string;
  alt: string;
  imageCaption?: string;
  priority?: boolean;
  materialName?: string; // Added for dynamic alt text
  primaryApplication?: string; // Added for dynamic alt text
}

export function HeroImage({ src, alt, imageCaption, priority = false, materialName, primaryApplication }: HeroImageProps) {
  const [hasImageLoaded, setHasImageLoaded] = useState(false);
  const [shouldShowImage, setShouldShowImage] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasImageLoaded) {
      timer = setTimeout(() => {
        setShouldShowImage(true);
      }, MIN_LOADING_TIME_MS);
    } else {
      setShouldShowImage(false);
    }

    return () => clearTimeout(timer);
  }, [hasImageLoaded]);

  // Dynamic alt text for SEO
  const optimizedAlt = materialName && primaryApplication
    ? `Laser cleaning ${materialName} process in ${primaryApplication}`
    : alt;

  // Split caption at "Equipment:" with regex to handle whitespace
  const captionParts = imageCaption ? imageCaption.split(/\s*Equipment:\s*/) : [];

  return (
    <figure className="relative w-full h-auto pb-6 mt-4 mb-8">
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-lg shadow-xl">
        <motion.div
          initial={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          style={{ zIndex: 1 }}
        >
          <NextImage
            src="/images/Site/Logo/logo_.png"
            alt="Z-Beam Logo"
            width={200}
            height={70}
            className="h-auto max-h-20 w-auto"
            priority
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: shouldShowImage ? 1 : 0 }}
          transition={{
            delay: shouldShowImage ? MIN_LOADING_TIME_MS / 1000 : 0,
            duration: IMAGE_FADE_IN_DURATION,
            ease: "easeOut"
          }}
          className="absolute inset-0"
          style={{ zIndex: 2 }}
        >
          <NextImage
            src={src}
            alt={optimizedAlt}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
            className="object-cover object-center rounded-lg"
            priority={priority}
            onLoad={() => setHasImageLoaded(true)}
          />
        </motion.div>
      </div>
      {imageCaption && (
        <div className="caption-wrapper mt-4 text-center">
          <figcaption
            data-testid="image-caption"
            className="text-base font-semibold text-gray-900 dark:text-gray-100 block !visible"
          >
            {captionParts.length === 2 ? (
              <>
                <span className="font-bold !text-gray-900 dark:!text-gray-100">Results:</span>{' '}
                {captionParts[0].replace(/^Results:\s*/, '').trim()}
                <br />
                <span className="font-bold !text-gray-900 dark:!text-gray-100">Equipment:</span>{' '}
                {captionParts[1].trim()}
              </>
            ) : (
              imageCaption
            )}
          </figcaption>
        </div>
      )}
    </figure>
  );
}
