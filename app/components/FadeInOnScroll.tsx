// app/components/FadeInOnScroll.tsx
"use client";

import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react'; // Removed useEffect as console.log is removed
import type { FadeInProps } from 'app/types';

export function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.8,
  yOffset = 50, // Restored default yOffset to 50 for a subtle "slide-up" effect
  amount = 0.1, // Adjusted amount to 0.1 (10%) for better reliability
  once = true,
  className,
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: once, amount: amount });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : yOffset }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}