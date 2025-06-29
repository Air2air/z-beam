// app/components/BadgeSymbol.tsx

import React from 'react';

interface BadgeSymbolProps {
  /** The text to display inside the badge. */
  text: string;
  /**
   * Optional: Tailwind CSS classes for background color.
   * Example: "bg-blue-100 dark:bg-blue-900"
   */
  bgColorClass?: string;
  /**
   * Optional: Tailwind CSS classes for text color.
   * Example: "text-blue-800 dark:text-blue-200"
   */
  textColorClass?: string;
  /**
   * Optional: Any additional Tailwind CSS classes for custom styling.
   * Example: "px-3 py-1.5" for larger padding.
   */
  className?: string;
}

export const BadgeSymbol: React.FC<BadgeSymbolProps> = ({
  text,
  bgColorClass = "bg-orange-100 dark:bg-orange-700", // Default neutral background
  textColorClass = "text-gray-800 dark:text-gray-200", // Default neutral text
  className = "",
}) => {
  return (
    <span
      className={`
     inline-flex items-center justify-center
        px-2 py-0 rounded  font-medium whitespace-nowrap
        ${bgColorClass} ${textColorClass} ${className}
      `}
    >
      {text}
    </span>
  );
};
