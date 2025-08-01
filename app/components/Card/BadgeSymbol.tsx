// app/components/Card/BadgeSymbol.tsx
import React from "react";

// Define the BadgeProps interface (general badge)
export interface BadgeProps {
  text: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "xs" | "sm" | "md" | "lg";
  bgColorClass?: string;
  textColorClass?: string;
  className?: string;
}

// Define the ChemicalBadgeProps interface (specifically for chemical symbols)
export interface ChemicalBadgeProps {
  chemicalSymbol: string;
  atomicNumber?: number;
  className?: string;
}

// Regular Badge component
export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "primary",
  size = "sm",
  bgColorClass,
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

// ChemicalBadge component (for displaying chemical symbols)
export const ChemicalBadge: React.FC<ChemicalBadgeProps> = ({ 
  chemicalSymbol, 
  atomicNumber, 
  className = '' 
}) => {
  return (
    <div className={`chemical-badge ${className}`}>
      <div className="flex flex-col items-center justify-center rounded-full bg-gray-800 text-white p-2">
        {atomicNumber && (
          <span className="text-xs font-semibold">{atomicNumber}</span>
        )}
        <span className="text-sm font-bold">{chemicalSymbol}</span>
      </div>
    </div>
  );
};

// Helper functions
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

// This function should be imported from helpers.ts
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

// This function should be imported from helpers.ts
const getVariantClasses = (variant: string, size: string) => {
  switch (variant) {
    case "primary":
      return "bg-blue-100 text-blue-800";
    case "secondary":
      return "bg-gray-100 text-gray-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "danger":
      return "bg-red-100 text-red-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "info":
      return "bg-cyan-100 text-cyan-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// For backward compatibility
export const BadgeSymbol = ChemicalBadge;

// Default export
export default Badge;
