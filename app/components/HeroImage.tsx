// app/components/HeroImage.tsx
"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// --- CONFIGURATION VARIABLES ---
const CONTAINER_ANIMATION_DURATION = 0.8; // Duration for the main container's fade-in/slide-up
const PLACEHOLDER_PULSE_DURATION = 0.1;   // Duration for the loading placeholder's pulse animation
const IMAGE_FADE_IN_DURATION = 0.6;      // Duration for the actual image to fade in once loaded
const MIN_LOADING_TIME_MS = 300;         // Minimum time (ms) to show the placeholder/animation, even if image loads faster
// --- END CONFIGURATION ---

interface HeroImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function HeroImage({ src, alt, priority = false }: HeroImageProps) {
  // State to track if `next/image` has internally completed loading the image data
  const [hasImageLoaded, setHasImageLoaded] = useState(false);
  // State to control when the image should actually become visible (after min loading time)
  const [shouldShowImage, setShouldShowImage] = useState(false);

  // useEffect to manage the minimum display time for the loading animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasImageLoaded) {
      // If the image has loaded, wait for the minimum display time
      timer = setTimeout(() => {
        setShouldShowImage(true);
      }, MIN_LOADING_TIME_MS);
    } else {
      // Reset if the image source changes (though unlikely for a hero image)
      setShouldShowImage(false);
    }

    // Cleanup the timer if the component unmounts or hasImageLoaded changes
    return () => clearTimeout(timer);
  }, [hasImageLoaded]); // Dependency array: run this effect when hasImageLoaded changes

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: CONTAINER_ANIMATION_DURATION, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[450px] overflow-hidden rounded-lg shadow-xl mb-8 mt-4"
    >
      {/*
        Conditional loading placeholder:
        - This div is rendered ONLY when `shouldShowImage` is false.
        - Provides visual feedback to the user while the image is loading.
      */}
      {!shouldShowImage && (
        <motion.div
          initial={{ opacity: 0.1, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
          animate={{ opacity: 1, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          transition={{ duration: PLACEHOLDER_PULSE_DURATION, repeatType: "reverse", repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm"
        >
          Loading Image...
        </motion.div>
      )}

      {/*
        Wrapper `motion.div` for `next/image`:
        - This is the key change to guarantee the fade-in animation.
        - We apply Framer Motion's `initial` and `animate` props directly to this wrapper.
        - `next/image` itself is fully mounted and optimized, but its visibility is controlled by this wrapper.
      */}
      <motion.div
        initial={{ opacity: 0 }} // Start this wrapper (and thus the image) fully transparent
        animate={{ opacity: shouldShowImage ? 1 : 0 }} // Animate to full opacity when `shouldShowImage` is true
        transition={{ duration: IMAGE_FADE_IN_DURATION, ease: "easeOut" }} // Define the fade duration
        className="absolute inset-0" // Ensure this wrapper covers the full area
      >
        <Image
          src={src}
          alt={alt}
          fill={true} // `fill` makes the image take up the full size of its parent div (this `motion.div`)
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
          className="object-cover object-center rounded-lg" // Visual styling for the image itself
          priority={priority} // Helps with LCP (Largest Contentful Paint) for above-the-fold images
          // This event fires when the image is downloaded and decoded by the browser
          onLoadingComplete={() => setHasImageLoaded(true)}
        />
      </motion.div>
    </motion.div>
  );
}