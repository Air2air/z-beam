// app/components/HeroImage.tsx
"use client";

// --- CHANGE START: Rename Image import to NextImage ---
import NextImage from 'next/image';
// --- CHANGE END ---

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// --- CONFIGURATION VARIABLES ---
const IMAGE_FADE_IN_DURATION = 0.6;
const MIN_LOADING_TIME_MS = 300;
// --- END CONFIGURATION ---

interface HeroImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function HeroImage({ src, alt, priority = false }: HeroImageProps) {
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

  return (
    <div
      className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-lg shadow-xl mb-8 mt-4"
    >
      <motion.div
        initial={{ opacity: 1 }}
        className="absolute inset-0 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800"
        style={{ zIndex: 1 }}
      >
        {/* --- CHANGE START: Use NextImage component --- */}
        <NextImage
          src="/images/Site/Logo/logo_.png"
          alt="Z-Beam Logo"
          width={200}
          height={70}
          className="h-auto max-h-20 w-auto"
          priority
        />
        {/* --- CHANGE END --- */}
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
        {/* --- CHANGE START: Use NextImage component --- */}
        <NextImage
          src={src}
          alt={alt}
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
          className="object-cover object-center rounded-lg"
          priority={priority}
          onLoad={() => setHasImageLoaded(true)}
        />
        {/* --- CHANGE END --- */}
      </motion.div>
    </div>
  );
}