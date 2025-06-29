// app/components/FadeInOnScroll.tsx
"use client";

import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react'; // Removed useEffect as console.log is removed

interface FadeInOnScrollProps {
  children: React.ReactNode;
  /** Delay before the animation starts (in seconds). Default: 0 */
  delay?: number;
  /** Duration of the animation (in seconds). Default: 0.8 */
  duration?: number;
  /** Vertical offset for the initial position (in pixels). Default: 50 (moves up from below) */
  yOffset?: number;
  /** How much of the element needs to be in view (0 to 1, or "some" / "all"). Default: 0.1 (10%) */
  amount?: 'some' | 'all' | number;
  /** Whether the animation should only run once. Default: true */
  // It's generally good to keep 'once: true' for performance and to avoid re-triggering animations
  once?: boolean;
  /** Optional Tailwind CSS classes for the wrapper div */
  className?: string;
}

export function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.8,
  yOffset = 50, // Restored default yOffset to 50 for a subtle "slide-up" effect
  amount = 0.1, // Adjusted amount to 0.1 (10%) for better reliability
  once = true,
  className,
}: FadeInOnScrollProps) {
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