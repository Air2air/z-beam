// app/components/BadgeSymbol.tsx

import React from 'react';
import type { BadgeProps } from 'app/types';
import { cn, getVariantClasses } from '../utils/helpers';

const BadgeSymbol: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'md',
  bgColorClass,
  textColorClass,
  className = "",
}) => {
  // Use variant/size classes if custom colors aren't provided
  const variantClasses = !bgColorClass && !textColorClass 
    ? getVariantClasses(variant, size)
    : '';

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-medium whitespace-nowrap",
        variantClasses,
        bgColorClass,
        textColorClass,
        className
      )}
    >
      {text}
    </span>
  );
};

// Memoize the component for performance
export default React.memo(BadgeSymbol);

// Named export for backward compatibility
export { BadgeSymbol };
