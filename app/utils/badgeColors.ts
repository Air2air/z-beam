// app/utils/badgeColors.ts
// Badge color utilities - Client-safe (no server-only dependencies)

import { BadgeColor, MaterialType } from '@/types';

/**
 * Maps material types to colors for badges
 * Client-safe version without server dependencies
 */
export function getMaterialColor(materialType?: string): BadgeColor {
  if (!materialType) return "blue";

  const typeMap: Record<string, BadgeColor> = {
    metal: "blue",
    ceramic: "green", 
    polymer: "purple",
    composite: "orange",
    semiconductor: "red",
    compound: "gray",
    element: "blue",
    alloy: "blue",
    "rare-earth": "blue",
    other: "gray"
  };

  return typeMap[materialType.toLowerCase()] || "blue";
}
