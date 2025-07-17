// app/components/BadgeSymbol.tsx

import React from "react";
import type { BadgeProps } from "app/types";
import { cn, getVariantClasses } from "../../utils/helpers";

const BadgeSymbol: React.FC<BadgeProps> = ({
  text,
  variant = "primary",
  size = "sm",
  bgColorClass="bg-red-800",
  textColorClass,
  className = "",
}) => {
  // Get size and padding classes regardless of custom colors
  const sizeClasses = getSizeClasses(size);

  // Get color classes only if custom colors aren't provided
  const colorClasses = !bgColorClass && !textColorClass
    ? getVariantClasses(variant, size).replace(sizeClasses, '')
    : "";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-medium whitespace-nowrap",
        sizeClasses, // Always apply size classes
        colorClasses, // Apply variant colors only when needed
        bgColorClass, // Apply custom bg if provided
        textColorClass, // Apply custom text color if provided
        className
      )}
    >
      {text}
    </span>
  );
};

// Helper to get just the size-related classes
const getSizeClasses = (size: string) => {
  switch (size) {
    case "xs":
      return "text-xs px-1.5 py-0.5";
    case "sm":
      return "text-sm px-2.5 py-0.5";
    case "md":
      return "text-base px-3 py-1";
    case "lg":
      return "text-lg px-3.5 py-1.5";
    default:
      return "text-sm px-2.5 py-0.5";
  }
};

// Memoize the component for performance
export default React.memo(BadgeSymbol);

// Named export for backward compatibility
export { BadgeSymbol };
