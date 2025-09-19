// app/utils/badgeUtils.ts
// DEPRECATED: Use badgeSystem.ts instead
// This file provides backward compatibility aliases

export {
  getMaterialColor,
  getBadgeData,
  cacheBadgeData,
  getBadgeDataBySlug
} from './badgeSystem';

// Re-export for compatibility
import { loadBadgeData as loadBadgeDataUnified } from './badgeSystem';
export { loadBadgeDataUnified as loadBadgeData };
